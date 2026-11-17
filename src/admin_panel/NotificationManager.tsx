import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';
import { BroadcastNotification } from '../types';

export const NotificationManager: React.FC = () => {
  const { notifications } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'system' | 'match' | 'wallet' | 'reward'>('system');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newNotif: BroadcastNotification = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      message: message.trim(),
      category,
      createdAt: new Date().toISOString()
    };

    dbStore.addNotification(newNotif);
    setTitle('');
    setMessage('');
    setFeedback('Broadcast notification pushed to all mobile players instantly!');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          Global Push Notification CMS
        </h2>
        <p className="text-xs text-slate-400">
          Broadcast alerts, server maintenance warnings, and prize notifications directly to all mobile users.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handleBroadcast} className="space-y-3.5 bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Notification Title
            </label>
            <input
              type="text"
              placeholder="e.g. 🚨 1,000 TK Friday Mega Cup Tonight!"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="system">System / Announcement</option>
              <option value="match">Match / Room Alert</option>
              <option value="wallet">Wallet / Cashier</option>
              <option value="reward">Rewards / Bonus</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Notification Body Message
          </label>
          <textarea
            rows={3}
            placeholder="Write your push announcement..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed font-body"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Broadcast Push to All App Users</span>
        </button>
      </form>

      {/* Broadcast History */}
      <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
          Broadcast History ({notifications.length})
        </h3>

        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className="p-3 bg-[#090d16] border border-slate-800 rounded-xl text-xs flex items-start justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-400">
                    {n.category}
                  </span>
                  <span className="font-bold text-white">{n.title}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
