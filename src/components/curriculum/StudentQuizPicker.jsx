import React from 'react';
import { Lock, Award, CalendarDays, Layers, PlayCircle, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { groupQuestionsBySection, testKeyOf, dayQuizSettings } from '../../utils/curriculumSections';

// Colours per level (by the level's colour, so renamed levels keep theirs)
const LEVEL_TONE = {
  emerald: { bar: 'bg-emerald-500', dot: 'bg-emerald-500', btn: 'border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' },
  amber: { bar: 'bg-amber-500', dot: 'bg-amber-500', btn: 'border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40' },
  red: { bar: 'bg-rose-500', dot: 'bg-rose-500', btn: 'border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40' }
};
const toneOf = (color) => LEVEL_TONE[color] || LEVEL_TONE.amber;

const scoreTone = (pct) =>
  pct >= 75 ? { ring: '#10b981', text: 'text-emerald-600 dark:text-emerald-400' } : pct >= 50 ? { ring: '#f59e0b', text: 'text-amber-600 dark:text-amber-400' } : { ring: '#f43f5e', text: 'text-rose-600 dark:text-rose-400' };

/** Small circular score (last attempt). */
const ScoreRing = ({ pct }) => {
  const r = 18;
  const c = 2 * Math.PI * r;
  const tone = scoreTone(pct);
  return (
    <div className="relative w-12 h-12 shrink-0" title={`Your last score: ${pct}%`} aria-label={`Last score ${pct}%`}>
      <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" className="stroke-slate-100 dark:stroke-slate-800" />
        <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" strokeLinecap="round" stroke={tone.ring} strokeDasharray={c} strokeDashoffset={c - (c * Math.max(0, Math.min(100, pct))) / 100} />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-black ${tone.text}`}>{pct}%</span>
    </div>
  );
};

/**
 * Student: pick a practice test in a module: a section's Day, at a level (All / Basic / Medium /
 * Advanced). Shows each day's last score; when retest is off for that day, a taken day shows its result.
 * onStart(target, level), onViewResults(target) (left out when the admin hides Results)
 */
export const StudentQuizPicker = ({ module, myAttempts = [], onStart, onViewResults }) => {
  const { difficultyLevels, matchesDifficulty } = useApp();
  const { groups, unsorted } = groupQuestionsBySection(module);

  const attemptsFor = (key) =>
    myAttempts
      .filter((a) => (a.sectionId ? testKeyOf(a.sectionId, a.day) : 'general') === key)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const TestCard = ({ badge, title, target, questions }) => {
    const key = target.general ? 'general' : testKeyOf(target.sectionId, target.day);
    const tries = attemptsFor(key);
    const last = tries[0];
    const best = tries.length ? Math.max(...tries.map((a) => Number(a.scorePct) || 0)) : null;
    const retestAllowed = dayQuizSettings(
      module,
      target.general ? null : target.sectionId,
      target.general ? null : target.day
    ).allowRetest;
    const locked = !retestAllowed && !!last;
    const pct = last ? Number(last.scorePct) || 0 : null;
    const levels = difficultyLevels
      .map((lvl) => ({ ...lvl, count: questions.filter((q) => matchesDifficulty(q.difficulty, lvl.id)).length }))
      .filter((l) => l.count > 0);

    return (
      <article className="group bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:shadow-teal-900/5 hover:border-teal-500/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-start gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0C4E5B] to-[#14B8A6] text-white flex flex-col items-center justify-center leading-none shrink-0 shadow-sm shadow-teal-900/20">
            {badge}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{title}</h4>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
              {tries.length > 0 && (
                <>
                  {' · '}
                  {tries.length} {tries.length === 1 ? 'attempt' : 'attempts'}
                  {tries.length > 1 && ` · best ${best}%`}
                </>
              )}
            </p>
            {!last && (
              <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <Sparkles className="w-3 h-3" /> Not started
              </span>
            )}
          </div>
          {last && <ScoreRing pct={pct} />}
        </div>

        {/* Level mix */}
        {levels.length > 0 && (
          <div className="px-4">
            <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800" aria-hidden="true">
              {levels.map((l) => (
                <span key={l.id} className={toneOf(l.color).bar} style={{ width: `${(l.count / questions.length) * 100}%` }} />
              ))}
            </div>
            <p className="mt-1.5 flex items-center gap-3 flex-wrap text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {levels.map((l) => (
                <span key={l.id} className="inline-flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${toneOf(l.color).dot}`} />
                  {l.count} {l.label}
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto p-4 pt-3">
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            {questions.length === 0 ? (
              <p className="text-[11px] text-slate-400">No questions yet.</p>
            ) : locked ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Taken · one attempt only
                </span>
                {onViewResults && (
                  <button
                    type="button"
                    onClick={() => onViewResults(target)}
                    className="h-9 px-3.5 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" /> View result
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onStart(target, 'All')}
                  className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 shadow-sm shadow-teal-900/20 active:scale-[0.98] transition-all"
                >
                  {last ? <RotateCcw className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  {last ? 'Practice again' : 'Start practice'} · All {questions.length}
                </button>
                {levels.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-center mr-0.5">Or one level:</span>
                    {levels.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => onStart(target, l.label)}
                        className={`px-2.5 py-1 rounded-lg border bg-white dark:bg-slate-900 text-[11px] font-bold transition-colors ${toneOf(l.color).btn}`}
                      >
                        {l.label} · {l.count}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  const sectionsWithQuestions = groups.filter((g) => g.days.some((d) => d.questions.length > 0));

  if (sectionsWithQuestions.length === 0 && unsorted.length === 0) {
    return (
      <div className="p-10 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
        <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No practice questions yet</p>
        <p className="text-xs text-slate-400">Your instructor hasn&apos;t added questions to this module yet.</p>
      </div>
    );
  }

  const dayBadge = (day) => (
    <>
      <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">Day</span>
      <span className="text-lg font-black">{day}</span>
    </>
  );

  return (
    <div className="space-y-6">
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        Choose a day to practise. Each day is its own test, and your result is saved for that day.
      </p>

      {sectionsWithQuestions.map((g) => {
        const days = g.days.filter((d) => d.questions.length > 0);
        const done = days.filter((d) => attemptsFor(testKeyOf(g.section.id, d.day)).length > 0).length;
        const totalQ = days.reduce((n, d) => n + d.questions.length, 0);
        return (
          <section key={g.section.id} className="space-y-3">
            <header className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#087F8C] text-white flex flex-col items-center justify-center leading-none shrink-0">
                <span className="text-[7px] font-bold uppercase opacity-80">Sec</span>
                <span className="text-sm font-black">{g.sectionIndex + 1}</span>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">{g.section.title}</h3>
                <p className="text-[11px] text-slate-500">
                  {days.length} {days.length === 1 ? 'day' : 'days'} · {totalQ} {totalQ === 1 ? 'question' : 'questions'}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${done === days.length ? 'text-emerald-500' : 'text-slate-300'}`} />
                  {done}/{days.length} done
                </p>
                <div className="mt-1 w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ml-auto">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(done / days.length) * 100}%` }} />
                </div>
              </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {days.map((d) => (
                <TestCard
                  key={d.day}
                  badge={dayBadge(d.day)}
                  title={`Day ${d.day}`}
                  target={{ sectionId: g.section.id, day: d.day }}
                  questions={d.questions}
                />
              ))}
            </div>
          </section>
        );
      })}

      {unsorted.length > 0 && (
        <section className="space-y-3">
          <header className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">More practice</h3>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <TestCard badge={<Layers className="w-5 h-5" />} title="General practice" target={{ general: true }} questions={unsorted} />
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentQuizPicker;
