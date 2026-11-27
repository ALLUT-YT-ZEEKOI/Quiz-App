import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, HelpCircle, Trash2 } from 'lucide-react';

// In-app confirmation popup (replaces the browser's "localhost says" box).
//
//   if (await confirmDialog({ title: 'Delete question?', message: '…', confirmLabel: 'Delete', tone: 'danger' })) { … }
//
// <ConfirmHost /> is mounted once in App and shows whichever request is open.

let openRequest = null; // set by the mounted host

/** Opens the popup. Resolves true (confirmed) or false (cancelled / closed). */
export const confirmDialog = (options = {}) =>
  new Promise((resolve) => {
    if (!openRequest) {
      // Host not mounted (shouldn't happen): fall back to the browser box
      resolve(window.confirm(options.message || options.title || 'Are you sure?'));
      return;
    }
    openRequest({ ...options, resolve });
  });

const TONES = {
  danger: { Icon: Trash2, icon: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400', btn: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/40' },
  warning: { Icon: AlertTriangle, icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400', btn: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500/40' },
  default: { Icon: HelpCircle, icon: 'bg-[#E6F4F6] text-[#087F8C] dark:bg-[#0E353E] dark:text-cyan-300', btn: 'bg-[#087F8C] hover:bg-[#0C4E5B] focus-visible:ring-[#087F8C]/40' }
};

export const ConfirmHost = () => {
  const [req, setReq] = useState(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    openRequest = (r) => setReq(r);
    return () => {
      openRequest = null;
    };
  }, []);

  const close = (answer) => {
    req?.resolve(answer);
    setReq(null);
  };

  useEffect(() => {
    if (!req) return undefined;
    confirmRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req]);

  if (!req) return null;
  const tone = TONES[req.tone] || TONES.default;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => close(false)}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={req.message ? 'confirm-message' : undefined}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-surface-darkCard rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${tone.icon}`}>
            <tone.Icon className="w-5 h-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 id="confirm-title" className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
              {req.title || 'Are you sure?'}
            </h2>
            {req.message && (
              <p id="confirm-message" className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {req.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => close(false)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {req.cancelLabel || 'Cancel'}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => close(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm focus:outline-none focus-visible:ring-4 ${tone.btn}`}
          >
            {req.confirmLabel || 'OK'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmHost;
