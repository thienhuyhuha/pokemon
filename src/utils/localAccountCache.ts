import {
  getEquipmentUniqueKey,
  TD_ALL_HERO_TYPES,
  TD_ENHANCE_MAX_LEVEL,
  TD_EQUIPMENT_RARITY_META,
  TD_EQUIPMENT_SLOT_ORDER,
} from '../data/tdEquipment';
import {
  DEFAULT_TD_UPGRADES,
  getSpentUpgradeStars,
  getTotalStarsEarnedInTd,
  TD_CLEAR_UPGRADE_MAX_TIER,
  TD_MAX_LEVEL,
  TD_UPGRADE_MAX_TIER,
} from '../data/tdLevels';
import {
  TdEquipmentItem,
  TdEquipmentRarity,
  TdEquipmentSlot,
  TdHeroEquipmentMap,
  TdLevelProgress,
  TdSaveData,
  TdTowerType,
  TdUpgrades,
} from '../types/towerDefense';

export interface RememberedAccount {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

const REMEMBERED_ACCOUNT_KEY = 'chibimon_200_remembered_account_v1';
const TD_GUEST_KEY = 'chibimon_td_15_guest_v1';
const TD_PLAYER_PREFIX = 'chibimon_td_15_player_v1_';

const VALID_HERO_SET = new Set<string>(TD_ALL_HERO_TYPES);
const VALID_SLOT_SET = new Set<string>(TD_EQUIPMENT_SLOT_ORDER);
const VALID_RARITY_SET = new Set<string>(Object.keys(TD_EQUIPMENT_RARITY_META));

export const DEFAULT_TD_SAVE: TdSaveData = {
  highestUnlockedLevel: 1,
  totalScore: 0,
  bonusStars: 0,
  enhancementGems: 0,
  equipmentInventory: [],
  heroEquipment: {},
  soundEnabled: true,
  levels: {},
  upgrades: { ...DEFAULT_TD_UPGRADES },
};

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

function sanitizeTdUpgradesLocal(raw: unknown): TdUpgrades {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const clamp = (v: unknown, maxTier = TD_UPGRADE_MAX_TIER) =>
    Math.max(0, Math.min(maxTier, Math.floor(Number(v ?? 0) || 0)));
  return {
    archery: clamp(src.archery),
    magic: clamp(src.magic),
    barracks: clamp(src.barracks),
    artillery: clamp(src.artillery),
    support: clamp(src.support),
    economy: clamp(src.economy),
    spells: clamp(src.spells),
    citadel: clamp(src.citadel),
    lethality: clamp(src.lethality),
    mastery: clamp(src.mastery),
    clearGold: clamp(src.clearGold, TD_CLEAR_UPGRADE_MAX_TIER),
    clearPower: clamp(src.clearPower, TD_CLEAR_UPGRADE_MAX_TIER),
    clearCitadel: clamp(src.clearCitadel, TD_CLEAR_UPGRADE_MAX_TIER),
    clearArtifact: clamp(src.clearArtifact, TD_CLEAR_UPGRADE_MAX_TIER),
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

function sanitizeEquipmentLocal(raw: unknown): TdEquipmentItem[] {
  if (!Array.isArray(raw)) return [];
  const byKey = new Map<string, TdEquipmentItem>();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const rec = entry as Record<string, unknown>;
    const towerType = String(rec.towerType ?? '');
    const slot = String(rec.slot ?? '');
    const rarity = String(rec.rarity ?? '');
    if (!VALID_HERO_SET.has(towerType) || !VALID_SLOT_SET.has(slot) || !VALID_RARITY_SET.has(rarity)) {
      continue;
    }
    const tType = towerType as TdTowerType;
    const sType = slot as TdEquipmentSlot;
    const rType = rarity as TdEquipmentRarity;
    const key = getEquipmentUniqueKey(tType, sType, rType);
    const level = Math.max(0, Math.min(TD_ENHANCE_MAX_LEVEL, Math.floor(Number(rec.level ?? 0) || 0)));
    const id =
      typeof rec.id === 'string' && rec.id.trim().length > 0
        ? rec.id.trim().slice(0, 80)
        : `eq-${tType.toLowerCase()}-${sType.toLowerCase()}-${rType.toLowerCase()}`;
    const prev = byKey.get(key);
    if (!prev || level > prev.level) {
      byKey.set(key, { id, towerType: tType, slot: sType, rarity: rType, level });
    }
    if (byKey.size >= 540) break;
  }
  return Array.from(byKey.values());
}

function sanitizeHeroEquipLocal(raw: unknown, inv: TdEquipmentItem[]): TdHeroEquipmentMap {
  const out: TdHeroEquipmentMap = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const invById = new Map(inv.map((it) => [it.id, it]));
  for (const [heroKey, slotsRaw] of Object.entries(raw as Record<string, unknown>)) {
    if (!VALID_HERO_SET.has(heroKey)) continue;
    if (!slotsRaw || typeof slotsRaw !== 'object' || Array.isArray(slotsRaw)) continue;
    const cleanSlots: Partial<Record<TdEquipmentSlot, string>> = {};
    for (const [slotKey, itemId] of Object.entries(slotsRaw as Record<string, unknown>)) {
      if (!VALID_SLOT_SET.has(slotKey) || typeof itemId !== 'string') continue;
      const item = invById.get(itemId);
      if (!item || item.towerType !== heroKey || item.slot !== slotKey) continue;
      cleanSlots[slotKey as TdEquipmentSlot] = item.id;
    }
    if (Object.keys(cleanSlots).length > 0) {
      out[heroKey as TdTowerType] = cleanSlots;
    }
  }
  return out;
}

function parseTdSaveString(raw: string | null): TdSaveData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TdSaveData>;
    const inventory = sanitizeEquipmentLocal(parsed.equipmentInventory);
    return {
      highestUnlockedLevel: Math.max(
        1,
        Math.min(TD_MAX_LEVEL, Math.floor(parsed.highestUnlockedLevel ?? 1))
      ),
      totalScore: Math.max(0, Math.floor(parsed.totalScore ?? 0)),
      bonusStars: Math.max(0, Math.min(100000, Math.floor(parsed.bonusStars ?? 0))),
      enhancementGems: Math.max(0, Math.min(1000000, Math.floor(parsed.enhancementGems ?? 0))),
      equipmentInventory: inventory,
      heroEquipment: sanitizeHeroEquipLocal(parsed.heroEquipment, inventory),
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
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

  const bonusStars = Math.max(cloudSave.bonusStars ?? 0, localSave.bonusStars ?? 0);
  if (bonusStars > (cloudSave.bonusStars ?? 0)) {
    cloudNeedsUpdate = true;
  }

  const enhancementGems = Math.max(
    cloudSave.enhancementGems ?? 0,
    localSave.enhancementGems ?? 0
  );
  if (enhancementGems > (cloudSave.enhancementGems ?? 0)) {
    cloudNeedsUpdate = true;
  }

  const mergedInvMap = new Map<string, TdEquipmentItem>();
  for (const it of cloudSave.equipmentInventory ?? []) {
    mergedInvMap.set(getEquipmentUniqueKey(it.towerType, it.slot, it.rarity), { ...it });
  }
  for (const it of localSave.equipmentInventory ?? []) {
    const key = getEquipmentUniqueKey(it.towerType, it.slot, it.rarity);
    const prev = mergedInvMap.get(key);
    if (!prev || it.level > prev.level) {
      mergedInvMap.set(key, { ...it });
      cloudNeedsUpdate = true;
    }
  }
  const mergedInventory = Array.from(mergedInvMap.values());
  const invById = new Map(mergedInventory.map((it) => [it.id, it]));

  const mergedEquipped: TdHeroEquipmentMap = { ...(cloudSave.heroEquipment ?? {}) };
  for (const [heroKey, slotsRaw] of Object.entries(localSave.heroEquipment ?? {})) {
    const hType = heroKey as TdTowerType;
    const curSlots = { ...(mergedEquipped[hType] ?? {}) };
    let changed = false;
    for (const [slotKey, itemId] of Object.entries(slotsRaw ?? {})) {
      const sType = slotKey as TdEquipmentSlot;
      if (!curSlots[sType] && itemId && invById.has(itemId)) {
        curSlots[sType] = itemId;
        changed = true;
      }
    }
    if (changed) {
      mergedEquipped[hType] = curSlots;
      cloudNeedsUpdate = true;
    }
  }

  const totalStars = getTotalStarsEarnedInTd(mergedLevels, bonusStars);
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
      bonusStars,
      enhancementGems,
      equipmentInventory: mergedInventory,
      heroEquipment: sanitizeHeroEquipLocal(mergedEquipped, mergedInventory),
      soundEnabled: cloudSave.soundEnabled ?? localSave.soundEnabled ?? true,
      levels: mergedLevels,
      upgrades: mergedUpgrades,
    },
    cloudNeedsUpdate,
  };
}
