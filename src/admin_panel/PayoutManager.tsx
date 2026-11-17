import React, { useState } from 'react';
import { DollarSign, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';
import { Transaction, AppUser } from '../types';

export const PayoutManager: React.FC = () => {
  const { transactions } = useApp();
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [rejectingTrx, setRejectingTrx] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Deposit not played in matches. Must play tournaments to withdraw.');
  const [feedback, setFeedback] = useState<string | null>(null);

  const depositRequests = transactions.filter(t => t.type === 'deposit');
  const withdrawalRequests = transactions.filter(t => t.type === 'withdraw');

  const pendingDepositsCount = depositRequests.filter(t => t.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawalRequests.filter(t => t.status === 'pending').length;

  // Approve Deposit (Manual Admin Approval Flow)
  const handleApproveDeposit = (trx: Transaction) => {
    if (trx.status !== 'pending') return;

    const user = dbStore.findUserById(trx.uid);
    if (!user) {
      setFeedback('Error: User account not found');
      return;
    }

    // Calculate signup bonus if applicable
    let unlockedBonus = 0;
    if (!user.hasDeposited && user.signupBonusLocked > 0) {
      unlockedBonus = user.signupBonusLocked;
    }

    const newDeposit = (user.depositBalance || 0) + trx.amount + unlockedBonus;

    if (unlockedBonus > 0) {
      dbStore.addTransaction({
        id: 'bonus_' + Math.random().toString(36).substring(2, 9),
        uid: user.uid,
        userIgn: user.ign,
        type: 'signup_bonus',
        amount: unlockedBonus,
        method: 'Wallet',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
    }

    // Flexible Referral Bonus: Credit directly to Referrer's Deposit / Main Wallet Balance
    // Only trigger if deposit amount meets admin-configured referralMinDeposit threshold
    const minDepositForReferral = dbStore.settings.referralMinDeposit ?? 50;
    if (user.referredBy && trx.amount >= minDepositForReferral) {
      const referrer = dbStore.users.find((u: AppUser) => u.referralCode === user.referredBy);
      if (referrer) {
        let referralReward = 0;
        if (!user.hasDeposited) {
          const fixedBonus = dbStore.settings.referralFixedBonus ?? 20;
          if (fixedBonus > 0) referralReward += fixedBonus;
        }

        const prevApprovedDeposits = transactions.filter(
          t => t.uid === user.uid && t.type === 'deposit' && t.status === 'approved'
        ).length;

        const first3Percent = dbStore.settings.referralFirstThreeDepositsPercent ?? 5;
        const lifetimePassivePercent = dbStore.settings.referralLifetimePassivePercent ?? 1;

        if (prevApprovedDeposits < 3 && first3Percent > 0) {
          const bonusAmt = Math.round((trx.amount * first3Percent) / 100);
          if (bonusAmt > 0) referralReward += bonusAmt;
        } else if (lifetimePassivePercent > 0) {
          const passiveAmt = Math.round((trx.amount * lifetimePassivePercent) / 100);
          if (passiveAmt > 0) referralReward += passiveAmt;
        }

        if (referralReward > 0) {
          const updatedRefDeposit = (referrer.depositBalance || 0) + referralReward;
          const updatedRefEarnings = (referrer.referralEarnings || 0) + referralReward;

          dbStore.addTransaction({
            id: 'ref_dep_' + Math.random().toString(36).substring(2, 9),
            uid: referrer.uid,
            userIgn: referrer.ign,
            type: 'referral_bonus',
            amount: referralReward,
            method: 'Wallet',
            trxId: `REF-${user.referralCode || 'DEP'}`,
            status: 'approved',
            createdAt: new Date().toISOString()
          });

          dbStore.updateUser(referrer.uid, {
            depositBalance: updatedRefDeposit,
            referralEarnings: updatedRefEarnings
          });
        }
      }
    }

    // Update user balance in Firestore
    dbStore.updateUser(user.uid, {
      depositBalance: newDeposit,
      hasDeposited: true,
      signupBonusLocked: 0
    });

    // Mark transaction as approved
    dbStore.updateTransaction(trx.id, { status: 'approved' });

    // Trigger instant live in-app notification to this specific user
    dbStore.addNotification({
      id: 'notif_dep_' + Math.random().toString(36).substring(2, 9),
      title: '✅ পেমেন্ট অ্যাপ্রুভ হয়েছে!',
      message: 'আপনার পেমেন্ট সফলভাবে অ্যাপ্রুভ করা হয়েছে এবং আপনার একাউন্টে পেমেন্টকৃত ব্যালেন্স সংযুক্ত করা হয়েছে।',
      category: 'wallet',
      targetUid: user.uid,
      createdAt: new Date().toISOString(),
      read: false
    });

    setFeedback(`✅ Deposit of ৳${trx.amount} for ${trx.userIgn} approved! User credited & live notification dispatched.`);
    setTimeout(() => setFeedback(null), 4500);
  };

  // Reject Deposit
  const handleRejectDeposit = (trx: Transaction) => {
    dbStore.updateTransaction(trx.id, {
      status: 'rejected',
      rejectionReason: 'Invalid Transaction ID (TrxID) or sender mismatch.'
    });
    setFeedback(`Deposit of ৳${trx.amount} for ${trx.userIgn} rejected.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Approve Withdrawal
  const handleApproveWithdrawal = (trx: Transaction) => {
    dbStore.updateTransaction(trx.id, { status: 'approved' });
    setFeedback(`Withdrawal of ৳${trx.amount} for ${trx.userIgn} approved & paid!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Reject Withdrawal
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTrx) return;

    // Refund the amount back to user's winning balance
    const user = dbStore.findUserById(rejectingTrx.uid);
    if (user) {
      dbStore.updateUser(user.uid, {
        winningBalance: user.winningBalance + rejectingTrx.amount
      });
    }

    dbStore.updateTransaction(rejectingTrx.id, {
      status: 'rejected',
      rejectionReason: rejectionReason.trim()
    });

    setFeedback(`Withdrawal rejected with reason. ৳${rejectingTrx.amount} refunded to ${rejectingTrx.userIgn}'s winning balance.`);
    setRejectingTrx(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Manual Payment Approvals & Cashier
          </h2>
          <p className="text-xs text-slate-400">
            Review incoming deposits and process player cashout requests via bKash & Nagad with full manual approval control.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#0f1524] p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deposits'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Deposits</span>
            {pendingDepositsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-amber-400 text-black">
                {pendingDepositsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'withdrawals'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdrawals</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-amber-400 text-black">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* DEPOSITS TABLE */}
      {activeTab === 'deposits' && (
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#0a0e18] border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Incoming Deposits ({depositRequests.length})
            </span>
            {pendingDepositsCount > 0 && (
              <span className="text-[10px] text-amber-400 font-bold font-mono bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {pendingDepositsCount} Awaiting Manual Approval
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e18] border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3.5">Player IGN</th>
                  <th className="p-3.5">Method & Sender Number</th>
                  <th className="p-3.5">Transaction ID (TrxID)</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {depositRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No deposit transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  depositRequests.map(trx => (
                    <tr key={trx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white font-body">
                        {trx.userIgn}
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-orange-400">{trx.method}</span>
                        <div className="text-slate-300 font-semibold">{trx.senderNumber || 'N/A'}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-400 text-xs">
                        {trx.trxId}
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                        ৳{trx.amount}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(trx.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          trx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          trx.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}>
                          {trx.status}
                        </span>
                        {trx.rejectionReason && (
                          <p className="text-[10px] text-red-400 mt-0.5 italic">{trx.rejectionReason}</p>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {trx.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveDeposit(trx)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-95"
                            >
                              Approve Deposit
                            </button>
                            <button
                              onClick={() => handleRejectDeposit(trx)}
                              className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold cursor-pointer border border-red-500/30"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WITHDRAWALS TABLE */}
      {activeTab === 'withdrawals' && (
        <div className="bg-[#0f1524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#0a0e18] border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Withdrawal Cashout Requests ({withdrawalRequests.length})
            </span>
            {pendingWithdrawalsCount > 0 && (
              <span className="text-[10px] text-amber-400 font-bold font-mono bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {pendingWithdrawalsCount} Pending Review
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e18] border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3.5">Player IGN</th>
                  <th className="p-3.5">Method & Payout Number</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Time Requested</th>
                  <th className="p-3.5">Status / Reason</th>
                  <th className="p-3.5 text-right">Action Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {withdrawalRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No withdrawal requests yet.
                    </td>
                  </tr>
                ) : (
                  withdrawalRequests.map(trx => (
                    <tr key={trx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white font-body">
                        {trx.userIgn}
                      </td>

                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-orange-400">{trx.method}</span>
                        <div className="text-slate-300 font-semibold">{trx.senderNumber}</div>
                      </td>

                      <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                        ৳{trx.amount}
                      </td>

                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(trx.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          trx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          trx.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}>
                          {trx.status}
                        </span>
                        {trx.status === 'rejected' && trx.rejectionReason && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-xs italic">
                            "{trx.rejectionReason}"
                          </p>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        {trx.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveWithdrawal(trx)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-95"
                            >
                              Approve Payout
                            </button>
                            <button
                              onClick={() => setRejectingTrx(trx)}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold cursor-pointer border border-red-500/30"
                            >
                              Reject with Reason
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECT WITH REASON MODAL */}
      {rejectingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f1524] border-2 border-red-500/40 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white font-display mb-1">
              Reject Withdrawal for {rejectingTrx.userIgn}
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Amount: ৳{rejectingTrx.amount} via {rejectingTrx.method} ({rejectingTrx.senderNumber})
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Custom Rejection Reason (Shown to player in their Wallet History)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-400 font-body leading-relaxed"
                  required
                />
              </div>

              {/* Quick Preset Reasons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Deposit not played in matches',
                  'Incorrect bKash number or network issue',
                  'Suspicious emulator activity detected',
                  'Account under security audit'
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Confirm Rejection & Refund Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingTrx(null)}
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
