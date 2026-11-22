import React, { useState } from 'react';
import { compressImageFile } from '../../utils/imageCompress';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../common/PageHeader';
import {
  BookOpen,
  Video,
  HelpCircle,
  PlayCircle,
  Layers,
  NotebookText,
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
  CalendarClock,
  RefreshCw,
  Infinity as InfinityIcon,
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
  isEmbeddableVideoUrl,
  extractYouTubeVideoId
} from '../../utils/videoUtils';
import { groupVideosBySection } from '../../utils/curriculumSections';
import { NotesList, NotePreviewModal } from './ModuleNotes';
import { ProtectedVideoPlayer } from './ProtectedVideoPlayer';
import { formatValidity, formatDate, formatDaysLeft, isLifetime } from '../../utils/subscriptionUtils';

export const StudentCurriculum = () => {
  const {
    curriculumSubjects,
    curriculumAttempts,
    recordCurriculumAttempt,
    currentUser,
    showToast,
    checkEnrollmentStatus,
    getSubjectSubscription,
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
  const [moduleMode, setModuleMode] = useState('videos'); // 'videos', 'notes' or 'quiz'
  const [viewingNote, setViewingNote] = useState(null);

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

  const studentId = currentUser?.id || 'STU001';

  // "₹499 · 60 days" style label for a subject's plan
  const planLabel = (sub) =>
    isLifetime(sub?.validityDays)
      ? `₹${sub?.price || 499} · Lifetime`
      : `₹${sub?.price || 499} · ${formatValidity(sub?.validityDays)}`;

  const hasPendingRequest = (subjectId) =>
    (subscriptions || []).some(
      (s) => s.studentId === studentId && s.subjectId === subjectId && s.status === 'pending'
    );

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

    compressImageFile(file, { maxDim: 1600, quality: 0.75 })
      .then((dataUrl) => {
        setPayScreenshot(dataUrl);
        showToast('Payment screenshot attached!', 'success');
      })
      .catch(() => showToast('Could not read this image. Please try another one.', 'warning'));
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
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      // Every question with the student's choice, so it can be reviewed later (Marks & Answers)
      answers: quizQuestions.map((q) => {
        const selected = selectedAnswers[q.id];
        return {
          questionId: q.id,
          questionText: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          selectedOption: selected === undefined ? null : selected,
          isCorrect: selected === q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || ''
        };
      })
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
    // Videos play in section order: Section 1 lessons, then Section 2, ...
    const { groups: sectionGroups, ordered: orderedLessons } = groupVideosBySection(currentModule);
    const videos = orderedLessons.map((l) => l.video);
    const activeLesson = orderedLessons[activeVideoIndex] || orderedLessons[0];
    const activeVideo = activeLesson?.video;
    const visibleSectionGroups = sectionGroups.filter((g) => g.videos.length > 0);

    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 min-w-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedSubject(null);
              setSelectedModule(null);
            }}
            className="hover:text-teal-600 dark:hover:text-teal-400 font-semibold shrink-0 px-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Subjects
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            type="button"
            onClick={() => setSelectedModule(null)}
            className="hover:text-teal-600 dark:hover:text-teal-400 font-semibold truncate max-w-[90px] sm:max-w-[200px] px-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={currentSubject.name}
          >
            {currentSubject.name}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[110px] sm:max-w-none px-1.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg" title={currentModule.title}>
            {currentModule.title}
          </span>
        </div>

        {/* Top Module Banner: Clean App Header Style */}
        <PageHeader
          onBack={() => setSelectedModule(null)}
          backLabel="Back to Modules"
          title={currentModule.title}
          subtitle={`${currentSubject.name} • ${currentModule.duration || '45 mins'}`}
          badge={
            <>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {currentSubject.name}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{currentModule.duration || '45 mins'}</span>
              </span>
            </>
          }
        />

        {/* Segmented Control / Tab Switcher (Videos / Notes / Quiz) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <button
            type="button"
            onClick={() => setModuleMode('videos')}
            className={`min-h-[2.75rem] py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              moduleMode === 'videos'
                ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 shadow-xs border border-slate-200/70 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            <Video className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${moduleMode === 'videos' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span className="truncate">
              <span className="sm:hidden">Videos ({videos.length})</span>
              <span className="hidden sm:inline">Watch Videos ({videos.length})</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModuleMode('notes')}
            className={`min-h-[2.75rem] py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              moduleMode === 'notes'
                ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 shadow-xs border border-slate-200/70 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            <NotebookText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${moduleMode === 'notes' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`} />
            <span className="truncate">
              <span className="sm:hidden">Notes ({currentModule.notes?.length || 0})</span>
              <span className="hidden sm:inline">Study Notes ({currentModule.notes?.length || 0})</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModuleMode('quiz')}
            className={`min-h-[2.75rem] py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              moduleMode === 'quiz'
                ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 shadow-xs border border-slate-200/70 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            <HelpCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${moduleMode === 'quiz' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
            <span className="truncate">
              <span className="sm:hidden">Quiz ({currentModule.questions?.length || 0})</span>
              <span className="hidden sm:inline">Attend Quiz ({currentModule.questions?.length || 0})</span>
            </span>
          </button>
        </div>

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
                      {extractYouTubeVideoId(activeVideo?.videoUrl) ? (
                        // YouTube: protected player (no title bar, share, YouTube links or right-click)
                        <ProtectedVideoPlayer
                          key={activeVideo.id}
                          videoUrl={activeVideo.videoUrl}
                          title={activeVideo.title}
                          watermark={[currentUser?.name, currentUser?.phone].filter(Boolean).join(' • ')}
                          nextLabel="Next lesson"
                          onEnded={
                            activeVideoIndex < videos.length - 1
                              ? () => setActiveVideoIndex(activeVideoIndex + 1)
                              : undefined
                          }
                        />
                      ) : isEmbeddableVideoUrl(activeVideo?.videoUrl) ? (
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
                        <span className="font-bold text-blue-600 uppercase tracking-wider truncate min-w-0">
                          Section {(activeLesson?.sectionIndex ?? 0) + 1} • Lesson {(activeLesson?.lessonIndex ?? 0) + 1} of {activeLesson?.sectionVideoCount || videos.length}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" /> {activeVideo?.duration}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {activeLesson?.section && (
                          <span className="inline-flex max-w-full items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800 text-[10px] font-bold">
                            <Layers className="w-3 h-3 shrink-0" />
                            <span className="truncate">{activeLesson.section.title}</span>
                          </span>
                        )}
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          {activeVideo?.title}
                        </h3>
                      </div>

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

                    <div className="space-y-4">
                      {visibleSectionGroups.map(({ section, sectionIndex, videos: sectionVideos }) => {
                        // Global playback index of this section's first lesson
                        const offset = orderedLessons.findIndex((l) => l.section.id === section.id);
                        return (
                          <div key={section.id} className="space-y-2">
                            <div className="flex items-center gap-2 px-0.5">
                              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                                {sectionIndex + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-extrabold text-slate-900 dark:text-white truncate" title={section.title}>
                                  {section.title}
                                </h5>
                                {section.description && (
                                  <p className="text-[10px] text-slate-400 truncate">{section.description}</p>
                                )}
                              </div>
                              <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                                {sectionVideos.length} {sectionVideos.length === 1 ? 'video' : 'videos'}
                              </span>
                            </div>

                            {sectionVideos.map((vid, lessonIdx) => {
                              const idx = offset + lessonIdx;
                              const isActive = idx === activeVideoIndex;
                              return (
                                <button
                                  key={vid.id || idx}
                                  onClick={() => setActiveVideoIndex(idx)}
                                  aria-current={isActive ? 'true' : undefined}
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
                                      Lesson {lessonIdx + 1} • {vid.duration}
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
        {/* SUB-VIEW: STUDY NOTES SHARED BY THE TEACHER                       */}
        {/* ================================================================= */}
        {moduleMode === 'notes' && (
          <div className="space-y-4">
            <NotesList
              notes={currentModule.notes || []}
              onOpen={setViewingNote}
              emptyState={
                <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                  <NotebookText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                    No Notes in This Module
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your instructor hasn't shared study notes for this module yet. Check back later!
                  </p>
                </div>
              }
            />
          </div>
        )}

        {viewingNote && <NotePreviewModal note={viewingNote} onClose={() => setViewingNote(null)} />}

        {/* ================================================================= */}
        {/* SUB-VIEW B: ATTEND QUIZ (WITH EASY / MEDIUM / HARD DIFFICULTY)     */}
        {/* ================================================================= */}
        {moduleMode === 'quiz' && (
          <div className="space-y-5">
            {/* Difficulty Selector Bar */}
            <div className="bg-white dark:bg-surface-darkCard p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-semibold">Practice Mode</span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium shrink-0">
                  {quizQuestions.length} Questions in this mode
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handleStartQuiz('All')}
                  className={`min-h-[2.25rem] px-1.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
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
                      type="button"
                      onClick={() => handleStartQuiz(lvl.label)}
                      className={`min-h-[2.25rem] px-1.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all inline-flex items-center justify-center gap-1 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span className="shrink-0">{lvl.dot}</span>
                      <span className="truncate">{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
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

  // Subscribe / Renew payment modal: shared by the subjects list and subject screens.
  // Portaled to <body> so animated (transformed) page wrappers can't offset the overlay.
  const payModal =
    payModalSubject &&
    createPortal(
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
                    {['active', 'expired'].includes(checkEnrollmentStatus(studentId, payModalSubject.id))
                      ? 'Renew Course'
                      : 'Unlock Course'}
                    : {payModalSubject.name}
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
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {' '}/ {formatValidity(payModalSubject.validityDays)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isLifetime(payModalSubject.validityDays)
                  ? 'Lifetime access to all video lessons, notes & practice quizzes'
                  : `Full access for ${formatValidity(payModalSubject.validityDays)}, starting when the Admin approves your payment`}
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
        </div>,
      document.body
    );

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
                  : enrollment === 'expired'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
              }`}
            >
              {enrollment === 'pending' ? (
                <Clock className="w-8 h-8 animate-pulse" />
              ) : enrollment === 'expired' ? (
                <CalendarClock className="w-8 h-8" />
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
                  : enrollment === 'expired'
                  ? 'Subscription Ended'
                  : 'Subscription Required'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {enrollment === 'pending'
                  ? 'Your payment screenshot is awaiting manual review by the Admin. Access will unlock automatically once approved.'
                  : enrollment === 'expired'
                  ? `Your access to ${currentSubject.name} ended on ${formatDate(
                      getSubjectSubscription(studentId, currentSubject.id)?.timing.expiresAt
                    )}. Renew to continue learning — your progress is saved.`
                  : isLifetime(currentSubject.validityDays)
                  ? `To access video lessons and assessments for ${currentSubject.name}, please complete the one-time subscription payment of ₹${currentSubject.price || 499} for lifetime access.`
                  : `To access video lessons and assessments for ${currentSubject.name}, subscribe for ₹${currentSubject.price || 499}. Access lasts ${formatValidity(currentSubject.validityDays)} from the day your payment is approved.`}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Back to Subjects
              </button>
              {(enrollment === 'locked' || enrollment === 'expired') && (
                <button
                  onClick={() => handleOpenPayModal(currentSubject)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {enrollment === 'expired' ? <RefreshCw className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                  <span>
                    {enrollment === 'expired' ? 'Renew' : 'Scan QR & Subscribe'} ({planLabel(currentSubject)})
                  </span>
                </button>
              )}
            </div>
          </div>
          {payModal}
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            onClick={() => setSelectedSubject(null)}
            className="hover:text-teal-600 dark:hover:text-teal-400 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Subjects
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-white truncate px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {currentSubject.name}
          </span>
        </div>

        {/* Subject Header Banner: App Header Style */}
        <PageHeader
          onBack={() => setSelectedSubject(null)}
          backLabel="Back to All Subjects"
          title={currentSubject.name}
          subtitle={`${currentSubject.code || 'CODE'} • ${currentSubject.category} • ${currentSubject.description || 'Syllabus-aligned modules and practice assessments.'}`}
          badge={
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {currentSubject.code || 'CODE'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/60">
                <Check className="w-3 h-3" /> Enrolled
              </span>
            </div>
          }
        />

        <SubscriptionStatusBanner
          subscription={getSubjectSubscription(studentId, currentSubject.id)}
          isFree={!currentSubject.price || Number(currentSubject.price) === 0}
          renewalPending={hasPendingRequest(currentSubject.id)}
          planLabel={planLabel(currentSubject)}
          onRenew={() => handleOpenPayModal(currentSubject)}
        />

        {/* Quick Subject Overview Strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Modules
            </span>
            <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {currentSubject.modules?.length || 0}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-1 border-x border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Videos
            </span>
            <span className="text-base sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {(currentSubject.modules || []).reduce((acc, m) => acc + (m.videos?.length || 0), 0)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Practice Qs
            </span>
            <span className="text-base sm:text-xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
              {(currentSubject.modules || []).reduce((acc, m) => acc + (m.questions?.length || 0), 0)}
            </span>
          </div>
        </div>

        {/* Modules List Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Lessons & Modules</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold">
                  {currentSubject.modules?.length || 0}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select a module to watch video lectures or attend practice quizzes
              </p>
            </div>
          </div>

          {(currentSubject.modules || []).length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                No Modules Available Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                The faculty is actively preparing the curriculum for this subject. Check back soon for video lectures and assessments!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {(currentSubject.modules || []).map((mod, idx) => {
                const totalVideos = mod.videos?.length || 0;
                const totalQuestions = mod.questions?.length || 0;
                const totalNotes = mod.notes?.length || 0;

                // Check if student has already attended this module's quiz
                const pastAttempt = (curriculumAttempts || []).find(
                  (a) => a.moduleId === mod.id && a.studentId === (currentUser?.id || 'STU001')
                );

                return (
                  <div
                    key={mod.id || idx}
                    className="relative bg-white dark:bg-surface-darkCard rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-5 shadow-xs hover:shadow-md hover:border-teal-500/40 transition-all flex flex-col justify-between group overflow-hidden"
                  >
                    {/* Subtle Top Accent Glow */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 opacity-90" />

                    <div>
                      {/* Card Header: Module Number & Duration / Score */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 text-xs font-black flex items-center justify-center shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Module {idx + 1}
                          </span>
                        </div>

                        {pastAttempt ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{pastAttempt.scorePct}% Score</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{mod.duration || '45 mins'}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {mod.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {mod.description || 'Comprehensive video lectures and question pool aligned with course syllabus.'}
                      </p>

                      {/* Learning Resources Chips */}
                      <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40 text-xs font-bold">
                          <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{totalVideos} {totalVideos === 1 ? 'Video' : 'Videos'}</span>
                        </div>

                        {totalNotes > 0 && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40 text-xs font-bold">
                            <NotebookText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{totalNotes} {totalNotes === 1 ? 'Note' : 'Notes'}</span>
                          </div>
                        )}

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40 text-xs font-bold">
                          <HelpCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>{totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}</span>
                        </div>
                      </div>

                      {/* Difficulty Breakdown Tags */}
                      {totalQuestions > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">
                            Modes:
                          </span>
                          {difficultyLevels.map((lvl) => {
                            const count = (mod.questions || []).filter((q) =>
                              matchesDifficulty(q.difficulty, lvl.id)
                            ).length;
                            if (count === 0) return null;
                            const dotColor =
                              lvl.id === 'easy' ? 'bg-emerald-500' : lvl.id === 'hard' ? 'bg-rose-500' : 'bg-amber-500';
                            return (
                              <span
                                key={lvl.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                <span>{count} {lvl.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => {
                          setSelectedModule(mod);
                          setActiveVideoIndex(0);
                          setModuleMode('videos');
                        }}
                        className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Watch Videos</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedModule(mod);
                          handleStartQuiz('All');
                        }}
                        className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
                        <span>Practice Quiz</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {payModal}
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

      {/* Subjects Grid — 1 card per row on mobile, multi-col on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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

          const enrollment = checkEnrollmentStatus(studentId, sub.id);
          const isEnrolled = enrollment === 'active';
          const isPending = enrollment === 'pending';
          const isExpired = enrollment === 'expired';
          const isFree = !sub.price || Number(sub.price) === 0;
          const activeSub = isEnrolled && !isFree ? getSubjectSubscription(studentId, sub.id) : null;

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
                    ) : isExpired ? (
                      <span className="px-1.5 sm:px-2.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-600 text-white flex items-center gap-0.5 sm:gap-1 shadow-2xs">
                        <CalendarClock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span>Expired</span>
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

                  {/* Subscription validity */}
                  {activeSub && (
                    <div
                      className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border ${
                        activeSub.timing.state === 'expiring'
                          ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900/50'
                          : 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40'
                      }`}
                    >
                      {activeSub.timing.state === 'lifetime' ? (
                        <span className="inline-flex items-center gap-1">
                          <InfinityIcon className="w-3 h-3 shrink-0" /> Lifetime access
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 min-w-0">
                            <CalendarClock className="w-3 h-3 shrink-0" />
                            <span className="truncate">Ends {formatDate(activeSub.timing.expiresAt)}</span>
                          </span>
                          <span className="shrink-0">{formatDaysLeft(activeSub.timing.daysLeft)}</span>
                        </>
                      )}
                    </div>
                  )}
                  {isExpired && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <CalendarClock className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        Ended {formatDate(getSubjectSubscription(studentId, sub.id)?.timing.expiresAt)}
                      </span>
                    </div>
                  )}
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
                    {isExpired ? (
                      <RefreshCw className="w-3 h-3 text-cyan-200 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-cyan-200 shrink-0" />
                    )}
                    <span className="truncate">
                      {isExpired ? 'Renew · ' : ''}
                      {planLabel(sub)}
                    </span>
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
      {payModal}

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

// Shows an enrolled student when their subscription for this subject ends,
// with a Renew button once it's close to ending.
const SubscriptionStatusBanner = ({ subscription, isFree, renewalPending, planLabel, onRenew }) => {
  if (isFree || !subscription) return null;
  const { timing } = subscription;

  if (timing.state === 'lifetime') {
    return (
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
        <InfinityIcon className="w-4 h-4 text-teal-600 shrink-0" />
        <span className="font-bold">Lifetime access</span>
        <span className="text-slate-400">— this course never expires for you.</span>
      </div>
    );
  }

  const expiring = timing.state === 'expiring';
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 sm:px-4 py-3 rounded-2xl border shadow-2xs ${
        expiring
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50'
          : 'bg-white dark:bg-surface-darkCard border-slate-200/80 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            expiring
              ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300'
              : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-300'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className={`text-xs sm:text-sm font-extrabold ${expiring ? 'text-orange-900 dark:text-orange-200' : 'text-slate-900 dark:text-white'}`}>
            {expiring ? 'Your subscription ends soon' : 'Subscription active'}
            <span className={`ml-1.5 font-bold ${expiring ? 'text-orange-700 dark:text-orange-300' : 'text-teal-700 dark:text-teal-300'}`}>
              • {formatDaysLeft(timing.daysLeft)}
            </span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Access ends on <strong className="text-slate-700 dark:text-slate-200">{formatDate(timing.expiresAt)}</strong>
          </p>
        </div>
      </div>

      {expiring &&
        (renewalPending ? (
          <span className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Renewal awaiting approval
          </span>
        ) : (
          <button
            type="button"
            onClick={onRenew}
            className="self-stretch sm:self-auto px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Renew ({planLabel})</span>
          </button>
        ))}
    </div>
  );
};
