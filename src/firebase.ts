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
import { DIAMOND_MAX_LEVEL } from './data/diamondLevels';
import { MAX_LEVEL } from './data/levels';
import {
  DEFAULT_TD_UPGRADES,
  TD_MAX_LEVEL,
  TD_UPGRADE_MAX_TIER,
} from './data/tdLevels';
import { DiamondLevelProgress, DiamondSaveData } from './types/diamond';
import { LevelProgress, SaveData } from './types/game';
import { TdLevelProgress, TdSaveData, TdUpgrades } from './types/towerDefense';

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

function sanitizeDisplayName(name: string | null | undefined): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'Người chơi';
  return trimmed.slice(0, 80);
}

function sanitizeEmail(email: string | null | undefined): string {
  const trimmed = (email ?? '').trim();
  if (trimmed.length >= 3) return trimmed.slice(0, 160);
  return 'player@chibimon.app';
}

function sanitizePhotoURL(url: string | null | undefined): string {
  const trimmed = (url ?? '').trim();
  return trimmed.slice(0, 500);
}

function clampInt(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, Math.floor(val)));
}

export function sanitizeLevelsMap(
  rawLevels: Record<number | string, LevelProgress> | undefined
): Record<string, LevelProgress> {
  const out: Record<string, LevelProgress> = {};
  if (!rawLevels || typeof rawLevels !== 'object') return out;

  const entries = Object.entries(rawLevels)
    .filter(([key]) => {
      const n = Number(key);
      return Number.isInteger(n) && n >= 1 && n <= MAX_LEVEL;
    })
    .slice(0, MAX_LEVEL);

  for (const [key, val] of entries) {
    if (!val || typeof val !== 'object') continue;
    out[String(Number(key))] = {
      completed: Boolean(val.completed),
      stars: clampInt(Number(val.stars ?? 0), 0, 3),
      bestScore: clampInt(Number(val.bestScore ?? 0), 0, 500000000),
      bestTimeRemaining: clampInt(Number(val.bestTimeRemaining ?? 0), 0, 3600),
    };
  }
  return out;
}

export function normalizeLevelsFromCloud(raw: unknown): Record<number, LevelProgress> {
  const result: Record<number, LevelProgress> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const levelNum = Number(key);
    if (!Number.isInteger(levelNum) || levelNum < 1 || levelNum > MAX_LEVEL) continue;
    if (!val || typeof val !== 'object') continue;
    const item = val as Record<string, unknown>;
    result[levelNum] = {
      completed: Boolean(item.completed),
      stars: clampInt(Number(item.stars ?? 0), 0, 3),
      bestScore: clampInt(Number(item.bestScore ?? 0), 0, 500000000),
      bestTimeRemaining: clampInt(Number(item.bestTimeRemaining ?? 0), 0, 3600),
    };
  }
  return result;
}

export function sanitizeDiamondLevelsMap(
  rawLevels: Record<number | string, DiamondLevelProgress> | undefined
): Record<string, DiamondLevelProgress> {
  const out: Record<string, DiamondLevelProgress> = {};
  if (!rawLevels || typeof rawLevels !== 'object') return out;

  const entries = Object.entries(rawLevels)
    .filter(([key]) => {
      const n = Number(key);
      return Number.isInteger(n) && n >= 1 && n <= DIAMOND_MAX_LEVEL;
    })
    .slice(0, DIAMOND_MAX_LEVEL);

  for (const [key, val] of entries) {
    if (!val || typeof val !== 'object') continue;
    out[String(Number(key))] = {
      completed: Boolean(val.completed),
      stars: clampInt(Number(val.stars ?? 0), 0, 3),
      bestScore: clampInt(Number(val.bestScore ?? 0), 0, 500000000),
      bestMovesLeft: clampInt(Number(val.bestMovesLeft ?? 0), 0, 200),
    };
  }
  return out;
}

export function normalizeDiamondLevelsFromCloud(
  raw: unknown
): Record<number, DiamondLevelProgress> {
  const result: Record<number, DiamondLevelProgress> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const levelNum = Number(key);
    if (!Number.isInteger(levelNum) || levelNum < 1 || levelNum > DIAMOND_MAX_LEVEL) continue;
    if (!val || typeof val !== 'object') continue;
    const item = val as Record<string, unknown>;
    result[levelNum] = {
      completed: Boolean(item.completed),
      stars: clampInt(Number(item.stars ?? 0), 0, 3),
      bestScore: clampInt(Number(item.bestScore ?? 0), 0, 500000000),
      bestMovesLeft: clampInt(Number(item.bestMovesLeft ?? 0), 0, 200),
    };
  }
  return result;
}

export function sanitizeTdUpgrades(raw: unknown): TdUpgrades {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const clampTier = (val: unknown, fallback: number) =>
    clampInt(Number(val ?? fallback), 0, TD_UPGRADE_MAX_TIER);
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

export async function createPlayerProfile(user: User, initialSave: SaveData): Promise<void> {
  if (!VALID_UID_REGEX.test(user.uid) || user.uid.length > 128) {
    throw new Error('Invalid user UID format');
  }
  const path = `users/${user.uid}`;
  const docRef = doc(db, 'users', user.uid);

  const payload = {
    uid: user.uid,
    displayName: sanitizeDisplayName(user.displayName),
    email: sanitizeEmail(user.email),
    photoURL: sanitizePhotoURL(user.photoURL),
    highestUnlockedLevel: clampInt(initialSave.highestUnlockedLevel, 1, MAX_LEVEL),
    totalScore: clampInt(initialSave.totalScore, 0, 500000000),
    soundEnabled: Boolean(initialSave.soundEnabled),
    levels: sanitizeLevelsMap(initialSave.levels),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function syncPlayerIdentity(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  const docRef = doc(db, 'users', user.uid);
  try {
    await updateDoc(docRef, {
      displayName: sanitizeDisplayName(user.displayName),
      email: sanitizeEmail(user.email),
      photoURL: sanitizePhotoURL(user.photoURL),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function savePlayerProgressToCloud(uid: string, nextSave: SaveData): Promise<void> {
  const path = `users/${uid}`;
  const docRef = doc(db, 'users', uid);
  try {
    await updateDoc(docRef, {
      highestUnlockedLevel: clampInt(nextSave.highestUnlockedLevel, 1, MAX_LEVEL),
      totalScore: clampInt(nextSave.totalScore, 0, 500000000),
      levels: sanitizeLevelsMap(nextSave.levels),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function savePlayerSoundToCloud(uid: string, soundEnabled: boolean): Promise<void> {
  const path = `users/${uid}`;
  const docRef = doc(db, 'users', uid);
  try {
    await updateDoc(docRef, {
      soundEnabled: Boolean(soundEnabled),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createDiamondProfile(
  uid: string,
  initialSave: DiamondSaveData
): Promise<void> {
  if (!VALID_UID_REGEX.test(uid) || uid.length > 128) {
    throw new Error('Invalid user UID format');
  }
  const path = `diamondProgress/${uid}`;
  const docRef = doc(db, 'diamondProgress', uid);

  const payload = {
    uid,
    highestUnlockedLevel: clampInt(initialSave.highestUnlockedLevel, 1, DIAMOND_MAX_LEVEL),
    totalScore: clampInt(initialSave.totalScore, 0, 500000000),
    levels: sanitizeDiamondLevelsMap(initialSave.levels),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveDiamondProgressToCloud(
  uid: string,
  nextSave: DiamondSaveData
): Promise<void> {
  const path = `diamondProgress/${uid}`;
  const docRef = doc(db, 'diamondProgress', uid);
  try {
    await updateDoc(docRef, {
      highestUnlockedLevel: clampInt(nextSave.highestUnlockedLevel, 1, DIAMOND_MAX_LEVEL),
      totalScore: clampInt(nextSave.totalScore, 0, 500000000),
      levels: sanitizeDiamondLevelsMap(nextSave.levels),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
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

  const payload = {
    uid,
    highestUnlockedLevel: clampInt(initialSave.highestUnlockedLevel, 1, TD_MAX_LEVEL),
    totalScore: clampInt(initialSave.totalScore, 0, 500000000),
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
  try {
    await updateDoc(docRef, {
      highestUnlockedLevel: clampInt(nextSave.highestUnlockedLevel, 1, TD_MAX_LEVEL),
      totalScore: clampInt(nextSave.totalScore, 0, 500000000),
      levels: sanitizeTdLevelsMap(nextSave.levels),
      upgrades: sanitizeTdUpgrades(nextSave.upgrades),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
