import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ContextualRulesProps {
  type: 'deposit' | 'withdraw' | 'matchJoin' | 'pointRedeem' | 'gameplay' | 'general';
  customTitle?: string;
}

// Permanent Bangla Rules Dictionary - NEVER translated to English as requested
const PERMANENT_BANGLA_RULES: Record<string, { title: string; text: string }> = {
  deposit: {
    title: '⚠️ ডিপোজিট নিয়মাবলী ও সতর্কবার্তা (Bangla Rules)',
    text: '১. বিকাশ বা নগদ থেকে অবশ্যই "Send Money" করবেন (Cash Out গ্রহণ করা হবে না)।\n২. সর্বনিম্ন ডিপোজিট ৫০ টাকা। ৫০ টাকার নিচে পাঠালে ব্যালেন্সে যোগ হবে না।\n৩. টাকা পাঠানোর পর ফিরতি এসএমএস থেকে TrxID এবং প্রেরকের ১১ ডিজিট নাম্বার দিয়ে সাবমিট করুন।\n৪. সাধারণত ১-৩ মিনিটের মধ্যে আপনার একাউন্টে টাকা যুক্ত হয়ে যাবে।'
  },
  withdraw: {
    title: '🏆 টাকা উত্তোলনের নিয়মাবলী (Bangla Rules)',
    text: '১. শুধুমাত্র উইনিং ব্যালেন্স (Winning Balance) উত্তোলন করা যাবে। সর্বনিম্ন উত্তোলন ৫০ টাকা।\n২. ডিপোজিট ব্যালেন্স সরাসরি তোলা যায় না (ম্যাচ ফি হিসেবে খেলতে হবে)।\n৩. আপনার ব্যক্তিগত পার্সোনাল বিকাশ বা নগদ নাম্বার দিন। ভুল নাম্বারে টাকা গেলে প্রশাসন দায়ী নয়।\n৪. নিরাপত্তার স্বার্থে একাউন্ট পাসওয়ার্ড দিয়ে উইথড্র নিশ্চিত করুন। ৫-৩০ মিনিটে পেমেন্ট সম্পন্ন হবে।'
  },
  matchJoin: {
    title: '⚡ টুর্নামেন্ট জয়েন ও স্লট বুকিং নিয়ম (Bangla Rules)',
    text: '১. প্রোফাইলে দেওয়া Free Fire IGN এবং UID দিয়ে টুর্নামেন্টে জয়েন করতে হবে।\n২. ম্যাচ শুরুর ৫ মিনিট আগে "আমার ম্যাচ" অপশনে রুম আইডি ও পাসওয়ার্ড দেওয়া হবে।\n৩. নির্ধারিত স্লটেই বসতে হবে। অন্যের স্লটে বসলে রেফারি রুম থেকে বের করে দেবে এবং এন্ট্রি ফি বাজেয়াপ্ত হবে।'
  },
  pointRedeem: {
    title: '💎 পয়েন্ট রিডিম ও ডায়মন্ড শর্তাবলী (Bangla Rules)',
    text: '১. ২০ পয়েন্ট = ১০ টাকার ফ্রি বিআর ম্যাচ ভাউচার।\n২. ৫০ পয়েন্ট = ১টি লাকি মিস্ট্রি বক্স (ডায়মন্ড বা উইকলি মেম্বারশিপ)।\n৩. রিডিম করার পর ১০-৩০ মিনিটের মধ্যে সরাসরি প্লেয়ারের ফ্রি ফায়ার ইউআইডিতে ডায়মন্ড পাঠিয়ে দেওয়া হবে।'
  },
  gameplay: {
    title: '🚫 অ্যান্টি-চিট ও ফেয়ার প্লে সংবিধান (Bangla Rules)',
    text: '১. সকল প্রকার পিসি এমুলেটর (BlueStacks, LDPlayer ইত্যাদি) কঠোরভাবে নিষিদ্ধ।\n২. কোনো প্রকার হ্যাক, কনফিগ বা মোড এপিকে ব্যবহার করলে ডিভাইস ও একাউন্ট আজীবনের জন্য ব্যান হবে।\n৩. সোলো ম্যাচে টিম-আপ সম্পূর্ণ নিষিদ্ধ এবং প্রাইজ বাতিলযোগ্য অপরাধ।'
  },
  general: {
    title: '📌 সাধারণ নির্দেশনা ও নিয়মাবলী (Bangla Rules)',
    text: '১. ফেয়ার-প্লে বজায় রাখুন। এডমিনের সিদ্ধান্তই টুর্নামেন্টে চূড়ান্ত।\n২. কোনো সহায়তার প্রয়োজন হলে ২৪/৭ হোয়াটসঅ্যাপ বাটনে মেসেজ দিন।'
  }
};

export const ContextualRules: React.FC<ContextualRulesProps> = ({ type, customTitle }) => {
  const { settings } = useApp();

  const permanentRule = PERMANENT_BANGLA_RULES[type] || PERMANENT_BANGLA_RULES.general;
  const displayTitle = customTitle || permanentRule.title;
  // Always prioritize permanent Bangla rules
  const displayText = permanentRule.text || settings.rules?.[type] || settings.rules?.general || '';

  if (!displayText) return null;

  return (
    <div className="my-3 p-3.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl text-xs text-amber-200/90 flex items-start gap-2.5 backdrop-blur-sm shadow-md">
      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1 w-full">
        <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px] font-display">
          {displayTitle}
        </span>
        <p className="leading-relaxed whitespace-pre-line text-amber-100/90 text-[11px] font-sans">
          {displayText}
        </p>
      </div>
    </div>
  );
};
