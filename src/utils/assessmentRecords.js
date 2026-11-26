// Assessment records: one shape for every graded attempt in the app
//
// The app has three kinds of graded attempts:
//   - Live Examination attempts (examAttempts)      -> kind: 'exam'
//   - Module practice quiz attempts (curriculumAttempts) -> kind: 'quiz'
//   - Mock test attempts (mockAttempts)              -> kind: 'mock'
// Every record also carries timing: startedAt / submittedAt (ISO, when known) and timeSpentSeconds.
// They store data differently; these helpers turn both into a common "record" so
// the review dashboards, subject marks and question analysis can treat them alike.

import { parseDate } from './subscriptionUtils';

const toTime = (value) => parseDate(value)?.getTime() || 0;

/** "45s", "12m 05s", "1h 04m" for a number of seconds; '' when unknown. */
export const formatDuration = (seconds) => {
  const n = Math.round(Number(seconds));
  if (!Number.isFinite(n) || n <= 0) return '';
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const sec = n % 60;
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m) return `${m}m ${String(sec).padStart(2, '0')}s`;
  return `${sec}s`;
};

/** Date and time of day, e.g. "26 Nov 2026, 2:45 pm"; '' when unknown. */
export const formatDateTime = (value) => {
  const d = parseDate(value);
  return d
    ? d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';
};

/**
 * Fills each answer of an exam attempt with its question details. Older/seeded
 * attempts only stored questionIndex + isCorrect; the question text, options and
 * correct answer are looked up from the exam itself.
 */
const normalizeExamAnswers = (attempt, exam) =>
  (attempt.answers || []).map((a, i) => {
    const qIdx = a.questionIndex ?? i;
    const q = exam?.questions?.[qIdx] || {};
    const options = a.options || q.options || [];
    const correctAnswer = a.correctAnswer ?? q.correctAnswer;
    let selectedOption = a.selectedOption ?? null;

    // Legacy mock answers carry no correctAnswer and arbitrary option indexes:
    // keep them consistent with their recorded right/wrong flag.
    if (a.correctAnswer === undefined && typeof correctAnswer === 'number' && selectedOption !== null) {
      if (a.isCorrect) selectedOption = correctAnswer;
      else if (selectedOption === correctAnswer) selectedOption = (correctAnswer + 1) % Math.max(options.length, 2);
    }

    return {
      questionIndex: qIdx,
      questionText: a.questionText || q.questionText || '',
      options,
      correctAnswer,
      selectedOption,
      isCorrect: selectedOption !== null && selectedOption === correctAnswer,
      explanation: a.explanation || q.explanation || '',
      difficulty: a.difficulty || q.difficulty || ''
    };
  });

export const normalizeExamAttempt = (attempt, exam) => {
  const answers = normalizeExamAnswers(attempt, exam);
  const hasDetails = answers.some((a) => a.questionText && a.options.length > 0);
  return {
    id: attempt.id,
    kind: 'exam',
    assessmentKey: `exam:${attempt.examId}`,
    examId: attempt.examId,
    studentId: attempt.studentId,
    studentName: attempt.studentName,
    avatar: attempt.avatar || attempt.studentAvatar || '',
    title: attempt.examTitle || exam?.title || 'Examination',
    subjectId: attempt.subjectId || exam?.subjectId || '',
    subjectName: attempt.subjectName || exam?.subjectName || 'General',
    date: attempt.submittedAt,
    time: toTime(attempt.submittedAt),
    score: attempt.score,
    maxScore: attempt.totalMarks,
    pct: Number(attempt.percentage) || 0,
    passed: !!attempt.passed,
    total: attempt.totalQuestions || answers.length,
    correct: attempt.correctCount ?? answers.filter((a) => a.isCorrect).length,
    wrong: attempt.incorrectCount ?? answers.filter((a) => !a.isCorrect && a.selectedOption !== null).length,
    skipped: attempt.unattemptedCount ?? answers.filter((a) => a.selectedOption === null).length,
    isRetest: !!attempt.isRetest,
    startedAt: attempt.startedAt || null,
    submittedAt: attempt.submittedAt || null,
    timeSpentSeconds:
      Number(attempt.timeSpentSeconds) || (Number(attempt.timeSpentMinutes) ? Number(attempt.timeSpentMinutes) * 60 : null),
    answers,
    hasDetails
  };
};

export const normalizeQuizAttempt = (attempt) => {
  const answers = (attempt.answers || []).map((a, i) => ({
    questionIndex: i,
    questionText: a.questionText || '',
    options: a.options || [],
    correctAnswer: a.correctAnswer,
    selectedOption: a.selectedOption ?? null,
    isCorrect: a.selectedOption !== null && a.selectedOption !== undefined && a.selectedOption === a.correctAnswer,
    explanation: a.explanation || '',
    difficulty: a.difficulty || ''
  }));
  const total = attempt.totalQuestions || answers.length;
  const correct = attempt.correctCount ?? answers.filter((a) => a.isCorrect).length;
  const skipped = answers.length ? answers.filter((a) => a.selectedOption === null).length : 0;
  const mode = attempt.difficultyMode && attempt.difficultyMode !== 'All Questions' ? ` (${attempt.difficultyMode})` : '';

  return {
    id: attempt.id,
    kind: 'quiz',
    assessmentKey: `quiz:${attempt.moduleId}:${attempt.difficultyMode || 'All'}`,
    moduleId: attempt.moduleId,
    studentId: attempt.studentId,
    studentName: attempt.studentName,
    avatar: attempt.studentAvatar || '',
    title: `${attempt.moduleTitle || 'Module Quiz'}${mode}`,
    subjectId: attempt.subjectId || '',
    subjectName: attempt.subjectName || 'General',
    // Quiz dates are stored as UTC "YYYY-MM-DD HH:mm" (from toISOString): read them as UTC
    date: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(attempt.date || '')
      ? `${attempt.date.replace(' ', 'T')}:00Z`
      : attempt.date,
    time: toTime(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(attempt.date || '') ? `${attempt.date.replace(' ', 'T')}:00Z` : attempt.date
    ),
    score: correct,
    maxScore: total,
    pct: Number(attempt.scorePct) || (total ? Math.round((correct / total) * 100) : 0),
    passed: attempt.status === 'Passed' || Number(attempt.scorePct) >= 60,
    total,
    correct,
    wrong: Math.max(0, total - correct - skipped),
    skipped,
    isRetest: false,
    startedAt: attempt.startedAt || null,
    submittedAt: attempt.submittedAt || null,
    // Older quiz attempts did not record their real duration
    timeSpentSeconds: Number(attempt.timeSpentSeconds) || null,
    answers,
    hasDetails: answers.length > 0
  };
};

export const normalizeMockAttempt = (attempt, test) => {
  const answers = (attempt.answers || []).map((a, i) => ({
    questionIndex: i,
    questionText: a.questionText || '',
    options: a.options || [],
    correctAnswer: a.correctAnswer,
    selectedOption: a.selectedOption ?? null,
    isCorrect: a.selectedOption !== null && a.selectedOption !== undefined && a.selectedOption === a.correctAnswer,
    explanation: a.explanation || '',
    difficulty: a.difficulty || ''
  }));
  const day = attempt.day ?? test?.day;
  return {
    id: attempt.id,
    kind: 'mock',
    assessmentKey: `mock:${attempt.testId}`,
    testId: attempt.testId,
    studentId: attempt.studentId,
    studentName: attempt.studentName,
    avatar: attempt.avatar || '',
    title: `${attempt.testTitle || test?.title || 'Mock Test'}${day ? ` (Day ${day})` : ''}`,
    subjectId: '',
    subjectName: 'Mock Tests',
    date: attempt.submittedAt,
    time: toTime(attempt.submittedAt),
    score: attempt.score,
    maxScore: attempt.totalMarks,
    pct: Number(attempt.percentage) || 0,
    passed: Number(attempt.percentage) >= 60,
    total: attempt.totalQuestions || answers.length,
    correct: attempt.correctCount ?? answers.filter((a) => a.isCorrect).length,
    wrong: attempt.incorrectCount ?? answers.filter((a) => !a.isCorrect && a.selectedOption !== null).length,
    skipped: attempt.unattemptedCount ?? answers.filter((a) => a.selectedOption === null).length,
    isRetest: Number(attempt.attemptNumber) > 1,
    startedAt: attempt.startedAt || null,
    submittedAt: attempt.submittedAt || null,
    timeSpentSeconds: Number(attempt.timeSpentSeconds) || null,
    answers,
    hasDetails: answers.some((a) => a.questionText && a.options.length > 0)
  };
};

/** All graded attempts as records, newest first. */
export const buildAssessmentRecords = ({
  examAttempts = [],
  examinations = [],
  curriculumAttempts = [],
  mockAttempts = [],
  mockTests = []
}) => {
  const examsById = new Map(examinations.map((e) => [e.id, e]));
  const testsById = new Map(mockTests.map((t) => [t.id, t]));
  return [
    ...examAttempts.map((a) => normalizeExamAttempt(a, examsById.get(a.examId))),
    ...curriculumAttempts.map(normalizeQuizAttempt),
    ...mockAttempts.map((a) => normalizeMockAttempt(a, testsById.get(a.testId)))
  ].sort((a, b) => b.time - a.time);
};

/** Keeps only each student's most recent attempt of each assessment (a retest replaces the earlier mark). */
export const latestPerAssessment = (records) => {
  const seen = new Map();
  records.forEach((r) => {
    const key = `${r.studentId}|${r.assessmentKey}`;
    const prev = seen.get(key);
    if (!prev || r.time > prev.time) seen.set(key, r);
  });
  return [...seen.values()];
};

const avg = (nums) => (nums.length ? Math.round(nums.reduce((s, n) => s + n, 0) / nums.length) : null);

/**
 * Subject-wise marks for one student's records: the average of their latest
 * result in every exam and module quiz of each subject.
 */
export const computeSubjectMarks = (records) => {
  const bySubject = new Map();
  // Mock tests are not tied to a subject
  latestPerAssessment(records.filter((r) => r.kind !== 'mock')).forEach((r) => {
    const key = r.subjectName;
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key).push(r);
  });
  return [...bySubject.entries()]
    .map(([subjectName, list]) => ({
      subjectName,
      subjectId: list[0].subjectId,
      avgPct: avg(list.map((r) => r.pct)),
      bestPct: Math.max(...list.map((r) => r.pct)),
      examAvg: avg(list.filter((r) => r.kind === 'exam').map((r) => r.pct)),
      quizAvg: avg(list.filter((r) => r.kind === 'quiz').map((r) => r.pct)),
      examCount: list.filter((r) => r.kind === 'exam').length,
      quizCount: list.filter((r) => r.kind === 'quiz').length,
      lastTime: Math.max(...list.map((r) => r.time))
    }))
    .sort((a, b) => b.avgPct - a.avgPct);
};

/**
 * Question-by-question results for one assessment across students (latest attempt each):
 * how many got it right/wrong/skipped, which option each picked, and who got it wrong.
 */
export const computeQuestionAnalysis = (records) => {
  const latest = latestPerAssessment(records).filter((r) => r.hasDetails);
  const questions = [];
  latest.forEach((r) => {
    r.answers.forEach((a, i) => {
      if (!questions[i]) {
        questions[i] = {
          index: i,
          questionText: a.questionText,
          options: a.options,
          correctAnswer: a.correctAnswer,
          explanation: a.explanation,
          correct: 0,
          wrong: 0,
          skipped: 0,
          optionCounts: a.options.map(() => 0),
          wrongStudents: [],
          skippedStudents: []
        };
      }
      const q = questions[i];
      if (a.selectedOption === null) {
        q.skipped++;
        q.skippedStudents.push({ id: r.studentId, name: r.studentName });
      } else {
        if (q.optionCounts[a.selectedOption] !== undefined) q.optionCounts[a.selectedOption]++;
        if (a.isCorrect) q.correct++;
        else {
          q.wrong++;
          q.wrongStudents.push({ id: r.studentId, name: r.studentName, selectedOption: a.selectedOption });
        }
      }
    });
  });
  return questions.filter(Boolean).map((q) => {
    const answered = q.correct + q.wrong + q.skipped;
    return { ...q, answered, correctPct: answered ? Math.round((q.correct / answered) * 100) : 0 };
  });
};

export const optionLetter = (i) => String.fromCharCode(65 + i);
