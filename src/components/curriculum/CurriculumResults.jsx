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
  X,
  Target,
  Layers,
  ChevronDown
} from 'lucide-react';

export const CurriculumResults = () => {
  const { currentRole, currentUser, curriculumAttempts, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter attempts based on role:
  // If Student, only show their own attempts; if Teacher, show all students' attempts
  const attempts = currentRole === 'teacher'
    ? curriculumAttempts || []
    : (curriculumAttempts || []).filter(
        (a) => a.studentId === (currentUser?.id || 'STU001')
      );

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      (att.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.moduleTitle || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      filterSubject === 'All' || att.subjectName === filterSubject;

    const matchesModule =
      filterModule === 'All' || att.moduleTitle === filterModule;

    const isPassed = att.status === 'Passed' || Number(att.scorePct) >= 60;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Passed' && isPassed) ||
      (filterStatus === 'Failed' && !isPassed);

    return matchesSearch && matchesSubject && matchesModule && matchesStatus;
  });

  const uniqueSubjects = Array.from(
    new Set((attempts || []).map((a) => a.subjectName).filter(Boolean))
  );

  const uniqueModules = Array.from(
    new Set(
      (attempts || [])
        .filter((a) => filterSubject === 'All' || a.subjectName === filterSubject)
        .map((a) => a.moduleTitle)
        .filter(Boolean)
    )
  );

  const subjectOptions = [
    { value: 'All', label: `All Courses (${uniqueSubjects.length})` },
    ...uniqueSubjects.map((sub) => ({ value: sub, label: sub }))
  ];

  const moduleOptions = [
    { value: 'All', label: `All Modules (${uniqueModules.length})` },
    ...uniqueModules.map((mod) => ({ value: mod, label: mod }))
  ];

  const statusOptions = [
    { value: 'All', label: 'All Results' },
    { value: 'Passed', label: 'Passed (≥60%)' },
    { value: 'Failed', label: 'Needs Practice (<60%)' }
  ];

  const filterFieldCount = 3; // Course, Module, Status
  const activeFilterCount = [
    filterSubject !== 'All',
    filterModule !== 'All',
    filterStatus !== 'All'
  ].filter(Boolean).length;

  const handleSubjectChange = (value) => {
    setFilterSubject(value);
    setFilterModule('All');
  };

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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Compact hero */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] text-white p-3.5 sm:p-6 border border-[#145663]/60 shadow-premium">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold uppercase tracking-wider bg-white/10 text-emerald-300 border border-white/10">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span>{currentRole === 'teacher' ? 'Analytics' : 'My Record'}</span>
            </span>
            <h1 className="text-base sm:text-3xl font-black text-white mt-1.5 tracking-tight leading-snug">
              {currentRole === 'teacher' ? (
                <>
                  <span className="sm:hidden">Quiz Submissions</span>
                  <span className="hidden sm:inline">Student Quiz Submissions</span>
                </>
              ) : (
                'My Quiz Results'
              )}
            </h1>
            <p className="hidden sm:block text-sm text-slate-300 mt-1 max-w-xl">
              {currentRole === 'teacher'
                ? 'Real-time record of all student attempts across subjects with score breakdown.'
                : 'Your complete examination history across modules and practice modes.'}
            </p>
          </div>

          {currentRole === 'teacher' && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="shrink-0 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] sm:text-xs inline-flex items-center gap-1.5 border border-white/15 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="sm:hidden">CSV</span>
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Search + collapsible Filters */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              currentRole === 'teacher'
                ? 'Search student, course, or module...'
                : 'Search by course or module...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]/50 shadow-subtle"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium overflow-hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className="w-full flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
          >
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filters</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F3F4] dark:bg-[#087F8C]/20 text-[#0C6D7C] dark:text-[#2DD4BF]">
              {activeFilterCount > 0
                ? `${activeFilterCount} active`
                : `${filterFieldCount} fields`}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 ml-auto shrink-0 transition-transform ${
                filtersOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {filtersOpen && (
            <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2.5 sm:space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <CustomDropdown
                  value={filterSubject}
                  onChange={handleSubjectChange}
                  options={subjectOptions}
                  icon={BookOpen}
                  className="w-full"
                  placeholder="Course"
                />
                <CustomDropdown
                  value={filterModule}
                  onChange={setFilterModule}
                  options={moduleOptions}
                  icon={Layers}
                  className="w-full"
                  placeholder="Module"
                />
                <CustomDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={statusOptions}
                  icon={Filter}
                  className="w-full"
                  placeholder="Status"
                />
              </div>
              {(filterSubject !== 'All' || filterModule !== 'All' || filterStatus !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterSubject('All');
                    setFilterModule('All');
                    setFilterStatus('All');
                  }}
                  className="text-xs font-bold text-[#087F8C] dark:text-[#2DD4BF] hover:underline"
                >
                  Clear filter fields
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results — 2 cards per row on mobile */}
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
          {(searchTerm || filterSubject !== 'All' || filterModule !== 'All' || filterStatus !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterSubject('All');
                setFilterModule('All');
                setFilterStatus('All');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
          {filteredAttempts.map((att) => {
            const isPassed = att.status === 'Passed' || Number(att.scorePct) >= 60;
            const scoreNum = Number(att.scorePct) || 0;

            return (
              <div
                key={att.id}
                className="h-full flex flex-col bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-subtle hover:border-[#087F8C]/40 dark:hover:border-slate-600 transition-all"
              >
                {/* Top Row: Subject / Student & Status Badge */}
                <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                  {currentRole === 'teacher' ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={att.studentAvatar}
                        alt={att.studentName}
                        className="w-8 h-8 sm:w-7 sm:h-7 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm sm:text-xs text-slate-900 dark:text-white truncate">
                          {att.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {att.subjectName}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs sm:text-[11px] font-bold bg-[#07242B]/5 dark:bg-white/10 text-[#07242B] dark:text-emerald-400 border border-[#07242B]/10 dark:border-white/10 truncate min-w-0">
                      <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#07242B] dark:text-emerald-400" />
                      <span className="truncate">{att.subjectName}</span>
                    </span>
                  )}

                  {/* High Contrast Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
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
                <h3 className="font-black text-base sm:text-sm text-slate-900 dark:text-white mt-3 sm:mt-2.5 leading-snug line-clamp-2 sm:min-h-[2.5rem]">
                  {att.moduleTitle}
                </h3>

                {/* Score Section */}
                <div className="mt-3 p-3.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2.5 flex-1">
                  <div className="flex items-center gap-3 sm:gap-2.5 min-w-0">
                    <div
                      className={`text-3xl sm:text-2xl font-black tracking-tight leading-none shrink-0 ${
                        isPassed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {scoreNum}%
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        {att.correctCount} of {att.totalQuestions} Correct
                      </div>
                      <div className="text-[11px] sm:text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {isPassed
                          ? 'Passed examination threshold'
                          : 'Below 60% passing criteria'}
                      </div>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPassed ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, scoreNum))}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Metadata: Difficulty, Time, Date */}
                <div className="flex items-center justify-between gap-2 mt-3.5 sm:mt-3 pt-1 sm:pt-2 text-xs sm:text-[11px] text-slate-400 dark:text-slate-500 flex-wrap">
                  <div className="flex items-center gap-2 sm:gap-1.5 flex-wrap min-w-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-lg sm:rounded-md font-bold text-[11px] sm:text-[10px] border ${getDifficultyColor(
                        att.difficultyMode
                      )}`}
                    >
                      <Target className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                      <span className="truncate max-w-[10rem] sm:max-w-[7rem]">{att.difficultyMode || 'Practice'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 font-mono font-medium text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-400" />
                      <span>{att.timeTaken}</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-400" />
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
