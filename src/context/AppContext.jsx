import React, { createContext, useContext, useState, useEffect } from 'react';
import { TEACHERS, STUDENTS, SUBJECTS } from '../data/initialData';
import { QUESTIONS_BANK } from '../data/questionsData';
import { INITIAL_QUIZZES, INITIAL_ATTEMPTS, INITIAL_NOTIFICATIONS } from '../data/quizzesData';

const AppContext = createContext();

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

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('qsap_dark_mode') === 'true';
  });

  // Auth / Role state: default starts logged in as Dr. Rajesh Sharma (teacher)
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('qsap_role') || 'student';
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    return localStorage.getItem('qsap_user_id') || 'STU001';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('qsap_auth') !== 'false';
  });

  // Active navigation view
  const [activeView, setActiveView] = useState('dashboard');
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
    showToast(`Switched to ${newRole === 'teacher' ? 'Teacher' : 'Student'} mode`, 'info');
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
    showToast('Logged out of QSAP', 'info');
  };

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
    link.setAttribute('download', `QSAP_Students_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
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
    link.setAttribute('download', `QSAP_Assessment_Results_${new Date().toISOString().slice(0, 10)}.csv`);
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
        exportResultsCSV
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

