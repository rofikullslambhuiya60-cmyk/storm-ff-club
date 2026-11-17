import React from 'react';
import { BookOpen, ShieldAlert, AlertTriangle, ArrowLeft, Flame, DollarSign, Ban, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RulesScreen: React.FC = () => {
  const { setActiveTab, language, setLanguage } = useApp();

  return (
    <div className="min-h-screen bg-[#090d16] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>{language === 'bn' ? 'প্রোফাইলে ফিরুন' : 'Back to Profile'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono text-[11px]">{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <div className="flex items-center gap-1 text-xs text-orange-400 font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-orange-400" />
            <span>অফিশিয়াল রুলবুক</span>
          </div>
        </div>
      </header>

      <main className="px-3.5 pt-3 space-y-4 max-w-lg mx-auto">
        {/* Banner - Permanent Bangla Rules notice */}
        <div className="bg-gradient-to-r from-red-950/40 via-[#131728] to-orange-950/40 border border-orange-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-orange-400">
                ফেয়ার প্লে ও অফিশিয়াল নীতিমালা
              </span>
              <h1 className="text-base font-black text-white font-display">
                স্টর্ম এফএফ ক্লাব টুর্নামেন্ট সংবিধান ও নিয়মাবলী
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                এই নিয়মগুলো অমান্য করলে কোনো প্রকার সতর্কতা ছাড়াই ম্যাচ থেকে বহিস্কার ও ডিভাইস চিরতরে ব্যান করা হবে।
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Gameplay Rules (Strictly in Bangla) */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-orange-400 tracking-wider flex items-center gap-1.5 font-display">
            <Flame className="w-4 h-4" /> ১. গেমপ্লে ও কাস্টম রুমের নিয়মাবলী
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-white">শুধুমাত্র মোবাইল প্লেয়ার:</strong> সকল প্রকার পিসি এমুলেটর (BlueStacks, LDPlayer, GameLoop, ইত্যাদি) সম্পূর্ণ নিষিদ্ধ। এমুলেটর পাওয়া গেলে ০ টাকা প্রাইজ দিয়ে ডিসকোয়ালিফাই করা হবে।
            </li>
            <li>
              <strong className="text-white">সঠিক স্লটে বসা বাধ্যতামূলক:</strong> অ্যাপে আপনি যে স্লট নাম্বার বুকিং করবেন, গেমে ঠিক সেই স্লটেই বসতে হবে। অন্যের স্লটে বসলে রুমের রেফারি আপনাকে কিক করে দেবে এবং এন্ট্রি ফি রিফান্ড হবে না।
            </li>
            <li>
              <strong className="text-white">টিম-আপ সম্পূর্ণ নিষিদ্ধ:</strong> সোলো ম্যাচে কোনো প্রকার টিম-আপ (শত্রুর সাথে জোট বাঁধা) প্রমাণিত হলে উভয়ের একাউন্ট ব্যান ও প্রাইজ বাজেয়াপ্ত করা হবে।
            </li>
            <li>
              <strong className="text-white">হ্যাক ও স্ক্রিপ্ট নিষেধাজ্ঞা:</strong> অটো-এইম, অ্যান্টেনা, হেডশট কনফিগ, স্পিড হ্যাক বা মোড এপিকে ব্যবহার করলে ডিভাইস ও ইউআইডি স্থায়ীভাবে ব্ল্যাকলিস্ট করা হবে।
            </li>
          </ul>
        </div>

        {/* Section 2: Wallet & Payment Rules (Strictly in Bangla) */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-display">
            <DollarSign className="w-4 h-4" /> ২. ডিপোজিট ও উইথড্র নীতিমালা
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-white">সর্বনিম্ন ডিপোজিট:</strong> ৫০ টাকা (৫০ টাকার নিচে টাকা পাঠালে তা গ্রহণযোগ্য হবে না)।
            </li>
            <li>
              <strong className="text-white">শুধুমাত্র Send Money করবেন:</strong> বিকাশ বা নগদের পার্সোনাল নাম্বারে সবসময় "Send Money" করবেন। ক্যাশ আউট (Cash Out) করলে সিস্টেম থেকে তা বাতিল করা হবে।
            </li>
            <li>
              <strong className="text-white">ডিপোজিট ব্যালেন্স সরাসরি তোলা যায় না:</strong> ডিপোজিট করা টাকা দিয়ে টুর্নামেন্ট ম্যাচে জয়েন করে জিততে হবে। ডিপোজিট ব্যালেন্স সরাসরি উত্তোলনযোগ্য নয়।
            </li>
            <li>
              <strong className="text-white">উইনিং ব্যালেন্স উইথড্র:</strong> সর্বনিম্ন ৫০ টাকা শুধুমাত্র উইনিং ব্যালেন্স (Winning Balance) থেকে যে কোনো সময় তোলা যাবে। নিরাপত্তার জন্য একাউন্ট পাসওয়ার্ড প্রয়োজন হবে।
            </li>
          </ul>
        </div>

        {/* Section 3: Free Matches & Device Limits (Strictly in Bangla) */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5 font-display">
            <Ban className="w-4 h-4" /> ৩. স্পেশাল ফ্রি ম্যাচ ও ডিভাইস পলিসি
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-white">প্রতি ইভেন্টে ১টি ফ্রি ম্যাচ:</strong> প্রতি বিশেষ ইভেন্টে (যেমন ঈদ কাপ) একজন প্লেয়ার মাত্র ১টি ফ্রি ম্যাচে জয়েন করতে পারবেন।
            </li>
            <li>
              <strong className="text-white">ডিভাইস লিমিটেশন:</strong> একটি ফিজিক্যাল স্মার্টফোনে সর্বোচ্চ ১টি মূল একাউন্ট অনুমোদিত। ভুয়া একাউন্ট খুলে রেফারেল বা সাইনআপ বোনাস অপব্যবহার করলে স্বয়ংক্রিয় ডিভাইস লক হবে।
            </li>
            <li>
              <strong className="text-white">টেম্পোরারি নাম্বার ও ইমেইল ব্লক:</strong> কোনো প্রকার ওয়ান-টাইম ভার্চুয়াল নাম্বার বা ফেক ইমেইল গ্রহণযোগ্য নয়।
            </li>
          </ul>
        </div>

        {/* Admin Finality (Strictly in Bangla) */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            টুর্নামেন্ট ম্যাচ রেকর্ডিং পর্যালোচনা করে ডিসকোয়ালিফিকেশন, ম্যাচ বাতিল বা প্রাইজ বিতরণের ব্যাপারে স্টর্ম এফএফ ক্লাব এডমিন প্যানেলের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।
          </p>
        </div>
      </main>
    </div>
  );
};
