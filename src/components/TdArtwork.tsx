import React from 'react';
import { getMythicPathConfig, TD_MYTHIC_PATHS } from '../data/tdLevels';
import {
  TdBranchId,
  TdEnemyType,
  TdMapLandmark,
  TdMythicPathId,
  TdTowerLevel,
  TdTowerType,
} from '../types/towerDefense';
import {
  resolveEnemyAnimeKey,
  resolveGuardAnimeKey,
  resolveHeroAnimeKey,
  useTdAnimeSprite,
} from '../utils/tdAnimeSprites';

export const TdSharedArtworkDefs: React.FC = () => (
  <defs>
    {/* Shared Metallic & Elemental Gradients */}
    <linearGradient id="tdGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FEF9C3" />
      <stop offset="45%" stopColor="#FACC15" />
      <stop offset="100%" stopColor="#92400E" />
    </linearGradient>
    <linearGradient id="tdSteelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="45%" stopColor="#CBD5E1" />
      <stop offset="100%" stopColor="#334155" />
    </linearGradient>
    <linearGradient id="tdDarkIronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#64748B" />
      <stop offset="50%" stopColor="#1E293B" />
      <stop offset="100%" stopColor="#020617" />
    </linearGradient>
    <linearGradient id="tdBronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FDE68A" />
      <stop offset="50%" stopColor="#D97706" />
      <stop offset="100%" stopColor="#451A03" />
    </linearGradient>
    <linearGradient id="tdSkinWarmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#FEF3C7" />
      <stop offset="65%" stopColor="#FCD34D" />
      <stop offset="100%" stopColor="#D97706" />
    </linearGradient>
    <radialGradient id="tdFrostOrbGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="45%" stopColor="#7DD3FC" />
      <stop offset="100%" stopColor="#0369A1" />
    </radialGradient>
    <radialGradient id="tdArcaneOrbGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="45%" stopColor="#F472B6" />
      <stop offset="100%" stopColor="#6B21A8" />
    </radialGradient>
    <linearGradient id="tdSolarWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FEF9C3" />
      <stop offset="50%" stopColor="#FACC15" />
      <stop offset="100%" stopColor="#C2410C" />
    </linearGradient>
    <linearGradient id="tdFrostWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F0F9FF" />
      <stop offset="50%" stopColor="#38BDF8" />
      <stop offset="100%" stopColor="#1E3A8A" />
    </linearGradient>
    <linearGradient id="tdShadowScarfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FB7185" />
      <stop offset="100%" stopColor="#881337" />
    </linearGradient>

    {/* Pedestal Architectural Gradients */}
    <linearGradient id="tdPedestalStoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#94A3B8" />
      <stop offset="45%" stopColor="#475569" />
      <stop offset="100%" stopColor="#1E293B" />
    </linearGradient>
    <linearGradient id="tdPedestalWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#B45309" />
      <stop offset="55%" stopColor="#78350F" />
      <stop offset="100%" stopColor="#451A03" />
    </linearGradient>
    <linearGradient id="tdPedestalObsidianGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#4C1D95" />
      <stop offset="55%" stopColor="#1E1B4B" />
      <stop offset="100%" stopColor="#090D16" />
    </linearGradient>
    <linearGradient id="tdPedestalEmeraldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#15803D" />
      <stop offset="55%" stopColor="#14532D" />
      <stop offset="100%" stopColor="#052E16" />
    </linearGradient>
    <linearGradient id="tdPedestalCobaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#0284C7" />
      <stop offset="55%" stopColor="#1E3A8A" />
      <stop offset="100%" stopColor="#0F172A" />
    </linearGradient>
    <linearGradient id="tdPedestalCrimsonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#DC2626" />
      <stop offset="55%" stopColor="#7F1D1D" />
      <stop offset="100%" stopColor="#2A0A0A" />
    </linearGradient>

    {/* Organic Monster Cel-Shaded Gradients */}
    <linearGradient id="tdGoblinSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#86EFAC" />
      <stop offset="55%" stopColor="#22C55E" />
      <stop offset="100%" stopColor="#14532D" />
    </linearGradient>
    <linearGradient id="tdWolfFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#94A3B8" />
      <stop offset="55%" stopColor="#475569" />
      <stop offset="100%" stopColor="#0F172A" />
    </linearGradient>
    <linearGradient id="tdSpiderChitinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#65A30D" />
      <stop offset="55%" stopColor="#365314" />
      <stop offset="100%" stopColor="#090D16" />
    </linearGradient>
    <linearGradient id="tdOrcSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#A3E635" />
      <stop offset="55%" stopColor="#4D7C0F" />
      <stop offset="100%" stopColor="#1A2E05" />
    </linearGradient>
    <linearGradient id="tdOrcArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#B45309" />
      <stop offset="55%" stopColor="#7C2D12" />
      <stop offset="100%" stopColor="#290D04" />
    </linearGradient>
    <linearGradient id="tdGolemRockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#94A3B8" />
      <stop offset="50%" stopColor="#475569" />
      <stop offset="100%" stopColor="#1E293B" />
    </linearGradient>
    <linearGradient id="tdWyvernScaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#C084FC" />
      <stop offset="50%" stopColor="#7E22CE" />
      <stop offset="100%" stopColor="#3B0764" />
    </linearGradient>
    <linearGradient id="tdHarpyPlumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FDA4AF" />
      <stop offset="50%" stopColor="#E11D48" />
      <stop offset="100%" stopColor="#4C0519" />
    </linearGradient>
    <linearGradient id="tdShamanRobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2DD4BF" />
      <stop offset="50%" stopColor="#0F766E" />
      <stop offset="100%" stopColor="#042F2E" />
    </linearGradient>
    <linearGradient id="tdNecroRobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#9333EA" />
      <stop offset="50%" stopColor="#3B0764" />
      <stop offset="100%" stopColor="#090D16" />
    </linearGradient>
    <linearGradient id="tdDarkKnightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#64748B" />
      <stop offset="45%" stopColor="#1E293B" />
      <stop offset="100%" stopColor="#020617" />
    </linearGradient>
    <linearGradient id="tdMiniBossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F59E0B" />
      <stop offset="50%" stopColor="#9A3412" />
      <stop offset="100%" stopColor="#451A03" />
    </linearGradient>
    <linearGradient id="tdBossArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#EF4444" />
      <stop offset="50%" stopColor="#7F1D1D" />
      <stop offset="100%" stopColor="#1E0505" />
    </linearGradient>
    <radialGradient id="tdBossMagmaGrad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#FEF08A" />
      <stop offset="50%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#B91C1C" />
    </radialGradient>
    <linearGradient id="tdBoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="65%" stopColor="#E2E8F0" />
      <stop offset="100%" stopColor="#94A3B8" />
    </linearGradient>
  </defs>
);

interface TdTowerSpriteProps {
  type: TdTowerType;
  level: TdTowerLevel;
  branch: TdBranchId | null;
  mythicPath?: TdMythicPathId | null;
  facingAngle?: number;
  recoil?: number;
  windup?: number;
}

/**
 * Architectural Bastion Pedestal that visibly evolves from Lv1 Timber/Stone Outpost ->
 * Lv2 Fortified Masonry Rampart -> Lv3 Royal Citadel Dais -> Lv4-7 Mythic Grand Shrine.
 */
function renderHeroPedestal(
  type: TdTowerType,
  level: TdTowerLevel,
  branch: TdBranchId | null,
  mythicAccent?: string | null
) {
  let bodyFill = 'url(#tdPedestalStoneGrad)';
  let trimColor = '#FACC15';
  let auraColor = mythicAccent ?? '#FACC15';

  if (type === 'ARCHER') {
    bodyFill =
      branch === 'RANGER_POISON'
        ? 'url(#tdPedestalEmeraldGrad)'
        : branch === 'SNIPER_CRIT'
          ? 'url(#tdPedestalCrimsonGrad)'
          : level === 1
            ? 'url(#tdPedestalWoodGrad)'
            : 'url(#tdPedestalEmeraldGrad)';
    trimColor = branch === 'RANGER_POISON' ? '#4ADE80' : branch === 'SNIPER_CRIT' ? '#FACC15' : '#A3E635';
    auraColor = trimColor;
  } else if (type === 'BARRACKS') {
    bodyFill =
      branch === 'PALADIN'
        ? 'url(#tdPedestalCobaltGrad)'
        : branch === 'BARBARIAN'
          ? 'url(#tdPedestalCrimsonGrad)'
          : 'url(#tdPedestalCobaltGrad)';
    trimColor = branch === 'PALADIN' ? '#FACC15' : branch === 'BARBARIAN' ? '#FB7185' : '#60A5FA';
    auraColor = trimColor;
  } else if (type === 'MAGE') {
    bodyFill = 'url(#tdPedestalObsidianGrad)';
    trimColor = branch === 'STORM_CHAIN' ? '#38BDF8' : branch === 'ARCANE_BEAM' ? '#67E8F9' : '#C084FC';
    auraColor = trimColor;
  } else if (type === 'ARTILLERY') {
    bodyFill = branch === 'TESLA_COIL' ? 'url(#tdPedestalCobaltGrad)' : 'url(#tdPedestalStoneGrad)';
    trimColor = branch === 'TESLA_COIL' ? '#38BDF8' : '#FB923C';
    auraColor = trimColor;
  } else if (type === 'ASSASSIN') {
    bodyFill = branch === 'VENOM_FANG' ? 'url(#tdPedestalEmeraldGrad)' : 'url(#tdPedestalObsidianGrad)';
    trimColor = branch === 'VENOM_FANG' ? '#4ADE80' : branch === 'SHADOW_BLADE' ? '#FACC15' : '#F43F5E';
    auraColor = trimColor;
  } else if (type === 'VALKYRIE') {
    bodyFill = branch === 'FROST_VALKYRIE' ? 'url(#tdPedestalCobaltGrad)' : 'url(#tdPedestalCrimsonGrad)';
    trimColor = branch === 'FROST_VALKYRIE' ? '#7DD3FC' : '#FEF08A';
    auraColor = trimColor;
  } else if (type === 'KNIGHT_GUARD') {
    bodyFill = branch === 'AEGIS_WARDEN' ? 'url(#tdPedestalCobaltGrad)' : 'url(#tdPedestalCrimsonGrad)';
    trimColor = branch === 'AEGIS_WARDEN' ? '#38BDF8' : '#FB923C';
    auraColor = trimColor;
  } else if (type === 'PYROMANCER') {
    bodyFill = 'url(#tdPedestalCrimsonGrad)';
    trimColor = branch === 'PHOENIX_SAGE' ? '#FACC15' : '#F97316';
    auraColor = trimColor;
  } else if (type === 'MECHANIST') {
    bodyFill = 'url(#tdPedestalStoneGrad)';
    trimColor = branch === 'ROCKET_BATTERY' ? '#FACC15' : '#38BDF8';
    auraColor = trimColor;
  } else if (type === 'CHRONOMANCER') {
    bodyFill = 'url(#tdPedestalObsidianGrad)';
    trimColor = branch === 'VOID_SOVEREIGN' ? '#F43F5E' : '#C084FC';
    auraColor = trimColor;
  }

  return (
    <g>
      {/* Ground Ambient Shadow */}
      <ellipse cx="0" cy="16.5" rx={level >= 3 ? 25 : 22} ry={level >= 3 ? 8.5 : 7.5} fill="#020617" opacity="0.58" />

      {/* Outer Stepped Foundation Ring (Lv2+) */}
      {level >= 2 && (
        <path
          d="M-23,12.5 C-23,6.5 23,6.5 23,12.5 C23,19.5 -23,19.5 -23,12.5 Z"
          fill="#0F172A"
          stroke={trimColor}
          strokeWidth={level >= 4 ? '1.6' : '1'}
          opacity="0.92"
        />
      )}

      {/* Sculpted Beveled Citadel Bastion Base */}
      <path
        d="M-20,10 C-20,5 20,5 20,10 L18.5,15.5 C10,18.5 -10,18.5 -18.5,15.5 Z"
        fill={bodyFill}
        stroke="#0F172A"
        strokeWidth="1.6"
      />

      {/* Top Platform Deck */}
      <ellipse cx="0" cy="9.2" rx="19.2" ry="6.2" fill={bodyFill} stroke={trimColor} strokeWidth="1.3" />
      <ellipse cx="0" cy="8.8" rx="15.5" ry="4.4" fill="none" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.35" />

      {/* Carved Masonry / Armor Plates along Bastion Wall */}
      <path d="M-13,12 L-12.5,16 M-5,13 L-5,17 M5,13 L5,17 M13,12 L12.5,16" stroke="#0F172A" strokeWidth="1.2" opacity="0.75" />

      {/* Front Center Crest Medallion */}
      <path
        d="M-4,11.5 L4,11.5 L3,16 L0,18 L-3,16 Z"
        fill="url(#tdGoldGrad)"
        stroke="#0F172A"
        strokeWidth="1"
      />
      <circle cx="0" cy="14" r="1.4" fill={auraColor} />

      {/* Lv2+: Flanking Stone Battlement Crenellations */}
      {level >= 2 && (
        <>
          <path d="M-21,9 L-21,2.5 L-15.5,2.5 L-15.5,9 Z" fill={bodyFill} stroke="#0F172A" strokeWidth="1.2" />
          <path d="M-21.5,2.5 L-15,2.5" stroke={trimColor} strokeWidth="1.4" />
          <path d="M15.5,9 L15.5,2.5 L21,2.5 L21,9 Z" fill={bodyFill} stroke="#0F172A" strokeWidth="1.2" />
          <path d="M15,2.5 L21.5,2.5" stroke={trimColor} strokeWidth="1.4" />
        </>
      )}

      {/* Lv3+: Twin Glowing Brazier / Rune Pylons flanking the Squad */}
      {level >= 3 && (
        <>
          <path d="M-20.5,2.5 L-18.5,-4 L-16,-4 L-15,2.5 Z" fill="url(#tdDarkIronGrad)" stroke="#0F172A" strokeWidth="1" />
          <circle cx="-17.5" cy="-5.2" r="2.6" fill={auraColor} className="td-anim-glow" />
          <circle cx="-17.5" cy="-5.5" r="1.1" fill="#FFFFFF" />

          <path d="M15,2.5 L16,-4 L18.5,-4 L20.5,2.5 Z" fill="url(#tdDarkIronGrad)" stroke="#0F172A" strokeWidth="1" />
          <circle cx="17.5" cy="-5.2" r="2.6" fill={auraColor} className="td-anim-glow" />
          <circle cx="17.5" cy="-5.5" r="1.1" fill="#FFFFFF" />
        </>
      )}

      {/* Lv4+ Branch Shrine Architectural Crown */}
      {level >= 4 && (
        <g>
          {/* Radiant Ground Aura */}
          <ellipse cx="0" cy="9.5" rx="22.5" ry="7.4" fill="none" stroke={auraColor} strokeWidth="1.5" strokeDasharray="5 3" className="td-anim-glow" />
          {/* Twin Royal Standards or Crystal Spires */}
          {type === 'MAGE' || type === 'VALKYRIE' || type === 'PYROMANCER' || type === 'CHRONOMANCER' ? (
            <>
              <polygon points="-21,-5 -17.5,-14 -14,-5 -17.5,-2" fill={auraColor} stroke="#FFFFFF" strokeWidth="0.9" className="td-anim-orb" />
              <polygon points="14,-5 17.5,-14 21,-5 17.5,-2" fill={auraColor} stroke="#FFFFFF" strokeWidth="0.9" className="td-anim-orb" />
            </>
          ) : type === 'ARTILLERY' || type === 'MECHANIST' ? (
            <>
              <path d="M-22,6 L-24,-3 L-18,-3 Z" fill="url(#tdBronzeGrad)" stroke="#0F172A" strokeWidth="1" />
              <path d="M22,6 L24,-3 L18,-3 Z" fill="url(#tdBronzeGrad)" stroke="#0F172A" strokeWidth="1" />
            </>
          ) : (
            <>
              <path d="M-19,2 L-22,-11 L-15,-8 Z" fill={trimColor} stroke="#0F172A" strokeWidth="1" opacity="0.92" />
              <path d="M19,2 L22,-11 L15,-8 Z" fill={trimColor} stroke="#0F172A" strokeWidth="1" opacity="0.92" />
            </>
          )}
        </g>
      )}

      {/* Lv10+ Imperial & Mythic Ascension Pillars */}
      {level >= 10 && (
        <g>
          <path d="M-24,8 L-27,-8 L-21,-5 L-19,8 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1.1" />
          <path d="M24,8 L27,-8 L21,-5 L19,8 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1.1" />
          <ellipse
            cx="0"
            cy="11"
            rx="26.5"
            ry="9.2"
            fill="none"
            stroke={auraColor}
            strokeWidth={level >= 11 ? '2' : '1.4'}
            opacity="0.9"
          />
        </g>
      )}
    </g>
  );
}

/**
 * 4 drastically distinct visual transformations for Lv10 -> Lv11+ Mythic Evolutions
 * so every specialization looks noticeably different and awesome in both preview and combat.
 */
function renderMythicFormBack(variantIndex: number, accentColor: string) {
  if (variantIndex === 0) {
    // Form 0: Seraphic Cyber-Bladed Energy Wings
    return (
      <g className="pointer-events-none">
        <g className="td-anim-wing">
          <path
            d="M-6,-18 C-18,-36 -33,-41 -39,-31 C-32,-23 -30,-17 -37,-10 C-27,-11 -18,-9 -8,-12 Z"
            fill={accentColor}
            fillOpacity="0.48"
            stroke="#FFFFFF"
            strokeWidth="1.3"
          />
          <path
            d="M-5,-16 C-15,-29 -27,-33 -32,-25 C-26,-19 -24,-15 -29,-10 C-21,-10 -14,-9 -7,-12 Z"
            fill={accentColor}
            opacity="0.88"
          />
          <path
            d="M6,-18 C18,-36 33,-41 39,-31 C32,-23 30,-17 37,-10 C27,-11 18,-9 8,-12 Z"
            fill={accentColor}
            fillOpacity="0.48"
            stroke="#FFFFFF"
            strokeWidth="1.3"
          />
          <path
            d="M5,-16 C15,-29 27,-33 32,-25 C26,-19 24,-15 29,-10 C21,-10 14,-9 7,-12 Z"
            fill={accentColor}
            opacity="0.88"
          />
        </g>
      </g>
    );
  }

  if (variantIndex === 1) {
    // Form 1: Imperial Crossed Giant Relic Blades + Horned Crown Crest
    return (
      <g className="pointer-events-none">
        <g opacity="0.94">
          <path d="M-23,-40 L-17,-43 L16,4 L12,7 Z" fill="url(#tdSteelGrad)" stroke={accentColor} strokeWidth="1.3" />
          <path d="M23,-40 L17,-43 L-16,4 L-12,7 Z" fill="url(#tdSteelGrad)" stroke={accentColor} strokeWidth="1.3" />
          <polygon points="-24,-41 -29,-47 -18,-44" fill={accentColor} stroke="#FFFFFF" strokeWidth="0.9" />
          <polygon points="24,-41 29,-47 18,-44" fill={accentColor} stroke="#FFFFFF" strokeWidth="0.9" />
        </g>
        <path
          d="M-12,-41 L-7,-49 L0,-43 L7,-49 L12,-41 L7,-37 L-7,-37 Z"
          fill="url(#tdGoldGrad)"
          stroke={accentColor}
          strokeWidth="1.3"
          className="td-anim-glow"
        />
      </g>
    );
  }

  if (variantIndex === 2) {
    // Form 2: Elemental Double-Helix Shock Rings + Twin Hovering Drone Familiars
    return (
      <g className="pointer-events-none">
        <g transform="translate(0, -18) rotate(-24)">
          <ellipse cx="0" cy="0" rx="28" ry="9" fill="none" stroke={accentColor} strokeWidth="2.1" strokeDasharray="7 4" opacity="0.9" />
        </g>
        <g transform="translate(0, -18) rotate(24)">
          <ellipse cx="0" cy="0" rx="28" ry="9" fill="none" stroke="#FEF08A" strokeWidth="1.8" strokeDasharray="5 5" opacity="0.82" />
        </g>
        <g className="td-anim-orb">
          <polygon points="-25,-28 -21,-22 -25,-16 -29,-22" fill={accentColor} stroke="#FFFFFF" strokeWidth="1.1" />
          <circle cx="-25" cy="-22" r="2.2" fill="#FFFFFF" />
          <polygon points="25,-28 29,-22 25,-16 21,-22" fill={accentColor} stroke="#FFFFFF" strokeWidth="1.1" />
          <circle cx="25" cy="-22" r="2.2" fill="#FFFFFF" />
        </g>
      </g>
    );
  }

  // Form 3: Cosmic Mandala Sun-Wheel + Seraphic Flame Halo
  return (
    <g className="pointer-events-none">
      <g transform="translate(0, -21)">
        <g className="td-anim-spin">
          <circle cx="0" cy="0" r="23" fill={accentColor} fillOpacity="0.14" stroke={accentColor} strokeWidth="2" strokeDasharray="6 3" />
          <circle cx="0" cy="0" r="17" fill="none" stroke="#FEF08A" strokeWidth="1.4" strokeDasharray="3 4" />
          <polygon
            points="0,-29 3,-19 0,-15 -3,-19"
            fill={accentColor}
            stroke="#FFFFFF"
            strokeWidth="0.9"
          />
          <polygon
            points="0,29 3,19 0,15 -3,19"
            fill={accentColor}
            stroke="#FFFFFF"
            strokeWidth="0.9"
          />
          <polygon
            points="-29,0 -19,3 -15,0 -19,-3"
            fill={accentColor}
            stroke="#FFFFFF"
            strokeWidth="0.9"
          />
          <polygon
            points="29,0 19,3 15,0 19,-3"
            fill={accentColor}
            stroke="#FFFFFF"
            strokeWidth="0.9"
          />
          <polygon
            points="-20,-20 -12,-15 -11,-11 -15,-12"
            fill="#FEF08A"
          />
          <polygon
            points="20,-20 15,-12 11,-11 12,-15"
            fill="#FEF08A"
          />
        </g>
      </g>
    </g>
  );
}

function renderArcherHero(opts: {
  x: number;
  y: number;
  scale?: number;
  cloak: string;
  cloakDark: string;
  hatColor: string;
  trimColor: string;
  arrowColor: string;
  bowColor: string;
  aimRight: number;
  bowTiltDeg: number;
  firing: boolean;
  hasFeather?: boolean;
  isSniper?: boolean;
  isPoison?: boolean;
}) {
  const {
    x,
    y,
    scale = 1,
    cloak,
    cloakDark,
    hatColor,
    trimColor,
    arrowColor,
    bowColor,
    aimRight,
    bowTiltDeg,
    firing,
    hasFeather = false,
    isSniper = false,
    isPoison = false,
  } = opts;
  const drawPull = firing ? 1.5 : -3;

  return (
    <g transform={`translate(${x}, ${y}) scale(${aimRight * scale}, ${scale})`}>
      {/* Sculpted Ranger Boots */}
      <path d="M-5.5,6.5 C-5.5,9.8 -0.8,9.8 -1,6.5 Z" fill="#0F172A" />
      <path d="M1,6.5 C0.8,9.8 5.5,9.8 5.5,6.5 Z" fill="#0F172A" />
      <path d="M-4.6,5.5 L-1.6,5.5 L-1.4,7 L-4.8,7 Z" fill={trimColor} />
      <path d="M1.4,5.5 L4.6,5.5 L4.8,7 L1.6,7 Z" fill={trimColor} />

      {/* Quiver with Glowing Fletched Arrows */}
      <g transform="rotate(-22 -4 -4)">
        <path d="M-8.5,-11.5 C-8.5,-12.5 -3.7,-12.5 -3.7,-11.5 L-4.2,0.5 C-4.2,1.5 -8,1.5 -8,0.5 Z" fill="#78350F" stroke="#0F172A" strokeWidth="1.2" />
        <path d="M-8.5,-11.5 L-3.7,-11.5 L-3.7,-9.3 L-8.5,-9.3 Z" fill={trimColor} />
        <line x1="-7" y1="-12" x2="-9" y2="-17" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-5" y1="-12" x2="-4.5" y2="-17.5" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Fluttering Ranger Cape */}
      <path d="M-4.5,-7.5 C-9,-3 -11.5,3.5 -10.5,7.2 C-7.5,6.5 -4.5,6.5 -2.5,5.5 Z" fill={cloakDark} stroke="#0F172A" strokeWidth="1.2" />

      {/* Organic Contoured Ranger Tunic & Leather Breastplate */}
      <path
        d="M-6.2,6.8 C-6.4,1.5 -5.8,-4.5 -4.8,-8.8 C-1.8,-9.5 1.8,-9.5 4.8,-8.8 C5.8,-4.5 6.4,1.5 6.2,6.8 C2.2,7.5 -2.2,7.5 -6.2,6.8 Z"
        fill={cloak}
        stroke="#0F172A"
        strokeWidth="1.4"
      />
      {/* Cel-shading Left Shadow & Shoulder Pauldron */}
      <path d="M-6.2,6.8 C-6.4,1.5 -5.8,-4.5 -4.8,-8.8 L-0.8,-8.8 L-1.5,7 Z" fill={cloakDark} opacity="0.52" />
      <path d="M-5.8,-8 C-3.2,-9.8 0,-8.5 1.2,-6.5 C-1.5,-5.5 -4,-6 -5.8,-8 Z" fill={trimColor} stroke="#0F172A" strokeWidth="0.9" />
      <path d="M-5.2,-0.5 Q0,1 5.2,-0.5 L5,1.8 Q0,3.2 -5,1.8 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="0.7" />

      {/* Sculpted Head & Jawline */}
      <path
        d="M-4.8,-13.5 C-4.8,-17.5 4.8,-17.5 4.8,-13.5 C4.8,-10.2 2.4,-8.2 0,-8.2 C-2.4,-8.2 -4.8,-10.2 -4.8,-13.5 Z"
        fill="url(#tdSkinWarmGrad)"
        stroke="#0F172A"
        strokeWidth="1.3"
      />
      {/* Fierce Brow & Luminous Eye */}
      <path d="M-0.5,-13.8 L3.2,-13.1" stroke="#0F172A" strokeWidth="1.1" strokeLinecap="round" />
      <ellipse cx="2" cy="-12.3" rx="1.1" ry="1.25" fill={isPoison ? '#16A34A' : '#0F172A'} />
      <circle cx="2.3" cy="-12.6" r="0.38" fill="#FFFFFF" />
      {isSniper && <circle cx="2" cy="-12.4" r="2.2" fill="none" stroke="#FACC15" strokeWidth="1.1" />}

      {/* Sculpted Elven Hood / Ranger Hat */}
      <path
        d="M-6.8,-12.5 C-5.5,-19.5 1,-22.2 6.8,-13.8 C2.8,-15.2 -2.2,-14.8 -6.8,-12.5 Z"
        fill={hatColor}
        stroke="#0F172A"
        strokeWidth="1.3"
      />
      <path d="M-4,-15.5 Q0,-18.8 4.5,-15" fill="none" stroke={trimColor} strokeWidth="1" opacity="0.9" />
      {hasFeather && (
        <path d="M-2,-17.5 C-6.5,-24 -10.5,-24.5 -11.8,-19 C-7.5,-17.5 -4,-17.2 -2,-17.5 Z" fill={trimColor} stroke="#0F172A" strokeWidth="0.9" />
      )}
      {isSniper && (
        <path d="M-2.2,-18.5 L1,-26.8 L4.2,-18.5 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1" />
      )}

      {/* Sculpted Elven Recurve Bow */}
      <g transform={`translate(2, -5) rotate(${bowTiltDeg})`}>
        <path
          d={isSniper ? 'M2.5,-12.5 Q13.5,-6 13.5,0 Q13.5,6 2.5,12.5' : 'M2.5,-10 Q11.5,-4.8 11.5,0 Q11.5,4.8 2.5,10'}
          fill="none"
          stroke={bowColor}
          strokeWidth={isSniper ? '2.8' : '2.3'}
          strokeLinecap="round"
        />
        <path
          d={isSniper ? 'M3.5,-10 Q11.5,-5 11.5,0 Q11.5,5 3.5,10' : 'M3.5,-8 Q9.5,-3.5 9.5,0 Q9.5,3.5 3.5,8'}
          fill="none"
          stroke="#FEF08A"
          strokeWidth="0.85"
          opacity="0.78"
        />
        <polyline
          points={`2.5,${isSniper ? -12.5 : -10} ${drawPull},0 2.5,${isSniper ? 12.5 : 10}`}
          fill="none"
          stroke={isPoison ? '#86EFAC' : '#E0F2FE'}
          strokeWidth="1.1"
        />
        <line
          x1={drawPull}
          y1="0"
          x2={firing ? 17 : 13.5}
          y2="0"
          stroke={arrowColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <polygon
          points={`${firing ? 17 : 13.5},-2.3 ${firing ? 22 : 17},0 ${firing ? 17 : 13.5},2.3`}
          fill={isPoison ? '#4ADE80' : '#FFFFFF'}
          stroke="#0F172A"
          strokeWidth="0.55"
        />
        {firing && <circle cx="15.5" cy="0" r="4.5" fill={isPoison ? '#4ADE80' : '#FEF08A'} opacity="0.88" />}
      </g>
    </g>
  );
}

function renderMageHero(opts: {
  x: number;
  y: number;
  scale?: number;
  robe: string;
  robeTrim: string;
  hat: string;
  crystal: string;
  aimRight: number;
  firing: boolean;
  hasCrown?: boolean;
  isFrost?: boolean;
  isStorm?: boolean;
}) {
  const {
    x,
    y,
    scale = 1,
    robe,
    robeTrim,
    hat,
    crystal,
    aimRight,
    firing,
    hasCrown = false,
    isFrost = false,
    isStorm = false,
  } = opts;

  return (
    <g transform={`translate(${x}, ${y}) scale(${aimRight * scale}, ${scale})`}>
      {/* Hovering Elemental Mantle Wings on Lv4 Archmages */}
      {hasCrown && (
        <g opacity="0.88">
          <path d="M-4,-6 C-12,-14 -15,-7 -13,-1 C-9,2 -5,1 -4,0 Z" fill={isStorm ? '#38BDF8' : '#7DD3FC'} stroke="#FFFFFF" strokeWidth="0.85" />
          <path d="M4,-6 C12,-14 14,-7 12,-1 C8,2 5,1 4,0 Z" fill={isStorm ? '#38BDF8' : '#7DD3FC'} stroke="#FFFFFF" strokeWidth="0.85" />
        </g>
      )}

      {/* Flowing Layered Archmage Robes */}
      <path
        d="M-8.5,8.5 C-7,2 -6.2,-3.5 -5.2,-8 C-2,-9 2,-9 5.2,-8 C6.5,-3 7.5,2.5 8.8,8.5 C5.5,7.2 2.5,9.2 0,9.2 C-2.5,9.2 -5.5,7.2 -8.5,8.5 Z"
        fill={robe}
        stroke="#0F172A"
        strokeWidth="1.4"
      />
      <path d="M-2.2,-7.5 C-1,-2 0,4 0,9 L3.5,8.5 C2.5,2 1.8,-3 1.5,-7.5 Z" fill={robeTrim} opacity="0.92" />
      <circle cx="0.6" cy="2" r="1.15" fill="#FFFFFF" opacity="0.85" />

      {/* Ornate High Arcane Collar & Shoulder Mantle */}
      <path d="M-7,-7.5 C-3,-4.5 3,-4.5 7,-7.5 L5.2,-11 C2,-9.5 -2,-9.5 -5.2,-11 Z" fill={hat} stroke="#0F172A" strokeWidth="1.2" />

      {/* Sculpted Face, Glowing Arcane Eyes & Flowing Beard */}
      <path
        d="M-4.6,-12.5 C-4.6,-16.5 4.6,-16.5 4.6,-12.5 C4.6,-9.5 2.4,-7.5 0,-7.5 C-2.4,-7.5 -4.6,-9.5 -4.6,-12.5 Z"
        fill="url(#tdSkinWarmGrad)"
        stroke="#0F172A"
        strokeWidth="1.3"
      />
      <path d="M-3.5,-9 C-2,-4.5 0,-2 1,-2 C2,-2 3.5,-4.5 4.2,-9 C1.8,-7.5 -1.5,-7.5 -3.5,-9 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.7" />
      <circle cx="2" cy="-12.5" r="1.25" fill={isFrost ? '#38BDF8' : '#E879F9'} />
      <circle cx="2.2" cy="-12.7" r="0.45" fill="#FFFFFF" />

      {/* Pointed Archmage Hat + Crystal Diadem */}
      <path d="M-7.8,-13.5 C-3.5,-19.5 -1,-24 0.8,-27.8 C3,-22 5.5,-17.5 7.2,-13.5 Z" fill={hat} stroke="#0F172A" strokeWidth="1.3" />
      <ellipse cx="0" cy="-13.5" rx="8.4" ry="2.3" fill={hat} stroke="#0F172A" strokeWidth="1.2" />
      <path d="M-5.2,-15 Q0,-16.5 5.2,-15" stroke={robeTrim} strokeWidth="1.3" fill="none" />
      {hasCrown && (
        <path d="M-3.4,-20 L0,-30.5 L3.4,-20 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1" />
      )}

      {/* Enchanted Frost-Arcane Staff */}
      <g transform={firing ? 'translate(2.5, -3) rotate(18 6 -4)' : ''}>
        <line x1="6.5" y1="6.5" x2="8.2" y2="-16.5" stroke="url(#tdGoldGrad)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M4.5,-17 Q8.2,-23.5 11.8,-17" fill="none" stroke="#FEF08A" strokeWidth="1.6" strokeLinecap="round" />
        <circle
          cx="8.2"
          cy="-20.5"
          r={firing ? 5.6 : 4.1}
          fill={isStorm ? 'url(#tdFrostOrbGrad)' : 'url(#tdArcaneOrbGrad)'}
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {firing && <circle cx="8.2" cy="-20.5" r="10" fill={crystal} opacity="0.48" />}
      </g>
    </g>
  );
}

function renderArtilleryHero(opts: {
  x: number;
  y: number;
  scale?: number;
  armor: string;
  helm: string;
  barrel: string;
  aimRight: number;
  deg: number;
  firing: boolean;
  isTesla?: boolean;
  isBertha?: boolean;
}) {
  const {
    x,
    y,
    scale = 1,
    armor,
    helm,
    barrel,
    aimRight,
    deg,
    firing,
    isTesla = false,
    isBertha = false,
  } = opts;
  const kick = firing ? -3.2 : 0;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <g transform={`scale(${aimRight}, 1)`}>
        {/* Armored Sabatons */}
        <path d="M-6,6.5 C-6,10 -1,10 -1,6.5 Z" fill="#0F172A" />
        <path d="M1,6.5 C1,10 6,10 6,6.5 Z" fill="#0F172A" />

        {/* Steam Boiler or Tesla Reactor Backpack */}
        {isTesla ? (
          <g>
            <path d="M-10,-9.5 C-10,-11 -3.5,-11 -3.5,-9.5 L-3.5,2.5 C-3.5,4 -10,4 -10,2.5 Z" fill="#0284C7" stroke="#0F172A" strokeWidth="1.2" />
            <circle cx="-6.8" cy="-12.5" r="3.4" fill="url(#tdFrostOrbGrad)" className="td-anim-glow" />
          </g>
        ) : (
          <path d="M-9.5,-8 C-9.5,-9.5 -4,-9.5 -4,-8 L-4,2.5 C-4,4 -9.5,4 -9.5,2.5 Z" fill="url(#tdDarkIronGrad)" stroke="#0F172A" strokeWidth="1.1" />
        )}

        {/* Sculpted Heavy Dwarven Chestplate & Pauldrons */}
        <path
          d="M-7.5,6.8 C-8.2,1.5 -8,-4.5 -6.8,-8.2 C-2.5,-9.8 2.5,-9.8 6.8,-8.2 C8,-4.5 8.2,1.5 7.5,6.8 C3,7.8 -3,7.8 -7.5,6.8 Z"
          fill={armor}
          stroke="#0F172A"
          strokeWidth="1.4"
        />
        <path d="M-7.2,-4.5 Q0,-2.5 7.2,-4.5" fill="none" stroke="#FEF08A" strokeWidth="1.2" opacity="0.7" />
        <path d="M-7.2,1 Q0,2.8 7.2,1 L7,3.5 Q0,5 -7,3.5 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="0.75" />

        {/* Face, Braided Beard & Brass Goggles */}
        <path
          d="M-4.8,-12.5 C-4.8,-16.5 4.8,-16.5 4.8,-12.5 C4.8,-9.5 2.4,-7.5 0,-7.5 C-2.4,-7.5 -4.8,-9.5 -4.8,-12.5 Z"
          fill="url(#tdSkinWarmGrad)"
          stroke="#0F172A"
          strokeWidth="1.3"
        />
        <path d="M-4.2,-9.2 C-2.8,-4 -1,-2 0,-2 C1,-2 2.8,-4 4.2,-9.2 C1.5,-8 -1.5,-8 -4.2,-9.2 Z" fill="#D97706" stroke="#0F172A" strokeWidth="0.9" />
        <circle cx="0" cy="-5.2" r="1.2" fill="#FACC15" />

        {/* Dwarven Crested Helm & Glowing Goggles */}
        <path d="M-6.6,-12.5 C-5.5,-20.5 5.5,-20.5 6.6,-12.5 Z" fill={helm} stroke="#0F172A" strokeWidth="1.3" />
        <circle cx="-1.2" cy="-13" r="1.9" fill="#38BDF8" stroke="#FACC15" strokeWidth="1" />
        <circle cx="2.8" cy="-13" r="1.9" fill="#38BDF8" stroke="#FACC15" strokeWidth="1" />
        <path d="M-2,-19.2 L2,-19.2 L1.6,-16.2 L-1.6,-16.2 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="0.8" />
      </g>

      {/* Aimed Dragon Hand-Cannon or Arc-Tesla Railgun */}
      <g transform={`translate(0, -3) rotate(${deg}) translate(${kick}, 0)`}>
        {isTesla ? (
          <>
            <path d="M0,-3.5 L16,-2.8 L17,0 L16,2.8 L0,3.5 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.3" />
            <line x1="4" y1="-3.2" x2="4" y2="3.2" stroke="#38BDF8" strokeWidth="1.6" />
            <line x1="9" y1="-3" x2="9" y2="3" stroke="#38BDF8" strokeWidth="1.6" />
            <circle cx="18" cy="0" r={firing ? 5.6 : 3.8} fill="url(#tdFrostOrbGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
            {firing && <path d="M18,-6 L25,0 L18,6" stroke="#FEF08A" strokeWidth="2" fill="none" />}
          </>
        ) : (
          <>
            <path
              d={
                isBertha
                  ? 'M0,-4.5 L14,-5.5 L20,-4 L20,4 L14,5.5 L0,4.5 Z'
                  : 'M0,-3.5 L11,-4.2 L16,-3.2 L16,3.2 L11,4.2 L0,3.5 Z'
              }
              fill={barrel}
              stroke="#0F172A"
              strokeWidth="1.4"
            />
            <path
              d={isBertha ? 'M13,-5.4 L17,-5 L17,5 L13,5.4 Z' : 'M10,-4.1 L14,-3.8 L14,3.8 L10,4.1 Z'}
              fill="url(#tdGoldGrad)"
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            {firing && (
              <>
                <circle cx={isBertha ? 22 : 18} cy="0" r="7" fill="#F97316" opacity="0.9" />
                <circle cx={isBertha ? 22 : 18} cy="0" r="3.6" fill="#FEF08A" />
              </>
            )}
          </>
        )}
      </g>
    </g>
  );
}

function renderBarracksCommander(opts: {
  x: number;
  y: number;
  scale?: number;
  armor: string;
  cape: string;
  crest: string;
  isPaladin: boolean;
  isBarb: boolean;
  hasBanner?: boolean;
}) {
  const { x, y, scale = 1, armor, cape, crest, isPaladin, isBarb, hasBanner = true } = opts;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Flowing Royal Commander Cape */}
      <path d="M-6.5,-6.5 C-10,-1 -12.5,5 -11.5,9.5 C-5,8.5 1,9 5.5,9.5 C4.5,3 3.5,-2 3,-6.5 Z" fill={cape} stroke="#0F172A" strokeWidth="1.3" />

      {/* Sculpted Plate Cuirass */}
      <path
        d="M-6.6,7.2 C-7,2 -6.8,-3.5 -5.8,-7.5 C-2,-8.8 2,-8.8 5.8,-7.5 C6.8,-3.5 7,2 6.6,7.2 C2.5,8.2 -2.5,8.2 -6.6,7.2 Z"
        fill={armor}
        stroke="#0F172A"
        strokeWidth="1.4"
      />
      <path d="M-5.8,-2 Q0,0 5.8,-2" fill="none" stroke={crest} strokeWidth="1.4" opacity="0.92" />

      {/* Layered Shoulder Pauldrons */}
      <path d="M-9,-4 C-9,-7.5 -4,-8 -3.5,-4.5 C-4,-2 -8.5,-1.8 -9,-4 Z" fill={isPaladin ? 'url(#tdGoldGrad)' : armor} stroke="#0F172A" strokeWidth="1.2" />
      <path d="M9,-4 C9,-7.5 4,-8 3.5,-4.5 C4,-2 8.5,-1.8 9,-4 Z" fill={isPaladin ? 'url(#tdGoldGrad)' : armor} stroke="#0F172A" strokeWidth="1.2" />

      {/* Sculpted Greathelm + Glowing Visor */}
      <path
        d="M-5,-12.5 C-5,-17.5 5,-17.5 5,-12.5 C5,-8.5 2.5,-7 0,-7 C-2.5,-7 -5,-8.5 -5,-12.5 Z"
        fill={isPaladin ? 'url(#tdGoldGrad)' : 'url(#tdSteelGrad)'}
        stroke="#0F172A"
        strokeWidth="1.4"
      />
      <path d="M-2.4,-13 L3.2,-12.8 L3,-10.8 L-2.2,-10.8 Z" fill="#0F172A" />
      <circle cx="0.6" cy="-11.9" r="0.95" fill={isBarb ? '#EF4444' : '#38BDF8'} />

      {isBarb ? (
        <>
          <path d="M-4,-15.5 C-7.5,-18.5 -10,-21 -9.5,-23.5 C-6,-21 -4,-18.5 -2,-16.5 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="1" />
          <path d="M4,-15.5 C7.5,-18.5 10,-21 9.5,-23.5 C6,-21 4,-18.5 2,-16.5 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="1" />
        </>
      ) : (
        <path d="M-2.6,-15.5 C-2,-20 0,-24 0,-24 C0,-24 2,-20 2.6,-15.5 Z" fill={crest} stroke="#0F172A" strokeWidth="1" />
      )}

      {/* Radiant Broadsword & Lion Kite Shield or Battleaxe */}
      {isBarb ? (
        <path d="M6.5,3 L14,-13 M9.5,-13 C13,-14 16,-12 17.5,-10 C16,-7 14,-5.5 13,-4.5 Z" stroke="#F8FAFC" strokeWidth="2.1" fill="url(#tdSteelGrad)" />
      ) : (
        <>
          <path d="M-8.8,-4.5 L-1.5,-4.5 L-1.5,5.5 L-5.2,9.2 L-8.8,5.5 Z" fill={crest} stroke="#0F172A" strokeWidth="1.2" />
          <circle cx="-5.2" cy="1" r="1.4" fill="#FFFFFF" opacity="0.88" />
          <line x1="6" y1="3" x2="13.5" y2="-11.5" stroke="url(#tdSteelGrad)" strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}

      {/* Heroic War Banner */}
      {hasBanner && (
        <g className="td-anim-banner">
          <line x1="-8.5" y1="7" x2="-8.5" y2="-29" stroke="#F8FAFC" strokeWidth="2.1" />
          <polygon points="-8.5,-32 -6,-29 -11,-29" fill="#FACC15" />
          <path
            d="M-8.5,-29 C-1,-28.5 4,-26 8.5,-24 C3.5,-22 -1.5,-19.5 -8.5,-19 Z"
            fill={isPaladin ? '#FACC15' : isBarb ? '#EF4444' : '#38BDF8'}
            stroke="#0F172A"
            strokeWidth="1.1"
          />
        </g>
      )}
    </g>
  );
}

function renderAssassinHero(opts: {
  x: number;
  y: number;
  scale?: number;
  suit: string;
  scarf: string;
  eyeColor: string;
  bladeColor: string;
  aimRight: number;
  firing: boolean;
  isShadow?: boolean;
  isVenom?: boolean;
}) {
  const {
    x,
    y,
    scale = 1,
    suit,
    scarf,
    eyeColor,
    bladeColor,
    aimRight,
    firing,
    isShadow = false,
    isVenom = false,
  } = opts;

  return (
    <g transform={`translate(${x}, ${y}) scale(${aimRight * scale}, ${scale})`}>
      {/* Flowing Crimson/Emerald Ninja Scarf */}
      <g className="td-anim-banner">
        <path d="M-3,-8 C-10,-12 -15,-9.5 -17.5,-4.5 C-12,-2.5 -7,-3.5 -3.5,-5 Z" fill={scarf} stroke="#0F172A" strokeWidth="1.1" />
      </g>

      {/* Poised Shinobi Stance Legs */}
      <path d="M-4,2 L-7,9 M3,2 L7,9" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M-4,2 L-7,9 M3,2 L7,9" stroke={suit} strokeWidth="2" strokeLinecap="round" />

      {/* Sleek Contoured Ninja Vest & Sash */}
      <path
        d="M-5.5,4.2 C-6,-0.5 -5.8,-5 -4.8,-8.8 C-1.5,-9.5 1.5,-9.5 4.8,-8.8 C5.8,-5 6,-0.5 5.5,4.2 C2,5 -2,5 -5.5,4.2 Z"
        fill={suit}
        stroke="#0F172A"
        strokeWidth="1.4"
      />
      <path d="M-5.2,-1 Q0,0.8 5.2,-1 L5,1.4 Q0,3 -5,1.4 Z" fill={scarf} />

      {/* Hooded Ninja Mask & Piercing Glowing Eyes */}
      <path
        d="M-5,-12.8 C-5,-17.2 5,-17.2 5,-12.8 C5,-9 2.2,-7.5 0,-7.5 C-2.2,-7.5 -5,-9 -5,-12.8 Z"
        fill={suit}
        stroke="#0F172A"
        strokeWidth="1.4"
      />
      <path d="M-1.8,-14 L4.2,-13.6 L4,-11.2 L-1.8,-11.2 Z" fill="#FDE68A" />
      <circle cx="2" cy="-12.5" r="1.15" fill={eyeColor} />
      {isShadow && <path d="M-5.5,-15.5 L5.5,-15.5" stroke="#FACC15" strokeWidth="1.6" />}
      {isVenom && <polygon points="-2,-10 2,-10 0,-7.5" fill="#4ADE80" stroke="#0F172A" strokeWidth="0.7" />}

      {/* Twin Curved Shadow Katanas / Venom Daggers */}
      <g transform={firing ? 'translate(3, -1) rotate(24 4 -4)' : ''}>
        <path d="M4,-3 C8,-7 12,-10.5 15,-13 C13,-8.5 12,-5 10.5,-2.5 Z" fill={bladeColor} stroke="#0F172A" strokeWidth="1.1" />
        <path d="M-4,0 C-7.5,-3.5 -10,-6 -12.5,-8.5 C-10,-4.5 -9,-2 -7.8,0 Z" fill={bladeColor} stroke="#0F172A" strokeWidth="1.1" opacity="0.88" />
      </g>
    </g>
  );
}

function renderValkyrieHero(opts: {
  x: number;
  y: number;
  scale?: number;
  armor: string;
  trim: string;
  wingGrad: string;
  spearColor: string;
  aimRight: number;
  firing: boolean;
  isSeraph?: boolean;
  isFrost?: boolean;
}) {
  const {
    x,
    y,
    scale = 1,
    armor,
    trim,
    wingGrad,
    spearColor,
    aimRight,
    firing,
    isSeraph = false,
    isFrost = false,
  } = opts;

  return (
    <g transform={`translate(${x}, ${y}) scale(${aimRight * scale}, ${scale})`}>
      {/* Glowing Celestial Halo */}
      <ellipse
        cx="0"
        cy="-19"
        rx="6.8"
        ry="2.2"
        fill="none"
        stroke={isFrost ? '#7DD3FC' : '#FEF08A'}
        strokeWidth="1.8"
        className="td-anim-glow"
      />

      {/* Sweeping Feathered Angelic Wings */}
      <g className="td-anim-wing">
        <path
          d="M-3,-6 C-10,-15 -16,-19 -18.5,-18 C-16,-12 -14,-9 -19,-3 C-14,-1.5 -9,-0.5 -3,-2 Z"
          fill={wingGrad}
          stroke="#0F172A"
          strokeWidth="1.1"
        />
        <path
          d="M3,-6 C10,-15 15,-19 17.5,-18 C15,-12 13,-9 18,-3 C13,-1.5 8,-0.5 3,-2 Z"
          fill={wingGrad}
          stroke="#0F172A"
          strokeWidth="1.1"
        />
      </g>

      {/* Flowing Battle Skirt & Gilded Breastplate */}
      <path
        d="M-7,8 C-6,2 -5.5,-3 -4.5,-7.8 C-1.5,-8.8 1.5,-8.8 4.5,-7.8 C5.5,-3 6,2 7,8 C3.5,7 1.5,8.5 0,8.5 C-1.5,8.5 -3.5,7 -7,8 Z"
        fill={armor}
        stroke="#0F172A"
        strokeWidth="1.4"
      />
      <path d="M-2.5,-7 L0,8.2 L2.5,-7 Z" fill={trim} opacity="0.92" />

      {/* Sculpted Face & Winged Valkyrie Circlet */}
      <path
        d="M-4.6,-12.5 C-4.6,-16.5 4.6,-16.5 4.6,-12.5 C4.6,-9.5 2.2,-7.6 0,-7.6 C-2.2,-7.6 -4.6,-9.5 -4.6,-12.5 Z"
        fill="url(#tdSkinWarmGrad)"
        stroke="#0F172A"
        strokeWidth="1.3"
      />
      <circle cx="2" cy="-12.3" r="1" fill={isFrost ? '#0284C7' : '#B45309'} />
      <path d="M-5.5,-13.5 C-3,-18.5 3,-18.5 5.5,-13.5 L3,-16 L-3,-16 Z" fill={trim} stroke="#0F172A" strokeWidth="1" />
      {isSeraph && <polygon points="-2,-17 0,-23.5 2,-17" fill="#FEF08A" stroke="#0F172A" strokeWidth="0.9" />}

      {/* Radiant Holy Spear */}
      <g transform={firing ? 'translate(4, -2) rotate(22 5 -4)' : ''}>
        <line x1="5" y1="6.5" x2="9" y2="-17" stroke="url(#tdGoldGrad)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M9,-24.5 C10.8,-20 12,-17 12.2,-15 L9,-16.5 L5.8,-15 C6,-17 7.2,-20 9,-24.5 Z" fill={spearColor} stroke="#FFFFFF" strokeWidth="1" />
        {firing && <circle cx="9.5" cy="-19" r="5" fill={spearColor} opacity="0.55" />}
      </g>
    </g>
  );
}

export const TdTowerSprite: React.FC<TdTowerSpriteProps> = React.memo(
  ({ type, level, branch, mythicPath = null, facingAngle = 0, recoil = 0, windup = 0 }) => {
    const animeSrc = useTdAnimeSprite(resolveHeroAnimeKey(type, level, branch));
    const mythicCfg = getMythicPathConfig(type, mythicPath);
    const mythicIndex = mythicPath
      ? TD_MYTHIC_PATHS[type].findIndex((p) => p.id === mythicPath)
      : -1;
    const isMythicForm = Boolean(mythicCfg && mythicIndex >= 0 && level >= 11);
    const k = Math.min(1, Math.max(0, recoil / 0.28));
    const w = Math.min(1, Math.max(0, windup));
    const firing = k > 0.02;
    const isWinding = w > 0.02;
    const swing = Math.sin(k * Math.PI);
    const kick = k * k;
    const aimRight = Math.cos(facingAngle) >= 0 ? 1 : -1;
    const deg = (facingAngle * 180) / Math.PI;
    const rawLocalAngle = aimRight === 1 ? facingAngle : Math.PI - facingAngle;
    const normTilt = Math.atan2(Math.sin(rawLocalAngle), Math.cos(rawLocalAngle)) * (180 / Math.PI);
    const bowTiltDeg = Math.max(-42, Math.min(42, normTilt));
    const scaleBoost = 1 + swing * 0.06;

    if (animeSrc) {
      const baseAuraColor =
        type === 'ARCHER'
          ? branch === 'SNIPER_CRIT'
            ? '#FACC15'
            : '#4ADE80'
          : type === 'BARRACKS'
            ? branch === 'BARBARIAN'
              ? '#F87171'
              : branch === 'PALADIN'
                ? '#FACC15'
                : '#60A5FA'
            : type === 'MAGE'
              ? branch === 'STORM_CHAIN'
                ? '#38BDF8'
                : '#C084FC'
              : type === 'ARTILLERY'
                ? branch === 'TESLA_COIL'
                  ? '#38BDF8'
                  : '#FB923C'
                : type === 'ASSASSIN'
                  ? branch === 'VENOM_FANG'
                    ? '#4ADE80'
                    : '#F43F5E'
                  : type === 'VALKYRIE'
                    ? branch === 'FROST_VALKYRIE'
                      ? '#7DD3FC'
                      : '#FEF08A'
                    : type === 'KNIGHT_GUARD'
                      ? branch === 'AEGIS_WARDEN'
                        ? '#38BDF8'
                        : '#FB923C'
                      : type === 'PYROMANCER'
                        ? branch === 'PHOENIX_SAGE'
                          ? '#FACC15'
                          : '#F97316'
                        : type === 'MECHANIST'
                          ? branch === 'ROCKET_BATTERY'
                            ? '#FACC15'
                            : '#38BDF8'
                          : branch === 'VOID_SOVEREIGN'
                            ? '#F43F5E'
                            : '#C084FC';
      const auraColor = mythicCfg?.accentColor ?? baseAuraColor;

      const sizeW =
        level >= 20
          ? 81
          : level >= 15
            ? 77
            : level >= 11
              ? 74
              : level >= 7
                ? 70
                : level === 6
                  ? 68
                  : level === 5
                    ? 66
                    : level === 4
                      ? 64
                      : level === 3
                        ? 60
                        : level === 2
                          ? 56
                          : 52;
      const sizeH = sizeW;

      // 2-Stage Spring Kinematics: Anticipation pull-back (windup) -> Release snap / recoil (firing)
      const shiftX = isWinding
        ? -aimRight * w * 3.8
        : firing
          ? type === 'ARTILLERY' || type === 'MECHANIST'
            ? -aimRight * kick * 4.4
            : aimRight * swing * 4.5
          : 0;
      const shiftY = isWinding
        ? type === 'ASSASSIN'
          ? w * 2.4
          : type === 'VALKYRIE' || type === 'MAGE' || type === 'PYROMANCER' || type === 'CHRONOMANCER'
            ? -w * 3.2
            : w * 0.8
        : firing
          ? -swing * 1.6
          : 0;
      const leanDeg = isWinding
        ? -aimRight * w * 8.5
        : firing
          ? type === 'ARTILLERY' || type === 'MECHANIST'
            ? -aimRight * kick * 6.5
            : aimRight * swing * 9.5
          : 0;
      const stretchX = isWinding
        ? 1 - w * 0.055
        : firing
          ? 1 + swing * 0.08
          : 1;
      const stretchY = isWinding
        ? 1 + w * 0.045
        : firing
          ? 1 - swing * 0.055
          : 1;

      const aimOriginX = aimRight * 4;
      const aimOriginY = -12;
      const bowPullX = isWinding ? 5.5 - w * 13.5 : 5.5 + Math.sin(k * Math.PI * 4) * 3.5 * k;
      const bowFlex = isWinding ? w * 4 : -swing * 1.5;

      return (
        <g>
          {/* Soft Ground Contact Shadow */}
          <ellipse cx="0" cy="14.5" rx={level >= 5 ? 25 : level >= 3 ? 23 : 20} ry="7.8" fill="#020617" opacity="0.52" />

          {/* Imperial Dais Ring at Lv10+ */}
          {level >= 10 && (
            <ellipse
              cx="0"
              cy="12.8"
              rx={level >= 15 ? 35 : 32}
              ry="11.6"
              fill={auraColor}
              fillOpacity={isMythicForm ? 0.16 : 0.1}
              stroke={auraColor}
              strokeWidth={isMythicForm ? '2' : '1.4'}
            />
          )}

          {/* Level Evolution Magic Ring */}
          {level >= 2 && (
            <ellipse
              cx="0"
              cy="12.5"
              rx={level >= 5 ? 25 : level >= 4 ? 23 : level === 3 ? 21 : 19}
              ry={level >= 5 ? 8.8 : level >= 4 ? 8 : 6.8}
              fill={auraColor}
              fillOpacity={level >= 5 ? 0.26 : level >= 4 ? 0.2 : 0.12}
              stroke={level >= 7 ? '#FEF08A' : level >= 5 ? '#E879F9' : auraColor}
              strokeWidth={level >= 5 ? 2.2 : level >= 4 ? 1.8 : 1.3}
              strokeDasharray={level >= 4 ? '6 3' : undefined}
              className={level >= 3 ? 'td-anim-glow' : undefined}
            />
          )}

          {/* Mythic & Paragon Ascension Aura (Lv 5..20) */}
          {level >= 5 && (
            <g className="pointer-events-none">
              <ellipse
                cx="0"
                cy="12.5"
                rx={level >= 15 ? 31 : level >= 11 ? 29.5 : level >= 7 ? 28 : 26.5}
                ry={level >= 15 ? 11 : level >= 11 ? 10.3 : level >= 7 ? 9.8 : 9}
                fill="none"
                stroke={level >= 11 ? auraColor : level >= 7 ? '#38BDF8' : '#FACC15'}
                strokeWidth={level >= 15 ? '2' : '1.4'}
                strokeDasharray={level >= 11 ? '5 3' : '3 4'}
                opacity="0.9"
              />
              {level >= 11 && (
                <ellipse
                  cx="0"
                  cy="12.5"
                  rx={level >= 20 ? 35 : 33}
                  ry={level >= 20 ? 12.2 : 11.4}
                  fill="none"
                  stroke={level >= 20 ? '#FEF08A' : '#E879F9'}
                  strokeWidth={level >= 20 ? '2' : '1.2'}
                  strokeDasharray="2 5"
                  opacity="0.85"
                />
              )}
              <polygon
                points="-22,-18 -20,-14 -16,-12 -20,-10 -22,-6 -24,-10 -28,-12 -24,-14"
                fill={level >= 11 ? auraColor : level >= 7 ? '#FEF08A' : '#E879F9'}
                className="td-anim-orb"
              />
              {level >= 6 && (
                <polygon
                  points="22,-20 24,-16 28,-14 24,-12 22,-8 20,-12 16,-14 20,-16"
                  fill={level >= 11 ? auraColor : '#38BDF8'}
                  className="td-anim-orb"
                />
              )}
              {level >= 7 && (
                <polygon
                  points="0,-46 2.5,-41 7.5,-38.5 2.5,-36 0,-31 -2.5,-36 -7.5,-38.5 -2.5,-41"
                  fill={level >= 20 ? '#FEF08A' : level >= 11 ? auraColor : '#FEF08A'}
                  stroke="#0F172A"
                  strokeWidth="0.7"
                  className="td-anim-glow"
                />
              )}
              {level >= 15 && (
                <circle
                  cx="0"
                  cy="-22"
                  r={level >= 20 ? 27 : 24}
                  fill="none"
                  stroke={auraColor}
                  strokeWidth={level >= 20 ? '1.6' : '1.1'}
                  strokeDasharray="4 6"
                  opacity="0.55"
                />
              )}
            </g>
          )}

          {/* Distinct 4-Path Mythic Transformation Gear & Wings (Lv11+) */}
          {isMythicForm && renderMythicFormBack(mythicIndex, auraColor)}

          {/* Crisp Transparent Anime Hero with Windup Anticipation & Follow-Through Spring */}
          <g
            transform={`translate(0, 14) translate(${shiftX}, ${shiftY}) rotate(${leanDeg}) scale(${aimRight * stretchX}, ${stretchY}) translate(0, -14)`}
            style={
              isMythicForm
                ? { filter: `drop-shadow(0 0 5px ${auraColor})` }
                : undefined
            }
          >
            <image
              href={animeSrc}
              x={-sizeW / 2}
              y={16.5 - sizeH}
              width={sizeW}
              height={sizeH}
              preserveAspectRatio="xMidYMax meet"
            />
          </g>

          {/* Class-Specific Animated Attack Choreography (Bow Draw, Arcane Circle, Cannon Recoil, Blade Arc, Spear Thrust) */}
          {(isWinding || firing) && (
            <g transform={`translate(${aimOriginX}, ${aimOriginY}) rotate(${deg})`}>
              {/* ARCHER: Flexing Recurve Bow + Drawn Bowstring + Nocked Arrow -> Release Snap */}
              {type === 'ARCHER' && (
                <g opacity={isWinding ? Math.min(1, 0.45 + w * 0.7) : Math.min(1, k * 1.6)}>
                  {/* Curved Bow Limbs flexing under tension */}
                  <path
                    d={`M${6 - bowFlex},-13 Q${15 - bowFlex * 0.35},-6 ${15 - bowFlex * 0.25},0 Q${15 - bowFlex * 0.35},6 ${6 - bowFlex},13`}
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="4.6"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${6 - bowFlex},-13 Q${15 - bowFlex * 0.35},-6 ${15 - bowFlex * 0.25},0 Q${15 - bowFlex * 0.35},6 ${6 - bowFlex},13`}
                    fill="none"
                    stroke={branch === 'SNIPER_CRIT' ? '#FACC15' : '#D97706'}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  {/* Taut Vibrating Bowstring */}
                  <polyline
                    points={`${6 - bowFlex},-13 ${bowPullX},0 ${6 - bowFlex},13`}
                    fill="none"
                    stroke="#E0F2FE"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Nocked Arrow pulled back during draw */}
                  {isWinding && (
                    <g>
                      <line
                        x1={bowPullX}
                        y1="0"
                        x2={bowPullX + 20}
                        y2="0"
                        stroke={auraColor}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                      <polygon
                        points={`${bowPullX + 20},-3 ${bowPullX + 26},0 ${bowPullX + 20},3`}
                        fill="#FFFFFF"
                        stroke={auraColor}
                        strokeWidth="0.9"
                      />
                      <polygon
                        points={`${bowPullX - 2},-2.6 ${bowPullX + 3},0 ${bowPullX - 2},2.6`}
                        fill={branch === 'RANGER_POISON' ? '#4ADE80' : '#F87171'}
                      />
                      {w > 0.35 && (
                        <circle
                          cx={bowPullX + 23}
                          cy="0"
                          r={1.5 + w * 3.2}
                          fill={auraColor}
                          opacity={0.35 + w * 0.45}
                        />
                      )}
                    </g>
                  )}
                  {/* Release Sonic Wave + Arrow Wake */}
                  {firing && (
                    <g opacity={Math.min(1, k * 1.4)}>
                      <ellipse
                        cx={16 + (1 - k) * 9}
                        cy="0"
                        rx={3 + (1 - k) * 5}
                        ry={8 + (1 - k) * 7}
                        fill="none"
                        stroke={auraColor}
                        strokeWidth="2.2"
                      />
                      <path
                        d={`M10,0 L${24 + (1 - k) * 10},-4 L${19 + (1 - k) * 7},0 L${24 + (1 - k) * 10},4 Z`}
                        fill="#FFFFFF"
                        opacity="0.92"
                      />
                    </g>
                  )}
                </g>
              )}

              {/* MAGE: Spinning Arcane Magic Circle Charge -> Spell Surge Release */}
              {type === 'MAGE' && (
                <g transform="translate(15, 0)">
                  {isWinding ? (
                    <g transform={`rotate(${w * 180})`} opacity={0.35 + w * 0.65}>
                      <circle
                        cx="0"
                        cy="0"
                        r={5 + w * 8.5}
                        fill={auraColor}
                        fillOpacity="0.16"
                        stroke={auraColor}
                        strokeWidth="1.8"
                        strokeDasharray="5 3"
                      />
                      <polygon
                        points={`0,${-6 - w * 6} ${5 + w * 5},${3 + w * 3} ${-5 - w * 5},${3 + w * 3}`}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.1"
                        opacity="0.85"
                      />
                      <circle cx="0" cy="0" r={2.2 + w * 4} fill="#FFFFFF" stroke={auraColor} strokeWidth="1.5" />
                    </g>
                  ) : (
                    <g opacity={Math.min(1, k * 1.5)}>
                      <circle
                        cx={(1 - k) * 6}
                        cy="0"
                        r={8 + (1 - k) * 11}
                        fill="none"
                        stroke={auraColor}
                        strokeWidth="2.6"
                      />
                      <path
                        d={`M-2,0 L${12 + k * 8},-5 L${7 + k * 4},0 L${12 + k * 8},5 Z`}
                        fill="#FFFFFF"
                      />
                    </g>
                  )}
                </g>
              )}

              {/* ARTILLERY: Aimed Recoiling Cannon / Tesla Railgun Barrel + Blast Cone */}
              {type === 'ARTILLERY' && (
                <g transform={`translate(${firing ? -kick * 8.5 : 0}, 1)`}>
                  <path
                    d="M2,-4.5 L15,-5.5 L19,-3.8 L19,3.8 L15,5.5 L2,4.5 Z"
                    fill={branch === 'TESLA_COIL' ? '#1E3A8A' : '#334155'}
                    stroke="#0F172A"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M12,-5 L16,-4.4 L16,4.4 L12,5 Z"
                    fill={auraColor}
                  />
                  {isWinding && (
                    <circle cx="19.5" cy="0" r={1.8 + w * 3} fill={auraColor} opacity={0.4 + w * 0.55} />
                  )}
                  {firing && (
                    <g opacity={Math.min(1, k * 1.4)}>
                      <polygon
                        points={`19,0 ${32 + k * 8},-8 ${26 + k * 4},0 ${32 + k * 8},8`}
                        fill={auraColor}
                      />
                      <circle cx="22" cy="0" r={5.5 * k + 2} fill="#FEF08A" />
                    </g>
                  )}
                </g>
              )}

              {/* ASSASSIN: Coiled Blade Glint -> Sweeping Crescent Slash & Kunai Throw */}
              {type === 'ASSASSIN' && (
                <g>
                  {isWinding ? (
                    <g transform="translate(-4, -3)" opacity={0.4 + w * 0.6}>
                      <polygon
                        points={`0,${-5 - w * 4} 2,-2 ${5 + w * 4},0 2,2 0,${5 + w * 4} -2,2 ${-5 - w * 4},0 -2,-2`}
                        fill="#FFFFFF"
                        stroke={auraColor}
                        strokeWidth="1"
                      />
                    </g>
                  ) : (
                    <g transform={`translate(${8 + (1 - k) * 9}, 0) rotate(${(1 - k) * 42 - 22})`} opacity={Math.min(1, k * 1.5)}>
                      <path
                        d="M-4,-15 Q16,0 -4,15 Q8,0 -4,-15 Z"
                        fill={auraColor}
                        opacity="0.7"
                      />
                      <path
                        d="M-2,-12 Q13,0 -2,12 Q6,0 -2,-12 Z"
                        fill="#FFFFFF"
                      />
                    </g>
                  )}
                </g>
              )}

              {/* VALKYRIE / KNIGHT_GUARD: Raised Lance/Spear Charge -> Thrust Wave */}
              {(type === 'VALKYRIE' || type === 'KNIGHT_GUARD') && (
                <g>
                  {isWinding ? (
                    <g transform={`translate(${6 - w * 6}, ${-3 - w * 4}) rotate(${-18 * w})`} opacity={0.5 + w * 0.5}>
                      <line x1="-10" y1="0" x2="12" y2="0" stroke={type === 'KNIGHT_GUARD' ? '#FB923C' : '#FACC15'} strokeWidth="2.5" strokeLinecap="round" />
                      <polygon points="12,-3.5 21,0 12,3.5" fill="#FFFFFF" stroke={auraColor} strokeWidth="1" />
                      <circle cx="15" cy="0" r={2 + w * 3.5} fill={auraColor} opacity="0.55" />
                    </g>
                  ) : (
                    <g transform={`translate(${12 + (1 - k) * 10}, 0)`} opacity={Math.min(1, k * 1.5)}>
                      <path d="M-8,-5 L16,0 L-8,5 L-3,0 Z" fill={auraColor} opacity="0.78" />
                      <path d="M-2,-2.5 L19,0 L-2,2.5 Z" fill="#FFFFFF" />
                      <ellipse cx="4" cy="0" rx={2.5 + (1 - k) * 4} ry={7 + (1 - k) * 6} fill="none" stroke={auraColor} strokeWidth="1.8" />
                    </g>
                  )}
                </g>
              )}

              {/* PYROMANCER / CHRONOMANCER: Spinning Elemental / Cosmic Clockwork Sigil */}
              {(type === 'PYROMANCER' || type === 'CHRONOMANCER') && (
                <g transform="translate(15, 0)">
                  {isWinding ? (
                    <g transform={`rotate(${w * 200})`} opacity={0.4 + w * 0.6}>
                      <circle
                        cx="0"
                        cy="0"
                        r={5.5 + w * 9}
                        fill={auraColor}
                        fillOpacity="0.18"
                        stroke={auraColor}
                        strokeWidth="2"
                        strokeDasharray={type === 'CHRONOMANCER' ? '3 3' : '6 3'}
                      />
                      <polygon
                        points={`0,${-6 - w * 6} ${5 + w * 5},${3 + w * 3} ${-5 - w * 5},${3 + w * 3}`}
                        fill="none"
                        stroke="#FEF08A"
                        strokeWidth="1.2"
                      />
                      <circle cx="0" cy="0" r={2.4 + w * 4} fill="#FFFFFF" stroke={auraColor} strokeWidth="1.5" />
                    </g>
                  ) : (
                    <g opacity={Math.min(1, k * 1.5)}>
                      <circle
                        cx={(1 - k) * 6}
                        cy="0"
                        r={9 + (1 - k) * 12}
                        fill="none"
                        stroke={auraColor}
                        strokeWidth="2.8"
                      />
                      <path d={`M-2,0 L${13 + k * 9},-6 L${8 + k * 4},0 L${13 + k * 9},6 Z`} fill="#FEF08A" />
                    </g>
                  )}
                </g>
              )}

              {/* MECHANIST: Hextech Railgun Barrel + Plasma Recoil Blast */}
              {type === 'MECHANIST' && (
                <g transform={`translate(${firing ? -kick * 7.5 : 0}, 1)`}>
                  <path
                    d="M2,-3.8 L18,-4.5 L22,-2.8 L22,2.8 L18,4.5 L2,3.8 Z"
                    fill="#1E293B"
                    stroke="#0F172A"
                    strokeWidth="1.3"
                  />
                  <line x1="7" y1="-3.5" x2="7" y2="3.5" stroke={auraColor} strokeWidth="1.8" />
                  <line x1="13" y1="-3.5" x2="13" y2="3.5" stroke={auraColor} strokeWidth="1.8" />
                  {isWinding && (
                    <circle cx="22.5" cy="0" r={2 + w * 3.2} fill={auraColor} opacity={0.45 + w * 0.55} />
                  )}
                  {firing && (
                    <g opacity={Math.min(1, k * 1.45)}>
                      <polygon
                        points={`22,0 ${36 + k * 8},-7 ${28 + k * 4},0 ${36 + k * 8},7`}
                        fill={auraColor}
                      />
                      <circle cx="24" cy="0" r={5.2 * k + 2} fill="#FFFFFF" />
                    </g>
                  )}
                </g>
              )}
            </g>
          )}
        </g>
      );
    }

    if (type === 'ARCHER') {
      const isPoison = branch === 'RANGER_POISON';
      const isSniper = branch === 'SNIPER_CRIT';

      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch, mythicCfg?.accentColor)}
          {isMythicForm && renderMythicFormBack(mythicIndex, mythicCfg!.accentColor)}

          {level === 1 &&
            renderArcherHero({
              x: 0,
              y: -1,
              scale: 1.08,
              cloak: '#16A34A',
              cloakDark: '#14532D',
              hatColor: '#15803D',
              trimColor: '#F59E0B',
              arrowColor: '#FEF08A',
              bowColor: '#B45309',
              aimRight,
              bowTiltDeg,
              firing,
            })}

          {level === 2 && (
            <>
              {renderArcherHero({
                x: -7.5,
                y: -4,
                scale: 0.96,
                cloak: '#15803D',
                cloakDark: '#052E16',
                hatColor: '#047857',
                trimColor: '#FACC15',
                arrowColor: '#FEF08A',
                bowColor: '#F59E0B',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
              })}
              {renderArcherHero({
                x: 8,
                y: 0,
                scale: 0.98,
                cloak: '#16A34A',
                cloakDark: '#14532D',
                hatColor: '#15803D',
                trimColor: '#FACC15',
                arrowColor: '#FEF08A',
                bowColor: '#F59E0B',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
              })}
            </>
          )}

          {level === 3 && (
            <>
              {renderArcherHero({
                x: -10.5,
                y: -2,
                scale: 0.88,
                cloak: '#0284C7',
                cloakDark: '#1E3A8A',
                hatColor: '#0369A1',
                trimColor: '#FACC15',
                arrowColor: '#FEF08A',
                bowColor: '#F59E0B',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
              })}
              {renderArcherHero({
                x: 0,
                y: -7,
                scale: 0.94,
                cloak: '#15803D',
                cloakDark: '#052E16',
                hatColor: '#16A34A',
                trimColor: '#FACC15',
                arrowColor: '#FEF08A',
                bowColor: '#F59E0B',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
              })}
              {renderArcherHero({
                x: 10.5,
                y: 0,
                scale: 0.9,
                cloak: '#0284C7',
                cloakDark: '#1E3A8A',
                hatColor: '#0369A1',
                trimColor: '#FACC15',
                arrowColor: '#FEF08A',
                bowColor: '#F59E0B',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
              })}
            </>
          )}

          {isPoison && (
            <>
              <circle cx="0" cy="4" r="16" fill="#22C55E" opacity="0.2" className="td-anim-glow" />
              {renderArcherHero({
                x: -10.5,
                y: -2,
                scale: 0.9,
                cloak: '#15803D',
                cloakDark: '#052E16',
                hatColor: '#22C55E',
                trimColor: '#86EFAC',
                arrowColor: '#4ADE80',
                bowColor: '#4ADE80',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
                isPoison: true,
              })}
              {renderArcherHero({
                x: 0,
                y: -7,
                scale: 0.96,
                cloak: '#166534',
                cloakDark: '#052E16',
                hatColor: '#16A34A',
                trimColor: '#A3E635',
                arrowColor: '#4ADE80',
                bowColor: '#86EFAC',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
                isPoison: true,
              })}
              {renderArcherHero({
                x: 10.5,
                y: 0,
                scale: 0.9,
                cloak: '#15803D',
                cloakDark: '#052E16',
                hatColor: '#22C55E',
                trimColor: '#86EFAC',
                arrowColor: '#4ADE80',
                bowColor: '#4ADE80',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
                isPoison: true,
              })}
            </>
          )}

          {isSniper && (
            <>
              <circle cx="0" cy="2" r="15" fill="#FACC15" opacity="0.18" className="td-anim-glow" />
              {renderArcherHero({
                x: -7.5,
                y: -4,
                scale: 1.06,
                cloak: '#B91C1C',
                cloakDark: '#7F1D1D',
                hatColor: '#FACC15',
                trimColor: '#FEF08A',
                arrowColor: '#FEF08A',
                bowColor: '#FACC15',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
                isSniper: true,
              })}
              {renderArcherHero({
                x: 8,
                y: 0,
                scale: 1.06,
                cloak: '#991B1B',
                cloakDark: '#7F1D1D',
                hatColor: '#FACC15',
                trimColor: '#FEF08A',
                arrowColor: '#FEF08A',
                bowColor: '#FACC15',
                aimRight,
                bowTiltDeg,
                firing,
                hasFeather: true,
                isSniper: true,
              })}
            </>
          )}
        </g>
      );
    }

    if (type === 'BARRACKS') {
      const isPaladin = branch === 'PALADIN';
      const isBarb = branch === 'BARBARIAN';
      const armor = isPaladin ? '#F8FAFC' : isBarb ? '#B91C1C' : level >= 3 ? '#0284C7' : '#2563EB';
      const cape = isPaladin ? '#1D4ED8' : isBarb ? '#450A0A' : '#1E3A8A';
      const crest = isPaladin ? '#FACC15' : isBarb ? '#F87171' : '#93C5FD';

      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch)}

          {isPaladin && <circle cx="0" cy="0" r="16.5" fill="#FEF08A" opacity="0.22" className="td-anim-glow" />}

          {level >= 2 &&
            renderBarracksCommander({
              x: -9.5,
              y: -3,
              scale: 0.88,
              armor,
              cape,
              crest,
              isPaladin,
              isBarb,
              hasBanner: false,
            })}
          {level >= 3 &&
            renderBarracksCommander({
              x: 10.5,
              y: -1,
              scale: 0.88,
              armor,
              cape,
              crest,
              isPaladin,
              isBarb,
              hasBanner: false,
            })}
          {renderBarracksCommander({
            x: 1,
            y: level >= 2 ? 0 : -2,
            scale: 1.08,
            armor,
            cape,
            crest,
            isPaladin,
            isBarb,
            hasBanner: true,
          })}
        </g>
      );
    }

    if (type === 'MAGE') {
      const isArcane = branch === 'ARCANE_BEAM';
      const isStorm = branch === 'STORM_CHAIN';
      const crystal = isArcane ? '#38BDF8' : isStorm ? '#60A5FA' : '#C084FC';
      const robe = isArcane ? '#0F766E' : isStorm ? '#1E3A8A' : level >= 2 ? '#5B21B6' : '#4338CA';
      const hat = isArcane ? '#0284C7' : isStorm ? '#0369A1' : '#7C3AED';

      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch)}
          {/* Rotating Arcane Sigil Ring */}
          <g transform="translate(0, 9.2) scale(1, 0.34)">
            <g className="td-anim-spin">
              <circle cx="0" cy="0" r="16" fill="none" stroke={crystal} strokeWidth="1.9" strokeDasharray="5 3" />
              <polygon points="0,-13 11,6 -11,6" fill="none" stroke="#FEF08A" strokeWidth="1" opacity="0.7" />
            </g>
          </g>

          {/* Orbiting Floating Frost Crystal */}
          <g className="td-anim-orb">
            <polygon points="0,-42 5.5,-34 0,-26 -5.5,-34" fill={crystal} stroke="#FFFFFF" strokeWidth="1.2" opacity="0.95" />
          </g>

          {level === 1 &&
            renderMageHero({
              x: 0,
              y: -1,
              scale: 1.08,
              robe,
              robeTrim: '#7DD3FC',
              hat,
              crystal,
              aimRight,
              firing,
              isFrost: true,
            })}

          {level === 2 && (
            <>
              {renderMageHero({
                x: -7.5,
                y: -4,
                scale: 0.96,
                robe,
                robeTrim: '#7DD3FC',
                hat,
                crystal,
                aimRight,
                firing,
                isFrost: true,
              })}
              {renderMageHero({
                x: 8,
                y: 0,
                scale: 0.98,
                robe,
                robeTrim: '#FDE68A',
                hat,
                crystal,
                aimRight,
                firing,
                isFrost: true,
              })}
            </>
          )}

          {(level === 3 || isArcane || isStorm) && (
            <>
              {renderMageHero({
                x: -10.5,
                y: -2,
                scale: 0.9,
                robe,
                robeTrim: '#7DD3FC',
                hat,
                crystal,
                aimRight,
                firing,
                hasCrown: level >= 4,
                isFrost: true,
                isStorm,
              })}
              {renderMageHero({
                x: 0,
                y: -7,
                scale: 0.98,
                robe,
                robeTrim: '#FEF08A',
                hat,
                crystal,
                aimRight,
                firing,
                hasCrown: true,
                isFrost: true,
                isStorm,
              })}
              {renderMageHero({
                x: 10.5,
                y: 0,
                scale: 0.9,
                robe,
                robeTrim: '#7DD3FC',
                hat,
                crystal,
                aimRight,
                firing,
                hasCrown: level >= 4,
                isFrost: true,
                isStorm,
              })}
            </>
          )}
        </g>
      );
    }

    if (type === 'ARTILLERY') {
      const isTesla = branch === 'TESLA_COIL';
      const isBertha = branch === 'BIG_BERTHA';
      const armor = isTesla ? '#0284C7' : isBertha ? '#B91C1C' : '#EA580C';
      const helm = isTesla ? '#38BDF8' : isBertha ? '#FACC15' : '#64748B';
      const barrel = isBertha ? '#991B1B' : '#475569';

      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch)}

          {level === 1 &&
            renderArtilleryHero({
              x: 0,
              y: -1,
              scale: 1.06,
              armor,
              helm,
              barrel,
              aimRight,
              deg,
              firing,
            })}

          {(level === 2 || isTesla || isBertha) && (
            <>
              {renderArtilleryHero({
                x: -8.5,
                y: -4,
                scale: 0.96,
                armor,
                helm,
                barrel,
                aimRight,
                deg,
                firing,
                isTesla,
                isBertha,
              })}
              {renderArtilleryHero({
                x: 8.5,
                y: 0,
                scale: 0.98,
                armor,
                helm,
                barrel,
                aimRight,
                deg,
                firing,
                isTesla,
                isBertha,
              })}
            </>
          )}

          {level === 3 && (
            <>
              {renderArtilleryHero({
                x: -10.5,
                y: -2,
                scale: 0.88,
                armor,
                helm,
                barrel,
                aimRight,
                deg,
                firing,
              })}
              {renderArtilleryHero({
                x: 0,
                y: -7,
                scale: 0.92,
                armor,
                helm,
                barrel,
                aimRight,
                deg,
                firing,
              })}
              {renderArtilleryHero({
                x: 10.5,
                y: 0,
                scale: 0.88,
                armor,
                helm,
                barrel,
                aimRight,
                deg,
                firing,
              })}
            </>
          )}
        </g>
      );
    }

    if (type === 'ASSASSIN') {
      const isShadow = branch === 'SHADOW_BLADE';
      const isVenom = branch === 'VENOM_FANG';
      const suit = isVenom ? '#064E3B' : isShadow ? '#312E81' : '#1E1B4B';
      const scarf = isVenom ? '#22C55E' : isShadow ? '#FACC15' : '#F43F5E';
      const eyeColor = isVenom ? '#4ADE80' : isShadow ? '#38BDF8' : '#FB7185';
      const bladeColor = isVenom ? '#86EFAC' : isShadow ? '#7DD3FC' : '#E2E8F0';

      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch)}
          {/* Orbiting Shuriken Halo */}
          <g transform="translate(0, 9.2) scale(1, 0.34)">
            <g className="td-anim-spin">
              <circle cx="0" cy="0" r="14.5" fill="none" stroke={eyeColor} strokeWidth="1.5" strokeDasharray="3 5" />
            </g>
          </g>

          {level === 1 &&
            renderAssassinHero({
              x: 0,
              y: -1,
              scale: 1.08,
              suit,
              scarf,
              eyeColor,
              bladeColor,
              aimRight,
              firing,
            })}

          {level === 2 && (
            <>
              {renderAssassinHero({
                x: -7.5,
                y: -4,
                scale: 0.96,
                suit,
                scarf,
                eyeColor,
                bladeColor,
                aimRight,
                firing,
              })}
              {renderAssassinHero({
                x: 8,
                y: 0,
                scale: 0.98,
                suit,
                scarf,
                eyeColor,
                bladeColor,
                aimRight,
                firing,
              })}
            </>
          )}

          {(level === 3 || isShadow || isVenom) && (
            <>
              {renderAssassinHero({
                x: -10.5,
                y: -2,
                scale: 0.9,
                suit,
                scarf,
                eyeColor,
                bladeColor,
                aimRight,
                firing,
                isShadow,
                isVenom,
              })}
              {renderAssassinHero({
                x: 0,
                y: -7,
                scale: 0.96,
                suit,
                scarf,
                eyeColor,
                bladeColor,
                aimRight,
                firing,
                isShadow,
                isVenom,
              })}
              {renderAssassinHero({
                x: 10.5,
                y: 0,
                scale: 0.9,
                suit,
                scarf,
                eyeColor,
                bladeColor,
                aimRight,
                firing,
                isShadow,
                isVenom,
              })}
            </>
          )}
        </g>
      );
    }

    if (type === 'KNIGHT_GUARD') {
      const isAegis = branch === 'AEGIS_WARDEN';
      const armor = isAegis ? '#0284C7' : '#B91C1C';
      const cape = isAegis ? '#1E3A8A' : '#450A0A';
      const crest = isAegis ? '#7DD3FC' : '#FACC15';
      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch)}
          <circle cx="0" cy="1" r="16" fill={crest} opacity="0.16" className="td-anim-glow" />
          {renderBarracksCommander({
            x: 0,
            y: -2,
            scale: 1.08,
            armor,
            cape,
            crest,
            isPaladin: !isAegis,
            isBarb: false,
            hasBanner: true,
          })}
        </g>
      );
    }

    if (type === 'PYROMANCER') {
      const isPhoenix = branch === 'PHOENIX_SAGE';
      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch)}
          <circle cx="0" cy="1" r="16" fill={isPhoenix ? '#FACC15' : '#F97316'} opacity="0.2" className="td-anim-glow" />
          {renderMageHero({
            x: 0,
            y: -2,
            scale: 1.08,
            robe: '#7C2D12',
            robeTrim: isPhoenix ? '#FEF08A' : '#FB923C',
            hat: '#DC2626',
            crystal: isPhoenix ? '#FACC15' : '#F97316',
            aimRight,
            firing,
            hasCrown: level >= 4,
          })}
        </g>
      );
    }

    if (type === 'MECHANIST') {
      const isRocket = branch === 'ROCKET_BATTERY';
      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch)}
          {renderArtilleryHero({
            x: 0,
            y: -2,
            scale: 1.06,
            armor: '#0F766E',
            helm: '#38BDF8',
            barrel: isRocket ? '#B45309' : '#0284C7',
            aimRight,
            deg,
            firing,
            isTesla: true,
          })}
        </g>
      );
    }

    if (type === 'CHRONOMANCER') {
      const isVoid = branch === 'VOID_SOVEREIGN';
      return (
        <g transform={`scale(${scaleBoost})`}>
          {renderHeroPedestal(type, level, branch)}
          <g transform="translate(0, 9) scale(1, 0.34)">
            <g className="td-anim-spin">
              <circle cx="0" cy="0" r="17" fill="none" stroke={isVoid ? '#F43F5E' : '#C084FC'} strokeWidth="2" strokeDasharray="4 4" />
            </g>
          </g>
          {renderValkyrieHero({
            x: 0,
            y: -2,
            scale: 1.08,
            armor: isVoid ? '#4C1D95' : '#6D28D9',
            trim: '#FEF08A',
            wingGrad: 'url(#tdFrostWingGrad)',
            spearColor: isVoid ? '#FB7185' : '#E879F9',
            aimRight,
            firing,
            isSeraph: true,
          })}
        </g>
      );
    }

    // VALKYRIE -> Celestial Winged Thánh Nữ
    const isSeraph = branch === 'SOLAR_SERAPH';
    const isFrostValk = branch === 'FROST_VALKYRIE';
    const armor = isFrostValk ? '#0284C7' : isSeraph ? '#B45309' : '#DC2626';
    const trim = isFrostValk ? '#E0F2FE' : 'url(#tdGoldGrad)';
    const wingGrad = isFrostValk ? 'url(#tdFrostWingGrad)' : 'url(#tdSolarWingGrad)';
    const spearColor = isFrostValk ? '#7DD3FC' : '#FEF08A';

    return (
      <g transform={`scale(${scaleBoost})`}>
        {renderHeroPedestal(type, level, branch)}
        <circle
          cx="0"
          cy="1"
          r="17"
          fill={isFrostValk ? '#38BDF8' : '#FACC15'}
          opacity="0.16"
          className="td-anim-glow"
        />

        {level === 1 &&
          renderValkyrieHero({
            x: 0,
            y: -1,
            scale: 1.08,
            armor,
            trim,
            wingGrad,
            spearColor,
            aimRight,
            firing,
          })}

        {level === 2 && (
          <>
            {renderValkyrieHero({
              x: -8,
              y: -4,
              scale: 0.94,
              armor,
              trim,
              wingGrad,
              spearColor,
              aimRight,
              firing,
            })}
            {renderValkyrieHero({
              x: 8.5,
              y: 0,
              scale: 0.96,
              armor,
              trim,
              wingGrad,
              spearColor,
              aimRight,
              firing,
            })}
          </>
        )}

        {(level === 3 || isSeraph || isFrostValk) && (
          <>
            {renderValkyrieHero({
              x: -11,
              y: -2,
              scale: 0.88,
              armor,
              trim,
              wingGrad,
              spearColor,
              aimRight,
              firing,
              isSeraph,
              isFrost: isFrostValk,
            })}
            {renderValkyrieHero({
              x: 0,
              y: -7.5,
              scale: 0.96,
              armor,
              trim,
              wingGrad,
              spearColor,
              aimRight,
              firing,
              isSeraph: true,
              isFrost: isFrostValk,
            })}
            {renderValkyrieHero({
              x: 11,
              y: 0,
              scale: 0.88,
              armor,
              trim,
              wingGrad,
              spearColor,
              aimRight,
              firing,
              isSeraph,
              isFrost: isFrostValk,
            })}
          </>
        )}
      </g>
    );
  }
);

TdTowerSprite.displayName = 'TdTowerSprite';

interface TdEnemySpriteProps {
  type: TdEnemyType;
  hpRatio: number;
  hitFlash: boolean;
  slowed: boolean;
  poisoned: boolean;
  burned?: boolean;
  enraged?: boolean;
  facingLeft: boolean;
  isAttacking?: boolean;
  isHealing?: boolean;
  hideHud?: boolean;
}

const BOSS_ENEMY_SET = new Set<TdEnemyType>([
  'BOSS',
  'PLAGUE_HYDRA',
  'ABYSS_OVERLORD',
  'DRAGON_EMPEROR',
  'DOOM_COLOSSUS',
]);

export const TdEnemySprite: React.FC<TdEnemySpriteProps> = React.memo(
  ({
    type,
    hpRatio,
    hitFlash,
    slowed,
    poisoned,
    burned = false,
    enraged = false,
    facingLeft,
    isAttacking = false,
    isHealing = false,
    hideHud = false,
  }) => {
    const animeSrc = useTdAnimeSprite(resolveEnemyAnimeKey(type));
    const flip = facingLeft ? -1 : 1;
    const isFlying = type === 'WYVERN' || type === 'HARPY' || type === 'SHADOW_REAPER';
    const isBoss = BOSS_ENEMY_SET.has(type);
    const isTitan = type === 'VOID_TITAN' || type === 'BROOD_MOTHER';
    const isMite = type === 'MITE';

    const barW = isBoss
      ? 62
      : type === 'MINIBOSS' || isTitan
        ? 40
        : type === 'GOLEM' || type === 'KNIGHT_DARK'
          ? 32
          : isMite
            ? 18
            : 24;
    const barY = isBoss
      ? -74
      : type === 'MINIBOSS' || isTitan
        ? -44
        : type === 'GOLEM' || type === 'KNIGHT_DARK' || isFlying
          ? -35
          : isMite
            ? -21
            : -28;
    const animClass = isAttacking
      ? 'td-anim-lunge'
      : type === 'WOLF' || type === 'SPIDER' || type === 'BROODLING' || isMite
        ? 'td-anim-pounce'
        : type === 'GOLEM' || isBoss || type === 'MINIBOSS' || type === 'KNIGHT_DARK' || isTitan
          ? 'td-anim-stomp'
          : 'td-anim-walk';

    const baseFilter =
      isMite
        ? 'hue-rotate(-28deg) saturate(1.45) contrast(1.1)'
        : enraged
          ? 'drop-shadow(0 0 6px #EF4444) saturate(1.3)'
          : undefined;

    const combinedFilter =
      burned && hitFlash
        ? 'sepia(0.95) hue-rotate(-38deg) saturate(3.6) brightness(1.38)'
        : burned
          ? 'sepia(0.95) hue-rotate(-38deg) saturate(3.4) brightness(1.04)'
          : poisoned && hitFlash
            ? 'sepia(0.92) hue-rotate(74deg) saturate(2.9) brightness(1.42)'
            : poisoned
              ? 'sepia(0.92) hue-rotate(74deg) saturate(2.7) brightness(0.96)'
              : hitFlash
                ? 'brightness(1.55) saturate(1.25)'
                : baseFilter;

    if (animeSrc) {
      const boxSize = hideHud
        ? isBoss
          ? 48
          : type === 'MINIBOSS' || isTitan
            ? 46
            : isMite
              ? 30
              : 42
        : type === 'DRAGON_EMPEROR' || type === 'ABYSS_OVERLORD' || type === 'DOOM_COLOSSUS'
          ? 106
          : type === 'PLAGUE_HYDRA' || type === 'BOSS'
            ? 96
            : type === 'MINIBOSS' || type === 'BROOD_MOTHER' || type === 'VOID_TITAN'
              ? 56
              : type === 'GOLEM' || type === 'KNIGHT_DARK' || type === 'SHADOW_REAPER'
                ? 48
                : isFlying || type === 'ORC' || type === 'SHAMAN' || type === 'NECRO'
                  ? 42
                  : type === 'BROODLING'
                    ? 32
                    : isMite
                      ? 23
                      : 35;
      const anchorY = hideHud ? 12 : isFlying ? 4 : isBoss ? 18 : isMite ? 9 : 12;

      return (
        <g>
          {/* Dread Boss Aura Ring */}
          {isBoss && !hideHud && (
            <ellipse
              cx="0"
              cy="14"
              rx={enraged ? 38 : 34}
              ry="12.5"
              fill={enraged ? '#EF4444' : '#7F1D1D'}
              fillOpacity={enraged ? 0.34 : 0.24}
              stroke={enraged ? '#FCA5A5' : '#EF4444'}
              strokeWidth={enraged ? '2.4' : '1.8'}
              strokeDasharray="6 4"
              className="td-anim-glow"
            />
          )}

          <ellipse
            cx="0"
            cy={isFlying && !hideHud ? 16 : isBoss ? 16 : 11.5}
            rx={isBoss ? 30 : type === 'MINIBOSS' || isTitan ? 18 : type === 'GOLEM' ? 15 : isMite ? 8 : 11}
            ry={isBoss ? 10 : isMite ? 3.5 : 4.6}
            fill="#020617"
            opacity="0.54"
          />

          <g
            transform={`scale(${flip}, 1)`}
            className={hitFlash ? 'td-anim-hit' : undefined}
            style={combinedFilter ? { filter: combinedFilter } : undefined}
          >
            <g className={animClass}>
              {isHealing && (
                <circle
                  cx="0"
                  cy="-10"
                  r={isBoss ? 38 : 22}
                  fill={type === 'NECRO' || type === 'SHADOW_REAPER' ? '#C084FC' : '#2DD4BF'}
                  opacity="0.28"
                  stroke={type === 'NECRO' || type === 'SHADOW_REAPER' ? '#C084FC' : '#2DD4BF'}
                  strokeWidth="2"
                />
              )}
              <image
                href={animeSrc}
                x={-boxSize / 2}
                y={anchorY - boxSize}
                width={boxSize}
                height={boxSize}
                preserveAspectRatio="xMidYMax meet"
              />
            </g>
            {isAttacking && (
              <g className="td-anim-slash-arc">
                <path d="M-2,-11 Q12,0 -2,11 Q5,0 -2,-11 Z" fill="#EF4444" opacity="0.72" />
                <path d="M0,-8 Q9,0 0,8 Q4,0 0,-8 Z" fill="#FEF08A" />
              </g>
            )}
          </g>

          {slowed && (
            <circle
              cx="0"
              cy={isBoss ? -18 : -4}
              r={isBoss ? 36 : 15.5}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}
          {poisoned && (
            <g className="pointer-events-none">
              <ellipse
                cx="0"
                cy="9"
                rx={isBoss ? 30 : 14}
                ry={isBoss ? 10 : 5}
                fill="#22C55E"
                opacity="0.28"
              />
              <circle
                cx="0"
                cy={isBoss ? -18 : -4}
                r={isBoss ? 33 : 14.5}
                fill="none"
                stroke="#4ADE80"
                strokeWidth="2"
              />
              <circle cx="-8" cy="-14" r="2.2" fill="#4ADE80" stroke="#052E16" strokeWidth="0.7" className="td-anim-orb" />
              <circle cx="9" cy="-18" r="1.9" fill="#86EFAC" stroke="#052E16" strokeWidth="0.7" className="td-anim-orb" />
              <circle cx="2" cy="-22" r="1.6" fill="#22C55E" opacity="0.9" className="td-anim-orb" />
            </g>
          )}
          {burned && (
            <g className="pointer-events-none">
              <ellipse
                cx="0"
                cy="10"
                rx={isBoss ? 30 : 14}
                ry={isBoss ? 9 : 4.5}
                fill="#EF4444"
                opacity="0.38"
              />
              <circle
                cx="0"
                cy={isBoss ? -18 : -4}
                r={isBoss ? 34 : 15}
                fill="none"
                stroke="#EF4444"
                strokeWidth="1.8"
                opacity="0.85"
              />
              <polygon points="-9,-6 -6,-17 -2,-8" fill="#EF4444" opacity="0.92" className="td-anim-torch" />
              <polygon points="4,-8 8,-19 11,-6" fill="#FCA5A5" opacity="0.9" className="td-anim-torch" />
            </g>
          )}

          {!hideHud && (
            <>
              <rect
                x={-barW / 2}
                y={barY}
                width={barW}
                height={isBoss ? '6.2' : '4.8'}
                rx="1.8"
                fill="#0F172A"
                stroke={isBoss ? (enraged ? '#EF4444' : '#FACC15') : '#0F172A'}
                strokeWidth={isBoss ? '1.3' : '1'}
              />
              <rect
                x={-barW / 2 + 0.7}
                y={barY + 0.7}
                width={Math.max(0, (barW - 1.4) * hpRatio)}
                height={isBoss ? '4.8' : '3.6'}
                rx="1"
                fill={
                  isBoss
                    ? enraged
                      ? '#EF4444'
                      : '#F97316'
                    : hpRatio > 0.5
                      ? '#22C55E'
                      : hpRatio > 0.25
                        ? '#FACC15'
                        : '#EF4444'
                }
              />
              {isBoss && (
                <polygon
                  points={`${-barW / 2 - 5},${barY + 5} ${-barW / 2 - 2},${barY - 2} ${-barW / 2 + 1},${barY + 5}`}
                  fill="#FACC15"
                  stroke="#0F172A"
                  strokeWidth="0.9"
                />
              )}
            </>
          )}
        </g>
      );
    }

    return (
      <g>
        <ellipse
          cx="0"
          cy={isFlying ? 18 : 11.5}
          rx={isBoss ? 30 : type === 'MINIBOSS' || isTitan ? 18 : type === 'GOLEM' ? 16 : isMite ? 8 : 11.5}
          ry={isBoss ? 10 : 5}
          fill="#020617"
          opacity="0.52"
        />

        <g
          transform={`scale(${flip}, 1)`}
          opacity={hitFlash ? 0.68 : 1}
          style={
            burned
              ? { filter: 'sepia(0.95) hue-rotate(-38deg) saturate(3.4) brightness(1.04)' }
              : poisoned
                ? { filter: 'sepia(0.92) hue-rotate(74deg) saturate(2.7) brightness(0.96)' }
                : undefined
          }
        >
          {/* 1. GOBLIN — Hunched Raider with Leather Harness, Jagged Ears & Curved Scimitar */}
          {type === 'GOBLIN' && (
            <g className={animClass}>
              {/* Clawed Feet */}
              <path d="M-6.5,7.5 C-7,10.5 -2,10.8 -1.5,7.8 Z" fill="#14532D" stroke="#052E16" strokeWidth="1" />
              <path d="M1.5,7.8 C2,10.8 7,10.5 6.5,7.5 Z" fill="#14532D" stroke="#052E16" strokeWidth="1" />
              {/* Hunched Muscled Torso & Leather Jerkin */}
              <path
                d="M-7,7.5 C-7.8,2 -6.5,-2 -4.5,-4 C-1,-5 2,-5 5,-3.5 C6.8,-1.5 7.5,2.5 7,7.5 C3,8.5 -3,8.5 -7,7.5 Z"
                fill="url(#tdOrcArmorGrad)"
                stroke="#052E16"
                strokeWidth="1.4"
              />
              <path d="M-5.8,-1.2 L5.8,3.2" stroke="#F59E0B" strokeWidth="1.8" opacity="0.9" />
              {/* Long Pointed Raider Ears */}
              <path d="M-6.5,-8.5 C-12,-11 -16.5,-15.5 -17,-15 C-13.5,-10 -10,-6.5 -5.8,-6 Z" fill="url(#tdGoblinSkinGrad)" stroke="#052E16" strokeWidth="1.2" />
              <path d="M6.5,-8.5 C12,-11 16.5,-15.5 17,-15 C13.5,-10 10,-6.5 5.8,-6 Z" fill="url(#tdGoblinSkinGrad)" stroke="#052E16" strokeWidth="1.2" />
              {/* Sculpted Goblin Skull & Jaw */}
              <path
                d="M-7.5,-8.5 C-7.5,-14.5 7.5,-14.5 7.5,-8.5 C7.5,-4.5 4,-2.2 0,-2.2 C-4,-2.2 -7.5,-4.5 -7.5,-8.5 Z"
                fill="url(#tdGoblinSkinGrad)"
                stroke="#052E16"
                strokeWidth="1.5"
              />
              {/* Crimson War Bandana */}
              <path d="M-7.5,-9.5 C-3,-13.5 3,-13.5 7.5,-9.5 C3,-11 -3,-11 -7.5,-9.5 Z" fill="#DC2626" stroke="#052E16" strokeWidth="1" />
              {/* Fierce Eyes & Sharp Snarl */}
              <path d="M-4.5,-8.5 L-1,-7.2 M4.5,-8.5 L1,-7.2" stroke="#052E16" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="-2.4" cy="-7" r="1.8" fill="#FEF08A" stroke="#052E16" strokeWidth="0.8" />
              <circle cx="3.2" cy="-7" r="1.8" fill="#FEF08A" stroke="#052E16" strokeWidth="0.8" />
              <circle cx="-2" cy="-7" r="0.85" fill="#DC2626" />
              <circle cx="3.6" cy="-7" r="0.85" fill="#DC2626" />
              <path d="M-2.5,-4 L-1.5,-5.5 L0,-4 L1.5,-5.5 L2.5,-4" fill="#FEF9C3" />
              {/* Buckler Shield & Curved Raider Scimitar */}
              <path d="M-9.5,2 C-9.5,-2 -4,-2 -4,2 C-4,6 -9.5,6 -9.5,2 Z" fill="url(#tdBronzeGrad)" stroke="#0F172A" strokeWidth="1.1" />
              <g transform={isAttacking ? 'translate(3, -3) rotate(32 6 0)' : ''}>
                <path d="M5.5,1 C11,-1.5 16,-5 14,-12 C11.5,-7 8.5,-4 5,-1 Z" fill="url(#tdSteelGrad)" stroke="#0F172A" strokeWidth="1.2" />
              </g>
            </g>
          )}

          {/* 2. WOLF — Feral Dire Wolf with Muscular Haunches, Spiked Mane & Snapping Jaws */}
          {type === 'WOLF' && (
            <g className={animClass}>
              {/* Sweeping Bushy Tail */}
              <path d="M-10,-1 C-16,-5 -21,-11 -18,-16 C-13,-12 -10,-7 -8,-2 Z" fill="url(#tdWolfFurGrad)" stroke="#0F172A" strokeWidth="1.3" />
              {/* Muscular Running Legs */}
              <path d="M-9,3 C-10,6.5 -12.5,8.5 -12.5,10.5" stroke="#0F172A" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M-4,4 C-4.5,7 -6,9 -5.5,10.5" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M6,3.5 C8.5,6.5 11.5,8 12,10" stroke="#0F172A" strokeWidth="3.4" strokeLinecap="round" />
              {/* Organic Wolf Body & Ribcage */}
              <path
                d="M-12,-1 C-11.5,-7 -2,-8 7,-5.5 C12,-4 12,3.5 7.5,4.8 C-1,6 -11.5,4.5 -12,-1 Z"
                fill="url(#tdWolfFurGrad)"
                stroke="#0F172A"
                strokeWidth="1.6"
              />
              {/* Crimson Blood-Mane & Dorsal Fur */}
              <path d="M-3,-6.5 L1,-14.5 L6,-7.5 L10,-13.5 L10.5,-4.5 C6,-5.5 1,-6.2 -3,-6.5 Z" fill="#991B1B" stroke="#0F172A" strokeWidth="1.1" />
              {/* Wolf Snout & Jaws */}
              <path d="M5,-6.5 C10,-6.8 15,-5.5 18.5,-3.2 C16.5,-0.5 13,1.5 6,2 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.4" />
              <path d="M9,1.2 C12.5,1.5 16,3.5 17,5.2 C13.5,5.2 10.5,4 8.5,2.5 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
              {/* Glowing Predator Eye & Razor Fangs */}
              <path d="M9,-4 L13,-3.2 L10.5,-1.5 Z" fill="#EF4444" />
              <circle cx="11" cy="-3" r="0.8" fill="#FEF08A" />
              <polygon points="13,-0.5 14.2,3 15.8,-0.5" fill="#FFFFFF" />
            </g>
          )}

          {/* 3. SPIDER — Armored Venom Arachnid with Segmented Abdomen & Articulated Legs */}
          {type === 'SPIDER' && (
            <g className={animClass}>
              {/* 6 Articulated Chitin Legs */}
              <path d="M-4,-2 L-14,-10 L-18,4 M-2,2 L-14,0 L-16,10 M0,4 L-10,6 L-11,12" fill="none" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M-4,-2 L-14,-10 L-18,4 M-2,2 L-14,0 L-16,10 M0,4 L-10,6 L-11,12" fill="none" stroke="#4D7C0F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4,-2 L14,-10 L18,4 M2,2 L14,0 L16,10 M0,4 L10,6 L11,12" fill="none" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4,-2 L14,-10 L18,4 M2,2 L14,0 L16,10 M0,4 L10,6 L11,12" fill="none" stroke="#4D7C0F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Segmented Venom Abdomen */}
              <path
                d="M-13,-3.5 C-13,-10.5 -2,-12 2.5,-6.5 C4.5,-3 2.5,3 -3,4 C-9,4.5 -13,1.5 -13,-3.5 Z"
                fill="url(#tdSpiderChitinGrad)"
                stroke="#0F172A"
                strokeWidth="1.6"
              />
              <path d="M-5,-8.5 L-8.5,-4 L-5,0.5 L-1.5,-4 Z" fill="#A3E635" opacity="0.9" />
              {/* Armored Cephalothorax & Multiple Venom Eyes */}
              <path
                d="M1,-2 C1,-7.5 11.5,-7.5 11.5,-1.5 C11.5,3.5 8,5.2 4.5,4.8 C2,4.5 1,1.5 1,-2 Z"
                fill="#1E293B"
                stroke="#0F172A"
                strokeWidth="1.5"
              />
              <circle cx="7.5" cy="-3.2" r="1.7" fill="#A3E635" />
              <circle cx="10.2" cy="-1.2" r="1.4" fill="#A3E635" />
              <circle cx="5.2" cy="-1.2" r="1.1" fill="#BEF264" />
              {/* Dripping Venom Mandibles */}
              <path d="M8.5,2.2 C11.5,3.8 13,6.5 12.2,8 C10,6.5 8.5,5 7,3.5 Z" fill="#4ADE80" stroke="#052E16" strokeWidth="0.8" />
            </g>
          )}

          {/* 4. ORC — Hulking Ironclad War-Orc with Curved Shoulder Spikes, Tusks & Heavy Cleaver */}
          {type === 'ORC' && (
            <g className={animClass}>
              {/* Heavy Armored Boots */}
              <path d="M-9.5,5.5 C-10,10.5 -3,11 -2.5,6 Z" fill="#3F6212" stroke="#0F172A" strokeWidth="1.4" />
              <path d="M2.5,6 C3,11 10,10.5 9.5,5.5 Z" fill="#3F6212" stroke="#0F172A" strokeWidth="1.4" />
              {/* Hulking Muscular Chest & Iron Armor */}
              <path
                d="M-11.5,6.2 C-12.5,-0.5 -12.2,-7.5 -9.5,-11.5 C-4,-13.5 4,-13.5 9.5,-11.5 C12.2,-7.5 12.5,-0.5 11.5,6.2 C5,7.8 -5,7.8 -11.5,6.2 Z"
                fill="url(#tdOrcArmorGrad)"
                stroke="#0F172A"
                strokeWidth="1.8"
              />
              <path d="M-9,-3 Q0,-0.5 9,-3" fill="none" stroke="url(#tdGoldGrad)" strokeWidth="1.6" />
              {/* Spiked Steel Pauldron */}
              <path d="M-14.5,-8.5 C-13,-13.5 -8,-15 -5,-10 C-6.5,-6 -11,-5 -14.5,-8.5 Z" fill="url(#tdSteelGrad)" stroke="#0F172A" strokeWidth="1.3" />
              {/* Sculpted Orc Head, Heavy Brow & Curved Ivory Tusks */}
              <path
                d="M-7.5,-14.5 C-7.5,-21 7.5,-21 7.5,-14.5 C7.5,-9.5 4,-7 0,-7 C-4,-7 -7.5,-9.5 -7.5,-14.5 Z"
                fill="url(#tdOrcSkinGrad)"
                stroke="#0F172A"
                strokeWidth="1.6"
              />
              <path d="M-4.5,-9.2 C-4.2,-12.5 -3.5,-14.5 -2.5,-15 C-2,-12.5 -1.8,-10.5 -1.5,-9 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="0.7" />
              <path d="M4.5,-9.2 C4.2,-12.5 3.5,-14.5 2.5,-15 C2,-12.5 1.8,-10.5 1.5,-9 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="0.7" />
              <circle cx="-2.8" cy="-15.2" r="1.8" fill="#EF4444" />
              <circle cx="3.2" cy="-15.2" r="1.8" fill="#EF4444" />
              {/* Curved War Cleaver */}
              <g transform={isAttacking ? 'translate(4, 2) rotate(36 10 0)' : ''}>
                <path d="M10,-14 L13.5,-14 L13,4 L10,4 Z" fill="#78350F" stroke="#0F172A" strokeWidth="1" />
                <path d="M11,-17 C16,-16 20,-13 21,-8 C20,-4 17,-2 11,-5 Z" fill="url(#tdSteelGrad)" stroke="#0F172A" strokeWidth="1.4" />
              </g>
            </g>
          )}

          {/* 5. GOLEM — Sculpted Monolithic Stone Colossus with Glowing Rune Fissures */}
          {type === 'GOLEM' && (
            <g className={animClass}>
              {/* Stone Pillar Feet */}
              <path d="M-12.5,5 C-13,11 -4.5,11.5 -3.8,5.5 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.7" />
              <path d="M3.8,5.5 C4.5,11.5 13,11 12.5,5 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.7" />
              {/* Jagged Monolith Craggy Torso */}
              <path
                d="M-15.5,6 C-17,-2 -18,-10 -15,-17 C-9,-24 9,-24 15,-17 C18,-10 17,-2 15.5,6 C6,8.2 -6,8.2 -15.5,6 Z"
                fill="url(#tdGolemRockGrad)"
                stroke="#0F172A"
                strokeWidth="2"
              />
              {/* Glowing Arcane Cracks */}
              <path d="M-9,-13 L-4,-6 L-7,-1 M9,-13 L4,-6 L7,-1" fill="none" stroke="#38BDF8" strokeWidth="1.7" strokeLinecap="round" />
              {/* Massive Floating Shoulder Boulders */}
              <path d="M-21,-10 C-21,-17 -15,-23 -8,-18 C-7,-13 -9,-8 -14,-6 C-18,-6 -21,-7.5 -21,-10 Z" fill="#64748B" stroke="#0F172A" strokeWidth="1.7" />
              <path d="M21,-10 C21,-17 15,-23 8,-18 C7,-13 9,-8 14,-6 C18,-6 21,-7.5 21,-10 Z" fill="#64748B" stroke="#0F172A" strokeWidth="1.7" />
              {/* Heavy Crushing Stone Fist */}
              <g transform={isAttacking ? 'translate(4, 3)' : ''}>
                <path d="M12,-4 C16,-7 21,-4 21,1 C21,5 16,7 12,4 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.8" />
              </g>
              {/* Glowing Rune Core */}
              <polygon points="0,-13.5 5.8,-6 0,2.5 -5.8,-6" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.9" className="td-anim-glow" />
              {/* Carved Visor Eye Slit */}
              <path d="M-7.5,-19.5 Q0,-17.5 7.5,-19.5 L7,-15.2 Q0,-13.8 -7,-15.2 Z" fill="#0F172A" />
              <circle cx="-3.5" cy="-17.4" r="1.9" fill="#38BDF8" />
              <circle cx="3.5" cy="-17.4" r="1.9" fill="#38BDF8" />
            </g>
          )}

          {/* 6. WYVERN — Fierce Winged Sky Dragon with Swept Membrane Wings & Barbed Tail */}
          {type === 'WYVERN' && (
            <g transform="translate(0, -10)" className={isAttacking ? 'td-anim-lunge' : ''}>
              <g className="td-anim-wing">
                <path
                  d="M-3,-2 C-12,-12 -20,-18 -25,-16 C-22,-10 -20,-6 -18,-2 C-20,1 -22,3 -21,5 C-15,3 -9,2 -4,1 Z"
                  fill="url(#tdWyvernScaleGrad)"
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
                <path
                  d="M3,-2 C12,-12 20,-18 25,-16 C22,-10 20,-6 18,-2 C20,1 22,3 21,5 C15,3 9,2 4,1 Z"
                  fill="url(#tdWyvernScaleGrad)"
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
              </g>
              {/* Barbed Dragon Tail */}
              <path d="M-4,3 C-9,7 -14,10 -15,13 C-12,11 -8,9 -4,6 Z" fill="#581C87" stroke="#0F172A" strokeWidth="1.3" />
              {/* Serpentine Body & Horned Dragon Skull */}
              <path
                d="M-8,-1 C-8,-6.5 2,-8 7.5,-4.5 C10,-2.5 8,4.5 2,5.5 C-4,6 -8,3.5 -8,-1 Z"
                fill="url(#tdWyvernScaleGrad)"
                stroke="#0F172A"
                strokeWidth="1.6"
              />
              <path d="M4,-5.5 C9.5,-5.5 14,-4 16.5,-2 C13.5,1 9,2.8 5,2.5 Z" fill="#A855F7" stroke="#0F172A" strokeWidth="1.3" />
              <path d="M-2,-6 C-5,-10 -7.5,-13 -8.5,-15 C-4.5,-12 -2,-9.5 0.5,-7 Z" fill="#FDE047" stroke="#0F172A" strokeWidth="1.1" />
              <circle cx="5.5" cy="-3" r="1.9" fill="#FEF08A" />
            </g>
          )}

          {/* 7. HARPY — Fiery Feather-Winged Wind Predator with Curved Talons */}
          {type === 'HARPY' && (
            <g transform="translate(0, -10)" className={isAttacking ? 'td-anim-lunge' : ''}>
              <g className="td-anim-wing">
                <path
                  d="M-2,-2 C-11,-11 -18,-15 -23,-14 C-20,-9 -19,-6 -23,1 C-18,3 -14,5 -4,1 Z"
                  fill="url(#tdHarpyPlumeGrad)"
                  stroke="#0F172A"
                  strokeWidth="1.4"
                />
                <path
                  d="M2,-2 C11,-11 18,-15 23,-14 C20,-9 19,-6 23,1 C18,3 14,5 4,1 Z"
                  fill="url(#tdHarpyPlumeGrad)"
                  stroke="#0F172A"
                  strokeWidth="1.4"
                />
              </g>
              <path
                d="M-6,0 C-6,-6.5 6,-6.5 6,0 C6,5.5 2.5,8 0,8 C-2.5,8 -6,5.5 -6,0 Z"
                fill="#BE123C"
                stroke="#0F172A"
                strokeWidth="1.4"
              />
              <path
                d="M-4.8,-8.5 C-4.8,-13 4.8,-13 4.8,-8.5 C4.8,-5 2.5,-3.2 0,-3.2 C-2.5,-3.2 -4.8,-5 -4.8,-8.5 Z"
                fill="#FECDD3"
                stroke="#0F172A"
                strokeWidth="1.2"
              />
              <path d="M-3,-12 L0,-18.5 L4,-12 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1" />
              <circle cx="2" cy="-8" r="1.4" fill="#DC2626" />
              <path d="M-3,7 L-5,13.5 M3,7 L5,13.5" stroke="#FACC15" strokeWidth="2.1" strokeLinecap="round" />
            </g>
          )}

          {/* 8. SHAMAN — Tribal Witch-Doctor with Horned Skull Mask & Jade Totem Staff */}
          {type === 'SHAMAN' && (
            <g className={animClass}>
              {isHealing && (
                <circle cx="0" cy="-4" r="22" fill="#2DD4BF" opacity="0.28" stroke="#2DD4BF" strokeWidth="2" />
              )}
              {/* Layered Tribal Mantle & Feather Collar */}
              <path
                d="M-11.5,10 C-10,3 -8.5,-4 -7,-11 C-3,-12.5 3,-12.5 7,-11 C8.5,-4 10,3 11.5,10 C5,8.5 -5,8.5 -11.5,10 Z"
                fill="url(#tdShamanRobeGrad)"
                stroke="#0F172A"
                strokeWidth="1.7"
              />
              <path d="M-6,10 L-2,-9 L6,10 Z" fill="#115E59" opacity="0.85" />
              {/* Feathered War Headdress */}
              <path d="M-6,-15 C-8.5,-19 -11,-22 -10,-24 C-6.5,-21.5 -4,-19 -2,-17 Z" fill="#F43F5E" stroke="#0F172A" strokeWidth="1" />
              <path d="M6,-15 C8.5,-19 11,-22 10,-24 C6.5,-21.5 4,-19 2,-17 Z" fill="#FACC15" stroke="#0F172A" strokeWidth="1" />
              {/* Carved Bone Skull Mask */}
              <path
                d="M-7,-12.5 C-7,-18.5 7,-18.5 7,-12.5 C7,-7.5 3.5,-5 0,-5 C-3.5,-5 -7,-7.5 -7,-12.5 Z"
                fill="url(#tdBoneGrad)"
                stroke="#0F172A"
                strokeWidth="1.5"
              />
              <circle cx="-2.3" cy="-12" r="1.9" fill="#0F172A" />
              <circle cx="2.5" cy="-12" r="1.9" fill="#0F172A" />
              <circle cx="-2.3" cy="-12" r="0.95" fill="#2DD4BF" />
              <circle cx="2.5" cy="-12" r="0.95" fill="#2DD4BF" />
              <g transform={isHealing || isAttacking ? 'translate(0, -4)' : ''}>
                <line x1="10" y1="9" x2="12" y2="-16" stroke="#78350F" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="12" cy="-20" r="4.8" fill="#2DD4BF" stroke="#FFFFFF" strokeWidth="1.3" className="td-anim-orb" />
              </g>
            </g>
          )}

          {/* 9. NECRO — Floating Dark Necromancer with Bone Mantle, Orbiting Skull & Soul Scythe */}
          {type === 'NECRO' && (
            <g className={animClass}>
              {isHealing && (
                <circle cx="0" cy="-4" r="24" fill="#C084FC" opacity="0.3" stroke="#C084FC" strokeWidth="2" />
              )}
              {/* Tattered Midnight Necro Robes */}
              <path
                d="M-12,11 C-10.5,3 -9,-4.5 -8,-12 L8,-12 C9,-4.5 10.5,3 12,11 L5,8 L0,11 L-5,8 Z"
                fill="url(#tdNecroRobeGrad)"
                stroke="#0F172A"
                strokeWidth="1.7"
              />
              {/* Carved Bone Collar */}
              <path d="M-11.5,-8 L-4,-14.5 L0,-8.5 L4,-14.5 L11.5,-8 L0,-3.5 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="1.2" />
              {/* Deep Hooded Skull */}
              <path
                d="M-7.5,-14.5 C-7.5,-21 7.5,-21 7.5,-14.5 C7.5,-9.5 4,-7 0,-7 C-4,-7 -7.5,-9.5 -7.5,-14.5 Z"
                fill="#1E1B4B"
                stroke="#0F172A"
                strokeWidth="1.5"
              />
              <circle cx="-2.4" cy="-14" r="1.8" fill="#E879F9" />
              <circle cx="2.4" cy="-14" r="1.8" fill="#E879F9" />
              {/* Floating Orbiting Skull */}
              <circle cx="-13" cy="-12" r="3.5" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="1" className="td-anim-orb" />
              {/* Crescent Soul Scythe */}
              <g transform={isHealing || isAttacking ? 'translate(2, -4)' : ''}>
                <line x1="11" y1="10" x2="12" y2="-18" stroke="#1E293B" strokeWidth="2.6" />
                <path d="M12,-18 C17,-23 21.5,-21 22.5,-14.5 C17.5,-15.5 14,-14.5 12,-14 Z" fill="#C084FC" stroke="#FFFFFF" strokeWidth="1" />
              </g>
            </g>
          )}

          {/* 10. KNIGHT_DARK — Abyssal Dread Knight with Sculpted Plate Armor, Plume & Greatsword */}
          {type === 'KNIGHT_DARK' && (
            <g className={animClass}>
              <path d="M-11,5 C-11.5,11 -3.5,11.5 -3,5.5 Z" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
              <path d="M3,5.5 C3.5,11.5 11.5,11 11,5 Z" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
              {/* Tapered Dread Plate Armor */}
              <path
                d="M-12.5,6.5 C-14,-0.5 -13.8,-8 -11.5,-12.5 C-4,-14.5 4,-14.5 11.5,-12.5 C13.8,-8 14,-0.5 12.5,6.5 C5,8 -5,8 -12.5,6.5 Z"
                fill="url(#tdDarkKnightGrad)"
                stroke="#0F172A"
                strokeWidth="1.8"
              />
              {/* Spiked Dread Pauldrons */}
              <path d="M-15.5,-9 C-14,-14 -9,-16.5 -6,-9 C-7.5,-5.5 -12,-5 -15.5,-9 Z" fill="#475569" stroke="#0F172A" strokeWidth="1.3" />
              <path d="M15.5,-9 C14,-14 9,-16.5 6,-9 C7.5,-5.5 12,-5 15.5,-9 Z" fill="#475569" stroke="#0F172A" strokeWidth="1.3" />
              {/* Sculpted Visored Greathelm & Crimson Plume */}
              <path
                d="M-7,-17 C-7,-23.5 7,-23.5 7,-17 C7,-12 3.5,-10 0,-10 C-3.5,-10 -7,-12 -7,-17 Z"
                fill="#334155"
                stroke="#0F172A"
                strokeWidth="1.5"
              />
              <path d="M-3,-22.5 C-1.5,-27 0,-31 0,-31 C0,-31 2.5,-27 4,-22.5 Z" fill="#EF4444" stroke="#0F172A" strokeWidth="1" />
              <path d="M-4.5,-17.5 L4.5,-17.5 L4,-15.2 L-4,-15.2 Z" fill="#0F172A" />
              <circle cx="0" cy="-16.4" r="1.4" fill="#EF4444" />
              {/* Spiked Tower Shield & Runic Greatsword */}
              <path d="M-14,-8 L-5,-8 L-5,5 L-9.5,9.5 L-14,5 Z" fill="#475569" stroke="#EF4444" strokeWidth="1.4" />
              <g transform={isAttacking ? 'translate(3, 2) rotate(35 12 0)' : ''}>
                <path d="M11,4 L16,-18 L19.5,-14 L14,5 Z" fill="url(#tdSteelGrad)" stroke="#0F172A" strokeWidth="1.3" />
              </g>
            </g>
          )}

          {/* 11. MINIBOSS — Horned Warlord Brute with Tattered Fur Mantle & Giant Siege Hammer */}
          {type === 'MINIBOSS' && (
            <g className={animClass}>
              {/* Tattered Warlord Cape */}
              <path d="M-15,-10 C-18.5,-1 -21,6 -20,10.5 C-8,9 8,9 20,10.5 C21,6 18.5,-1 15,-10 Z" fill="#78350F" stroke="#0F172A" strokeWidth="1.6" />
              {/* Massive Armored Torso */}
              <path
                d="M-15.5,6 C-17,-3 -16.5,-12 -14,-18 C-6,-21.5 6,-21.5 14,-18 C16.5,-12 17,-3 15.5,6 C6,8.5 -6,8.5 -15.5,6 Z"
                fill="url(#tdMiniBossGrad)"
                stroke="#0F172A"
                strokeWidth="1.9"
              />
              {/* Golden Spiked Shoulder Plates */}
              <path d="M-19.5,-15 C-17.5,-20.5 -12.5,-23 -8,-13.5 C-10,-9.5 -15,-9.5 -19.5,-15 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.4" />
              <path d="M19.5,-15 C17.5,-20.5 12.5,-23 8,-13.5 C10,-9.5 15,-9.5 19.5,-15 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.4" />
              {/* Twin Curved Bull Horns */}
              <path d="M-8,-19 C-11.5,-24 -14.5,-28 -14,-31 C-9,-27 -6,-23.5 -4,-20.5 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="1.4" />
              <path d="M8,-19 C11.5,-24 14.5,-28 14,-31 C9,-27 6,-23.5 4,-20.5 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="1.4" />
              <circle cx="-4.5" cy="-13" r="2.2" fill="#FEF08A" />
              <circle cx="4.5" cy="-13" r="2.2" fill="#FEF08A" />
              {/* Giant Iron Siege Hammer */}
              <g transform={isAttacking ? 'translate(4, 3) rotate(36 15 0)' : ''}>
                <line x1="15" y1="6" x2="18" y2="-16" stroke="#78350F" strokeWidth="3.2" />
                <path d="M11,-22 L25,-22 L24.5,-14 L11.5,-14 Z" fill="url(#tdSteelGrad)" stroke="#FACC15" strokeWidth="1.4" />
              </g>
            </g>
          )}

          {/* 12. BOSS & NEW SCARY MONSTERS / GIANT BOSSES FALLBACKS */}
          {(type === 'BOSS' ||
            type === 'ABYSS_OVERLORD' ||
            type === 'DRAGON_EMPEROR' ||
            type === 'PLAGUE_HYDRA' ||
            type === 'DOOM_COLOSSUS') && (
            <g className={animClass} transform="scale(1.32)">
              {/* Sweeping Demon Mantle */}
              <path d="M-21,-13 C-25,-2 -28,6 -27,12 C-10,10.5 10,10.5 27,12 C28,6 25,-2 21,-13 Z" fill="#450A0A" stroke="#0F172A" strokeWidth="1.8" />
              {/* Armored Demon Greaves */}
              <path d="M-15,4 C-15.5,11 -4.5,12 -3.8,4.5 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.7" />
              <path d="M3.8,4.5 C4.5,12 15.5,11 15,4 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.7" />
              {/* Sculpted Molten Dread-Armor Torso */}
              <path
                d="M-20,6 C-22.5,-5 -21.5,-16 -18,-23 C-8,-26.5 8,-26.5 18,-23 C21.5,-16 22.5,-5 20,6 C8,9 -8,9 -20,6 Z"
                fill={type === 'PLAGUE_HYDRA' ? 'url(#tdShamanRobeGrad)' : 'url(#tdBossArmorGrad)'}
                stroke="#0F172A"
                strokeWidth="2.2"
              />
              {/* Glowing Lava / Venom Fissures */}
              <path d="M-12,-14 L-4,-8 M12,-14 L4,-8" stroke={type === 'PLAGUE_HYDRA' ? '#4ADE80' : '#FB923C'} strokeWidth="2.1" strokeLinecap="round" />
              {/* Jagged Obsidian Shoulder Armor */}
              <path d="M-25,-18 C-23,-25 -16,-28 -11,-15 L-21,-10 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.8" />
              <path d="M25,-18 C23,-25 16,-28 11,-15 L21,-10 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.8" />
              {/* Swept Golden Crown Horns */}
              <path d="M-11.5,-22.5 C-17,-29 -22,-35 -23,-39 C-15,-33 -10,-28 -6,-24.5 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1.6" />
              <path d="M11.5,-22.5 C17,-29 22,-35 23,-39 C15,-33 10,-28 6,-24.5 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1.6" />
              <path d="M-4,-23 L0,-34.5 L4,-23 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1.3" />
              {/* Pulsing Molten Heart Core */}
              <circle cx="0" cy="-6" r="7.5" fill="url(#tdBossMagmaGrad)" stroke="#FEF08A" strokeWidth="1.8" className="td-anim-glow" />
              <circle cx="-6" cy="-16" r="2.8" fill="#FEF08A" />
              <circle cx="6" cy="-16" r="2.8" fill="#FEF08A" />
              {/* Blazing Hellfire Cleaver */}
              <g transform={isAttacking ? 'translate(4, 2) rotate(36 20 0)' : ''}>
                <path d="M19,2 C24,-8 28,-16 31,-23 C33,-19 33,-16 33,-14 C29,-6 25,1 23,5 Z" fill="#FB923C" stroke="#FEF08A" strokeWidth="1.4" />
              </g>
            </g>
          )}

          {(type === 'BROOD_MOTHER' || type === 'BROODLING' || type === 'MITE') && (
            <g
              className={animClass}
              transform={`scale(${type === 'BROOD_MOTHER' ? 1.38 : type === 'BROODLING' ? 0.92 : 0.65})`}
            >
              <path d="M-4,-2 L-16,-11 L-20,5 M-2,2 L-15,0 L-17,11 M4,-2 L16,-11 L20,5 M2,2 L15,0 L17,11" fill="none" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M-4,-2 L-16,-11 L-20,5 M-2,2 L-15,0 L-17,11 M4,-2 L16,-11 L20,5 M2,2 L15,0 L17,11" fill="none" stroke="#A855F7" strokeWidth="1.3" strokeLinecap="round" />
              <ellipse cx="-3" cy="-4" rx="11" ry="8" fill="#3B0764" stroke="#0F172A" strokeWidth="1.6" />
              <circle cx="6" cy="-2" r="6" fill="#1E1B4B" stroke="#0F172A" strokeWidth="1.4" />
              <circle cx="8" cy="-3.5" r="1.8" fill="#FB7185" />
              <circle cx="10.5" cy="-1.5" r="1.5" fill="#FB7185" />
            </g>
          )}

          {type === 'SHADOW_REAPER' && (
            <g className={animClass} transform="translate(0, -10)">
              <path d="M-12,11 L-7,-12 L7,-12 L12,11 L0,6 Z" fill="#090D16" stroke="#EF4444" strokeWidth="1.5" />
              <circle cx="0" cy="-14" r="6.5" fill="#1E1B4B" stroke="#0F172A" strokeWidth="1.4" />
              <circle cx="-2.2" cy="-14" r="1.6" fill="#EF4444" />
              <circle cx="2.2" cy="-14" r="1.6" fill="#EF4444" />
              <line x1="10" y1="10" x2="13" y2="-18" stroke="#334155" strokeWidth="2.5" />
              <path d="M13,-18 C20,-24 25,-20 24,-12 C18,-14 14,-14 13,-13 Z" fill="#FB7185" stroke="#FFFFFF" strokeWidth="1" />
            </g>
          )}

          {type === 'VOID_TITAN' && (
            <g className={animClass} transform="scale(1.16)">
              <path d="M-16,6 L-15,-18 L0,-24 L15,-18 L16,6 Z" fill="#1E1B4B" stroke="#0F172A" strokeWidth="2" />
              <path d="M-9,-14 L-4,-6 L-7,0 M9,-14 L4,-6 L7,0" fill="none" stroke="#C084FC" strokeWidth="1.8" strokeLinecap="round" />
              <polygon points="0,-14 6,-6 0,2 -6,-6" fill="#E879F9" stroke="#FFFFFF" strokeWidth="1" className="td-anim-glow" />
              <circle cx="-3.5" cy="-17" r="1.9" fill="#E879F9" />
              <circle cx="3.5" cy="-17" r="1.9" fill="#E879F9" />
            </g>
          )}
        </g>

        {slowed && (
          <circle
            cx="0"
            cy="0"
            r={type === 'BOSS' ? 26 : 15.5}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        )}
        {poisoned && (
          <circle
            cx="0"
            cy="0"
            r={type === 'BOSS' ? 22 : 13.5}
            fill="none"
            stroke="#4ADE80"
            strokeWidth="1.8"
          />
        )}
        {burned && (
          <circle
            cx="0"
            cy="0"
            r={type === 'BOSS' ? 24 : 14.5}
            fill="none"
            stroke="#F97316"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}

        {!hideHud && (
          <>
            <rect
              x={-barW / 2}
              y={barY}
              width={barW}
              height="4.8"
              rx="1.6"
              fill="#0F172A"
              stroke="#0F172A"
              strokeWidth="1"
            />
            <rect
              x={-barW / 2 + 0.6}
              y={barY + 0.6}
              width={Math.max(0, (barW - 1.2) * hpRatio)}
              height="3.6"
              rx="1"
              fill={hpRatio > 0.5 ? '#22C55E' : hpRatio > 0.25 ? '#FACC15' : '#EF4444'}
            />
          </>
        )}
      </g>
    );
  }
);

TdEnemySprite.displayName = 'TdEnemySprite';

export const TdSoldierSprite: React.FC<{
  hpRatio: number;
  isReinforcement: boolean;
  facingLeft: boolean;
  isAttacking?: boolean;
  isMoving?: boolean;
  towerType?: TdTowerType;
  level?: TdTowerLevel;
  branch?: TdBranchId | null;
}> = React.memo(
  ({
    hpRatio,
    isReinforcement,
    facingLeft,
    isAttacking = false,
    isMoving = true,
    towerType = 'BARRACKS',
    level = 1,
    branch = null,
  }) => {
    const animeSrc = useTdAnimeSprite(resolveGuardAnimeKey(isReinforcement, branch, towerType));
    const isDragonKnight = towerType === 'KNIGHT_GUARD';
    const isAegis = branch === 'AEGIS_WARDEN';
    const isPaladin = branch === 'PALADIN' || branch === 'DRAGON_LANCER';
    const isBarb = branch === 'BARBARIAN';
    const armorFill = isReinforcement
      ? '#D97706'
      : isDragonKnight
        ? isAegis
          ? '#0284C7'
          : '#B91C1C'
        : isPaladin
          ? '#F8FAFC'
          : isBarb
            ? '#B91C1C'
            : level >= 3
              ? '#0284C7'
              : level === 2
                ? '#1D4ED8'
                : '#2563EB';
    const shieldTrim = isReinforcement
      ? '#FEF08A'
      : isDragonKnight
        ? isAegis
          ? '#7DD3FC'
          : '#FACC15'
        : isPaladin
          ? '#FACC15'
          : isBarb
            ? '#F87171'
            : '#93C5FD';
    const flip = facingLeft ? -1 : 1;
    const animClass = isAttacking ? 'td-anim-lunge' : isMoving ? 'td-anim-walk' : 'td-anim-idle';

    if (animeSrc) {
      const size = level >= 3 || isReinforcement ? 34 : 31;
      return (
        <g>
          <ellipse cx="0" cy="8.5" rx="9.5" ry="4" fill="#020617" opacity="0.52" />
          <g transform={`scale(${flip}, 1)`}>
            <g className={animClass}>
              <image
                href={animeSrc}
                x={-size / 2}
                y={10 - size}
                width={size}
                height={size}
                preserveAspectRatio="xMidYMax meet"
              />
            </g>
            {isAttacking && (
              <g className="td-anim-slash-arc">
                <path
                  d="M-3,-12 Q13,0 -3,12 Q6,0 -3,-12 Z"
                  fill={isReinforcement || isPaladin ? '#FACC15' : isBarb ? '#EF4444' : '#38BDF8'}
                  opacity="0.78"
                />
                <path d="M-1,-9 Q10,0 -1,9 Q4,0 -1,-9 Z" fill="#FFFFFF" />
              </g>
            )}
          </g>
          <rect x="-9" y="-25" width="18" height="3.2" rx="1" fill="#0F172A" />
          <rect
            x="-8.5"
            y="-24.5"
            width={Math.max(0, 17 * hpRatio)}
            height="2.2"
            rx="0.5"
            fill={isReinforcement ? '#FACC15' : isPaladin ? '#FEF08A' : '#60A5FA'}
          />
        </g>
      );
    }

    return (
      <g>
        <ellipse cx="0" cy="8.5" rx="9.5" ry="4" fill="#020617" opacity="0.52" />
        <g transform={`scale(${flip}, 1)`} className={animClass}>
          {/* Flowing Cloak */}
          <path
            d="M-4.5,-5.5 C-7.5,-1 -10,3.5 -11,7.5 C-7,6.8 -4,6.8 -2,6.5 Z"
            fill={isReinforcement ? '#B45309' : isPaladin ? '#1D4ED8' : isBarb ? '#7F1D1D' : '#1E40AF'}
            stroke="#0F172A"
            strokeWidth="0.9"
          />
          {/* Contoured Cuirass */}
          <path
            d="M-5.8,6 C-6.2,1 -6,-3.5 -5,-6.2 C-1.8,-7.2 1.8,-7.2 5,-6.2 C6,-3.5 6.2,1 5.8,6 C2,7 -2,7 -5.8,6 Z"
            fill={armorFill}
            stroke="#0F172A"
            strokeWidth="1.4"
          />
          <path d="M-5.2,-1.5 Q0,0 5.2,-1.5" fill="none" stroke={shieldTrim} strokeWidth="1.2" opacity="0.88" />
          {/* Shoulder Pauldrons */}
          <path d="M-8,-3.5 C-8,-6.5 -3.5,-6.8 -3,-3.5 C-3.5,-1.5 -7.5,-1.5 -8,-3.5 Z" fill={isPaladin ? 'url(#tdGoldGrad)' : armorFill} stroke="#0F172A" strokeWidth="1" />
          <path d="M8,-3.5 C8,-6.5 3.5,-6.8 3,-3.5 C3.5,-1.5 7.5,-1.5 8,-3.5 Z" fill={isPaladin ? 'url(#tdGoldGrad)' : armorFill} stroke="#0F172A" strokeWidth="1" />

          {/* Sculpted Greathelm */}
          <path
            d="M-5,-11 C-5,-16 5,-16 5,-11 C5,-7.2 2.4,-5.8 0,-5.8 C-2.4,-5.8 -5,-7.2 -5,-11 Z"
            fill={isPaladin ? 'url(#tdGoldGrad)' : isBarb ? '#94A3B8' : 'url(#tdSteelGrad)'}
            stroke="#0F172A"
            strokeWidth="1.4"
          />
          <path d="M-1.6,-11.5 L3.6,-11.2 L3.2,-9.2 L-1.6,-9.2 Z" fill="#0F172A" />
          <circle cx="0.8" cy="-10.3" r="0.85" fill={isBarb ? '#EF4444' : '#38BDF8'} />

          {isBarb ? (
            <>
              <path d="M-4,-14.5 C-7,-17.5 -9,-19.5 -8.5,-21.5 C-5.5,-19.5 -3.5,-17.5 -2,-15.5 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="1" />
              <path d="M4,-14.5 C7,-17.5 9,-19.5 8.5,-21.5 C5.5,-19.5 3.5,-17.5 2,-15.5 Z" fill="url(#tdBoneGrad)" stroke="#0F172A" strokeWidth="1" />
            </>
          ) : (
            <path
              d="M-2.6,-14.5 C-1.8,-18.5 0,-21.5 0,-21.5 C0,-21.5 1.8,-18.5 2.6,-14.5 Z"
              fill={isReinforcement || isPaladin ? '#FACC15' : level >= 2 ? '#EF4444' : '#60A5FA'}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
          )}

          {isBarb ? (
            <path d="M-8,-6 L-6,5 M-11.5,-5 L-5,-5 L-7.5,-0.5 Z" stroke="#E2E8F0" strokeWidth="1.9" fill="url(#tdSteelGrad)" />
          ) : (
            <>
              <path d="M-8,-3.5 L-2,-3.5 L-2,5 L-5,8 L-8,5 Z" fill={shieldTrim} stroke="#0F172A" strokeWidth="1.2" />
              <circle cx="-5" cy="1.2" r="1.2" fill="#FFFFFF" opacity="0.85" />
            </>
          )}

          <g transform={isAttacking ? 'rotate(44 6 0)' : ''}>
            <line x1="5.5" y1="2" x2="13" y2="-10.5" stroke="url(#tdSteelGrad)" strokeWidth="2.6" strokeLinecap="round" />
            {isPaladin && <line x1="6" y1="-2" x2="12.5" y2="-9.5" stroke="#FEF08A" strokeWidth="1.3" />}
          </g>
        </g>

        <rect x="-9" y="-23" width="18" height="3.2" rx="1" fill="#0F172A" />
        <rect
          x="-8.5"
          y="-22.5"
          width={Math.max(0, 17 * hpRatio)}
          height="2.2"
          rx="0.5"
          fill={isReinforcement ? '#FACC15' : isPaladin ? '#FEF08A' : '#60A5FA'}
        />
      </g>
    );
  }
);

TdSoldierSprite.displayName = 'TdSoldierSprite';

// ---------- Stage Landmark Scenery Props (Makes Each of the 30 Maps Visually Unique) ----------

export const TdMapLandmarkSprite: React.FC<{ landmark: TdMapLandmark }> = React.memo(({ landmark }) => {
  const s = landmark.scale ?? 1;
  return (
    <g transform={`translate(${landmark.x}, ${landmark.y}) scale(${s})`} className="pointer-events-none">
      {landmark.kind === 'TREE' && (
        <g>
          <ellipse cx="0" cy="14" rx="16" ry="6" fill="#0F172A" opacity="0.38" />
          <path d="M-3,14 L-2.5,2 L2.5,2 L3,14 Z" fill="#78350F" stroke="#0F172A" strokeWidth="1.2" />
          <path d="M-16,4 C-11,-5 -5,-12 0,-18 C5,-12 11,-5 16,4 Z" fill="#15803D" stroke="#052E16" strokeWidth="1.4" />
          <path d="M-13,-7 C-8,-15 -4,-22 0,-28 C4,-22 8,-15 13,-7 Z" fill="#22C55E" stroke="#052E16" strokeWidth="1.4" />
        </g>
      )}
      {landmark.kind === 'CRYSTAL' && (
        <g>
          <ellipse cx="0" cy="10" rx="13" ry="5" fill="#0F172A" opacity="0.4" />
          <polygon points="-10,9 -6,-12 -1,9" fill="#0EA5E9" stroke="#0F172A" strokeWidth="1.2" />
          <polygon points="2,9 8,-10 11,9" fill="#A855F7" stroke="#0F172A" strokeWidth="1.2" />
          <polygon points="-5,10 1,-20 7,10" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.2" className="td-anim-glow" />
        </g>
      )}
      {landmark.kind === 'LAVA' && (
        <g>
          <ellipse cx="0" cy="0" rx="26" ry="13" fill="#450A0A" stroke="#0F172A" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="19" ry="9" fill="#EA580C" className="td-anim-glow" />
          <ellipse cx="-4" cy="-1" rx="9" ry="4" fill="#FEF08A" opacity="0.85" />
        </g>
      )}
      {landmark.kind === 'RUIN' && (
        <g>
          <ellipse cx="0" cy="12" rx="18" ry="6" fill="#0F172A" opacity="0.4" />
          <rect x="-14" y="-12" width="7" height="22" rx="1" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="6" y="-6" width="7" height="16" rx="1" fill="#475569" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="-16" y="-15" width="16" height="5" rx="1" fill="#94A3B8" stroke="#0F172A" strokeWidth="1.4" />
        </g>
      )}
      {landmark.kind === 'ICEBERG' && (
        <g>
          <ellipse cx="0" cy="12" rx="20" ry="7" fill="#0F172A" opacity="0.35" />
          <polygon points="-18,11 -10,-16 0,-6 10,-20 18,11" fill="#BAE6FD" stroke="#0369A1" strokeWidth="1.6" />
          <polygon points="-6,11 4,-12 16,11" fill="#E0F2FE" opacity="0.7" />
        </g>
      )}
      {landmark.kind === 'CAMPFIRE' && (
        <g>
          <ellipse cx="0" cy="6" rx="12" ry="5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.4" />
          <line x1="-8" y1="6" x2="8" y2="2" stroke="#78350F" strokeWidth="3" />
          <line x1="8" y1="6" x2="-8" y2="2" stroke="#78350F" strokeWidth="3" />
          <polygon points="-6,4 0,-12 6,4" fill="#F97316" className="td-anim-torch" />
          <polygon points="-3,4 0,-6 3,4" fill="#FEF08A" className="td-anim-torch" />
        </g>
      )}
      {landmark.kind === 'PALM' && (
        <g>
          <ellipse cx="0" cy="14" rx="15" ry="5.5" fill="#0F172A" opacity="0.36" />
          <path d="M-2.5,14 Q-1,2 2,-10 L5,-10 Q3,2 2.5,14 Z" fill="#92400E" stroke="#451A03" strokeWidth="1.2" />
          <path d="M3,-10 Q-12,-18 -18,-8 Q-8,-10 3,-10 Z" fill="#16A34A" stroke="#052E16" strokeWidth="1.2" />
          <path d="M3,-10 Q16,-19 20,-7 Q11,-9 3,-10 Z" fill="#22C55E" stroke="#052E16" strokeWidth="1.2" />
          <path d="M3,-10 Q-6,-25 4,-26 Q9,-18 3,-10 Z" fill="#4ADE80" stroke="#052E16" strokeWidth="1.1" />
        </g>
      )}
      {landmark.kind === 'OBELISK' && (
        <g>
          <ellipse cx="0" cy="14" rx="15" ry="5.5" fill="#0F172A" opacity="0.45" />
          <path d="M-9,13 L-6,-18 L0,-28 L6,-18 L9,13 Z" fill="url(#tdBronzeGrad)" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M-3,-16 L0,-24 L3,-16 Z" fill="#FEF08A" />
          <circle cx="0" cy="-6" r="2.6" fill="#2DD4BF" className="td-anim-glow" />
        </g>
      )}
      {landmark.kind === 'SHRINE' && (
        <g>
          <ellipse cx="0" cy="14" rx="17" ry="6" fill="#0F172A" opacity="0.4" />
          <path d="M-13,12 L-10,-8 L10,-8 L13,12 Z" fill="url(#tdSteelGrad)" stroke="#0F172A" strokeWidth="1.4" />
          <path d="M-15,-8 Q0,-18 15,-8 Z" fill="url(#tdGoldGrad)" stroke="#0F172A" strokeWidth="1.4" />
          <circle cx="0" cy="1" r="4" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" className="td-anim-glow" />
        </g>
      )}
      {landmark.kind === 'LANTERN' && (
        <g>
          <ellipse cx="0" cy="13" rx="11" ry="4" fill="#0F172A" opacity="0.42" />
          <line x1="0" y1="12" x2="0" y2="-14" stroke="#475569" strokeWidth="2.8" />
          <path d="M-6,-14 L6,-14 L4,-4 L-4,-4 Z" fill="#1E293B" stroke="#FACC15" strokeWidth="1.3" />
          <circle cx="0" cy="-9" r="3.4" fill="#FEF08A" className="td-anim-torch" />
        </g>
      )}
    </g>
  );
});

TdMapLandmarkSprite.displayName = 'TdMapLandmarkSprite';

// ---------- Standalone UI Preview Wrappers (for Build Dock, Upgrade Cards & Home Screen) ----------

export const TdTowerPreview: React.FC<{
  type: TdTowerType;
  level?: TdTowerLevel;
  branch?: TdBranchId | null;
  mythicPath?: TdMythicPathId | null;
  className?: string;
}> = React.memo(({ type, level = 1, branch = null, mythicPath = null, className = 'w-11 h-11' }) => (
  <svg viewBox="-42 -54 84 76" className={`${className} overflow-visible select-none pointer-events-none`}>
    <TdSharedArtworkDefs />
    <TdTowerSprite type={type} level={level} branch={branch} mythicPath={mythicPath} facingAngle={-0.35} />
  </svg>
));

TdTowerPreview.displayName = 'TdTowerPreview';

export const TdEnemyPreview: React.FC<{
  type: TdEnemyType;
  className?: string;
}> = React.memo(({ type, className = 'w-8 h-8' }) => (
  <svg viewBox="-26 -38 52 54" className={`${className} overflow-visible select-none pointer-events-none`}>
    <TdSharedArtworkDefs />
    <TdEnemySprite
      type={type}
      hpRatio={1}
      hitFlash={false}
      slowed={false}
      poisoned={false}
      facingLeft={false}
      hideHud={true}
    />
  </svg>
));

TdEnemyPreview.displayName = 'TdEnemyPreview';
