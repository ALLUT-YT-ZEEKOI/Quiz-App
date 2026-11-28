// Both clients and the sync API use the same key so pinning on two devices
// creates one shortcut. An empty sectionId identifies general practice.
export const testPinId = (studentId, { kind, testId, subjectId, moduleId, sectionId }) =>
  JSON.stringify(kind === 'mock' ? [studentId, kind, testId] : [studentId, kind, subjectId, moduleId, sectionId]);
