import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Printer,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuizResultScreen = () => {
  const { lastQuizResult, quizzes, questions, setActiveView, setActiveQuizForAttempt } = useApp();

  useEffect(() => {
    // Fire celebratory confetti if student passed
    if (lastQuizResult?.status === 'PASSED') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [lastQuizResult]);

  if (!lastQuizResult) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>No assessment result available to display.</p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const {
    quizId,
    quizTitle,
    subjectId,
    studentName,
    rollNumber,
    score,
    totalMarks,
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    percentage,
    status,
    timeSpentSeconds,
    answers = {}
  } = lastQuizResult;

  const targetQuiz = quizzes.find((q) => q.id === quizId);
  const quizQIds = targetQuiz ? targetQuiz.questionIds : Object.keys(answers);

  const handleRetake = () => {
    if (targetQuiz) {
      setActiveQuizForAttempt(targetQuiz);
      setActiveView('quiz-attempt');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isPassed = status === 'PASSED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* Top Banner / Celebration Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-premium relative overflow-hidden text-white ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-900 via-navy-900 to-navy-950 border-emerald-500/30'
            : 'bg-gradient-to-br from-rose-950 via-navy-900 to-navy-950 border-red-500/30'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
              {isPassed ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-emerald-300">Examination Cleared Successfully</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300">Passing Threshold Not Reached</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{quizTitle}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Official institutional assessment evaluated as per university grading criteria.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-xs text-slate-300 font-mono">
              <span>Candidate: <strong>{studentName}</strong></span>
              <span>•</span>
              <span>ID: <strong>{rollNumber}</strong></span>
              <span>•</span>
              <span>Time: <strong>{Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s</strong></span>
            </div>
          </div>

          {/* Big Radial Score Indicator */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/20 p-2 shadow-xl">
            <span className="text-3xl font-extrabold font-mono tracking-tight">{percentage}%</span>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                isPassed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {status}
            </span>
            <span className="text-[10px] text-slate-300 mt-1 font-mono">
              {score} / {totalMarks} Marks
            </span>
          </div>
        </div>
      </div>

      {/* 4 Score Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">Total Questions</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
            {totalQuestions}
          </span>
          <span className="text-[10px] text-slate-500">100% Attempted</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">Correct Answers</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
            {correctCount}
          </span>
          <span className="text-[10px] text-emerald-600">Points Awarded</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">Incorrect Answers</span>
          <span className="text-2xl font-extrabold text-red-500 dark:text-red-400 font-mono mt-0.5 block">
            {incorrectCount}
          </span>
          <span className="text-[10px] text-red-500">Zero Points</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">Accuracy Rate</span>
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
            {percentage}%
          </span>
          <span className="text-[10px] text-slate-500">Cutoff: 60%</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={handleRetake}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-blue-500" />
            <span>Retake Assessment</span>
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print / Save Result Sheet</span>
        </button>
      </div>

      {/* Question-by-Question Deep Technical Review */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Comprehensive Question-by-Question Analysis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare your chosen responses against official answer keys and technical IS-code rationale.
          </p>
        </div>

        <div className="space-y-4">
          {quizQIds.map((qId, index) => {
            const qObj = questions.find((q) => q.id === qId);
            if (!qObj) return null;

            const studentSelected = answers[qId];
            const isCorrect = studentSelected === qObj.correctAnswer;
            const isUnanswered = studentSelected === undefined || studentSelected === null;

            return (
              <div
                key={qId}
                className={`p-5 rounded-3xl border bg-white dark:bg-surface-darkCard shadow-subtle ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-800/60'
                    : 'border-red-200 dark:border-red-800/60'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      Question {index + 1} of {totalQuestions}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      {qObj.marks || 1} {qObj.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Correct (+{qObj.marks || 1})</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>{isUnanswered ? 'Unanswered (0)' : 'Incorrect (0)'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question Statement */}
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                  {qObj.questionText}
                </p>

                {/* 4 Options Grid */}
                <div className="space-y-2 text-xs">
                  {qObj.options.map((optText, optIdx) => {
                    const wasChosenByStudent = studentSelected === optIdx;
                    const isTheActualKey = optIdx === qObj.correctAnswer;

                    let optionBorder = 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                    if (isTheActualKey) {
                      optionBorder =
                        'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                    } else if (wasChosenByStudent && !isTheActualKey) {
                      optionBorder =
                        'border-red-500 bg-red-50/80 dark:bg-red-950/60 text-red-900 dark:text-red-200 font-bold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${optionBorder}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isTheActualKey
                                ? 'bg-emerald-600 text-white'
                                : wasChosenByStudent
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{optText}</span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          {wasChosenByStudent && (
                            <span
                              className={`px-2 py-0.5 rounded font-bold font-sans ${
                                isTheActualKey
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              Your Choice
                            </span>
                          )}
                          {isTheActualKey && !wasChosenByStudent && (
                            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold font-sans">
                              Correct Key
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Technical Explanation */}
                {qObj.explanation && (
                  <div className="mt-4 p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-blue-700 dark:text-blue-400 mr-1.5 font-bold">
                      Civil Engineering Explanation:
                    </strong>
                    {qObj.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

