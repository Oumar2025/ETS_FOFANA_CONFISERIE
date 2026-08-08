import React from 'react';

interface CountryFlagProps {
  country?: string;
  countryName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

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

const countryFlagSvgMap: Record<string, string> = {
  'Turkey': 'https://flagcdn.com/w40/tr.png',
  'Morocco': 'https://flagcdn.com/w40/ma.png',
  'Tunisia': 'https://flagcdn.com/w40/tn.png',
  'Brazil': 'https://flagcdn.com/w40/br.png',
  'China': 'https://flagcdn.com/w40/cn.png',
  'Thailand': 'https://flagcdn.com/w40/th.png',
  'Belgium': 'https://flagcdn.com/w40/be.png',
  'Belgika': 'https://flagcdn.com/w40/be.png',
  'Mali': 'https://flagcdn.com/w40/ml.png',
  'Burkina Faso': 'https://flagcdn.com/w40/bf.png',
  "Côte d'Ivoire": 'https://flagcdn.com/w40/ci.png',
  'Angola': 'https://flagcdn.com/w40/ao.png'
};

export const CountryFlag: React.FC<CountryFlagProps> = ({ country, countryName, className = '', size = 'md' }) => {
  const targetCountry = country || countryName || 'Mali';
  const emoji = countryEmojiMap[targetCountry] || '🇲🇱';
  const flagUrl = countryFlagSvgMap[targetCountry] || 'https://flagcdn.com/w40/ml.png';

  let dimensions = 'h-4 w-6';
  let emojiSize = 'text-sm';
  if (size === 'sm') { dimensions = 'h-3.5 w-5'; emojiSize = 'text-xs'; }
  if (size === 'lg') { dimensions = 'h-5 w-7'; emojiSize = 'text-base'; }

  return (
    <span className="inline-flex items-center shrink-0 space-x-1">
      <img
        src={flagUrl}
        alt={`${targetCountry} flag`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
        className={`inline-block object-cover rounded shadow border border-slate-700/60 ${dimensions} ${className}`}
      />
      <span className={`${emojiSize} leading-none font-normal select-none`}>{emoji}</span>
    </span>
  );
};
