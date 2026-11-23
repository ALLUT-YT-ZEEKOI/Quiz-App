import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Shield,
  GraduationCap,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Menu,
  BookOpen,
  X,
  Check,
  Sparkles,
  Link2,
  Copy,
  Radio,
  Megaphone,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export const Navbar = ({ onMobileMenuToggle }) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    darkMode,
    setDarkMode,
    notifications,
    markNotificationsRead,
    markNotificationRead,
    getFilteredNotificationsForUser,
    resetDemoData,
    logout,
    setActiveView,
    setGlobalSearchOpen,
    students,
    copyPortalUrl
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifRef = useRef(null);

  // Close popovers on click outside on desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered notifications specifically for the logged-in persona
  const userNotifs = (getFilteredNotificationsForUser
    ? getFilteredNotificationsForUser(currentUser, currentRole)
    : notifications) || [];

  const unreadNotifs = userNotifs.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white dark:bg-surface-darkCard border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="h-full px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-4 max-w-full">
        {/* Left: Mobile Hamburger & Logo (Only on Mobile) */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onMobileMenuToggle}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0.5 shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <img src="/logo.jpg" alt="CohesionTech Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-navy-900 dark:text-white">
                CohesionTech
              </span>
            </div>
          </div>
        </div>

        {/* Center/Left: Desktop Global Search trigger button (lg and up) */}
        <div className="flex-1 max-w-md mx-2 hidden lg:block min-w-0">
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left shadow-2xs min-w-0"
          >
            <span className="flex items-center gap-2 min-w-0 truncate">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Search subjects, modules, lessons, questions...</span>
            </span>
            <kbd className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs shrink-0 ml-2">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Compact & Optimized for Mobile/Tablet */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile & Tablet search icon button (below lg) */}
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Search"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Active Portal Badge (Production Clean) */}
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all whitespace-nowrap shrink-0 ${
              currentRole === 'teacher'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800/60'
            }`}
          >
            {currentRole === 'teacher' ? (
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {currentRole === 'teacher' ? 'Admin Portal' : 'Student Portal'}
            </span>
            <span className="sm:hidden">
              {currentRole === 'teacher' ? 'Admin' : 'Student'}
            </span>
          </div>

          {/* Notifications Bell */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
              }}
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* Notification Dropdown & Mobile Action Sheet */}
            {notificationsOpen && (
              <>
                {/* Mobile Bottom Sheet for Notifications */}
                <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
                  <div
                    className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="relative bg-white dark:bg-surface-darkCard rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-4 z-10 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
                    <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Notifications
                        </span>
                        {unreadNotifs.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 font-semibold">
                            {unreadNotifs.length} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadNotifs.length > 0 && (
                          <button
                            onClick={markNotificationsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setNotificationsOpen(false)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 flex-1 max-h-72">
                      {userNotifs.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No notifications at this time
                        </div>
                      ) : (
                        userNotifs.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (markNotificationRead) markNotificationRead(item.id);
                              if (item.actionView) {
                                setNotificationsOpen(false);
                                setActiveView(item.actionView);
                              }
                            }}
                            className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${
                              !item.read ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {item.type === 'exam_alert' ? (
                                <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                              ) : item.type === 'urgent' ? (
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                              ) : item.type === 'important' ? (
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              ) : item.type === 'announcement' ? (
                                <Megaphone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center justify-between gap-1">
                                  <span>{item.title}</span>
                                  {!item.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                                  )}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed line-clamp-2">
                                  {item.message}
                                </p>
                                <span className="text-[9px] text-slate-400 mt-1 block font-mono">
                                  {item.time || 'Recently'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom CTA to Notice Board */}
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          setActiveView('notifications');
                        }}
                        className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center justify-center gap-1.5 w-full py-1.5"
                      >
                        <span>Open Full Notice Board & Alerts</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop Popover Panel */}
                <div className="hidden sm:block absolute right-0 mt-2 w-80 max-w-sm bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Notifications
                      </span>
                      {unreadNotifs.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-semibold">
                          {unreadNotifs.length} new
                        </span>
                      )}
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markNotificationsRead}
                        className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {userNotifs.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications at this time
                      </div>
                    ) : (
                      userNotifs.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (markNotificationRead) markNotificationRead(item.id);
                            if (item.actionView) {
                              setNotificationsOpen(false);
                              setActiveView(item.actionView);
                            }
                          }}
                          className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${
                            !item.read ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {item.type === 'exam_alert' ? (
                              <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                            ) : item.type === 'urgent' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            ) : item.type === 'important' ? (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            ) : item.type === 'announcement' ? (
                              <Megaphone className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] flex items-center justify-between gap-1">
                                <span>{item.title}</span>
                                {!item.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed line-clamp-2">
                                {item.message}
                              </p>
                              <span className="text-[9px] text-slate-400 mt-0.5 block font-mono">
                                {item.time || 'Recently'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop CTA to Notice Board */}
                  <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/60 dark:bg-slate-900/60">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        setActiveView('notifications');
                      }}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center justify-center gap-1.5 w-full"
                    >
                      <span>Open Full Notice Board</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
