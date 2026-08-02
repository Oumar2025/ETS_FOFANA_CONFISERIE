import React from 'react';
import { Bell, RefreshCw, LogOut, ShieldCheck, Sparkles, User } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  user: UserSession | null;
  onLogout: () => void;
  activeAlertsCount: number;
  onCheckAlerts: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  activeAlertsCount,
  onCheckAlerts,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight gold-gradient-text">FOF-AI</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                v1.0 BI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">ETS FOFANA CONFISERIE</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick Check & Send Alerts button */}
        <button
          onClick={onCheckAlerts}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-all shadow-sm active:scale-95"
          title="Scan inventory & process email alerts"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Check & Send Alerts</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 transition"
          title="View Alert Center"
        >
          <Bell className="h-5 w-5 text-slate-300" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-slate-900 animate-bounce">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* User Session pill */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-200">{user.username}</p>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-semibold">{user.role}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
