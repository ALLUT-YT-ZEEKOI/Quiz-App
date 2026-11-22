// Student self-registration: form options and helpers

export const QUALIFICATIONS = ['ITI (Civil)', 'ITI (Survey)', 'Diploma', 'B-tech', 'M-tech'];

export const CIVIL_LEVELS = ['Beginner', 'Average', 'Above average', 'Excellent knowledge'];

export const PREPARATION_TYPES = ['Self preparation', 'Prepared from institute'];

export const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod'
];

/** Last 10 digits of an Indian mobile number ("+91 98471 22334" -> "9847122334"). */
export const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

export const formatPhone = (digits) => {
  const d = normalizePhone(digits);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : digits || '';
};

export const whatsappLink = (digits, text = '') =>
  `https://wa.me/91${normalizePhone(digits)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** Local avatar with the student's initials (no external image service). */
export const initialsAvatar = (name = '') => {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || '?';
  const palette = ['#087F8C', '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#059669'];
  const color = palette[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="20" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/** The student record used across the app (exams, curriculum, results) for a registered account. */
export const buildStudentFromRegistration = (account) => ({
  id: account.studentId,
  studentId: account.registrationId,
  name: account.name,
  email: account.email,
  phone: formatPhone(account.phone),
  avatar: initialsAvatar(account.name),
  department: 'Civil Engineering',
  semester: '',
  batch: 'Online Registration',
  enrollmentDate: (account.registeredAt || '').slice(0, 10),
  attendancePct: 0,
  cgpa: 0,
  completedQuizzes: 0,
  averageScore: 0,
  performanceStatus: 'New',
  bio: '',
  subjectProgress: {},
  isRegistered: true,
  registration: {
    qualification: account.qualification,
    civilLevel: account.civilLevel,
    preparation: account.preparation,
    district: account.district
  }
});
