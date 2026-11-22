import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const signToken = (user) =>
  jwt.sign(
    { sub: String(user._id), role: user.role, studentId: user.studentId || null },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

/** Requires a valid "Authorization: Bearer <token>" header; sets req.user = { id, role, studentId }. */
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, role: payload.role, studentId: payload.studentId };
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
};

export const isAdmin = (user) => user?.role === 'admin';
