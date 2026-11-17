import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Award,
  ChevronRight,
  ShieldAlert,
  Search,
  Filter,
  BookOpen,
  Sparkles
} from 'lucide-react';

export const StudentExamsList = ({ onStartExam, onViewResult }) => {
  const {
    examinations,
    examAttempts,
    currentUser,
    startStudentExam
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'live', 'upcoming', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Find attempts by current logged-in student
  const studentAttempts = useMemo(() => {
    const sId = currentUser?.id || 'STU001';
    return examAttempts.filter((a) => a.studentId === sId);
  }, [examAttempts, currentUser]);

  // Group exams by status
  const liveExams = useMemo(() => examinations.filter((e) => e.status === 'Live Now'), [examinations]);
  const upcomingExams = useMemo(() => examinations.filter((e) => e.status === 'Upcoming'), [examinations]);
  const completedExams = useMemo(() => examinations.filter((e) => e.status === 'Completed'), [examinations]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return examinations.filter((exam) => {
      if (activeTab === 'live' && exam.status !== 'Live Now') return false;
      if (activeTab === 'upcoming' && exam.status !== 'Upcoming') return false;
      if (activeTab === 'completed' && exam.status !== 'Completed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          exam.title.toLowerCase().includes(q) ||
          exam.subjectName.toLowerCase().includes(q) ||
          (exam.code || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [examinations, activeTab, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-6 sm:p-8 text-white border border-[#145663]/60 shadow-[0_8px_32px_rgba(4,20,24,0.35)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Student Assessment Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Live & Scheduled Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome, <strong>{currentUser?.name || 'Student'}</strong>! Examinations unlock automatically during their scheduled availability windows. Please ensure a stable internet connection before launching.
          </p>
        </div>
      </div>

      {/* Navigation Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Examinations ({examinations.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Now ({liveExams.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Upcoming ({upcomingExams.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Completed & Scores ({completedExams.length})
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search examinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Examinations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredExams.map((exam) => {
          const isLive = exam.status === 'Live Now';
          const isUpcoming = exam.status === 'Upcoming';
          const isCompleted = exam.status === 'Completed';

          // Check if student already attempted
          const attempt = studentAttempts.find((a) => a.examId === exam.id);

          return (
            <div
              key={exam.id}
              className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between space-y-4 sm:space-y-5 relative overflow-hidden ${
                isLive
                  ? 'bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-2 border-emerald-400/90 shadow-md ring-4 ring-emerald-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md'
              }`}
            >
              {isLive && (
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              )}

              {/* Header Badge & Code */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  {isLive ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                      EXAMINATION LIVE
                    </span>
                  ) : isUpcoming ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      UPCOMING
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                      CONCLUDED
                    </span>
                  )}

                  <span className="text-xs font-mono font-bold text-slate-400">
                    {exam.code}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2.5 leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {exam.subjectName} • {exam.module}
                </p>
              </div>

              {/* Exam Info Grid */}
              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Testing Window</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {exam.startTime} – {exam.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Exam Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {exam.date}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Duration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {exam.durationMinutes} Minutes
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total / Pass Marks</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {exam.totalMarks}M / {exam.passingMarks}M
                  </span>
                </div>
              </div>

              {/* Status Note or Score Highlight */}
              {attempt ? (
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs flex items-center justify-between">
                  <span className="text-teal-900 dark:text-teal-200 font-bold">
                    Attempted: {attempt.score} / {attempt.totalMarks} Marks
                  </span>
                  <span className="font-extrabold text-teal-600 dark:text-teal-400">
                    {attempt.percentage}%
                  </span>
                </div>
              ) : isLive ? (
                <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Exam Window is Active! Click below to enter.</span>
                </div>
              ) : isUpcoming ? (
                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 text-xs text-blue-800 dark:text-blue-300 font-medium">
                  Opens at {exam.startTime} on {exam.date}.
                </div>
              ) : null}

              {/* Action Button */}
              <div>
                {attempt ? (
                  <button
                    onClick={() => onViewResult(attempt)}
                    className="w-full py-3 rounded-2xl bg-[#087F8C] hover:bg-[#0C6D7C] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Scorecard & Review</span>
                  </button>
                ) : isLive ? (
                  <button
                    onClick={() => onStartExam(exam.id)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-[0_4px_16px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95 animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Examination 🚀</span>
                  </button>
                ) : isUpcoming ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Locked Until {exam.startTime}</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Examination Concluded</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
