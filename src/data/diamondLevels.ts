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
    light: '#FECACA',
    dark: '#7F1D1D',
    border: '#F87171',
  },
  {
    id: 1,
    name: 'Sapphire Lam',
    shortName: 'Sapphire',
    primary: '#3B82F6',
    light: '#BFDBFE',
    dark: '#1E3A8A',
    border: '#60A5FA',
  },
  {
    id: 2,
    name: 'Emerald Lục',
    shortName: 'Emerald',
    primary: '#10B981',
    light: '#A7F3D0',
    dark: '#064E3B',
    border: '#34D399',
  },
  {
    id: 3,
    name: 'Topaz Vàng',
    shortName: 'Topaz',
    primary: '#F59E0B',
    light: '#FEF08A',
    dark: '#78350F',
    border: '#FBBF24',
  },
  {
    id: 4,
    name: 'Amethyst Tím',
    shortName: 'Amethyst',
    primary: '#A855F7',
    light: '#E9D5FF',
    dark: '#581C87',
    border: '#C084FC',
  },
  {
    id: 5,
    name: 'Ngọc Bích Cyan',
    shortName: 'Aqua',
    primary: '#06B6D4',
    light: '#CFFAFE',
    dark: '#164E63',
    border: '#22D3EE',
  },
  {
    id: 6,
    name: 'Thạch Anh Hồng',
    shortName: 'Rose',
    primary: '#EC4899',
    light: '#FCE7F3',
    dark: '#831843',
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
  const isBoss = lv % 10 === 0;

  // Grid expands faster: 7x7 (Lv 1-6) -> 8x8 (Lv 7-30) -> 9x9 (Lv 31-100)
  const size = lv <= 6 ? 7 : lv <= 30 ? 8 : 9;

  // Gem variety jumps early to drastically cut lucky random cascades:
  // 5 colors (Lv 1-4) -> 6 colors (Lv 5-14) -> 7 colors (Lv 15-100)
  const gemTypes = lv <= 4 ? 5 : lv <= 14 ? 6 : 7;

  // Steep strategic target score (balanced around 32/55/85 pts + combo multipliers)
  const targetScore = Math.round(
    2000 +
      (lv - 1) * 235 +
      Math.floor((lv - 1) / 10) * 450 +
      (isBoss ? 1200 : 0)
  );

  // Tight move budgets requiring combos, Bombs, Line blasts, and Prisms
  let movesLimit = 16;
  if (lv <= 10) movesLimit = 16 - (isBoss ? 1 : 0);
  else if (lv <= 35) movesLimit = 17 - Math.floor((lv - 11) / 15) - (isBoss ? 1 : 0);
  else if (lv <= 70) movesLimit = 16 - Math.floor((lv - 36) / 20) - (isBoss ? 1 : 0);
  else movesLimit = 15 - Math.floor((lv - 71) / 20) - (isBoss ? 1 : 0);
  movesLimit = Math.max(13, movesLimit);

  // Primary color collection starts right at Lv 3
  const hasColorGoal = lv >= 3;
  const targetColor: GemColorId | null = hasColorGoal
    ? (((lv * 3 + 1) % gemTypes) as GemColorId)
    : null;
  const targetColorCount = hasColorGoal
    ? Math.min(36, 15 + Math.floor((lv - 3) * 0.22) + (isBoss ? 3 : 0))
    : 0;

  // Secondary color goal joins from Lv 22 onwards
  const hasSecondaryGoal = lv >= 22 && targetColor !== null;
  const secondaryTargetColor: GemColorId | null = hasSecondaryGoal
    ? (((targetColor! + 2 + (lv % 2)) % gemTypes) as GemColorId)
    : null;
  const secondaryTargetColorCount = hasSecondaryGoal
    ? Math.min(28, 12 + Math.floor((lv - 22) * 0.2) + (isBoss ? 2 : 0))
    : 0;

  // Ice tiles start at Lv 6; double-layer frost starts at Lv 18
  let iceCount = 0;
  let doubleIceCount = 0;
  if (lv >= 6) {
    iceCount = Math.min(22, 5 + Math.floor(((lv - 6) / 94) * 17));
  }
  if (lv >= 18) {
    doubleIceCount = Math.min(14, 2 + Math.floor(((lv - 18) / 82) * 12));
  }

  // Stone blockers start at Lv 12; Granite (2-hit) stones start at Lv 36
  let stoneCount = 0;
  let graniteCount = 0;
  if (lv >= 12) {
    stoneCount = Math.min(12, 3 + Math.floor(((lv - 12) / 88) * 9) + (isBoss ? 1 : 0));
  }
  if (lv >= 36 && stoneCount > 0) {
    graniteCount = Math.min(stoneCount, 2 + Math.floor(((lv - 36) / 64) * 5));
  }

  const requireClearStones = stoneCount > 0;
  const frostSpreadOnMiss = lv >= 28 && iceCount + doubleIceCount > 0;

  let difficultyLabel = 'Thử thách cao';
  if (lv >= 12 && lv <= 27) difficultyLabel = 'Khắc nghiệt';
  else if (lv >= 28 && lv <= 55) difficultyLabel = 'Băng lan & Đá chắn';
  else if (lv >= 56 && lv <= 80) difficultyLabel = 'Địa ngục Granite';
  else if (lv >= 81) difficultyLabel = 'Siêu cấp Vương Miện';
  if (isBoss) difficultyLabel = `Màn Trùm · ${difficultyLabel}`;

  const initialHints = lv <= 25 ? 2 : 1;
  const initialShuffles = lv <= 20 ? 2 : 1;

  return {
    level: lv,
    rows: size,
    cols: size,
    gemTypes,
    movesLimit,
    targetScore,
    targetColor,
    targetColorCount,
    secondaryTargetColor,
    secondaryTargetColorCount,
    iceCount,
    doubleIceCount,
    stoneCount,
    graniteCount,
    requireClearStones,
    frostSpreadOnMiss,
    initialHints,
    initialShuffles,
    chapter,
    chapterName,
    difficultyLabel,
  };
}
