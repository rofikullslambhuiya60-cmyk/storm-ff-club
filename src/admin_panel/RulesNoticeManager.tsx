import React, { useState } from 'react';
import { BookOpen, Save, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';

export const RulesNoticeManager: React.FC = () => {
  const { settings } = useApp();

  const [depositRule, setDepositRule] = useState(settings.rules?.deposit || '');
  const [withdrawRule, setWithdrawRule] = useState(settings.rules?.withdraw || '');
  const [matchJoinRule, setMatchJoinRule] = useState(settings.rules?.matchJoin || '');
  const [pointRedeemRule, setPointRedeemRule] = useState(settings.rules?.pointRedeem || '');
  const [gameplayRule, setGameplayRule] = useState(settings.rules?.gameplay || '');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbStore.updateSettings({
      rules: {
        ...settings.rules,
        deposit: depositRule,
        withdraw: withdrawRule,
        matchJoin: matchJoinRule,
        pointRedeem: pointRedeemRule,
        gameplay: gameplayRule
      }
    });

    setFeedback('Contextual notices and rules updated across all mobile app touchpoints!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          Contextual Rules & Notices CMS
        </h2>
        <p className="text-xs text-slate-400">
          Update the notices shown directly above action buttons on Deposit, Withdrawal, Match Join, and Point Redemption pages.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl">
        {/* Deposit Notice */}
        <div>
          <label className="block text-xs font-bold text-amber-300 mb-1">
            Deposit Page Notice (Above Deposit Button)
          </label>
          <textarea
            rows={2}
            value={depositRule}
            onChange={e => setDepositRule(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Withdraw Notice */}
        <div>
          <label className="block text-xs font-bold text-emerald-300 mb-1">
            Withdrawal Page Notice (Above Payout Button)
          </label>
          <textarea
            rows={2}
            value={withdrawRule}
            onChange={e => setWithdrawRule(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Match Join Notice */}
        <div>
          <label className="block text-xs font-bold text-orange-300 mb-1">
            Match Details & Slot Booking Notice
          </label>
          <textarea
            rows={2}
            value={matchJoinRule}
            onChange={e => setMatchJoinRule(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Point Store Notice */}
        <div>
          <label className="block text-xs font-bold text-purple-300 mb-1">
            Point Redemption & Mystery Box Notice
          </label>
          <textarea
            rows={2}
            value={pointRedeemRule}
            onChange={e => setPointRedeemRule(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Gameplay Rules */}
        <div>
          <label className="block text-xs font-bold text-red-300 mb-1">
            Gameplay & Emulator Ban Rules
          </label>
          <textarea
            rows={2}
            value={gameplayRule}
            onChange={e => setGameplayRule(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save All Contextual Rules</span>
        </button>
      </form>
    </div>
  );
};
