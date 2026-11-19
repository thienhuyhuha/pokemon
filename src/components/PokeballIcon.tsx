import React from 'react';

interface PokeballIconProps {
  variant?: 'poke' | 'great' | 'ultra' | 'master';
  className?: string;
}

/**
 * Original 70%-inspired Star Catch Orb emblem (distinct from trademarked Pokéball).
 */
export const PokeballIcon: React.FC<PokeballIconProps> = ({
  variant = 'poke',
  className = 'w-6 h-6',
}) => {
  const topColor =
    variant === 'great'
      ? '#2563EB'
      : variant === 'ultra'
        ? '#0F172A'
        : variant === 'master'
          ? '#7E22CE'
          : '#DC2626';

  const gemColor =
    variant === 'master' ? '#F472B6' : variant === 'ultra' ? '#FACC15' : '#FDE047';

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polygon
        points="32,4 58,18 58,46 32,60 6,46 6,18"
        fill="#F8FAFC"
        stroke="#0F172A"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <polygon
        points="32,4 58,18 58,32 6,32 6,18"
        fill={topColor}
        stroke="#0F172A"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="6" y="29" width="52" height="6" fill="#0F172A" />
      <polygon
        points="32,19 36,28 45,32 36,36 32,45 28,36 19,32 28,28"
        fill={gemColor}
        stroke="#0F172A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
};
