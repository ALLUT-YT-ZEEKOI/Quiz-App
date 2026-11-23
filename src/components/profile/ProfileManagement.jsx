import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, KeyRound } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';

export const ProfileManagement = () => {
  const { currentUser, currentRole, updateStudent, showToast, setActiveView, studentAccounts } = useApp();
  const account = (studentAccounts || []).find((a) => a.studentId === currentUser?.id);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || currentUser?.specialization || '');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (currentRole === 'student') {
      updateStudent(currentUser.id, { name, email, phone, bio });
    } else {
      showToast('Faculty profile preferences saved', 'success');
    }
    showToast('Profile information updated successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Header with Native-App Circular Back Button */}
      <PageHeader
        onBack={() => setActiveView('dashboard')}
        backLabel="Back to Dashboard"
        title="Institutional Profile & Settings"
        subtitle="Manage credentials, academic records, contact info, and preferences"
        badge={
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            {currentRole === 'teacher' ? 'Faculty Member' : 'Student Account'}
          </span>
        }
      />

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md"
          />
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentUser?.name}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                {currentRole === 'teacher' ? currentUser?.id : currentUser?.studentId}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentRole === 'teacher'
                ? `${currentUser?.title} • ${currentUser?.qualification}`
                : `Semester ${currentUser?.semester} • Batch ${currentUser?.batch} • Department of Civil Engineering`}
            </p>
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Personal Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                disabled
                value="Civil Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bio / Specialization
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
      {/* Registered students can change their login password */}
      {account && <ChangePasswordCard account={account} />}

      {/* Developer & Platform Architecture Badge */}
      <div className="p-5 rounded-3xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black text-sm flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
            AM
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company & Engineering</div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Built by <span className="text-teal-600 dark:text-teal-400">AM DOMINA</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Custom web engineering, systems architecture and LMS solutions</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/60 dark:border-teal-800 shrink-0">
          Official Technology Partner
        </div>
      </div>
    </div>
  );
};

const ChangePasswordCard = ({ account }) => {
  const { changeOwnPassword } = useApp();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next.length < 6) return setError('New password must be at least 6 characters');
    if (next !== confirm) return setError('New passwords do not match');
    setSaving(true);
    const res = await changeOwnPassword(current, next);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    setCurrent('');
    setNext('');
    setConfirm('');
    setError('');
  };

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  return (
    <form onSubmit={submit} className="bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle p-6 sm:p-8 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Change password</h3>
          <p className="text-xs text-slate-500">
            Sign in with <strong>{account.email}</strong> or your WhatsApp number. Registration ID: {account.registrationId}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="cp-current" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current password</label>
          <input id="cp-current" type="password" autoComplete="current-password" required value={current} onChange={(e) => { setCurrent(e.target.value); setError(''); }} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cp-new" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New password</label>
          <input id="cp-new" type="password" autoComplete="new-password" required value={next} onChange={(e) => { setNext(e.target.value); setError(''); }} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cp-confirm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm new password</label>
          <input id="cp-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} className={inputCls} />
        </div>
      </div>
      {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
      <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold">
        {saving ? 'Saving…' : 'Update password'}
      </button>
    </form>
  );
};
