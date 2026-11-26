import React, { useState } from 'react';
import { compressImageFile } from '../../utils/imageCompress';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../common/PageHeader';
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
  GraduationCap,
  FolderPlus,
  ListVideo,
  NotebookText,
  CalendarDays
} from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { BulkQuestionUploadModal } from './BulkQuestionUploadModal';
import { EditDifficultyModal } from './EditDifficultyModal';
import {
  formatEmbedUrl,
  extractYouTubeVideoId,
  isEmbeddableVideoUrl,
  getYouTubeThumbnail
} from '../../utils/videoUtils';
import { groupVideosBySection } from '../../utils/curriculumSections';
import { NotesList, NotePreviewModal, AddNoteModal } from './ModuleNotes';
import {
  VALIDITY_PRESETS,
  DEFAULT_VALIDITY_DAYS,
  formatValidity,
  isLifetime,
  addDays,
  toYmd,
  endOfDate,
  formatDate,
  formatAccess
} from '../../utils/subscriptionUtils';

export const TeacherCurriculum = () => {
  const {
    curriculumSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    addModule,
    deleteModule,
    addSection,
    updateSection,
    deleteSection,
    addNote,
    deleteNote,
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
  const [activeModuleTab, setActiveModuleTab] = useState('videos'); // 'videos', 'notes' or 'questions'
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
    validityDays: DEFAULT_VALIDITY_DAYS,
    accessUntil: null,
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

  // New Video form state (sectionId = which Section of the module the video belongs to)
  const [newVideo, setNewVideo] = useState({
    title: '',
    duration: '15:00',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: '',
    notes: '',
    sectionId: ''
  });

  // Section form state (add + rename share one modal)
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionForm, setSectionForm] = useState({ title: '', description: '' });
  const [confirmDeleteSectionId, setConfirmDeleteSectionId] = useState(null);

  // Notes tab state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

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
  // Calendar access end date that is already over (before today)
  const accessDateInPast = Boolean(
    newSubject.accessUntil && endOfDate(newSubject.accessUntil) && endOfDate(newSubject.accessUntil) < new Date()
  );

  const handleOpenAddSubject = () => {
    setEditingSubjectId(null);
    setNewSubject({
      name: '',
      code: '',
      category: 'General',
      price: 499,
      validityDays: DEFAULT_VALIDITY_DAYS,
      accessUntil: null,
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
      // Older subjects have no validity set: they were lifetime access
      validityDays: sub.validityDays !== undefined ? Number(sub.validityDays) : 0,
      accessUntil: sub.accessUntil || null,
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

    compressImageFile(file, { maxDim: 1200, quality: 0.8 })
      .then((dataUrl) => {
        setNewSubject((prev) => ({ ...prev, thumbnail: dataUrl }));
        showToast('Subject image uploaded successfully!', 'success');
      })
      .catch(() => showToast('Could not read this image. Please try another one.', 'warning'));
  };

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) {
      showToast('Subject name is required', 'warning');
      return;
    }
    const isPaid = Number(newSubject.price) > 0;
    if (isPaid && accessDateInPast) {
      showToast('The access end date has already passed. Pick today or a later date.', 'warning');
      return;
    }
    // A fixed end date only applies to paid subjects
    const subjectData = { ...newSubject, accessUntil: isPaid ? newSubject.accessUntil || null : null };
    if (editingSubjectId) {
      updateSubject(editingSubjectId, subjectData);
      showToast(`Subject "${newSubject.name}" updated`, 'success');
    } else {
      addSubject(subjectData);
    }
    setSubjectModalOpen(false);
    setEditingSubjectId(null);
    setNewSubject({
      name: '',
      code: '',
      category: 'General',
      price: 499,
      validityDays: DEFAULT_VALIDITY_DAYS,
      accessUntil: null,
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
      notes: '',
      sectionId: ''
    });
  };

  // Opens the Add Video modal with a section preselected (defaults to the last section)
  const handleOpenAddVideo = (sectionId) => {
    const sections = currentModule?.sections || [];
    setNewVideo((prev) => ({
      ...prev,
      sectionId: sectionId || sections[sections.length - 1]?.id || ''
    }));
    setVideoModalOpen(true);
  };

  const handleOpenAddSection = () => {
    const nextNumber = (currentModule?.sections?.length || 0) + 1;
    setEditingSectionId(null);
    setSectionForm({ title: `Section ${nextNumber}`, description: '' });
    setSectionModalOpen(true);
  };

  const handleOpenEditSection = (section) => {
    setEditingSectionId(section.id);
    setSectionForm({ title: section.title || '', description: section.description || '' });
    setSectionModalOpen(true);
  };

  const handleSaveSection = (e) => {
    e.preventDefault();
    if (!sectionForm.title.trim() || !currentSubject || !currentModule) {
      showToast('Section name is required', 'warning');
      return;
    }
    if (editingSectionId) {
      updateSection(currentSubject.id, currentModule.id, editingSectionId, {
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim()
      });
    } else {
      addSection(currentSubject.id, currentModule.id, sectionForm);
    }
    setSectionModalOpen(false);
    setEditingSectionId(null);
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
    const { groups: sectionGroups } = groupVideosBySection(currentModule);
    const filteredQuestions =
      questionDifficultyFilter === 'All'
        ? currentModule.questions || []
        : (currentModule.questions || []).filter((q) =>
            matchesDifficulty(q.difficulty, questionDifficultyFilter)
          );

    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation — desktop only */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 flex-wrap">
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

        {/* Module Header: App Header Style */}
        <PageHeader
          onBack={() => setSelectedModule(null)}
          backLabel="Back to Modules"
          title={currentModule.title}
          subtitle={`${currentSubject.code || currentSubject.name} • ${currentModule.duration || '45 mins'}`}
          badge={
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 border border-[#20B8C7]/20">
              {currentSubject.code || currentSubject.name}
            </span>
          }
          actions={
            activeModuleTab === 'videos' ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenAddSection}
                  className="flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                >
                  <FolderPlus className="w-4 h-4 text-[#087F8C]" />
                  <span>Add Section</span>
                </button>
                <button
                  onClick={() => handleOpenAddVideo()}
                  className="flex-1 sm:flex-none justify-center px-4 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_16px_rgba(20,184,166,0.25)] border border-[#20B8C7]/40 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              </div>
            ) : activeModuleTab === 'notes' ? (
              <button
                onClick={() => setNoteModalOpen(true)}
                className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_16px_rgba(20,184,166,0.25)] border border-[#20B8C7]/40 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Notes</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setBulkModalOpen(true)}
                  className="flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                  title="Bulk upload questions from A4 format"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Bulk A4 Upload</span>
                  <span className="sm:hidden">Bulk</span>
                </button>
                <button
                  onClick={() => setQuestionModalOpen(true)}
                  className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_4px_16px_rgba(20,184,166,0.25)] border border-[#20B8C7]/40 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            )
          }
        />

        {/* Tab Switcher: Videos / Notes / Questions */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#E8F3F4] dark:bg-slate-800/80 border border-[#087F8C]/15 dark:border-slate-700/60 text-[11px] sm:text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveModuleTab('videos')}
            className={`min-h-[2.5rem] px-2 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeModuleTab === 'videos'
                ? 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
            }`}
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden truncate">Videos ({currentModule.videos?.length || 0})</span>
            <span className="hidden sm:inline truncate">Lesson Videos ({currentModule.videos?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModuleTab('notes')}
            className={`min-h-[2.5rem] px-2 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeModuleTab === 'notes'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
            }`}
          >
            <NotebookText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden truncate">Notes ({currentModule.notes?.length || 0})</span>
            <span className="hidden sm:inline truncate">Study Notes ({currentModule.notes?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModuleTab('questions')}
            className={`min-h-[2.5rem] px-2 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeModuleTab === 'questions'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden truncate">Q&A ({currentModule.questions?.length || 0})</span>
            <span className="hidden sm:inline truncate">Questions & Answers ({currentModule.questions?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: VIDEOS GROUPED BY SECTION */}
        {activeModuleTab === 'videos' && (
          <div className="space-y-4">
            {sectionGroups.map(({ section, sectionIndex, videos: sectionVideos }) => {
              const isConfirmingDelete = confirmDeleteSectionId === section.id;
              return (
                <section
                  key={section.id}
                  className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="px-3 sm:px-4 py-3 bg-[#F4FAFB] dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#087F8C] text-white flex flex-col items-center justify-center shrink-0 shadow-xs leading-none">
                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">Sec</span>
                        <span className="text-sm font-black">{sectionIndex + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-extrabold text-sm text-slate-900 dark:text-white truncate"
                          title={section.title}
                        >
                          {section.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {sectionVideos.length} {sectionVideos.length === 1 ? 'video' : 'videos'}
                          {section.description ? ` • ${section.description}` : ''}
                        </p>
                      </div>
                    </div>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto animate-in fade-in duration-150">
                        <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                          Delete section{sectionVideos.length ? ` & ${sectionVideos.length} video${sectionVideos.length === 1 ? '' : 's'}` : ''}?
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSectionId(null)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteSection(currentSubject.id, currentModule.id, section.id);
                            setConfirmDeleteSectionId(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenAddVideo(section.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#E6F4F6] hover:bg-[#d8eef1] dark:bg-[#0E353E] dark:hover:bg-[#12424d] text-[#0C4E5B] dark:text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-colors active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditSection(section)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0C4E5B] hover:bg-white dark:hover:bg-slate-800 transition-colors"
                          title="Rename Section"
                          aria-label={`Rename ${section.title}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {(sectionGroups.length > 1 || sectionVideos.length > 0) && (
                          <button
                            type="button"
                            onClick={() =>
                              sectionVideos.length === 0
                                ? deleteSection(currentSubject.id, currentModule.id, section.id)
                                : setConfirmDeleteSectionId(section.id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Section"
                            aria-label={`Delete ${section.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Videos */}
                  <div className="p-3 sm:p-3.5">
                    {sectionVideos.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAddVideo(section.id)}
                        className="w-full py-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-[#0C4E5B] hover:border-[#20B8C7]/60 hover:bg-[#F4FAFB] dark:hover:bg-slate-900/40 transition-colors flex flex-col items-center gap-1.5"
                      >
                        <ListVideo className="w-6 h-6" />
                        <span className="text-xs font-bold">No videos in this section yet</span>
                        <span className="text-[11px]">Tap to add the first video</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                        {sectionVideos.map((vid, idx) => {
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

                                  {/* Top-Left: Lesson Tag (numbered within the section) */}
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
                </section>
              );
            })}

            {/* Add next section */}
            <button
              type="button"
              onClick={handleOpenAddSection}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[#087F8C]/25 dark:border-slate-700 text-[#0C4E5B] dark:text-cyan-300 hover:bg-[#F4FAFB] dark:hover:bg-slate-900/40 hover:border-[#087F8C]/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Section {sectionGroups.length + 1}</span>
            </button>
          </div>
        )}

        {/* TAB: STUDY NOTES */}
        {activeModuleTab === 'notes' && (
          <div className="space-y-4">
            <NotesList
              notes={currentModule.notes || []}
              onOpen={setViewingNote}
              onDelete={(note) => deleteNote(currentSubject.id, currentModule.id, note.id)}
              emptyState={
                <div className="p-8 sm:p-10 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                  <NotebookText className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                    No Notes Shared Yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Paste a Google Drive link to a PDF, Doc, Slides or folder, and students read it right inside the app.
                  </p>
                  <button
                    onClick={() => setNoteModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs border border-[#20B8C7]/30"
                  >
                    <Plus className="w-4 h-4" /> Add First Notes
                  </button>
                </div>
              }
            />
          </div>
        )}

        {noteModalOpen && (
          <AddNoteModal
            moduleTitle={currentModule.title}
            showToast={showToast}
            onClose={() => setNoteModalOpen(false)}
            onSave={(noteData, file) => addNote(currentSubject.id, currentModule.id, noteData, file)}
          />
        )}

        {viewingNote && <NotePreviewModal note={viewingNote} onClose={() => setViewingNote(null)} />}

        {/* TAB 2: QUESTIONS & ANSWERS LIST */}
        {activeModuleTab === 'questions' && (
          <div className="space-y-4">
            {/* Difficulty Filter Tabs & Customization Button */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-[11px] sm:text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuestionDifficultyFilter('All')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all shrink-0 ${
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
                        className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-blue-400 shadow-xs shrink-0"
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
                          className="w-16 sm:w-20 px-1 py-0.5 text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
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
                      className={`relative flex items-center rounded-xl transition-all group/chip shrink-0 ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setQuestionDifficultyFilter(lvl.label)}
                        className="px-2 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-1.5"
                      >
                        <span>{lvl.dot}</span>
                        <span>{lvl.label}</span>
                      </button>

                      {/* Quick Edit Pencil — desktop only; mobile uses Customize */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDifficultyId(lvl.id);
                          setInlineDifficultyText(lvl.label);
                        }}
                        className="hidden sm:inline-flex pr-2 pl-0.5 py-1 text-slate-400 hover:text-amber-500 transition-colors opacity-70 hover:opacity-100"
                        title={`Click to edit "${lvl.label}" label`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Showing <strong>{filteredQuestions.length}</strong> questions
                </span>
                <button
                  type="button"
                  onClick={() => setDifficultyModalOpen(true)}
                  className="shrink-0 px-2.5 py-1.5 rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-[11px] font-bold inline-flex items-center gap-1 transition-colors border border-amber-200/70 dark:border-amber-800/50"
                  title="Customize all mode labels (Easy, Medium, Tough)"
                >
                  <Sliders className="w-3 h-3 text-amber-500" />
                  <span>Customize</span>
                </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
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
                {/* Section picker: which section of this module the video goes into */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Section *
                  </label>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Section">
                    {(currentModule.sections || []).map((sec, sIdx) => {
                      const isSelected = newVideo.sectionId === sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setNewVideo({ ...newVideo, sectionId: sec.id })}
                          className={`max-w-full px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#087F8C] border-[#087F8C] text-white shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#20B8C7]/60'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-md text-[10px] flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            {sIdx + 1}
                          </span>
                          <span className="truncate">{sec.title}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setVideoModalOpen(false);
                        handleOpenAddSection();
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-[#0C4E5B] hover:border-[#20B8C7]/60 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Section</span>
                    </button>
                  </div>
                </div>

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
        {/* MODAL: ADD / RENAME SECTION                                       */}
        {/* ================================================================= */}
        {sectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#E6F4F6] dark:bg-[#0E353E] text-[#087F8C] dark:text-cyan-300 flex items-center justify-center shrink-0">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {editingSectionId ? 'Rename Section' : 'Add Section'}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">Module: {currentModule.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSectionModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSection} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Section Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Section 1 or Introduction"
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    placeholder="What does this section cover? (optional)"
                    value={sectionForm.description}
                    onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSectionModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] text-xs font-bold text-white shadow-md shadow-[#087F8C]/20"
                  >
                    {editingSectionId ? 'Save Changes' : 'Create Section'}
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
    const moduleCount = currentSubject.modules?.length || 0;
    const subjectSubtitle = [
      currentSubject.code,
      currentSubject.category || 'General',
      currentSubject.price !== undefined
        ? Number(currentSubject.price) > 0
          ? `₹${currentSubject.price} / ${formatAccess(currentSubject)}`
          : 'Free'
        : null
    ]
      .filter(Boolean)
      .join(' • ');

    return (
      <div className="relative space-y-3 sm:space-y-5 animate-in fade-in duration-200 pb-28 sm:pb-16">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 min-w-0 px-0.5"
        >
          <button
            type="button"
            onClick={() => setSelectedSubject(null)}
            className="hover:text-[#087F8C] font-semibold shrink-0 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Subjects
          </button>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="font-bold text-slate-900 dark:text-white truncate">
            {currentSubject.name}
          </span>
        </nav>

        {/* Subject Header — back + title only; Add lives with Modules section */}
        <PageHeader
          onBack={() => setSelectedSubject(null)}
          backLabel="Back to All Subjects"
          title={currentSubject.name}
          subtitle={subjectSubtitle}
          badge={
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 border border-[#20B8C7]/20">
              {currentSubject.code || 'CODE'}
            </span>
          }
        />

        {/* Modules section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                Modules ({moduleCount})
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Tap a module to manage videos and questions
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModuleModalOpen(true)}
              className="hidden sm:inline-flex shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm items-center gap-1.5 shadow-md shadow-[#087F8C]/25 border border-[#20B8C7]/40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module</span>
            </button>
          </div>

          {moduleCount === 0 ? (
            <div className="px-4 py-8 sm:px-6 sm:py-10 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-subtle">
              <div className="mx-auto max-w-sm flex flex-col items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#E8F3F4] dark:bg-slate-800 text-[#087F8C] dark:text-teal-300 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-tight">
                    No modules yet
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Add Module 1 to start attaching videos and quiz questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(true)}
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs shadow-md shadow-[#087F8C]/20 border border-[#20B8C7]/40 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {currentSubject.modules.map((mod, idx) => {
                const totalVideos = mod.videos?.length || 0;
                const totalQuestions = mod.questions?.length || 0;
                const totalSections = mod.sections?.length || 0;
                const totalNotes = mod.notes?.length || 0;

                return (
                  <div
                    key={mod.id || idx}
                    className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 shadow-subtle hover:border-[#087F8C]/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 border border-[#20B8C7]/20 text-[10px] font-extrabold tracking-wide">
                          Mod {idx + 1}
                          <span className="font-semibold opacity-70"> · {totalSections} {totalSections === 1 ? 'section' : 'sections'}</span>
                        </span>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-mono shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{mod.duration || '45 mins'}</span>
                        </div>
                      </div>

                      <h4
                        className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#0C4E5B] dark:group-hover:text-cyan-400 transition-colors"
                        title={mod.title}
                      >
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
                        {mod.description || 'No description'}
                      </p>

                      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                        <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900/40">
                          <Video className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="font-bold truncate">{totalVideos} videos</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-100 dark:border-amber-900/40">
                          <NotebookText className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="font-bold truncate">{totalNotes} notes</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900/40">
                          <HelpCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="font-bold">{totalQuestions} Qs</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => deleteModule(currentSubject.id, mod.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModule(mod);
                          setActiveModuleTab('videos');
                        }}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs border border-[#20B8C7]/30 active:scale-95 transition-all"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FAB — Add Module (mobile only; tablet/desktop use inline actions) */}
        {!moduleModalOpen && (
          <button
            type="button"
            onClick={() => setModuleModalOpen(true)}
            className="sm:hidden fixed z-40 bottom-20 right-4 inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs shadow-[0_8px_28px_rgba(8,127,140,0.45)] border border-[#20B8C7]/40 active:scale-95 transition-all"
            aria-label="Add Module"
          >
            <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </span>
            <span>Add Module</span>
          </button>
        )}

        {/* ADD MODULE — full page on mobile, modal on desktop */}
        {moduleModalOpen && (
          <div className="fixed inset-0 z-[60] bg-surface-light dark:bg-surface-darkBg md:bg-navy-950/70 md:backdrop-blur-xs md:flex md:items-center md:justify-center md:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="min-h-full md:min-h-0 w-full md:max-w-md md:my-auto bg-surface-light dark:bg-surface-darkBg md:bg-white md:dark:bg-surface-darkCard md:rounded-3xl md:shadow-2xl md:border md:border-slate-200 md:dark:border-slate-800">
              <div className="md:hidden sticky top-0 z-10 p-3 bg-surface-light/95 dark:bg-surface-darkBg/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
                <PageHeader
                  onBack={() => setModuleModalOpen(false)}
                  backLabel="Back"
                  title="Add Module"
                  subtitle={currentSubject.name}
                />
              </div>

              <div className="hidden md:flex items-center justify-between p-6 pb-0 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#087F8C] flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Add New Module
                    </h3>
                    <p className="text-xs text-slate-400">Subject: {currentSubject.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateModule} className="p-3 md:p-6 pt-3 md:pt-0 space-y-3.5 pb-28 md:pb-6">
                <div className="bg-white dark:bg-surface-darkCard md:bg-transparent rounded-2xl md:rounded-none border border-slate-200/80 dark:border-slate-800 md:border-0 p-3.5 md:p-0 space-y-3.5 shadow-subtle md:shadow-none">
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
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
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
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
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
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
                    />
                  </div>
                </div>

                <div className="fixed md:static bottom-0 left-0 right-0 z-10 p-3 md:p-0 bg-white/95 dark:bg-surface-darkCard/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t border-slate-200/80 dark:border-slate-800 md:border-0 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModuleModalOpen(false)}
                    className="flex-1 min-h-[2.75rem] py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[2.75rem] py-2.5 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-xs font-bold text-white shadow-md shadow-[#087F8C]/25"
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
    <div className="relative space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-28 sm:pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>/</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">Curriculum</span>
      </div>

      {/* Page Header — no Layout / Add buttons here (FAB below) */}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
          <span className="sm:hidden">Curriculum Manager</span>
          <span className="hidden sm:inline">Subjects & Curriculum Manager</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5 leading-relaxed max-w-2xl">
          Create and manage subjects, modules, videos and quizzes.
        </p>
      </div>

      {/* Filters card — theme track + search */}
      <div className="flex flex-col gap-3 sm:gap-3.5 p-3 sm:p-3.5 md:p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        {/* All tabs in one row on mobile */}
        <div className="grid grid-cols-4 gap-1 p-1 sm:p-1.5 rounded-xl bg-[#E8F3F4] dark:bg-slate-800/80 border border-[#087F8C]/15 dark:border-slate-700/60 text-[11px] sm:text-xs font-bold">
          {[
            { id: 'all', short: 'All', label: `All Subjects (${curriculumSubjects.length})` },
            { id: 'active', short: 'Active', label: `Active (${curriculumSubjects.length})` },
            { id: 'draft', short: 'Draft', label: 'Draft (0)' },
            { id: 'archived', short: 'Archive', label: 'Archived (0)' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubjectTab(tab.id)}
              className={`min-h-[2.25rem] sm:min-h-[2.5rem] px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all flex items-center justify-center whitespace-nowrap ${
                subjectTab === tab.id
                  ? 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="md:hidden truncate">{tab.short}</span>
              <span className="hidden md:inline truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]/50 shadow-subtle"
          />
        </div>
      </div>

      {/* Subjects — 2 cards per row on mobile & laptop */}
      {filteredSubjectsList.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white dark:bg-surface-darkCard rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No Subjects Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No subjects match your search or filter. Tap Add Subject to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
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
                className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-subtle sm:shadow-premium card-hover-lift flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Thumbnail */}
                  <div className="h-24 sm:h-32 w-full relative overflow-hidden bg-slate-900">
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

                    <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between gap-1">
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 shadow-2xs truncate max-w-[55%]">
                        {sub.code || `C0${sIdx + 1}`}
                      </span>
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black text-white shadow-2xs shrink-0 ${
                          priceVal > 0 ? 'bg-[#00897B]' : 'bg-[#10B981]'
                        }`}
                      >
                        {priceVal > 0 ? (
                          <>
                            ₹{priceVal}
                            <span className="font-semibold opacity-80"> / {formatAccess(sub)}</span>
                          </>
                        ) : (
                          'Free'
                        )}
                      </span>
                    </div>

                    <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2.5 sm:left-2.5 sm:right-2.5">
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-cyan-300 block leading-tight">
                        {sub.category || 'GENERAL'}
                      </span>
                      <h3 className="font-extrabold text-xs sm:text-base text-white truncate drop-shadow-sm">
                        {sub.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content Info */}
                  <div className="p-2 sm:p-3.5 space-y-1.5 sm:space-y-2">
                    <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
                      {sub.description && sub.description !== sub.name
                        ? sub.description
                        : `${sub.category || 'General'} · ${totalModules} modules`}
                    </p>

                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-center">
                      <div className="p-1 sm:p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500 shrink-0" />
                        <span>{totalModules}</span>
                      </div>
                      <div className="p-1 sm:p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-teal-500 shrink-0" />
                        <span>{totalVideos}</span>
                      </div>
                      <div className="p-1 sm:p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0" />
                        <span>{totalQuestions}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-2 sm:p-3.5 pt-0 flex items-center justify-between gap-1 border-t border-slate-100 dark:border-slate-800/60 pt-2">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSubject(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Subject"
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
                    className="py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white font-bold text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 shadow-sm border border-[#20B8C7]/30 active:scale-95 transition-all"
                  >
                    <span className="sm:hidden">Open</span>
                    <span className="hidden sm:inline">Modules ({totalModules})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button — Add Subject */}
      {!subjectModalOpen && (
        <button
          type="button"
          onClick={handleOpenAddSubject}
          className="fixed z-40 bottom-20 right-4 sm:bottom-8 sm:right-8 inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-white font-bold text-xs sm:text-sm shadow-[0_8px_28px_rgba(8,127,140,0.45)] border border-[#20B8C7]/40 active:scale-95 transition-all"
          aria-label="Add Subject"
        >
          <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </span>
          <span>Add Subject</span>
        </button>
      )}

      {/* ADD / EDIT SUBJECT — full page on mobile, modal on desktop */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-[60] bg-surface-light dark:bg-surface-darkBg md:bg-navy-950/70 md:backdrop-blur-xs md:flex md:items-center md:justify-center md:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="min-h-full md:min-h-0 w-full md:max-w-lg md:my-auto md:max-h-[92vh] md:overflow-y-auto bg-surface-light dark:bg-surface-darkBg md:bg-white md:dark:bg-surface-darkCard md:rounded-3xl md:shadow-2xl md:border md:border-slate-200 md:dark:border-slate-800">
            {/* Mobile page header */}
            <div className="md:hidden sticky top-0 z-10 p-3 bg-surface-light/95 dark:bg-surface-darkBg/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
              <PageHeader
                onBack={() => setSubjectModalOpen(false)}
                backLabel="Back to subjects"
                title={editingSubjectId ? 'Edit Subject' : 'Add New Subject'}
                subtitle="Name, fee, cover & description"
              />
            </div>

            {/* Desktop modal header */}
            <div className="hidden md:flex items-center justify-between p-6 pb-0 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#087F8C] dark:text-teal-300 flex items-center justify-center">
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
                type="button"
                onClick={() => setSubjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubject}
              className="p-3 md:p-6 pt-3 md:pt-0 space-y-3.5 pb-28 md:pb-6"
            >
              <div className="bg-white dark:bg-surface-darkCard md:bg-transparent rounded-2xl md:rounded-none border border-slate-200/80 dark:border-slate-800 md:border-0 p-3.5 md:p-0 space-y-3.5 shadow-subtle md:shadow-none">
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
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MAL-101"
                      value={newSubject.code}
                      onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
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
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Rate / Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="499"
                      value={newSubject.price !== undefined ? newSubject.price : 499}
                      onChange={(e) => setNewSubject({ ...newSubject, price: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Rates:</span>
                  {[0, 299, 499, 999, 1499].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setNewSubject({ ...newSubject, price: amt })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        Number(newSubject.price) === amt
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {amt === 0 ? 'Free (₹0)' : `₹${amt}`}
                    </button>
                  ))}
                </div>

                {/* Access duration: how long one payment unlocks this subject */}
                {Number(newSubject.price) > 0 && (
                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#087F8C]" />
                        <span>Access Duration *</span>
                      </label>
                      {!newSubject.accessUntil && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="3650"
                            aria-label="Custom number of days"
                            placeholder="Days"
                            value={isLifetime(newSubject.validityDays) ? '' : newSubject.validityDays}
                            onChange={(e) =>
                              setNewSubject({
                                ...newSubject,
                                validityDays: Math.max(0, Math.min(3650, Math.round(Number(e.target.value) || 0)))
                              })
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg text-xs font-bold text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
                          />
                          <span className="text-[11px] text-slate-400 font-medium">days</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {VALIDITY_PRESETS.map((preset) => {
                        const selected = !newSubject.accessUntil && (isLifetime(preset.days)
                          ? isLifetime(newSubject.validityDays)
                          : Number(newSubject.validityDays) === preset.days);
                        return (
                          <button
                            type="button"
                            key={preset.label}
                            onClick={() => setNewSubject({ ...newSubject, validityDays: preset.days, accessUntil: null })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              selected
                                ? 'bg-[#E6F4F6] dark:bg-[#0E353E] text-[#0C4E5B] dark:text-cyan-300 border-[#087F8C]'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:bg-slate-200'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                      {/* Calendar: access ends on a fixed date instead of after N days */}
                      <button
                        type="button"
                        onClick={() =>
                          setNewSubject({
                            ...newSubject,
                            accessUntil: newSubject.accessUntil || toYmd(addDays(new Date(), 30))
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all inline-flex items-center gap-1 ${
                          newSubject.accessUntil
                            ? 'bg-[#E6F4F6] dark:bg-[#0E353E] text-[#0C4E5B] dark:text-cyan-300 border-[#087F8C]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:bg-slate-200'
                        }`}
                      >
                        <CalendarDays className="w-3 h-3" />
                        Pick end date
                      </button>
                    </div>
                    {newSubject.accessUntil && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                          Access ends on
                        </label>
                        <CustomDatePicker
                          value={newSubject.accessUntil}
                          onChange={(ymd) => setNewSubject({ ...newSubject, accessUntil: ymd || null })}
                          placeholder="Select last day of access"
                        />
                        {accessDateInPast && (
                          <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                            This date has already passed. Pick today or a later date.
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                      Students pay <strong className="text-emerald-700 dark:text-emerald-300">₹{Number(newSubject.price) || 0}</strong>
                      {newSubject.accessUntil ? (
                        <> for access until <strong className="text-emerald-700 dark:text-emerald-300">{formatDate(endOfDate(newSubject.accessUntil))}</strong>, whatever day you approve their payment.</>
                      ) : isLifetime(newSubject.validityDays) ? (
                        <> once for <strong className="text-emerald-700 dark:text-emerald-300">lifetime access</strong>.</>
                      ) : (
                        <> for <strong className="text-emerald-700 dark:text-emerald-300">{formatValidity(newSubject.validityDays)}</strong> of access, counted from the day you approve their payment.</>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-surface-darkCard md:bg-slate-50/80 md:dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-subtle md:shadow-none">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#087F8C]" />
                    <span>Subject Cover Image</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    Upload or URL
                  </span>
                </div>

                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {newSubject.thumbnail ? (
                    <img
                      src={newSubject.thumbnail}
                      alt="Subject Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Camera className="w-3 h-3 text-teal-300" />
                    <span>Cover Preview</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-[#087F8C]/50 dark:border-teal-600 bg-slate-50 dark:bg-slate-800 text-[#087F8C] dark:text-teal-300 text-xs font-bold hover:bg-teal-50 dark:hover:bg-slate-700/80 cursor-pointer transition-all">
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
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-darkCard md:bg-transparent rounded-2xl md:rounded-none border border-slate-200/80 dark:border-slate-800 md:border-0 p-3.5 md:p-0 shadow-subtle md:shadow-none">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview of curriculum and objectives"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
                />
              </div>

              {/* Actions — sticky on mobile */}
              <div className="fixed md:static bottom-0 left-0 right-0 z-10 p-3 md:p-0 bg-white/95 dark:bg-surface-darkCard/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t border-slate-200/80 dark:border-slate-800 md:border-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="flex-1 min-h-[2.75rem] py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[2.75rem] py-2.5 rounded-xl bg-gradient-to-r from-[#0C4E5B] to-[#125B69] hover:from-[#0E5866] hover:to-[#156776] text-xs font-bold text-white shadow-md shadow-[#087F8C]/25 active:scale-95 transition-all"
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
