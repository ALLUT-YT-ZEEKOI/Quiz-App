import { getDb, getNotesBucket } from '../db.js';

export const subjectDeletions = () => getDb().collection('curriculum_deletions');
const subjects = () => getDb().collection('curriculum_subjects');

// Reserve a new ID before checking deletion history. The final write never upserts,
// so even an edit already in flight cannot recreate a subject after deletion.
export const saveCurriculumSubject = async (doc) => {
  const key = { _id: doc._id };
  await subjects().updateOne(key, { $setOnInsert: { _pendingCreate: true, _deleted: true } }, { upsert: true });
  if (await subjectDeletions().findOne(key)) {
    await subjects().deleteOne({ ...key, _pendingCreate: true });
    return false;
  }
  const result = await subjects().replaceOne({
    ...key, _deleting: { $ne: true }, $or: [{ _deleted: { $ne: true } }, { _pendingCreate: true }]
  }, doc);
  return result.matchedCount > 0;
};

export const deleteCurriculumSubject = async (id) => {
  const key = { _id: id };
  // Freeze edits while cleaning files. Keeping the subject until cleanup succeeds
  // lets a retry recover the file IDs after an interrupted request.
  const subject = await subjects().findOneAndUpdate(key, {
    $set: { _deleting: true }, $setOnInsert: { _deleted: true }, $unset: { _pendingCreate: '' }
  }, { upsert: true, returnDocument: 'after' });
  const fileIds = (subject.modules || []).flatMap((module) =>
    (module.notes || []).filter((note) => note.type === 'file').map((note) => note.id)
  );
  if (fileIds.length) {
    const files = await getNotesBucket().find({ filename: { $in: fileIds } }).toArray();
    const db = getDb();
    const ids = files.map((file) => file._id);
    await db.collection('note_files.chunks').deleteMany({ files_id: { $in: ids } });
    await db.collection('note_files.files').deleteMany({ _id: { $in: ids } });
  }
  await subjectDeletions().updateOne(key, { $setOnInsert: { _updatedAt: new Date() } }, { upsert: true });
  await subjects().deleteOne({ ...key, _deleting: true });
};
