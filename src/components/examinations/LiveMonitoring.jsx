import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowLeft,
  ShieldCheck,
  Laptop,
  Wifi,
  WifiOff,
  HelpCircle,
  Eye,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';

export const LiveMonitoring = ({ examId, onBack, onViewAnalytics }) => {
  const {
    examinations,
    examMonitoringSessions,
    setExamMonitoringSessions,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'In Progress', 'Submitted', 'Not Started'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(38 * 60 + 24); // e.g. 38 mins 24 secs remaining in window

  // Find current active exam
  const exam = useMemo(() => {
    return examinations.find((e) => e.id === examId) || examinations[0];
  }, [examinations, examId]);

  // Countdown clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format countdown
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h.toString().padStart(2, '0')}:` : ''}${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulate real-time heartbeat updates when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefreshedAt(new Date());
      // Randomly update an "In Progress" student's answered count or activity to simulate live websocket traffic
      setExamMonitoringSessions((prev) =>
        prev.map((s) => {
          if (s.status === 'In Progress' && Math.random() > 0.6) {
            const newAnswered = Math.min(30, s.answeredCount + 1);
            return {
              ...s,
              answeredCount: newAnswered,
              progressPct: Math.round((newAnswered / 30) * 100),
              lastActivityText: 'Active just now',
              lastActivityTimestamp: Date.now()
            };
          }
          return s;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, setExamMonitoringSessions]);

  const handleManualRefresh = () => {
    setLastRefreshedAt(new Date());
    showToast('Live telemetry feed updated from proctoring nodes', 'info');
  };

  // Summary Metrics
  const totalAssigned = examMonitoringSessions.length;
  const attendingCount = examMonitoringSessions.filter((s) => s.status === 'In Progress').length;
  const submittedCount = examMonitoringSessions.filter((s) => s.status === 'Submitted').length;
  const notStartedCount = examMonitoringSessions.filter((s) => s.status === 'Not Started').length;
  const idleCount = examMonitoringSessions.filter((s) => s.connectionStatus === 'Idle').length;

  // Filtered student list
  const filteredSessions = useMemo(() => {
    return examMonitoringSessions.filter((s) => {
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.studentName.toLowerCase().includes(q) ||
          (s.rollNo || '').toLowerCase().includes(q) ||
          (s.batch || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [examMonitoringSessions, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header with Native-App Circular Back Button */}
      <PageHeader
        onBack={onBack}
        backLabel="Back to Dashboard"
        badge={
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              TELEMETRY ACTIVE
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {exam?.code || 'EXAM-LIVE'}
            </span>
          </div>
        }
        title={`Live Proctoring: ${exam?.title}`}
        subtitle={`${exam?.subjectName} • Window: ${exam?.startTime} – ${exam?.endTime} • Faculty: ${exam?.faculty}`}
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-[#07242B] to-[#0A3944] text-white border border-[#145663]/80 shadow-md flex items-center gap-2.5 sm:gap-3 flex-1 sm:flex-initial">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#2DD4BF] animate-pulse shrink-0" />
              <div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Window Time Remaining
                </span>
                <span className="text-base sm:text-xl font-extrabold font-mono text-[#2DD4BF]">
                  {formatTime(timeRemainingSeconds)}
                </span>
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all active:scale-95 shrink-0"
              title="Manual Telemetry Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Proctoring Policy & Security Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            <strong>Confidential Proctoring Protocol:</strong> Student answer selections and question keys are cryptographically veiled during the live examination session.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Auto-Refresh (5s)</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
              autoRefresh ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                autoRefresh ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
          {['All', 'In Progress', 'Submitted', 'Not Started'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {status === 'All'
                ? `All (${totalAssigned})`
                : status === 'In Progress'
                ? `In Progress (${attendingCount})`
                : status === 'Submitted'
                ? `Submitted (${submittedCount})`
                : `Not Started (${notStartedCount})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredSessions.map((session) => {
          const isOnline = session.connectionStatus === 'Connected';
          const isIdle = session.connectionStatus === 'Idle';

          return (
            <div
              key={session.studentId}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={session.avatar}
                    alt={session.studentName}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {session.studentName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {session.rollNo} • {session.semester}
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                    session.status === 'In Progress'
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800'
                      : session.status === 'Submitted'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {session.status === 'In Progress' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                  )}
                  <span>{session.status}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Progress: {session.answeredCount} / {session.totalQuestions} Qs
                  </span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono">
                    {session.progressPct}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      session.status === 'Submitted'
                        ? 'bg-emerald-500'
                        : session.progressPct > 60
                        ? 'bg-[#087F8C]'
                        : 'bg-[#14B8A6]'
                    }`}
                    style={{ width: `${session.progressPct}%` }}
                  />
                </div>
              </div>

              {/* Footer row: Connection & Last activity */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline
                        ? 'bg-emerald-500 animate-pulse'
                        : isIdle
                        ? 'bg-amber-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                  <span className="font-semibold">{session.connectionStatus}</span>
                  {session.markedForReviewCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                      {session.markedForReviewCount} flagged
                    </span>
                  )}
                </div>

                <span className="text-slate-400">{session.lastActivityText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Candidates Monitoring Table (Desktop & Tablet >= md) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-3">Batch & Sem</th>
                <th className="py-3.5 px-3">Start Time</th>
                <th className="py-3.5 px-4">Progress ({exam?.totalQuestions || 30} Qs)</th>
                <th className="py-3.5 px-3">Review Flags</th>
                <th className="py-3.5 px-3">Telemetry / Activity</th>
                <th className="py-3.5 px-3">Connection</th>
                <th className="py-3.5 px-4 text-right">Exam Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredSessions.map((session) => {
                const isOnline = session.connectionStatus === 'Connected';
                const isIdle = session.connectionStatus === 'Idle';

                return (
                  <tr
                    key={session.studentId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={session.avatar}
                          alt={session.studentName}
                          className="w-8 h-8 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {session.studentName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {session.rollNo}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Batch & Sem */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      {session.batch} ({session.semester})
                    </td>

                    {/* Start Time */}
                    <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {session.startTime || '—'}
                    </td>

                    {/* Progress Bar & Answered Count */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-900 dark:text-white">
                            {session.answeredCount} / {session.totalQuestions}
                          </span>
                          <span className="text-teal-600 dark:text-teal-400 font-mono">
                            {session.progressPct}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              session.status === 'Submitted'
                                ? 'bg-emerald-500'
                                : session.progressPct > 60
                                ? 'bg-[#087F8C]'
                                : 'bg-[#14B8A6]'
                            }`}
                            style={{ width: `${session.progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Marked for Review */}
                    <td className="py-3.5 px-3">
                      {session.markedForReviewCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                          {session.markedForReviewCount} Marked
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0</span>
                      )}
                    </td>

                    {/* Last Activity */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                      {session.lastActivityText}
                    </td>

                    {/* Connection Status */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline
                              ? 'bg-emerald-500 animate-pulse'
                              : isIdle
                              ? 'bg-amber-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                        <span
                          className={`text-[11px] font-bold ${
                            isOnline
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : isIdle
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {session.connectionStatus}
                        </span>
                      </div>
                    </td>

                    {/* Exam Status Badge */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                          session.status === 'In Progress'
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800'
                            : session.status === 'Submitted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {session.status === 'In Progress' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                        )}
                        <span>{session.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
