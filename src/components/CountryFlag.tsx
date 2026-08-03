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
  'Mali': 'mali',
  'Burkina Faso': 'burkina_faso',
  "Côte d'Ivoire": 'cote_divoire',
  'Angola': 'angola'
};

export const CountryFlag: React.FC<CountryFlagProps> = ({ country, countryName, className = '', size = 'md' }) => {
  const targetCountry = country || countryName || 'Mali';
  const slug = countrySlugMap[targetCountry] || 'mali';

  let dimensions = 'h-4 w-6';
  if (size === 'sm') dimensions = 'h-3.5 w-5';
  if (size === 'lg') dimensions = 'h-6 w-9';

  return (
    <img
      src={`/flags/${slug}.svg`}
      onError={(e) => {
        // Fallback to .png if .svg is not found
        (e.target as HTMLImageElement).src = `/flags/${slug}.png`;
      }}
      alt={`${targetCountry} flag`}
      className={`inline-block object-cover rounded shadow-sm border border-slate-700/50 ${dimensions} ${className}`}
    />
  );
};
