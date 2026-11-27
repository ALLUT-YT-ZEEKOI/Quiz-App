import React, { useState } from 'react';
import { Search, X, Check, Eye, EyeOff, Lightbulb } from 'lucide-react';

// Searching questions by a word (e.g. "standard"): the search box, highlighting, and a result card.

const textOf = (q) => String(q?.questionText ?? q?.question ?? '');

/** True when the word appears in the question, one of its options or its explanation (any case). */
export const questionMatches = (q, term) => {
  const t = String(term || '').trim().toLowerCase();
  if (!t) return true;
  return [textOf(q), q?.explanation, ...(q?.options || [])].some((s) => String(s || '').toLowerCase().includes(t));
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The text with every match of `term` highlighted. */
export const Highlight = ({ text, term }) => {
  const t = String(term || '').trim();
  const value = String(text ?? '');
  if (!t) return value;
  const parts = value.split(new RegExp(`(${escapeRe(t)})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === t.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/40 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

/** Search box with a clear button and an optional result count. */
export const QuestionSearchBox = ({ value, onChange, placeholder = 'Search questions by a word, e.g. standard', count, className = '' }) => (
  <div className={`relative ${className}`}>
    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Escape' && onChange('')}
      aria-label="Search questions"
      placeholder={placeholder}
      className="w-full pl-9 pr-24 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C] [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {typeof count === 'number' && (
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            {count} {count === 1 ? 'match' : 'matches'}
          </span>
        )}
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )}
  </div>
);

/**
 * One question found by a search.
 * answer: 'shown' (correct answer marked), 'toggle' (hidden until "Show answer"), 'hidden' (never).
 * selectedOption: the student's own answer, when known.
 */
export const SearchResultCard = ({ context, question, term, answer = 'shown', selectedOption, action }) => {
  const [revealed, setRevealed] = useState(answer === 'shown');
  const correct = typeof question.correctAnswer === 'number' ? question.correctAnswer : null;
  const showCorrect = revealed && correct !== null;
  const hasMine = Number.isInteger(selectedOption);

  return (
    <article className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold text-[#087F8C] dark:text-teal-300 uppercase tracking-wide">{context}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          {answer === 'toggle' && correct !== null && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#087F8C]/50 inline-flex items-center gap-1"
            >
              {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {revealed ? 'Hide answer' : 'Show answer'}
            </button>
          )}
          {action}
        </div>
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
        <Highlight text={textOf(question)} term={term} />
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {(question.options || []).map((opt, i) => {
          const isAnswer = showCorrect && i === correct;
          const isMine = hasMine && i === selectedOption;
          return (
            <div
              key={i}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm border flex items-start gap-2 ${
                isAnswer
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold'
                  : isMine && revealed
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <strong className="shrink-0">{String.fromCharCode(65 + i)}.</strong>
              <span className="min-w-0">
                <Highlight text={opt} term={term} />
                {(isAnswer || (isMine && revealed)) && (
                  <span className="block text-[10px] font-extrabold uppercase tracking-wide opacity-80">
                    {isAnswer && isMine ? 'Correct answer · Your answer' : isAnswer ? 'Correct answer' : 'Your answer'}
                  </span>
                )}
              </span>
              {isAnswer && <Check className="w-3.5 h-3.5 shrink-0 ml-auto mt-0.5" />}
            </div>
          );
        })}
      </div>
      {!showCorrect &&
        String(term || '').trim() &&
        String(question.explanation || '').toLowerCase().includes(String(term).trim().toLowerCase()) &&
        ![textOf(question), ...(question.options || [])].some((s) => String(s || '').toLowerCase().includes(String(term).trim().toLowerCase())) && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            &ldquo;{String(term).trim()}&rdquo; is in this question&apos;s explanation{answer === 'toggle' ? '. Tap Show answer to see it.' : '.'}
          </p>
        )}
      {showCorrect && question.explanation && (
        <div className="px-3 py-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex gap-2">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <Highlight text={question.explanation} term={term} />
          </span>
        </div>
      )}
    </article>
  );
};
