import React, { useMemo, useState } from 'react';
import { Bookmark, Search, Users, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHero } from '../mocktests/MockTestUi';
import { resolveSavedAnswer, SAVED_SOURCES } from '../../utils/savedQuestions';
import { formatDateTime } from '../../utils/assessmentRecords';
import { SavedQuestionCard, SourceBadge } from './SavedQuestionCard';

const questionGroupKey = (q) => `${q.source}:${q.sourceId}:${q.questionText}`;

/** Admin: which student saved which question, by student or by question. */
export const AdminSavedQuestions = () => {
  const app = useApp();
  const { savedQuestions, students } = app;
  const [view, setView] = useState('students'); // 'students' | 'questions'
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(null);

  const all = useMemo(() => {
    const byId = new Map((students || []).map((st) => [st.id, st]));
    return (savedQuestions || [])
      .map((q) => {
        const st = byId.get(q.studentId);
        return { ...q, studentName: st?.name || q.studentName || 'Student', rollNo: st?.studentId || q.rollNo || '', avatar: st?.avatar || '' };
      })
      .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
  }, [savedQuestions, students]);

  const term = search.trim().toLowerCase().replace(/\s+/g, ' ');
  const filtered = all.filter(
    (q) =>
      (source === 'all' || q.source === source) &&
      (!term || `${q.studentName} ${q.rollNo} ${q.questionText} ${q.sourceTitle} ${q.subjectName}`.toLowerCase().includes(term))
  );

  // By student: newest saver first
  const byStudent = useMemo(() => {
    const map = new Map();
    filtered.forEach((q) => {
      if (!map.has(q.studentId)) map.set(q.studentId, { studentId: q.studentId, name: q.studentName, rollNo: q.rollNo, avatar: q.avatar, items: [] });
      map.get(q.studentId).items.push(q);
    });
    return [...map.values()];
  }, [filtered]);

  // By question: most saved first
  const byQuestion = useMemo(() => {
    const map = new Map();
    filtered.forEach((q) => {
      const key = questionGroupKey(q);
      if (!map.has(key)) map.set(key, { key, item: q, savers: [] });
      map.get(key).savers.push(q);
    });
    return [...map.values()].sort((a, b) => b.savers.length - a.savers.length);
  }, [filtered]);

  const studentCount = new Set(all.map((q) => q.studentId)).size;
  const questionCount = new Set(all.map(questionGroupKey)).size;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300 pb-24 sm:pb-12">
      <PageHero
        eyebrow="Saved Questions"
        title="Saved Questions"
        description="Questions students saved from subject quizzes, mock tests and live exams: who saved which question, and how many saved it."
      />

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { label: 'Saves', value: all.length },
          { label: 'Students', value: studentCount },
          { label: 'Questions', value: questionCount }
        ].map((s) => (
          <div key={s.label} className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#087F8C]/15 dark:border-slate-800 shadow-subtle">
            <div className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {all.length === 0 ? (
        <div className="p-8 sm:p-14 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">No saved questions yet</p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            When students save questions from quizzes, mock tests or live exams, you&apos;ll see them here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
            <div role="group" aria-label="Group by" className="inline-flex p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle self-start">
              {[
                { id: 'students', label: 'By student', Icon: Users },
                { id: 'questions', label: 'By question', Icon: HelpCircle }
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setView(id);
                    setOpen(null);
                  }}
                  aria-pressed={view === id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${
                    view === id ? 'bg-[#087F8C] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
            <select
              aria-label="Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-subtle"
            >
              <option value="all">All sources</option>
              {Object.entries(SAVED_SOURCES).map(([id, s]) => (
                <option key={id} value={id}>
                  {s.plural}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search"
                placeholder="Search student, roll no or question..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
              />
            </div>
          </div>

          {filtered.length === 0 && <p className="p-6 text-center text-xs text-slate-400">Nothing matches these filters.</p>}

          {/* By student */}
          {view === 'students' && (
            <div className="space-y-2.5">
              {byStudent.map((g) => {
                const isOpen = open === g.studentId;
                return (
                  <section key={g.studentId} className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : g.studentId)}
                      aria-expanded={isOpen}
                      className="w-full p-3 sm:p-3.5 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/40"
                    >
                      {g.avatar ? (
                        <img src={g.avatar} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 shrink-0">
                          {g.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {g.name} {g.rollNo && <span className="ml-1 text-[10px] font-mono font-bold text-slate-400">{g.rollNo}</span>}
                        </p>
                        <p className="text-[11px] text-slate-500">Last saved {formatDateTime(g.items[0].savedAt)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 inline-flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> {g.items.length}
                      </span>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-3 sm:p-4 pt-0 space-y-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="h-2" />
                        {g.items.map((q) => (
                          <SavedQuestionCard key={q.id} item={q} resolved={resolveSavedAnswer(q, app)} perspective="admin" />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          {/* By question */}
          {view === 'questions' && (
            <div className="space-y-2.5">
              {byQuestion.map(({ key, item, savers }) => (
                <SavedQuestionCard
                  key={key}
                  item={item}
                  resolved={{ ...resolveSavedAnswer(item, app), selectedOption: null, answered: false }}
                  perspective="admin"
                  footer={
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-500 mb-1.5 inline-flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Saved by {savers.length} student{savers.length === 1 ? '' : 's'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {savers.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                            title={`Saved ${formatDateTime(s.savedAt)}`}
                          >
                            {s.studentName}
                            {s.rollNo && <span className="ml-1 font-mono text-[10px] text-slate-400">{s.rollNo}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { SourceBadge };
export default AdminSavedQuestions;
