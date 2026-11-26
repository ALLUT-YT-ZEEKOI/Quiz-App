import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { computeRankings, examEntry, mockEntry, shapeForStudent } from '../services/rankings.js';

export const rankingsRouter = Router();
rankingsRouter.use(requireAuth);

// Answers are not needed for rankings (and are large)
const ATTEMPT_PROJECTION = { answers: 0 };

/**
 * Rankings for live exams and mock tests, overall and per test.
 * Students see every student's rank, name and percentage, and their own full result.
 * Admins see everything (correct / wrong / skipped / time for every student).
 */
rankingsRouter.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      const modules = await db.collection('app_settings').findOne({ _id: 'studentModules', _deleted: { $ne: true } });
      if (modules?.modules?.rankings === false) {
        return res.status(403).json({ error: 'Rankings are not available right now.' });
      }
    }

    const alive = { _deleted: { $ne: true } };
    const [exams, tests, examAttempts, mockAttempts] = await Promise.all([
      db.collection('examinations').find(alive, { projection: { id: 1, title: 1, subjectName: 1 } }).toArray(),
      db
        .collection('mock_tests')
        .find(isAdmin ? alive : { ...alive, enabled: true }, { projection: { id: 1, title: 1, day: 1 } })
        .toArray(),
      db.collection('exam_attempts').find(alive, { projection: ATTEMPT_PROJECTION }).toArray(),
      db.collection('mock_attempts').find(alive, { projection: ATTEMPT_PROJECTION }).toArray()
    ]);

    const assessments = [
      ...exams.map((e) => ({ key: `exam:${e._id}`, kind: 'exam', title: e.title || 'Examination', subtitle: e.subjectName || '' })),
      ...tests.map((t) => ({ key: `mock:${t._id}`, kind: 'mock', title: t.title || 'Mock Test', subtitle: t.day ? `Day ${t.day}` : '' }))
    ];
    const rankings = computeRankings(assessments, [...examAttempts.map(examEntry), ...mockAttempts.map(mockEntry)]);

    res.json({
      generatedAt: new Date().toISOString(),
      ...(isAdmin ? rankings : shapeForStudent(rankings, req.user.studentId))
    });
  } catch (err) {
    next(err);
  }
});
