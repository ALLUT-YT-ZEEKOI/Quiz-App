import React from 'react';
import {
  Plus,
  FileText,
  Trash2,
  Pencil,
  Check,
  CalendarDays,
  Inbox,
  HelpCircle,
  X,
  RotateCcw,
  Shuffle,
  ListOrdered,
  Timer,
  MinusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { confirmDialog } from '../common/ConfirmDialog';
import { Highlight, questionMatches } from '../common/QuestionSearch';
import { groupQuestionsBySection, sectionDays, dayQuizSettings, dayLabelOf } from '../../utils/curriculumSections';
import { CurriculumSection } from './CurriculumSection';

const levelTone = (color) =>
  color === 'emerald'
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
    : color === 'red'
    ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800/60'
    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';

const smallBtn =
  'px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-colors whitespace-nowrap';

/**
 * One-tap permission chips on the Day row: tap to flip, no panel.
 * Retest shows amber either way (Retest on / One try). Shuffle chips fill when on.
 */
const TIMER_PRESETS = [5, 10, 15, 20, 30, 45, 60];

/** "Timer" chip: no limit, or minutes for the whole test. Opens a small picker. */
const TimerChip = ({ minutes = 0, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [custom, setCustom] = React.useState('');
  const on = minutes > 0;
  const pick = (m) => {
    onChange({ timeLimitMinutes: m });
    setOpen(false);
    setCustom('');
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={on ? `Students get ${minutes} minutes for this test — tap to change` : 'No time limit — tap to set a timer'}
        className={`h-7 px-2 rounded-lg text-[10px] sm:text-[11px] font-extrabold border inline-flex items-center gap-1 transition-all active:scale-[0.97] ${
          on
            ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 hover:text-slate-600'
        }`}
      >
        <Timer className="w-3 h-3 shrink-0" />
        <span className="whitespace-nowrap">{on ? `${minutes} min` : 'Timer'}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-full mt-1.5 z-40 w-60 p-3 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-700 shadow-xl space-y-2.5">
            <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">Time limit for this test</p>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => pick(0)}
                className={`py-1.5 rounded-lg text-[11px] font-bold border ${!on ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-400'}`}
              >
                Off
              </button>
              {TIMER_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => pick(m)}
                  className={`py-1.5 rounded-lg text-[11px] font-bold border ${minutes === m ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-400'}`}
                >
                  {m}m
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const m = Math.round(Number(custom));
                if (m > 0) pick(m);
              }}
              className="flex gap-1.5"
            >
              <input
                type="number"
                min="1"
                max="600"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Other (min)"
                aria-label="Custom minutes"
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <button type="submit" disabled={!(Number(custom) > 0)} className="px-2.5 rounded-lg bg-violet-600 disabled:opacity-40 text-white text-[11px] font-bold">
                Set
              </button>
            </form>
            <p className="text-[10px] text-slate-400 leading-snug">The quiz submits itself when time runs out.</p>
          </div>
        </>
      )}
    </div>
  );
};

const NEGATIVE_PRESETS = [0.25, 0.33, 0.5, 1];

/** "− Marks" chip: marks taken off for each wrong answer (Off = no negative marking). */
const NegativeMarkChip = ({ value = 0, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [custom, setCustom] = React.useState('');
  const on = value > 0;
  const pick = (v) => {
    onChange({ negativeMark: v });
    setOpen(false);
    setCustom('');
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={on ? `Each wrong answer takes off ${value} mark — tap to change` : 'No negative marking — tap to set minus marks'}
        className={`h-7 px-2 rounded-lg text-[10px] sm:text-[11px] font-extrabold border inline-flex items-center gap-1 transition-all active:scale-[0.97] ${
          on
            ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 hover:text-slate-600'
        }`}
      >
        <MinusCircle className="w-3 h-3 shrink-0" />
        <span className="whitespace-nowrap">{on ? `−${value} / wrong` : '− Marks'}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-full mt-1.5 z-40 w-64 p-3 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-700 shadow-xl space-y-2.5">
            <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">Minus marks for each wrong answer</p>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => pick(0)}
                className={`py-1.5 rounded-lg text-[11px] font-bold border ${!on ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-400'}`}
              >
                Off
              </button>
              {NEGATIVE_PRESETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => pick(v)}
                  className={`py-1.5 rounded-lg text-[11px] font-bold border ${value === v ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-400'}`}
                >
                  −{v}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = Number(custom);
                if (v > 0) pick(v);
              }}
              className="flex gap-1.5"
            >
              <input
                type="number"
                min="0.01"
                max="4"
                step="0.01"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Other, e.g. 0.2"
                aria-label="Custom minus marks"
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <button type="submit" disabled={!(Number(custom) > 0)} className="px-2.5 rounded-lg bg-rose-600 disabled:opacity-40 text-white text-[11px] font-bold">
                Set
              </button>
            </form>
            <p className="text-[10px] text-slate-400 leading-snug">Correct = +1. Wrong = minus this. Skipped = 0.</p>
          </div>
        </>
      )}
    </div>
  );
};


/**
 * The dark "Day 1" pill of a day. Click the pencil to give the day a name (e.g. "Orientation");
 * clear it to go back to "Day 1". Students see the same name.
 */
const DayNameChip = ({ day, label, onRename }) => {
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(label);
  const custom = label !== `Day ${day}`;
  const start = () => {
    setText(label);
    setEditing(true);
  };
  const save = () => {
    setEditing(false);
    if (text.trim() !== label) onRename(text.trim());
  };
  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex items-center gap-1"
      >
        <input
          autoFocus
          value={text}
          maxLength={60}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setEditing(false);
            }
          }}
          placeholder={`Day ${day}`}
          aria-label={`Name for Day ${day}`}
          className="w-40 sm:w-48 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border-2 border-[#087F8C] text-slate-900 dark:text-white focus:outline-none"
        />
        <button
          type="submit"
          onMouseDown={(e) => e.preventDefault()}
          className="p-1 rounded-lg bg-[#087F8C] text-white"
          title="Save name"
          aria-label="Save day name"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </form>
    );
  }
  return (
    <button
      type="button"
      onClick={start}
      title={`Rename ${label}${custom ? ` (Day ${day})` : ''}`}
      aria-label={`Rename ${label}`}
      className="group px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-black inline-flex items-center gap-1.5 hover:bg-slate-800 transition-colors max-w-[16rem]"
    >
      {custom && <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 shrink-0">D{day}</span>}
      <span className="truncate">{label}</span>
      <Pencil className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0" />
    </button>
  );
};

const QuizSettingChips = ({ settings, onChange }) => {
  const off =
    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 hover:text-slate-600';
  const onTeal = 'bg-[#087F8C] border-[#087F8C] text-white shadow-xs';
  const retestOn = 'bg-amber-500 border-amber-500 text-white shadow-xs';
  const oneTry = 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300';

  const items = [
    {
      key: 'allowRetest',
      pressed: settings.allowRetest,
      label: settings.allowRetest ? 'Retest on' : 'One try',
      Icon: RotateCcw,
      className: settings.allowRetest ? retestOn : oneTry,
      title: settings.allowRetest
        ? 'Retest allowed — tap for one attempt only'
        : 'One attempt only — tap to allow retest'
    },
    {
      key: 'shuffleQuestions',
      pressed: settings.shuffleQuestions,
      label: 'Shuffle Q',
      Icon: Shuffle,
      className: settings.shuffleQuestions ? onTeal : off,
      title: settings.shuffleQuestions
        ? 'Questions are shuffled — tap to turn off'
        : 'Fixed question order — tap to shuffle'
    },
    {
      key: 'shuffleOptions',
      pressed: settings.shuffleOptions,
      label: 'Shuffle A',
      Icon: ListOrdered,
      className: settings.shuffleOptions ? onTeal : off,
      title: settings.shuffleOptions
        ? 'Answer options are shuffled — tap to turn off'
        : 'Fixed answer order — tap to shuffle'
    }
  ];

  return (
    <div className="inline-flex items-center gap-1 flex-wrap" role="group" aria-label="Quiz settings">
      <TimerChip minutes={settings.timeLimitMinutes || 0} onChange={onChange} />
      <NegativeMarkChip value={settings.negativeMark || 0} onChange={onChange} />
      {items.map(({ key, pressed, label, Icon, className, title }) => (
        <button
          key={key}
          type="button"
          title={title}
          aria-pressed={pressed}
          onClick={() => onChange({ [key]: !pressed })}
          className={`h-7 px-2 rounded-lg text-[10px] sm:text-[11px] font-extrabold border inline-flex items-center gap-1 transition-all active:scale-[0.97] ${className}`}
        >
          <Icon className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * Admin: a module's questions organised as Section -> Day -> questions (Basic / Medium / Advanced),
 * with older questions under "Unsorted" until they are moved into a section and day.
 * levelFilter: 'All' or a level label, from the filter above.
 * onAdd(target) / onBulk(target): open the add / bulk-upload window for { sectionId, day }.
 * onEdit(question): open the question window to edit that question.
 * onEditSection(section): open the window to rename a section.
 * search: a word to look for (question, options, explanation); only matching questions are shown.
 */
export const ModuleQuestionsBoard = ({ subject, module, levelFilter = 'All', search = '', onAdd, onBulk, onEdit, onEditSection }) => {
  const {
    difficultyLevels,
    getDifficultyMeta,
    matchesDifficulty,
    deleteCurriculumQuestion,
    moveCurriculumQuestion,
    addSectionDay,
    removeSectionDay,
    renameSectionDay,
    updateDayQuizSettings,
    updateModule
  } = useApp();

  const { groups, unsorted } = groupQuestionsBySection(module);
  const searching = search.trim().length > 0;
  const show = (q) =>
    (levelFilter === 'All' || matchesDifficulty(q.difficulty, levelFilter)) && questionMatches(q, search);

  // "Section 1 · Day 2" choices for moving a question
  const targets = groups.flatMap((g) =>
    sectionDays(module, g.section.id).map((day) => ({
      value: `${g.section.id}|${day}`,
      label: `${g.section.title} · ${dayLabelOf(module, g.section.id, day)}`
    }))
  );

  const levelCounts = (questions) =>
    difficultyLevels
      .map((lvl) => ({ ...lvl, count: questions.filter((q) => matchesDifficulty(q.difficulty, lvl.id)).length }))
      .filter((l) => l.count > 0);

  const QuestionCard = ({ q, number, movable, current }) => {
    const meta = getDifficultyMeta(q.difficulty);
    return (
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs hover:border-[#20B8C7]/50 transition-all flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-[11px] shrink-0 font-mono">
              Q{number}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${levelTone(meta.color)}`}>
              {meta.label}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(q)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#087F8C] hover:bg-[#E8F3F4] dark:hover:bg-slate-800 transition-colors"
                title="Edit question & answers"
                aria-label={`Edit question ${number}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                const ok = await confirmDialog({
                  title: 'Delete this question?',
                  message: q.question,
                  confirmLabel: 'Delete',
                  tone: 'danger'
                });
                if (ok) deleteCurriculumQuestion(subject.id, module.id, q.id);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete question"
              aria-label="Delete question"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug line-clamp-3 mb-2.5" title={q.question}>
          <Highlight text={q.question} term={search} />
        </h4>
        <div className="space-y-1.5">
          {(q.options || []).map((opt, oIdx) => {
            const isCorrect = oIdx === q.correctAnswer;
            return (
              <div
                key={oIdx}
                className={`px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-2 border ${
                  isCorrect
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 font-bold text-emerald-950 dark:text-emerald-200'
                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded text-[9px] flex items-center justify-center font-bold shrink-0 ${
                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {String.fromCharCode(65 + oIdx)}
                </span>
                <span className={`flex-1 ${searching ? '' : 'truncate'}`}>
                  <Highlight text={opt} term={search} />
                </span>
                {isCorrect && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
              </div>
            );
          })}
        </div>
        {q.explanation && (
          <div className="mt-2.5 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 text-[10px] text-blue-900 dark:text-blue-200 border border-blue-200/60 dark:border-blue-900/50 line-clamp-2 leading-tight" title={q.explanation}>
            <strong>Sol:</strong> <Highlight text={q.explanation} term={search} />
          </div>
        )}
        {movable && targets.length > 0 && (
          <label className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span className="shrink-0">{current ? 'Move to' : 'Put in'}</span>
            <select
              value={current || ''}
              onChange={(e) => {
                const [sectionId, day] = e.target.value.split('|');
                moveCurriculumQuestion(subject.id, module.id, q.id, sectionId ? { sectionId, day: Number(day) } : null);
              }}
              className="flex-1 min-w-0 px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              {!current && <option value="">Choose section & day…</option>}
              {targets.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    );
  };

  const anyQuestions = (module.questions || []).length > 0;

  return (
    <div key={searching ? 'search-results' : 'sections'} className="space-y-4">
      {searching && !(module.questions || []).some(show) && (
        <p className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          No questions contain &ldquo;{search.trim()}&rdquo;.
        </p>
      )}

      {groups.map((g) => {
        if (searching && !g.days.some((d) => d.questions.some(show))) return null;
        const sectionTotal = g.days.reduce((n, d) => n + d.questions.length, 0);
        return (
          <CurriculumSection
            key={g.section.id}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 overflow-hidden"
            headerClassName="bg-white dark:bg-surface-darkCard"
            title={g.section.title}
            summary={`${g.days.length} ${g.days.length === 1 ? 'day' : 'days'} • ${sectionTotal} ${sectionTotal === 1 ? 'question' : 'questions'}`}
            defaultOpen={searching}
            badge={
              <span aria-hidden="true" className="w-9 h-9 rounded-xl bg-[#087F8C] text-white flex flex-col items-center justify-center leading-none shrink-0">
                <span className="text-[7px] font-bold uppercase opacity-80">Sec</span>
                <span className="text-sm font-black">{g.sectionIndex + 1}</span>
              </span>
            }
            actions={
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => addSectionDay(subject.id, module.id, g.section.id)}
                  className={`${smallBtn} bg-[#E6F4F6] dark:bg-[#0E353E] border-[#087F8C]/20 text-[#0C4E5B] dark:text-cyan-300 hover:bg-[#d4eef1]`}
                >
                  <CalendarDays className="w-3.5 h-3.5" /> Add Day {g.days.length + 1}
                </button>
                {onEditSection && (
                  <button
                    type="button"
                    onClick={() => onEditSection(g.section)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#087F8C] hover:bg-[#E8F3F4] dark:hover:bg-slate-800"
                    title="Rename section"
                    aria-label={`Rename ${g.section.title}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            }
          >

            <div className="p-3 sm:p-4 space-y-4">
              {g.days.map(({ day, questions }) => {
                const shown = questions.filter(show);
                if (searching && shown.length === 0) return null;
                const counts = levelCounts(questions);
                const settings = dayQuizSettings(module, g.section.id, day);
                const setDay = (fields) =>
                  updateDayQuizSettings(subject.id, module.id, g.section.id, day, fields);
                const dayName = dayLabelOf(module, g.section.id, day);
                return (
                  <div key={day} className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <DayNameChip
                          day={day}
                          label={dayName}
                          onRename={(name) => renameSectionDay(subject.id, module.id, g.section.id, day, name)}
                        />
                        {counts.length === 0 ? (
                          <span className="text-[11px] text-slate-400">No questions yet</span>
                        ) : (
                          counts.map((c) => (
                            <span key={c.id} className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${levelTone(c.color)}`}>
                              {c.count} {c.label}
                            </span>
                          ))
                        )}
                        <QuizSettingChips settings={settings} onChange={setDay} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onBulk({ sectionId: g.section.id, day })}
                          className={`${smallBtn} bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-500" /> Bulk
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdd({ sectionId: g.section.id, day })}
                          className={`${smallBtn} bg-[#087F8C] hover:bg-[#0C4E5B] border-[#087F8C] text-white`}
                        >
                          <Plus className="w-3.5 h-3.5" /> Question
                        </button>
                        {g.days.length > 1 && (
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await confirmDialog({
                                title: `Remove ${dayName} from ${g.section.title}?`,
                                message: questions.length
                                  ? questions.length === 1
                                    ? 'Its question won\'t be deleted: it moves to "Unsorted". Later days move up by one.'
                                    : `Its ${questions.length} questions won't be deleted: they move to "Unsorted". Later days move up by one.`
                                  : 'This day has no questions. Later days move up by one.',
                                confirmLabel: `Remove ${dayName}`,
                                tone: 'warning'
                              });
                              if (ok) removeSectionDay(subject.id, module.id, g.section.id, day);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title={`Remove ${dayName}`}
                            aria-label={`Remove ${dayName}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {shown.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {shown.map((q, i) => (
                          <QuestionCard key={q.id} q={q} number={i + 1} movable current={`${g.section.id}|${day}`} />
                        ))}
                      </div>
                    ) : questions.length > 0 ? (
                      <p className="text-[11px] text-slate-400 px-1">No {levelFilter} questions in {dayName}.</p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAdd({ sectionId: g.section.id, day })}
                        className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-400 hover:text-[#087F8C] hover:border-[#087F8C]/50"
                      >
                        + Add the first question for {dayName}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </CurriculumSection>
        );
      })}

      {unsorted.length > 0 && (!searching || unsorted.some(show)) && (
        <CurriculumSection
          className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/10 overflow-hidden"
          title={`Unsorted questions (${unsorted.length})`}
          summary="Students practise these as “General practice”."
          defaultOpen={searching}
          badge={<Inbox aria-hidden="true" className="w-5 h-5 text-amber-600 shrink-0" />}
        >
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-4 pt-3">
            <QuizSettingChips
              settings={{
                allowRetest: module.allowRetest !== false,
                shuffleQuestions: !!module.shuffleQuestions,
                shuffleOptions: !!module.shuffleOptions,
                timeLimitMinutes: Math.max(0, Number(module.timeLimitMinutes) || 0),
                negativeMark: Math.max(0, Number(module.negativeMark) || 0)
              }}
              onChange={(fields) => updateModule(subject.id, module.id, fields)}
            />
            {targets.length > 0 && (
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                <span className="whitespace-nowrap">Put all {unsorted.length} in</span>
                <select
                  aria-label="Put all unsorted questions in"
                  value=""
                  onChange={async (e) => {
                    const [sectionId, day] = e.target.value.split('|');
                    if (!sectionId) return;
                    const label = targets.find((t) => t.value === e.target.value)?.label;
                    const ok = await confirmDialog({
                      title: `Move all ${unsorted.length} questions to ${label}?`,
                      message: 'Students will then find them in that day instead of "General practice".',
                      confirmLabel: 'Move all'
                    });
                    if (!ok) return;
                    unsorted.forEach((q) => moveCurriculumQuestion(subject.id, module.id, q.id, { sectionId, day: Number(day) }));
                  }}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="">Choose section &amp; day…</option>
                  {targets.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unsorted.filter(show).map((q, i) => (
              <QuestionCard key={q.id} q={q} number={i + 1} movable />
            ))}
          </div>
        </CurriculumSection>
      )}

      {!anyQuestions && (
        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> Add questions to each section&apos;s days with the buttons above.
        </p>
      )}
    </div>
  );
};

export default ModuleQuestionsBoard;
