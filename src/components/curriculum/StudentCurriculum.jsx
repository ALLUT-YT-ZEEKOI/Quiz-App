import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../common/PageHeader';
import {
  BookOpen,
  Video,
  HelpCircle,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Clock,
  Sparkles,
  Award,
  Check,
  X,
  RotateCcw,
  AlertCircle,
  QrCode,
  Lock,
  Unlock,
  Upload,
  Copy,
  CreditCard,
  Phone,
  User as UserIcon,
  ShieldCheck,
  Eye,
  Camera
} from 'lucide-react';

import {
  formatEmbedUrl,
  isEmbeddableVideoUrl
} from '../../utils/videoUtils';

export const StudentCurriculum = () => {
  const {
    curriculumSubjects,
    curriculumAttempts,
    recordCurriculumAttempt,
    currentUser,
    showToast,
    checkEnrollmentStatus,
    submitSubscriptionRequest,
    subscriptions,
    difficultyLevels,
    getDifficultyMeta,
    getDifficultyLabel,
    matchesDifficulty
  } = useApp();

  // Navigation hierarchy: null = Subjects list; object = selected subject
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleMode, setModuleMode] = useState('videos'); // 'videos' or 'quiz'

  // Video Player state
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Quiz state
  const [quizDifficulty, setQuizDifficulty] = useState('All'); // 'All', 'Easy', 'Medium', 'Hard'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Subscription & Payment Modal state
  const [payModalSubject, setPayModalSubject] = useState(null);
  const [payStudentName, setPayStudentName] = useState(currentUser?.name || 'Adithyan S.');
  const [payStudentPhone, setPayStudentPhone] = useState(currentUser?.phone || '+91 98471 22334');
  const [payScreenshot, setPayScreenshot] = useState(null);
  const [payTransactionId, setPayTransactionId] = useState('');
  const [pendingModalSubject, setPendingModalSubject] = useState(null);

  const handleOpenPayModal = (sub) => {
    setPayModalSubject(sub);
    setPayStudentName(currentUser?.name || 'Adithyan S.');
    setPayStudentPhone(currentUser?.phone || '+91 98471 22334');
    setPayScreenshot(null);
    setPayTransactionId('');
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (PNG, JPG, WebP)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url) {
        setPayScreenshot(base64Url);
        showToast('Payment screenshot attached!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentProof = (e) => {
    e.preventDefault();
    if (!payModalSubject) return;

    if (!payScreenshot) {
      showToast('Please upload or attach your payment screenshot proof', 'warning');
      return;
    }

    if (!payStudentName.trim() || !payStudentPhone.trim()) {
      showToast('Name and Phone number are required', 'warning');
      return;
    }

    submitSubscriptionRequest({
      subjectId: payModalSubject.id,
      subjectName: payModalSubject.name,
      amount: payModalSubject.price || 499,
      screenshot: payScreenshot,
      transactionId: payTransactionId.trim() || `UPI-${Date.now().toString().slice(-8)}`,
      studentId: currentUser?.id || 'STU001',
      studentName: payStudentName.trim(),
      studentPhone: payStudentPhone.trim(),
      studentAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'
    });

    setPayModalSubject(null);
    setPayScreenshot(null);
    setPayTransactionId('');
  };

  const currentSubject = selectedSubject
    ? curriculumSubjects.find((s) => s.id === selectedSubject.id) || selectedSubject
    : null;

  const currentModule = currentSubject && selectedModule
    ? currentSubject.modules.find((m) => m.id === selectedModule.id) || selectedModule
    : null;

  // Filter questions for quiz based on selected difficulty mode
  const quizQuestions = (currentModule?.questions || []).filter((q) => {
    if (quizDifficulty === 'All') return true;
    return matchesDifficulty(q.difficulty, quizDifficulty);
  });

  // Start / Retake Quiz handler
  const handleStartQuiz = (difficulty = 'All') => {
    setQuizDifficulty(difficulty);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizResult(null);
    setModuleMode('quiz');
  };

  // Select answer option
  const handleSelectOption = (questionId, optionIndex) => {
    if (quizCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (quizQuestions.length === 0) return;

    let correctCount = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / quizQuestions.length) * 100);
    const passed = scorePct >= 60;

    const resultData = {
      id: `att-${Date.now()}`,
      studentId: currentUser?.id || 'STU001',
      studentName: currentUser?.name || 'Student',
      studentAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      moduleId: currentModule.id,
      moduleTitle: currentModule.title,
      difficultyMode:
        quizDifficulty === 'All' ? 'All Questions' : `${getDifficultyLabel(quizDifficulty)} Mode`,
      totalQuestions: quizQuestions.length,
      correctCount,
      scorePct,
      status: passed ? 'Passed' : 'Needs Practice',
      timeTaken: '03:15',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setQuizResult(resultData);
    setQuizCompleted(true);
    recordCurriculumAttempt(resultData);
    showToast(`Quiz completed: ${scorePct}% (${passed ? 'PASSED' : 'NEEDS PRACTICE'})`, passed ? 'success' : 'info');
  };

  // =========================================================================
  // VIEW 3: MODULE INTERACTIVE LEARNING (Watch Videos OR Attend Quiz)
  // =========================================================================
  if (currentSubject && currentModule) {
    const videos = currentModule.videos || [];
    const activeVideo = videos[activeVideoIndex] || videos[0];

    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <button
            onClick={() => {
              setSelectedSubject(null);
              setSelectedModule(null);
            }}
            className="hover:text-blue-600 font-semibold"
          >
            Subjects
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            onClick={() => setSelectedModule(null)}
            className="hover:text-blue-600 font-semibold"
          >
            {currentSubject.name}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-900 dark:text-white truncate">
            {currentModule.title}
          </span>
        </div>

        {/* Top Module Banner: App Header Style */}
        <PageHeader
          onBack={() => setSelectedModule(null)}
          backLabel="Back to Modules"
          title={currentModule.title}
          subtitle={`${currentSubject.name} • ${currentModule.duration || '45 mins'}`}
          badge={
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {currentSubject.name}
            </span>
          }
          actions={
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 shrink-0">
              <button
                onClick={() => setModuleMode('videos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  moduleMode === 'videos'
                    ? 'bg-white dark:bg-slate-800 text-[#087F8C] dark:text-[#2DD4BF] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Watch Videos</span>
              </button>
              <button
                onClick={() => setModuleMode('quiz')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  moduleMode === 'quiz'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Attend Quiz</span>
              </button>
            </div>
          }
        />

        {/* ================================================================= */}
        {/* SUB-VIEW A: WATCH VIDEOS                                          */}
        {/* ================================================================= */}
        {moduleMode === 'videos' && (
          <div className="space-y-4">
            {videos.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <Video className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                  No Videos in This Module
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The instructor hasn't added lesson videos to this module yet. You can still test your knowledge with the quiz!
                </p>
                <button
                  onClick={() => setModuleMode('quiz')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md"
                >
                  <HelpCircle className="w-4 h-4" /> Attend Module Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Video Player Screen (2 cols on large screen) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
                    {/* Responsive Video Container */}
                    <div className="relative aspect-video bg-black w-full">
                      {isEmbeddableVideoUrl(activeVideo?.videoUrl) ? (
                        <iframe
                          src={formatEmbedUrl(activeVideo.videoUrl)}
                          title={activeVideo.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-navy-950 via-slate-900 to-blue-950 p-6 text-center">
                          <PlayCircle className="w-16 h-16 text-blue-400 mb-3 animate-pulse" />
                          <h4 className="font-extrabold text-base sm:text-lg max-w-md">
                            {activeVideo?.title}
                          </h4>
                          <span className="text-xs text-blue-200 mt-1">
                            Duration: {activeVideo?.duration}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Video Info & Notes */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-blue-600 uppercase tracking-wider">
                          Lesson {activeVideoIndex + 1} of {videos.length}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" /> {activeVideo?.duration}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        {activeVideo?.title}
                      </h3>

                      {activeVideo?.description && (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {activeVideo.description}
                        </p>
                      )}

                      {activeVideo?.notes && (
                        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
                          <strong className="block font-bold mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Lesson Study Notes:
                          </strong>
                          {activeVideo.notes}
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                        <div className="text-xs text-slate-400">
                          Ready to test your comprehension?
                        </div>
                        <button
                          onClick={() => setModuleMode('quiz')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Take Module Quiz ➡️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playlist Drawer (1 col) */}
                <div className="space-y-3">
                  <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                      <span>Module Video Lessons</span>
                      <span className="text-xs text-slate-400 font-normal">
                        {videos.length} videos
                      </span>
                    </h4>

                    <div className="space-y-2">
                      {videos.map((vid, idx) => {
                        const isActive = idx === activeVideoIndex;
                        return (
                          <button
                            key={vid.id || idx}
                            onClick={() => setActiveVideoIndex(idx)}
                            className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                                : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <PlayCircle className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Lesson {idx + 1} • {vid.duration}
                              </span>
                              <h5
                                className={`text-xs font-bold truncate mt-0.5 ${
                                  isActive
                                    ? 'text-blue-900 dark:text-blue-200'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {vid.title}
                              </h5>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* SUB-VIEW B: ATTEND QUIZ (WITH EASY / MEDIUM / HARD DIFFICULTY)     */}
        {/* ================================================================= */}
        {moduleMode === 'quiz' && (
          <div className="space-y-5">
            {/* Difficulty Selector Bar */}
            <div className="bg-white dark:bg-surface-darkCard p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-semibold mr-1">Practice Mode:</span>
                <button
                  onClick={() => handleStartQuiz('All')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    quizDifficulty === 'All'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {difficultyLevels.map((lvl) => {
                  const isActive = quizDifficulty === lvl.label || quizDifficulty === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => handleStartQuiz(lvl.label)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>{lvl.dot}</span>
                      <span>{lvl.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs text-slate-400">
                {quizQuestions.length} Questions in this mode
              </span>
            </div>

            {/* QUIZ COMPLETED: SCORECARD & ANSWER REVIEW */}
            {quizCompleted && quizResult ? (
              <div className="space-y-6 animate-in zoom-in-95">
                {/* Result Card */}
                <div className="bg-white dark:bg-surface-darkCard rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md text-center max-w-2xl mx-auto">
                  <div
                    className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-3 ${
                      quizResult.status === 'Passed'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {quizResult.scorePct}%
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      quizResult.status === 'Passed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {quizResult.status}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-3">
                    {quizResult.status === 'Passed' ? 'Great Job!' : 'Keep Practicing!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    You scored <strong>{quizResult.correctCount}</strong> out of{' '}
                    <strong>{quizResult.totalQuestions}</strong> correct in{' '}
                    {quizResult.difficultyMode}.
                  </p>

                  <div className="flex justify-center gap-3 mt-6">
                    <button
                      onClick={() => handleStartQuiz(quizDifficulty)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Quiz</span>
                    </button>
                    <button
                      onClick={() => setModuleMode('videos')}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                    >
                      <Video className="w-4 h-4" />
                      <span>Review Video Lessons</span>
                    </button>
                  </div>
                </div>

                {/* Question by Question Detailed Review */}
                <div className="space-y-4 max-w-2xl mx-auto">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Detailed Answers Review:
                  </h4>

                  {quizQuestions.map((q, idx) => {
                    const studentChoice = selectedAnswers[q.id];
                    const isCorrect = studentChoice === q.correctAnswer;

                    return (
                      <div
                        key={q.id || idx}
                        className={`p-5 rounded-2xl border ${
                          isCorrect
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            Question {idx + 1} ({getDifficultyLabel(q.difficulty)} Mode)
                          </span>
                          <span
                            className={`font-bold flex items-center gap-1 ${
                              isCorrect ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <Check className="w-4 h-4" /> Correct
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4" /> Incorrect
                              </>
                            )}
                          </span>
                        </div>

                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {q.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {q.options?.map((opt, oIdx) => {
                            const isSelected = studentChoice === oIdx;
                            const isRightAnswer = oIdx === q.correctAnswer;

                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-xl text-xs flex items-center gap-2 border ${
                                  isRightAnswer
                                    ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 font-bold text-emerald-950 dark:text-emerald-100'
                                    : isSelected
                                    ? 'bg-red-100 dark:bg-red-900/50 border-red-300 text-red-900 dark:text-red-100 line-through'
                                    : 'bg-white dark:bg-surface-darkCard border-slate-200 dark:border-slate-800 text-slate-500'
                                }`}
                              >
                                <span className="font-bold">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-surface-darkCard text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : quizQuestions.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                  No {quizDifficulty !== 'All' ? quizDifficulty : ''} Questions Available
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try switching practice mode to "All" or check other difficulty levels.
                </p>
                <button
                  onClick={() => handleStartQuiz('All')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Show All Questions
                </button>
              </div>
            ) : (
              // ACTIVE QUESTION SCREEN
              <div className="max-w-2xl mx-auto bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
                {/* Header Progress */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {getDifficultyLabel(quizQuestions[currentQuestionIndex].difficulty)} Mode
                    </span>
                  </div>
                  <span className="text-slate-400">
                    Answered:{' '}
                    <strong>{Object.keys(selectedAnswers).length}</strong>/
                    {quizQuestions.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / quizQuestions.length) * 100
                      }%`
                    }}
                  />
                </div>

                {/* Question Text */}
                <div className="py-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {quizQuestions[currentQuestionIndex].question}
                  </h3>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {quizQuestions[currentQuestionIndex].options.map((option, optIdx) => {
                    const isSelected =
                      selectedAnswers[quizQuestions[currentQuestionIndex].id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          handleSelectOption(
                            quizQuestions[currentQuestionIndex].id,
                            optIdx
                          )
                        }
                        className={`w-full p-3.5 sm:p-4 rounded-2xl text-left border transition-all flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 font-bold text-emerald-950 dark:text-emerald-100 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-xs sm:text-sm">{option}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
                    >
                      Submit Quiz & View Score
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SUBJECT DETAIL (Modules Directory for Students - Requires Enrollment)
  // =========================================================================
  if (currentSubject) {
    const enrollment = checkEnrollmentStatus(currentUser?.id || 'STU001', currentSubject.id);

    // If locked or pending verification, show paywall / status screen
    if (enrollment !== 'active') {
      return (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={() => setSelectedSubject(null)}
              className="hover:text-blue-600 font-semibold"
            >
              Subjects
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-slate-900 dark:text-white truncate">
              {currentSubject.name}
            </span>
          </div>

          <div className="bg-white dark:bg-surface-darkCard rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
                enrollment === 'pending'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
              }`}
            >
              {enrollment === 'pending' ? (
                <Clock className="w-8 h-8 animate-pulse" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {currentSubject.name}
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {enrollment === 'pending'
                  ? 'Verification in Progress'
                  : 'Subscription Required'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {enrollment === 'pending'
                  ? 'Your payment screenshot is awaiting manual review by the Admin. Access will unlock automatically once approved.'
                  : `To access video lessons and assessments for ${currentSubject.name}, please complete the one-time subscription payment of ₹${currentSubject.price || 499}.`}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Back to Subjects
              </button>
              {enrollment === 'locked' && (
                <button
                  onClick={() => handleOpenPayModal(currentSubject)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR & Subscribe (₹{currentSubject.price || 499})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => setSelectedSubject(null)}
            className="hover:text-blue-600 font-semibold"
          >
            Subjects
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-900 dark:text-white truncate">
            {currentSubject.name}
          </span>
        </div>

        {/* Subject Header Banner: App Header Style */}
        <PageHeader
          onBack={() => setSelectedSubject(null)}
          backLabel="Back to All Subjects"
          title={currentSubject.name}
          subtitle={`${currentSubject.code || 'CODE'} • ${currentSubject.category} • ${currentSubject.description?.slice(0, 70)}...`}
          badge={
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 border border-[#20B8C7]/20">
                {currentSubject.code || 'CODE'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/60">
                <Check className="w-3 h-3" /> Enrolled
              </span>
            </div>
          }
        />

        {/* Modules List */}
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mb-3 flex items-center justify-between">
            <span>Lessons & Modules ({currentSubject.modules?.length || 0})</span>
            <span className="text-xs font-normal text-slate-400">
              Select a module to watch video lectures or attend quiz
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {(currentSubject.modules || []).map((mod, idx) => {
              const totalVideos = mod.videos?.length || 0;
              const totalQuestions = mod.questions?.length || 0;

              // Check if student has already attended this module's quiz
              const pastAttempt = (curriculumAttempts || []).find(
                (a) => a.moduleId === mod.id && a.studentId === (currentUser?.id || 'STU001')
              );

              return (
                <div
                  key={mod.id || idx}
                  className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs hover:border-[#20B8C7]/50 card-hover-lift transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 border border-[#20B8C7]/20 text-[10px] font-extrabold tracking-wide">
                        Module {idx + 1}
                      </span>
                      {pastAttempt ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" /> {pastAttempt.scorePct}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                          <Clock className="w-3 h-3" /> {mod.duration || '45 mins'}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate group-hover:text-[#0C4E5B] dark:group-hover:text-cyan-400 transition-colors" title={mod.title}>
                      {mod.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-snug" title={mod.description}>
                      {mod.description || 'No description provided.'}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900/40">
                        <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="font-bold truncate">{totalVideos} Videos</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900/40">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bold truncate">{totalQuestions} Questions</span>
                      </div>
                    </div>

                    {/* Difficulty Badges for Students */}
                    {totalQuestions > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-slate-500 flex-wrap">
                        <span className="text-slate-400 font-semibold">Modes:</span>
                        {difficultyLevels.map((lvl) => {
                          const count = (mod.questions || []).filter((q) =>
                            matchesDifficulty(q.difficulty, lvl.id)
                          ).length;
                          const badgeColor =
                            lvl.color === 'emerald'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              : lvl.color === 'red'
                              ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60';
                          return (
                            <span key={lvl.id} className={`px-1.5 py-0.5 rounded font-semibold ${badgeColor}`}>
                              {count} {lvl.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedModule(mod);
                        setModuleMode('videos');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95 transition-all truncate"
                    >
                      <Video className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                      <span className="truncate">Videos</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedModule(mod);
                        handleStartQuiz('All');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs border border-[#20B8C7]/30 active:scale-95 transition-all truncate"
                    >
                      <HelpCircle className="w-3.5 h-3.5 shrink-0 text-cyan-300" />
                      <span className="truncate">Quiz</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: SUBJECTS DIRECTORY FOR STUDENTS (WITH SUBSCRIPTION STATUS)
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner: Mobile App Style on Mobile, Tablet-Friendly, Premium SaaS on Desktop */}
      <div className="bg-gradient-to-br from-[#07191E] via-[#0A262C] to-[#0E353E] text-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden border border-[#144752]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
          <div className="space-y-2 sm:space-y-2.5 max-w-2xl">
            {/* Top Row: Greeting and Portal Tag */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30">
                  Student Portal
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Civil Engineering
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-300 shrink-0">
                Hi, {currentUser?.name || 'Student'}! 👋
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                My Subjects & Course Subscriptions
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mt-1 line-clamp-2 lg:line-clamp-none max-w-xl">
                Explore syllabus-aligned modules, watch recorded video lectures, and practice with difficulty-tuned assessments.
              </p>
            </div>
          </div>

          {/* Quick Stat Chips (Adaptive Tablet & Mobile Row) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 pt-1 lg:pt-0">
            <div className="flex-1 sm:flex-initial flex items-center justify-center sm:flex-col gap-2 sm:gap-1 px-4 py-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 dark:bg-white/5 border border-white/10 backdrop-blur-md text-center min-w-[95px]">
              <span className="text-lg sm:text-2xl font-black text-emerald-400 leading-none">
                {curriculumSubjects.filter((s) => checkEnrollmentStatus(currentUser?.id || 'STU001', s.id) === 'active').length}
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-200">
                Enrolled
              </span>
            </div>

            <div className="flex-1 sm:flex-initial flex items-center justify-center sm:flex-col gap-2 sm:gap-1 px-4 py-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 dark:bg-white/5 border border-white/10 backdrop-blur-md text-center min-w-[95px]">
              <span className="text-lg sm:text-2xl font-black text-cyan-300 leading-none">
                {curriculumSubjects.length}
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-200">
                Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid (2 Cards in a Row on Mobile App, 4 on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
        {curriculumSubjects.map((sub) => {
          const totalModules = sub.modules?.length || 0;
          const totalVideos = (sub.modules || []).reduce(
            (acc, m) => acc + (m.videos?.length || 0),
            0
          );
          const totalQuestions = (sub.modules || []).reduce(
            (acc, m) => acc + (m.questions?.length || 0),
            0
          );

          const enrollment = checkEnrollmentStatus(currentUser?.id || 'STU001', sub.id);
          const isEnrolled = enrollment === 'active';
          const isPending = enrollment === 'pending';
          const isLocked = enrollment === 'locked';

          return (
            <div
              key={sub.id}
              className="bg-white dark:bg-surface-darkCard rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs card-hover-lift flex flex-col justify-between group"
            >
              <div>
                {/* Banner Thumbnail (Compact Aspect for 2 Cards in a Row) */}
                <div className="h-24 sm:h-32 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={sub.thumbnail}
                    alt={sub.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07191E] via-[#0A262C]/60 to-transparent" />
                  
                  {/* Top Left: Code */}
                  <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-900 shadow-2xs">
                      {sub.code || 'CODE'}
                    </span>
                  </div>

                  {/* Top Right: Status Badge */}
                  <div className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5">
                    {isEnrolled ? (
                      <span className="px-1.5 sm:px-2.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-0.5 sm:gap-1 shadow-2xs">
                        <Unlock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="hidden min-[360px]:inline">Enrolled</span>
                      </span>
                    ) : isPending ? (
                      <span className="px-1.5 sm:px-2.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white flex items-center gap-0.5 sm:gap-1 shadow-2xs animate-soft-pulse">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="hidden min-[360px]:inline">Pending</span>
                      </span>
                    ) : (
                      <span className="px-1.5 sm:px-2.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black bg-[#00897B] text-white flex items-center gap-0.5 sm:gap-1 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span>₹{sub.price || 499}</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Title & Category */}
                  <div className="absolute bottom-1.5 sm:bottom-2.5 left-1.5 sm:left-2.5 right-1.5 sm:right-2.5">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-cyan-300 block leading-tight truncate">
                      {sub.category}
                    </span>
                    <h3 className="font-extrabold text-xs sm:text-base text-white truncate drop-shadow-sm">
                      {sub.name}
                    </h3>
                  </div>
                </div>

                <div className="p-2 sm:p-3.5 space-y-1.5 sm:space-y-2">
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug hidden sm:block">
                    {sub.description}
                  </p>

                  {/* Mobile App Style Metric Summary (Visible on Mobile) */}
                  <div className="flex sm:hidden items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300 py-1 border-y border-slate-100 dark:border-slate-800/60 my-0.5">
                    <span className="flex items-center gap-0.5">
                      <span className="text-teal-600 dark:text-teal-400 font-extrabold">{totalModules}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">Mod</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-0.5">
                      <span className="text-teal-600 dark:text-teal-400 font-extrabold">{totalVideos}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">Vid</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{totalQuestions}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">Qs</span>
                    </span>
                  </div>

                  {/* Desktop / Tablet 3-Column Boxes (Visible on sm and up) */}
                  <div className="hidden sm:grid grid-cols-3 gap-1.5 pt-0.5 text-center">
                    <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 truncate">
                      <span className="block text-xs font-black text-slate-900 dark:text-white">
                        {totalModules}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                        Modules
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 truncate">
                      <span className="block text-xs font-black text-teal-600 dark:text-teal-400">
                        {totalVideos}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                        Videos
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 truncate">
                      <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {totalQuestions}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                        Practice
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Enrolled vs Pending vs Locked */}
              <div className="p-2 sm:p-3.5 pt-0 sm:pt-0 border-t border-slate-100 dark:border-slate-800/60 pt-1.5 sm:pt-2.5">
                {isEnrolled ? (
                  <button
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all shadow-xs border border-[#20B8C7]/30 active:scale-95 group/btn"
                  >
                    <span>Start Learning</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                ) : isPending ? (
                  <button
                    type="button"
                    onClick={() => setPendingModalSubject(sub)}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all truncate"
                  >
                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">Pending</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPayModal(sub)}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs border border-[#20B8C7]/30 active:scale-95 transition-all truncate"
                  >
                    <Lock className="w-3 h-3 text-cyan-200 shrink-0" />
                    <span className="truncate">₹{sub.price || 499}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* MODAL: SUBSCRIBE & PAY VIA QR CODE                                */}
      {/* ================================================================= */}
      {payModalSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Unlock Course: {payModalSubject.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scan UPI QR & submit payment screenshot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayModalSubject(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code & Payment Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30 border border-blue-100 dark:border-blue-900/50 mb-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Scan & Pay via UPI
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{payModalSubject.price || 499}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Full access to all video lessons & practice quizzes
              </p>

              {/* QR Image Box */}
              <div className="my-3 mx-auto w-44 h-44 bg-white p-2.5 rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-center relative">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=cohesiontech@upi%26pn=CohesionTech%20Education%26am=${payModalSubject.price || 499}%26cu=INR`}
                  alt="UPI Payment QR Code"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300';
                  }}
                />
              </div>

              {/* UPI ID with 1-click Copy */}
              <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
                <span className="text-slate-400">UPI ID:</span>
                <code className="font-mono font-bold text-slate-900 dark:text-white">
                  cohesiontech@upi
                </code>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText('cohesiontech@upi');
                      showToast('Copied UPI ID: cohesiontech@upi', 'success');
                    }
                  }}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600"
                  title="Copy UPI ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[10px] text-slate-400 mt-2">
                Scan with Google Pay, PhonePe, Paytm, or BHIM UPI
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPaymentProof} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                {/* Pre-filled Student Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Name (Pre-filled) *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={payStudentName}
                      onChange={(e) => setPayStudentName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
                    />
                  </div>
                </div>

                {/* Pre-filled Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (Pre-filled) *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={payStudentPhone}
                      onChange={(e) => setPayStudentPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Screenshot Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Payment Screenshot Proof *
                </label>

                {payScreenshot ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                    <img
                      src={payScreenshot}
                      alt="Attached Screenshot"
                      className="w-12 h-12 rounded-lg object-cover border border-emerald-400"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block truncate">
                        Screenshot Attached
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Ready to send to Admin for manual review
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPayScreenshot(null)}
                      className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700/60 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-all text-center">
                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      Upload Payment Screenshot
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, WebP from GPay / PhonePe / Paytm receipt
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      className="hidden"
                      onChange={handleScreenshotUpload}
                    />
                  </label>
                )}
              </div>

              {/* Transaction Ref (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UPI Ref / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12-digit transaction ID"
                  value={payTransactionId}
                  onChange={(e) => setPayTransactionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalSubject(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs font-bold text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Submit Proof to Admin ➡️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: PENDING VERIFICATION INFO                                   */}
      {/* ================================================================= */}
      {pendingModalSubject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPendingModalSubject(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Payment Proof Submitted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your payment screenshot for <strong>{pendingModalSubject.name}</strong> has been received by the Admin.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 text-left space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Manual Verification in Progress
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                The Admin will review your transaction screenshot and verify the payment. Once approved, the video lectures and module quizzes will unlock automatically.
              </p>
            </div>

            <button
              onClick={() => setPendingModalSubject(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
