import React, { useState } from 'react';
import {
  ShieldAlert, Lock, Mail, KeyRound, Eye, EyeOff, ArrowLeft, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
  signInAdminWithEmailPassword,
  sendAdminPasswordReset
} from '../services/adminAuthService';

interface AdminLoginScreenProps {
  onSuccess: () => void;
  onGoToApp: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onSuccess,
  onGoToApp
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isResetMode) {
        const res = await sendAdminPasswordReset(email);
        if (res.success) {
          setSuccessMsg(res.message);
        } else {
          setError(res.message);
        }
        return;
      }

      const res = await signInAdminWithEmailPassword(email, password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Unauthorized: Invalid administrator credentials.');
      }
    } catch {
      setError('Firebase Authentication verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#06080f] text-white flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 shadow-xl shadow-red-500/10">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider font-display text-white">
            Restricted Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Storm FF Club Management Console • Firebase Auth Verified Admin Only
          </p>
        </div>

        <div className="bg-[#0d1220] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="Enter administrator email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#080c16] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {!isResetMode && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Administrator Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-orange-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#080c16] border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>
                {loading
                  ? 'Verifying with Firebase Auth...'
                  : isResetMode
                  ? 'Send Password Reset Email'
                  : 'Sign In to Admin Panel'}
              </span>
            </button>

            {isResetMode && (
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Back to Admin Sign In
              </button>
            )}
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={onGoToApp}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storm FF Club App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
