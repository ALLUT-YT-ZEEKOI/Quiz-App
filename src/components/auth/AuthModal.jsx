import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Radio,
  HelpCircle,
  Award,
  Sparkles,
  Clock,
  LoaderCircle,
  KeyRound,
  X,
  ChevronLeft
} from 'lucide-react';
import { StudentSignupForm, SetNewPasswordForm } from './StudentSignupForm';

export const AuthModal = ({ isOpen = true, onClose }) => {
  const {
    showToast,
    loginStudentWithPassword,
    completePasswordChange,
    loginWithPassword,
    darkMode,
    setDarkMode
  } = useApp();

  // Student side: 'signin' | 'signup' | 'setPassword' (after an admin password reset)
  const [studentMode, setStudentMode] = useState('signin');
  const [pendingReset, setPendingReset] = useState(null); // { accountId, name }
  const [signingIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Detect role from URL on startup (/admin vs /student)
  const [authRole, setAuthRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin') || window.location.search.includes('role=admin')) {
        return 'admin';
      }
      if (path.startsWith('/student') || window.location.search.includes('role=student')) {
        return 'student';
      }
    }
    return 'student'; // Default to student for general public
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Sync state if URL changes externally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        setAuthRole('admin');
      } else if (path.startsWith('/student')) {
        setAuthRole('student');
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleRoleTabChange = (role) => {
    setAuthRole(role);
    setStudentMode('signin');
    setErrorMessage('');
    setUsername('');
    setPassword('');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', role === 'admin' ? '/admin' : '/student');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    setSigningIn(true);
    setErrorMessage('');
    const result =
      authRole === 'student'
        ? await loginStudentWithPassword(username, cleanPass)
        : await loginWithPassword('admin', username, cleanPass);
    setSigningIn(false);

    if (!result.ok) {
      const errorText = result.error || 'Incorrect password! Please try again.';
      setErrorMessage(errorText);
      showToast(errorText, 'warning');
      return;
    }

    if (result.mustChangePassword) {
      setPendingReset({ accountId: result.accountId, name: result.name });
      setStudentMode('setPassword');
      setPassword('');
      return;
    }

    if (onClose) onClose();
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
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

  const isSignup = authRole === 'student' && studentMode === 'signup';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F7F8] dark:bg-[#071417] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* ============================================================ */}
      {/* LEFT SIDE: VISUAL BRAND & DATA SHOWCASE (Desktop / Tablet)   */}
      {/* ============================================================ */}
      <div className="relative hidden lg:flex lg:w-[50%] xl:w-[54%] flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#06181D]">
        
        {/* Architectural Civil Photography with Gradient Overlays */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&q=80&w=1600')`
          }}
        />
        {/* Multi-layer Gradient & Scrim Overlays */}
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-[#041215] via-[#051C22]/90 to-[#072B33]/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 z-2 bg-[radial-gradient(#144853_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none z-2" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-2" />

        {/* Top Header: Brand Identity */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white p-1 border border-white/20 shadow-xl shadow-teal-900/40 shrink-0">
              <img src="/logo.jpg" alt="CohesionTech Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-white">CohesionTech</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-extrabold tracking-wider border border-teal-400/30">
                  CIVIL PRO
                </span>
              </div>
              <span className="text-xs text-slate-300 tracking-wide block">
                Technical Learning & Assessment Platform
              </span>
            </div>
          </div>
        </div>

        {/* Middle Content: Educational Highlights & Data Cards */}
        <div className="relative z-10 my-8 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-teal-300 font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Standardized IS 456 & IS 800 Engineering Suite</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Next-Generation Civil Engineering Learning & Live Examination Suite
          </h1>

          <p className="text-sm xl:text-base text-slate-300 leading-relaxed font-normal">
            Designed for technical students and competitive exam aspirants. Access structured module lectures, real-time proctored mock tests, and faculty-guided doubt clearance.
          </p>

          {/* 4 Feature Content Cards ("Left Side Data") */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center mb-2.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-white">Curriculum & Notes</h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Chapter-wise video lessons & downloadable study notes.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-colors">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center mb-2.5">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-white">Live Proctored Exams</h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                60-min timed assessments with automatic score calculation.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-2.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-white">Faculty Doubt Desk</h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Ask doubts directly on any question and receive solutions.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mb-2.5">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-white">Instant Results & Rank</h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Deep performance analytics, topic strengths & answer review.
              </p>
            </div>
          </div>

          {/* Live Data Stat Strip */}
          <div className="p-3 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md flex items-center justify-around text-center text-white">
            <div>
              <div className="text-base font-extrabold text-teal-400">100%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">IS-Code Aligned</div>
            </div>
            <div className="w-px h-6 bg-white/15" />
            <div>
              <div className="text-base font-extrabold text-cyan-400">Live</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Proctoring</div>
            </div>
            <div className="w-px h-6 bg-white/15" />
            <div>
              <div className="text-base font-extrabold text-amber-400">Verified</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Explanations</div>
            </div>
          </div>
        </div>

        {/* Bottom Left Footer Branding */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Platform Online</span>
          </div>
          <div className="font-semibold text-slate-300">
            Built by <span className="text-teal-400 font-bold">AM DOMINA</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE: STANDARD PROFESSIONAL FORM PANE (Mobile & Desktop) */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[50%] xl:w-[46%] min-h-screen flex flex-col justify-between p-4 sm:p-8 xl:p-12 overflow-y-auto bg-white dark:bg-[#0A1A1E]">
        
        {/* Top Bar on Form Pane: Mobile Logo + Theme Switch */}
        <div className="flex items-center justify-between mb-6">
          {/* Brand Logo for Mobile */}
          <div className="flex items-center gap-2.5 lg:invisible">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-0.5 border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">CohesionTech</span>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 block -mt-0.5">Civil Engineering Suite</span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Container for Forms */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          
          {/* Segmented Role Switcher: Student vs Admin */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl mb-6 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleRoleTabChange('student')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                authRole === 'student'
                  ? 'bg-white dark:bg-[#0E282E] text-teal-700 dark:text-teal-300 shadow-md shadow-slate-200/50 dark:shadow-black/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${authRole === 'student' ? 'text-teal-600 dark:text-teal-400' : ''}`} />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                authRole === 'admin'
                  ? 'bg-white dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 shadow-md shadow-slate-200/50 dark:shadow-black/20 border border-amber-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Shield className={`w-4 h-4 ${authRole === 'admin' ? 'text-amber-500' : ''}`} />
              <span>Admin / Faculty</span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* 1. STUDENT REGISTRATION FLOW                                 */}
          {/* ============================================================ */}
          {authRole === 'student' && studentMode === 'signup' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Create Student Account
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Register once with your technical details to access all subjects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStudentMode('signin')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 transition-colors shrink-0"
                >
                  Sign In
                </button>
              </div>

              <StudentSignupForm onSwitchToLogin={() => setStudentMode('signin')} />
            </div>
          ) : authRole === 'student' && studentMode === 'setPassword' && pendingReset ? (
            /* ============================================================ */
            /* 2. SET NEW PASSWORD FLOW                                    */
            /* ============================================================ */
            <div className="animate-in fade-in duration-200">
              <SetNewPasswordForm
                name={pendingReset.name}
                onCancel={() => {
                  setPendingReset(null);
                  setStudentMode('signin');
                }}
                onSubmit={(newPassword) => completePasswordChange(pendingReset.accountId, newPassword)}
              />
            </div>
          ) : authRole === 'student' ? (
            /* ============================================================ */
            /* 3. STUDENT SIGN IN FLOW (Standard & Clean)                   */
            /* ============================================================ */
            <div className="animate-in fade-in duration-200">
              
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Welcome Back, Student 👋
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Sign in with your email, WhatsApp number, or Registration ID.
                </p>
              </div>

              {/* Sub-Switch: Sign In vs Create Account */}
              <div className="flex items-center gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStudentMode('signin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    studentMode === 'signin'
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setStudentMode('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    studentMode === 'signup'
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Username / Email / Phone / ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email, WhatsApp Number or Registration ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      required
                      autoComplete="username"
                      placeholder="e.g. adithyan@gmail.com or 98471 22334"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      required
                      placeholder="Enter your student password"
                      className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border ${
                        errorMessage.toLowerCase().includes('password')
                          ? 'border-red-400 dark:border-red-500 ring-2 ring-red-400/20'
                          : 'border-slate-200 dark:border-slate-800'
                      } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium placeholder:text-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Inline Error Alert Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{errorMessage}</p>
                      {!errorMessage.toLowerCase().includes('password') && (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage('');
                            setStudentMode('signup');
                          }}
                          className="text-[11px] font-bold text-red-700 dark:text-red-300 underline mt-1 block hover:opacity-80"
                        >
                          New student? Register here →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Remember Session & Security Badge */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Encrypted Session
                  </span>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={signingIn}
                  className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-700 via-teal-600 to-[#0A4A55] hover:opacity-95 shadow-md shadow-teal-700/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {signingIn && <LoaderCircle className="w-4 h-4 animate-spin" />}
                  <span>Sign In as Student</span>
                  {!signingIn && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Registration Banner Callout */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  New student joining CohesionTech?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setStudentMode('signup');
                    }}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Create account here
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* 4. ADMIN & FACULTY SIGN IN FLOW                              */
            /* ============================================================ */
            <div className="animate-in fade-in duration-200">
              
              {/* Admin Badge & Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
                  <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Administrative Access Gateway</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Faculty & Admin Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage curriculum subjects, live exams, results and payment approvals.
                </p>
              </div>

              {/* Admin Sign In Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Admin Username / Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Admin Login ID or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      required
                      autoComplete="username"
                      placeholder="e.g. admin@gmail.com or admin"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      required
                      placeholder="Enter admin password"
                      className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border ${
                        errorMessage.toLowerCase().includes('password')
                          ? 'border-red-400 dark:border-red-500 ring-2 ring-red-400/20'
                          : 'border-slate-200 dark:border-slate-800'
                      } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium placeholder:text-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Inline Error Alert */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="flex-1">{errorMessage}</p>
                  </div>
                )}

                {/* Primary Admin Button */}
                <button
                  type="submit"
                  disabled={signingIn}
                  className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 shadow-md shadow-amber-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {signingIn && <LoaderCircle className="w-4 h-4 animate-spin" />}
                  <span>Sign In to Admin Dashboard</span>
                  {!signingIn && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Student Link */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Are you a student?{' '}
                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('student')}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Switch to Student Login
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Attribution Footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-2">
          <span>CohesionTech Platform &bull; {new Date().getFullYear()}</span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Built by <strong className="text-teal-600 dark:text-teal-400 font-extrabold tracking-wide">AM DOMINA</strong>
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FORGOT PASSWORD SUB-MODAL                                    */}
      {/* ============================================================ */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0E282E] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Reset Password
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Request Dispatched</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please contact the faculty administrator on WhatsApp for your temporary password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Registered students: your administrator can reset your password and send you a temporary key via WhatsApp.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Registered Email or WhatsApp Number
                  </label>
                  <input
                    type="text"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter email or WhatsApp number"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
                  >
                    Send Request
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
