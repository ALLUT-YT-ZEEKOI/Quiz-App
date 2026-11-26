// Student rankings for live exams and mock tests.
// Same rules as the frontend's src/utils/rankings.js:
//   - each student's latest attempt of an assessment counts (a retest replaces the earlier mark)
//   - per assessment: higher percentage first, then less time taken, then earlier submission
//   - overall: higher average percentage first, then more tests taken, then less total time
//   - equal results share a rank (1, 2, 2, 4)

const toMs = (v) => {
  const t = new Date(v || 0).getTime();
  return Number.isNaN(t) ? 0 : t;
};

/** One shape for exam and mock test attempts. */
export const examEntry = (a) => ({
  assessmentKey: `exam:${a.examId}`,
  studentId: a.studentId,
  name: a.studentName || 'Student',
  rollNo: a.studentRollNo || '',
  batch: a.batch || '',
  pct: Number(a.percentage) || 0,
  score: a.score,
  totalMarks: a.totalMarks,
  correct: a.correctCount ?? 0,
  wrong: a.incorrectCount ?? 0,
  skipped: a.unattemptedCount ?? 0,
  timeSpentSeconds: Number(a.timeSpentSeconds) || (Number(a.timeSpentMinutes) ? Number(a.timeSpentMinutes) * 60 : null),
  startedAt: a.startedAt || null,
  submittedAt: a.submittedAt || null
});

export const mockEntry = (a) => ({
  assessmentKey: `mock:${a.testId}`,
  studentId: a.studentId,
  name: a.studentName || 'Student',
  rollNo: a.studentRollNo || '',
  batch: a.batch || '',
  pct: Number(a.percentage) || 0,
  score: a.score,
  totalMarks: a.totalMarks,
  correct: a.correctCount ?? 0,
  wrong: a.incorrectCount ?? 0,
  skipped: a.unattemptedCount ?? 0,
  timeSpentSeconds: Number(a.timeSpentSeconds) || null,
  startedAt: a.startedAt || null,
  submittedAt: a.submittedAt || null
});

const withRanks = (sorted, same) => {
  let rank = 0;
  return sorted.map((e, i) => {
    if (i === 0 || !same(sorted[i - 1], e)) rank = i + 1;
    return { ...e, rank };
  });
};

const timeOrMax = (s) => (Number(s) > 0 ? Number(s) : Number.MAX_SAFE_INTEGER);

/**
 * assessments: [{ key, kind: 'exam'|'mock', title, subtitle }]
 * entries: examEntry / mockEntry items (any order, any number of attempts per student)
 */
export const computeRankings = (assessments, entries) => {
  const known = new Map(assessments.map((a) => [a.key, a]));

  // Latest attempt per student per assessment
  const latest = new Map();
  entries.forEach((e) => {
    if (!known.has(e.assessmentKey)) return;
    const k = `${e.assessmentKey}|${e.studentId}`;
    const prev = latest.get(k);
    if (!prev || toMs(e.submittedAt) > toMs(prev.submittedAt)) latest.set(k, e);
  });

  const byAssessment = new Map();
  latest.forEach((e) => {
    if (!byAssessment.has(e.assessmentKey)) byAssessment.set(e.assessmentKey, []);
    byAssessment.get(e.assessmentKey).push(e);
  });

  const perAssessment = [...byAssessment.entries()]
    .map(([key, list]) => {
      const sorted = [...list].sort(
        (a, b) =>
          b.pct - a.pct ||
          timeOrMax(a.timeSpentSeconds) - timeOrMax(b.timeSpentSeconds) ||
          toMs(a.submittedAt) - toMs(b.submittedAt)
      );
      const ranked = withRanks(sorted, (a, b) => a.pct === b.pct && timeOrMax(a.timeSpentSeconds) === timeOrMax(b.timeSpentSeconds));
      const lastAt = Math.max(...list.map((e) => toMs(e.submittedAt)));
      return { ...known.get(key), participants: list.length, lastAt: new Date(lastAt).toISOString(), entries: ranked };
    })
    .sort((a, b) => toMs(b.lastAt) - toMs(a.lastAt));

  // Overall: average of each student's latest results
  const students = new Map();
  latest.forEach((e) => {
    const s = students.get(e.studentId) || {
      studentId: e.studentId,
      name: e.name,
      rollNo: e.rollNo,
      batch: e.batch,
      tests: 0,
      pctSum: 0,
      correct: 0,
      wrong: 0,
      skipped: 0,
      timeSpentSeconds: 0,
      lastAt: 0
    };
    s.tests += 1;
    s.pctSum += e.pct;
    s.correct += e.correct;
    s.wrong += e.wrong;
    s.skipped += e.skipped;
    s.timeSpentSeconds += Number(e.timeSpentSeconds) || 0;
    if (toMs(e.submittedAt) >= s.lastAt) {
      s.lastAt = toMs(e.submittedAt);
      s.name = e.name; // most recent name on record
    }
    students.set(e.studentId, s);
  });
  const overallSorted = [...students.values()]
    .map(({ pctSum, lastAt, ...s }) => ({ ...s, pct: Math.round((pctSum / s.tests) * 10) / 10 }))
    .sort((a, b) => b.pct - a.pct || b.tests - a.tests || timeOrMax(a.timeSpentSeconds) - timeOrMax(b.timeSpentSeconds));
  const overall = withRanks(overallSorted, (a, b) => a.pct === b.pct && a.tests === b.tests);

  return { overall, assessments: perAssessment };
};

/** What a student may see: everyone's rank, name and percentage; full details only for themselves. */
export const shapeForStudent = (rankings, studentId) => {
  const publicEntry = (e) =>
    e.studentId === studentId
      ? { ...e, isMe: true }
      : { rank: e.rank, studentId: e.studentId, name: e.name, pct: e.pct, ...(e.tests !== undefined ? { tests: e.tests } : {}) };
  return {
    overall: rankings.overall.map(publicEntry),
    assessments: rankings.assessments.map((a) => ({ ...a, entries: a.entries.map(publicEntry) }))
  };
};
