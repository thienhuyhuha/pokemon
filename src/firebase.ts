import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  getEquipmentUniqueKey,
  TD_ALL_HERO_TYPES,
  TD_ENHANCE_MAX_LEVEL,
  TD_EQUIPMENT_RARITY_META,
  TD_EQUIPMENT_SLOT_ORDER,
} from './data/tdEquipment';
import {
  DEFAULT_TD_UPGRADES,
  TD_CLEAR_UPGRADE_MAX_TIER,
  TD_MAX_LEVEL,
  TD_UPGRADE_MAX_TIER,
} from './data/tdLevels';
import {
  TdEquipmentItem,
  TdEquipmentRarity,
  TdEquipmentSlot,
  TdHeroEquipmentMap,
  TdLevelProgress,
  TdSaveData,
  TdTowerType,
  TdUpgrades,
} from './types/towerDefense';

const app = initializeApp(firebaseConfig);

function createFirestoreInstance() {
  try {
    return initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestoreInstance();
export const auth = getAuth(app);

void setPersistence(auth, indexedDBLocalPersistence).catch(() => {
  void setPersistence(auth, browserLocalPersistence).catch(() => {
    // Fallback to default SDK persistence
  });
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

export type CloudSyncStatus = 'local' | 'remembered' | 'syncing' | 'synced' | 'error';

const VALID_UID_REGEX = /^[a-zA-Z0-9_-]+$/;
const VALID_HERO_SET = new Set<string>(TD_ALL_HERO_TYPES);
const VALID_SLOT_SET = new Set<string>(TD_EQUIPMENT_SLOT_ORDER);
const VALID_RARITY_SET = new Set<string>(Object.keys(TD_EQUIPMENT_RARITY_META));

function clampInt(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, Math.floor(val)));
}

export function sanitizeTdUpgrades(raw: unknown): TdUpgrades {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const clampTier = (val: unknown, fallback: number, maxTier = TD_UPGRADE_MAX_TIER) =>
    clampInt(Number(val ?? fallback), 0, maxTier);
  return {
    archery: clampTier(src.archery, DEFAULT_TD_UPGRADES.archery),
    magic: clampTier(src.magic, DEFAULT_TD_UPGRADES.magic),
    barracks: clampTier(src.barracks, DEFAULT_TD_UPGRADES.barracks),
    artillery: clampTier(src.artillery, DEFAULT_TD_UPGRADES.artillery),
    support: clampTier(src.support, DEFAULT_TD_UPGRADES.support),
    economy: clampTier(src.economy, DEFAULT_TD_UPGRADES.economy),
    spells: clampTier(src.spells, DEFAULT_TD_UPGRADES.spells),
    citadel: clampTier(src.citadel, DEFAULT_TD_UPGRADES.citadel),
    lethality: clampTier(src.lethality, DEFAULT_TD_UPGRADES.lethality),
    mastery: clampTier(src.mastery, DEFAULT_TD_UPGRADES.mastery),
    clearGold: clampTier(src.clearGold, DEFAULT_TD_UPGRADES.clearGold, TD_CLEAR_UPGRADE_MAX_TIER),
    clearPower: clampTier(src.clearPower, DEFAULT_TD_UPGRADES.clearPower, TD_CLEAR_UPGRADE_MAX_TIER),
    clearCitadel: clampTier(src.clearCitadel, DEFAULT_TD_UPGRADES.clearCitadel, TD_CLEAR_UPGRADE_MAX_TIER),
    clearArtifact: clampTier(src.clearArtifact, DEFAULT_TD_UPGRADES.clearArtifact, TD_CLEAR_UPGRADE_MAX_TIER),
  };
}

export function sanitizeTdLevelsMap(
  rawLevels: Record<number | string, TdLevelProgress> | undefined
): Record<string, TdLevelProgress> {
  const out: Record<string, TdLevelProgress> = {};
  if (!rawLevels || typeof rawLevels !== 'object') return out;

  const entries = Object.entries(rawLevels)
    .filter(([key]) => {
      const n = Number(key);
      return Number.isInteger(n) && n >= 1 && n <= TD_MAX_LEVEL;
    })
    .slice(0, TD_MAX_LEVEL);

  for (const [key, val] of entries) {
    if (!val || typeof val !== 'object') continue;
    out[String(Number(key))] = {
      completed: Boolean(val.completed),
      stars: clampInt(Number(val.stars ?? 0), 0, 3),
      bestScore: clampInt(Number(val.bestScore ?? 0), 0, 500000000),
      bestLivesLeft: clampInt(Number(val.bestLivesLeft ?? 0), 0, 50),
    };
  }
  return out;
}

export function normalizeTdLevelsFromCloud(
  raw: unknown
): Record<number, TdLevelProgress> {
  const result: Record<number, TdLevelProgress> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const levelNum = Number(key);
    if (!Number.isInteger(levelNum) || levelNum < 1 || levelNum > TD_MAX_LEVEL) continue;
    if (!val || typeof val !== 'object') continue;
    const item = val as Record<string, unknown>;
    result[levelNum] = {
      completed: Boolean(item.completed),
      stars: clampInt(Number(item.stars ?? 0), 0, 3),
      bestScore: clampInt(Number(item.bestScore ?? 0), 0, 500000000),
      bestLivesLeft: clampInt(Number(item.bestLivesLeft ?? 0), 0, 50),
    };
  }
  return result;
}

export function sanitizeEquipmentInventory(raw: unknown): TdEquipmentItem[] {
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
    const level = clampInt(Number(rec.level ?? 0), 0, TD_ENHANCE_MAX_LEVEL);
    const id =
      typeof rec.id === 'string' && rec.id.trim().length > 0
        ? rec.id.trim().slice(0, 80)
        : `eq-${tType.toLowerCase()}-${sType.toLowerCase()}-${rType.toLowerCase()}`;
    const existing = byKey.get(key);
    if (!existing || level > existing.level) {
      byKey.set(key, { id, towerType: tType, slot: sType, rarity: rType, level });
    }
    if (byKey.size >= 540) break;
  }
  return Array.from(byKey.values());
}

export function sanitizeHeroEquipment(
  raw: unknown,
  inventory: TdEquipmentItem[]
): TdHeroEquipmentMap {
  const out: TdHeroEquipmentMap = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const invById = new Map(inventory.map((it) => [it.id, it]));

  for (const [heroKey, slotsRaw] of Object.entries(raw as Record<string, unknown>)) {
    if (!VALID_HERO_SET.has(heroKey)) continue;
    if (!slotsRaw || typeof slotsRaw !== 'object' || Array.isArray(slotsRaw)) continue;
    const heroType = heroKey as TdTowerType;
    const cleanSlots: Partial<Record<TdEquipmentSlot, string>> = {};
    for (const [slotKey, itemIdRaw] of Object.entries(slotsRaw as Record<string, unknown>)) {
      if (!VALID_SLOT_SET.has(slotKey) || typeof itemIdRaw !== 'string') continue;
      const item = invById.get(itemIdRaw);
      if (!item || item.towerType !== heroType || item.slot !== slotKey) continue;
      cleanSlots[slotKey as TdEquipmentSlot] = item.id;
    }
    if (Object.keys(cleanSlots).length > 0) {
      out[heroType] = cleanSlots;
    }
  }
  return out;
}

/**
 * NOTE: Do NOT await setPersistence() before signInWithPopup() — doing an async operation
 * before opening the OAuth popup forfeits the user-gesture activation token on Safari/Chrome Mobile.
 */
export function signInWithGoogle(forceSelectAccount = false): Promise<User> {
  const provider = new GoogleAuthProvider();
  if (forceSelectAccount) {
    provider.setCustomParameters({ prompt: 'select_account' });
  }
  return signInWithPopup(auth, provider).then((credential) => credential.user);
}

export function signInWithGoogleRedirect(forceSelectAccount = false): Promise<void> {
  const provider = new GoogleAuthProvider();
  if (forceSelectAccount) {
    provider.setCustomParameters({ prompt: 'select_account' });
  }
  return signInWithRedirect(auth, provider);
}

export async function checkGoogleRedirectResult(): Promise<User | null> {
  try {
    const res = await getRedirectResult(auth);
    return res?.user ?? null;
  } catch {
    return null;
  }
}

export async function signOutPlayer(): Promise<void> {
  await signOut(auth);
}

export async function createTdProfile(
  uid: string,
  initialSave: TdSaveData
): Promise<void> {
  if (!VALID_UID_REGEX.test(uid) || uid.length > 128) {
    throw new Error('Invalid user UID format');
  }
  const path = `towerDefenseProgress/${uid}`;
  const docRef = doc(db, 'towerDefenseProgress', uid);
  const cleanInventory = sanitizeEquipmentInventory(initialSave.equipmentInventory);
  const cleanEquipped = sanitizeHeroEquipment(initialSave.heroEquipment, cleanInventory);

  const payload = {
    uid,
    highestUnlockedLevel: clampInt(initialSave.highestUnlockedLevel, 1, TD_MAX_LEVEL),
    totalScore: clampInt(initialSave.totalScore, 0, 500000000),
    bonusStars: clampInt(initialSave.bonusStars ?? 0, 0, 100000),
    enhancementGems: clampInt(initialSave.enhancementGems ?? 0, 0, 1000000),
    equipmentInventory: cleanInventory,
    heroEquipment: cleanEquipped,
    soundEnabled: initialSave.soundEnabled !== false,
    levels: sanitizeTdLevelsMap(initialSave.levels),
    upgrades: sanitizeTdUpgrades(initialSave.upgrades),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveTdProgressToCloud(
  uid: string,
  nextSave: TdSaveData
): Promise<void> {
  const path = `towerDefenseProgress/${uid}`;
  const docRef = doc(db, 'towerDefenseProgress', uid);
  const cleanInventory = sanitizeEquipmentInventory(nextSave.equipmentInventory);
  const cleanEquipped = sanitizeHeroEquipment(nextSave.heroEquipment, cleanInventory);
  try {
    await updateDoc(docRef, {
      highestUnlockedLevel: clampInt(nextSave.highestUnlockedLevel, 1, TD_MAX_LEVEL),
      totalScore: clampInt(nextSave.totalScore, 0, 500000000),
      bonusStars: clampInt(nextSave.bonusStars ?? 0, 0, 100000),
      enhancementGems: clampInt(nextSave.enhancementGems ?? 0, 0, 1000000),
      equipmentInventory: cleanInventory,
      heroEquipment: cleanEquipped,
      soundEnabled: nextSave.soundEnabled !== false,
      levels: sanitizeTdLevelsMap(nextSave.levels),
      upgrades: sanitizeTdUpgrades(nextSave.upgrades),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
