import React, { useState } from 'react';
import { Swords, Users, Crosshair, Flame, Trophy } from 'lucide-react';
import { GameCategory } from '../types';
import { TournamentModeCard } from '../config/tournamentModes';

interface ModeCardArtworkProps {
  mode: TournamentModeCard;
}

const CategoryEmblem: React.FC<{ category: GameCategory; className?: string }> = ({ category, className }) => {
  switch (category) {
    case 'BR':
      return <Swords className={className} />;
    case 'CS':
      return <Users className={className} />;
    case 'CSHeadshot':
    case 'HeadshotLoneWolf':
      return <Flame className={className} />;
    case 'LoneWolf':
      return <Crosshair className={className} />;
    case 'LossToWin':
      return <Trophy className={className} />;
    default:
      return <Swords className={className} />;
  }
};

export const ModeCardArtwork: React.FC<ModeCardArtworkProps> = ({ mode }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (mode.imageUrl && !imgFailed) {
    return (
      <div className="relative w-full aspect-square bg-[#0a0f1c] overflow-hidden">
        <img
          src={mode.imageUrl}
          alt={mode.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#121827]/70 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Sleek esports slot artwork rendered cleanly if PNG asset is missing or fails to load
  return (
    <div
      data-png-slot={mode.expectedAssetHint}
      className={`relative w-full aspect-square bg-gradient-to-br ${mode.accentFrom} via-[#0d1322] ${mode.accentTo} overflow-hidden flex flex-col items-center justify-center p-3 select-none`}
    >
      {/* Subtle tactical grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.14), transparent 65%), linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 18px 18px, 18px 18px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
        <div className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105">
          <CategoryEmblem category={mode.category} className={`w-5 h-5 ${mode.badgeColor}`} />
        </div>
        <span className="text-[11px] font-black tracking-widest uppercase text-white/90 font-display drop-shadow">
          {mode.shortTag}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#121827] to-transparent pointer-events-none" />
    </div>
  );
};
