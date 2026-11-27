import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, Send, LogOut, AlertTriangle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { SaveQuestionButton } from '../saved/SaveQuestionButton';
import { DoubtQuestionButton } from '../doubts/DoubtQuestionButton';
import { Modal, primaryBtn, secondaryBtn } from './MockTestUi';
import { formatClock, getSavedAnswers, saveAnswers } from '../../utils/mockTests';
import { orderQuestions, orderOptions } from '../../utils/shuffle';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * The exam screen. Time left is worked out from the session's deadline (set by the server
 * when the student started), so reloading or leaving the page never adds time.
 */
export const MockTestAttempt = ({ test, session, onExit, onSubmitted }) => {
  const { currentUserId, submitMockTest, showToast } = useApp();
  // Shuffled per student and per attempt when the admin turned it on (same order after a reload).
  // Answers keep the option's original number, so the server marks them as usual.
  const shuffleSeed = `${currentUserId}:${test.id}:${session?.startedAt || session?.deadline || ''}`;
  const questions = orderQuestions(test.questions || [], !!test.shuffleQuestions, shuffleSeed);
  const total = questions.length;

  const [answers, setAnswers] = useState(() => getSavedAnswers(test.id, currentUserId));
  const [index, setIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  const deadlineMs = Date.parse(session.deadline);
  const offset = session.clockOffsetMs || 0;
  const secondsLeftNow = () => Math.max(0, Math.ceil((deadlineMs - (Date.now() + offset)) / 1000));
  const [secondsLeft, setSecondsLeft] = useState(secondsLeftNow);
  const timeUp = secondsLeft <= 0;

  // Latest answers for the auto-submit, which runs from the timer
  const answersRef = useRef(answers);
  const busyRef = useRef(false);

  const updateAnswers = (next) => {
    answersRef.current = next;
    setAnswers(next);
    saveAnswers(test.id, currentUserId, next);
  };

  const submit = useCallback(
    async (autoSubmitted) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setSubmitting(true);
      setSubmitFailed(false);
      const attempt = await submitMockTest(test.id, answersRef.current, { autoSubmitted });
      busyRef.current = false;
      setSubmitting(false);
      if (!attempt) {
        setSubmitFailed(true);
        return;
      }
      setConfirmOpen(false);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      onSubmitted(attempt);
    },
    [submitMockTest, test.id, onSubmitted]
  );

  // Countdown
  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(secondsLeftNow()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineMs, offset]);

  // Time is up: submit once automatically (a failed submit can be retried from the overlay)
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (timeUp && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      showToast("Time's up! Submitting your answers…", 'warning');
      submit(true);
    }
  }, [timeUp, submit, showToast]);

  const q = questions[index];
  const answeredCount = questions.filter((x) => Number.isInteger(answers[x.id])).length;
  const critical = secondsLeft <= 300;

  const choose = (optionIndex) => {
    if (timeUp || submitting) return;
    updateAnswers({ ...answers, [q.id]: optionIndex });
  };
  const clear = () => {
    if (timeUp || submitting) return;
    const next = { ...answers };
    delete next[q.id];
    updateAnswers(next);
  };

  if (!q) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-600">This mock test has no questions.</p>
        <button type="button" onClick={onExit} className={secondaryBtn}>Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top bar: title, progress and timer */}
      <div className="sticky top-0 z-20 p-3 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-premium flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#087F8C] dark:text-teal-300">Day {test.day} · Mock Test</p>
          <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">{test.title}</h1>
          <p className="text-[11px] sm:text-xs text-slate-500">{answeredCount} of {total} answered</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            role="timer"
            aria-label="Time left"
            className={`px-3 py-2 rounded-xl font-mono font-extrabold text-sm sm:text-lg flex items-center gap-1.5 border ${
              critical
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
                : 'bg-[#E8F3F4] dark:bg-slate-800 text-[#087F8C] dark:text-teal-300 border-[#087F8C]/20 dark:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatClock(secondsLeft)}
          </div>
          <button type="button" onClick={() => setConfirmOpen(true)} disabled={submitting || timeUp} className={primaryBtn}>
            <Send className="w-4 h-4" /> <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Question */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          {Number(test.negativeMark) > 0 && (
            <p className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              Negative marking: <strong>−{test.negativeMark}</strong> for each wrong answer. Skipping a question costs nothing.
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-500">Question {index + 1} of {total}</p>
            <div className="flex items-center gap-1.5">
              <SaveQuestionButton source="mock" sourceId={test.id} sourceTitle={test.title} question={q} questionIndex={index} />
              <DoubtQuestionButton
                kind="mock"
                duringTest
                sourceId={test.id}
                sourceTitle={test.title}
                question={q}
                questionIndex={index}
                selectedOption={answers[q.id] ?? null}
              />
            </div>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">{q.questionText}</h2>
          <div className="space-y-2.5" role="radiogroup" aria-label={`Options for question ${index + 1}`}>
            {orderOptions(q, !!test.shuffleOptions, shuffleSeed).map(({ index: i, text: opt }, pos) => {
              // i: the option's original number (what gets recorded); pos: its place on screen
              const picked = answers[q.id] === i;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => choose(i)}
                  disabled={timeUp || submitting}
                  className={`w-full text-left px-4 py-3 rounded-2xl border-2 flex items-center gap-3 text-sm transition-all disabled:cursor-not-allowed ${
                    picked
                      ? 'border-[#087F8C] bg-[#E8F3F4] dark:bg-teal-950/30 text-slate-900 dark:text-white font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#087F8C]/50'
                  }`}
                >
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      picked ? 'bg-[#087F8C] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {LETTERS[pos]}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className={secondaryBtn}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={!Number.isInteger(answers[q.id]) || timeUp}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 disabled:opacity-40 disabled:hover:text-slate-500"
            >
              Clear answer
            </button>
            {index < total - 1 ? (
              <button type="button" onClick={() => setIndex((i) => Math.min(total - 1, i + 1))} className={primaryBtn}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmOpen(true)} disabled={submitting || timeUp} className={primaryBtn}>
                <Send className="w-4 h-4" /> Finish
              </button>
            )}
          </div>
        </div>

        {/* Question palette */}
        <aside className="p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 h-fit">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Questions</p>
          <div className="grid grid-cols-8 lg:grid-cols-5 gap-1.5">
            {questions.map((x, i) => {
              const done = Number.isInteger(answers[x.id]);
              return (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Question ${i + 1}${done ? ', answered' : ''}`}
                  aria-current={i === index ? 'step' : undefined}
                  className={`aspect-square rounded-lg text-xs font-bold border transition-colors ${
                    i === index ? 'ring-2 ring-[#087F8C]/40 ' : ''
                  }${
                    done
                      ? 'bg-[#087F8C] border-[#087F8C] text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#087F8C]" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" /> Not answered</span>
          </div>
          <button type="button" onClick={onExit} disabled={submitting} className={`${secondaryBtn} w-full`}>
            <LogOut className="w-4 h-4" /> Leave for now
          </button>
          <p className="text-[11px] text-slate-500 leading-relaxed">If you leave, your answers are saved on this device but the timer keeps running.</p>
        </aside>
      </div>

      {/* Confirm submit */}
      <Modal
        open={confirmOpen && !timeUp}
        onClose={() => !submitting && setConfirmOpen(false)}
        icon={Send}
        title="Submit mock test?"
        subtitle={`${formatClock(secondsLeft)} left`}
        maxWidth="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setConfirmOpen(false)} disabled={submitting} className={secondaryBtn}>Keep working</button>
            <button type="button" onClick={() => submit(false)} disabled={submitting} className={primaryBtn}>
              <Send className="w-4 h-4" /> {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
              <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{answeredCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Answered</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <div className="text-xl font-extrabold text-slate-700 dark:text-slate-200">{total - answeredCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Not answered</div>
            </div>
          </div>
          {total - answeredCount > 0 && (
            <p className="flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {total - answeredCount} question{total - answeredCount === 1 ? ' is' : 's are'} not answered yet.
            </p>
          )}
          {submitFailed && <p className="text-xs font-bold text-rose-600">Submitting failed. Your answers are saved. Please try again.</p>}
        </div>
      </Modal>

      {/* Time up */}
      {timeUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-darkCard rounded-3xl p-6 max-w-sm w-full text-center space-y-3 shadow-2xl">
            <Clock className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Time's up</h2>
            {submitFailed ? (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300">We couldn't submit your answers. They are saved on this device.</p>
                <button type="button" onClick={() => submit(true)} disabled={submitting} className={`${primaryBtn} w-full`}>
                  <RotateCcw className="w-4 h-4" /> {submitting ? 'Submitting…' : 'Try again'}
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Submitting your answers…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
