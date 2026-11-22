import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { scoreExam } from '../services/scoring.js';
import { toItem } from '../sync/collections.js';

export const examsRouter = Router();
examsRouter.use(requireAuth);

/**
 * Student submits a live exam. The server checks they may take it (first attempt while
 * the exam is live, or an admin-granted retest), scores it, and consumes the retest.
 * Body: { answers: [optionIndex | null, ...], timeSpentMinutes }
 */
examsRouter.post('/:examId/submit', async (req, res, next) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students submit exams.' });
    const db = getDb();
    const studentId = req.user.studentId;
    const exam = await db.collection('examinations').findOne({ _id: req.params.examId, _deleted: { $ne: true } });
    if (!exam) return res.status(404).json({ error: 'Examination not found.' });

    const previous = await db.collection('exam_attempts').countDocuments({ studentId, examId: exam.id, _deleted: { $ne: true } });
    const grant = await db.collection('retests').findOne({ studentId, examId: exam.id, status: 'granted', _deleted: { $ne: true } });
    if (previous > 0 && !grant) {
      return res.status(403).json({ error: 'You have already attempted this exam. Ask the admin for a retest.' });
    }
    if (!grant && exam.status !== 'Live Now') {
      return res.status(403).json({ error: 'This exam is not open right now.' });
    }

    const student = (await db.collection('students').findOne({ _id: studentId })) || {};
    const scored = scoreExam(exam, Array.isArray(req.body?.answers) ? req.body.answers : []);
    const now = new Date();
    const attempt = {
      id: `ATT-${exam.id}-${studentId}-${Date.now().toString().slice(-6)}`,
      examId: exam.id,
      examTitle: exam.title,
      subjectId: exam.subjectId,
      subjectName: exam.subjectName,
      studentId,
      studentName: student.name || 'Student',
      studentRollNo: student.studentId || '',
      batch: student.batch || '',
      semester: student.semester || '',
      avatar: student.avatar || '',
      ...scored,
      timeSpentMinutes: Math.max(1, Math.min(600, Number(req.body?.timeSpentMinutes) || 1)),
      submittedAt: now.toISOString(),
      isRetest: !!grant
    };
    await db.collection('exam_attempts').insertOne({ _id: attempt.id, ...attempt, _updatedAt: now });

    let retest = null;
    if (grant) {
      await db.collection('retests').updateOne(
        { _id: grant._id },
        { $set: { status: 'used', usedAt: now.toISOString(), attemptId: attempt.id, _updatedAt: now } }
      );
      retest = toItem(await db.collection('retests').findOne({ _id: grant._id }));
    }
    res.status(201).json({ attempt, retest });
  } catch (err) {
    next(err);
  }
});
