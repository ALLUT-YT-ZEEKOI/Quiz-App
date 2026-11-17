import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import { PageHeader } from '../common/PageHeader';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Eye,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const ExamResultsAnalytics = ({ examId, onBack, onInspectStudent }) => {
  const {
    examinations,
    examAttempts,
    exportExamResultsCSV,
    showToast
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState(examId || 'EXAM-2026-006');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Passed', 'Failed'
  const [inspectedAttempt, setInspectedAttempt] = useState(null);

  // Active Exam
  const exam = useMemo(() => {
    return examinations.find((e) => e.id === selectedExamId) || examinations[0];
  }, [examinations, selectedExamId]);

  // Attempts for selected exam
  const attempts = useMemo(() => {
    return examAttempts.filter((a) => a.examId === selectedExamId);
  }, [examAttempts, selectedExamId]);

  // Sorted by score descending for ranking
  const rankedAttempts = useMemo(() => {
    return [...attempts].sort((a, b) => b.score - a.score);
  }, [attempts]);

  // Analytics Metrics
  const totalSubmissions = attempts.length;
  const avgScore = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    const sum = attempts.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((sum / totalSubmissions) * 10) / 10;
  }, [attempts, totalSubmissions]);

  const avgPct = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    const sum = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round(sum / totalSubmissions);
  }, [attempts, totalSubmissions]);

  const highestScore = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    return Math.max(...attempts.map((a) => a.score));
  }, [attempts, totalSubmissions]);

  const lowestScore = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    return Math.min(...attempts.map((a) => a.score));
  }, [attempts, totalSubmissions]);

  const passRate = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    const passed = attempts.filter((a) => a.passed).length;
    return Math.round((passed / totalSubmissions) * 100);
  }, [attempts, totalSubmissions]);

  // Score Distribution Buckets (90-100%, 75-89%, 60-74%, <60%)
  const distribution = useMemo(() => {
    let tier1 = 0; // 90-100%
    let tier2 = 0; // 75-89%
    let tier3 = 0; // 60-74%
    let tier4 = 0; // < 60%

    attempts.forEach((a) => {
      if (a.percentage >= 90) tier1++;
      else if (a.percentage >= 75) tier2++;
      else if (a.percentage >= 60) tier3++;
      else tier4++;
    });

    return [
      { label: '90–100% (Distinction)', count: tier1, color: 'bg-emerald-500' },
      { label: '75–89% (First Class)', count: tier2, color: 'bg-teal-500' },
      { label: '60–74% (Second Class)', count: tier3, color: 'bg-blue-500' },
      { label: '< 60% (Below Benchmark)', count: tier4, color: 'bg-amber-500' }
    ];
  }, [attempts]);

  // Difficulty Analysis
  const difficultyAnalysis = useMemo(() => {
    return [
      { level: 'Easy Questions (10 Qs)', avgAccuracy: 92, benchmark: 85, color: 'text-emerald-600' },
      { level: 'Medium Questions (14 Qs)', avgAccuracy: 78, benchmark: 70, color: 'text-amber-600' },
      { level: 'Hard Analytical Qs (6 Qs)', avgAccuracy: 64, benchmark: 55, color: 'text-red-600' }
    ];
  }, []);

  // Filtered rows
  const filteredRankings = useMemo(() => {
    return rankedAttempts.filter((a) => {
      if (filterStatus === 'Passed' && !a.passed) return false;
      if (filterStatus === 'Failed' && a.passed) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.studentName.toLowerCase().includes(q) ||
          (a.studentRollNo || '').toLowerCase().includes(q) ||
          (a.batch || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rankedAttempts, filterStatus, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header & Breadcrumbs: App Header Style */}
      <PageHeader
        onBack={onBack}
        backLabel="Back to Dashboard"
        title="Examination Performance & Analytics"
        subtitle={`${exam?.code || 'EX-EVAL'} • Official Report • ${exam?.title}`}
        badge={
          <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold uppercase tracking-wider border border-teal-300 dark:border-teal-800">
            OFFICIAL REPORT
          </span>
        }
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <CustomDropdown
              options={examinations.map((ex) => ({
                value: ex.id,
                label: ex.code ? `${ex.code} – ${ex.title.length > 32 ? ex.title.slice(0, 32) + '...' : ex.title}` : ex.title,
                badge: ex.status
              }))}
              value={selectedExamId}
              onChange={setSelectedExamId}
              size="sm"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => exportExamResultsCSV(selectedExamId)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#087F8C] hover:bg-[#0C6D7C] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print Report</span>
              </button>
            </div>
          </div>
        }
      />

      {/* KPI Overview Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Submissions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Submissions</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalSubmissions} / 21
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">100% Turnout</div>
        </div>

        {/* Average Marks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Score</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#087F8C] dark:text-[#2DD4BF]">
            {avgScore} <span className="text-xs text-slate-400">/ 30 ({avgPct}%)</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Standard dev ±2.8</div>
        </div>

        {/* Highest Score */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-300 dark:border-emerald-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
            <span className="text-[10px] font-bold uppercase tracking-wider">Top Score</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">
            {highestScore} <span className="text-xs text-emerald-600 font-normal">/ 30</span>
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
            {Math.round((highestScore / 30) * 100)}% (Gold Medal)
          </div>
        </div>

        {/* Lowest Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Lowest Score</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {lowestScore} <span className="text-xs text-slate-400">/ 30</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {Math.round((lowestScore / 30) * 100)}% Passing threshold
          </div>
        </div>

        {/* Pass Percentage */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {passRate}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Min 15 Marks (50%)</div>
        </div>
      </div>

      {/* Analytics Charts Grid: Score Distribution & Difficulty-Wise Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Score Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Score Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Candidate bracket distribution across all 21 submissions
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-teal-600" />
          </div>

          <div className="space-y-3 pt-2">
            {distribution.map((tier) => {
              const pct = totalSubmissions > 0 ? Math.round((tier.count / totalSubmissions) * 100) : 0;
              return (
                <div key={tier.label} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{tier.label}</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {tier.count} Students ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tier.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Difficulty-wise Performance Analysis */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Difficulty-Wise Performance
              </h3>
              <p className="text-xs text-slate-400">
                Cohort accuracy benchmarked by technical question complexity
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#087F8C]" />
          </div>

          <div className="space-y-3 pt-2">
            {difficultyAnalysis.map((item) => (
              <div key={item.level} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{item.level}</span>
                  <span className={`font-mono font-extrabold ${item.color}`}>
                    {item.avgAccuracy}% Accuracy (Goal {item.benchmark}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] transition-all duration-500"
                    style={{ width: `${item.avgAccuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Insight: Students showed highest mastery on <strong>Euler Crippling Loads</strong> and <strong>Moment Distribution Carry-Over</strong> factors.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Ranking Table */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          {['All', 'Passed', 'Failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === f
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {f} ({f === 'All' ? totalSubmissions : f === 'Passed' ? attempts.filter(a => a.passed).length : attempts.filter(a => !a.passed).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Mobile Ranking Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filteredRankings.map((attempt, idx) => {
          const rank = idx + 1;
          return (
            <div
              key={attempt.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="shrink-0">
                    {rank === 1 ? (
                      <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold flex items-center justify-center text-xs">
                        🥇 1
                      </span>
                    ) : rank === 2 ? (
                      <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center text-xs">
                        🥈 2
                      </span>
                    ) : rank === 3 ? (
                      <span className="w-7 h-7 rounded-full bg-amber-200/60 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-extrabold flex items-center justify-center text-xs">
                        🥉 3
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-500 text-xs flex items-center justify-center">
                        #{rank}
                      </span>
                    )}
                  </div>
                  <img
                    src={attempt.avatar}
                    alt={attempt.studentName}
                    className="w-9 h-9 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {attempt.studentName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {attempt.studentRollNo} • {attempt.batch}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                    attempt.passed
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                      : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200'
                  }`}
                >
                  {attempt.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              {/* Score & Accuracy metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Score Obtained</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                    {attempt.score}
                  </span>
                  <span className="text-slate-400 text-[10px]"> / 30 ({attempt.percentage}%)</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Breakdown</span>
                  <div className="font-mono text-xs font-bold pt-0.5">
                    <span className="text-emerald-600">{attempt.correctCount}C</span> /{' '}
                    <span className="text-red-500">{attempt.incorrectCount}W</span> /{' '}
                    <span className="text-slate-400">{attempt.unattemptedCount}U</span>
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-mono">Time: {attempt.timeSpentMinutes} mins</span>
                <button
                  type="button"
                  onClick={() => setInspectedAttempt(attempt)}
                  className="px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold hover:bg-teal-100 transition-colors"
                >
                  View Scorecard
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Ranking & Scorecard Table (Desktop & Tablet >= md) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-3">Batch</th>
                <th className="py-3.5 px-3">Score (30 M)</th>
                <th className="py-3.5 px-3">Percentage</th>
                <th className="py-3.5 px-4">Breakdown (C / W / U)</th>
                <th className="py-3.5 px-3">Time Spent</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredRankings.map((attempt, idx) => {
                const rank = idx + 1;
                const isMedal = rank <= 3;

                return (
                  <tr
                    key={attempt.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4">
                      {rank === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold flex items-center justify-center text-xs">
                          🥇 1
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold flex items-center justify-center text-xs">
                          🥈 2
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-200/60 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-extrabold flex items-center justify-center text-xs">
                          🥉 3
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-slate-500 pl-2">
                          #{rank}
                        </span>
                      )}
                    </td>

                    {/* Student Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={attempt.avatar}
                          alt={attempt.studentName}
                          className="w-8 h-8 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {attempt.studentName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {attempt.studentRollNo}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      {attempt.batch} ({attempt.semester})
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                        {attempt.score}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-0.5">/ 30</span>
                    </td>

                    {/* Percentage */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-extrabold font-mono ${
                          attempt.percentage >= 80
                            ? 'text-emerald-600'
                            : attempt.percentage >= 60
                            ? 'text-teal-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {attempt.percentage}%
                      </span>
                    </td>

                    {/* Breakdown */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-emerald-600 font-bold" title="Correct">
                        {attempt.correctCount}C
                      </span>{' '}
                      /{' '}
                      <span className="text-red-500 font-bold" title="Incorrect">
                        {attempt.incorrectCount}W
                      </span>{' '}
                      /{' '}
                      <span className="text-slate-400 font-bold" title="Unattempted">
                        {attempt.unattemptedCount}U
                      </span>
                    </td>

                    {/* Time Spent */}
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {attempt.timeSpentMinutes} mins
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          attempt.passed
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {attempt.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectedAttempt(attempt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#087F8C] text-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#087F8C] dark:hover:text-white text-xs font-bold transition-all"
                      >
                        Scorecard
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Student Attempt Scorecard Modal */}
      {inspectedAttempt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={inspectedAttempt.avatar}
                  alt={inspectedAttempt.studentName}
                  className="w-10 h-10 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {inspectedAttempt.studentName} – Scorecard
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {inspectedAttempt.studentRollNo} • {inspectedAttempt.batch}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectedAttempt(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Scorecard Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Score</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {inspectedAttempt.score} / 30
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Percentage</span>
                <span className="text-xl font-extrabold text-teal-600">
                  {inspectedAttempt.percentage}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Spent</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {inspectedAttempt.timeSpentMinutes}m
                </span>
              </div>
            </div>

            <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-200 flex items-center justify-between">
              <div>
                <strong>Correct:</strong> {inspectedAttempt.correctCount} |{' '}
                <strong>Incorrect:</strong> {inspectedAttempt.incorrectCount} |{' '}
                <strong>Unattempted:</strong> {inspectedAttempt.unattemptedCount}
              </div>
              <span className="font-bold font-mono">
                {inspectedAttempt.passed ? 'STATUS: PASSED ✅' : 'STATUS: FAILED ❌'}
              </span>
            </div>

            <button
              onClick={() => setInspectedAttempt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200"
            >
              Close Scorecard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
