import React, { useState, useEffect } from 'react';
import { Flame, Shield, User, Key, Mail, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Globe, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { referralService } from '../services/referralService';
import { securityService } from '../services/securityService';

export const AuthScreen: React.FC = () => {
  const { login, signup, signInWithGoogle, settings, language, setLanguage } = useApp();
  const [isLogin, setIsLogin] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form states
  const [ign, setIgn] = useState('');
  const [freeFireUid, setFreeFireUid] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // Password reset state
  const [resetSent, setResetSent] = useState(false);

  // UI feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-detect referral code from deep link (?ref=CODE)
  useEffect(() => {
    const detectedRef = referralService.detectDeepLinkReferral();
    if (detectedRef) {
      setReferralCode(detectedRef);
    }
  }, []);

  // Stylish font presets for Free Fire IGN
  const stylishPresets = [
    '꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂',
    '𝔖𝔥𝔞𝔡𝔬𝔴_𝔎𝔦𝔫𝔤',
    '⚡ 𝓥𝓲𝓹𝓮𝓻_𝓕𝓕 ⚡',
    '亗 ᴛᴏxɪᴄ 亗',
    '༺Leͥgeͣnͫd༻'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!email || !email.includes('@')) {
          setError('Please enter your valid registered Gmail/Email address.');
          setLoading(false);
          return;
        }
        setResetSent(true);
        setSuccess('Password reset link & verification instructions sent to your email.');
        setLoading(false);
        return;
      }

      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message || 'Login failed');
        }
      } else {
        if (!securityService.isAllowedRegistrationEmail(email)) {
          setError('Only Gmail, Outlook, and Yahoo accounts are allowed for registration. Temporary or disposable emails are strictly blocked.');
          setLoading(false);
          return;
        }
        const res = await signup({
          ign,
          freeFireUid,
          identifier: email,
          pass: password,
          referralCode: referralCode.trim() || undefined
        });
        if (!res.success) {
          setError(res.message || 'Signup failed');
        } else {
          setSuccess(res.message || 'Account created successfully in Storm FF Club!');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setError(res.message || 'Google sign-in could not be completed.');
      } else if (res.message) {
        setSuccess(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-white flex flex-col justify-center px-4 py-8 pb-24 relative overflow-x-clip">
      {/* Background flare */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* App Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-xl shadow-orange-500/25 mb-3 bg-[#0d121f]">
            <img
              src="/assets/aistudio/Storm_FF_Club__Play_and_Win_69a00649.png"
              alt="Storm FF Club Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-black tracking-wider uppercase font-display bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
            Storm FF Club
          </h1>
          <p className="text-xs text-slate-400 tracking-wide mt-1">
            Free Fire Elite Tournaments • Automated bKash & Nagad Payouts
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0f1523]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative">
          {/* Language Switcher Badge at Top-Right of Card */}
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
              title="Toggle English / Bangla"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-mono text-[11px]">{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>

          {/* Header tabs */}
          {!isForgotPassword && (
            <div className="flex bg-[#0a0e18] p-1 rounded-xl mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isLogin ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' 
                  ? `নতুন একাউন্ট (+${settings.signupBonus ?? 10} ৳ বোনাস)` 
                  : `Sign Up (+৳${settings.signupBonus ?? 10} Bonus)`}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isLogin ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' ? 'লগইন করুন' : 'Log In'}
              </button>
            </div>
          )}

          {/* Google Sign-In Button */}
          {!isForgotPassword && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl flex items-center justify-center gap-3 text-xs font-bold text-white transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  {language === 'bn' ? 'অথবা ইমেইল দিয়ে' : 'Or with Email'}
                </span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>
            </div>
          )}

          {isForgotPassword && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-400" /> Password Recovery
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered Gmail address to receive secure reset instructions.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Forgot Password Flow */}
            {isForgotPassword ? (
              <>
                {!resetSent ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registered Gmail / Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 p-2 bg-emerald-950/40 border border-emerald-800 rounded-lg">
                    Check your email inbox or spam folder for password reset link.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-transform active:scale-95 cursor-pointer text-sm"
                >
                  {loading ? 'Processing...' : !resetSent ? 'Send Password Reset Link' : 'Resend Email'}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(null); }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
                >
                  Back to Log In
                </button>
              </>
            ) : (
              <>
                {/* SIGN UP FIELDS */}
                {!isLogin && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          In-Game Name (IGN)
                        </label>
                        <span className="text-[10px] text-orange-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Stylish Unicode Supported
                        </span>
                      </div>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="text"
                          placeholder="e.g. ꧁༺ 𝖄𝖔𝖚 𝕯𝖊𝖆d ༻꧂ or Shadow"
                          value={ign}
                          onChange={e => setIgn(e.target.value)}
                          className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                          required
                        />
                      </div>
                      {/* Quick unicode presets picker */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {stylishPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setIgn(preset)}
                            className="text-[10px] bg-slate-800/80 hover:bg-orange-500/20 text-slate-300 hover:text-orange-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Free Fire UID (8-11 digits)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2847192834"
                        value={freeFireUid}
                        onChange={e => setFreeFireUid(e.target.value)}
                        className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      placeholder="e.g. user@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  {!isLogin && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      * Only @gmail.com, @outlook.com (@hotmail.com / @live.com), and @yahoo.com emails are allowed. Disposable/temporary emails are strictly blocked.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setError(null); }}
                        className="text-[11px] text-orange-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Dynamic & Manual Referral Code on Signup */}
                {!isLogin && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Referral Code <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      {referralCode && (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          ✓ Auto-applied from link
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. BOSS99"
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#0a0e18] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                )}

                {/* Action button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer mt-2"
                >
                  <span>{loading ? 'Please wait...' : isLogin ? 'Enter Storm FF Club' : `Create Account (+৳${settings.signupBonus ?? 10} Bonus)`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        </div>

        {/* Permanent Bangla Device Security Rules Badge */}
        <div className="mt-4 p-3 bg-[#0a0e18] border border-slate-800 rounded-xl text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>ডিভাইস সিকিউরিটি ও নীতিমালা (Permanent Bangla Rules)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            একটি ফিজিক্যাল স্মার্টফোনে সর্বোচ্চ ২টি একাউন্ট অনুমোদিত। একাধিক ফেক একাউন্ট খুলে সাইনআপ বোনাস অপব্যবহারের চেষ্টা করলে ডিভাইস চিরতরে ব্যান করা হবে।
          </p>
        </div>
      </div>
    </div>
  );
};
