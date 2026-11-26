// Student modules the admin can switch on or off for every student.
// The admin's choices are stored as one settings item: { id: 'studentModules', modules: { [moduleId]: boolean } }.
// A module that has never been set counts as enabled, so new modules appear for students by default.

export const STUDENT_MODULES_SETTING_ID = 'studentModules';

export const STUDENT_MODULES = [
  {
    id: 'subjects',
    label: 'Subjects & Curriculum',
    description: 'Subjects, modules, videos, notes and module quizzes.',
    views: ['subjects', 'dashboard']
  },
  {
    id: 'examinations',
    label: 'Live Examinations',
    description: 'Scheduled and live exams, and exam results.',
    views: ['examinations', 'live-exams']
  },
  {
    id: 'mock-tests',
    label: 'Mock Tests',
    description: 'Day-wise timed practice tests.',
    views: ['mock-tests']
  },
  {
    id: 'quizzes',
    label: 'Quiz & Assessments',
    description: 'Quiz attempts and assessment results.',
    views: ['results']
  },
  {
    id: 'review',
    label: 'Marks & Answers',
    description: 'Subject marks, answer review and retest requests.',
    views: ['review', 'answers']
  },
  {
    id: 'rankings',
    label: 'Rankings',
    description: "Every student's rank in live exams and mock tests (names and percentages only).",
    views: ['rankings']
  },
  {
    id: 'doubts',
    label: 'My Doubts',
    description: 'Ask doubts and read replies from the admin.',
    views: ['doubts']
  },
  {
    id: 'notifications',
    label: 'Notice Board',
    description: 'Announcements and alerts from the admin.',
    views: ['notifications', 'announcements']
  }
];

/** { moduleId: boolean } for every student module, from the synced settings list. */
export const resolveStudentModules = (settings) => {
  const saved = (settings || []).find((s) => s?.id === STUDENT_MODULES_SETTING_ID)?.modules || {};
  return Object.fromEntries(STUDENT_MODULES.map((m) => [m.id, saved[m.id] !== false]));
};

/** The student module a view belongs to, or null for views that are always available (e.g. profile). */
export const moduleForView = (view) => STUDENT_MODULES.find((m) => m.views.includes(view))?.id || null;

// ---------------------------------------------------------------------------
// Subject content access: inside each subject the admin can hide Lesson Videos,
// Study Notes or Questions & Answers, for the whole subject or for one course (module).
// Stored as { id: 'contentAccess', subjects: { [subjectId]: { videos?, notes?, questions?, modules: { [moduleId]: { videos?, notes?, questions? } } } } }.
// A course setting wins over its subject's setting; anything never set counts as visible.
// The backend applies the same rules (backend/src/services/contentAccess.js).
// ---------------------------------------------------------------------------

export const CONTENT_ACCESS_SETTING_ID = 'contentAccess';

export const CONTENT_TYPES = [
  { id: 'videos', label: 'Lesson Videos' },
  { id: 'notes', label: 'Study Notes' },
  { id: 'questions', label: 'Questions & Answers' }
];

/** The raw content-access config ({ [subjectId]: {...} }) from the synced settings list. */
export const resolveContentAccess = (settings) =>
  (settings || []).find((s) => s?.id === CONTENT_ACCESS_SETTING_ID)?.subjects || {};

/** { videos, notes, questions } booleans for one subject, or one course in it when moduleId is given. */
export const getContentAccess = (config, subjectId, moduleId) => {
  const subject = config?.[subjectId] || {};
  const course = (moduleId && subject.modules?.[moduleId]) || {};
  return Object.fromEntries(
    CONTENT_TYPES.map(({ id }) => [id, (course[id] ?? subject[id]) !== false])
  );
};

/**
 * A copy of a subject as a student should see it: disabled content is removed from each course,
 * and each course gets `contentAccess` so the screens can hide the matching tabs.
 */
export const applyContentAccess = (subject, config) => {
  if (!subject) return subject;
  return {
    ...subject,
    modules: (subject.modules || []).map((m) => {
      const access = getContentAccess(config, subject.id, m.id);
      return {
        ...m,
        contentAccess: access,
        videos: access.videos
          ? (m.videos || []).map((v) => (access.notes ? v : { ...v, notes: '' }))
          : [],
        notes: access.notes ? m.notes || [] : [],
        questions: access.questions ? m.questions || [] : []
      };
    })
  };
};
