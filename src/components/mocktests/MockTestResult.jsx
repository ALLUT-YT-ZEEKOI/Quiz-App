import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, Clock, RotateCcw, Trophy } from 'lucide-react';
import { formatClock } from '../../utils/mockTests';
import { primaryBtn, secondaryBtn } from './MockTestUi';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Score summary and question-by-question review of one attempt. */
export const MockTestResult = ({
  attempt,
  onBack,
  backLabel = 'Back to Mock Tests',
  onRetake,
  showStudent = false,
  attempts = [], // every attempt of this test by the same student, to switch between them
  onSelectAttempt
}) => {
  const [filter, setFilter] = useState('all'); // all | correct | wrong | skipped
  const answers = attempt.answers || [];
  const shown = answers.filter((a) => {
    if (filter === 'correct') return a.isCorrect;
    if (filter === 'wrong') return a.selectedOption !== null && !a.isCorrect;
    if (filter === 'skipped') return a.selectedOption === null;
    return true;
  });
  const pct = attempt.percentage ?? 0;
  const tone = pct >= 75 ? 'text-emerald-500' : pct >= 40 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-24 sm:pb-12">
      <button type="button" onClick={onBack} className={secondaryBtn}>
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </button>

      <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.2" className="stroke-slate-200 dark:stroke-slate-700" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray={`${pct} 100`}
                  className={`${tone} stroke-current`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{pct}%</span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#087F8C] dark:text-teal-300">
                Day {attempt.day} · Attempt {attempt.attemptNumber || 1}
              </span>
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug break-words">{attempt.testTitle}</h1>
              {showStudent && (
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {attempt.studentName}{attempt.studentRollNo ? ` · ${attempt.studentRollNo}` : ''}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Submitted {new Date(attempt.submittedAt).toLocaleString()}
                {attempt.autoSubmitted && ' · auto-submitted when time ran out'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <Trophy className="w-6 h-6 text-amber-500" />
              {attempt.score}<span className="text-base text-slate-400">/{attempt.totalMarks}</span>
            </div>
            {onRetake && (
              <button type="button" onClick={onRetake} className={primaryBtn}>
                <RotateCcw className="w-4 h-4" /> Retake Test
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {[
            { icon: CheckCircle2, label: 'Correct', value: attempt.correctCount, cls: 'text-emerald-600 dark:text-emerald-400' },
            { icon: XCircle, label: 'Wrong', value: attempt.incorrectCount, cls: 'text-rose-600 dark:text-rose-400' },
            { icon: MinusCircle, label: 'Not answered', value: attempt.unattemptedCount, cls: 'text-slate-500' },
            { icon: Clock, label: 'Time taken', value: formatClock(attempt.timeSpentSeconds || 0), cls: 'text-[#087F8C] dark:text-teal-300' }
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <s.icon className={`w-4 h-4 ${s.cls}`} />
              <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{s.value}</div>
              <div className="text-[11px] font-semibold text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {attempts.length > 1 && onSelectAttempt && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Attempts:</span>
          {attempts.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setFilter('all');
                onSelectAttempt(a);
              }}
              aria-pressed={a.id === attempt.id}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border transition-colors ${
                a.id === attempt.id
                  ? 'bg-[#087F8C] border-[#087F8C] text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#087F8C]/50'
              }`}
            >
              Attempt {a.attemptNumber || i + 1} · {a.percentage ?? 0}%
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white">Answer Review</h2>
        <div className="flex gap-1 p-1 rounded-xl bg-[#E8F3F4] dark:bg-slate-800/80 text-[11px] sm:text-xs font-bold">
          {[
            ['all', `All (${answers.length})`],
            ['correct', `Correct (${attempt.correctCount})`],
            ['wrong', `Wrong (${attempt.incorrectCount})`],
            ['skipped', `Skipped (${attempt.unattemptedCount})`]
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                filter === id ? 'bg-white dark:bg-slate-900 text-[#087F8C] dark:text-teal-300 shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ol className="space-y-3">
        {shown.map((a) => {
          const num = answers.indexOf(a) + 1;
          return (
            <li key={a.questionId || num} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  <span className="text-[#087F8C] dark:text-teal-300 mr-1.5">Q{num}.</span>
                  {a.questionText}
                </p>
                {a.selectedOption === null ? (
                  <span className="shrink-0 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">Skipped</span>
                ) : a.isCorrect ? (
                  <span className="shrink-0 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">Correct</span>
                ) : (
                  <span className="shrink-0 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">Wrong</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {(a.options || []).map((opt, i) => {
                  const isAnswer = i === a.correctAnswer;
                  const isPicked = i === a.selectedOption;
                  const cls = isAnswer
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold'
                    : isPicked
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300';
                  return (
                    <div key={i} className={`px-3 py-2 rounded-xl text-xs sm:text-sm border ${cls}`}>
                      <strong className="mr-1.5">{LETTERS[i]}.</strong>
                      {opt}
                      {isAnswer && (
                        <span className="ml-1.5 text-[10px] font-extrabold uppercase">
                          · Correct answer{isPicked ? ` (${showStudent ? 'their' : 'your'} answer)` : ''}
                        </span>
                      )}
                      {isPicked && !isAnswer && <span className="ml-1.5 text-[10px] font-extrabold uppercase">· {showStudent ? 'Their' : 'Your'} answer</span>}
                    </div>
                  );
                })}
              </div>
              {a.explanation && (
                <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 p-2.5 rounded-xl bg-[#E8F3F4]/60 dark:bg-slate-800/60">
                  <strong>Explanation:</strong> {a.explanation}
                </p>
              )}
            </li>
          );
        })}
        {!shown.length && <p className="text-xs text-slate-500 text-center py-6">No questions in this group.</p>}
      </ol>
    </div>
  );
};
