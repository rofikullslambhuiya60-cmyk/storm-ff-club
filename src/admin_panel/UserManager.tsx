import React, { useState } from 'react';
import { Users, Search, ShieldAlert, ShieldBan, ShieldCheck, DollarSign, Smartphone, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';
import { AppUser } from '../types';
import { sanitizeSignedIntInput, toSafeNumber } from '../utils/numberInput';

export const UserManager: React.FC = () => {
  const { allUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<AppUser | null>(null);
  const [depositAdjustment, setDepositAdjustment] = useState<string>('0');
  const [winningAdjustment, setWinningAdjustment] = useState<string>('0');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredUsers = allUsers.filter(u => 
    u.ign.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.freeFireUid.includes(searchTerm) ||
    (u.phone && u.phone.includes(searchTerm)) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleMatchBan = (user: AppUser) => {
    const updated = !user.isMatchBanned;
    dbStore.updateUser(user.uid, { isMatchBanned: updated });
    setFeedback(`Player ${user.ign} match ban status updated: ${updated ? 'BANNED' : 'UNBANNED'}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTogglePermanentBan = (user: AppUser) => {
    const updated = !user.isPermanentlyBanned;
    dbStore.updateUser(user.uid, { isPermanentlyBanned: updated });
    setFeedback(`Player ${user.ign} permanent blacklist status updated: ${updated ? 'BLACKLISTED' : 'ACTIVE'}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjust) return;

    const depDelta = toSafeNumber(depositAdjustment, 0);
    const winDelta = toSafeNumber(winningAdjustment, 0);
    const newDeposit = Math.max(0, selectedUserForAdjust.depositBalance + depDelta);
    const newWinning = Math.max(0, selectedUserForAdjust.winningBalance + winDelta);

    dbStore.updateUser(selectedUserForAdjust.uid, {
      depositBalance: newDeposit,
      winningBalance: newWinning
    });

    setFeedback(`Balances adjusted for ${selectedUserForAdjust.ign}!`);
    setSelectedUserForAdjust(null);
    setDepositAdjustment('0');
    setWinningAdjustment('0');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            User & Anti-Fraud Manager
          </h2>
          <p className="text-xs text-slate-400">
            Audit player profiles, adjust balances, check hardware device fingerprints, and enforce bans.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search IGN, FF UID, Phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-body"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* User Table */}
      <div className="bg-[#0f1524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a0e18] border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-3.5">Gamer & Contact</th>
                <th className="p-3.5">Free Fire UID</th>
                <th className="p-3.5">Balances (Deposit / Winning)</th>
                <th className="p-3.5">Referral Stats</th>
                <th className="p-3.5">Hardware Device ID</th>
                <th className="p-3.5">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map(user => {
                // Check if other accounts share this device
                const sameDeviceCount = allUsers.filter(u => u.deviceId === user.deviceId).length;

                return (
                  <tr key={user.uid} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5 font-body">
                        <span>{user.ign}</span>
                        {user.role === 'admin' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {user.phone || user.email || 'N/A'}
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-amber-400">
                      {user.freeFireUid}
                    </td>

                    <td className="p-3.5 font-mono">
                      <div>Dep: <span className="text-white font-bold">৳{user.depositBalance}</span></div>
                      <div>Win: <span className="text-emerald-400 font-bold">৳{user.winningBalance}</span></div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-mono text-slate-300">
                        Code: <strong className="text-amber-400">{user.referralCode}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {user.referralCount} Invites • ৳{user.referralEarnings} Earned
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[10px]">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Smartphone className="w-3 h-3 text-slate-500" />
                        <span>{user.deviceId.slice(0, 16)}...</span>
                      </div>
                      {sameDeviceCount > 1 ? (
                        <span className="text-amber-400 font-bold block mt-0.5">
                          ⚠️ {sameDeviceCount} accounts linked to device
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[9px] block mt-0.5">
                          ✓ Single Device
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUserForAdjust(user);
                            setDepositAdjustment('0');
                            setWinningAdjustment('0');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Balance ±
                        </button>

                        <button
                          onClick={() => handleToggleMatchBan(user)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            user.isMatchBanned
                              ? 'bg-red-500 text-white'
                              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          }`}
                          title="Toggle tournament match join ban"
                        >
                          {user.isMatchBanned ? 'Match Banned' : 'Match Ban'}
                        </button>

                        <button
                          onClick={() => handleTogglePermanentBan(user)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            user.isPermanentlyBanned
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-red-400'
                          }`}
                          title="Permanent hardware ban"
                        >
                          Perm Ban
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BALANCE ADJUSTMENT MODAL */}
      {selectedUserForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white font-display mb-1">
              Adjust Balances for {selectedUserForAdjust.ign}
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Current Dep: ৳{selectedUserForAdjust.depositBalance} • Win: ৳{selectedUserForAdjust.winningBalance}
            </p>

            <form onSubmit={handleSaveBalanceAdjustment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deposit Balance Adjustment (± TK)
                </label>
                <input
                  type="text"
                  inputMode="text"
                  placeholder="e.g. 50 or -20"
                  value={depositAdjustment}
                  onChange={e => setDepositAdjustment(sanitizeSignedIntInput(e.target.value))}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Winning Balance Adjustment (± TK)
                </label>
                <input
                  type="text"
                  inputMode="text"
                  placeholder="e.g. 100 or -50"
                  value={winningAdjustment}
                  onChange={e => setWinningAdjustment(sanitizeSignedIntInput(e.target.value))}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Save Adjustments
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserForAdjust(null)}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
