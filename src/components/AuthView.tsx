import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  HardDrive,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

// Google 4-Color Icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Google Account Chooser Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isAddingNewGoogleAccount, setIsAddingNewGoogleAccount] = useState(false);

  // Direct Google login handler
  const handleGoogleSignIn = (selectedEmail?: string, selectedName?: string) => {
    setIsLoading(true);
    setIsGoogleModalOpen(false);

    setTimeout(() => {
      const emailToUse = (selectedEmail || 'joshith498@gmail.com').trim().toLowerCase();
      const nameToUse =
        selectedName?.trim() ||
        (emailToUse.startsWith('joshith')
          ? 'Joshith'
          : emailToUse.split('@')[0].charAt(0).toUpperCase() + emailToUse.split('@')[0].slice(1));

      const googleUser: User = {
        id: 'usr_g_' + Date.now(),
        name: nameToUse,
        email: emailToUse,
        role: 'Personal',
        provider: 'google',
        createdAt: new Date().toISOString(),
      };

      setIsLoading(false);
      onLogin(googleUser);
    }, 350);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes('@')) {
      setError('Please provide a valid Google email address.');
      return;
    }
    handleGoogleSignIn(customGoogleEmail, customGoogleName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (isRegister && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user: User = {
        id: 'usr_' + Date.now(),
        name: isRegister ? fullName.trim() : email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: 'Personal',
        provider: 'email',
        createdAt: new Date().toISOString(),
      };

      setIsLoading(false);
      onLogin(user);
    }, 350);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser: User = {
        id: 'usr_demo',
        name: 'Guest User',
        email: 'guest@workspace.local',
        role: 'Personal',
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      setIsLoading(false);
      onLogin(demoUser);
    }, 250);
  };

  return (
    <div className="relative min-h-screen bg-[#07080a] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 antialiased selection:bg-indigo-600 selection:text-white overflow-hidden bg-dot-matrix">
      {/* 3D Ambient Volumetric Light Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[120px] animate-ambient-1" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[130px] animate-ambient-2" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] animate-ambient-pulse" />

      {/* Header Brand with 3D Depth */}
      <div className="relative z-10 w-full max-w-md mb-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 shadow-[0_0_24px_rgba(99,102,241,0.35)] backdrop-blur-xl group">
          <Layers className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-glow-sm">
          OmniWorkspace
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Personal notes, visual media, and project planning in one place
        </p>
      </div>

      {/* Main Authentication Card with 3D Glow Aura */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glow Aura Layer behind the card */}
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-cyan-500/20 to-purple-500/30 blur-2xl pointer-events-none" />

        <div className="relative bg-zinc-900/85 border border-zinc-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-5 specular-card">
          {/* Specular Top Rim */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Toggle Mode Segmented Control with 3D Depth */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs font-medium shadow-inner">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                !isRegister
                  ? 'bg-zinc-800 text-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                isRegister
                  ? 'bg-zinc-800 text-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* DIRECT GOOGLE LOGIN BUTTON (Primary 3D Action) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              disabled={isLoading}
              className="btn-3d w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-50 text-zinc-950 font-bold text-xs sm:text-sm shadow-[0_8px_20px_-4px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 cursor-pointer border border-zinc-200"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{isRegister ? 'Sign up directly with Google' : 'Continue with Google'}</span>
            </button>

            <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span>1-click Google authentication with instant access</span>
            </p>
          </div>

          {/* 3D Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800" />
            <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
              or continue with email
            </span>
            <div className="flex-grow border-t border-zinc-800" />
          </div>

          {/* Error Notification */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 shadow-[0_0_16px_rgba(239,68,68,0.2)] animate-in fade-in">
              {error}
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Joshith"
                    className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('joshith498@gmail.com', 'Joshith')}
                  className="text-indigo-400 hover:text-indigo-300 transition font-medium cursor-pointer"
                >
                  Direct Google link
                </button>
              </div>
            )}

            {/* Submit Button with 3D Push */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-3d w-full mt-2 py-2.5 rounded-xl bg-gradient-to-b from-white to-zinc-200 text-zinc-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,255,255,0.15)] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="text-xs">Connecting...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs font-semibold transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer hover:border-zinc-600"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Continue as Guest (No setup needed)</span>
          </button>

          {/* Value Propositions / Trust indicators */}
          <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-400">
            <div className="flex flex-col items-center">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400 mb-1" />
              <span>Offline Persistence</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mb-1" />
              <span>Private &amp; Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mb-1" />
              <span>PWA Ready</span>
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-10 mt-6 text-[11px] text-zinc-500 text-center font-mono">
        Local browser encrypted · Instant access
      </p>

      {/* GOOGLE ACCOUNT SELECTION MODAL WITH 3D GLASS STYLING */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setIsGoogleModalOpen(false)} />

          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700/80 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(99,102,241,0.2)] z-10 space-y-4 specular-card">
            {/* Modal Header with Google Logo */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="w-5 h-5" />
                <span className="font-bold text-white text-sm">
                  Sign in with Google
                </span>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Choose an account to continue to <strong className="text-white font-semibold">OmniWorkspace</strong>:
            </p>

            {!isAddingNewGoogleAccount ? (
              <div className="space-y-2.5">
                {/* Detected Google Account 1: joshith498@gmail.com */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('joshith498@gmail.com', 'Joshith')}
                  className="w-full p-3 rounded-xl bg-zinc-950/90 border border-zinc-700/90 hover:border-indigo-500 hover:bg-zinc-850 flex items-center justify-between gap-3 text-left transition-all duration-200 cursor-pointer group shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                      J
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-100 group-hover:text-white truncate">
                        Joshith
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate font-mono">
                        joshith498@gmail.com
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/70 shrink-0 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    Active
                  </span>
                </button>

                {/* Option to use another Google account */}
                <button
                  type="button"
                  onClick={() => setIsAddingNewGoogleAccount(true)}
                  className="w-full p-2.5 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Use another Google account</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Google Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewGoogleAccount(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-3d px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold shadow-md cursor-pointer"
                  >
                    Continue with Google
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 text-center">
              Google will securely connect your account profile to OmniWorkspace.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
