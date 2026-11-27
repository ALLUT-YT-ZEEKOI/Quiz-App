import React from 'react';
import { MinusCircle } from 'lucide-react';

const PRESETS = [0, 0.25, 0.33, 0.5, 1];

/** Marks taken off for each wrong answer: Off, −0.25, −0.33, −0.5, −1. */
export const NegativeMarkPicker = ({ value = 0, onChange, label = 'Minus marks for a wrong answer', hint }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5">
        <MinusCircle className="w-4 h-4 text-rose-600" /> {label}
      </span>
      <span className={`text-[11px] font-extrabold ${value ? 'text-rose-600' : 'text-slate-400'}`}>{value ? `−${value} per wrong` : 'Off'}</span>
    </div>
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {PRESETS.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
            value === v
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
    {hint && <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>
);

export default NegativeMarkPicker;
