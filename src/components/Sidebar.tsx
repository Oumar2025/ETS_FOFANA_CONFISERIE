import React from 'react';
import {
  Home,
  LayoutDashboard,
  Boxes,
  TrendingUp,
  Bot,
  Bell,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  alertCount: number;
  currentLanguage: LanguageCode;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  alertCount,
  currentLanguage,
  isMobileOpen,
  onCloseMobile
}) => {
  const t = translations[currentLanguage];

  const menuItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'inventory', label: t.inventory, icon: Boxes, badge: 'AI' },
    { id: 'forecast', label: t.forecast, icon: TrendingUp, badge: 'Predict' },
    { id: 'assistant', label: t.assistant, icon: Bot, badge: 'Ask' },
    { id: 'alerts', label: t.alerts, icon: Bell, badgeCount: alertCount },
    { id: 'reports', label: t.reports, icon: FileSpreadsheet },
    { id: 'settings', label: t.settings, icon: Settings }
  ];

  const handleSelectModule = (id: string) => {
    setActiveModule(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between fixed md:static inset-y-0 left-0 z-50 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Top Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 px-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-0.5 shadow-gold-glow flex items-center justify-center shrink-0">
                <img
                  src="/ets_fofana_logo.jpg"
                  alt="ETS FOFANA Logo"
                  className="h-full w-full rounded-[14px] object-cover"
                  onError={(e) => {
                    // Fallback to sparkles icon if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-black tracking-tight text-white text-base gold-gradient-text">FOF-AI</span>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded">v1.0</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  ETS FOFANA CONFISERIE
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            {isMobileOpen && (
              <button onClick={onCloseMobile} className="md:hidden p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              {currentLanguage === 'fr' ? 'MODULES PRINCIPAUX' : 'MAIN MODULES'}
            </p>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-md font-bold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                        {item.badgeCount}
                      </span>
                    )}

                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-amber-400" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Business Card */}
        <div className="p-4 border-t border-slate-900">
          <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 space-y-1 text-[11px]">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ETS FOFANA BI Guide</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Real-time confectionery import & distribution monitoring across Mali, Burkina Faso, Côte d'Ivoire & Angola.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
