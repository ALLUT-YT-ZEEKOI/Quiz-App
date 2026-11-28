import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, ListChecks, Play, RotateCcw, Eye, CheckCircle2, ClipboardList, Timer, AlertTriangle, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TestPinButton } from '../student/PinnedTests';
import { OPEN_MOCK_TEST, takeOpenRequest } from '../../utils/openRequest';
import { QuestionSearchBox, SearchResultCard, questionMatches } from '../common/QuestionSearch';
import { PageHero, Modal, primaryBtn, secondaryBtn } from './MockTestUi';
import { formatDuration, groupByDay, getLocalSession, canStudentSeeMockTest, isPrivateMockTest } from '../../utils/mockTests';

export const StudentMockTests = ({ onStart, onViewResult }) => {
  const { mockTests, mockAttempts, currentUserId, checkEnrollmentStatus, curriculumSubjects } = useApp();
  const [confirming, setConfirming] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const id = takeOpenRequest(OPEN_MOCK_TEST);
    if (id) document.getElementById(`mock-test-${id}`)?.focus();
  }, []);

  // Only tests this student may take: enabled, and public or private to a batch they're in.
  // (The server doesn't send the others; this also covers offline mode and subscriptions that just ended.)
  const isInBatch = (subjectId) => checkEnrollmentStatus(currentUserId, subjectId) === 'active';
  const days = groupByDay(mockTests.filter((t) => canStudentSeeMockTest(t, isInBatch)));
  const myBatchNames = (test) =>
    (test.batchSubjectIds || [])
      .filter(isInBatch)
      .map((id) => (curriculumSubjects || []).find((s) => s.id === id)?.name)
      .filter(Boolean);

  // Search questions of mock tests the student has already submitted (never a test not yet taken)
  const [search, setSearch] = useState('');
  const term = search.trim();

  const myAttempts = useMemo(() => {
    const map = new Map();
    mockAttempts
      .filter((a) => a.studentId === currentUserId)
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
      .forEach((a) => {
        if (!map.has(a.testId)) map.set(a.testId, []);
        map.get(a.testId).push(a);
      });
    return map;
  }, [mockAttempts, currentUserId]);

  const begin = async (test) => {
    setStarting(true);
    const ok = await onStart(test.id);
    setStarting(false);
    if (ok) setConfirming(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-24 sm:pb-12">
      <PageHero
        eyebrow="Mock Tests"
        title="Daily Mock Tests"
        description="Timed practice tests for each day. The timer starts when you begin and keeps running until you submit."
      />

      <QuestionSearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search questions from mock tests you've taken, e.g. standard"
      />

      {term && (() => {
        // Latest attempt of each test: its questions with the student's answer and the correct one
        const found = [...myAttempts.values()]
          .map((list) => list[0])
          .flatMap((a) => (a.answers || []).map((ans, i) => ({ a, ans, i })))
          .filter(({ ans }) => questionMatches(ans, term));
        return (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-500">
              {found.length} {found.length === 1 ? 'match' : 'matches'} in mock tests you&apos;ve submitted. Tests you haven&apos;t taken yet aren&apos;t searched.
            </p>
            {found.map(({ a, ans, i }) => (
              <SearchResultCard
                key={`${a.id}:${i}`}
                context={`${a.testTitle || 'Mock test'}${a.day ? ` · Day ${a.day}` : ''} · Q${i + 1}`}
                question={ans}
                term={term}
                answer="shown"
                selectedOption={ans.selectedOption}
              />
            ))}
          </div>
        );
      })()}

      {!term && days.length === 0 && (
        <div className="p-8 sm:p-14 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">No mock tests available</p>
          <p className="text-xs sm:text-sm text-slate-500">Your mock tests will appear here when the admin publishes them.</p>
        </div>
      )}

      {!term && days.map(({ day, tests }) => (
        <section key={day} className="space-y-3">
          <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-[#087F8C] dark:text-teal-300" />
            Day {day}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {tests.map((test) => {
              const attempts = myAttempts.get(test.id) || [];
              const latest = attempts[0];
              const best = attempts.reduce((m, a) => Math.max(m, a.percentage || 0), 0);
              const inProgress = !!getLocalSession(test.id, currentUserId);
              const canRetake = attempts.length > 0 && test.allowRetest;
              const qCount = (test.questions || []).length;

              return (
                <article
                  key={test.id}
                  id={`mock-test-${test.id}`}
                  tabIndex={-1}
                  aria-label={test.title}
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border shadow-subtle flex flex-col gap-4 ${
                    inProgress ? 'border-amber-300 dark:border-amber-700' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {inProgress && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">In progress</span>
                      )}
                      {latest && !inProgress && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {Number(test.negativeMark) > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">−{test.negativeMark} per wrong</span>
                      )}
                      {test.allowRetest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#E8F3F4] dark:bg-slate-800 text-[#087F8C] dark:text-teal-300">Retest allowed</span>
                      )}
                      {isPrivateMockTest(test) && myBatchNames(test).length > 0 && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 inline-flex items-center gap-1 max-w-full"
                          title="Only for students of your batch"
                        >
                          <Lock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{myBatchNames(test).join(', ')}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="min-w-0 text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug break-words">{test.title}</h3>
                      <TestPinButton target={{ kind: 'mock', testId: test.id }} title={test.title} />
                    </div>
                    {test.description && <p className="text-xs text-slate-500 dark:text-slate-400">{test.description}</p>}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5 text-slate-400" />{qCount} questions</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{formatDuration(test.durationMinutes)}</span>
                  </div>

                  {latest && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Last score <strong className="text-slate-900 dark:text-white text-sm">{latest.score}/{latest.totalMarks}</strong>
                      </span>
                      {attempts.length > 1 && <span className="text-slate-500">Best <strong className="text-slate-900 dark:text-white">{best}%</strong> · {attempts.length} attempts</span>}
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    {inProgress ? (
                      <button type="button" onClick={() => begin(test)} disabled={starting} className={`${primaryBtn} flex-1 !bg-amber-500 hover:!bg-amber-600`}>
                        <Timer className="w-4 h-4" /> Resume Test
                      </button>
                    ) : !latest ? (
                      <button type="button" onClick={() => setConfirming(test)} className={`${primaryBtn} flex-1`}>
                        <Play className="w-4 h-4" /> Start Test
                      </button>
                    ) : canRetake ? (
                      <button type="button" onClick={() => setConfirming(test)} className={`${primaryBtn} flex-1`}>
                        <RotateCcw className="w-4 h-4" /> Retake
                      </button>
                    ) : null}
                    {latest && (
                      <button type="button" onClick={() => onViewResult(latest)} className={`${secondaryBtn} flex-1`}>
                        <Eye className="w-4 h-4" /> View Result
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <Modal
        open={!!confirming}
        onClose={() => !starting && setConfirming(null)}
        icon={Timer}
        title={confirming?.title || ''}
        subtitle={confirming ? `Day ${confirming.day}` : ''}
        maxWidth="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setConfirming(null)} disabled={starting} className={secondaryBtn}>Not now</button>
            <button type="button" onClick={() => begin(confirming)} disabled={starting} className={primaryBtn}>
              <Play className="w-4 h-4" /> {starting ? 'Starting…' : 'Start Now'}
            </button>
          </>
        }
      >
        {confirming && (
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{(confirming.questions || []).length}</div>
                <div className="text-[11px] font-semibold text-slate-500">Questions</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{formatDuration(confirming.durationMinutes)}</div>
                <div className="text-[11px] font-semibold text-slate-500">Time allowed</div>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs leading-relaxed list-disc pl-5">
              <li>The timer starts as soon as you press <strong>Start Now</strong>.</li>
              <li>It keeps running even if you leave the page. You can come back and resume.</li>
              <li>When time runs out, your answers are submitted automatically.</li>
              <li>{confirming.allowRetest ? 'You can retake this test after submitting.' : 'You can take this test only once.'}</li>
              {Number(confirming.negativeMark) > 0 && (
                <li className="text-rose-700 dark:text-rose-300 font-semibold">
                  Negative marking: −{confirming.negativeMark} for each wrong answer. Skipping a question costs nothing.
                </li>
              )}
            </ul>
            {!confirming.allowRetest && (
              <p className="flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Make sure you have {formatDuration(confirming.durationMinutes)} free before you start.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
