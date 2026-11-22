import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Megaphone,
  Radio,
  AlertCircle,
  AlertTriangle,
  Pin,
  Search,
  ChevronRight,
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

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const studentNotifs = useMemo(() => {
    return getFilteredNotificationsForUser(currentUser, 'student');
  }, [getFilteredNotificationsForUser, currentUser]);

  const unreadCount = studentNotifs.filter((n) => !n.read).length;

  const filteredList = useMemo(() => {
    return studentNotifs
      .filter((n) => {
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
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [studentNotifs, activeTab, searchQuery]);

  const getTypeMeta = (type) => {
    switch (type) {
      case 'exam_alert':
        return {
          label: 'Exam',
          icon: Radio,
          badgeBg:
            'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800',
          accent: 'border-l-4 border-l-cyan-500'
        };
      case 'urgent':
        return {
          label: 'Urgent',
          icon: AlertTriangle,
          badgeBg:
            'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800',
          accent: 'border-l-4 border-l-red-500'
        };
      case 'important':
        return {
          label: 'Important',
          icon: AlertCircle,
          badgeBg:
            'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800',
          accent: 'border-l-4 border-l-amber-500'
        };
      default:
        return {
          label: 'Notice',
          icon: Megaphone,
          badgeBg:
            'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800',
          accent: 'border-l-4 border-l-[#087F8C]'
        };
    }
  };

  const tabs = [
    { id: 'All', short: 'All', label: `All (${studentNotifs.length})` },
    { id: 'exam_alert', short: 'Exams', label: 'Exam Alerts' },
    { id: 'announcement', short: 'Faculty', label: 'Faculty Notices' },
    { id: 'urgent', short: 'Urgent', label: 'Urgent' }
  ];

  return (
    <div className="space-y-3 sm:space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Compact mobile header · fuller desktop banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-3.5 sm:p-8 text-white border border-[#145663]/60 shadow-premium sm:shadow-[0_8px_32px_rgba(4,20,24,0.35)]">
        <div className="absolute -right-10 -top-10 w-36 h-36 sm:w-64 sm:h-64 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-1 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              <Bell className="w-3 h-3 shrink-0" />
              <span className="sm:hidden">Notifications</span>
              <span className="hidden sm:inline">Official Student Notice Board</span>
            </div>
            <h1 className="text-base sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
              <span className="sm:hidden">Notices</span>
              <span className="hidden sm:inline">Announcements & Circulars</span>
            </h1>
            <p className="hidden sm:block text-sm text-slate-300 max-w-2xl leading-relaxed">
              Academic updates, scheduled examination reminders, and department circulars published by faculty for{' '}
              <strong>{currentUser?.name || 'Student'}</strong> ({currentUser?.batch || '2022-2026'}).
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markNotificationsRead}
              className="shrink-0 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#092B32] hover:bg-[#0E3B44] text-[#2DD4BF] border border-[#20B8C7]/50 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">Read all</span>
              <span className="hidden sm:inline">Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters — simple on mobile */}
      <div className="flex flex-col gap-3 sm:gap-3.5 p-3 sm:p-3.5 md:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium">
        {/* All tabs in one row on mobile */}
        <div className="grid grid-cols-4 gap-1 p-1 sm:p-1.5 rounded-xl bg-[#E8F3F4] dark:bg-slate-800/80 border border-[#087F8C]/15 dark:border-slate-700/60 text-[11px] sm:text-xs font-bold">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[2.5rem] px-2.5 sm:px-3 py-2 rounded-xl transition-all flex items-center justify-center ${
                activeTab === tab.id
                  ? 'bg-[#087F8C] text-white shadow-md shadow-[#087F8C]/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#07242B] hover:bg-white/70 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="md:hidden truncate">{tab.short}</span>
              <span className="hidden md:inline truncate whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 shadow-subtle focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]/50"
            />
          </div>

          {/* View toggle — desktop only */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-[#087F8C] dark:text-[#2DD4BF] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-[#087F8C] dark:text-[#2DD4BF] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px]">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: simple notification feed · Desktop: grid/list */}
      <div
        className={
          viewMode === 'grid'
            ? 'hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
            : 'hidden sm:block space-y-3'
        }
      >
        {filteredList.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Notices Available</h3>
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

                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-2 break-words">
                        {notif.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 break-words">
                        {notif.message}
                      </p>
                    </div>

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
                        <span>PINNED</span>
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
                  <span className="text-[11px] text-slate-400 font-mono">{notif.time || 'Recently'}</span>
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
                      <span className="text-[10px] text-slate-400">{notif.authorRole || 'Faculty'}</span>
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

      {/* ===== MOBILE — 1 card per row ===== */}
      <div className="sm:hidden grid grid-cols-1 gap-3">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">No notices</h3>
            <p className="text-[11px] text-slate-400">You&apos;re all caught up.</p>
          </div>
        ) : (
          filteredList.map((notif) => {
            const meta = getTypeMeta(notif.type);
            const Icon = meta.icon;

            return (
              <button
                key={notif.id}
                type="button"
                onClick={() => {
                  if (!notif.read) markNotificationRead(notif.id);
                  if (notif.actionView) setActiveView(notif.actionView);
                }}
                className={`w-full h-full text-left p-3 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-subtle active:scale-[0.99] flex flex-col gap-2 ${
                  notif.pinned
                    ? 'border-[#087F8C]/50'
                    : 'border-slate-200/90 dark:border-slate-800'
                } ${!notif.read ? 'bg-[#E8F3F4]/60 dark:bg-teal-950/10' : ''}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="relative shrink-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border ${meta.badgeBg}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {!notif.read && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    {notif.pinned && (
                      <Pin className="w-3 h-3 text-teal-600 fill-current rotate-45 shrink-0" />
                    )}
                    <span className="text-[9px] text-slate-400 font-medium shrink-0">
                      {notif.time || 'Now'}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#087F8C] dark:text-teal-300 truncate">
                  {meta.label}
                </span>

                <h3 className="font-extrabold text-[12px] text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {notif.title}
                </h3>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">
                  {notif.message}
                </p>

                {notif.actionLabel && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#087F8C] dark:text-teal-300">
                    {notif.actionLabel}
                    <ChevronRight className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
