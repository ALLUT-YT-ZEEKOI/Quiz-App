import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  GraduationCap,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  HardHat,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  X,
  UserCheck
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, teachers, students, showToast } = useApp();
  const [authRole, setAuthRole] = useState('student'); // 'student' or 'teacher' (default to student for modern app feel)
  const [email, setEmail] = useState('adithyan.s@student.qsap.edu.in');
  const [password, setPassword] = useState('student@123');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleRoleTabChange = (role) => {
    setAuthRole(role);
    if (role === 'teacher') {
      setEmail('rajesh.sharma@qsap.edu.in');
      setPassword('teacher@123');
    } else {
      setEmail('adithyan.s@student.qsap.edu.in');
      setPassword('student@123');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (authRole === 'teacher') {
      login('teacher', 'T001');
    } else {
      login('student', 'STU001');
    }
    if (onClose) onClose();
  };

  const handleQuickDemoLogin = (role, id) => {
    login(role, id);
    if (onClose) onClose();
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      showToast('Please enter your institutional email', 'warning');
      return;
    }
    setResetSent(true);
    showToast(`Password reset link sent to ${resetEmail}`, 'success');
    setTimeout(() => {
      setForgotPasswordOpen(false);
      setResetSent(false);
      setResetEmail('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-md md:max-w-4xl bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden md:grid md:grid-cols-2 my-auto">
        
        {/* ============================================================ */}
        {/* DESKTOP-ONLY HERO PANE (Hidden on mobile for sleek app feel) */}
        {/* ============================================================ */}
        <div className="hidden md:flex bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <HardHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white">QSAP</span>
                <span className="block text-xs uppercase tracking-wider text-blue-300 font-semibold">
                  Civil Engineering Suite
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold leading-tight">
              Premium Civil Engineering Learning & Assessment System
            </h2>
            <p className="text-slate-300 text-xs mt-3 leading-relaxed">
              Standardized examination, curriculum tracking, and student performance management
              adhering to IS 456, IS 800, and IRC technical benchmarks.
            </p>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="relative z-10 mt-8 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Instant 1-Click Demo Logins
            </div>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('teacher', 'T001')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-amber-200 transition-colors">
                    Dr. Rajesh Sharma (Faculty)
                  </div>
                  <div className="text-[10px] text-slate-300">HOD Structural Engineering</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-300 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student', 'STU001')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                    Adithyan S. (Student)
                  </div>
                  <div className="text-[10px] text-slate-300">Semester 6 • CE-2022-001</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-300 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student', 'STU002')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-emerald-200 transition-colors">
                    Meera Nambiar (Student)
                  </div>
                  <div className="text-[10px] text-slate-300">Department Topper • CGPA 9.42</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 mt-6 border-t border-white/10 pt-3 flex justify-between">
            <span>Client: Adithyan</span>
            <span>Frontend React Prototype</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN / MOBILE-OPTIMIZED APP LOGIN PANE                      */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between">
          <div>
            {/* Mobile App Header (Visible on Mobile screens) */}
            <div className="md:hidden mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-navy-900 flex items-center justify-center shadow-md shadow-blue-500/20">
                    <HardHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                        QSAP
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md">
                        CIVIL PRO
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5 font-medium">
                      Civil Engineering Portal
                    </span>
                  </div>
                </div>

                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Institutional Portal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your role to access curriculum & assessments
                </p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* iOS/App-Style Segmented Role Toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl mb-5 border border-slate-200/50 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleRoleTabChange('student')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  authRole === 'student'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange('teacher')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  authRole === 'teacher'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Faculty / Teacher</span>
              </button>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@student.qsap.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Demo Auto-fills
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>Sign In to {authRole === 'teacher' ? 'Faculty Portal' : 'Student Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* ============================================================ */}
            {/* MOBILE QUICK DEMO LOGIN CARDS (Native App 1-Tap Experience) */}
            {/* ============================================================ */}
            <div className="md:hidden mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Instant 1-Tap Demo Access
                </span>
                <span className="text-[9px] lowercase font-normal text-slate-400">no typing needed</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {authRole === 'student' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('student', 'STU001')}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-900/50 text-xs text-left transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          AS
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            Adithyan S.
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Student • Semester 6 (CE-2022-001)
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                        Enter <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('student', 'STU002')}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-900/50 text-xs text-left transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          MN
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            Meera Nambiar
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Student • Dept Topper (CGPA 9.42)
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        Enter <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('teacher', 'T001')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 border border-amber-200/60 dark:border-amber-900/50 text-xs text-left transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        RS
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          Dr. Rajesh Sharma
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Faculty • HOD Structural Engineering
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      Enter <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
            Civil Engineering Assessment Suite • IS 456 & IS 800 Benchmarks
          </div>
        </div>
      </div>

      {/* Forgot Password Sub-Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Reset Account Password
                </h4>
              </div>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h5 className="font-bold text-slate-900 dark:text-white">Reset Email Dispatched</h5>
                <p className="text-xs text-slate-500">
                  A verification link and token have been sent to your institutional email address.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered institutional Civil Engineering email address. We will send
                  a password recovery link to your inbox.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. adithyan.s@student.qsap.edu.in"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/20"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
