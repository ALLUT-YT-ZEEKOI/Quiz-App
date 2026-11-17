import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Check,
  X
} from 'lucide-react';

export const StudentExamResult = ({ attempt, onBack }) => {
  const [filterMode, setFilterMode] = useState('All'); // 'All', 'Correct', 'Incorrect', 'Unanswered'
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!attempt) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-500">No examination attempt record available.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-[#087F8C] text-white text-xs font-bold"
        >
          Return to Examinations
        </button>
      </div>
    );
  }

  const {
    examTitle,
    subjectName,
    score,
    totalMarks,
    percentage,
    passed,
    correctCount,
    incorrectCount,
    unattemptedCount,
    timeSpentMinutes,
    submittedAt,
    answers
  } = attempt;

  // Filter questions for review
  const filteredAnswers = useMemo(() => {
    return (answers || []).filter((a) => {
      if (filterMode === 'Correct') return a.isCorrect;
      if (filterMode === 'Incorrect') return !a.isCorrect && a.selectedOption !== null;
      if (filterMode === 'Unanswered') return a.selectedOption === null;
      return true;
    });
  }, [answers, filterMode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto px-2 sm:px-4 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Examinations</span>
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Submitted {new Date(submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Main Score Hero Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#07242B] via-[#0A333C] to-[#0D4450] text-white p-4 sm:p-6 lg:p-8 border border-[#145663]/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                passed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {passed ? '🎉 EXAMINATION PASSED' : '❌ DID NOT MEET BENCHMARK'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {examTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {subjectName} • Time Spent: {timeSpentMinutes} mins • Total Marks: {totalMarks}
            </p>
          </div>

          {/* Circular Score Gauge */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-700/50"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * percentage) / 100}
                  className={`${passed ? 'text-[#14B8A6]' : 'text-red-400'} transition-all duration-1000`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold font-mono text-white leading-none">
                  {percentage}%
                </span>
                <span className="text-[10px] text-slate-300 font-bold mt-0.5">
                  {score}/{totalMarks} Marks
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Correct Answers</span>
          <div className="text-2xl font-extrabold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>{correctCount}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Full marks earned</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Incorrect Answers</span>
          <div className="text-2xl font-extrabold text-red-500 flex items-center gap-1.5">
            <XCircle className="w-5 h-5" />
            <span>{incorrectCount}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Negative deducted</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Unattempted</span>
          <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span>{unattemptedCount}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">No marks change</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Taken</span>
          <div className="text-2xl font-extrabold text-teal-600 flex items-center gap-1.5 font-mono">
            <Clock className="w-5 h-5" />
            <span>{timeSpentMinutes}m</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">60m allowed</span>
        </div>
      </div>

      {/* Question-by-Question Solution Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Question-by-Question Solutions & Explanations
            </h2>
            <p className="text-xs text-slate-400">
              Review your responses alongside IS 456 / IS 800 code explanations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
            {['All', 'Correct', 'Incorrect', 'Unanswered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterMode(f)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterMode === f
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List of Questions */}
        <div className="space-y-3">
          {filteredAnswers.map((item, idx) => {
            const isCorrect = item.isCorrect;
            const isUnattempted = item.selectedOption === null;
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isUnattempted
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {isCorrect ? '✓' : isUnattempted ? '—' : '✕'}
                    </span>

                    <span className="font-extrabold text-xs text-slate-400 font-mono">
                      Q{(item.questionIndex || idx) + 1}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                          : isUnattempted
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40'
                      }`}
                    >
                      {isCorrect ? 'Correct (+1.0)' : isUnattempted ? 'Unattempted (0.0)' : 'Incorrect (-0.25)'}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400">
                    {item.difficulty || 'Medium'}
                  </span>
                </div>

                <p className="font-bold text-slate-900 dark:text-white text-sm leading-relaxed">
                  {item.questionText}
                </p>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {item.options?.map((opt, oIdx) => {
                    const isSelected = item.selectedOption === oIdx;
                    const isRight = oIdx === item.correctAnswer;

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isRight
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200 font-bold'
                            : isSelected
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-900 dark:text-red-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isRight && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold uppercase">
                            Correct Key
                          </span>
                        )}
                        {isSelected && !isRight && (
                          <span className="text-[10px] text-red-600 font-extrabold uppercase">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Technical Explanation */}
                {item.explanation && (
                  <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                    <span className="font-bold block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Technical Explanation:</span>
                    </span>
                    <p className="leading-relaxed">{item.explanation}</p>
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
