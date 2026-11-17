import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { QUESTIONS_BANK } from '../../data/questionsData';
import { STUDENTS } from '../../data/initialData';
import { parseA4Questions } from '../curriculum/BulkQuestionUploadModal';
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
  BookOpen,
  Upload,
  Copy,
  Download,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';

const BULK_SAMPLE_TEMPLATE = `1. What is the kinematic indeterminacy of a plane pin-jointed truss with j joints and r external reactions?
A) 2j - r
B) 3j - r
C) j - 2r
D) 2j + r
Answer: A
Difficulty: Medium
Explanation: In a 2D pin-jointed truss, each joint has 2 translational degrees of freedom. Hence Dk = 2j - r.

2. Which Indian Standard code of practice is used for design of general construction in steel?
A) IS 800:2007
B) IS 456:2000
C) IS 1893:2016
D) IS 10262:2019
Answer: A
Difficulty: Easy
Explanation: IS 800:2007 is the Indian Standard for General Construction in Steel.

3. In limit state design of reinforced concrete beams, what is the maximum strain in concrete at extreme compression fiber?
A) 0.002
B) 0.0035
C) 0.004
D) 0.005
Answer: B
Difficulty: Easy
Explanation: As per IS 456 Clause 38.1, maximum compressive strain in flexure is 0.0035.
`;

export const CreateExamWizard = ({ onCancel, onExamCreated }) => {
  const {
    subjects,
    curriculumSubjects,
    createExamination,
    showToast,
    currentUser
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  // =========================================================================
  // STEP 1: BASIC INFORMATION
  // =========================================================================
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('CE-301');
  const [moduleText, setModuleText] = useState('Module 01: Structural Analysis Principles');
  const [chapterText, setChapterText] = useState('Chapters 1 to 4');
  const [examType, setExamType] = useState('Live'); // 'Live', 'Scheduled', 'Practice'
  const [instructions, setInstructions] = useState(
    '1. Duration is strictly 60 minutes.\n2. Total Questions: 30 MCQ (1 mark each).\n3. Negative marking applies (-0.25 per wrong answer).\n4. Scientific calculators are permitted as per IS 456.\n5. Examination closes automatically at the configured closing time.'
  );

  // =========================================================================
  // STEP 2: QUESTIONS & CUSTOM / BULK MANAGEMENT
  // =========================================================================
  // Custom single questions and bulk uploaded questions
  const [customQuestions, setCustomQuestions] = useState([]);

  // Selected question IDs: Starts EMPTY by default so teacher chooses!
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Question Selector View: 'bank' (all available) vs 'selected' (only chosen)
  const [questionViewMode, setQuestionViewMode] = useState('bank'); // 'bank' | 'selected'

  const [questionSearch, setQuestionSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [negativeMarkValue, setNegativeMarkValue] = useState(0.25);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(false);

  // Edit Negative Marking Modal State
  const [editNegativeModalOpen, setEditNegativeModalOpen] = useState(false);
  const [tempNegativeEnabled, setTempNegativeEnabled] = useState(true);
  const [tempNegativeValue, setTempNegativeValue] = useState(0.25);

  const handleSaveNegativeMarking = () => {
    setNegativeMarking(tempNegativeEnabled);
    setNegativeMarkValue(Number(tempNegativeValue));
    setEditNegativeModalOpen(false);
    showToast(
      tempNegativeEnabled
        ? `Negative marking updated to -${tempNegativeValue} per wrong answer.`
        : 'Negative marking disabled (0 penalty).',
      'success'
    );
  };

  // Single Question Modal State
  const [singleQuestionModalOpen, setSingleQuestionModalOpen] = useState(false);
  const [singleQText, setSingleQText] = useState('');
  const [singleQOptions, setSingleQOptions] = useState(['', '', '', '']);
  const [singleQCorrect, setSingleQCorrect] = useState(0);
  const [singleQDiff, setSingleQDiff] = useState('Medium');
  const [singleQMarks, setSingleQMarks] = useState(1);
  const [singleQExpl, setSingleQExpl] = useState('');

  // Bulk Question Upload Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkActiveTab, setBulkActiveTab] = useState('paste'); // 'paste' | 'preview'
  const fileInputRef = useRef(null);

  // =========================================================================
  // STEP 3: EXAMINATION SCHEDULE & TIME WINDOW
  // =========================================================================
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
  const [resultPublication, setResultPublication] = useState('After Exam');

  // =========================================================================
  // STEP 4: ASSIGN STUDENTS
  // =========================================================================
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

  // Combine custom created questions with standard question bank
  const allAvailableQuestions = useMemo(() => {
    return [...customQuestions, ...QUESTIONS_BANK];
  }, [customQuestions]);

  // Selected questions objects
  const selectedQuestions = useMemo(() => {
    return allAvailableQuestions.filter((q) => selectedQuestionIds.includes(q.id));
  }, [allAvailableQuestions, selectedQuestionIds]);

  // Filtered pool of questions in bank
  const filteredBank = useMemo(() => {
    return allAvailableQuestions.filter((q) => {
      // If viewing selected only
      if (questionViewMode === 'selected' && !selectedQuestionIds.includes(q.id)) {
        return false;
      }

      // Difficulty filter
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) {
        return false;
      }

      // Subject filter
      if (subjectFilter !== 'All' && q.subjectName !== subjectFilter && q.subjectId !== subjectFilter) {
        return false;
      }

      // Search query
      if (questionSearch.trim()) {
        const query = questionSearch.toLowerCase();
        return (
          q.questionText.toLowerCase().includes(query) ||
          (q.subjectName || '').toLowerCase().includes(query) ||
          (q.id || '').toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [allAvailableQuestions, questionViewMode, selectedQuestionIds, difficultyFilter, subjectFilter, questionSearch]);

  // Available unique subjects in question bank for filtering
  const availableSubjectNames = useMemo(() => {
    const set = new Set();
    allAvailableQuestions.forEach((q) => {
      if (q.subjectName) set.add(q.subjectName);
    });
    return ['All', ...Array.from(set)];
  }, [allAvailableQuestions]);

  const difficultyStats = useMemo(() => {
    const easy = selectedQuestions.filter((q) => q.difficulty === 'Easy').length;
    const medium = selectedQuestions.filter((q) => q.difficulty === 'Medium').length;
    const hard = selectedQuestions.filter((q) => q.difficulty === 'Hard').length;
    return { easy, medium, hard };
  }, [selectedQuestions]);

  // Toggle selection for a question
  const toggleSelectQuestion = (qId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Quick select 30 questions
  const selectQuick30 = () => {
    const ids = allAvailableQuestions.slice(0, 30).map((q) => q.id);
    setSelectedQuestionIds(ids);
    showToast('Selected 30 technical questions from the bank', 'success');
  };

  // Select all currently filtered
  const selectAllFiltered = () => {
    const ids = filteredBank.map((q) => q.id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...ids])));
    showToast(`Added ${ids.length} questions to selection`, 'info');
  };

  // Clear all selections
  const deselectAll = () => {
    setSelectedQuestionIds([]);
    showToast('Cleared all selected questions', 'info');
  };

  // -------------------------------------------------------------------------
  // Single Question Handler
  // -------------------------------------------------------------------------
  const handleSaveSingleQuestion = () => {
    if (!singleQText.trim()) {
      showToast('Please enter the question text', 'error');
      return;
    }
    const validOptions = singleQOptions.map((o) => o.trim());
    if (validOptions.filter(Boolean).length < 2) {
      showToast('Please provide at least 2 options for this question', 'error');
      return;
    }

    const newQ = {
      id: `Q-CUST-${Date.now().toString().slice(-5)}`,
      questionText: singleQText.trim(),
      options: validOptions,
      correctAnswer: Number(singleQCorrect),
      difficulty: singleQDiff,
      marks: Number(singleQMarks || marksPerQuestion),
      explanation: singleQExpl.trim() || 'Custom question authored for this examination.',
      subjectName: currentSubject?.name || 'Structural Analysis',
      isCustom: true
    };

    setCustomQuestions((prev) => [newQ, ...prev]);
    setSelectedQuestionIds((prev) => [newQ.id, ...prev]);
    setQuestionViewMode('selected');

    // Reset single question form
    setSingleQText('');
    setSingleQOptions(['', '', '', '']);
    setSingleQCorrect(0);
    setSingleQDiff('Medium');
    setSingleQExpl('');
    setSingleQuestionModalOpen(false);

    showToast('Question added and selected for this examination!', 'success');
  };

  // -------------------------------------------------------------------------
  // Bulk Upload Handler
  // -------------------------------------------------------------------------
  const parsedBulkQuestions = useMemo(() => {
    return parseA4Questions(bulkInputText);
  }, [bulkInputText]);

  const validParsedBulk = useMemo(() => {
    return parsedBulkQuestions.filter((q) => q.question && q.options.filter(Boolean).length >= 2);
  }, [parsedBulkQuestions]);

  const handleImportBulkQuestions = () => {
    if (validParsedBulk.length === 0) {
      showToast('No valid questions parsed. Please check the format template.', 'error');
      return;
    }

    const imported = validParsedBulk.map((q, idx) => ({
      id: `Q-BULK-${Date.now().toString().slice(-4)}-${idx + 1}`,
      questionText: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || 'Medium',
      explanation: q.explanation || 'Bulk imported question.',
      subjectName: currentSubject?.name || 'Structural Analysis',
      marks: Number(marksPerQuestion || 1),
      isCustom: true
    }));

    setCustomQuestions((prev) => [...imported, ...prev]);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...imported.map((q) => q.id)])));
    setQuestionViewMode('selected');

    setBulkInputText('');
    setBulkModalOpen(false);
    showToast(`Successfully imported and selected ${imported.length} questions!`, 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setBulkInputText(content);
        showToast(`Loaded file: ${file.name}`, 'info');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyTemplate = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(BULK_SAMPLE_TEMPLATE);
      showToast('Copied question template format to clipboard!', 'success');
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([BULK_SAMPLE_TEMPLATE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CohesionTech_Exam_Questions_Template.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded sample template file', 'success');
  };

  // -------------------------------------------------------------------------
  // Students Filtering
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Validation & Navigation
  // -------------------------------------------------------------------------
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
        showToast('Please select or add at least one question for the examination', 'error');
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative">
          {/* Centered Connecting Line Track (passes through the exact geometric center of all step circles) */}
          <div
            className="absolute top-[18px] sm:top-5 left-[18px] sm:left-5 right-[18px] sm:right-5 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700/80 z-0"
            aria-hidden="true"
          >
            {/* Active Progress Fill Line */}
            <div
              className="h-full bg-teal-600 dark:bg-teal-500 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps Row */}
          <div className="relative z-10 flex items-start justify-between">
            {steps.map((s) => {
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (s.num < currentStep) setCurrentStep(s.num);
                    }}
                    disabled={s.num >= currentStep}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 ${
                      isCurrent
                        ? 'bg-[#087F8C] text-white ring-4 ring-[#14B8A6]/30 shadow-md shadow-teal-900/20 scale-105'
                        : isCompleted
                        ? 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    }`}
                    title={isCompleted ? `Go back to Step ${s.num}: ${s.label}` : s.label}
                  >
                    {isCompleted ? <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3]" /> : s.num}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (s.num < currentStep) setCurrentStep(s.num);
                    }}
                    disabled={s.num >= currentStep}
                    className={`text-[11px] sm:text-xs font-semibold mt-2.5 whitespace-nowrap hidden sm:block transition-colors ${
                      isCurrent
                        ? 'text-[#087F8C] dark:text-[#2DD4BF] font-extrabold'
                        : isCompleted
                        ? 'text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer'
                        : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {s.label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Step Indicator Pill */}
        <div className="sm:hidden mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Step {currentStep} of {steps.length}</span>
          <span className="font-bold text-[#087F8C] dark:text-[#2DD4BF]">{steps[currentStep - 1]?.label}</span>
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
            STEP 2: QUESTIONS & SCORING STRATEGY (WITH SINGLE + BULK + SELECTOR)
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header with Title and Single / Bulk Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Step 2: Questions & Question Selection
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select questions from the Question Bank, author single questions, or bulk upload your test items.
                </p>
              </div>

              {/* Action Buttons: Add Single Question & Bulk Upload */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSingleQuestionModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Single Question</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#092B32] hover:bg-[#0E3B44] text-[#2DD4BF] border border-[#20B8C7]/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Bulk Upload Questions</span>
                </button>
              </div>
            </div>

            {/* Selected Questions Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#07242B] to-[#0A3944] text-white flex flex-wrap items-center justify-between gap-4 border border-[#145663]/60 shadow-md">
              <div className="flex items-center gap-4 text-xs font-bold flex-wrap">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Selected for Exam
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {selectedQuestionIds.length} Questions
                  </span>
                </div>
                <div className="h-7 w-px bg-slate-700 hidden sm:block" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Total Marks
                  </span>
                  <span className="text-xl font-extrabold text-[#2DD4BF]">
                    {selectedQuestionIds.length * marksPerQuestion} Marks
                  </span>
                </div>
                <div className="h-7 w-px bg-slate-700 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                    🟢 {difficultyStats.easy} Easy
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                    🟡 {difficultyStats.medium} Medium
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 font-bold text-[10px] border border-red-500/30">
                    🔴 {difficultyStats.hard} Hard
                  </span>
                </div>
              </div>

              {/* Scoring and Randomization Controls */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#092B32] px-3 py-1.5 rounded-xl border border-teal-500/30">
                  <span className="text-slate-300 font-medium">Marks/Q:</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    max="10"
                    value={marksPerQuestion}
                    onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
                    className="w-10 bg-transparent font-bold text-white text-center focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#092B32] px-3 py-1.5 rounded-xl border border-teal-500/30">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.checked)}
                      className="rounded text-teal-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-bold">Negative:</span>
                  </label>
                  {negativeMarking ? (
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 font-bold font-mono">-</span>
                      <input
                        type="number"
                        min="0.05"
                        max="5"
                        step="0.05"
                        value={negativeMarkValue}
                        onChange={(e) => setNegativeMarkValue(Number(e.target.value))}
                        className="w-12 bg-[#061F24] px-1 py-0.5 rounded text-amber-300 font-bold font-mono text-center focus:outline-none border border-amber-500/40 text-xs"
                        title="Enter custom deduction e.g. 0.25, 0.33, 0.5"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setTempNegativeEnabled(negativeMarking);
                          setTempNegativeValue(negativeMarkValue);
                          setEditNegativeModalOpen(true);
                        }}
                        className="text-[10px] text-teal-400 hover:text-teal-200 underline font-bold ml-0.5"
                        title="Configure presets"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-semibold text-[11px]">Off</span>
                  )}
                </div>

                <label className="flex items-center gap-1.5 bg-[#092B32] px-3 py-1.5 rounded-xl border border-teal-500/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeQuestions}
                    onChange={(e) => setRandomizeQuestions(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-0"
                  />
                  <span className="text-slate-200 font-bold">Randomize</span>
                </label>
              </div>
            </div>

            {/* Question Selector Tabs: [ Question Bank ] vs [ Selected for Exam (X) ] */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setQuestionViewMode('bank')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    questionViewMode === 'bank'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Question Bank ({allAvailableQuestions.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuestionViewMode('selected')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    questionViewMode === 'selected'
                      ? 'bg-[#087F8C] text-white shadow-2xs'
                      : 'text-teal-700 dark:text-teal-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected for Exam ({selectedQuestionIds.length})</span>
                </button>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectQuick30}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold hover:bg-teal-100 transition-colors"
                  title="Quick-fill first 30 technical questions"
                >
                  Select 30 Technical Qs
                </button>

                {questionViewMode === 'bank' && (
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 transition-colors"
                  >
                    Select Filtered ({filteredBank.length})
                  </button>
                )}

                {selectedQuestionIds.length > 0 && (
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-[11px] font-bold hover:bg-red-100 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Filter Bar: Search, Subject Dropdown, Difficulty Pills */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions by keyword or topic..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              {/* Subject Filter Dropdown */}
              <div className="shrink-0">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] cursor-pointer"
                >
                  {availableSubjectNames.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj === 'All' ? 'All Subjects' : subj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter Pills */}
              <div className="flex items-center gap-1 shrink-0">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      difficultyFilter === diff
                        ? 'bg-[#087F8C] text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            {filteredBank.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-slate-700/80">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-[#087F8C] dark:text-[#2DD4BF] flex items-center justify-center mx-auto border border-teal-200 dark:border-teal-800/60 shadow-2xs">
                  <HelpCircle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {questionViewMode === 'selected'
                      ? 'No questions selected for this examination yet.'
                      : 'No questions match your current search and filters.'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {questionViewMode === 'selected'
                      ? 'Add single questions, bulk upload your question bank, or pick questions from the repository.'
                      : 'Try adjusting your search keywords, difficulty, or discipline filters.'}
                  </p>
                </div>

                {questionViewMode === 'selected' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSingleQuestionModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Question</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-[#092B32] hover:bg-[#0E3B44] text-[#2DD4BF] border border-[#20B8C7]/50 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Bulk Upload Questions</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Or select from the{' '}
                      <button
                        type="button"
                        onClick={() => setQuestionViewMode('bank')}
                        className="text-[#087F8C] dark:text-[#2DD4BF] font-bold hover:underline"
                      >
                        Question Bank
                      </button>{' '}
                      ({allAvailableQuestions.length} repository items available).
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredBank.map((q, idx) => {
                  const isSelected = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => toggleSelectQuestion(q.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-500 dark:border-teal-600 shadow-2xs ring-1 ring-teal-500/30'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 rounded text-teal-600 focus:ring-0 shrink-0 cursor-pointer"
                      />

                      <div className="flex-1 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
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
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">
                              {q.subjectName}
                            </span>
                            {q.isCustom && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[9px] font-extrabold uppercase">
                                Author / Uploaded
                              </span>
                            )}
                          </div>

                          {questionViewMode === 'selected' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectQuestion(q.id);
                              }}
                              className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {q.questionText}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                oIdx === q.correctAnswer
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-bold'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <span className="font-bold mr-1">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <div className="text-[10px] text-slate-400 pt-0.5 italic">
                            Ref: {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

                <div
                  onClick={() => {
                    setTempNegativeEnabled(negativeMarking);
                    setTempNegativeValue(negativeMarkValue);
                    setEditNegativeModalOpen(true);
                  }}
                  className="p-3 rounded-xl bg-[#092B32] border border-teal-500/30 hover:border-amber-400/80 transition-all cursor-pointer group relative shadow-2xs"
                  title="Click to edit Negative Marking"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">Negative Marking</span>
                    <span className="text-[10px] text-teal-400 group-hover:text-amber-400 font-bold flex items-center gap-0.5">
                      <span>✎ Edit</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      {negativeMarking ? `-${negativeMarkValue}` : 'None'}
                    </span>
                    {negativeMarking && (
                      <span className="text-[10px] text-slate-400">
                        ({negativeMarkValue === 0.25 ? '1/4 mark' : negativeMarkValue === 0.33 ? '1/3 mark' : `${negativeMarkValue} ded.`})
                      </span>
                    )}
                  </div>
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

      {/* =========================================================================
          MODAL 1: ADD SINGLE QUESTION
      ========================================================================= */}
      {singleQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span>Author Single Examination Question</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Compose a new question item. It will be immediately selected for this exam.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSingleQuestionModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Question Statement */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Question Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the complete question statement or engineering problem..."
                  value={singleQText}
                  onChange={(e) => setSingleQText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              {/* 4 Options with Correct Answer Radio */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>Multiple Choice Options (Select Correct Answer)</span>
                  <span className="text-[10px] text-teal-600 font-semibold">
                    Click radio button to mark correct key
                  </span>
                </label>

                {singleQOptions.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isCorrect = singleQCorrect === optIdx;

                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                        isCorrect
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSingleQCorrect(optIdx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isCorrect
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                        title={`Mark ${letter} as correct answer`}
                      >
                        {isCorrect ? '✓' : letter}
                      </button>

                      <input
                        type="text"
                        placeholder={`Option ${letter} statement...`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...singleQOptions];
                          updated[optIdx] = e.target.value;
                          setSingleQOptions(updated);
                        }}
                        className="flex-1 bg-transparent text-slate-900 dark:text-white focus:outline-none font-medium"
                      />

                      {isCorrect && (
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase shrink-0">
                          Correct Key
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Difficulty & Marks Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-200">
                    Difficulty Level
                  </label>
                  <select
                    value={singleQDiff}
                    onChange={(e) => setSingleQDiff(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-200">
                    Marks Assigned
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={singleQMarks}
                    onChange={(e) => setSingleQMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Explanation / Solution */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Explanation / IS Code Reference (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide formula derivation, clause reference, or technical reasoning..."
                  value={singleQExpl}
                  onChange={(e) => setSingleQExpl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSingleQuestionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSingleQuestion}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all"
              >
                Add & Select Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: BULK QUESTION UPLOAD (A4 / CSV / PASTE FORMAT)
      ========================================================================= */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span>Bulk Upload Questions for Examination</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Paste questions in standard text format or upload a .txt / .csv file.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Actions Banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>Standard Format:</strong> 1. Question / A) ... / B) ... / Answer: X / Difficulty: Easy
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:bg-slate-100"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Template</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1 hover:bg-teal-100"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            {/* Paste Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-200">
                  Paste Formatted Questions Below:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono font-extrabold text-[11px] ${
                    validParsedBulk.length > 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {validParsedBulk.length} Questions Detected
                </span>
              </div>

              <textarea
                rows={9}
                placeholder={`Paste your question paper text here...\n\nExample:\n1. Question text here\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\nAnswer: B\nDifficulty: Medium\nExplanation: Solution reference...`}
                value={bulkInputText}
                onChange={(e) => setBulkInputText(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
            </div>

            {/* File Upload Selector */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt,.csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from File (.txt / .csv)</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  Supported: plain text, CSV, or formatted notes
                </span>
              </div>
            </div>

            {/* Parsed Preview Section */}
            {validParsedBulk.length > 0 && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Parsed Preview: {validParsedBulk.length} Questions Ready</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    Will be added to exam selection automatically
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {validParsedBulk.slice(0, 5).map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 text-[11px] border border-emerald-200 dark:border-emerald-800 flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate flex-1 pr-2">
                        {idx + 1}. {q.question}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold shrink-0">
                        Ans: {String.fromCharCode(65 + q.correctAnswer)}
                      </span>
                    </div>
                  ))}
                  {validParsedBulk.length > 5 && (
                    <div className="text-[10px] text-slate-400 text-center">
                      + {validParsedBulk.length - 5} more questions...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={validParsedBulk.length === 0}
                onClick={handleImportBulkQuestions}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Import {validParsedBulk.length} Questions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EDIT NEGATIVE MARKING MODAL
      ========================================================================= */}
      {editNegativeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>Configure Negative Marking</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Set penalty deducted for each incorrect response.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditNegativeModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Enable / Disable Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">
                    Enable Negative Marking
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Deduct marks for wrong answers
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setTempNegativeEnabled(!tempNegativeEnabled)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                    tempNegativeEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      tempNegativeEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {tempNegativeEnabled && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {/* Preset Buttons */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-200">
                      Standard Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: '-0.25 (1/4th)', val: 0.25, desc: 'SSC / General' },
                        { label: '-0.33 (1/3rd)', val: 0.33, desc: 'GATE / UPSC' },
                        { label: '-0.50 (1/2)', val: 0.5, desc: 'Strict Half' },
                        { label: '-1.00 (Full)', val: 1.0, desc: 'Full Penalty' }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setTempNegativeValue(preset.val)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            tempNegativeValue === preset.val
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/30'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-extrabold font-mono text-xs">{preset.label}</div>
                          <div className="text-[10px] text-slate-400">{preset.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Input */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-200">
                      Or Enter Custom Deduction Amount:
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold font-mono text-base text-amber-500">-</span>
                      <input
                        type="number"
                        min="0.05"
                        max="5"
                        step="0.01"
                        value={tempNegativeValue}
                        onChange={(e) => setTempNegativeValue(Number(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="e.g. 0.25, 0.33, 0.5"
                      />
                      <span className="text-slate-400 font-medium">marks / wrong answer</span>
                    </div>
                  </div>

                  {/* Live Simulation preview */}
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="font-bold block">Scoring Rule:</span>
                    <p>
                      A correct 1.0-mark answer gives <strong>+1.0</strong>. An incorrect answer will deduct <strong>-{tempNegativeValue}</strong> marks.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditNegativeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNegativeMarking}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all"
              >
                Save Negative Marking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
