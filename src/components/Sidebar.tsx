import React from 'react';
import {
  Home,
  LayoutDashboard,
  Boxes,
  FileText,
  TrendingUp,
  Bot,
  Bell,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { LanguageCode, UserRole } from '../types';
import { translations } from '../i18n/translations';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  alertCount: number;
  currentLanguage: LanguageCode;
  userRole?: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  alertCount,
  currentLanguage,
  userRole = 'Super Administrator',
  isMobileOpen,
  onCloseMobile
}) => {
  const t = translations[currentLanguage];

  const allMenuItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'inventory', label: t.inventory, icon: Boxes, badge: 'Stock' },
    { id: 'salesInvoice', label: t.salesInvoice, icon: FileText, badge: 'Sales' },
    { id: 'forecast', label: t.forecast, icon: TrendingUp, badge: 'Predict' },
    { id: 'assistant', label: t.assistant, icon: Bot, badge: 'Ask' },
    { id: 'alerts', label: t.alerts, icon: Bell, badgeCount: alertCount },
    { id: 'reports', label: t.reports, icon: FileSpreadsheet },
    { id: 'settings', label: t.settings, icon: Settings }
  ];

  // Role-Based Navigation Menu Filtering
  const menuItems = allMenuItems.filter(item => {
    if (userRole === 'Super Administrator' || userRole === 'General Manager' || (userRole as string) === 'Administrator') {
      return true; // Full access
    }
    if (userRole === 'Inventory Manager') {
      return ['home', 'dashboard', 'inventory', 'forecast', 'assistant', 'alerts', 'reports'].includes(item.id);
    }
    if (userRole === 'Warehouse Manager') {
      return ['home', 'dashboard', 'inventory', 'alerts'].includes(item.id);
    }
    if (userRole === 'Procurement Officer') {
      return ['home', 'dashboard', 'inventory', 'forecast', 'assistant'].includes(item.id);
    }
    if (userRole === 'Sales Manager') {
      return ['home', 'dashboard', 'salesInvoice', 'assistant', 'alerts', 'reports'].includes(item.id);
    }
    if (userRole === 'Finance Manager') {
      return ['home', 'dashboard', 'salesInvoice', 'reports', 'forecast', 'assistant'].includes(item.id);
    }
    return true;
  });

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
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-black tracking-tight text-white text-base gold-gradient-text">FOF-AI</span>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded">v2.0</span>
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
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Main Modules
              </p>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {userRole.split(' ')[0]}
              </span>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold animate-pulse">
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

        {/* Footer Credit */}
        <div className="p-4 border-t border-slate-900">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 text-left space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-extrabold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FOF-AI BI v2.0</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Role-Based Enterprise ERP & Intelligence
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
