import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamDashboard } from './ExamDashboard';
import { CreateExamWizard } from './CreateExamWizard';
import { LiveMonitoring } from './LiveMonitoring';
import { ExamResultsAnalytics } from './ExamResultsAnalytics';
import { StudentExamsList } from './StudentExamsList';
import { StudentLiveExam } from './StudentLiveExam';
import { StudentExamResult } from './StudentExamResult';

export const ExaminationsMain = () => {
  const {
    currentRole,
    currentUser,
    activeExamForAttempt,
    setActiveExamForAttempt,
    startStudentExam,
    lastExamResult,
    setLastExamResult
  } = useApp();

  // Internal Teacher Navigation: 'dashboard', 'create', 'monitoring', 'analytics'
  const [teacherSubView, setTeacherSubView] = useState('dashboard');
  const [selectedMonitoringExamId, setSelectedMonitoringExamId] = useState('EXAM-2026-001');
  const [selectedAnalyticsExamId, setSelectedAnalyticsExamId] = useState('EXAM-2026-006');

  // Internal Student Navigation: 'list', 'result'
  const [studentSubView, setStudentSubView] = useState('list');
  const [viewingResultAttempt, setViewingResultAttempt] = useState(null);

  // If student is currently taking a live exam
  if (activeExamForAttempt) {
    return (
      <StudentLiveExam
        exam={activeExamForAttempt}
        onExitExam={() => setActiveExamForAttempt(null)}
        onExamSubmitted={(result) => {
          setActiveExamForAttempt(null);
          setViewingResultAttempt(result);
          setStudentSubView('result');
        }}
      />
    );
  }

  // =========================================================================
  // TEACHER / ADMIN EXAMINATION WORKFLOW
  // =========================================================================
  if (currentRole === 'teacher' || currentRole === 'admin') {
    if (teacherSubView === 'create') {
      return (
        <CreateExamWizard
          onCancel={() => setTeacherSubView('dashboard')}
          onExamCreated={(newExam) => {
            setTeacherSubView('dashboard');
          }}
        />
      );
    }

    if (teacherSubView === 'monitoring') {
      return (
        <LiveMonitoring
          examId={selectedMonitoringExamId}
          onBack={() => setTeacherSubView('dashboard')}
          onViewAnalytics={(eId) => {
            setSelectedAnalyticsExamId(eId);
            setTeacherSubView('analytics');
          }}
        />
      );
    }

    if (teacherSubView === 'analytics') {
      return (
        <ExamResultsAnalytics
          examId={selectedAnalyticsExamId}
          onBack={() => setTeacherSubView('dashboard')}
        />
      );
    }

    // Default Teacher Exam Dashboard
    return (
      <ExamDashboard
        onCreateExam={() => setTeacherSubView('create')}
        onMonitorExam={(examId) => {
          setSelectedMonitoringExamId(examId);
          setTeacherSubView('monitoring');
        }}
        onViewAnalytics={(examId) => {
          setSelectedAnalyticsExamId(examId);
          setTeacherSubView('analytics');
        }}
      />
    );
  }

  // =========================================================================
  // STUDENT EXAMINATION WORKFLOW
  // =========================================================================
  if (studentSubView === 'result' && viewingResultAttempt) {
    return (
      <StudentExamResult
        attempt={viewingResultAttempt}
        onStartRetest={(examId) => {
          setViewingResultAttempt(null);
          setStudentSubView('list');
          startStudentExam(examId);
        }}
        onBack={() => {
          setViewingResultAttempt(null);
          setStudentSubView('list');
        }}
      />
    );
  }

  return (
    <StudentExamsList
      onStartExam={(examId) => {
        startStudentExam(examId);
      }}
      onViewResult={(attempt) => {
        setViewingResultAttempt(attempt);
        setStudentSubView('result');
      }}
    />
  );
};
