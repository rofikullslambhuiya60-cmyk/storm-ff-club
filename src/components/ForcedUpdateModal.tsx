import React from 'react';
import { Download, ShieldCheck, Flame, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ForcedUpdateModal: React.FC = () => {
  const { settings, showForcedUpdate } = useApp();

  if (!showForcedUpdate || !settings.forcedUpdate?.enabled) return null;

  const updateInfo = settings.forcedUpdate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-[#0e131f] border-2 border-orange-500/50 rounded-2xl p-6 text-center shadow-2xl shadow-orange-500/20 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-400">
          <Flame className="w-9 h-9 animate-flame" />
        </div>

        <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full border border-orange-500/30 uppercase tracking-wider mb-2">
          Version {updateInfo.minVersion} Required
        </span>

        <h3 className="text-xl font-black text-white font-display mb-2">
          {updateInfo.title || 'Mandatory App Update'}
        </h3>

        <p className="text-sm text-slate-300/90 leading-relaxed mb-6 font-body">
          {updateInfo.message || 'A major security & anti-cheat update is required to continue playing in Storm FF Club tournaments.'}
        </p>

        <div className="space-y-3">
          <a
            href={updateInfo.downloadUrl || 'https://stormffclub.app/download'}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>Update Now (Direct APK / App Store)</span>
          </a>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Virus-Free & Safe Official Build</span>
          </div>
        </div>
      </div>
    </div>
  );
};
