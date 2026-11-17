import React, { useState } from 'react';
import { Gift, Save, CheckCircle2, AlertTriangle, ShieldCheck, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';
import { sanitizeUnsignedIntInput, toSafeNumber } from '../utils/numberInput';

export const ReferralBonusSettings: React.FC = () => {
  const { settings } = useApp();

  const [signupBonus, setSignupBonus] = useState<string>(String(settings.signupBonus ?? 10));
  const [referralBonusPercent, setReferralBonusPercent] = useState<string>(String(settings.referralBonusPercent ?? 10));
  const [referralFixedBonus, setReferralFixedBonus] = useState<string>(String(settings.referralFixedBonus ?? 20));
  const [referralFirstThreeDepositsPercent, setReferralFirstThreeDepositsPercent] = useState<string>(String(settings.referralFirstThreeDepositsPercent ?? 5));
  const [referralLifetimePassivePercent, setReferralLifetimePassivePercent] = useState<string>(String(settings.referralLifetimePassivePercent ?? 1));
  const [referralMinDeposit, setReferralMinDeposit] = useState<string>(String(settings.referralMinDeposit ?? 50));
  const [minDeposit, setMinDeposit] = useState<string>(String(settings.minDeposit ?? 50));
  const [minWithdraw, setMinWithdraw] = useState<string>(String(settings.minWithdraw ?? 50));

  // Cross-Platform App Landing Download Links
  const [androidDownloadUrl, setAndroidDownloadUrl] = useState(settings.androidDownloadUrl || 'https://stormffclub.app/download/storm-ff-club.apk');
  const [iosDownloadUrl, setIosDownloadUrl] = useState(settings.iosDownloadUrl || 'https://apps.apple.com/app/storm-ff-club');

  // Forced App Update System
  const [forcedUpdateEnabled, setForcedUpdateEnabled] = useState(settings.forcedUpdate?.enabled || false);
  const [minVersion, setMinVersion] = useState(settings.forcedUpdate?.minVersion || '2.5.0');
  const [updateTitle, setUpdateTitle] = useState(settings.forcedUpdate?.title || '🔥 Mandatory App Upgrade');
  const [updateMessage, setUpdateMessage] = useState(settings.forcedUpdate?.message || 'A major security update is required to continue playing.');
  const [downloadUrl, setDownloadUrl] = useState(settings.forcedUpdate?.downloadUrl || 'https://stormffclub.app/download/latest.apk');

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('stormff_custom_bonus_v10', '1');
    } catch {
      // ignore
    }
    dbStore.updateSettings({
      signupBonus: toSafeNumber(signupBonus, 0),
      referralBonusPercent: toSafeNumber(referralBonusPercent, 0),
      referralFixedBonus: toSafeNumber(referralFixedBonus, 0),
      referralFirstThreeDepositsPercent: toSafeNumber(referralFirstThreeDepositsPercent, 0),
      referralLifetimePassivePercent: toSafeNumber(referralLifetimePassivePercent, 0),
      referralMinDeposit: Math.max(1, toSafeNumber(referralMinDeposit, 50)),
      minDeposit: Math.max(1, toSafeNumber(minDeposit, 50)),
      minWithdraw: Math.max(1, toSafeNumber(minWithdraw, 50)),
      androidDownloadUrl: androidDownloadUrl.trim(),
      iosDownloadUrl: iosDownloadUrl.trim(),
      forcedUpdate: {
        enabled: forcedUpdateEnabled,
        minVersion,
        title: updateTitle,
        message: updateMessage,
        downloadUrl
      }
    });

    setFeedback('Multi-tier referral rewards, min referral deposit threshold, and app download links updated in real time!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-400" />
          Multi-Tier Referral & System Bonus Settings
        </h2>
        <p className="text-xs text-slate-400">
          Configure sign-up incentives, multi-tier referral deposit commissions, match passive rewards, and app update limits.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl">
        {/* Multi-Tier Referral Reward Setup */}
        <div className="p-4 bg-[#090d16] border border-slate-800 rounded-xl space-y-4">
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
              Multi-Tier Referral Commission Rules (Credited to Deposit Wallet)
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automated payout logic credited directly to referrer's <strong className="text-emerald-400">Deposit / Main Wallet Balance</strong> upon friend activities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Fixed reward upon first deposit */}
            <div className="p-3 rounded-xl bg-[#0f1524] border border-slate-800/80">
              <label className="block text-xs font-bold text-white mb-1">
                Friend First Deposit Fixed Bonus (৳ TK)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={referralFixedBonus}
                onChange={e => setReferralFixedBonus(sanitizeUnsignedIntInput(e.target.value))}
                className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Instant fixed cash (e.g. ৳20) paid to referrer on friend's 1st deposit.
              </span>
            </div>

            {/* First 3 deposits commission percentage */}
            <div className="p-3 rounded-xl bg-[#0f1524] border border-slate-800/80">
              <label className="block text-xs font-bold text-white mb-1">
                Friend's First 3 Deposits Commission (%)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={referralFirstThreeDepositsPercent}
                onChange={e => setReferralFirstThreeDepositsPercent(sanitizeUnsignedIntInput(e.target.value))}
                className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Percentage bonus (e.g. 5%) on friend's first 3 deposit transactions.
              </span>
            </div>

            {/* Lifetime Passive Commission */}
            <div className="p-3 rounded-xl bg-[#0f1524] border border-slate-800/80">
              <label className="block text-xs font-bold text-white mb-1">
                Lifetime Passive Deposit Commission (%)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={referralLifetimePassivePercent}
                onChange={e => setReferralLifetimePassivePercent(sanitizeUnsignedIntInput(e.target.value))}
                className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Continuous lifetime passive commission (e.g. 1%) on all future deposits.
              </span>
            </div>

            {/* Match Fee Referral Commission */}
            <div className="p-3 rounded-xl bg-[#0f1524] border border-slate-800/80">
              <label className="block text-xs font-bold text-white mb-1">
                Tournament Match Entry Commission (%)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={referralBonusPercent}
                onChange={e => setReferralBonusPercent(sanitizeUnsignedIntInput(e.target.value))}
                className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-orange-400 font-mono font-bold focus:outline-none focus:border-orange-400"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Commission (e.g. 10%) paid every time friend joins a paid match.
              </span>
            </div>
          </div>
        </div>

        {/* Signup Welcome Bonus */}
        <div className="p-4 bg-[#090d16] border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
            New Player Welcome Incentive
          </span>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              New User Signup Bonus (৳ TK)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={signupBonus}
              onChange={e => setSignupBonus(sanitizeUnsignedIntInput(e.target.value))}
              className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              required
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Credited upon registration, locked until user completes their first ৳50+ deposit.
            </span>
          </div>
        </div>

        {/* Minimum Thresholds */}
        <div className="p-4 bg-[#090d16] border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">
            Wallet & Referral Minimum Limits
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Min Deposit to Trigger Referral Bonus (৳)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={referralMinDeposit}
                onChange={e => setReferralMinDeposit(sanitizeUnsignedIntInput(e.target.value))}
                className="w-full bg-[#141a29] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Set 50, 20, or 10 BDT anytime
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Minimum Deposit Limit (TK)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={minDeposit}
                onChange={e => setMinDeposit(sanitizeUnsignedIntInput(e.target.value))}
                className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Minimum Withdraw Limit (TK)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={minWithdraw}
                onChange={e => setMinWithdraw(sanitizeUnsignedIntInput(e.target.value))}
                className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Cross-Platform App Landing Page Download Links */}
        <div className="p-4 bg-[#090d16] border border-cyan-500/30 rounded-xl space-y-3">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Referral Landing Page Download URLs (Android & iOS)
          </span>
          <p className="text-[11px] text-slate-400">
            Users opening referral links (/?ref=CODE) see dedicated Android APK & iOS download buttons using these URLs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Android App (APK) Download URL
              </label>
              <input
                type="url"
                value={androidDownloadUrl}
                onChange={e => setAndroidDownloadUrl(e.target.value)}
                placeholder="https://stormffclub.app/download/storm-ff-club.apk"
                className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                iOS App Store / Profile URL
              </label>
              <input
                type="url"
                value={iosDownloadUrl}
                onChange={e => setIosDownloadUrl(e.target.value)}
                placeholder="https://apps.apple.com/app/storm-ff-club"
                className="w-full bg-[#141a29] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Forced App Update System (Section 2, Req 13) */}
        <div className="p-4 bg-orange-950/20 border-2 border-orange-500/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Forced App Update System
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={forcedUpdateEnabled}
                onChange={e => setForcedUpdateEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-white">Enable Blocker</span>
            </label>
          </div>

          <p className="text-[11px] text-slate-400">
            When enabled, users opening the mobile app will be presented with a full-screen non-bypassable update prompt.
          </p>

          {forcedUpdateEnabled && (
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Min Required Version</label>
                  <input
                    type="text"
                    value={minVersion}
                    onChange={e => setMinVersion(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Download APK Link</label>
                  <input
                    type="text"
                    value={downloadUrl}
                    onChange={e => setDownloadUrl(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Update Dialog Title</label>
                <input
                  type="text"
                  value={updateTitle}
                  onChange={e => setUpdateTitle(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Update Message / Changelog</label>
                <textarea
                  rows={2}
                  value={updateMessage}
                  onChange={e => setUpdateMessage(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Policy & System Settings</span>
        </button>
      </form>
    </div>
  );
};
