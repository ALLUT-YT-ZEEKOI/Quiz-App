import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  FileQuestion,
  BarChart3,
  BookOpen,
  Award,
  Trophy,
  User
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { currentRole, activeView, setActiveView } = useApp();

  // If inside active quiz attempt screen, don't show the bottom nav so there's zero distraction
  if (activeView === 'quiz-attempt') return null;

  const teacherItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'questions', label: 'Q-Bank', icon: HelpCircle },
    { id: 'quizzes', label: 'Quizzes', icon: FileQuestion },
    { id: 'results', label: 'Results', icon: BarChart3 }
  ];

  const studentItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'quizzes', label: 'Tests', icon: Award },
    { id: 'leaderboard', label: 'Rankings', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const navItems = currentRole === 'teacher' ? teacherItems : studentItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-darkCard/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-colors">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

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
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
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
      </div>
    </nav>
  );
};

