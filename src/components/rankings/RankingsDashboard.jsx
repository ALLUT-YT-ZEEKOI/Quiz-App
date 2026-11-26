import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  Medal,
  RefreshCw,
  Search,
  Users,
  Radio,
  ClipboardList,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Timer,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { computeRankings, examEntry, mockEntry, shapeForStudent } from '../../utils/rankings';
import { formatDuration, formatDateTime } from '../../utils/assessmentRecords';

const REFRESH_MS = 60000;

/** Rankings for the admin, or for a student without the backend, from the app's own data. */
const useLocalRankings = ({ enabled, examinations, examAttempts, mockTests, mockAttempts, isAdmin, studentId }) =>
  useMemo(() => {
    if (!enabled) return null;
    const assessments = [
      ...(examinations || []).map((e) => ({ key: `exam:${e.id}`, kind: 'exam', title: e.title || 'Examination', subtitle: e.subjectName || '' })),
      ...(mockTests || [])
        .filter((t) => isAdmin || t.enabled === true)
        .map((t) => ({ key: `mock:${t.id}`, kind: 'mock', title: t.title || 'Mock Test', subtitle: t.day ? `Day ${t.day}` : '' }))
    ];
    const rankings = computeRankings(assessments, [
      ...(examAttempts || []).map(examEntry),
      ...(mockAttempts || []).map(mockEntry)
    ]);
    return isAdmin ? rankings : shapeForStudent(rankings, studentId);
  }, [enabled, examinations, examAttempts, mockTests, mockAttempts, isAdmin, studentId]);

const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center"><Trophy className="w-4 h-4" /></span>;
  if (rank === 2) return <span className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center"><Medal className="w-4 h-4" /></span>;
  if (rank === 3) return <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-300 flex items-center justify-center"><Medal className="w-4 h-4" /></span>;
  return <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-black font-mono">{rank}</span>;
};

const pctCls = (pct) =>
  pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

const Avatar = ({ src, name, size = 'w-9 h-9' }) =>
  src ? (
    <img src={src} alt="" className={`${size} rounded-xl object-cover shrink-0`} />
  ) : (
    <div className={`${size} rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 shrink-0`}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );

/** Correct / wrong / skipped / time for one result. */
const ResultChips = ({ e, compact = false }) => (
  <div className={`flex items-center gap-2.5 flex-wrap font-bold ${compact ? 'text-[11px]' : 'text-xs'}`}>
    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Correct"><CheckCircle2 className="w-3.5 h-3.5" />{e.correct}</span>
    <span className="inline-flex items-center gap-1 text-red-500" title="Wrong"><XCircle className="w-3.5 h-3.5" />{e.wrong}</span>
    <span className="inline-flex items-center gap-1 text-slate-400" title="Skipped"><MinusCircle className="w-3.5 h-3.5" />{e.skipped}</span>
    {formatDuration(e.timeSpentSeconds) && (
      <span className="inline-flex items-center gap-1 text-[#087F8C] dark:text-teal-300" title="Time taken"><Timer className="w-3.5 h-3.5" />{formatDuration(e.timeSpentSeconds)}</span>
    )}
  </div>
);

const exportCsv = (title, isOverall, entries) => {
  const header = isOverall
    ? ['Rank', 'Student', 'Roll No', 'Batch', 'Tests', 'Average %', 'Correct', 'Wrong', 'Skipped', 'Total Time (s)']
    : ['Rank', 'Student', 'Roll No', 'Batch', 'Score', 'Total Marks', 'Percentage %', 'Correct', 'Wrong', 'Skipped', 'Time Taken (s)', 'Started', 'Submitted'];
  const rows = entries.map((e) =>
    isOverall
      ? [e.rank, e.name, e.rollNo, e.batch, e.tests, e.pct, e.correct, e.wrong, e.skipped, e.timeSpentSeconds || '']
      : [e.rank, e.name, e.rollNo, e.batch, e.score, e.totalMarks, e.pct, e.correct, e.wrong, e.skipped, e.timeSpentSeconds || '', e.startedAt || '', e.submittedAt || '']
  );
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(cell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rankings_${title.replace(/[^a-z0-9]+/gi, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const RankingsDashboard = () => {
  const {
    currentRole,
    currentUser,
    backendEnabled,
    examinations,
    examAttempts,
    mockTests,
    mockAttempts,
    students,
    showToast
  } = useApp();
  const isAdmin = currentRole === 'teacher' || currentRole === 'admin';
  const studentId = currentUser?.id;
  const fromServer = backendEnabled && !isAdmin;

  const local = useLocalRankings({
    enabled: !fromServer,
    examinations,
    examAttempts,
    mockTests,
    mockAttempts,
    isAdmin,
    studentId
  });

  // Students (with the backend) only hold their own attempts: the server builds the ranking
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(fromServer);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!fromServer) return;
    setLoading(true);
    try {
      setServerData(await api('/rankings'));
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load rankings.');
    } finally {
      setLoading(false);
    }
  }, [fromServer]);
  useEffect(() => {
    load();
    if (!fromServer) return undefined;
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load, fromServer]);

  const data = fromServer ? serverData : local;
  const [selectedKey, setSelectedKey] = useState('overall');
  const [search, setSearch] = useState('');

  const avatarOf = useMemo(() => {
    const map = new Map((students || []).map((s) => [s.id, s.avatar]));
    return (id) => map.get(id) || '';
  }, [students]);

  const assessments = data?.assessments || [];
  const selected = selectedKey === 'overall' ? null : assessments.find((a) => a.key === selectedKey);
  const isOverall = !selected;
  const entries = (isOverall ? data?.overall : selected?.entries) || [];
  const term = search.trim().toLowerCase();
  const visible = term
    ? entries.filter((e) => `${e.name} ${e.rollNo || ''} ${e.batch || ''}`.toLowerCase().includes(term))
    : entries;
  const me = !isAdmin ? entries.find((e) => e.isMe) : null;
  const title = isOverall ? 'Overall' : selected.title;

  // Keep the selection valid when tests disappear
  useEffect(() => {
    if (selectedKey !== 'overall' && data && !assessments.some((a) => a.key === selectedKey)) setSelectedKey('overall');
  }, [data, assessments, selectedKey]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            Leaderboard
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {isAdmin ? 'Student Rankings' : 'Rankings'}
          </h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {isAdmin
              ? 'Every student ranked by live exam and mock test results, with correct and wrong answers and time taken.'
              : 'See where you stand among all students in live exams and mock tests. Ties are broken by time taken.'}
          </p>
        </div>
        <div className="flex gap-2">
          {fromServer && (
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              disabled={entries.length === 0}
              onClick={() => {
                exportCsv(title, isOverall, entries);
                showToast(`Exported ${entries.length} rankings to CSV`, 'success');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-600" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Which ranking */}
      <div className="flex flex-col md:flex-row gap-2 p-3 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <select
          aria-label="Ranking"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
        >
          <option value="overall">Overall ranking (all live exams and mock tests)</option>
          {assessments.some((a) => a.kind === 'exam') && (
            <optgroup label="Live exams">
              {assessments.filter((a) => a.kind === 'exam').map((a) => (
                <option key={a.key} value={a.key}>{a.title}{a.subtitle ? ` · ${a.subtitle}` : ''} ({a.participants})</option>
              ))}
            </optgroup>
          )}
          {assessments.some((a) => a.kind === 'mock') && (
            <optgroup label="Mock tests">
              {assessments.filter((a) => a.kind === 'mock').map((a) => (
                <option key={a.key} value={a.key}>{a.title}{a.subtitle ? ` · ${a.subtitle}` : ''} ({a.participants})</option>
              ))}
            </optgroup>
          )}
        </select>
        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAdmin ? 'Search name, roll no or batch...' : 'Search student...'}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
          />
        </div>
      </div>

      {/* Student: my standing */}
      {!isAdmin && data && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-4 sm:p-6 text-white border border-[#145663]/60 shadow-premium">
          {me ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">Rank</span>
                  <span className="text-xl font-black leading-none">{me.rank}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#2DD4BF]">Your position · {title}</p>
                  <p className="text-lg sm:text-xl font-black">
                    #{me.rank} of {entries.length} {entries.length === 1 ? 'student' : 'students'}
                  </p>
                  <p className="text-xs text-slate-300">
                    {isOverall
                      ? `Average ${me.pct}% across ${me.tests} ${me.tests === 1 ? 'test' : 'tests'}`
                      : `${me.score} / ${me.totalMarks} marks (${me.pct}%)${me.submittedAt ? ` · Submitted ${formatDateTime(me.submittedAt)}` : ''}`}
                  </p>
                </div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 [&_*]:!text-white">
                <ResultChips e={me} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-200">
              {isOverall
                ? "You'll appear here after you finish a live exam or mock test."
                : "You haven't taken this test yet, so you're not in this ranking."}
            </p>
          )}
        </div>
      )}

      {loading && !data && (
        <div className="p-10 text-center text-sm text-slate-500">Loading rankings...</div>
      )}

      {data && entries.length === 0 && (
        <div className="p-10 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No results yet</p>
          <p className="text-xs text-slate-400">Rankings appear once students finish a live exam or mock test.</p>
        </div>
      )}

      {data && entries.length > 0 && (
        <>
          <p className="text-[11px] text-slate-500 px-1 flex items-center gap-1.5">
            {selected?.kind === 'exam' ? <Radio className="w-3.5 h-3.5" /> : selected?.kind === 'mock' ? <ClipboardList className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
            {title}{selected?.subtitle ? ` · ${selected.subtitle}` : ''} · {entries.length} {entries.length === 1 ? 'student' : 'students'}
            {term ? ` · ${visible.length} shown` : ''}
          </p>

          {/* Admin: full table (desktop) */}
          {isAdmin && (
            <div className="hidden md:block bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-3">Student</th>
                      <th className="py-3 px-3">{isOverall ? 'Tests' : 'Score'}</th>
                      <th className="py-3 px-3">{isOverall ? 'Average' : 'Percent'}</th>
                      <th className="py-3 px-3 text-emerald-700 dark:text-emerald-400">Correct</th>
                      <th className="py-3 px-3 text-red-600 dark:text-red-400">Wrong</th>
                      <th className="py-3 px-3">Skipped</th>
                      <th className="py-3 px-3">{isOverall ? 'Total time' : 'Time taken'}</th>
                      {!isOverall && <th className="py-3 px-4">Attended</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {visible.map((e) => (
                      <tr key={e.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4"><RankBadge rank={e.rank} /></td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={avatarOf(e.studentId)} name={e.name} size="w-8 h-8" />
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 dark:text-white truncate">{e.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {[e.rollNo, e.batch].filter(Boolean).join(' · ')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-200">
                          {isOverall ? e.tests : <>{e.score}<span className="text-slate-400"> / {e.totalMarks}</span></>}
                        </td>
                        <td className={`py-3 px-3 font-black font-mono ${pctCls(e.pct)}`}>{e.pct}%</td>
                        <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">{e.correct}</td>
                        <td className="py-3 px-3 font-bold text-red-500">{e.wrong}</td>
                        <td className="py-3 px-3 font-bold text-slate-400">{e.skipped}</td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{formatDuration(e.timeSpentSeconds) || '—'}</td>
                        {!isOverall && (
                          <td className="py-3 px-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {e.startedAt && <div>Start {formatDateTime(e.startedAt)}</div>}
                            <div>{e.startedAt ? 'Submit ' : ''}{formatDateTime(e.submittedAt) || '—'}</div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* List: students everywhere, admin on mobile */}
          <div className={`bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-2xs ${isAdmin ? 'md:hidden' : ''}`}>
            {visible.map((e) => (
              <div
                key={e.studentId}
                className={`p-3 sm:p-3.5 flex items-center gap-3 ${e.isMe ? 'bg-[#E6F4F6] dark:bg-[#0E353E]/70' : ''}`}
              >
                <RankBadge rank={e.rank} />
                <Avatar src={avatarOf(e.studentId)} name={e.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{e.name}</span>
                    {e.isMe && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-[#087F8C] text-white shrink-0">You</span>
                    )}
                  </div>
                  {isAdmin || e.isMe ? (
                    <div className="mt-0.5"><ResultChips e={e} compact /></div>
                  ) : isOverall && e.tests !== undefined ? (
                    <p className="text-[11px] text-slate-500">{e.tests} {e.tests === 1 ? 'test' : 'tests'}</p>
                  ) : null}
                </div>
                <div className={`text-base sm:text-lg font-black font-mono shrink-0 ${pctCls(e.pct)}`}>{e.pct}%</div>
              </div>
            ))}
            {visible.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No students match.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default RankingsDashboard;
