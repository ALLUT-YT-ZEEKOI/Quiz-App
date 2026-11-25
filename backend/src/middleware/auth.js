import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { config } from '../config.js';
import { getDb } from '../db.js';

export const signToken = (user) =>
  jwt.sign(
    { sub: String(user._id), role: user.role, studentId: user.studentId || null },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

/**
 * Requires a valid "Authorization: Bearer <token>" header; sets req.user = { id, role, studentId }.
 * Students must still exist: a student the admin deleted is signed out on their next request.
 */
export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
  req.user = { id: payload.sub, role: payload.role, studentId: payload.studentId };
  if (payload.role === 'student') {
    try {
      const exists =
        ObjectId.isValid(payload.sub) &&
        (await getDb().collection('users').countDocuments({ _id: new ObjectId(payload.sub) }, { limit: 1 }));
      if (!exists) return res.status(401).json({ error: 'This account no longer exists.' });
    } catch (err) {
      return next(err);
    }
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
};

export const isAdmin = (user) => user?.role === 'admin';
