import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  AlertCircle
} from 'lucide-react';

export const StudentCurriculum = () => {
  const {
    curriculumSubjects,
    curriculumAttempts,
    recordCurriculumAttempt,
    currentUser,
    showToast
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

  const currentSubject = selectedSubject
    ? curriculumSubjects.find((s) => s.id === selectedSubject.id) || selectedSubject
    : null;

  const currentModule = currentSubject && selectedModule
    ? currentSubject.modules.find((m) => m.id === selectedModule.id) || selectedModule
    : null;

  // Filter questions for quiz based on selected difficulty mode
  const quizQuestions = (currentModule?.questions || []).filter((q) => {
    if (quizDifficulty === 'All') return true;
    return q.difficulty?.toLowerCase() === quizDifficulty.toLowerCase();
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
      difficultyMode: quizDifficulty === 'All' ? 'All Questions' : `${quizDifficulty} Mode`,
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

        {/* Top Module Banner */}
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedModule(null)}
              className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
              title="Back to Modules"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {currentSubject.name}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {currentModule.duration}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {currentModule.title}
              </h2>
            </div>
          </div>

          {/* Segmented Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setModuleMode('videos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                moduleMode === 'videos'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
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
                      {activeVideo?.videoUrl?.includes('youtube.com') ||
                      activeVideo?.videoUrl?.includes('youtu.be') ? (
                        <iframe
                          src={activeVideo.videoUrl}
                          title={activeVideo.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleStartQuiz(diff)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      quizDifficulty === diff
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {diff === 'Easy' && '🟢 '}
                    {diff === 'Medium' && '🟡 '}
                    {diff === 'Hard' && '🔴 '}
                    {diff}
                  </button>
                ))}
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
                            Question {idx + 1} ({q.difficulty} Mode)
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
                      {quizQuestions[currentQuestionIndex].difficulty} Mode
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
  // VIEW 2: SUBJECT DETAIL (Modules Directory for Students)
  // =========================================================================
  if (currentSubject) {
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

        {/* Subject Header Banner */}
        <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <button
            onClick={() => setSelectedSubject(null)}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
            title="Back to All Subjects"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {currentSubject.code || 'CODE'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentSubject.category}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {currentSubject.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {currentSubject.description}
            </p>
          </div>
        </div>

        {/* Modules List */}
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-3 flex items-center justify-between">
            <span>Lessons & Modules ({currentSubject.modules?.length || 0})</span>
            <span className="text-xs font-normal text-slate-400">
              Select a module to watch video lectures or attend quiz
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        Module {idx + 1}
                      </span>
                      {pastAttempt ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Score: {pastAttempt.scorePct}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" /> {mod.duration}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {mod.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200">
                        <Video className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold">{totalVideos} Videos</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                        <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">{totalQuestions} Questions</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedModule(mod);
                        setModuleMode('videos');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Watch Videos</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedModule(mod);
                        handleStartQuiz('All');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Attend Quiz</span>
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
  // VIEW 1: SUBJECTS DIRECTORY FOR STUDENTS
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
            Student Learning Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            My Subjects & Modules
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Choose a subject (Malayalam, English, Civil Engineering, Mathematics), watch high-definition video lessons, and attend quizzes by Easy, Medium, and Hard difficulty modes.
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubject(sub)}
              className="bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={sub.thumbnail}
                    alt={sub.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-xs">
                      {sub.code || 'CODE'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-extrabold text-base text-white truncate drop-shadow-sm">
                      {sub.name}
                    </h3>
                    <span className="text-[11px] text-blue-200 font-medium">
                      {sub.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {sub.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                      <span className="block text-xs font-black text-slate-900 dark:text-white">
                        {totalModules}
                      </span>
                      <span className="text-[10px] text-slate-400">Modules</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                      <span className="block text-xs font-black text-blue-600">
                        {totalVideos}
                      </span>
                      <span className="text-[10px] text-slate-400">Videos</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                      <span className="block text-xs font-black text-emerald-600">
                        {totalQuestions}
                      </span>
                      <span className="text-[10px] text-slate-400">Questions</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 group-hover:bg-blue-600 dark:bg-slate-800 dark:group-hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <span>Open Subject & Lessons</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
