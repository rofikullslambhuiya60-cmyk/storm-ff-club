import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle, Mail } from 'lucide-react';
import { changeAdminPassword, getConfiguredAdminEmail } from '../services/adminAuthService';

export const AdminSecuritySettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const adminEmail = getConfiguredAdminEmail();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update admin password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-display">
              Admin Access & Password Security
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access to this Admin Panel is strictly locked to the configured administrator account.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0a0e18] border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mail className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Authorized Admin Email
              </div>
              <div className="text-xs font-mono font-bold text-white truncate">
                {adminEmail}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 shrink-0">
            Active Lock
          </span>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border-red-500/40 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 font-display flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-orange-400" />
              <span>Change Admin Password</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowPasswords(prev => !prev)}
              className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current admin password"
              className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password (min 8 chars)
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter strong new password"
                minLength={8}
                className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                minLength={8}
                className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/20 cursor-pointer transition-all active:scale-95"
          >
            {loading ? 'Updating Password...' : 'Update Admin Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
