import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Save,
  BookOpen,
  Calendar
} from 'lucide-react';

export const ProfileManagement = () => {
  const { currentUser, currentRole, updateStudent, showToast, resetDemoData } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || currentUser?.specialization || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (currentRole === 'student') {
      updateStudent(currentUser.id, { name, email, phone, bio });
    } else {
      showToast('Faculty profile preferences saved', 'success');
    }
    showToast('Profile information updated successfully', 'success');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    showToast('Account password updated securely', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
          Institutional Profile & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your credentials, academic records, contact info, and preferences.
        </p>
      </div>

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

        {/* Change Password Sub-form */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
            Security & Password Management
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password (Minimum 6 characters)
              </label>
              <input
                type="password"
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Demo Reset Data Danger Area */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Reset Demo Storage</h4>
            <p className="text-[11px] text-slate-400">
              Restore default 20 Civil students, 100 questions, and 10 quizzes from factory defaults.
            </p>
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

