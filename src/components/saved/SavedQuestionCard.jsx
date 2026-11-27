import React from 'react';
import { Check, X, Lightbulb, Trash2, BookOpen, ClipboardList, Radio, Clock } from 'lucide-react';
import { optionLetter, formatDateTime } from '../../utils/assessmentRecords';
import { SAVED_SOURCES } from '../../utils/savedQuestions';

const SOURCE_STYLE = {
  quiz: { Icon: BookOpen, cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  mock: { Icon: ClipboardList, cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  exam: { Icon: Radio, cls: 'bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300' }
};

export const SourceBadge = ({ source }) => {
  const style = SOURCE_STYLE[source] || SOURCE_STYLE.quiz;
  return (
    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 ${style.cls}`}>
      <style.Icon className="w-2.5 h-2.5" /> {SAVED_SOURCES[source]?.short || 'Quiz'}
    </span>
  );
};

/**
 * One saved question with its options. When the answer is known, the correct option is marked,
 * along with the student's own answer. perspective 'admin' words it as "Student's answer".
 */
export const SavedQuestionCard = ({ item, resolved, perspective = 'student', onRemove, footer }) => {
  const { correctAnswer, explanation, selectedOption, answered } = resolved;
  const known = correctAnswer !== null;
  const yourLabel = perspective === 'admin' ? "Student's answer" : 'Your answer';
  const outcome = !known || !answered ? null : selectedOption === null ? 'skipped' : selectedOption === correctAnswer ? 'correct' : 'wrong';

  return (
    <article className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <SourceBadge source={item.source} />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
              {[item.subjectName, item.sourceTitle].filter(Boolean).join(' · ')}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Saved {formatDateTime(item.savedAt)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {outcome && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                outcome === 'correct'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : outcome === 'wrong'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}
            >
              {outcome === 'correct' ? 'Got it right' : outcome === 'wrong' ? 'Got it wrong' : 'Skipped'}
            </span>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              aria-label="Remove from saved questions"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">{item.questionText}</p>

      {item.options?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {item.options.map((opt, i) => {
            const isAnswer = known && i === correctAnswer;
            const isPicked = answered && selectedOption === i;
            return (
              <div
                key={i}
                className={`px-3 py-2 rounded-xl border text-xs sm:text-sm flex items-start gap-2 ${
                  isAnswer
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : isPicked
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                    isAnswer ? 'bg-emerald-600 text-white' : isPicked ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isAnswer ? <Check className="w-3 h-3" /> : isPicked ? <X className="w-3 h-3" /> : optionLetter(i)}
                </span>
                <span className="min-w-0">
                  <span className="font-semibold">{opt}</span>
                  {(isAnswer || isPicked) && (
                    <span className="block text-[10px] font-extrabold uppercase tracking-wide opacity-80">
                      {isAnswer && isPicked ? `Correct answer · ${yourLabel}` : isAnswer ? 'Correct answer' : yourLabel}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {known && explanation && (
        <div className="px-3 py-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex gap-2">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{explanation}</span>
        </div>
      )}
      {!known && (
        <p className="text-[11px] text-slate-400">
          {perspective === 'admin' ? 'The correct answer is not available for this question.' : 'The correct answer appears here after you submit this test.'}
        </p>
      )}
      {footer}
    </article>
  );
};

export default SavedQuestionCard;
