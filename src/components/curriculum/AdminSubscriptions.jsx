import React, { useState } from 'react';
import { StoredImage } from './StoredImage';
import { AccessPeriodModal, subscriptionStart } from './AccessPeriodModal';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Clock,
  Phone,
  Search,
  Eye,
  Check,
  X,
  QrCode,
  Image as ImageIcon,
  CalendarClock,
  AlertTriangle,
  Infinity as InfinityIcon,
  RefreshCw,
  CalendarCog
} from 'lucide-react';
import {
  getSubscriptionTiming,
  formatDate,
  formatDaysLeft,
  formatAccess,
  hasFixedEndDate,
  parseDate,
  EXPIRING_SOON_DAYS
} from '../../utils/subscriptionUtils';

const DAY_MS = 24 * 60 * 60 * 1000;

export const AdminSubscriptions = () => {
  const {
    subscriptions,
    approveSubscription,
    rejectSubscription,
    getDefaultAccessPeriod,
    updateSubscriptionEnd,
    showToast
  } = useApp();

  // Approve-with-dates / change-end-date dialog: { mode: 'approve' | 'edit', req }
  const [periodDialog, setPeriodDialog] = useState(null);

  // The furthest end of the student's OTHER approved periods for the same subject (if later than now)
  const otherAccessEndFor = (req) => {
    const ends = (subscriptions || [])
      .filter((o) => o.id !== req.id && o.status === 'approved' && o.studentId === req.studentId && o.subjectId === req.subjectId)
      .map((o) => getSubscriptionTiming(o).expiresAt)
      .filter((d) => d && d > new Date());
    return ends.length ? new Date(Math.max(...ends.map((d) => d.getTime()))) : null;
  };

  const dialogProps = (() => {
    if (!periodDialog) return null;
    const { mode, req } = periodDialog;
    if (mode === 'approve') {
      const period = getDefaultAccessPeriod(req.id);
      if (!period) return null;
      return { startsAt: period.startsAt, initialEnd: period.expiresAt };
    }
    return { startsAt: subscriptionStart(req), initialEnd: getSubscriptionTiming(req).expiresAt };
  })();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'active', 'expired', 'rejected', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState(null);

  // Attach validity timing to every approved subscription
  const now = new Date();
  const enriched = (subscriptions || []).map((s) => {
    if (s.status !== 'approved') return { ...s, timing: null, renewed: false };
    const timing = getSubscriptionTiming(s, now);
    // An expired period counts as "renewed" if the same student has a later, still-valid period
    const renewed =
      timing.state === 'expired' &&
      (subscriptions || []).some(
        (o) =>
          o.id !== s.id &&
          o.status === 'approved' &&
          o.studentId === s.studentId &&
          o.subjectId === s.subjectId &&
          getSubscriptionTiming(o, now).state !== 'expired'
      );
    return { ...s, timing, renewed };
  });

  const byExpiry = (a, b) =>
    (a.timing?.expiresAt?.getTime() ?? Infinity) - (b.timing?.expiresAt?.getTime() ?? Infinity);

  const pendingList = enriched.filter((s) => s.status === 'pending');
  const activeList = enriched
    .filter((s) => s.status === 'approved' && s.timing.state !== 'expired')
    .sort(byExpiry); // soonest to end first
  const expiredList = enriched
    .filter((s) => s.status === 'approved' && s.timing.state === 'expired' && !s.renewed)
    .sort((a, b) => byExpiry(b, a)); // most recently ended first
  const rejectedList = enriched.filter((s) => s.status === 'rejected');
  const expiringSoonCount = activeList.filter((s) => s.timing.state === 'expiring').length;

  const getFilteredList = () => {
    let base = enriched;
    if (activeTab === 'pending') base = pendingList;
    else if (activeTab === 'active') base = activeList;
    else if (activeTab === 'expired') base = expiredList;
    else if (activeTab === 'rejected') base = rejectedList;

    if (!searchTerm.trim()) return base;
    const term = searchTerm.toLowerCase();
    return base.filter(
      (s) =>
        (s.studentName || '').toLowerCase().includes(term) ||
        (s.studentPhone || '').toLowerCase().includes(term) ||
        (s.subjectName || '').toLowerCase().includes(term) ||
        (s.transactionId || '').toLowerCase().includes(term)
    );
  };

  const filteredRequests = getFilteredList();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Compact header — matches curriculum home */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
            Approvals
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">
            Manual Course Enrollment
          </span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight leading-snug">
          <span className="sm:hidden">Payment Approvals</span>
          <span className="hidden sm:inline">Subscription & Payment Approvals</span>
        </h1>
        <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl">
          Review payment screenshots, verify transaction IDs, and unlock subject access.
        </p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:gap-3.5 p-3 sm:p-3.5 md:p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        {/* Mobile: horizontally scrollable pills · Desktop: equal-width pills */}
        <div className="flex md:grid md:grid-cols-5 gap-1 p-1 sm:p-1.5 rounded-xl bg-[#E8F3F4] dark:bg-slate-800/80 border border-[#087F8C]/15 dark:border-slate-700/60 text-[11px] sm:text-xs font-bold overflow-x-auto scrollbar-none">
          {[
            { id: 'pending', short: 'Pending', label: 'Pending Review', count: pendingList.length, active: 'bg-amber-500 text-white shadow-md shadow-amber-500/25' },
            { id: 'active', short: 'Active', label: 'Active', count: activeList.length, active: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' },
            { id: 'expired', short: 'Expired', label: 'Expired', count: expiredList.length, active: 'bg-slate-600 text-white shadow-md shadow-slate-600/25' },
            { id: 'rejected', short: 'Rejected', label: 'Rejected', count: rejectedList.length, active: 'bg-red-500 text-white shadow-md shadow-red-500/25' },
            { id: 'all', short: 'All', label: 'All', count: subscriptions.length, active: 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 md:shrink min-h-[2.5rem] px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? tab.active
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="md:hidden truncate">{tab.short}</span>
              <span className="hidden md:inline truncate">{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold ${
                  activeTab === tab.id
                    ? 'bg-white/25 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {expiringSoonCount > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className="w-full px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-semibold flex items-center gap-2 text-left hover:bg-amber-100/70 dark:hover:bg-amber-900/30 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {expiringSoonCount} {expiringSoonCount === 1 ? 'subscription ends' : 'subscriptions end'} within{' '}
              {EXPIRING_SOON_DAYS} days
            </span>
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]/50 shadow-subtle"
          />
        </div>
      </div>

      {/* Requests — 2 cards per row on mobile */}
      {filteredRequests.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white dark:bg-surface-darkCard rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
            No requests here
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'All payment screenshots have been processed.'
              : 'No submissions match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const timing = req.timing;
            const statusPill = !isApproved
              ? {
                  label: req.status,
                  cls: isPending
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                }
              : req.renewed
              ? { label: 'renewed', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
              : timing.state === 'expired'
              ? { label: 'expired', cls: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' }
              : timing.state === 'expiring'
              ? { label: 'ending soon', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' }
              : { label: 'active', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' };

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 sm:p-4 shadow-subtle flex flex-col gap-2 sm:gap-3"
              >
                <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                  <img
                    src={req.studentAvatar}
                    alt={req.studentName}
                    className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-full">
                        {req.studentName}
                      </h4>
                      <span className="px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {req.grantedByAdmin ? 'Given by admin' : `₹${req.amount}`}
                        {(req.validityDays !== undefined || hasFixedEndDate(req)) && (
                          <span className="font-bold opacity-75"> / {formatAccess(req)}</span>
                        )}
                      </span>
                      <span
                        className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${statusPill.cls}`}
                      >
                        {statusPill.label}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-[#087F8C] dark:text-teal-300 mt-0.5 truncate">
                      {req.subjectName}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-[9px] sm:text-[10px] text-slate-500 mt-1">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700 dark:text-slate-300 truncate">
                        <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#087F8C] shrink-0" />
                        {req.studentPhone}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400 truncate">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        {req.requestedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    {req.screenshot ? (
                      <button
                        type="button"
                        onClick={() => setPreviewScreenshotUrl(req.screenshot)}
                        className="relative w-11 h-11 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0"
                        title="View payment screenshot"
                      >
                        <StoredImage
                          src={req.screenshot}
                          alt="Payment Proof"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </span>
                      </button>
                    ) : (
                      <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-[8px] sm:text-[9px] shrink-0">
                        <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                        <span className="hidden sm:inline">No proof</span>
                      </div>
                    )}
                    {req.transactionId && (
                      <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 truncate min-w-0">
                        Ref: {req.transactionId}
                      </div>
                    )}
                  </div>

                  {isPending ? (
                    <div className="flex gap-1 sm:gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPeriodDialog({ mode: 'approve', req })}
                        className="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-[11px] inline-flex items-center justify-center gap-0.5 sm:gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectSubscription(req.id)}
                        className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-[10px] sm:text-[11px] font-semibold inline-flex items-center justify-center gap-0.5 sm:gap-1"
                      >
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : isApproved ? (
                    <>
                      <SubscriptionValidity req={req} timing={timing} />
                      <button
                        type="button"
                        onClick={() => setPeriodDialog({ mode: 'edit', req })}
                        className="w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#087F8C]/50 hover:text-[#087F8C] dark:hover:text-teal-300 text-[10px] sm:text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-colors"
                      >
                        <CalendarCog className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Change end date
                      </button>
                    </>
                  ) : (
                    <div className="text-[10px] sm:text-[11px] text-slate-500">
                      Reviewed: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.reviewedAt || 'Done'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {periodDialog && dialogProps && (
        <AccessPeriodModal
          key={`${periodDialog.mode}:${periodDialog.req.id}`}
          mode={periodDialog.mode}
          request={periodDialog.req}
          startsAt={dialogProps.startsAt}
          initialEnd={dialogProps.initialEnd}
          otherAccessEnd={otherAccessEndFor(periodDialog.req)}
          onClose={() => setPeriodDialog(null)}
          onConfirm={(expiresAt) => {
            if (periodDialog.mode === 'approve') approveSubscription(periodDialog.req.id, { expiresAt });
            else updateSubscriptionEnd(periodDialog.req.id, expiresAt);
            setPeriodDialog(null);
          }}
        />
      )}

      {/* FULL SCREEN PAYMENT SCREENSHOT MODAL */}
      {previewScreenshotUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white dark:bg-surface-darkCard rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Payment Proof Verification
                </h4>
              </div>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto rounded-2xl bg-black/90 flex items-center justify-center p-2">
              <StoredImage
                src={previewScreenshotUrl}
                alt="Payment Screenshot Fullscreen"
                className="max-h-[70vh] min-h-40 min-w-40 w-auto object-contain rounded-xl"
              />
            </div>

            <div className="pt-3 text-center">
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Validity block on an approved subscription card: end date, days left and a progress bar
const SubscriptionValidity = ({ req, timing }) => {
  if (timing.state === 'lifetime') {
    return (
      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
        <InfinityIcon className="w-3.5 h-3.5 text-[#087F8C] shrink-0" />
        <span className="font-bold">Lifetime access{req.customEnd ? ' (set by admin)' : ''}</span>
        <span className="text-slate-400 truncate">• since {formatDate(req.startsAt || req.reviewedAt)}</span>
      </div>
    );
  }

  const start = parseDate(req.startsAt || req.reviewedAt);
  const nowMs = Date.now();
  const total = start ? timing.expiresAt.getTime() - start.getTime() : 0;
  const elapsedPct =
    total > 0 ? Math.min(100, Math.max(0, ((nowMs - start.getTime()) / total) * 100)) : 100;
  const notStarted = start && start.getTime() > nowMs; // renewal queued after the current period

  const tone =
    timing.state === 'expired'
      ? { box: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800', text: 'text-slate-600 dark:text-slate-300', bar: 'bg-slate-400' }
      : timing.state === 'expiring'
      ? { box: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50', text: 'text-orange-800 dark:text-orange-300', bar: 'bg-orange-500' }
      : { box: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300', bar: 'bg-emerald-500' };

  const rightLabel =
    timing.state === 'expired'
      ? req.renewed
        ? 'Renewed'
        : (() => {
            const ago = Math.max(0, Math.floor((nowMs - timing.expiresAt.getTime()) / DAY_MS));
            return ago === 0 ? 'Expired today' : `Expired ${ago} ${ago === 1 ? 'day' : 'days'} ago`;
          })()
      : notStarted
      ? `Starts ${formatDate(start)}`
      : formatDaysLeft(timing.daysLeft);

  return (
    <div className={`px-2 py-1.5 rounded-lg border space-y-1.5 ${tone.box}`}>
      <div className={`flex items-center gap-1.5 ${tone.text}`}>
        {req.renewed ? <RefreshCw className="w-3.5 h-3.5 shrink-0" /> : <CalendarClock className="w-3.5 h-3.5 shrink-0" />}
        <span className="text-[11px] sm:text-xs font-extrabold">{rightLabel}</span>
      </div>
      <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300">
        {timing.state === 'expired' ? 'Ended on' : 'Ends on'}{' '}
        <strong className="font-bold text-slate-800 dark:text-slate-100">{formatDate(timing.expiresAt)}</strong>
      </div>
      <div className="h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden" aria-hidden="true">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${notStarted ? 0 : elapsedPct}%` }} />
      </div>
      <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
        Started {formatDate(start)}
        {req.customEnd
          ? ' • End date set by admin'
          : hasFixedEndDate(req) || req.validityDays
          ? ` • ${formatAccess(req)}`
          : ''}
      </div>
    </div>
  );
};
