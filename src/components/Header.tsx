import React from 'react';
import { Bell, RefreshCw, LogOut, Menu, User as UserIcon, ShieldCheck } from 'lucide-react';
import { UserSession, LanguageCode, CurrencyCode } from '../types';
import { translations } from '../i18n/translations';
import { LanguageToggle } from './LanguageToggle';
import { CurrencyToggle } from './CurrencyToggle';

interface HeaderProps {
  userSession: UserSession;
  activeModule: string;
  setActiveModule: (module: string) => void;
  onLogout: () => void;
  onCheckAlerts: () => void;
  unreadAlertCount: number;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userSession,
  activeModule,
  setActiveModule,
  onLogout,
  onCheckAlerts,
  unreadAlertCount,
  currentLanguage,
  onLanguageChange,
  currentCurrency,
  onCurrencyChange,
  onToggleMobileMenu
}) => {
  const t = translations[currentLanguage];

  const handleBellClick = () => {
    setActiveModule('alerts');
    onCheckAlerts();
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Toggle & Clickable Company Logo */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Clickable Company Logo -> Settings */}
        <button
          onClick={() => setActiveModule('settings')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
          title="Open System Settings & Company Profile"
        >
          <img
            src="/ets_fofana_logo.jpg"
            alt="ETS FOFANA Logo"
            className="h-9 w-9 rounded-xl object-cover border border-amber-500/40 shadow-gold-glow group-hover:scale-105 transition"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="hidden sm:block">
            <span className="font-extrabold text-white text-sm tracking-tight block gold-gradient-text group-hover:underline">
              ETS FOFANA CONFISERIE
            </span>
            <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider block">
              FOF-AI BI v2.0
            </span>
          </div>
        </button>
      </div>

      {/* Right Controls: Currency, Language, Alerts, Clickable User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Currency Switcher */}
        <CurrencyToggle currentCurrency={currentCurrency} onCurrencyChange={onCurrencyChange} />

        {/* Language Switcher */}
        <LanguageToggle currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />

        {/* Trigger Alert Check Button */}
        <button
          onClick={handleBellClick}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-400 text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{t.checkAlerts}</span>
        </button>

        {/* Alert Bell Button (Navigates directly to Alert Center Page) */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition"
            title="Open Smart Expiry Alert Center"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Clickable User Profile Avatar & Role -> Settings */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <button
            onClick={() => setActiveModule('settings')}
            className="flex items-center space-x-2 text-left group focus:outline-none"
            title="Update Profile Picture & User Account"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 p-0.5 shadow-md shrink-0 overflow-hidden group-hover:scale-105 transition">
              {userSession.avatarUrl ? (
                <img src={userSession.avatarUrl} alt={userSession.fullName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-950 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-amber-400" />
                </div>
              )}
            </div>

            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-slate-100 leading-tight group-hover:text-amber-400 transition">{userSession.fullName}</p>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3" />
                <span>{userSession.role}</span>
              </p>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition ml-1"
            title={t.signOut}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
