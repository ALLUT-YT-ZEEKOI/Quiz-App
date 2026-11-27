// Saved (bookmarked) questions: a student saves a question from a subject quiz, a mock test or a
// live exam to revise later. The admin sees who saved what.
//
// A saved item stores the question as the student saw it, never the answer: mock tests and live
// exams don't reveal answers before submitting. The correct answer (and the student's own answer)
// is looked up when the list is shown, once the source reveals it.
//
// Item: { id, studentId, studentName, rollNo, source: 'quiz' | 'mock' | 'exam', sourceId, sourceTitle,
//         subjectId, subjectName, questionId, questionText, options[], savedAt }

export const SAVED_SOURCES = {
  quiz: { label: 'Subject quiz', plural: 'Subject quizzes', short: 'Quiz' },
  mock: { label: 'Mock test', plural: 'Mock tests', short: 'Mock' },
  exam: { label: 'Live exam', plural: 'Live exams', short: 'Exam' }
};

const textOf = (q) => String(q?.questionText ?? q?.question ?? '').trim();

/** Short, stable hash of a question's text. */
const hashText = (text) => {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
};

/**
 * Stable key of one question within its source. Based on the text, because the same question
 * reaches the student with an id while taking a test but often without one in the answer review.
 */
export const questionKeyOf = (q) => {
  const text = textOf(q);
  return text ? `t${hashText(text)}` : String(q?.id || q?.questionId || 'q').slice(0, 80);
};

/** Id of a student's saved copy of a question (one per student per question). */
export const savedIdFor = (studentId, source, sourceId, q) =>
  `sq:${studentId}:${source}:${sourceId}:${questionKeyOf(q)}`.slice(0, 190);

/** Builds the item to store when a student saves a question. */
export const buildSavedQuestion = ({ student, source, sourceId, sourceTitle, subjectId, subjectName, question, questionIndex }) => ({
  id: savedIdFor(student.id, source, sourceId, question),
  studentId: student.id,
  studentName: student.name || '',
  rollNo: student.studentId || '',
  source,
  sourceId,
  sourceTitle: sourceTitle || '',
  subjectId: subjectId || '',
  subjectName: subjectName || '',
  // The question's own id when it has one (used to find its answer later)
  questionId: String(question?.id || question?.questionId || '').slice(0, 80),
  questionText: textOf(question),
  options: Array.isArray(question?.options) ? question.options.map(String) : [],
  // Position in the source (live exam answers are matched by position)
  questionIndex: Number.isInteger(questionIndex) ? questionIndex : null,
  savedAt: new Date().toISOString()
});

const sameQuestion = (sq) => (q) =>
  (sq.questionId && ((q?.id && String(q.id) === sq.questionId) || (q?.questionId && String(q.questionId) === sq.questionId))) ||
  (textOf(q) !== '' && textOf(q) === sq.questionText);

/**
 * The correct answer, explanation and (for one student) their latest answer for a saved question,
 * from whatever the viewer can see. Returns { correctAnswer, explanation, selectedOption, answered }.
 * correctAnswer is null while the source hasn't revealed it (e.g. a mock test not yet submitted).
 */
export const resolveSavedAnswer = (sq, data) => {
  const { curriculumSubjects = [], curriculumAttempts = [], mockTests = [], mockAttempts = [], examinations = [], examAttempts = [] } = data;
  let correctAnswer = null;
  let explanation = '';
  let attemptAnswers = [];

  const takeFrom = (q) => {
    if (!q) return;
    if (correctAnswer === null && typeof q.correctAnswer === 'number') correctAnswer = q.correctAnswer;
    if (!explanation && q.explanation) explanation = q.explanation;
  };

  const latest = (list) => [...list].sort((a, b) => String(b.submittedAt || b.date || '').localeCompare(String(a.submittedAt || a.date || '')))[0];

  if (sq.source === 'quiz') {
    const module = curriculumSubjects.flatMap((s) => s.modules || []).find((m) => m.id === sq.sourceId);
    takeFrom((module?.questions || []).find(sameQuestion(sq)));
    attemptAnswers = latest(curriculumAttempts.filter((a) => a.moduleId === sq.sourceId && a.studentId === sq.studentId))?.answers || [];
  } else if (sq.source === 'mock') {
    const test = mockTests.find((t) => t.id === sq.sourceId);
    takeFrom((test?.questions || []).find(sameQuestion(sq)));
    attemptAnswers = latest(mockAttempts.filter((a) => a.testId === sq.sourceId && a.studentId === sq.studentId))?.answers || [];
  } else if (sq.source === 'exam') {
    const exam = examinations.find((e) => e.id === sq.sourceId);
    takeFrom((exam?.questions || []).find(sameQuestion(sq)) || (sq.questionIndex !== null ? exam?.questions?.[sq.questionIndex] : null));
    attemptAnswers = latest(examAttempts.filter((a) => a.examId === sq.sourceId && a.studentId === sq.studentId))?.answers || [];
  }

  const mine =
    attemptAnswers.find(sameQuestion(sq)) ||
    (sq.source === 'exam' && sq.questionIndex !== null
      ? attemptAnswers.find((a, i) => (a.questionIndex ?? i) === sq.questionIndex)
      : undefined);
  takeFrom(mine);
  return {
    correctAnswer,
    explanation,
    selectedOption: mine ? mine.selectedOption ?? null : null,
    answered: Boolean(mine)
  };
};
