import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { TEACHERS, STUDENTS, SUBJECTS } from '../data/initialData';
import { QUESTIONS_BANK } from '../data/questionsData';
import { INITIAL_QUIZZES, INITIAL_ATTEMPTS, INITIAL_NOTIFICATIONS } from '../data/quizzesData';
import { INITIAL_CURRICULUM, INITIAL_CURRICULUM_ATTEMPTS, INITIAL_SUBSCRIPTIONS, INITIAL_DOUBTS } from '../data/curriculumData';
import { INITIAL_EXAMINATIONS, generateLiveMonitoringData, generateCompletedExamAttempts } from '../data/examinationsData';
import { formatEmbedUrl } from '../utils/videoUtils';
import { createSectionId, normalizeCurriculumSections } from '../utils/curriculumSections';
import { saveNoteFile, deleteNoteFiles, collectFileNoteIds } from '../utils/notesStorage';
import { addDays, isLifetime, pickLatestApproved, endOfDate, formatDate } from '../utils/subscriptionUtils';
import { hashPassword, verifyPassword } from '../utils/passwordHash';
import { buildStudentFromRegistration, normalizePhone } from '../utils/studentRegistration';
import { api, backendEnabled, getToken, setToken, clearToken, setUnauthorizedHandler } from '../api/client';
import { SyncManager } from '../api/syncManager';
import {
  STUDENT_MODULES_SETTING_ID,
  resolveStudentModules,
  CONTENT_ACCESS_SETTING_ID,
  resolveContentAccess,
  ADMIN_MODULES_SETTING_ID,
  resolveAdminModules
} from '../utils/studentModules';
import {
  scoreMockTest,
  getLocalSession as getLocalMockSession,
  saveLocalSession as saveLocalMockSession,
  clearLocalProgress as clearLocalMockProgress
} from '../utils/mockTests';

// With the backend enabled, data lives in MongoDB: this browser's copy is NOT overwritten,
// so it can still be imported once by the admin.
const persistLocal = (key, value) => {
  if (backendEnabled) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

const AppContext = createContext();

export const DEFAULT_DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', color: 'emerald', dot: '🟢' },
  { id: 'medium', label: 'Medium', color: 'amber', dot: '🟡' },
  { id: 'hard', label: 'Hard', color: 'red', dot: '🔴' }
];

const CURRENT_DATA_VERSION = 'cohesiontech_v5_clean_production_empty';

export const AppProvider = ({ children }) => {
  // Check if saved data matches clean production schema version
  const needsDataReset = (() => {
    try {
      const savedVer = localStorage.getItem('qsap_data_version');
      return savedVer !== CURRENT_DATA_VERSION;
    } catch (e) {
      return true;
    }
  })();

  if (needsDataReset) {
    try {
      // Purge all legacy dummy data keys from localStorage
      localStorage.removeItem('cohesion_curriculum');
      localStorage.removeItem('cohesion_curriculum_attempts');
      localStorage.removeItem('cohesion_subscriptions');
      localStorage.removeItem('cohesion_doubts');
      localStorage.removeItem('cohesion_examinations');
      localStorage.removeItem('cohesion_exam_attempts');
      localStorage.removeItem('cohesion_exam_monitoring');
      localStorage.removeItem('cohesion_retests');
      localStorage.removeItem('qsap_questions');
      localStorage.removeItem('qsap_quizzes');
      localStorage.removeItem('qsap_students');
      localStorage.removeItem('qsap_attempts');
      localStorage.removeItem('qsap_notifications');
      localStorage.removeItem('qsap_auth');
      localStorage.setItem('qsap_auth', 'false');

      localStorage.setItem('qsap_data_version', CURRENT_DATA_VERSION);
      localStorage.setItem('qsap_questions', JSON.stringify([]));
      localStorage.setItem('qsap_quizzes', JSON.stringify([]));
      persistLocal('qsap_students', []);
      localStorage.setItem('qsap_attempts', JSON.stringify([]));
    } catch (e) {
      console.warn('LocalStorage initialization notice:', e);
    }
  }

  // Parse initial URL role & view
  const parseInitialUrl = () => {
    try {
      if (typeof window === 'undefined') return { role: null, view: null };
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      let role = null;
      let view = null;

      if (path.startsWith('/admin') || search.includes('role=admin') || hash.includes('admin')) {
        role = 'teacher';
      } else if (path.startsWith('/student') || search.includes('role=student') || hash.includes('student')) {
        role = 'student';
      }

      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2) {
        view = parts[1];
      }

      return { role, view };
    } catch (e) {
      return { role: null, view: null };
    }
  };

  const initialRoute = parseInitialUrl();

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('qsap_dark_mode') === 'true';
  });

  // Auth / Role state
  const [currentRole, setCurrentRole] = useState(() => {
    if (initialRoute.role) return initialRoute.role;
    return localStorage.getItem('qsap_role') || 'student';
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    if (initialRoute.role === 'teacher') return 'T001';
    return localStorage.getItem('qsap_user_id') || 'GUEST';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (backendEnabled) return Boolean(getToken());
    return localStorage.getItem('qsap_auth') === 'true';
  });

  // Active navigation view
  const [activeView, setActiveView] = useState(() => {
    return initialRoute.view || 'dashboard';
  });
  const [activeQuizForAttempt, setActiveQuizForAttempt] = useState(null);
  const [lastQuizResult, setLastQuizResult] = useState(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Self-registered student accounts. Each holds the login credentials (password HASH only)
  // plus the registration details, so the student can always be restored to the list below.
  const [studentAccounts, setStudentAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('cohesion_student_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      persistLocal('cohesion_student_accounts', studentAccounts);
    } catch (e) {}
  }, [studentAccounts]);

  // Core Data States (persisted in localStorage)
  const [students, setStudents] = useState(() => {
    let list = [];
    if (!needsDataReset) {
      const saved = localStorage.getItem('qsap_students');
      if (saved) {
        try { list = JSON.parse(saved); } catch (e) {}
      }
    }
    // Make sure every registered student is present (a demo-data reset must not drop them)
    const known = new Set(list.map((st) => st.id));
    const missing = studentAccounts
      .filter((a) => !known.has(a.studentId))
      .map((a) => buildStudentFromRegistration(a));
    return missing.length ? [...missing, ...list] : list;
  });

  const [teachers] = useState(TEACHERS);
  const [subjects] = useState(SUBJECTS);

  const [questions, setQuestions] = useState(() => {
    if (needsDataReset) return [];
    const saved = localStorage.getItem('qsap_questions');
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [quizzes, setQuizzes] = useState(() => {
    if (needsDataReset) return [];
    const saved = localStorage.getItem('qsap_quizzes');
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [attempts, setAttempts] = useState(() => {
    if (needsDataReset) return [];
    const saved = localStorage.getItem('qsap_attempts');
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [notifications, setNotifications] = useState(() => {
    if (needsDataReset) return [];
    const saved = localStorage.getItem('qsap_notifications');
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  // Streamlined Curriculum state: Subjects -> Modules -> Videos & Questions (Easy/Medium/Hard)
  const [curriculumSubjects, setCurriculumSubjects] = useState(() => {
    if (needsDataReset) return [];
    try {
      const saved = localStorage.getItem('cohesion_curriculum');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize all video URLs to valid embed format, and migrate
          // legacy modules (flat videos) into Section-based modules
          return normalizeCurriculumSections(
            parsed.map((s) => ({
              ...s,
              modules: (s.modules || []).map((m) => ({
                ...m,
                videos: (m.videos || []).map((v) => ({
                  ...v,
                  videoUrl: formatEmbedUrl(v.videoUrl)
                }))
              }))
            }))
          );
        }
      }
    } catch (e) {
      console.warn('Curriculum parse notice:', e);
    }
    return [];
  });

  const [curriculumAttempts, setCurriculumAttempts] = useState(() => {
    if (needsDataReset) return [];
    try {
      const saved = localStorage.getItem('cohesion_curriculum_attempts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Curriculum attempts parse notice:', e);
    }
    return [];
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    if (needsDataReset) return [];
    try {
      const saved = localStorage.getItem('cohesion_subscriptions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Subscriptions parse notice:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      persistLocal('cohesion_curriculum', curriculumSubjects);
    } catch (e) {}
  }, [curriculumSubjects]);

  useEffect(() => {
    try {
      persistLocal('cohesion_curriculum_attempts', curriculumAttempts);
    } catch (e) {}
  }, [curriculumAttempts]);

  useEffect(() => {
    try {
      persistLocal('cohesion_subscriptions', subscriptions);
    } catch (e) {}
  }, [subscriptions]);

  // Dynamic Difficulty Levels (e.g. Easy, Medium, Tough)
  const [difficultyLevels, setDifficultyLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('cohesion_difficulty_levels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      }
    } catch (e) {
      console.warn('Difficulty levels parse notice:', e);
    }
    return DEFAULT_DIFFICULTY_LEVELS;
  });

  useEffect(() => {
    try {
      persistLocal('cohesion_difficulty_levels', difficultyLevels);
    } catch (e) {}
  }, [difficultyLevels]);

  const updateDifficultyLevels = (newLevels) => {
    setDifficultyLevels(newLevels);
    showToast('Difficulty mode labels updated successfully!', 'success');
  };

  const resetDifficultyLevels = () => {
    setDifficultyLevels(DEFAULT_DIFFICULTY_LEVELS);
    showToast('Difficulty labels reset to defaults (Easy, Medium, Hard)', 'info');
  };

  // =========================================================================
  // LIVE & SCHEDULED EXAMINATIONS STATE & METHODS
  // =========================================================================
  const [examinations, setExaminations] = useState(() => {
    if (needsDataReset) return [];
    try {
      const saved = localStorage.getItem('cohesion_examinations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Examinations parse notice:', e);
    }
    return [];
  });

  const [examAttempts, setExamAttempts] = useState(() => {
    if (needsDataReset) return [];
    try {
      const saved = localStorage.getItem('cohesion_exam_attempts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Exam attempts parse notice:', e);
    }
    return [];
  });

  const [examMonitoringSessions, setExamMonitoringSessions] = useState(() => {
    if (needsDataReset) return [];
    try {
      const saved = localStorage.getItem('cohesion_exam_monitoring');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Exam monitoring parse notice:', e);
    }
    return [];
  });

  // Retests: a student asks (status 'requested') or the admin grants directly ('granted').
  // A granted retest allows one more attempt of that exam; submitting it marks it 'used'.
  const [retests, setRetests] = useState(() => {
    if (needsDataReset) return [];
    try {
      const saved = localStorage.getItem('cohesion_retests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Doubts: student questions to the admin, optionally tied to an exam/quiz question
  const [doubts, setDoubts] = useState(() => {
    if (needsDataReset) return [];
    try {
      const saved = localStorage.getItem('cohesion_doubts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      persistLocal('cohesion_retests', retests);
    } catch (e) {}
  }, [retests]);

  useEffect(() => {
    try {
      persistLocal('cohesion_doubts', doubts);
    } catch (e) {}
  }, [doubts]);

  const [activeExamForAttempt, setActiveExamForAttempt] = useState(null);
  const [lastExamResult, setLastExamResult] = useState(null);
  const [selectedExamForMonitoring, setSelectedExamForMonitoring] = useState('EXAM-2026-001');
  const [selectedExamForAnalytics, setSelectedExamForAnalytics] = useState('EXAM-2026-006');

  useEffect(() => {
    try {
      persistLocal('cohesion_examinations', examinations);
    } catch (e) {}
  }, [examinations]);

  useEffect(() => {
    try {
      persistLocal('cohesion_exam_attempts', examAttempts);
    } catch (e) {}
  }, [examAttempts]);

  useEffect(() => {
    try {
      persistLocal('cohesion_exam_monitoring', examMonitoringSessions);
    } catch (e) {}
  }, [examMonitoringSessions]);

  const createExamination = (examData) => {
    const newExam = {
      ...examData,
      id: examData.id || `EXAM-2026-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString()
    };
    setExaminations((prev) => [newExam, ...prev]);
    showToast(`Examination "${newExam.title}" scheduled successfully!`, 'success');
    return newExam;
  };

  const updateExamination = (id, updatedFields) => {
    setExaminations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    );
    showToast('Examination updated successfully!', 'success');
  };

  const deleteExamination = (id) => {
    setExaminations((prev) => prev.filter((e) => e.id !== id));
    showToast('Examination deleted', 'info');
  };

  const startStudentExam = (examId) => {
    const exam = examinations.find((e) => e.id === examId);
    if (!exam) {
      showToast('Examination not found', 'error');
      return;
    }
    if (currentRole === 'student') {
      const access = getExamAccess(currentUserId, exam);
      if (!access.allowed) {
        showToast(access.reason, 'warning');
        return;
      }
    }
    setActiveExamForAttempt(exam);
    // Update monitoring session for this student
    setExamMonitoringSessions((prev) =>
      prev.map((s) =>
        s.studentId === currentUserId && (s.examId === examId || !s.examId)
          ? {
              ...s,
              status: 'In Progress',
              connectionStatus: 'Connected',
              startTime: s.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              lastActivityText: 'Active just now',
              lastActivityTimestamp: Date.now()
            }
          : s
      )
    );
  };

  const saveExamDraftAnswer = (examId, studentId, questionIndex, selectedOption) => {
    setExamMonitoringSessions((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId && (s.examId === examId || !s.examId)) {
          const currentAnswered = selectedOption !== null && selectedOption !== undefined
            ? Math.max(s.answeredCount || 0, questionIndex + 1)
            : s.answeredCount || 0;
          return {
            ...s,
            answeredCount: currentAnswered,
            progressPct: Math.round((currentAnswered / (s.totalQuestions || 30)) * 100),
            currentQuestionIndex: questionIndex,
            lastActivityText: 'Active just now',
            lastActivityTimestamp: Date.now(),
            connectionStatus: 'Connected'
          };
        }
        return s;
      })
    );
  };

  const submitStudentExamAttempt = (examId, studentAnswers, timeSpentMinutes = 45) => {
    const exam = examinations.find((e) => e.id === examId) || activeExamForAttempt;
    if (!exam) return null;

    if (backendEnabled) {
      // The server checks access, scores the answers and consumes a granted retest
      return (async () => {
        try {
          const { attempt, retest } = await api(`/exams/${examId}/submit`, {
            method: 'POST',
            body: { answers: studentAnswers, timeSpentMinutes }
          });
          syncRef.current.insertSynced('examAttempts', attempt);
          if (retest) syncRef.current.insertSynced('retests', retest);
          setLastExamResult(attempt);
          setActiveExamForAttempt(null);
          setExamMonitoringSessions((prev) =>
            prev.map((s) =>
              s.studentId === attempt.studentId && s.examId === exam.id
                ? {
                    ...s,
                    status: 'Submitted',
                    connectionStatus: 'Connected',
                    answeredCount: attempt.totalQuestions - attempt.unattemptedCount,
                    progressPct: 100,
                    score: attempt.score,
                    submitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    lastActivityText: 'Submitted examination',
                    timeSpentMinutes
                  }
                : s
            )
          );
          syncRef.current.refetch('examinations'); // answers become visible for review
          showToast(`Examination submitted successfully! You scored ${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)`, 'success');
          return attempt;
        } catch (err) {
          showToast(`${err.message} Your answers are saved on this device. Please try submitting again.`, 'warning', 7000);
          return null;
        }
      })();
    }

    const student = currentUser || { id: currentUserId, name: 'Student', studentId: currentUserId };
    const totalQuestions = exam.questions?.length || 30;
    const totalMarks = exam.totalMarks || 30;

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    (exam.questions || []).forEach((q, idx) => {
      const studentAns = studentAnswers[idx];
      if (studentAns === null || studentAns === undefined) {
        unattemptedCount++;
      } else if (studentAns === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const negPerWrong = exam.negativeMarking ? (exam.negativeMarkValue || 0.25) : 0;
    const rawScore = correctCount - (incorrectCount * negPerWrong);
    const finalScore = Math.max(0, Math.round(rawScore * 10) / 10);
    const percentage = Math.round((finalScore / totalMarks) * 100);
    const passed = finalScore >= (exam.passingMarks || 15);

    const newAttempt = {
      id: `ATT-${exam.id}-${student.id}-${Date.now().toString().slice(-4)}`,
      examId: exam.id,
      examTitle: exam.title,
      subjectId: exam.subjectId,
      subjectName: exam.subjectName,
      studentId: student.id,
      studentName: student.name,
      studentRollNo: student.studentId || 'CE-2022-001',
      batch: student.batch || '2022-2026',
      semester: student.semester || 'S6',
      avatar: student.avatar || '',
      totalQuestions,
      totalMarks,
      correctCount,
      incorrectCount,
      unattemptedCount,
      score: finalScore,
      percentage,
      passed,
      timeSpentMinutes,
      submittedAt: new Date().toISOString(),
      answers: (exam.questions || []).map((q, idx) => ({
        questionIndex: idx,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        selectedOption: studentAnswers[idx] !== undefined ? studentAnswers[idx] : null,
        isCorrect: studentAnswers[idx] === q.correctAnswer
      }))
    };

    // If this attempt used a granted retest, record that and consume the grant
    const grant = retests.find(
      (r) => r.studentId === student.id && r.examId === exam.id && r.status === 'granted'
    );
    if (grant) {
      newAttempt.isRetest = true;
      setRetests((prev) =>
        prev.map((r) =>
          r.id === grant.id
            ? { ...r, status: 'used', usedAt: new Date().toISOString(), attemptId: newAttempt.id }
            : r
        )
      );
    }

    setExamAttempts((prev) => [newAttempt, ...prev]);
    setLastExamResult(newAttempt);
    setActiveExamForAttempt(null);

    // Update monitoring session
    setExamMonitoringSessions((prev) =>
      prev.map((s) =>
        s.studentId === student.id && (s.examId === exam.id || !s.examId)
          ? {
              ...s,
              status: 'Submitted',
              connectionStatus: 'Connected',
              answeredCount: totalQuestions - unattemptedCount,
              progressPct: 100,
              score: finalScore,
              submitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              lastActivityText: 'Submitted examination',
              timeSpentMinutes
            }
          : s
      )
    );

    showToast(`Examination submitted successfully! You scored ${finalScore}/${totalMarks} (${percentage}%)`, 'success');
    return newAttempt;
  };

  // =========================================================================
  // MOCK TESTS (admin-built timed practice tests, grouped by day)
  // A test: { id, title, day, description, durationMinutes, allowRetest, enabled, questions[] }.
  // Students only see enabled tests. With the backend, starting and scoring happen on the server.
  // =========================================================================
  const [mockTests, setMockTests] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cohesion_mock_tests') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  });
  const [mockAttempts, setMockAttempts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cohesion_mock_attempts') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  });
  // The test a student is taking right now: { test, session }
  const [activeMockTest, setActiveMockTest] = useState(null);

  useEffect(() => { persistLocal('cohesion_mock_tests', mockTests); }, [mockTests]);
  useEffect(() => { persistLocal('cohesion_mock_attempts', mockAttempts); }, [mockAttempts]);

  // =========================================================================
  // APP SETTINGS (admin-controlled). Currently: which modules students can use.
  // Stored as a list of setting items so it syncs like every other collection.
  // =========================================================================
  const [appSettings, setAppSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cohesion_app_settings') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  });
  useEffect(() => { persistLocal('cohesion_app_settings', appSettings); }, [appSettings]);

  const studentModules = resolveStudentModules(appSettings);

  /** Admin: switch student modules on/off. `changes` is { moduleId: boolean }. */
  const updateStudentModules = (changes) => {
    setAppSettings((prev) => {
      const current = resolveStudentModules(prev);
      const item = {
        id: STUDENT_MODULES_SETTING_ID,
        modules: { ...current, ...changes },
        updatedAt: new Date().toISOString()
      };
      return [item, ...(prev || []).filter((s) => s?.id !== STUDENT_MODULES_SETTING_ID)];
    });
  };

  // Admin panel sections the admin chose to show in their own menu
  const adminModules = resolveAdminModules(appSettings);

  /** Admin: show/hide sections of the admin panel. `changes` is { moduleId: boolean }. */
  const updateAdminModules = (changes) => {
    setAppSettings((prev) => {
      const item = {
        id: ADMIN_MODULES_SETTING_ID,
        modules: { ...resolveAdminModules(prev), ...changes },
        updatedAt: new Date().toISOString()
      };
      return [item, ...(prev || []).filter((s) => s?.id !== ADMIN_MODULES_SETTING_ID)];
    });
  };

  // Lesson videos / study notes / Q&A visibility, per subject and per course (module)
  const contentAccess = resolveContentAccess(appSettings);

  /**
   * Admin: show or hide one content type for students.
   * Without moduleId it sets the whole subject (and clears that type's per-course choices);
   * with moduleId it sets just that course.
   */
  const updateContentAccess = (subjectId, moduleId, type, enabled) => {
    setAppSettings((prev) => {
      const config = resolveContentAccess(prev);
      const subject = { ...(config[subjectId] || {}) };
      const modules = { ...(subject.modules || {}) };
      if (moduleId) {
        modules[moduleId] = { ...(modules[moduleId] || {}), [type]: enabled };
      } else {
        subject[type] = enabled;
        Object.keys(modules).forEach((id) => {
          const { [type]: _dropped, ...rest } = modules[id];
          modules[id] = rest;
        });
      }
      subject.modules = modules;
      const item = {
        id: CONTENT_ACCESS_SETTING_ID,
        subjects: { ...config, [subjectId]: subject },
        updatedAt: new Date().toISOString()
      };
      return [item, ...(prev || []).filter((s) => s?.id !== CONTENT_ACCESS_SETTING_ID)];
    });
  };

  const createMockTest = (data) => {
    const now = new Date().toISOString();
    const test = {
      id: `MOCK-${Date.now().toString(36).toUpperCase()}`,
      title: data.title.trim(),
      day: Math.max(1, Number(data.day) || 1),
      description: (data.description || '').trim(),
      durationMinutes: Math.max(1, Number(data.durationMinutes) || 60),
      allowRetest: !!data.allowRetest,
      // Public: every student. Private: only students of the chosen batches (courses).
      access: data.access === 'private' ? 'private' : 'public',
      batchSubjectIds: data.access === 'private' ? [...new Set(data.batchSubjectIds || [])] : [],
      enabled: false, // hidden until the admin adds questions and enables it
      questions: [],
      createdAt: now,
      updatedAt: now
    };
    setMockTests((prev) => [test, ...prev]);
    showToast(`Mock test "${test.title}" created. Add questions, then enable it for students.`, 'success');
    return test;
  };

  const updateMockTest = (id, fields) => {
    setMockTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...fields, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteMockTest = (id) => {
    setMockTests((prev) => prev.filter((t) => t.id !== id));
    showToast('Mock test deleted', 'info');
  };

  /** Starts or resumes a test for the signed-in student. Returns true when the test screen opens. */
  const startMockTest = async (testId) => {
    const test = mockTests.find((t) => t.id === testId);
    if (!test) {
      showToast('Mock test not found', 'error');
      return false;
    }
    const studentId = currentUserId;

    if (backendEnabled) {
      try {
        const res = await api(`/mock-tests/${testId}/start`, { method: 'POST' });
        const session = {
          startedAt: res.startedAt,
          deadline: res.deadline,
          durationMinutes: res.durationMinutes,
          // Server clock minus this device's clock, so the countdown matches the server
          clockOffsetMs: Date.parse(res.serverTime) - Date.now()
        };
        saveLocalMockSession(testId, studentId, session);
        setActiveMockTest({ test, session });
        return true;
      } catch (err) {
        // Refused (e.g. finished on another device): drop any stale "in progress" marker here
        if (err.status === 403 || err.status === 404) clearLocalMockProgress(testId, studentId);
        showToast(err.message, 'warning');
        return false;
      }
    }

    let session = getLocalMockSession(testId, studentId);
    if (!session) {
      if (test.enabled !== true) {
        showToast('This mock test is not available.', 'warning');
        return false;
      }
      if (!(test.questions || []).length) {
        showToast('This mock test has no questions yet.', 'warning');
        return false;
      }
      const taken = mockAttempts.some((a) => a.testId === testId && a.studentId === studentId);
      if (taken && !test.allowRetest) {
        showToast('You have already taken this mock test. Retests are not allowed for it.', 'warning');
        return false;
      }
      const startedAt = new Date();
      session = {
        startedAt: startedAt.toISOString(),
        deadline: new Date(startedAt.getTime() + test.durationMinutes * 60000).toISOString(),
        durationMinutes: test.durationMinutes,
        clockOffsetMs: 0
      };
      saveLocalMockSession(testId, studentId, session);
    }
    setActiveMockTest({ test, session });
    return true;
  };

  /** Submits the student's answers ({ questionId: optionIndex }). Returns the scored attempt or null. */
  const submitMockTest = async (testId, answers, { autoSubmitted = false } = {}) => {
    const studentId = currentUserId;

    if (backendEnabled) {
      try {
        const { attempt } = await api(`/mock-tests/${testId}/submit`, {
          method: 'POST',
          body: { answers, autoSubmitted }
        });
        syncRef.current.insertSynced('mockAttempts', attempt);
        clearLocalMockProgress(testId, studentId);
        return attempt;
      } catch (err) {
        if (err.status === 409 || err.status === 404) {
          // Already submitted (or the test is gone): nothing left to resume
          clearLocalMockProgress(testId, studentId);
          setActiveMockTest(null);
          syncRef.current.refetch('mockAttempts');
          showToast(err.message, 'warning', 6000);
        } else {
          showToast(`${err.message} Your answers are saved on this device. Please try submitting again.`, 'warning', 7000);
        }
        return null;
      }
    }

    const test = mockTests.find((t) => t.id === testId) || activeMockTest?.test;
    const session = getLocalMockSession(testId, studentId);
    if (!test || !session) {
      clearLocalMockProgress(testId, studentId);
      setActiveMockTest(null);
      showToast('This mock test was already submitted, or was never started.', 'warning');
      return null;
    }
    const now = new Date();
    const elapsed = Math.round((now.getTime() - Date.parse(session.startedAt)) / 1000);
    const student = currentUser || {};
    const attempt = {
      id: `MOCKATT-${testId}-${studentId}-${now.getTime().toString(36)}`,
      testId,
      testTitle: test.title,
      day: test.day,
      studentId,
      studentName: student.name || 'Student',
      studentRollNo: student.studentId || '',
      batch: student.batch || '',
      ...scoreMockTest(test, answers),
      attemptNumber: mockAttempts.filter((a) => a.testId === testId && a.studentId === studentId).length + 1,
      durationMinutes: session.durationMinutes,
      timeSpentSeconds: Math.max(1, Math.min(session.durationMinutes * 60, elapsed)),
      autoSubmitted,
      startedAt: session.startedAt,
      submittedAt: now.toISOString()
    };
    setMockAttempts((prev) => [attempt, ...prev]);
    clearLocalMockProgress(testId, studentId);
    return attempt;
  };

  const exportExamResultsCSV = (examId) => {
    const exam = examinations.find((e) => e.id === examId);
    const attemptsForExam = examAttempts.filter((a) => a.examId === examId);

    const headers = [
      'Rank', 'Roll Number', 'Student Name', 'Batch', 'Semester',
      'Score', 'Total Marks', 'Percentage %', 'Correct', 'Incorrect', 'Unattempted',
      'Result Status', 'Time Spent (mins)', 'Submitted At'
    ];

    const sorted = [...attemptsForExam].sort((a, b) => b.score - a.score);

    const rows = sorted.map((a, idx) => [
      idx + 1,
      a.studentRollNo,
      `"${a.studentName}"`,
      a.batch,
      a.semester,
      a.score,
      a.totalMarks,
      `${a.percentage}%`,
      a.correctCount,
      a.incorrectCount,
      a.unattemptedCount,
      a.passed ? 'PASSED' : 'FAILED',
      a.timeSpentMinutes,
      a.submittedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exam ? exam.code || exam.id : 'Exam'}_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported examination results to CSV', 'success');
  };

  // Helper to resolve question difficulty label & meta
  const getDifficultyMeta = (difficultyValue) => {
    if (!difficultyValue) return difficultyLevels[1] || DEFAULT_DIFFICULTY_LEVELS[1];
    const val = String(difficultyValue).trim().toLowerCase();

    for (const lvl of difficultyLevels) {
      if (lvl.id === val || lvl.label.toLowerCase() === val) {
        return lvl;
      }
    }

    if (['easy', 'simple', 'beginner', 'basic', 'level 1'].includes(val)) {
      return difficultyLevels.find((l) => l.id === 'easy') || difficultyLevels[0];
    }
    if (['medium', 'moderate', 'intermediate', 'normal', 'average', 'level 2'].includes(val)) {
      return difficultyLevels.find((l) => l.id === 'medium') || difficultyLevels[1];
    }
    if (['hard', 'tough', 'advanced', 'difficult', 'expert', 'level 3'].includes(val)) {
      return difficultyLevels.find((l) => l.id === 'hard') || difficultyLevels[2];
    }

    return difficultyLevels[1] || DEFAULT_DIFFICULTY_LEVELS[1];
  };

  const getDifficultyLabel = (difficultyValue) => {
    return getDifficultyMeta(difficultyValue).label;
  };

  const matchesDifficulty = (questionDifficulty, filterValue) => {
    if (!filterValue || filterValue === 'All') return true;
    const qMeta = getDifficultyMeta(questionDifficulty);
    const filterMeta = getDifficultyMeta(filterValue);
    return qMeta.id === filterMeta.id;
  };

  // Toast Notification state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with localStorage
  useEffect(() => {
    persistLocal('qsap_students', students);
  }, [students]);

  useEffect(() => {
    persistLocal('qsap_questions', questions);
  }, [questions]);

  useEffect(() => {
    persistLocal('qsap_quizzes', quizzes);
  }, [quizzes]);

  useEffect(() => {
    persistLocal('qsap_attempts', attempts);
  }, [attempts]);

  useEffect(() => {
    persistLocal('qsap_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('qsap_role', currentRole);
    localStorage.setItem('qsap_user_id', currentUserId);
    localStorage.setItem('qsap_auth', isAuthenticated ? 'true' : 'false');
  }, [currentRole, currentUserId, isAuthenticated]);

  // =========================================================================
  // BACKEND SYNC (active when VITE_API_URL is set)
  // =========================================================================
  const [dataReady, setDataReady] = useState(!backendEnabled);
  const [serverInitialized, setServerInitialized] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const syncRef = useRef(null);
  if (backendEnabled && !syncRef.current) {
    syncRef.current = new SyncManager({ onError: (err) => showToast(err.message, 'warning') });
  }

  // Collection name (same as the API) -> React setter
  useEffect(() => {
    if (!backendEnabled) return;
    const m = syncRef.current;
    m.register('curriculum', setCurriculumSubjects);
    m.register('curriculumAttempts', setCurriculumAttempts);
    m.register('subscriptions', setSubscriptions);
    m.register('examinations', setExaminations);
    m.register('examAttempts', setExamAttempts);
    m.register('examMonitoring', setExamMonitoringSessions);
    m.register('retests', setRetests);
    m.register('doubts', setDoubts);
    m.register('notifications', setNotifications);
    m.register('students', setStudents);
    m.register('questions', setQuestions);
    m.register('quizzes', setQuizzes);
    m.register('attempts', setAttempts);
    m.register('difficultyLevels', setDifficultyLevels);
    m.register('mockTests', setMockTests);
    m.register('mockAttempts', setMockAttempts);
    m.register('settings', setAppSettings);
    m.register('accounts', setStudentAccounts, { readOnly: true });
  }, []);

  // Send local changes to the server
  useEffect(() => { syncRef.current?.track('curriculum', curriculumSubjects); }, [curriculumSubjects]);
  useEffect(() => { syncRef.current?.track('curriculumAttempts', curriculumAttempts); }, [curriculumAttempts]);
  useEffect(() => { syncRef.current?.track('subscriptions', subscriptions); }, [subscriptions]);
  useEffect(() => { syncRef.current?.track('examinations', examinations); }, [examinations]);
  useEffect(() => { syncRef.current?.track('examAttempts', examAttempts); }, [examAttempts]);
  useEffect(() => { syncRef.current?.track('examMonitoring', examMonitoringSessions); }, [examMonitoringSessions]);
  useEffect(() => { syncRef.current?.track('retests', retests); }, [retests]);
  useEffect(() => { syncRef.current?.track('doubts', doubts); }, [doubts]);
  useEffect(() => { syncRef.current?.track('notifications', notifications); }, [notifications]);
  useEffect(() => { syncRef.current?.track('students', students); }, [students]);
  useEffect(() => { syncRef.current?.track('questions', questions); }, [questions]);
  useEffect(() => { syncRef.current?.track('quizzes', quizzes); }, [quizzes]);
  useEffect(() => { syncRef.current?.track('attempts', attempts); }, [attempts]);
  useEffect(() => { syncRef.current?.track('difficultyLevels', difficultyLevels); }, [difficultyLevels]);
  useEffect(() => { syncRef.current?.track('mockTests', mockTests); }, [mockTests]);
  useEffect(() => { syncRef.current?.track('mockAttempts', mockAttempts); }, [mockAttempts]);
  useEffect(() => { syncRef.current?.track('settings', appSettings); }, [appSettings]);

  /** Loads everything the signed-in user may see from the server. */
  const loadServerData = useCallback(async () => {
    const m = syncRef.current;
    m.reset();
    setDataReady(false);
    setLoadError(null);
    const { user } = await api('/auth/me');
    const data = await api('/sync/bootstrap');
    setCurrentRole(user.role === 'admin' ? 'teacher' : 'student');
    setCurrentUserId(user.role === 'admin' ? user.teacherId || 'T001' : user.studentId);
    m.load(data);
    setServerInitialized(data.initialized !== false);
    setIsAuthenticated(true);
    setDataReady(true);
    m.start();
  }, []);

  const endServerSession = useCallback(() => {
    clearToken();
    try { localStorage.setItem('qsap_auth', 'false'); } catch (e) {}
    syncRef.current?.reset();
    setIsAuthenticated(false);
    setDataReady(false);
  }, []);

  // Restore the session on page load
  useEffect(() => {
    if (!backendEnabled) return undefined;
    setUnauthorizedHandler(() => {
      endServerSession();
      showToast('Your session has expired. Please sign in again.', 'warning');
    });
    if (getToken()) {
      loadServerData().catch((err) => {
        if (err.status === 401) endServerSession();
        else setLoadError(err.message);
      });
    }
    return () => syncRef.current?.stop();
  }, []);

  const startServerSession = async (token) => {
    setToken(token);
    try { localStorage.setItem('qsap_auth', 'true'); } catch (e) {}
    await loadServerData();
    setActiveView('dashboard');
  };

  /** Password sign-in against the backend (admin or student), with clean standalone fallback. */
  const loginWithPassword = async (role, identifier, password) => {
    if (backendEnabled) {
      try {
        const res = await api('/auth/login', {
          method: 'POST',
          auth: false,
          body: { identifier, password, role: role === 'student' ? 'student' : 'admin' }
        });
        if (res.mustChangePassword) {
          return { ok: true, mustChangePassword: true, accountId: res.resetToken, name: res.name };
        }
        await startServerSession(res.token);
        showToast(`Welcome, ${res.user.name}!`, 'success');
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    // Standalone fallback:
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    if (role === 'admin' || role === 'teacher') {
      if (cleanId !== 'admin' && cleanId !== 'admin@gmail.com' && cleanId !== 'admin@cohesiontech.com') {
        return { ok: false, error: 'Admin account not found. Please enter valid Admin Login ID.' };
      }
      if (cleanPass !== 'admin@123' && cleanPass !== 'admin' && cleanPass !== 'admin123') {
        return { ok: false, error: 'Incorrect password! Please enter the correct admin password.' };
      }
      setCurrentRole('teacher');
      setCurrentUserId('T001');
      setIsAuthenticated(true);
      setActiveView('dashboard');
      showToast('Logged in as Admin', 'success');
      return { ok: true };
    }
    return loginStudentWithPassword(identifier, password);
  };

  const resetAllLocalData = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {}
  };

  useEffect(() => {
    localStorage.setItem('qsap_dark_mode', darkMode ? 'true' : 'false');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Current User Object
  const currentUser = currentRole === 'teacher'
    ? (teachers.find((t) => t.id === currentUserId) || teachers[0] || {
        id: 'T001',
        name: 'Administrator',
        username: 'admin',
        role: 'admin',
        email: 'admin@gmail.com',
        department: 'Administration'
      })
    : (students.find((s) => s.id === currentUserId) || studentAccounts.find((a) => a.studentId === currentUserId) || {
        id: 'GUEST',
        name: 'Student',
        role: 'student',
        email: ''
      });

  // Get direct portal URL
  const getPortalUrl = (role) => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    return `${origin}/${role === 'teacher' || role === 'admin' ? 'admin' : 'student'}`;
  };

  // Copy portal URL to clipboard with user toast feedback
  const copyPortalUrl = (role) => {
    const url = getPortalUrl(role);
    const roleLabel = (role === 'teacher' || role === 'admin') ? 'Admin' : 'Student';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          showToast(`Copied ${roleLabel} URL: ${url}`, 'success');
        })
        .catch(() => {
          showToast(`URL: ${url}`, 'info');
        });
    } else {
      showToast(`URL: ${url}`, 'info');
    }
  };

  // Keep browser URL synchronized with role and activeView
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Signed out: keep /student or /admin as typed, so the right login tab opens without forcing navigation
    if (!isAuthenticated || (backendEnabled && !dataReady)) return;
    const basePath = currentRole === 'teacher' ? '/admin' : '/student';
    let targetPath = basePath;
    if (activeView && activeView !== 'dashboard') {
      targetPath = `${basePath}/${activeView}`;
    }

    if (window.location.pathname !== targetPath) {
      window.history.replaceState({ role: currentRole, view: activeView }, '', targetPath);
    }
  }, [currentRole, activeView, isAuthenticated, dataReady]);

  // Handle browser back / forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const route = parseInitialUrl();
      if (!backendEnabled && route.role && route.role !== currentRole) {
        setCurrentRole(route.role);
        setCurrentUserId(route.role === 'teacher' ? 'T001' : 'STU001');
      }
      if (route.view) {
        setActiveView(route.view);
      } else {
        setActiveView('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentRole]);

  // Role Switching Helper
  const switchRole = (newRole, newUserId) => {
    if (backendEnabled) {
      // Real accounts: switching roles means signing in as someone else
      endServerSession();
      window.history.replaceState(null, '', newRole === 'teacher' ? '/admin' : '/student');
      showToast('Signed out. Sign in with the other account.', 'info');
      return;
    }
    setCurrentRole(newRole);
    if (newUserId) {
      setCurrentUserId(newUserId);
    } else {
      setCurrentUserId(newRole === 'teacher' ? 'T001' : 'STU001');
    }
    setIsAuthenticated(true);
    setActiveView('dashboard');
    setActiveQuizForAttempt(null);
    showToast(`Switched to ${newRole === 'teacher' ? 'Admin' : 'Student'} Dashboard`, 'info');
  };

  // Login handler
  const login = (role, userId) => {
    if (backendEnabled) {
      showToast('Demo logins are disabled. Sign in with your account.', 'warning');
      return;
    }
    setCurrentRole(role);
    setCurrentUserId(userId || (role === 'teacher' ? 'T001' : 'STU001'));
    setIsAuthenticated(true);
    try {
      localStorage.setItem('qsap_auth', 'true');
    } catch (e) {}
    setActiveView('dashboard');
    showToast('Logged in successfully', 'success');
  };

  // Logout handler
  const logout = () => {
    if (backendEnabled) endServerSession();
    setActiveMockTest(null);
    setIsAuthenticated(false);
    try {
      localStorage.setItem('qsap_auth', 'false');
    } catch (e) {}
    showToast('Logged out of CohesionTech', 'info');
  };

  // =========================================================================
  // STUDENT SELF-REGISTRATION & PASSWORD LOGIN
  // =========================================================================

  const findAccount = (identifier) => {
    const raw = (identifier || '').trim().toLowerCase();
    if (!raw) return null;
    const phone = normalizePhone(raw);
    return (
      studentAccounts.find((a) => a.email === raw) ||
      (phone.length === 10 ? studentAccounts.find((a) => a.phone === phone) : null) ||
      studentAccounts.find((a) => a.registrationId.toLowerCase() === raw) ||
      null
    );
  };

  const stampLogin = (accountId) => {
    const now = new Date().toISOString();
    setStudentAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              lastLoginAt: now,
              loginCount: (a.loginCount || 0) + 1,
              loginHistory: [now, ...(a.loginHistory || [])].slice(0, 20)
            }
          : a
      )
    );
  };

  /**
   * New student signs up. `form` = { email, name, qualification, phone, civilLevel,
   * preparation, district, password }. Logs the student in on success.
   */
  const registerStudent = async (form) => {
    if (backendEnabled) {
      try {
        const res = await api('/auth/register', { method: 'POST', auth: false, body: form });
        await startServerSession(res.token);
        showToast(`Welcome, ${res.user.name}! Your registration ID is ${res.user.registrationId}.`, 'success', 6000);
        return { ok: true, registrationId: res.user.registrationId };
      } catch (err) {
        return { ok: false, field: err.data?.field || 'email', error: err.message };
      }
    }
    const email = form.email.trim().toLowerCase();
    const phone = normalizePhone(form.phone);
    if (studentAccounts.some((a) => a.email === email)) {
      return { ok: false, field: 'email', error: 'This email is already registered. Please sign in instead.' };
    }
    if (studentAccounts.some((a) => a.phone === phone)) {
      return { ok: false, field: 'phone', error: 'This WhatsApp number is already registered. Please sign in instead.' };
    }

    const credentials = await hashPassword(form.password);
    const now = new Date();
    const seq = studentAccounts.length + 1;
    const account = {
      id: `acc-${now.getTime()}`,
      studentId: `STU-R${now.getTime().toString().slice(-6)}`,
      registrationId: `CT-${now.getFullYear()}-${String(seq).padStart(4, '0')}`,
      email,
      phone,
      name: form.name.trim(),
      qualification: form.qualification,
      civilLevel: form.civilLevel,
      preparation: form.preparation,
      district: form.district.trim(),
      registeredAt: now.toISOString(),
      credentials,
      passwordUpdatedAt: now.toISOString(),
      mustChangePassword: false,
      lastLoginAt: now.toISOString(),
      loginCount: 1,
      loginHistory: [now.toISOString()]
    };

    setStudentAccounts((prev) => [...prev, account]);
    setStudents((prev) => [buildStudentFromRegistration(account), ...prev]);
    setCurrentRole('student');
    setCurrentUserId(account.studentId);
    setIsAuthenticated(true);
    setActiveView('dashboard');
    showToast(`Welcome, ${account.name}! Your registration ID is ${account.registrationId}.`, 'success', 6000);
    return { ok: true, registrationId: account.registrationId };
  };

  /**
   * Student signs in with email / WhatsApp number / registration ID + password.
   * If the admin reset their password, returns { ok: true, mustChangePassword, accountId }
   * without signing in, so they can set a new password first.
   */
  const loginStudentWithPassword = async (identifier, password) => {
    if (backendEnabled) return loginWithPassword('student', identifier, password);
    const account = findAccount(identifier);
    if (!account) {
      return { ok: false, error: 'No student account found with this email, WhatsApp number, or registration ID.' };
    }
    const isPasswordValid = await verifyPassword(password, account.credentials);
    if (!isPasswordValid) {
      return { ok: false, error: 'Incorrect password! Please check your password and try again.' };
    }
    if (account.mustChangePassword) {
      return { ok: true, mustChangePassword: true, accountId: account.id, name: account.name };
    }
    stampLogin(account.id);
    login('student', account.studentId);
    return { ok: true };
  };

  // After an admin reset: the student chooses their own new password, then is signed in
  const completePasswordChange = async (accountId, newPassword) => {
    if (backendEnabled) {
      // accountId is the short-lived reset token from the login response
      try {
        const res = await api('/auth/set-password', { method: 'POST', auth: false, body: { resetToken: accountId, newPassword } });
        await startServerSession(res.token);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    const account = studentAccounts.find((a) => a.id === accountId);
    if (!account) return { ok: false, error: 'Account not found.' };
    const credentials = await hashPassword(newPassword);
    const now = new Date().toISOString();
    setStudentAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, credentials, mustChangePassword: false, passwordUpdatedAt: now } : a))
    );
    stampLogin(accountId);
    login('student', account.studentId);
    return { ok: true };
  };

  // Signed-in student changes their own password (needs the current one)
  const changeOwnPassword = async (currentPassword, newPassword) => {
    if (backendEnabled) {
      try {
        await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
        showToast('Password changed', 'success');
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    const account = studentAccounts.find((a) => a.studentId === currentUserId);
    if (!account) return { ok: false, error: 'Password login is only available for registered students.' };
    if (!(await verifyPassword(currentPassword, account.credentials))) {
      return { ok: false, error: 'Your current password is incorrect.' };
    }
    const credentials = await hashPassword(newPassword);
    setStudentAccounts((prev) =>
      prev.map((a) =>
        a.id === account.id ? { ...a, credentials, mustChangePassword: false, passwordUpdatedAt: new Date().toISOString() } : a
      )
    );
    showToast('Password changed', 'success');
    return { ok: true };
  };

  // Admin: replace a student's password with a temporary one they must change at next login
  const adminResetStudentPassword = async (accountId, tempPassword) => {
    if (backendEnabled) {
      try {
        await api(`/admin/students/${accountId}/reset-password`, { method: 'POST', body: { tempPassword } });
        showToast('Temporary password set. Share it with the student.', 'success');
        syncRef.current?.poll();
        return { ok: true };
      } catch (err) {
        showToast(err.message, 'warning');
        return { ok: false, error: err.message };
      }
    }
    const credentials = await hashPassword(tempPassword);
    setStudentAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? { ...a, credentials, mustChangePassword: true, passwordUpdatedAt: new Date().toISOString(), passwordResetByAdminAt: new Date().toISOString() }
          : a
      )
    );
    showToast('Temporary password set. Share it with the student.', 'success');
  };

  // Admin: permanently delete a registered student and everything they own (no soft delete)
  const adminDeleteStudentAccount = async (accountId) => {
    const account = studentAccounts.find((a) => a.id === accountId);
    if (!account) return { ok: false, error: 'Student not found.' };
    const sid = account.studentId;
    const owned = (item) => item?.studentId === sid;

    if (backendEnabled) {
      try {
        await api(`/admin/students/${accountId}`, { method: 'DELETE' });
      } catch (err) {
        showToast(err.message, 'warning');
        return { ok: false, error: err.message };
      }
      // The server already removed everything: drop it locally without sending deletes back
      const m = syncRef.current;
      const drop = (name, list, keyOf = (i) => i.id) => {
        const keys = (list || []).filter(owned).map(keyOf).filter(Boolean);
        if (keys.length) m?.applyDocs(name, [], keys);
      };
      m?.applyDocs('students', [], [sid]);
      drop('curriculumAttempts', curriculumAttempts);
      drop('subscriptions', subscriptions);
      drop('examAttempts', examAttempts);
      drop('examMonitoring', examMonitoringSessions, (i) => (i.examId && i.studentId ? `${i.examId}:${i.studentId}` : undefined));
      drop('retests', retests);
      drop('doubts', doubts);
      drop('attempts', attempts);
      drop('mockAttempts', mockAttempts);
      setStudentAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } else {
      const keep = (prev) => prev.filter((i) => !owned(i));
      setStudents((prev) => prev.filter((s) => s.id !== sid));
      setCurriculumAttempts(keep);
      setSubscriptions(keep);
      setExamAttempts(keep);
      setExamMonitoringSessions(keep);
      setRetests(keep);
      setDoubts(keep);
      setAttempts(keep);
      setMockAttempts(keep);
      setStudentAccounts((prev) => prev.filter((a) => a.id !== accountId));
    }
    showToast(`${account.name} was deleted permanently`, 'success');
    return { ok: true };
  };

  // =========================================================================
  // STREAMLINED CURRICULUM CRUD: SUBJECTS -> MODULES -> VIDEOS & QUESTIONS
  // =========================================================================

  // Subject CRUD
  const addSubject = (subjectData) => {
    const newSubject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
      modules: []
    };
    setCurriculumSubjects((prev) => [newSubject, ...prev]);
    showToast(`Subject "${newSubject.name}" created`, 'success');
  };

  const updateSubject = (id, updatedFields) => {
    setCurriculumSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    showToast('Subject updated', 'success');
  };

  const deleteSubject = (id) => {
    const subject = curriculumSubjects.find((s) => s.id === id);
    deleteNoteFiles(collectFileNoteIds(subject?.modules));
    setCurriculumSubjects((prev) => prev.filter((s) => s.id !== id));
    showToast('Subject removed', 'info');
  };

  // Module CRUD
  const addModule = (subjectId, moduleData) => {
    const newModule = {
      ...moduleData,
      id: `mod-${Date.now()}`,
      sections: [{ id: createSectionId(), title: 'Section 1', description: '' }],
      videos: [],
      notes: [],
      questions: []
    };
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, modules: [...(s.modules || []), newModule] }
          : s
      )
    );
    showToast(`Module "${newModule.title}" created`, 'success');
  };

  const updateModule = (subjectId, moduleId, updatedFields) => {
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).map((m) =>
                m.id === moduleId ? { ...m, ...updatedFields } : m
              )
            }
          : s
      )
    );
    showToast('Module updated', 'success');
  };

  const deleteModule = (subjectId, moduleId) => {
    const module = curriculumSubjects
      .find((s) => s.id === subjectId)
      ?.modules?.find((m) => m.id === moduleId);
    deleteNoteFiles(collectFileNoteIds(module ? [module] : []));
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).filter((m) => m.id !== moduleId)
            }
          : s
      )
    );
    showToast('Module removed', 'info');
  };

  // Section CRUD (Module -> Sections -> Videos)
  const mapModule = (subjectId, moduleId, updater) => {
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).map((m) => (m.id === moduleId ? updater(m) : m))
            }
          : s
      )
    );
  };

  const addSection = (subjectId, moduleId, sectionData) => {
    const newSection = {
      title: (sectionData.title || '').trim() || 'New Section',
      description: (sectionData.description || '').trim(),
      id: createSectionId()
    };
    mapModule(subjectId, moduleId, (m) => ({
      ...m,
      sections: [...(m.sections || []), newSection]
    }));
    showToast(`"${newSection.title}" added`, 'success');
    return newSection;
  };

  const updateSection = (subjectId, moduleId, sectionId, updatedFields) => {
    mapModule(subjectId, moduleId, (m) => ({
      ...m,
      sections: (m.sections || []).map((sec) =>
        sec.id === sectionId ? { ...sec, ...updatedFields } : sec
      )
    }));
    showToast('Section updated', 'success');
  };

  // Removes the section and every video inside it. A module always keeps at least one section.
  const deleteSection = (subjectId, moduleId, sectionId) => {
    mapModule(subjectId, moduleId, (m) => {
      const remaining = (m.sections || []).filter((sec) => sec.id !== sectionId);
      return {
        ...m,
        sections: remaining.length
          ? remaining
          : [{ id: createSectionId(), title: 'Section 1', description: '' }],
        videos: (m.videos || []).filter((v) => v.sectionId !== sectionId)
      };
    });
    showToast('Section removed', 'info');
  };

  // Notes CRUD (teacher study material: uploaded files, links, or written notes)
  // `file` (Blob) is stored in IndexedDB; only metadata goes into the curriculum.
  const addNote = async (subjectId, moduleId, noteData, file) => {
    const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (noteData.type === 'file') {
      if (!file) {
        showToast('Please choose a file to upload', 'warning');
        return false;
      }
      try {
        await saveNoteFile(id, file);
      } catch (e) {
        console.warn('Note upload failed:', e);
        showToast(
          backendEnabled
            ? `Upload failed: ${e.message || 'please try again'}`
            : 'Could not save this file. Your browser storage may be full.',
          'warning'
        );
        return false;
      }
    }
    const newNote = {
      ...noteData,
      id,
      createdAt: new Date().toISOString(),
      ...(file
        ? { fileName: file.name, fileType: file.type || '', fileSize: file.size }
        : {})
    };
    mapModule(subjectId, moduleId, (m) => ({ ...m, notes: [...(m.notes || []), newNote] }));
    showToast(`Notes "${newNote.title}" shared with students`, 'success');
    return true;
  };

  const deleteNote = (subjectId, moduleId, noteId) => {
    deleteNoteFiles([noteId]);
    mapModule(subjectId, moduleId, (m) => ({
      ...m,
      notes: (m.notes || []).filter((n) => n.id !== noteId)
    }));
    showToast('Notes removed', 'info');
  };

  // Video CRUD
  const addVideo = (subjectId, moduleId, videoData) => {
    const cleanUrl = formatEmbedUrl(videoData.videoUrl);
    const newVideo = {
      ...videoData,
      videoUrl: cleanUrl || videoData.videoUrl,
      id: `vid-${Date.now()}`
    };
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).map((m) =>
                m.id === moduleId
                  ? {
                      ...m,
                      videos: [
                        ...(m.videos || []),
                        {
                          ...newVideo,
                          // Fall back to the first section if none (or a stale one) was chosen
                          sectionId: (m.sections || []).some((sec) => sec.id === newVideo.sectionId)
                            ? newVideo.sectionId
                            : m.sections?.[0]?.id
                        }
                      ]
                    }
                  : m
              )
            }
          : s
      )
    );
    showToast(`Video lesson "${newVideo.title}" added`, 'success');
  };

  const deleteVideo = (subjectId, moduleId, videoId) => {
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).map((m) =>
                m.id === moduleId
                  ? {
                      ...m,
                      videos: (m.videos || []).filter((v) => v.id !== videoId)
                    }
                  : m
              )
            }
          : s
      )
    );
    showToast('Video removed', 'info');
  };

  // Curriculum Question CRUD (Supports Easy, Medium, Hard modes)
  const addCurriculumQuestion = (subjectId, moduleId, questionData) => {
    const newQuestion = {
      ...questionData,
      id: `q-${Date.now()}`
    };
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).map((m) =>
                m.id === moduleId
                  ? { ...m, questions: [...(m.questions || []), newQuestion] }
                  : m
              )
            }
          : s
      )
    );
    showToast(`Added Question (${newQuestion.difficulty} Mode)`, 'success');
  };

  const addCurriculumQuestionsBulk = (subjectId, moduleId, questionsArray) => {
    if (!questionsArray || questionsArray.length === 0) return;
    const formattedQuestions = questionsArray.map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`
    }));

    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).map((m) =>
                m.id === moduleId
                  ? {
                      ...m,
                      questions: [...(m.questions || []), ...formattedQuestions]
                    }
                  : m
              )
            }
          : s
      )
    );
    showToast(`Bulk imported ${formattedQuestions.length} questions successfully!`, 'success');
  };

  const deleteCurriculumQuestion = (subjectId, moduleId, questionId) => {
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).map((m) =>
                m.id === moduleId
                  ? {
                      ...m,
                      questions: (m.questions || []).filter((q) => q.id !== questionId)
                    }
                  : m
              )
            }
          : s
      )
    );
    showToast('Question removed', 'info');
  };

  // Student Curriculum Attempt
  const recordCurriculumAttempt = (attemptData) => {
    setCurriculumAttempts((prev) => [attemptData, ...prev]);
  };

  // =========================================================================
  // RETESTS
  // =========================================================================

  // The student's open retest for an exam (requested or granted), if any
  const getRetestFor = (studentId, examId) =>
    retests.find(
      (r) =>
        r.studentId === studentId &&
        r.examId === examId &&
        (r.status === 'requested' || r.status === 'granted')
    ) || null;

  /**
   * Whether a student may start an exam right now.
   * - No attempt yet: only while the exam is Live.
   * - Already attempted: only with a granted retest (works even after the exam concluded).
   */
  const getExamAccess = (studentId, exam) => {
    if (!exam) return { allowed: false, reason: 'Examination not found' };
    const attempted = examAttempts.some((a) => a.studentId === studentId && a.examId === exam.id);
    const grant = retests.find(
      (r) => r.studentId === studentId && r.examId === exam.id && r.status === 'granted'
    );
    if (attempted) {
      return grant
        ? { allowed: true, isRetest: true }
        : { allowed: false, reason: 'You have already attempted this exam. Ask the admin for a retest.' };
    }
    if (exam.status === 'Live Now') return { allowed: true, isRetest: false };
    if (grant && exam.status === 'Completed') return { allowed: true, isRetest: true };
    return { allowed: false, reason: exam.status === 'Upcoming' ? 'This exam has not started yet.' : 'This exam has concluded.' };
  };

  const requestRetest = (examId, reason = '') => {
    const exam = examinations.find((e) => e.id === examId);
    const student = currentUser;
    if (!exam || !student) return;
    if (getRetestFor(student.id, examId)) {
      showToast('You already have a retest request for this exam.', 'info');
      return;
    }
    setRetests((prev) => [
      {
        id: `retest-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        avatar: student.avatar || '',
        examId,
        examTitle: exam.title,
        subjectId: exam.subjectId,
        subjectName: exam.subjectName,
        reason: reason.trim(),
        status: 'requested',
        requestedAt: new Date().toISOString()
      },
      ...prev
    ]);
    showToast('Retest request sent to the admin.', 'success');
  };

  // Admin: grant a retest. Approves the student's request if there is one, otherwise creates a grant.
  const grantRetest = (studentId, examId, note = '') => {
    const exam = examinations.find((e) => e.id === examId);
    const student = students.find((s) => s.id === studentId);
    const now = new Date().toISOString();
    const existing = getRetestFor(studentId, examId);
    if (existing?.status === 'granted') {
      showToast('A retest is already enabled for this student.', 'info');
      return;
    }
    setRetests((prev) =>
      existing
        ? prev.map((r) => (r.id === existing.id ? { ...r, status: 'granted', grantedAt: now, adminNote: note } : r))
        : [
            {
              id: `retest-${Date.now()}`,
              studentId,
              studentName: student?.name || 'Student',
              avatar: student?.avatar || '',
              examId,
              examTitle: exam?.title || 'Examination',
              subjectId: exam?.subjectId,
              subjectName: exam?.subjectName,
              reason: '',
              status: 'granted',
              requestedAt: now,
              grantedAt: now,
              adminNote: note
            },
            ...prev
          ]
    );
    showToast(`Retest enabled for ${student?.name || 'student'}.`, 'success');
  };

  const declineRetest = (retestId, note = '') => {
    setRetests((prev) =>
      prev.map((r) =>
        r.id === retestId ? { ...r, status: 'declined', declinedAt: new Date().toISOString(), adminNote: note } : r
      )
    );
    showToast('Retest request declined.', 'info');
  };

  // Admin: take back a granted retest the student hasn't used yet
  const revokeRetest = (retestId) => {
    setRetests((prev) =>
      prev.map((r) => (r.id === retestId ? { ...r, status: 'revoked', revokedAt: new Date().toISOString() } : r))
    );
    showToast('Retest access removed.', 'info');
  };

  const pendingRetestCount = retests.filter((r) => r.status === 'requested').length;

  // =========================================================================
  // DOUBTS
  // =========================================================================

  /**
   * Student raises a doubt. `context` (optional) ties it to a question:
   * { source: 'exam' | 'quiz' | 'review', examId?, assessmentTitle, questionIndex, questionText, options, correctAnswer? }
   */
  const raiseDoubt = ({ subjectId = '', subjectName = 'General', message, context = null }) => {
    const student = currentUser;
    const text = (message || '').trim();
    if (!student || (!text && !context)) {
      showToast('Please describe your doubt', 'warning');
      return null;
    }
    const now = new Date().toISOString();
    const doubt = {
      id: `doubt-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      avatar: student.avatar || '',
      subjectId,
      subjectName: subjectName || 'General',
      context,
      status: 'open', // 'open' (waiting for admin) | 'answered' | 'resolved'
      createdAt: now,
      updatedAt: now,
      seenByStudent: true,
      messages: [
        { id: `msg-${Date.now()}`, from: 'student', name: student.name, text: text || 'I have a doubt about this question.', at: now }
      ]
    };
    setDoubts((prev) => [doubt, ...prev]);
    showToast('Doubt sent to the admin. You will see the reply in My Doubts.', 'success');
    return doubt;
  };

  const replyToDoubt = (doubtId, text) => {
    const body = (text || '').trim();
    if (!body) return;
    const now = new Date().toISOString();
    const fromAdmin = currentRole === 'teacher' || currentRole === 'admin';
    setDoubts((prev) =>
      prev.map((d) =>
        d.id === doubtId
          ? {
              ...d,
              status: fromAdmin ? 'answered' : 'open',
              updatedAt: now,
              seenByStudent: !fromAdmin,
              messages: [
                ...d.messages,
                {
                  id: `msg-${Date.now()}`,
                  from: fromAdmin ? 'admin' : 'student',
                  name: currentUser?.name || (fromAdmin ? 'Admin' : 'Student'),
                  text: body,
                  at: now
                }
              ]
            }
          : d
      )
    );
    showToast(fromAdmin ? 'Reply sent to the student.' : 'Reply sent to the admin.', 'success');
  };

  const setDoubtStatus = (doubtId, status) => {
    setDoubts((prev) =>
      prev.map((d) => (d.id === doubtId ? { ...d, status, updatedAt: new Date().toISOString() } : d))
    );
  };

  const markDoubtSeen = (doubtId) => {
    setDoubts((prev) => prev.map((d) => (d.id === doubtId && !d.seenByStudent ? { ...d, seenByStudent: true } : d)));
  };

  const openDoubtsCount = doubts.filter((d) => d.status === 'open').length;

  // =========================================================================
  // SUBSCRIPTION & PAYMENT APPROVAL WORKFLOW
  // =========================================================================

  const submitSubscriptionRequest = (reqData) => {
    const subject = curriculumSubjects.find((s) => s.id === reqData.subjectId);
    const newReq = {
      // Snapshot of how long this payment unlocks the subject (0 = lifetime)
      validityDays: Number(subject?.validityDays) || 0,
      // Fixed end date chosen on the calendar (replaces validityDays when set)
      accessUntil: subject?.accessUntil || null,
      ...reqData,
      id: `sub-req-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reviewedAt: null
    };
    setSubscriptions((prev) => [newReq, ...prev]);
    showToast('Payment proof sent to Admin! Waiting for manual approval.', 'success', 5000);
  };

  /**
   * The access period a pending request gets by default (from the subject's plan).
   * Renewing while still active extends from the current end date, so the student never loses
   * remaining days. Returns { startsAt: Date, expiresAt: Date | null (lifetime), days, accessUntil }.
   */
  const computeDefaultPeriod = (req, allSubscriptions, now = new Date()) => {
    // Older requests have no snapshot: fall back to the subject's current validity
    const subject = curriculumSubjects.find((sub) => sub.id === req.subjectId);
    const subjectDays = Number(subject?.validityDays) || 0;
    const days = req.validityDays ?? subjectDays;
    // Calendar access: a fixed last day (older requests have no snapshot: use the subject's)
    const accessUntil = req.accessUntil !== undefined ? req.accessUntil : subject?.accessUntil || null;
    const fixedEnd = endOfDate(accessUntil);

    const current = pickLatestApproved(
      allSubscriptions.filter((s) => s.id !== req.id && s.studentId === req.studentId && s.subjectId === req.subjectId),
      now
    );
    const currentEnd = current?.timing.expiresAt;
    const stillActive = currentEnd && currentEnd > now;
    if (fixedEnd) {
      // Access runs from today until the chosen date (never shortening access already granted)
      return { startsAt: now, expiresAt: stillActive && currentEnd > fixedEnd ? currentEnd : fixedEnd, days, accessUntil };
    }
    const startsAt = stillActive ? currentEnd : now;
    return { startsAt, expiresAt: isLifetime(days) ? null : addDays(startsAt, days), days, accessUntil: null };
  };

  /** Default access period for a pending request, for the approval dialog. */
  const getDefaultAccessPeriod = (requestId) => {
    const req = subscriptions.find((s) => s.id === requestId);
    return req ? computeDefaultPeriod(req, subscriptions) : null;
  };

  /**
   * Approves a payment. Without options the plan's period is used; with
   * { expiresAt } (ISO string, or null for lifetime) the admin's own end date is used.
   */
  const approveSubscription = (requestId, options = {}) => {
    const now = new Date();
    const custom = Object.prototype.hasOwnProperty.call(options, 'expiresAt');
    setSubscriptions((prev) => {
      const req = prev.find((s) => s.id === requestId);
      if (!req) return prev;
      const period = computeDefaultPeriod(req, prev, now);
      const expiresAt = custom ? options.expiresAt : period.expiresAt ? period.expiresAt.toISOString() : null;

      return prev.map((s) =>
        s.id === requestId
          ? {
              ...s,
              status: 'approved',
              validityDays: Number(period.days) || 0,
              accessUntil: endOfDate(period.accessUntil) ? period.accessUntil : null,
              startsAt: period.startsAt.toISOString(),
              expiresAt,
              customEnd: custom,
              reviewedAt: now.toISOString().replace('T', ' ').slice(0, 16)
            }
          : s
      );
    });
    showToast('Subscription approved! Student access unlocked.', 'success');
  };

  /**
   * Admin: change when an approved subscription ends (ISO string, or null for lifetime).
   * A date that has already passed ends the student's access straight away.
   */
  const updateSubscriptionEnd = (subscriptionId, expiresAt) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId && s.status === 'approved'
          ? { ...s, expiresAt, customEnd: true, endChangedAt: new Date().toISOString() }
          : s
      )
    );
    const ended = expiresAt && new Date(expiresAt) <= new Date();
    showToast(
      expiresAt === null
        ? 'Access changed to lifetime.'
        : ended
        ? 'Access ended. The student can no longer open this subject.'
        : `Access now ends on ${formatDate(expiresAt)}.`,
      ended ? 'info' : 'success'
    );
  };

  const rejectSubscription = (requestId) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === requestId
          ? {
              ...s,
              status: 'rejected',
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : s
      )
    );
    showToast('Subscription request rejected.', 'info');
  };

  const checkEnrollmentStatus = (studentId, subjectId) => {
    const sub = curriculumSubjects.find((s) => s.id === subjectId);
    if (!sub) return 'locked';
    if (!sub.price || Number(sub.price) === 0) {
      return 'active'; // free course
    }
    const userSubs = subscriptions.filter(
      (s) => s.studentId === studentId && s.subjectId === subjectId
    );
    const latest = pickLatestApproved(userSubs);
    if (latest && latest.timing.state !== 'expired') {
      return 'active';
    }
    if (userSubs.some((s) => s.status === 'pending')) {
      return 'pending';
    }
    return latest ? 'expired' : 'locked';
  };

  // The student's current (furthest-reaching) approved subscription for a subject, with timing
  const getSubjectSubscription = (studentId, subjectId) =>
    pickLatestApproved(
      subscriptions.filter((s) => s.studentId === studentId && s.subjectId === subjectId)
    );

  const pendingSubscriptionsCount = subscriptions.filter(
    (s) => s.status === 'pending'
  ).length;

  // Student CRUD
  const addStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `STU${Date.now().toString().slice(-4)}`,
      enrollmentDate: new Date().toISOString().split('T')[0],
      completedQuizzes: 0,
      averageScore: 0,
      attendancePct: Number(studentData.attendancePct) || 90,
      cgpa: Number(studentData.cgpa) || 7.5,
      performanceStatus: studentData.performanceStatus || 'Good',
      subjectProgress: {
        'CE-301': 0, 'CE-202': 0, 'CE-204': 0, 'CE-302': 0, 'CE-103': 0,
        'CE-401': 0, 'CE-305': 0, 'CE-201': 0, 'CE-304': 0, 'CE-306': 0
      }
    };
    setStudents((prev) => [newStudent, ...prev]);
    showToast(`Student ${newStudent.name} registered successfully`, 'success');
  };

  const updateStudent = (id, updatedFields) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    showToast('Student details updated', 'success');
  };

  const deleteStudent = (id) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast(`Student ${student ? student.name : ''} removed`, 'info');
  };

  // Question CRUD
  const addQuestion = (questionData) => {
    const newQuestion = {
      ...questionData,
      id: `Q-${Date.now().toString().slice(-6)}`,
      marks: Number(questionData.marks) || 1
    };
    setQuestions((prev) => [newQuestion, ...prev]);
    showToast('Question added to Question Bank', 'success');
    return newQuestion;
  };

  const updateQuestion = (id, updatedFields) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updatedFields } : q))
    );
    showToast('Question updated successfully', 'success');
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    // Also remove from any quiz that references it
    setQuizzes((prev) =>
      prev.map((quiz) => ({
        ...quiz,
        questionIds: quiz.questionIds.filter((qId) => qId !== id)
      }))
    );
    showToast('Question deleted from Question Bank', 'info');
  };

  // Quiz Management CRUD
  const addQuiz = (quizData) => {
    const newQuiz = {
      ...quizData,
      id: `QUIZ-${(quizzes.length + 1).toString().padStart(3, '0')}`,
      createdDate: new Date().toISOString().split('T')[0],
      durationMinutes: Number(quizData.durationMinutes) || 15,
      passingScorePct: Number(quizData.passingScorePct) || 60,
      allowedAttempts: Number(quizData.allowedAttempts) || 2,
      status: quizData.status || 'Published',
      questionIds: quizData.questionIds || []
    };
    setQuizzes((prev) => [newQuiz, ...prev]);
    showToast(`Quiz "${newQuiz.title}" created`, 'success');
    return newQuiz;
  };

  const updateQuiz = (id, updatedFields) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updatedFields } : q))
    );
    showToast('Quiz updated successfully', 'success');
  };

  const deleteQuiz = (id) => {
    const q = quizzes.find((quiz) => quiz.id === id);
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    showToast(`Quiz "${q?.title || id}" deleted`, 'info');
  };

  const togglePublishQuiz = (id) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const newStatus = q.status === 'Published' ? 'Draft' : 'Published';
          showToast(`Quiz is now ${newStatus}`, 'info');
          return { ...q, status: newStatus };
        }
        return q;
      })
    );
  };

  // Submit Quiz Attempt Handler
  const recordAttempt = (attemptData) => {
    const newAttempt = {
      ...attemptData,
      id: `ATT-${Date.now().toString().slice(-6)}`,
      submittedAt: new Date().toISOString()
    };

    setAttempts((prev) => [newAttempt, ...prev]);

    // Update student's completed count and average score in state
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id === attemptData.studentId) {
          const studentAttempts = [...attempts.filter((a) => a.studentId === stu.id), newAttempt];
          const totalScorePct = studentAttempts.reduce((acc, a) => acc + a.percentage, 0);
          const newAvg = Number((totalScorePct / studentAttempts.length).toFixed(1));
          return {
            ...stu,
            completedQuizzes: studentAttempts.length,
            averageScore: newAvg,
            performanceStatus: newAvg >= 85 ? 'Excellent' : newAvg >= 75 ? 'Good' : newAvg >= 60 ? 'Average' : 'At Risk'
          };
        }
        return stu;
      })
    );

    // Add notification for teacher
    const newNotif = {
      id: `N-${Date.now()}`,
      title: 'New Quiz Attempt',
      message: `${attemptData.studentName} scored ${attemptData.score}/${attemptData.totalMarks} (${attemptData.percentage}%) on ${attemptData.quizTitle}`,
      time: 'Just now',
      type: attemptData.status === 'PASSED' ? 'success' : 'danger',
      read: false,
      forRole: 'teacher'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setLastQuizResult(newAttempt);
    setActiveQuizForAttempt(null);
    setActiveView('quiz-result');
  };

  // Reset to initial factory dummy data
  const resetDemoData = () => {
    localStorage.removeItem('qsap_students');
    localStorage.removeItem('qsap_questions');
    localStorage.removeItem('qsap_quizzes');
    localStorage.removeItem('qsap_attempts');
    localStorage.removeItem('qsap_notifications');

    setStudents(STUDENTS);
    setQuestions(QUESTIONS_BANK);
    setQuizzes(INITIAL_QUIZZES);
    setAttempts(INITIAL_ATTEMPTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Platform reset to default Civil Engineering demo data', 'info');
  };

  // =========================================================================
  // ANNOUNCEMENTS & NOTIFICATIONS MANAGEMENT
  // =========================================================================
  const createAnnouncement = (data) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: data.title || 'Untitled Faculty Notice',
      message: data.message || '',
      type: data.type || 'announcement', // 'announcement', 'exam_alert', 'important', 'urgent', 'system'
      priority: data.priority || 'normal', // 'normal', 'high', 'urgent'
      targetAudience: data.targetAudience || 'all', // 'all', 'batch', 'students'
      targetBatch: data.targetBatch || 'All',
      targetSemester: data.targetSemester || 'All',
      targetStudentIds: Array.isArray(data.targetStudentIds) ? data.targetStudentIds : [],
      author: data.author || (currentUser?.name || 'Dr. Rajesh Sharma'),
      authorRole: data.authorRole || (currentRole === 'teacher' ? 'Admin / Faculty' : 'Department Faculty'),
      authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      time: 'Just now',
      createdAt: new Date().toISOString(),
      read: false,
      pinned: !!data.pinned,
      forRole: data.forRole || 'student', // 'student', 'all', 'teacher'
      actionView: data.actionView || null,
      actionLabel: data.actionLabel || null,
      attachmentName: data.attachmentName || null
    };

    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Notice "${newNotif.title}" published & broadcasted!`, 'success');
    return newNotif;
  };

  const deleteAnnouncement = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Announcement removed', 'info');
  };

  const togglePinAnnouncement = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read
  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  // Filter notifications for a specific user persona
  const getFilteredNotificationsForUser = (user = currentUser, role = currentRole) => {
    if (role === 'teacher' || role === 'admin') {
      return notifications;
    }

    // For student persona
    return notifications.filter((n) => {
      if (n.forRole === 'teacher') return false;

      // If targeted to specific students
      if (n.targetAudience === 'students') {
        return Array.isArray(n.targetStudentIds) && n.targetStudentIds.includes(user?.id);
      }

      // If targeted to specific batch or semester
      if (n.targetAudience === 'batch') {
        if (n.targetBatch && n.targetBatch !== 'All' && user?.batch && n.targetBatch !== user.batch) {
          return false;
        }
        if (n.targetSemester && n.targetSemester !== 'All' && user?.semester && n.targetSemester !== user.semester) {
          return false;
        }
        return true;
      }

      // Default: broadcast to all students
      return true;
    });
  };

  // CSV Export utility
  const exportStudentsCSV = () => {
    const headers = [
      'Student ID', 'Name', 'Email', 'Phone', 'Department',
      'Semester', 'Batch', 'Enrollment Date', 'Attendance %',
      'CGPA', 'Completed Quizzes', 'Average Score %', 'Status'
    ];
    const rows = students.map((s) => [
      s.studentId, `"${s.name}"`, s.email, s.phone, `"${s.department}"`,
      s.semester, s.batch, s.enrollmentDate, s.attendancePct,
      s.cgpa, s.completedQuizzes, s.averageScore, s.performanceStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CohesionTech_Students_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported student directory CSV', 'success');
  };

  const exportResultsCSV = () => {
    const headers = [
      'Attempt ID', 'Student ID', 'Student Name', 'Quiz Title',
      'Subject', 'Score', 'Total Marks', 'Percentage %', 'Status',
      'Time Spent (s)', 'Submitted At'
    ];
    const rows = attempts.map((a) => [
      a.id, a.rollNumber || a.studentId, `"${a.studentName}"`, `"${a.quizTitle}"`,
      a.subjectId, a.score, a.totalMarks, a.percentage, a.status,
      a.timeSpentSeconds, a.submittedAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CohesionTech_Assessment_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported assessment results CSV', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        backendEnabled,
        dataReady,
        loadError,
        loadServerData,
        serverInitialized,
        setServerInitialized,
        loginWithPassword,
        resetAllLocalData,
        darkMode,
        setDarkMode,
        currentRole,
        setCurrentRole,
        currentUserId,
        setCurrentUserId,
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchRole,
        activeView,
        setActiveView,
        activeQuizForAttempt,
        setActiveQuizForAttempt,
        lastQuizResult,
        setLastQuizResult,
        selectedStudentForProfile,
        setSelectedStudentForProfile,
        globalSearchOpen,
        setGlobalSearchOpen,
        students,
        teachers,
        subjects,
        questions,
        quizzes,
        attempts,
        notifications,
        setNotifications,
        createAnnouncement,
        deleteAnnouncement,
        togglePinAnnouncement,
        markNotificationRead,
        getFilteredNotificationsForUser,
        toasts,
        showToast,
        removeToast,
        addStudent,
        updateStudent,
        deleteStudent,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        togglePublishQuiz,
        recordAttempt,
        resetDemoData,
        markNotificationsRead,
        exportStudentsCSV,
        exportResultsCSV,
        getPortalUrl,
        copyPortalUrl,
        studentModules,
        updateStudentModules,
        adminModules,
        updateAdminModules,
        contentAccess,
        updateContentAccess,
        curriculumSubjects,
        curriculumAttempts,
        addSubject,
        updateSubject,
        deleteSubject,
        addModule,
        updateModule,
        deleteModule,
        addSection,
        updateSection,
        deleteSection,
        addNote,
        deleteNote,
        addVideo,
        deleteVideo,
        addCurriculumQuestion,
        addCurriculumQuestionsBulk,
        deleteCurriculumQuestion,
        recordCurriculumAttempt,
        subscriptions,
        submitSubscriptionRequest,
        approveSubscription,
        getDefaultAccessPeriod,
        updateSubscriptionEnd,
        rejectSubscription,
        checkEnrollmentStatus,
        getSubjectSubscription,
        studentAccounts,
        registerStudent,
        loginStudentWithPassword,
        completePasswordChange,
        changeOwnPassword,
        adminResetStudentPassword,
        adminDeleteStudentAccount,
        retests,
        getRetestFor,
        getExamAccess,
        requestRetest,
        grantRetest,
        declineRetest,
        revokeRetest,
        pendingRetestCount,
        doubts,
        raiseDoubt,
        replyToDoubt,
        setDoubtStatus,
        markDoubtSeen,
        openDoubtsCount,
        pendingSubscriptionsCount,
        difficultyLevels,
        updateDifficultyLevels,
        resetDifficultyLevels,
        getDifficultyMeta,
        getDifficultyLabel,
        matchesDifficulty,
        examinations,
        setExaminations,
        examAttempts,
        setExamAttempts,
        examMonitoringSessions,
        setExamMonitoringSessions,
        activeExamForAttempt,
        setActiveExamForAttempt,
        lastExamResult,
        setLastExamResult,
        selectedExamForMonitoring,
        setSelectedExamForMonitoring,
        selectedExamForAnalytics,
        setSelectedExamForAnalytics,
        createExamination,
        updateExamination,
        deleteExamination,
        startStudentExam,
        saveExamDraftAnswer,
        submitStudentExamAttempt,
        exportExamResultsCSV,
        mockTests,
        mockAttempts,
        activeMockTest,
        setActiveMockTest,
        createMockTest,
        updateMockTest,
        deleteMockTest,
        startMockTest,
        submitMockTest
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

