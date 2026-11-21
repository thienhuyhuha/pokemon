import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Gem,
  Lightbulb,
  Maximize2,
  Minimize2,
  Mountain,
  Music,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Snowflake,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DIAMOND_MAX_LEVEL, getGemStyle } from '../data/diamondLevels';
import {
  DiamondFloatingScore,
  DiamondGrid,
  DiamondLevelConfig,
  GemBurstEffect,
} from '../types/diamond';
import { GridPos } from '../types/game';
import {
  applyDiamondGravityAndRefill,
  areAdjacentGems,
  canMoveDiamondCell,
  cloneDiamondGrid,
  createDiamondBoard,
  findAnyDiamondMove,
  findDiamondMatchGroups,
  isValidDiamondSwap,
  resolveDiamondStep,
  shuffleDiamondGems,
  trySpreadFrost,
} from '../utils/diamondEngine';
import { sound } from '../utils/sound';
import { DiamondArtwork } from './DiamondArtwork';
import { DiamondEndModal } from './DiamondEndModal';
import { ActiveSwapVisual, DiamondGameBoard } from './DiamondGameBoard';

interface DiamondArenaStageProps {
  levelConfig: DiamondLevelConfig;
  runNonce: number;
  isPaused: boolean;
  isCompactLandscape: boolean;
  isStageRotated90: boolean;
  isFullscreen: boolean;
  fsSupported: boolean;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  isPreviewMode: boolean;
  highestUnlockedLevel: number;
  onTogglePause: () => void;
  onResume: () => void;
  onExitToLevels: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onReplay: () => void;
  onNextLevel: (nextLv: number) => void;
  onWinLevel: (level: number, finalScore: number, stars: number, movesLeft: number) => void;
  onLoseLevel: () => void;
}

function countRemainingIce(grid: DiamondGrid): number {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (cell && cell.ice > 0) count += cell.ice;
    }
  }
  return count;
}

function countRemainingStoneHp(grid: DiamondGrid): number {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (cell && cell.stone) count += Math.max(1, cell.stoneHp);
    }
  }
  return count;
}

export const DiamondArenaStage: React.FC<DiamondArenaStageProps> = ({
  levelConfig,
  runNonce,
  isPaused,
  isCompactLandscape,
  isStageRotated90,
  isFullscreen,
  fsSupported,
  soundEnabled,
  bgmEnabled,
  isPreviewMode,
  highestUnlockedLevel,
  onTogglePause,
  onResume,
  onExitToLevels,
  onToggleFullscreen,
  onToggleSound,
  onToggleBgm,
  onReplay,
  onNextLevel,
  onWinLevel,
  onLoseLevel,
}) => {
  const [grid, setGrid] = useState<DiamondGrid>(() => createDiamondBoard(levelConfig));
  const [selected, setSelected] = useState<GridPos | null>(null);
  const [hintMove, setHintMove] = useState<{ a: GridPos; b: GridPos } | null>(null);
  const [invalidPair, setInvalidPair] = useState<[GridPos, GridPos] | null>(null);
  const [activeSwap, setActiveSwap] = useState<ActiveSwapVisual | null>(null);
  const [bursts, setBursts] = useState<GemBurstEffect[]>([]);
  const [floatingScores, setFloatingScores] = useState<DiamondFloatingScore[]>([]);

  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(levelConfig.movesLimit);
  const [colorCollected, setColorCollected] = useState<number>(0);
  const [colorCollected2, setColorCollected2] = useState<number>(0);
  const [hintsLeft, setHintsLeft] = useState<number>(levelConfig.initialHints);
  const [shufflesLeft, setShufflesLeft] = useState<number>(levelConfig.initialShuffles);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [comboDisplay, setComboDisplay] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [endOutcome, setEndOutcome] = useState<'WIN' | 'LOSE' | null>(null);
  const [earnedStars, setEarnedStars] = useState<number>(0);

  const gridRef = useRef<DiamondGrid>(grid);
  const scoreRef = useRef<number>(score);
  const movesRef = useRef<number>(movesLeft);
  const colorRef = useRef<number>(colorCollected);
  const color2Ref = useRef<number>(colorCollected2);
  const epochRef = useRef<number>(0);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    epochRef.current += 1;
    const fresh = createDiamondBoard(levelConfig);
    gridRef.current = fresh;
    scoreRef.current = 0;
    movesRef.current = levelConfig.movesLimit;
    colorRef.current = 0;
    color2Ref.current = 0;

    setGrid(fresh);
    setSelected(null);
    setHintMove(null);
    setInvalidPair(null);
    setActiveSwap(null);
    setBursts([]);
    setFloatingScores([]);
    setScore(0);
    setMovesLeft(levelConfig.movesLimit);
    setColorCollected(0);
    setColorCollected2(0);
    setHintsLeft(levelConfig.initialHints);
    setShufflesLeft(levelConfig.initialShuffles);
    setIsBusy(false);
    setComboDisplay(1);
    setToastMessage(null);
    setEndOutcome(null);
    setEarnedStars(0);
  }, [levelConfig, runNonce]);

  useEffect(() => {
    return () => {
      epochRef.current += 1;
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 2600);
  }, []);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const handleHint = useCallback(() => {
    if (isPaused || isBusy || endOutcome) return;
    if (hintsLeft <= 0) {
      showToast('Đã hết lượt gợi ý trong màn này');
      return;
    }
    const found = findAnyDiamondMove(gridRef.current);
    if (!found) {
      const reshuffled = shuffleDiamondGems(gridRef.current, levelConfig.gemTypes);
      gridRef.current = reshuffled;
      setGrid(reshuffled);
      showToast('Đã tự động đảo bàn kim cương!');
      return;
    }
    sound.playHint();
    setHintsLeft((h) => h - 1);
    setHintMove(found);
    setSelected(null);
  }, [isPaused, isBusy, endOutcome, hintsLeft, levelConfig.gemTypes, showToast]);

  const handleShuffle = useCallback(() => {
    if (isPaused || isBusy || endOutcome) return;
    if (shufflesLeft <= 0) {
      showToast('Đã hết lượt đảo bàn trong màn này');
      return;
    }
    sound.playShuffle();
    setShufflesLeft((s) => s - 1);
    const next = shuffleDiamondGems(gridRef.current, levelConfig.gemTypes);
    gridRef.current = next;
    setGrid(next);
    setSelected(null);
    setHintMove(null);
  }, [isPaused, isBusy, endOutcome, shufflesLeft, levelConfig.gemTypes, showToast]);

  const handleAttemptSwap = useCallback(
    async (a: GridPos, b: GridPos) => {
      if (isPaused || isBusy || endOutcome) return;
      const myEpoch = epochRef.current;

      if (!isValidDiamondSwap(gridRef.current, a, b)) {
        const cellA = gridRef.current[a.r]?.[a.c];
        const cellB = gridRef.current[b.r]?.[b.c];
        if (areAdjacentGems(a, b) && canMoveDiamondCell(cellA) && canMoveDiamondCell(cellB)) {
          // Physical swap-out and bounce-back feedback without spending a move
          setIsBusy(true);
          setSelected(null);
          sound.playGemSwap();
          setActiveSwap({ a: b, b: a, invalid: true });

          const forwardGrid = cloneDiamondGrid(gridRef.current);
          forwardGrid[a.r][a.c] = cellB!;
          forwardGrid[b.r][b.c] = cellA!;
          gridRef.current = forwardGrid;
          setGrid(forwardGrid);

          await sleep(140);
          if (epochRef.current !== myEpoch) return;

          sound.playGemInvalid();
          setInvalidPair([a, b]);
          setActiveSwap({ a, b, invalid: true });

          const backGrid = cloneDiamondGrid(gridRef.current);
          backGrid[a.r][a.c] = cellA!;
          backGrid[b.r][b.c] = cellB!;
          gridRef.current = backGrid;
          setGrid(backGrid);

          await sleep(165);
          if (epochRef.current !== myEpoch) return;

          setInvalidPair(null);
          setActiveSwap(null);
          setIsBusy(false);
          return;
        }

        sound.playGemInvalid();
        setInvalidPair([a, b]);
        window.setTimeout(() => {
          if (epochRef.current === myEpoch) setInvalidPair(null);
        }, 250);
        return;
      }

      setIsBusy(true);
      setHintMove(null);
      setSelected(null);
      setActiveSwap({ a: b, b: a });
      sound.playGemSwap();

      const nextMoves = Math.max(0, movesRef.current - 1);
      movesRef.current = nextMoves;
      setMovesLeft(nextMoves);

      // Perform immediate visual swap
      let curGrid = cloneDiamondGrid(gridRef.current);
      const temp = curGrid[a.r][a.c];
      curGrid[a.r][a.c] = curGrid[b.r][b.c];
      curGrid[b.r][b.c] = temp;
      gridRef.current = curGrid;
      setGrid(curGrid);

      await sleep(165);
      if (epochRef.current !== myEpoch) return;
      setActiveSwap(null);

      let combo = 1;
      let curScore = scoreRef.current;
      let curColorCollected = colorRef.current;
      let curColorCollected2 = color2Ref.current;
      let iceBrokenThisTurn = 0;
      let isFirstSwapStep = true;

      while (true) {
        const res = resolveDiamondStep(
          curGrid,
          combo,
          isFirstSwapStep ? { a, b } : undefined
        );
        isFirstSwapStep = false;

        if (
          res.clearedCount === 0 &&
          !res.spawnedSpecial &&
          res.stonesDestroyed === 0 &&
          res.stonesDamaged === 0
        ) {
          break;
        }

        iceBrokenThisTurn += res.iceBroken;
        curGrid = res.nextGrid;
        gridRef.current = curGrid;
        setGrid(curGrid);
        setComboDisplay(combo);

        if (res.specialTriggered) {
          sound.playGemSpecial();
        } else {
          sound.playGemMatch(combo, res.maxGroupSize);
        }

        if (res.pointsEarned > 0) {
          curScore += res.pointsEarned;
          scoreRef.current = curScore;
          setScore(curScore);
        }

        if (levelConfig.targetColor !== null) {
          const added = res.clearedByColor[levelConfig.targetColor] ?? 0;
          if (added > 0) {
            curColorCollected += added;
            colorRef.current = curColorCollected;
            setColorCollected(curColorCollected);
          }
        }

        if (levelConfig.secondaryTargetColor !== null) {
          const added2 = res.clearedByColor[levelConfig.secondaryTargetColor] ?? 0;
          if (added2 > 0) {
            curColorCollected2 += added2;
            color2Ref.current = curColorCollected2;
            setColorCollected2(curColorCollected2);
          }
        }

        setBursts(res.bursts);
        if (res.bursts.length > 0 && res.pointsEarned > 0) {
          const anchor = res.bursts[Math.floor(res.bursts.length / 2)];
          const fid = `df-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          setFloatingScores((prev) => [
            ...prev.slice(-4),
            {
              id: fid,
              r: anchor.r,
              c: anchor.c,
              text: `+${res.pointsEarned}`,
              combo,
            },
          ]);
          window.setTimeout(() => {
            if (epochRef.current === myEpoch) {
              setFloatingScores((prev) => prev.filter((item) => item.id !== fid));
            }
          }, 680);
        }

        await sleep(175);
        if (epochRef.current !== myEpoch) return;
        setBursts([]);

        curGrid = applyDiamondGravityAndRefill(curGrid, levelConfig.gemTypes);
        gridRef.current = curGrid;
        setGrid(curGrid);

        await sleep(285);
        if (epochRef.current !== myEpoch) return;

        if (findDiamondMatchGroups(curGrid).length > 0) {
          combo = Math.min(12, combo + 1);
        } else {
          break;
        }
      }

      setComboDisplay(1);

      let remainingIce = countRemainingIce(curGrid);
      const remainingStones = countRemainingStoneHp(curGrid);

      const scoreMet = curScore >= levelConfig.targetScore;
      const colorMet1 =
        levelConfig.targetColor === null ||
        curColorCollected >= levelConfig.targetColorCount;
      const colorMet2 =
        levelConfig.secondaryTargetColor === null ||
        curColorCollected2 >= levelConfig.secondaryTargetColorCount;
      const iceMet =
        levelConfig.iceCount + levelConfig.doubleIceCount === 0 || remainingIce === 0;
      const stonesMet = !levelConfig.requireClearStones || remainingStones === 0;

      if (scoreMet && colorMet1 && colorMet2 && iceMet && stonesMet) {
        const finalScore = curScore + nextMoves * 120;
        const stars =
          nextMoves >= Math.ceil(levelConfig.movesLimit * 0.25)
            ? 3
            : nextMoves >= Math.ceil(levelConfig.movesLimit * 0.1)
              ? 2
              : 1;
        scoreRef.current = finalScore;
        setScore(finalScore);
        setEarnedStars(stars);
        setEndOutcome('WIN');
        sound.playWin();
        onWinLevel(levelConfig.level, finalScore, stars, nextMoves);
        setIsBusy(false);
        return;
      }

      // Hardcore mechanic: Frost spreads if player finishes a turn breaking zero ice
      if (
        nextMoves > 0 &&
        levelConfig.frostSpreadOnMiss &&
        iceBrokenThisTurn === 0 &&
        remainingIce > 0
      ) {
        const spread = trySpreadFrost(curGrid);
        if (spread.spreadPos) {
          curGrid = spread.nextGrid;
          gridRef.current = curGrid;
          setGrid(curGrid);
          remainingIce = countRemainingIce(curGrid);
          showToast('Băng giá lan rộng thêm 1 ô!');
        }
      }

      if (nextMoves <= 0) {
        sound.playGameOver();
        setEndOutcome('LOSE');
        onLoseLevel();
        setIsBusy(false);
        return;
      }

      if (!findAnyDiamondMove(curGrid)) {
        const reshuffled = shuffleDiamondGems(curGrid, levelConfig.gemTypes);
        gridRef.current = reshuffled;
        setGrid(reshuffled);
        sound.playShuffle();
        showToast('Hết nước đi hợp lệ — Đã tự động đảo kim cương!');
      }

      setIsBusy(false);
    },
    [
      isPaused,
      isBusy,
      endOutcome,
      levelConfig,
      onWinLevel,
      onLoseLevel,
      showToast,
    ]
  );

  const remainingIce = countRemainingIce(grid);
  const remainingStones = countRemainingStoneHp(grid);
  const colorGoalMeta =
    levelConfig.targetColor !== null ? getGemStyle(levelConfig.targetColor) : null;
  const colorGoalMeta2 =
    levelConfig.secondaryTargetColor !== null
      ? getGemStyle(levelConfig.secondaryTargetColor)
      : null;
  const scorePct = Math.min(100, Math.round((score / levelConfig.targetScore) * 100));

  return (
    <>
      {isCompactLandscape ? (
        /* Compact Mobile Landscape Stage: 44px slim rails + maximum center Diamond Grid */
        <div className="w-full h-full flex overflow-hidden bg-[#0B1120]">
          {/* Left Ultra-Slim Status Rail */}
          <aside className="w-11 shrink-0 bg-[#0E7490] border-r border-[#0F172A] flex flex-col items-stretch justify-between py-1 px-1 gap-1 select-none">
            <button
              type="button"
              onClick={onExitToLevels}
              title="Quay về bản đồ 100 màn"
              aria-label="Quay về bản đồ 100 màn"
              className="h-8 flex items-center justify-center rounded-md bg-[#155E75] hover:bg-[#164E63] border border-cyan-950/60 text-cyan-50 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="rounded-md bg-[#0F172A]/65 px-0.5 py-1 text-center leading-tight">
              <div className="text-[9px] text-cyan-200 font-semibold">Màn</div>
              <div className="font-mono-num text-[11px] font-extrabold text-white">
                {levelConfig.level}
              </div>
            </div>

            <div className="rounded-md bg-[#0F172A]/75 px-0.5 py-1 text-center leading-tight">
              <div className="text-[9px] text-cyan-200">Lượt</div>
              <div
                className={`font-mono-num text-xs font-extrabold ${
                  movesLeft <= 5 ? 'text-rose-400' : 'text-[#FACC15]'
                }`}
              >
                {movesLeft}
              </div>
            </div>

            <div className="rounded-md bg-[#0F172A]/60 px-0.5 py-1 flex flex-col items-center gap-0.5 text-center leading-tight">
              <div className="text-[9px] text-cyan-200">
                {comboDisplay > 1 ? `x${comboDisplay}` : 'Điểm'}
              </div>
              <div className="font-mono-num text-[10px] font-extrabold text-white truncate">
                {score >= 1000 ? `${(score / 1000).toFixed(1)}k` : score}
              </div>
              <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden">
                <div
                  style={{ width: `${scorePct}%` }}
                  className="h-full bg-cyan-400 transition-all duration-300"
                />
              </div>
            </div>

            {colorGoalMeta && (
              <div className="rounded-md bg-[#0F172A]/60 px-0.5 py-1 flex flex-col items-center gap-0.5 text-center leading-tight">
                <DiamondArtwork color={colorGoalMeta.id} className="w-3.5 h-3.5" />
                <div className="font-mono-num text-[9px] font-bold text-emerald-300">
                  {Math.min(colorCollected, levelConfig.targetColorCount)}/
                  {levelConfig.targetColorCount}
                </div>
              </div>
            )}

            {colorGoalMeta2 && (
              <div className="rounded-md bg-[#0F172A]/60 px-0.5 py-1 flex flex-col items-center gap-0.5 text-center leading-tight">
                <DiamondArtwork color={colorGoalMeta2.id} className="w-3.5 h-3.5" />
                <div className="font-mono-num text-[9px] font-bold text-amber-300">
                  {Math.min(colorCollected2, levelConfig.secondaryTargetColorCount)}/
                  {levelConfig.secondaryTargetColorCount}
                </div>
              </div>
            )}

            {(levelConfig.iceCount > 0 || remainingIce > 0) && (
              <div className="rounded-md bg-[#0F172A]/60 px-0.5 py-1 flex flex-col items-center gap-0.5 text-center leading-tight">
                <Snowflake className="w-3.5 h-3.5 text-sky-300" />
                <div className="font-mono-num text-[9px] font-bold text-sky-200">
                  {remainingIce}
                </div>
              </div>
            )}

            {levelConfig.requireClearStones && (
              <div className="rounded-md bg-[#0F172A]/60 px-0.5 py-1 flex flex-col items-center gap-0.5 text-center leading-tight">
                <Mountain className="w-3.5 h-3.5 text-amber-300" />
                <div className="font-mono-num text-[9px] font-bold text-amber-200">
                  {remainingStones}
                </div>
              </div>
            )}
          </aside>

          {/* Center Board */}
          <main className="relative flex-1 min-w-0 h-full flex items-center justify-center p-0 overflow-hidden">
            <DiamondGameBoard
              grid={grid}
              selected={selected}
              hintMove={hintMove}
              invalidPair={invalidPair}
              activeSwap={activeSwap}
              bursts={bursts}
              floatingScores={floatingScores}
              isPaused={isPaused}
              isBusy={isBusy}
              isCompactLandscape={true}
              isStageRotated90={isStageRotated90}
              onAttemptSwap={handleAttemptSwap}
              onSelectPos={setSelected}
              onResume={onResume}
            />

            {toastMessage && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-lg bg-[#0F172A]/95 border border-cyan-400/70 text-xs font-semibold text-cyan-200 shadow-xl pointer-events-none whitespace-nowrap max-w-[92%] truncate">
                {toastMessage}
              </div>
            )}
          </main>

          {/* Right Ultra-Slim Thumb Action Rail */}
          <aside className="w-11 shrink-0 bg-[#0F172A] border-l border-slate-800 py-1 px-1 flex flex-col items-stretch justify-between gap-0.5 select-none">
            <button
              type="button"
              onClick={onTogglePause}
              title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
              aria-label={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-white cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleHint}
              disabled={isPaused || isBusy || hintsLeft <= 0}
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
              disabled={isPaused || isBusy || shufflesLeft <= 0}
              title={`Đảo bàn (${shufflesLeft})`}
              aria-label={`Đảo bàn (${shufflesLeft})`}
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 disabled:opacity-40 flex flex-col items-center justify-center text-[#FACC15] cursor-pointer leading-none gap-0.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold font-mono-num">{shufflesLeft}</span>
            </button>

            <button
              type="button"
              onClick={onReplay}
              title="Chơi lại"
              aria-label="Chơi lại"
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onToggleBgm}
              title={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
              aria-label={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
              className={`flex-1 min-h-0 rounded-lg border flex items-center justify-center cursor-pointer ${
                bgmEnabled && soundEnabled
                  ? 'bg-[#1E293B] border-amber-400/50 text-[#FACC15]'
                  : 'bg-[#1E293B] border-slate-700/80 text-slate-400 opacity-75'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-slate-200 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {fsSupported && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                className={`flex-1 min-h-0 rounded-lg border flex items-center justify-center cursor-pointer ${
                  !isFullscreen
                    ? 'bg-[#FACC15] border-yellow-300 text-slate-950'
                    : 'bg-[#1E293B] border-slate-700/80 text-slate-200'
                }`}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </aside>
        </div>
      ) : (
        /* Desktop Fullscreen Landscape Stage */
        <div className="w-full h-full flex flex-col bg-[#0B1120]">
          <header className="w-full px-6 py-2.5 bg-[#0E7490] border-b-4 border-[#0F172A] shrink-0 shadow-md">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={onExitToLevels}
                  aria-label="Quay về bản đồ 100 màn"
                  className="p-2 rounded-lg border border-cyan-950/60 bg-[#155E75] text-cyan-100 hover:text-white hover:bg-[#164E63] transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Gem className="w-6 h-6 text-[#FACC15] shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-white font-mono-num whitespace-nowrap">
                    <span>Màn {levelConfig.level}/{DIAMOND_MAX_LEVEL}</span>
                    <span className="text-cyan-200/70" aria-hidden="true">·</span>
                    <span className="font-sans font-semibold text-[#FACC15] truncate">
                      {levelConfig.chapterName}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-100/90 truncate font-mono-num">
                    {levelConfig.rows}×{levelConfig.cols} · {levelConfig.gemTypes} loại kim cương
                    {isPreviewMode ? ' · Xem trước' : ''}
                  </div>
                </div>
              </div>

              {/* Center HUD Goals */}
              <div className="flex items-center gap-5">
                <div className="flex flex-col text-center bg-[#0F172A]/45 px-3 py-1 rounded-lg border border-cyan-950/60">
                  <span className="text-[11px] text-cyan-100">Lượt còn</span>
                  <span
                    className={`font-mono-num text-base font-extrabold ${
                      movesLeft <= 5 ? 'text-rose-400' : 'text-[#FACC15]'
                    }`}
                  >
                    {movesLeft}
                  </span>
                </div>

                <div className="flex flex-col gap-1 min-w-[175px] bg-[#0F172A]/45 px-3 py-1 rounded-lg border border-cyan-950/60">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono-num">
                    <span className="font-sans text-cyan-100">
                      Điểm {comboDisplay > 1 ? `(x${comboDisplay})` : ''}
                    </span>
                    <span className="font-bold text-white">
                      {score.toLocaleString('vi-VN')} / {levelConfig.targetScore.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900/90 overflow-hidden">
                    <div
                      style={{ width: `${scorePct}%` }}
                      className="h-full bg-cyan-400 transition-all duration-300"
                    />
                  </div>
                </div>

                {colorGoalMeta && (
                  <div className="flex items-center gap-2 bg-[#0F172A]/45 px-2.5 py-1 rounded-lg border border-cyan-950/60">
                    <DiamondArtwork color={colorGoalMeta.id} className="w-5 h-5" />
                    <span className="font-mono-num text-xs font-bold text-emerald-300">
                      {Math.min(colorCollected, levelConfig.targetColorCount)}/
                      {levelConfig.targetColorCount}
                    </span>
                  </div>
                )}

                {colorGoalMeta2 && (
                  <div className="flex items-center gap-2 bg-[#0F172A]/45 px-2.5 py-1 rounded-lg border border-cyan-950/60">
                    <DiamondArtwork color={colorGoalMeta2.id} className="w-5 h-5" />
                    <span className="font-mono-num text-xs font-bold text-amber-300">
                      {Math.min(colorCollected2, levelConfig.secondaryTargetColorCount)}/
                      {levelConfig.secondaryTargetColorCount}
                    </span>
                  </div>
                )}

                {(levelConfig.iceCount > 0 || remainingIce > 0) && (
                  <div className="flex items-center gap-1.5 bg-[#0F172A]/45 px-2.5 py-1 rounded-lg border border-cyan-950/60">
                    <Snowflake className="w-4 h-4 text-sky-300" />
                    <span className="font-mono-num text-xs font-bold text-sky-200">
                      {remainingIce}
                    </span>
                  </div>
                )}

                {levelConfig.requireClearStones && (
                  <div className="flex items-center gap-1.5 bg-[#0F172A]/45 px-2.5 py-1 rounded-lg border border-cyan-950/60">
                    <Mountain className="w-4 h-4 text-amber-300" />
                    <span className="font-mono-num text-xs font-bold text-amber-200">
                      {remainingStones}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleHint}
                  disabled={isPaused || isBusy || hintsLeft <= 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] disabled:opacity-45 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Gợi ý</span>
                  <span className="font-mono-num text-slate-200">({hintsLeft})</span>
                </button>

                <button
                  type="button"
                  onClick={handleShuffle}
                  disabled={isPaused || isBusy || shufflesLeft <= 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] disabled:opacity-45 text-xs font-semibold text-[#FACC15] transition-colors cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Đảo bàn</span>
                  <span className="font-mono-num text-slate-200">({shufflesLeft})</span>
                </button>

                <button
                  type="button"
                  onClick={onTogglePause}
                  aria-label={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                  className="p-2 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer shrink-0"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={onReplay}
                  title="Chơi lại màn này"
                  aria-label="Chơi lại"
                  className="p-2 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onToggleBgm}
                  title={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
                  aria-label={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    bgmEnabled && soundEnabled
                      ? 'border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-[#FACC15]'
                      : 'border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-slate-400'
                  }`}
                >
                  <Music className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onToggleSound}
                  title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                  aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                  className="p-2 rounded-lg border border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer shrink-0"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {fsSupported && (
                  <button
                    type="button"
                    onClick={onToggleFullscreen}
                    title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      !isFullscreen
                        ? 'border-yellow-300 bg-[#FACC15] hover:bg-yellow-300 text-slate-950'
                        : 'border-[#0F172A] bg-[#1E293B] hover:bg-[#334155] text-white'
                    }`}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="relative flex-1 min-h-0 flex items-center justify-center p-2 lg:p-3 overflow-hidden">
            <DiamondGameBoard
              grid={grid}
              selected={selected}
              hintMove={hintMove}
              invalidPair={invalidPair}
              activeSwap={activeSwap}
              bursts={bursts}
              floatingScores={floatingScores}
              isPaused={isPaused}
              isBusy={isBusy}
              isCompactLandscape={false}
              onAttemptSwap={handleAttemptSwap}
              onSelectPos={setSelected}
              onResume={onResume}
            />

            {toastMessage && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#0F172A]/95 border border-cyan-400/70 text-xs sm:text-sm font-semibold text-cyan-200 shadow-xl pointer-events-none whitespace-nowrap max-w-[92vw] truncate">
                {toastMessage}
              </div>
            )}
          </main>
        </div>
      )}

      {endOutcome && (
        <DiamondEndModal
          type={endOutcome}
          level={levelConfig.level}
          score={score}
          targetScore={levelConfig.targetScore}
          stars={earnedStars}
          movesLeft={movesLeft}
          isPreviewMode={isPreviewMode && levelConfig.level > highestUnlockedLevel}
          onReplay={onReplay}
          onNextLevel={() => onNextLevel(Math.min(DIAMOND_MAX_LEVEL, levelConfig.level + 1))}
          onLevelSelect={onExitToLevels}
        />
      )}
    </>
  );
};
