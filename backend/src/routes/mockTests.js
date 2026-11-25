import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { scoreMockTest } from '../services/scoring.js';

export const mockTestsRouter = Router();
mockTestsRouter.use(requireAuth);

const studentOnly = (req, res, next) =>
  req.user.role === 'student' ? next() : res.status(403).json({ error: 'Only students take mock tests.' });

const findTest = (id) => getDb().collection('mock_tests').findOne({ _id: id, _deleted: { $ne: true } });

// One open session per test + student. It holds the server's start time, so reloading the
// page or switching devices never resets the timer.
const sessionKey = (testId, studentId) => `${testId}:${studentId}`;

const sessionInfo = (session) => ({
  startedAt: session.startedAt.toISOString(),
  deadline: new Date(session.startedAt.getTime() + session.durationMinutes * 60000).toISOString(),
  durationMinutes: session.durationMinutes,
  serverTime: new Date().toISOString()
});

/**
 * Starts (or resumes) a mock test. A new start needs the test to be enabled, to have questions,
 * and either no earlier attempt or retests allowed by the admin.
 */
mockTestsRouter.post('/:testId/start', studentOnly, async (req, res, next) => {
  try {
    const db = getDb();
    const studentId = req.user.studentId;
    const test = await findTest(req.params.testId);
    if (!test) return res.status(404).json({ error: 'Mock test not found.' });

    const sessions = db.collection('mock_sessions');
    const key = sessionKey(test.id, studentId);
    const open = await sessions.findOne({ _id: key });
    if (open) return res.json(sessionInfo(open));

    if (test.enabled !== true) return res.status(403).json({ error: 'This mock test is not available.' });
    if (!(test.questions || []).length) return res.status(403).json({ error: 'This mock test has no questions yet.' });
    const previous = await db.collection('mock_attempts').countDocuments({ studentId, testId: test.id, _deleted: { $ne: true } });
    if (previous > 0 && !test.allowRetest) {
      return res.status(403).json({ error: 'You have already taken this mock test. Retests are not allowed for it.' });
    }

    const durationMinutes = Math.max(1, Math.min(600, Number(test.durationMinutes) || 60));
    // $setOnInsert keeps the first start if two requests race
    await sessions.updateOne(
      { _id: key },
      { $setOnInsert: { testId: test.id, studentId, startedAt: new Date(), durationMinutes } },
      { upsert: true }
    );
    res.status(201).json(sessionInfo(await sessions.findOne({ _id: key })));
  } catch (err) {
    next(err);
  }
});

/**
 * Submits a started mock test. Body: { answers: { [questionId]: optionIndex }, autoSubmitted }.
 * The server scores it and closes the session. Answers are kept on the device while taking the
 * test, so a submission that arrives after the deadline (closed tab, lost connection) is still
 * accepted; the time spent is capped at the test duration.
 */
mockTestsRouter.post('/:testId/submit', studentOnly, async (req, res, next) => {
  try {
    const db = getDb();
    const studentId = req.user.studentId;
    const test = await findTest(req.params.testId);
    if (!test) return res.status(404).json({ error: 'Mock test not found.' });

    // Taking the session out first makes a double submit impossible
    const session = await db.collection('mock_sessions').findOneAndDelete({ _id: sessionKey(test.id, studentId) });
    if (!session) return res.status(409).json({ error: 'This mock test was already submitted, or was never started.' });

    const now = new Date();
    const [student, previous] = await Promise.all([
      db.collection('students').findOne({ _id: studentId }),
      db.collection('mock_attempts').countDocuments({ studentId, testId: test.id, _deleted: { $ne: true } })
    ]);
    const elapsed = Math.round((now.getTime() - session.startedAt.getTime()) / 1000);
    const attempt = {
      id: `MOCKATT-${test.id}-${studentId}-${now.getTime().toString(36)}`,
      testId: test.id,
      testTitle: test.title,
      day: test.day,
      studentId,
      studentName: student?.name || 'Student',
      studentRollNo: student?.studentId || '',
      batch: student?.batch || '',
      ...scoreMockTest(test, req.body?.answers),
      attemptNumber: previous + 1,
      durationMinutes: session.durationMinutes,
      timeSpentSeconds: Math.max(1, Math.min(session.durationMinutes * 60, elapsed)),
      autoSubmitted: req.body?.autoSubmitted === true,
      startedAt: session.startedAt.toISOString(),
      submittedAt: now.toISOString()
    };
    await db.collection('mock_attempts').insertOne({ _id: attempt.id, ...attempt, _updatedAt: now });
    res.status(201).json({ attempt });
  } catch (err) {
    next(err);
  }
});
