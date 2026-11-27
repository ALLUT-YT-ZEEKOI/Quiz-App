import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  BookOpen,
  Layers,
  ClipboardList,
  Radio,
  Bookmark,
  MessageCircleQuestion,
  Users,
  ArrowRight,
  CornerDownLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { canStudentSeeMockTest } from '../../utils/mockTests';
import { requestOpen, OPEN_CURRICULUM, OPEN_DOUBT } from '../../utils/openRequest';

const PER_GROUP = 5;

/**
 * Ctrl+K search across the app's real content. Students only find what they can open themselves
 * (never other students); the admin can also find registered students. Sections switched off on
 * the Permissions page are left out.
 */
export const GlobalSearchModal = () => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    setActiveView,
    currentRole,
    currentUserId,
    studentModules,
    adminModules,
    curriculumSubjects,
    mockTests,
    examinations,
    savedQuestions,
    doubts,
    students,
    checkEnrollmentStatus
  } = useApp();
  const isAdmin = currentRole === 'teacher' || currentRole === 'admin';
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  // Ctrl+K toggles, Esc closes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && globalSearchOpen) setGlobalSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  useEffect(() => {
    if (!globalSearchOpen) setQuery('');
  }, [globalSearchOpen]);

  const allowed = (studentModule, adminModule = studentModule) =>
    isAdmin ? adminModules?.[adminModule] !== false : studentModules?.[studentModule] !== false;

  const term = query.trim().toLowerCase();
  const has = (...fields) => fields.some((f) => String(f || '').toLowerCase().includes(term));

  const groups = useMemo(() => {
    if (!term) return [];
    const close = () => setGlobalSearchOpen(false);
    const out = [];

    // Subjects and their modules
    if (allowed('subjects')) {
      const items = [];
      (curriculumSubjects || []).forEach((s) => {
        const open = isAdmin || !Number(s.price) || checkEnrollmentStatus?.(currentUserId, s.id) === 'active';
        if (has(s.name, s.code, s.category)) {
          items.push({
            key: `s:${s.id}`,
            Icon: BookOpen,
            title: s.name,
            meta: [s.code, `${(s.modules || []).length} module${(s.modules || []).length === 1 ? '' : 's'}`, !open && 'Not subscribed']
              .filter(Boolean)
              .join(' • '),
            go: () => {
              requestOpen(OPEN_CURRICULUM, { subjectId: s.id });
              setActiveView('subjects');
            }
          });
        }
        (s.modules || []).forEach((m) => {
          if (!has(m.title, m.description)) return;
          items.push({
            key: `m:${m.id}`,
            Icon: Layers,
            title: m.title,
            meta: `Module in ${s.name}`,
            go: () => {
              // A module of a course the student hasn't subscribed to opens the course page instead
              requestOpen(OPEN_CURRICULUM, open ? { subjectId: s.id, moduleId: m.id } : { subjectId: s.id });
              setActiveView('subjects');
            }
          });
        });
      });
      if (items.length) out.push({ id: 'subjects', label: 'Subjects & modules', items });
    }

    // Mock tests (students: only the ones they may take)
    if (allowed('mock-tests')) {
      const isInBatch = (subjectId) => checkEnrollmentStatus?.(currentUserId, subjectId) === 'active';
      const items = (mockTests || [])
        .filter((t) => (isAdmin || canStudentSeeMockTest(t, isInBatch)) && has(t.title, t.description, `day ${t.day}`))
        .map((t) => ({
          key: `t:${t.id}`,
          Icon: ClipboardList,
          title: t.title,
          meta: [`Day ${t.day}`, `${(t.questions || []).length} questions`, isAdmin && (t.enabled ? 'Visible' : 'Hidden')].filter(Boolean).join(' • '),
          go: () => setActiveView('mock-tests')
        }));
      if (items.length) out.push({ id: 'mock', label: 'Mock tests', items });
    }

    // Live exams
    if (allowed('examinations')) {
      const items = (examinations || [])
        .filter((e) => has(e.title, e.subjectName, e.code))
        .map((e) => ({
          key: `e:${e.id}`,
          Icon: Radio,
          title: e.title,
          meta: [e.subjectName, e.status, e.date].filter(Boolean).join(' • '),
          go: () => setActiveView('examinations')
        }));
      if (items.length) out.push({ id: 'exams', label: 'Live exams', items });
    }

    // Saved questions (students: their own)
    if (allowed('saved')) {
      const items = (savedQuestions || [])
        .filter((q) => (isAdmin || q.studentId === currentUserId) && has(q.questionText, q.sourceTitle, q.subjectName, isAdmin && q.studentName))
        .map((q) => ({
          key: `q:${q.id}`,
          Icon: Bookmark,
          title: q.questionText,
          meta: [isAdmin && q.studentName, q.subjectName, q.sourceTitle].filter(Boolean).join(' • '),
          go: () => setActiveView('saved')
        }));
      if (items.length) out.push({ id: 'saved', label: 'Saved questions', items });
    }

    // Doubts (students: their own)
    if (allowed('doubts')) {
      const items = (doubts || [])
        .filter(
          (d) =>
            (isAdmin || d.studentId === currentUserId) &&
            has(d.subjectName, d.context?.questionText, isAdmin && d.studentName, ...(d.messages || []).map((m) => m.text))
        )
        .map((d) => ({
          key: `d:${d.id}`,
          Icon: MessageCircleQuestion,
          title: d.context?.questionText || d.messages?.[0]?.text || 'Doubt',
          meta: [isAdmin && d.studentName, d.subjectName, d.status === 'resolved' ? 'Cleared' : d.status === 'answered' ? 'Answered' : 'Waiting'].filter(Boolean).join(' • '),
          go: () => {
            requestOpen(OPEN_DOUBT, d.id);
            setActiveView('doubts');
          }
        }));
      if (items.length) out.push({ id: 'doubts', label: 'Doubts', items });
    }

    // Students: admin only
    if (isAdmin && adminModules?.registrations !== false) {
      const digits = term.replace(/\D/g, '');
      const items = (students || [])
        .filter(
          (st) =>
            has(st.name, st.studentId, st.email) ||
            (digits.length >= 4 && String(st.phone || '').replace(/\D/g, '').includes(digits))
        )
        .map((st) => ({
          key: `u:${st.id}`,
          Icon: Users,
          title: st.name,
          meta: [st.studentId, st.email].filter(Boolean).join(' • '),
          go: () => setActiveView('registrations')
        }));
      if (items.length) out.push({ id: 'students', label: 'Students', items });
    }

    return out.map((g) => ({
      ...g,
      total: g.items.length,
      items: g.items.slice(0, PER_GROUP).map((it) => ({
        ...it,
        go: () => {
          it.go();
          close();
        }
      }))
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, isAdmin, curriculumSubjects, mockTests, examinations, savedQuestions, doubts, students, studentModules, adminModules, currentUserId]);

  const flat = groups.flatMap((g) => g.items);
  useEffect(() => setActive(0), [term]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!globalSearchOpen) return null;

  const placeholder = isAdmin
    ? 'Search subjects, modules, mock tests, exams, students, doubts…'
    : 'Search your subjects, modules, mock tests, saved questions, doubts…';

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && flat[active]) {
      e.preventDefault();
      flat[active].go();
    }
  };

  let index = -1;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setGlobalSearchOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-[#087F8C] dark:text-teal-300 flex-shrink-0" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            aria-label="Search"
            className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setGlobalSearchOpen(false)}
            aria-label="Close search"
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={listRef} className="overflow-y-auto p-3 sm:p-4 space-y-4 text-sm">
          {!term ? (
            <p className="py-8 text-center text-xs text-slate-400">
              {isAdmin
                ? 'Type to search subjects, modules, mock tests, live exams, saved questions, doubts and students.'
                : 'Type to search your subjects, modules, mock tests, live exams, saved questions and doubts.'}
            </p>
          ) : groups.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">Nothing found for “{query.trim()}”.</p>
          ) : (
            groups.map((g) => (
              <section key={g.id}>
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                  {g.label} ({g.total})
                </h3>
                <div className="space-y-1">
                  {g.items.map((it) => {
                    index += 1;
                    const i = index;
                    const isActive = i === active;
                    return (
                      <button
                        key={it.key}
                        type="button"
                        data-index={i}
                        onClick={it.go}
                        onMouseEnter={() => setActive(i)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left border transition-colors ${
                          isActive
                            ? 'bg-[#E6F4F6] dark:bg-slate-800/80 border-[#087F8C]/20 dark:border-slate-700'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#087F8C] dark:text-teal-300 flex items-center justify-center shrink-0">
                          <it.Icon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-slate-900 dark:text-white truncate">{it.title}</span>
                          {it.meta && <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">{it.meta}</span>}
                        </span>
                        {isActive ? <CornerDownLeft className="w-4 h-4 text-slate-400 shrink-0" /> : <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans">↑ ↓</kbd> to move
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans">Enter</kbd> to open
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans">Esc</kbd> to close
          </div>
          <span className="hidden sm:inline">Ctrl+K anytime</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
