import bcrypt from 'bcryptjs';
import { pbkdf2Sync, timingSafeEqual } from 'node:crypto';

const ROUNDS = 12;

export const hashPassword = (password) => bcrypt.hash(password, ROUNDS);

/**
 * Checks a password against a user. Students who registered before the backend existed
 * have browser-made PBKDF2 credentials (`legacyCredentials`); those are verified here and
 * the caller upgrades them to bcrypt.
 * Returns { ok, needsUpgrade }.
 */
export const checkPassword = async (password, user) => {
  if (user.passwordHash) {
    return { ok: await bcrypt.compare(password, user.passwordHash), needsUpgrade: false };
  }
  const legacy = user.legacyCredentials;
  if (legacy?.algo === 'pbkdf2-sha256' && legacy.salt && legacy.hash) {
    const expected = Buffer.from(legacy.hash, 'base64');
    const actual = pbkdf2Sync(password, Buffer.from(legacy.salt, 'base64'), legacy.iterations || 60000, expected.length, 'sha256');
    const ok = actual.length === expected.length && timingSafeEqual(actual, expected);
    return { ok, needsUpgrade: ok };
  }
  return { ok: false, needsUpgrade: false };
};
