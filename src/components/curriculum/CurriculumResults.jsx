import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  Filter,
  Search,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Percent
} from 'lucide-react';

export const CurriculumResults = () => {
  const { currentRole, currentUser, curriculumAttempts, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');

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

    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = Array.from(
    new Set((attempts || []).map((a) => a.subjectName).filter(Boolean))
  );

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                currentRole === 'teacher'
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                  : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
              }`}
            >
              {currentRole === 'teacher' ? 'Faculty Analytics' : 'Student Record'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Quiz Submissions & Attendance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {currentRole === 'teacher'
              ? 'Student Quiz Submissions'
              : 'My Quiz Results & Scores'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {currentRole === 'teacher'
              ? 'Real-time record of all student attempts across subjects (Malayalam, English, Civil, Math) with Easy, Medium, and Hard scores.'
              : 'Your complete examination history across all subject modules and practice modes.'}
          </p>
        </div>

        {currentRole === 'teacher' && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all self-start md:self-auto shrink-0 border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 card-hover-lift">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {totalSubmissions}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {currentRole === 'teacher' ? 'Submissions' : 'Quizzes Taken'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 card-hover-lift">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {avgScore}%
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average Score
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 card-hover-lift">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {passRate}%
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pass Rate (≥60%)
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 card-hover-lift">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
              {uniqueSubjects.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Subjects Assessed
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, subject, or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {uniqueSubjects.length > 0 && (
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 focus:outline-none"
          >
            <option value="All">All Subjects ({uniqueSubjects.length})</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results Table & Cards */}
      {filteredAttempts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No Quiz Attempts Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {currentRole === 'teacher'
              ? 'Students have not submitted any module quizzes matching your search criteria yet.'
              : 'You have not completed any module quizzes yet. Open a subject to start learning!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttempts.map((att) => {
            const isPassed = att.status === 'Passed';

            return (
              <div
                key={att.id}
                className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-400 card-hover-lift transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={att.studentAvatar}
                    alt={att.studentName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {att.studentName}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {att.subjectName}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {att.moduleTitle}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {att.difficultyMode}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {att.timeTaken}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {att.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      {att.scorePct}%
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {att.correctCount}/{att.totalQuestions} Correct
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isPassed
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{att.status}</span>
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
