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
  User,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  HardHat,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) => {
  const {
    currentRole,
    currentUser,
    activeView,
    setActiveView,
    logout,
    curriculumSubjects,
    curriculumAttempts,
    pendingSubscriptionsCount
  } = useApp();

  const teacherNavItems = [
    {
      id: 'subjects',
      label: 'Subjects & Curriculum',
      icon: BookOpen,
      badge: curriculumSubjects?.length || 0
    },
    {
      id: 'subscriptions',
      label: 'Payment Approvals',
      icon: ShieldCheck,
      badge: pendingSubscriptionsCount || 0,
      badgeColor: (pendingSubscriptionsCount > 0) ? 'bg-amber-500 text-white shadow-xs' : undefined
    },
    {
      id: 'results',
      label: 'Quiz Submissions',
      icon: BarChart3,
      badge: curriculumAttempts?.length || 0
    }
  ];

  const studentNavItems = [
    {
      id: 'subjects',
      label: 'My Subjects & Modules',
      icon: BookOpen,
      badge: curriculumSubjects?.length || 0
    },
    {
      id: 'results',
      label: 'My Quiz Results',
      icon: Award,
      badge: (curriculumAttempts || []).filter(
        (a) => a.studentId === (currentUser?.id || 'STU001')
      ).length
    }
  ];

  const navItems = currentRole === 'teacher' ? teacherNavItems : studentNavItems;

  const handleSelectView = (viewId) => {
    setActiveView(viewId);
    if (mobileOpen) setMobileOpen(false);
  };

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col justify-between bg-white dark:bg-surface-darkCard border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Sidebar Header / Department Badge */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  CohesionTech
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Civil Engineering Portal
                </div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          <div
            className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1 ${
              collapsed ? 'text-center' : ''
            }`}
          >
            {collapsed ? '—' : currentRole === 'teacher' ? 'Faculty Menu' : 'Student Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'subjects' && activeView === 'dashboard');

            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-blue-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />

                {!collapsed && (
                  <span className="truncate text-left flex-1">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      item.badgeColor && !isActive
                        ? item.badgeColor
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info Card */}
      <div className="p-3">
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-900 text-white shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Live Prototype
              </span>
            </div>
            <div className="text-xs font-semibold leading-snug">
              CohesionTech Civil Suite
            </div>
            <div className="text-[10px] text-slate-300 leading-normal">
              IS 456:2000 • IS 800 • IRC:73 Standards Embedded
            </div>
            <div className="pt-1 flex items-center justify-between border-t border-slate-700/60 text-[10px] text-slate-400">
              <span>Client: Adithyan</span>
              <span className="font-mono">v2.4 Pro</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <span
              className="w-2 h-2 rounded-full bg-emerald-500"
              title="System Online: Prototype Active"
            />
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-[calc(100vh-4rem)] sticky top-16 z-20 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Overlay Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

