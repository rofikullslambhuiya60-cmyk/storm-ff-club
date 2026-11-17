/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Monitor, Columns, Wifi, Battery, Signal, 
  RotateCcw, Sparkles, UserCheck, Flame, ExternalLink, HelpCircle, UserPlus, LogOut, Globe, Download 
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileAppView } from './components/MobileAppView';
import { AdminPanelShell } from './admin_panel/AdminPanelShell';
import { ReferralLandingPage } from './screens/ReferralLandingPage';

const MainAppContent: React.FC = () => {
  const { 
    viewMode, setViewMode, deviceFrame, setDeviceFrame, 
    allUsers, currentUser, switchUser, logout, setActiveTab,
    language, setLanguage 
  } = useApp();

  const [urlRefCode, setUrlRefCode] = useState<string>('');
  const [showLandingPage, setShowLandingPage] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      return !!(ref && ref.trim().length > 0);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && ref.trim().length > 0) {
        const cleanRef = ref.trim().toUpperCase();
        setUrlRefCode(cleanRef);
        sessionStorage.setItem('ffarena_pending_ref_code', cleanRef);
      }
    } catch {
      // ignore
    }
  }, []);

  // Device frame dimensions
  const getDeviceDimensions = () => {
    switch (deviceFrame) {
      case 'iphone':
        return 'w-full max-w-[390px] h-[min(844px,calc(100dvh-115px))] sm:h-[844px] rounded-[36px] sm:rounded-[50px] border-[8px] sm:border-[10px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)]';
      case 'galaxy':
        return 'w-full max-w-[412px] h-[min(890px,calc(100dvh-115px))] sm:h-[890px] rounded-[32px] sm:rounded-[36px] border-[8px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)]';
      case 'ipad':
        return 'w-full max-w-[720px] h-[min(920px,calc(100dvh-115px))] sm:h-[920px] rounded-[32px] border-[12px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)]';
      case 'responsive':
      default:
        return 'w-full max-w-md min-h-screen border-x border-slate-800/80 shadow-2xl';
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col font-body antialiased">
      {/* Top Universal App Navigation & Mode Switcher Bar */}
      <nav className="sticky top-0 z-50 bg-[#0a0d16]/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Left Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-orange-500/40 shadow-md shadow-orange-500/25 bg-[#0a0e18] shrink-0">
            <img
              src="/assets/aistudio/Storm_FF_Club__Play_and_Win_69a00649.png"
              alt="Storm FF Club Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider uppercase font-display bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Storm FF Club
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                PROD BUILD
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Cross-Platform Mobile App & Automated Admin Web Panel
            </p>
          </div>
        </div>

        {/* Center: Viewport Mode Switcher */}
        <div className="flex items-center bg-[#0e1320] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setShowLandingPage(false); setViewMode('mobile'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !showLandingPage && viewMode === 'mobile'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>

          <button
            onClick={() => { setShowLandingPage(false); setViewMode('admin'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !showLandingPage && viewMode === 'admin'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </button>

          <button
            onClick={() => { setShowLandingPage(false); setViewMode('split'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !showLandingPage && viewMode === 'split'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Side-by-side view to witness live changes in real-time"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Side-by-Side</span>
          </button>

          <button
            onClick={() => setShowLandingPage(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              showLandingPage
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Preview Referral App Download Landing Page (/?ref=CODE)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">App Download</span>
          </button>
        </div>

        {/* Right Tools: Device Selector & Fast Account Switcher */}
        <div className="flex items-center gap-2">
          {/* Device Frame selector (only relevant in mobile mode) */}
          {viewMode === 'mobile' && (
            <div className="hidden sm:flex items-center bg-[#0e1320] p-0.5 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setDeviceFrame('iphone')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  deviceFrame === 'iphone' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                iPhone 15
              </button>
              <button
                onClick={() => setDeviceFrame('galaxy')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  deviceFrame === 'galaxy' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Galaxy S24
              </button>
              <button
                onClick={() => setDeviceFrame('ipad')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  deviceFrame === 'ipad' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                iPad
              </button>
              <button
                onClick={() => setDeviceFrame('responsive')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  deviceFrame === 'responsive' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Mobile
              </button>
            </div>
          )}

          {/* Dual Language Switcher Toggle */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0e1320] hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
            title="Switch App Language (English / বাংলা)"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono text-[11px] font-black text-amber-300">
              {language === 'bn' ? 'বাং' : 'EN'}
            </span>
          </button>

          {/* Quick Account Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0e1320] border border-slate-800 rounded-xl px-2 py-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold hidden sm:inline">Role:</span>
            <select
              value={currentUser?.uid || 'logged_out'}
              onChange={e => {
                if (e.target.value === 'logged_out') {
                  logout();
                } else {
                  switchUser(e.target.value);
                }
              }}
              className="bg-transparent text-xs font-bold text-orange-400 focus:outline-none cursor-pointer max-w-[120px] truncate"
            >
              {allUsers.map(u => (
                <option key={u.uid} value={u.uid} className="bg-[#0f1422] text-white">
                  {u.role === 'admin' ? `⚡ Admin: ${u.ign}` : `🎮 Player: ${u.ign}`}
                </option>
              ))}
              <option value="logged_out" className="bg-[#0f1422] text-amber-400 font-bold">
                + Sign Up / Login Screen
              </option>
            </select>
          </div>

          {/* Direct Sign Up / Login Button */}
          {currentUser && (
            <button
              onClick={() => logout()}
              className="px-2.5 py-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              title="Open Sign Up & Login Screen"
            >
              <UserPlus className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Sign Up / Login</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Viewport Container */}
      <div className="flex-1 overflow-x-clip">
        {/* VIEW 0: REFERRAL DOWNLOAD LANDING PAGE (/?ref=CODE or Web Portal) */}
        {showLandingPage ? (
          <ReferralLandingPage
            referralCode={urlRefCode || currentUser?.referralCode || 'BOSS99'}
            onContinueOnWeb={() => {
              setShowLandingPage(false);
              setViewMode('mobile');
              if (urlRefCode) {
                logout();
              }
            }}
          />
        ) : viewMode === 'mobile' && (
          <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-2 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#06080e] to-[#04060a]">
            {deviceFrame === 'responsive' ? (
              <div className="w-full max-w-md mx-auto shadow-2xl bg-[#090d16] border-x border-slate-800 min-h-screen">
                <MobileAppView />
              </div>
            ) : (
              <div className={`relative overflow-hidden bg-[#090d16] transition-all duration-300 ${getDeviceDimensions()}`}>
                {/* Smartphone Dynamic Island / Notch */}
                {deviceFrame === 'iphone' && (
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-3 border border-slate-800"></div>
                  </div>
                )}

                {/* Galaxy S24 punch-hole */}
                {deviceFrame === 'galaxy' && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40 border border-slate-800"></div>
                )}

                {/* Native OS Status Bar Simulation */}
                <div className="sticky top-0 z-30 bg-[#0d121f]/95 backdrop-blur-sm px-6 pt-2 pb-1 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="font-bold">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-bold">5G</span>
                    <Wifi className="w-3 h-3 text-slate-300" />
                    <Battery className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>

                {/* Screen Scrollable View */}
                <div className="h-[calc(100%-36px)] overflow-y-auto overflow-x-clip smooth-scroll">
                  <MobileAppView />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ADMIN WEB PANEL VIEW */}
        {!showLandingPage && viewMode === 'admin' && (
          <div className="min-h-screen">
            <AdminPanelShell />
          </div>
        )}

        {/* VIEW 3: SPLIT VIEW (Side-by-Side Live Synchronization) */}
        {!showLandingPage && viewMode === 'split' && (
          <div className="min-h-screen grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-slate-800 bg-[#06080e]">
            {/* Left Column: Mobile App Frame */}
            <div className="xl:col-span-5 p-4 sm:p-6 flex flex-col items-center justify-start bg-slate-950/60 overflow-y-auto max-h-screen">
              <div className="mb-3 text-center">
                <span className="text-xs font-black uppercase text-orange-400 font-display flex items-center justify-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Live Player Mobile View
                </span>
                <span className="text-[11px] text-slate-400">
                  Updates in real time as admin changes matches, gateways, or balances
                </span>
              </div>

              <div className="w-[380px] h-[820px] rounded-[44px] border-[8px] border-slate-800 shadow-2xl overflow-hidden bg-[#090d16] relative flex flex-col">
                <div className="sticky top-0 z-30 bg-[#0d121f]/95 px-6 pt-2 pb-1 flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span className="font-bold">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-clip smooth-scroll">
                  <MobileAppView />
                </div>
              </div>
            </div>

            {/* Right Column: Admin Panel Shell */}
            <div className="xl:col-span-7 bg-[#070a11] overflow-y-auto overflow-x-clip max-h-screen smooth-scroll">
              <AdminPanelShell />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
