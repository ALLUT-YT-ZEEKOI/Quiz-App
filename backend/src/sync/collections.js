// Synced collections: names used by the frontend -> MongoDB collections + access rules.
//
// Each frontend item is stored as one MongoDB document: { _id: <item key>, ...item, _updatedAt }.
// Deleted items are kept as tombstones ({ _deleted: true }) so other devices learn about deletions.

import { getDb } from '../db.js';
import { scoreModuleQuiz } from '../services/scoring.js';

const byId = (item) => item?.id;

export const COLLECTIONS = {
  curriculum: { mongo: 'curriculum_subjects', key: byId },
  curriculumAttempts: { mongo: 'curriculum_attempts', key: byId, own: true },
  subscriptions: { mongo: 'subscriptions', key: byId, own: true },
  examinations: { mongo: 'examinations', key: byId },
  examAttempts: { mongo: 'exam_attempts', key: byId, own: true },
  // Live monitoring sessions have no id: one per exam + student
  examMonitoring: { mongo: 'exam_monitoring', key: (i) => (i?.examId && i?.studentId ? `${i.examId}:${i.studentId}` : undefined), own: true },
  retests: { mongo: 'retests', key: byId, own: true },
  doubts: { mongo: 'doubts', key: byId, own: true },
  notifications: { mongo: 'notifications', key: byId },
  students: { mongo: 'students', key: byId },
  questions: { mongo: 'questions', key: byId, adminOnly: true },
  quizzes: { mongo: 'quizzes', key: byId },
  attempts: { mongo: 'quiz_attempts', key: byId, own: true },
  difficultyLevels: { mongo: 'difficulty_levels', key: byId }
};

export const COLLECTION_NAMES = Object.keys(COLLECTIONS);

export const collectionOf = (name) => getDb().collection(COLLECTIONS[name].mongo);

/** Strips storage fields and returns the plain frontend item. */
export const toItem = (doc) => {
  if (!doc) return doc;
  const { _id, _updatedAt, _deleted, ...item } = doc;
  return item;
};

/** Removes any client-supplied storage/operator fields before saving. */
export const cleanIncoming = (item) => {
  const out = {};
  for (const [k, v] of Object.entries(item || {})) {
    if (k.startsWith('_') || k.startsWith('$')) continue;
    out[k] = v;
  }
  return out;
};

// ---------------------------------------------------------------------------
// Per-student read context (what a student is allowed to see)
// ---------------------------------------------------------------------------
export const buildStudentContext = async (studentId) => {
  const db = getDb();
  const now = new Date();
  const [subs, attempts] = await Promise.all([
    db.collection('subscriptions').find({ studentId, status: 'approved', _deleted: { $ne: true } }).toArray(),
    db.collection('exam_attempts').find({ studentId, _deleted: { $ne: true } }, { projection: { examId: 1 } }).toArray()
  ]);
  const activeSubjectIds = new Set(
    subs.filter((s) => !s.expiresAt || new Date(s.expiresAt) > now).map((s) => s.subjectId)
  );
  return { studentId, activeSubjectIds, attemptedExamIds: new Set(attempts.map((a) => a.examId)) };
};

const PUBLIC_STUDENT_FIELDS = ['id', 'studentId', 'name', 'avatar', 'department', 'semester', 'batch', 'performanceStatus'];

/** Shapes an item for a student: hides answers, locked content and other students' details. */
export const sanitizeForStudent = (name, item, ctx) => {
  if (name === 'examinations') {
    if (ctx.attemptedExamIds.has(item.id)) return item;
    // Before attempting: no correct answers / explanations
    return {
      ...item,
      questions: (item.questions || []).map(({ correctAnswer, explanation, ...q }) => q)
    };
  }

  if (name === 'curriculum') {
    const isFree = !item.price || Number(item.price) === 0;
    if (isFree || ctx.activeSubjectIds.has(item.id)) return item;
    // Not subscribed: keep titles/counts for the course page, hide videos, notes and questions
    return {
      ...item,
      locked: true,
      modules: (item.modules || []).map((m) => ({
        ...m,
        videos: (m.videos || []).map((v) => ({ id: v.id, sectionId: v.sectionId, title: v.title, duration: v.duration, videoUrl: '' })),
        notes: (m.notes || []).map((n) => ({ id: n.id, type: n.type, title: n.title, createdAt: n.createdAt })),
        questions: (m.questions || []).map((q) => ({ id: q.id, difficulty: q.difficulty }))
      }))
    };
  }

  if (name === 'students' && item.id !== ctx.studentId) {
    return Object.fromEntries(PUBLIC_STUDENT_FIELDS.filter((k) => k in item).map((k) => [k, item[k]]));
  }

  return item;
};

/** MongoDB filter for what a user can read in a collection (null = nothing). */
export const readFilter = (name, user) => {
  const base = { _deleted: { $ne: true } };
  if (user.role === 'admin') return base;
  const def = COLLECTIONS[name];
  if (def.adminOnly) return null;
  if (def.own) return { ...base, studentId: user.studentId };
  return base;
};

// ---------------------------------------------------------------------------
// Student write rules. Admins may write anything (except read-only views).
// Returns { action: 'accept', item } | { action: 'ignore' } | { action: 'reject', reason }
// ---------------------------------------------------------------------------
const STUDENT_EDITABLE_PROFILE = ['name', 'email', 'phone', 'bio'];

export const checkStudentWrite = async (name, user, existing, incoming) => {
  const me = user.studentId;
  const own = (item) => item?.studentId === me;

  switch (name) {
    case 'examMonitoring':
      return own(incoming) ? { action: 'accept', item: incoming } : { action: 'reject', reason: 'Not your session' };

    case 'curriculumAttempts': {
      if (existing) return { action: 'ignore' };
      if (!own(incoming)) return { action: 'reject', reason: 'Not your attempt' };
      const subject = await getDb().collection('curriculum_subjects').findOne({ _id: incoming.subjectId, _deleted: { $ne: true } });
      const scored = scoreModuleQuiz(subject, incoming);
      if (!scored) return { action: 'reject', reason: 'Quiz answers could not be verified' };
      return { action: 'accept', item: { ...incoming, ...scored } };
    }

    case 'attempts':
      if (existing) return { action: 'ignore' };
      return own(incoming) ? { action: 'accept', item: incoming } : { action: 'reject', reason: 'Not your attempt' };

    case 'subscriptions': {
      if (existing) return { action: 'ignore' };
      if (!own(incoming)) return { action: 'reject', reason: 'Not your request' };
      const subject = await getDb().collection('curriculum_subjects').findOne({ _id: incoming.subjectId, _deleted: { $ne: true } });
      if (!subject) return { action: 'reject', reason: 'Subject not found' };
      const { startsAt, expiresAt, reviewedAt, ...rest } = incoming;
      return {
        action: 'accept',
        item: {
          ...rest,
          subjectName: subject.name,
          amount: Number(subject.price) || 0,
          validityDays: Number(subject.validityDays) || 0,
          status: 'pending',
          reviewedAt: null
        }
      };
    }

    case 'retests': {
      if (existing) return { action: 'ignore' }; // status changes are made by the admin / exam submission
      if (!own(incoming) || incoming.status !== 'requested') return { action: 'reject', reason: 'Invalid retest request' };
      const open = await getDb().collection('retests').findOne({
        studentId: me,
        examId: incoming.examId,
        status: { $in: ['requested', 'granted'] },
        _deleted: { $ne: true }
      });
      if (open) return { action: 'ignore' };
      return { action: 'accept', item: incoming };
    }

    case 'doubts': {
      const msgs = incoming.messages || [];
      if (!existing) {
        if (!own(incoming) || !msgs.length || msgs.some((m) => m.from !== 'student')) {
          return { action: 'reject', reason: 'Invalid doubt' };
        }
        return { action: 'accept', item: { ...incoming, status: 'open' } };
      }
      if (!own(existing)) return { action: 'reject', reason: 'Not your doubt' };
      const old = existing.messages || [];
      const keepsHistory = old.every((m, i) => msgs[i]?.id === m.id && msgs[i]?.text === m.text && msgs[i]?.from === m.from);
      const added = msgs.slice(old.length);
      if (!keepsHistory || added.some((m) => m.from !== 'student')) return { action: 'reject', reason: 'Messages can only be added' };
      const status = ['open', 'resolved', 'answered'].includes(incoming.status) ? incoming.status : existing.status;
      // A student reply re-opens the doubt for the admin
      return {
        action: 'accept',
        item: {
          ...toItem(existing),
          messages: msgs,
          status: added.length ? 'open' : status,
          seenByStudent: incoming.seenByStudent ?? existing.seenByStudent,
          updatedAt: incoming.updatedAt || existing.updatedAt
        }
      };
    }

    case 'students': {
      if (!existing || existing.id !== me) return { action: 'ignore' };
      const merged = { ...toItem(existing) };
      STUDENT_EDITABLE_PROFILE.forEach((k) => {
        if (k in incoming) merged[k] = incoming[k];
      });
      return { action: 'accept', item: merged };
    }

    // Exam attempts go through POST /api/exams/:id/submit (server-scored)
    case 'examAttempts':
    default:
      return { action: 'ignore' };
  }
};
