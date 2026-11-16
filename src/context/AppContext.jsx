import React, { createContext, useContext, useState, useEffect } from 'react';
import { TEACHERS, STUDENTS, SUBJECTS } from '../data/initialData';
import { QUESTIONS_BANK } from '../data/questionsData';
import { INITIAL_QUIZZES, INITIAL_ATTEMPTS, INITIAL_NOTIFICATIONS } from '../data/quizzesData';
import { INITIAL_CURRICULUM, INITIAL_CURRICULUM_ATTEMPTS, INITIAL_SUBSCRIPTIONS } from '../data/curriculumData';

const AppContext = createContext();

export const DEFAULT_DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', color: 'emerald', dot: '🟢' },
  { id: 'medium', label: 'Medium', color: 'amber', dot: '🟡' },
  { id: 'hard', label: 'Hard', color: 'red', dot: '🔴' }
];

const CURRENT_DATA_VERSION = 'qsap_v3_civil_100_questions_all_subjects';

export const AppProvider = ({ children }) => {
  // Check if saved data matches latest schema version with all 100 technical questions
  const needsDataReset = (() => {
    try {
      const savedVer = localStorage.getItem('qsap_data_version');
      const savedQ = localStorage.getItem('qsap_questions');
      if (savedVer !== CURRENT_DATA_VERSION || !savedQ) return true;
      const parsedQ = JSON.parse(savedQ);
      return !Array.isArray(parsedQ) || parsedQ.length < 100;
    } catch (e) {
      return true;
    }
  })();

  if (needsDataReset) {
    try {
      localStorage.setItem('qsap_data_version', CURRENT_DATA_VERSION);
      localStorage.setItem('qsap_questions', JSON.stringify(QUESTIONS_BANK));
      localStorage.setItem('qsap_quizzes', JSON.stringify(INITIAL_QUIZZES));
      localStorage.setItem('qsap_students', JSON.stringify(STUDENTS));
      localStorage.setItem('qsap_attempts', JSON.stringify(INITIAL_ATTEMPTS));
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
    return localStorage.getItem('qsap_role') || 'teacher';
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    if (initialRoute.role === 'teacher') return 'T001';
    if (initialRoute.role === 'student') return 'STU001';
    return localStorage.getItem('qsap_user_id') || 'T001';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('qsap_auth') !== 'false';
  });

  // Active navigation view
  const [activeView, setActiveView] = useState(() => {
    return initialRoute.view || 'dashboard';
  });
  const [activeQuizForAttempt, setActiveQuizForAttempt] = useState(null);
  const [lastQuizResult, setLastQuizResult] = useState(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Core Data States (persisted in localStorage)
  const [students, setStudents] = useState(() => {
    if (needsDataReset) return STUDENTS;
    const saved = localStorage.getItem('qsap_students');
    return saved ? JSON.parse(saved) : STUDENTS;
  });

  const [teachers] = useState(TEACHERS);
  const [subjects] = useState(SUBJECTS);

  const [questions, setQuestions] = useState(() => {
    if (needsDataReset) return QUESTIONS_BANK;
    const saved = localStorage.getItem('qsap_questions');
    return saved ? JSON.parse(saved) : QUESTIONS_BANK;
  });

  const [quizzes, setQuizzes] = useState(() => {
    if (needsDataReset) return INITIAL_QUIZZES;
    const saved = localStorage.getItem('qsap_quizzes');
    return saved ? JSON.parse(saved) : INITIAL_QUIZZES;
  });

  const [attempts, setAttempts] = useState(() => {
    if (needsDataReset) return INITIAL_ATTEMPTS;
    const saved = localStorage.getItem('qsap_attempts');
    return saved ? JSON.parse(saved) : INITIAL_ATTEMPTS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('qsap_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Streamlined Curriculum state: Subjects -> Modules -> Videos & Questions (Easy/Medium/Hard)
  const [curriculumSubjects, setCurriculumSubjects] = useState(() => {
    try {
      const saved = localStorage.getItem('cohesion_curriculum');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Curriculum parse notice:', e);
    }
    return INITIAL_CURRICULUM;
  });

  const [curriculumAttempts, setCurriculumAttempts] = useState(() => {
    try {
      const saved = localStorage.getItem('cohesion_curriculum_attempts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Curriculum attempts parse notice:', e);
    }
    return INITIAL_CURRICULUM_ATTEMPTS;
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('cohesion_subscriptions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Subscriptions parse notice:', e);
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cohesion_curriculum', JSON.stringify(curriculumSubjects));
    } catch (e) {}
  }, [curriculumSubjects]);

  useEffect(() => {
    try {
      localStorage.setItem('cohesion_curriculum_attempts', JSON.stringify(curriculumAttempts));
    } catch (e) {}
  }, [curriculumAttempts]);

  useEffect(() => {
    try {
      localStorage.setItem('cohesion_subscriptions', JSON.stringify(subscriptions));
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
      localStorage.setItem('cohesion_difficulty_levels', JSON.stringify(difficultyLevels));
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
    localStorage.setItem('qsap_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('qsap_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('qsap_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('qsap_attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem('qsap_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('qsap_role', currentRole);
    localStorage.setItem('qsap_user_id', currentUserId);
    localStorage.setItem('qsap_auth', isAuthenticated ? 'true' : 'false');
  }, [currentRole, currentUserId, isAuthenticated]);

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
    ? teachers.find((t) => t.id === currentUserId) || teachers[0]
    : students.find((s) => s.id === currentUserId) || students[0];

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
    const basePath = currentRole === 'teacher' ? '/admin' : '/student';
    let targetPath = basePath;
    if (activeView && activeView !== 'dashboard') {
      targetPath = `${basePath}/${activeView}`;
    }

    if (window.location.pathname !== targetPath) {
      window.history.replaceState({ role: currentRole, view: activeView }, '', targetPath);
    }
  }, [currentRole, activeView]);

  // Handle browser back / forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const route = parseInitialUrl();
      if (route.role && route.role !== currentRole) {
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
    setCurrentRole(role);
    setCurrentUserId(userId || (role === 'teacher' ? 'T001' : 'STU001'));
    setIsAuthenticated(true);
    setActiveView('dashboard');
    showToast('Logged in successfully', 'success');
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false);
    showToast('Logged out of CohesionTech', 'info');
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
    setCurriculumSubjects((prev) => prev.filter((s) => s.id !== id));
    showToast('Subject removed', 'info');
  };

  // Module CRUD
  const addModule = (subjectId, moduleData) => {
    const newModule = {
      ...moduleData,
      id: `mod-${Date.now()}`,
      videos: [],
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

  // Video CRUD
  const addVideo = (subjectId, moduleId, videoData) => {
    const newVideo = {
      ...videoData,
      id: `vid-${Date.now()}`
    };
    setCurriculumSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              modules: (s.modules || []).map((m) =>
                m.id === moduleId
                  ? { ...m, videos: [...(m.videos || []), newVideo] }
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
  // SUBSCRIPTION & PAYMENT APPROVAL WORKFLOW
  // =========================================================================

  const submitSubscriptionRequest = (reqData) => {
    const newReq = {
      ...reqData,
      id: `sub-req-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reviewedAt: null
    };
    setSubscriptions((prev) => [newReq, ...prev]);
    showToast('Payment proof sent to Admin! Waiting for manual approval.', 'success', 5000);
  };

  const approveSubscription = (requestId) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === requestId
          ? {
              ...s,
              status: 'approved',
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : s
      )
    );
    showToast('Subscription approved! Student access unlocked.', 'success');
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
    if (userSubs.some((s) => s.status === 'approved')) {
      return 'active';
    }
    if (userSubs.some((s) => s.status === 'pending')) {
      return 'pending';
    }
    return 'locked';
  };

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

  // Mark all notifications as read
  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        curriculumSubjects,
        curriculumAttempts,
        addSubject,
        updateSubject,
        deleteSubject,
        addModule,
        updateModule,
        deleteModule,
        addVideo,
        deleteVideo,
        addCurriculumQuestion,
        addCurriculumQuestionsBulk,
        deleteCurriculumQuestion,
        recordCurriculumAttempt,
        subscriptions,
        submitSubscriptionRequest,
        approveSubscription,
        rejectSubscription,
        checkEnrollmentStatus,
        pendingSubscriptionsCount,
        difficultyLevels,
        updateDifficultyLevels,
        resetDifficultyLevels,
        getDifficultyMeta,
        getDifficultyLabel,
        matchesDifficulty
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

