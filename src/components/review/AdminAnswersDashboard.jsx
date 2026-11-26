import React, { useMemo, useState } from 'react';
import {
  ClipboardCheck,
  ArrowLeft,
  Search,
  RotateCcw,
  Check,
  X,
  Clock,
  Info,
  Users,
  ListChecks,
  Table2,
  Play
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  buildAssessmentRecords,
  computeSubjectMarks,
  computeQuestionAnalysis,
  latestPerAssessment,
  optionLetter
} from '../../utils/assessmentRecords';
import { formatDate } from '../../utils/subscriptionUtils';
import { QuestionReviewList } from './QuestionReviewList';
import { AttemptRow, AttemptStats, KindBadge, pctTone } from './StudentAnswersDashboard';

const TABS = [
  { id: 'attempts', label: 'All Answers', short: 'Answers', Icon: ClipboardCheck },
  { id: 'questions', label: 'Question Analysis', short: 'Questions', Icon: ListChecks },
  { id: 'marks', label: 'Subject Marks', short: 'Marks', Icon: Table2 },
  { id: 'retests', label: 'Retests', short: 'Retests', Icon: RotateCcw }
];

const selectCls =
  'px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 min-w-0';

export const AdminAnswersDashboard = () => {
  const app = useApp();
  const { examAttempts, examinations, curriculumAttempts, mockAttempts, mockTests, retests, pendingRetestCount } = app;

  const records = useMemo(
    () => buildAssessmentRecords({ examAttempts, examinations, curriculumAttempts, mockAttempts, mockTests }),
    [examAttempts, examinations, curriculumAttempts, mockAttempts, mockTests]
  );
  const [tab, setTab] = useState('attempts');
  const [selectedId, setSelectedId] = useState(null);

  const selected = records.find((r) => r.id === selectedId);
  if (selected) {
    return <AdminAttemptDetail record={selected} records={records} onBack={() => setSelectedId(null)} onSelect={setSelectedId} />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-16">
      <div className="min-w-0">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300">
          Results Review
        </span>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">Student Answers</h1>
        <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Every student's right and wrong answers and time taken across live exams, mock tests and module quizzes. Enable retests from here.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#E8F3F4] dark:bg-slate-800/80 border border-[#087F8C]/15 dark:border-slate-700/60 text-[11px] sm:text-xs font-bold" role="tablist">
        {TABS.map(({ id, label, short, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-[2.5rem] px-1.5 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === id ? 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25' : 'text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700/50'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0 hidden min-[400px]:block" />
            <span className="md:hidden truncate">{short}</span>
            <span className="hidden md:inline truncate">{label}</span>
            {id === 'retests' && pendingRetestCount > 0 && (
              <span className={`px-1.5 rounded-full text-[9px] font-extrabold ${tab === id ? 'bg-white/25' : 'bg-amber-500 text-white'}`}>
                {pendingRetestCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'attempts' && <AttemptsTab records={records} onOpen={setSelectedId} />}
      {tab === 'questions' && <QuestionsTab records={records} />}
      {tab === 'marks' && <MarksTab records={records} />}
      {tab === 'retests' && <RetestsTab records={records} retests={retests} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// All answers
// ---------------------------------------------------------------------------
const AttemptsTab = ({ records, onOpen }) => {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [kind, setKind] = useState('all');
  const [limit, setLimit] = useState(40);

  const subjects = [...new Set(records.map((r) => r.subjectName))].sort();
  const term = search.trim().toLowerCase();
  const filtered = records.filter(
    (r) =>
      (subject === 'All' || r.subjectName === subject) &&
      (kind === 'all' || r.kind === kind) &&
      (!term || (r.studentName || '').toLowerCase().includes(term) || r.title.toLowerCase().includes(term))
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-2 p-3 bg-white dark:bg-surface-darkCard rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or test..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <select aria-label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={selectCls}>
            <option value="All">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value)} className={selectCls}>
            <option value="all">All types</option>
            <option value="exam">Live exams</option>
            <option value="mock">Mock tests</option>
            <option value="quiz">Module quizzes</option>
          </select>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 px-1">{filtered.length} attempts • tap one to see every answer</p>

      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-2xs">
        {filtered.slice(0, limit).map((r) => (
          <AttemptRow key={r.id} record={r} showStudent onClick={() => onOpen(r.id)} />
        ))}
        {filtered.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No attempts match.</p>}
      </div>
      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + 40)}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
        >
          Show more ({filtered.length - limit} left)
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// One student's attempt + retest controls
// ---------------------------------------------------------------------------
const AdminAttemptDetail = ({ record, records, onBack, onSelect }) => {
  const { examinations, getRetestFor, grantRetest, declineRetest, revokeRetest } = useApp();
  const exam = record.kind === 'exam' ? examinations.find((e) => e.id === record.examId) : null;
  const sameAssessment = records
    .filter((r) => r.studentId === record.studentId && r.assessmentKey === record.assessmentKey)
    .sort((a, b) => a.time - b.time);
  const isLatest = sameAssessment[sameAssessment.length - 1]?.id === record.id;
  const retest = exam ? getRetestFor(record.studentId, exam.id) : null;
  const tone = pctTone(record.pct);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-16">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#087F8C] px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Student Answers
      </button>

      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          {record.avatar ? (
            <img src={record.avatar} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 shrink-0">
              {(record.studentName || '?').charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <KindBadge kind={record.kind} />
              {record.isRetest && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">Retest</span>
              )}
              <span className="text-[11px] text-slate-400">{formatDate(record.date)}</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">{record.studentName}</h1>
            <p className="text-xs text-slate-500 truncate">{record.title} • {record.subjectName}</p>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-2xl font-black ${tone.text}`}>{record.pct}%</div>
            <div className="text-[11px] text-slate-500 font-semibold">{record.score} / {record.maxScore}</div>
          </div>
        </div>
        <AttemptStats record={record} />
        {sameAssessment.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Attempts:</span>
            {sameAssessment.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  r.id === record.id ? 'bg-[#087F8C] border-[#087F8C] text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                #{i + 1}{r.isRetest ? ' Retest' : ''} • {r.pct}%
              </button>
            ))}
          </div>
        )}
      </div>

      {exam && isLatest && (
        <div className="p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-surface-darkCard border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <RotateCcw className={`w-5 h-5 shrink-0 ${retest?.status === 'granted' ? 'text-emerald-600' : retest ? 'text-amber-500' : 'text-slate-400'}`} />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {retest?.status === 'granted' ? 'Retest enabled' : retest ? 'Student requested a retest' : 'Retest'}
              </p>
              <p className="text-[11px] text-slate-500">
                {retest?.status === 'granted'
                  ? 'Waiting for the student to take it. Their new score will replace this one.'
                  : retest
                  ? retest.reason ? `Reason: "${retest.reason}"` : `Requested ${formatDate(retest.requestedAt)}`
                  : `Allow ${record.studentName} to take this exam once more.`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {retest?.status === 'granted' ? (
              <button type="button" onClick={() => revokeRetest(retest.id)} className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                Revoke
              </button>
            ) : (
              <>
                {retest && (
                  <button type="button" onClick={() => declineRetest(retest.id)} className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 text-xs font-bold">
                    Decline
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => grantRetest(record.studentId, exam.id)}
                  className="px-4 py-2 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Enable Retest
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {record.hasDetails ? (
        <QuestionReviewList answers={record.answers} perspective="admin" />
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex gap-2">
          <Info className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Question-by-question answers weren't saved for this older attempt. New attempts are saved automatically.</span>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Question analysis: per question, who got it right / wrong
// ---------------------------------------------------------------------------
const QuestionsTab = ({ records }) => {
  const assessments = useMemo(() => {
    const map = new Map();
    records.filter((r) => r.hasDetails).forEach((r) => {
      if (!map.has(r.assessmentKey)) map.set(r.assessmentKey, { key: r.assessmentKey, title: r.title, subjectName: r.subjectName, kind: r.kind, students: new Set() });
      map.get(r.assessmentKey).students.add(r.studentId);
    });
    return [...map.values()].sort((a, b) => b.students.size - a.students.size);
  }, [records]);
  const [key, setKey] = useState(assessments[0]?.key || '');
  const [expanded, setExpanded] = useState(null);

  const current = assessments.find((a) => a.key === key) || assessments[0];
  const analysis = useMemo(
    () => (current ? computeQuestionAnalysis(records.filter((r) => r.assessmentKey === current.key)) : []),
    [records, current]
  );

  if (!current) {
    return <p className="p-6 text-center text-xs text-slate-400">No detailed answers recorded yet.</p>;
  }

  const hardest = [...analysis].sort((a, b) => a.correctPct - b.correctPct).slice(0, 3).map((q) => q.index);

  return (
    <div className="space-y-3">
      <div className="p-3 bg-white dark:bg-surface-darkCard rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium space-y-1.5">
        <label htmlFor="qa-assessment" className="text-[11px] font-bold text-slate-500">Choose an exam or quiz</label>
        <select id="qa-assessment" value={current.key} onChange={(e) => { setKey(e.target.value); setExpanded(null); }} className={`${selectCls} w-full`}>
          {assessments.map((a) => (
            <option key={a.key} value={a.key}>
              {a.kind === 'exam' ? 'Exam' : a.kind === 'mock' ? 'Mock' : 'Quiz'}: {a.title} • {a.subjectName} ({a.students.size} student{a.students.size === 1 ? '' : 's'})
            </option>
          ))}
        </select>
        <p className="text-[11px] text-slate-400">Uses each student's latest attempt. Questions most students got wrong are marked "Tough".</p>
      </div>

      {analysis.map((q) => {
        const tone = pctTone(q.correctPct);
        const isOpen = expanded === q.index;
        return (
          <article key={q.index} className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Q{q.index + 1}</span>
                  {hardest.includes(q.index) && q.correctPct < 75 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300">Tough</span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed mt-0.5">{q.questionText || `Question ${q.index + 1}`}</p>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xl font-black ${tone.text}`}>{q.correctPct}%</div>
                <div className="text-[10px] text-slate-400 font-semibold">got it right</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="text-emerald-600 inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />{q.correct} right</span>
              <span className="text-red-500 inline-flex items-center gap-1"><X className="w-3.5 h-3.5" />{q.wrong} wrong</span>
              <span className="text-slate-400">{q.skipped} skipped</span>
            </div>

            {/* Option distribution */}
            <div className="space-y-1">
              {q.options.map((opt, oIdx) => {
                const count = q.optionCounts[oIdx] || 0;
                const pct = q.answered ? Math.round((count / q.answered) * 100) : 0;
                const isCorrect = oIdx === q.correctAnswer;
                return (
                  <div key={oIdx} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-5 h-5 rounded-md font-black flex items-center justify-center shrink-0 ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {optionLetter(oIdx)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <span className={`truncate ${isCorrect ? 'font-bold text-emerald-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>{opt}</span>
                        <span className="text-slate-400 font-semibold shrink-0">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-0.5">
                        <div className={`h-full rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(q.wrong > 0 || q.skipped > 0) && (
              <div>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : q.index)}
                  aria-expanded={isOpen}
                  className="text-[11px] font-bold text-[#087F8C] dark:text-cyan-300 inline-flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  {isOpen ? 'Hide' : 'Show'} who got it wrong ({q.wrong + q.skipped})
                </button>
                {isOpen && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {q.wrongStudents.map((s) => (
                      <span key={s.id} className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-[11px] font-semibold">
                        {s.name} <span className="font-black opacity-70">chose {optionLetter(s.selectedOption)}</span>
                      </span>
                    ))}
                    {q.skippedStudents.map((s) => (
                      <span key={s.id} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                        {s.name} <span className="opacity-70">skipped</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Subject marks matrix: students × subjects
// ---------------------------------------------------------------------------
const MarksTab = ({ records }) => {
  const [search, setSearch] = useState('');
  const latest = useMemo(() => latestPerAssessment(records), [records]);
  const subjects = [...new Set(latest.map((r) => r.subjectName))].sort();
  const students = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      if (!map.has(r.studentId)) map.set(r.studentId, { id: r.studentId, name: r.studentName, avatar: r.avatar, records: [] });
      map.get(r.studentId).records.push(r);
    });
    return [...map.values()]
      .map((s) => {
        const marks = computeSubjectMarks(s.records);
        const bySubject = Object.fromEntries(marks.map((m) => [m.subjectName, m.avgPct]));
        const overall = marks.length ? Math.round(marks.reduce((a, m) => a + m.avgPct, 0) / marks.length) : 0;
        return { ...s, bySubject, overall };
      })
      .sort((a, b) => b.overall - a.overall);
  }, [records]);

  const term = search.trim().toLowerCase();
  const visible = students.filter((s) => !term || (s.name || '').toLowerCase().includes(term));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student..."
          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
        />
      </div>
      <p className="text-[11px] text-slate-500 px-1">Average of each student's latest result per exam/quiz in the subject. "—" means not attempted.</p>
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase tracking-wider text-slate-500">
              <th scope="col" className="text-left font-bold px-3 py-2.5 sticky left-0 bg-slate-50 dark:bg-slate-900 min-w-[150px]">Student</th>
              <th scope="col" className="font-bold px-3 py-2.5 text-center">Overall</th>
              {subjects.map((s) => (
                <th key={s} scope="col" className="font-bold px-3 py-2.5 text-center min-w-[96px] max-w-[140px]" title={s}>
                  <span className="line-clamp-2 normal-case tracking-normal">{s}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {visible.map((s) => (
              <tr key={s.id}>
                <th scope="row" className="text-left px-3 py-2 sticky left-0 bg-white dark:bg-surface-darkCard font-bold text-slate-900 dark:text-white">
                  <span className="truncate block max-w-[170px]">{s.name}</span>
                </th>
                <td className="px-3 py-2 text-center">
                  <span className={`font-black ${pctTone(s.overall).text}`}>{s.overall}%</span>
                </td>
                {subjects.map((sub) => {
                  const v = s.bySubject[sub];
                  return (
                    <td key={sub} className="px-3 py-2 text-center">
                      {v === undefined ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className={`inline-block min-w-[44px] px-1.5 py-0.5 rounded-md font-bold ${pctTone(v).soft} ${pctTone(v).text}`}>{v}%</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Retests: requests, enabled, history, and enabling one directly
// ---------------------------------------------------------------------------
const RetestsTab = ({ records, retests }) => {
  const { grantRetest, declineRetest, revokeRetest } = useApp();
  const [studentId, setStudentId] = useState('');
  const [examId, setExamId] = useState('');

  const examRecords = records.filter((r) => r.kind === 'exam');
  const studentOptions = [...new Map(examRecords.map((r) => [r.studentId, r.studentName])).entries()].sort((a, b) => (a[1] || '').localeCompare(b[1] || ''));
  const examOptions = [...new Map(examRecords.filter((r) => r.studentId === studentId).map((r) => [r.examId, r.title])).entries()];

  const requested = retests.filter((r) => r.status === 'requested');
  const granted = retests.filter((r) => r.status === 'granted');
  const history = retests.filter((r) => !['requested', 'granted'].includes(r.status));

  const Card = ({ r, children }) => (
    <div className="p-3 sm:p-3.5 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        {r.avatar ? (
          <img src={r.avatar} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black shrink-0">{(r.studentName || '?').charAt(0)}</div>
        )}
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">{r.studentName}</p>
          <p className="text-[11px] text-slate-500 truncate">{r.examTitle} • {r.subjectName}</p>
          {r.reason && <p className="text-[11px] text-slate-600 dark:text-slate-300 italic truncate">"{r.reason}"</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Enable directly */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (studentId && examId) {
            grantRetest(studentId, examId);
            setExamId('');
          }
        }}
        className="p-3.5 bg-white dark:bg-surface-darkCard rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium space-y-2"
      >
        <p className="text-xs font-extrabold text-slate-900 dark:text-white">Enable a retest</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <select aria-label="Student" value={studentId} onChange={(e) => { setStudentId(e.target.value); setExamId(''); }} className={selectCls}>
            <option value="">Choose student…</option>
            {studentOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <select aria-label="Exam" value={examId} onChange={(e) => setExamId(e.target.value)} disabled={!studentId} className={`${selectCls} disabled:opacity-50`}>
            <option value="">{studentId ? 'Choose an exam they took…' : 'Choose a student first'}</option>
            {examOptions.map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
          <button type="submit" disabled={!studentId || !examId} className="px-4 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Enable
          </button>
        </div>
      </form>

      <section className="space-y-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Requests ({requested.length})</h2>
        {requested.length === 0 && <p className="text-xs text-slate-400 px-1">No pending requests.</p>}
        {requested.map((r) => (
          <Card key={r.id} r={r}>
            <button type="button" onClick={() => declineRetest(r.id)} className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 text-xs font-bold">Decline</button>
            <button type="button" onClick={() => grantRetest(r.studentId, r.examId)} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Approve</button>
          </Card>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Enabled, not taken yet ({granted.length})</h2>
        {granted.length === 0 && <p className="text-xs text-slate-400 px-1">None.</p>}
        {granted.map((r) => (
          <Card key={r.id} r={r}>
            <span className="text-[11px] text-slate-400">since {formatDate(r.grantedAt)}</span>
            <button type="button" onClick={() => revokeRetest(r.id)} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">Revoke</button>
          </Card>
        ))}
      </section>

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">History</h2>
          {history.map((r) => (
            <Card key={r.id} r={r}>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  r.status === 'used' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {r.status === 'used' ? 'Retest taken' : r.status}
              </span>
              <span className="text-[11px] text-slate-400">{formatDate(r.usedAt || r.declinedAt || r.revokedAt)}</span>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
};
