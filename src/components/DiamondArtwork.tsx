import React from 'react';
import { getGemStyle } from '../data/diamondLevels';
import { GemColorId, GemSpecial } from '../types/diamond';

interface DiamondArtworkProps {
  color: GemColorId;
  special?: GemSpecial;
  stone?: boolean;
  className?: string;
}

/**
 * Custom crisp SVG faceted gems with 7 distinct crystal cuts + silhouettes
 * so every diamond is instantly distinguishable even in grayscale or colorblindness,
 * and loads 100% offline with zero network dependency.
 */
export const DiamondArtwork: React.FC<DiamondArtworkProps> = React.memo(
  ({ color, special = 'NONE', stone = false, className = 'w-full h-full' }) => {
    if (stone) {
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none pointer-events-none`}>
          <defs>
            <linearGradient id="stoneGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
          <polygon
            points="14,10 50,10 58,24 54,50 40,56 16,54 8,36"
            fill="url(#stoneGrad)"
            stroke="#0F172A"
            strokeWidth="3"
          />
          <polyline
            points="16,24 28,28 34,20 46,28"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="22,38 30,44 42,36"
            fill="none"
            stroke="#1E293B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (special === 'PRISM') {
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none pointer-events-none`}>
          <defs>
            <linearGradient id="prismGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="25%" stopColor="#FACC15" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="75%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="24" fill="url(#prismGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
          <polygon
            points="32,10 38,26 54,32 38,38 32,54 26,38 10,32 26,26"
            fill="#FFFFFF"
            fillOpacity="0.92"
          />
          <circle cx="32" cy="32" r="6" fill="#FACC15" />
        </svg>
      );
    }

    const meta = getGemStyle(color);
    const gid = `gem-g-${color}`;

    const renderCut = () => {
      switch (color) {
        case 0: // Ruby Đỏ — Classic Octagonal Brilliant
          return (
            <>
              <polygon
                points="20,10 44,10 56,24 32,56 8,24"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.85"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="20,10 44,10 39,24 25,24" fill={meta.light} fillOpacity="0.65" />
              <polygon points="25,24 39,24 32,56" fill={meta.dark} fillOpacity="0.35" />
              <line x1="8" y1="24" x2="56" y2="24" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.5" />
            </>
          );
        case 1: // Sapphire Lam — Royal Hexagon
          return (
            <>
              <polygon
                points="32,7 54,20 54,44 32,57 10,44 10,20"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.85"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon
                points="32,16 44,24 44,40 32,48 20,40 20,24"
                fill={meta.light}
                fillOpacity="0.5"
                stroke="#FFFFFF"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />
            </>
          );
        case 2: // Emerald Lục — Emerald Step-Cut Rectangle
          return (
            <>
              <polygon
                points="18,9 46,9 54,17 54,47 46,55 18,55 10,47 10,17"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.85"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <rect
                x="19"
                y="18"
                width="26"
                height="28"
                rx="3"
                fill={meta.light}
                fillOpacity="0.48"
                stroke="#FFFFFF"
                strokeOpacity="0.6"
                strokeWidth="1.3"
              />
            </>
          );
        case 3: // Topaz Vàng — Kite Diamond
          return (
            <>
              <polygon
                points="32,7 55,32 32,57 9,32"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.85"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="32,16 46,32 32,48 18,32" fill={meta.light} fillOpacity="0.55" />
              <line x1="32" y1="7" x2="32" y2="57" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.2" />
              <line x1="9" y1="32" x2="55" y2="32" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.2" />
            </>
          );
        case 4: // Amethyst Tím — Pentagonal Shield Crystal
          return (
            <>
              <polygon
                points="32,8 55,22 46,54 18,54 9,22"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.85"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="32,16 45,25 40,46 24,46 19,25" fill={meta.light} fillOpacity="0.5" />
            </>
          );
        case 5: // Aqua Cyan — Teardrop Pear Cut
          return (
            <>
              <path
                d="M32 8 C43 22 53 31 53 41 C53 51 44 57 32 57 C20 57 11 51 11 41 C11 31 21 22 32 8 Z"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.85"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <ellipse cx="26" cy="36" rx="7" ry="11" fill={meta.light} fillOpacity="0.52" />
            </>
          );
        default: // Rose Pink — Cushion Heart-Star
          return (
            <>
              <polygon
                points="32,16 44,9 56,22 48,44 32,56 16,44 8,22 20,9"
                fill={`url(#${gid})`}
                stroke="#FFFFFF"
                strokeOpacity="0.85"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <polygon points="32,23 41,17 47,26 32,46 17,26 23,17" fill={meta.light} fillOpacity="0.52" />
            </>
          );
      }
    };

    return (
      <svg viewBox="0 0 64 64" className={`${className} select-none pointer-events-none`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={meta.light} />
            <stop offset="45%" stopColor={meta.primary} />
            <stop offset="100%" stopColor={meta.dark} />
          </linearGradient>
        </defs>

        {renderCut()}

        {/* Crisp specular highlight glint */}
        <circle cx="23" cy="20" r="3" fill="#FFFFFF" fillOpacity="0.8" />

        {/* Special Power-up Overlay */}
        {special === 'LINE_H' && (
          <g>
            <line x1="6" y1="32" x2="58" y2="32" stroke="#FEF08A" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="6,32 14,26 14,38" fill="#FFFFFF" />
            <polygon points="58,32 50,26 50,38" fill="#FFFFFF" />
          </g>
        )}
        {special === 'LINE_V' && (
          <g>
            <line x1="32" y1="6" x2="32" y2="58" stroke="#FEF08A" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="32,6 26,14 38,14" fill="#FFFFFF" />
            <polygon points="32,58 26,50 38,50" fill="#FFFFFF" />
          </g>
        )}
        {special === 'BOMB' && (
          <g>
            <circle cx="32" cy="32" r="11" fill="#0F172A" fillOpacity="0.68" stroke="#FACC15" strokeWidth="2.5" />
            <polygon points="32,23 35,29 41,32 35,35 32,41 29,35 23,32 29,29" fill="#FEF08A" />
          </g>
        )}
      </svg>
    );
  }
);

DiamondArtwork.displayName = 'DiamondArtwork';
