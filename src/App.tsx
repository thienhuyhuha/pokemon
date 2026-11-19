import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  ArrowLeft,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { EndRoundModal } from './components/EndRoundModal';
import { GameBoard } from './components/GameBoard';
import { LevelSelectView } from './components/LevelSelectView';
import { PokeballIcon } from './components/PokeballIcon';
import { TitleScreen } from './components/TitleScreen';
import {
  formatDuration,
  getLevelConfig,
  MAX_LEVEL,
} from './data/levels';
import {
  auth,
  CloudSyncStatus,
  createPlayerProfile,
  db,
  handleFirestoreError,
  normalizeLevelsFromCloud,
  OperationType,
  savePlayerProgressToCloud,
  savePlayerSoundToCloud,
  signInWithGoogle,
  signOutPlayer,
  syncPlayerIdentity,
} from './firebase';
import {
  ActiveConnection,
  BoardGrid,
  FloatingScore,
  GameState,
  GridPos,
  LevelConfig,
  SaveData,
} from './types/game';
import {
  clearGuestSaveData,
  clearRememberedAccount,
  DEFAULT_SAVE,
  getRememberedAccount,
  loadGuestSaveData,
  loadPlayerLocalSave,
  mergeSaveData,
  RememberedAccount,
  saveGuestSaveData,
  savePlayerLocalSave,
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
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() =>
    getRememberedAccount() ? 'remembered' : 'local'
  );
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [saveData, setSaveData] = useState<SaveData>(() => {
    const remembered = getRememberedAccount();
    const loaded = remembered
      ? (loadPlayerLocalSave(remembered.uid) ?? loadGuestSaveData())
      : loadGuestSaveData();
    sound.enabled = loaded.soundEnabled;
    return loaded;
  });

  // Creator/Admin preview mode (session-only; regular players must unlock sequentially)
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => getLevelConfig(1));
  const [board, setBoard] = useState<BoardGrid>([]);
  const [selected, setSelected] = useState<GridPos | null>(null);
  const [hintPair, setHintPair] = useState<{ a: GridPos; b: GridPos } | null>(null);
  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);
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

  const saveDataRef = useRef<SaveData>(saveData);
  const boardRef = useRef<BoardGrid>(board);
  const creatingProfileUidRef = useRef<string | null>(null);
  const identitySyncedUidRef = useRef<string | null>(null);
  const mergeSyncedUidRef = useRef<string | null>(null);

  const lastMatchAtRef = useRef<number>(0);
  const matchLockedRef = useRef<boolean>(false);
  const matchTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const invalidTimerRef = useRef<number | null>(null);

  useEffect(() => {
    saveDataRef.current = saveData;
  }, [saveData]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const clearPendingTimers = useCallback(() => {
    if (matchTimerRef.current) {
      window.clearTimeout(matchTimerRef.current);
      matchTimerRef.current = null;
    }
    if (invalidTimerRef.current) {
      window.clearTimeout(invalidTimerRef.current);
      invalidTimerRef.current = null;
    }
    matchLockedRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      clearPendingTimers();
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [clearPendingTimers]);

  // Persist current player's progress locally on their machine
  useEffect(() => {
    const activeUid = user?.uid ?? rememberedAccount?.uid ?? null;
    if (activeUid) {
      savePlayerLocalSave(activeUid, saveData);
      return;
    }
    if (!authReady) return;
    saveGuestSaveData(saveData);
  }, [authReady, user, rememberedAccount, saveData]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        creatingProfileUidRef.current = null;
        identitySyncedUidRef.current = null;
        mergeSyncedUidRef.current = null;

        const remembered = getRememberedAccount();
        if (remembered) {
          setRememberedAccountState(remembered);
          setSyncStatus('remembered');
          const cached = loadPlayerLocalSave(remembered.uid) ?? DEFAULT_SAVE;
          sound.enabled = cached.soundEnabled;
          setSaveData(cached);
        } else {
          setRememberedAccountState(null);
          setSyncStatus('local');
          const guest = loadGuestSaveData();
          sound.enabled = guest.soundEnabled;
          setSaveData(guest);
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
      setSyncStatus('syncing');

      const cached = loadPlayerLocalSave(nextUser.uid);
      if (cached) {
        sound.enabled = cached.soundEnabled;
        setSaveData(cached);
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

          sound.enabled = merged.soundEnabled;
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
            sound.enabled = initialSave.soundEnabled;
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

  const handleSignIn = useCallback(
    async (forceSelectAccount = false) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setAuthError(
          'Bạn đang ở chế độ Offline. Hãy kết nối mạng để đăng nhập/đồng bộ Google — bạn vẫn có thể chơi offline ngay lúc này!'
        );
        return;
      }
      setAuthLoading(true);
      setAuthError(null);
      try {
        clearPendingTimers();
        await signInWithGoogle(forceSelectAccount);
        setGameState((prev) => (prev === 'PLAYING' || prev === 'PAUSED' ? 'TITLE_MENU' : prev));
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setAuthError('Bạn đã đóng cửa sổ đăng nhập Google.');
        } else if (code === 'auth/popup-blocked') {
          setAuthError('Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép popup và thử lại.');
        } else if (code === 'auth/network-request-failed') {
          setAuthError('Không có kết nối mạng. Bạn vẫn có thể tiếp tục chơi chế độ Offline.');
        } else {
          setAuthError('Không thể đăng nhập lúc này. Vui lòng thử lại sau.');
        }
      } finally {
        setAuthLoading(false);
      }
    },
    [clearPendingTimers]
  );

  const handleSignOut = useCallback(async () => {
    clearPendingTimers();
    setAuthError(null);
    clearRememberedAccount();
    setRememberedAccountState(null);
    try {
      await signOutPlayer();
      const guest = loadGuestSaveData();
      sound.enabled = guest.soundEnabled;
      setSaveData(guest);
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
      clearPendingTimers();
      const cfg = getLevelConfig(levelNum);
      const rawBoard = generateBoard(cfg);
      const checked = ensurePlayableBoard(rawBoard);
      setLevelConfig(cfg);
      setBoard(checked.board);
      setSelected(null);
      setHintPair(null);
      setActiveConnection(null);
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
      lastMatchAtRef.current = 0;
      setGameState('PLAYING');
    },
    [clearPendingTimers, isPreviewMode, saveData.highestUnlockedLevel]
  );

  // Countdown Timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

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
  }, [gameState]);

  const handleToggleSound = useCallback(() => {
    const nextSound = !saveDataRef.current.soundEnabled;
    sound.enabled = nextSound;
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

  const handleTogglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const handleHint = useCallback(() => {
    if (gameState !== 'PLAYING' || matchLockedRef.current) return;
    if (hintsLeft <= 0) {
      showToast('Đã hết lượt gợi ý trong màn này');
      return;
    }
    const pair = findAnyValidPair(board);
    if (!pair) {
      const recovery = ensurePlayableBoard(board);
      setBoard(recovery.board);
      showToast(recovery.reason ?? 'Đã tự động điều chỉnh bàn đấu!');
      return;
    }
    sound.playHint();
    setHintsLeft((h) => h - 1);
    setHintPair({ a: pair.a, b: pair.b });
    setSelected(null);
  }, [board, gameState, hintsLeft, showToast]);

  const handleShuffle = useCallback(() => {
    if (gameState !== 'PLAYING' || matchLockedRef.current) return;
    if (shufflesLeft <= 0) {
      showToast('Đã hết lượt đảo bàn trong màn này');
      return;
    }
    sound.playShuffle();
    setShufflesLeft((s) => s - 1);
    setBoard((prev) => ensurePlayableBoard(shuffleBoard(prev)).board);
    setSelected(null);
    setHintPair(null);
  }, [gameState, shufflesLeft, showToast]);

  const handleSelectTile = useCallback(
    (r: number, c: number) => {
      if (gameState !== 'PLAYING' || matchLockedRef.current) return;
      const clickedTile = board[r]?.[c];
      if (!clickedTile) return;

      if (clickedTile.frozen) {
        sound.playMismatch();
        setInvalidPair([{ r, c }, { r, c }]);
        if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
        invalidTimerRef.current = window.setTimeout(() => setInvalidPair(null), 260);
        showToast('Ô đang đóng băng — Hãy ghép cặp sát bên để làm tan băng');
        return;
      }

      if (selected && selected.r === r && selected.c === c) {
        setSelected(null);
        return;
      }

      if (!selected) {
        sound.playSelect();
        setSelected({ r, c });
        return;
      }

      const firstPos = selected;
      const firstTile = board[firstPos.r]?.[firstPos.c];
      if (!firstTile || firstTile.frozen) {
        sound.playSelect();
        setSelected({ r, c });
        return;
      }

      if (firstTile.speciesId !== clickedTile.speciesId) {
        sound.playMismatch();
        setInvalidPair([firstPos, { r, c }]);
        if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
        invalidTimerRef.current = window.setTimeout(() => setInvalidPair(null), 260);
        setSelected({ r, c });
        return;
      }

      const path = findConnectionPath(board, firstPos, { r, c });
      if (!path) {
        sound.playMismatch();
        setInvalidPair([firstPos, { r, c }]);
        if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
        invalidTimerRef.current = window.setTimeout(() => setInvalidPair(null), 260);
        setSelected({ r, c });
        return;
      }

      // Valid Match!
      const now = Date.now();
      const isCombo = now - lastMatchAtRef.current <= 4500;
      const nextCombo = isCombo ? Math.min(10, combo + 1) : 1;
      lastMatchAtRef.current = now;
      const pointsEarned = 100 + (nextCombo - 1) * 35;

      sound.playMatch(nextCombo);
      matchLockedRef.current = true;
      setSelected(null);
      setHintPair(null);
      setCombo(nextCombo);
      setScore((prev) => prev + pointsEarned);

      const nextMatchedCount = pairsMatched + 1;
      setPairsMatched(nextMatchedCount);

      setActiveConnection({
        path,
        a: firstPos,
        b: { r, c },
        speciesId: clickedTile.speciesId,
      });

      const floatId = `${now}-${r}-${c}`;
      setFloatingScores((prev) => [
        ...prev.slice(-4),
        { id: floatId, r, c, text: `+${pointsEarned}`, combo: nextCombo },
      ]);
      window.setTimeout(() => {
        setFloatingScores((prev) => prev.filter((item) => item.id !== floatId));
      }, 650);

      matchTimerRef.current = window.setTimeout(() => {
        setActiveConnection(null);

        let next = cloneBoard(boardRef.current);
        next = thawAdjacentFrozen(next, firstPos, { r, c });
        next[firstPos.r][firstPos.c] = null;
        next[r][c] = null;

        const shifted = applyGravity(
          next,
          levelConfig.gravityMode,
          nextMatchedCount,
          firstPos,
          { r, c }
        );
        next = shifted.board;
        setLastShiftLabel(getDirectionLabel(shifted.direction));

        const remaining = countRemainingTiles(next);
        if (remaining === 0) {
          setBoard(next);
          sound.playWin();
          const ratio = timeRemaining / levelConfig.timeLimitSeconds;
          const stars = ratio >= 0.4 ? 3 : ratio >= 0.2 ? 2 : 1;
          const timeBonus = timeRemaining * 15;
          const finalRoundScore = score + pointsEarned + timeBonus;

          setScore(finalRoundScore);
          setEarnedStars(stars);
          setGameState('ROUND_SUMMARY');

          // Only save progression if this level was legitimately unlocked
          const nextSave = computeWinSaveData(
            saveDataRef.current,
            levelConfig.level,
            finalRoundScore,
            stars,
            timeRemaining
          );
          if (nextSave) {
            setSaveData(nextSave);
            const activeUid = user?.uid ?? rememberedAccount?.uid ?? null;
            if (activeUid) {
              savePlayerLocalSave(activeUid, nextSave);
            }
            if (user) {
              const isOfflineNow = typeof navigator !== 'undefined' && !navigator.onLine;
              setSyncStatus(isOfflineNow ? 'remembered' : 'syncing');
              void savePlayerProgressToCloud(user.uid, nextSave)
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
          setBoard(next);
          if (recovery.adjusted && recovery.reason) {
            sound.playShuffle();
            showToast(recovery.reason);
          }
        }

        matchLockedRef.current = false;
      }, 190);
    },
    [
      board,
      combo,
      gameState,
      levelConfig.gravityMode,
      levelConfig.level,
      levelConfig.timeLimitSeconds,
      pairsMatched,
      rememberedAccount,
      score,
      selected,
      showToast,
      timeRemaining,
      user,
    ]
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
        saveData={saveData}
        activeAccount={activeAccount}
        hasLiveCloudAuth={Boolean(user)}
        authReady={authReady}
        authLoading={authLoading}
        syncStatus={syncStatus}
        authError={authError}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onStartCurrentLevel={() => startLevel(saveData.highestUnlockedLevel)}
        onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
        onToggleSound={handleToggleSound}
      />
    );
  }

  if (gameState === 'LEVEL_SELECT') {
    return (
      <LevelSelectView
        saveData={saveData}
        activeAccount={activeAccount}
        hasLiveCloudAuth={Boolean(user)}
        authReady={authReady}
        authLoading={authLoading}
        syncStatus={syncStatus}
        isPreviewMode={isPreviewMode}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onSelectLevel={(lv) => startLevel(lv)}
        onTogglePreviewMode={handleTogglePreviewMode}
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#111827] text-slate-100 flex flex-col">
      {/* Pokédex Crimson Game HUD */}
      <header className="w-full px-3 sm:px-6 py-2.5 bg-[#B91C1C] border-b-4 border-[#0F172A] shrink-0 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back & Level / Movement Rule */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                clearPendingTimers();
                setGameState('LEVEL_SELECT');
              }}
              aria-label="Quay về bản đồ cấp độ"
              className="p-2 rounded-lg border border-red-900 bg-[#991B1B] text-red-100 hover:text-white hover:bg-[#7F1D1D] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <PokeballIcon variant="poke" className="w-6 h-6 shrink-0 hidden sm:block" />
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
              <div className="text-xs text-red-100/90 truncate hidden sm:block font-mono-num">
                {levelConfig.cols}×{levelConfig.rows} ({totalPairs} cặp) · {levelConfig.speciesCount} loài · Còn {totalPairs - pairsMatched} cặp
              </div>
            </div>
          </div>

          {/* Center: Timer & Score */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col gap-1 min-w-[125px] sm:min-w-[175px] bg-[#0F172A]/45 px-3 py-1 rounded-lg border border-red-950/60">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={isLowTime ? 'text-yellow-300 font-bold' : 'text-red-100'}>
                  {isLowTime ? 'Sắp hết giờ!' : 'Thời gian'}
                </span>
                <span
                  className={`font-mono-num text-sm sm:text-base font-bold ${
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

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-red-100">Đã ghép</span>
              <span className="font-mono-num text-sm font-bold text-white">
                {pairsMatched}/{totalPairs}
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-xs text-red-100">
                Điểm {combo > 1 ? `(x${combo})` : ''}
              </span>
              <span className="font-mono-num text-sm sm:text-base font-extrabold text-[#FACC15]">
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
              onClick={handleToggleSound}
              aria-label={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer shrink-0"
            >
              {saveData.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Arena Stage */}
      <main className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <GameBoard
          board={board}
          selected={selected}
          hintPair={hintPair}
          activeConnection={activeConnection}
          invalidPair={invalidPair}
          floatingScores={floatingScores}
          isPaused={gameState === 'PAUSED'}
          onSelectTile={handleSelectTile}
          onResume={() => setGameState('PLAYING')}
        />

        {toastMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#0F172A]/95 border border-[#FACC15]/70 text-xs sm:text-sm font-semibold text-[#FACC15] shadow-xl pointer-events-none whitespace-nowrap">
            {toastMessage}
          </div>
        )}
      </main>

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
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
        />
      )}
    </div>
  );
}
