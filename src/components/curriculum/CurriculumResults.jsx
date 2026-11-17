import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Filter,
  Search,
  Download,
  Calendar,
  BarChart3,
  Percent,
  X,
  Target
} from 'lucide-react';

export const CurriculumResults = () => {
  const { currentRole, currentUser, curriculumAttempts, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Filter attempts based on role:
  // If Student, only show their own attempts; if Teacher, show all students' attempts
  const attempts = currentRole === 'teacher'
    ? curriculumAttempts || []
    : (curriculumAttempts || []).filter(
        (a) => a.studentId === (currentUser?.id || 'STU001')
      );

  const totalSubmissions = attempts.length;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + (Number(a.scorePct) || 0), 0) /
            totalSubmissions
        )
      : 0;
  const passCount = attempts.filter(
    (a) => a.status === 'Passed' || Number(a.scorePct) >= 60
  ).length;
  const passRate =
    totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      (att.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.moduleTitle || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      filterSubject === 'All' || att.subjectName === filterSubject;

    const isPassed = att.status === 'Passed' || Number(att.scorePct) >= 60;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Passed' && isPassed) ||
      (filterStatus === 'Failed' && !isPassed);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const uniqueSubjects = Array.from(
    new Set((attempts || []).map((a) => a.subjectName).filter(Boolean))
  );

  const subjectOptions = [
    { value: 'All', label: `All Subjects (${uniqueSubjects.length})` },
    ...uniqueSubjects.map((sub) => ({ value: sub, label: sub }))
  ];

  const statusOptions = [
    { value: 'All', label: 'All Results' },
    { value: 'Passed', label: 'Passed (≥60%)' },
    { value: 'Failed', label: 'Needs Practice (<60%)' }
  ];

  const handleExportCSV = () => {
    if (filteredAttempts.length === 0) {
      showToast('No attempts to export', 'info');
      return;
    }

    const headers = [
      'Attempt ID',
      'Student Name',
      'Subject',
      'Module',
      'Difficulty Mode',
      'Total Questions',
      'Correct Answers',
      'Score %',
      'Status',
      'Date'
    ];

    const rows = filteredAttempts.map((a) => [
      a.id,
      `"${a.studentName}"`,
      `"${a.subjectName}"`,
      `"${a.moduleTitle}"`,
      `"${a.difficultyMode}"`,
      a.totalQuestions,
      a.correctCount,
      `${a.scorePct}%`,
      a.status,
      `"${a.date}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CohesionTech_Quiz_Results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported results CSV successfully', 'success');
  };

  const getDifficultyColor = (mode) => {
    switch ((mode || '').toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'hard':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Modern App Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] text-white p-4 sm:p-6 border border-[#145663]/60 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/10 text-emerald-300 border border-white/10 backdrop-blur-xs">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentRole === 'teacher' ? 'Faculty Analytics' : 'Student Record'}</span>
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                Quiz Submissions & Performance
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1.5 tracking-tight">
              {currentRole === 'teacher'
                ? 'Student Quiz Submissions'
                : 'My Quiz Results & Scores'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              {currentRole === 'teacher'
                ? 'Real-time record of all student attempts across subjects with score breakdown.'
                : 'Your complete examination history across all subject modules and practice modes.'}
            </p>
          </div>

          {currentRole === 'teacher' && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all self-start md:self-auto shrink-0 border border-white/15 backdrop-blur-xs shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards - Mobile Optimized 2x2 Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Quizzes */}
        <div className="bg-white dark:bg-surface-darkCard p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3 transition-all hover:border-blue-400/50">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {totalSubmissions}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              {currentRole === 'teacher' ? 'Submissions' : 'Quizzes Taken'}
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white dark:bg-surface-darkCard p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3 transition-all hover:border-indigo-400/50">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {avgScore}%
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Average Score
            </div>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white dark:bg-surface-darkCard p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3 transition-all hover:border-emerald-400/50">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {passRate}%
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Pass Rate (≥60%)
            </div>
          </div>
        </div>

        {/* Subjects Assessed */}
        <div className="bg-white dark:bg-surface-darkCard p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3 transition-all hover:border-amber-400/50">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
              {uniqueSubjects.length}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Subjects Assessed
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar: 2-column dropdowns on mobile */}
      <div className="space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              currentRole === 'teacher'
                ? 'Search student, subject, or module...'
                : 'Search by subject or module...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07242B]/15 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Responsive filters: 2 columns on mobile */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 shrink-0">
          {uniqueSubjects.length > 0 && (
            <CustomDropdown
              value={filterSubject}
              onChange={setFilterSubject}
              options={subjectOptions}
              icon={BookOpen}
              className="w-full sm:w-48"
            />
          )}

          <CustomDropdown
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            icon={Filter}
            className="w-full sm:w-48"
          />
        </div>
      </div>

      {/* Results List */}
      {filteredAttempts.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white dark:bg-surface-darkCard rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
            No Quiz Attempts Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {currentRole === 'teacher'
              ? 'No student attempts matched your search or filter settings.'
              : 'You have not completed any quizzes matching these filters.'}
          </p>
          {(searchTerm || filterSubject !== 'All' || filterStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSubject('All');
                setFilterStatus('All');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttempts.map((att) => {
            const isPassed = att.status === 'Passed' || Number(att.scorePct) >= 60;
            const scoreNum = Number(att.scorePct) || 0;

            return (
              <div
                key={att.id}
                className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs hover:border-[#07242B]/30 dark:hover:border-slate-600 transition-all card-hover-lift"
              >
                {/* Top Row: Subject / Student & Status Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                  {currentRole === 'teacher' ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={att.studentAvatar}
                        alt={att.studentName}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {att.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {att.subjectName}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#07242B]/5 dark:bg-white/10 text-[#07242B] dark:text-emerald-400 border border-[#07242B]/10 dark:border-white/10 truncate max-w-[240px]">
                      <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#07242B] dark:text-emerald-400" />
                      <span className="truncate">{att.subjectName}</span>
                    </span>
                  )}

                  {/* High Contrast Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 ${
                      isPassed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>{isPassed ? 'PASSED' : 'NEEDS PRACTICE'}</span>
                  </span>
                </div>

                {/* Module Title */}
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mt-2.5 leading-snug">
                  {att.moduleTitle}
                </h3>

                {/* Score Section: Clean visual scorecard */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${
                        isPassed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {scoreNum}%
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {att.correctCount} of {att.totalQuestions} Questions Correct
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isPassed
                          ? 'Passed examination threshold'
                          : 'Below 60% passing criteria'}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block w-32 shrink-0">
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPassed ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, scoreNum))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Metadata: Difficulty, Time, Date */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] border ${getDifficultyColor(
                        att.difficultyMode
                      )}`}
                    >
                      <Target className="w-3 h-3" />
                      <span>{att.difficultyMode || 'Practice'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 font-mono font-medium text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{att.timeTaken}</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{att.date}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
