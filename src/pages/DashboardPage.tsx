import React from 'react';
import {
  Boxes,
  AlertTriangle,
  Clock,
  Globe2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { productService } from '../services/ProductService';
import { aiService } from '../services/AIService';
import { alertService } from '../services/AlertService';
import { LanguageCode, CurrencyCode } from '../types';
import { translations, formatPrice } from '../i18n/translations';

interface DashboardPageProps {
  setActiveModule: (module: string) => void;
  currentLanguage: LanguageCode;
  currentCurrency: CurrencyCode;
}

const CATEGORY_COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveModule, currentLanguage, currentCurrency }) => {
  const t = translations[currentLanguage];
  const kpis = productService.getDashboardKPIs();
  const categoryData = productService.getCategoryDistribution();
  const supplierData = productService.getSupplierDistribution();
  const actionPlan = aiService.generateWeeklyActionPlan();
  const expiringProducts = productService.getExpiringProducts(30);

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>{t.dashTitle}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Live BI Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">{t.dashSubtitle}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveModule('assistant')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-gold-glow transition active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>{currentLanguage === 'fr' ? 'Consulter Assistant IA' : 'Consult AI Assistant'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.totalManagedProducts}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{kpis.totalProducts}</p>
          <p className="text-[11px] text-amber-500 font-semibold">{kpis.totalUnits.toLocaleString()} Total Units Managed</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.totalInventoryValue}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {formatPrice(kpis.totalValueSelling, currentCurrency)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Cost Basis: {formatPrice(kpis.totalValueCost, currentCurrency)}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.expiringAlerts}</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-400 font-mono">{kpis.expiringCount}</p>
          <button onClick={() => setActiveModule('alerts')} className="text-[11px] text-red-400 hover:underline font-semibold">
            {currentLanguage === 'fr' ? 'Voir le Centre d\'Alertes →' : 'View Alert Center →'}
          </button>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.overallStockHealth}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 font-mono">
            {kpis.stockHealthStatus === 'Healthy' ? t.healthy : kpis.stockHealthStatus === 'Needs Attention' ? t.needsAttention : t.critical}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">{kpis.lowStockCount} Items Low Stock</p>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <h2 className="font-bold text-white text-sm flex items-center space-x-2">
            <Boxes className="h-4 w-4 text-amber-400" />
            <span>{t.stockDistribution}</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <h2 className="font-bold text-white text-sm flex items-center space-x-2">
            <Globe2 className="h-4 w-4 text-blue-400" />
            <span>{t.supplierShare}</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Action Plan */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bold text-white text-sm flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>{t.actionPlan}</span>
          </h2>
          <span className="text-[10px] text-slate-400">ETS FOFANA Management</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {actionPlan.map((dayPlan, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-amber-400 text-xs">{dayPlan.day}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  dayPlan.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {dayPlan.priority}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{dayPlan.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
