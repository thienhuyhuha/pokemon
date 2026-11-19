import React, { useLayoutEffect, useRef, useState } from 'react';
import { ActiveConnection, BoardGrid, FloatingScore, GridPos, TileCell } from '../types/game';
import { PokemonTile } from './PokemonTile';

interface GameBoardProps {
  board: BoardGrid;
  selected: GridPos | null;
  hintPair: { a: GridPos; b: GridPos } | null;
  activeConnection: ActiveConnection | null;
  invalidPair: [GridPos, GridPos] | null;
  floatingScores: FloatingScore[];
  isPaused: boolean;
  isCompactLandscape?: boolean;
  mobileZoomed?: boolean;
  onSelectTile: (r: number, c: number) => void;
  onResume: () => void;
}

const STADIUM_BG = '/src/assets/images/mon_stadium_turf_1795064520201.jpg';
const PERIMETER_PAD = 0.22;

function toSvgCoord(pos: GridPos, rows: number, cols: number): { x: number; y: number } {
  let x = pos.c + PERIMETER_PAD + 0.5;
  if (pos.c < 0) x = PERIMETER_PAD * 0.45;
  else if (pos.c >= cols) x = cols + PERIMETER_PAD * 1.55;

  let y = pos.r + PERIMETER_PAD + 0.5;
  if (pos.r < 0) y = PERIMETER_PAD * 0.45;
  else if (pos.r >= rows) y = rows + PERIMETER_PAD * 1.55;

  return { x, y };
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selected,
  hintPair,
  activeConnection,
  invalidPair,
  floatingScores,
  isPaused,
  isCompactLandscape = false,
  mobileZoomed = false,
  onSelectTile,
  onResume,
}) => {
  const [stadiumErr, setStadiumErr] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 960,
    height: 480,
  });

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

  const rows = board.length || 10;
  const cols = rows > 0 && board[0] ? board[0].length : 16;

  // Compact perimeter channel keeps outside connection beams clear while maximizing tile size
  const outerW = cols + PERIMETER_PAD * 2;
  const outerH = rows + PERIMETER_PAD * 2;
  const isDense = cols >= 22 || rows >= 14;

  const padX = isCompactLandscape ? 2 : 16;
  const padY = isCompactLandscape ? 2 : 12;
  const maxW = Math.max(180, containerSize.width - padX);
  const maxH = Math.max(120, containerSize.height - padY);

  const squareW = Math.min(maxW, (maxH * outerW) / outerH);
  const squareH = (squareW * outerH) / outerW;

  // On mobile landscape, gently allow up to 1.24x fill on the slack axis so the board fills edge-to-edge with zero top/bottom gaps
  const fitW = isCompactLandscape
    ? Math.floor(Math.min(maxW, squareW * 1.24))
    : Math.floor(squareW);
  const fitH = isCompactLandscape
    ? Math.floor(Math.min(maxH, squareH * 1.24))
    : Math.floor(squareH);

  const zoomFactor = isCompactLandscape && mobileZoomed ? 1.5 : 1;
  const boardW = Math.round(fitW * zoomFactor);
  const boardH = Math.round(fitH * zoomFactor);

  const pathPoints = activeConnection
    ? activeConnection.path
        .map((pt) => {
          const { x, y } = toSvgCoord(pt, rows, cols);
          return `${x},${y}`;
        })
        .join(' ')
    : '';

  const tilesList: { tile: TileCell; r: number; c: number }[] = [];
  if (!isPaused) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r]?.[c];
        if (cell) {
          tilesList.push({ tile: cell, r, c });
        }
      }
    }
  }

  const tileWidthPct = 100 / cols;
  const tileHeightPct = 100 / rows;
  const strokeScale = isDense ? 1.1 : 1;

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full flex ${
        isCompactLandscape && mobileZoomed
          ? 'overflow-auto items-start justify-start p-0.5'
          : 'items-center justify-center overflow-hidden'
      }`}
    >
      {/* Full-Fill Landscape Battle Arena Frame */}
      <div
        style={{ width: `${boardW}px`, height: `${boardH}px` }}
        className={`relative shrink-0 bg-[#111827] shadow-[0_14px_40px_rgba(0,0,0,0.75)] overflow-hidden ${
          isCompactLandscape
            ? 'rounded-lg p-[1px] border border-[#DC2626]'
            : 'rounded-2xl p-[3px] border-2 border-[#DC2626]'
        }`}
      >
        <div
          className={`relative w-full h-full bg-[#14532D] overflow-hidden ${
            isCompactLandscape ? 'rounded-[7px]' : 'rounded-[13px]'
          }`}
        >
          {!stadiumErr ? (
            <img
              src={STADIUM_BG}
              alt="Sân đấu thú cưng"
              referrerPolicy="no-referrer"
              onError={() => setStadiumErr(true)}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-85"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#14532D] via-[#166534] to-[#0F3D22]" />
          )}

          {/* Balanced scrim so tiles stay super crisp over the grass turf */}
          <div className="absolute inset-0 bg-[#062112]/35 pointer-events-none" />

          {/* Dynamic Inner Playfield Container */}
          <div
            style={{
              left: `${(PERIMETER_PAD / outerW) * 100}%`,
              top: `${(PERIMETER_PAD / outerH) * 100}%`,
              width: `${(cols / outerW) * 100}%`,
              height: `${(rows / outerH) * 100}%`,
            }}
            className="absolute"
          >
            {tilesList.map(({ tile, r, c }) => {
              const isSelected = selected?.r === r && selected?.c === c;
              const isHinted =
                (hintPair?.a.r === r && hintPair?.a.c === c) ||
                (hintPair?.b.r === r && hintPair?.b.c === c);
              const isMatching =
                (activeConnection?.a.r === r && activeConnection?.a.c === c) ||
                (activeConnection?.b.r === r && activeConnection?.b.c === c);
              const isInvalid =
                (invalidPair?.[0].r === r && invalidPair?.[0].c === c) ||
                (invalidPair?.[1].r === r && invalidPair?.[1].c === c);

              return (
                <div
                  key={tile.id}
                  style={{
                    width: `${tileWidthPct}%`,
                    height: `${tileHeightPct}%`,
                    transform: `translate3d(${c * 100}%, ${r * 100}%, 0)`,
                    transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className={`absolute top-0 left-0 ${isSelected || isMatching ? 'z-20' : 'z-10'}`}
                >
                  <PokemonTile
                    tile={tile}
                    r={r}
                    c={c}
                    dense={isDense}
                    isSelected={isSelected}
                    isHinted={isHinted}
                    isMatching={isMatching}
                    isInvalid={isInvalid}
                    onSelect={onSelectTile}
                  />
                </div>
              );
            })}
          </div>

          {/* SVG Electric Connection Beam Overlay */}
          {activeConnection && !isPaused && (
            <svg
              viewBox={`0 0 ${outerW} ${outerH}`}
              className="absolute inset-0 w-full h-full pointer-events-none z-30"
              preserveAspectRatio="none"
            >
              <polyline
                points={pathPoints}
                fill="none"
                stroke="rgba(250, 204, 21, 0.5)"
                strokeWidth={0.34 * strokeScale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={pathPoints}
                fill="none"
                stroke="#FACC15"
                strokeWidth={0.14 * strokeScale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {activeConnection.path.map((pt, i) => {
                const { x, y } = toSvgCoord(pt, rows, cols);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={(i === 0 || i === activeConnection.path.length - 1 ? 0.22 : 0.12) * strokeScale}
                    fill="#FEF08A"
                    stroke="#DC2626"
                    strokeWidth={0.05 * strokeScale}
                  />
                );
              })}
            </svg>
          )}

          {/* Floating Score Popups */}
          {!isPaused &&
            floatingScores.map((fs) => {
              const leftPct = ((fs.c + PERIMETER_PAD + 0.5) / outerW) * 100;
              const topPct = ((fs.r + PERIMETER_PAD + 0.5) / outerH) * 100;
              return (
                <div
                  key={fs.id}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  className="absolute z-40 pointer-events-none animate-float-score font-mono-num text-xs sm:text-sm font-bold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] whitespace-nowrap"
                >
                  {fs.text}
                  {fs.combo > 1 ? ` x${fs.combo}` : ''}
                </div>
              );
            })}

          {/* Pause Veil Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center">
              <h2 className="font-display text-xl sm:text-3xl font-bold text-white tracking-tight">
                Trò chơi đang tạm dừng
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
                Đồng hồ đếm ngược đã tạm dừng. Nhấn tiếp tục khi bạn sẵn sàng quay lại sân đấu.
              </p>
              <button
                type="button"
                onClick={onResume}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer shadow-[0_3px_0_#CA8A04]"
              >
                Tiếp tục đấu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
