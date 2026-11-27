import React, { useMemo, useState } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHero } from '../mocktests/MockTestUi';
import { resolveSavedAnswer, SAVED_SOURCES } from '../../utils/savedQuestions';
import { SavedQuestionCard } from './SavedQuestionCard';

/** Student: every question they saved from subject quizzes, mock tests and live exams. */
export const StudentSavedQuestions = () => {
  const app = useApp();
  const { savedQuestions, currentUserId, removeSavedQuestion } = app;
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');

  const mine = useMemo(
    () =>
      (savedQuestions || [])
        .filter((q) => q.studentId === currentUserId)
        .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt))),
    [savedQuestions, currentUserId]
  );
  const counts = { all: mine.length };
  Object.keys(SAVED_SOURCES).forEach((k) => (counts[k] = mine.filter((q) => q.source === k).length));

  const term = search.trim().toLowerCase();
  const shown = mine.filter(
    (q) =>
      (source === 'all' || q.source === source) &&
      (!term || `${q.questionText} ${q.sourceTitle} ${q.subjectName}`.toLowerCase().includes(term))
  );

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300 pb-24 sm:pb-12">
      <PageHero
        eyebrow="Saved Questions"
        title="My Saved Questions"
        description="Questions you saved from subject quizzes, mock tests and live exams, with the correct answer to revise."
      />

      {mine.length === 0 ? (
        <div className="p-8 sm:p-14 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">No saved questions yet</p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            While taking a quiz, mock test or exam, or when reviewing your answers, tap <strong>Save</strong> on a question to keep it here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div role="group" aria-label="Show" className="inline-flex flex-wrap p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle self-start">
              {[{ id: 'all', label: 'All' }, ...Object.entries(SAVED_SOURCES).map(([id, s]) => ({ id, label: s.plural }))].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSource(f.id)}
                  aria-pressed={source === f.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${
                    source === f.id ? 'bg-[#087F8C] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] font-extrabold px-1.5 rounded-full ${source === f.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {counts[f.id]}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search saved questions"
                placeholder="Search saved questions..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
              />
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">No saved questions match.</p>
          ) : (
            <div className="space-y-3">
              {shown.map((q) => (
                <SavedQuestionCard key={q.id} item={q} resolved={resolveSavedAnswer(q, app)} onRemove={() => removeSavedQuestion(q.id)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentSavedQuestions;
