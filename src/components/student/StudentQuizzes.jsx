import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import {
  Search,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  Filter,
  Percent,
  Check
} from 'lucide-react';

export const StudentQuizzes = () => {
  const { quizzes, subjects, attempts, currentUser, setActiveQuizForAttempt, setActiveView } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Filter only published quizzes for students
  const publishedQuizzes = quizzes.filter((q) => q.status === 'Published');

  const filteredQuizzes = publishedQuizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSub = selectedSubject === 'All' || q.subjectId === selectedSubject;
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesSub && matchesDiff;
  });

  const handleStartExam = (quiz) => {
    setActiveQuizForAttempt(quiz);
    setActiveView('quiz-attempt');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Civil Engineering Online Examination Portal
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold font-mono">
              {publishedQuizzes.length} Tests Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Strict timed assessments with verified IS code solutions and instant performance feedback.
          </p>
        </div>
      </div>

      {/* Search and Filters Ribbon */}
      <div className="p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quizzes by title or civil subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CustomDropdown
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={[
              { value: 'All', label: 'All Subjects' },
              ...subjects.map((sub) => ({ value: sub.id, label: `${sub.code}: ${sub.name}` }))
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          <CustomDropdown
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
            options={[
              { value: 'All', label: 'All Difficulties' },
              { value: 'Easy', label: 'Easy' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Hard', label: 'Hard' }
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          {(searchTerm || selectedSubject !== 'All' || selectedDifficulty !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('All');
                setSelectedDifficulty('All');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Quick Subject Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setSelectedSubject('All')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedSubject === 'All'
              ? 'bg-navy-900 text-white dark:bg-blue-600 shadow-sm'
              : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          All 10 Subjects ({publishedQuizzes.length} Quizzes)
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setSelectedSubject(sub.id)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedSubject === sub.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
            <span>{sub.name}</span>
          </button>
        ))}
      </div>

      {/* Quizzes — 1 card per row on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 text-xs">
            No quizzes match your current search filters.
          </div>
        ) : (
          filteredQuizzes.map((quiz) => {
            // Check student's prior attempt
            const studentAttempts = attempts.filter(
              (a) => a.studentId === currentUser?.id && a.quizId === quiz.id
            );
            const latestAttempt = studentAttempts[0];

            return (
              <div
                key={quiz.id}
                className="p-3 sm:p-6 bg-white dark:bg-surface-darkCard rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between space-y-3 sm:space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {quiz.subjectName}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        quiz.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : quiz.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {quiz.difficulty} Level
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {quiz.description}
                  </p>

                  {/* Criteria Badge Tiles */}
                  <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Questions</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {quiz.questionIds.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Marks</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {quiz.totalMarks}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Duration</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {quiz.durationMinutes}m
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pass Cutoff</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {quiz.passingScorePct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with Attempts Status and Action Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    {latestAttempt ? (
                      <div>
                        <div className="text-[10px] text-slate-400">Previous Attempt Score:</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                            {latestAttempt.score} / {latestAttempt.totalMarks} ({latestAttempt.percentage}%)
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              latestAttempt.status === 'PASSED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {latestAttempt.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">
                        Attempts Allowed: <strong>{quiz.allowedAttempts}</strong>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartExam(quiz)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all active:scale-95"
                  >
                    {latestAttempt ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Exam</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Assessment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

