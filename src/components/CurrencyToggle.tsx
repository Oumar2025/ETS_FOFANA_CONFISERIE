import React from 'react';
import { DollarSign } from 'lucide-react';
import { CurrencyCode } from '../types';

interface CurrencyToggleProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ currentCurrency, onCurrencyChange }) => {
  return (
    <div className="relative inline-block">
      <select
        value={currentCurrency}
        onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
        className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-mono focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm hover:border-slate-700 transition"
      >
        <option value="USD">USD ($)</option>
        <option value="FCFA">FCFA (XOF)</option>
        <option value="EUR">EUR (€)</option>
        <option value="TRY">TRY (₺)</option>
      </select>
    </div>
  );
};
