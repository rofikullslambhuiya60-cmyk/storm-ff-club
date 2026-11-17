import React from 'react';
import { ShieldOff, ArrowLeft } from 'lucide-react';

interface NotFoundScreenProps {
  onGoHome: () => void;
}

export const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen w-full bg-[#070a12] text-white flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
        <ShieldOff className="w-8 h-8 text-orange-400" />
      </div>
      <div className="text-xs font-mono font-black uppercase tracking-widest text-orange-400 mb-1">
        404 • Not Found
      </div>
      <h1 className="text-2xl font-black font-display text-white mb-2">
        Page Not Available
      </h1>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6">
        The page you requested does not exist or you do not have permission to access this route.
      </p>
      <button
        type="button"
        onClick={onGoHome}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go to Storm FF Club</span>
      </button>
    </div>
  );
};
