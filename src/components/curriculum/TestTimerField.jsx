import React, { useState } from 'react';
import { Timer, MinusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dayQuizSettings, testLabelOf } from '../../utils/curriculumSections';

const PRESETS = [5, 10, 15, 20, 30, 45, 60];

/**
 * Time limit of one practice test (a section's day, or general practice when target is null).
 * The same setting as the Timer chip on the Day row: changing it here changes it there.
 */
export const TestTimerField = ({ subject, module, target }) => {
  const { updateDayQuizSettings, updateModule } = useApp();
  const [custom, setCustom] = useState('');
  const sectionId = target?.sectionId || null;
  const day = target?.day || 1;
  const settings = dayQuizSettings(module, sectionId, sectionId ? day : null);
  const minutes = settings.timeLimitMinutes || 0;
  const negative = settings.negativeMark || 0;
  const setNegative = (v) => {
    const value = Math.max(0, Math.min(4, Math.round((Number(v) || 0) * 100) / 100));
    if (sectionId) updateDayQuizSettings(subject.id, module.id, sectionId, day, { negativeMark: value });
    else updateModule(subject.id, module.id, { negativeMark: value });
  };
  const label = testLabelOf(module, sectionId, day);

  const set = (m) => {
    const value = Math.max(0, Math.min(600, Math.round(Number(m) || 0)));
    if (sectionId) updateDayQuizSettings(subject.id, module.id, sectionId, day, { timeLimitMinutes: value });
    else updateModule(subject.id, module.id, { timeLimitMinutes: value });
    setCustom('');
  };

  const chip = (active) =>
    `px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
      active
        ? 'bg-violet-600 border-violet-600 text-white'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-400'
    }`;

  return (
    <div className="p-3 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-900/50 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-violet-600" /> Timer for this test
          <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300">({label})</span>
        </p>
        <span className={`text-[11px] font-extrabold ${minutes ? 'text-violet-700 dark:text-violet-300' : 'text-slate-400'}`}>
          {minutes ? `${minutes} min` : 'No time limit'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => set(0)} className={chip(!minutes)} aria-pressed={!minutes}>
          Off
        </button>
        {PRESETS.map((m) => (
          <button key={m} type="button" onClick={() => set(m)} className={chip(minutes === m)} aria-pressed={minutes === m}>
            {m} min
          </button>
        ))}
        <span className="inline-flex items-center gap-1">
          <input
            type="number"
            min="1"
            max="600"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (Number(custom) > 0) set(custom);
              }
            }}
            placeholder="Other"
            aria-label="Custom minutes"
            className="w-16 px-2 py-1.5 rounded-lg text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          />
          <button
            type="button"
            onClick={() => Number(custom) > 0 && set(custom)}
            disabled={!(Number(custom) > 0)}
            className="px-2 py-1.5 rounded-lg bg-violet-600 disabled:opacity-40 text-white text-[11px] font-bold"
          >
            Set
          </button>
        </span>
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">
        Applies to the whole test. Students see a countdown, and the quiz submits itself at 0:00.
      </p>
      <div className="pt-2 border-t border-violet-200/60 dark:border-violet-900/40 space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
            <MinusCircle className="w-3.5 h-3.5 text-rose-600" /> Minus marks for a wrong answer
          </p>
          <span className={`text-[11px] font-extrabold ${negative ? 'text-rose-600' : 'text-slate-400'}`}>
            {negative ? `−${negative} per wrong` : 'Off'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[0, 0.25, 0.33, 0.5, 1].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setNegative(v)}
              aria-pressed={negative === v}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                negative === v
                  ? v
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-slate-900 border-slate-900 text-white dark:bg-slate-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-400'
              }`}
            >
              {v ? `−${v}` : 'Off'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestTimerField;
