import React, { useState } from 'react';
import { Bell, ArrowLeft, Flame, Info, Wallet, Award, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationScreen: React.FC = () => {
  const { notifications, setActiveTab, currentUser } = useApp();
  const [filter, setFilter] = useState<'all' | 'system' | 'match' | 'wallet' | 'reward'>('all');

  const filtered = notifications.filter(n => {
    // Only show broadcast notifications or notifications targeted to this user's account
    if (n.targetUid && n.targetUid !== currentUser?.uid) return false;
    if (filter === 'all') return true;
    return n.category === filter;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>Home</span>
        </button>
        <div className="flex items-center gap-1 text-xs text-orange-400 font-bold uppercase tracking-wider">
          <Bell className="w-4 h-4 text-orange-400" />
          <span>Inbox & Alerts</span>
        </div>
      </header>

      <main className="px-3.5 pt-3 space-y-3 max-w-lg mx-auto">
        {/* Category Pills */}
        <div className="flex gap-2 pb-1 overflow-x-auto">
          {(['all', 'system', 'match', 'wallet', 'reward'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-slate-300">No broadcast notices right now</p>
            <p className="text-xs text-slate-500 mt-1">
              Admin announcements and room status alerts will be pushed here.
            </p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 shadow-md space-y-1.5 transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
                  {notif.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">
                {notif.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {notif.message}
              </p>
            </div>
          ))
        )}
      </main>
    </div>
  );
};
