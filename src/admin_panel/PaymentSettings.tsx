import React, { useState } from 'react';
import { CreditCard, Save, CheckCircle2, PhoneCall, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';

export const PaymentSettings: React.FC = () => {
  const { settings } = useApp();
  const [bKashNumber, setBKashNumber] = useState(settings.bKashNumber);
  const [bKashType, setBKashType] = useState(settings.bKashType);
  const [nagadNumber, setNagadNumber] = useState(settings.nagadNumber);
  const [nagadType, setNagadType] = useState(settings.nagadType);
  const [whatsAppNumber, setWhatsAppNumber] = useState(settings.whatsAppNumber);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbStore.updateSettings({
      bKashNumber: bKashNumber.trim(),
      bKashType,
      nagadNumber: nagadNumber.trim(),
      nagadType,
      whatsAppNumber: whatsAppNumber.trim()
    });
    setFeedback('Payment gateway numbers and WhatsApp live chat support updated instantly without app restart!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          Dynamic Payment Gateway Settings
        </h2>
        <p className="text-xs text-slate-400">
          Modify your official bKash & Nagad recipient numbers instantly. No codebase modifications or app rebuilds required.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl">
        {/* bKash Gateway Setup */}
        <div className="p-4 bg-pink-950/20 border border-pink-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-pink-400 uppercase tracking-wider">
              bKash Gateway Configuration
            </span>
            <span className="text-[10px] text-pink-300">Live in Mobile Wallet</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                bKash Number
              </label>
              <input
                type="text"
                value={bKashNumber}
                onChange={e => setBKashNumber(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Account Type
              </label>
              <select
                value={bKashType}
                onChange={e => setBKashType(e.target.value as any)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              >
                <option value="Personal">Personal (Send Money)</option>
                <option value="Merchant">Merchant (Payment)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nagad Gateway Setup */}
        <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-orange-400 uppercase tracking-wider">
              Nagad Gateway Configuration
            </span>
            <span className="text-[10px] text-orange-300">Live in Mobile Wallet</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nagad Number
              </label>
              <input
                type="text"
                value={nagadNumber}
                onChange={e => setNagadNumber(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Account Type
              </label>
              <select
                value={nagadType}
                onChange={e => setNagadType(e.target.value as any)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Personal">Personal (Send Money)</option>
                <option value="Merchant">Merchant (Payment)</option>
              </select>
            </div>
          </div>
        </div>

        {/* WhatsApp Support Number */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4" /> Floating WhatsApp Live Chat Target Number
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              WhatsApp Number (With country code e.g. 8801892348190)
            </label>
            <input
              type="text"
              value={whatsAppNumber}
              onChange={e => setWhatsAppNumber(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Gateway Numbers & Update Mobile Users</span>
        </button>
      </form>
    </div>
  );
};
