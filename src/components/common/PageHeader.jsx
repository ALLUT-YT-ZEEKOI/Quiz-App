import React from 'react';
import { ChevronLeft } from 'lucide-react';

/**
 * Enterprise Native-App Style Page Header
 * Matches mobile app aesthetic (circular floating back button with tactile shadow, bold title, clean subtitle).
 * 100% mobile, tablet, and desktop responsive.
 */
export const PageHeader = ({
  title,
  subtitle,
  badge,
  onBack,
  backLabel = 'Go back',
  actions,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex items-center justify-center text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 active:scale-90 transition-all shrink-0 cursor-pointer"
            title={backLabel}
            aria-label={backLabel}
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5 text-slate-800 dark:text-slate-100" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          {badge && (
            <div className="mb-1 flex items-center gap-1.5 flex-wrap">
              {badge}
            </div>
          )}
          <h1 className="font-extrabold text-base sm:text-lg lg:text-xl text-slate-900 dark:text-white leading-tight line-clamp-2 sm:truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight line-clamp-2 sm:truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
