import React, { useEffect, useRef } from 'react';
import {
  ArrowLeft, Swords, Users, ChevronRight, Wallet, Globe, Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CountdownTimer } from '../components/CountdownTimer';
import { ModeCardArtwork } from '../components/ModeCardArtwork';
import {
  TOURNAMENT_MODE_CARDS,
  TOURNAMENT_MODE_SECTIONS,
  formatCategoryDisplay,
  formatSubCategoryDisplay
} from '../config/tournamentModes';

export const CategoryMatchesScreen: React.FC = () => {
  const {
    currentUser,
    matches,
    selectedMode,
    setActiveTab,
    setSelectedMatchId,
    setMatchReturnTab,
    language,
    setLanguage,
    t
  } = useApp();

  const topAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    topAnchorRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [selectedMode?.category, selectedMode?.subCategory]);

  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white p-6 flex flex-col items-center justify-center text-center">
        <Swords className="w-12 h-12 text-slate-600 mb-3 opacity-60" />
        <p className="text-sm font-bold text-slate-300 mb-4">
          {language === 'bn' ? 'কোনো মোড নির্বাচন করা হয়নি।' : 'No tournament mode selected.'}
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          {language === 'bn' ? 'সকল মোডে ফিরুন' : 'Back to All Modes'}
        </button>
      </div>
    );
  }

  const modeCard = TOURNAMENT_MODE_CARDS.find(
    c => c.category === selectedMode.category && c.subCategory === selectedMode.subCategory
  );
  const modeSection = TOURNAMENT_MODE_SECTIONS.find(
    s => s.category === selectedMode.category
  );

  const modeTitle = modeCard
    ? language === 'bn'
      ? modeCard.bnTitle
      : modeCard.title
    : `${formatCategoryDisplay(selectedMode.category)} · ${formatSubCategoryDisplay(
        selectedMode.category,
        selectedMode.subCategory
      )}`;

  const parentSectionTitle = modeSection
    ? language === 'bn'
      ? modeSection.bnTitle
      : modeSection.title
    : formatCategoryDisplay(selectedMode.category);

  // Strictly display ONLY matches belonging to the exact selected category & sub-category
  const categoryMatches = (matches || []).filter(
    m => m.category === selectedMode.category && m.subCategory === selectedMode.subCategory
  );

  const liveMatchesCount = categoryMatches.filter(
    m => (m.status || '').trim().toLowerCase() === 'live'
  ).length;

  return (
    <div ref={topAnchorRef} className="min-h-screen w-full overflow-x-clip bg-[#090d16] text-white pb-28">
      {/* Sticky Destination Header Bar */}
      <header className="sticky top-0 z-20 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="whitespace-nowrap">
              {language === 'bn' ? 'সব মোড' : 'All Modes'}
            </span>
          </button>

          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-xs sm:text-sm font-black text-white font-display uppercase tracking-wide truncate">
              {modeTitle}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition-all cursor-pointer shrink-0"
              title="Toggle English / Bangla"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="font-mono text-[10px]">{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-1 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 px-2 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
            >
              <Wallet className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="text-[11px] font-black text-white font-mono tabular-nums">
                ৳{(currentUser?.depositBalance || 0) + (currentUser?.winningBalance || 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-3 pt-3 space-y-4">
        {/* Dedicated Selected Mode Banner Card */}
        <div className="rounded-2xl overflow-hidden bg-[#121827] border border-slate-800 shadow-xl">
          <div className="grid grid-cols-12 items-center">
            <div className="col-span-4 sm:col-span-3 p-2 bg-[#0a0f1c] flex items-center justify-center">
              {modeCard ? (
                <div className="w-full max-w-[120px] rounded-xl overflow-hidden border border-slate-800/80 shadow-md">
                  <ModeCardArtwork mode={modeCard} />
                </div>
              ) : (
                <div className="w-full aspect-square max-w-[120px] rounded-xl bg-gradient-to-br from-orange-950/80 to-slate-950 flex items-center justify-center">
                  <Flame className="w-7 h-7 text-orange-400" />
                </div>
              )}
            </div>

            <div className="col-span-8 sm:col-span-9 p-3.5 flex flex-col justify-center space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="truncate">{parentSectionTitle}</span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-white font-display leading-tight truncate">
                {modeTitle}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tabular-nums pt-0.5">
                <span className="text-orange-400 font-bold">
                  {categoryMatches.length} {categoryMatches.length === 1 ? 'Match' : 'Matches'}
                </span>
                {liveMatchesCount > 0 && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {liveMatchesCount} Live
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Strict Single-Mode Match List */}
        <div className="space-y-3">
          {categoryMatches.length === 0 ? (
            <div className="text-center py-12 bg-[#0e1320] border border-slate-800 rounded-2xl p-6 space-y-3">
              <Swords className="w-12 h-12 text-slate-600 mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">
                  {language === 'bn'
                    ? `${modeTitle} মোডে বর্তমানে কোনো ম্যাচ নেই`
                    : `No active matches in ${modeTitle} right now`}
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {language === 'bn'
                    ? 'অ্যাডমিন সারাদিন নতুন রুম পাবলিশ করেন। অনুগ্রহ করে পরে দেখুন অথবা অন্য মোড দেখুন।'
                    : 'New rooms are published throughout the day. Check back shortly or explore another mode.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-orange-500/20 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অন্য মোড দেখুন' : 'Browse Other Modes'}</span>
              </button>
            </div>
          ) : (
            categoryMatches.map(match => {
              const joinedPlayers = Array.isArray(match.joinedPlayers) ? match.joinedPlayers : [];
              const joinedCount = joinedPlayers.length;
              const isFull = joinedCount >= match.totalSlots;
              const hasJoined = currentUser && joinedPlayers.some(p => p.uid === currentUser.uid);
              const normStatus = (match.status || 'open').trim().toLowerCase();
              const isLive = normStatus === 'live';
              const isUpcoming = normStatus === 'upcoming';

              return (
                <div
                  key={match.id}
                  className={`bg-gradient-to-b from-[#111726] to-[#0c101a] border rounded-2xl p-3.5 shadow-xl transition-all relative overflow-hidden ${
                    isLive
                      ? 'border-red-500/50 hover:border-red-400/70'
                      : 'border-slate-800/90 hover:border-orange-500/40'
                  }`}
                >
                  {/* Status & Metadata Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-wider font-mono border border-orange-500/30">
                        {formatCategoryDisplay(match.category)} • {formatSubCategoryDisplay(match.category, match.subCategory)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono border ${
                          isLive
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                            : isUpcoming
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isLive ? '● LIVE' : isUpcoming ? 'UPCOMING' : 'OPEN'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        Map: <span className="text-slate-200 font-semibold">{match.map}</span>
                      </span>
                    </div>

                    {match.entryType === 'Free' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black tracking-wider border border-emerald-500/40">
                        FREE ENTRY
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black tracking-wider border border-amber-500/40 font-mono">
                        ৳{match.entryFee} Entry
                      </span>
                    )}
                  </div>

                  {/* Match Title */}
                  <h3 className="text-sm font-extrabold text-white leading-snug font-display mb-2.5">
                    {match.title}
                  </h3>

                  {/* Dynamic Prize Pool Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 bg-[#0a0e18]/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-center border-r border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('match_bhooya_prize')}</div>
                      <div className="text-xs sm:text-sm font-black text-amber-400 font-mono tabular-nums">৳{match.winPrize}</div>
                    </div>
                    {match.perKillPrize > 0 && (
                      <div className="text-center border-r border-slate-800/80">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('match_per_kill')}</div>
                        <div className="text-xs sm:text-sm font-black text-orange-400 font-mono tabular-nums">৳{match.perKillPrize}</div>
                      </div>
                    )}
                    {match.secondPrize && match.secondPrize > 0 && (
                      <div className="text-center border-r border-slate-800/80">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('match_2nd_prize')}</div>
                        <div className="text-xs sm:text-sm font-black text-slate-300 font-mono tabular-nums">৳{match.secondPrize}</div>
                      </div>
                    )}
                    {match.thirdPrize && match.thirdPrize > 0 && (
                      <div className="text-center">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('match_3rd_prize')}</div>
                        <div className="text-xs sm:text-sm font-black text-slate-400 font-mono tabular-nums">৳{match.thirdPrize}</div>
                      </div>
                    )}
                  </div>

                  {/* Live Player Count & Countdown */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {language === 'bn' ? 'জয়েন করেছে:' : 'Joined:'}{' '}
                        <strong className="text-white font-mono tabular-nums">
                          {joinedCount}/{match.totalSlots}
                        </strong>
                      </span>
                      <CountdownTimer targetDate={match.matchTime} />
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isFull
                            ? 'bg-red-500'
                            : joinedCount / match.totalSlots > 0.8
                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (joinedCount / match.totalSlots) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMatchReturnTab('category_matches');
                        setSelectedMatchId(match.id);
                        setActiveTab('match_details');
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md ${
                        hasJoined
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                          : isLive
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-red-600/30'
                          : isFull
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/30'
                      }`}
                    >
                      <span>
                        {hasJoined
                          ? language === 'bn'
                            ? 'জয়েন করেছেন (স্লট ও রুম দেখুন)'
                            : 'Joined (View Slot & Room ID)'
                          : isLive
                          ? language === 'bn'
                            ? 'লাইভ ম্যাচ (স্লট ও ডিটেইলস দেখুন)'
                            : 'Live Match (View Room & Slots)'
                          : isFull
                          ? language === 'bn'
                            ? 'ম্যাচ ফুল (স্লট দেখুন)'
                            : 'Match Full (View Slots)'
                          : language === 'bn'
                          ? 'ম্যাচে জয়েন ও স্লট বুকিং'
                          : 'Join Match & Pick Slot'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
