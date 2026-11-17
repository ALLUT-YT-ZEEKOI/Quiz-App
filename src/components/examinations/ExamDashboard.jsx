import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
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
    currentRole
  } = useApp();

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

  const submittedCount = useMemo(() => {
    return examMonitoringSessions.filter((s) => s.status === 'Submitted').length;
  }, [examMonitoringSessions]);

  const pendingSubmissions = Math.max(0, 21 - submittedCount);

  const averageScore = useMemo(() => {
    if (examAttempts.length === 0) return 81.5;
    const total = examAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    return Math.round(total / examAttempts.length);
  }, [examAttempts]);

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
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-6 sm:p-8 text-white border border-[#145663]/60 shadow-[0_8px_32px_rgba(4,20,24,0.35)]">
        {/* Ambient Decorative Lighting */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-80 h-32 rounded-full bg-[#087F8C]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>CohesionTech Examination Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Live & Scheduled Examinations
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Real-time proctored examination engine with strict availability windows, automated timer synchronizations, and live candidate tracking for Civil Engineering programs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {liveExams.length > 0 && (
              <button
                onClick={() => onMonitorExam(liveExams[0].id)}
                className="px-4 py-3 rounded-2xl bg-[#092B32] hover:bg-[#0E3B44] text-[#2DD4BF] font-bold text-xs sm:text-sm border border-[#20B8C7]/50 shadow-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
                <span>Live Monitor ({attendingCount})</span>
              </button>
            )}

            <button
              onClick={onCreateExam}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white font-extrabold text-xs sm:text-sm shadow-[0_4px_20px_rgba(20,184,166,0.35)] flex items-center gap-2.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Examination</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Cards (7 Metrics as requested) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* 1. Total Scheduled */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Scheduled</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalScheduled}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">All sessions</div>
        </div>

        {/* 2. Exams Live Now */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-300 dark:border-emerald-800/60 shadow-2xs space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Now</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">
            {liveExams.length}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> Active Sessions
          </div>
        </div>

        {/* 3. Completed Exams */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {completedExams.length}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Evaluated</div>
        </div>

        {/* 4. Total Registered Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            21
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Civil Eng. Batch</div>
        </div>

        {/* 5. Currently Attending */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50/40 dark:from-cyan-950/40 dark:to-blue-950/20 border border-cyan-300 dark:border-cyan-800/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-cyan-800 dark:text-cyan-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Attending</span>
            <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-950 dark:text-cyan-200">
            {attendingCount}
          </div>
          <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold">Candidates Online</div>
        </div>

        {/* 6. Pending Submissions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {pendingSubmissions}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">In live pipeline</div>
        </div>

        {/* 7. Average Exam Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Score</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {averageScore}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">High performance</div>
        </div>
      </div>

      {/* Filter and Tab Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Exams ({totalScheduled})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>Live Now ({liveExams.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Upcoming ({upcomingExams.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Completed ({completedExams.length})
          </button>
        </div>

        {/* Search & Subject Dropdown Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, subject, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>

          <div className="relative w-full sm:w-auto shrink-0">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 pr-8 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] cursor-pointer"
            >
              {subjectOptions.map((subj) => (
                <option key={subj} value={subj}>
                  {subj === 'All' ? 'All Subjects' : subj}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Section 1: LIVE EXAMINATIONS (If any) */}
      {(activeTab === 'all' || activeTab === 'live') && liveExams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Active Live Examinations</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold">
                  Proctoring Active
                </span>
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Auto-updating every 5s
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  className="rounded-3xl p-6 bg-gradient-to-br from-white via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-2 border-emerald-400/80 dark:border-emerald-500/50 shadow-md relative overflow-hidden space-y-5"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Upcoming Scheduled Examinations</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                {upcomingExams.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Completed Examinations & Official Reports</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                {completedExams.length} Evaluated
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
};
