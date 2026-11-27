import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarClock, CalendarPlus, CalendarDays, Infinity as InfinityIcon, Check, AlertTriangle } from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { addDays, endOfDate, toYmd, formatDate, getSubscriptionTiming } from '../../utils/subscriptionUtils';

const EXTEND_PRESETS = [7, 15, 30, 60, 90, 180, 365];

/**
 * Change the end date of many approved subscriptions at once (e.g. everyone in one batch).
 *   extend   : add N days to each one (counted from its end date, or from today if it already ended)
 *   date     : one end date for all
 *   lifetime : no end date
 * targets: approved subscriptions; onApply([{ id, expiresAt }]) (expiresAt ISO, or null for lifetime)
 */
export const BulkEndDateModal = ({ targets, scopeLabel, onClose, onApply }) => {
  const [mode, setMode] = useState('extend');
  const [days, setDays] = useState(30);
  const [customDays, setCustomDays] = useState('');
  const [ymd, setYmd] = useState(toYmd(addDays(new Date(), 30)));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const now = new Date();
  const plan = useMemo(
    () =>
      targets.map((s) => {
        const current = getSubscriptionTiming(s, now).expiresAt; // null = lifetime
        let next;
        if (mode === 'lifetime') next = null;
        else if (mode === 'date') next = endOfDate(ymd);
        else if (current === null) next = undefined; // lifetime stays lifetime when extending
        else next = addDays(current > now ? current : now, days);
        return { s, current, next };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targets, mode, days, ymd]
  );

  const changing = plan.filter((p) => p.next !== undefined);
  const skippedLifetime = plan.length - changing.length;
  const pastDate = mode === 'date' && endOfDate(ymd) && endOfDate(ymd) < now;
  const canApply = changing.length > 0 && !pastDate && (mode !== 'date' || !!endOfDate(ymd)) && (mode !== 'extend' || days > 0);

  const tab = (id, label, Icon) => (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={mode === id}
      onClick={() => setMode(id)}
      className={`py-2 rounded-lg text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${
        mode === id ? 'bg-white dark:bg-slate-800 text-[#0C4E5B] dark:text-cyan-300 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  const chip = (active) =>
    `px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
      active
        ? 'bg-[#E6F4F6] dark:bg-[#0E353E] text-[#0C4E5B] dark:text-cyan-300 border-[#087F8C]'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="bulk-end-title">
      <div className="w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#087F8C] bg-[#E6F4F6] dark:bg-[#0E353E] dark:text-cyan-300">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="bulk-end-title" className="text-base font-black text-slate-900 dark:text-white">
              Change end date for {targets.length} {targets.length === 1 ? 'student' : 'students'}
            </h2>
            <p className="text-xs text-slate-500 truncate">{scopeLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800" role="tablist">
            {tab('extend', 'Extend', CalendarPlus)}
            {tab('date', 'Set date', CalendarDays)}
            {tab('lifetime', 'Lifetime', InfinityIcon)}
          </div>

          {mode === 'extend' && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Add days to each student&apos;s access</p>
              <div className="flex flex-wrap gap-1.5">
                {EXTEND_PRESETS.map((d) => (
                  <button key={d} type="button" onClick={() => setDays(d)} className={chip(days === d)}>
                    +{d} days
                  </button>
                ))}
                <span className="inline-flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    value={customDays}
                    onChange={(e) => {
                      setCustomDays(e.target.value);
                      const n = Math.round(Number(e.target.value));
                      if (n > 0) setDays(n);
                    }}
                    placeholder="Other"
                    aria-label="Custom number of days"
                    className="w-20 px-2 py-1.5 rounded-lg text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <span className="text-[11px] text-slate-400">days</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Counted from each student&apos;s current end date. If it already ended, from today.</p>
            </div>
          )}

          {mode === 'date' && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Last day of access for everyone</p>
              <CustomDatePicker value={ymd} onChange={(v) => v && setYmd(v)} placeholder="Select end date" />
              {pastDate && (
                <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pick today or a later date.
                </p>
              )}
            </div>
          )}

          {mode === 'lifetime' && (
            <p className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
              Everyone below gets <strong>lifetime access</strong>. Their subscriptions never expire.
            </p>
          )}

          {/* Preview */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 grid grid-cols-[1fr_auto_auto] gap-3">
              <span>Student</span>
              <span className="text-right">Now ends</span>
              <span className="text-right w-24">New end</span>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
              {plan.map(({ s, current, next }) => (
                <li key={s.id} className="px-3 py-2 grid grid-cols-[1fr_auto_auto] gap-3 items-center text-xs">
                  <span className="min-w-0">
                    <span className="block font-bold text-slate-800 dark:text-slate-100 truncate">{s.studentName}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{s.subjectName}</span>
                  </span>
                  <span className="text-right text-slate-500">{current ? formatDate(current) : 'Lifetime'}</span>
                  <span className={`text-right w-24 font-bold ${next === undefined ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {next === undefined ? 'No change' : next ? formatDate(next) : 'Lifetime'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {skippedLifetime > 0 && mode === 'extend' && (
            <p className="text-[11px] text-slate-500">
              {skippedLifetime} {skippedLifetime === 1 ? 'student already has' : 'students already have'} lifetime access, so nothing changes for them.
            </p>
          )}
        </div>

        <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canApply}
            onClick={() => onApply(changing.map(({ s, next }) => ({ id: s.id, expiresAt: next ? next.toISOString() : null })))}
            className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" /> Update {changing.length} {changing.length === 1 ? 'subscription' : 'subscriptions'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BulkEndDateModal;
