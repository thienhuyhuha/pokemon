import React from 'react';

/**
 * Biểu tượng Khiên & Cổng Thành độc quyền cho game Thủ Thành Vệ Thành Quái Thú.
 */
export const CastleShieldLogo: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Khiên và Cổng Thành"
  >
    <defs>
      <linearGradient id="cslShieldBg" x1="12" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="55%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#1E1B4B" />
      </linearGradient>
      <linearGradient id="cslGoldTrim" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="cslGateStone" x1="20" y1="18" x2="44" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
    </defs>

    {/* Outer Shield Frame */}
    <path
      d="M32 4 L54 12 V30 C54 44.5 44.2 54.8 32 60 C19.8 54.8 10 44.5 10 30 V12 L32 4 Z"
      fill="url(#cslShieldBg)"
      stroke="url(#cslGoldTrim)"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* Inner Shield Accent */}
    <path
      d="M32 8.2 L50 14.8 V29.6 C50 42 41.8 50.8 32 55.4 C22.2 50.8 14 42 14 29.6 V14.8 L32 8.2 Z"
      fill="none"
      stroke="#38BDF8"
      strokeWidth="1.2"
      strokeOpacity="0.45"
    />

    {/* Side Castle Towers */}
    <rect x="17.5" y="23" width="6.5" height="21" rx="1" fill="#475569" stroke="#0F172A" strokeWidth="1.2" />
    <rect x="40" y="23" width="6.5" height="21" rx="1" fill="#475569" stroke="#0F172A" strokeWidth="1.2" />
    <polygon points="16.5,23 20.75,16.5 25,23" fill="#DC2626" stroke="#FACC15" strokeWidth="1" />
    <polygon points="39,23 43.25,16.5 47.5,23" fill="#DC2626" stroke="#FACC15" strokeWidth="1" />

    {/* Center Keep & Battlements */}
    <rect x="23" y="20" width="18" height="25" rx="1.5" fill="url(#cslGateStone)" stroke="#0F172A" strokeWidth="1.4" />
    <rect x="23" y="16.5" width="4.5" height="4.5" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
    <rect x="29.75" y="16.5" width="4.5" height="4.5" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
    <rect x="36.5" y="16.5" width="4.5" height="4.5" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />

    {/* Arched Castle Gate & Portcullis Bars */}
    <path
      d="M26.5 45 V33.5 C26.5 29.4 37.5 29.4 37.5 33.5 V45 Z"
      fill="#0F172A"
      stroke="#FACC15"
      strokeWidth="1.8"
    />
    <line x1="29.5" y1="31.2" x2="29.5" y2="44.5" stroke="#94A3B8" strokeWidth="1.1" />
    <line x1="34.5" y1="31.2" x2="34.5" y2="44.5" stroke="#94A3B8" strokeWidth="1.1" />
    <line x1="27" y1="36.5" x2="37" y2="36.5" stroke="#94A3B8" strokeWidth="1.1" />
    <line x1="27" y1="40.8" x2="37" y2="40.8" stroke="#94A3B8" strokeWidth="1.1" />

    {/* Crown / Star Gem on Shield Peak */}
    <polygon
      points="32,9.5 34,13 32,16.5 30,13"
      fill="#FACC15"
      stroke="#FEF08A"
      strokeWidth="0.8"
    />
  </svg>
);
