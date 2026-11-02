import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/common/RoleBadge';
import {
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Users,
  Sparkles,
} from 'lucide-react';
import { ROLES } from '../utils/constants';

export default function LoginPage({ onNavigate }) {
  const { login, register, forgotPassword, resetPassword, demoAccounts, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'demo' | 'forgot'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState(ROLES.CITIZEN);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter otp & new pass
  const [pilotHint, setPilotHint] = useState(null);

  // UI state
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Too empty', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-teal-500' };
  };

  const passStrength = getPasswordStrength(regPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await login(loginEmail, loginPassword);
    setSubmitting(false);

    if (res.success) {
      if (res.user?.role === ROLES.AUTHORITY || res.user?.role === ROLES.ADMIN) {
        onNavigate('authority');
      } else {
        onNavigate('citizen');
      }
    } else {
      setError(res.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const res = await register({
      fullName: regName,
      email: regEmail,
      phoneNumber: regPhone,
      password: regPassword,
      role: regRole,
    });
    setSubmitting(false);

    if (res.success) {
      onNavigate('citizen');
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (forgotStep === 1) {
      const res = await forgotPassword(forgotEmail);
      setSubmitting(false);
      if (res.success) {
        setForgotStep(2);
        setPilotHint(res.pilotHint);
        setSuccessMsg(res.message);
      } else {
        setError(res.message);
      }
    } else {
      const res = await resetPassword(forgotEmail, otpCode, newPassword);
      setSubmitting(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setActiveTab('login');
        setLoginEmail(forgotEmail);
      } else {
        setError(res.message);
      }
    }
  };

  const handleDemoSelect = async (role) => {
    setError(null);
    setSubmitting(true);
    const res = await switchDemoRole(role);
    setSubmitting(false);

    if (res.success) {
      if (role === ROLES.AUTHORITY || role === ROLES.ADMIN) {
        onNavigate('authority');
      } else {
        onNavigate('citizen');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="max-w-md w-full space-y-6">
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">JANASHAKTI Portal</h2>
          <p className="text-xs text-slate-500 font-medium">
            Civic Safety & Incident Platform • Davanagere Pilot
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setActiveTab('demo'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'demo' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demo Profiles
          </button>
        </div>

        {/* Notifications / Feedback */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN TAB */}
        {activeTab === 'login' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="ramesh.cit@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password *</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setError(null); setSuccessMsg(null); }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In to Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500">Need quick testing without entering credentials?</span>
              <button
                type="button"
                onClick={() => setActiveTab('demo')}
                className="block mx-auto mt-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Use One-Click Demo Profiles (Citizen / Authority / Admin)
              </button>
            </div>
          </div>
        )}

        {/* 2. CREATE ACCOUNT TAB */}
        {activeTab === 'register' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98450 12345"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Kept strictly confidential; never visible on public feeds.
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Civic Role</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    regRole === ROLES.CITIZEN ? 'border-blue-500 bg-blue-50/70 text-blue-900' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value={ROLES.CITIZEN}
                      checked={regRole === ROLES.CITIZEN}
                      onChange={() => setRegRole(ROLES.CITIZEN)}
                      className="sr-only"
                    />
                    <span className="font-bold block">Citizen</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Report incidents & track resolution</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    regRole === ROLES.VOLUNTEER ? 'border-teal-500 bg-teal-50/70 text-teal-900' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value={ROLES.VOLUNTEER}
                      checked={regRole === ROLES.VOLUNTEER}
                      onChange={() => setRegRole(ROLES.VOLUNTEER)}
                      className="sr-only"
                    />
                    <span className="font-bold block">Volunteer</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Vouch for nearby community reports</span>
                  </label>
                </div>
              </div>

              {/* Password & Confirmation */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm *</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password strength meter */}
              {regPassword && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Password strength:</span>
                    <span className="font-semibold text-slate-700">{passStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passStrength.color} transition-all duration-300`}
                      style={{ width: `${(passStrength.score / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 mt-2"
              >
                {submitting ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 3. ONE-CLICK DEMO PROFILES */}
        {activeTab === 'demo' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Role Persona for Testing
                </h3>
                <p className="text-[11px] text-slate-500">
                  Instant RBAC inspection without manual credentials
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoSelect(acc.role)}
                  disabled={submitting}
                  className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={acc.role} />
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        {acc.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{acc.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">{acc.email}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. FORGOT / RESET PASSWORD TAB */}
        {activeTab === 'forgot' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Account Recovery & OTP Reset
              </h3>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email *</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.cit@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {forgotStep === 2 && (
                <>
                  {pilotHint && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono text-blue-800">
                      {pilotHint}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter 6-Digit OTP *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Processing...' : forgotStep === 1 ? 'Dispatch Verification OTP' : 'Reset Password'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('login'); setForgotStep(1); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
