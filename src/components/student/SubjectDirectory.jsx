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
  Search,
  HelpCircle,
  X,
  CheckCircle2,
  Check,
  Sparkles
} from 'lucide-react';

export const SubjectDirectory = () => {
  const { subjects, quizzes, questions, setActiveView, setActiveQuizForAttempt, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);

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

  // Get questions specific to selected subject
  const modalSubjectQuestions = selectedSubjectModal
    ? questions.filter((q) => q.subjectId === selectedSubjectModal.id)
    : [];

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
            Each subject features 10 curated questions & answers aligned with IS 456, IS 800, and IRC standards.
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

      {/* Subject Cards — 1 per row on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredSubjects.map((sub) => {
          const matchingQuizzes = quizzes.filter(
            (q) => q.subjectId === sub.id && q.status === 'Published'
          );
          const subjectQuestions = questions.filter((q) => q.subjectId === sub.id);
          const studentProgress =
            (currentUser?.subjectProgress && currentUser.subjectProgress[sub.id]) ||
            Math.round(sub.studentAvg);

          return (
            <div
              key={sub.id}
              className="p-3 sm:p-6 bg-white dark:bg-surface-darkCard rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between space-y-3 sm:space-y-4 group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0"
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

                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono shrink-0">
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

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {subjectQuestions.length} Questions & Solutions
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSubjectModal(sub)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                      title="View questions and verified answers for this subject"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                      <span>Study Q&A</span>
                    </button>

                    <button
                      onClick={() => handleStartQuizForSubject(sub.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Take Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* SUBJECT QUESTIONS & SOLUTIONS MODAL                          */}
      {/* ============================================================ */}
      {selectedSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                  style={{ backgroundColor: selectedSubjectModal.color }}
                >
                  {renderSubjectIcon(selectedSubjectModal.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {selectedSubjectModal.name}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                      {selectedSubjectModal.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Faculty: {selectedSubjectModal.faculty} • {modalSubjectQuestions.length} Questions & Verified Solutions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>All questions below are strictly authored for <strong>{selectedSubjectModal.name}</strong> with IS code benchmarks.</span>
              </div>

              {modalSubjectQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-900/50">
                      Question {idx + 1} ({q.id})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {q.difficulty} • {q.marks} Mark
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* 4 MCQ Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Verified Explanation */}
                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">
                        Technical Solution & IS-Code Rationale:
                      </span>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close Window
              </button>

              <button
                onClick={() => {
                  const subId = selectedSubjectModal.id;
                  setSelectedSubjectModal(null);
                  handleStartQuizForSubject(subId);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Timed Quiz on {selectedSubjectModal.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
