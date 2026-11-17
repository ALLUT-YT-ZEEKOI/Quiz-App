import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';

export const ProfileManagement = () => {
  const { currentUser, currentRole, updateStudent, showToast, setActiveView } = useApp();

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
    </div>
  );
};
