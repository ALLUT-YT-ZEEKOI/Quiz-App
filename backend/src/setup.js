import bcrypt from 'bcryptjs';
import { getDb } from './db.js';
import { config } from './config.js';
import { hashPassword } from './services/passwords.js';
import { COLLECTIONS } from './sync/collections.js';
import { formatRollNumber, rollSeq } from './services/rollNumbers.js';

/** Indexes for the synced collections (fast "changed since" polling and per-student reads). */
export const ensureCollectionIndexes = async () => {
  const db = getDb();
  await Promise.all(
    Object.values(COLLECTIONS).map(async ({ mongo }) => {
      await db.collection(mongo).createIndex({ _updatedAt: 1 });
      await db.collection(mongo).createIndex({ studentId: 1 }, { sparse: true });
    })
  );
};

/**
 * Creates the admin account from ADMIN_* environment variables. If ADMIN_PASSWORD changes,
 * the stored admin password is updated on the next start (so the .env is the source of truth).
 */
export const ensureAdmin = async () => {
  const { username, email, password, name } = config.admin;
  const users = getDb().collection('users');
  const admin = await users.findOne({ role: 'admin' });

  if (!password) {
    if (!admin) console.warn('⚠️  No admin account yet. Set ADMIN_PASSWORD in .env and restart to create one.');
    return;
  }
  if (password.length < 8) {
    console.warn('⚠️  ADMIN_PASSWORD must be at least 8 characters. Admin account not changed.');
    return;
  }

  const now = new Date();
  if (!admin) {
    await users.insertOne({
      role: 'admin',
      username,
      email: email || undefined,
      name,
      teacherId: 'T001',
      passwordHash: await hashPassword(password),
      createdAt: now.toISOString(),
      _updatedAt: now
    });
    console.log(`✅ Admin account created (login: ${username}${email ? ` or ${email}` : ''}).`);
    return;
  }

  const updates = {};
  if (!(await bcrypt.compare(password, admin.passwordHash || ''))) updates.passwordHash = await hashPassword(password);
  if (admin.username !== username) updates.username = username;
  if (email && admin.email !== email) updates.email = email;
  if (Object.keys(updates).length) {
    await users.updateOne({ _id: admin._id }, { $set: { ...updates, _updatedAt: now } });
    console.log('✅ Admin account updated from .env.');
  }
};

/**
 * Gives students who registered before roll numbers (CT-2026-0003, ...) a CN roll number,
 * numbered in sign-up order after the highest roll number already given (CN101, CN102, ...).
 * Runs at start-up and does nothing once everyone is converted.
 * The old ID is kept as `legacyRegistrationId`, so it still works at sign-in.
 */
export const ensureRollNumbers = async () => {
  const db = getDb();
  const users = db.collection('users');
  const legacy = await users
    .find({ role: 'student', registrationId: { $regex: /^CT-\d{4}-\d+$/i } })
    .sort({ registeredAt: 1, _id: 1 })
    .toArray();
  if (!legacy.length) return;

  const given = await users.find({ role: 'student', registrationId: { $regex: /^CN\d+$/ } }, { projection: { registrationId: 1 } }).toArray();
  let seq = Math.max(0, ...given.map((u) => rollSeq(u.registrationId) || 0));

  for (const user of legacy) {
    const oldId = user.registrationId;
    const roll = formatRollNumber(++seq);
    const now = new Date();
    await users.updateOne({ _id: user._id }, { $set: { registrationId: roll, legacyRegistrationId: oldId.toUpperCase(), _updatedAt: now } });
    // The student record shows it as their ID; attempts keep a copy for results and rankings
    await db.collection('students').updateOne({ _id: user.studentId }, { $set: { studentId: roll, _updatedAt: now } });
    for (const name of ['exam_attempts', 'mock_attempts']) {
      await db.collection(name).updateMany({ studentId: user.studentId, studentRollNo: oldId }, { $set: { studentRollNo: roll, _updatedAt: now } });
    }
    await db.collection('quiz_attempts').updateMany({ studentId: user.studentId, rollNumber: oldId }, { $set: { rollNumber: roll, _updatedAt: now } });
  }
  // New sign-ups continue right after the last roll number given
  await db.collection('counters').updateOne({ _id: 'registration' }, { $set: { seq } }, { upsert: true });
  console.log(`✅ Gave ${legacy.length} student(s) a CN roll number (up to ${formatRollNumber(seq)}).`);
};
