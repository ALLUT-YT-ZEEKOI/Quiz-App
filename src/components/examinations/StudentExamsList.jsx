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
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const StudentExamsList = ({ onStartExam, onViewResult }) => {
  const {
    examinations,
    examAttempts,
    currentUser,
    startStudentExam,
    getRetestFor
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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Student Welcome Banner — compact on mobile */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-3 sm:p-7 text-white border border-[#145663]/60 shadow-premium sm:shadow-[0_8px_32px_rgba(4,20,24,0.35)]">
        <div className="absolute -right-10 -top-10 w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>Assessment Portal</span>
            </div>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              Hi, {currentUser?.name || 'Student'}! 👋
            </span>
          </div>

          <h1 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
            Live & Scheduled Examinations
          </h1>

          {/* Description — desktop only */}
          <p className="hidden sm:block text-sm text-slate-300 max-w-2xl leading-relaxed">
            Examinations unlock automatically during scheduled windows. Ensure a stable network before launching.
          </p>

          {/* Metrics — desktop only (counts already in filter tabs) */}
          <div className="hidden sm:flex items-center gap-2 pt-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{liveExams.length} Live Now</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{upcomingExams.length} Upcoming</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 text-slate-300 border border-white/15 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
              <span>{completedExams.length} Concluded</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs & Search — theme colors + shade */}
      <div className="flex flex-col gap-3 sm:gap-3.5 p-3 sm:p-3.5 md:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        {/* All tabs in one row on mobile */}
        <div className="grid grid-cols-4 gap-1 p-1 sm:p-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-[#E8F3F4] dark:bg-slate-800/80 border border-[#087F8C]/15 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`min-h-[2.5rem] px-2.5 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
            }`}
          >
            All ({examinations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`min-h-[2.5rem] px-2.5 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'live'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                activeTab === 'live' ? 'bg-white animate-pulse' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>Live ({liveExams.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`min-h-[2.5rem] px-2.5 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
            }`}
          >
            Upcoming ({upcomingExams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`min-h-[2.5rem] px-2.5 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-[#07242B] text-white shadow-md shadow-[#07242B]/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className="md:hidden">Done ({completedExams.length})</span>
            <span className="hidden md:inline truncate">Completed ({completedExams.length})</span>
          </button>
        </div>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search examinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 shadow-subtle focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]/50"
          />
        </div>
      </div>

      {/* Examinations Cards Grid — 1 card per row on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredExams.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 col-span-full">
            <Radio className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              No Examinations Found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? `No examinations matched "${searchQuery}".` : 'There are no examinations under this category right now.'}
            </p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const isLive = exam.status === 'Live Now';
            const isUpcoming = exam.status === 'Upcoming';
            const isCompleted = exam.status === 'Completed';

            // Check if student already attempted
            const attempt = studentAttempts.find((a) => a.examId === exam.id); // latest (newest first)
            const retest = attempt ? getRetestFor(currentUser?.id || 'STU001', exam.id) : null;

            return (
              <div
                key={exam.id}
                className={`h-full p-3 sm:p-5 pt-4 sm:pt-6 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col relative overflow-hidden group ${
                  isLive
                    ? 'bg-gradient-to-br from-white via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-emerald-400 shadow-md ring-4 ring-emerald-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-teal-500/30'
                }`}
              >
                {isLive && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Accent top gradient line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isLive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : isUpcoming
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />

                {/* Top Row: Badge & Code */}
                <div className="shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    {isLive ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                        <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                        LIVE TELEMETRY
                      </span>
                    ) : isUpcoming ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-200 dark:border-cyan-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-600" />
                        UPCOMING
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                        CONCLUDED
                      </span>
                    )}

                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                      {exam.code}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg mt-2 leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {exam.subjectName} • {exam.module}
                  </p>
                </div>

                {/* Key Details Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs mt-3.5 sm:mt-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Date & Time</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block text-[11px] font-mono">
                        {exam.date} • {exam.startTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Duration</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                        {exam.durationMinutes} Minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Total / Pass</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                        {exam.totalMarks}M ({exam.passingMarks}M Pass)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-100/70 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Subject</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                        {exam.subjectName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Note or Score Highlight — grows so action stays bottom-aligned */}
                <div className="flex-1 flex flex-col justify-end mt-3.5 sm:mt-4 min-h-[2.75rem]">
                  {attempt ? (
                    <div className="space-y-1.5">
                      <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs flex items-center justify-between">
                        <span className="text-teal-900 dark:text-teal-200 font-bold">
                          Score: {attempt.score} / {attempt.totalMarks} Marks
                          {attempt.isRetest && <span className="ml-1 text-[10px] text-violet-600 dark:text-violet-300">(Retest)</span>}
                        </span>
                        <span className="font-black text-teal-600 dark:text-teal-400 text-xs px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 shadow-2xs">
                          {attempt.percentage}%
                        </span>
                      </div>
                      {retest && (
                        <div
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                            retest.status === 'granted'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                          {retest.status === 'granted' ? 'Retest enabled by the admin' : 'Retest requested, waiting for admin'}
                        </div>
                      )}
                    </div>
                  ) : isLive ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200/80 text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>Exam Window is Active! Click below to enter.</span>
                    </div>
                  ) : isUpcoming ? (
                    <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 text-xs text-blue-800 dark:text-blue-300 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Opens at {exam.startTime} on {exam.date}.</span>
                    </div>
                  ) : null}
                </div>

                {/* Action Button */}
                <div className="mt-3.5 sm:mt-4 shrink-0">
                  {attempt && retest?.status === 'granted' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onStartExam(exam.id)}
                        className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Start Retest</span>
                      </button>
                      <button
                        onClick={() => onViewResult(attempt)}
                        className="px-3 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="View previous scorecard"
                      >
                        <Award className="w-4 h-4" />
                        <span className="hidden sm:inline">Scorecard</span>
                      </button>
                    </div>
                  ) : attempt ? (
                    <button
                      onClick={() => onViewResult(attempt)}
                      className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Scorecard & Review</span>
                    </button>
                  ) : isLive ? (
                    <button
                      onClick={() => onStartExam(exam.id)}
                      className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-[0_4px_16px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95 animate-pulse cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Examination 🚀</span>
                    </button>
                  ) : isUpcoming ? (
                    <button
                      disabled
                      className="w-full py-2.5 sm:py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Locked Until {exam.startTime}</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 sm:py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Examination Concluded</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
