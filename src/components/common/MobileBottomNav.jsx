import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Award,
  BarChart3,
  ShieldCheck,
  Radio,
  Menu
} from 'lucide-react';

export const MobileBottomNav = ({ onMobileMenuToggle }) => {
  const {
    currentRole,
    activeView,
    setActiveView,
    pendingSubscriptionsCount,
    activeExamForAttempt,
    activeMockTest,
    examinations
  } = useApp();

  // If inside active quiz or exam attempt screen, don't show the bottom nav so there's zero distraction
  if (activeView === 'quiz-attempt' || activeView === 'exam-taking' || activeExamForAttempt) return null;
  if (activeView === 'mock-tests' && activeMockTest) return null;

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
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
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

        {/* Three-Line Menu Tab in Footer */}
        <button
          onClick={() => {
            if (onMobileMenuToggle) onMobileMenuToggle();
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
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
  );
};
