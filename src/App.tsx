import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  ArrowLeft,
  Lightbulb,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { DiamondArenaStage } from './components/DiamondArenaStage';
import { DiamondLevelSelectView } from './components/DiamondLevelSelectView';
import { EndRoundModal } from './components/EndRoundModal';
import { GameBoard } from './components/GameBoard';
import { LevelSelectView } from './components/LevelSelectView';
import { PokeballIcon } from './components/PokeballIcon';
import { TdEndModal } from './components/TdEndModal';
import { TdLevelSelectView } from './components/TdLevelSelectView';
import { TitleScreen } from './components/TitleScreen';
import { TowerDefenseArenaStage } from './components/TowerDefenseArenaStage';
import { DIAMOND_MAX_LEVEL, getDiamondLevelConfig } from './data/diamondLevels';
import {
  formatDuration,
  getLevelConfig,
  MAX_LEVEL,
} from './data/levels';
import { preloadAllGameAssets } from './data/pokemonSprites';
import {
  getStageClearBonusStars,
  getTdLevelConfig,
  isTowerUnlocked,
  TD_MAX_LEVEL,
  TD_TOWER_BUILD_ORDER,
} from './data/tdLevels';
import {
  auth,
  checkGoogleRedirectResult,
  CloudSyncStatus,
  createDiamondProfile,
  createPlayerProfile,
  createTdProfile,
  db,
  handleFirestoreError,
  normalizeDiamondLevelsFromCloud,
  normalizeLevelsFromCloud,
  normalizeTdLevelsFromCloud,
  OperationType,
  sanitizeTdUpgrades,
  saveDiamondProgressToCloud,
  savePlayerProgressToCloud,
  savePlayerSoundToCloud,
  saveTdProgressToCloud,
  signInWithGoogle,
  signInWithGoogleRedirect,
  signOutPlayer,
  syncPlayerIdentity,
} from './firebase';
import { useViewportMode } from './hooks/useViewportMode';
import { DiamondLevelConfig, DiamondSaveData, GameId } from './types/diamond';
import {
  ActiveConnection,
  BoardGrid,
  FloatingScore,
  GameState,
  GridPos,
  LevelConfig,
  PoppingTile,
  SaveData,
} from './types/game';
import { TdLevelConfig, TdSaveData, TdUpgrades } from './types/towerDefense';
import {
  canRequestFullscreen,
  enterGameFullscreenAndLandscape,
  exitGameFullscreenAndUnlock,
} from './utils/fullscreen';
import {
  clearGuestDiamondSave,
  clearGuestSaveData,
  clearGuestTdSave,
  clearRememberedAccount,
  DEFAULT_DIAMOND_SAVE,
  DEFAULT_SAVE,
  DEFAULT_TD_SAVE,
  getRememberedAccount,
  loadGuestDiamondSave,
  loadGuestSaveData,
  loadGuestTdSave,
  loadPlayerDiamondSave,
  loadPlayerLocalSave,
  loadPlayerTdSave,
  mergeDiamondSaveData,
  mergeSaveData,
  mergeTdSaveData,
  RememberedAccount,
  saveGuestDiamondSave,
  saveGuestSaveData,
  saveGuestTdSave,
  savePlayerDiamondSave,
  savePlayerLocalSave,
  savePlayerTdSave,
  setRememberedAccount,
} from './utils/localAccountCache';
import {
  applyGravity,
  cloneBoard,
  countRemainingTiles,
  ensurePlayableBoard,
  findAnyValidPair,
  findConnectionPath,
  generateBoard,
  getDirectionLabel,
  shuffleBoard,
  thawAdjacentFrozen,
} from './utils/pathfinding';
import { sound } from './utils/sound';

function computeWinSaveData(
  prevSave: SaveData,
  level: number,
  finalRoundScore: number,
  stars: number,
  timeRemaining: number
): SaveData | null {
  if (level > prevSave.highestUnlockedLevel) {
    return null;
  }
  const prevLv = prevSave.levels[level];
  const bestScore = Math.max(prevLv?.bestScore ?? 0, finalRoundScore);
  const bestStars = Math.max(prevLv?.stars ?? 0, stars);
  const bestTimeRemaining = Math.max(
    prevLv?.bestTimeRemaining ?? 0,
    timeRemaining
  );
  const scoreDelta = prevLv
    ? Math.max(0, finalRoundScore - prevLv.bestScore)
    : finalRoundScore;

  return {
    ...prevSave,
    highestUnlockedLevel: Math.min(
      MAX_LEVEL,
      Math.max(prevSave.highestUnlockedLevel, level + 1)
    ),
    totalScore: prevSave.totalScore + scoreDelta,
    levels: {
      ...prevSave.levels,
      [level]: {
        completed: true,
        stars: bestStars,
        bestScore,
        bestTimeRemaining,
      },
    },
  };
}

export default function App() {
  const [rememberedAccount, setRememberedAccountState] = useState<RememberedAccount | null>(() =>
    getRememberedAccount()
  );
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRedirectFallback, setShowRedirectFallback] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() =>
    getRememberedAccount() ? 'remembered' : 'local'
  );
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [activeGame, setActiveGame] = useState<GameId>('CHIBIMON');

  const [saveData, setSaveData] = useState<SaveData>(() => {
    const remembered = getRememberedAccount();
    const loaded = remembered
      ? (loadPlayerLocalSave(remembered.uid) ?? loadGuestSaveData())
      : loadGuestSaveData();
    sound.setEnabled(loaded.soundEnabled);
    return loaded;
  });
  const [diamondSaveData, setDiamondSaveData] = useState<DiamondSaveData>(() => {
    const remembered = getRememberedAccount();
    return remembered
      ? (loadPlayerDiamondSave(remembered.uid) ?? loadGuestDiamondSave())
      : loadGuestDiamondSave();
  });
  const [tdSaveData, setTdSaveData] = useState<TdSaveData>(() => {
    const remembered = getRememberedAccount();
    return remembered
      ? (loadPlayerTdSave(remembered.uid) ?? loadGuestTdSave())
      : loadGuestTdSave();
  });
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(() => sound.bgmEnabled);

  // Creator/Admin preview mode (session-only; regular players must unlock sequentially)
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => getLevelConfig(1));
  const [diamondLevelConfig, setDiamondLevelConfig] = useState<DiamondLevelConfig>(() =>
    getDiamondLevelConfig(1)
  );
  const [diamondRunNonce, setDiamondRunNonce] = useState<number>(0);
  const [tdLevelConfig, setTdLevelConfig] = useState<TdLevelConfig>(() => getTdLevelConfig(1));
  const [tdRunNonce, setTdRunNonce] = useState<number>(0);
  const [tdResultModal, setTdResultModal] = useState<{
    type: 'WIN' | 'LOSE';
    level: number;
    score: number;
    stars: number;
    clearBonusStars?: number;
    newAchievementStars?: number;
    isFirstClear?: boolean;
    livesLeft: number;
    enemiesSlain: number;
  } | null>(null);
  const [board, setBoard] = useState<BoardGrid>([]);
  const [selected, setSelected] = useState<GridPos | null>(null);
  const [hintPair, setHintPair] = useState<{ a: GridPos; b: GridPos } | null>(null);
  const [activeConnections, setActiveConnections] = useState<ActiveConnection[]>([]);
  const [poppingTiles, setPoppingTiles] = useState<PoppingTile[]>([]);
  const [invalidPair, setInvalidPair] = useState<[GridPos, GridPos] | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const [score, setScore] = useState<number>(0);
  const [pairsMatched, setPairsMatched] = useState<number>(0);
  const [hintsLeft, setHintsLeft] = useState<number>(5);
  const [shufflesLeft, setShufflesLeft] = useState<number>(5);
  const [combo, setCombo] = useState<number>(0);
  const [earnedStars, setEarnedStars] = useState<number>(3);
  const [lastShiftLabel, setLastShiftLabel] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileZoomed, setMobileZoomed] = useState<boolean>(false);

  const viewport = useViewportMode();

  const saveDataRef = useRef<SaveData>(saveData);
  const diamondSaveRef = useRef<DiamondSaveData>(diamondSaveData);
  const tdSaveRef = useRef<TdSaveData>(tdSaveData);
  const boardRef = useRef<BoardGrid>(board);
  const selectedRef = useRef<GridPos | null>(selected);
  const gameStateRef = useRef<GameState>(gameState);
  const levelConfigRef = useRef<LevelConfig>(levelConfig);
  const comboRef = useRef<number>(combo);
  const pairsMatchedRef = useRef<number>(pairsMatched);
  const scoreRef = useRef<number>(score);
  const timeRemainingRef = useRef<number>(timeRemaining);
  const userRef = useRef<User | null>(user);
  const rememberedAccountRef = useRef<RememberedAccount | null>(rememberedAccount);
  const creatingProfileUidRef = useRef<string | null>(null);
  const creatingDiamondUidRef = useRef<string | null>(null);
  const creatingTdUidRef = useRef<string | null>(null);
  const identitySyncedUidRef = useRef<string | null>(null);
  const mergeSyncedUidRef = useRef<string | null>(null);
  const mergeDiamondSyncedUidRef = useRef<string | null>(null);
  const mergeTdSyncedUidRef = useRef<string | null>(null);

  const lastMatchAtRef = useRef<number>(0);
  const effectTimersRef = useRef<Set<number>>(new Set());
  const toastTimerRef = useRef<number | null>(null);
  const invalidTimerRef = useRef<number | null>(null);

  useEffect(() => {
    saveDataRef.current = saveData;
  }, [saveData]);

  useEffect(() => {
    diamondSaveRef.current = diamondSaveData;
  }, [diamondSaveData]);

  useEffect(() => {
    tdSaveRef.current = tdSaveData;
  }, [tdSaveData]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    levelConfigRef.current = levelConfig;
  }, [levelConfig]);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    pairsMatchedRef.current = pairsMatched;
  }, [pairsMatched]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    rememberedAccountRef.current = rememberedAccount;
  }, [rememberedAccount]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const clearPendingTimers = useCallback(() => {
    effectTimersRef.current.forEach((id) => window.clearTimeout(id));
    effectTimersRef.current.clear();
    if (invalidTimerRef.current) {
      window.clearTimeout(invalidTimerRef.current);
      invalidTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingTimers();
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [clearPendingTimers]);

  // Unlock Web Audio on first user interaction so BGM & SFX play reliably
  useEffect(() => {
    const handleUnlock = () => {
      sound.unlock();
    };
    window.addEventListener('pointerdown', handleUnlock, { passive: true });
    window.addEventListener('keydown', handleUnlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  // Eagerly preload all sprite sheets & arena images so offline mode never loses any tier
  useEffect(() => {
    preloadAllGameAssets();
    void checkGoogleRedirectResult();
  }, []);

  // Keep background music mode synced with game state and remaining time
  useEffect(() => {
    if (gameState === 'TITLE_MENU' || gameState === 'LEVEL_SELECT') {
      sound.setBgmState('menu', false);
    } else if (gameState === 'PLAYING') {
      const hurry = activeGame === 'CHIBIMON' && timeRemaining <= 30;
      sound.setBgmState('battle', hurry);
    } else {
      sound.setBgmState('off', false);
    }
  }, [activeGame, gameState, timeRemaining]);

  // Persist current player's progress locally on their machine
  useEffect(() => {
    const activeUid = user?.uid ?? rememberedAccount?.uid ?? null;
    if (activeUid) {
      savePlayerLocalSave(activeUid, saveData);
      savePlayerDiamondSave(activeUid, diamondSaveData);
      savePlayerTdSave(activeUid, tdSaveData);
      return;
    }
    if (!authReady) return;
    saveGuestSaveData(saveData);
    saveGuestDiamondSave(diamondSaveData);
    saveGuestTdSave(tdSaveData);
  }, [authReady, user, rememberedAccount, saveData, diamondSaveData, tdSaveData]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        creatingProfileUidRef.current = null;
        creatingDiamondUidRef.current = null;
        creatingTdUidRef.current = null;
        identitySyncedUidRef.current = null;
        mergeSyncedUidRef.current = null;
        mergeDiamondSyncedUidRef.current = null;
        mergeTdSyncedUidRef.current = null;

        const remembered = getRememberedAccount();
        if (remembered) {
          setRememberedAccountState(remembered);
          setSyncStatus('remembered');
          const cached = loadPlayerLocalSave(remembered.uid) ?? DEFAULT_SAVE;
          const cachedDiamond =
            loadPlayerDiamondSave(remembered.uid) ?? DEFAULT_DIAMOND_SAVE;
          const cachedTd = loadPlayerTdSave(remembered.uid) ?? DEFAULT_TD_SAVE;
          sound.setEnabled(cached.soundEnabled);
          setSaveData(cached);
          setDiamondSaveData(cachedDiamond);
          setTdSaveData(cachedTd);
        } else {
          setRememberedAccountState(null);
          setSyncStatus('local');
          const guest = loadGuestSaveData();
          const guestDiamond = loadGuestDiamondSave();
          const guestTd = loadGuestTdSave();
          sound.setEnabled(guest.soundEnabled);
          setSaveData(guest);
          setDiamondSaveData(guestDiamond);
          setTdSaveData(guestTd);
        }
        return;
      }

      const acct: RememberedAccount = {
        uid: nextUser.uid,
        displayName: nextUser.displayName?.trim().slice(0, 80) || 'Người chơi',
        email: nextUser.email?.trim().slice(0, 160) || '',
        photoURL: nextUser.photoURL?.trim().slice(0, 500) || '',
      };
      setRememberedAccount(acct);
      setRememberedAccountState(acct);
      setAuthError(null);
      setShowRedirectFallback(false);
      setSyncStatus('syncing');

      const cached = loadPlayerLocalSave(nextUser.uid);
      if (cached) {
        sound.setEnabled(cached.soundEnabled);
        setSaveData(cached);
      }
      const cachedDiamond = loadPlayerDiamondSave(nextUser.uid);
      if (cachedDiamond) {
        setDiamondSaveData(cachedDiamond);
      }
      const cachedTd = loadPlayerTdSave(nextUser.uid);
      if (cachedTd) {
        setTdSaveData(cachedTd);
      }
    });
    return () => unsub();
  }, []);

  // Attach Firestore real-time listener for the authenticated player
  useEffect(() => {
    if (!authReady || !user) return;

    const path = `users/${user.uid}`;
    const docRef = doc(db, 'users', user.uid);
    let active = true;

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (!active) return;

        if (snap.exists()) {
          const data = snap.data();
          const cloudSave: SaveData = {
            highestUnlockedLevel: Math.max(
              1,
              Math.min(MAX_LEVEL, Number(data.highestUnlockedLevel) || 1)
            ),
            totalScore: Math.max(0, Number(data.totalScore) || 0),
            soundEnabled:
              typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true,
            levels: normalizeLevelsFromCloud(data.levels),
          };

          const localCached = loadPlayerLocalSave(user.uid);
          const { merged, cloudNeedsUpdate } = mergeSaveData(cloudSave, localCached);

          sound.setEnabled(merged.soundEnabled);
          setSaveData(merged);
          savePlayerLocalSave(user.uid, merged);

          if (cloudNeedsUpdate && mergeSyncedUidRef.current !== user.uid) {
            mergeSyncedUidRef.current = user.uid;
            setSyncStatus('syncing');
            void savePlayerProgressToCloud(user.uid, merged)
              .then(() => {
                if (active) setSyncStatus('synced');
              })
              .catch((err: unknown) => {
                if (!active) return;
                setSyncStatus('error');
                if (err instanceof Error && err.message.includes('Quota exceeded')) {
                  showToast('Đã đạt giới hạn lưu trữ miễn phí hôm nay.');
                  return;
                }
                setFatalError(err instanceof Error ? err : new Error(String(err)));
              });
          } else {
            setSyncStatus('synced');
          }

          if (identitySyncedUidRef.current !== user.uid) {
            identitySyncedUidRef.current = user.uid;
            const needsIdentityUpdate =
              data.displayName !== (user.displayName?.trim().slice(0, 80) || 'Người chơi') ||
              data.email !== (user.email?.trim().slice(0, 160) || 'player@chibimon.app') ||
              data.photoURL !== (user.photoURL?.trim().slice(0, 500) || '');
            if (needsIdentityUpdate) {
              void syncPlayerIdentity(user).catch((err: unknown) => {
                setSyncStatus('error');
                if (err instanceof Error && err.message.includes('Quota exceeded')) {
                  showToast('Đã đạt giới hạn đọc/ghi miễn phí hôm nay, dữ liệu sẽ thử lại sau.');
                  return;
                }
                setFatalError(err instanceof Error ? err : new Error(String(err)));
              });
            }
          }
          return;
        }

        // First login for this Google account: create player profile
        if (creatingProfileUidRef.current === user.uid) return;
        creatingProfileUidRef.current = user.uid;

        const existingLocal = loadPlayerLocalSave(user.uid);
        const guest = loadGuestSaveData();
        const hasGuestProgress =
          guest.highestUnlockedLevel > 1 || Object.keys(guest.levels).length > 0;
        const initialSave = existingLocal ?? (hasGuestProgress ? guest : DEFAULT_SAVE);

        void createPlayerProfile(user, initialSave)
          .then(() => {
            if (!active) return;
            if (!existingLocal && hasGuestProgress) {
              clearGuestSaveData();
            }
            savePlayerLocalSave(user.uid, initialSave);
            identitySyncedUidRef.current = user.uid;
            sound.setEnabled(initialSave.soundEnabled);
            setSaveData(initialSave);
            setSyncStatus('synced');
          })
          .catch((err: unknown) => {
            if (!active) return;
            creatingProfileUidRef.current = null;
            setSyncStatus('error');
            if (err instanceof Error && err.message.includes('Quota exceeded')) {
              showToast('Đã đạt giới hạn lưu trữ miễn phí hôm nay.');
              return;
            }
            setFatalError(err instanceof Error ? err : new Error(String(err)));
          });
      },
      (error) => {
        if (!active) return;
        setSyncStatus('error');
        if (error.message.includes('Quota exceeded')) {
          showToast('Đã đạt giới hạn đọc/ghi miễn phí hôm nay.');
          return;
        }
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (wrapped) {
          setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authReady, user, showToast]);

  // Attach Firestore real-time listener for Kim Cương 100 progress
  useEffect(() => {
    if (!authReady || !user) return;

    const path = `diamondProgress/${user.uid}`;
    const docRef = doc(db, 'diamondProgress', user.uid);
    let active = true;

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (!active) return;

        if (snap.exists()) {
          const data = snap.data();
          const cloudSave: DiamondSaveData = {
            highestUnlockedLevel: Math.max(
              1,
              Math.min(DIAMOND_MAX_LEVEL, Number(data.highestUnlockedLevel) || 1)
            ),
            totalScore: Math.max(0, Number(data.totalScore) || 0),
            levels: normalizeDiamondLevelsFromCloud(data.levels),
          };

          const localCached = loadPlayerDiamondSave(user.uid);
          const { merged, cloudNeedsUpdate } = mergeDiamondSaveData(cloudSave, localCached);

          setDiamondSaveData(merged);
          savePlayerDiamondSave(user.uid, merged);

          if (cloudNeedsUpdate && mergeDiamondSyncedUidRef.current !== user.uid) {
            mergeDiamondSyncedUidRef.current = user.uid;
            void saveDiamondProgressToCloud(user.uid, merged).catch(() => {
              // Offline cache will retry automatically via Firestore persistent cache
            });
          }
          return;
        }

        if (creatingDiamondUidRef.current === user.uid) return;
        creatingDiamondUidRef.current = user.uid;

        const existingLocal = loadPlayerDiamondSave(user.uid);
        const guest = loadGuestDiamondSave();
        const hasGuestProgress =
          guest.highestUnlockedLevel > 1 || Object.keys(guest.levels).length > 0;
        const initialSave = existingLocal ?? (hasGuestProgress ? guest : DEFAULT_DIAMOND_SAVE);

        void createDiamondProfile(user.uid, initialSave)
          .then(() => {
            if (!active) return;
            if (!existingLocal && hasGuestProgress) {
              clearGuestDiamondSave();
            }
            savePlayerDiamondSave(user.uid, initialSave);
            setDiamondSaveData(initialSave);
          })
          .catch(() => {
            if (!active) return;
            creatingDiamondUidRef.current = null;
          });
      },
      (error) => {
        if (!active) return;
        if (error.message.includes('Quota exceeded')) return;
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (wrapped) {
          setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authReady, user]);

  // Attach Firestore real-time listener for Vệ Thành Quái Thú (Tower Defense) progress
  useEffect(() => {
    if (!authReady || !user) return;

    const path = `towerDefenseProgress/${user.uid}`;
    const docRef = doc(db, 'towerDefenseProgress', user.uid);
    let active = true;

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (!active) return;

        if (snap.exists()) {
          const data = snap.data();
          const cloudSave: TdSaveData = {
            highestUnlockedLevel: Math.max(
              1,
              Math.min(TD_MAX_LEVEL, Number(data.highestUnlockedLevel) || 1)
            ),
            totalScore: Math.max(0, Number(data.totalScore) || 0),
            bonusStars: Math.max(0, Number(data.bonusStars) || 0),
            levels: normalizeTdLevelsFromCloud(data.levels),
            upgrades: sanitizeTdUpgrades(data.upgrades),
          };

          const localCached = loadPlayerTdSave(user.uid);
          const { merged, cloudNeedsUpdate } = mergeTdSaveData(cloudSave, localCached);

          setTdSaveData(merged);
          savePlayerTdSave(user.uid, merged);

          if (cloudNeedsUpdate && mergeTdSyncedUidRef.current !== user.uid) {
            mergeTdSyncedUidRef.current = user.uid;
            void saveTdProgressToCloud(user.uid, merged).catch(() => {
              // Offline cache will retry automatically via Firestore persistent cache
            });
          }
          return;
        }

        if (creatingTdUidRef.current === user.uid) return;
        creatingTdUidRef.current = user.uid;

        const existingLocal = loadPlayerTdSave(user.uid);
        const guest = loadGuestTdSave();
        const hasGuestProgress =
          guest.highestUnlockedLevel > 1 ||
          Object.keys(guest.levels).length > 0 ||
          Object.values(guest.upgrades).some((v) => v > 0);
        const initialSave = existingLocal ?? (hasGuestProgress ? guest : DEFAULT_TD_SAVE);

        void createTdProfile(user.uid, initialSave)
          .then(() => {
            if (!active) return;
            if (!existingLocal && hasGuestProgress) {
              clearGuestTdSave();
            }
            savePlayerTdSave(user.uid, initialSave);
            setTdSaveData(initialSave);
          })
          .catch(() => {
            if (!active) return;
            creatingTdUidRef.current = null;
          });
      },
      (error) => {
        if (!active) return;
        if (error.message.includes('Quota exceeded')) return;
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (wrapped) {
          setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authReady, user]);

  const handleSignIn = useCallback(
    async (forceSelectAccount = false) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setAuthError(
          'Bạn đang ở chế độ Offline. Hãy kết nối mạng để đăng nhập/đồng bộ Google — bạn vẫn có thể chơi offline ngay lúc này!'
        );
        setShowRedirectFallback(false);
        return;
      }
      setAuthError(null);
      setShowRedirectFallback(false);
      // Invoke signInWithPopup synchronously in click handler before React re-renders steal gesture activation
      const popupPromise = signInWithGoogle(forceSelectAccount);
      setAuthLoading(true);
      clearPendingTimers();
      try {
        await popupPromise;
        setGameState((prev) => (prev === 'PLAYING' || prev === 'PAUSED' ? 'TITLE_MENU' : prev));
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        if (code === 'auth/popup-closed-by-user') {
          setAuthError('Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.');
        } else if (code === 'auth/cancelled-popup-request') {
          setAuthError('Yêu cầu đăng nhập trước đó đang xử lý — hãy bấm lại nút Đăng nhập Google.');
        } else if (code === 'auth/popup-blocked') {
          setAuthError(
            'Trình duyệt đã chặn cửa sổ bật lên (popup). Hãy cho phép popup hoặc bấm nút Đăng nhập bằng chuyển hướng.'
          );
          setShowRedirectFallback(true);
        } else if (code === 'auth/unauthorized-domain') {
          setAuthError(
            `Tên miền "${host}" chưa nằm trong Authorized Domains của Firebase Auth. Hãy thêm "${host}" vào Firebase Console → Authentication → Settings → Authorized domains.`
          );
        } else if (code === 'auth/operation-not-allowed') {
          setAuthError('Đăng nhập Google chưa được bật trong Firebase Authentication.');
        } else if (code === 'auth/network-request-failed') {
          setAuthError('Không có kết nối mạng. Bạn vẫn có thể tiếp tục chơi chế độ Offline.');
        } else {
          setAuthError(
            `Không thể đăng nhập Google (${code || 'lỗi xác thực'}). Bạn có thể thử chuyển hướng bên dưới.`
          );
          setShowRedirectFallback(true);
        }
      } finally {
        setAuthLoading(false);
      }
    },
    [clearPendingTimers]
  );

  const handleSignInRedirect = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogleRedirect(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      setAuthError(`Không thể mở trang chuyển hướng Google (${code || 'unknown'}).`);
      setAuthLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    clearPendingTimers();
    setAuthError(null);
    setShowRedirectFallback(false);
    clearRememberedAccount();
    setRememberedAccountState(null);
    try {
      await signOutPlayer();
      const guest = loadGuestSaveData();
      const guestDiamond = loadGuestDiamondSave();
      const guestTd = loadGuestTdSave();
      sound.setEnabled(guest.soundEnabled);
      setSaveData(guest);
      setDiamondSaveData(guestDiamond);
      setTdSaveData(guestTd);
      setSyncStatus('local');
      setGameState('TITLE_MENU');
    } catch {
      showToast('Không thể đăng xuất lúc này, vui lòng thử lại.');
    }
  }, [clearPendingTimers, showToast]);

  const startLevel = useCallback(
    (levelNum: number) => {
      // Enforce player progression lock unless Preview Mode is enabled
      if (!isPreviewMode && levelNum > saveData.highestUnlockedLevel) {
        return;
      }
      sound.unlock();
      void enterGameFullscreenAndLandscape();
      clearPendingTimers();
      const cfg = getLevelConfig(levelNum);
      const rawBoard = generateBoard(cfg);
      const checked = ensurePlayableBoard(rawBoard);
      boardRef.current = checked.board;
      selectedRef.current = null;
      levelConfigRef.current = cfg;
      timeRemainingRef.current = cfg.timeLimitSeconds;
      scoreRef.current = 0;
      pairsMatchedRef.current = 0;
      comboRef.current = 0;
      gameStateRef.current = 'PLAYING';

      setLevelConfig(cfg);
      setBoard(checked.board);
      setSelected(null);
      setHintPair(null);
      setActiveConnections([]);
      setPoppingTiles([]);
      setInvalidPair(null);
      setFloatingScores([]);
      setTimeRemaining(cfg.timeLimitSeconds);
      setScore(0);
      setPairsMatched(0);
      setHintsLeft(cfg.initialHints);
      setShufflesLeft(cfg.initialShuffles);
      setCombo(0);
      setEarnedStars(0);
      setLastShiftLabel(cfg.gravityLabel);
      setToastMessage(null);
      setMobileZoomed(false);
      lastMatchAtRef.current = 0;
      setActiveGame('CHIBIMON');
      setGameState('PLAYING');
    },
    [clearPendingTimers, isPreviewMode, saveData.highestUnlockedLevel]
  );

  const startDiamondLevel = useCallback(
    (levelNum: number) => {
      if (!isPreviewMode && levelNum > diamondSaveRef.current.highestUnlockedLevel) {
        return;
      }
      sound.unlock();
      void enterGameFullscreenAndLandscape();
      clearPendingTimers();
      const cfg = getDiamondLevelConfig(levelNum);
      setDiamondLevelConfig(cfg);
      setDiamondRunNonce((n) => n + 1);
      setActiveGame('DIAMOND');
      setGameState('PLAYING');
    },
    [clearPendingTimers, isPreviewMode]
  );

  const handleDiamondWinLevel = useCallback(
    (level: number, finalScore: number, stars: number, movesLeft: number) => {
      const prevSave = diamondSaveRef.current;
      if (level > prevSave.highestUnlockedLevel) return;

      const prevLv = prevSave.levels[level];
      const bestScore = Math.max(prevLv?.bestScore ?? 0, finalScore);
      const bestStars = Math.max(prevLv?.stars ?? 0, stars);
      const bestMovesLeft = Math.max(prevLv?.bestMovesLeft ?? 0, movesLeft);
      const scoreDelta = prevLv ? Math.max(0, finalScore - prevLv.bestScore) : finalScore;

      const nextSave: DiamondSaveData = {
        highestUnlockedLevel: Math.min(
          DIAMOND_MAX_LEVEL,
          Math.max(prevSave.highestUnlockedLevel, level + 1)
        ),
        totalScore: prevSave.totalScore + scoreDelta,
        levels: {
          ...prevSave.levels,
          [level]: {
            completed: true,
            stars: bestStars,
            bestScore,
            bestMovesLeft,
          },
        },
      };

      setDiamondSaveData(nextSave);
      setGameState('ROUND_SUMMARY');

      const activeUser = userRef.current;
      const activeUid = activeUser?.uid ?? rememberedAccountRef.current?.uid ?? null;
      if (activeUid) {
        savePlayerDiamondSave(activeUid, nextSave);
      } else {
        saveGuestDiamondSave(nextSave);
      }
      if (activeUser) {
        void saveDiamondProgressToCloud(activeUser.uid, nextSave).catch(() => {
          // Persisted locally and queued via Firestore persistent cache
        });
      }
    },
    []
  );

  const startTdLevel = useCallback(
    (levelNum: number) => {
      if (!isPreviewMode && levelNum > tdSaveRef.current.highestUnlockedLevel) {
        return;
      }
      sound.unlock();
      void enterGameFullscreenAndLandscape();
      clearPendingTimers();
      const cfg = getTdLevelConfig(levelNum);
      setTdLevelConfig(cfg);
      setTdRunNonce((n) => n + 1);
      setTdResultModal(null);
      setActiveGame('TOWER_DEFENSE');
      setGameState('PLAYING');
    },
    [clearPendingTimers, isPreviewMode]
  );

  const handleTdWinLevel = useCallback(
    (
      level: number,
      finalScore: number,
      stars: number,
      livesLeft: number,
      enemiesSlain: number
    ) => {
      const prevSave = tdSaveRef.current;
      const canSaveProgress = level <= prevSave.highestUnlockedLevel;

      if (!canSaveProgress) {
        setTdResultModal({
          type: 'WIN',
          level,
          score: finalScore,
          stars,
          clearBonusStars: 0,
          newAchievementStars: 0,
          isFirstClear: false,
          livesLeft,
          enemiesSlain,
        });
        setGameState('ROUND_SUMMARY');
        return;
      }

      const prevLv = prevSave.levels[level];
      const isFirstClear = !prevLv?.completed;
      const clearBonusStars = getStageClearBonusStars(level, isFirstClear);
      const bestScore = Math.max(prevLv?.bestScore ?? 0, finalScore);
      const bestStars = Math.max(prevLv?.stars ?? 0, stars);
      const newAchievementStars = Math.max(0, bestStars - (prevLv?.stars ?? 0));
      const bestLivesLeft = Math.max(prevLv?.bestLivesLeft ?? 0, livesLeft);
      const scoreDelta = prevLv ? Math.max(0, finalScore - prevLv.bestScore) : finalScore;

      setTdResultModal({
        type: 'WIN',
        level,
        score: finalScore,
        stars,
        clearBonusStars,
        newAchievementStars,
        isFirstClear,
        livesLeft,
        enemiesSlain,
      });
      setGameState('ROUND_SUMMARY');

      const nextSave: TdSaveData = {
        highestUnlockedLevel: Math.min(
          TD_MAX_LEVEL,
          Math.max(prevSave.highestUnlockedLevel, level + 1)
        ),
        totalScore: prevSave.totalScore + scoreDelta,
        bonusStars: (prevSave.bonusStars ?? 0) + clearBonusStars,
        levels: {
          ...prevSave.levels,
          [level]: {
            completed: true,
            stars: bestStars,
            bestScore,
            bestLivesLeft,
          },
        },
        upgrades: prevSave.upgrades,
      };

      setTdSaveData(nextSave);

      const activeUser = userRef.current;
      const activeUid = activeUser?.uid ?? rememberedAccountRef.current?.uid ?? null;
      if (activeUid) {
        savePlayerTdSave(activeUid, nextSave);
      } else {
        saveGuestTdSave(nextSave);
      }
      if (activeUser) {
        void saveTdProgressToCloud(activeUser.uid, nextSave).catch(() => {
          // Persisted locally and queued via Firestore persistent cache
        });
      }
    },
    []
  );

  const handleTdLoseLevel = useCallback((enemiesSlain: number, finalScore: number) => {
    setTdResultModal((prev) => ({
      type: 'LOSE',
      level: prev?.level ?? tdLevelConfig.level,
      score: finalScore,
      stars: 0,
      livesLeft: 0,
      enemiesSlain,
    }));
    setGameState('GAME_OVER');
  }, [tdLevelConfig.level]);

  const handleUpdateTdUpgrades = useCallback((nextUpgrades: TdUpgrades) => {
    const prevSave = tdSaveRef.current;
    const nextSave: TdSaveData = {
      ...prevSave,
      upgrades: nextUpgrades,
    };
    setTdSaveData(nextSave);

    const activeUser = userRef.current;
    const activeUid = activeUser?.uid ?? rememberedAccountRef.current?.uid ?? null;
    if (activeUid) {
      savePlayerTdSave(activeUid, nextSave);
    } else {
      saveGuestTdSave(nextSave);
    }
    if (activeUser) {
      void saveTdProgressToCloud(activeUser.uid, nextSave).catch(() => {
        // Offline cache will retry automatically
      });
    }
  }, []);

  const handleExitToLevels = useCallback(() => {
    clearPendingTimers();
    void exitGameFullscreenAndUnlock();
    setGameState('LEVEL_SELECT');
  }, [clearPendingTimers]);

  const handleToggleFullscreen = useCallback(() => {
    if (viewport.isFullscreen) {
      void exitGameFullscreenAndUnlock();
    } else {
      void enterGameFullscreenAndLandscape();
    }
  }, [viewport.isFullscreen]);

  // Countdown Timer (ChibiMon only)
  useEffect(() => {
    if (activeGame !== 'CHIBIMON' || gameState !== 'PLAYING') return;

    const interval = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          sound.playGameOver();
          setGameState('GAME_OVER');
          return 0;
        }
        if (prev <= 16) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeGame, gameState]);

  const handleToggleSound = useCallback(() => {
    sound.unlock();
    const nextSound = !saveDataRef.current.soundEnabled;
    sound.setEnabled(nextSound);
    setSaveData((prev) => ({ ...prev, soundEnabled: nextSound }));

    if (user) {
      setSyncStatus('syncing');
      void savePlayerSoundToCloud(user.uid, nextSound)
        .then(() => setSyncStatus('synced'))
        .catch((err: unknown) => {
          setSyncStatus('error');
          if (err instanceof Error && err.message.includes('Quota exceeded')) {
            showToast('Đã đạt giới hạn lưu trữ miễn phí hôm nay.');
            return;
          }
          setFatalError(err instanceof Error ? err : new Error(String(err)));
        });
    }
  }, [user, showToast]);

  const handleToggleBgm = useCallback(() => {
    sound.unlock();
    setBgmEnabled((prev) => {
      const next = !prev;
      sound.setBgmEnabled(next);
      return next;
    });
  }, []);

  const handleTogglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const handleHint = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    if (hintsLeft <= 0) {
      showToast('Đã hết lượt gợi ý trong màn này');
      return;
    }
    const currentBoard = boardRef.current;
    const pair = findAnyValidPair(currentBoard);
    if (!pair) {
      const recovery = ensurePlayableBoard(currentBoard);
      boardRef.current = recovery.board;
      setBoard(recovery.board);
      showToast(recovery.reason ?? 'Đã tự động điều chỉnh bàn đấu!');
      return;
    }
    sound.playHint();
    setHintsLeft((h) => h - 1);
    setHintPair({ a: pair.a, b: pair.b });
    selectedRef.current = null;
    setSelected(null);
  }, [gameState, hintsLeft, showToast]);

  const handleShuffle = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    if (shufflesLeft <= 0) {
      showToast('Đã hết lượt đảo bàn trong màn này');
      return;
    }
    sound.playShuffle();
    setShufflesLeft((s) => s - 1);
    const nextBoard = ensurePlayableBoard(shuffleBoard(boardRef.current)).board;
    boardRef.current = nextBoard;
    selectedRef.current = null;
    setBoard(nextBoard);
    setSelected(null);
    setHintPair(null);
  }, [gameState, shufflesLeft, showToast]);

  const handleSelectTile = useCallback(
    (r: number, c: number) => {
      if (gameStateRef.current !== 'PLAYING') return;
      const currentBoard = boardRef.current;
      const clickedTile = currentBoard[r]?.[c];
      if (!clickedTile) return;

      if (clickedTile.frozen) {
        sound.playMismatch();
        setInvalidPair([{ r, c }, { r, c }]);
        if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
        invalidTimerRef.current = window.setTimeout(() => setInvalidPair(null), 240);
        showToast('Ô đang đóng băng — Hãy ghép cặp sát bên để làm tan băng');
        return;
      }

      const currentSelected = selectedRef.current;
      if (currentSelected && currentSelected.r === r && currentSelected.c === c) {
        selectedRef.current = null;
        setSelected(null);
        return;
      }

      if (!currentSelected) {
        sound.playSelect();
        selectedRef.current = { r, c };
        setSelected({ r, c });
        return;
      }

      const firstPos = currentSelected;
      const firstTile = currentBoard[firstPos.r]?.[firstPos.c];
      if (!firstTile || firstTile.frozen) {
        sound.playSelect();
        selectedRef.current = { r, c };
        setSelected({ r, c });
        return;
      }

      if (firstTile.speciesId !== clickedTile.speciesId) {
        sound.playMismatch();
        setInvalidPair([firstPos, { r, c }]);
        if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
        invalidTimerRef.current = window.setTimeout(() => setInvalidPair(null), 240);
        selectedRef.current = { r, c };
        setSelected({ r, c });
        return;
      }

      const path = findConnectionPath(currentBoard, firstPos, { r, c });
      if (!path) {
        sound.playMismatch();
        setInvalidPair([firstPos, { r, c }]);
        if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
        invalidTimerRef.current = window.setTimeout(() => setInvalidPair(null), 240);
        selectedRef.current = { r, c };
        setSelected({ r, c });
        return;
      }

      // Valid Match! Resolve synchronously with 0ms lock so rapid consecutive taps never drop or mismatch
      const now = Date.now();
      const matchId = `${now}-${firstPos.r}-${firstPos.c}-${r}-${c}-${Math.random().toString(36).slice(2, 6)}`;
      const isCombo = now - lastMatchAtRef.current <= 4500;
      const nextCombo = isCombo ? Math.min(10, comboRef.current + 1) : 1;
      lastMatchAtRef.current = now;
      const pointsEarned = 100 + (nextCombo - 1) * 35;

      sound.playMatch(nextCombo);
      selectedRef.current = null;
      comboRef.current = nextCombo;
      const nextScore = scoreRef.current + pointsEarned;
      scoreRef.current = nextScore;
      const nextMatchedCount = pairsMatchedRef.current + 1;
      pairsMatchedRef.current = nextMatchedCount;

      setSelected(null);
      setHintPair(null);
      setInvalidPair(null);
      setCombo(nextCombo);
      setScore(nextScore);
      setPairsMatched(nextMatchedCount);

      // Show electric connection beam & popping tile ghosts purely visually (non-blocking)
      setActiveConnections((prev) => [
        ...prev.slice(-3),
        {
          id: matchId,
          path,
          a: firstPos,
          b: { r, c },
          speciesId: clickedTile.speciesId,
        },
      ]);

      setPoppingTiles((prev) => [
        ...prev.slice(-6),
        { id: `${matchId}-a`, tile: firstTile, r: firstPos.r, c: firstPos.c },
        { id: `${matchId}-b`, tile: clickedTile, r, c },
      ]);

      setFloatingScores((prev) => [
        ...prev.slice(-4),
        { id: matchId, r, c, text: `+${pointsEarned}`, combo: nextCombo },
      ]);

      const beamTimer = window.setTimeout(() => {
        effectTimersRef.current.delete(beamTimer);
        setActiveConnections((prev) => prev.filter((item) => item.id !== matchId));
        setPoppingTiles((prev) =>
          prev.filter((item) => item.id !== `${matchId}-a` && item.id !== `${matchId}-b`)
        );
      }, 190);
      effectTimersRef.current.add(beamTimer);

      const floatTimer = window.setTimeout(() => {
        effectTimersRef.current.delete(floatTimer);
        setFloatingScores((prev) => prev.filter((item) => item.id !== matchId));
      }, 650);
      effectTimersRef.current.add(floatTimer);

      // Update board immediately so the very next tap operates on live coordinates
      const cfg = levelConfigRef.current;
      let next = cloneBoard(currentBoard);
      next = thawAdjacentFrozen(next, firstPos, { r, c });
      next[firstPos.r][firstPos.c] = null;
      next[r][c] = null;

      const shifted = applyGravity(
        next,
        cfg.gravityMode,
        nextMatchedCount,
        firstPos,
        { r, c }
      );
      next = shifted.board;
      setLastShiftLabel(getDirectionLabel(shifted.direction));

      const remaining = countRemainingTiles(next);
      if (remaining === 0) {
        boardRef.current = next;
        setBoard(next);
        sound.playWin();
        const curTime = timeRemainingRef.current;
        const ratio = curTime / cfg.timeLimitSeconds;
        const stars = ratio >= 0.4 ? 3 : ratio >= 0.2 ? 2 : 1;
        const timeBonus = curTime * 15;
        const finalRoundScore = scoreRef.current + timeBonus;

        scoreRef.current = finalRoundScore;
        setScore(finalRoundScore);
        setEarnedStars(stars);
        gameStateRef.current = 'ROUND_SUMMARY';

        const winTimer = window.setTimeout(() => {
          effectTimersRef.current.delete(winTimer);
          setGameState('ROUND_SUMMARY');
        }, 200);
        effectTimersRef.current.add(winTimer);

        // Only save progression if this level was legitimately unlocked
        const nextSave = computeWinSaveData(
          saveDataRef.current,
          cfg.level,
          finalRoundScore,
          stars,
          curTime
        );
        if (nextSave) {
          setSaveData(nextSave);
          const activeUser = userRef.current;
          const activeUid = activeUser?.uid ?? rememberedAccountRef.current?.uid ?? null;
          if (activeUid) {
            savePlayerLocalSave(activeUid, nextSave);
          }
          if (activeUser) {
            const isOfflineNow = typeof navigator !== 'undefined' && !navigator.onLine;
            setSyncStatus(isOfflineNow ? 'remembered' : 'syncing');
            void savePlayerProgressToCloud(activeUser.uid, nextSave)
              .then(() => setSyncStatus('synced'))
              .catch((err: unknown) => {
                if (typeof navigator !== 'undefined' && !navigator.onLine) {
                  setSyncStatus('remembered');
                  return;
                }
                setSyncStatus('error');
                if (err instanceof Error && err.message.includes('Quota exceeded')) {
                  showToast('Đã đạt giới hạn lưu trữ miễn phí hôm nay.');
                  return;
                }
                setFatalError(err instanceof Error ? err : new Error(String(err)));
              });
          }
        }
      } else {
        const recovery = ensurePlayableBoard(next);
        next = recovery.board;
        boardRef.current = next;
        setBoard(next);
        if (recovery.adjusted && recovery.reason) {
          sound.playShuffle();
          showToast(recovery.reason);
        }
      }
    },
    [showToast]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING' && gameState !== 'PAUSED') return;
      if (e.key === 'Escape') {
        setSelected(null);
      } else if (e.key === 'p' || e.key === 'P') {
        setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
      } else if (e.key === 'h' || e.key === 'H') {
        handleHint();
      } else if (e.key === 's' || e.key === 'S') {
        handleShuffle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handleHint, handleShuffle]);

  if (fatalError) {
    throw fatalError;
  }

  const activeAccount: RememberedAccount | null = user
    ? {
        uid: user.uid,
        displayName: user.displayName?.trim().slice(0, 80) || 'Người chơi',
        email: user.email?.trim().slice(0, 160) || '',
        photoURL: user.photoURL?.trim().slice(0, 500) || '',
      }
    : rememberedAccount;

  if (gameState === 'TITLE_MENU') {
    return (
      <TitleScreen
        activeGame={activeGame}
        onSelectGame={setActiveGame}
        saveData={saveData}
        diamondSaveData={diamondSaveData}
        tdSaveData={tdSaveData}
        activeAccount={activeAccount}
        hasLiveCloudAuth={Boolean(user)}
        authReady={authReady}
        authLoading={authLoading}
        syncStatus={syncStatus}
        authError={authError}
        showRedirectFallback={showRedirectFallback}
        bgmEnabled={bgmEnabled}
        onSignIn={handleSignIn}
        onSignInRedirect={handleSignInRedirect}
        onSignOut={handleSignOut}
        onStartCurrentLevel={() => startLevel(saveData.highestUnlockedLevel)}
        onOpenLevelSelect={() => {
          setActiveGame('CHIBIMON');
          setGameState('LEVEL_SELECT');
        }}
        onStartDiamondCurrentLevel={() =>
          startDiamondLevel(diamondSaveData.highestUnlockedLevel)
        }
        onOpenDiamondLevelSelect={() => {
          setActiveGame('DIAMOND');
          setGameState('LEVEL_SELECT');
        }}
        onStartTdCurrentLevel={() => startTdLevel(tdSaveData.highestUnlockedLevel)}
        onOpenTdLevelSelect={() => {
          setActiveGame('TOWER_DEFENSE');
          setGameState('LEVEL_SELECT');
        }}
        onToggleSound={handleToggleSound}
        onToggleBgm={handleToggleBgm}
      />
    );
  }

  if (gameState === 'LEVEL_SELECT') {
    if (activeGame === 'TOWER_DEFENSE') {
      return (
        <TdLevelSelectView
          saveData={tdSaveData}
          activeAccount={activeAccount}
          hasLiveCloudAuth={Boolean(user)}
          authReady={authReady}
          authLoading={authLoading}
          syncStatus={syncStatus}
          isPreviewMode={isPreviewMode}
          soundEnabled={saveData.soundEnabled}
          bgmEnabled={bgmEnabled}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onSelectLevel={(lv) => startTdLevel(lv)}
          onUpdateUpgrades={handleUpdateTdUpgrades}
          onTogglePreviewMode={handleTogglePreviewMode}
          onToggleSound={handleToggleSound}
          onToggleBgm={handleToggleBgm}
          onBack={() => setGameState('TITLE_MENU')}
        />
      );
    }

    if (activeGame === 'DIAMOND') {
      return (
        <DiamondLevelSelectView
          saveData={diamondSaveData}
          activeAccount={activeAccount}
          hasLiveCloudAuth={Boolean(user)}
          authReady={authReady}
          authLoading={authLoading}
          syncStatus={syncStatus}
          isPreviewMode={isPreviewMode}
          soundEnabled={saveData.soundEnabled}
          bgmEnabled={bgmEnabled}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onSelectLevel={(lv) => startDiamondLevel(lv)}
          onTogglePreviewMode={handleTogglePreviewMode}
          onToggleSound={handleToggleSound}
          onToggleBgm={handleToggleBgm}
          onBack={() => setGameState('TITLE_MENU')}
        />
      );
    }

    return (
      <LevelSelectView
        saveData={saveData}
        activeAccount={activeAccount}
        hasLiveCloudAuth={Boolean(user)}
        authReady={authReady}
        authLoading={authLoading}
        syncStatus={syncStatus}
        isPreviewMode={isPreviewMode}
        bgmEnabled={bgmEnabled}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onSelectLevel={(lv) => startLevel(lv)}
        onTogglePreviewMode={handleTogglePreviewMode}
        onToggleSound={handleToggleSound}
        onToggleBgm={handleToggleBgm}
        onBack={() => setGameState('TITLE_MENU')}
      />
    );
  }

  const timeProgressPct = Math.max(
    0,
    Math.min(100, (timeRemaining / levelConfig.timeLimitSeconds) * 100)
  );
  const isLowTime = timeRemaining <= 30;
  const totalPairs = levelConfig.pairsCount;
  const fsSupported = canRequestFullscreen();

  const stageContent =
    activeGame === 'TOWER_DEFENSE' ? (
      <>
        <TowerDefenseArenaStage
          levelConfig={tdLevelConfig}
          runNonce={tdRunNonce}
          upgrades={tdSaveData.upgrades}
          unlockedTowers={TD_TOWER_BUILD_ORDER.filter((t) =>
            isTowerUnlocked(
              t,
              tdSaveData.levels,
              tdSaveData.highestUnlockedLevel,
              isPreviewMode
            )
          )}
          isPaused={gameState === 'PAUSED'}
          isCompactLandscape={viewport.isCompactLandscape}
          isFullscreen={viewport.isFullscreen}
          fsSupported={fsSupported}
          soundEnabled={saveData.soundEnabled}
          bgmEnabled={bgmEnabled}
          onTogglePause={() =>
            setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'))
          }
          onResume={() => setGameState('PLAYING')}
          onExitToLevels={handleExitToLevels}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleSound={handleToggleSound}
          onToggleBgm={handleToggleBgm}
          onReplay={() => startTdLevel(tdLevelConfig.level)}
          onWinLevel={handleTdWinLevel}
          onLoseLevel={handleTdLoseLevel}
        />

        {(gameState === 'ROUND_SUMMARY' || gameState === 'GAME_OVER') && tdResultModal && (
          <TdEndModal
            type={tdResultModal.type}
            level={tdLevelConfig.level}
            stageName={tdLevelConfig.name}
            score={tdResultModal.score}
            stars={tdResultModal.stars}
            clearBonusStars={tdResultModal.clearBonusStars}
            newAchievementStars={tdResultModal.newAchievementStars}
            isFirstClear={tdResultModal.isFirstClear}
            livesLeft={tdResultModal.livesLeft}
            startingLives={
              tdLevelConfig.startingLives +
              (tdSaveData.upgrades.citadel >= 1 ? 3 : 0) +
              (tdSaveData.upgrades.citadel >= 2 ? 3 : 0) +
              (tdSaveData.upgrades.citadel >= 4 ? 4 : 0) +
              (tdSaveData.upgrades.clearCitadel ?? 0) * 2
            }
            enemiesSlain={tdResultModal.enemiesSlain}
            isPreviewMode={isPreviewMode && tdLevelConfig.level > tdSaveData.highestUnlockedLevel}
            onReplay={() => startTdLevel(tdLevelConfig.level)}
            onNextLevel={() => startTdLevel(Math.min(TD_MAX_LEVEL, tdLevelConfig.level + 1))}
            onLevelSelect={handleExitToLevels}
          />
        )}
      </>
    ) : activeGame === 'DIAMOND' ? (
      <DiamondArenaStage
        levelConfig={diamondLevelConfig}
        runNonce={diamondRunNonce}
        isPaused={gameState === 'PAUSED'}
        isCompactLandscape={viewport.isCompactLandscape}
        isStageRotated90={viewport.needsLandscapeRotation}
        isFullscreen={viewport.isFullscreen}
        fsSupported={fsSupported}
        soundEnabled={saveData.soundEnabled}
        bgmEnabled={bgmEnabled}
        isPreviewMode={isPreviewMode}
        highestUnlockedLevel={diamondSaveData.highestUnlockedLevel}
        onTogglePause={() =>
          setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'))
        }
        onResume={() => setGameState('PLAYING')}
        onExitToLevels={handleExitToLevels}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleSound={handleToggleSound}
        onToggleBgm={handleToggleBgm}
        onReplay={() => startDiamondLevel(diamondLevelConfig.level)}
        onNextLevel={(nextLv) => startDiamondLevel(nextLv)}
        onWinLevel={handleDiamondWinLevel}
        onLoseLevel={() => setGameState('GAME_OVER')}
      />
    ) : (
      <>
        {viewport.isCompactLandscape ? (
        /* Compact Mobile/Tablet Landscape Stage: ultra-slim 44px side rails, maximum Pokemon board area */
        <div className="w-full h-full flex overflow-hidden bg-[#111827]">
          {/* Left Ultra-Slim Status Rail (44px) */}
          <aside className="w-11 shrink-0 bg-[#991B1B] border-r border-[#0F172A] flex flex-col items-stretch justify-between py-1 px-1 gap-1 select-none">
            <button
              type="button"
              onClick={handleExitToLevels}
              title="Quay về bản đồ cấp độ"
              aria-label="Quay về bản đồ cấp độ"
              className="h-8 flex items-center justify-center rounded-md bg-[#7F1D1D] hover:bg-[#450A0A] border border-red-950/70 text-red-50 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="rounded-md bg-[#0F172A]/60 px-0.5 py-1 text-center leading-tight">
              <div className="text-[9px] text-red-200 font-semibold">Cấp</div>
              <div className="font-mono-num text-[11px] font-extrabold text-white">
                {levelConfig.level}
              </div>
            </div>

            <div className="rounded-md bg-[#0F172A]/70 px-0.5 py-1 flex flex-col items-center gap-0.5 text-center leading-tight">
              <span
                className={`font-mono-num text-[10px] font-extrabold ${
                  isLowTime ? 'text-[#FACC15]' : 'text-white'
                }`}
              >
                {formatDuration(timeRemaining)}
              </span>
              <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden">
                <div
                  style={{ width: `${timeProgressPct}%` }}
                  className={`h-full transition-all duration-500 ${
                    isLowTime
                      ? 'bg-rose-400'
                      : timeProgressPct < 35
                        ? 'bg-[#FACC15]'
                        : 'bg-emerald-400'
                  }`}
                />
              </div>
            </div>

            <div className="rounded-md bg-[#0F172A]/50 px-0.5 py-1 text-center leading-tight">
              <div className="text-[9px] text-red-200">Cặp</div>
              <div className="font-mono-num text-[11px] font-extrabold text-white">
                {totalPairs - pairsMatched}
              </div>
            </div>

            <div className="rounded-md bg-[#0F172A]/50 px-0.5 py-1 text-center leading-tight">
              <div className="text-[9px] text-red-200">
                {combo > 1 ? `x${combo}` : 'Điểm'}
              </div>
              <div className="font-mono-num text-[10px] font-extrabold text-[#FACC15] truncate">
                {score >= 10000
                  ? `${(score / 1000).toFixed(1)}k`
                  : score.toLocaleString('vi-VN')}
              </div>
            </div>
          </aside>

          {/* Center Edge-to-Edge Landscape Battle Arena */}
          <main className="relative flex-1 min-w-0 h-full flex items-center justify-center p-0 overflow-hidden">
            <GameBoard
              board={board}
              selected={selected}
              hintPair={hintPair}
              activeConnections={activeConnections}
              poppingTiles={poppingTiles}
              invalidPair={invalidPair}
              floatingScores={floatingScores}
              isPaused={gameState === 'PAUSED'}
              isCompactLandscape={true}
              mobileZoomed={mobileZoomed}
              onSelectTile={handleSelectTile}
              onResume={() => setGameState('PLAYING')}
            />

            {toastMessage && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-lg bg-[#0F172A]/95 border border-[#FACC15]/70 text-xs font-semibold text-[#FACC15] shadow-xl pointer-events-none whitespace-nowrap max-w-[92%] truncate">
                {toastMessage}
              </div>
            )}
          </main>

          {/* Right Ultra-Slim Thumb Action Rail (44px) */}
          <aside className="w-11 shrink-0 bg-[#0F172A] border-l border-slate-800 py-1 px-1 flex flex-col items-stretch justify-between gap-0.5 select-none">
            <button
              type="button"
              onClick={() => setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'))}
              title={gameState === 'PAUSED' ? 'Tiếp tục' : 'Tạm dừng'}
              aria-label={gameState === 'PAUSED' ? 'Tiếp tục' : 'Tạm dừng'}
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-white cursor-pointer"
            >
              {gameState === 'PAUSED' ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleHint}
              disabled={gameState !== 'PLAYING' || hintsLeft <= 0}
              title={`Gợi ý (${hintsLeft})`}
              aria-label={`Gợi ý (${hintsLeft})`}
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 disabled:opacity-40 flex flex-col items-center justify-center text-emerald-300 cursor-pointer leading-none gap-0.5"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold font-mono-num">{hintsLeft}</span>
            </button>

            <button
              type="button"
              onClick={handleShuffle}
              disabled={gameState !== 'PLAYING' || shufflesLeft <= 0}
              title={`Đảo bàn (${shufflesLeft})`}
              aria-label={`Đảo bàn (${shufflesLeft})`}
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 disabled:opacity-40 flex flex-col items-center justify-center text-[#FACC15] cursor-pointer leading-none gap-0.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold font-mono-num">{shufflesLeft}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileZoomed((z) => !z)}
              title={mobileZoomed ? 'Thu vừa màn hình' : 'Phóng to'}
              aria-label={mobileZoomed ? 'Thu vừa màn hình' : 'Phóng to'}
              className={`flex-1 min-h-0 rounded-lg border flex items-center justify-center cursor-pointer ${
                mobileZoomed
                  ? 'bg-[#DC2626] border-[#FACC15] text-white'
                  : 'bg-[#1E293B] border-slate-700/80 text-slate-200'
              }`}
            >
              {mobileZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => startLevel(levelConfig.level)}
              title="Chơi lại"
              aria-label="Chơi lại"
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleToggleBgm}
              title={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
              aria-label={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
              className={`flex-1 min-h-0 rounded-lg border flex items-center justify-center cursor-pointer ${
                bgmEnabled && saveData.soundEnabled
                  ? 'bg-[#1E293B] border-amber-400/50 text-[#FACC15]'
                  : 'bg-[#1E293B] border-slate-700/80 text-slate-400 opacity-75'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleToggleSound}
              title={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              aria-label={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-slate-200 cursor-pointer"
            >
              {saveData.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {fsSupported && (
              <button
                type="button"
                onClick={handleToggleFullscreen}
                title={viewport.isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                aria-label={viewport.isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                className={`flex-1 min-h-0 rounded-lg border flex items-center justify-center cursor-pointer ${
                  !viewport.isFullscreen
                    ? 'bg-[#FACC15] border-yellow-300 text-slate-950'
                    : 'bg-[#1E293B] border-slate-700/80 text-slate-200'
                }`}
              >
                {viewport.isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </aside>
        </div>
      ) : (
        /* Desktop Web Fullscreen Landscape Stage */
        <div className="w-full h-full flex flex-col bg-[#111827]">
          <header className="w-full px-6 py-2.5 bg-[#B91C1C] border-b-4 border-[#0F172A] shrink-0 shadow-md">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
              {/* Left: Back & Level / Movement Rule */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={handleExitToLevels}
                  aria-label="Quay về bản đồ cấp độ"
                  className="p-2 rounded-lg border border-red-900 bg-[#991B1B] text-red-100 hover:text-white hover:bg-[#7F1D1D] transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <PokeballIcon variant="poke" className="w-6 h-6 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-white font-mono-num whitespace-nowrap">
                    <span>Cấp {levelConfig.level}/200</span>
                    <span className="text-red-200/70" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-sans font-semibold text-[#FACC15] truncate">
                      {lastShiftLabel || levelConfig.gravityLabel}
                    </span>
                    {isPreviewMode && (
                      <>
                        <span className="text-red-200/70" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-sans text-xs text-yellow-200">Xem trước</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-red-100/90 truncate font-mono-num">
                    {levelConfig.cols}×{levelConfig.rows} ({totalPairs} cặp) · {levelConfig.speciesCount} loài · Còn {totalPairs - pairsMatched} cặp
                  </div>
                </div>
              </div>

              {/* Center: Timer & Score */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1 min-w-[175px] bg-[#0F172A]/45 px-3 py-1 rounded-lg border border-red-950/60">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={isLowTime ? 'text-yellow-300 font-bold' : 'text-red-100'}>
                      {isLowTime ? 'Sắp hết giờ!' : 'Thời gian'}
                    </span>
                    <span
                      className={`font-mono-num text-base font-bold ${
                        isLowTime ? 'text-[#FACC15]' : 'text-white'
                      }`}
                    >
                      {formatDuration(timeRemaining)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900/90 overflow-hidden">
                    <div
                      style={{ width: `${timeProgressPct}%` }}
                      className={`h-full transition-all duration-500 ${
                        isLowTime
                          ? 'bg-rose-400'
                          : timeProgressPct < 35
                            ? 'bg-[#FACC15]'
                            : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-xs text-red-100">Đã ghép</span>
                  <span className="font-mono-num text-sm font-bold text-white">
                    {pairsMatched}/{totalPairs}
                  </span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-xs text-red-100">
                    Điểm {combo > 1 ? `(x${combo})` : ''}
                  </span>
                  <span className="font-mono-num text-base font-extrabold text-[#FACC15]">
                    {score.toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Right: Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleHint}
                  disabled={gameState !== 'PLAYING' || hintsLeft <= 0}
                  title="Gợi ý một cặp hợp lệ (Phím H)"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] disabled:opacity-45 disabled:cursor-not-allowed text-xs font-semibold text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Gợi ý</span>
                  <span className="font-mono-num text-slate-200">({hintsLeft})</span>
                </button>

                <button
                  type="button"
                  onClick={handleShuffle}
                  disabled={gameState !== 'PLAYING' || shufflesLeft <= 0}
                  title="Đảo vị trí các ô còn lại (Phím S)"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] disabled:opacity-45 disabled:cursor-not-allowed text-xs font-semibold text-[#FACC15] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Đảo bàn</span>
                  <span className="font-mono-num text-slate-200">({shufflesLeft})</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'))
                  }
                  title="Tạm dừng / Tiếp tục (Phím P)"
                  aria-label={gameState === 'PAUSED' ? 'Tiếp tục' : 'Tạm dừng'}
                  className="p-2 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer shrink-0"
                >
                  {gameState === 'PAUSED' ? (
                    <Play className="w-4 h-4 fill-current" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => startLevel(levelConfig.level)}
                  title="Chơi lại màn này"
                  aria-label="Chơi lại"
                  className="p-2 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleBgm}
                  title={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
                  aria-label={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    bgmEnabled && saveData.soundEnabled
                      ? 'border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-[#FACC15]'
                      : 'border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-slate-400'
                  }`}
                >
                  <Music className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleSound}
                  title={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                  aria-label={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                  className="p-2 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer shrink-0"
                >
                  {saveData.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

                {fsSupported && (
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    title={viewport.isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    aria-label={viewport.isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      !viewport.isFullscreen
                        ? 'border-yellow-300 bg-[#FACC15] hover:bg-yellow-300 text-slate-950'
                        : 'border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white'
                    }`}
                  >
                    {viewport.isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Arena Stage */}
          <main className="relative flex-1 min-h-0 flex items-center justify-center p-2 lg:p-3 overflow-hidden">
            <GameBoard
              board={board}
              selected={selected}
              hintPair={hintPair}
              activeConnections={activeConnections}
              poppingTiles={poppingTiles}
              invalidPair={invalidPair}
              floatingScores={floatingScores}
              isPaused={gameState === 'PAUSED'}
              isCompactLandscape={false}
              mobileZoomed={false}
              onSelectTile={handleSelectTile}
              onResume={() => setGameState('PLAYING')}
            />

            {toastMessage && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#0F172A]/95 border border-[#FACC15]/70 text-xs sm:text-sm font-semibold text-[#FACC15] shadow-xl pointer-events-none whitespace-nowrap max-w-[92vw] truncate">
                {toastMessage}
              </div>
            )}
          </main>
        </div>
      )}

      {(gameState === 'ROUND_SUMMARY' || gameState === 'GAME_OVER') && (
        <EndRoundModal
          type={gameState === 'ROUND_SUMMARY' ? 'WIN' : 'LOSE'}
          level={levelConfig.level}
          totalPairs={totalPairs}
          score={score}
          stars={earnedStars}
          timeRemaining={timeRemaining}
          timeLimit={levelConfig.timeLimitSeconds}
          pairsMatched={pairsMatched}
          isPreviewMode={isPreviewMode && levelConfig.level > saveData.highestUnlockedLevel}
          onReplay={() => startLevel(levelConfig.level)}
          onNextLevel={() => startLevel(Math.min(MAX_LEVEL, levelConfig.level + 1))}
          onLevelSelect={handleExitToLevels}
        />
      )}
    </>
  );

  if (viewport.needsLandscapeRotation) {
    return (
      <div className="fixed inset-0 z-40 overflow-hidden bg-[#0B1120]">
        <div
          style={{
            width: '100dvh',
            height: '100vw',
            transform: 'translate(-50%, -50%) rotate(90deg)',
          }}
          className="fixed top-1/2 left-1/2 overflow-hidden bg-[#111827] text-slate-100 pl-[env(safe-area-inset-top)] pr-[env(safe-area-inset-bottom)]"
        >
          {stageContent}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-[#111827] text-slate-100 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {stageContent}
    </div>
  );
}
