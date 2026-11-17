import React, { useState } from 'react';
import { 
  Gamepad2, Key, Copy, Check, Clock, AlertTriangle, 
  MapPin, Swords, Shield, ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CountdownTimer } from '../components/CountdownTimer';
import { formatCategoryDisplay, formatSubCategoryDisplay } from '../config/tournamentModes';

export const MyMatchesScreen: React.FC = () => {
  const { matches, currentUser, setActiveTab, setSelectedMatchId, setMatchReturnTab } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Show all matches joined by current user
  const myJoinedMatches = (matches || []).filter(m =>
    currentUser && (m.joinedPlayers || []).some(p => p.uid === currentUser.uid)
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-orange-400" />
          <h1 className="text-sm font-black uppercase text-white font-display tracking-wider">
            My Registered Matches
          </h1>
        </div>
        <span className="text-xs text-orange-400 font-mono font-bold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
          {myJoinedMatches.length} Active
        </span>
      </header>

      <main className="px-3.5 pt-3 space-y-4 max-w-lg mx-auto">
        {/* Security Alert */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-300 block mb-0.5">Encrypted Room Credentials</span>
            <p className="text-blue-100/80 leading-relaxed text-[11px]">
              Only players who booked a slot can see Room ID and Password below. Do NOT share them outside!
            </p>
          </div>
        </div>

        {myJoinedMatches.length === 0 ? (
          <div className="text-center py-16 bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
            <Swords className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-slate-300">You haven't joined any matches yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Browse upcoming Battle Royale & Clash Squad matches in the Play tab!
            </p>
            <button
              onClick={() => setActiveTab('home')}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/30 cursor-pointer"
            >
              Explore Matches
            </button>
          </div>
        ) : (
          myJoinedMatches.map(match => {
            const playerRec = (match.joinedPlayers || []).find(p => p.uid === currentUser?.uid);
            const hasCredentials = !!match.roomId;
            const normStatus = (match.status || 'open').trim().toLowerCase();
            const isLive = normStatus === 'live';
            const isUpcoming = normStatus === 'upcoming';

            return (
              <div
                key={match.id}
                className="bg-gradient-to-b from-[#111728] to-[#0c101b] border-2 border-orange-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden"
              >
                {/* Status bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase font-mono border border-orange-500/30">
                      {formatCategoryDisplay(match.category)} • {formatSubCategoryDisplay(match.category, match.subCategory)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono border ${
                      isLive
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                        : isUpcoming
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isLive ? '● LIVE' : isUpcoming ? 'UPCOMING' : 'OPEN'}
                    </span>
                    <span className="text-xs text-slate-400">Map: {match.map}</span>
                  </div>
                  <CountdownTimer targetDate={match.matchTime} />
                </div>

                <h3 className="text-sm font-extrabold text-white font-display leading-tight mb-3">
                  {match.title}
                </h3>

                {/* Assigned Slot Banner */}
                <div className="flex items-center justify-between bg-[#090d16] p-3 rounded-xl border border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 font-mono text-sm">
                      #{playerRec?.slotNumber}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Your Assigned Slot</div>
                      <div className="text-xs text-emerald-300 font-bold">
                        Sit strictly in Slot #{playerRec?.slotNumber}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    ৳{match.winPrize} Win
                  </span>
                </div>

                {/* Room ID & Password Block */}
                {hasCredentials ? (
                  <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> Room Credentials (Live)
                      </span>
                      <span className="text-[10px] text-emerald-300">Room Ready</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Room ID box */}
                      <div className="bg-[#090d16] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-mono">Room ID</div>
                          <div className="text-sm font-black text-white font-mono">{match.roomId}</div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(match.roomId!, 'room_id')}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          title="Copy Room ID"
                        >
                          {copiedId === 'room_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Password box */}
                      <div className="bg-[#090d16] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-mono">Password</div>
                          <div className="text-sm font-black text-white font-mono">{match.roomPassword || 'None'}</div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(match.roomPassword || '', 'pass')}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          title="Copy Password"
                        >
                          {copiedId === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Room ID & Password will be revealed 10-15 minutes prior to match kickoff.</span>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => {
                    setMatchReturnTab('my_matches');
                    setSelectedMatchId(match.id);
                    setActiveTab('match_details');
                  }}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>View Slot Grid & Match Rules</span>
                </button>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};
