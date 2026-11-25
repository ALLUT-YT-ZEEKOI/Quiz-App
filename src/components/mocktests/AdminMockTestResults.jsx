import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MockTestResult } from './MockTestResult';
import { secondaryBtn, inputCls } from './MockTestUi';
import { formatClock } from '../../utils/mockTests';

/** All student attempts of one mock test, newest first. Click a row to see the answers. */
export const AdminMockTestResults = ({ testId, onBack }) => {
  const { mockTests, mockAttempts } = useApp();
  const test = mockTests.find((t) => t.id === testId);
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState(null);

  const attempts = useMemo(
    () =>
      mockAttempts
        .filter((a) => a.testId === testId)
        .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '')),
    [mockAttempts, testId]
  );

  const shown = attempts.filter((a) => {
    const q = query.trim().toLowerCase();
    return !q || `${a.studentName} ${a.studentRollNo} ${a.batch}`.toLowerCase().includes(q);
  });

  const students = new Set(attempts.map((a) => a.studentId)).size;
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length) : 0;
  const best = attempts.reduce((m, a) => Math.max(m, a.percentage || 0), 0);

  if (viewing) {
    return <MockTestResult attempt={viewing} onBack={() => setViewing(null)} backLabel="Back to Results" showStudent />;
  }

  const title = test?.title || attempts[0]?.testTitle || 'Mock Test';

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-24 sm:pb-12">
      <button type="button" onClick={onBack} className={secondaryBtn}>
        <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
      </button>

      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#087F8C] dark:text-teal-300">Results{test ? ` · Day ${test.day}` : ''}</span>
        <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">{title}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          {[
            ['Attempts', attempts.length],
            ['Students', students],
            ['Average', `${avg}%`],
            ['Best', `${best}%`]
          ].map(([label, value]) => (
            <div key={label} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{value}</div>
              <div className="text-[11px] font-semibold text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No attempts yet</p>
          <p className="text-xs text-slate-500">Results appear here as soon as students submit this test.</p>
        </div>
      ) : (
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input className={`${inputCls} pl-10`} placeholder="Search student, roll number or batch" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Student</th>
                  <th className="px-3 py-2.5 font-bold">Attempt</th>
                  <th className="px-3 py-2.5 font-bold">Score</th>
                  <th className="px-3 py-2.5 font-bold">Time</th>
                  <th className="px-3 py-2.5 font-bold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shown.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setViewing(a)}
                    className="cursor-pointer hover:bg-[#E8F3F4]/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{a.studentName}</div>
                      <div className="text-[11px] text-slate-500">{[a.studentRollNo, a.batch].filter(Boolean).join(' · ')}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">#{a.attemptNumber || 1}</td>
                    <td className="px-3 py-3">
                      <span className="font-extrabold text-slate-900 dark:text-white">{a.score}/{a.totalMarks}</span>
                      <span className="text-slate-500"> · {a.percentage}%</span>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatClock(a.timeSpentSeconds || 0)}
                      {a.autoSubmitted && <span className="ml-1.5 text-[10px] font-bold text-amber-600">time up</span>}
                    </td>
                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{new Date(a.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
