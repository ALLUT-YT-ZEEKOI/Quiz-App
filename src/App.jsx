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

const AppContent = () => {
  const {
    currentRole,
    activeView,
    setActiveView,
    isAuthenticated
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // If user is logged out, show the login modal / portal
  if (!isAuthenticated) {
    return <AuthModal isOpen={true} />;
  }

  // Streamlined view router: Focused exclusively on Subjects -> Modules -> Videos & Q&A + Results
  const renderCurrentView = () => {
    // If Results view
    if (activeView === 'results') {
      return <CurriculumResults />;
    }

    // Default & Subjects view for Teacher
    if (currentRole === 'teacher') {
      return <TeacherCurriculum />;
    }

    // Default & Subjects view for Student
    return <StudentCurriculum />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-surface-darkBg text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Navbar */}
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Desktop & Drawer Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Content Viewport with mobile bottom safe padding */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-full pb-24 md:pb-8">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Native App Bottom Navigation */}
      <MobileBottomNav />

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
