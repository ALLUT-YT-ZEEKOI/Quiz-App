import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  UserPlus,
  Search,
  Download,
  X,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Gauge,
  BookOpenCheck,
  KeyRound,
  Copy,
  Check,
  MessageCircle,
  Clock,
  LogIn,
  ShieldCheck,
  Users,
  CalendarPlus,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  QUALIFICATIONS,
  CIVIL_LEVELS,
  PREPARATION_TYPES,
  formatPhone,
  whatsappLink,
  initialsAvatar
} from '../../utils/studentRegistration';
import { generateTempPassword } from '../../utils/passwordHash';

const DAY = 24 * 60 * 60 * 1000;

const fmtDateTime = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};
const fmtDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
const ago = (iso) => {
  const t = new Date(iso).getTime();
  if (!t) return 'Never';
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days < 30 ? `${days}d ago` : fmtDate(iso);
};

const selectCls =
  'px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 min-w-0';

const levelTone = {
  Beginner: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Average: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  'Above average': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'Excellent knowledge': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
};

const exportCsv = (accounts) => {
  const headers = ['Registration ID', 'Name', 'Email', 'WhatsApp', 'Qualification', 'Civil Level', 'Preparation', 'District', 'Registered On', 'Last Login', 'Total Logins'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = accounts.map((a) =>
    [a.registrationId, a.name, a.email, formatPhone(a.phone), a.qualification, a.civilLevel, a.preparation, a.district, fmtDateTime(a.registeredAt), fmtDateTime(a.lastLoginAt), a.loginCount || 0]
      .map(esc)
      .join(',')
  );
  // Passwords are never exported (they are stored only as hashes)
  const blob = new Blob(['﻿' + [headers.map(esc).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Registered_Students_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const StudentRegistrations = () => {
  const { studentAccounts, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [qualification, setQualification] = useState('All');
  const [level, setLevel] = useState('All');
  const [preparation, setPreparation] = useState('All');
  const [district, setDistrict] = useState('All');
  const [selectedId, setSelectedId] = useState(null);

  const now = Date.now();
  const accounts = useMemo(
    () => [...studentAccounts].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)),
    [studentAccounts]
  );
  const districts = [...new Set(accounts.map((a) => a.district))].sort();

  const term = search.trim().toLowerCase();
  const filtered = accounts.filter(
    (a) =>
      (qualification === 'All' || a.qualification === qualification) &&
      (level === 'All' || a.civilLevel === level) &&
      (preparation === 'All' || a.preparation === preparation) &&
      (district === 'All' || a.district === district) &&
      (!term ||
        a.name.toLowerCase().includes(term) ||
        a.email.includes(term) ||
        a.phone.includes(term.replace(/\D/g, '') || '~') ||
        a.registrationId.toLowerCase().includes(term))
  );

  const stats = {
    total: accounts.length,
    newWeek: accounts.filter((a) => now - new Date(a.registeredAt).getTime() < 7 * DAY).length,
    activeToday: accounts.filter((a) => a.lastLoginAt && now - new Date(a.lastLoginAt).getTime() < DAY).length,
    pendingReset: accounts.filter((a) => a.mustChangePassword).length
  };
  const byQualification = QUALIFICATIONS.map((q) => ({ q, count: accounts.filter((a) => a.qualification === q).length }));
  const filtersActive = qualification !== 'All' || level !== 'All' || preparation !== 'All' || district !== 'All' || term;
  const selected = accounts.find((a) => a.id === selectedId);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            Student Registrations
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">Registered Students</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Everyone who signed up through the student registration form, with their answers and login activity.
          </p>
        </div>
        <button
          type="button"
          disabled={filtered.length === 0}
          onClick={() => {
            exportCsv(filtered);
            showToast(`Exported ${filtered.length} students to CSV`, 'success');
          }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-emerald-600" /> Export CSV{filtersActive ? ` (${filtered.length})` : ''}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label: 'Registered', value: stats.total, Icon: Users, cls: 'text-[#087F8C] bg-[#E6F4F6] dark:bg-[#0E353E] dark:text-cyan-300' },
          { label: 'New this week', value: stats.newWeek, Icon: CalendarPlus, cls: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300' },
          { label: 'Logged in today', value: stats.activeToday, Icon: LogIn, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300' },
          { label: 'Password reset pending', value: stats.pendingReset, Icon: KeyRound, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300' }
        ].map(({ label, value, Icon, cls }) => (
          <div key={label} className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1 truncate">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Qualification breakdown (tap to filter) */}
      {accounts.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {byQualification.map(({ q, count }) => (
            <button
              key={q}
              type="button"
              onClick={() => setQualification(qualification === q ? 'All' : q)}
              aria-pressed={qualification === q}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                qualification === q
                  ? 'bg-[#087F8C] border-[#087F8C] text-white'
                  : 'bg-white dark:bg-surface-darkCard border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#20B8C7]/60'
              }`}
            >
              {q} <span className="opacity-70">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="p-3 bg-white dark:bg-surface-darkCard rounded-2xl border border-[#087F8C]/15 dark:border-slate-800 shadow-premium space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, WhatsApp or registration ID..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select aria-label="Qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} className={selectCls}>
            <option value="All">All qualifications</option>
            {QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}
          </select>
          <select aria-label="Civil level" value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls}>
            <option value="All">All levels</option>
            {CIVIL_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select aria-label="Preparation" value={preparation} onChange={(e) => setPreparation(e.target.value)} className={selectCls}>
            <option value="All">All preparation</option>
            {PREPARATION_TYPES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select aria-label="District" value={district} onChange={(e) => setDistrict(e.target.value)} className={selectCls}>
            <option value="All">All districts</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
          <UserPlus className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No registrations yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Share the student portal link. New students tap "New student? Create account" on the sign-in screen.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="p-6 text-center text-xs text-slate-400">No students match these filters.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase tracking-wider text-slate-500 text-left">
                  {['Student', 'Contact', 'Qualification', 'Civil level', 'Preparation', 'District', 'Registered', 'Last login'].map((h) => (
                    <th key={h} scope="col" className="font-bold px-3 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filtered.map((a) => (
                  <tr key={a.id} onClick={() => setSelectedId(a.id)} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer">
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => setSelectedId(a.id)} className="flex items-center gap-2.5 text-left">
                        <img src={initialsAvatar(a.name)} alt="" className="w-8 h-8 rounded-lg shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{a.name}</span>
                          <span className="block text-[10px] font-mono text-slate-400">{a.registrationId}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{a.email}</span>
                      <span className="block text-[11px] font-mono text-slate-500">{formatPhone(a.phone)}</span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{a.qualification}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${levelTone[a.civilLevel] || ''}`}>{a.civilLevel}</span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{a.preparation}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{a.district}</td>
                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(a.registeredAt)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="block font-semibold text-slate-700 dark:text-slate-300">{ago(a.lastLoginAt)}</span>
                      <span className="block text-[10px] text-slate-400">{a.loginCount || 0} logins</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                className="text-left p-3 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <img src={initialsAvatar(a.name)} alt="" className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{a.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{a.registrationId} • {fmtDate(a.registeredAt)}</p>
                  </div>
                  {a.mustChangePassword && <KeyRound className="w-4 h-4 text-amber-500 shrink-0" aria-label="Password reset pending" />}
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300">{a.qualification}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${levelTone[a.civilLevel] || ''}`}>{a.civilLevel}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{a.district}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">{formatPhone(a.phone)}</span>
                  <span>Last login: <strong className="text-slate-700 dark:text-slate-300">{ago(a.lastLoginAt)}</strong></span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {selected && <StudentDetailModal account={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
};

const StudentDetailModal = ({ account: a, onClose }) => {
  const { adminResetStudentPassword, showToast } = useApp();
  const [resetStep, setResetStep] = useState('idle'); // 'idle' | 'confirm' | 'done'
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('Copy failed. Select the password and copy it manually.', 'warning');
    }
  };

  const details = [
    { label: 'Email', value: a.email, Icon: Mail, href: `mailto:${a.email}` },
    { label: 'WhatsApp', value: formatPhone(a.phone), Icon: Phone, href: whatsappLink(a.phone) },
    { label: 'Qualification', value: a.qualification, Icon: GraduationCap },
    { label: 'Level on Civil topics', value: a.civilLevel, Icon: Gauge },
    { label: 'Preparation', value: a.preparation, Icon: BookOpenCheck },
    { label: 'District', value: a.district, Icon: MapPin }
  ];

  const waMessage = `Hi ${a.name}, your CohesionTech password was reset.\nLogin: ${a.email}\nTemporary password: ${tempPassword}\nYou'll be asked to set a new password when you sign in.`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true" aria-label={a.name}>
      <div
        className="w-full max-w-2xl bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <img src={initialsAvatar(a.name)} alt="" className="w-14 h-14 rounded-2xl shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">{a.name}</h2>
            <p className="text-xs font-mono text-slate-500">Registration ID: <strong className="text-slate-800 dark:text-slate-200">{a.registrationId}</strong></p>
            <p className="text-[11px] text-slate-400">Registered {fmtDateTime(a.registeredAt)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Registration answers */}
          <section>
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Registration details</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {details.map(({ label, value, Icon, href }) => (
                <div key={label} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 text-[#087F8C] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
                    <dd className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white break-all">
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{value}</a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Login activity */}
          <section>
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Login activity</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Last login</div>
                <div className="text-xs sm:text-sm font-bold">{fmtDateTime(a.lastLoginAt)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total logins</div>
                <div className="text-xs sm:text-sm font-bold">{a.loginCount || 0}</div>
              </div>
            </div>
            {(a.loginHistory || []).length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {a.loginHistory.slice(0, 10).map((t, i) => (
                  <li key={`${t}-${i}`} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {fmtDateTime(t)}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Password */}
          <section className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Password</h3>
                <p className="text-[11px] text-slate-500">
                  Stored encrypted, so it can't be viewed. Last changed {fmtDateTime(a.passwordUpdatedAt)}.
                </p>
                {a.mustChangePassword && resetStep !== 'done' && (
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 mt-1 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Temporary password set. Waiting for the student to choose a new one.
                  </p>
                )}
              </div>
            </div>

            {resetStep === 'idle' && (
              <button
                type="button"
                onClick={() => {
                  setTempPassword(generateTempPassword());
                  setResetStep('confirm');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" /> Reset password
              </button>
            )}

            {resetStep === 'confirm' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (tempPassword.trim().length < 6) {
                    showToast('Temporary password must be at least 6 characters', 'warning');
                    return;
                  }
                  await adminResetStudentPassword(a.id, tempPassword.trim());
                  setResetStep('done');
                }}
                className="space-y-2"
              >
                <label htmlFor="temp-pw" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Temporary password (you can edit it)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="temp-pw"
                    type="text"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setResetStep('idle')} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold">Set temporary password</button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">The student's old password stops working. They must choose a new password the next time they sign in.</p>
              </form>
            )}

            {resetStep === 'done' && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Share this temporary password with {a.name}. It won't be shown again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 font-mono text-sm font-bold text-slate-900 dark:text-white select-all">
                    {tempPassword}
                  </code>
                  <button type="button" onClick={() => copy(tempPassword)} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 text-xs font-bold text-amber-800 dark:text-amber-200 inline-flex items-center gap-1">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <a
                  href={whatsappLink(a.phone, waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Send on WhatsApp
                </a>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};
