// Subscription validity helpers
//
// subject.validityDays      -> how long one payment unlocks the subject (0 / missing = lifetime)
// subscription.validityDays -> snapshot of the subject's validity when the student paid
// subscription.startsAt     -> ISO date access began (set when the admin approves)
// subscription.expiresAt    -> ISO date access ends (null = lifetime)

const DAY_MS = 24 * 60 * 60 * 1000;
export const EXPIRING_SOON_DAYS = 7;

export const VALIDITY_PRESETS = [
  { days: 30, label: '30 days' },
  { days: 60, label: '60 days' },
  { days: 90, label: '90 days' },
  { days: 180, label: '6 months' },
  { days: 365, label: '1 year' },
  { days: 0, label: 'Lifetime' }
];

export const DEFAULT_VALIDITY_DAYS = 30;

export const isLifetime = (days) => !days || Number(days) <= 0;

export const formatValidity = (days) => {
  if (isLifetime(days)) return 'Lifetime';
  const n = Number(days);
  if (n % 365 === 0) return n === 365 ? '1 year' : `${n / 365} years`;
  if (n === 180) return '6 months';
  return n === 1 ? '1 day' : `${n} days`;
};

// Accepts ISO strings and the app's legacy "YYYY-MM-DD HH:mm" format
export const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(String(value).includes('T') ? value : String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
};

export const addDays = (date, days) => new Date(date.getTime() + Number(days) * DAY_MS);

export const formatDate = (value) => {
  const d = parseDate(value);
  return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};

/**
 * Describes where an approved subscription stands right now.
 * state: 'lifetime' | 'active' | 'expiring' (<= 7 days left) | 'expired'
 */
export const getSubscriptionTiming = (subscription, now = new Date()) => {
  const expiresAt = parseDate(subscription?.expiresAt);
  if (!expiresAt) {
    return { state: 'lifetime', expiresAt: null, daysLeft: null };
  }
  const msLeft = expiresAt.getTime() - now.getTime();
  if (msLeft <= 0) {
    return { state: 'expired', expiresAt, daysLeft: 0 };
  }
  const daysLeft = Math.ceil(msLeft / DAY_MS);
  return { state: daysLeft <= EXPIRING_SOON_DAYS ? 'expiring' : 'active', expiresAt, daysLeft };
};

export const formatDaysLeft = (daysLeft) =>
  daysLeft === 1 ? '1 day left' : `${daysLeft} days left`;

/**
 * Of a student's approved subscriptions for one subject, returns the one that
 * reaches furthest (lifetime beats any date), with its timing. Null if none.
 */
export const pickLatestApproved = (subscriptions, now = new Date()) => {
  const approved = (subscriptions || []).filter((s) => s.status === 'approved');
  if (approved.length === 0) return null;
  const ranked = approved
    .map((s) => ({ subscription: s, timing: getSubscriptionTiming(s, now) }))
    .sort((a, b) => {
      const ta = a.timing.expiresAt ? a.timing.expiresAt.getTime() : Infinity;
      const tb = b.timing.expiresAt ? b.timing.expiresAt.getTime() : Infinity;
      return tb - ta;
    });
  return ranked[0];
};
