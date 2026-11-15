import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Compass,
  Boxes,
  Layers,
  Hammer,
  Calculator,
  Car,
  Droplets,
  ShieldCheck,
  Trees,
  BookOpen,
  User,
  Award,
  ChevronRight,
  Play,
  Search
} from 'lucide-react';

export const SubjectDirectory = () => {
  const { subjects, quizzes, setActiveView, setActiveQuizForAttempt, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Icon mapper helper
  const renderSubjectIcon = (iconName) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-6 h-6" />;
      case 'Compass':
        return <Compass className="w-6 h-6" />;
      case 'Boxes':
        return <Boxes className="w-6 h-6" />;
      case 'Layers':
        return <Layers className="w-6 h-6" />;
      case 'Hammer':
        return <Hammer className="w-6 h-6" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6" />;
      case 'Car':
        return <Car className="w-6 h-6" />;
      case 'Droplets':
        return <Droplets className="w-6 h-6" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6" />;
      case 'Trees':
        return <Trees className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartQuizForSubject = (subjId) => {
    const quiz = quizzes.find((q) => q.subjectId === subjId && q.status === 'Published');
    if (quiz) {
      setActiveQuizForAttempt(quiz);
      setActiveView('quiz-attempt');
    } else {
      setActiveView('quizzes');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Civil Engineering Subject Curriculum
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold font-mono">
              10 Core Subjects
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Complete syllabus breakdown, faculty allocations, topic learning paths, and associated quizzes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subjects or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* 10 Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubjects.map((sub) => {
          const matchingQuizzes = quizzes.filter(
            (q) => q.subjectId === sub.id && q.status === 'Published'
          );
          const studentProgress =
            (currentUser?.subjectProgress && currentUser.subjectProgress[sub.id]) ||
            Math.round(sub.studentAvg);

          return (
            <div
              key={sub.id}
              className="p-6 bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between space-y-4 group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: sub.color }}
                    >
                      {renderSubjectIcon(sub.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {sub.name}
                        </h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                          {sub.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Faculty: {sub.faculty}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono">
                    {sub.credits} Credits
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sub.description}
                </p>

                {/* Topics covered chips */}
                <div className="mt-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Core Syllabus Modules:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sub.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress & Quick Action Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Curriculum Progress</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {studentProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${studentProgress}%`,
                        backgroundColor: sub.color
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 font-medium">
                    {matchingQuizzes.length} Assessment Available
                  </span>

                  <button
                    onClick={() => handleStartQuizForSubject(sub.id)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Launch Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

