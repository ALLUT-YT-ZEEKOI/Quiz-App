import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircleQuestion,
  Plus,
  Search,
  ArrowLeft,
  Send,
  CheckCircle2,
  RotateCcw,
  Radio,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Inbox
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { optionLetter } from '../../utils/assessmentRecords';
import { AskDoubtModal } from './AskDoubtModal';
import { resolveSavedAnswer } from '../../utils/savedQuestions';
import { takeOpenRequest, OPEN_DOUBT } from '../../utils/openRequest';

const STATUS_META = {
  open: { label: 'Waiting for reply', adminLabel: 'Needs reply', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
  answered: { label: 'Answered', adminLabel: 'Answered', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
  resolved: { label: 'Cleared', adminLabel: 'Cleared', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
};

const SOURCE_META = {
  exam: { label: 'Asked during exam', Icon: Radio },
  'exam-review': { label: 'From exam review', Icon: ClipboardCheck },
  quiz: { label: 'From module quiz', Icon: BookOpen },
  mock: { label: 'Asked during mock test', Icon: ClipboardList },
  review: { label: 'From answer review', Icon: ClipboardCheck }
};

const timeAgo = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const DoubtsDashboard = () => {
  const { currentRole, currentUser, doubts, replyToDoubt, setDoubtStatus, markDoubtSeen } = useApp();
  const isAdmin = currentRole === 'teacher' || currentRole === 'admin';
  const studentId = currentUser?.id || 'STU001';

  // Coming from a question's "Doubt" button: open that conversation
  const [initialId] = useState(() => takeOpenRequest(OPEN_DOUBT));
  const [filter, setFilter] = useState(isAdmin && !initialId ? 'open' : 'all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(initialId);
  const [askOpen, setAskOpen] = useState(false);

  const mine = useMemo(
    () => (isAdmin ? doubts : doubts.filter((d) => d.studentId === studentId)),
    [doubts, isAdmin, studentId]
  );
  const counts = useMemo(() => {
    const c = { all: mine.length, open: 0, answered: 0, resolved: 0 };
    mine.forEach((d) => c[d.status]++);
    return c;
  }, [mine]);

  const term = search.trim().toLowerCase();
  const list = mine
    .filter((d) => filter === 'all' || d.status === filter)
    .filter(
      (d) =>
        !term ||
        (d.studentName || '').toLowerCase().includes(term) ||
        (d.subjectName || '').toLowerCase().includes(term) ||
        d.messages.some((m) => m.text.toLowerCase().includes(term))
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const selected = mine.find((d) => d.id === selectedId) || null;

  // A request to open a doubt while this page is already showing
  useEffect(() => {
    const apply = () => {
      const id = takeOpenRequest(OPEN_DOUBT);
      if (!id) return;
      setFilter('all');
      setSelectedId(id);
    };
    window.addEventListener(OPEN_DOUBT, apply);
    return () => window.removeEventListener(OPEN_DOUBT, apply);
  }, []);

  // Opening an answered doubt clears its "new reply" marker for the student
  useEffect(() => {
    if (!isAdmin && selected && !selected.seenByStudent) markDoubtSeen(selected.id);
  }, [isAdmin, selected, markDoubtSeen]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'open', label: isAdmin ? 'Needs Reply' : 'Waiting' },
    { id: 'answered', label: 'Answered' },
    { id: 'resolved', label: 'Cleared' }
  ];

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300">
            {isAdmin ? 'Student Questions' : 'Help Desk'}
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {isAdmin ? 'Doubts' : 'My Doubts'}
          </h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {isAdmin
              ? 'Doubts students sent from exams, quizzes and answer reviews. Reply, then mark them cleared.'
              : 'Ask the admin anything, or tap "Ask a doubt" on any question in an exam or in Marks & Answers.'}
          </p>
        </div>
        {!isAdmin && (
          <button
            type="button"
            onClick={() => setAskOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" /> Ask a Doubt
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,380px)_1fr] gap-4 items-start">
        {/* List */}
        <div className={`space-y-3 ${selected ? 'hidden lg:block' : ''}`}>
          <div className="p-2.5 bg-white dark:bg-surface-darkCard rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium space-y-2">
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[10px] sm:text-[11px] font-bold" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === t.id}
                  onClick={() => setFilter(t.id)}
                  className={`py-1.5 px-1 rounded-lg transition-all truncate ${
                    filter === t.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {t.label} <span className="opacity-60">{counts[t.id]}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAdmin ? 'Search student, topic or message…' : 'Search your doubts…'}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          {list.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400">
                {isAdmin ? 'No doubts here. 🎉' : filter === 'all' ? "You haven't asked anything yet." : 'Nothing in this list.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((d) => {
                const last = d.messages[d.messages.length - 1];
                const unread = isAdmin ? d.status === 'open' : !d.seenByStudent;
                const meta = STATUS_META[d.status];
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all bg-white dark:bg-surface-darkCard shadow-2xs ${
                      selectedId === d.id ? 'border-violet-400 ring-2 ring-violet-500/15' : 'border-slate-200/80 dark:border-slate-800 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {isAdmin ? d.studentName : d.subjectName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(d.updatedAt)}</span>
                    </div>
                    {isAdmin && <p className="text-[10px] font-bold text-[#087F8C] dark:text-teal-300 truncate">{d.subjectName}</p>}
                    {d.context && (
                      <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 truncate mt-0.5">
                        Q{d.context.questionIndex + 1}: {d.context.questionText}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {last.from === 'admin' ? 'Admin: ' : ''}
                      {last.text}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${meta.cls}`}>
                        {isAdmin ? meta.adminLabel : meta.label}
                      </span>
                      {unread && !isAdmin && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-violet-600 text-white">New reply</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Thread */}
        <div className={selected ? '' : 'hidden lg:block'}>
          {selected ? (
            <DoubtThread
              doubt={selected}
              isAdmin={isAdmin}
              onBack={() => setSelectedId(null)}
              onReply={(text) => replyToDoubt(selected.id, text)}
              onStatus={(status) => setDoubtStatus(selected.id, status)}
            />
          ) : (
            <div className="p-10 text-center bg-white/60 dark:bg-surface-darkCard/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
              <MessageCircleQuestion className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Select a doubt to read the conversation.
            </div>
          )}
        </div>
      </div>

      {askOpen && <AskDoubtModal onClose={() => setAskOpen(false)} onSent={(d) => setSelectedId(d.id)} />}
    </div>
  );
};

const DoubtThread = ({ doubt, isAdmin, onBack, onReply, onStatus }) => {
  const app = useApp();
  const [reply, setReply] = useState('');
  const endRef = useRef(null);
  const rawCtx = doubt.context;
  const source = rawCtx ? SOURCE_META[rawCtx.source] || SOURCE_META.review : null;

  // Doubts sent during a test don't carry the answer: the admin sees it looked up from the test
  const ctx = useMemo(() => {
    if (!rawCtx || !isAdmin || typeof rawCtx.correctAnswer === 'number') return rawCtx;
    const kind =
      rawCtx.kind || (['exam', 'exam-review'].includes(rawCtx.source) ? 'exam' : rawCtx.source === 'quiz' ? 'quiz' : rawCtx.source === 'mock' ? 'mock' : null);
    const sourceId = rawCtx.sourceId || rawCtx.examId;
    if (!kind || !sourceId) return rawCtx;
    const found = resolveSavedAnswer(
      { source: kind, sourceId, questionId: '', questionText: rawCtx.questionText, questionIndex: rawCtx.questionIndex ?? null, studentId: doubt.studentId },
      app
    );
    return found.correctAnswer === null ? rawCtx : { ...rawCtx, correctAnswer: found.correctAnswer };
  }, [rawCtx, isAdmin, doubt.studentId, app]);

  // The admin clears a doubt once they've replied with an explanation
  const adminReplied = doubt.messages.some((m) => m.from === 'admin');

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [doubt.messages.length]);

  const submit = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    onReply(reply);
    setReply('');
  };

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
        <button type="button" onClick={onBack} className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Back to list">
          <ArrowLeft className="w-4 h-4" />
        </button>
        {isAdmin && (doubt.avatar ? (
          <img src={doubt.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black shrink-0">{(doubt.studentName || '?').charAt(0)}</div>
        ))}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-slate-900 dark:text-white break-words">{isAdmin ? doubt.studentName : doubt.subjectName}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 break-words">
            {isAdmin ? `${doubt.subjectName} • ` : ''}Asked {timeAgo(doubt.createdAt)}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${STATUS_META[doubt.status].cls}`}>
          {isAdmin ? STATUS_META[doubt.status].adminLabel : STATUS_META[doubt.status].label}
        </span>
      </div>

      {/* Question context */}
      {ctx && (
        <div className="m-3 sm:m-4 mb-0 p-3 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-900/40 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
            <source.Icon className="w-3 h-3" />
            <span className="truncate">{source.label}: {ctx.assessmentTitle}</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
            Q{ctx.questionIndex + 1}. {ctx.questionText}
          </p>
          {ctx.options?.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {ctx.options.map((opt, i) => {
                // Admins see the correct answer; students only see their own choice
                const isCorrect = isAdmin && i === ctx.correctAnswer;
                const isChosen = i === ctx.selectedOption;
                return (
                  <li
                    key={i}
                    className={`px-2 py-1.5 rounded-lg text-[11px] flex gap-1.5 border ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold'
                        : isChosen
                        ? 'bg-white dark:bg-slate-900 border-violet-300 dark:border-violet-800 text-slate-800 dark:text-slate-100 font-semibold'
                        : 'bg-white/70 dark:bg-slate-900/40 border-transparent text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-black opacity-60">{optionLetter(i)}.</span>
                    <span className="flex-1">
                      {opt}
                      {(isCorrect || isChosen) && (
                        <span className="block text-[9px] uppercase tracking-wider opacity-70">
                          {[isCorrect && 'Correct', isChosen && (isAdmin ? "Student's answer" : 'Your answer')].filter(Boolean).join(' • ')}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="p-3 sm:p-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
        {doubt.messages.map((m) => {
          const mine = isAdmin ? m.from === 'admin' : m.from === 'student';
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  mine
                    ? 'bg-violet-600 text-white rounded-br-md'
                    : m.from === 'admin'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-50 border border-emerald-200/70 dark:border-emerald-900/50 rounded-bl-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md'
                }`}
              >
                <p className={`text-[10px] font-bold mb-0.5 ${mine ? 'text-violet-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  {m.from === 'admin' ? (isAdmin ? 'You' : 'Admin') : isAdmin ? m.name : 'You'} • {timeAgo(m.at)}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Reply + status actions */}
      <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {doubt.status === 'resolved' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> This doubt is cleared.
            </p>
            <button type="button" onClick={() => onStatus(doubt.messages.at(-1)?.from === 'admin' ? 'answered' : 'open')} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5 self-start">
              <RotateCcw className="w-3.5 h-3.5" /> Reopen
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="flex gap-2">
              <textarea
                rows={2}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e);
                }}
                placeholder={isAdmin ? 'Write your explanation…' : 'Add a follow-up question…'}
                aria-label="Reply"
                className="flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="px-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white inline-flex items-center justify-center"
                aria-label="Send reply"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-end gap-2">
              {isAdmin && !adminReplied && (
                <span className="text-[11px] text-slate-400">Reply with an explanation first, then mark it cleared.</span>
              )}
              <button
                type="button"
                onClick={() => onStatus('resolved')}
                disabled={isAdmin && !adminReplied}
                className={`text-[11px] font-bold inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                  isAdmin
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> {isAdmin ? 'Mark as cleared' : 'My doubt is cleared'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
