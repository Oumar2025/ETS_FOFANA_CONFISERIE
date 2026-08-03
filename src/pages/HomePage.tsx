import React from 'react';
import {
  Sparkles,
  Globe2,
  Boxes,
  TrendingUp,
  Bot,
  BellRing,
  FileText,
  Settings,
  ArrowRight,
  ShieldCheck,
  Building2,
  PlaneTakeoff,
  MapPin,
  Plane
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { CountryFlag } from '../components/CountryFlag';

interface HomePageProps {
  setActiveModule?: (module: string) => void;
  setActiveTab?: (tab: string) => void;
  currentLanguage?: LanguageCode;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveModule, setActiveTab, currentLanguage = 'en' }) => {
  const t = translations[currentLanguage];

  const handleNav = (id: string) => {
    if (setActiveModule) setActiveModule(id);
    else if (setActiveTab) setActiveTab(id);
  };

  const supplierCountries = ['Turkey', 'Morocco', 'Tunisia', 'Brazil', 'China', 'Thailand', 'Belgium'];
  const destinationCountries = ['Mali', 'Burkina Faso', "Côte d'Ivoire", 'Angola'];

  const modules = [
    { id: 'dashboard', name: t.dashboard, desc: t.dashSubtitle, icon: Boxes, color: 'text-amber-400' },
    { id: 'inventory', name: t.inventory, desc: 'Product CRUD, expiry monitoring, AI promotion advisor & decision simulator.', icon: Boxes, color: 'text-blue-400' },
    { id: 'forecast', name: t.forecast, desc: t.forecastSubtitle, icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'assistant', name: t.assistant, desc: 'Ask natural questions about stock, expiry, Ramadan demand, and profit margins.', icon: Bot, color: 'text-purple-400' },
    { id: 'alerts', name: t.alerts, desc: t.alertCenterSubtitle, icon: BellRing, color: 'text-red-400' },
    { id: 'reports', name: t.reports, desc: t.reportSubtitle, icon: FileText, color: 'text-yellow-400' },
    { id: 'settings', name: t.settings, desc: 'Configure SMTP credentials, AI provider model, and alert thresholds.', icon: Settings, color: 'text-slate-400' }
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Welcome Banner */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ETS FOFANA CONFISERIE &bull; Executive Portal v1.0</span>
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
              <Globe2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span className="font-bold">Imports:</span>
              <div className="flex items-center space-x-2">
                {supplierCountries.map(c => (
                  <span key={c} className="inline-flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    <CountryFlag country={c} size="sm" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
              <Plane className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-bold">Markets:</span>
              <div className="flex items-center space-x-2">
                {destinationCountries.map(c => (
                  <span key={c} className="inline-flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    <CountryFlag country={c} size="sm" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Network Card with Image Flags (Matching User Request Screenshot) */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center space-x-2">
          <span>Global Trade Network & Operations</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Countries */}
          <div className="space-y-3 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <Globe2 className="h-5 w-5 text-blue-400" />
              <span>{t.supplierCountries}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {supplierCountries.map((country) => (
                <div key={country} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200">
                  <CountryFlag country={country} size="lg" />
                  <span>{country}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Destination Countries */}
          <div className="space-y-3 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <Plane className="h-5 w-5 text-emerald-400" />
              <span>{t.destinationCountries}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {destinationCountries.map((country) => (
                <div key={country} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200">
                  <CountryFlag country={country} size="lg" />
                  <span>{country}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise System Modules */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <span>{t.enterpriseModules}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => handleNav(m.id)}
                className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${m.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-100 text-sm group-hover:text-amber-300 transition">{m.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
