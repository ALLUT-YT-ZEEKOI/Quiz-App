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
  Copy
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
    setActiveView,
    setGlobalSearchOpen,
    students,
    copyPortalUrl
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const roleRef = useRef(null);

  // Close popovers on click outside on desktop
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
              <span className="font-extrabold text-base sm:text-lg tracking-wider">C</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-navy-900 dark:text-white">
                  CohesionTech
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
              onClick={() => {
                setRoleSwitcherOpen(!roleSwitcherOpen);
                setNotificationsOpen(false);
                setProfileDropdownOpen(false);
              }}
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
                {currentRole === 'teacher' ? 'Admin Portal' : 'Student Portal'}
              </span>
              <span className="sm:hidden">
                {currentRole === 'teacher' ? 'Admin' : 'Student'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70 shrink-0" />
            </button>

            {/* Role Switcher Elements */}
            {roleSwitcherOpen && (
              <>
                {/* ============================================================ */}
                {/* MOBILE BOTTOM SHEET (Prevents clipping & offscreen alignment) */}
                {/* ============================================================ */}
                <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setRoleSwitcherOpen(false)}
                  />

                  {/* Action Sheet Card */}
                  <div className="relative bg-white dark:bg-surface-darkCard rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-5 z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
                    <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          Switch Active Persona
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Instantly test Teacher and Student dashboards
                        </p>
                      </div>
                      <button
                        onClick={() => setRoleSwitcherOpen(false)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2.5 mb-4">
                      {/* Teacher / Faculty Option */}
                      <button
                        type="button"
                        onClick={() => {
                          switchRole('teacher', 'T001');
                          setRoleSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                          currentRole === 'teacher'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold shrink-0">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              Dr. Rajesh Sharma
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded">
                                Admin / Faculty
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              HOD Structural • ID: admin (Pass: admin)
                            </div>
                          </div>
                        </div>
                        {currentRole === 'teacher' && (
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>

                      {/* Student Account: Adithyan */}
                      <button
                        type="button"
                        onClick={() => {
                          switchRole('student', 'STU001');
                          setRoleSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                          currentRole === 'student' && currentUser?.id === 'STU001'
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold shrink-0">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              Adithyan S.
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded">
                                Student
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Semester 6 • ID: student (Pass: student)
                            </div>
                          </div>
                        </div>
                        {currentRole === 'student' && currentUser?.id === 'STU001' && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Quick Switch to Other Test Students */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Other Test Students:
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {students.slice(1, 4).map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              switchRole('student', st.id);
                              setRoleSwitcherOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left ${
                              currentRole === 'student' && currentUser?.id === st.id
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={st.avatar}
                                alt={st.name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                              />
                              <div>
                                <div className="text-xs font-semibold">{st.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {st.department} • CGPA {st.cgpa}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {st.semester}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Direct Dashboard URLs with Copy buttons (Mobile) */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Link2 className="w-3.5 h-3.5 text-blue-500" />
                          Dedicated Dashboard URLs
                        </span>
                        <span className="text-[9px] text-blue-500 font-semibold">1-Click Copy</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Admin Dashboard</div>
                              <code className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">/admin (admin / admin)</code>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyPortalUrl('teacher');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/80 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/50 flex items-center gap-1 shadow-2xs"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Student Dashboard</div>
                              <code className="text-[10px] text-blue-700 dark:text-blue-300 font-mono">/student (student / student)</code>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyPortalUrl('student');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/80 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 flex items-center gap-1 shadow-2xs"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* DESKTOP POPOVER DROPDOWN (sm and above, perfectly anchored)   */}
                {/* ============================================================ */}
                <div className="hidden sm:block absolute right-0 mt-2 w-72 bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                    <span>Switch Active Role</span>
                    <span className="text-emerald-600 font-medium text-[9px]">1-Click Demo</span>
                  </div>

                  {/* Switch to Teacher Option */}
                  <div
                    onClick={() => {
                      switchRole('teacher', 'T001');
                      setRoleSwitcherOpen(false);
                    }}
                    className={`flex items-start justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      currentRole === 'teacher'
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-950 dark:text-amber-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mt-0.5 shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Admin / Faculty Dashboard</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Dr. Rajesh Sharma • ID: admin (Pass: admin)
                        </div>
                      </div>
                    </div>
                    {currentRole === 'teacher' && <Check className="w-4 h-4 text-amber-600 mt-1 shrink-0" />}
                  </div>

                  {/* Switch to Student Option */}
                  <div
                    onClick={() => {
                      switchRole('student', 'STU001');
                      setRoleSwitcherOpen(false);
                    }}
                    className={`flex items-start justify-between p-2.5 rounded-xl cursor-pointer transition-colors mt-1 ${
                      currentRole === 'student' && currentUser?.id === 'STU001'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-950 dark:text-blue-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mt-0.5 shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Student Dashboard</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Adithyan S. • ID: student (Pass: student)
                        </div>
                      </div>
                    </div>
                    {currentRole === 'student' && currentUser?.id === 'STU001' && (
                      <Check className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1.5">
                    <div className="text-[10px] text-slate-400 px-2 pb-1 font-medium">
                      Other Test Students:
                    </div>
                    <div className="max-h-28 overflow-y-auto space-y-0.5">
                      {students.slice(1, 4).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            switchRole('student', st.id);
                            setRoleSwitcherOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${
                            currentRole === 'student' && currentUser?.id === st.id
                              ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{st.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{st.semester}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct URLs Card (Desktop) */}
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-2 px-1">
                    <div className="text-[10px] text-slate-400 pb-1.5 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-blue-500" /> Dedicated URLs
                      </span>
                      <span className="text-[9px] text-blue-500 font-medium">Direct Links</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 text-[11px]">
                        <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-amber-600" /> /admin
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyPortalUrl('teacher');
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-2.5 h-2.5" /> Copy
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 text-[11px]">
                        <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-blue-600" /> /student
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyPortalUrl('student');
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-2.5 h-2.5" /> Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setRoleSwitcherOpen(false);
                setProfileDropdownOpen(false);
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
                            <div className="flex items-start gap-2.5">
                              {item.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              ) : item.type === 'danger' ? (
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
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
                </div>

                {/* Desktop Popover Panel */}
                <div className="hidden sm:block absolute right-0 mt-2 w-80 max-w-sm bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
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
              </>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
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
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setRoleSwitcherOpen(false);
                setNotificationsOpen(false);
              }}
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

            {/* Profile Dropdown & Mobile Action Sheet */}
            {profileDropdownOpen && (
              <>
                {/* Mobile Bottom Sheet for Profile Menu */}
                <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
                  <div
                    className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="relative bg-white dark:bg-surface-darkCard rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-5 z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
                    <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser?.avatar}
                          alt={currentUser?.name}
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/30"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {currentUser?.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {currentUser?.email}
                          </div>
                          <span className="inline-block mt-0.5 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            {currentRole === 'teacher' ? 'Faculty Member' : 'Student Account'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setProfileDropdownOpen(false)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          setActiveView('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">My Profile & Settings</span>
                      </button>

                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full flex items-center justify-between p-3 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <span className="flex items-center gap-3 font-semibold">
                          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                          <span>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {darkMode ? 'DARK' : 'LIGHT'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          resetDemoData();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">Reset Demo Data</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 text-xs rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Popover */}
                <div className="hidden sm:block absolute right-0 mt-2 w-56 sm:w-60 bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
