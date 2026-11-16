import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  GraduationCap,
  KeyRound,
  User,
  Lock,
  ArrowRight,
  HardHat,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Check
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, showToast } = useApp();
  const [authRole, setAuthRole] = useState('admin'); // 'admin' or 'student'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleRoleTabChange = (role) => {
    setAuthRole(role);
    if (role === 'admin' || role === 'teacher') {
      setUsername('admin');
      setPassword('admin');
    } else {
      setUsername('student');
      setPassword('student');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check Admin / Teacher credentials
    if (
      cleanUser === 'admin' ||
      cleanUser === 'admin@qsap.edu.in' ||
      cleanUser === 'rajesh.sharma@qsap.edu.in' ||
      cleanUser === 'teacher'
    ) {
      if (
        cleanPass === 'admin' ||
        cleanPass === 'admin123' ||
        cleanPass === 'teacher@123' ||
        cleanPass === 'teacher'
      ) {
        login('teacher', 'T001');
        showToast('Logged in as Admin (Dr. Rajesh Sharma)', 'success');
        if (onClose) onClose();
        return;
      } else {
        showToast('Incorrect Admin password! (Hint: password is "admin")', 'warning');
        return;
      }
    }

    // Check Student credentials
    if (
      cleanUser === 'student' ||
      cleanUser === 'student@qsap.edu.in' ||
      cleanUser === 'adithyan.s@student.qsap.edu.in' ||
      cleanUser === 'stu001'
    ) {
      if (
        cleanPass === 'student' ||
        cleanPass === 'student123' ||
        cleanPass === 'student@123' ||
        cleanPass === '123456'
      ) {
        login('student', 'STU001');
        showToast('Logged in as Student (Adithyan S.)', 'success');
        if (onClose) onClose();
        return;
      } else {
        showToast('Incorrect Student password! (Hint: password is "student")', 'warning');
        return;
      }
    }

    // Fallback based on selected tab if custom inputs provided
    if (authRole === 'admin' || authRole === 'teacher') {
      login('teacher', 'T001');
      showToast('Signed in to Admin Dashboard', 'success');
    } else {
      login('student', 'STU001');
      showToast('Signed in to Student Dashboard', 'success');
    }
    if (onClose) onClose();
  };

  const handleQuickDemoLogin = (role, id) => {
    login(role, id);
    showToast(`Signed in as ${role === 'teacher' ? 'Admin' : 'Student'}`, 'success');
    if (onClose) onClose();
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      showToast('Please enter your institutional email or username', 'warning');
      return;
    }
    setResetSent(true);
    showToast(`Password recovery link sent for ${resetEmail}`, 'success');
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
        {/* DESKTOP-ONLY HERO PANE                                       */}
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
                <span className="font-extrabold text-2xl tracking-tight text-white">CohesionTech</span>
                <span className="block text-xs uppercase tracking-wider text-blue-300 font-semibold">
                  Civil Engineering Suite
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold leading-tight">
              Two Integrated Portals: Admin & Student
            </h2>
            <p className="text-slate-300 text-xs mt-3 leading-relaxed">
              Standardized Civil Engineering platform with full Admin capabilities for teachers, and an advanced examination portal for students.
            </p>

            {/* Credentials Card on Desktop Hero */}
            <div className="mt-5 p-3.5 rounded-2xl bg-white/10 border border-white/15 text-xs space-y-2 backdrop-blur-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                Demo Login Credentials
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-amber-300 font-bold block">👑 Admin / Teacher</span>
                  <div className="text-slate-300 font-mono text-[10px] mt-0.5">
                    ID: <strong>admin</strong><br/>
                    Pass: <strong>admin</strong>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-blue-300 font-bold block">🎓 Student Portal</span>
                  <div className="text-slate-300 font-mono text-[10px] mt-0.5">
                    ID: <strong>student</strong><br/>
                    Pass: <strong>student</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo 1-Click Buttons */}
          <div className="relative z-10 mt-6 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Instant 1-Click Access
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
                    Dr. Rajesh Sharma (Admin & Faculty)
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">admin / admin</div>
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
                    Adithyan S. (Student Portal)
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">student / student</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 mt-5 border-t border-white/10 pt-3 flex justify-between">
            <span>Client: Adithyan</span>
            <span>Frontend React Prototype</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN FORM PANE (Mobile-App + Desktop Optimized)              */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between">
          <div>
            {/* Mobile App Header (Visible on Mobile screens) */}
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-navy-900 flex items-center justify-center shadow-md shadow-blue-500/20">
                    <HardHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                        CohesionTech
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md">
                        CIVIL PRO
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5 font-medium">
                      Admin & Student Platform
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
            <div className="hidden md:flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Institutional Sign In
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select whether you are logging in as Admin or Student
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

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl mb-4 border border-slate-200/50 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  authRole === 'admin'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Admin / Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange('student')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  authRole === 'student'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span>Student</span>
              </button>
            </div>

            {/* Prominent Demo Credentials Callout */}
            <div
              className={`p-3 rounded-2xl border mb-4 flex items-center justify-between text-xs transition-all ${
                authRole === 'admin'
                  ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
                  : 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    authRole === 'admin'
                      ? 'bg-amber-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    {authRole === 'admin' ? '👑 Admin Login ID & Password:' : '🎓 Student Login ID & Password:'}
                  </div>
                  <div className="font-mono text-[11px] opacity-90 mt-0.5">
                    ID: <strong>{authRole === 'admin' ? 'admin' : 'student'}</strong> • Password: <strong>{authRole === 'admin' ? 'admin' : 'student'}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (authRole === 'admin') {
                    setUsername('admin');
                    setPassword('admin');
                  } else {
                    setUsername('student');
                    setPassword('student');
                  }
                  showToast('Credentials filled!', 'info');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  authRole === 'admin'
                    ? 'bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                    : 'bg-blue-200/80 hover:bg-blue-300 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                }`}
              >
                Auto-fill
              </button>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Login ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={authRole === 'admin' ? 'admin' : 'student'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
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
                    placeholder={authRole === 'admin' ? 'admin' : 'student'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
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
                  Instant login enabled
                </span>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 ${
                  authRole === 'admin'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/20'
                }`}
              >
                <span>
                  {authRole === 'admin' ? 'Sign In to Admin Dashboard' : 'Sign In to Student Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Quick Demo Logins Section */}
            <div className="md:hidden mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  1-Tap Instant Access
                </span>
                <span className="text-[9px] lowercase font-normal text-slate-400">no typing required</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {authRole === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('teacher', 'T001')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 border border-amber-200/60 dark:border-amber-900/50 text-xs text-left transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        AD
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          Dr. Rajesh Sharma (Admin & HOD)
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          ID: admin • Pass: admin
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      Enter <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ) : (
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
                            Adithyan S. (Student Portal)
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            ID: student • Pass: student
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
                            Meera Nambiar (Dept Topper)
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            ID: student • Pass: student
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        Enter <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400 dark:text-slate-500">
            CohesionTech Assessment Suite • Admin & Student Dashboards
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
                <h5 className="font-bold text-slate-900 dark:text-white">Recovery Instructions Sent</h5>
                <p className="text-xs text-slate-500">
                  Password recovery details have been dispatched for {resetEmail}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered username (e.g. <strong>admin</strong> or <strong>student</strong>) or institutional email. We will send
                  a password recovery token to your account.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username / Registered Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin or student"
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
