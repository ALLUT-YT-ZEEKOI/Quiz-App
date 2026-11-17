import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Award,
  BarChart3,
  ShieldCheck,
  Radio,
  Menu,
  User,
  Sun,
  Moon,
  RefreshCw,
  LogOut,
  X
} from 'lucide-react';

export const MobileBottomNav = ({ onMobileMenuToggle }) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    activeView,
    setActiveView,
    pendingSubscriptionsCount,
    activeExamForAttempt,
    examinations,
    darkMode,
    setDarkMode,
    resetDemoData,
    logout
  } = useApp();

  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  // If inside active quiz or exam attempt screen, don't show the bottom nav so there's zero distraction
  if (activeView === 'quiz-attempt' || activeView === 'exam-taking' || activeExamForAttempt) return null;

  const liveCount = (examinations || []).filter((e) => e.status === 'Live Now').length;

  const teacherItems = [
    { id: 'subjects', label: 'Curriculum', icon: BookOpen },
    {
      id: 'subscriptions',
      label: 'Approvals',
      icon: ShieldCheck,
      badge: pendingSubscriptionsCount > 0 ? pendingSubscriptionsCount : null
    },
    {
      id: 'examinations',
      label: 'Live Exams',
      icon: Radio,
      badge: liveCount > 0 ? 'Live' : null
    },
    { id: 'results', label: 'Results', icon: BarChart3 }
  ];

  const studentItems = [
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    {
      id: 'examinations',
      label: 'Live Exams',
      icon: Radio,
      badge: liveCount > 0 ? 'Live' : null
    },
    { id: 'results', label: 'My Results', icon: Award }
  ];

  const navItems = currentRole === 'teacher' ? teacherItems : studentItems;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-darkCard/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-colors">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Main Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeView === item.id || (item.id === 'subjects' && activeView === 'dashboard');

            return (
              <button
                key={item.id}
                onClick={() => {
                  setProfileSheetOpen(false);
                  setActiveView(item.id);
                }}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <div className="relative">
                  <div
                    className={`p-1 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                  </div>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1.5 bg-amber-500 text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-mono shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* Profile Tab in Footer */}
          <button
            onClick={() => setProfileSheetOpen(!profileSheetOpen)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              profileSheetOpen || activeView === 'profile'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
            aria-label="User Profile"
          >
            <div className="relative">
              <div
                className={`p-0.5 rounded-xl transition-all ${
                  profileSheetOpen || activeView === 'profile'
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser?.name || 'User'}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <User className="w-5 h-5 flex-shrink-0" />
                )}
              </div>
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-tight">
              Profile
            </span>
            {(profileSheetOpen || activeView === 'profile') && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
            )}
          </button>

          {/* Three-Line Menu Tab in Footer */}
          <button
            onClick={() => {
              setProfileSheetOpen(false);
              if (onMobileMenuToggle) onMobileMenuToggle();
            }}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            aria-label="Navigation Menu"
          >
            <div className="p-1 rounded-xl transition-all">
              <Menu className="w-5 h-5 flex-shrink-0" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-tight">
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Profile Bottom Sheet */}
      {profileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setProfileSheetOpen(false)}
          />

          {/* Action Sheet Card */}
          <div className="relative bg-white dark:bg-surface-darkCard rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-5 z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            {/* Profile Info Header */}
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
                onClick={() => setProfileSheetOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Actions */}
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  switchRole(currentRole === 'teacher' ? 'student' : 'teacher');
                  setProfileSheetOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 text-xs rounded-xl bg-teal-50/60 hover:bg-teal-100/60 dark:bg-teal-950/30 dark:hover:bg-teal-950/50 text-teal-900 dark:text-teal-200 border border-teal-200/60 dark:border-teal-800/60 transition-colors"
              >
                <span className="flex items-center gap-3 font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>
                    Switch to {currentRole === 'teacher' ? 'Student Portal' : 'Faculty Portal'}
                  </span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                  Switch
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveView('profile');
                  setProfileSheetOpen(false);
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
                  setProfileSheetOpen(false);
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
                    setProfileSheetOpen(false);
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
      )}
    </>
  );
};
