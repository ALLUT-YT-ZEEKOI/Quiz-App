import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import {
  Radio,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Play,
  BarChart3,
  Eye,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';

export const ExamDashboard = ({
  onCreateExam,
  onMonitorExam,
  onViewAnalytics
}) => {
  const {
    examinations,
    examAttempts,
    examMonitoringSessions,
    curriculumSubjects,
    subjects,
    currentUser,
    currentRole,
    retests
  } = useApp();
  // Retest requests waiting for the admin, per exam (approved on each exam's results page)
  const pendingRetestsByExam = (retests || [])
    .filter((r) => r.status === 'requested')
    .reduce((map, r) => map.set(r.examId, (map.get(r.examId) || 0) + 1), new Map());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'live', 'upcoming', 'completed'

  // Summary Metrics Calculation
  const totalScheduled = examinations.length;
  const liveExams = useMemo(() => examinations.filter((e) => e.status === 'Live Now'), [examinations]);
  const upcomingExams = useMemo(() => examinations.filter((e) => e.status === 'Upcoming'), [examinations]);
  const completedExams = useMemo(() => examinations.filter((e) => e.status === 'Completed'), [examinations]);

  const attendingCount = useMemo(() => {
    return examMonitoringSessions.filter((s) => s.status === 'In Progress').length;
  }, [examMonitoringSessions]);

  // Filter examinations based on tab, subject, search
  const filteredExams = useMemo(() => {
    return examinations.filter((exam) => {
      // Tab filter
      if (activeTab === 'live' && exam.status !== 'Live Now') return false;
      if (activeTab === 'upcoming' && exam.status !== 'Upcoming') return false;
      if (activeTab === 'completed' && exam.status !== 'Completed') return false;

      // Subject filter
      if (selectedSubject !== 'All' && exam.subjectName !== selectedSubject && exam.subjectId !== selectedSubject) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = exam.title.toLowerCase().includes(query);
        const codeMatch = (exam.code || '').toLowerCase().includes(query);
        const subjectMatch = exam.subjectName.toLowerCase().includes(query);
        if (!titleMatch && !codeMatch && !subjectMatch) return false;
      }

      return true;
    });
  }, [examinations, activeTab, selectedSubject, searchQuery]);

  // List of all unique subject names for filter
  const subjectOptions = useMemo(() => {
    const set = new Set();
    examinations.forEach((e) => set.add(e.subjectName));
    return ['All', ...Array.from(set)];
  }, [examinations]);

  return (
    <div className="relative space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-28 sm:pb-16">
      {/* Compact hero — matches admin home mobile pattern */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-3.5 sm:p-8 text-white border border-[#145663]/60 shadow-premium sm:shadow-[0_8px_32px_rgba(4,20,24,0.35)]">
        <div className="absolute -right-10 -top-10 w-36 h-36 sm:w-64 sm:h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-1 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="sm:hidden">Exam Hub</span>
              <span className="hidden sm:inline">CohesionTech Examination Hub</span>
            </div>
            <h1 className="text-base sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-snug">
              Live & Scheduled Examinations
            </h1>
            <p className="hidden sm:block text-base text-slate-300 max-w-2xl leading-relaxed">
              Real-time proctored examination engine with strict availability windows, automated timers, and live candidate tracking.
            </p>
          </div>

          {liveExams.length > 0 && (
            <button
              type="button"
              onClick={() => onMonitorExam(liveExams[0].id)}
              className="shrink-0 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-[#092B32] hover:bg-[#0E3B44] text-[#2DD4BF] font-bold text-[11px] sm:text-sm border border-[#20B8C7]/50 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#10B981] animate-pulse" />
              <span className="sm:hidden">Live</span>
              <span className="hidden sm:inline">Live Monitor ({attendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {pendingRetestsByExam.size > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 space-y-2">
          <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">Students asked for a retest</p>
          <div className="flex flex-wrap gap-2">
            {[...pendingRetestsByExam.entries()].map(([id, count]) => (
              <button
                key={id}
                type="button"
                onClick={() => onViewAnalytics(id)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-amber-400"
              >
                {examinations.find((e) => e.id === id)?.title || 'Exam'}{' '}
                <span className="ml-1 px-1.5 rounded-full bg-amber-500 text-white text-[10px]">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:gap-3.5 p-3 sm:p-3.5 md:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        {/* All tabs in one row on mobile */}
        <div className="grid grid-cols-4 gap-1 p-1 sm:p-1.5 rounded-xl bg-[#E8F3F4] dark:bg-slate-800/80 border border-[#087F8C]/15 dark:border-slate-700/60 text-[11px] sm:text-xs font-bold">
          {[
            { id: 'all', short: `All (${totalScheduled})`, label: `All Exams (${totalScheduled})` },
            { id: 'live', short: `Live (${liveExams.length})`, label: `Live Now (${liveExams.length})`, live: true },
            { id: 'upcoming', short: `Soon (${upcomingExams.length})`, label: `Upcoming (${upcomingExams.length})` },
            { id: 'completed', short: `Done (${completedExams.length})`, label: `Completed (${completedExams.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[2.5rem] px-2.5 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? tab.live
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25'
                  : tab.live
                  ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
              }`}
            >
              {tab.live && (
                <span
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                    activeTab === 'live' ? 'bg-white animate-pulse' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
              )}
              <span className="md:hidden truncate">{tab.short}</span>
              <span className="hidden md:inline truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]/50 shadow-subtle"
            />
          </div>
          <div className="w-full sm:w-auto shrink-0">
            <CustomDropdown
              options={subjectOptions.map((subj) => ({
                value: subj,
                label: subj === 'All' ? 'All Subjects' : subj
              }))}
              value={selectedSubject}
              onChange={setSelectedSubject}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Main Section 1: LIVE EXAMINATIONS (If any) */}
      {(activeTab === 'all' || activeTab === 'live') && liveExams.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="truncate">Live Exams</span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold shrink-0">
                  Active
                </span>
              </h2>
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-500">
              Auto-updating every 5s
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
            {liveExams.map((exam) => {
              const liveAttending = examMonitoringSessions.filter(
                (s) => s.status === 'In Progress' && (s.examId === exam.id || !s.examId)
              ).length;
              const liveSubmitted = examMonitoringSessions.filter(
                (s) => s.status === 'Submitted' && (s.examId === exam.id || !s.examId)
              ).length;

              return (
                <div
                  key={exam.id}
                  className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-gradient-to-br from-white via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-2 border-emerald-400/80 dark:border-emerald-500/50 shadow-md relative overflow-hidden space-y-3 sm:space-y-5"
                >
                  {/* Subtle pulsing background glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-emerald-300 dark:border-emerald-700">
                          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                          LIVE NOW
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {exam.code}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                        {exam.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {exam.subjectName} • {exam.module}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        Window: {exam.startTime} – {exam.endTime}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Duration: {exam.durationMinutes} mins
                      </div>
                    </div>
                  </div>

                  {/* Live Attendance Progress Gauge */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live Attendance</span>
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-mono">
                        {liveAttending} Attending • {liveSubmitted} Submitted • 21 Total
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(liveSubmitted / 21) * 100}%` }}
                        className="bg-emerald-500 h-full transition-all"
                        title={`${liveSubmitted} Submitted`}
                      />
                      <div
                        style={{ width: `${(liveAttending / 21) * 100}%` }}
                        className="bg-cyan-500 h-full animate-pulse transition-all"
                        title={`${liveAttending} Currently Attending`}
                      />
                    </div>
                  </div>

                  {/* Metadata Chips & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold flex-wrap">
                      <span><strong>{exam.totalQuestions}</strong> Questions</span>
                      <span>•</span>
                      <span><strong>{exam.totalMarks}</strong> Marks</span>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400">
                        {exam.negativeMarking ? `-${exam.negativeMarkValue} Neg. Marking` : 'No Neg. Marking'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onMonitorExam(exam.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>Monitor Live</span>
                      </button>

                      <button
                        onClick={() => onViewAnalytics(exam.id)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Section 2: UPCOMING EXAMINATIONS */}
      {(activeTab === 'all' || activeTab === 'upcoming') && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="sm:hidden">Upcoming</span>
              <span className="hidden sm:inline">Upcoming Scheduled Examinations</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                {upcomingExams.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-subtle hover:shadow-md transition-all flex flex-col justify-between space-y-3 sm:space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200 dark:border-blue-900">
                      SCHEDULED
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {exam.date}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2 line-clamp-1">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {exam.subjectName} • {exam.module}
                  </p>
                </div>

                {/* Exam Details Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Time Window</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {exam.startTime} – {exam.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Duration</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {exam.durationMinutes} Minutes
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Questions</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {exam.totalQuestions} Questions
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Students</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {exam.assignedStudentIds?.length || 21} Registered
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Faculty: <strong>{exam.faculty}</strong>
                  </span>

                  <button
                    onClick={() => onViewAnalytics(exam.id)}
                    className="text-xs font-bold text-[#087F8C] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
                  >
                    <span>View Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Section 3: COMPLETED EXAMINATIONS */}
      {(activeTab === 'all' || activeTab === 'completed') && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="sm:hidden">Completed</span>
              <span className="hidden sm:inline">Completed Examinations & Official Reports</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                {completedExams.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
            {completedExams.map((exam) => {
              const attemptsForThisExam = examAttempts.filter((a) => a.examId === exam.id);
              const subCount = attemptsForThisExam.length > 0 ? attemptsForThisExam.length : 21;
              const avgScoreForExam = attemptsForThisExam.length > 0
                ? Math.round(attemptsForThisExam.reduce((acc, curr) => acc + curr.percentage, 0) / attemptsForThisExam.length)
                : 82;
              const passPct = attemptsForThisExam.length > 0
                ? Math.round((attemptsForThisExam.filter((a) => a.passed).length / attemptsForThisExam.length) * 100)
                : 95;

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                        COMPLETED
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {exam.date}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2 line-clamp-1">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {exam.subjectName} • {exam.module}
                    </p>
                  </div>

                  {/* Results Summary Box */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Submissions</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {subCount}/21
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Avg Score</span>
                      <span className="font-extrabold text-teal-600 dark:text-teal-400 text-xs">
                        {avgScoreForExam}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pass Rate</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                        {passPct}%
                      </span>
                    </div>
                  </div>

                  {/* View Results Button */}
                  <button
                    onClick={() => onViewAnalytics(exam.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-[#087F8C] text-slate-800 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-[#087F8C] dark:hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <BarChart3 className="w-4 h-4 text-[#087F8C] group-hover:text-white transition-colors" />
                    <span>View Results & Analytics</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button — Create Examination */}
      <button
        type="button"
        onClick={onCreateExam}
        className="fixed z-40 bottom-20 right-4 sm:bottom-8 sm:right-8 inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white font-bold text-xs sm:text-sm shadow-[0_8px_28px_rgba(20,184,166,0.45)] border border-[#20B8C7]/40 active:scale-95 transition-all"
        aria-label="Create Examination"
      >
        <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </span>
        <span className="sm:hidden">Create Exam</span>
        <span className="hidden sm:inline">Create Examination</span>
      </button>
    </div>
  );
};
