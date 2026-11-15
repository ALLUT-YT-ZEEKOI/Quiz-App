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
  BookOpen
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
    resetDemoData,
    logout,
    setGlobalSearchOpen,
    setActiveView,
    students
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const roleRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white dark:bg-surface-darkCard border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="h-full px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-4 max-w-full">
        {/* Left: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-navy-900 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="font-extrabold text-base sm:text-lg tracking-wider">Q</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-navy-900 dark:text-white">
                  QSAP
                </span>
                {/* Clean, non-wrapping badge hidden on small mobile, visible on sm+ */}
                <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                  Civil Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden lg:block leading-none mt-0.5">
                Civil Engineering Assessment Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: Desktop Global Search trigger button */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search subjects, quizzes, students, questions...</span>
            </span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Compact & Optimized for Mobile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile search icon button */}
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="sm:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Role Switcher Pill */}
          <div className="relative shrink-0" ref={roleRef}>
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all whitespace-nowrap shrink-0 ${
                currentRole === 'teacher'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100'
              }`}
            >
              {currentRole === 'teacher' ? (
                <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {currentRole === 'teacher' ? 'Faculty Portal' : 'Student Portal'}
              </span>
              <span className="sm:hidden">
                {currentRole === 'teacher' ? 'Faculty' : 'Student'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70 shrink-0" />
            </button>

            {/* Role Switcher Dropdown (Responsive Width on Mobile) */}
            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-64 max-w-xs bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Switch Active Role
                </div>

                {/* Switch to Teacher Option */}
                <div
                  onClick={() => {
                    switchRole('teacher', 'T001');
                    setRoleSwitcherOpen(false);
                  }}
                  className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                    currentRole === 'teacher'
                      ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-950 dark:text-amber-200 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mt-0.5 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Teacher / Faculty</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Dr. Rajesh Sharma (HOD)
                    </div>
                  </div>
                </div>

                {/* Switch to Student Option */}
                <div
                  onClick={() => {
                    switchRole('student', 'STU001');
                    setRoleSwitcherOpen(false);
                  }}
                  className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors mt-1 ${
                    currentRole === 'student'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-950 dark:text-blue-200 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mt-0.5 shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Student Account</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Adithyan S. (CE-2022-001)
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <div className="text-[10px] text-slate-400 px-2 pb-1 font-medium">
                    Other Test Students:
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-0.5">
                    {students.slice(1, 4).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          switchRole('student', st.id);
                          setRoleSwitcherOpen(false);
                        }}
                        className="w-full text-left px-2 py-1 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-between"
                      >
                        <span className="truncate">{st.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{st.semester}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
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

            {/* Notification Dropdown Panel (Responsive on Mobile) */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadNotifs.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 font-semibold">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markNotificationsRead}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          !item.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {item.type === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          ) : item.type === 'danger' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-[11px]">
                              {item.title}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                              {item.message}
                            </p>
                            <span className="text-[9px] text-slate-400 mt-0.5 block font-mono">
                              {item.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle (Visible on min 380px or inside profile menu on ultra-small screens) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden min-[380px]:flex p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* User Profile Avatar & Menu */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 p-0.5 sm:p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="User profile"
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl object-cover ring-2 ring-blue-500/30 shrink-0"
              />
              <span className="hidden lg:block text-left">
                <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser?.name}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize">
                  {currentRole}
                </span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveView('profile');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile & Settings</span>
                </button>

                {/* Dark Mode Toggle item in menu for mobile */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {darkMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    resetDemoData();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>Reset Demo Data</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
