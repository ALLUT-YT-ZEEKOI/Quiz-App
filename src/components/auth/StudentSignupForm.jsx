import React, { useState } from 'react';
import {
  Mail,
  User,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  ChevronLeft,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  QUALIFICATIONS,
  CIVIL_LEVELS,
  PREPARATION_TYPES,
  KERALA_DISTRICTS,
  normalizePhone
} from '../../utils/studentRegistration';

const EMPTY = {
  email: '',
  name: '',
  qualification: '',
  phone: '',
  civilLevel: '',
  preparation: '',
  district: '',
  districtOther: '',
  password: '',
  confirmPassword: ''
};

const inputCls = (hasError) =>
  `w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all font-medium shadow-2xs ${
    hasError
      ? 'border-red-400 focus:ring-red-500/20'
      : 'border-slate-200 dark:border-slate-800 focus:ring-[#07242B]/15 focus:border-[#07242B] dark:focus:ring-teal-500/20 dark:focus:border-teal-500'
  }`;

const Field = ({ label, error, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
      {label} <span className="text-red-500">*</span>
    </label>
    {children}
    {error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium pl-1">{error}</p>}
  </div>
);

// Modern tactile chips for single choice selection
const ChoiceGroup = ({ label, options, value, onChange, error, columns = 'grid-cols-2', icon: Icon, isLastSpanned = false }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span id={`${label}-label`} className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
        <span>{label}</span>
        <span className="text-red-500">*</span>
      </span>
      {value && (
        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.2 rounded-full border border-teal-200/50">
          Selected
        </span>
      )}
    </div>

    <div role="radiogroup" aria-labelledby={`${label}-label`} className={`grid ${columns} gap-2`}>
      {options.map((opt, idx) => {
        const selected = value === opt;
        const isLastOdd = isLastSpanned && idx === options.length - 1 && options.length % 2 !== 0;

        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-1.5 text-left border ${
              isLastOdd ? 'col-span-2 sm:col-span-1' : ''
            } ${
              selected
                ? 'bg-[#07242B] text-white border-[#07242B] shadow-sm dark:bg-[#0D4450] dark:border-teal-400/60 ring-2 ring-[#07242B]/15'
                : error
                ? 'bg-white dark:bg-slate-900 border-red-300 dark:border-red-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500/50 hover:bg-slate-50'
            }`}
          >
            <span className="truncate">{opt}</span>
            {selected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
    {error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium pl-1">{error}</p>}
  </div>
);

// Modern visual section card
const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-slate-50/70 dark:bg-slate-900/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-2xs">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="w-6 h-6 rounded-lg bg-[#07242B]/10 dark:bg-teal-500/20 text-[#07242B] dark:text-teal-400 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
        {title}
      </h4>
    </div>
    <div className="space-y-3 pt-0.5">
      {children}
    </div>
  </div>
);

export const StudentSignupForm = ({ onSwitchToLogin }) => {
  const { registerStudent } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (form.name.trim().length < 2) e.name = 'Enter your full name';
    if (!form.qualification) e.qualification = 'Choose your qualification';
    if (!/^[6-9]\d{9}$/.test(normalizePhone(form.phone))) e.phone = 'Enter a valid 10-digit WhatsApp number';
    if (!form.civilLevel) e.civilLevel = 'Choose your level';
    if (!form.preparation) e.preparation = 'Choose how you are preparing';
    if (!form.district) e.district = 'Choose your district';
    if (form.district === 'Other' && !form.districtOther.trim()) e.district = 'Type your district';
    if (form.password.length < 6) e.password = 'Use at least 6 characters';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      // Bring the first problem into view
      const first = document.querySelector('[data-signup-error="true"]');
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    const result = await registerStudent({
      ...form,
      district: form.district === 'Other' ? form.districtOther.trim() : form.district
    });
    setSubmitting(false);
    if (!result?.ok) setErrors({ [result?.field || 'email']: result?.error || 'Registration failed' });
  };

  const errAttr = (field) => ({ 'data-signup-error': errors[field] ? 'true' : undefined });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header with Back Navigation */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 mb-1.5 group transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
              <ChevronLeft className="w-3.5 h-3.5" />
            </span>
            <span>Back to sign in</span>
          </button>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Registration
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create your account to access subjects, video lectures, live exams, and results.
          </p>
        </div>
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
          Civil Portal
        </span>
      </div>

      {/* SECTION 1: Personal Details */}
      <SectionCard title="1. Personal Details" icon={User}>
        <div {...errAttr('name')}>
          <Field label="Full Name" htmlFor="su-name" error={errors.name}>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="su-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name')(e.target.value)}
                placeholder="e.g. Adithyan S."
                className={inputCls(errors.name)}
              />
            </div>
          </Field>
        </div>

        <div {...errAttr('email')}>
          <Field label="Email Address" htmlFor="su-email" error={errors.email}>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="su-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email')(e.target.value)}
                placeholder="you@gmail.com"
                className={inputCls(errors.email)}
              />
            </div>
          </Field>
        </div>

        <div {...errAttr('phone')}>
          <Field label="WhatsApp / Mobile Number" htmlFor="su-phone" error={errors.phone}>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="su-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set('phone')(e.target.value)}
                placeholder="10-digit WhatsApp number"
                className={inputCls(errors.phone)}
              />
            </div>
          </Field>
        </div>

        <div {...errAttr('district')}>
          <Field label="District" htmlFor="su-district" error={errors.district}>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="su-district"
                value={form.district}
                onChange={(e) => set('district')(e.target.value)}
                className={inputCls(errors.district)}
              >
                <option value="">Choose your district</option>
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
                <option value="Other">Other (outside Kerala)</option>
              </select>
            </div>
            {form.district === 'Other' && (
              <input
                type="text"
                aria-label="Your district"
                value={form.districtOther}
                onChange={(e) => set('districtOther')(e.target.value)}
                placeholder="Type your state/district"
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#07242B]/15"
              />
            )}
          </Field>
        </div>
      </SectionCard>

      {/* SECTION 2: Academic & Civil Background */}
      <SectionCard title="2. Academic & Civil Background" icon={GraduationCap}>
        <div {...errAttr('qualification')}>
          <ChoiceGroup
            label="Qualification"
            options={QUALIFICATIONS}
            value={form.qualification}
            onChange={set('qualification')}
            error={errors.qualification}
            columns="grid-cols-2 sm:grid-cols-3"
            isLastSpanned={true}
          />
        </div>

        <div {...errAttr('civilLevel')}>
          <ChoiceGroup
            label="Level on Civil Topics"
            options={CIVIL_LEVELS}
            value={form.civilLevel}
            onChange={set('civilLevel')}
            error={errors.civilLevel}
            columns="grid-cols-2"
          />
        </div>

        <div {...errAttr('preparation')}>
          <ChoiceGroup
            label="Preparation Mode"
            options={PREPARATION_TYPES}
            value={form.preparation}
            onChange={set('preparation')}
            error={errors.preparation}
            columns="grid-cols-2"
          />
        </div>
      </SectionCard>

      {/* SECTION 3: Account Security */}
      <SectionCard title="3. Account Security" icon={Lock}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div {...errAttr('password')}>
            <Field label="Create Password" htmlFor="su-password" error={errors.password}>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="su-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set('password')(e.target.value)}
                  placeholder="Min 6 characters"
                  className={`${inputCls(errors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </div>

          <div {...errAttr('confirmPassword')}>
            <Field label="Confirm Password" htmlFor="su-confirm" error={errors.confirmPassword}>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="su-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword')(e.target.value)}
                  placeholder="Re-enter password"
                  className={inputCls(errors.confirmPassword)}
                />
              </div>
            </Field>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Your password is encrypted and securely stored.</span>
        </p>
      </SectionCard>

      {/* Submit Button */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] hover:opacity-95 shadow-lg shadow-[#07242B]/20 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
        >
          {submitting ? <LoaderCircle className="w-4 h-4 animate-spin text-teal-300" /> : null}
          <span>{submitting ? 'Creating your account…' : 'Complete Registration & Continue'}</span>
          {!submitting && <ArrowRight className="w-4 h-4 text-teal-300" />}
        </button>
      </div>

      <p className="text-center text-xs text-slate-500 pb-1">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-black text-teal-700 dark:text-teal-400 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

// Shown after the admin reset a student's password: they must choose a new one
export const SetNewPasswordForm = ({ name, onSubmit, onCancel }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setError('Use at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setSubmitting(true);
    const res = await onSubmit(password);
    setSubmitting(false);
    if (!res?.ok) setError(res?.error || 'Could not update password');
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Set a new password</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hi {name}, the admin gave you a temporary password. Choose your own password to continue.
        </p>
      </div>
      <div>
        <label htmlFor="np-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New password</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input id="np-password" type="password" autoComplete="new-password" autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className={inputCls(false)} placeholder="At least 6 characters" />
        </div>
      </div>
      <div>
        <label htmlFor="np-confirm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm new password</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input id="np-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} className={inputCls(false)} placeholder="Type it again" />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-bold">
          {submitting ? 'Saving…' : 'Save & Sign In'}
        </button>
      </div>
    </form>
  );
};
