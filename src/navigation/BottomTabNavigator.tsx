import React from 'react';
import { Swords, Trophy, Gamepad2, Award, Gift, User, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomTabNavigator: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, matches, t } = useApp();

  // Count matches joined by current user
  const myMatchesCount = currentUser
    ? (matches || []).filter(m => (m.joinedPlayers || []).some(p => p.uid === currentUser.uid) && m.status !== 'completed').length
    : 0;

  const tabs = [
    { id: 'home', label: t('nav_play'), icon: Swords, badge: null },
    { id: 'results', label: t('nav_results'), icon: Trophy, badge: null },
    { id: 'my_matches', label: t('nav_my_matches'), icon: Gamepad2, badge: myMatchesCount > 0 ? myMatchesCount : null },
    { id: 'leaderboard', label: t('nav_leaderboard'), icon: Award, badge: null },
    { id: 'store', label: t('nav_store'), icon: Gift, badge: 'New' },
    { id: 'profile', label: t('nav_profile'), icon: User, badge: null }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0c101a]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 max-w-lg mx-auto shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'home' && activeTab === 'category_matches');

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-orange-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : ''
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-gradient-to-r from-orange-500 to-amber-500 text-[9px] font-black text-white rounded-full leading-none shadow-sm animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-orange-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-orange-400 mt-0.5 shadow-[0_0_6px_#f97316]"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
