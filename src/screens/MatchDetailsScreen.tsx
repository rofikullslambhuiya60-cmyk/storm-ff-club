import React, { useState } from 'react';
import { 
  ArrowLeft, Users, Trophy, Flame, ShieldAlert, CheckCircle2, 
  Clock, Key, Lock, AlertCircle, Sparkles, Swords, Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CountdownTimer } from '../components/CountdownTimer';
import { ContextualRules } from '../components/ContextualRules';
import { formatCategoryDisplay, formatSubCategoryDisplay } from '../config/tournamentModes';

export const MatchDetailsScreen: React.FC = () => {
  const { 
    selectedMatchId, matches, currentUser, joinMatch, 
    setActiveTab, setSelectedMatchId, matchReturnTab, language, setLanguage, t 
  } = useApp();

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const match = matches.find(m => m.id === selectedMatchId);

  if (!match) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white p-6 flex flex-col items-center justify-center">
        <p className="text-slate-400 mb-4">No match selected or match has ended.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-4 py-2 bg-orange-500 rounded-xl text-xs font-bold"
        >
          Return to Tournaments
        </button>
      </div>
    );
  }

  const joinedPlayers = Array.isArray(match.joinedPlayers) ? match.joinedPlayers : [];
  const hasJoined = currentUser && joinedPlayers.some(p => p.uid === currentUser.uid);
  const myPlayerRecord = currentUser ? joinedPlayers.find(p => p.uid === currentUser.uid) : null;
  const joinedCount = joinedPlayers.length;
  const isFull = joinedCount >= match.totalSlots;
  const normStatus = (match.status || 'open').trim().toLowerCase();
  const isLive = normStatus === 'live';
  const isUpcoming = normStatus === 'upcoming';
  const isJoinableStatus = normStatus === 'open' || normStatus === 'upcoming';

  const handleJoin = () => {
    setError(null);
    setSuccess(null);

    if (!selectedSlot) {
      setError('Please select an available slot number from the grid below first.');
      return;
    }

    setIsBooking(true);
    const result = joinMatch(match.id, selectedSlot);
    setIsBooking(false);

    if (!result.success) {
      setError(result.message || 'Failed to join match');
    } else {
      setSuccess(result.message || 'Successfully joined match!');
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#090d16] text-white pb-28">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            setSelectedMatchId(null);
            setActiveTab(matchReturnTab || 'home');
          }}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>{language === 'bn' ? 'ম্যাচে ফিরুন' : 'Back to Matches'}</span>
        </button>
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
          <span className="text-xs font-black uppercase text-orange-400 font-mono tracking-wider">
            Match #{match.id.slice(-6).toUpperCase()}
          </span>
        </div>
      </header>

      <main className="px-3.5 pt-3 space-y-4 max-w-lg mx-auto">
        {/* Match Header Card */}
        <div className="bg-gradient-to-b from-[#131a2c] to-[#0c101a] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black tracking-wider uppercase border border-orange-500/30">
                {formatCategoryDisplay(match.category)} • {formatSubCategoryDisplay(match.category, match.subCategory)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                isLive
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                  : isUpcoming
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {isLive ? '● LIVE' : isUpcoming ? 'UPCOMING' : 'OPEN'}
              </span>
            </div>
            <CountdownTimer targetDate={match.matchTime} />
          </div>

          <h1 className="text-lg font-black text-white font-display leading-tight mb-2">
            {match.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
            <span>{language === 'bn' ? 'ম্যাপ:' : 'Map:'} <strong className="text-white">{match.map}</strong></span>
            <span>•</span>
            <span>{language === 'bn' ? 'ডিভাইস:' : 'Device:'} <strong className="text-white">{language === 'bn' ? 'শুধুমাত্র মোবাইল' : 'Mobile Only'}</strong></span>
            <span>•</span>
            <span>
              {t('match_entry_fee')}:{' '}
              {match.entryType === 'Free' ? (
                <strong className="text-emerald-400 font-black">{language === 'bn' ? 'ফ্রি' : 'FREE'}</strong>
              ) : (
                <strong className="text-amber-400 font-black font-mono">৳{match.entryFee}</strong>
              )}
            </span>
          </div>

          {/* Dynamic Prize Pool */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#090d16] p-3 rounded-xl border border-slate-800 text-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('match_bhooya_prize')}</div>
              <div className="text-sm font-black text-amber-400 font-mono">৳{match.winPrize}</div>
            </div>
            {match.perKillPrize > 0 && (
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('match_per_kill')}</div>
                <div className="text-sm font-black text-orange-400 font-mono">৳{match.perKillPrize}</div>
              </div>
            )}
            {match.secondPrize && match.secondPrize > 0 && (
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('match_2nd_prize')}</div>
                <div className="text-sm font-black text-slate-300 font-mono">৳{match.secondPrize}</div>
              </div>
            )}
            {match.thirdPrize && match.thirdPrize > 0 && (
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('match_3rd_prize')}</div>
                <div className="text-sm font-black text-slate-400 font-mono">৳{match.thirdPrize}</div>
              </div>
            )}
          </div>
        </div>

        {/* Room Credentials Notification (If user has joined and credentials exist) */}
        {hasJoined && (
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wide">
                You are registered! Slot #{myPlayerRecord?.slotNumber}
              </span>
            </div>

            {match.roomId ? (
              <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-around font-mono mt-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Custom Room ID</div>
                  <div className="text-base font-black text-emerald-300 select-all">{match.roomId}</div>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Room Password</div>
                  <div className="text-base font-black text-emerald-300 select-all">{match.roomPassword || 'None'}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-300 flex items-center gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Room ID and Password will be posted here 10-15 minutes before match start.</span>
              </div>
            )}
          </div>
        )}

        {/* Feedback Alerts */}
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

        {/* Interactive Custom Slot Booking Grid */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 font-display flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-400" />
                Select Your Slot ({joinedCount}/{match.totalSlots})
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pick a green number to reserve your position in the custom room.
              </p>
            </div>
            {selectedSlot && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-black rounded-lg animate-pulse font-mono">
                Slot #{selectedSlot} Selected
              </span>
            )}
          </div>

          {/* Slot Grid Legend */}
          <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-500/30 border border-red-500"></span>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-orange-500 border border-orange-400"></span>
              <span>Your Choice</span>
            </div>
          </div>

          {/* Slots container */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-72 overflow-y-auto pr-1">
            {Array.from({ length: match.totalSlots }, (_, i) => {
              const slotNumber = i + 1;
              const occupant = joinedPlayers.find(p => p.slotNumber === slotNumber);
              const isOccupied = !!occupant;
              const isMine = occupant?.uid === currentUser?.uid;
              const isCurrentSelection = selectedSlot === slotNumber;

              return (
                <button
                  key={slotNumber}
                  type="button"
                  disabled={Boolean(isOccupied || hasJoined || !isJoinableStatus)}
                  onClick={() => setSelectedSlot(slotNumber)}
                  className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center border font-mono ${
                    isMine
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-black'
                      : isOccupied
                      ? 'bg-red-500/10 border-red-500/20 text-red-400/50 cursor-not-allowed opacity-60'
                      : isCurrentSelection
                      ? 'bg-orange-500 border-orange-400 text-white font-black shadow-lg shadow-orange-500/40 scale-105'
                      : 'bg-[#141a29] border-slate-700/80 hover:border-emerald-400 text-slate-300 hover:text-white cursor-pointer hover:bg-emerald-500/10'
                  }`}
                  title={occupant ? `Occupied by: ${occupant.ign}` : `Slot #${slotNumber} Available`}
                >
                  <span className="text-xs font-black leading-none">#{slotNumber}</span>
                  <span className="text-[9px] truncate max-w-[42px] leading-tight mt-1 opacity-80">
                    {occupant ? occupant.ign.slice(0, 5) : 'Open'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contextual Rules Widget (Appears directly above join button) */}
        <ContextualRules type="matchJoin" customTitle="Tournament Participation Rules" />

        {/* Bottom Booking Action Button */}
        {!hasJoined ? (
          <div className="sticky bottom-16 z-10 pt-2 space-y-2">
            {error && (
              <div className="p-3 bg-red-950/90 border border-red-500/60 rounded-xl text-xs text-red-200 flex items-start gap-2 shadow-xl backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}
            <button
              onClick={handleJoin}
              disabled={isBooking || isFull || !isJoinableStatus}
              className={`w-full py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-2xl transition-all ${
                !isJoinableStatus || isFull
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/30 active:scale-95 cursor-pointer'
              }`}
            >
              <Swords className="w-5 h-5" />
              <span>
                {isLive
                  ? (language === 'bn' ? 'ম্যাচটি বর্তমানে লাইভ — রেজিস্ট্রেশন বন্ধ' : 'Match is Currently LIVE — Registrations Closed')
                  : !isJoinableStatus
                  ? 'Match Registration Closed'
                  : isFull
                  ? (language === 'bn' ? 'ম্যাচ ফুল হয়ে গেছে' : 'Match Full')
                  : isBooking
                  ? 'Reserving Slot...'
                  : selectedSlot
                  ? `Confirm Slot #${selectedSlot} (${match.entryType === 'Free' ? 'FREE' : `Pay ৳${match.entryFee}`})`
                  : 'Select an Available Slot to Join'}
              </span>
            </button>
          </div>
        ) : (
          <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            ✓ You have joined this match. Make sure to open Free Fire 5 minutes before scheduled match time.
          </div>
        )}
      </main>
    </div>
  );
};
