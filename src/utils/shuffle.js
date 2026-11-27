// Shuffling questions and answer options for students.
//
// Only what the student sees is shuffled. Answers are always recorded with the option's
// original index, so scoring (on the server), results, reviews and saved questions don't change.
// The order comes from a seed (student + test + attempt start), so it stays the same for the whole
// attempt, even after a reload, and differs between students and between attempts.

const hashSeed = (str) => {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
};

/** Small seeded random number generator (mulberry32). */
const seededRandom = (seed) => {
  let a = hashSeed(String(seed));
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** A shuffled list of 0..n-1 for this seed (Fisher-Yates). */
export const seededOrder = (n, seed) => {
  const order = Array.from({ length: n }, (_, i) => i);
  const rand = seededRandom(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

/** The questions in shuffled order (or as they are when `enabled` is false). */
export const orderQuestions = (questions, enabled, seed) => {
  const list = questions || [];
  if (!enabled || list.length < 2) return list;
  return seededOrder(list.length, `${seed}:questions`).map((i) => list[i]);
};

/**
 * The options of one question in display order: [{ index (original), text }].
 * Show them in this order, and record `index` when the student picks one.
 */
export const orderOptions = (question, enabled, seed) => {
  const options = (question?.options || []).map((text, index) => ({ index, text }));
  if (!enabled || options.length < 2) return options;
  const key = question?.id ?? question?.questionText ?? question?.question ?? '';
  return seededOrder(options.length, `${seed}:options:${key}`).map((i) => options[i]);
};
