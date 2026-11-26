// Shared helpers for the Mock Tests module.

/**
 * Scores a mock test attempt (used when running without the backend; the server has the same
 * logic in backend/src/services/scoring.js). `answers` maps questionId -> option index.
 */
export const scoreMockTest = (test, answers) => {
  const questions = test?.questions || [];
  const picked = answers && typeof answers === 'object' ? answers : {};
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const detailed = questions.map((q) => {
    const raw = picked[q.id];
    const selectedOption = Number.isInteger(raw) && raw >= 0 && raw < (q.options || []).length ? raw : null;
    const isCorrect = selectedOption !== null && selectedOption === q.correctAnswer;
    if (selectedOption === null) unattemptedCount++;
    else if (isCorrect) correctCount++;
    else incorrectCount++;
    return {
      questionId: q.id,
      questionText: q.questionText,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      selectedOption,
      isCorrect
    };
  });

  const totalMarks = questions.length;
  return {
    totalQuestions: questions.length,
    totalMarks,
    correctCount,
    incorrectCount,
    unattemptedCount,
    score: correctCount,
    percentage: totalMarks ? Math.round((correctCount / totalMarks) * 100) : 0,
    answers: detailed
  };
};

/**
 * Who can take a mock test.
 *   access: 'public'  -> every signed-in student (the default for older tests)
 *   access: 'private' -> only students in one of test.batchSubjectIds (a course they have an active
 *                        subscription to, or a free course)
 * `isInBatch(subjectId)` says whether the student is in that batch.
 * Same rule as canStudentSeeMockTest in backend/src/sync/collections.js.
 */
export const isPrivateMockTest = (test) => test?.access === 'private';

export const canStudentSeeMockTest = (test, isInBatch) => {
  if (test?.enabled !== true) return false;
  if (!isPrivateMockTest(test)) return true;
  return (test.batchSubjectIds || []).some((id) => isInBatch(id));
};

/** "1 hr 30 min", "45 min" */
export const formatDuration = (minutes) => {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (!h) return `${rest} min`;
  return rest ? `${h} hr ${rest} min` : `${h} hr`;
};

/** "1:05:09" or "05:09" */
export const formatClock = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

/** Groups tests into [{ day, tests }] sorted by day, then by title. */
export const groupByDay = (tests) => {
  const map = new Map();
  (tests || []).forEach((t) => {
    const day = Number(t.day) || 1;
    if (!map.has(day)) map.set(day, []);
    map.get(day).push(t);
  });
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, list]) => ({
      day,
      tests: list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    }));
};

// The student's in-progress test is kept on this device so a reload resumes it.
const sessionKey = (testId, studentId) => `cohesion_mock_session_${testId}_${studentId}`;
const answersKey = (testId, studentId) => `cohesion_mock_answers_${testId}_${studentId}`;

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

/** { startedAt, deadline, durationMinutes } of a test in progress on this device, or null. */
export const getLocalSession = (testId, studentId) => readJson(sessionKey(testId, studentId));
export const saveLocalSession = (testId, studentId, session) => writeJson(sessionKey(testId, studentId), session);

export const getSavedAnswers = (testId, studentId) => readJson(answersKey(testId, studentId)) || {};
export const saveAnswers = (testId, studentId, answers) => writeJson(answersKey(testId, studentId), answers);

export const clearLocalProgress = (testId, studentId) => {
  try {
    localStorage.removeItem(sessionKey(testId, studentId));
    localStorage.removeItem(answersKey(testId, studentId));
  } catch {}
};
