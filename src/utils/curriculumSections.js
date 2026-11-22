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
