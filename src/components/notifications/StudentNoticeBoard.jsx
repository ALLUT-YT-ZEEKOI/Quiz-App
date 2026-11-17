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
  Check
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

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
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

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationRead(notif.id);
                }}
                className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-4 shadow-2xs hover:shadow-md ${
                  notif.pinned
                    ? 'border-teal-500/80 ring-2 ring-teal-500/20'
                    : 'border-slate-200/90 dark:border-slate-800'
                } ${meta.accent} ${!notif.read ? 'bg-teal-50/20 dark:bg-teal-950/10' : ''}`}
              >
                {/* Header row */}
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

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                    {notif.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {notif.message}
                  </p>
                </div>

                {/* Footer with Author and Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
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
