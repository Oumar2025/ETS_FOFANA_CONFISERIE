import React from 'react';
import { TrendingUp, Sparkles, Calendar, AlertTriangle, ArrowUpRight, ArrowDownRight, PackageCheck, ShoppingCart } from 'lucide-react';
import { forecastService } from '../services/ForecastService';
import { dbService } from '../services/DatabaseService';
import { DemandForecast, SeasonalEvent, LanguageCode, CurrencyCode } from '../types';
import { translations, formatPrice } from '../i18n/translations';

interface ForecastPageProps {
  currentLanguage: LanguageCode;
  currentCurrency: CurrencyCode;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({ currentLanguage, currentCurrency }) => {
  const t = translations[currentLanguage];
  const forecasts = forecastService.generateForecasts();
  const seasonalEvents = dbService.getSeasonalEvents();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-amber-400" />
            <span>{t.forecastTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">{t.forecastSubtitle}</p>
        </div>
      </div>

      {/* Active Seasonal Event Multipliers */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 className="font-bold text-white text-sm flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{t.activeMultipliers}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {seasonalEvents.map((ev) => (
            <div key={ev.event_id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">{ev.event}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400">
                  {ev.demand_multiplier}x
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Target: {ev.category}</p>
              <p className="text-[10px] text-slate-500 font-mono">{ev.start_date} to {ev.end_date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demand Forecast Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-white text-sm">{t.forecastTableTitle}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4">{t.productName}</th>
                <th className="py-3.5 px-4">{t.category}</th>
                <th className="py-3.5 px-4">{t.currentStock}</th>
                <th className="py-3.5 px-4">{t.histMonthlyAvg}</th>
                <th className="py-3.5 px-4">{t.seasonalEvent}</th>
                <th className="py-3.5 px-4">{t.expectedDemand}</th>
                <th className="py-3.5 px-4">{t.recImportQty}</th>
                <th className="py-3.5 px-4">{t.aiInterpretation}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {forecasts.map((f) => (
                <tr key={f.product_id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-[200px] truncate">{f.product_name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{f.category}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">{f.current_stock}</td>
                  <td className="py-3.5 px-4 text-slate-400">{f.historical_monthly_avg}</td>
                  <td className="py-3.5 px-4 text-amber-400 font-semibold">{f.active_seasonal_event || 'Standard'}</td>
                  <td className="py-3.5 px-4 font-bold text-white font-mono">{f.expected_demand}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-400 font-mono">+{f.import_recommendation_qty}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        f.ai_interpretation === 'Inventory Shortage'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : f.ai_interpretation === 'Overstock Risk'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {f.ai_interpretation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
