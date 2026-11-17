import React, { useState } from 'react';
import { Sparkles, Clock, ArrowLeft, AlertCircle, Award, Globe, Gem, Flame, Crown, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SpinWheelScreen: React.FC = () => {
  const { spinWheel, currentUser, setActiveTab, language, setLanguage, t } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<{ label: string; points: number; cash: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 6 Total Sectors for visual engagement:
  // 1. "Better Luck Next Time 😊" (Winnable outcome)
  // 2. "100 Diamond 💎" (Promotional visual attraction - rigged: NEVER lands)
  // 3. "Weekly 💎" (Promotional visual attraction - rigged: NEVER lands)
  // 4. "1 Storm Point ✨" (Winnable outcome)
  // 5. "500 Taka 💸" (Promotional visual attraction - rigged: NEVER lands)
  // 6. "Monthly 💎" (Promotional visual attraction - rigged: NEVER lands)
  const sectors = [
    {
      id: 0,
      label: 'Better Luck Next Time 😊',
      type: 'miss',
      points: 0,
      bg: 'url(#gradSector0)',
      textColor: '#cbd5e1',
      accentColor: '#64748b',
      glow: '#334155'
    },
    {
      id: 1,
      label: '100 Diamond 💎',
      type: 'promo',
      points: 0,
      bg: 'url(#gradSector1)',
      textColor: '#ffffff',
      accentColor: '#38bdf8',
      glow: '#0284c7'
    },
    {
      id: 2,
      label: 'Weekly 💎',
      type: 'promo',
      points: 0,
      bg: 'url(#gradSector2)',
      textColor: '#ffffff',
      accentColor: '#c084fc',
      glow: '#9333ea'
    },
    {
      id: 3,
      label: '1 Storm Point ✨',
      type: 'points',
      points: 1,
      bg: 'url(#gradSector3)',
      textColor: '#ffffff',
      accentColor: '#fbbf24',
      glow: '#ea580c'
    },
    {
      id: 4,
      label: '500 Taka 💸',
      type: 'promo',
      points: 0,
      bg: 'url(#gradSector4)',
      textColor: '#ffffff',
      accentColor: '#34d399',
      glow: '#059669'
    },
    {
      id: 5,
      label: 'Monthly 💎',
      type: 'promo',
      points: 0,
      bg: 'url(#gradSector5)',
      textColor: '#ffffff',
      accentColor: '#f472b6',
      glow: '#c026d3'
    }
  ];

  // Calculate cooldown until 12:00 AM midnight
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const alreadySpunToday = currentUser?.lastSpinTimestamp
    ? new Date(currentUser.lastSpinTimestamp).getTime() >= todayMidnight
    : false;

  const handleSpin = () => {
    if (spinning || alreadySpunToday) return;

    setError(null);
    setSpinResult(null);
    setSpinning(true);

    const result = spinWheel();
    if (!result.success) {
      setError(result.message || 'Cannot spin right now');
      setSpinning(false);
      return;
    }

    // STRICT PROFIT PROTECTION & RIGGED PROBABILITY:
    // The wheel NEVER lands on sectors 1, 2, 4, or 5 (100 Diamond, Weekly, 500 Taka, Monthly).
    // It strictly and only lands on either Sector 0 ("Better Luck Next Time 😊") or Sector 3 ("1 Storm Point ✨").
    const targetSector = result.prize.points > 0 ? 3 : 0;

    // 6 sectors => 60 degrees each
    const sliceAngle = 60;
    const fullSpins = 6 * 360; // 6 dramatic full spins
    const targetOffset = ((6 - targetSector) % 6) * sliceAngle;
    // Add small organic wobble (+/- 10 deg) within the 60 deg slice for authentic realism
    const naturalWobble = (Math.random() - 0.5) * 16;

    const newTotalRotation = rotation + fullSpins + targetOffset + naturalWobble;
    setRotation(newTotalRotation);

    setTimeout(() => {
      setSpinning(false);
      setSpinResult(result.prize);
    }, 4500);
  };

  return (
    <div className="min-h-screen w-full bg-[#070a12] text-white pb-28 relative overflow-x-clip">
      {/* Premium Ambient Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-48 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-orange-600/10 rounded-full blur-[110px] pointer-events-none"></div>

      {/* Top Header with Language Switcher */}
      <header className="sticky top-0 z-30 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-amber-500/20 px-4 py-3 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Dual Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
            title="Toggle English / Bangla"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[11px]">{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold font-mono bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1 rounded-full shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentUser?.points || 0} {language === 'bn' ? 'পয়েন্ট' : 'Points'}</span>
          </div>
        </div>
      </header>

      <main className="px-3.5 pt-4 space-y-4 max-w-lg mx-auto text-center relative z-10">
        {/* Title & Promotional Teaser Badge */}
        <div>
          <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-yellow-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/40 inline-flex items-center gap-1.5 shadow-md shadow-amber-500/10">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            {language === 'bn' ? 'ভিআইপি দৈনিক ফ্রি স্পিন' : 'VIP Daily Free Spin Wheel'}
          </span>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 font-display mt-2 mb-1 drop-shadow-sm">
            {t('spin_title')}
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            {t('spin_subtitle')}
          </p>
        </div>

        {/* Prize Showcase Ticker Strip */}
        <div className="flex items-center justify-between gap-1.5 bg-[#0e1424]/80 border border-amber-500/25 p-2 rounded-2xl shadow-xl backdrop-blur-md overflow-x-auto text-[10px] font-bold">
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 shrink-0">
            <Gem className="w-3 h-3 text-cyan-400" />
            <span>100 💎</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 shrink-0">
            <Crown className="w-3 h-3 text-purple-400" />
            <span>Weekly 💎</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-pink-950/40 border border-pink-500/30 text-pink-300 shrink-0">
            <Crown className="w-3 h-3 text-pink-400" />
            <span>Monthly 💎</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 shrink-0">
            <span>💸 ৳500</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>1 Point</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 6-Sector Premium SVG Wheel Graphic Container */}
        <div className="relative py-4 flex items-center justify-center">
          {/* Wheel Pointer at Top (12 o'clock) - 3D Gold Arrowhead with Ruby Gem */}
          <div className="absolute top-1 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[30px] border-t-amber-400 drop-shadow-[0_4px_18px_rgba(251,191,36,0.95)]"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-300 via-amber-200 to-white -mt-8 ring-2 ring-amber-600 shadow-lg shadow-amber-500/80 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
            </div>
          </div>

          {/* Premium Outer Halo & Glow Ring */}
          <div className="w-76 h-76 sm:w-88 sm:h-88 rounded-full p-2 bg-gradient-to-tr from-amber-600/50 via-yellow-400/30 to-amber-600/50 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative flex items-center justify-center">
            {/* Smoothly Animated Vector SVG Wheel with 6 Slices */}
            <div
              className="w-full h-full rounded-full border-4 border-amber-500/80 relative transition-transform duration-[4500ms] ease-out select-none shadow-2xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionTimingFunction: 'cubic-bezier(0.12, 0.98, 0.28, 1)'
              }}
            >
              <svg
                viewBox="0 0 320 320"
                className="w-full h-full block rounded-full"
              >
                <defs>
                  {/* High-End Sector Gradients */}
                  <linearGradient id="gradSector0" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  <linearGradient id="gradSector1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>

                  <linearGradient id="gradSector2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#581c87" />
                  </linearGradient>

                  <linearGradient id="gradSector3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  <linearGradient id="gradSector4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>

                  <linearGradient id="gradSector5" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#701a75" />
                  </linearGradient>

                  {/* 3D Gold Center Hub Gradient */}
                  <radialGradient id="wheelCenterGold" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="35%" stopColor="#f59e0b" />
                    <stop offset="70%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#451a03" />
                  </radialGradient>

                  {/* Gold Outer Rim Bezel Gradient */}
                  <radialGradient id="wheelRimBezel" cx="50%" cy="50%" r="50%">
                    <stop offset="90%" stopColor="#0b0f19" stopOpacity="0" />
                    <stop offset="96%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="1" />
                  </radialGradient>
                </defs>

                {/* 6 Sectors (60 degrees each) */}
                {sectors.map((sector, i) => {
                  const angle = i * 60;
                  return (
                    <g
                      key={sector.id}
                      transform={`rotate(${angle} 160 160)`}
                    >
                      {/* Exact 60-degree wedge path */}
                      <path
                        d="M 160 160 L 85 30.1 A 150 150 0 0 1 235 30.1 Z"
                        fill={sector.bg}
                        stroke="#070a12"
                        strokeWidth="2.5"
                      />

                      {/* Outer neon accent rim arc line */}
                      <path
                        d="M 90 38 A 142 142 0 0 1 230 38"
                        fill="none"
                        stroke={sector.accentColor}
                        strokeWidth="2.5"
                        opacity="0.8"
                      />

                      {/* Inner accent ring */}
                      <path
                        d="M 105 65 A 110 110 0 0 1 215 65"
                        fill="none"
                        stroke={sector.accentColor}
                        strokeWidth="1"
                        opacity="0.3"
                      />

                      {/* Rotated radial text along vertical ray pointing up at 12 o'clock */}
                      <g transform="rotate(90 160 76)">
                        <text
                          x="160"
                          y="76"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={sector.textColor}
                          className="font-black font-display tracking-tight"
                          style={{
                            fontSize: sector.label.length > 18 ? '9px' : '10.5px',
                            fontWeight: 900,
                            letterSpacing: '0.04em',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
                          }}
                        >
                          {sector.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Outer Bezel Shadow & Texture Overlay */}
                <circle
                  cx="160"
                  cy="160"
                  r="150"
                  fill="url(#wheelRimBezel)"
                  pointerEvents="none"
                />

                {/* 12 Decorative Gold Perimeter Studs (every 30 degrees) */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                  const rad = (deg * Math.PI) / 180;
                  const studX = 160 + 145 * Math.sin(rad);
                  const studY = 160 - 145 * Math.cos(rad);
                  return (
                    <circle
                      key={deg}
                      cx={studX}
                      cy={studY}
                      r="3.5"
                      fill="#fbbf24"
                      stroke="#070a12"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                    />
                  );
                })}

                {/* 3D Multi-Layered Center Medallion Hub */}
                <circle
                  cx="160"
                  cy="160"
                  r="34"
                  fill="#070a12"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="28"
                  fill="url(#wheelCenterGold)"
                  stroke="#78350f"
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="19"
                  fill="#090d16"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                />
                <text
                  x="160"
                  y="160"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#fbbf24"
                  className="font-black font-display"
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: 900,
                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' 
                  }}
                >
                  FF
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Win / Result Banner */}
        {spinResult && (
          <div className="p-4 bg-gradient-to-r from-amber-950/50 via-[#141b2c] to-orange-950/50 border-2 border-amber-500/60 rounded-2xl shadow-2xl animate-fadeIn backdrop-blur-md">
            <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider">
              {language === 'bn' ? 'স্পিন রেজাল্ট' : 'Spin Wheel Result'}
            </span>
            <div className="text-lg font-black text-white font-display mt-0.5 flex items-center justify-center gap-1.5">
              {spinResult.points > 0 ? (
                <>
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300">{language === 'bn' ? 'অভিনন্দন! ১ পয়েন্ট জিতেছেন ✨' : 'Won 1 Storm Point ✨!'}</span>
                </>
              ) : (
                <span>{language === 'bn' ? 'পরের বার আবার চেষ্টা করুন 😊' : 'Better Luck Next Time 😊!'}</span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {spinResult.points > 0
                ? (language === 'bn' 
                    ? '১টি স্টর্ম পয়েন্ট আপনার প্রোফাইলে যোগ করা হয়েছে! পয়েন্ট দিয়ে ফ্রি টুর্নামেন্ট টিকেট ও মিস্ট্রি বক্স নিতে পারবেন।'
                    : '+1 Storm Point has been safely added to your profile points balance!')
                : (language === 'bn'
                    ? 'আজকে কোনো পয়েন্ট পাওয়া যায়নি। রাত ১২:০০ টায় আবার ফ্রি স্পিন করতে পারবেন!'
                    : 'No points this round. Your free daily spin resets at 12:00 AM midnight!')}
            </p>
          </div>
        )}

        {/* Dedicated High-End Spin Button & Cooldown */}
        <div className="pt-2">
          {alreadySpunToday ? (
            <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>{t('spin_cooldown_active')}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t('spin_cooldown_sub')}
              </p>
              <button
                disabled
                className="w-full py-3.5 bg-slate-800/80 text-slate-500 font-bold rounded-xl text-xs cursor-not-allowed uppercase tracking-wider"
              >
                {t('spin_btn_next')}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-base shadow-[0_0_40px_rgba(245,158,11,0.45)] border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider font-display"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>{spinning ? t('spin_btn_spinning') : t('spin_btn_spin')}</span>
            </button>
          )}
        </div>

        {/* Permanent Bangla Rules Note (Exact Requirement) */}
        <div className="p-3.5 bg-[#0b101d] border border-amber-500/20 rounded-xl text-left space-y-1 shadow-md">
          <span className="text-[11px] font-bold text-amber-400 block flex items-center gap-1.5">
            📌 স্পিন হুইল ব্যবহারের নিয়মাবলী (Bangla Guideline)
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ১. প্রতিদিন রাত ১২:০০ টার পর ১টি ফ্রি স্পিন দেওয়া হয়।<br />
            ২. অর্জিত স্টর্ম পয়েন্ট কখনো এক্সপায়ার হয় না এবং পয়েন্ট স্টোর থেকে ফ্রি ম্যাচ ভাউচার ও মিস্ট্রি বক্সে রূপান্তর করা যায়।<br />
            ৩. কোনো প্রকার অটো-ক্লিকার বা স্পিন হ্যাক ব্যবহারের চেষ্টা করলে একাউন্ট সাময়িকভাবে সাসপেন্ড হবে।
          </p>
        </div>
      </main>
    </div>
  );
};
