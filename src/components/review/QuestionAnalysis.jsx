import React, { useState } from 'react';
import { Check, X, Users } from 'lucide-react';
import { optionLetter } from '../../utils/assessmentRecords';
import { pctTone } from './ResultViews';

/** Each student's most recent attempt (records from assessmentRecords, with `time`). */
const latestPerStudent = (records) => {
  const seen = new Map();
  records.forEach((r) => {
    const cur = seen.get(r.studentId);
    if (!cur || r.time > cur.time) seen.set(r.studentId, r);
  });
  return [...seen.values()];
};

/** Per question (matched by its text): right / wrong / skipped across each student's latest attempt, hardest first. */
export const analyseQuestions = (records) => {
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
            difficulty: a.difficulty || '',
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
    .sort((a, b) => a.correctPct - b.correctPct);
};

/**
 * Admin: how students did on each question (each student's latest attempt), hardest first:
 * % right, right / wrong / skipped, which option each picked, and who got it wrong.
 */
export const QuestionAnalysisList = ({ records }) => {
  const [open, setOpen] = useState(null);
  const analysis = analyseQuestions(records);

  if (analysis.length === 0) {
    return <p className="p-6 text-center text-xs text-slate-400">No detailed answers saved yet.</p>;
  }
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] text-slate-400">Each student&apos;s latest attempt. Hardest questions first.</p>
      {analysis.map((q, i) => {
        const tone = pctTone(q.correctPct);
        const isOpen = open === q.key;
        return (
          <article key={q.key} className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed min-w-0">
                <span className="text-[10px] font-extrabold text-slate-400 mr-1.5">#{i + 1}</span>
                {q.questionText}
                {q.difficulty && <span className="ml-1.5 text-[10px] font-bold text-slate-400 uppercase">· {q.difficulty}</span>}
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
                  onClick={() => setOpen(isOpen ? null : q.key)}
                  aria-expanded={isOpen}
                  className="text-[11px] font-bold text-[#087F8C] dark:text-cyan-300 inline-flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" /> {isOpen ? 'Hide' : 'Show'} who got it wrong ({q.wrongStudents.length})
                </button>
                {isOpen && (
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
  );
};

export default QuestionAnalysisList;
