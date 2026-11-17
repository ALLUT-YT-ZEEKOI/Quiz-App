import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileQuestion,
  BarChart3,
  Layers,
  Settings,
  ShieldCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) => {
  const {
    currentRole,
    currentUser,
    activeView,
    setActiveView,
    curriculumSubjects,
    curriculumAttempts,
    pendingSubscriptionsCount,
    showToast
  } = useApp();

  const teacherNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      targetView: 'subjects'
    },
    {
      id: 'subjects',
      label: 'Subjects & Curriculum',
      icon: BookOpen,
      targetView: 'subjects',
      badge: curriculumSubjects?.length || 0
    },
    {
      id: 'students',
      label: 'Student Management',
      icon: Users,
      targetView: 'subscriptions',
      badge: pendingSubscriptionsCount || undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'quizzes',
      label: 'Quiz & Assessments',
      icon: FileQuestion,
      targetView: 'results',
      badge: curriculumAttempts?.length || undefined
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      targetView: 'results'
    },
    {
      id: 'content',
      label: 'Content Library',
      icon: Layers,
      targetView: 'subjects'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => showToast('Settings panel available in system configuration', 'info')
    }
  ];

  const studentNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      targetView: 'subjects'
    },
    {
      id: 'subjects',
      label: 'Subjects & Curriculum',
      icon: BookOpen,
      targetView: 'subjects',
      badge: curriculumSubjects?.length || 0
    },
    {
      id: 'quizzes',
      label: 'Quiz & Assessments',
      icon: Award,
      targetView: 'results',
      badge: (curriculumAttempts || []).filter(
        (a) => a.studentId === (currentUser?.id || 'STU001')
      ).length || undefined
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      targetView: 'results'
    },
    {
      id: 'content',
      label: 'Content Library',
      icon: Layers,
      targetView: 'subjects'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => showToast('Student preferences configured', 'info')
    }
  ];

  const navItems = currentRole === 'teacher' ? teacherNavItems : studentNavItems;

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.targetView) {
      setActiveView(item.targetView);
    }
    if (mobileOpen) setMobileOpen(false);
  };

  const isItemActive = (item) => {
    if (item.id === 'subjects' && activeView === 'subjects') return true;
    if (item.id === 'dashboard' && activeView === 'dashboard') return true;
    if (item.id === 'students' && activeView === 'subscriptions') return true;
    if ((item.id === 'quizzes' || item.id === 'reports') && activeView === 'results') return true;
    return false;
  };

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col justify-between bg-[#0A1A1E] text-slate-300 border-r border-[#15343C] relative overflow-hidden select-none transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Background Watermark Geometric C Logo */}
      <div className="absolute -bottom-10 -left-10 w-64 h-64 pointer-events-none opacity-[0.04] text-cyan-400">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="210 70" />
          <path d="M50 20 A30 30 0 1 0 80 50" fill="none" stroke="currentColor" strokeWidth="8" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#15343C]/80">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#102B32] border border-cyan-500/30 p-1 flex items-center justify-center shrink-0 shadow-sm">
              <img src="/logo.jpg" alt="CohesionTech" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white leading-snug">
                  CohesionTech
                </h1>
                <p className="text-xs font-semibold text-teal-400 leading-none mt-0.5">
                  Learning Suite
                </p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#13353D] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  active
                    ? 'bg-[#13353D] text-white border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#0F282F] border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate text-left flex-1">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      item.badgeColor
                        ? item.badgeColor
                        : active
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-[#15343C] text-slate-300'
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

      {/* Bottom Live Prototype Card */}
      <div className="p-3 relative z-10">
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-[#071518]/90 border border-[#14343C] text-slate-300 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE PROTOTYPE</span>
            </div>
            <div className="text-xs font-bold text-slate-200">
              CohesionTech LMS v2.0.0
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Build: 2025.01.27
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Environment: Staging
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="CohesionTech LMS Live Prototype">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Full Height) */}
      <div className="hidden md:block h-screen sticky top-0 z-20 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Overlay Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/75 backdrop-blur-xs transition-opacity"
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
