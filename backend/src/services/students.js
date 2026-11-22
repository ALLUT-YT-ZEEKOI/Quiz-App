// Student registration helpers (mirror of the frontend's src/utils/studentRegistration.js)

export const QUALIFICATIONS = ['ITI (Civil)', 'ITI (Survey)', 'Diploma', 'B-tech', 'M-tech'];
export const CIVIL_LEVELS = ['Beginner', 'Average', 'Above average', 'Excellent knowledge'];
export const PREPARATION_TYPES = ['Self preparation', 'Prepared from institute'];

export const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

export const formatPhone = (digits) => {
  const d = normalizePhone(digits);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : digits || '';
};

const initialsAvatar = (name = '') => {
  const initials =
    name.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || '?';
  const palette = ['#087F8C', '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#059669'];
  const color = palette[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="20" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/** Student record (stored in `students`) for a registered user. */
export const buildStudentRecord = (user) => ({
  id: user.studentId,
  studentId: user.registrationId,
  name: user.name,
  email: user.email,
  phone: formatPhone(user.phone),
  avatar: initialsAvatar(user.name),
  department: 'Civil Engineering',
  semester: '',
  batch: 'Online Registration',
  enrollmentDate: (user.registeredAt || '').slice(0, 10),
  attendancePct: 0,
  cgpa: 0,
  completedQuizzes: 0,
  averageScore: 0,
  performanceStatus: 'New',
  bio: '',
  subjectProgress: {},
  isRegistered: true,
  registration: {
    qualification: user.qualification,
    civilLevel: user.civilLevel,
    preparation: user.preparation,
    district: user.district
  }
});

/** Registration shown to the admin (never includes password data). */
export const toAccount = (user) => ({
  id: String(user._id),
  studentId: user.studentId,
  registrationId: user.registrationId,
  email: user.email,
  phone: user.phone,
  name: user.name,
  qualification: user.qualification,
  civilLevel: user.civilLevel,
  preparation: user.preparation,
  district: user.district,
  registeredAt: user.registeredAt,
  passwordUpdatedAt: user.passwordUpdatedAt,
  mustChangePassword: !!user.mustChangePassword,
  lastLoginAt: user.lastLoginAt || null,
  loginCount: user.loginCount || 0,
  loginHistory: user.loginHistory || []
});

/** Validates the registration form. Returns { field: message } errors (empty when valid). */
export const validateRegistration = (body) => {
  const e = {};
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
  if (String(body.name || '').trim().length < 2) e.name = 'Enter your full name';
  if (!QUALIFICATIONS.includes(body.qualification)) e.qualification = 'Choose your qualification';
  if (!/^[6-9]\d{9}$/.test(normalizePhone(body.phone))) e.phone = 'Enter a valid 10-digit WhatsApp number';
  if (!CIVIL_LEVELS.includes(body.civilLevel)) e.civilLevel = 'Choose your level';
  if (!PREPARATION_TYPES.includes(body.preparation)) e.preparation = 'Choose how you are preparing';
  if (String(body.district || '').trim().length < 2) e.district = 'Choose your district';
  if (String(body.password || '').length < 6) e.password = 'Use at least 6 characters';
  return e;
};
