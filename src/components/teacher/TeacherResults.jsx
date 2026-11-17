import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import {
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  BarChart3,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  X,
  BookOpen
} from 'lucide-react';

export const TeacherResults = () => {
  const { attempts, quizzes, subjects, questions, students, exportResultsCSV } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuizFilter, setSelectedQuizFilter] = useState('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Review modal state
  const [reviewAttemptItem, setReviewAttemptItem] = useState(null);

  // Computed summary metrics
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.status === 'PASSED');
  const passRate = totalAttempts > 0 ? ((passedAttempts.length / totalAttempts) * 100).toFixed(1) : 0;

  const highestScore = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  const lowestScore = totalAttempts > 0 ? Math.min(...attempts.map((a) => a.percentage)) : 0;

  const avgTimeSeconds =
    totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0) / totalAttempts)
      : 0;

  // Filter attempts
  const filteredAttempts = attempts.filter((a) => {
    const matchesSearch =
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.rollNumber && a.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.quizTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuiz = selectedQuizFilter === 'All' || a.quizId === selectedQuizFilter;
    const matchesSub = selectedSubjectFilter === 'All' || a.subjectId === selectedSubjectFilter;
    const matchesStatus = selectedStatusFilter === 'All' || a.status === selectedStatusFilter;

    return matchesSearch && matchesQuiz && matchesSub && matchesStatus;
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Assessment Results & Grade Audit
            </h1>
            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold font-mono">
              {totalAttempts} Submissions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Individual student response logs, item analysis, pass/fail ratios, and grade audits.
          </p>
        </div>

        <button
          onClick={exportResultsCSV}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export All Results (.CSV)</span>
        </button>
      </div>

      {/* 4 Summary Highlight Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span>Pass Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-navy-900 dark:text-white font-mono">
            {passRate}%
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-0.5 truncate">
            {passedAttempts.length} of {totalAttempts} Passed
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span>Highest Mark</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {highestScore}%
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Top cohort 100%</div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span>Lowest Mark</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 font-mono">
            {lowestScore}%
          </div>
          <div className="text-[10px] sm:text-[11px] text-red-500 mt-0.5 truncate">For remedial review</div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span>Avg Time</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {Math.floor(avgTimeSeconds / 60)}m {avgTimeSeconds % 60}s
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Under 15m limit</div>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-3.5 sm:p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, roll number, or quiz..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CustomDropdown
            value={selectedQuizFilter}
            onChange={setSelectedQuizFilter}
            options={[
              { value: 'All', label: 'All Quizzes' },
              ...quizzes.map((q) => ({ value: q.id, label: q.title }))
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          <CustomDropdown
            value={selectedSubjectFilter}
            onChange={setSelectedSubjectFilter}
            options={[
              { value: 'All', label: 'All Subjects' },
              ...subjects.map((s) => ({ value: s.id, label: s.code }))
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          <CustomDropdown
            value={selectedStatusFilter}
            onChange={setSelectedStatusFilter}
            options={[
              { value: 'All', label: 'All Results' },
              { value: 'PASSED', label: 'Passed' },
              { value: 'FAILED', label: 'Failed' }
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          {(searchTerm ||
            selectedQuizFilter !== 'All' ||
            selectedSubjectFilter !== 'All' ||
            selectedStatusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedQuizFilter('All');
                setSelectedSubjectFilter('All');
                setSelectedStatusFilter('All');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-1 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Desktop Detailed Results Table */}
      <div className="hidden md:block bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 pl-5">Student</th>
                <th className="py-3.5">Quiz & Subject</th>
                <th className="py-3.5 text-center">Score / Total</th>
                <th className="py-3.5 text-center">Percentage</th>
                <th className="py-3.5 text-center">Time Spent</th>
                <th className="py-3.5 text-center">Submitted At</th>
                <th className="py-3.5 text-center">Result</th>
                <th className="py-3.5 pr-5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No student results found matching your current filter.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att) => {
                  const studentObj = students.find((s) => s.id === att.studentId);
                  return (
                    <tr
                      key={att.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              studentObj?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                            }
                            alt={att.studentName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {att.studentName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {att.rollNumber || att.studentId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 max-w-[200px]">
                        <div className="truncate font-semibold text-slate-800 dark:text-slate-200">
                          {att.quizTitle}
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                          {att.subjectId}
                        </div>
                      </td>

                      <td className="py-3.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {att.score} / {att.totalMarks}
                      </td>

                      <td className="py-3.5 text-center font-mono font-bold">
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

                      <td className="py-3.5 text-center font-mono text-slate-600 dark:text-slate-400">
                        {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                      </td>

                      <td className="py-3.5 text-center font-mono text-[11px] text-slate-400">
                        {new Date(att.submittedAt).toLocaleDateString()}{' '}
                        {new Date(att.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>

                      <td className="py-3.5 pr-5 text-right">
                        <button
                          onClick={() => setReviewAttemptItem(att)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Alternative (Native App Card List) */}
      <div className="md:hidden space-y-3">
        {filteredAttempts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            No results match your search filters.
          </div>
        ) : (
          filteredAttempts.map((att) => {
            const studentObj = students.find((s) => s.id === att.studentId);
            return (
              <div
                key={att.id}
                className="p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={
                        studentObj?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                      }
                      alt={att.studentName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {att.studentName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {att.rollNumber || att.studentId}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      att.status === 'PASSED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {att.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {att.quizTitle}
                </div>

                <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {att.score}/{att.totalMarks}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">Percentage</span>
                    <span
                      className={`font-bold ${
                        att.percentage >= 80 ? 'text-emerald-600' : 'text-blue-600'
                      }`}
                    >
                      {att.percentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">Time</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono">
                    {new Date(att.submittedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => setReviewAttemptItem(att)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Audit Answers</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Question-by-Question Student Review Modal */}
      {reviewAttemptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-navy-950 to-navy-900 text-white">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                  Assessment Audit & Answer Key
                </div>
                <h3 className="font-bold text-sm sm:text-base mt-0.5 line-clamp-1">
                  {reviewAttemptItem.quizTitle}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                  <span>Student: <strong>{reviewAttemptItem.studentName}</strong></span>
                  <span>•</span>
                  <span>Score: <strong>{reviewAttemptItem.percentage}%</strong></span>
                </div>
              </div>

              <button
                onClick={() => setReviewAttemptItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions breakdown */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {(() => {
                const targetQuiz = quizzes.find((q) => q.id === reviewAttemptItem.quizId);
                const qIds = targetQuiz ? targetQuiz.questionIds : Object.keys(reviewAttemptItem.answers || {});

                return qIds.map((qId, index) => {
                  const qObj = questions.find((q) => q.id === qId);
                  if (!qObj) return null;

                  const studentSelected = reviewAttemptItem.answers[qId];
                  const isCorrect = studentSelected === qObj.correctAnswer;
                  const isUnanswered = studentSelected === undefined || studentSelected === null;

                  return (
                    <div
                      key={qId}
                      className={`p-3.5 sm:p-4 rounded-2xl border ${
                        isCorrect
                          ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20'
                          : 'border-red-200 dark:border-red-800/60 bg-red-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          Question {index + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isCorrect ? 'Correct (+1 Mark)' : isUnanswered ? 'Unanswered (0)' : 'Incorrect (0)'}
                        </span>
                      </div>

                      <p className="font-semibold text-slate-900 dark:text-white mb-3">
                        {qObj.questionText}
                      </p>

                      <div className="space-y-1.5 text-xs">
                        {qObj.options.map((opt, optIndex) => {
                          const wasChosenByStudent = studentSelected === optIndex;
                          const isTheActualKey = optIndex === qObj.correctAnswer;

                          let optionClass = 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300';
                          if (isTheActualKey) {
                            optionClass = 'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                          } else if (wasChosenByStudent && !isTheActualKey) {
                            optionClass = 'border-red-500 bg-red-100/60 dark:bg-red-950/60 text-red-900 dark:text-red-200 font-bold line-through';
                          }

                          return (
                            <div
                              key={optIndex}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${optionClass}`}
                            >
                              <span>
                                {String.fromCharCode(65 + optIndex)}. {opt}
                              </span>
                              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                {wasChosenByStudent && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-sans">
                                    Student Choice
                                  </span>
                                )}
                                {isTheActualKey && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-sans">
                                    Correct Key
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {qObj.explanation && (
                        <div className="mt-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed border border-blue-100 dark:border-blue-900/40">
                          <strong className="text-blue-700 dark:text-blue-400 mr-1.5">
                            Reference Explanation:
                          </strong>
                          {qObj.explanation}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setReviewAttemptItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
