// Subject content access (Lesson Videos / Study Notes / Questions & Answers) set by the admin.
// Same rules as the frontend's src/utils/studentModules.js: a course setting wins over its
// subject's setting, and anything never set counts as visible.

const CONTENT_TYPES = ['videos', 'notes', 'questions'];

export const CONTENT_ACCESS_SETTING_ID = 'contentAccess';

export const getContentAccess = (config, subjectId, moduleId) => {
  const subject = config?.[subjectId] || {};
  const course = (moduleId && subject.modules?.[moduleId]) || {};
  return Object.fromEntries(CONTENT_TYPES.map((t) => [t, (course[t] ?? subject[t]) !== false]));
};

/** Removes the content a student may not see from a subject. */
export const applyContentAccess = (subject, config) => {
  if (!subject || !config || !config[subject.id]) return subject;
  return {
    ...subject,
    modules: (subject.modules || []).map((m) => {
      const access = getContentAccess(config, subject.id, m.id);
      return {
        ...m,
        videos: access.videos ? (m.videos || []).map((v) => (access.notes ? v : { ...v, notes: '' })) : [],
        notes: access.notes ? m.notes || [] : [],
        questions: access.questions ? m.questions || [] : []
      };
    })
  };
};
