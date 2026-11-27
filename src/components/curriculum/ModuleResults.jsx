import React, { useMemo, useState } from 'react';
import { Search, Users, ClipboardCheck, Trophy, Target, Check, X, PlayCircle, BarChart3, ListChecks, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { normalizeQuizAttempt, optionLetter } from '../../utils/assessmentRecords';
import { AttemptRow, AttemptReview, BackLink, pctTone } from '../review/ResultViews';
import { testKeyOf, testLabelOf, dayQuizSettings } from '../../utils/curriculumSections';

const avg = (nums) => (nums.length ? Math.round(nums.reduce((s, n) => s + n, 0) / nums.length) : 0);

/** Each student's most recent attempt of this module (any difficulty mode). */
const latestPerStudent = (records) => {
  const seen = new Map();
  records.forEach((r) => {
    const cur = seen.get(r.studentId);
    if (!cur || r.time > cur.time) seen.set(r.studentId, r);
  });
  return [...seen.values()];
};

/** Per question (matched by its text): right / wrong / skipped across each student's latest attempt. */
const analyseQuestions = (records) => {
  const map = new Map();
  latestPerStudent(records)
    .filter((r) => r.hasDetails)
    .forEach((r) => {
      r.answers.forEach((a) => {
        const key = (a.questionText || '').trim();
        if (!key) return;
        if (!map.has(key)) {
          map.set(key, {
            key,
            questionText: a.questionText,
            options: a.options,
            correctAnswer: a.correctAnswer,
            correct: 0,
            wrong: 0,
            skipped: 0,
            optionCounts: a.options.map(() => 0),
            wrongStudents: []
          });
        }
        const q = map.get(key);
        if (a.selectedOption === null) q.skipped++;
        else {
          if (q.optionCounts[a.selectedOption] !== undefined) q.optionCounts[a.selectedOption]++;
          if (a.isCorrect) q.correct++;
          else {
            q.wrong++;
            q.wrongStudents.push({ id: r.studentId, name: r.studentName, selectedOption: a.selectedOption });
          }
        }
      });
    });
  return [...map.values()]
    .map((q) => {
      const answered = q.correct + q.wrong + q.skipped;
      return { ...q, answered, correctPct: answered ? Math.round((q.correct / answered) * 100) : 0 };
    })
    .sort((a, b) => a.correctPct - b.correctPct); // hardest first
};

const Tile = ({ Icon, label, value, tone = 'text-slate-900 dark:text-white' }) => (
  <div className="p-3 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-2xs">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
    <div className={`text-xl sm:text-2xl font-black mt-1 ${tone}`}>{value}</div>
  </div>
);

/**
 * Results of a module's practice quiz, shown inside Subjects & Curriculum.
 * perspective 'admin': every student's attempts (correct, wrong, time, answers) and a per-question breakdown.
 * perspective 'student': the student's own attempts with every answer.
 */
export const ModuleResults = ({ module, perspective = 'student', onPractice, onRetest }) => {
  const { curriculumAttempts, currentUser, students } = useApp();
  const admin = perspective === 'admin';
  const myId = currentUser?.id;
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('students'); // admin: 'students' | 'questions'
  const [openQuestion, setOpenQuestion] = useState(null);
  const [testFilter, setTestFilter] = useState('all'); // 'all' or a test key (section day)

  const allRecords = useMemo(() => {
    const rollOf = new Map((students || []).map((s) => [s.id, s.studentId]));
    return (curriculumAttempts || [])
      .filter((a) => a.moduleId === module.id && (admin || a.studentId === myId))
      .map((a) => {
        const r = normalizeQuizAttempt(a);
        return { ...r, rollNo: rollOf.get(a.studentId) || '', testKey: testKeyOf(r.sectionId, r.day) };
      })
      .sort((a, b) => b.time - a.time);
  }, [curriculumAttempts, module.id, admin, myId, students]);

  // The practice tests that have results: Section 1 · Day 1, Day 2 ... (in section order), then general
  const sectionOrder = new Map((module.sections || []).map((sec, i) => [sec.id, i]));
  const tests = [...new Map(allRecords.map((r) => [r.testKey, r])).values()]
    .map((r) => ({
      key: r.testKey,
      label: testLabelOf(module, r.sectionId, r.day),
      order: r.sectionId ? (sectionOrder.get(r.sectionId) ?? 99) * 1000 + (r.day || 1) : 999999,
      count: allRecords.filter((x) => x.testKey === r.testKey).length
    }))
    .sort((a, b) => a.order - b.order);
  const records = testFilter === 'all' ? allRecords : allRecords.filter((r) => r.testKey === testFilter);

  const selected = records.find((r) => r.id === selectedId);

  if (selected) {
    // The same student's attempts of this module, oldest first, to switch between
    const attempts = allRecords
      .filter((r) => r.studentId === selected.studentId && r.testKey === selected.testKey)
      .sort((a, b) => a.time - b.time);
    return (
      <div className="space-y-3">
        <BackLink onClick={() => setSelectedId(null)} label={admin ? 'Back to results' : 'Back to my results'} />
        <AttemptReview record={selected} attempts={attempts} onSelect={setSelectedId} perspective={admin ? 'admin' : 'student'}>
          {(() => {
            // Students: take the same day (and level) again, when the admin allows a retest for it
            if (admin || !onRetest) return null;
            if (!dayQuizSettings(module, selected.sectionId, selected.day).allowRetest) return null;
            const raw = (curriculumAttempts || []).find((a) => a.id === selected.id);
            const mode = raw?.difficultyMode || 'All Questions';
            const level = mode === 'All Questions' ? 'All' : mode.replace(/ Mode$/, '');
            const label = testLabelOf(module, selected.sectionId, selected.day);
            return (
              <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <RotateCcw className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">Retest available</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Take {label}
                      {level !== 'All' ? ` (${level})` : ''} again. This result stays in your history.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRetest(selected.sectionId ? { sectionId: selected.sectionId, day: selected.day } : { general: true }, level)}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <RotateCcw className="w-4 h-4" /> Retest
                </button>
              </div>
            );
          })()}
        </AttemptReview>
      </div>
    );
  }

  const latest = latestPerStudent(records);
  const studentCount = latest.length;

  if (allRecords.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
        <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {admin ? 'No student has taken this quiz yet' : "You haven't taken this quiz yet"}
        </p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {admin
            ? 'Each attempt shows up here with correct and wrong answers, marks and time taken.'
            : 'After a practice quiz, your score and every answer are saved here so you can review them.'}
        </p>
        {!admin && onPractice && (
          <button
            type="button"
            onClick={onPractice}
            className="mt-2 px-4 py-2 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4" /> Start practice
          </button>
        )}
      </div>
    );
  }

  const term = search.trim().toLowerCase().replace(/\s+/g, '');
  const shown = admin && term
    ? records.filter((r) => `${r.studentName || ''}${r.rollNo || ''}`.toLowerCase().replace(/\s+/g, '').includes(term))
    : records;
  const analysis = admin && view === 'questions' ? analyseQuestions(records) : [];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Which practice test (section day) */}
      {tests.length > 1 && (
        <div role="group" aria-label="Practice test" className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {[{ key: 'all', label: 'All tests', count: allRecords.length }, ...tests].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTestFilter(t.key);
                setOpenQuestion(null);
              }}
              aria-pressed={testFilter === t.key}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-colors ${
                testFilter === t.key
                  ? 'bg-[#087F8C] border-[#087F8C] text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#087F8C]/50'
              }`}
            >
              {t.label} <span className="opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {admin ? (
          <>
            <Tile Icon={Users} label="Students" value={studentCount} />
            <Tile Icon={ListChecks} label="Attempts" value={records.length} />
            <Tile Icon={Target} label="Average" value={`${avg(latest.map((r) => r.pct))}%`} tone={pctTone(avg(latest.map((r) => r.pct))).text} />
            <Tile Icon={Trophy} label="Passed" value={`${latest.filter((r) => r.pct >= 60).length}/${studentCount}`} />
          </>
        ) : (
          <>
            <Tile Icon={ListChecks} label="Attempts" value={records.length} />
            <Tile Icon={Trophy} label="Best" value={`${Math.max(...records.map((r) => r.pct))}%`} tone={pctTone(Math.max(...records.map((r) => r.pct))).text} />
            <Tile Icon={Target} label="Last score" value={`${records[0].pct}%`} tone={pctTone(records[0].pct).text} />
            <Tile Icon={Check} label="Last: correct" value={`${records[0].correct}/${records[0].total}`} />
          </>
        )}
      </div>

      {admin && (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div role="group" aria-label="Show" className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 self-start">
            {[
              { id: 'students', label: 'Students', Icon: Users },
              { id: 'questions', label: 'Questions', Icon: BarChart3 }
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-pressed={view === id}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${
                  view === id ? 'bg-white dark:bg-slate-800 text-[#087F8C] dark:text-teal-300 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
          {view === 'students' && (
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search students"
                placeholder="Search student name or roll no..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
              />
            </div>
          )}
        </div>
      )}

      {(!admin || view === 'students') && (
        <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-2xs">
          {shown.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">No students match.</p>
          ) : (
            shown.map((r) => (
              <AttemptRow key={r.id} record={r} showStudent={admin} showKind={false} onClick={() => setSelectedId(r.id)} />
            ))
          )}
        </div>
      )}

      {admin && view === 'questions' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-slate-400">Each student&apos;s latest attempt. Hardest questions first.</p>
          {analysis.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No detailed answers saved yet.</p>}
          {analysis.map((q, i) => {
            const tone = pctTone(q.correctPct);
            const open = openQuestion === q.key;
            return (
              <article key={q.key} className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed min-w-0">
                    <span className="text-[10px] font-extrabold text-slate-400 mr-1.5">#{i + 1}</span>
                    {q.questionText}
                  </p>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-black ${tone.text}`}>{q.correctPct}%</div>
                    <div className="text-[10px] text-slate-400 font-semibold">got it right</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="text-emerald-600 inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />{q.correct} right</span>
                  <span className="text-red-500 inline-flex items-center gap-1"><X className="w-3.5 h-3.5" />{q.wrong} wrong</span>
                  <span className="text-slate-400">{q.skipped} skipped</span>
                </div>
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
                {q.wrongStudents.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(open ? null : q.key)}
                      aria-expanded={open}
                      className="text-[11px] font-bold text-[#087F8C] dark:text-cyan-300 inline-flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" /> {open ? 'Hide' : 'Show'} who got it wrong ({q.wrongStudents.length})
                    </button>
                    {open && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.wrongStudents.map((s) => (
                          <span key={s.id} className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-[11px] font-semibold">
                            {s.name} <span className="font-black opacity-70">chose {optionLetter(s.selectedOption)}</span>
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
      )}
    </div>
  );
};

export default ModuleResults;
