// Student roll numbers: CN101, CN102, ... (mirror of the frontend's src/utils/rollNumbers.js)
//
// The roll number is the student's `registrationId` (their login ID). The number comes from the
// `registration` counter, so roll = CN(100 + seq). Old IDs (CT-2026-0001) map to the same seq.

export const ROLL_PREFIX = 'CN';
const ROLL_OFFSET = 100;

export const formatRollNumber = (seq) => `${ROLL_PREFIX}${ROLL_OFFSET + Number(seq)}`;

/** "cn 101", "CN-101" -> "CN101" (so students can type it either way at sign-in). */
export const normalizeRollInput = (value) => String(value || '').replace(/[\s-]/g, '').toUpperCase();

/** Counter position of a roll number or an old CT-YYYY-NNNN ID (null when neither). */
export const rollSeq = (id) => {
  const s = String(id || '').trim().toUpperCase();
  const roll = new RegExp(`^${ROLL_PREFIX}(\\d+)$`).exec(s);
  if (roll) return Number(roll[1]) - ROLL_OFFSET;
  const legacy = /^CT-\d{4}-(\d+)$/.exec(s);
  return legacy ? Number(legacy[1]) : null;
};

export const isLegacyRegistrationId = (id) => /^CT-\d{4}-\d+$/i.test(String(id || '').trim());
