import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SaveQuestionButton } from '../saved/SaveQuestionButton';
import {
  Clock,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Menu,
  X,
  HelpCircle,
  ShieldCheck,
  Check,
  Award,
  MessageCircleQuestion
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AskDoubtModal } from '../doubts/AskDoubtModal';

export const StudentLiveExam = ({ exam, onExitExam, onExamSubmitted }) => {
  const {
    currentUser,
    saveExamDraftAnswer,
    submitStudentExamAttempt,
    showToast,
    doubts
  } = useApp();

  // Doubt about the current question -> goes to the admin's Doubts dashboard
  const [doubtOpen, setDoubtOpen] = useState(false);
  const doubtedQuestions = useMemo(
    () =>
      new Set(
        (doubts || [])
          .filter(
            (d) =>
              d.studentId === currentUser?.id &&
              d.context?.source === 'exam' &&
              d.context?.examId === exam?.id
          )
          .map((d) => d.context.questionIndex)
      ),
    [doubts, currentUser?.id, exam?.id]
  );

  const questions = useMemo(() => exam?.questions || [], [exam]);
  const totalQuestions = questions.length || 30;

  // Local state for candidate responses
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    // Check if answers exist in localStorage for resume support
    try {
      const saved = localStorage.getItem(`cohesion_exam_ans_${exam?.id}_${currentUser?.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return Array(totalQuestions).fill(null);
  });

  const [markedForReview, setMarkedForReview] = useState(() => {
    try {
      const saved = localStorage.getItem(`cohesion_exam_review_${exam?.id}_${currentUser?.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return Array(totalQuestions).fill(false);
  });

  // Mobile Question Palette Drawer
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // Submit Confirmation Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer: 60 minutes = 3600 seconds (or exam.durationMinutes * 60)
  const initialSeconds = useMemo(() => (exam?.durationMinutes || 60) * 60, [exam]);
  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const saved = localStorage.getItem(`cohesion_exam_time_${exam?.id}_${currentUser?.id}`);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch (e) {}
    return initialSeconds;
  });

  // Auto-save answers and marked items to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(`cohesion_exam_ans_${exam?.id}_${currentUser?.id}`, JSON.stringify(answers));
      localStorage.setItem(`cohesion_exam_review_${exam?.id}_${currentUser?.id}`, JSON.stringify(markedForReview));
      localStorage.setItem(`cohesion_exam_time_${exam?.id}_${currentUser?.id}`, timeLeft.toString());
    } catch (e) {}
  }, [answers, markedForReview, timeLeft, exam?.id, currentUser?.id]);

  // Real-time Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time (HH:MM:SS)
  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h.toString().padStart(2, '0')}:` : ''}${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Warning state when less than 5 minutes remain (300 seconds)
  const isTimeCritical = timeLeft < 300;

  // Handle Option Select
  const handleSelectOption = (optionIndex) => {
    const updated = [...answers];
    updated[currentQuestionIndex] = optionIndex;
    setAnswers(updated);

    // Save to AppContext & update monitoring telemetry
    saveExamDraftAnswer(exam?.id, currentUser?.id, currentQuestionIndex, optionIndex);
  };

  // Handle Clear Response
  const handleClearResponse = () => {
    const updated = [...answers];
    updated[currentQuestionIndex] = null;
    setAnswers(updated);
  };

  // Toggle Mark for Review
  const toggleMarkForReview = () => {
    const updated = [...markedForReview];
    updated[currentQuestionIndex] = !updated[currentQuestionIndex];
    setMarkedForReview(updated);
  };

  // Compute Statistics for Palette and Confirmation
  const answeredCount = answers.filter((a) => a !== null && a !== undefined).length;
  const unansweredCount = totalQuestions - answeredCount;
  const markedCount = markedForReview.filter(Boolean).length;

  // Submit Handler
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeSpent = Math.max(1, Math.round((initialSeconds - timeLeft) / 60));
    // With the backend this waits for the server's score; on failure the answers stay saved
    const result = await submitStudentExamAttempt(exam.id, answers, timeSpent);
    if (!result) {
      setIsSubmitting(false);
      return;
    }

    // Clear local resume items only once the submission succeeded
    try {
      localStorage.removeItem(`cohesion_exam_ans_${exam?.id}_${currentUser?.id}`);
      localStorage.removeItem(`cohesion_exam_review_${exam?.id}_${currentUser?.id}`);
      localStorage.removeItem(`cohesion_exam_time_${exam?.id}_${currentUser?.id}`);
    } catch (e) {}

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setShowSubmitModal(false);
    if (onExamSubmitted) {
      onExamSubmitted(result);
    }
  };

  // Auto-submit when time expires
  const handleAutoSubmit = () => {
    showToast('Time expired! Automatically submitting your examination...', 'warning');
    handleFinalSubmit();
  };

  const currentQ = questions[currentQuestionIndex] || {
    questionText: 'Loading question...',
    options: [],
    difficulty: 'Medium'
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7FAFC] dark:bg-surface-darkBg text-slate-800 dark:text-slate-100 flex flex-col select-none overflow-hidden">
      {/* =========================================================================
          DISTRACTION-FREE EXAM HEADER
      ========================================================================= */}
      <header className="h-16 px-3 sm:px-6 bg-[#082F3C] text-white border-b border-[#14424D] flex items-center justify-between shrink-0 z-20 shadow-sm gap-2">
        {/* Brand & Exam Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[120px] xs:max-w-[160px] sm:max-w-none">
          <div className="w-8 h-8 rounded-xl bg-[#0A242B] border border-[#20B8C7]/50 p-1 flex items-center justify-center shrink-0">
            <img src="/logo.jpg" alt="CohesionTech" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-snug truncate">
              {exam?.title}
            </h1>
            <p className="text-[10px] text-[#2DD4BF] font-semibold truncate">
              {exam?.subjectName} • {exam?.code}
            </p>
          </div>
        </div>

        {/* Center Sticky Countdown Timer */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl font-mono text-xs sm:text-base font-extrabold border transition-all shrink-0 ${
            isTimeCritical
              ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse ring-4 ring-red-500/20'
              : 'bg-[#092B32] text-[#2DD4BF] border-[#20B8C7]/40 shadow-sm'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isTimeCritical ? 'text-red-400' : 'text-[#2DD4BF]'}`} />
          <span className="hidden sm:inline text-xs font-normal text-slate-300 font-sans mr-0.5">
            Time Left:
          </span>
          <span>{formatTimer(timeLeft)}</span>
        </div>

        {/* Right Action & Palette Drawer Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 font-bold font-mono bg-[#0A262C] px-3 py-1.5 rounded-xl border border-teal-500/30">
            <span className="text-emerald-400">{answeredCount}</span>
            <span>/</span>
            <span>{totalQuestions} Answered</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Exam</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {/* Mobile drawer button */}
          <button
            onClick={() => setMobilePaletteOpen(true)}
            className="md:hidden p-2 rounded-xl bg-[#0A262C] text-[#2DD4BF] border border-teal-500/30"
            title="Question Palette"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Critical Time Warning Alert Banner (Shown when < 5 mins) */}
      {isTimeCritical && (
        <div className="bg-red-500 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 text-center animate-bounce shrink-0 z-10">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Notice: Fewer than 5 minutes remain! Exam answers will auto-submit when the timer expires.</span>
        </div>
      )}

      {/* =========================================================================
          MAIN EXAMINATION VIEWPORT & QUESTION PALETTE
      ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Main Question Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {/* Question Header & Chips */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#087F8C]/10 text-[#087F8C] dark:text-[#2DD4BF] font-extrabold text-xs">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    currentQ.difficulty === 'Easy'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : currentQ.difficulty === 'Hard'
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {currentQ.difficulty || 'Medium'} Mode
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="text-emerald-600 font-bold hidden sm:inline">+1.0 Mark</span>
                {exam?.negativeMarking && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-red-500 font-bold hidden sm:inline">-{exam?.negativeMarkValue || 0.25} Neg.</span>
                  </>
                )}
                <SaveQuestionButton
                  source="exam"
                  sourceId={exam?.id}
                  sourceTitle={exam?.title}
                  subjectName={exam?.subjectName}
                  question={currentQ}
                  questionIndex={currentQuestionIndex}
                />
                <button
                  type="button"
                  onClick={() => setDoubtOpen(true)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 border transition-colors ${
                    doubtedQuestions.has(currentQuestionIndex)
                      ? 'bg-violet-100 dark:bg-violet-950/50 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-800'
                      : 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900/60 hover:bg-violet-50 dark:hover:bg-violet-950/40'
                  }`}
                  title="Send this question to the admin as a doubt"
                >
                  <MessageCircleQuestion className="w-3.5 h-3.5" />
                  <span>{doubtedQuestions.has(currentQuestionIndex) ? 'Doubt sent' : 'Doubt'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.questionText}
              </p>
            </div>

            {/* MCQ Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((option, optIdx) => {
                const isSelected = answers[currentQuestionIndex] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all group ${
                      isSelected
                        ? 'bg-teal-50/70 dark:bg-teal-950/30 border-[#087F8C] dark:border-[#20B8C7] shadow-sm ring-2 ring-[#087F8C]/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs transition-colors shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#087F8C] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200'
                      }`}
                    >
                      {letter}
                    </span>

                    <span
                      className={`text-sm sm:text-base leading-relaxed flex-1 ${
                        isSelected
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-medium text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation & Utility Toolbar */}
          <div className="max-w-3xl mx-auto w-full pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  markedForReview[currentQuestionIndex]
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>
                  {markedForReview[currentQuestionIndex] ? (
                    <>
                      <span className="hidden sm:inline">Marked for </span>Review
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Mark for </span>Review
                    </>
                  )}
                </span>
              </button>

              {answers[currentQuestionIndex] !== null && (
                <button
                  type="button"
                  onClick={handleClearResponse}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Clear selected option"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Prev</span>
              </button>

              <button
                type="button"
                disabled={currentQuestionIndex === totalQuestions - 1}
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-3.5 sm:px-5 py-2 rounded-xl bg-[#087F8C] hover:bg-[#0C6D7C] text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right: Question Navigation Panel (Desktop Persistent) */}
        <aside className="hidden md:flex w-72 lg:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col shrink-0 select-none">
          <div className="flex-1 min-h-0 flex flex-col p-4 lg:p-5 gap-4">
            <div className="shrink-0">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Question Navigator
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Tap a number to jump to that question.
              </p>
            </div>

            {/* Statistics Legend */}
            <div className="shrink-0 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-bold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  {answeredCount} Answered
                </span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  {unansweredCount} Unanswered
                </span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-3 h-3 rounded-md bg-purple-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  {markedCount} Marked
                </span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-3 h-3 rounded-md ring-2 ring-[#087F8C] ring-offset-1 ring-offset-slate-50 dark:ring-offset-slate-800 bg-white dark:bg-slate-900 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  Current
                </span>
              </div>
            </div>

            {/* Question Palette — 4 per row on desktop */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2.5">
                {questions.map((_, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = answers[idx] !== null && answers[idx] !== undefined;
                  const isMarked = markedForReview[idx];

                  let tone =
                    'border-2 border-transparent bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
                  if (isAnswered && isMarked) {
                    tone = 'border-2 border-purple-300 bg-emerald-500 text-white';
                  } else if (isAnswered) {
                    tone = 'border-2 border-transparent bg-emerald-500 text-white';
                  } else if (isMarked) {
                    tone = 'border-2 border-transparent bg-purple-500 text-white';
                  }

                  if (isCurrent) {
                    tone = isAnswered
                      ? 'border-2 border-[#087F8C] dark:border-[#20B8C7] bg-emerald-500 text-white shadow-[0_0_0_2px_rgba(8,127,140,0.2)]'
                      : isMarked
                      ? 'border-2 border-[#087F8C] dark:border-[#20B8C7] bg-purple-500 text-white shadow-[0_0_0_2px_rgba(8,127,140,0.2)]'
                      : 'border-2 border-[#087F8C] dark:border-[#20B8C7] bg-white dark:bg-slate-900 text-[#087F8C] dark:text-[#20B8C7] shadow-[0_0_0_2px_rgba(8,127,140,0.15)]';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      aria-current={isCurrent ? 'true' : undefined}
                      aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ''}${isMarked ? ', marked for review' : ''}`}
                      className={`aspect-square box-border rounded-xl font-bold text-xs flex items-center justify-center transition-colors relative cursor-pointer ${tone} ${
                        isCurrent ? 'font-extrabold' : ''
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isMarked && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-300 ring-1 ring-white/80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Security Info */}
          <div className="shrink-0 p-4 lg:p-5 pt-0">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[10px] text-slate-400 space-y-1 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Proctored Session</span>
              </div>
              <p className="leading-relaxed">Responses sync in real time with the central server.</p>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer for Question Palette */}
        {mobilePaletteOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobilePaletteOpen(false)}
            />
            <div className="relative ml-auto w-[min(100%,20rem)] h-full bg-white dark:bg-slate-900 p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Question Navigator
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tap a number to jump.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobilePaletteOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="shrink-0 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-bold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{answeredCount} Answered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{unansweredCount} Unanswered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-purple-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{markedCount} Marked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md ring-2 ring-[#087F8C] bg-white shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Current</span>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2.5">
                    {questions.map((_, idx) => {
                      const isCurrent = currentQuestionIndex === idx;
                      const isAnswered = answers[idx] !== null && answers[idx] !== undefined;
                      const isMarked = markedForReview[idx];

                      let tone =
                        'border-2 border-transparent bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                      if (isAnswered) {
                        tone = 'border-2 border-transparent bg-emerald-500 text-white';
                      } else if (isMarked) {
                        tone = 'border-2 border-transparent bg-purple-500 text-white';
                      }

                      if (isCurrent) {
                        tone = isAnswered
                          ? 'border-2 border-[#087F8C] dark:border-[#20B8C7] bg-emerald-500 text-white'
                          : isMarked
                          ? 'border-2 border-[#087F8C] dark:border-[#20B8C7] bg-purple-500 text-white'
                          : 'border-2 border-[#087F8C] dark:border-[#20B8C7] bg-white dark:bg-slate-900 text-[#087F8C] dark:text-[#20B8C7]';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCurrentQuestionIndex(idx);
                            setMobilePaletteOpen(false);
                          }}
                          className={`aspect-square box-border rounded-xl font-bold text-xs flex items-center justify-center transition-colors relative ${tone}`}
                        >
                          {idx + 1}
                          {isMarked && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-300 ring-1 ring-white/80" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobilePaletteOpen(false);
                  setShowSubmitModal(true);
                }}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-sm shrink-0"
              >
                Submit Examination
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SUBMISSION CONFIRMATION MODAL
      ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#087F8C] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Submit Examination?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to finalize your submission? You will not be able to change your answers once submitted.
              </p>
            </div>

            {/* Summary Statistics Box */}
            <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Answered</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>

              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Unanswered</span>
                <span className="text-base font-extrabold text-amber-500">
                  {unansweredCount} Questions
                </span>
              </div>

              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Marked for Review</span>
                <span className="text-base font-extrabold text-purple-600">
                  {markedCount} Questions
                </span>
              </div>

              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Remaining</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>You still have {unansweredCount} unanswered questions!</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              >
                Continue Exam
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit Final'}
              </button>
            </div>
          </div>
        </div>
      )}
      {doubtOpen && (
        <AskDoubtModal
          context={{
            source: 'exam',
            examId: exam?.id,
            assessmentTitle: exam?.title,
            questionIndex: currentQuestionIndex,
            questionText: currentQ.questionText,
            options: currentQ.options || [],
            correctAnswer: currentQ.correctAnswer,
            selectedOption: answers[currentQuestionIndex] ?? null
          }}
          subjectId={exam?.subjectId}
          subjectName={exam?.subjectName}
          onClose={() => setDoubtOpen(false)}
        />
      )}
    </div>
  );
};
