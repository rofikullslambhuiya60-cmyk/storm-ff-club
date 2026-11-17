import React, { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CategoryMatchesScreen } from '../screens/CategoryMatchesScreen';
import { MatchDetailsScreen } from '../screens/MatchDetailsScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { MyMatchesScreen } from '../screens/MyMatchesScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { PointStoreScreen } from '../screens/PointStoreScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SpinWheelScreen } from '../screens/SpinWheelScreen';
import { RulesScreen } from '../screens/RulesScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { BottomTabNavigator } from '../navigation/BottomTabNavigator';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { ForcedUpdateModal } from './ForcedUpdateModal';
import { BroadcastNotification } from '../types';

export const MobileAppView: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, notifications } = useApp();
  const [liveToast, setLiveToast] = useState<BroadcastNotification | null>(null);
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  // Listen for new live notifications targeted to currentUser (e.g. Deposit Approval, Mystery Box Done)
  useEffect(() => {
    if (!currentUser) return;

    const userNotifs = notifications.filter(
      n => !n.targetUid || n.targetUid === currentUser.uid
    );

    if (!initializedRef.current) {
      userNotifs.forEach(n => seenNotifIdsRef.current.add(n.id));
      initializedRef.current = true;
      return;
    }

    const newestUnseen = userNotifs.find(n => !seenNotifIdsRef.current.has(n.id));
    if (newestUnseen) {
      userNotifs.forEach(n => seenNotifIdsRef.current.add(n.id));
      setLiveToast(newestUnseen);
      const timer = setTimeout(() => {
        setLiveToast(prev => (prev?.id === newestUnseen.id ? null : prev));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notifications, currentUser]);

  if (!currentUser) {
    return <AuthScreen />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'category_matches':
        return <CategoryMatchesScreen />;
      case 'match_details':
        return <MatchDetailsScreen />;
      case 'results':
        return <ResultsScreen />;
      case 'my_matches':
        return <MyMatchesScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'store':
        return <PointStoreScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'spin':
        return <SpinWheelScreen />;
      case 'rules':
        return <RulesScreen />;
      case 'notifications':
        return <NotificationScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#090d16] text-white flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Instant Live Push Notification Toast */}
      {liveToast && (
        <div className="sticky top-2 z-50 mx-3 mt-2 animate-fadeIn">
          <div className="bg-gradient-to-r from-emerald-950 via-[#0e1b1d] to-emerald-950 border-2 border-emerald-500/60 rounded-2xl p-3 shadow-2xl shadow-emerald-500/20 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div
              onClick={() => {
                setLiveToast(null);
                setActiveTab('notifications');
              }}
              className="flex-1 cursor-pointer"
            >
              <div className="text-xs font-black text-emerald-300 leading-tight">
                {liveToast.title}
              </div>
              <p className="text-[11px] text-white leading-snug mt-0.5">
                {liveToast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Active Screen */}
      <div className="flex-1 w-full min-w-0">
        {renderActiveScreen()}
      </div>

      {/* Floating WhatsApp Live Chat Widget (Visible across app screens) */}
      <FloatingWhatsApp />

      {/* Forced App Update Blocker Modal */}
      <ForcedUpdateModal />

      {/* Bottom Tab Navigator */}
      <BottomTabNavigator />
    </div>
  );
};
