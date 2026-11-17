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

  // Summary Metrics
  const totalBroadcasts = notifications.length;
  const examAlertsCount = notifications.filter((n) => n.type === 'exam_alert').length;
  const urgentAlertsCount = notifications.filter((n) => n.type === 'urgent').length;
  const targetedCount = notifications.filter((n) => n.targetAudience === 'students' || n.targetAudience === 'batch').length;

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
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-6 sm:p-8 text-white border border-[#145663]/60 shadow-[0_8px_32px_rgba(4,20,24,0.35)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-80 h-32 rounded-full bg-[#087F8C]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>Faculty Communications Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Announcements & Student Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Broadcast academic notices, scheduled examination windows, and personalized notifications to specific student cohorts across Civil Engineering programs.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white font-extrabold text-xs sm:text-sm shadow-[0_4px_20px_rgba(20,184,166,0.35)] flex items-center justify-center gap-2.5 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Broadcasts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total Notices</span>
            <Megaphone className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalBroadcasts}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Published circulars</div>
        </div>

        {/* Exam Alerts */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50/40 dark:from-cyan-950/40 dark:to-teal-950/20 border border-cyan-300 dark:border-cyan-800/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-cyan-800 dark:text-cyan-300">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Exam Alerts</span>
            <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-950 dark:text-cyan-200">
            {examAlertsCount}
          </div>
          <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold">Live Window Reminders</div>
        </div>

        {/* Targeted Notices */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Targeted</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {targetedCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Cohort-specific</div>
        </div>

        {/* Urgent Alerts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Urgent Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-red-600">
            {urgentAlertsCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Critical action items</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
          {[
            { id: 'All', label: 'All Notices' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'exam_alert', label: 'Exam Alerts' },
            { id: 'urgent', label: 'Urgent' },
            { id: 'important', label: 'Important' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                selectedType === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Audience Selector & View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
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

          {/* View Mode Toggle: 4 in Row vs List */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-[#087F8C] dark:text-[#2DD4BF] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View (4 Cards in a Row)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">4 in Row</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-[#087F8C] dark:text-[#2DD4BF] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Compact List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px]">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Announcements Feed: Grid (4 in a row) or List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
            : 'space-y-3'
        }
      >
        {filteredNotifications.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              No Announcements Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No announcements match your search or filter criteria. Click "+ Create Announcement" to broadcast a new notice.
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

            if (viewMode === 'grid') {
              return (
                <div
                  key={notif.id}
                  className={`p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-2xs hover:shadow-lg flex flex-col justify-between hover:-translate-y-0.5 group ${
                    notif.pinned
                      ? 'border-[#087F8C] ring-2 ring-[#087F8C]/20 shadow-teal-500/5'
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

            // List View Mode
            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-3 shadow-2xs hover:shadow-md ${
                  notif.pinned
                    ? 'border-[#087F8C] ring-2 ring-[#087F8C]/20'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {notif.pinned && (
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold flex items-center gap-1 border border-teal-300 dark:border-teal-800">
                        <Pin className="w-3 h-3 fill-current rotate-45" />
                        <span>PINNED NOTICE</span>
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${meta.badgeBg}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{meta.label}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                      👥 {audienceBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => togglePinAnnouncement(notif.id)}
                      className={`p-1.5 rounded-xl text-xs transition-colors ${
                        notif.pinned
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={notif.pinned ? 'Unpin Notice' : 'Pin Notice to Top'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(notif.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                    {notif.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {notif.message}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2.5">
                    {notif.authorAvatar ? (
                      <img
                        src={notif.authorAvatar}
                        alt={notif.author}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-[10px]">
                        CT
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        {notif.author}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {notif.authorRole || 'Faculty'} • {notif.time || 'Recently'}
                      </span>
                    </div>
                  </div>

                  {notif.actionView && (
                    <button
                      type="button"
                      onClick={() => setActiveView(notif.actionView)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs flex items-center gap-1.5 hover:bg-teal-100 transition-colors w-fit"
                    >
                      <span>{notif.actionLabel || 'View Details'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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
