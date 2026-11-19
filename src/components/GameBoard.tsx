import React, { useState } from 'react';
import { useViewportMode } from '../hooks/useViewportMode';
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
  mobileZoomed?: boolean;
  onSelectTile: (r: number, c: number) => void;
  onResume: () => void;
}

const STADIUM_BG = '/src/assets/images/mon_stadium_turf_1795064520201.jpg';

function toSvgCoord(
  pos: GridPos,
  rows: number,
  cols: number,
  transposed: boolean
): { x: number; y: number } {
  const vr = transposed ? pos.c : pos.r;
  const vc = transposed ? pos.r : pos.c;
  const vRows = transposed ? cols : rows;
  const vCols = transposed ? rows : cols;

  let x = vc + 1;
  if (vc < 0) x = 0.25;
  else if (vc >= vCols) x = vCols + 0.75;

  let y = vr + 1;
  if (vr < 0) y = 0.25;
  else if (vr >= vRows) y = vRows + 0.75;

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
  mobileZoomed = false,
  onSelectTile,
  onResume,
}) => {
  const [stadiumErr, setStadiumErr] = useState(false);
  const { isMobile, isPortraitMobile } = useViewportMode();

  const rows = board.length || 10;
  const cols = rows > 0 && board[0] ? board[0].length : 20;

  // On portrait phones, transpose visual layout (cols x rows -> rows x cols)
  // so 20x10 becomes 10x20 and fills the vertical mobile screen cleanly!
  const transposed = isPortraitMobile;
  const visualRows = transposed ? cols : rows;
  const visualCols = transposed ? rows : cols;

  const outerW = visualCols + 1;
  const outerH = visualRows + 1;
  const isDense = cols >= 26 || rows >= 14;

  const pathPoints = activeConnection
    ? activeConnection.path
        .map((pt) => {
          const { x, y } = toSvgCoord(pt, rows, cols, transposed);
          return `${x},${y}`;
        })
        .join(' ')
    : '';

  const tilesList: { tile: TileCell; r: number; c: number; vr: number; vc: number }[] = [];
  if (!isPaused) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r]?.[c];
        if (cell) {
          tilesList.push({
            tile: cell,
            r,
            c,
            vr: transposed ? c : r,
            vc: transposed ? r : c,
          });
        }
      }
    }
  }

  const tileWidthPct = 100 / visualCols;
  const tileHeightPct = 100 / visualRows;
  const strokeScale = isDense ? 1.15 : 1;

  // Responsive sizing: full-fit viewport math tailored for mobile vs desktop web
  const baseWidthExpr = isMobile
    ? `min(calc(100vw - 12px), calc((100dvh - 118px) * ${outerW} / ${outerH}))`
    : `min(calc(100vw - 24px), calc((100dvh - 122px) * ${outerW} / ${outerH}))`;

  const boardStyle: React.CSSProperties =
    isMobile && mobileZoomed
      ? {
          width: `max(calc((100vw - 12px) * 1.55), calc(${baseWidthExpr} * 1.55))`,
          aspectRatio: `${outerW} / ${outerH}`,
        }
      : {
          width: baseWidthExpr,
          aspectRatio: `${outerW} / ${outerH}`,
        };

  return (
    <div
      className={`relative w-full h-full flex ${
        isMobile && mobileZoomed
          ? 'overflow-auto items-start justify-start p-1'
          : 'items-center justify-center overflow-hidden'
      }`}
    >
      {/* Battle Arena Frame */}
      <div
        style={boardStyle}
        className="relative shrink-0 rounded-xl sm:rounded-2xl bg-[#111827] p-[2px] sm:p-[3px] shadow-[0_20px_55px_rgba(0,0,0,0.75)] border-2 border-[#DC2626] overflow-hidden"
      >
        <div className="relative w-full h-full rounded-[10px] sm:rounded-[13px] bg-[#14532D] overflow-hidden">
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
              left: `${(0.5 / outerW) * 100}%`,
              top: `${(0.5 / outerH) * 100}%`,
              width: `${(visualCols / outerW) * 100}%`,
              height: `${(visualRows / outerH) * 100}%`,
            }}
            className="absolute"
          >
            {tilesList.map(({ tile, r, c, vr, vc }) => {
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
                    transform: `translate3d(${vc * 100}%, ${vr * 100}%, 0)`,
                    transition: 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
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
                strokeWidth={0.38 * strokeScale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={pathPoints}
                fill="none"
                stroke="#FACC15"
                strokeWidth={0.16 * strokeScale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {activeConnection.path.map((pt, i) => {
                const { x, y } = toSvgCoord(pt, rows, cols, transposed);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={(i === 0 || i === activeConnection.path.length - 1 ? 0.24 : 0.13) * strokeScale}
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
              const vr = transposed ? fs.c : fs.r;
              const vc = transposed ? fs.r : fs.c;
              const leftPct = ((vc + 1) / outerW) * 100;
              const topPct = ((vr + 1) / outerH) * 100;
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
            <div className="absolute inset-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Trò chơi đang tạm dừng
              </h2>
              <p className="text-sm text-slate-300 max-w-sm">
                Đồng hồ đếm ngược đã tạm dừng. Nhấn tiếp tục khi bạn sẵn sàng quay lại sân đấu.
              </p>
              <button
                type="button"
                onClick={onResume}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer shadow-[0_3px_0_#CA8A04]"
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
