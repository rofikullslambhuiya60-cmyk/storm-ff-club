import React from 'react';
import { Trophy, Medal, Swords, Flame, Skull, Coins, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ResultsScreen: React.FC = () => {
  const { results, currentUser } = useApp();

  // Strictly display only the last 5 match results
  const last5Results = (results || []).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#090d16] text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h1 className="text-sm font-black uppercase text-white font-display tracking-wider">
            Match Results (Last 5)
          </h1>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
          Auto-Purged Beyond 5
        </span>
      </header>

      <main className="px-3.5 pt-3 space-y-4 max-w-lg mx-auto">
        {last5Results.length === 0 ? (
          <div className="text-center py-16 bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-slate-300">No completed matches yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Results and player winnings will auto-populate as matches conclude.
            </p>
          </div>
        ) : (
          last5Results.map((result, idx) => (
            <div
              key={result.id || idx}
              className="bg-gradient-to-b from-[#111728] to-[#0c101b] border border-slate-800/90 rounded-2xl p-4 shadow-xl relative overflow-hidden"
            >
              {/* Top Banner with Match Info */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 font-mono">
                    {result.category} • {result.map || 'Bermuda'}
                  </span>
                  <h3 className="text-sm font-extrabold text-white font-display leading-tight">
                    {result.matchTitle}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono justify-end">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(result.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">Finished</span>
                </div>
              </div>

              {/* Top Winners Leaderboard */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between px-2">
                  <span>Player & Rank</span>
                  <div className="flex gap-4">
                    <span>Kills</span>
                    <span>Winnings</span>
                  </div>
                </div>

                {result.topPlayers?.map((player: any, pIdx: number) => {
                  const isGold = pIdx === 0;
                  const isSilver = pIdx === 1;
                  const isBronze = pIdx === 2;
                  const isCurrent = currentUser && (player.ign === currentUser.ign || player.uid === currentUser.uid);

                  return (
                    <div
                      key={pIdx}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-orange-500/15 border-orange-500/50 text-white font-bold'
                          : isGold
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-[#090d16]/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isGold ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black text-xs">
                            🥇
                          </div>
                        ) : isSilver ? (
                          <div className="w-6 h-6 rounded-lg bg-slate-300 text-black flex items-center justify-center font-black text-xs">
                            🥈
                          </div>
                        ) : isBronze ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-700 text-white flex items-center justify-center font-black text-xs">
                            🥉
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-xs">
                            #{pIdx + 1}
                          </div>
                        )}
                        <span className="text-xs font-bold truncate max-w-[130px] font-body">
                          {player.ign}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.2 rounded font-black">
                            YOU
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-0.5">
                          <Skull className="w-3 h-3 text-red-400" />
                          {player.kills || 0}
                        </span>
                        <span className="text-emerald-400 font-black min-w-[50px] text-right">
                          ৳{player.winnings || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};
