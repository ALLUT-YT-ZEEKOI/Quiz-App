import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, Lock, Eye, EyeOff, ArrowRight, LoaderCircle, ArrowLeft } from 'lucide-react';
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
  `w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all font-medium ${
    hasError
      ? 'border-red-400 focus:ring-red-500/20'
      : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
  }`;

const Field = ({ label, error, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
      {label} <span className="text-red-500">*</span>
    </label>
    {children}
    {error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
  </div>
);

// Single-choice chips (same choices as the registration Google Form)
const ChoiceGroup = ({ label, options, value, onChange, error, columns = 'grid-cols-2' }) => (
  <div>
    <span id={`${label}-label`} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label} <span className="text-red-500">*</span>
    </span>
    <div role="radiogroup" aria-labelledby={`${label}-label`} className={`grid ${columns} gap-1.5`}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all flex items-center gap-2 ${
              selected
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500/15'
                : error
                ? 'bg-slate-50 dark:bg-slate-900/60 border-red-300 dark:border-red-900/60 text-slate-600 dark:text-slate-300'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                selected ? 'border-blue-600 bg-blue-600 shadow-[inset_0_0_0_2px_white] dark:shadow-[inset_0_0_0_2px_#0f172a]' : 'border-slate-300 dark:border-slate-600'
              }`}
            />
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
    {error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
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
    if (!result.ok) setErrors({ [result.field]: result.error });
  };

  const errAttr = (field) => ({ 'data-signup-error': errors[field] ? 'true' : undefined });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
      <div>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </button>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Registration</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Create your account to join classes, exams and question discussions.
        </p>
      </div>

      <div {...errAttr('email')}>
        <Field label="Email" htmlFor="su-email" error={errors.email}>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="su-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email')(e.target.value)} placeholder="you@gmail.com" className={inputCls(errors.email)} />
          </div>
        </Field>
      </div>

      <div {...errAttr('name')}>
        <Field label="Name" htmlFor="su-name" error={errors.name}>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="su-name" type="text" autoComplete="name" value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="Your full name" className={inputCls(errors.name)} />
          </div>
        </Field>
      </div>

      <div {...errAttr('qualification')}>
        <ChoiceGroup label="Qualification" options={QUALIFICATIONS} value={form.qualification} onChange={set('qualification')} error={errors.qualification} columns="grid-cols-2 sm:grid-cols-3" />
      </div>

      <div {...errAttr('phone')}>
        <Field label="Phone no (WhatsApp no)" htmlFor="su-phone" error={errors.phone}>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="su-phone" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="98471 22334" className={inputCls(errors.phone)} />
          </div>
        </Field>
      </div>

      <div {...errAttr('civilLevel')}>
        <ChoiceGroup label="Your level on Civil topics" options={CIVIL_LEVELS} value={form.civilLevel} onChange={set('civilLevel')} error={errors.civilLevel} />
      </div>

      <div {...errAttr('preparation')}>
        <ChoiceGroup label="Your preparation" options={PREPARATION_TYPES} value={form.preparation} onChange={set('preparation')} error={errors.preparation} />
      </div>

      <div {...errAttr('district')}>
        <Field label="District" htmlFor="su-district" error={errors.district}>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select id="su-district" value={form.district} onChange={(e) => set('district')(e.target.value)} className={inputCls(errors.district)}>
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
              placeholder="Type your district"
              className="mt-2 w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          )}
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div {...errAttr('password')}>
          <Field label="Create password" htmlFor="su-password" error={errors.password}>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input id="su-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => set('password')(e.target.value)} placeholder="At least 6 characters" className={`${inputCls(errors.password)} pr-10`} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
        </div>
        <div {...errAttr('confirmPassword')}>
          <Field label="Confirm password" htmlFor="su-confirm" error={errors.confirmPassword}>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input id="su-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => set('confirmPassword')(e.target.value)} placeholder="Type it again" className={inputCls(errors.confirmPassword)} />
            </div>
          </Field>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 -mt-1">
        Your password is stored encrypted. The admin can't see it, but can reset it if you forget.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}
        <span>{submitting ? 'Creating your account…' : 'Register & Continue'}</span>
        {!submitting && <ArrowRight className="w-4 h-4" />}
      </button>

      <p className="text-center text-xs text-slate-500">
        Already registered?{' '}
        <button type="button" onClick={onSwitchToLogin} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
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
    <form onSubmit={handle} className="space-y-3.5">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Set a new password</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hi {name}, the admin gave you a temporary password. Choose your own password to continue.
        </p>
      </div>
      <div>
        <label htmlFor="np-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New password</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input id="np-password" type="password" autoComplete="new-password" autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className={inputCls(false)} placeholder="At least 6 characters" />
        </div>
      </div>
      <div>
        <label htmlFor="np-confirm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm new password</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input id="np-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} className={inputCls(false)} placeholder="Type it again" />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold">
          {submitting ? 'Saving…' : 'Save & Sign In'}
        </button>
      </div>
    </form>
  );
};
