export type GameId = 'CHIBIMON' | 'DIAMOND';

export type GemColorId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type GemSpecial = 'NONE' | 'LINE_H' | 'LINE_V' | 'BOMB' | 'PRISM';

export interface DiamondCell {
  id: string;
  color: GemColorId;
  special: GemSpecial;
  ice: number; // 0 = no ice, 1 = single frost, 2 = thick double frost
  stone: boolean; // immovable obstacle destroyed by adjacent matches
}

export type DiamondGrid = (DiamondCell | null)[][];

export interface DiamondLevelConfig {
  level: number;
  rows: number;
  cols: number;
  gemTypes: number; // 5 to 7 distinct gems
  movesLimit: number;
  targetScore: number;
  targetColor: GemColorId | null;
  targetColorCount: number;
  iceCount: number;
  doubleIceCount: number;
  stoneCount: number;
  initialHints: number;
  initialShuffles: number;
  chapter: number;
  chapterName: string;
  difficultyLabel: string;
}

export interface DiamondLevelProgress {
  completed: boolean;
  stars: number; // 1 to 3
  bestScore: number;
  bestMovesLeft: number;
}

export interface DiamondSaveData {
  highestUnlockedLevel: number;
  totalScore: number;
  levels: Record<number, DiamondLevelProgress>;
}

export interface GemBurstEffect {
  id: string;
  r: number;
  c: number;
  color: GemColorId;
  special: GemSpecial;
}

export interface DiamondFloatingScore {
  id: string;
  r: number;
  c: number;
  text: string;
  combo: number;
}
