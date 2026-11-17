import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Bell, Wallet, ChevronRight, ChevronLeft, 
  Sparkles, Gift, Globe 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BannerImage } from '../components/BannerImage';
import { ModeCardArtwork } from '../components/ModeCardArtwork';
import {
  TOURNAMENT_MODE_SECTIONS,
  TOURNAMENT_MODE_CARDS,
  ModeSectionId
} from '../config/tournamentModes';

export const HomeScreen: React.FC = () => {
  const { 
    currentUser, matches, banners, unreadCount, 
    setActiveTab, openCategoryMode, selectedMode, language, setLanguage, t 
  } = useApp();

  const [activeSectionFilter, setActiveSectionFilter] = useState<ModeSectionId | 'all'>('all');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartXRef = useRef<number | null>(null);
  const didDragRef = useRef(false);

  const activeBanners = (banners || []).filter(b => b.active !== false);
  const safeBannerIndex = activeBanners.length > 0 ? bannerIndex % activeBanners.length : 0;

  // Auto-sliding banners (3.5 seconds interval, paused while dragging)
  useEffect(() => {
    if (activeBanners.length <= 1 || isDragging) return;
    const interval = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % activeBanners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeBanners.length, isDragging]);

  const handleBannerDragStart = (clientX: number) => {
    if (activeBanners.length <= 1) return;
    dragStartXRef.current = clientX;
    didDragRef.current = false;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleBannerDragMove = (clientX: number) => {
    if (!isDragging || dragStartXRef.current === null) return;
    const delta = clientX - dragStartXRef.current;
    if (Math.abs(delta) > 8) {
      didDragRef.current = true;
    }
    setDragOffset(delta);
  };

  const handleBannerDragEnd = () => {
    if (!isDragging) return;
    const threshold = 40;
    if (activeBanners.length > 1) {
      if (dragOffset < -threshold) {
        setBannerIndex(prev => (prev + 1) % activeBanners.length);
      } else if (dragOffset > threshold) {
        setBannerIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
      }
    }
    dragStartXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
    setTimeout(() => {
      didDragRef.current = false;
    }, 50);
  };

  const visibleSections =
    activeSectionFilter === 'all'
      ? TOURNAMENT_MODE_SECTIONS
      : TOURNAMENT_MODE_SECTIONS.filter(sec => sec.id === activeSectionFilter);

  const handleBannerClick = (banner: any) => {
    const target = (banner.redirectUrl || '').trim();
    if (!target) return;

    const inAppRoutes = ['wallet', 'spin', 'store', 'results', 'leaderboard', 'profile', 'rules', 'notifications', 'my_matches'];
    if (inAppRoutes.includes(target.toLowerCase())) {
      setActiveTab(target.toLowerCase());
      return;
    }

    if (banner.actionType === 'video' || /^https?:\/\//i.test(target)) {
      window.open(target, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://${target}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#090d16] text-white pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-20 w-full bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Logo & User profile */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-orange-500/40 shadow-md shadow-orange-500/20 bg-[#0a0e18] shrink-0">
              <img
                src="/assets/aistudio/Storm_FF_Club__Play_and_Win_69a00649.png"
                alt="Storm FF Club"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] sm:text-sm font-bold text-white tracking-wide truncate font-body leading-tight">
                {currentUser?.ign || 'Guest Gamer'}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                <span className="text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                </span>
                <span className="shrink-0">•</span>
                <span className="text-amber-400 font-mono font-bold flex items-center gap-0.5 truncate">
                  <Sparkles className="w-3 h-3 shrink-0" /> {currentUser?.points || 0} pts
                </span>
              </div>
            </div>
          </div>

          {/* Language Switcher, Wallet Balance & Notification Bell */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition-all cursor-pointer shadow-sm shrink-0"
              title="Toggle English / Bangla"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="font-mono text-[10px] sm:text-[11px]">{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/15 to-amber-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/40 px-2 py-1 rounded-lg transition-all cursor-pointer shrink-0"
            >
              <Wallet className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <div className="text-right">
                <div className="text-[8px] text-slate-400 leading-none">{t('nav_wallet')}</div>
                <div className="text-[11px] sm:text-xs font-black text-white font-mono leading-none mt-0.5">
                  ৳{(currentUser?.depositBalance || 0) + (currentUser?.winningBalance || 0)}
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Compact Player UID Strip */}
        {currentUser?.freeFireUid && (
          <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[10px]">
            <span className="text-slate-400 font-semibold tracking-wide uppercase">
              Storm FF Club Player
            </span>
            <span className="px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/25 text-orange-400 font-mono font-bold truncate">
              UID: {currentUser.freeFireUid}
            </span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="px-3 pt-3 space-y-4 w-full">
        {/* Quick Action Bar */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('wallet')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 text-white font-bold text-[11px] sm:text-xs hover:border-orange-500/60 transition-all cursor-pointer min-w-0"
          >
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
            <span className="truncate">{t('home_quick_deposit')}</span>
          </button>
          <button
            onClick={() => setActiveTab('spin')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-white font-bold text-[11px] sm:text-xs hover:border-cyan-500/60 transition-all cursor-pointer min-w-0"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-spin shrink-0" />
            <span className="truncate">{t('home_quick_spin')}</span>
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white font-bold text-[11px] sm:text-xs hover:border-purple-500/60 transition-all cursor-pointer min-w-0"
          >
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
            <span className="truncate">{t('nav_store')}</span>
          </button>
        </div>

        {/* Swipeable & Auto-Sliding Unlimited Banner Carousel (Touch Drag + Auto-Slide) */}
        {activeBanners.length > 0 && (
          <div
            className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-800 group aspect-[2.1/1] max-h-48 select-none touch-pan-y"
            onTouchStart={(e) => handleBannerDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleBannerDragMove(e.touches[0].clientX)}
            onTouchEnd={handleBannerDragEnd}
            onMouseDown={(e) => handleBannerDragStart(e.clientX)}
            onMouseMove={(e) => handleBannerDragMove(e.clientX)}
            onMouseUp={handleBannerDragEnd}
            onMouseLeave={handleBannerDragEnd}
          >
            <div
              className={`flex w-full h-full ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
              style={{
                transform: `translateX(calc(-${safeBannerIndex * 100}% + ${dragOffset}px))`
              }}
            >
              {activeBanners.map((banner) => (
                <div
                  key={banner.id}
                  onClick={() => {
                    if (!didDragRef.current) {
                      handleBannerClick(banner);
                    }
                  }}
                  className="w-full h-full shrink-0 relative cursor-pointer"
                >
                  <div className="w-full h-full pointer-events-none">
                    <BannerImage
                      src={banner.imageUrl}
                      alt={banner.title}
                      draggable={false}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-3.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 mb-0.5 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Featured Event
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight font-display drop-shadow-md pr-12">
                      {banner.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Previous / Next Buttons for quick tap */}
            {activeBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerIndex(prev => (prev + 1) % activeBanners.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  aria-label="Next banner"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Slide Indicators */}
            <div className="absolute bottom-2 right-3 flex items-center gap-1.5 z-10">
              {activeBanners.map((b, i) => (
                <button
                  key={b.id || i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setBannerIndex(i); }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === safeBannerIndex ? 'w-5 bg-orange-400 shadow-sm' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Go to banner ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Visual Game Mode Cards (Demo Style Layout with PNG Slots & Live Counters) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 font-display flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === 'bn' ? 'টুর্নামেন্ট মোডসমূহ' : 'Tournament Modes'}</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {(matches || []).length} {language === 'bn' ? 'টি মোট ম্যাচ' : 'Total Matches'}
            </span>
          </div>

          {/* Quick Section Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveSectionFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                activeSectionFilter === 'all'
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                  : 'bg-[#121827] text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {t('home_filter_all')}
            </button>
            {TOURNAMENT_MODE_SECTIONS.map(sec => {
              const isTabActive = activeSectionFilter === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionFilter(sec.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                    isTabActive
                      ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                      : 'bg-[#121827] text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {language === 'bn' ? sec.bnTitle : sec.title}
                </button>
              );
            })}
          </div>

          {/* Mode Sections Grid */}
          <div className="space-y-5">
            {visibleSections.map(section => {
              const sectionCards = TOURNAMENT_MODE_CARDS.filter(c => c.sectionId === section.id);
              const sectionMatchesCount = (matches || []).filter(m => m.category === section.category).length;

              return (
                <div key={section.id} className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1 h-4 rounded-full shrink-0 ${section.accentBarClass}`} />
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-display truncate">
                        {language === 'bn' ? section.bnTitle : section.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 tabular-nums">
                      {sectionMatchesCount} {sectionMatchesCount === 1 ? 'Match' : 'Matches'}
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2.5">
                    {sectionCards.map(mode => {
                      const modeMatches = (matches || []).filter(
                        m => m.category === mode.category && m.subCategory === mode.subCategory
                      );
                      const liveCount = modeMatches.filter(
                        m => (m.status || '').trim().toLowerCase() === 'live'
                      ).length;
                      const totalCount = modeMatches.length;
                      const isSelected =
                        selectedMode?.category === mode.category && selectedMode?.subCategory === mode.subCategory;

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => openCategoryMode(mode.category, mode.subCategory)}
                          className={`group w-[calc(50%-0.3125rem)] sm:w-[calc(33.333%-0.45rem)] rounded-2xl overflow-hidden bg-[#121827] border text-left transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                            isSelected
                              ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/15'
                              : 'border-slate-800/90 hover:border-slate-600 shadow-md'
                          }`}
                        >
                          <ModeCardArtwork mode={mode} />

                          <div className="px-2.5 py-2.5 bg-[#121827] border-t border-slate-800/80 text-center space-y-1">
                            <div className="text-xs sm:text-[13px] font-extrabold text-white font-display truncate">
                              {language === 'bn' ? mode.bnTitle : mode.title}
                            </div>
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold font-mono tabular-nums">
                              {liveCount > 0 ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  <span className="text-emerald-400">
                                    {totalCount} {totalCount === 1 ? 'Match' : 'Matches'} Live
                                  </span>
                                </>
                              ) : totalCount > 0 ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  <span className="text-emerald-400">
                                    {totalCount} {totalCount === 1 ? 'Match' : 'Matches'} Open
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400">
                                  0 Matches
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Permanent Bangla Rules Guideline Card */}
        <div className="p-3 bg-[#0c101a] border border-amber-500/30 rounded-2xl text-left space-y-1 mt-3">
          <span className="text-[11px] font-bold text-amber-400 block">
            📌 টুর্নামেন্ট সাধারণ নিয়মাবলী (Permanent Bangla Rules)
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            ১. ম্যাচ শুরু হওয়ার ৫ মিনিট আগে 'My Matches' মেন্যুতে রুম আইডি ও পাসওয়ার্ড প্রকাশ করা হবে।<br />
            ২. অ্যাপে বুকিং করা সঠিক স্লটে বসতে হবে। অন্যের স্লটে বসলে রুম থেকে বের করে দেওয়া হবে।<br />
            ৩. কোনো প্রকার হ্যাক বা এমুলেটর ব্যবহার করলে কোনো রিফান্ড ছাড়া একাউন্ট ব্যান হবে।
          </p>
        </div>
      </main>
    </div>
  );
};
