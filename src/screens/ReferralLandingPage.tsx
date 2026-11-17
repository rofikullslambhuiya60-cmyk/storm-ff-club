import React, { useState } from 'react';
import {
  Flame, Download, Smartphone, Globe, ArrowRight, CheckCircle2,
  ShieldCheck, Trophy, Wallet, Sparkles, Copy, Apple
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { referralService } from '../services/referralService';

interface ReferralLandingPageProps {
  referralCode?: string;
  onContinueOnWeb: () => void;
}

export const ReferralLandingPage: React.FC<ReferralLandingPageProps> = ({
  referralCode,
  onContinueOnWeb
}) => {
  const { settings, language, setLanguage } = useApp();
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);

  const activeRefCode = (referralCode || referralService.detectDeepLinkReferral() || '').trim().toUpperCase();
  const androidUrl = settings.androidDownloadUrl || 'https://stormffclub.app/download/storm-ff-club.apk';
  const iosUrl = settings.iosDownloadUrl || 'https://apps.apple.com/app/storm-ff-club';

  const copyRefToClipboard = async (platform: 'Android' | 'iOS') => {
    const codeToCopy = activeRefCode || 'STORMFF';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(codeToCopy);
      }
      if (activeRefCode) {
        sessionStorage.setItem('ffarena_pending_ref_code', activeRefCode);
      }
      setClipboardNotice(
        language === 'bn'
          ? `রেফারেল কোড "${codeToCopy}" অটো-ফিলের জন্য ক্লিপবোর্ডে কপি হয়েছে! ${platform} অ্যাপ ডাউনলোড শুরু হচ্ছে...`
          : `Referral code "${codeToCopy}" copied to clipboard for auto-fill! Launching ${platform} download...`
      );
    } catch {
      setClipboardNotice(
        language === 'bn'
          ? `${platform} অ্যাপ ডাউনলোড শুরু হচ্ছে...`
          : `Launching ${platform} download...`
      );
    }
    setTimeout(() => setClipboardNotice(null), 5000);
  };

  return (
    <div className="min-h-screen w-full bg-[#070a12] text-white flex flex-col justify-between relative overflow-x-clip">
      {/* Ambient Esports Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 px-4 py-3.5 flex items-center justify-between max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-orange-500/40 shadow-lg shadow-orange-500/25 bg-[#0b101d] shrink-0">
            <img
              src="/assets/aistudio/Storm_FF_Club__Play_and_Win_69a00649.png"
              alt="Storm FF Club Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.dataset.fb) {
                  el.dataset.fb = '1';
                  el.src = '/pwa-192x192.png';
                }
              }}
            />
          </div>
          <span className="text-sm font-black uppercase tracking-wider font-display bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
            Storm FF Club
          </span>
        </div>

        <button
          type="button"
          onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-mono text-[11px]">{language === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>
      </header>

      {/* Main Hero & Cross-Platform Download Portal */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 py-6 max-w-lg w-full mx-auto space-y-5">
        {/* Invite Badge if ref code present */}
        {activeRefCode && (
          <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  {language === 'bn' ? 'অফিশিয়াল স্কোয়াড ইনভাইট' : 'Official Squad Invite'}
                </div>
                <div className="text-xs font-bold text-white">
                  {language === 'bn'
                    ? `কোড ${activeRefCode} দিয়ে জয়েন করলে +৳${settings.signupBonus ?? 10} বোনাস!`
                    : `Join with code ${activeRefCode} & claim +৳${settings.signupBonus ?? 10} Bonus!`}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#090d16] border border-emerald-500/40 text-xs font-mono font-black text-amber-400">
              {activeRefCode}
            </span>
          </div>
        )}

        {/* Hero Title Card */}
        <div className="bg-[#0e1422]/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-5 text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-xl shadow-orange-500/25 bg-[#0b101d]">
            <img
              src="/assets/aistudio/Storm_FF_Club__Play_and_Win_69a00649.png"
              alt="Storm FF Club App Icon"
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.dataset.fb) {
                  el.dataset.fb = '1';
                  el.src = '/pwa-192x192.png';
                }
              }}
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-[11px] font-bold text-orange-300 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট' : "Bangladesh's Premier Free Fire Esports Hub"}</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-wide leading-tight bg-gradient-to-r from-white via-amber-100 to-orange-300 bg-clip-text text-transparent">
              {language === 'bn' ? 'Storm FF Club ডাউনলোড করুন' : 'Get Storm FF Club App'}
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {language === 'bn'
                ? 'ডেইলি BR, CS ও Lone Wolf টুর্নামেন্ট খেলুন। bKash ও Nagad-এ দ্রুত পেমেন্ট, দৈনিক ফ্রি স্পিন ও Storm Points দিয়ে জিতে নিন ডায়মন্ড!'
                : 'Play daily BR, CS & Lone Wolf tournaments. Fast bKash & Nagad payouts, Daily Fortune Spin & Storm Points for Diamonds!'}
            </p>
          </div>

          {/* Clipboard Auto-Fill Confirmation Toast */}
          {clipboardNotice && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{clipboardNotice}</span>
            </div>
          )}

          {/* Cross-Platform Download Buttons (Android APK + iOS App) */}
          <div className="space-y-3 pt-1">
            {/* Button 1: Download Android App (APK) */}
            <a
              href={androidUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => copyRefToClipboard('Android')}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-slate-950" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black leading-tight">Android APK Download</div>
                  <div className="text-[10px] font-bold opacity-80">
                    {activeRefCode ? `Auto-copies code ${activeRefCode} • Direct APK` : 'Official v2.5 Verified Build'}
                  </div>
                </div>
              </div>
              <Download className="w-5 h-5 shrink-0" />
            </a>

            {/* Button 2: iOS App Download */}
            <a
              href={iosUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => copyRefToClipboard('iOS')}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 text-slate-950 font-black rounded-2xl shadow-lg flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950/10 flex items-center justify-center">
                  <Apple className="w-5 h-5 text-slate-950" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black leading-tight">iOS App Download</div>
                  <div className="text-[10px] font-bold text-slate-600">
                    App Store / iPhone & iPad Profile
                  </div>
                </div>
              </div>
              <Download className="w-5 h-5 shrink-0" />
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                {language === 'bn' ? 'অথবা ব্রাউজারে চালান' : 'Or Instant Web Access'}
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Button 3: Continue with Web */}
            <button
              type="button"
              onClick={onContinueOnWeb}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer text-sm"
            >
              <span>{language === 'bn' ? 'ওয়েব অ্যাপে চালিয়ে যান (Continue with Web)' : 'Continue with Web'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Key Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div className="p-2 rounded-xl bg-[#090d16]">
              <Wallet className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-slate-200">bKash / Nagad</div>
              <div className="text-[9px] text-slate-500">Fast Payouts</div>
            </div>
            <div className="p-2 rounded-xl bg-[#090d16]">
              <Sparkles className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-slate-200">Storm Points</div>
              <div className="text-[9px] text-slate-500">Free Diamonds</div>
            </div>
            <div className="p-2 rounded-xl bg-[#090d16]">
              <ShieldCheck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-slate-200">Anti-Cheat</div>
              <div className="text-[9px] text-slate-500">100% Fair Play</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 text-center px-4 pb-6 text-[11px] text-slate-500">
        {activeRefCode && (
          <p className="mb-1 text-slate-400 flex items-center justify-center gap-1">
            <Copy className="w-3 h-3 text-orange-400" />
            <span>Referral Code <strong className="text-amber-400 font-mono">{activeRefCode}</strong> will auto-fill during sign up.</span>
          </p>
        )}
        <p>© {new Date().getFullYear()} Storm FF Club • Android & iOS Cross-Platform Esports</p>
      </footer>
    </div>
  );
};
