import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  COLLECTIONS,
  COLLECTION_NAMES,
  collectionOf,
  toItem,
  cleanIncoming,
  buildStudentContext,
  sanitizeForStudent,
  readFilter,
  checkStudentWrite,
  isHiddenFor
} from '../sync/collections.js';
import { toAccount } from '../services/students.js';
import { externalizeScreenshot } from '../services/screenshots.js';

export const syncRouter = Router();
syncRouter.use(requireAuth);

const MAX_BATCH = 500;

const shapeFor = (user, ctx) => (name, doc) => {
  const item = toItem(doc);
  return user.role === 'admin' ? item : sanitizeForStudent(name, item, ctx);
};

const readCollection = async (name, user, ctx, extraFilter = {}) => {
  const filter = readFilter(name, user);
  if (!filter) return [];
  const docs = await collectionOf(name).find({ ...filter, ...extraFilter }).toArray();
  const shape = shapeFor(user, ctx);
  return docs.filter((d) => !isHiddenFor(name, user, d, ctx)).map((d) => shape(name, d));
};

const readAccounts = async (filter = {}) => {
  const users = await getDb().collection('users').find({ role: 'student', ...filter }).toArray();
  return users.map(toAccount);
};

/** Everything the signed-in user can see, in one request. */
syncRouter.get('/bootstrap', async (req, res, next) => {
  try {
    const serverTime = new Date();
    const ctx = req.user.role === 'admin' ? null : await buildStudentContext(req.user.studentId);
    const entries = await Promise.all(COLLECTION_NAMES.map(async (name) => [name, await readCollection(name, req.user, ctx)]));
    const collections = Object.fromEntries(entries);
    let initialized = true;
    if (req.user.role === 'admin') {
      collections.accounts = await readAccounts();
      initialized = !!(await getDb().collection('meta').findOne({ _id: 'initialized' }));
    }
    res.json({ serverTime: serverTime.toISOString(), collections, initialized });
  } catch (err) {
    next(err);
  }
});

/** Items changed since `since` (ISO time), including deletions. Polled by the frontend. */
syncRouter.get('/changes', async (req, res, next) => {
  try {
    const since = new Date(String(req.query.since || ''));
    if (Number.isNaN(since.getTime())) return res.status(400).json({ error: 'Invalid "since" time' });
    const serverTime = new Date();
    const user = req.user;
    const ctx = user.role === 'admin' ? null : await buildStudentContext(user.studentId);
    const shape = shapeFor(user, ctx);
    const changes = {};
    const refetch = new Set();

    await Promise.all(
      COLLECTION_NAMES.map(async (name) => {
        const filter = readFilter(name, user);
        if (!filter) return;
        const { _deleted, ...scope } = filter; // include tombstones
        const docs = await collectionOf(name).find({ ...scope, _updatedAt: { $gt: since } }).toArray();
        if (!docs.length) return;
        // Items this user may no longer see (e.g. a mock test the admin disabled) arrive as deletions
        const gone = (d) => d._deleted || isHiddenFor(name, user, d, ctx);
        changes[name] = {
          docs: docs.filter((d) => !gone(d)).map((d) => shape(name, d)),
          deleted: docs.filter(gone).map((d) => d._id)
        };
        // A student's access changed: their view of these collections must be rebuilt
        if (user.role !== 'admin' && name === 'subscriptions') {
          refetch.add('curriculum');
          refetch.add('mockTests'); // private mock tests follow the student's batches
        }
        // The admin changed which lessons / notes / Q&A students can see
        if (user.role !== 'admin' && name === 'settings') refetch.add('curriculum');
        if (user.role !== 'admin' && name === 'examAttempts') refetch.add('examinations');
      })
    );

    if (user.role === 'admin') {
      const accounts = await readAccounts({ _updatedAt: { $gt: since } });
      if (accounts.length) changes.accounts = { docs: accounts, deleted: [] };
    }
    res.json({ serverTime: serverTime.toISOString(), changes, refetch: [...refetch] });
  } catch (err) {
    next(err);
  }
});

/** One whole collection (used after a rejected change, or when access changed). */
syncRouter.get('/collection/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!COLLECTIONS[name]) return res.status(404).json({ error: 'Unknown collection' });
    const ctx = req.user.role === 'admin' ? null : await buildStudentContext(req.user.studentId);
    res.json({ serverTime: new Date().toISOString(), docs: await readCollection(name, req.user, ctx) });
  } catch (err) {
    next(err);
  }
});

/**
 * Save changes: { upserts: [items], deletes: [keys] }.
 * Returns the stored versions (e.g. server-scored attempts) so the client can update itself.
 */
syncRouter.post('/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const def = COLLECTIONS[name];
    if (!def) return res.status(404).json({ error: 'Unknown collection' });
    const upserts = Array.isArray(req.body?.upserts) ? req.body.upserts : [];
    const deletes = Array.isArray(req.body?.deletes) ? req.body.deletes : [];
    if (upserts.length + deletes.length > MAX_BATCH) return res.status(413).json({ error: 'Too many changes in one request' });

    const user = req.user;
    const isAdmin = user.role === 'admin';
    const coll = collectionOf(name);
    const now = new Date();
    const saved = [];
    const ignored = [];
    const rejected = [];

    for (const raw of upserts) {
      const incoming = cleanIncoming(raw);
      const key = def.key(incoming);
      if (typeof key !== 'string' || !key || key.length > 200) {
        rejected.push({ key: null, reason: 'Item has no valid id' });
        continue;
      }
      const existingDoc = await coll.findOne({ _id: key });
      const existing = existingDoc && !existingDoc._deleted ? existingDoc : null;

      let item = incoming;
      if (!isAdmin) {
        const verdict = await checkStudentWrite(name, user, existing, incoming);
        if (verdict.action === 'ignore') {
          ignored.push(key);
          continue;
        }
        if (verdict.action === 'reject') {
          rejected.push({ key, reason: verdict.reason });
          continue;
        }
        item = verdict.item;
      }

      if (name === 'subscriptions') item = await externalizeScreenshot(key, item);
      const doc = { _id: key, ...cleanIncoming(item), _updatedAt: now };
      await coll.replaceOne({ _id: key }, doc, { upsert: true });
      saved.push(key);
    }

    for (const key of deletes) {
      if (typeof key !== 'string') continue;
      if (!isAdmin) {
        ignored.push(key); // students never delete
        continue;
      }
      await coll.updateOne({ _id: key }, { $set: { _deleted: true, _updatedAt: now } });
    }

    // Send back what is now stored (as this user sees it)
    const ctx = isAdmin ? null : await buildStudentContext(user.studentId);
    const shape = shapeFor(user, ctx);
    const docs = saved.length ? await coll.find({ _id: { $in: saved } }).toArray() : [];
    res.json({
      serverTime: new Date().toISOString(),
      saved: docs.filter((d) => !isHiddenFor(name, user, d, ctx)).map((d) => shape(name, d)),
      ignored,
      rejected
    });
  } catch (err) {
    next(err);
  }
});
