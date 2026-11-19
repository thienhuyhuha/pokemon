export type GameState =
  | 'TITLE_MENU'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'ROUND_SUMMARY'
  | 'GAME_OVER';

export type ShiftDirection =
  | 'NONE'
  | 'LOCAL'
  | 'DOWN'
  | 'UP'
  | 'LEFT'
  | 'RIGHT'
  | 'INWARD_H'
  | 'OUTWARD_H'
  | 'INWARD_V'
  | 'OUTWARD_V';

export type GravityMode =
  | 'RANDOM_LOCAL'
  | 'RANDOM_4'
  | 'RANDOM_8'
  | 'DOWN'
  | 'UP'
  | 'LEFT'
  | 'RIGHT'
  | 'INWARD_H'
  | 'OUTWARD_H'
  | 'INWARD_V'
  | 'OUTWARD_V'
  | 'ALTERNATING';

export interface GridPos {
  r: number;
  c: number;
}

export interface TileCell {
  id: string;
  speciesId: number;
  frozen: boolean;
}

export type BoardGrid = (TileCell | null)[][];

export interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  timeLimitSeconds: number;
  pairsCount: number;
  speciesCount: number;
  gravityMode: GravityMode;
  gravityLabel: string;
  gravityDescription: string;
  frozenCount: number;
  initialHints: number;
  initialShuffles: number;
  chapter: number;
  chapterName: string;
}

export interface LevelProgress {
  completed: boolean;
  stars: number; // 1 to 3
  bestScore: number;
  bestTimeRemaining: number;
}

export interface SaveData {
  highestUnlockedLevel: number;
  totalScore: number;
  soundEnabled: boolean;
  levels: Record<number, LevelProgress>;
}

export interface ActiveConnection {
  id: string;
  path: GridPos[];
  a: GridPos;
  b: GridPos;
  speciesId: number;
}

export interface PoppingTile {
  id: string;
  tile: TileCell;
  r: number;
  c: number;
}

export interface FloatingScore {
  id: string;
  r: number;
  c: number;
  text: string;
  combo: number;
}
