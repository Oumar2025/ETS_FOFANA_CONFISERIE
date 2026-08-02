import React from 'react';
import { FileSpreadsheet, Download, Printer, CheckCircle2, TrendingUp, DollarSign, Boxes, ShieldAlert, Sparkles } from 'lucide-react';
import { productService } from '../services/ProductService';
import { dbService } from '../services/DatabaseService';
import { LanguageCode, CurrencyCode, UserSession } from '../types';
import { translations, formatPrice } from '../i18n/translations';

interface ExecutiveReportPageProps {
  userSession: UserSession;
  currentLanguage: LanguageCode;
  currentCurrency: CurrencyCode;
}

export const ExecutiveReportPage: React.FC<ExecutiveReportPageProps> = ({ userSession, currentLanguage, currentCurrency }) => {
  const t = translations[currentLanguage];
  const products = productService.getAllProducts();

  const totalValueCost = products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);
  const totalValueSelling = products.reduce((sum, p) => sum + (p.quantity * p.selling_price), 0);
  const expectedProfit = totalValueSelling - totalValueCost;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Product ID', 'Product Name', 'Category', 'Quantity', 'Unit', 'Cost Price', 'Selling Price', 'Supplier', 'Destination', 'Expiry Date', 'Warehouse', 'Status'];
    const rows = products.map(p => [
      p.product_id,
      `"${p.product_name}"`,
      p.category,
      p.quantity,
      p.unit,
      p.cost_price,
      p.selling_price,
      p.supplier_country,
      p.destination_country,
      p.expiry_date,
      `"${p.warehouse}"`,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ETS_FOFANA_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 print:border-black">
        <div className="flex items-center space-x-3">
          <img src="/ets_fofana_logo.jpg" alt="Logo" className="h-12 w-12 rounded-xl object-cover border border-amber-500/40" />
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2 print:text-black">
              <span>{t.reportTitle}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 print:text-gray-600">
              {t.reportSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 print:hidden">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-amber-400 text-xs font-bold shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow-gold-glow transition active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>{t.printPdf}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">{t.costValue}</span>
          <p className="text-xl font-bold text-amber-400 font-mono">{formatPrice(totalValueCost, currentCurrency)}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">{t.revenueValue}</span>
          <p className="text-xl font-bold text-emerald-400 font-mono">{formatPrice(totalValueSelling, currentCurrency)}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">{t.grossProfit}</span>
          <p className="text-xl font-bold text-blue-400 font-mono">{formatPrice(expectedProfit, currentCurrency)}</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">{t.managedLines}</span>
          <p className="text-xl font-bold text-slate-100 font-mono">{products.length} {currentLanguage === 'fr' ? 'Produits' : 'Products'}</p>
        </div>
      </div>

      {/* Master Audit Inventory Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 print:border-gray-300">
        <h2 className="font-bold text-white text-base print:text-black border-b border-slate-800 print:border-gray-300 pb-2">
          {t.masterAuditTitle}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs print:text-black">
            <thead>
              <tr className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 print:bg-gray-100 print:text-black">
                <th className="py-2.5 px-3">{t.productName}</th>
                <th className="py-2.5 px-3">{t.category}</th>
                <th className="py-2.5 px-3">{t.originMarket}</th>
                <th className="py-2.5 px-3">{t.qtyUnit}</th>
                <th className="py-2.5 px-3">{t.costPrice}</th>
                <th className="py-2.5 px-3">{t.sellingPrice}</th>
                <th className="py-2.5 px-3">{t.expiryDate}</th>
                <th className="py-2.5 px-3">{t.warehouse}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {products.map((p) => (
                <tr key={p.product_id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-slate-100 print:text-black">{p.product_name}</td>
                  <td className="py-2.5 px-3 text-slate-400 print:text-black">{p.category}</td>
                  <td className="py-2.5 px-3 text-slate-400 print:text-black">{p.supplier_country} → {p.destination_country}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-200 print:text-black">{p.quantity} {p.unit}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300 print:text-black">{formatPrice(p.cost_price, currentCurrency)}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400 print:text-black">{formatPrice(p.selling_price, currentCurrency)}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300 print:text-black">{p.expiry_date}</td>
                  <td className="py-2.5 px-3 text-slate-400 print:text-black">{p.warehouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 print:text-black">
          <span>Prepared by: {userSession.fullName} ({userSession.role})</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
