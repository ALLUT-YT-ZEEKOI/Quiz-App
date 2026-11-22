import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  BookOpen,
  FileQuestion,
  HelpCircle,
  CheckCircle,
  TrendingUp,
  Percent,
  Clock,
  Plus,
  Download,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Award,
  AlertTriangle,
  Eye
} from 'lucide-react';

export const TeacherDashboard = ({ onOpenAddQuestion, onOpenAddQuiz, onOpenAddStudent }) => {
  const {
    students,
    subjects,
    quizzes,
    questions,
    attempts,
    setActiveView,
    exportStudentsCSV,
    exportResultsCSV,
    setSelectedStudentForProfile
  } = useApp();

  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'month', 'semester'

  // Computed metrics
  const totalStudents = students.length;
  const activeCourses = subjects.length;
  const totalQuizzes = quizzes.length;
  const totalQuestions = questions.length;
  const completedAssessments = attempts.length;

  const passedAttempts = attempts.filter((a) => a.status === 'PASSED');
  const passPercentage = completedAssessments > 0
    ? ((passedAttempts.length / completedAssessments) * 100).toFixed(1)
    : 0;

  const averageScore = completedAssessments > 0
    ? (attempts.reduce((sum, a) => sum + a.percentage, 0) / completedAssessments).toFixed(1)
    : 0;

  // Score distribution counts
  const scoreDist = {
    top: attempts.filter((a) => a.percentage >= 90).length,
    high: attempts.filter((a) => a.percentage >= 75 && a.percentage < 90).length,
    mid: attempts.filter((a) => a.percentage >= 60 && a.percentage < 75).length,
    low: attempts.filter((a) => a.percentage < 60).length
  };

  // Recent 5 attempts
  const recentActivities = [...attempts]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Welcome & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-premium">
        <div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Admin & Faculty Portal • Civil Engineering Suite
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Admin Dashboard & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time monitoring of Civil Engineering students, IS-code aligned assessments, and performance benchmarks.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddQuiz}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>

          <button
            onClick={onOpenAddQuestion}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 active:scale-95 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>Add Question</span>
          </button>

          <button
            onClick={onOpenAddStudent}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 active:scale-95 transition-all"
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>Add Student</span>
          </button>

          <button
            onClick={exportResultsCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all"
            title="Export Assessment CSV"
          >
            <Download className="w-4 h-4" />
            <span className="sm:hidden">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Control Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-white dark:bg-surface-darkCard p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>Period:</span>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 sm:p-1 rounded-xl">
            {['all', 'semester', 'month'].map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all text-xs ${
                  dateFilter === f
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'semester' ? 'Semester' : 'Month'}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
          20 Civil Students Synced • Updated Live
        </div>
      </div>

      {/* Analytics Section: Subject Performance & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Subject-Wise Performance Breakdown (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-darkCard p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Subject-Wise Student Performance
                </h3>
                <p className="text-xs text-slate-500">
                  Average score (%) achieved across all 10 Civil disciplines
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 w-fit">
                Benchmark: 75%
              </span>
            </div>

            {/* Custom Bar List */}
            <div className="space-y-3 my-2">
              {subjects.map((sub) => (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {sub.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">({sub.code})</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono flex-shrink-0">
                      {sub.studentAvg}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        sub.studentAvg >= 85
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : sub.studentAvg >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${sub.studentAvg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Highest: Building Materials (86.1%)</span>
            <button
              onClick={() => setActiveView('subjects')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Syllabi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Score Distribution Breakdown (Span 1) */}
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5">
              Score Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Cohort grade distribution
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Distinction (90%–100%)
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    GATE Ready
                  </div>
                </div>
                <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                  {scoreDist.top}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-800 dark:text-blue-300">
                    First Class (75%–89%)
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400">
                    Solid Technical Mastery
                  </div>
                </div>
                <div className="text-lg font-extrabold text-blue-700 dark:text-blue-300 font-mono">
                  {scoreDist.high}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Second Class (60%–74%)
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400">
                    Passing Cutoff Met
                  </div>
                </div>
                <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                  {scoreDist.mid}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Remedial (&lt;60%)</span>
                  </div>
                  <div className="text-[10px] text-red-600 dark:text-red-400">
                    Needs Mentoring
                  </div>
                </div>
                <div className="text-lg font-extrabold text-red-700 dark:text-red-300 font-mono">
                  {scoreDist.low}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveView('results')}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              <span>Explore Results Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Student Submissions & Upcoming Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Submissions (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-darkCard p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Recent Student Submissions
              </h3>
              <p className="text-xs text-slate-500">
                Latest evaluations from online assessments
              </p>
            </div>
            <button
              onClick={() => setActiveView('results')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              All ({attempts.length})
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Student</th>
                  <th className="pb-3">Quiz Title</th>
                  <th className="pb-3 text-center">Score</th>
                  <th className="pb-3 text-center">Percentage</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivities.map((att) => {
                  const studentObj = students.find((s) => s.id === att.studentId);
                  return (
                    <tr
                      key={att.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 pl-2">
                        <div
                          onClick={() => {
                            if (studentObj) setSelectedStudentForProfile(studentObj);
                          }}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <img
                            src={studentObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                            alt={att.studentName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600">
                              {att.studentName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {att.rollNumber || att.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 max-w-[180px]">
                        <div className="truncate font-medium text-slate-700 dark:text-slate-300">
                          {att.quizTitle}
                        </div>
                        <div className="text-[10px] text-slate-400">{att.subjectId}</div>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {att.score} / {att.totalMarks}
                      </td>
                      <td className="py-3 text-center font-bold">
                        <span
                          className={
                            att.percentage >= 80
                              ? 'text-emerald-600'
                              : att.percentage >= 60
                              ? 'text-blue-600'
                              : 'text-red-500'
                          }
                        >
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => setActiveView('results')}
                          className="px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 font-semibold"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Alternative (App Style) */}
          <div className="md:hidden space-y-2.5">
            {recentActivities.map((att) => {
              const studentObj = students.find((s) => s.id === att.studentId);
              return (
                <div
                  key={att.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={studentObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={att.studentName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {att.studentName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {att.quizTitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                        {att.score}/{att.totalMarks}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          att.status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {att.status}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveView('results')}
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Scheduled Assessments Card (Span 1) */}
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Upcoming Tests
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">
                Sem VI
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-blue-100 dark:border-slate-800 bg-blue-50/30 dark:bg-slate-900/40">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Structural Analysis
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    In 2 Days
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                  Plastic Theory Assessment
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Batch: 2022–2026 • 20 Marks
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    RCC Design
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    Monday
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                  IS 456 Limit State Design Quiz 2
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Batch: 2022–2026 • 15 Marks
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
            <button
              onClick={onOpenAddQuiz}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
