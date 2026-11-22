import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import {
  Bell,
  Megaphone,
  Radio,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Pin,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Send,
  BookOpen,
  Award,
  Calendar,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';

export const AdminNotificationDashboard = () => {
  const {
    notifications,
    createAnnouncement,
    deleteAnnouncement,
    togglePinAnnouncement,
    students,
    currentUser,
    setActiveView,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All'); // 'All', 'announcement', 'exam_alert', 'urgent', 'important'
  const [selectedAudience, setSelectedAudience] = useState('All'); // 'All', 'all', 'batch', 'students'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (4 in a row) | 'list'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating a new announcement
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState('announcement');
  const [formPriority, setFormPriority] = useState('normal');
  const [formTargetAudience, setFormTargetAudience] = useState('all'); // 'all', 'batch', 'students'
  const [formBatch, setFormBatch] = useState('2022-2026');
  const [formSemester, setFormSemester] = useState('S6');
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState([]);
  const [formStudentSearch, setFormStudentSearch] = useState('');
  const [formActionView, setFormActionView] = useState('none');
  const [formPinned, setFormPinned] = useState(false);

  // Filtered Notifications Feed
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Type Filter
      if (selectedType !== 'All' && n.type !== selectedType) return false;

      // Audience Filter
      if (selectedAudience !== 'All' && n.targetAudience !== selectedAudience) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (n.title || '').toLowerCase().includes(q);
        const msgMatch = (n.message || '').toLowerCase().includes(q);
        const authorMatch = (n.author || '').toLowerCase().includes(q);
        if (!titleMatch && !msgMatch && !authorMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      // Pinned items first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [notifications, selectedType, selectedAudience, searchQuery]);

  // Handle Form Submission
  const handlePublish = (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      showToast('Please enter an announcement title', 'warning');
      return;
    }

    if (!formMessage.trim()) {
      showToast('Please enter announcement message content', 'warning');
      return;
    }

    if (formTargetAudience === 'students' && formSelectedStudentIds.length === 0) {
      showToast('Please select at least one target student', 'warning');
      return;
    }

    let actionLabel = null;
    if (formActionView === 'examinations') actionLabel = 'Open Live Examinations';
    else if (formActionView === 'subjects') actionLabel = 'Explore Curriculum';
    else if (formActionView === 'results') actionLabel = 'View Assessments';

    createAnnouncement({
      title: formTitle.trim(),
      message: formMessage.trim(),
      type: formType,
      priority: formPriority,
      targetAudience: formTargetAudience,
      targetBatch: formTargetAudience === 'batch' ? formBatch : 'All',
      targetSemester: formTargetAudience === 'batch' ? formSemester : 'All',
      targetStudentIds: formTargetAudience === 'students' ? formSelectedStudentIds : [],
      pinned: formPinned,
      actionView: formActionView !== 'none' ? formActionView : null,
      actionLabel
    });

    // Reset Form & Close
    setFormTitle('');
    setFormMessage('');
    setFormType('announcement');
    setFormPriority('normal');
    setFormTargetAudience('all');
    setFormSelectedStudentIds([]);
    setFormActionView('none');
    setFormPinned(false);
    setIsCreateModalOpen(false);
  };

  // Toggle single student in picker
  const toggleStudentSelection = (studentId) => {
    setFormSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Filter students for picker
  const filteredPickerStudents = useMemo(() => {
    if (!formStudentSearch.trim()) return students;
    const q = formStudentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.studentId || '').toLowerCase().includes(q) ||
        (s.semester || '').toLowerCase().includes(q)
    );
  }, [students, formStudentSearch]);

  const selectAllPickerStudents = () => {
    setFormSelectedStudentIds(students.map((s) => s.id));
  };

  const deselectAllPickerStudents = () => {
    setFormSelectedStudentIds([]);
  };

  // Type metadata helper
  const getTypeMeta = (type) => {
    switch (type) {
      case 'exam_alert':
        return {
          label: 'Exam Alert',
          icon: Radio,
          badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800',
          accent: 'border-l-4 border-l-cyan-500'
        };
      case 'urgent':
        return {
          label: 'Urgent Alert',
          icon: AlertTriangle,
          badgeBg: 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800',
          accent: 'border-l-4 border-l-red-500'
        };
      case 'important':
        return {
          label: 'Important Notice',
          icon: AlertCircle,
          badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800',
          accent: 'border-l-4 border-l-amber-500'
        };
      case 'system':
        return {
          label: 'System Notification',
          icon: CheckCircle2,
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
          accent: 'border-l-4 border-l-emerald-500'
        };
      default:
        return {
          label: 'Announcement',
          icon: Megaphone,
          badgeBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800',
          accent: 'border-l-4 border-l-[#087F8C]'
        };
    }
  };

  return (
    <div className="relative space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-28 sm:pb-16">
      {/* Compact hero */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-3.5 sm:p-8 text-white border border-[#145663]/60 shadow-premium sm:shadow-[0_8px_32px_rgba(4,20,24,0.35)]">
        <div className="absolute -right-10 -top-10 w-36 h-36 sm:w-64 sm:h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 min-w-0 space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="sm:hidden">Communications</span>
            <span className="hidden sm:inline">Faculty Communications Center</span>
          </div>
          <h1 className="text-base sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-snug">
            <span className="sm:hidden">Announcements</span>
            <span className="hidden sm:inline">Announcements & Student Alerts</span>
          </h1>
          <p className="hidden sm:block text-sm text-slate-300 max-w-2xl leading-relaxed">
            Broadcast academic notices, exam windows, and personalized alerts to student cohorts.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-3.5 p-3 sm:p-3.5 md:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        {/* All tabs in one row on mobile */}
        <div className="grid grid-cols-4 gap-1 p-1 sm:p-1.5 rounded-xl bg-[#E8F3F4] dark:bg-slate-800/80 border border-[#087F8C]/15 dark:border-slate-700/60 text-[11px] sm:text-xs font-bold">
          {[
            { id: 'All', short: 'All', label: 'All Notices' },
            { id: 'announcement', short: 'Notice', label: 'Announcements' },
            { id: 'exam_alert', short: 'Exams', label: 'Exam Alerts' },
            { id: 'urgent', short: 'Urgent', label: 'Urgent' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id)}
              className={`min-h-[2.5rem] px-2.5 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center whitespace-nowrap ${
                selectedType === tab.id
                  ? 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="md:hidden truncate">{tab.short}</span>
              <span className="hidden md:inline truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]/50 shadow-subtle"
            />
          </div>
          <CustomDropdown
            options={[
              { value: 'All', label: 'All Audiences' },
              { value: 'all', label: 'Broadcast (All Students)' },
              { value: 'batch', label: 'Specific Batch' },
              { value: 'students', label: 'Targeted Individuals' }
            ]}
            value={selectedAudience}
            onChange={setSelectedAudience}
            size="sm"
          />
        </div>
      </div>

      {/* Announcements — 1 per row on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredNotifications.length === 0 ? (
          <div className="col-span-full p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              No Announcements Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No notices match your filters. Tap Announce to broadcast a new notice.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const meta = getTypeMeta(notif.type);
            const Icon = meta.icon;

            // Target Audience Display
            let audienceBadge = 'All Students (21)';
            if (notif.targetAudience === 'batch') {
              audienceBadge = `Batch ${notif.targetBatch || '2022-2026'} (${notif.targetSemester || 'S6'})`;
            } else if (notif.targetAudience === 'students') {
              const count = notif.targetStudentIds?.length || 0;
              audienceBadge = `${count} Specific Students`;
            }

            // Always card grid on mobile/desktop (list toggle removed)
            {
              return (
                <div
                  key={notif.id}
                  className={`p-3 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-subtle hover:shadow-md flex flex-col justify-between group ${
                    notif.pinned
                      ? 'border-[#087F8C] ring-2 ring-[#087F8C]/20'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-[#087F8C]/40'
                  }`}
                >
                  {/* Top: Badges and Actions */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${meta.badgeBg}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>

                        {notif.pinned && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold flex items-center gap-1 border border-teal-300 dark:border-teal-800">
                            <Pin className="w-2.5 h-2.5 fill-current rotate-45" />
                            <span>PINNED</span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePinAnnouncement(notif.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            notif.pinned
                              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={notif.pinned ? 'Unpin Notice' : 'Pin Notice to Top'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteAnnouncement(notif.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Audience badge */}
                    <div className="mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold border border-slate-200/80 dark:border-slate-700/80 inline-block truncate max-w-full">
                        👥 {audienceBadge}
                      </span>
                    </div>

                    {/* Title & Message */}
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-2 break-words">
                        {notif.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 break-words">
                        {notif.message}
                      </p>
                    </div>

                    {/* Action link if configured */}
                    {notif.actionView && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setActiveView(notif.actionView)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#087F8C] dark:text-teal-300 border border-teal-200/80 dark:border-teal-800 font-bold text-[11px] flex items-center gap-1 hover:bg-teal-100 transition-colors"
                        >
                          <span>{notif.actionLabel || 'View Details'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between gap-2 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-2 min-w-0">
                      {notif.authorAvatar ? (
                        <img
                          src={notif.authorAvatar}
                          alt={notif.author}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-[9px] shrink-0">
                          CT
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] truncate">
                          {notif.author}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {notif.authorRole || 'Faculty'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {notif.time || 'Recently'}
                    </span>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>

      {/* FAB — Create Announcement */}
      {!isCreateModalOpen && (
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed z-40 bottom-20 right-4 sm:bottom-8 sm:right-8 inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white font-bold text-xs sm:text-sm shadow-[0_8px_28px_rgba(20,184,166,0.45)] border border-[#20B8C7]/40 active:scale-95 transition-all"
          aria-label="Create Announcement"
        >
          <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </span>
          <span className="sm:hidden">Announce</span>
          <span className="hidden sm:inline">Create Announcement</span>
        </button>
      )}

      {/* =========================================================================
          CREATE ANNOUNCEMENT / NOTIFICATION MODAL
      ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-teal-600" />
                  <span>Broadcast Student Announcement</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish a new academic circular or alert to the student portal and notification bell.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              {/* Notice Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Notice Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Structural Engineering Mid-Term Exam Window Scheduled"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  required
                />
              </div>

              {/* Category / Type Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Category / Notification Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'announcement', label: 'Announcement', icon: Megaphone, color: 'text-teal-600' },
                    { id: 'exam_alert', label: 'Exam Alert', icon: Radio, color: 'text-cyan-600' },
                    { id: 'important', label: 'Important Notice', icon: AlertCircle, color: 'text-amber-600' },
                    { id: 'urgent', label: 'Urgent Alert', icon: AlertTriangle, color: 'text-red-500' }
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormType(t.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                          formType === t.id
                            ? 'bg-[#087F8C] text-white border-[#087F8C] shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${formType === t.id ? 'text-white' : t.color}`} />
                        <span className="font-bold text-[11px] truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Audience Selector */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Target Audience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTargetAudience('all')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      formTargetAudience === 'all'
                        ? 'bg-[#082F3C] text-[#2DD4BF] border-[#20B8C7] font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    👥 All Students (21)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetAudience('batch')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      formTargetAudience === 'batch'
                        ? 'bg-[#082F3C] text-[#2DD4BF] border-[#20B8C7] font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🎓 Specific Batch / Sem
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetAudience('students')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      formTargetAudience === 'students'
                        ? 'bg-[#082F3C] text-[#2DD4BF] border-[#20B8C7] font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🎯 Specific Students ({formSelectedStudentIds.length})
                  </button>
                </div>

                {/* Sub-option 1: By Batch & Semester */}
                {formTargetAudience === 'batch' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        Select Batch
                      </span>
                      <CustomDropdown
                        fullWidth
                        options={[
                          { value: '2022-2026', label: 'Batch 2022-2026 (S6)' },
                          { value: '2021-2025', label: 'Batch 2021-2025 (S8)' },
                          { value: '2023-2027', label: 'Batch 2023-2027 (S4)' },
                          { value: '2024-2028', label: 'Batch 2024-2028 (S2)' }
                        ]}
                        value={formBatch}
                        onChange={setFormBatch}
                        size="sm"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        Select Semester
                      </span>
                      <CustomDropdown
                        fullWidth
                        options={[
                          { value: 'S6', label: 'Semester S6' },
                          { value: 'S8', label: 'Semester S8' },
                          { value: 'S4', label: 'Semester S4' },
                          { value: 'S2', label: 'Semester S2' },
                          { value: 'All', label: 'All Semesters' }
                        ]}
                        value={formSemester}
                        onChange={setFormSemester}
                        size="sm"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-option 2: Specific Individual Student Picker */}
                {formTargetAudience === 'students' && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Filter candidates..."
                          value={formStudentSearch}
                          onChange={(e) => setFormStudentSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={selectAllPickerStudents}
                        className="px-2 py-1 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 text-[10px] font-bold"
                      >
                        All (21)
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllPickerStudents}
                        className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Student List Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {filteredPickerStudents.map((s) => {
                        const isSelected = formSelectedStudentIds.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={() => toggleStudentSelection(s.id)}
                            className={`p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={s.avatar}
                                alt={s.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                              <div className="truncate">
                                <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                                  {s.name}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">
                                  {s.studentId} • {s.semester}
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
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Announcement Details & Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed notice, instructions, or examination guidelines..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                  required
                />
              </div>

              {/* Action Link & Pin Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Related Direct Action Link (Optional)
                  </label>
                  <CustomDropdown
                    fullWidth
                    options={[
                      { value: 'none', label: 'None (Plain Notice)' },
                      { value: 'examinations', label: 'Live Examinations Dashboard' },
                      { value: 'subjects', label: 'Subjects & Curriculum View' },
                      { value: 'results', label: 'Assessment Results & Analytics' }
                    ]}
                    value={formActionView}
                    onChange={setFormActionView}
                    size="sm"
                  />
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPinned}
                      onChange={(e) => setFormPinned(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Pin Notice to top of student feed
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish & Broadcast Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
