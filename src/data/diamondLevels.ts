import { DiamondLevelConfig, GemColorId } from '../types/diamond';

export const DIAMOND_MAX_LEVEL = 100;

export const DIAMOND_CHAPTER_NAMES = [
  'Mỏ Thạch Anh Hồng',        // 1 - 10
  'Hang Pha Lê Xanh',         // 11 - 20
  'Suối Ngọc Lục Bảo',        // 21 - 30
  'Thung Lũng Hoàng Kim',     // 31 - 40
  'Thành Cổ Băng Giá',        // 41 - 50
  'Kho Báu Hoàng Gia',        // 51 - 60
  'Đỉnh Núi Bạch Kim',        // 61 - 70
  'Hầm Ngục Đá Tảng',         // 71 - 80
  'Tháp Quang Phổ',           // 81 - 90
  'Vương Miện Kim Cương',     // 91 - 100
];

export interface GemStyleMeta {
  id: GemColorId;
  name: string;
  shortName: string;
  primary: string;
  light: string;
  dark: string;
  border: string;
}

export const GEM_STYLES: GemStyleMeta[] = [
  {
    id: 0,
    name: 'Ruby Đỏ',
    shortName: 'Ruby',
    primary: '#EF4444',
    light: '#FCA5A5',
    dark: '#991B1B',
    border: '#F87171',
  },
  {
    id: 1,
    name: 'Sapphire Lam',
    shortName: 'Sapphire',
    primary: '#3B82F6',
    light: '#93C5FD',
    dark: '#1E40AF',
    border: '#60A5FA',
  },
  {
    id: 2,
    name: 'Emerald Lục',
    shortName: 'Emerald',
    primary: '#10B981',
    light: '#6EE7B7',
    dark: '#065F46',
    border: '#34D399',
  },
  {
    id: 3,
    name: 'Topaz Vàng',
    shortName: 'Topaz',
    primary: '#F59E0B',
    light: '#FDE68A',
    dark: '#92400E',
    border: '#FBBF24',
  },
  {
    id: 4,
    name: 'Amethyst Tím',
    shortName: 'Amethyst',
    primary: '#A855F7',
    light: '#E9D5FF',
    dark: '#6B21A8',
    border: '#C084FC',
  },
  {
    id: 5,
    name: 'Ngọc Bích Cyan',
    shortName: 'Aqua',
    primary: '#06B6D4',
    light: '#A5F3FC',
    dark: '#155E75',
    border: '#22D3EE',
  },
  {
    id: 6,
    name: 'Thạch Anh Hồng',
    shortName: 'Rose',
    primary: '#EC4899',
    light: '#FBCFE8',
    dark: '#9D174D',
    border: '#F472B6',
  },
];

export function getGemStyle(color: GemColorId): GemStyleMeta {
  return GEM_STYLES[color] ?? GEM_STYLES[0];
}

export function getDiamondLevelConfig(level: number): DiamondLevelConfig {
  const lv = Math.max(1, Math.min(DIAMOND_MAX_LEVEL, Math.floor(level)));
  const chapter = Math.ceil(lv / 10);
  const chapterName = DIAMOND_CHAPTER_NAMES[chapter - 1] ?? DIAMOND_CHAPTER_NAMES[0];

  // Grid size grows smoothly: 7x7 (Lv 1-10) -> 8x8 (Lv 11-50) -> 9x9 (Lv 51-100)
  const size = lv <= 10 ? 7 : lv <= 50 ? 8 : 9;

  // Gem variety grows: 5 colors (Lv 1-12) -> 6 colors (Lv 13-55) -> 7 colors (Lv 56-100)
  const gemTypes = lv <= 12 ? 5 : lv <= 55 ? 6 : 7;

  // Target score scales upward smoothly while staying realistic per move budget
  const targetScore = Math.round(1200 + (lv - 1) * 145 + Math.floor((lv - 1) / 10) * 300);

  // Move budget tightens gradually at higher tiers
  let movesLimit = 28;
  if (lv <= 15) movesLimit = 28 - Math.floor((lv - 1) / 5); // 28..26
  else if (lv <= 50) movesLimit = 27 - Math.floor((lv - 16) / 12); // 27..25
  else if (lv <= 80) movesLimit = 25 - Math.floor((lv - 51) / 15); // 25..24
  else movesLimit = 24 - Math.floor((lv - 81) / 7); // 24..21

  // Target specific gem collection introduced from Lv 8 onwards
  const hasColorGoal = lv >= 8;
  const targetColor: GemColorId | null = hasColorGoal
    ? (((lv * 3) % gemTypes) as GemColorId)
    : null;
  const targetColorCount = hasColorGoal
    ? Math.min(48, 12 + Math.floor((lv - 8) * 0.36))
    : 0;

  // Ice tiles appear from Lv 16 onward; double-layer frost from Lv 46 onward
  let iceCount = 0;
  let doubleIceCount = 0;
  if (lv >= 16) {
    iceCount = Math.min(18, 4 + Math.floor(((lv - 16) / 84) * 14));
  }
  if (lv >= 46) {
    doubleIceCount = Math.min(8, 2 + Math.floor(((lv - 46) / 54) * 6));
  }

  // Stone blockers appear from Lv 35 onward (break adjacent gems to shatter stones)
  let stoneCount = 0;
  if (lv >= 35) {
    stoneCount = Math.min(8, 2 + Math.floor(((lv - 35) / 65) * 6));
  }

  let difficultyLabel = 'Khởi động';
  if (lv >= 21 && lv <= 45) difficultyLabel = 'Thử thách băng giá';
  else if (lv >= 46 && lv <= 75) difficultyLabel = 'Chiến thuật đa tầng';
  else if (lv >= 76) difficultyLabel = 'Siêu cấp bậc thầy';

  const initialHints = lv <= 30 ? 4 : lv <= 70 ? 3 : 2;
  const initialShuffles = lv <= 30 ? 3 : 2;

  return {
    level: lv,
    rows: size,
    cols: size,
    gemTypes,
    movesLimit,
    targetScore,
    targetColor,
    targetColorCount,
    iceCount,
    doubleIceCount,
    stoneCount,
    initialHints,
    initialShuffles,
    chapter,
    chapterName,
    difficultyLabel,
  };
}
