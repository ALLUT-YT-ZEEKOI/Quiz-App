import { Router, json } from 'express';
import { ObjectId } from 'mongodb';
import { getDb, getScreenshotsBucket } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { hashPassword } from '../services/passwords.js';
import { normalizePhone, buildStudentRecord } from '../services/students.js';
import { COLLECTIONS, cleanIncoming } from '../sync/collections.js';
import { externalizeScreenshot } from '../services/screenshots.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

/** Reset a student's password to a temporary one they must change at next sign-in. */
adminRouter.post('/students/:accountId/reset-password', async (req, res, next) => {
  try {
    const temp = String(req.body?.tempPassword || '');
    if (temp.length < 6) return res.status(400).json({ error: 'Temporary password must be at least 6 characters' });
    if (!ObjectId.isValid(req.params.accountId)) return res.status(404).json({ error: 'Student not found' });
    const now = new Date();
    const result = await getDb().collection('users').updateOne(
      { _id: new ObjectId(req.params.accountId), role: 'student' },
      {
        $set: {
          passwordHash: await hashPassword(temp),
          mustChangePassword: true,
          passwordUpdatedAt: now.toISOString(),
          passwordResetByAdminAt: now.toISOString(),
          _updatedAt: now
        },
        $unset: { legacyCredentials: '' }
      }
    );
    if (!result.matchedCount) return res.status(404).json({ error: 'Student not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * Permanently delete a registered student (hard delete, no tombstones):
 * their login, their student record, everything they own (attempts, subscriptions,
 * doubts, retests, exam monitoring, mock test attempts) and their payment screenshots.
 * Their email and WhatsApp number become free to register again.
 */
adminRouter.delete('/students/:accountId', async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.accountId)) return res.status(404).json({ error: 'Student not found' });
    const db = getDb();
    const _id = new ObjectId(req.params.accountId);
    const user = await db.collection('users').findOne({ _id, role: 'student' });
    if (!user) return res.status(404).json({ error: 'Student not found' });

    const removed = {};
    const studentId = user.studentId;
    if (studentId) {
      // Payment screenshots are stored in GridFS under the subscription id
      const subs = await db.collection('subscriptions').find({ studentId }, { projection: { _id: 1 } }).toArray();
      const bucket = getScreenshotsBucket();
      if (bucket && subs.length) {
        const files = await bucket.find({ filename: { $in: subs.map((s) => s._id) } }).toArray();
        await Promise.all(files.map((f) => bucket.delete(f._id)));
        removed.screenshots = files.length;
      }

      for (const [name, def] of Object.entries(COLLECTIONS)) {
        if (!def.own) continue;
        const { deletedCount } = await db.collection(def.mongo).deleteMany({ studentId });
        if (deletedCount) removed[name] = deletedCount;
      }
      const { deletedCount } = await db.collection('students').deleteOne({ _id: studentId });
      if (deletedCount) removed.students = deletedCount;
    }

    await db.collection('users').deleteOne({ _id });
    res.json({ ok: true, removed });
  } catch (err) {
    next(err);
  }
});

/**
 * One-time import of the data the admin built in the browser (before the backend existed).
 * Body: { collections: { name: [items] }, accounts: [browser student accounts], final?: boolean }
 * Large imports are sent in several parts; only the last one (final !== false) marks the database as set up.
 */
adminRouter.post('/import', json({ limit: '60mb' }), async (req, res, next) => {
  try {
    const db = getDb();
    const now = new Date();
    const summary = {};
    const incoming = req.body?.collections || {};

    for (const [name, items] of Object.entries(incoming)) {
      const def = COLLECTIONS[name];
      if (!def || !Array.isArray(items)) continue;
      const ops = [];
      for (const raw of items) {
        let item = cleanIncoming(raw);
        const key = def.key(item);
        if (typeof key !== 'string') continue;
        if (name === 'subscriptions') item = await externalizeScreenshot(key, item);
        ops.push({ replaceOne: { filter: { _id: key }, replacement: { _id: key, ...item, _updatedAt: now }, upsert: true } });
      }
      if (ops.length) await db.collection(def.mongo).bulkWrite(ops, { ordered: false });
      summary[name] = ops.length;
    }

    // Students who registered in the browser keep their passwords (verified + upgraded at first login)
    let accounts = 0;
    let maxSeq = 0;
    for (const a of Array.isArray(req.body?.accounts) ? req.body.accounts : []) {
      const email = String(a.email || '').trim().toLowerCase();
      const phone = normalizePhone(a.phone);
      if (!email || !a.studentId) continue;
      const exists = await db.collection('users').findOne({ $or: [{ email }, { phone }] });
      if (exists) continue;
      const user = {
        role: 'student',
        studentId: a.studentId,
        registrationId: a.registrationId,
        email,
        phone,
        name: a.name,
        qualification: a.qualification,
        civilLevel: a.civilLevel,
        preparation: a.preparation,
        district: a.district,
        registeredAt: a.registeredAt,
        legacyCredentials: a.credentials,
        passwordUpdatedAt: a.passwordUpdatedAt,
        mustChangePassword: !!a.mustChangePassword,
        lastLoginAt: a.lastLoginAt || null,
        loginCount: a.loginCount || 0,
        loginHistory: a.loginHistory || [],
        _updatedAt: now
      };
      await db.collection('users').insertOne(user);
      const student = buildStudentRecord(user);
      await db.collection('students').updateOne({ _id: student.id }, { $setOnInsert: { ...student, _updatedAt: now } }, { upsert: true });
      const seq = Number(String(a.registrationId || '').split('-').pop());
      if (seq > maxSeq) maxSeq = seq;
      accounts++;
    }
    if (maxSeq) {
      await db.collection('counters').updateOne({ _id: 'registration' }, { $max: { seq: maxSeq } }, { upsert: true });
    }
    summary.accounts = accounts;

    if (req.body?.final !== false) {
      await db.collection('meta').updateOne({ _id: 'initialized' }, { $set: { at: now, by: 'import' } }, { upsert: true });
    }
    res.json({ ok: true, summary });
  } catch (err) {
    next(err);
  }
});

/** Start with an empty database (skip the import prompt). */
adminRouter.post('/initialize', async (req, res, next) => {
  try {
    await getDb().collection('meta').updateOne({ _id: 'initialized' }, { $set: { at: new Date(), by: 'empty' } }, { upsert: true });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
