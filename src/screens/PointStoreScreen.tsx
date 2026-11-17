import React, { useState } from 'react';
import { Gift, Sparkles, Swords, Gem, CheckCircle2, AlertCircle, ArrowLeft, Clock, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContextualRules } from '../components/ContextualRules';

export const PointStoreScreen: React.FC = () => {
  const { currentUser, redeemPoints, setActiveTab, language, setLanguage, t } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = (type: 'voucher' | 'mystery_box') => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = redeemPoints(type);
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Redemption failed');
    } else {
      setSuccess(res.message || 'Redeemed successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
        </button>

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

          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold font-mono bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentUser?.points || 0} {language === 'bn' ? 'পয়েন্ট' : 'Points'}</span>
          </div>
        </div>
      </header>

      <main className="px-3.5 pt-3 space-y-4 max-w-lg mx-auto">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-950/40 via-[#131728] to-pink-950/40 border border-purple-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-400">
                {language === 'bn' ? 'লয়ালটি রিওয়ার্ড শপ' : 'Point Loyalty Rewards'}
              </span>
              <h1 className="text-base font-black text-white font-display">
                {t('store_title')}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('store_subtitle')}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Store Item 1: 20 Points for 10 TK BR Match Pass */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-orange-400">
                  {language === 'bn' ? 'ফ্রি ম্যাচ পাস' : 'Match Voucher'}
                </span>
                <h3 className="text-sm font-extrabold text-white font-display">
                  {language === 'bn' ? '১০ টাকার ব্যাটল রয়্যাল ম্যাচ ভাউচার' : '10 TK Battle Royale Match Pass'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'সরাসরি আপনার ডিপোজিট ব্যালেন্সে ১০ টাকা যুক্ত হবে।' : 'Adds ৳10 straight into your Deposit Balance to join paid tournaments.'}
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
              ২০ পয়েন্ট
            </span>
          </div>

          <button
            onClick={() => handleRedeem('voucher')}
            disabled={loading || (currentUser?.points || 0) < 20}
            className={`w-full py-3 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              (currentUser?.points || 0) >= 20
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {(currentUser?.points || 0) >= 20 
                ? (language === 'bn' ? '১০ ৳ ম্যাচ পাস রিডিম করুন' : 'Redeem for ৳10 Match Pass') 
                : (language === 'bn' ? '২০ পয়েন্ট প্রয়োজন' : 'Need 20 Points to Redeem')}
            </span>
          </button>
        </div>

        {/* Store Item 2: 50 Points for Mystery Box */}
        <div className="bg-gradient-to-b from-[#14162a] to-[#0d101d] border-2 border-purple-500/50 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Gem className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400">
                  {language === 'bn' ? 'প্রিমিয়াম রিওয়ার্ড' : 'High-Tier Loot'}
                </span>
                <h3 className="text-sm font-extrabold text-white font-display">
                  🎁 {language === 'bn' ? 'ডায়মন্ড মিস্ট্রি বক্স' : 'Diamond Mystery Box'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'bn' ? 'নিশ্চিত সর্বনিম্ন ২৫ ডায়মন্ড থেকে উইকলি/মান্থলি মেম্বারশিপ!' : 'Guaranteed Min 25 Diamonds up to Weekly & Monthly Subscriptions!'}
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-purple-300 font-mono bg-purple-500/25 px-2.5 py-1 rounded-lg border border-purple-500/40">
              ৫০ পয়েন্ট
            </span>
          </div>

          {/* Permanent Bangla Mystery Box Detailed Delivery Terms */}
          <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-purple-300 flex items-center gap-1.5 text-[11px] uppercase">
              <Clock className="w-3.5 h-3.5" /> বক্সের বিস্তারিত ও ডেলিভারি শর্তাবলী (Bangla Terms):
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
              <li>গ্যারান্টিড রিওয়ার্ড: সর্বনিম্ন ২৫টি ডায়মন্ড সরাসরি ফ্রি ফায়ার UID-তে ডেলিভারি।</li>
              <li>লাকি ড্রপ: উইকলি মেম্বারশিপ অথবা মান্থলি মেম্বারশিপ পাওয়ার সুযোগ!</li>
              <li>ডেলিভারি সময়: পয়েন্ট রিডিম করার ১০-৩০ মিনিটের মধ্যে সরাসরি টপ-আপ চলে যাবে।</li>
            </ul>
          </div>

          <button
            onClick={() => handleRedeem('mystery_box')}
            disabled={loading || (currentUser?.points || 0) < 50}
            className={`w-full py-3.5 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              (currentUser?.points || 0) >= 50
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {(currentUser?.points || 0) >= 50 
                ? (language === 'bn' ? 'মিস্ট্রি বক্স ওপেন করুন (৫০ পয়েন্ট)' : 'Open Mystery Box (50 Points)') 
                : (language === 'bn' ? '৫০ পয়েন্ট প্রয়োজন' : 'Need 50 Points to Redeem')}
            </span>
          </button>
        </div>

        {/* Permanent Bangla Contextual Point Store Rules */}
        <ContextualRules type="pointRedeem" customTitle="পয়েন্ট রিডিম ও ডায়মন্ড শর্তাবলী (Bangla Policy)" />
      </main>
    </div>
  );
};
