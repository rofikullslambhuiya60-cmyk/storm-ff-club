import React, { useState } from 'react';
import {
  LayoutDashboard, Swords, Users, DollarSign, CreditCard,
  Gift, Bell, BookOpen, Image, ShieldCheck, LogOut, Smartphone, ArrowRight, Package, Code2
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { MatchManager } from './MatchManager';
import { UserManager } from './UserManager';
import { PayoutManager } from './PayoutManager';
import { MysteryBoxManager } from './MysteryBoxManager';
import { PaymentSettings } from './PaymentSettings';
import { ReferralBonusSettings } from './ReferralBonusSettings';
import { NotificationManager } from './NotificationManager';
import { RulesNoticeManager } from './RulesNoticeManager';
import { MediaControl } from './MediaControl';
import { DeveloperSettings } from './DeveloperSettings';
import { AdminSecuritySettings } from './AdminSecuritySettings';
import { useApp } from '../context/AppContext';
import { getConfiguredAdminEmail } from '../services/adminAuthService';

interface AdminPanelShellProps {
  onExitToApp?: () => void;
  onAdminLogout?: () => void;
}

export const AdminPanelShell: React.FC<AdminPanelShellProps> = ({
  onExitToApp,
  onAdminLogout
}) => {
  const [adminTab, setAdminTab] = useState('dashboard');
  const { setViewMode, mysteryBoxOrders } = useApp();

  const pendingMysteryOrders = mysteryBoxOrders.filter(o => o.status === 'pending').length;
  const adminEmail = getConfiguredAdminEmail();

  const navItems = [
    { id: 'dashboard', label: 'Analytics & Overview', icon: LayoutDashboard },
    { id: 'matches', label: 'Tournaments & Matches', icon: Swords },
    { id: 'mystery_orders', label: 'Mystery Box Orders', icon: Package, badge: pendingMysteryOrders },
    { id: 'users', label: 'User & Anti-Fraud', icon: Users },
    { id: 'payouts', label: 'Automated Payouts', icon: DollarSign },
    { id: 'gateways', label: 'bKash & Nagad Numbers', icon: CreditCard },
    { id: 'bonuses', label: 'Bonuses & System Limits', icon: Gift },
    { id: 'notifications', label: 'Broadcast Push Alerts', icon: Bell },
    { id: 'rules', label: 'Contextual Rules CMS', icon: BookOpen },
    { id: 'banners', label: 'Media & Home Banners', icon: Image },
    { id: 'developer', label: 'Hire Developer Info', icon: Code2 },
    { id: 'security', label: 'Admin Password & Security', icon: ShieldCheck }
  ];

  const handleOpenUserApp = () => {
    if (onExitToApp) {
      onExitToApp();
    } else {
      setViewMode('mobile');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-200 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-[#0c101a] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-orange-500/40 shadow-md shadow-orange-500/20 bg-[#0a0e18] shrink-0">
              <img
                src="/assets/aistudio/Storm_FF_Club__Play_and_Win_69a00649.png"
                alt="Storm FF Club Admin Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-black text-white font-display tracking-wider">
                STORM FF CLUB ADMIN
              </h1>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Protected Console
              </span>
            </div>
          </div>

          {/* Open User App */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleOpenUserApp}
              className="w-full py-2 px-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-400 border border-orange-500/40 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-400" />
                <span>Open Player App</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAdminTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      isActive ? 'bg-white text-orange-600' : 'bg-amber-500 text-slate-950 animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin footer info & logout */}
        <div className="pt-4 border-t border-slate-800/80 mt-6 px-2 space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Signed-in Admin
            </div>
            <div className="text-[11px] font-mono font-bold text-white truncate mt-0.5">
              {adminEmail}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              v2.4.0 Engine • Firestore Connected
            </div>
          </div>

          {onAdminLogout && (
            <button
              type="button"
              onClick={onAdminLogout}
              className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock & Logout Admin</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-6xl">
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={tab => setAdminTab(tab)} />}
        {adminTab === 'matches' && <MatchManager />}
        {adminTab === 'mystery_orders' && <MysteryBoxManager />}
        {adminTab === 'users' && <UserManager />}
        {adminTab === 'payouts' && <PayoutManager />}
        {adminTab === 'gateways' && <PaymentSettings />}
        {adminTab === 'bonuses' && <ReferralBonusSettings />}
        {adminTab === 'notifications' && <NotificationManager />}
        {adminTab === 'rules' && <RulesNoticeManager />}
        {adminTab === 'banners' && <MediaControl />}
        {adminTab === 'developer' && <DeveloperSettings />}
        {adminTab === 'security' && <AdminSecuritySettings />}
      </main>
    </div>
  );
};
