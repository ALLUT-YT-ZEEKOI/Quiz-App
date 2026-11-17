import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Megaphone,
  Radio,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pin,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  Calendar,
  Check,
  LayoutGrid,
  List
} from 'lucide-react';

export const StudentNoticeBoard = () => {
  const {
    currentUser,
    getFilteredNotificationsForUser,
    markNotificationRead,
    markNotificationsRead,
    setActiveView
  } = useApp();

  const [activeTab, setActiveTab] = useState('All'); // 'All', 'exam_alert', 'announcement', 'urgent'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (4 in a row) | 'list'

  // Get notifications filtered strictly for the active student persona
  const studentNotifs = useMemo(() => {
    return getFilteredNotificationsForUser(currentUser, 'student');
  }, [getFilteredNotificationsForUser, currentUser]);

  const unreadCount = studentNotifs.filter((n) => !n.read).length;

  // Filtered view
  const filteredList = useMemo(() => {
    return studentNotifs.filter((n) => {
      if (activeTab !== 'All' && n.type !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (n.title || '').toLowerCase().includes(q) ||
          (n.message || '').toLowerCase().includes(q) ||
          (n.author || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [studentNotifs, activeTab, searchQuery]);

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
      default:
        return {
          label: 'Faculty Notice',
          icon: Megaphone,
          badgeBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800',
          accent: 'border-l-4 border-l-[#087F8C]'
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-6 sm:p-8 text-white border border-[#145663]/60 shadow-[0_8px_32px_rgba(4,20,24,0.35)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>Official Student Notice Board</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Announcements & Circulars
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Academic updates, scheduled examination reminders, and department circulars published by faculty for <strong>{currentUser?.name || 'Student'}</strong> ({currentUser?.batch || '2022-2026'}).
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markNotificationsRead}
              className="px-4 py-2.5 rounded-2xl bg-[#092B32] hover:bg-[#0E3B44] text-[#2DD4BF] border border-[#20B8C7]/50 font-bold text-xs flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
          {[
            { id: 'All', label: `All Notices (${studentNotifs.length})` },
            { id: 'exam_alert', label: 'Exam Alerts' },
            { id: 'announcement', label: 'Faculty Notices' },
            { id: 'urgent', label: 'Urgent' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Mode Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
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

      {/* Notices Feed: Grid (4 in a row) or List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
            : 'space-y-3'
        }
      >
        {filteredList.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              No Notices Available
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are completely caught up! New faculty announcements and examination notifications will appear here.
            </p>
          </div>
        ) : (
          filteredList.map((notif) => {
            const meta = getTypeMeta(notif.type);
            const Icon = meta.icon;

            if (viewMode === 'grid') {
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markNotificationRead(notif.id);
                  }}
                  className={`p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-2xs hover:shadow-lg flex flex-col justify-between hover:-translate-y-0.5 group cursor-pointer ${
                    notif.pinned
                      ? 'border-[#087F8C] ring-2 ring-[#087F8C]/20 shadow-teal-500/5'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-[#087F8C]/40'
                  } ${!notif.read ? 'bg-teal-50/20 dark:bg-teal-950/10' : ''}`}
                >
                  {/* Top: Badges and Time */}
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-2.5">
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

                        {!notif.read && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-extrabold uppercase tracking-wider">
                            NEW
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {notif.time || 'Recently'}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationRead(notif.id);
                            setActiveView(notif.actionView);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#087F8C] dark:text-teal-300 border border-teal-200/80 dark:border-teal-800 font-bold text-[11px] flex items-center gap-1 hover:bg-teal-100 transition-colors"
                        >
                          <span>{notif.actionLabel || 'Proceed to View'}</span>
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
                  </div>
                </div>
              );
            }

            // List View Mode
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationRead(notif.id);
                }}
                className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-3 shadow-2xs hover:shadow-md cursor-pointer ${
                  notif.pinned
                    ? 'border-[#087F8C] ring-2 ring-[#087F8C]/20'
                    : 'border-slate-200/90 dark:border-slate-800'
                } ${!notif.read ? 'bg-teal-50/20 dark:bg-teal-950/10' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
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

                    {!notif.read && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-extrabold uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {notif.time || 'Recently'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                    {notif.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {notif.message}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    {notif.authorAvatar ? (
                      <img
                        src={notif.authorAvatar}
                        alt={notif.author}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                        CT
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        {notif.author}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {notif.authorRole || 'Faculty'}
                      </span>
                    </div>
                  </div>

                  {notif.actionView && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(notif.id);
                        setActiveView(notif.actionView);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C6D7C] to-[#14B8A6] hover:from-[#0E7A8A] hover:to-[#2DD4BF] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 w-full sm:w-auto"
                    >
                      <span>{notif.actionLabel || 'Proceed to View'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
