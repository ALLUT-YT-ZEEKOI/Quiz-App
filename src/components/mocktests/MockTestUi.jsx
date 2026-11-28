import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuestionLevelFilter = ({ questions, value, onChange, disableEmpty = false }) => {
  const { difficultyLevels, matchesDifficulty } = useApp();
  const filters = [
    { id: 'All', label: 'All', count: questions.length },
    ...difficultyLevels.map((level) => ({
      ...level,
      count: questions.filter((q) => matchesDifficulty(q.difficulty, level.id)).length
    }))
  ];
  return (
    <div role="group" aria-label="Question difficulty" className="flex flex-wrap gap-1.5">
      {filters.map((level) => (
        <button
          key={level.id}
          type="button"
          onClick={() => onChange(level.id)}
          aria-pressed={value === level.id}
          disabled={disableEmpty && level.count === 0}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50 ${value === level.id
            ? 'bg-[#087F8C] border-[#087F8C] text-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#087F8C]/50'}`}
        >
          {level.dot && <span aria-hidden="true">{level.dot} </span>}{level.label} <span className="opacity-70">({level.count})</span>
        </button>
      ))}
    </div>
  );
};

/** On/off switch with a label. */
export const Toggle = ({ checked, onChange, label, hint, disabled = false, tone = 'teal' }) => {
  const on = tone === 'amber' ? 'bg-amber-500' : 'bg-[#087F8C]';
  return (
    <label className={`flex items-start justify-between gap-3 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className="min-w-0">
        <span className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{label}</span>
        {hint && <span className="block text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]/40 ${
          checked ? on : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
};

/** Centered modal frame with a header and a scrollable body. */
export const Modal = ({ open, onClose, title, subtitle, icon: Icon, children, footer, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className={`bg-white dark:bg-surface-darkCard rounded-3xl w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden`}>
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-10 h-10 rounded-2xl bg-[#087F8C]/10 dark:bg-teal-500/20 text-[#087F8C] dark:text-teal-300 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
        {footer && (
          <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/** Dark teal banner used at the top of the Mock Tests pages. */
export const PageHero = ({ eyebrow, title, description, action }) => (
  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-4 sm:p-8 text-white border border-[#145663]/60 shadow-premium">
    <div className="absolute -right-10 -top-10 w-36 h-36 sm:w-64 sm:h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0 space-y-1 sm:space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
          {eyebrow}
        </div>
        <h1 className="text-lg sm:text-3xl font-extrabold tracking-tight text-white leading-snug">{title}</h1>
        {description && <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {action}
    </div>
  </div>
);

export const primaryBtn =
  'px-4 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066974] text-white text-xs sm:text-sm font-bold shadow-sm inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
export const secondaryBtn =
  'px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
export const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]/50';
export const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5';
