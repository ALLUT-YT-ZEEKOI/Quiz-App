import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarClock, Check, AlertTriangle, Infinity as InfinityIcon, Info, Ban } from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { addDays, endOfDate, toYmd, formatDate, parseDate } from '../../utils/subscriptionUtils';

const DAY_MS = 24 * 60 * 60 * 1000;

const PRESETS = [
  { days: 30, label: '30 days' },
  { days: 60, label: '60 days' },
  { days: 90, label: '90 days' },
  { days: 180, label: '6 months' },
  { days: 365, label: '1 year' }
];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Choose when a student's subject access ends: when approving a payment, or later for an
 * approved subscription.
 *
 * Props:
 *   mode         'approve' | 'edit'
 *   request      the subscription
 *   startsAt     Date access starts (or started)
 *   initialEnd   Date | null (lifetime): the plan's end (approve) or the current end (edit)
 *   otherAccessEnd  Date | null: a different approved period for the same subject that reaches further
 *   onConfirm(expiresAtIso | null), onClose()
 */
export const AccessPeriodModal = ({ mode, request, startsAt, initialEnd, otherAccessEnd, onConfirm, onClose }) => {
  const [lifetime, setLifetime] = useState(initialEnd === null);
  const [endYmd, setEndYmd] = useState(initialEnd ? toYmd(initialEnd) : toYmd(addDays(startsAt, 30)));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Keep the exact original time when the admin leaves the suggested date as it is
  const end = useMemo(() => {
    if (lifetime) return null;
    if (initialEnd && endYmd === toYmd(initialEnd)) return initialEnd;
    return endOfDate(endYmd);
  }, [lifetime, endYmd, initialEnd]);

  const now = new Date();
  const beforeStart = end && startOfDay(end) < startOfDay(startsAt);
  const alreadyOver = end && end <= now;
  const totalDays = end ? Math.max(0, Math.round((startOfDay(end) - startOfDay(startsAt)) / DAY_MS)) : null;
  const unchanged =
    mode === 'edit' && ((initialEnd === null && lifetime) || (initialEnd && end && end.getTime() === initialEnd.getTime()));

  const pickPreset = (days) => {
    setLifetime(false);
    setEndYmd(toYmd(addDays(startsAt, days)));
  };
  const presetActive = (days) => !lifetime && endYmd === toYmd(addDays(startsAt, days));

  const confirm = () => {
    if (!end && !lifetime) return;
    onConfirm(lifetime ? null : end.toISOString());
  };

  const chip = (active) =>
    `px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
      active
        ? 'bg-[#E6F4F6] dark:bg-[#0E353E] text-[#0C4E5B] dark:text-cyan-300 border-[#087F8C]'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-period-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#087F8C] bg-[#E6F4F6] dark:bg-[#0E353E] dark:text-cyan-300">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="access-period-title" className="text-base font-black text-slate-900 dark:text-white">
              {mode === 'approve' ? 'Approve & set access' : 'Change access end date'}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {request.studentName} &middot; {request.subjectName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {startsAt > now ? 'Starts' : mode === 'approve' ? 'Starts' : 'Started'}
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{formatDate(startsAt)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {mode === 'approve' ? 'Plan default' : 'Ends now'}
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {initialEnd ? formatDate(initialEnd) : 'Lifetime'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Access length from the start date</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button key={p.days} type="button" onClick={() => pickPreset(p.days)} className={chip(presetActive(p.days))}>
                  {p.label}
                </button>
              ))}
              <button type="button" onClick={() => setLifetime(true)} className={`${chip(lifetime)} inline-flex items-center gap-1`}>
                <InfinityIcon className="w-3 h-3" /> Lifetime
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Or pick the last day of access</label>
            <CustomDatePicker
              value={lifetime ? '' : endYmd}
              onChange={(ymd) => {
                if (!ymd) return;
                setLifetime(false);
                setEndYmd(ymd);
              }}
              placeholder="Select end date"
            />
          </div>

          {/* What will happen */}
          <div
            className={`p-3 rounded-xl border text-xs ${
              beforeStart
                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300'
                : alreadyOver
                ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300'
                : 'bg-emerald-50/70 border-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300'
            }`}
            role="status"
          >
            {beforeStart ? (
              <span className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                The end date can&apos;t be before the start date ({formatDate(startsAt)}).
              </span>
            ) : lifetime ? (
              <span>
                <strong>Lifetime access</strong> from {formatDate(startsAt)}. It never expires.
              </span>
            ) : alreadyOver ? (
              <span className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  This date has passed: <strong>{request.studentName} loses access right away</strong>.
                </span>
              </span>
            ) : (
              <span>
                Access until <strong>{formatDate(end)}</strong>
                {totalDays !== null && ` (${totalDays} ${totalDays === 1 ? 'day' : 'days'} from ${formatDate(startsAt)})`}. The
                subject locks for the student after that day.
              </span>
            )}
          </div>

          {mode === 'edit' && (initialEnd === null || initialEnd > now) && (
            <button
              type="button"
              onClick={() => onConfirm(new Date().toISOString())}
              className="w-full py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" /> End access now
            </button>
          )}

          {otherAccessEnd && (!end || otherAccessEnd > end) && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                This student has another approved period for this subject until{' '}
                <strong>{formatDate(otherAccessEnd)}</strong>, so they keep access until then. Change that one too to end it sooner.
              </span>
            </p>
          )}
        </div>

        <div className="p-4 sm:p-5 pt-0 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={beforeStart || unchanged}
            className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            {mode === 'approve' ? 'Approve payment' : 'Save end date'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/** The start Date of an approved subscription (falls back to when it was reviewed). */
export const subscriptionStart = (s) => parseDate(s.startsAt || s.reviewedAt) || new Date();

export default AccessPeriodModal;
