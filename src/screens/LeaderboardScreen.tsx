import React, { useState } from 'react';
import { Award, Trophy, Users, Flame, Coins, Sparkles, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LeaderboardScreen: React.FC = () => {
  const { allUsers, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'earners' | 'referrers'>('earners');

  // Tab 1: 24-Hour Top Earners (Sorted by match winnings)
  const topEarners = [...allUsers]
    .sort((a, b) => (b.winningBalance || 0) - (a.winningBalance || 0))
    .slice(0, 10);

  // Tab 2: Lifetime Top Referrers (Sorted by referral count & referral earnings)
  const topReferrers = [...allUsers]
    .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[#090d16] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h1 className="text-sm font-black uppercase text-white font-display tracking-wider">
            Storm Hall of Fame
          </h1>
        </div>
        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          Daily Cash Prizes
        </span>
      </header>

      <main className="px-3.5 pt-3 space-y-4 max-w-lg mx-auto">
        {/* Dual Tab Switcher */}
        <div className="flex bg-[#0f1524] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('earners')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'earners'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>24-Hour Top Earners</span>
          </button>
          <button
            onClick={() => setActiveTab('referrers')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'referrers'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Lifetime Referrers</span>
          </button>
        </div>

        {/* Tab Description Banner */}
        <div className="p-3 bg-gradient-to-r from-[#121828] to-[#0c101a] border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-white font-display">
              {activeTab === 'earners' ? '🔥 24-Hour Top 10 Earners' : '👥 Lifetime Referral Legends'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeTab === 'earners'
                ? 'Resets automatically every 24 hours. Prize money won from match kills & chicken dinners.'
                : 'Permanent cumulative rankings. Earn 10% commission on every match your friends play!'}
            </p>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {(activeTab === 'earners' ? topEarners : topReferrers).slice(0, 3).map((item, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <div
                key={item.uid}
                className={`p-3 rounded-2xl text-center relative border transition-all ${
                  isFirst
                    ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-500/50 -translate-y-1 shadow-lg shadow-amber-500/20 order-2'
                    : isSecond
                    ? 'bg-gradient-to-b from-slate-400/20 to-slate-900 border-slate-400/40 order-1'
                    : 'bg-gradient-to-b from-amber-700/20 to-slate-900 border-amber-700/40 order-3'
                }`}
              >
                <div className="text-xl mb-1">
                  {isFirst ? '👑' : isSecond ? '🥈' : '🥉'}
                </div>
                <div className="text-xs font-extrabold text-white truncate max-w-[85px] mx-auto font-body">
                  {item.ign}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {activeTab === 'earners' ? (
                    <span className="text-emerald-400 font-black">৳{item.winningBalance}</span>
                  ) : (
                    <span className="text-orange-400 font-black">{item.referralCount} Invites</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Leaderboard List */}
        <div className="space-y-2 pt-1">
          {(activeTab === 'earners' ? topEarners : topReferrers).map((player, idx) => {
            const isMe = currentUser && player.uid === currentUser.uid;

            return (
              <div
                key={player.uid}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-orange-500/15 border-orange-500/60 shadow-md'
                    : 'bg-[#0f1422] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                    idx === 0
                      ? 'bg-amber-500 text-black'
                      : idx === 1
                      ? 'bg-slate-300 text-black'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[140px] font-body">
                        {player.ign}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded bg-orange-500 text-white text-[9px] font-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      UID: {player.freeFireUid}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  {activeTab === 'earners' ? (
                    <div>
                      <div className="text-xs font-black text-emerald-400">৳{player.winningBalance}</div>
                      <div className="text-[9px] text-slate-400 uppercase">24h Winnings</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-black text-orange-400">{player.referralCount} Joined</div>
                      <div className="text-[9px] text-slate-400">Earned: ৳{player.referralEarnings}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
