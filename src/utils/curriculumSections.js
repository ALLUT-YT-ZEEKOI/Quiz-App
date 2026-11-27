// Module sections: Subject -> Module -> Sections -> Videos
//
// Data shape:
//   module.sections = [{ id, title, description }]   (ordered)
//   module.videos   = [{ id, sectionId, title, ... }] (flat list, tagged by section)
//
// Videos stay in a flat list so existing counts (module.videos.length) keep working;
// grouping is derived from each video's sectionId.

export const createSectionId = () =>
  `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Ensures a module has at least one section and that every video points to an
 * existing section. Legacy modules (no sections) get a "Section 1" that holds
 * all of their existing videos, so nothing is lost on upgrade.
 */
export const normalizeModuleSections = (module) => {
  if (!module) return module;
  const videos = module.videos || [];
  let sections = Array.isArray(module.sections) ? module.sections : [];

  if (sections.length === 0) {
    sections = [{ id: `sec-${module.id}-1`, title: 'Section 1', description: '' }];
  }

  const validIds = new Set(sections.map((s) => s.id));
  const fallbackId = sections[0].id;
  const needsVideoFix = videos.some((v) => !validIds.has(v.sectionId));

  if (sections === module.sections && !needsVideoFix) return module;

  return {
    ...module,
    sections,
    videos: needsVideoFix
      ? videos.map((v) => (validIds.has(v.sectionId) ? v : { ...v, sectionId: fallbackId }))
      : videos
  };
};

export const normalizeCurriculumSections = (subjects) =>
  (subjects || []).map((s) => ({
    ...s,
    modules: (s.modules || []).map(normalizeModuleSections)
  }));

/**
 * Returns the module's sections in order, each with its videos, plus a flat
 * playback-ordered list where every entry knows its section position.
 */
export const groupVideosBySection = (module) => {
  const normalized = normalizeModuleSections(module) || { sections: [], videos: [] };
  const videos = normalized.videos || [];

  const groups = (normalized.sections || []).map((section, sectionIndex) => ({
    section,
    sectionIndex,
    videos: videos.filter((v) => v.sectionId === section.id)
  }));

  const ordered = groups.flatMap((g) =>
    g.videos.map((video, lessonIndex) => ({
      video,
      section: g.section,
      sectionIndex: g.sectionIndex,
      lessonIndex,
      sectionVideoCount: g.videos.length
    }))
  );

  return { groups, ordered };
};

// ---------------------------------------------------------------------------
// Sections are shared by a module's videos, study notes and questions.
//   note.sectionId                 -> which section a note belongs to
//   question.sectionId + .day      -> which section and day (1, 2, 3 ...) a question belongs to
//   section.days                   -> how many days the admin created in that section (at least 1)
// Notes / questions without a valid section are "unsorted" (older content), shown separately.
// ---------------------------------------------------------------------------

const sectionIdsOf = (module) => new Set((module?.sections || []).map((s) => s.id));

/** Day numbers of a section: 1..N, N = the section's day count or the highest day used. */
export const sectionDays = (module, sectionId) => {
  const section = (module?.sections || []).find((s) => s.id === sectionId);
  const used = (module?.questions || [])
    .filter((q) => q.sectionId === sectionId)
    .map((q) => Number(q.day) || 1);
  const n = Math.max(1, Number(section?.days) || 1, ...used);
  return Array.from({ length: n }, (_, i) => i + 1);
};

/** True when a question sits in an existing section (so it belongs to a section / day). */
export const isSortedQuestion = (module, q) => sectionIdsOf(module).has(q?.sectionId);

/** Notes grouped by section, plus the unsorted ones. */
export const groupNotesBySection = (module) => {
  const ids = sectionIdsOf(module);
  const notes = module?.notes || [];
  return {
    groups: (module?.sections || []).map((section, sectionIndex) => ({
      section,
      sectionIndex,
      notes: notes.filter((n) => n.sectionId === section.id)
    })),
    unsorted: notes.filter((n) => !ids.has(n.sectionId))
  };
};

/** Questions grouped by section and day, plus the unsorted ones. */
export const groupQuestionsBySection = (module) => {
  const ids = sectionIdsOf(module);
  const questions = module?.questions || [];
  return {
    groups: (module?.sections || []).map((section, sectionIndex) => ({
      section,
      sectionIndex,
      days: sectionDays(module, section.id).map((day) => ({
        day,
        questions: questions.filter((q) => q.sectionId === section.id && (Number(q.day) || 1) === day)
      }))
    })),
    unsorted: questions.filter((q) => !ids.has(q.sectionId))
  };
};

/** Defaults for a section · day's quiz behaviour (and for general practice). */
export const DEFAULT_DAY_QUIZ_SETTINGS = {
  allowRetest: true,
  shuffleQuestions: false,
  shuffleOptions: false
};

/**
 * Quiz settings for one practice test: a section's day, or general (unsorted) practice.
 * Per-day values live on section.daySettings["1"], …; missing days fall back to the
 * module-level allowRetest / shuffleQuestions / shuffleOptions (older modules).
 */
export const dayQuizSettings = (module, sectionId, day) => {
  const fromModule = {
    allowRetest: module?.allowRetest !== false,
    shuffleQuestions: !!module?.shuffleQuestions,
    shuffleOptions: !!module?.shuffleOptions
  };
  if (!sectionId) return fromModule;

  const section = (module?.sections || []).find((s) => s.id === sectionId);
  const stored = section?.daySettings?.[String(Number(day) || 1)];
  if (!stored) return fromModule;

  return {
    allowRetest: stored.allowRetest !== false,
    shuffleQuestions: !!stored.shuffleQuestions,
    shuffleOptions: !!stored.shuffleOptions
  };
};

/** A practice test inside a module: one section's day, or the unsorted ("general") questions. */
export const testKeyOf = (sectionId, day) => (sectionId ? `${sectionId}:${Number(day) || 1}` : 'general');

/** "Section 1 · Day 2" (or "General practice") for a section / day of a module. */
export const testLabelOf = (module, sectionId, day) => {
  if (!sectionId) return 'General practice';
  const section = (module?.sections || []).find((s) => s.id === sectionId);
  return `${section?.title || 'Section'} · Day ${Number(day) || 1}`;
};

/** The questions of one practice test (target = { sectionId, day } or { general: true }). */
export const questionsForTest = (module, target) => {
  if (!target) return [];
  const questions = module?.questions || [];
  if (target.general) return questions.filter((q) => !isSortedQuestion(module, q));
  return questions.filter((q) => q.sectionId === target.sectionId && (Number(q.day) || 1) === Number(target.day));
};
