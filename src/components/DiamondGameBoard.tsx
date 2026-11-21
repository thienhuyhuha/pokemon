import React, { useLayoutEffect, useRef, useState } from 'react';
import { DiamondFloatingScore, DiamondGrid, GemBurstEffect } from '../types/diamond';
import { GridPos } from '../types/game';
import { DiamondArtwork } from './DiamondArtwork';

interface DiamondGameBoardProps {
  grid: DiamondGrid;
  selected: GridPos | null;
  hintMove: { a: GridPos; b: GridPos } | null;
  invalidPair: [GridPos, GridPos] | null;
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

export const DiamondGameBoard: React.FC<DiamondGameBoardProps> = ({
  grid,
  selected,
  hintMove,
  invalidPair,
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

  const dragOriginRef = useRef<{
    pos: GridPos;
    pointerId: number;
    startX: number;
    startY: number;
    swiped: boolean;
  } | null>(null);

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

  const rows = grid.length || 7;
  const cols = rows > 0 && grid[0] ? grid[0].length : 7;

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

    if (absX < threshold && absY < threshold) return;

    drag.swiped = true;
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
    e: React.PointerEvent<HTMLButtonElement>,
    r: number,
    c: number
  ) => {
    const drag = dragOriginRef.current;
    dragOriginRef.current = null;
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
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none touch-none"
    >
      {/* Velvet Navy & Crystal Frame */}
      <div
        style={{ width: `${boardW}px`, height: `${boardH}px` }}
        className={`relative shrink-0 bg-[#0B1120] border-2 border-cyan-500/55 shadow-[0_14px_45px_rgba(0,0,0,0.8)] overflow-hidden ${
          isCompactLandscape ? 'rounded-xl p-1' : 'rounded-2xl p-2'
        }`}
      >
        <div className="relative w-full h-full rounded-lg bg-[#0F172A] overflow-hidden">
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
                const movable = !cell.stone && cell.ice === 0;

                return (
                  <div
                    key={cell.id}
                    style={{
                      width: `${cellWidthPct}%`,
                      height: `${cellHeightPct}%`,
                      transform: `translate3d(${c * 100}%, ${r * 100}%, 0)`,
                      transition: 'transform 170ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    className={`absolute top-0 left-0 p-[2px] ${isSelected ? 'z-20' : 'z-10'}`}
                  >
                    <button
                      type="button"
                      onPointerDown={(e) => handlePointerDown(e, r, c)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={(e) => handlePointerUp(e, r, c)}
                      onPointerCancel={() => {
                        dragOriginRef.current = null;
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
                        className="w-[86%] h-[86%] drop-shadow-[0_3px_4px_rgba(0,0,0,0.65)]"
                      />

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
