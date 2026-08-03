import React from 'react';

interface CountryFlagProps {
  country?: string;
  countryName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const countrySlugMap: Record<string, string> = {
  'Turkey': 'turkey',
  'Morocco': 'morocco',
  'Tunisia': 'tunisia',
  'Brazil': 'brazil',
  'China': 'china',
  'Thailand': 'thailand',
  'Belgium': 'belgium',
  'Belgika': 'belgium',
  'Mali': 'mali',
  'Burkina Faso': 'burkina_faso',
  "Côte d'Ivoire": 'cote_divoire',
  'Angola': 'angola'
};

const countryEmojiMap: Record<string, string> = {
  'Turkey': '🇹🇷',
  'Morocco': '🇲🇦',
  'Tunisia': '🇹🇳',
  'Brazil': '🇧🇷',
  'China': '🇨🇳',
  'Thailand': '🇹🇭',
  'Belgium': '🇧🇪',
  'Belgika': '🇧🇪',
  'Mali': '🇲🇱',
  'Burkina Faso': '🇧🇫',
  "Côte d'Ivoire": '🇨🇮',
  'Angola': '🇦🇴'
};

export const CountryFlag: React.FC<CountryFlagProps> = ({ country, countryName, className = '', size = 'md' }) => {
  const targetCountry = country || countryName || 'Mali';
  const slug = countrySlugMap[targetCountry] || 'mali';
  const emoji = countryEmojiMap[targetCountry] || '🇲🇱';

  let dimensions = 'h-4 w-6';
  if (size === 'sm') dimensions = 'h-3.5 w-5';
  if (size === 'lg') dimensions = 'h-6 w-9';

  return (
    <span className="inline-flex items-center">
      <img
        src={`/flags/${slug}.svg`}
        onError={(e) => {
          // If flag image fails to load, replace element with emoji text
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            parent.innerHTML = `<span className="text-sm">${emoji}</span>`;
          }
        }}
        alt={`${targetCountry} flag`}
        className={`inline-block object-cover rounded shadow-sm border border-slate-700/50 ${dimensions} ${className}`}
      />
    </span>
  );
};
