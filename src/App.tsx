import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { TdEndModal } from './components/TdEndModal';
import { TdInventoryModal } from './components/TdInventoryModal';
import { TdLevelSelectView } from './components/TdLevelSelectView';
import { TitleScreen } from './components/TitleScreen';
import { TowerDefenseArenaStage } from './components/TowerDefenseArenaStage';
import { preloadAllGameAssets } from './data/tdAssets';
import {
  getEnhancementSuccessRate,
  getEquipmentDisplayName,
  getEquipmentUniqueKey,
  TD_ENHANCE_MAX_LEVEL,
} from './data/tdEquipment';
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
  createTdProfile,
  db,
  handleFirestoreError,
  normalizeTdLevelsFromCloud,
  OperationType,
  sanitizeEquipmentInventory,
  sanitizeHeroEquipment,
  sanitizeTdUpgrades,
  saveTdProgressToCloud,
  signInWithGoogle,
  signInWithGoogleRedirect,
  signOutPlayer,
} from './firebase';
import { useViewportMode } from './hooks/useViewportMode';
import {
  GameScreenState,
  TdEquipmentItem,
  TdEquipmentSlot,
  TdHeroEquipmentMap,
  TdLevelConfig,
  TdRunLootSummary,
  TdSaveData,
  TdTowerType,
  TdUpgrades,
} from './types/towerDefense';
import {
  canRequestFullscreen,
  enterGameFullscreenAndLandscape,
  exitGameFullscreenAndUnlock,
} from './utils/fullscreen';
import {
  clearGuestTdSave,
  clearRememberedAccount,
  DEFAULT_TD_SAVE,
  getRememberedAccount,
  loadGuestTdSave,
  loadPlayerTdSave,
  mergeTdSaveData,
  RememberedAccount,
  saveGuestTdSave,
  savePlayerTdSave,
  setRememberedAccount,
} from './utils/localAccountCache';
import { sound } from './utils/sound';

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

  const [tdSaveData, setTdSaveData] = useState<TdSaveData>(() => {
    const remembered = getRememberedAccount();
    const loaded = remembered
      ? (loadPlayerTdSave(remembered.uid) ?? loadGuestTdSave())
      : loadGuestTdSave();
    sound.setEnabled(loaded.soundEnabled !== false);
    return loaded;
  });
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(() => sound.bgmEnabled);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [inventoryOpen, setInventoryOpen] = useState<boolean>(false);

  const [gameState, setGameState] = useState<GameScreenState>('TITLE_MENU');
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
    lootSummary?: TdRunLootSummary;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tdSaveRef = useRef(tdSaveData);
  tdSaveRef.current = tdSaveData;
  const userRef = useRef<User | null>(user);
  userRef.current = user;
  const rememberedAccountRef = useRef<RememberedAccount | null>(rememberedAccount);
  rememberedAccountRef.current = rememberedAccount;

  const toastTimerRef = useRef<number | null>(null);
  const creatingTdUidRef = useRef<string | null>(null);
  const mergeTdSyncedUidRef = useRef<string | null>(null);

  const viewport = useViewportMode();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  const persistTdSave = useCallback((nextSave: TdSaveData) => {
    tdSaveRef.current = nextSave;
    setTdSaveData(nextSave);

    const activeUser = userRef.current;
    const activeUid = activeUser?.uid ?? rememberedAccountRef.current?.uid ?? null;
    if (activeUid) {
      savePlayerTdSave(activeUid, nextSave);
    } else {
      saveGuestTdSave(nextSave);
    }
    if (activeUser) {
      setSyncStatus('syncing');
      void saveTdProgressToCloud(activeUser.uid, nextSave)
        .then(() => setSyncStatus('synced'))
        .catch(() => {
          setSyncStatus('error');
        });
    }
  }, []);

  // Preload Tower Defense cover, terrain maps, and anime hero sprites
  useEffect(() => {
    preloadAllGameAssets();
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Monitor Firebase Auth state + handle redirect sign-in results
  useEffect(() => {
    let active = true;
    void checkGoogleRedirectResult().then((redirectUser) => {
      if (active && redirectUser) {
        setAuthError(null);
        setShowRedirectFallback(false);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!active) return;
      setUser(firebaseUser);
      setAuthReady(true);
      setAuthLoading(false);

      if (firebaseUser) {
        setAuthError(null);
        setShowRedirectFallback(false);
        const acct: RememberedAccount = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName?.trim().slice(0, 80) || 'Người chơi',
          email: firebaseUser.email?.trim().slice(0, 160) || '',
          photoURL: firebaseUser.photoURL?.trim().slice(0, 500) || '',
        };
        setRememberedAccount(acct);
        setRememberedAccountState(acct);
        setSyncStatus('syncing');

        const localPlayerSave = loadPlayerTdSave(firebaseUser.uid);
        if (localPlayerSave) {
          sound.setEnabled(localPlayerSave.soundEnabled !== false);
          setTdSaveData(localPlayerSave);
        }
      } else {
        const remembered = getRememberedAccount();
        setRememberedAccountState(remembered);
        setSyncStatus(remembered ? 'remembered' : 'local');
        const fallbackSave = remembered
          ? (loadPlayerTdSave(remembered.uid) ?? loadGuestTdSave())
          : loadGuestTdSave();
        sound.setEnabled(fallbackSave.soundEnabled !== false);
        setTdSaveData(fallbackSave);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Real-time Firestore listener for towerDefenseProgress/{uid}
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
          const cleanInventory = sanitizeEquipmentInventory(data.equipmentInventory);
          const cleanEquipped = sanitizeHeroEquipment(data.heroEquipment, cleanInventory);
          const cloudSave: TdSaveData = {
            highestUnlockedLevel: Math.max(
              1,
              Math.min(TD_MAX_LEVEL, Number(data.highestUnlockedLevel) || 1)
            ),
            totalScore: Math.max(0, Number(data.totalScore) || 0),
            bonusStars: Math.max(0, Number(data.bonusStars) || 0),
            enhancementGems: Math.max(0, Number(data.enhancementGems) || 0),
            equipmentInventory: cleanInventory,
            heroEquipment: cleanEquipped,
            soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true,
            levels: normalizeTdLevelsFromCloud(data.levels),
            upgrades: sanitizeTdUpgrades(data.upgrades),
          };

          const localCached = loadPlayerTdSave(user.uid);
          const { merged, cloudNeedsUpdate } = mergeTdSaveData(cloudSave, localCached);

          sound.setEnabled(merged.soundEnabled !== false);
          setTdSaveData(merged);
          savePlayerTdSave(user.uid, merged);
          setSyncStatus('synced');

          if (cloudNeedsUpdate && mergeTdSyncedUidRef.current !== user.uid) {
            mergeTdSyncedUidRef.current = user.uid;
            void saveTdProgressToCloud(user.uid, merged).catch(() => {
              // Offline persistent cache will retry automatically
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
          (guest.enhancementGems ?? 0) > 0 ||
          (guest.equipmentInventory?.length ?? 0) > 0 ||
          Object.values(guest.upgrades).some((v) => v > 0);
        const initialSave = existingLocal ?? (hasGuestProgress ? guest : DEFAULT_TD_SAVE);

        void createTdProfile(user.uid, initialSave)
          .then(() => {
            if (!active) return;
            if (!existingLocal && hasGuestProgress) {
              clearGuestTdSave();
            }
            savePlayerTdSave(user.uid, initialSave);
            sound.setEnabled(initialSave.soundEnabled !== false);
            setTdSaveData(initialSave);
            setSyncStatus('synced');
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

  const handleSignIn = useCallback(async (forceSelectAccount = false) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setAuthError(
        'Bạn đang ở chế độ Offline. Hãy kết nối mạng để đăng nhập/đồng bộ Google — bạn vẫn có thể chơi offline ngay lúc này!'
      );
      setShowRedirectFallback(false);
      return;
    }
    setAuthError(null);
    setShowRedirectFallback(false);
    const popupPromise = signInWithGoogle(forceSelectAccount);
    setAuthLoading(true);
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
  }, []);

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
    setAuthError(null);
    setShowRedirectFallback(false);
    clearRememberedAccount();
    setRememberedAccountState(null);
    try {
      await signOutPlayer();
      const guestTd = loadGuestTdSave();
      sound.setEnabled(guestTd.soundEnabled !== false);
      setTdSaveData(guestTd);
      setSyncStatus('local');
      setGameState('TITLE_MENU');
    } catch {
      showToast('Không thể đăng xuất lúc này, vui lòng thử lại.');
    }
  }, [showToast]);

  const startTdLevel = useCallback(
    (levelNum: number) => {
      if (!isPreviewMode && levelNum > tdSaveRef.current.highestUnlockedLevel) {
        return;
      }
      sound.unlock();
      void enterGameFullscreenAndLandscape();
      const cfg = getTdLevelConfig(levelNum);
      setTdLevelConfig(cfg);
      setTdRunNonce((n) => n + 1);
      setTdResultModal(null);
      setInventoryOpen(false);
      setGameState('PLAYING');
    },
    [isPreviewMode]
  );

  const handleAcquireTdLoot = useCallback(
    (gems: number, items: TdEquipmentItem[]) => {
      if (gems <= 0 && items.length === 0) return;
      const prevSave = tdSaveRef.current;
      const existingInv = [...(prevSave.equipmentInventory ?? [])];
      const existingKeys = new Set(
        existingInv.map((it) => getEquipmentUniqueKey(it.towerType, it.slot, it.rarity))
      );

      for (const item of items) {
        const key = getEquipmentUniqueKey(item.towerType, item.slot, item.rarity);
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          existingInv.push(item);
        }
      }

      const nextSave: TdSaveData = {
        ...prevSave,
        enhancementGems: (prevSave.enhancementGems ?? 0) + Math.max(0, gems),
        equipmentInventory: existingInv,
      };
      persistTdSave(nextSave);
    },
    [persistTdSave]
  );

  const handleEquipTdItem = useCallback(
    (towerType: TdTowerType, slot: TdEquipmentSlot, itemId: string | null) => {
      const prevSave = tdSaveRef.current;
      const prevEquipped: TdHeroEquipmentMap = { ...(prevSave.heroEquipment ?? {}) };
      const heroSlots: Partial<Record<TdEquipmentSlot, string>> = {
        ...(prevEquipped[towerType] ?? {}),
      };

      if (itemId) {
        heroSlots[slot] = itemId;
      } else {
        delete heroSlots[slot];
      }

      if (Object.keys(heroSlots).length > 0) {
        prevEquipped[towerType] = heroSlots;
      } else {
        delete prevEquipped[towerType];
      }

      persistTdSave({
        ...prevSave,
        heroEquipment: prevEquipped,
      });
    },
    [persistTdSave]
  );

  const handleEnhanceTdItem = useCallback(
    (itemId: string): { success: boolean; newLevel: number; message: string } => {
      const prevSave = tdSaveRef.current;
      const gems = prevSave.enhancementGems ?? 0;
      const inv = [...(prevSave.equipmentInventory ?? [])];
      const idx = inv.findIndex((it) => it.id === itemId);
      if (idx < 0) {
        return { success: false, newLevel: 0, message: 'Không tìm thấy trang bị.' };
      }
      const target = inv[idx];
      if (target.level >= TD_ENHANCE_MAX_LEVEL) {
        return {
          success: false,
          newLevel: target.level,
          message: 'Trang bị đã đạt cấp cường hóa tối đa (+12)!',
        };
      }
      if (gems < 1) {
        return {
          success: false,
          newLevel: target.level,
          message: 'Không đủ Ngọc Cường Hóa!',
        };
      }

      const successRate = getEnhancementSuccessRate(target.level);
      const roll = Math.random() * 100;
      const success = roll < successRate;
      const nextLevel = success ? target.level + 1 : target.level;
      inv[idx] = { ...target, level: nextLevel };

      persistTdSave({
        ...prevSave,
        enhancementGems: Math.max(0, gems - 1),
        equipmentInventory: inv,
      });

      const name = getEquipmentDisplayName(target.towerType, target.slot);
      if (success) {
        sound.playWin();
        return {
          success: true,
          newLevel: nextLevel,
          message: `Cường hóa thành công! ${name} lên +${nextLevel} (+${nextLevel * 2}% chỉ số).`,
        };
      }
      return {
        success: false,
        newLevel: nextLevel,
        message: `Cường hóa thất bại (${successRate}%). ${name} giữ nguyên +${nextLevel}.`,
      };
    },
    [persistTdSave]
  );

  const handleTdWinLevel = useCallback(
    (
      level: number,
      finalScore: number,
      stars: number,
      livesLeft: number,
      enemiesSlain: number,
      lootSummary: TdRunLootSummary
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
          lootSummary,
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
        lootSummary,
      });
      setGameState('ROUND_SUMMARY');

      const nextSave: TdSaveData = {
        ...prevSave,
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
      };

      persistTdSave(nextSave);
    },
    [persistTdSave]
  );

  const handleTdLoseLevel = useCallback(
    (enemiesSlain: number, finalScore: number, lootSummary: TdRunLootSummary) => {
      setTdResultModal((prev) => ({
        type: 'LOSE',
        level: prev?.level ?? tdLevelConfig.level,
        score: finalScore,
        stars: 0,
        livesLeft: 0,
        enemiesSlain,
        lootSummary,
      }));
      setGameState('GAME_OVER');
    },
    [tdLevelConfig.level]
  );

  const handleUpdateTdUpgrades = useCallback(
    (nextUpgrades: TdUpgrades) => {
      const prevSave = tdSaveRef.current;
      persistTdSave({
        ...prevSave,
        upgrades: nextUpgrades,
      });
    },
    [persistTdSave]
  );

  const handleExitToLevels = useCallback(() => {
    void exitGameFullscreenAndUnlock();
    setGameState('LEVEL_SELECT');
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (viewport.isFullscreen) {
      void exitGameFullscreenAndUnlock();
    } else {
      void enterGameFullscreenAndLandscape();
    }
  }, [viewport.isFullscreen]);

  const handleToggleSound = useCallback(() => {
    sound.unlock();
    const prevSave = tdSaveRef.current;
    const nextSound = prevSave.soundEnabled === false;
    sound.setEnabled(nextSound);
    persistTdSave({
      ...prevSave,
      soundEnabled: nextSound,
    });
  }, [persistTdSave]);

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

  const soundEnabled = tdSaveData.soundEnabled !== false;
  const fsSupported = canRequestFullscreen();

  const inventoryModal = (
    <TdInventoryModal
      open={inventoryOpen}
      onClose={() => setInventoryOpen(false)}
      enhancementGems={tdSaveData.enhancementGems ?? 0}
      equipmentInventory={tdSaveData.equipmentInventory ?? []}
      heroEquipment={tdSaveData.heroEquipment ?? {}}
      onEquipItem={handleEquipTdItem}
      onEnhanceItem={handleEnhanceTdItem}
    />
  );

  if (gameState === 'TITLE_MENU') {
    return (
      <>
        <TitleScreen
          tdSaveData={tdSaveData}
          activeAccount={activeAccount}
          hasLiveCloudAuth={Boolean(user)}
          authReady={authReady}
          authLoading={authLoading}
          syncStatus={syncStatus}
          authError={authError}
          showRedirectFallback={showRedirectFallback}
          soundEnabled={soundEnabled}
          bgmEnabled={bgmEnabled}
          onSignIn={handleSignIn}
          onSignInRedirect={handleSignInRedirect}
          onSignOut={handleSignOut}
          onStartTdCurrentLevel={() => startTdLevel(tdSaveData.highestUnlockedLevel)}
          onOpenTdLevelSelect={() => setGameState('LEVEL_SELECT')}
          onOpenInventory={() => setInventoryOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleBgm={handleToggleBgm}
        />
        {inventoryModal}
      </>
    );
  }

  if (gameState === 'LEVEL_SELECT') {
    return (
      <>
        <TdLevelSelectView
          saveData={tdSaveData}
          activeAccount={activeAccount}
          hasLiveCloudAuth={Boolean(user)}
          authReady={authReady}
          authLoading={authLoading}
          syncStatus={syncStatus}
          isPreviewMode={isPreviewMode}
          soundEnabled={soundEnabled}
          bgmEnabled={bgmEnabled}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onSelectLevel={(lv) => startTdLevel(lv)}
          onUpdateUpgrades={handleUpdateTdUpgrades}
          onOpenInventory={() => setInventoryOpen(true)}
          onTogglePreviewMode={handleTogglePreviewMode}
          onToggleSound={handleToggleSound}
          onToggleBgm={handleToggleBgm}
          onBack={() => setGameState('TITLE_MENU')}
        />
        {inventoryModal}
      </>
    );
  }

  const stageContent = (
    <>
      <TowerDefenseArenaStage
        levelConfig={tdLevelConfig}
        runNonce={tdRunNonce}
        upgrades={tdSaveData.upgrades}
        heroEquipment={tdSaveData.heroEquipment ?? {}}
        equipmentInventory={tdSaveData.equipmentInventory ?? []}
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
        soundEnabled={soundEnabled}
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
        onAcquireTdLoot={handleAcquireTdLoot}
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
          lootSummary={tdResultModal.lootSummary}
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

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#0F172A]/95 border border-[#FACC15]/70 text-xs sm:text-sm font-semibold text-[#FACC15] shadow-xl pointer-events-none whitespace-nowrap max-w-[92vw] truncate">
          {toastMessage}
        </div>
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
