// Server-side scoring: students' scores are always recalculated from the stored
// questions, so a modified browser can't submit a fake score.

/** Scores a live exam attempt. `answers` is an array of selected option indexes (or null). */
export const scoreExam = (exam, answers) => {
  const questions = exam.questions || [];
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const detailed = questions.map((q, idx) => {
    const raw = answers?.[idx];
    const selectedOption = Number.isInteger(raw) && raw >= 0 && raw < (q.options || []).length ? raw : null;
    const isCorrect = selectedOption !== null && selectedOption === q.correctAnswer;
    if (selectedOption === null) unattemptedCount++;
    else if (isCorrect) correctCount++;
    else incorrectCount++;
    return {
      questionIndex: idx,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      selectedOption,
      isCorrect
    };
  });

  const totalQuestions = questions.length || 30;
  const totalMarks = exam.totalMarks || 30;
  const negPerWrong = exam.negativeMarking ? exam.negativeMarkValue || 0.25 : 0;
  const finalScore = Math.max(0, Math.round((correctCount - incorrectCount * negPerWrong) * 10) / 10);

  return {
    totalQuestions,
    totalMarks,
    correctCount,
    incorrectCount,
    unattemptedCount,
    score: finalScore,
    percentage: Math.round((finalScore / totalMarks) * 100),
    passed: finalScore >= (exam.passingMarks || 15),
    answers: detailed
  };
};

/** Re-scores a module practice quiz attempt from the module's questions (matched by questionId). */
export const scoreModuleQuiz = (subject, attempt) => {
  const module = (subject?.modules || []).find((m) => m.id === attempt.moduleId);
  if (!module) return null;
  const byId = new Map((module.questions || []).map((q) => [q.id, q]));
  const answers = (attempt.answers || [])
    .map((a) => {
      const q = byId.get(a.questionId);
      if (!q) return null;
      const selectedOption = Number.isInteger(a.selectedOption) ? a.selectedOption : null;
      return {
        questionId: q.id,
        questionText: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        selectedOption,
        isCorrect: selectedOption !== null && selectedOption === q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || ''
      };
    })
    .filter(Boolean);
  if (answers.length === 0) return null;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const scorePct = Math.round((correctCount / answers.length) * 100);
  return {
    answers,
    totalQuestions: answers.length,
    correctCount,
    scorePct,
    status: scorePct >= 60 ? 'Passed' : 'Needs Practice'
  };
};

/**
 * Scores a mock test attempt. `answers` maps questionId -> selected option index.
 * Each question is worth 1 mark. Kept in step with src/utils/mockTests.js in the frontend.
 */
export const scoreMockTest = (test, answers) => {
  const questions = test.questions || [];
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
