import React, { useState } from 'react';
import { 
  Wallet, ArrowDownToLine, ArrowUpFromLine, Copy, Check, 
  AlertCircle, ShieldCheck, Clock, CheckCircle2, XCircle, Key, Lock, Sparkles, Globe, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContextualRules } from '../components/ContextualRules';
import { sanitizeUnsignedIntInput, toSafeNumber } from '../utils/numberInput';

export const WalletScreen: React.FC = () => {
  const { 
    currentUser, settings, submitDeposit, submitWithdraw, 
    transactions, setActiveTab, language, setLanguage, t 
  } = useApp();

  const [activeTab, setActiveWalletTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState<string>('100');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [paymentType, setPaymentType] = useState('Send Money'); // Send Money vs Cash Out

  // Withdraw Form
  const [withdrawAmount, setWithdrawAmount] = useState<string>('100');
  const [payoutNumber, setPayoutNumber] = useState(currentUser?.savedPayoutNumber || '');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showWithdrawPassword, setShowWithdrawPassword] = useState(false);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentGatewayNumber = selectedMethod === 'bKash' ? settings.bKashNumber : settings.nagadNumber;
  const currentGatewayType = selectedMethod === 'bKash' ? settings.bKashType : settings.nagadType;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentGatewayNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedAmount = toSafeNumber(depositAmount, 0);
    const minDep = settings.minDeposit || 50;
    if (!depositAmount.trim() || parsedAmount < minDep) {
      setError(`Minimum deposit amount is ৳${minDep}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitDeposit({
        amount: parsedAmount,
        method: selectedMethod,
        trxId,
        senderNumber,
        paymentType
      });

      if (!res.success) {
        setError(res.message || 'Deposit failed');
      } else {
        setSuccess(res.message || 'Deposit verified successfully!');
        setTrxId('');
        setSenderNumber('');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedAmount = toSafeNumber(withdrawAmount, 0);
    const minWd = settings.minWithdraw || 50;
    if (!withdrawAmount.trim() || parsedAmount < minWd) {
      setError(`Minimum withdrawal amount is ৳${minWd}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitWithdraw({
        amount: parsedAmount,
        method: selectedMethod,
        payoutNumber,
        passwordConfirm
      });

      if (!res.success) {
        setError(res.message || 'Incorrect password! Withdrawal request cancelled.');
      } else {
        setSuccess(res.message || 'Withdrawal request submitted!');
        setPasswordConfirm('');
      }
    } catch (err: any) {
      setError(err.message || 'Error processing request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userTransactions = transactions.filter(t => t.uid === currentUser?.uid);

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#090d16] text-white pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-400" />
          <h1 className="text-sm font-black uppercase text-white font-display tracking-wider">
            {language === 'bn' ? 'স্টর্ম ক্যাশিয়ার ও ওয়ালেট' : 'Storm Cashier & Wallet'}
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
          <span className="text-xs text-emerald-400 font-mono font-bold hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> 24/7 Automated
          </span>
        </div>
      </header>

      <main className="px-3.5 pt-3 space-y-4 max-w-lg mx-auto">
        {/* Dual Balance Cards: Deposit vs Winning */}
        <div className="grid grid-cols-2 gap-3">
          {/* Deposit Balance */}
          <div className="bg-gradient-to-br from-[#121827] to-[#0d121e] border border-slate-800 rounded-2xl p-3.5 shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('wallet_deposit_bal')}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                {language === 'bn' ? 'অফেরতযোগ্য' : 'Non-Withdrawable'}
              </span>
            </div>
            <div className="text-xl font-black text-white font-mono leading-tight">
              ৳{currentUser?.depositBalance || 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
              {language === 'bn' ? 'শুধুমাত্র টুর্নামেন্ট এন্ট্রি ফি দিতে ব্যবহৃত হয়।' : 'Used strictly for tournament entry fees.'}
            </p>
          </div>

          {/* Winning Balance */}
          <div className="bg-gradient-to-br from-[#1a1c29] to-[#0f1422] border-2 border-emerald-500/40 rounded-2xl p-3.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {t('wallet_win_bal')}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {language === 'bn' ? 'উত্তোলনযোগ্য' : 'Withdrawable'}
              </span>
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono leading-tight">
              ৳{currentUser?.winningBalance || 0}
            </div>
            <p className="text-[10px] text-emerald-200/70 mt-1 leading-snug">
              {language === 'bn' ? 'যেকোনো সময় তুলুন (সর্বনিম্ন ৫০ ৳)।' : 'Withdrawable anytime (Min 50 TK).'}
            </p>
          </div>
        </div>

        {/* Locked Bonus Banner */}
        {currentUser && currentUser.signupBonusLocked > 0 && !currentUser.hasDeposited && (
          <div className="p-3 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-black text-amber-300 block">
                  ৳{currentUser.signupBonusLocked} {language === 'bn' ? 'সাইনআপ বোনাস লক অবস্থায় আছে!' : 'Signup Bonus Locked!'}
                </span>
                <span className="text-[10px] text-amber-200/80">
                  {language === 'bn'
                    ? `প্রথমবার ${settings.minDeposit || 50} টাকা ডিপোজিট করলে বোনাস আনলক হবে।`
                    : `Make your first deposit (Min ${settings.minDeposit || 50} TK) to instantly unlock this bonus.`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Navigation Tabs */}
        <div className="flex bg-[#0f1524] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveWalletTab('deposit'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'deposit'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>{t('wallet_tab_deposit')}</span>
          </button>
          <button
            onClick={() => { setActiveWalletTab('withdraw'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>{t('wallet_tab_withdraw')}</span>
          </button>
          <button
            onClick={() => { setActiveWalletTab('history'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('wallet_tab_history')}</span>
          </button>
        </div>

        {/* Feedback message */}
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

        {/* DEPOSIT TAB */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            {/* Gateway Selector (bKash & Nagad) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod('bKash')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  selectedMethod === 'bKash'
                    ? 'bg-pink-950/30 border-pink-500/80 shadow-lg shadow-pink-500/20'
                    : 'bg-[#0f1422] border-slate-800 opacity-70'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-pink-600 flex items-center justify-center font-black text-white text-xs">
                  bK
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">bKash Gateway</div>
                  <div className="text-[10px] text-pink-400">{settings.bKashType}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('Nagad')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  selectedMethod === 'Nagad'
                    ? 'bg-orange-950/30 border-orange-500/80 shadow-lg shadow-orange-500/20'
                    : 'bg-[#0f1422] border-slate-800 opacity-70'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-xs">
                  NG
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Nagad Gateway</div>
                  <div className="text-[10px] text-orange-400">{settings.nagadType}</div>
                </div>
              </button>
            </div>

            {/* Dynamic Gateway Number Display */}
            <div className="bg-gradient-to-r from-[#141b2c] to-[#0c101a] border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Official {selectedMethod} Gateway Number ({currentGatewayType})
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Active & Verified</span>
              </div>

              <div className="flex items-center justify-between bg-[#080c14] p-3 rounded-xl border border-slate-800 mt-1">
                <span className="text-base font-black font-mono tracking-wider text-orange-400 select-all">
                  {currentGatewayNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="mt-2 text-[11px] text-slate-400">
                Send Money to the number above, then submit the TrxID below for instant verification.
              </div>
            </div>

            {/* Contextual Deposit Rules Widget */}
            <ContextualRules type="deposit" customTitle="Important Deposit Rules & Instructions" />

            {/* Deposit Submission Form */}
            <form onSubmit={handleDepositSubmit} className="space-y-3 bg-[#0f1422] border border-slate-800 rounded-2xl p-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Payment Method Type (Must be "Send Money")
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('Send Money')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      paymentType === 'Send Money'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    ✓ Send Money (Allowed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('Cash Out')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      paymentType === 'Cash Out'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    ✕ Cash Out (Rejected)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deposit Amount (Min {settings.minDeposit || 50} TK)
                </label>
                <div className="flex gap-2 mb-2">
                  {[...(settings.minDeposit && settings.minDeposit < 50 ? [settings.minDeposit] : []), 50, 100, 200, 500]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .slice(0, 4)
                    .map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(String(amt))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        depositAmount !== '' && toSafeNumber(depositAmount, -1) === amt
                          ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={`Min ${settings.minDeposit || 50}`}
                  value={depositAmount}
                  onChange={e => setDepositAmount(sanitizeUnsignedIntInput(e.target.value))}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BLC94K2918"
                  value={trxId}
                  onChange={e => setTrxId(e.target.value.toUpperCase())}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sender Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 017XXXXXXXX"
                  value={senderNumber}
                  onChange={e => setSenderNumber(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer text-sm mt-3"
              >
                <span>{isSubmitting ? 'Submitting for Admin Approval...' : `Submit ৳${depositAmount || 0} Deposit`}</span>
              </button>
            </form>
          </div>
        )}

        {/* WITHDRAW TAB */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              💡 You have <strong>৳{currentUser?.winningBalance || 0}</strong> eligible for withdrawal.
            </div>

            {/* Contextual Withdrawal Rules */}
            <ContextualRules type="withdraw" customTitle="Withdrawal Security & Policy" />

            <form onSubmit={handleWithdrawSubmit} className="space-y-3 bg-[#0f1422] border border-slate-800 rounded-2xl p-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bKash')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      selectedMethod === 'bKash'
                        ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    bKash Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('Nagad')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      selectedMethod === 'Nagad'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    Nagad Personal
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Withdraw Amount (Min {settings.minWithdraw || 50} TK, from Winning Balance only)
                </label>
                <div className="flex gap-2 mb-2">
                  {[50, 100, 200, 500].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(String(amt))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        withdrawAmount !== '' && toSafeNumber(withdrawAmount, -1) === amt
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={`Min ${settings.minWithdraw || 50}`}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(sanitizeUnsignedIntInput(e.target.value))}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Recipient {selectedMethod} Number (Save for instant payouts)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 017XXXXXXXX"
                  value={payoutNumber}
                  onChange={e => setPayoutNumber(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Password confirmation for security */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" /> Account Password Confirmation
                  </span>
                  <span className="text-[10px] text-slate-400">Security Gate</span>
                </label>
                <div className="relative">
                  <input
                    type={showWithdrawPassword ? 'text' : 'password'}
                    placeholder="Enter your account password"
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    className="w-full bg-[#080c14] border border-slate-700 rounded-xl pl-3 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowWithdrawPassword(prev => !prev)}
                    aria-label={showWithdrawPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {showWithdrawPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer text-sm mt-3"
              >
                <span>Request ৳{withdrawAmount || 0} Payout</span>
              </button>
            </form>
          </div>
        )}

        {/* TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Recent Transactions & Payout Logs
            </h3>

            {userTransactions.length === 0 ? (
              <div className="text-center py-12 bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
                <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-300">No transaction records yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Deposits, match fees, refunds, and withdrawals will appear here.
                </p>
              </div>
            ) : (
              userTransactions.map(trx => (
                <div
                  key={trx.id}
                  className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3.5 shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                        trx.type === 'deposit'
                          ? 'bg-orange-500/20 text-orange-400'
                          : trx.type === 'withdraw'
                          ? 'bg-purple-500/20 text-purple-400'
                          : trx.type === 'match_win'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : trx.type === 'match_refund'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {trx.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {trx.trxId || `#${trx.id.slice(-6)}`}
                      </span>
                    </div>

                    {/* Amount */}
                    <span className={`text-sm font-black font-mono ${
                      trx.type === 'withdraw' || trx.type === 'match_join'
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}>
                      {trx.type === 'withdraw' || trx.type === 'match_join' ? '-' : '+'}৳{trx.amount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>{new Date(trx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    
                    {/* Status badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      trx.status === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : trx.status === 'rejected'
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-amber-500/15 text-amber-400 animate-pulse'
                    }`}>
                      {trx.status}
                    </span>
                  </div>

                  {/* Admin Rejection Reason Display (Required by Prompt) */}
                  {trx.status === 'rejected' && trx.rejectionReason && (
                    <div className="p-2 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-200 block text-[10px] uppercase">
                          Admin Rejection Reason:
                        </span>
                        <p className="text-[11px] text-red-300 leading-snug">{trx.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
