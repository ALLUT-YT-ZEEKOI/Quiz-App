import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { QUESTIONS_BANK } from '../../data/questionsData';
import { STUDENTS } from '../../data/initialData';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  HelpCircle,
  Clock,
  Calendar,
  Users,
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sliders,
  Sparkles,
  Info,
  Radio,
  Search,
  BookOpen
} from 'lucide-react';

export const CreateExamWizard = ({ onCancel, onExamCreated }) => {
  const {
    subjects,
    curriculumSubjects,
    createExamination,
    showToast,
    currentUser
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  // Step 1: Basic Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('CE-301');
  const [moduleText, setModuleText] = useState('Module 01: Structural Analysis Principles');
  const [chapterText, setChapterText] = useState('Chapters 1 to 4');
  const [examType, setExamType] = useState('Live'); // 'Live', 'Scheduled', 'Practice'
  const [instructions, setInstructions] = useState(
    '1. Duration is strictly 60 minutes.\n2. Total Questions: 30 MCQ (1 mark each).\n3. Negative marking applies (-0.25 per wrong answer).\n4. Scientific calculators are permitted as per IS 456.\n5. Examination closes automatically at the configured closing time.'
  );

  // Step 2: Questions Selection & Settings
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(() => {
    // Default select first 30 questions from bank
    return QUESTIONS_BANK.slice(0, 30).map((q) => q.id);
  });
  const [questionSearch, setQuestionSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [negativeMarkValue, setNegativeMarkValue] = useState(0.25);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(false);

  // Custom Question Modal State
  const [customQuestionModal, setCustomQuestionModal] = useState(false);
  const [customQText, setCustomQText] = useState('');
  const [customQOptions, setCustomQOptions] = useState(['', '', '', '']);
  const [customQCorrect, setCustomQCorrect] = useState(0);
  const [customQDiff, setCustomQDiff] = useState('Medium');
  const [customQExpl, setCustomQExpl] = useState('');

  // Step 3: Examination Schedule
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [allowLateEntry, setAllowLateEntry] = useState(true);
  const [lateThreshold, setLateThreshold] = useState(15);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [autoSubmitTimeout, setAutoSubmitTimeout] = useState(true);
  const [autoSubmitEndWindow, setAutoSubmitEndWindow] = useState(true);
  const [resultPublication, setResultPublication] = useState('After Exam'); // 'Immediately', 'After Exam', 'Manual'

  // Step 4: Assign Students
  const [assignedStudentIds, setAssignedStudentIds] = useState(() => STUDENTS.map((s) => s.id));
  const [studentSearch, setStudentSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');

  // Subjects options
  const subjectList = useMemo(() => {
    if (subjects && subjects.length > 0) return subjects;
    return [
      { id: 'CE-301', name: 'Structural Analysis', code: 'CE 301' },
      { id: 'CE-204', name: 'Concrete Technology', code: 'CE 204' },
      { id: 'CE-302', name: 'Geotechnical Engineering', code: 'CE 302' },
      { id: 'CE-202', name: 'Surveying', code: 'CE 202' },
      { id: 'CE-103', name: 'Building Materials', code: 'CE 103' }
    ];
  }, [subjects]);

  const currentSubject = subjectList.find((s) => s.id === subjectId) || subjectList[0];

  // Question bank list filtered
  const filteredBank = useMemo(() => {
    return QUESTIONS_BANK.filter((q) => {
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
      if (questionSearch.trim()) {
        const query = questionSearch.toLowerCase();
        return (
          q.questionText.toLowerCase().includes(query) ||
          q.subjectName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [difficultyFilter, questionSearch]);

  const toggleSelectQuestion = (qId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredBank.slice(0, 30).map((q) => q.id);
    setSelectedQuestionIds(ids);
  };

  const deselectAll = () => {
    setSelectedQuestionIds([]);
  };

  // Selected questions objects
  const selectedQuestions = useMemo(() => {
    return QUESTIONS_BANK.filter((q) => selectedQuestionIds.includes(q.id));
  }, [selectedQuestionIds]);

  const difficultyStats = useMemo(() => {
    const easy = selectedQuestions.filter((q) => q.difficulty === 'Easy').length;
    const medium = selectedQuestions.filter((q) => q.difficulty === 'Medium').length;
    const hard = selectedQuestions.filter((q) => q.difficulty === 'Hard').length;
    return { easy, medium, hard };
  }, [selectedQuestions]);

  // Students filtering
  const filteredStudents = useMemo(() => {
    return STUDENTS.filter((s) => {
      if (batchFilter !== 'All' && s.batch !== batchFilter) return false;
      if (semesterFilter !== 'All' && s.semester !== semesterFilter) return false;
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [batchFilter, semesterFilter, studentSearch]);

  const toggleStudent = (sId) => {
    setAssignedStudentIds((prev) =>
      prev.includes(sId) ? prev.filter((id) => id !== sId) : [...prev, sId]
    );
  };

  const selectAllStudents = () => {
    setAssignedStudentIds(STUDENTS.map((s) => s.id));
  };

  const deselectAllStudents = () => {
    setAssignedStudentIds([]);
  };

  // Validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!title.trim()) {
        showToast('Please provide an Examination Title', 'error');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (selectedQuestionIds.length === 0) {
        showToast('Please select at least one question for the examination', 'error');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!examDate || !startTime || !endTime) {
        showToast('Please specify examination date and start/end window', 'error');
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (assignedStudentIds.length === 0) {
        showToast('Please assign at least one student to this examination', 'error');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Final Publish Handler
  const handleFinalSubmit = (status = 'Upcoming') => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    const newExamPayload = {
      code: `EX-${currentSubject.id.replace('CE-', 'CE')}-${Date.now().toString().slice(-3)}`,
      title: title.trim(),
      description: description.trim() || `${currentSubject.name} examination assessment.`,
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      module: moduleText.trim(),
      chapter: chapterText.trim(),
      faculty: currentUser?.name || 'Dr. Rajesh Sharma',
      type: examType,
      instructions,
      date: examDate,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes),
      timeZone,
      totalQuestions: selectedQuestions.length,
      totalMarks: selectedQuestions.length * Number(marksPerQuestion),
      passingMarks: Math.ceil((selectedQuestions.length * Number(marksPerQuestion)) / 2),
      negativeMarking,
      negativeMarkValue: negativeMarking ? Number(negativeMarkValue) : 0,
      randomizeQuestions,
      randomizeOptions,
      allowLateEntry,
      lateEntryThresholdMinutes: Number(lateThreshold),
      maxAttempts: Number(maxAttempts),
      autoSubmitTimeout,
      autoSubmitEndWindow,
      resultPublication,
      status: examType === 'Live' ? 'Live Now' : status,
      assignedStudentIds,
      questions: selectedQuestions.map((q, idx) => ({
        id: q.id || `Q-CUSTOM-${idx}`,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        marks: Number(marksPerQuestion)
      }))
    };

    createExamination(newExamPayload);
    if (onExamCreated) onExamCreated(newExamPayload);
  };

  // Steps definition for header
  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Questions' },
    { num: 3, label: 'Schedule' },
    { num: 4, label: 'Assign Students' },
    { num: 5, label: 'Review & Publish' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Live Examinations</span>
            <span>/</span>
            <span className="text-teal-600 dark:text-teal-400">Create Examination</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            Schedule New Examination
          </h1>
        </div>

        <button
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
          <div
            className="absolute left-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#087F8C] transition-all duration-300 z-0"
            style={{ width: `${((currentStep - 1) / 4) * 85}%` }}
          />

          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all shadow-sm ${
                    isCurrent
                      ? 'bg-[#087F8C] text-white ring-4 ring-[#20B8C7]/30 scale-105'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </button>
                <span
                  className={`text-[11px] font-bold mt-2 whitespace-nowrap hidden sm:block ${
                    isCurrent
                      ? 'text-[#087F8C] dark:text-[#2DD4BF]'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        {/* =========================================================================
            STEP 1: BASIC INFORMATION
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Step 1: Examination Overview & Course Mapping
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define the academic module, delivery mode, and instructions for candidates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Examination Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Structural Engineering – Module 01 Assessment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Subject / Discipline <span className="text-red-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                >
                  {subjectList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code ? `${s.code} – ${s.name}` : s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Exam Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Live', 'Scheduled', 'Practice'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setExamType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        examType === t
                          ? 'bg-[#087F8C] text-white border-[#087F8C] shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {t === 'Live' ? '🔴 Live Proctored' : t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Module Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Module 01: Energy Theorems"
                  value={moduleText}
                  onChange={(e) => setModuleText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Chapter Scope
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapters 1 to 4"
                  value={chapterText}
                  onChange={(e) => setChapterText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Description / Context
                </label>
                <input
                  type="text"
                  placeholder="Short summary of this examination for student notifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Candidate Instructions (Shown on Exam Launch)
                </label>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: QUESTIONS SELECTION & CONFIGURATION
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Step 2: Questions & Scoring Strategy
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select questions from the Civil Engineering Question Bank or compose custom items.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold"
                >
                  Select 30 Technical Questions
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Selected Questions Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#07242B] to-[#0A3944] text-white flex flex-wrap items-center justify-between gap-4 border border-[#145663]/60">
              <div className="flex items-center gap-4 text-xs font-bold">
                <div>
                  <span className="text-slate-400 block text-[10px]">Questions</span>
                  <span className="text-lg font-extrabold text-white">
                    {selectedQuestionIds.length} Selected
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-700" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Marks</span>
                  <span className="text-lg font-extrabold text-[#2DD4BF]">
                    {selectedQuestionIds.length * marksPerQuestion} Marks
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    🟢 {difficultyStats.easy} Easy
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    🟡 {difficultyStats.medium} Medium
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold text-[10px]">
                    🔴 {difficultyStats.hard} Hard
                  </span>
                </div>
              </div>

              {/* Scoring and Randomization Controls */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#092B32] px-3 py-1.5 rounded-xl border border-teal-500/30">
                  <span className="text-slate-300 font-medium">Marks / Q:</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    max="10"
                    value={marksPerQuestion}
                    onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
                    className="w-12 bg-transparent font-bold text-white text-center focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-1.5 bg-[#092B32] px-3 py-1.5 rounded-xl border border-teal-500/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={negativeMarking}
                    onChange={(e) => setNegativeMarking(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-0"
                  />
                  <span className="text-slate-200 font-bold">Negative Marking (-0.25)</span>
                </label>

                <label className="flex items-center gap-1.5 bg-[#092B32] px-3 py-1.5 rounded-xl border border-teal-500/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeQuestions}
                    onChange={(e) => setRandomizeQuestions(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-0"
                  />
                  <span className="text-slate-200 font-bold">Randomize Order</span>
                </label>
              </div>
            </div>

            {/* Search & Difficulty Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter question bank..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      difficultyFilter === diff
                        ? 'bg-[#087F8C] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Bank List */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredBank.slice(0, 40).map((q, idx) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id || idx}
                    onClick={() => toggleSelectQuestion(q.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-500 dark:border-teal-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 rounded text-teal-600 focus:ring-0"
                    />

                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">
                          {q.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : q.difficulty === 'Hard'
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-slate-400">{q.subjectName}</span>
                      </div>

                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {q.questionText}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`px-2 py-1 rounded-lg border ${
                              oIdx === q.correctAnswer
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: EXAMINATION SCHEDULE & STRICT TIME WINDOW
        ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Step 3: Examination Schedule & Proctoring Rules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure candidate testing windows, attempt timeouts, and automated submission triggers.
              </p>
            </div>

            {/* Critical Time Window Clarification Alert (As required in prompt) */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-extrabold block text-sm">
                  Crucial: Availability Window vs. Candidate Duration
                </span>
                <p className="leading-relaxed">
                  If the examination is scheduled from <strong>{startTime || '5:00 PM'}</strong> to <strong>{endTime || '6:00 PM'}</strong>, no student may continue answering past {endTime || '6:00 PM'}, regardless of whether their personal {durationMinutes}-minute countdown has remaining time. The examination will automatically finalize for all attendees at the end window.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Examination Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Window Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Window End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Individual Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Result Publication Mode
                </label>
                <select
                  value={resultPublication}
                  onChange={(e) => setResultPublication(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                >
                  <option value="After Exam">After Exam Window Closes</option>
                  <option value="Immediately">Immediately upon Student Submission</option>
                  <option value="Manual">Manual Faculty Release</option>
                </select>
              </div>
            </div>

            {/* Checkbox Configuration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <label className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={autoSubmitTimeout}
                  onChange={(e) => setAutoSubmitTimeout(e.target.checked)}
                  className="mt-1 rounded text-teal-600 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Auto-submit on Student Timeout
                  </span>
                  <span className="text-slate-500">
                    Automatically finalizes answers if student's timer reaches 00:00:00.
                  </span>
                </div>
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={autoSubmitEndWindow}
                  onChange={(e) => setAutoSubmitEndWindow(e.target.checked)}
                  className="mt-1 rounded text-teal-600 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Auto-submit at Exam Closing Time
                  </span>
                  <span className="text-slate-500">
                    Immediately locks and records all active sessions at the end time.
                  </span>
                </div>
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={allowLateEntry}
                  onChange={(e) => setAllowLateEntry(e.target.checked)}
                  className="mt-1 rounded text-teal-600 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Allow Late Entry (Grace Period)
                  </span>
                  <span className="text-slate-500">
                    Candidates can start up to {lateThreshold} minutes after opening.
                  </span>
                </div>
              </label>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Maximum Attempts
                  </span>
                  <span className="text-slate-500">
                    Strict proctored examinations permit 1 attempt.
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-extrabold text-sm text-slate-900 dark:text-white">
                  {maxAttempts} Attempt
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: ASSIGN STUDENTS
        ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Step 4: Candidate Enrollment & Eligibility
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assign all 21 Civil Engineering students or filter by batch and semester.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllStudents}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold"
                >
                  Assign All (21 Students)
                </button>
                <button
                  type="button"
                  onClick={deselectAllStudents}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="All">All Batches</option>
                <option value="2022-2026">Batch 2022-2026 (S6)</option>
                <option value="2021-2025">Batch 2021-2025 (S8)</option>
                <option value="2023-2027">Batch 2023-2027 (S4)</option>
                <option value="2024-2028">Batch 2024-2028 (S2)</option>
              </select>

              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="All">All Semesters</option>
                <option value="S6">Semester S6</option>
                <option value="S4">Semester S4</option>
                <option value="S8">Semester S8</option>
                <option value="S2">Semester S2</option>
              </select>
            </div>

            {/* Students Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredStudents.map((s) => {
                const isSelected = assignedStudentIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStudent(s.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-500 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-9 h-9 rounded-xl object-cover shrink-0"
                      />
                      <div className="text-xs">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.studentId} • {s.semester} ({s.batch})
                        </div>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-teal-600 focus:ring-0 shrink-0"
                    />
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Selected Students</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">
                {assignedStudentIds.length} of {STUDENTS.length} Assigned
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 5: REVIEW & PUBLISH
        ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Step 5: Review & Finalize Examination
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Carefully review all parameters before scheduling or publishing this examination.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#07242B] to-[#0A3944] text-white border border-[#145663]/80 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-[#2DD4BF] text-[10px] font-extrabold uppercase tracking-wider border border-teal-500/30">
                    {examType} EXAMINATION
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {title || 'Untitled Assessment'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {currentSubject.name} ({currentSubject.id}) • {moduleText}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-mono text-[#2DD4BF] font-bold">
                    {examDate}
                  </div>
                  <div className="text-sm font-extrabold text-white font-mono">
                    {startTime} – {endTime}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {durationMinutes} mins duration • {timeZone}
                  </div>
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#092B32] border border-teal-500/30">
                  <span className="text-slate-400 block text-[10px]">Total Questions</span>
                  <span className="text-base font-extrabold text-white">
                    {selectedQuestions.length} Items
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#092B32] border border-teal-500/30">
                  <span className="text-slate-400 block text-[10px]">Total Marks</span>
                  <span className="text-base font-extrabold text-[#2DD4BF]">
                    {selectedQuestions.length * marksPerQuestion} Marks
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#092B32] border border-teal-500/30">
                  <span className="text-slate-400 block text-[10px]">Negative Marking</span>
                  <span className="text-base font-extrabold text-amber-400">
                    {negativeMarking ? `-${negativeMarkValue}` : 'None'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#092B32] border border-teal-500/30">
                  <span className="text-slate-400 block text-[10px]">Assigned Students</span>
                  <span className="text-base font-extrabold text-white">
                    {assignedStudentIds.length} Enrolled
                  </span>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-slate-400">Question Distribution:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                  🟢 {difficultyStats.easy} Easy
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300">
                  🟡 {difficultyStats.medium} Medium
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300">
                  🔴 {difficultyStats.hard} Hard
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleFinalSubmit('Draft')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleFinalSubmit('Upcoming')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white text-xs font-extrabold shadow-[0_4px_16px_rgba(20,184,166,0.35)] flex items-center gap-2 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Schedule & Publish Examination</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
