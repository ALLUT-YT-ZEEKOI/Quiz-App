import React, { useMemo, useState } from 'react';
import { Check, X, Minus, Lightbulb, MessageCircleQuestion, CheckCircle2 } from 'lucide-react';
import { optionLetter } from '../../utils/assessmentRecords';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'correct', label: 'Correct' },
  { id: 'wrong', label: 'Wrong' },
  { id: 'skipped', label: 'Skipped' }
];

const statusOf = (a) => (a.selectedOption === null ? 'skipped' : a.isCorrect ? 'correct' : 'wrong');

/**
 * Question-by-question review of one attempt: the student's choice next to the
 * correct answer, with explanations.
 * perspective: 'student' ("Your answer") | 'admin' ("Student's answer")
 * onAskDoubt(answer): optional, shows an "Ask doubt" button per question
 * doubtedIndexes: Set of question indexes the student already asked about
 */
export const QuestionReviewList = ({ answers = [], perspective = 'student', onAskDoubt, doubtedIndexes }) => {
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => {
    const c = { all: answers.length, correct: 0, wrong: 0, skipped: 0 };
    answers.forEach((a) => c[statusOf(a)]++);
    return c;
  }, [answers]);

  const visible = filter === 'all' ? answers : answers.filter((a) => statusOf(a) === filter);
  const yourLabel = perspective === 'admin' ? "Student's answer" : 'Your answer';

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-[11px] sm:text-xs font-bold overflow-x-auto scrollbar-none" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 flex-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              filter === f.id
                ? f.id === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : f.id === 'wrong'
                  ? 'bg-red-600 text-white shadow-xs'
                  : f.id === 'skipped'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">No questions in this filter.</p>
      ) : (
        visible.map((a) => {
          const status = statusOf(a);
          const asked = doubtedIndexes?.has(a.questionIndex);
          return (
            <article
              key={a.questionIndex}
              className={`bg-white dark:bg-surface-darkCard rounded-2xl border p-3.5 sm:p-4 shadow-2xs space-y-3 ${
                status === 'correct'
                  ? 'border-emerald-200/80 dark:border-emerald-900/50'
                  : status === 'wrong'
                  ? 'border-red-200/80 dark:border-red-900/50'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                    status === 'correct' ? 'bg-emerald-500' : status === 'wrong' ? 'bg-red-500' : 'bg-slate-400'
                  }`}
                  aria-label={status}
                >
                  {status === 'correct' ? <Check className="w-4 h-4" /> : status === 'wrong' ? <X className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Q{a.questionIndex + 1}</span>
                    <span
                      className={
                        status === 'correct'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : status === 'wrong'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-500'
                      }
                    >
                      {status === 'correct' ? 'Correct' : status === 'wrong' ? 'Wrong' : 'Not answered'}
                    </span>
                    {a.difficulty && <span className="text-slate-400 normal-case tracking-normal font-semibold">• {a.difficulty}</span>}
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed mt-0.5">
                    {a.questionText || `Question ${a.questionIndex + 1}`}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {a.options.map((opt, oIdx) => {
                  const isCorrectOpt = oIdx === a.correctAnswer;
                  const isChosen = oIdx === a.selectedOption;
                  return (
                    <div
                      key={oIdx}
                      className={`px-3 py-2 rounded-xl border text-xs flex items-start gap-2 ${
                        isCorrectOpt
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                          : isChosen
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100'
                          : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                          isCorrectOpt
                            ? 'bg-emerald-600 text-white'
                            : isChosen
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {optionLetter(oIdx)}
                      </span>
                      <span className="flex-1 min-w-0 leading-snug">
                        <span className={isCorrectOpt || isChosen ? 'font-bold' : ''}>{opt}</span>
                        {(isCorrectOpt || isChosen) && (
                          <span className="block text-[10px] font-bold mt-0.5 opacity-80">
                            {isCorrectOpt && isChosen
                              ? `${yourLabel} • Correct answer`
                              : isCorrectOpt
                              ? 'Correct answer'
                              : yourLabel}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {status === 'skipped' && typeof a.correctAnswer === 'number' && (
                <p className="text-[11px] text-slate-500">
                  {perspective === 'admin' ? 'The student did not answer.' : 'You did not answer.'} The correct answer is{' '}
                  <strong className="text-emerald-700 dark:text-emerald-300">{optionLetter(a.correctAnswer)}</strong>.
                </p>
              )}

              {a.explanation && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-100 flex gap-2">
                  <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                  <p className="leading-relaxed">{a.explanation}</p>
                </div>
              )}

              {onAskDoubt && (
                <div className="flex justify-end">
                  {asked ? (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Doubt sent
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAskDoubt(a)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 inline-flex items-center gap-1 transition-colors"
                    >
                      <MessageCircleQuestion className="w-3.5 h-3.5" /> Ask a doubt
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
};
