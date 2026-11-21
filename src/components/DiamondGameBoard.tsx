import React, { useLayoutEffect, useRef, useState } from 'react';
import { DIAMOND_ARENA_BG_URL } from '../data/pokemonSprites';
import { DiamondFloatingScore, DiamondGrid, GemBurstEffect } from '../types/diamond';
import { GridPos } from '../types/game';
import { DiamondArtwork } from './DiamondArtwork';

export interface ActiveSwapVisual {
  a: GridPos;
  b: GridPos;
  invalid?: boolean;
}

interface DiamondGameBoardProps {
  grid: DiamondGrid;
  selected: GridPos | null;
  hintMove: { a: GridPos; b: GridPos } | null;
  invalidPair: [GridPos, GridPos] | null;
  activeSwap: ActiveSwapVisual | null;
  bursts: GemBurstEffect[];
  floatingScores: DiamondFloatingScore[];
  isPaused: boolean;
  isBusy: boolean;
  isCompactLandscape?: boolean;
  isStageRotated90?: boolean;
  onAttemptSwap: (a: GridPos, b: GridPos) => void;
  onSelectPos: (pos: GridPos | null) => void;
  onResume: () => void;
}

interface CellMotionMeta {
  durationMs: number;
  easing: string;
}

export const DiamondGameBoard: React.FC<DiamondGameBoardProps> = ({
  grid,
  selected,
  hintMove,
  invalidPair,
  activeSwap,
  bursts,
  floatingScores,
  isPaused,
  isBusy,
  isCompactLandscape = false,
  isStageRotated90 = false,
  onAttemptSwap,
  onSelectPos,
  onResume,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 640,
    height: 480,
  });

  const [dragNudge, setDragNudge] = useState<{
    pos: GridPos;
    dx: number;
    dy: number;
  } | null>(null);

  const dragOriginRef = useRef<{
    pos: GridPos;
    pointerId: number;
    startX: number;
    startY: number;
    swiped: boolean;
  } | null>(null);

  // Track cell DOM elements & previous board coordinates for authentic drop-in & landing bounce physics
  const outerCellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const innerCellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevPositionsRef = useRef<Map<string, GridPos>>(new Map());

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        setContainerSize((prev) =>
          prev.width === w && prev.height === h ? prev : { width: w, height: h }
        );
      }
    };

    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Compute movement timing per cell before render, and trigger drop-in + bounce animations synchronously in useLayoutEffect
  const prevPositions = prevPositionsRef.current;
  const currentPositions = new Map<string, GridPos>();
  let sharedCount = 0;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (!cell) continue;
      currentPositions.set(cell.id, { r, c });
      if (prevPositions.has(cell.id)) sharedCount++;
    }
  }

  const isIncrementalUpdate = prevPositions.size > 0 && sharedCount > 0;
  const rows = grid.length || 7;
  const cols = rows > 0 && grid[0] ? grid[0].length : 7;

  // Group newly refilled cells per column so stacked top gems fall uniformly from above the board
  const newRefillsByCol: Map<number, number> = new Map();
  if (isIncrementalUpdate) {
    for (let c = 0; c < cols; c++) {
      let count = 0;
      for (let r = 0; r < rows; r++) {
        const cell = grid[r]?.[c];
        if (cell && !cell.stone && cell.special === 'NONE' && !prevPositions.has(cell.id)) {
          count++;
        }
      }
      if (count > 0) newRefillsByCol.set(c, count);
    }
  }

  const motionById = new Map<string, CellMotionMeta>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r]?.[c];
      if (!cell) continue;
      const prev = prevPositions.get(cell.id);
      if (prev && isIncrementalUpdate) {
        const dr = r - prev.r;
        const dc = c - prev.c;
        if (dr > 0 && dc === 0) {
          // Gravity drop: duration scales naturally with sqrt(distance) + acceleration curve
          motionById.set(cell.id, {
            durationMs: Math.min(265, 115 + Math.round(Math.sqrt(dr) * 65)),
            easing: 'cubic-bezier(0.36, 0.04, 0.25, 1)',
          });
        } else if (Math.abs(dr) + Math.abs(dc) === 1) {
          // Adjacent swap slide
          motionById.set(cell.id, {
            durationMs: 145,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          });
        } else if (dr !== 0 || dc !== 0) {
          // Board shuffle glide
          motionById.set(cell.id, {
            durationMs: 220,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          });
        }
      }
    }
  }

  useLayoutEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion && isIncrementalUpdate) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r]?.[c];
          if (!cell) continue;

          const outerEl = outerCellRefs.current.get(cell.id);
          const innerEl = innerCellRefs.current.get(cell.id);
          const prev = prevPositions.get(cell.id);

          if (!prev) {
            if (!cell.stone && cell.special === 'NONE') {
              // Newly refilled gem: animate falling in smoothly from above the top edge
              const dropRows = Math.max(1, newRefillsByCol.get(c) ?? 1);
              const startR = r - dropRows;
              const dropDur = Math.min(285, 125 + Math.round(Math.sqrt(dropRows) * 65));

              if (outerEl && typeof outerEl.animate === 'function') {
                outerEl.animate(
                  [
                    { transform: `translate3d(${c * 100}%, ${startR * 100}%, 0)` },
                    { transform: `translate3d(${c * 100}%, ${r * 100}%, 0)` },
                  ],
                  {
                    duration: dropDur,
                    easing: 'cubic-bezier(0.36, 0.04, 0.25, 1)',
                  }
                );
              }

              if (innerEl && typeof innerEl.animate === 'function') {
                innerEl.animate(
                  [
                    { transform: 'translateY(0) scale(1, 1)' },
                    { transform: 'translateY(2px) scale(1.07, 0.91)', offset: 0.45 },
                    { transform: 'translateY(-1px) scale(0.98, 1.03)', offset: 0.78 },
                    { transform: 'translateY(0) scale(1, 1)' },
                  ],
                  {
                    delay: Math.max(0, dropDur - 25),
                    duration: 185,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  }
                );
              }
            } else if (!cell.stone && cell.special !== 'NONE') {
              // Newly forged Special crystal (Line / Bomb / Prism) pops dynamically in place
              if (innerEl && typeof innerEl.animate === 'function') {
                innerEl.animate(
                  [
                    { transform: 'scale(0.55)' },
                    { transform: 'scale(1.18)', offset: 0.58 },
                    { transform: 'scale(1)' },
                  ],
                  {
                    duration: 210,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  }
                );
              }
            }
          } else {
            const dr = r - prev.r;
            const dc = c - prev.c;
            if (dr > 0 && dc === 0 && innerEl && typeof innerEl.animate === 'function') {
              // Existing gem fell downward: play subtle squash-and-settle on landing
              const fallDur = Math.min(265, 115 + Math.round(Math.sqrt(dr) * 65));
              innerEl.animate(
                [
                  { transform: 'translateY(0) scale(1, 1)' },
                  { transform: 'translateY(2px) scale(1.07, 0.91)', offset: 0.45 },
                  { transform: 'translateY(-1px) scale(0.98, 1.03)', offset: 0.78 },
                  { transform: 'translateY(0) scale(1, 1)' },
                ],
                {
                  delay: Math.max(0, fallDur - 25),
                  duration: 185,
                  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }
              );
            }
          }
        }
      }
    }

    prevPositionsRef.current = currentPositions;
  });

  const pad = isCompactLandscape ? 6 : 20;
  const maxW = Math.max(180, containerSize.width - pad);
  const maxH = Math.max(180, containerSize.height - pad);
  const boardSide = Math.floor(Math.min(maxW, (maxH * cols) / rows));
  const boardW = boardSide;
  const boardH = Math.floor((boardSide * rows) / cols);

  const cellWidthPct = 100 / cols;
  const cellHeightPct = 100 / rows;

  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    r: number,
    c: number
  ) => {
    if (isPaused || isBusy) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const cell = grid[r]?.[c];
    if (!cell || cell.stone || cell.ice > 0) return;

    dragOriginRef.current = {
      pos: { r, c },
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      swiped: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragOriginRef.current;
    if (!drag || drag.swiped || drag.pointerId !== e.pointerId) return;

    const rawDx = e.clientX - drag.startX;
    const rawDy = e.clientY - drag.startY;
    // When stage container is CSS rotate(90deg), local +X maps to +Y viewport and local +Y maps to -X viewport
    const dx = isStageRotated90 ? rawDy : rawDx;
    const dy = isStageRotated90 ? -rawDx : rawDy;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 18;

    if (absX < threshold && absY < threshold) {
      // Subtle tactile finger-follow nudge along dominant axis before swap snaps
      if (absX >= 3 || absY >= 3) {
        const clampedX = absX >= absY ? Math.max(-7, Math.min(7, dx * 0.45)) : 0;
        const clampedY = absY > absX ? Math.max(-7, Math.min(7, dy * 0.45)) : 0;
        setDragNudge({ pos: drag.pos, dx: clampedX, dy: clampedY });
      }
      return;
    }

    drag.swiped = true;
    setDragNudge(null);
    let targetR = drag.pos.r;
    let targetC = drag.pos.c;
    if (absX >= absY) {
      targetC += dx > 0 ? 1 : -1;
    } else {
      targetR += dy > 0 ? 1 : -1;
    }

    if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < cols) {
      onSelectPos(null);
      onAttemptSwap(drag.pos, { r: targetR, c: targetC });
    }
    dragOriginRef.current = null;
  };

  const handlePointerUp = (
    _e: React.PointerEvent<HTMLButtonElement>,
    r: number,
    c: number
  ) => {
    const drag = dragOriginRef.current;
    dragOriginRef.current = null;
    setDragNudge(null);
    if (isPaused || isBusy) return;
    if (drag && drag.swiped) return;

    const cell = grid[r]?.[c];
    if (!cell || cell.stone || cell.ice > 0) {
      onSelectPos(null);
      return;
    }

    if (!selected) {
      onSelectPos({ r, c });
      return;
    }

    if (selected.r === r && selected.c === c) {
      onSelectPos(null);
      return;
    }

    if (Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1) {
      const from = selected;
      onSelectPos(null);
      onAttemptSwap(from, { r, c });
      return;
    }

    onSelectPos({ r, c });
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        backgroundImage: `linear-gradient(rgba(11,17,32,0.52), rgba(11,17,32,0.65)), url("${DIAMOND_ARENA_BG_URL}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none touch-none bg-[#0B1120]"
    >
      {/* Velvet Navy & Royal Crystal Frame */}
      <div
        style={{ width: `${boardW}px`, height: `${boardH}px` }}
        className={`relative shrink-0 bg-[#0B1120]/95 border-2 border-cyan-400/60 shadow-[0_18px_50px_rgba(0,0,0,0.88)] overflow-hidden ${
          isCompactLandscape ? 'rounded-xl p-1' : 'rounded-2xl p-2'
        }`}
      >
        <div className="relative w-full h-full rounded-lg bg-[#0F172A]/95 overflow-hidden">
          {/* Subtle Checkerboard Cell Backdrop */}
          <div
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
            className="absolute inset-0 grid pointer-events-none"
          >
            {Array.from({ length: rows * cols }).map((_, idx) => {
              const r = Math.floor(idx / cols);
              const c = idx % cols;
              const isAlt = (r + c) % 2 === 1;
              return (
                <div
                  key={idx}
                  className={isAlt ? 'bg-slate-800/45' : 'bg-slate-900/55'}
                />
              );
            })}
          </div>

          {/* Active Interactive Gems Layer */}
          {!isPaused &&
            grid.map((row, r) =>
              row.map((cell, c) => {
                if (!cell) return null;
                const isSelected = selected?.r === r && selected?.c === c;
                const isHinted =
                  (hintMove?.a.r === r && hintMove?.a.c === c) ||
                  (hintMove?.b.r === r && hintMove?.b.c === c);
                const isInvalid =
                  (invalidPair?.[0].r === r && invalidPair?.[0].c === c) ||
                  (invalidPair?.[1].r === r && invalidPair?.[1].c === c);
                const isSwapLead =
                  activeSwap?.a.r === r && activeSwap?.a.c === c;
                const isSwapPartner =
                  activeSwap?.b.r === r && activeSwap?.b.c === c;
                const isNudged =
                  dragNudge?.pos.r === r && dragNudge?.pos.c === c;

                const movable = !cell.stone && cell.ice === 0;
                const motion = motionById.get(cell.id);
                const transitionStr = motion
                  ? `transform ${motion.durationMs}ms ${motion.easing}`
                  : 'transform 150ms cubic-bezier(0.22, 1, 0.36, 1)';

                const nudgeTransform = isNudged
                  ? `translate3d(${dragNudge.dx}px, ${dragNudge.dy}px, 0) scale(1.09)`
                  : isSwapLead
                    ? 'scale(1.11)'
                    : isSwapPartner
                      ? 'scale(0.95)'
                      : undefined;

                return (
                  <div
                    key={cell.id}
                    ref={(node) => {
                      if (node) outerCellRefs.current.set(cell.id, node);
                      else outerCellRefs.current.delete(cell.id);
                    }}
                    style={{
                      width: `${cellWidthPct}%`,
                      height: `${cellHeightPct}%`,
                      transform: `translate3d(${c * 100}%, ${r * 100}%, 0)`,
                      transition: transitionStr,
                      willChange: 'transform',
                    }}
                    className={`absolute top-0 left-0 p-[2px] ${
                      isSwapLead || isNudged
                        ? 'z-30'
                        : isSelected || isSwapPartner
                          ? 'z-20'
                          : 'z-10'
                    }`}
                  >
                    <div
                      ref={(node) => {
                        if (node) innerCellRefs.current.set(cell.id, node);
                        else innerCellRefs.current.delete(cell.id);
                      }}
                      style={
                        nudgeTransform
                          ? {
                              transform: nudgeTransform,
                              transition: isNudged
                                ? 'none'
                                : 'transform 140ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }
                          : {
                              transition: 'transform 140ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }
                      }
                      className="w-full h-full"
                    >
                      <button
                        type="button"
                        onPointerDown={(e) => handlePointerDown(e, r, c)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={(e) => handlePointerUp(e, r, c)}
                        onPointerCancel={() => {
                          dragOriginRef.current = null;
                          setDragNudge(null);
                        }}
                        aria-label={
                          cell.stone
                            ? `Đá chắn - Hàng ${r + 1} Cột ${c + 1}`
                            : `Kim cương hàng ${r + 1} cột ${c + 1}${cell.ice > 0 ? ` (Băng lớp ${cell.ice})` : ''}`
                        }
                        className={[
                          'relative w-full h-full rounded-lg flex items-center justify-center transition-transform duration-150 focus:outline-none',
                          movable ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed',
                          isSelected
                            ? 'bg-cyan-400/20 ring-2 ring-[#FACC15] scale-105 shadow-[0_0_16px_rgba(250,204,21,0.55)]'
                            : 'hover:bg-slate-700/30',
                          isHinted && !isSelected
                            ? 'ring-2 ring-emerald-400 bg-emerald-400/15 animate-pulse'
                            : '',
                          isInvalid ? 'animate-shake-invalid ring-2 ring-rose-500' : '',
                        ].join(' ')}
                      >
                        <DiamondArtwork
                          color={cell.color}
                          special={cell.special}
                          stone={cell.stone}
                          stoneHp={cell.stoneHp}
                          className="w-[88%] h-[88%] drop-shadow-[0_4px_6px_rgba(0,0,0,0.75)]"
                        />

                        {cell.stone && cell.stoneHp >= 2 && (
                          <span className="absolute top-0.5 right-0.5 text-[9px] font-mono-num font-extrabold text-amber-950 bg-amber-300/95 px-1 rounded shadow">
                            x2
                          </span>
                        )}

                        {cell.ice > 0 && (
                          <div
                            className={`absolute inset-0 rounded-lg pointer-events-none border-2 ${
                              cell.ice >= 2
                                ? 'bg-sky-200/40 border-sky-200 shadow-[inset_0_0_10px_rgba(255,255,255,0.65)]'
                                : 'bg-sky-300/25 border-sky-300/80 shadow-[inset_0_0_6px_rgba(186,230,253,0.5)]'
                            }`}
                          >
                            {cell.ice >= 2 && (
                              <span className="absolute top-0.5 right-1 text-[9px] font-mono-num font-extrabold text-sky-950 bg-sky-200/90 px-1 rounded">
                                x2
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

          {/* Crystal Shatter Bursts */}
          {!isPaused &&
            bursts.map((burst) => (
              <div
                key={burst.id}
                style={{
                  width: `${cellWidthPct}%`,
                  height: `${cellHeightPct}%`,
                  transform: `translate3d(${burst.c * 100}%, ${burst.r * 100}%, 0)`,
                }}
                className="absolute top-0 left-0 z-30 pointer-events-none flex items-center justify-center"
              >
                <div className="w-[85%] h-[85%] animate-pop-match flex items-center justify-center">
                  <DiamondArtwork
                    color={burst.color}
                    special={burst.special}
                    className="w-full h-full brightness-125"
                  />
                </div>
              </div>
            ))}

          {/* Floating Score Popups */}
          {!isPaused &&
            floatingScores.map((fs) => {
              const leftPct = ((fs.c + 0.5) / cols) * 100;
              const topPct = ((fs.r + 0.5) / rows) * 100;
              return (
                <div
                  key={fs.id}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  className="absolute z-40 pointer-events-none animate-float-score font-mono-num text-xs sm:text-sm font-extrabold text-cyan-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] whitespace-nowrap"
                >
                  {fs.text}
                  {fs.combo > 1 ? ` x${fs.combo}` : ''}
                </div>
              );
            })}

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center">
              <h2 className="font-display text-xl sm:text-3xl font-bold text-white">
                Đang tạm dừng
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xs">
                Nhấn tiếp tục để tiếp tục ghép kim cương.
              </p>
              <button
                type="button"
                onClick={onResume}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer shadow-[0_3px_0_#0E7490]"
              >
                Tiếp tục chơi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
