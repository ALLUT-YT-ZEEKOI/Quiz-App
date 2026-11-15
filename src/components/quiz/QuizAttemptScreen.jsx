import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Send,
  HelpCircle,
  X,
  ArrowRight,
  Layers
} from 'lucide-react';

export const QuizAttemptScreen = () => {
  const {
    activeQuizForAttempt,
    questions,
    currentUser,
    recordAttempt,
    setActiveView,
    showToast
  } = useApp();

  if (!activeQuizForAttempt) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>No active assessment selected.</p>
        <button
          onClick={() => setActiveView('quizzes')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Browse Quizzes
        </button>
      </div>
    );
  }

  // Get question objects for this quiz
  const quizQuestions = activeQuizForAttempt.questionIds
    .map((qId) => questions.find((q) => q.id === qId))
    .filter(Boolean);

  const totalQuestions = quizQuestions.length;

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student's answer map: { [questionId]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Marked for review set: Set of questionIds
  const [markedForReview, setMarkedForReview] = useState(new Set());

  // Mobile question palette drawer toggle
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // Countdown Timer
  const initialSeconds = (activeQuizForAttempt.durationMinutes || 15) * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [startTime] = useState(Date.now());

  // Submission confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit('time-up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimerCritical = timeLeft < 120; // less than 2 mins

  const currentQ = quizQuestions[currentIndex];

  // Option selection
  const handleSelectOption = (optIndex) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleMarkForReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => {
      const copy = new Set(prev);
      if (copy.has(currentQ.id)) {
        copy.delete(currentQ.id);
      } else {
        copy.add(currentQ.id);
      }
      return copy;
    });
  };

  // Status counts
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const markedCount = markedForReview.size;

  // Final submission evaluation
  const handleFinalSubmit = (reason = 'manual') => {
    setIsSubmitting(true);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    quizQuestions.forEach((q) => {
      const studentChoice = selectedAnswers[q.id];
      if (studentChoice !== undefined && studentChoice === q.correctAnswer) {
        score += q.marks || 1;
        correctCount += 1;
      } else if (studentChoice !== undefined && studentChoice !== q.correctAnswer) {
        incorrectCount += 1;
      }
    });

    const totalMarks = activeQuizForAttempt.totalMarks || totalQuestions;
    const percentage = Number(((score / totalMarks) * 100).toFixed(1));
    const passThreshold = activeQuizForAttempt.passingScorePct || 60;
    const status = percentage >= passThreshold ? 'PASSED' : 'FAILED';

    const attemptRecord = {
      quizId: activeQuizForAttempt.id,
      quizTitle: activeQuizForAttempt.title,
      subjectId: activeQuizForAttempt.subjectId,
      studentId: currentUser?.id || 'STU001',
      studentName: currentUser?.name || 'Adithyan S.',
      rollNumber: currentUser?.studentId || 'CE-2022-001',
      score,
      totalMarks,
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      percentage,
      status,
      timeSpentSeconds: timeSpent,
      answers: selectedAnswers,
      markedForReview: Array.from(markedForReview)
    };

    if (reason === 'time-up') {
      showToast('Time expired! Your assessment has been submitted automatically.', 'warning');
    } else {
      showToast('Assessment submitted successfully!', 'success');
    }

    recordAttempt(attemptRecord);
  };

  const handleAutoSubmit = (reason) => {
    handleFinalSubmit(reason);
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col justify-between space-y-3 sm:space-y-4 animate-in fade-in pb-4 sm:pb-0">
      {/* Top Examination HUD Bar */}
      <div className="bg-white dark:bg-surface-darkCard p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between sm:block">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              {activeQuizForAttempt.subjectName} • Exam
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white leading-tight truncate max-w-[240px] sm:max-w-none">
              {activeQuizForAttempt.title}
            </h2>
          </div>

          {/* Mobile Question Palette Opener Pill */}
          <button
            onClick={() => setMobilePaletteOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grid ({answeredCount}/{totalQuestions})</span>
          </button>
        </div>

        {/* Live Countdown Timer & Submit Action */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border font-mono font-extrabold text-xs sm:text-base transition-all ${
              isTimerCritical
                ? 'timer-critical border-red-500 bg-red-100 text-red-700 shadow-md shadow-red-500/20'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isTimerCritical ? 'animate-spin' : 'text-blue-500'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setConfirmModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Question Scroll Strip (App-like Question Picker) */}
      <div className="lg:hidden bg-white dark:bg-surface-darkCard p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-2">
        {quizQuestions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = selectedAnswers[q.id] !== undefined;
          const isMarked = markedForReview.has(q.id);

          let cellStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
          if (isCurrent) {
            cellStyle = 'ring-2 ring-blue-600 bg-blue-600 text-white font-extrabold shadow-sm';
          } else if (isMarked) {
            cellStyle = 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-400 font-bold';
          } else if (isAnswered) {
            cellStyle = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-400 font-bold';
          }

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs border flex-shrink-0 transition-transform active:scale-90 ${cellStyle}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Examination View Area (Question on Left, Desktop Palette on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Left Column: Question Area (Span 3) */}
        <div className="lg:col-span-3 bg-white dark:bg-surface-darkCard p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between space-y-4 sm:space-y-6">
          <div>
            {/* Question Progress Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                  Q {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentQ?.marks || 1} {currentQ?.marks === 1 ? 'Mark' : 'Marks'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {currentQ?.difficulty}
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {markedForReview.has(currentQ?.id) && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    <span>Review</span>
                  </span>
                )}
                {selectedAnswers[currentQ?.id] !== undefined ? (
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Answered</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    Unanswered
                  </span>
                )}
              </div>
            </div>

            {/* Question Statement */}
            <div className="mt-4 sm:mt-5">
              <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentQ?.questionText}
              </p>
            </div>

            {/* 4 MCQ Interactive Radio Options */}
            <div className="mt-5 space-y-2.5 sm:space-y-3">
              {currentQ?.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none active:scale-[0.99] ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-surface-darkCard text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-colors flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls (Responsive & Easy for Mobile Thumbs) */}
          <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleClearResponse}
                disabled={selectedAnswers[currentQ?.id] === undefined}
                className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Response</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMarkForReview}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  markedForReview.has(currentQ?.id)
                    ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {markedForReview.has(currentQ?.id) ? 'Marked' : 'Review'}
                </span>
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setConfirmModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all"
                >
                  <span>Finish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Desktop Question Palette (Hidden on Mobile, Visible on lg+) */}
        <div className="hidden lg:flex bg-white dark:bg-surface-darkCard p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Question Palette
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-slate-600 dark:text-slate-300">Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-600 dark:text-slate-300">Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full ring-2 ring-blue-600 bg-white dark:bg-slate-900" />
                <span className="text-slate-600 dark:text-slate-300">Current</span>
              </div>
            </div>

            {/* Clickable Number Grid 1..10 */}
            <div className="grid grid-cols-5 gap-2">
              {quizQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isMarked = markedForReview.has(q.id);

                let cellStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (isCurrent) {
                  cellStyle = 'ring-2 ring-blue-600 bg-blue-600 text-white font-extrabold shadow-sm';
                } else if (isMarked) {
                  cellStyle = 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-400 font-bold';
                } else if (isAnswered) {
                  cellStyle = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-400 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl flex items-center justify-center font-mono text-xs border transition-all hover:scale-105 active:scale-95 ${cellStyle}`}
                    title={`Jump to Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Finish Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-up Bottom Sheet for Full Palette Grid */}
      {mobilePaletteOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-navy-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-surface-darkCard rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 shadow-2xl max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Question Palette Overview
              </h4>
              <button
                onClick={() => setMobilePaletteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-slate-50 dark:bg-slate-900 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Marked for Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-blue-600 bg-white" />
                <span>Current Question</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {quizQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isMarked = markedForReview.has(q.id);

                let cellStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (isCurrent) {
                  cellStyle = 'ring-2 ring-blue-600 bg-blue-600 text-white font-extrabold shadow-sm';
                } else if (isMarked) {
                  cellStyle = 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-400 font-bold';
                } else if (isAnswered) {
                  cellStyle = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-400 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobilePaletteOpen(false);
                    }}
                    className={`h-11 rounded-xl flex items-center justify-center font-mono text-sm border font-bold ${cellStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setMobilePaletteOpen(false);
                setConfirmModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              Proceed to Final Submission
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Assessment?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Please review your progress before finalizing submission:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Answered</span>
                <span className="font-bold font-mono text-emerald-600 text-base">
                  {answeredCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Unanswered</span>
                <span className="font-bold font-mono text-red-500 text-base">
                  {unansweredCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">For Review</span>
                <span className="font-bold font-mono text-purple-600 text-base">{markedCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                You have {unansweredCount} unanswered questions with {formatTime(timeLeft)} remaining.
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Return
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmModalOpen(false);
                  handleFinalSubmit('manual');
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/25"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
