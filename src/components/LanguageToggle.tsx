import React from 'react';
import { Globe } from 'lucide-react';
import { LanguageCode } from '../types';

interface LanguageToggleProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
          currentLanguage === 'en'
            ? 'bg-amber-500 text-slate-950 shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span className="hidden sm:inline">EN</span>
      </button>

      <button
        type="button"
        onClick={() => onLanguageChange('fr')}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
          currentLanguage === 'fr'
            ? 'bg-amber-500 text-slate-950 shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Français"
      >
        <span>🇫🇷</span>
        <span className="hidden sm:inline">FR</span>
      </button>
    </div>
  );
};
