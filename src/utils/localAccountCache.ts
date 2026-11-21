import { DIAMOND_MAX_LEVEL } from '../data/diamondLevels';
import { MAX_LEVEL } from '../data/levels';
import {
  DEFAULT_TD_UPGRADES,
  getSpentUpgradeStars,
  getTotalStarsEarnedInTd,
  TD_MAX_LEVEL,
} from '../data/tdLevels';
import { DiamondLevelProgress, DiamondSaveData } from '../types/diamond';
import { LevelProgress, SaveData } from '../types/game';
import { TdLevelProgress, TdSaveData, TdUpgrades } from '../types/towerDefense';

export interface RememberedAccount {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

const GUEST_STORAGE_KEY = 'chibimon_200_guest_save_v1';
const LEGACY_STORAGE_KEY = 'pokeconnect_200_save_v2';
const REMEMBERED_ACCOUNT_KEY = 'chibimon_200_remembered_account_v1';
const PLAYER_SAVE_PREFIX = 'chibimon_200_player_save_v1_';

const DIAMOND_GUEST_KEY = 'chibimon_diamond_100_guest_v1';
const DIAMOND_PLAYER_PREFIX = 'chibimon_diamond_100_player_v1_';

const TD_GUEST_KEY = 'chibimon_td_15_guest_v1';
const TD_PLAYER_PREFIX = 'chibimon_td_15_player_v1_';

export const DEFAULT_SAVE: SaveData = {
  highestUnlockedLevel: 1,
  totalScore: 0,
  soundEnabled: true,
  levels: {},
};

export const DEFAULT_DIAMOND_SAVE: DiamondSaveData = {
  highestUnlockedLevel: 1,
  totalScore: 0,
  levels: {},
};

export const DEFAULT_TD_SAVE: TdSaveData = {
  highestUnlockedLevel: 1,
  totalScore: 0,
  levels: {},
  upgrades: { ...DEFAULT_TD_UPGRADES },
};

function sanitizeLevelsRecord(raw: unknown): Record<number, LevelProgress> {
  const result: Record<number, LevelProgress> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const levelNum = Number(key);
    if (!Number.isInteger(levelNum) || levelNum < 1 || levelNum > MAX_LEVEL) continue;
    if (!val || typeof val !== 'object') continue;
    const item = val as Record<string, unknown>;
    result[levelNum] = {
      completed: Boolean(item.completed),
      stars: Math.max(0, Math.min(3, Math.floor(Number(item.stars ?? 0) || 0))),
      bestScore: Math.max(0, Math.floor(Number(item.bestScore ?? 0) || 0)),
      bestTimeRemaining: Math.max(0, Math.floor(Number(item.bestTimeRemaining ?? 0) || 0)),
    };
  }
  return result;
}

function parseSaveString(raw: string | null): SaveData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      highestUnlockedLevel: Math.max(
        1,
        Math.min(MAX_LEVEL, Math.floor(parsed.highestUnlockedLevel ?? 1))
      ),
      totalScore: Math.max(0, Math.floor(parsed.totalScore ?? 0)),
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      levels: sanitizeLevelsRecord(parsed.levels),
    };
  } catch {
    return null;
  }
}

export function loadGuestSaveData(): SaveData {
  try {
    const current = parseSaveString(localStorage.getItem(GUEST_STORAGE_KEY));
    if (current) return current;
    const legacy = parseSaveString(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacy) return legacy;
    return DEFAULT_SAVE;
  } catch {
    return DEFAULT_SAVE;
  }
}

export function saveGuestSaveData(data: SaveData): void {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearGuestSaveData(): void {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(DEFAULT_SAVE));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function getRememberedAccount(): RememberedAccount | null {
  try {
    const raw = localStorage.getItem(REMEMBERED_ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RememberedAccount>;
    if (!parsed.uid || typeof parsed.uid !== 'string') return null;
    return {
      uid: parsed.uid,
      displayName: parsed.displayName || 'Người chơi',
      email: parsed.email || '',
      photoURL: parsed.photoURL || '',
    };
  } catch {
    return null;
  }
}

export function setRememberedAccount(account: RememberedAccount): void {
  try {
    localStorage.setItem(REMEMBERED_ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearRememberedAccount(): void {
  try {
    localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function loadPlayerLocalSave(uid: string): SaveData | null {
  try {
    return parseSaveString(localStorage.getItem(`${PLAYER_SAVE_PREFIX}${uid}`));
  } catch {
    return null;
  }
}

export function savePlayerLocalSave(uid: string, data: SaveData): void {
  try {
    localStorage.setItem(`${PLAYER_SAVE_PREFIX}${uid}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function mergeSaveData(
  cloudSave: SaveData,
  localSave: SaveData | null
): { merged: SaveData; cloudNeedsUpdate: boolean } {
  if (!localSave) {
    return { merged: cloudSave, cloudNeedsUpdate: false };
  }

  let cloudNeedsUpdate = false;
  const mergedLevels: Record<number, LevelProgress> = { ...cloudSave.levels };

  for (const [key, localLv] of Object.entries(localSave.levels)) {
    const levelNum = Number(key);
    const cloudLv = mergedLevels[levelNum];
    if (!cloudLv) {
      mergedLevels[levelNum] = localLv;
      cloudNeedsUpdate = true;
      continue;
    }

    const completed = cloudLv.completed || localLv.completed;
    const stars = Math.max(cloudLv.stars, localLv.stars);
    const bestScore = Math.max(cloudLv.bestScore, localLv.bestScore);
    const bestTimeRemaining = Math.max(
      cloudLv.bestTimeRemaining,
      localLv.bestTimeRemaining
    );

    if (
      completed !== cloudLv.completed ||
      stars !== cloudLv.stars ||
      bestScore !== cloudLv.bestScore ||
      bestTimeRemaining !== cloudLv.bestTimeRemaining
    ) {
      mergedLevels[levelNum] = {
        completed,
        stars,
        bestScore,
        bestTimeRemaining,
      };
      cloudNeedsUpdate = true;
    }
  }

  const maxAllowedUnlocked = Math.min(MAX_LEVEL, Object.keys(mergedLevels).length + 1);
  const highestUnlockedLevel = Math.min(
    maxAllowedUnlocked,
    Math.max(cloudSave.highestUnlockedLevel, localSave.highestUnlockedLevel)
  );
  if (highestUnlockedLevel > cloudSave.highestUnlockedLevel) {
    cloudNeedsUpdate = true;
  }

  const summedBestScores = Object.values(mergedLevels).reduce(
    (sum, lv) => sum + (lv.bestScore || 0),
    0
  );
  const totalScore = Math.max(
    cloudSave.totalScore,
    localSave.totalScore,
    summedBestScores
  );
  if (totalScore > cloudSave.totalScore) {
    cloudNeedsUpdate = true;
  }

  return {
    merged: {
      highestUnlockedLevel,
      totalScore,
      soundEnabled: cloudSave.soundEnabled,
      levels: mergedLevels,
    },
    cloudNeedsUpdate,
  };
}

// ---------- Diamond Match-3 (100 Levels) Local Cache & Merge ----------

function sanitizeDiamondLevelsRecord(raw: unknown): Record<number, DiamondLevelProgress> {
  const result: Record<number, DiamondLevelProgress> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const levelNum = Number(key);
    if (!Number.isInteger(levelNum) || levelNum < 1 || levelNum > DIAMOND_MAX_LEVEL) continue;
    if (!val || typeof val !== 'object') continue;
    const item = val as Record<string, unknown>;
    result[levelNum] = {
      completed: Boolean(item.completed),
      stars: Math.max(0, Math.min(3, Math.floor(Number(item.stars ?? 0) || 0))),
      bestScore: Math.max(0, Math.floor(Number(item.bestScore ?? 0) || 0)),
      bestMovesLeft: Math.max(0, Math.floor(Number(item.bestMovesLeft ?? 0) || 0)),
    };
  }
  return result;
}

function parseDiamondSaveString(raw: string | null): DiamondSaveData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DiamondSaveData>;
    return {
      highestUnlockedLevel: Math.max(
        1,
        Math.min(DIAMOND_MAX_LEVEL, Math.floor(parsed.highestUnlockedLevel ?? 1))
      ),
      totalScore: Math.max(0, Math.floor(parsed.totalScore ?? 0)),
      levels: sanitizeDiamondLevelsRecord(parsed.levels),
    };
  } catch {
    return null;
  }
}

export function loadGuestDiamondSave(): DiamondSaveData {
  try {
    return parseDiamondSaveString(localStorage.getItem(DIAMOND_GUEST_KEY)) ?? DEFAULT_DIAMOND_SAVE;
  } catch {
    return DEFAULT_DIAMOND_SAVE;
  }
}

export function saveGuestDiamondSave(data: DiamondSaveData): void {
  try {
    localStorage.setItem(DIAMOND_GUEST_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearGuestDiamondSave(): void {
  try {
    localStorage.setItem(DIAMOND_GUEST_KEY, JSON.stringify(DEFAULT_DIAMOND_SAVE));
  } catch {
    // Ignore storage errors
  }
}

export function loadPlayerDiamondSave(uid: string): DiamondSaveData | null {
  try {
    return parseDiamondSaveString(localStorage.getItem(`${DIAMOND_PLAYER_PREFIX}${uid}`));
  } catch {
    return null;
  }
}

export function savePlayerDiamondSave(uid: string, data: DiamondSaveData): void {
  try {
    localStorage.setItem(`${DIAMOND_PLAYER_PREFIX}${uid}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function mergeDiamondSaveData(
  cloudSave: DiamondSaveData,
  localSave: DiamondSaveData | null
): { merged: DiamondSaveData; cloudNeedsUpdate: boolean } {
  if (!localSave) {
    return { merged: cloudSave, cloudNeedsUpdate: false };
  }

  let cloudNeedsUpdate = false;
  const mergedLevels: Record<number, DiamondLevelProgress> = { ...cloudSave.levels };

  for (const [key, localLv] of Object.entries(localSave.levels)) {
    const levelNum = Number(key);
    const cloudLv = mergedLevels[levelNum];
    if (!cloudLv) {
      mergedLevels[levelNum] = localLv;
      cloudNeedsUpdate = true;
      continue;
    }

    const completed = cloudLv.completed || localLv.completed;
    const stars = Math.max(cloudLv.stars, localLv.stars);
    const bestScore = Math.max(cloudLv.bestScore, localLv.bestScore);
    const bestMovesLeft = Math.max(cloudLv.bestMovesLeft, localLv.bestMovesLeft);

    if (
      completed !== cloudLv.completed ||
      stars !== cloudLv.stars ||
      bestScore !== cloudLv.bestScore ||
      bestMovesLeft !== cloudLv.bestMovesLeft
    ) {
      mergedLevels[levelNum] = {
        completed,
        stars,
        bestScore,
        bestMovesLeft,
      };
      cloudNeedsUpdate = true;
    }
  }

  const maxAllowedUnlocked = Math.min(DIAMOND_MAX_LEVEL, Object.keys(mergedLevels).length + 1);
  const highestUnlockedLevel = Math.min(
    maxAllowedUnlocked,
    Math.max(cloudSave.highestUnlockedLevel, localSave.highestUnlockedLevel)
  );
  if (highestUnlockedLevel > cloudSave.highestUnlockedLevel) {
    cloudNeedsUpdate = true;
  }

  const summedBestScores = Object.values(mergedLevels).reduce(
    (sum, lv) => sum + (lv.bestScore || 0),
    0
  );
  const totalScore = Math.max(cloudSave.totalScore, localSave.totalScore, summedBestScores);
  if (totalScore > cloudSave.totalScore) {
    cloudNeedsUpdate = true;
  }

  return {
    merged: {
      highestUnlockedLevel,
      totalScore,
      levels: mergedLevels,
    },
    cloudNeedsUpdate,
  };
}

// ---------- Tower Defense (Vệ Thành Quái Thú - 15 Stages) Local Cache & Merge ----------

function sanitizeTdUpgradesLocal(raw: unknown): TdUpgrades {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const clamp = (v: unknown) => Math.max(0, Math.min(3, Math.floor(Number(v ?? 0) || 0)));
  return {
    archery: clamp(src.archery),
    magic: clamp(src.magic),
    barracks: clamp(src.barracks),
    economy: clamp(src.economy),
    spells: clamp(src.spells),
  };
}

function sanitizeTdLevelsRecord(raw: unknown): Record<number, TdLevelProgress> {
  const result: Record<number, TdLevelProgress> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const levelNum = Number(key);
    if (!Number.isInteger(levelNum) || levelNum < 1 || levelNum > TD_MAX_LEVEL) continue;
    if (!val || typeof val !== 'object') continue;
    const item = val as Record<string, unknown>;
    result[levelNum] = {
      completed: Boolean(item.completed),
      stars: Math.max(0, Math.min(3, Math.floor(Number(item.stars ?? 0) || 0))),
      bestScore: Math.max(0, Math.floor(Number(item.bestScore ?? 0) || 0)),
      bestLivesLeft: Math.max(0, Math.min(50, Math.floor(Number(item.bestLivesLeft ?? 0) || 0))),
    };
  }
  return result;
}

function parseTdSaveString(raw: string | null): TdSaveData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TdSaveData>;
    return {
      highestUnlockedLevel: Math.max(
        1,
        Math.min(TD_MAX_LEVEL, Math.floor(parsed.highestUnlockedLevel ?? 1))
      ),
      totalScore: Math.max(0, Math.floor(parsed.totalScore ?? 0)),
      levels: sanitizeTdLevelsRecord(parsed.levels),
      upgrades: sanitizeTdUpgradesLocal(parsed.upgrades),
    };
  } catch {
    return null;
  }
}

export function loadGuestTdSave(): TdSaveData {
  try {
    return parseTdSaveString(localStorage.getItem(TD_GUEST_KEY)) ?? DEFAULT_TD_SAVE;
  } catch {
    return DEFAULT_TD_SAVE;
  }
}

export function saveGuestTdSave(data: TdSaveData): void {
  try {
    localStorage.setItem(TD_GUEST_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearGuestTdSave(): void {
  try {
    localStorage.setItem(TD_GUEST_KEY, JSON.stringify(DEFAULT_TD_SAVE));
  } catch {
    // Ignore storage errors
  }
}

export function loadPlayerTdSave(uid: string): TdSaveData | null {
  try {
    return parseTdSaveString(localStorage.getItem(`${TD_PLAYER_PREFIX}${uid}`));
  } catch {
    return null;
  }
}

export function savePlayerTdSave(uid: string, data: TdSaveData): void {
  try {
    localStorage.setItem(`${TD_PLAYER_PREFIX}${uid}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function mergeTdSaveData(
  cloudSave: TdSaveData,
  localSave: TdSaveData | null
): { merged: TdSaveData; cloudNeedsUpdate: boolean } {
  if (!localSave) {
    return { merged: cloudSave, cloudNeedsUpdate: false };
  }

  let cloudNeedsUpdate = false;
  const mergedLevels: Record<number, TdLevelProgress> = { ...cloudSave.levels };

  for (const [key, localLv] of Object.entries(localSave.levels)) {
    const levelNum = Number(key);
    const cloudLv = mergedLevels[levelNum];
    if (!cloudLv) {
      mergedLevels[levelNum] = localLv;
      cloudNeedsUpdate = true;
      continue;
    }

    const completed = cloudLv.completed || localLv.completed;
    const stars = Math.max(cloudLv.stars, localLv.stars);
    const bestScore = Math.max(cloudLv.bestScore, localLv.bestScore);
    const bestLivesLeft = Math.max(cloudLv.bestLivesLeft, localLv.bestLivesLeft);

    if (
      completed !== cloudLv.completed ||
      stars !== cloudLv.stars ||
      bestScore !== cloudLv.bestScore ||
      bestLivesLeft !== cloudLv.bestLivesLeft
    ) {
      mergedLevels[levelNum] = {
        completed,
        stars,
        bestScore,
        bestLivesLeft,
      };
      cloudNeedsUpdate = true;
    }
  }

  const maxAllowedUnlocked = Math.min(TD_MAX_LEVEL, Object.keys(mergedLevels).length + 1);
  const highestUnlockedLevel = Math.min(
    maxAllowedUnlocked,
    Math.max(cloudSave.highestUnlockedLevel, localSave.highestUnlockedLevel)
  );
  if (highestUnlockedLevel > cloudSave.highestUnlockedLevel) {
    cloudNeedsUpdate = true;
  }

  const summedBestScores = Object.values(mergedLevels).reduce(
    (sum, lv) => sum + (lv.bestScore || 0),
    0
  );
  const totalScore = Math.max(cloudSave.totalScore, localSave.totalScore, summedBestScores);
  if (totalScore > cloudSave.totalScore) {
    cloudNeedsUpdate = true;
  }

  const totalStars = getTotalStarsEarnedInTd(mergedLevels);
  const cloudSpent = getSpentUpgradeStars(cloudSave.upgrades);
  const localSpent = getSpentUpgradeStars(localSave.upgrades);
  let mergedUpgrades = { ...cloudSave.upgrades };
  if (localSpent <= totalStars && localSpent > cloudSpent) {
    mergedUpgrades = { ...localSave.upgrades };
    cloudNeedsUpdate = true;
  }

  return {
    merged: {
      highestUnlockedLevel,
      totalScore,
      levels: mergedLevels,
      upgrades: mergedUpgrades,
    },
    cloudNeedsUpdate,
  };
}

