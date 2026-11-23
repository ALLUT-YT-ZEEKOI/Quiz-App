import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AuthModal } from './components/auth/AuthModal';

// Streamlined Curriculum Components (Subjects -> Modules -> Videos & Q&A)
import { TeacherCurriculum } from './components/curriculum/TeacherCurriculum';
import { StudentCurriculum } from './components/curriculum/StudentCurriculum';
import { CurriculumResults } from './components/curriculum/CurriculumResults';
import { AdminSubscriptions } from './components/curriculum/AdminSubscriptions';

// Live & Scheduled Examination Module
import { ExaminationsMain } from './components/examinations/ExaminationsMain';

// Announcements & Notifications Module
import { AdminNotificationDashboard } from './components/notifications/AdminNotificationDashboard';
import { StudentNoticeBoard } from './components/notifications/StudentNoticeBoard';

// Profile Management
import { ProfileManagement } from './components/profile/ProfileManagement';

// Answer review, subject marks, retests & doubts
import { StudentAnswersDashboard } from './components/review/StudentAnswersDashboard';
import { AdminAnswersDashboard } from './components/review/AdminAnswersDashboard';
import { DoubtsDashboard } from './components/doubts/DoubtsDashboard';
import { StudentRegistrations } from './components/students/StudentRegistrations';
import { DataImportBanner, ServerLoadingScreen } from './components/admin/DataImportBanner';

const AppContent = () => {
  const {
    currentRole,
    activeView,
    setActiveView,
    isAuthenticated,
    backendEnabled,
    dataReady,
    loadError,
    loadServerData,
    serverInitialized,
    logout
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // If user is logged out, show the login modal / portal
  if (!isAuthenticated) {
    return <AuthModal isOpen={true} />;
  }

  // Backend mode: wait for this user's data from the server
  if (backendEnabled && !dataReady) {
    return (
      <ServerLoadingScreen
        error={loadError}
        onRetry={() => loadServerData().catch(() => {})}
        onSignOut={logout}
      />
    );
  }

  // Streamlined view router: Focused exclusively on Subjects -> Modules -> Videos & Q&A + Live Examinations + Results + Approvals
  const renderCurrentView = () => {
    // If Live Examinations view or Student is taking an exam
    if (activeView === 'examinations' || activeView === 'live-exams') {
      return <ExaminationsMain />;
    }

    // If Results view
    if (activeView === 'results') {
      return <CurriculumResults />;
    }

    // If Announcements & Notifications view
    if (activeView === 'notifications' || activeView === 'announcements') {
      if (currentRole === 'teacher' || currentRole === 'admin') {
        return <AdminNotificationDashboard />;
      }
      return <StudentNoticeBoard />;
    }

    // If Payment Approvals view (Admin only)
    if (activeView === 'subscriptions') {
      return <AdminSubscriptions />;
    }

    // Marks & Answers (student) / Student Answers (admin)
    if (activeView === 'review' || activeView === 'answers') {
      return currentRole === 'teacher' || currentRole === 'admin'
        ? <AdminAnswersDashboard />
        : <StudentAnswersDashboard />;
    }

    // Registered students (admin only)
    if (activeView === 'registrations' && (currentRole === 'teacher' || currentRole === 'admin')) {
      return <StudentRegistrations />;
    }

    // Doubts: students ask, admin replies
    if (activeView === 'doubts') {
      return <DoubtsDashboard />;
    }

    // Institutional Profile & Account Settings view
    if (activeView === 'profile') {
      return <ProfileManagement />;
    }

    // Default & Subjects view for Teacher
    if (currentRole === 'teacher') {
      return <TeacherCurriculum />;
    }

    // Default & Subjects view for Student
    return <StudentCurriculum />;
  };

  return (
    <div className="h-screen bg-[#F4F7F8] dark:bg-surface-darkBg text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors">
      {/* Left Desktop & Drawer Sidebar (Deep Teal #0A1A1E) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Right Area: Top Navbar + Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-full pb-24 md:pb-8">
          <div className="max-w-[1600px] w-full mx-auto">
            
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Mobile Native App Bottom Navigation */}
      <MobileBottomNav onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      {/* Global Overlays */}
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
