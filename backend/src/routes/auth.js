import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';
import { config } from '../config.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { hashPassword, checkPassword } from '../services/passwords.js';
import { normalizePhone, validateRegistration, buildStudentRecord } from '../services/students.js';

export const authRouter = Router();

// Slow down password guessing: 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many attempts. Please wait a few minutes and try again.' } });

const users = () => getDb().collection('users');

const publicUser = (u) => ({
  id: String(u._id),
  role: u.role,
  name: u.name,
  email: u.email || null,
  studentId: u.studentId || null,
  teacherId: u.teacherId || null,
  registrationId: u.registrationId || null
});

const stampLogin = async (userId) => {
  const now = new Date();
  await users().updateOne(
    { _id: userId },
    {
      $set: { lastLoginAt: now.toISOString(), _updatedAt: now },
      $inc: { loginCount: 1 },
      $push: { loginHistory: { $each: [now.toISOString()], $position: 0, $slice: 20 } }
    }
  );
};

const nextRegistrationId = async () => {
  const counter = await getDb()
    .collection('counters')
    .findOneAndUpdate({ _id: 'registration' }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
  return `CT-${new Date().getFullYear()}-${String(counter.seq).padStart(4, '0')}`;
};

/** Student self-registration (the registration form). */
authRouter.post('/register', authLimiter, async (req, res, next) => {
  try {
    const body = req.body || {};
    const errors = validateRegistration(body);
    if (Object.keys(errors).length) {
      const [field, error] = Object.entries(errors)[0];
      return res.status(400).json({ error, field, errors });
    }
    const email = body.email.trim().toLowerCase();
    const phone = normalizePhone(body.phone);
    if (await users().findOne({ email })) {
      return res.status(409).json({ field: 'email', error: 'This email is already registered. Please sign in instead.' });
    }
    if (await users().findOne({ phone })) {
      return res.status(409).json({ field: 'phone', error: 'This WhatsApp number is already registered. Please sign in instead.' });
    }

    const now = new Date();
    const user = {
      role: 'student',
      studentId: `STU-R${now.getTime().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`,
      registrationId: await nextRegistrationId(),
      email,
      phone,
      name: body.name.trim(),
      qualification: body.qualification,
      civilLevel: body.civilLevel,
      preparation: body.preparation,
      district: String(body.district).trim(),
      registeredAt: now.toISOString(),
      passwordHash: await hashPassword(body.password),
      passwordUpdatedAt: now.toISOString(),
      mustChangePassword: false,
      lastLoginAt: now.toISOString(),
      loginCount: 1,
      loginHistory: [now.toISOString()],
      _updatedAt: now
    };
    const { insertedId } = await users().insertOne(user);
    user._id = insertedId;

    const student = buildStudentRecord(user);
    await getDb().collection('students').replaceOne({ _id: student.id }, { _id: student.id, ...student, _updatedAt: now }, { upsert: true });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'This email or WhatsApp number is already registered.' });
    next(err);
  }
});

/**
 * Sign in. Students: email / WhatsApp number / registration ID. Admin: username or email.
 * If the admin reset a student's password, returns { mustChangePassword, resetToken } instead of a session.
 */
authRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const identifier = String(req.body?.identifier || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const wantAdmin = req.body?.role === 'admin';
    if (!identifier || !password) return res.status(400).json({ error: 'Enter your login ID and password.' });

    let user;
    if (wantAdmin) {
      user = await users().findOne({ role: 'admin', $or: [{ username: identifier }, { email: identifier }] });
    } else {
      const phone = normalizePhone(identifier);
      const or = [{ email: identifier }, { registrationId: identifier.toUpperCase() }];
      if (phone.length === 10) or.push({ phone });
      user = await users().findOne({ role: 'student', $or: or });
    }

    const check = user ? await checkPassword(password, user) : { ok: false };
    if (!check.ok) {
      return res.status(401).json({ error: wantAdmin ? 'Incorrect admin login ID or password.' : 'Incorrect email/phone or password.' });
    }
    if (check.needsUpgrade) {
      // Browser-registered student: move to a server-side bcrypt hash
      await users().updateOne({ _id: user._id }, { $set: { passwordHash: await hashPassword(password) }, $unset: { legacyCredentials: '' } });
    }

    if (user.role === 'student' && user.mustChangePassword) {
      const resetToken = jwt.sign({ sub: String(user._id), purpose: 'set-password' }, config.jwtSecret, { expiresIn: '15m' });
      return res.json({ mustChangePassword: true, resetToken, name: user.name });
    }

    await stampLogin(user._id);
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

/** After an admin reset: the student chooses a new password (using the short-lived resetToken). */
authRouter.post('/set-password', authLimiter, async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body || {};
    if (String(newPassword || '').length < 6) return res.status(400).json({ error: 'Use at least 6 characters' });
    let payload;
    try {
      payload = jwt.verify(String(resetToken || ''), config.jwtSecret);
    } catch {
      return res.status(401).json({ error: 'This reset session expired. Sign in with the temporary password again.' });
    }
    if (payload.purpose !== 'set-password') return res.status(401).json({ error: 'Invalid reset session.' });

    const _id = new ObjectId(payload.sub);
    const now = new Date();
    await users().updateOne(
      { _id },
      { $set: { passwordHash: await hashPassword(newPassword), mustChangePassword: false, passwordUpdatedAt: now.toISOString(), _updatedAt: now }, $unset: { legacyCredentials: '' } }
    );
    await stampLogin(_id);
    const user = await users().findOne({ _id });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

/** Current user (used to restore a session on page load). */
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await users().findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(401).json({ error: 'Account not found.' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

/** Signed-in user changes their own password. */
authRouter.post('/change-password', requireAuth, authLimiter, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (String(newPassword || '').length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const user = await users().findOne({ _id: new ObjectId(req.user.id) });
    if (!user || !(await checkPassword(String(currentPassword || ''), user)).ok) {
      return res.status(400).json({ error: 'Your current password is incorrect.' });
    }
    const now = new Date();
    await users().updateOne(
      { _id: user._id },
      { $set: { passwordHash: await hashPassword(newPassword), mustChangePassword: false, passwordUpdatedAt: now.toISOString(), _updatedAt: now }, $unset: { legacyCredentials: '' } }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
