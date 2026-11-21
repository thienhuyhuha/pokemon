import React from 'react';
import { getGemStyle } from '../data/diamondLevels';
import { GemColorId, GemSpecial } from '../types/diamond';

interface DiamondArtworkProps {
  color: GemColorId;
  special?: GemSpecial;
  stone?: boolean;
  stoneHp?: number;
  className?: string;
}

/**
 * Multi-faceted luxury crystal vector artwork with crown/table/pavilion depth,
 * 7 distinct gemstone silhouettes, 2-layer armored Granite stones, and high-visibility specials.
 */
export const DiamondArtwork: React.FC<DiamondArtworkProps> = React.memo(
  ({
    color,
    special = 'NONE',
    stone = false,
    stoneHp = 1,
    className = 'w-full h-full',
  }) => {
    if (stone) {
      const isGranite = stoneHp >= 2;
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none pointer-events-none`}>
          <defs>
            <linearGradient id={isGranite ? 'graniteGrad' : 'stoneGrad'} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isGranite ? '#94A3B8' : '#64748B'} />
              <stop offset="48%" stopColor={isGranite ? '#475569' : '#334155'} />
              <stop offset="100%" stopColor={isGranite ? '#0F172A' : '#1E293B'} />
            </linearGradient>
          </defs>
          <polygon
            points="12,10 52,10 58,24 54,50 40,56 14,54 7,34"
            fill={`url(#${isGranite ? 'graniteGrad' : 'stoneGrad'})`}
            stroke={isGranite ? '#F59E0B' : '#0F172A'}
            strokeWidth={isGranite ? '3.2' : '2.8'}
            strokeLinejoin="round"
          />
          <polygon
            points="18,16 46,16 50,26 42,46 20,46 14,28"
            fill="none"
            stroke={isGranite ? '#FDE68A' : '#94A3B8'}
            strokeOpacity={isGranite ? '0.65' : '0.35'}
            strokeWidth="1.6"
          />
          {isGranite ? (
            <>
              <line x1="14" y1="22" x2="50" y2="44" stroke="#F59E0B" strokeWidth="2.4" strokeOpacity="0.8" strokeLinecap="round" />
              <line x1="48" y1="18" x2="18" y2="46" stroke="#F59E0B" strokeWidth="2.4" strokeOpacity="0.8" strokeLinecap="round" />
              <circle cx="32" cy="32" r="7" fill="#0F172A" stroke="#FACC15" strokeWidth="2" />
            </>
          ) : (
            <>
              <polyline
                points="15,24 27,29 35,20 47,27"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="20,38 30,45 43,35"
                fill="none"
                stroke="#0F172A"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>
      );
    }

    if (special === 'PRISM') {
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none pointer-events-none`}>
          <defs>
            <linearGradient id="prismGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="22%" stopColor="#FACC15" />
              <stop offset="48%" stopColor="#10B981" />
              <stop offset="75%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <polygon
            points="32,4 52,14 60,32 52,50 32,60 12,50 4,32 12,14"
            fill="url(#prismGrad)"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon
            points="32,11 46,20 51,32 46,44 32,53 18,44 13,32 18,20"
            fill="#FFFFFF"
            fillOpacity="0.22"
            stroke="#FFFFFF"
            strokeOpacity="0.7"
            strokeWidth="1.2"
          />
          <polygon
            points="32,9 37,25 55,32 37,39 32,55 27,39 9,32 27,25"
            fill="#FFFFFF"
            fillOpacity="0.94"
          />
          <circle cx="32" cy="32" r="6" fill="#FACC15" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );
    }

    const meta = getGemStyle(color);
    const gid = `gem-g-${color}`;
    const rid = `gem-rad-${color}`;

    const renderCut = () => {
      switch (color) {
        case 0: // Ruby Đỏ — Classic Brilliant Diamond Cut
          return (
            <>
              <polygon
                points="18,8 46,8 58,23 32,57 6,23"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.92"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="18,8 46,8 39,23 25,23" fill={meta.light} fillOpacity="0.78" />
              <polygon points="6,23 18,8 25,23" fill="#FFFFFF" fillOpacity="0.45" />
              <polygon points="58,23 46,8 39,23" fill={meta.dark} fillOpacity="0.28" />
              <polygon points="25,23 39,23 32,57" fill={`url(#${rid})`} fillOpacity="0.55" />
              <polygon points="6,23 25,23 32,57" fill={meta.dark} fillOpacity="0.38" />
              <line x1="6" y1="23" x2="58" y2="23" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.4" />
            </>
          );
        case 1: // Sapphire Lam — Royal Faceted Hexagon
          return (
            <>
              <polygon
                points="32,6 55,19 55,45 32,58 9,45 9,19"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.92"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="32,6 55,19 45,25 32,16" fill="#FFFFFF" fillOpacity="0.4" />
              <polygon points="32,6 9,19 19,25 32,16" fill={meta.light} fillOpacity="0.65" />
              <polygon
                points="32,16 45,25 45,39 32,48 19,39 19,25"
                fill={`url(#${rid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.65"
                strokeWidth="1.4"
              />
              <polygon points="32,48 45,39 55,45 32,58" fill={meta.dark} fillOpacity="0.45" />
            </>
          );
        case 2: // Emerald Lục — Step-Cut Octagonal Emerald
          return (
            <>
              <polygon
                points="17,8 47,8 56,17 56,47 47,56 17,56 8,47 8,17"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.92"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="17,8 47,8 42,17 22,17" fill="#FFFFFF" fillOpacity="0.4" />
              <polygon points="8,17 17,8 22,17 17,22" fill={meta.light} fillOpacity="0.7" />
              <polygon points="17,56 47,56 42,47 22,47" fill={meta.dark} fillOpacity="0.45" />
              <rect
                x="19"
                y="18"
                width="26"
                height="28"
                rx="3"
                fill={`url(#${rid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.72"
                strokeWidth="1.4"
              />
            </>
          );
        case 3: // Topaz Vàng — Imperial Marquise/Kite Crystal
          return (
            <>
              <polygon
                points="32,6 56,32 32,58 8,32"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.92"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="32,6 32,32 8,32" fill="#FFFFFF" fillOpacity="0.38" />
              <polygon points="32,58 56,32 32,32" fill={meta.dark} fillOpacity="0.38" />
              <polygon
                points="32,16 46,32 32,48 18,32"
                fill={`url(#${rid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.65"
                strokeWidth="1.3"
              />
              <line x1="32" y1="6" x2="32" y2="58" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.2" />
              <line x1="8" y1="32" x2="56" y2="32" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.2" />
            </>
          );
        case 4: // Amethyst Tím — Crowned Shield Trillion
          return (
            <>
              <polygon
                points="32,7 56,22 47,55 17,55 8,22"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.92"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="32,7 56,22 45,25 32,16" fill={meta.light} fillOpacity="0.58" />
              <polygon points="32,7 8,22 19,25 32,16" fill="#FFFFFF" fillOpacity="0.38" />
              <polygon
                points="32,16 45,25 40,46 24,46 19,25"
                fill={`url(#${rid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.65"
                strokeWidth="1.3"
              />
            </>
          );
        case 5: // Aqua Cyan — Faceted Teardrop Pear
          return (
            <>
              <path
                d="M32 7 C44 21 54 31 54 41.5 C54 51.5 44.5 58 32 58 C19.5 58 10 51.5 10 41.5 C10 31 20 21 32 7 Z"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.92"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="M32 15 C40 25 46 32 46 40 C46 47 40 51 32 51 C24 51 18 47 18 40 C18 32 24 25 32 15 Z"
                fill={`url(#${rid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />
              <ellipse cx="25" cy="36" rx="5.5" ry="9" fill="#FFFFFF" fillOpacity="0.34" />
            </>
          );
        default: // Rose Pink — Royal Cushion Star
          return (
            <>
              <polygon
                points="32,15 45,8 57,22 49,45 32,57 15,45 7,22 19,8"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.92"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="19,8 32,15 24,25 7,22" fill="#FFFFFF" fillOpacity="0.38" />
              <polygon
                points="32,22 42,16 48,26 32,47 16,26 22,16"
                fill={`url(#${rid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.65"
                strokeWidth="1.3"
              />
            </>
          );
      }
    };

    return (
      <svg viewBox="0 0 64 64" className={`${className} select-none pointer-events-none`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={meta.light} />
            <stop offset="46%" stopColor={meta.primary} />
            <stop offset="100%" stopColor={meta.dark} />
          </linearGradient>
          <radialGradient id={rid} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="45%" stopColor={meta.light} stopOpacity="0.45" />
            <stop offset="100%" stopColor={meta.dark} stopOpacity="0.25" />
          </radialGradient>
        </defs>

        {renderCut()}

        {/* Crisp 4-point diamond star glint */}
        <polygon points="22,13 23.5,17.5 28,19 23.5,20.5 22,25 20.5,20.5 16,19 20.5,17.5" fill="#FFFFFF" fillOpacity="0.92" />

        {/* Special Power-up Overlay */}
        {special === 'LINE_H' && (
          <g>
            <line x1="6" y1="32" x2="58" y2="32" stroke="#FEF08A" strokeWidth="5" strokeLinecap="round" />
            <line x1="8" y1="32" x2="56" y2="32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <polygon points="5,32 14,25 14,39" fill="#FFFFFF" />
            <polygon points="59,32 50,25 50,39" fill="#FFFFFF" />
          </g>
        )}
        {special === 'LINE_V' && (
          <g>
            <line x1="32" y1="6" x2="32" y2="58" stroke="#FEF08A" strokeWidth="5" strokeLinecap="round" />
            <line x1="32" y1="8" x2="32" y2="56" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <polygon points="32,5 25,14 39,14" fill="#FFFFFF" />
            <polygon points="32,59 25,50 39,50" fill="#FFFFFF" />
          </g>
        )}
        {special === 'BOMB' && (
          <g>
            <circle cx="32" cy="32" r="12" fill="#0F172A" fillOpacity="0.78" stroke="#FACC15" strokeWidth="2.5" />
            <polygon points="32,22 35,29 42,32 35,35 32,42 29,35 22,32 29,29" fill="#FEF08A" />
          </g>
        )}
      </svg>
    );
  }
);

DiamondArtwork.displayName = 'DiamondArtwork';
