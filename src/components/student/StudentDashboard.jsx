import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Award,
  CheckCircle2,
  TrendingUp,
  Percent,
  Clock,
  ArrowRight,
  ChevronRight,
  Trophy,
  Play,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const {
    currentUser,
    subjects,
    quizzes,
    attempts,
    setActiveView,
    setActiveQuizForAttempt,
    setLastQuizResult
  } = useApp();

  // Student specific attempts
  const myAttempts = attempts.filter((a) => a.studentId === currentUser?.id);
  const myPassed = myAttempts.filter((a) => a.status === 'PASSED');

  const publishedQuizzes = quizzes.filter((q) => q.status === 'Published');
  const availableQuizzesCount = publishedQuizzes.length;

  const averageScore =
    myAttempts.length > 0
      ? (myAttempts.reduce((sum, a) => sum + a.percentage, 0) / myAttempts.length).toFixed(1)
      : currentUser?.averageScore || 85;

  const handleStartQuiz = (quiz) => {
    setActiveQuizForAttempt(quiz);
    setActiveView('quiz-attempt');
  };

  const handleViewResultSheet = (att) => {
    setLastQuizResult(att);
    setActiveView('quiz-result');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-premium">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1.5">
              <span>Department of Civil Engineering</span>
              <span>•</span>
              <span className="font-mono">{currentUser?.semester || 'S6'} ({currentUser?.batch || '2022-2026'})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              You are currently preparing for GATE Civil & University Examinations. All 10 technical modules are active.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('quizzes')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Take Assessment</span>
            </button>
            <button
              onClick={() => setActiveView('leaderboard')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Leaderboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Student Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Enrolled Courses */}
        <div
          onClick={() => setActiveView('subjects')}
          className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-blue-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Enrolled Subjects</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 dark:text-white font-mono">
            {subjects.length}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">10 Core Modules</div>
        </div>

        {/* Available Quizzes */}
        <div
          onClick={() => setActiveView('quizzes')}
          className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-purple-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Available Quizzes</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 dark:text-white font-mono">
            {availableQuizzesCount}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Ready to Attempt</div>
        </div>

        {/* Completed Assessments */}
        <div
          onClick={() => setActiveView('results')}
          className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-emerald-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Completed Tests</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 dark:text-white font-mono">
            {myAttempts.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {myPassed.length} Passed Successfully
          </div>
        </div>

        {/* My Average Score */}
        <div className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>My Average Score</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 dark:text-white font-mono">
            {averageScore}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Status: {currentUser?.performanceStatus || 'Good'}
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Attendance Rate</span>
            <Percent className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 dark:text-white font-mono">
            {currentUser?.attendancePct || 94.5}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Exam Hall Permit Valid</div>
        </div>
      </div>

      {/* Recommended Quizzes Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recommended Assessments for You
            </h3>
            <p className="text-xs text-slate-500">
              Curated tests aligned with current syllabus and IS specifications
            </p>
          </div>
          <button
            onClick={() => setActiveView('quizzes')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({publishedQuizzes.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {publishedQuizzes.slice(0, 3).map((quiz) => {
            const priorAttempt = myAttempts.find((a) => a.quizId === quiz.id);

            return (
              <div
                key={quiz.id}
                className="p-5 bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {quiz.subjectName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        quiz.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-700'
                          : quiz.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {quiz.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-slate-600 dark:text-slate-300 mb-3">
                    <span>{quiz.questionIds.length} Questions</span>
                    <span>{quiz.durationMinutes} Mins</span>
                    <span className="font-bold text-emerald-600">{quiz.totalMarks} Marks</span>
                  </div>

                  {priorAttempt ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Best: <strong>{priorAttempt.score}/{priorAttempt.totalMarks}</strong> ({priorAttempt.percentage}%)
                      </span>
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 text-xs font-bold transition-colors"
                      >
                        Retake Test
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Assessment</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Enrolled Subjects Mastery & Recent Assessment Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Civil Engineering Subjects Progress */}
        <div className="bg-white dark:bg-surface-darkCard p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  My Subject Mastery Progress
                </h3>
                <p className="text-xs text-slate-500">Curriculum completion and score benchmark</p>
              </div>
              <button
                onClick={() => setActiveView('subjects')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                All 10 Subjects
              </button>
            </div>

            <div className="space-y-3">
              {subjects.slice(0, 5).map((sub) => {
                const myProg = (currentUser?.subjectProgress && currentUser.subjectProgress[sub.id]) || 80;
                return (
                  <div key={sub.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {sub.name} <span className="text-[10px] font-mono text-slate-400">({sub.code})</span>
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {myProg}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${myProg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Total Core Credits: 35</span>
            <button
              onClick={() => setActiveView('subjects')}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Explore Syllabus Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Results Sheet */}
        <div className="bg-white dark:bg-surface-darkCard p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  My Recent Test Results
                </h3>
                <p className="text-xs text-slate-500">Instant feedback and technical explanations</p>
              </div>
              <button
                onClick={() => setActiveView('results')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Full History
              </button>
            </div>

            <div className="space-y-3">
              {myAttempts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  You haven't submitted any tests yet. Click "Start Assessment" above to take your first test!
                </div>
              ) : (
                myAttempts.slice(0, 3).map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {att.quizTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(att.submittedAt).toLocaleDateString()} • Time spent:{' '}
                        {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {att.score}/{att.totalMarks}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            att.status === 'PASSED' ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {att.percentage}% ({att.status})
                        </span>
                      </div>

                      <button
                        onClick={() => handleViewResultSheet(att)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold hover:bg-blue-100 text-xs"
                      >
                        Result Sheet
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center">
            <span>IS 456 / IS 800 code reference included in each answer review</span>
          </div>
        </div>
      </div>
    </div>
  );
};

