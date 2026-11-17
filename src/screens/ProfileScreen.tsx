import React, { useState } from 'react';
import { 
  User, Wallet, Sparkles, Share2, Copy, Check, Gift, 
  BookOpen, Clock, Shield, Edit3, LogOut, ExternalLink, Flame, CheckCircle2, Globe,
  Code2, Phone, MessageCircle, X, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { referralService } from '../services/referralService';

export const ProfileScreen: React.FC = () => {
  const { 
    currentUser, updateProfile, setActiveTab, logout, settings, 
    language, setLanguage, t 
  } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newIgn, setNewIgn] = useState(currentUser?.ign || '');
  const [newUid, setNewUid] = useState(currentUser?.freeFireUid || '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const hasCustomDev = Boolean(settings.developerProfile);
  const devProfile = {
    name: settings.developerProfile?.name ?? 'Storm FF Dev Studio',
    roleTitle: hasCustomDev ? (settings.developerProfile?.roleTitle ?? '') : 'Full-Stack Web & Esports App Developer',
    bio: settings.developerProfile?.bio ?? 'Want to build a tournament app like Storm FF Club with automated bKash/Nagad payouts, Firebase real-time sync, and an Admin Panel? Contact me directly!',
    phone: hasCustomDev ? (settings.developerProfile?.phone ?? '') : '+8801892348190',
    whatsappUrl: hasCustomDev ? (settings.developerProfile?.whatsappUrl ?? '') : 'https://wa.me/8801892348190',
    facebookUrl: hasCustomDev ? (settings.developerProfile?.facebookUrl ?? '') : 'https://facebook.com',
    portfolioUrl: settings.developerProfile?.portfolioUrl ?? ''
  };

  const handleCopyDevPhone = () => {
    if (!devProfile.phone) return;
    navigator.clipboard?.writeText(devProfile.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const referralCode = currentUser?.referralCode || 'FFA100';
  const referralDeepLink = referralService.getDeepLinkUrl(referralCode);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralDeepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Storm FF Club Tournaments',
          text: `Join Storm FF Club and get a ৳${settings.signupBonus} signup bonus! Use my referral code: ${referralCode}`,
          url: referralDeepLink
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIgn.trim() || !newUid.trim()) return;
    updateProfile({
      ign: newIgn.trim(),
      freeFireUid: newUid.trim()
    });
    setIsEditing(false);
    setSaveMessage('Profile gaming credentials updated successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#090d16] text-white pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-orange-400" />
          <h1 className="text-sm font-black uppercase text-white font-display tracking-wider">
            {t('profile_title')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Dual Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
            title="Toggle English / Bangla"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono text-[11px]">{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <button
            onClick={logout}
            className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/20 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
          </button>
        </div>
      </header>

      <main className="px-3.5 pt-3 space-y-4 max-w-lg mx-auto">
        {saveMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Profile Identity Card */}
        <div className="bg-gradient-to-b from-[#131b2e] to-[#0c101a] border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 p-0.5 shadow-lg shadow-orange-500/30">
                <div className="w-full h-full bg-[#0a0e18] rounded-[14px] flex items-center justify-center font-black text-orange-400 text-xl font-display">
                  {currentUser?.ign ? currentUser.ign.slice(0, 2).toUpperCase() : 'FF'}
                </div>
              </div>

              <div>
                <h2 className="text-base font-black text-white font-display leading-tight flex items-center gap-1.5">
                  <span>{currentUser?.ign}</span>
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Free Fire UID: <strong className="text-amber-400">{currentUser?.freeFireUid}</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentUser?.email || currentUser?.phone}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setNewIgn(currentUser?.ign || '');
                setNewUid(currentUser?.freeFireUid || '');
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
              title="Edit Gaming Info"
            >
              <Edit3 className="w-4 h-4 text-orange-400" />
            </button>
          </div>

          {/* Edit Gaming Info Modal / Inline form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-orange-400">Update In-Game Name & Free Fire UID</div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Gaming Name (IGN - Supports Unicode Fonts)
                </label>
                <input
                  type="text"
                  value={newIgn}
                  onChange={e => setNewIgn(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-body"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Free Fire UID
                </label>
                <input
                  type="text"
                  value={newUid}
                  onChange={e => setNewUid(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Save Credentials
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Device ID footprint */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Hardware Fingerprint:</span>
            <span className="text-slate-300 font-bold">{currentUser?.deviceId || 'DEV-TRACKED'}</span>
          </div>
        </div>

        {/* Deep Linking Referral Program Card (Section 2, Req 3) */}
        <div className="bg-gradient-to-br from-[#1b1c2b] to-[#111422] border-2 border-orange-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> Refer & Earn 10% Lifetime
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              ৳{currentUser?.referralEarnings || 0} Earned
            </span>
          </div>

          <h3 className="text-sm font-extrabold text-white font-display leading-tight mb-1">
            Invite Squad Mates & Get Auto-Commission
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            When friends deposit ৳{settings.referralMinDeposit || 50}+ or join paid matches via your link, bonuses credit directly to your <strong className="text-emerald-400">Deposit Wallet Balance</strong>!
          </p>

          <div className="bg-[#090d16] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-mono">Your Referral Code</div>
              <div className="text-sm font-black text-amber-400 font-mono">{referralCode}</div>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Deep link copy & share action */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-orange-400" />}
              <span>{copiedLink ? 'Deep Link Copied!' : 'Get Referral Link'}</span>
            </button>
            <button
              onClick={handleShare}
              className="py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-orange-500/25"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* App Language Switcher Card */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {language === 'bn' ? 'অ্যাপের ভাষা (Language)' : 'App Language'}
              </div>
              <div className="text-[10px] text-slate-400">
                {language === 'bn' ? 'বাংলা এবং English সাপোর্ট' : 'Bangla & English Support'}
              </div>
            </div>
          </div>
          <div className="flex bg-[#0a0e18] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'bn'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Feature Hub Grid Navigation */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setActiveTab('wallet')}
            className="p-3 bg-[#0f1422] hover:bg-[#131b2e] border border-slate-800 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <Wallet className="w-6 h-6 text-orange-400 mb-2" />
            <div>
              <div className="text-xs font-bold text-white">
                {language === 'bn' ? 'ওয়ালেট ও ক্যাশিয়ার' : 'Wallet & Cashier'}
              </div>
              <div className="text-[10px] text-slate-400">
                {language === 'bn' ? 'ডিপোজিট, উইথড্র ও হিস্ট্রি' : 'Deposit, withdraw & logs'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('spin')}
            className="p-3 bg-[#0f1422] hover:bg-[#131b2e] border border-slate-800 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <Sparkles className="w-6 h-6 text-cyan-400 mb-2 animate-spin" />
            <div>
              <div className="text-xs font-bold text-white">
                {language === 'bn' ? 'দৈনিক ফ্রি স্পিন' : 'Daily Spin Wheel'}
              </div>
              <div className="text-[10px] text-slate-400">
                {language === 'bn' ? 'প্রতি ২৪ ঘণ্টায় ১টি ফ্রি স্পিন' : '1 free spin every 24 hours'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className="p-3 bg-[#0f1422] hover:bg-[#131b2e] border border-slate-800 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <Gift className="w-6 h-6 text-purple-400 mb-2" />
            <div>
              <div className="text-xs font-bold text-white">
                {language === 'bn' ? 'পয়েন্ট রিডিম স্টোর' : 'Point Store'}
              </div>
              <div className="text-[10px] text-slate-400">
                {language === 'bn' ? 'পয়েন্ট দিয়ে ফ্রি ম্যাচ ভাউচার' : 'Redeem points for match passes'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className="p-3 bg-[#0f1422] hover:bg-[#131b2e] border border-amber-500/40 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <BookOpen className="w-6 h-6 text-amber-400 mb-2" />
            <div>
              <div className="text-xs font-bold text-white">
                {language === 'bn' ? 'টুর্নামেন্ট রুলবুক (বাংলা)' : 'Tournament Rules (Bangla)'}
              </div>
              <div className="text-[10px] text-amber-400">
                {language === 'bn' ? 'অফিশিয়াল নিয়মাবলী ও নীতিমালা' : 'Official fair play guidelines'}
              </div>
            </div>
          </button>
        </div>

        {/* Hire This Web Developer Card (Directly below Feature Hub Grid) */}
        <button
          type="button"
          onClick={() => setShowDeveloperModal(true)}
          className="w-full p-3.5 bg-gradient-to-r from-[#0f172a] via-[#111c33] to-[#0f1422] hover:from-[#13203b] hover:to-[#131b2e] border border-cyan-500/35 hover:border-cyan-400/60 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 shadow-lg shadow-cyan-500/10"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/25 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span>Hire this web developer</span>
              </div>
              <div className="text-[10px] text-cyan-300/85 truncate mt-0.5">
                {language === 'bn'
                  ? 'এরকম টুর্নামেন্ট অ্যাপ তৈরি করতে ডেভেলপারের সাথে যোগাযোগ করুন'
                  : 'Want to build a custom tournament app like this? Contact dev'}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 flex items-center gap-1 shrink-0">
            <span>Contact</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Permanent Bangla Rules Notification */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300/90 flex items-start gap-2 shadow-sm">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            বিশেষ নির্দেশনা: আপনি যে ভাষাতেই অ্যাপ ব্যবহার করুন না কেন, সকল সিস্টেম ও টুর্নামেন্ট নীতিমালা সর্বদা বাংলায় অপরিবর্তিত থাকবে।
          </p>
        </div>

        {/* Log Out & Switch Account */}
        <div className="pt-2">
          <button
            onClick={() => logout()}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out / Switch Account</span>
          </button>
        </div>
      </main>

      {/* HIRE THIS WEB DEVELOPER MODAL */}
      {showDeveloperModal && (
        <div
          onClick={() => setShowDeveloperModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0f1524] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 shrink-0">
                  <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Hire This Web Developer
                  </span>
                  <h3 className="text-base font-black text-white font-display leading-tight">
                    {devProfile.name}
                  </h3>
                  {devProfile.roleTitle && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{devProfile.roleTitle}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDeveloperModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bio / Description */}
            <div className="p-3.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
              {devProfile.bio}
            </div>

            {/* Direct Phone */}
            {devProfile.phone && (
              <div className="p-3 bg-[#090d16] border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Phone / Direct Call</div>
                    <a
                      href={`tel:${devProfile.phone}`}
                      className="text-xs font-bold text-white font-mono hover:text-cyan-400 truncate block"
                    >
                      {devProfile.phone}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyDevPhone}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {/* Social Media & Direct Messaging Buttons */}
            {(devProfile.whatsappUrl || devProfile.facebookUrl || devProfile.portfolioUrl) && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Contact & Social Channels
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {devProfile.whatsappUrl && (
                    <a
                      href={devProfile.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Chat</span>
                    </a>
                  )}

                  {devProfile.facebookUrl && (
                    <a
                      href={devProfile.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-blue-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Facebook</span>
                    </a>
                  )}

                  {devProfile.portfolioUrl && (
                    <a
                      href={devProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Portfolio / Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowDeveloperModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
