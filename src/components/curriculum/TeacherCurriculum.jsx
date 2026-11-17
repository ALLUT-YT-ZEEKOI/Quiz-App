import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Plus,
  Video,
  HelpCircle,
  Trash2,
  Edit3,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
  PlayCircle,
  Play,
  Check,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Camera,
  FileText,
  Sliders,
  Home,
  LayoutGrid,
  List,
  Search,
  GraduationCap
} from 'lucide-react';
import { BulkQuestionUploadModal } from './BulkQuestionUploadModal';
import { EditDifficultyModal } from './EditDifficultyModal';
import {
  formatEmbedUrl,
  extractYouTubeVideoId,
  isEmbeddableVideoUrl,
  getYouTubeThumbnail
} from '../../utils/videoUtils';

const PRESET_SUBJECT_COVERS = [
  {
    label: 'Malayalam / Lit',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
  },
  {
    label: 'English / Grammar',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600'
  },
  {
    label: 'Mathematics',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600'
  },
  {
    label: 'Civil & Eng.',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&q=80&w=600'
  },
  {
    label: 'Physics & Science',
    url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600'
  },
  {
    label: 'Computer & Tech',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600'
  }
];

export const TeacherCurriculum = () => {
  const {
    curriculumSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    addModule,
    deleteModule,
    addVideo,
    deleteVideo,
    addCurriculumQuestion,
    addCurriculumQuestionsBulk,
    deleteCurriculumQuestion,
    showToast,
    difficultyLevels,
    getDifficultyMeta,
    getDifficultyLabel,
    matchesDifficulty
  } = useApp();

  // Navigation hierarchy: null = Subjects list; object = selected subject
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeModuleTab, setActiveModuleTab] = useState('videos'); // 'videos' or 'questions'
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState('All');

  // Modals state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [editingDifficultyId, setEditingDifficultyId] = useState(null);
  const [inlineDifficultyText, setInlineDifficultyText] = useState('');

  // Tab & search layout state
  const [subjectTab, setSubjectTab] = useState('all'); // 'all', 'active', 'draft', 'archived'
  const [subjectSearch, setSubjectSearch] = useState('');
  const [layoutView, setLayoutView] = useState('grid'); // 'grid' or 'list'

  // Subject form state (includes thumbnail cover image and price rate)
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    category: 'General',
    price: 499,
    description: '',
    color: '#2563EB',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
  });

  // New Module form state
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    duration: '45 mins'
  });

  // New Video form state
  const [newVideo, setNewVideo] = useState({
    title: '',
    duration: '15:00',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: '',
    notes: ''
  });

  // New Question form state
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    difficulty: 'Medium',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  // Keep selected subject and module in sync with updated context state
  const currentSubject = selectedSubject
    ? curriculumSubjects.find((s) => s.id === selectedSubject.id) || selectedSubject
    : null;

  const currentModule = currentSubject && selectedModule
    ? currentSubject.modules.find((m) => m.id === selectedModule.id) || selectedModule
    : null;

  // Handlers for Subject Image & Form
  const handleOpenAddSubject = () => {
    setEditingSubjectId(null);
    setNewSubject({
      name: '',
      code: '',
      category: 'General',
      price: 499,
      description: '',
      color: '#2563EB',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
    });
    setSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub) => {
    setEditingSubjectId(sub.id);
    setNewSubject({
      name: sub.name || '',
      code: sub.code || '',
      category: sub.category || 'General',
      price: sub.price !== undefined ? sub.price : 499,
      description: sub.description || '',
      color: sub.color || '#2563EB',
      thumbnail: sub.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
    });
    setSubjectModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url) {
        setNewSubject((prev) => ({ ...prev, thumbnail: base64Url }));
        showToast('Subject image uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) {
      showToast('Subject name is required', 'warning');
      return;
    }
    if (editingSubjectId) {
      updateSubject(editingSubjectId, newSubject);
      showToast(`Subject "${newSubject.name}" updated`, 'success');
    } else {
      addSubject(newSubject);
    }
    setSubjectModalOpen(false);
    setEditingSubjectId(null);
    setNewSubject({
      name: '',
      code: '',
      category: 'General',
      description: '',
      color: '#2563EB',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
    });
  };

  const handleCreateModule = (e) => {
    e.preventDefault();
    if (!newModule.title.trim() || !currentSubject) {
      showToast('Module title is required', 'warning');
      return;
    }
    addModule(currentSubject.id, newModule);
    setModuleModalOpen(false);
    setNewModule({ title: '', description: '', duration: '45 mins' });
  };

  const handleCreateVideo = (e) => {
    e.preventDefault();
    if (!newVideo.title.trim() || !currentSubject || !currentModule) {
      showToast('Video title is required', 'warning');
      return;
    }
    const cleanUrl = formatEmbedUrl(newVideo.videoUrl);
    addVideo(currentSubject.id, currentModule.id, {
      ...newVideo,
      videoUrl: cleanUrl || newVideo.videoUrl
    });
    setVideoModalOpen(false);
    setNewVideo({
      title: '',
      duration: '15:00',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: '',
      notes: ''
    });
  };

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.question.trim()) {
      showToast('Question text is required', 'warning');
      return;
    }
    if (newQuestion.options.some((opt) => !opt.trim())) {
      showToast('All 4 options must be filled', 'warning');
      return;
    }
    addCurriculumQuestion(currentSubject.id, currentModule.id, newQuestion);
    setQuestionModalOpen(false);
    setNewQuestion({
      question: '',
      difficulty: 'Medium',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  const handleSaveInlineDifficulty = (lvlId) => {
    if (!inlineDifficultyText.trim()) {
      setEditingDifficultyId(null);
      return;
    }
    const updated = difficultyLevels.map((l) =>
      l.id === lvlId ? { ...l, label: inlineDifficultyText.trim() } : l
    );
    updateDifficultyLevels(updated);
    showToast(`Difficulty mode updated to "${inlineDifficultyText.trim()}"! Students will now see this label.`, 'success');
    setEditingDifficultyId(null);
  };

  // =========================================================================
  // VIEW 3: MODULE DETAIL (Manage Videos & Q&A)
  // =========================================================================
  if (currentSubject && currentModule) {
    const filteredQuestions =
      questionDifficultyFilter === 'All'
        ? currentModule.questions || []
        : (currentModule.questions || []).filter((q) =>
            matchesDifficulty(q.difficulty, questionDifficultyFilter)
          );

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

        {/* Module Header Card */}
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={() => setSelectedModule(null)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
              title="Back to Modules"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 border border-[#20B8C7]/20">
                  {currentSubject.code || currentSubject.name}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Clock className="w-3 h-3" /> {currentModule.duration || '45 mins'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {currentModule.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
                {currentModule.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {activeModuleTab === 'videos' ? (
              <button
                onClick={() => setVideoModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_16px_rgba(20,184,166,0.25)] border border-[#20B8C7]/40 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Video</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBulkModalOpen(true)}
                  className="px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition-all active:scale-95"
                  title="Bulk upload questions from A4 format"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Bulk A4 Upload</span>
                  <span className="sm:hidden">Bulk</span>
                </button>
                <button
                  onClick={() => setQuestionModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_16px_rgba(20,184,166,0.25)] border border-[#20B8C7]/40 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher: Videos vs Questions */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-1">
          <button
            onClick={() => setActiveModuleTab('videos')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
              activeModuleTab === 'videos'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Lesson Videos ({currentModule.videos?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveModuleTab('questions')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
              activeModuleTab === 'questions'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Questions & Answers ({currentModule.questions?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: VIDEOS LIST */}
        {activeModuleTab === 'videos' && (
          <div className="space-y-4">
            {(currentModule.videos || []).length === 0 ? (
              <div className="p-8 sm:p-10 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <Video className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                  No Videos Added Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add video lectures or embed links so students can watch module lessons before attempting the quiz.
                </p>
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs border border-[#20B8C7]/30"
                >
                  <Plus className="w-4 h-4" /> Add First Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {currentModule.videos.map((vid, idx) => {
                  const ytThumb = getYouTubeThumbnail(vid.videoUrl);
                  return (
                    <div
                      key={vid.id || idx}
                      className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs card-hover-lift hover:border-[#20B8C7]/50 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Video Thumbnail Cover with Play Overlay */}
                        <div
                          onClick={() => setPlayingVideo(vid)}
                          className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-2.5 border border-slate-200/80 dark:border-slate-800 cursor-pointer group/thumb shadow-inner"
                        >
                          {ytThumb ? (
                            <img
                              src={ytThumb}
                              alt={vid.title}
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-[#092227] via-[#0A262C] to-[#07191E] p-3 text-center">
                              <Video className="w-8 h-8 text-[#20B8C7]/80 mb-1" />
                              <span className="text-[11px] font-bold text-slate-200 truncate max-w-full">
                                {vid.title}
                              </span>
                            </div>
                          )}

                          {/* Dark Glass Hover Overlay + Centered Play Button */}
                          <div className="absolute inset-0 bg-slate-950/35 group-hover/thumb:bg-slate-950/55 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/95 dark:bg-[#0C4E5B] text-[#0C4E5B] dark:text-cyan-300 flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform border border-white/20">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>

                          {/* Top-Left: Lesson Tag */}
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[10px] font-bold text-white tracking-wide border border-white/10 shadow-xs">
                            Lesson {idx + 1}
                          </span>

                          {/* Bottom-Right: Duration Tag */}
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono font-semibold text-white border border-white/10 flex items-center gap-1 shadow-xs">
                            <Clock className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{vid.duration || '15:00'}</span>
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4
                          onClick={() => setPlayingVideo(vid)}
                          className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug truncate cursor-pointer group-hover:text-[#0C4E5B] dark:group-hover:text-cyan-400 transition-colors"
                          title={vid.title}
                        >
                          {vid.title}
                        </h4>
                        {vid.description && (
                          <p
                            className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-snug"
                            title={vid.description}
                          >
                            {vid.description}
                          </p>
                        )}
                        {vid.notes && (
                          <div
                            className="mt-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 line-clamp-1"
                            title={vid.notes}
                          >
                            <strong>Notes:</strong> {vid.notes}
                          </div>
                        )}
                      </div>

                      {/* Action Row */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => setPlayingVideo(vid)}
                          className="px-2.5 py-1 rounded-lg bg-[#E6F4F6] hover:bg-[#d8eef1] dark:bg-[#0E353E] dark:hover:bg-[#12424d] text-[#0C4E5B] dark:text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-colors active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => deleteVideo(currentSubject.id, currentModule.id, vid.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUESTIONS & ANSWERS LIST */}
        {activeModuleTab === 'questions' && (
          <div className="space-y-4">
            {/* Difficulty Filter Tabs & Customization Button */}
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs font-bold shadow-2xs">
                <button
                  onClick={() => setQuestionDifficultyFilter('All')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    questionDifficultyFilter === 'All'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All
                </button>

                {difficultyLevels.map((lvl) => {
                  const isActive =
                    questionDifficultyFilter === lvl.label || questionDifficultyFilter === lvl.id;
                  const isEditing = editingDifficultyId === lvl.id;

                  if (isEditing) {
                    return (
                      <div
                        key={lvl.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-blue-400 shadow-xs"
                      >
                        <span>{lvl.dot}</span>
                        <input
                          autoFocus
                          type="text"
                          value={inlineDifficultyText}
                          onChange={(e) => setInlineDifficultyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInlineDifficulty(lvl.id);
                            if (e.key === 'Escape') setEditingDifficultyId(null);
                          }}
                          className="w-20 px-1 py-0.5 text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveInlineDifficulty(lvl.id)}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Save label"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDifficultyId(null)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={lvl.id}
                      className={`relative flex items-center rounded-xl transition-all group/chip ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => setQuestionDifficultyFilter(lvl.label)}
                        className="px-3 py-1.5 flex items-center gap-1.5"
                      >
                        <span>{lvl.dot}</span>
                        <span>{lvl.label}</span>
                      </button>

                      {/* Quick Edit Pencil Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDifficultyId(lvl.id);
                          setInlineDifficultyText(lvl.label);
                        }}
                        className="pr-2 pl-0.5 py-1 text-slate-400 hover:text-amber-500 transition-colors opacity-70 hover:opacity-100"
                        title={`Click to edit "${lvl.label}" label`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Edit Mode Labels Preset Trigger */}
                <button
                  type="button"
                  onClick={() => setDifficultyModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Customize all mode labels (Easy, Medium, Tough)"
                >
                  <Sliders className="w-3 h-3 text-amber-500" />
                  <span>Customize</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Showing <strong>{filteredQuestions.length}</strong> questions
                </span>
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="p-8 sm:p-10 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-xl mx-auto bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                  No {questionDifficultyFilter !== 'All' ? `"${questionDifficultyFilter}"` : ''} Questions Found
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Add assessments with {difficultyLevels.map((l) => l.label).join(', ')} modes so students can practice effectively.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setBulkModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Bulk Upload (A4 Format)</span>
                  </button>
                  <button
                    onClick={() => setQuestionModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs border border-[#20B8C7]/30 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredQuestions.map((q, idx) => {
                  const diffMeta = getDifficultyMeta(q.difficulty);
                  const difficultyColor =
                    diffMeta.color === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : diffMeta.color === 'red'
                      ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800/60'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';

                  return (
                    <div
                      key={q.id || idx}
                      className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs card-hover-lift hover:border-[#20B8C7]/50 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Question Card Top Bar */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-[11px] shrink-0 font-mono">
                              Q{idx + 1}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${difficultyColor}`}
                            >
                              {diffMeta.label}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              deleteCurriculumQuestion(currentSubject.id, currentModule.id, q.id)
                            }
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Question Text */}
                        <h4
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug line-clamp-3 mb-2.5"
                          title={q.question}
                        >
                          {q.question}
                        </h4>

                        {/* Options Stack (Compact) */}
                        <div className="space-y-1.5">
                          {q.options?.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.correctAnswer;
                            return (
                              <div
                                key={oIdx}
                                className={`px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-2 border transition-colors ${
                                  isCorrect
                                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 font-bold text-emerald-950 dark:text-emerald-200'
                                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded text-[9px] flex items-center justify-center font-bold shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="flex-1 truncate">{opt}</span>
                                {isCorrect && (
                                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation Callout (Compact) */}
                      {q.explanation && (
                        <div
                          className="mt-2.5 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 text-[10px] text-blue-900 dark:text-blue-200 border border-blue-200/60 dark:border-blue-900/50 line-clamp-2 leading-tight"
                          title={q.explanation}
                        >
                          <strong>Sol:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: VIDEO PLAYER LIGHTBOX                                      */}
        {/* ================================================================= */}
        {playingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col animate-in zoom-in-95">
              {/* Modal Header */}
              <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#0E353E] text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                    Lesson Video
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
                    {playingVideo.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Frame */}
              <div className="relative aspect-video bg-black">
                {isEmbeddableVideoUrl(playingVideo.videoUrl) ? (
                  <iframe
                    src={`${formatEmbedUrl(playingVideo.videoUrl)}?autoplay=1`}
                    title={playingVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
                    <Video className="w-12 h-12 text-[#20B8C7] mb-2" />
                    <p className="text-sm font-semibold">{playingVideo.title}</p>
                    <p className="text-xs text-slate-400 mt-1">Direct link: {playingVideo.videoUrl}</p>
                  </div>
                )}
              </div>

              {/* Video Details Footer */}
              <div className="p-4 bg-slate-950/95 text-slate-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Duration: {playingVideo.duration || '15:00'}</span>
                  </div>
                  {playingVideo.notes && (
                    <p className="text-slate-400 text-[11px]">
                      <strong>Study Notes:</strong> {playingVideo.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: ADD VIDEO                                                  */}
        {/* ================================================================= */}
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Add Lesson Video
                    </h3>
                    <p className="text-xs text-slate-400">
                      Module: {currentModule.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateVideo} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Video Lesson Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lesson 1: Introduction to Grammar Rules"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15:30"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      YouTube / Video URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="Paste any YouTube link (youtu.be or watch?v=...)"
                      value={newVideo.videoUrl}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const formatted = formatEmbedUrl(raw);
                        setNewVideo({ ...newVideo, videoUrl: formatted || raw });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {extractYouTubeVideoId(newVideo.videoUrl) ? (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valid YouTube video detected & ready to play</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Supports youtube.com, youtu.be short links, shorts, and Vimeo
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Preview Inside Modal */}
                {isEmbeddableVideoUrl(newVideo.videoUrl) && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Live Player Preview:
                    </span>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                      <iframe
                        src={formatEmbedUrl(newVideo.videoUrl)}
                        title="Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lesson Summary
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What will students learn in this video?"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Important Notes & Formulae
                  </label>
                  <input
                    type="text"
                    placeholder="Key takeaway notes for students"
                    value={newVideo.notes}
                    onChange={(e) => setNewVideo({ ...newVideo, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVideoModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/20"
                  >
                    Save Video
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: ADD QUESTION WITH EASY / MEDIUM / HARD DIFFICULTY          */}
        {/* ================================================================= */}
        {questionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-xl bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Add Assessment Question
                    </h3>
                    <p className="text-xs text-slate-400">
                      Module: {currentModule.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQuestionModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shortcut to Bulk A4 Upload */}
              <div className="mb-4 p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between text-xs">
                <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                  Have multiple questions in an A4 paper or Word file?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQuestionModalOpen(false);
                    setBulkModalOpen(true);
                  }}
                  className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Bulk Upload (A4) ↗</span>
                </button>
              </div>

              <form onSubmit={handleCreateQuestion} className="space-y-3.5">
                {/* Difficulty Mode Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Question Difficulty Mode *
                    </label>
                    <button
                      type="button"
                      onClick={() => setDifficultyModalOpen(true)}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Edit Mode Labels</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {difficultyLevels.map((lvl) => {
                      const isSelected = matchesDifficulty(newQuestion.difficulty, lvl.id);
                      return (
                        <button
                          type="button"
                          key={lvl.id}
                          onClick={() => setNewQuestion({ ...newQuestion, difficulty: lvl.label })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? lvl.color === 'emerald'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : lvl.color === 'red'
                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{lvl.dot}</span>
                          <span>{lvl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter the question clearly (supports Malayalam, English, or Technical equations)"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Four Multiple Choice Options (Select the correct radio) *
                  </label>
                  <div className="space-y-2">
                    {newQuestion.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newQuestion.correctAnswer === oIdx}
                          onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: oIdx })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Mark this as the correct answer"
                        />
                        <span className="text-xs font-bold text-slate-500 w-5">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <input
                          type="text"
                          required
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newQuestion.options];
                            updated[oIdx] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: updated });
                          }}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border ${
                            newQuestion.correctAnswer === oIdx
                              ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                              : 'border-slate-200 dark:border-slate-800'
                          } focus:outline-none`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Explanation / Solution
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide detailed explanation displayed after the student answers"
                    value={newQuestion.explanation}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, explanation: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuestionModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-500/20"
                  >
                    Save Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ================================================================= */}
        {/* MODAL: BULK UPLOAD QUESTIONS (A4 FORMAT COPY / PASTE)             */}
        {/* ================================================================= */}
        <BulkQuestionUploadModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          subjectName={currentSubject?.name}
          moduleName={currentModule?.title}
          onImport={(questions) => {
            addCurriculumQuestionsBulk(currentSubject.id, currentModule.id, questions);
          }}
        />

        {/* MODAL: CUSTOMIZE DIFFICULTY LABELS */}
        <EditDifficultyModal
          isOpen={difficultyModalOpen}
          onClose={() => setDifficultyModalOpen(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SUBJECT DETAIL (Manage Modules)
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
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={() => setSelectedSubject(null)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
              title="Back to All Subjects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 border border-[#20B8C7]/20">
                  {currentSubject.code || 'CODE'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentSubject.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {currentSubject.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
                {currentSubject.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModuleModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_16px_rgba(20,184,166,0.25)] border border-[#20B8C7]/40 active:scale-95 transition-all self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module / Lesson</span>
          </button>
        </div>

        {/* Modules List */}
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mb-3 flex items-center justify-between">
            <span>Modules in this Subject ({currentSubject.modules?.length || 0})</span>
            <span className="text-xs font-normal text-slate-400">Click a module to manage its videos and questions</span>
          </h3>

          {(currentSubject.modules || []).length === 0 ? (
            <div className="p-8 sm:p-10 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                No Modules Added Yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create your first module (e.g. Module 1: Basics) to start adding video lectures and Q&A assessments.
              </p>
              <button
                onClick={() => setModuleModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs border border-[#20B8C7]/30"
              >
                <Plus className="w-4 h-4" /> Add First Module
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {currentSubject.modules.map((mod, idx) => {
                const totalVideos = mod.videos?.length || 0;
                const totalQuestions = mod.questions?.length || 0;
                const easyCount = (mod.questions || []).filter((q) => q.difficulty === 'Easy').length;
                const medCount = (mod.questions || []).filter((q) => q.difficulty === 'Medium').length;
                const hardCount = (mod.questions || []).filter((q) => q.difficulty === 'Hard').length;

                return (
                  <div
                    key={mod.id || idx}
                    className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs card-hover-lift hover:border-[#20B8C7]/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 border border-[#20B8C7]/20 text-[10px] font-extrabold tracking-wide">
                          Module {idx + 1}
                        </span>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{mod.duration || '45 mins'}</span>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate group-hover:text-[#0C4E5B] dark:group-hover:text-cyan-400 transition-colors" title={mod.title}>
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-snug" title={mod.description}>
                        {mod.description || 'No description provided.'}
                      </p>

                      {/* Content Counts */}
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

                      {/* Difficulty Badges */}
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

                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => deleteModule(currentSubject.id, mod.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedModule(mod);
                          setActiveModuleTab('videos');
                        }}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs flex items-center gap-1 shadow-xs border border-[#20B8C7]/30 active:scale-95 transition-all truncate"
                      >
                        <span>Manage Videos & Q&A</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL: ADD MODULE */}
        {moduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Add New Module
                    </h3>
                    <p className="text-xs text-slate-400">
                      Subject: {currentSubject.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModuleModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateModule} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Module 1: Grammar & Sandhi"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 45 mins"
                    value={newModule.duration}
                    onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Module Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what this module covers"
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModuleModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/20"
                  >
                    Create Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: SUBJECTS DIRECTORY (Root Studio)
  // =========================================================================
  const grandTotalSubjects = curriculumSubjects.length;
  const grandTotalModules = curriculumSubjects.reduce(
    (acc, s) => acc + (s.modules?.length || 0),
    0
  );
  const grandTotalVideos = curriculumSubjects.reduce(
    (acc, s) => acc + (s.modules || []).reduce((mAcc, m) => mAcc + (m.videos?.length || 0), 0),
    0
  );
  const grandTotalQuestions = curriculumSubjects.reduce(
    (acc, s) => acc + (s.modules || []).reduce((mAcc, m) => mAcc + (m.questions?.length || 0), 0),
    0
  );

  // Filter subjects based on tab and search
  const filteredSubjectsList = (curriculumSubjects || []).filter((sub) => {
    if (subjectTab === 'draft') return false;
    if (subjectTab === 'archived') return false;
    if (!subjectSearch.trim()) return true;
    const q = subjectSearch.toLowerCase();
    return (
      (sub.name || '').toLowerCase().includes(q) ||
      (sub.code || '').toLowerCase().includes(q) ||
      (sub.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>/</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">Subjects & Curriculum</span>
      </div>

      {/* Page Header with 3D Illustration & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Subjects & Curriculum Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Create and manage subjects, modules, lessons, videos and assessments for your learning programs.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
          {/* 3D Stack of books & graduation cap illustration */}
          <div className="hidden sm:flex items-center justify-center w-16 h-16 relative shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center shadow-xs border border-teal-500/20">
              <GraduationCap className="w-8 h-8 text-[#0E3B43] dark:text-teal-400" />
            </div>
          </div>

          <button
            onClick={() => setDifficultyModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 shadow-2xs transition-all active:scale-95"
            title="Edit difficulty labels and layout"
          >
            <LayoutGrid className="w-4 h-4 text-slate-500" />
            <span>Edit Mode: Layout</span>
          </button>

          <button
            onClick={handleOpenAddSubject}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_16px_rgba(20,184,166,0.25)] border border-[#20B8C7]/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards in a Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Subjects */}
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs card-hover-lift flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {grandTotalSubjects}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Subjects
            </div>
          </div>
        </div>

        {/* Card 2: Modules */}
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs card-hover-lift flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {grandTotalModules}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Lesson Modules
            </div>
          </div>
        </div>

        {/* Card 3: Videos */}
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs card-hover-lift flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {grandTotalVideos}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Lesson Videos
            </div>
          </div>
        </div>

        {/* Card 4: Quiz Assessments */}
        <div className="bg-white dark:bg-surface-darkCard p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs card-hover-lift flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {grandTotalQuestions}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Quiz Assessments
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSubjectTab('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              subjectTab === 'all'
                ? 'bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white border border-[#20B8C7]/50 shadow-[0_4px_16px_rgba(20,184,166,0.22)]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Subjects ({curriculumSubjects.length})
          </button>
          <button
            onClick={() => setSubjectTab('active')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
              subjectTab === 'active'
                ? 'bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white border border-[#20B8C7]/50 shadow-[0_4px_16px_rgba(20,184,166,0.22)]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Active ({curriculumSubjects.length})
          </button>
          <button
            onClick={() => setSubjectTab('draft')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
              subjectTab === 'draft'
                ? 'bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white border border-[#20B8C7]/50 shadow-[0_4px_16px_rgba(20,184,166,0.22)]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Draft (0)
          </button>
          <button
            onClick={() => setSubjectTab('archived')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
              subjectTab === 'archived'
                ? 'bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white border border-[#20B8C7]/50 shadow-[0_4px_16px_rgba(20,184,166,0.22)]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Archived (0)
          </button>
        </div>

        {/* Right Search & Grid/List View Toggles */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-darkCard rounded-xl p-1">
            <button
              onClick={() => setLayoutView('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                layoutView === 'grid'
                  ? 'bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutView('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                layoutView === 'list'
                  ? 'bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subjects Grid & List (Compact 4 Cards in a Row) */}
      {filteredSubjectsList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No Subjects Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No subjects match your search or filter. Click below to create your first subject.
          </p>
          <button
            onClick={handleOpenAddSubject}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Subject
          </button>
        </div>
      ) : (
        <div className={layoutView === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5" : "space-y-3"}>
          {filteredSubjectsList.map((sub, sIdx) => {
            const totalModules = sub.modules?.length || 0;
            const totalVideos = (sub.modules || []).reduce(
              (acc, m) => acc + (m.videos?.length || 0),
              0
            );
            const totalQuestions = (sub.modules || []).reduce(
              (acc, m) => acc + (m.questions?.length || 0),
              0
            );
            const priceVal = sub.price !== undefined ? Number(sub.price) : 499;

            return (
              <div
                key={sub.id || sIdx}
                className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs card-hover-lift flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Thumbnail (Compact Aspect Ratio) */}
                  <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                    <img
                      src={sub.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07191E] via-[#0A262C]/70 to-transparent" />
                    
                    {/* Top Row: Code Pill & Price Pill */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 shadow-2xs">
                        {sub.code || `C0${sIdx + 1}`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-2xs ${
                          priceVal > 0 ? 'bg-[#00897B]' : 'bg-[#10B981]'
                        }`}
                      >
                        {priceVal > 0 ? `₹${priceVal}` : 'Free'}
                      </span>
                    </div>

                    {/* Bottom Title & Category */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300 block leading-tight">
                        {sub.category || 'GENERAL'}
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base text-white truncate drop-shadow-sm">
                        {sub.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content Info */}
                  <div className="p-3 sm:p-3.5 space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
                      {sub.description || sub.name}
                    </p>

                    {/* 3 Metric Boxes: Module, Video, Quiz */}
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center">
                      <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate">
                        <Layers className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{totalModules} {totalModules === 1 ? 'Mod' : 'Mods'}</span>
                      </div>
                      <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate">
                        <Video className="w-3 h-3 text-teal-500 shrink-0" />
                        <span className="truncate">{totalVideos} {totalVideos === 1 ? 'Vid' : 'Vids'}</span>
                      </div>
                      <div className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{totalQuestions} Quiz</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 sm:p-3.5 pt-0 flex items-center justify-between gap-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSubject(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Subject, Price & Cover"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSubject(sub.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs flex items-center gap-1 shadow-[0_4px_14px_rgba(20,184,166,0.2)] border border-[#20B8C7]/30 active:scale-95 transition-all group/btn"
                  >
                    <span>Modules ({totalModules})</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT SUBJECT WITH COVER IMAGE */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {editingSubjectId ? 'Edit Subject & Cover Image' : 'Add New Subject'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    e.g. Malayalam, English, Mathematics, Civil
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malayalam or English Grammar"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MAL-101"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Language"
                    value={newSubject.category}
                    onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rate / Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="499"
                    value={newSubject.price !== undefined ? newSubject.price : 499}
                    onChange={(e) => setNewSubject({ ...newSubject, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Quick Fee Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Quick Rates:</span>
                {[0, 299, 499, 999, 1499].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setNewSubject({ ...newSubject, price: amt })}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                      Number(newSubject.price) === amt
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {amt === 0 ? 'Free (₹0)' : `₹${amt}`}
                  </button>
                ))}
              </div>

              {/* Subject Cover Image Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Subject Cover Image</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Device upload or URL</span>
                </div>

                {/* Live Preview Box */}
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                  {newSubject.thumbnail ? (
                    <img
                      src={newSubject.thumbnail}
                      alt="Subject Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <Camera className="w-3 h-3 text-blue-400" />
                    <span>Cover Preview</span>
                  </div>
                </div>

                {/* Upload or URL Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-700/80 cursor-pointer transition-all shadow-2xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileUpload}
                    />
                  </label>

                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={newSubject.thumbnail}
                      onChange={(e) => setNewSubject({ ...newSubject, thumbnail: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* 1-Click Quick Presets */}
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1 uppercase tracking-wider">
                    Or Pick a Preset Cover:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESET_SUBJECT_COVERS.map((preset, pIdx) => {
                      const isSelected = newSubject.thumbnail === preset.url;
                      return (
                        <button
                          type="button"
                          key={pIdx}
                          onClick={() => setNewSubject({ ...newSubject, thumbnail: preset.url })}
                          className={`p-1.5 rounded-xl border text-[10px] font-semibold flex items-center gap-1.5 transition-all truncate text-left ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt=""
                            className="w-5 h-5 rounded-md object-cover shrink-0"
                          />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Overview of curriculum and objectives"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {editingSubjectId ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
