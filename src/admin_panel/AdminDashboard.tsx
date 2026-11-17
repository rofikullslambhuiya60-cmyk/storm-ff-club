import React from 'react';
import { 
  Users, DollarSign, ArrowUpRight, ArrowDownLeft, Gift, 
  Swords, Trophy, ShieldCheck, Flame, Bell, Share2, Sparkles 
} from 'lucide-react';
import { dbStore } from '../services/firebaseConfig';
import { useApp } from '../context/AppContext';

export const AdminDashboard: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { allUsers, matches, transactions, mysteryBoxOrders } = useApp();

  // Metrics
  const totalUsers = allUsers.length;
  const activeTournaments = matches.filter(m => {
    const s = (m.status || 'open').trim().toLowerCase();
    return s !== 'completed' && s !== 'cancelled';
  }).length;
  const completedMatches = matches.filter(m => (m.status || '').trim().toLowerCase() === 'completed').length;

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = transactions
    .filter(t => t.type === 'withdraw' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'pending');
  const pendingMysteryOrders = mysteryBoxOrders.filter(o => o.status === 'pending');

  const totalReferralBonusGiven = allUsers.reduce((sum, u) => sum + (u.referralEarnings || 0), 0);
  const totalPointsInCirculation = allUsers.reduce((sum, u) => sum + (u.points || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Pending Withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-2 border-amber-500/50 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide font-display">
                Action Required: {pendingWithdrawals.length} Pending Withdrawal Request(s)
              </h4>
              <p className="text-xs text-amber-100/80">
                Players are awaiting automated bKash/Nagad cashout approval.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('payouts')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer"
          >
            Review Payouts
          </button>
        </div>
      )}

      {/* Top Banner Alert for Pending Mystery Box Orders */}
      {pendingMysteryOrders.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border-2 border-purple-500/50 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            <div>
              <h4 className="text-sm font-black text-purple-300 uppercase tracking-wide font-display">
                Action Required: {pendingMysteryOrders.length} Pending Mystery Box Order(s)
              </h4>
              <p className="text-xs text-purple-100/80">
                Players redeemed points for Diamond Mystery Boxes. Send diamonds to UID and click "Done" to notify them.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('mystery_orders')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer shrink-0"
          >
            Fulfill Orders →
          </button>
        </div>
      )}

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Deposited */}
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inflow (Deposits)</span>
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ৳{totalDeposits.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <span>✓ Verified via bKash & Nagad Gateways</span>
          </p>
        </div>

        {/* KPI 2: Total Paid Out */}
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Payouts Released</span>
            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ৳{totalPayouts.toLocaleString()}
          </div>
          <p className="text-[11px] text-purple-400 mt-1">
            {pendingWithdrawals.length} Pending Approval
          </p>
        </div>

        {/* KPI 3: Registered Gamers */}
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Gamers</span>
            <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalUsers}
          </div>
          <p className="text-[11px] text-cyan-400 mt-1">
            Max 2 accounts/device enforced
          </p>
        </div>

        {/* KPI 4: Referral Commission Given */}
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Bonus Disbursed</span>
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ৳{totalReferralBonusGiven.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-400 mt-1">
            Circulating Points: {totalPointsInCirculation}
          </p>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Matches Manager */}
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Swords className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm font-display">Active Tournaments</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {activeTournaments} live/open/upcoming tournament rooms. Manage slot bookings, room passwords, cancellations with auto-refunds, and 1-click payouts.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('matches')}
            className="w-full py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
          >
            Manage Matches & Create Room →
          </button>
        </div>

        {/* Card 2: Gateways & Payouts */}
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm font-display">Payment Gateways</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Update bKash and Nagad numbers on-the-fly without changing code. Review pending withdrawals with custom rejection reasons.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('gateways')}
            className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
          >
            Update Gateway Numbers →
          </button>
        </div>

        {/* Card 3: Global Broadcast */}
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Bell className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm font-display">Broadcast Push Alerts</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Send instant global alerts to all player inboxes regarding maintenance, new tournaments, or tournament room ID releases.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('notifications')}
            className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
          >
            Send Push Broadcast →
          </button>
        </div>
      </div>

      {/* Recent System Activity Log */}
      <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 font-display">
          Recent Platform Transactions & Activity
        </h3>

        <div className="space-y-2 overflow-x-auto">
          {transactions.slice(0, 6).map(trx => (
            <div
              key={trx.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#0a0e18] border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                  trx.type === 'deposit'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : trx.type === 'withdraw'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {trx.type}
                </span>
                <div>
                  <span className="font-bold text-white">{trx.userIgn}</span>
                  <span className="text-slate-500 text-[11px] ml-2 font-mono">{trx.trxId || `#${trx.id.slice(-6)}`}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-white">৳{trx.amount}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  trx.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10' :
                  trx.status === 'rejected' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'
                }`}>
                  {trx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
