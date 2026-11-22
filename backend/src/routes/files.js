import { Router, raw } from 'express';
import { getDb, getNotesBucket, getScreenshotsBucket } from '../db.js';
import { config } from '../config.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { buildStudentContext } from '../sync/collections.js';

// Study-note files (PDF, slides, images...) stored in MongoDB GridFS, keyed by note id.
export const filesRouter = Router();
filesRouter.use(requireAuth);

const validNoteId = (id) => /^[\w-]{1,120}$/.test(id);

const deleteExisting = async (noteId) => {
  const bucket = getNotesBucket();
  const files = await bucket.find({ filename: noteId }).toArray();
  await Promise.all(files.map((f) => bucket.delete(f._id)));
};

/** Payment screenshot of a subscription request: the admin, or the student who sent it. */
filesRouter.get('/screenshots/:subscriptionId', async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    if (!validNoteId(subscriptionId)) return res.status(400).json({ error: 'Invalid id' });
    if (req.user.role !== 'admin') {
      const sub = await getDb().collection('subscriptions').findOne({ _id: subscriptionId, studentId: req.user.studentId });
      if (!sub) return res.status(404).json({ error: 'File not found' });
    }
    const [file] = await getScreenshotsBucket().find({ filename: subscriptionId }).sort({ uploadDate: -1 }).limit(1).toArray();
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.setHeader('Content-Type', file.metadata?.contentType || 'image/jpeg');
    res.setHeader('Content-Length', file.length);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    getScreenshotsBucket().openDownloadStream(file._id).on('error', next).pipe(res);
  } catch (err) {
    next(err);
  }
});

/** Upload (admin). Raw file body; original file name in ?name= */
filesRouter.put('/:noteId', requireAdmin, raw({ type: () => true, limit: config.maxNoteFileBytes }), async (req, res, next) => {
  try {
    const { noteId } = req.params;
    if (!validNoteId(noteId)) return res.status(400).json({ error: 'Invalid note id' });
    if (!req.body?.length) return res.status(400).json({ error: 'Empty file' });
    await deleteExisting(noteId);
    const contentType = String(req.headers['content-type'] || 'application/octet-stream').slice(0, 120);
    await new Promise((resolve, reject) => {
      const upload = getNotesBucket().openUploadStream(noteId, {
        metadata: { contentType, originalName: String(req.query.name || '').slice(0, 200) }
      });
      upload.once('finish', resolve).once('error', reject);
      upload.end(req.body);
    });
    res.status(201).json({ ok: true, size: req.body.length });
  } catch (err) {
    next(err);
  }
});

/** Download. Students only get files from subjects they can access. */
filesRouter.get('/:noteId', async (req, res, next) => {
  try {
    const { noteId } = req.params;
    if (!validNoteId(noteId)) return res.status(400).json({ error: 'Invalid note id' });

    if (req.user.role !== 'admin') {
      const subject = await getDb().collection('curriculum_subjects').findOne({ 'modules.notes.id': noteId, _deleted: { $ne: true } });
      if (!subject) return res.status(404).json({ error: 'File not found' });
      const isFree = !subject.price || Number(subject.price) === 0;
      if (!isFree) {
        const ctx = await buildStudentContext(req.user.studentId);
        if (!ctx.activeSubjectIds.has(subject.id)) return res.status(403).json({ error: 'Subscribe to this subject to open its notes.' });
      }
    }

    const [file] = await getNotesBucket().find({ filename: noteId }).sort({ uploadDate: -1 }).limit(1).toArray();
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.setHeader('Content-Type', file.metadata?.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', file.length);
    res.setHeader('Cache-Control', 'private, max-age=300');
    getNotesBucket().openDownloadStream(file._id).on('error', next).pipe(res);
  } catch (err) {
    next(err);
  }
});

filesRouter.delete('/:noteId', requireAdmin, async (req, res, next) => {
  try {
    if (!validNoteId(req.params.noteId)) return res.status(400).json({ error: 'Invalid note id' });
    await deleteExisting(req.params.noteId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
