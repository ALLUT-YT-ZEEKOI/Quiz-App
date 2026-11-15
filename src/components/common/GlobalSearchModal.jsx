import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, BookOpen, User, HelpCircle, FileText, ArrowRight } from 'lucide-react';

export const GlobalSearchModal = () => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    students,
    subjects,
    quizzes,
    questions,
    setActiveView,
    setSelectedStudentForProfile,
    currentRole
  } = useApp();

  const [query, setQuery] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  if (!globalSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingSubjects = trimmed
    ? subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          s.code.toLowerCase().includes(trimmed) ||
          s.faculty.toLowerCase().includes(trimmed)
      )
    : subjects.slice(0, 3);

  const matchingQuizzes = trimmed
    ? quizzes.filter(
        (q) =>
          q.title.toLowerCase().includes(trimmed) ||
          q.subjectName.toLowerCase().includes(trimmed)
      )
    : quizzes.slice(0, 3);

  const matchingStudents = trimmed
    ? students.filter(
        (st) =>
          st.name.toLowerCase().includes(trimmed) ||
          st.studentId.toLowerCase().includes(trimmed) ||
          st.email.toLowerCase().includes(trimmed)
      )
    : students.slice(0, 3);

  const matchingQuestions = trimmed
    ? questions
        .filter(
          (q) =>
            q.questionText.toLowerCase().includes(trimmed) ||
            q.subjectName.toLowerCase().includes(trimmed)
        )
        .slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search subjects, quizzes, students, civil engineering questions... (Press Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-4 space-y-5 text-sm">
          {/* Subjects */}
          {matchingSubjects.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                Subjects ({matchingSubjects.length})
              </div>
              <div className="space-y-1.5">
                {matchingSubjects.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveView('subjects');
                      setGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-blue-100 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{s.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono">
                          {s.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{s.faculty}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes */}
          {matchingQuizzes.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                Quizzes ({matchingQuizzes.length})
              </div>
              <div className="space-y-1.5">
                {matchingQuizzes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setActiveView(currentRole === 'teacher' ? 'quizzes' : 'quizzes');
                      setGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-emerald-100 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{q.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {q.subjectName} • {q.durationMinutes} mins • {q.totalMarks} marks
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students (especially useful for teachers) */}
          {matchingStudents.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-500" />
                Students ({matchingStudents.length})
              </div>
              <div className="space-y-1.5">
                {matchingStudents.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStudentForProfile(st);
                      setActiveView(currentRole === 'teacher' ? 'students' : 'profile');
                      setGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-purple-100 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{st.name}</span>
                          <span className="text-xs text-slate-400 font-mono">{st.studentId}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {st.semester} • Batch {st.batch} • Avg Score: {st.averageScore}%
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Bank Items */}
          {matchingQuestions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                Questions ({matchingQuestions.length})
              </div>
              <div className="space-y-1.5">
                {matchingQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setActiveView(currentRole === 'teacher' ? 'questions' : 'quizzes');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-amber-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-amber-100 dark:hover:border-slate-700"
                  >
                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">
                      {q.subjectName} ({q.difficulty})
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                      {q.questionText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trimmed &&
            matchingSubjects.length === 0 &&
            matchingQuizzes.length === 0 &&
            matchingStudents.length === 0 &&
            matchingQuestions.length === 0 && (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No results found for "{query}"</p>
                <p className="text-xs mt-1">Try searching for "IS 456", "Concrete", "Adithyan", or "Surveying"</p>
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <span className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono">
              ESC
            </span>
            <span>to close</span>
          </div>
          <div>Press Ctrl+K anytime</div>
        </div>
      </div>
    </div>
  );
};

