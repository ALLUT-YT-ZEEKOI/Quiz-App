import bcrypt from 'bcryptjs';
import { getDb } from './db.js';
import { config } from './config.js';
import { hashPassword } from './services/passwords.js';
import { COLLECTIONS } from './sync/collections.js';

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
