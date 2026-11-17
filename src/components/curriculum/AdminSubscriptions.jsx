import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Search,
  ExternalLink,
  Eye,
  Check,
  X,
  CreditCard,
  QrCode,
  DollarSign,
  Users,
  Image as ImageIcon
} from 'lucide-react';

export const AdminSubscriptions = () => {
  const {
    subscriptions,
    approveSubscription,
    rejectSubscription,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState(null);

  const pendingList = (subscriptions || []).filter((s) => s.status === 'pending');
  const approvedList = (subscriptions || []).filter((s) => s.status === 'approved');
  const rejectedList = (subscriptions || []).filter((s) => s.status === 'rejected');

  const totalRevenue = approvedList.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  const getFilteredList = () => {
    let base = subscriptions || [];
    if (activeTab === 'pending') base = pendingList;
    else if (activeTab === 'approved') base = approvedList;
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              Payment Verification
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Manual Course Enrollment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Subscription & Payment Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Review student QR code payment screenshots, verify transaction reference IDs, and approve access to unlocked subject modules.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
              {pendingList.length}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                Pending Approvals
              </span>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400">
                Awaiting your verification
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs card-hover-lift flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-soft-pulse" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Pending Verification
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {pendingList.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs card-hover-lift flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Approved Access
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {approvedList.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs card-hover-lift flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Total Revenue
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              ₹{totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs card-hover-lift flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Total Submissions
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {(subscriptions || []).length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs font-bold w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Pending Review</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[10px]">
              {pendingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'approved'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Approved</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px]">
              {approvedList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rejected'
                ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Rejected</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 text-[10px]">
              {rejectedList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Requests ({subscriptions.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No Subscription Requests in "{activeTab}"
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'All student payment screenshots have been verified and processed!'
              : 'No payment submissions found matching your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-blue-400/80 card-hover-lift transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Student & Course Details */}
                <div className="flex items-start gap-4">
                  <img
                    src={req.studentAvatar}
                    alt={req.studentName}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        {req.studentName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        ₹{req.amount}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : isPending
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 animate-pulse'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      Course: {req.subjectName}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        {req.studentPhone}
                      </span>
                      <span>•</span>
                      {req.transactionId && (
                        <>
                          <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            Ref: {req.transactionId}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" /> Submitted {req.requestedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Screenshot Preview & Actions */}
                <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                  {/* Screenshot Thumbnail with Click to Expand */}
                  {req.screenshot ? (
                    <div
                      onClick={() => setPreviewScreenshotUrl(req.screenshot)}
                      className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer group shadow-sm shrink-0"
                      title="Click to view full payment screenshot"
                    >
                      <img
                        src={req.screenshot}
                        alt="Payment Proof"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-[10px] p-2 text-center">
                      <ImageIcon className="w-5 h-5 mb-1" />
                      <span>No Proof</span>
                    </div>
                  )}

                  {/* Approve / Reject Actions */}
                  {isPending ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => approveSubscription(req.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Unlock</span>
                      </button>
                      <button
                        onClick={() => rejectSubscription(req.id)}
                        className="px-4 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block text-[10px]">
                        Reviewed on
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {req.reviewedAt || 'Done'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
              <img
                src={previewScreenshotUrl}
                alt="Payment Screenshot Fullscreen"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
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
