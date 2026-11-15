import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AuthModal } from './components/auth/AuthModal';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDirectory } from './components/teacher/StudentDirectory';
import { QuestionBank } from './components/teacher/QuestionBank';
import { QuizManagement } from './components/teacher/QuizManagement';
import { TeacherResults } from './components/teacher/TeacherResults';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { SubjectDirectory } from './components/student/SubjectDirectory';
import { StudentQuizzes } from './components/student/StudentQuizzes';
import { StudentLeaderboard } from './components/student/StudentLeaderboard';

// Exam & Result Views
import { QuizAttemptScreen } from './components/quiz/QuizAttemptScreen';
import { QuizResultScreen } from './components/quiz/QuizResultScreen';

// Profile
import { ProfileManagement } from './components/profile/ProfileManagement';

const AppContent = () => {
  const {
    currentRole,
    activeView,
    setActiveView,
    isAuthenticated,
    activeQuizForAttempt
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal triggers from dashboard quick actions
  const [triggerAddQuestion, setTriggerAddQuestion] = useState(false);
  const [triggerAddQuiz, setTriggerAddQuiz] = useState(false);
  const [triggerAddStudent, setTriggerAddStudent] = useState(false);

  // If user is logged out, show the login modal / portal
  if (!isAuthenticated) {
    return <AuthModal isOpen={true} />;
  }

  // If currently taking an active assessment, display the distraction-free exam HUD
  if (activeView === 'quiz-attempt' && activeQuizForAttempt) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-surface-darkBg text-slate-800 dark:text-slate-100 flex flex-col">
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
          <QuizAttemptScreen />
        </main>
        <ToastContainer />
      </div>
    );
  }

  // Render view router based on role and activeView
  const renderCurrentView = () => {
    // Shared / Universal views
    if (activeView === 'quiz-result') {
      return <QuizResultScreen />;
    }
    if (activeView === 'profile') {
      return <ProfileManagement />;
    }
    if (activeView === 'subjects') {
      return <SubjectDirectory />;
    }

    // Teacher Portal Views
    if (currentRole === 'teacher') {
      switch (activeView) {
        case 'dashboard':
          return (
            <TeacherDashboard
              onOpenAddQuestion={() => {
                setActiveView('questions');
                setTriggerAddQuestion(true);
              }}
              onOpenAddQuiz={() => {
                setActiveView('quizzes');
                setTriggerAddQuiz(true);
              }}
              onOpenAddStudent={() => {
                setActiveView('students');
                setTriggerAddStudent(true);
              }}
            />
          );
        case 'students':
          return <StudentDirectory />;
        case 'questions':
          return (
            <QuestionBank
              initialOpenAdd={triggerAddQuestion}
              onCloseAdd={() => setTriggerAddQuestion(false)}
            />
          );
        case 'quizzes':
          return (
            <QuizManagement
              initialOpenCreate={triggerAddQuiz}
              onCloseCreate={() => setTriggerAddQuiz(false)}
            />
          );
        case 'results':
          return <TeacherResults />;
        default:
          return <TeacherDashboard />;
      }
    }

    // Student Portal Views
    switch (activeView) {
      case 'dashboard':
        return <StudentDashboard />;
      case 'quizzes':
        return <StudentQuizzes />;
      case 'results':
        return <QuizResultScreen />;
      case 'leaderboard':
        return <StudentLeaderboard />;
      default:
        return <StudentDashboard />;
    }
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
