import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Users,
  FileQuestion,
  Award,
  Radio,
  ChevronLeft,
  ChevronRight,
  X,
  Megaphone,
  Bell,
  User,
  LogOut
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
    examinations,
    notifications,
    showToast,
    logout
  } = useApp();

  const liveExamsCount = (examinations || []).filter((e) => e.status === 'Live Now').length;
  const unreadNotifsCount = (notifications || []).filter((n) => !n.read).length;

  const studentNotifs = (notifications || []).filter((n) => {
    if (n.forRole === 'teacher') return false;
    if (n.targetAudience === 'students') {
      return Array.isArray(n.targetStudentIds) && n.targetStudentIds.includes(currentUser?.id || 'STU001');
    }
    if (n.targetAudience === 'batch') {
      if (n.targetBatch && n.targetBatch !== 'All' && currentUser?.batch && n.targetBatch !== currentUser.batch) return false;
      return true;
    }
    return true;
  });
  const studentUnreadCount = studentNotifs.filter((n) => !n.read).length;

  const teacherNavItems = [
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
      id: 'examinations',
      label: 'Live Examinations',
      icon: Radio,
      targetView: 'examinations',
      badge: liveExamsCount > 0 ? `${liveExamsCount} Live` : undefined,
      badgeColor: 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse'
    },
    {
      id: 'quizzes',
      label: 'Quiz & Assessments',
      icon: FileQuestion,
      targetView: 'results',
      badge: curriculumAttempts?.length || undefined
    },
    {
      id: 'notifications',
      label: 'Announcements & Alerts',
      icon: Megaphone,
      targetView: 'notifications',
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-teal-500 text-white'
    },
    {
      id: 'profile',
      label: 'My Profile & Settings',
      icon: User,
      targetView: 'profile'
    }
  ];

  const studentNavItems = [
    {
      id: 'subjects',
      label: 'Subjects & Curriculum',
      icon: BookOpen,
      targetView: 'subjects',
      badge: curriculumSubjects?.length || 0
    },
    {
      id: 'examinations',
      label: 'Live Examinations',
      icon: Radio,
      targetView: 'examinations',
      badge: liveExamsCount > 0 ? `${liveExamsCount} Live` : undefined,
      badgeColor: 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse'
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
      id: 'notifications',
      label: 'Notice Board',
      icon: Bell,
      targetView: 'notifications',
      badge: studentUnreadCount > 0 ? studentUnreadCount : undefined,
      badgeColor: 'bg-teal-500 text-white'
    },
    {
      id: 'profile',
      label: 'My Profile & Settings',
      icon: User,
      targetView: 'profile'
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
    if (item.id === 'subjects' && (activeView === 'subjects' || activeView === 'dashboard')) return true;
    if (item.id === 'students' && activeView === 'subscriptions') return true;
    if (item.id === 'examinations' && activeView === 'examinations') return true;
    if (item.id === 'quizzes' && activeView === 'results') return true;
    if (item.id === 'notifications' && (activeView === 'notifications' || activeView === 'announcements')) return true;
    if (item.id === 'profile' && activeView === 'profile') return true;
    return false;
  };

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col justify-between bg-gradient-to-b from-[#092227] via-[#0A262C] to-[#07191E] text-slate-200 border-r border-[#14424D]/80 relative overflow-hidden select-none transition-all duration-300 shadow-[4px_0_24px_rgba(4,20,24,0.4)] ${
        collapsed ? 'w-20' : 'w-64 sm:w-[268px]'
      }`}
    >
      <div className="relative z-10">
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#14424D]/60">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-[#0A242B] border border-[#20B8C7]/40 p-1 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(32,184,199,0.2)]">
              <img src="/logo.jpg" alt="CohesionTech" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white leading-snug">
                  CohesionTech
                </h1>
                <p className="text-xs font-semibold text-[#2DD4BF] leading-none mt-0.5">
                  Learning Suite
                </p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#0E353E] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu List */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                  active
                    ? 'bg-gradient-to-r from-[#0C4E5B] to-[#125B69] text-white border border-[#20B8C7]/50 shadow-[0_4px_16px_rgba(20,184,166,0.25)]'
                    : 'text-[#9BB7BE] hover:text-white hover:bg-[#0E323A]/70 border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-white' : 'text-[#6B919A] group-hover:text-slate-200'
                  }`}
                />

                {!collapsed && (
                  <span className={`text-left flex-1 whitespace-nowrap ${active ? 'font-bold text-white text-[13px]' : 'text-xs text-[#9BB7BE] group-hover:text-white'}`}>
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono shrink-0 ${
                      item.badgeColor
                        ? item.badgeColor
                        : active
                        ? 'bg-white/20 text-white'
                        : 'bg-[#10343D] text-[#86A8B0]'
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

      {/* User Profile Card & Sign Out */}
      <div className="px-3 pt-2 relative z-10">
        <div
          className={`flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#061B20]/60 border border-[#144752]/70 ${
            collapsed ? 'justify-center p-1.5' : ''
          }`}
        >
          <button
            onClick={() => {
              setActiveView('profile');
              if (mobileOpen) setMobileOpen(false);
            }}
            className={`flex items-center gap-2.5 min-w-0 flex-1 text-left ${
              collapsed ? 'justify-center' : ''
            }`}
            title="My Profile & Settings"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#20B8C7]/40 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#0E353E] text-[#2DD4BF] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Account'}
                </div>
                <div className="text-[10px] text-[#2DD4BF] font-medium capitalize truncate">
                  {currentRole === 'teacher' ? 'Faculty Member' : 'Student Account'}
                </div>
              </div>
            )}
          </button>

          {!collapsed && (
            <button
              onClick={() => {
                logout();
                if (mobileOpen) setMobileOpen(false);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Live Prototype Card */}
      <div className="p-3 relative z-10">
        {!collapsed ? (
          <div className="p-3.5 rounded-2xl bg-[#061B20]/90 border border-[#144752] text-slate-300 shadow-sm space-y-1 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#10B981] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>LIVE PROTOTYPE</span>
            </div>
            <div className="text-xs font-bold text-white">
              CohesionTech LMS v2.0.0
            </div>
            <div className="text-[10px] text-[#70959E] font-mono">
              Build: 2025.01.27
            </div>
            <div className="text-[10px] text-[#70959E] font-mono">
              Environment: Staging
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="CohesionTech LMS Live Prototype">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
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
