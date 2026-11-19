import {
  BoardGrid,
  GravityMode,
  GridPos,
  LevelConfig,
  ShiftDirection,
  TileCell,
} from '../types/game';

function getDims(board: BoardGrid): { rows: number; cols: number } {
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;
  return { rows, cols };
}

function isOutside(r: number, c: number, rows: number, cols: number): boolean {
  return r < 0 || r >= rows || c < 0 || c >= cols;
}

function isEmptyCell(board: BoardGrid, r: number, c: number): boolean {
  const { rows, cols } = getDims(board);
  if (isOutside(r, c, rows, cols)) return true;
  return board[r][c] === null;
}

function isClearLine(
  board: BoardGrid,
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean {
  if (r1 === r2) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC + 1; c < maxC; c++) {
      if (!isEmptyCell(board, r1, c)) return false;
    }
    return true;
  }
  if (c1 === c2) {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR + 1; r < maxR; r++) {
      if (!isEmptyCell(board, r, c1)) return false;
    }
    return true;
  }
  return false;
}

function pathManhattanLength(pts: GridPos[]): number {
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    len += Math.abs(pts[i].r - pts[i + 1].r) + Math.abs(pts[i].c - pts[i + 1].c);
  }
  return len;
}

/**
 * Finds the shortest valid Onet/Pikachu connection path (0, 1, or 2 turns)
 * between two positions on any dynamically sized board (20x10 up to 40x20).
 */
export function findConnectionPath(
  board: BoardGrid,
  a: GridPos,
  b: GridPos
): GridPos[] | null {
  const { rows, cols } = getDims(board);
  if (a.r === b.r && a.c === b.c) return null;
  if (isOutside(a.r, a.c, rows, cols) || isOutside(b.r, b.c, rows, cols)) return null;

  const tileA = board[a.r][a.c];
  const tileB = board[b.r][b.c];
  if (!tileA || !tileB) return null;
  if (tileA.frozen || tileB.frozen) return null;
  if (tileA.speciesId !== tileB.speciesId) return null;

  // 0 turns (straight line)
  if ((a.r === b.r || a.c === b.c) && isClearLine(board, a.r, a.c, b.r, b.c)) {
    return [a, b];
  }

  // 1 turn (L-shape)
  const corners: GridPos[] = [
    { r: a.r, c: b.c },
    { r: b.r, c: a.c },
  ];
  for (const corner of corners) {
    if (
      isEmptyCell(board, corner.r, corner.c) &&
      isClearLine(board, a.r, a.c, corner.r, corner.c) &&
      isClearLine(board, corner.r, corner.c, b.r, b.c)
    ) {
      return [a, corner, b];
    }
  }

  // 2 turns (U-shape or Z-shape)
  let bestTwoTurn: GridPos[] | null = null;
  let bestLen = Infinity;

  for (let r = -1; r <= rows; r++) {
    if (r === a.r || r === b.r) continue;
    if (
      isEmptyCell(board, r, a.c) &&
      isEmptyCell(board, r, b.c) &&
      isClearLine(board, a.r, a.c, r, a.c) &&
      isClearLine(board, r, a.c, r, b.c) &&
      isClearLine(board, r, b.c, b.r, b.c)
    ) {
      const candidate = [a, { r, c: a.c }, { r, c: b.c }, b];
      const len = pathManhattanLength(candidate);
      if (len < bestLen) {
        bestLen = len;
        bestTwoTurn = candidate;
      }
    }
  }

  for (let c = -1; c <= cols; c++) {
    if (c === a.c || c === b.c) continue;
    if (
      isEmptyCell(board, a.r, c) &&
      isEmptyCell(board, b.r, c) &&
      isClearLine(board, a.r, a.c, a.r, c) &&
      isClearLine(board, a.r, c, b.r, c) &&
      isClearLine(board, b.r, c, b.r, b.c)
    ) {
      const candidate = [a, { r: a.r, c }, { r: b.r, c }, b];
      const len = pathManhattanLength(candidate);
      if (len < bestLen) {
        bestLen = len;
        bestTwoTurn = candidate;
      }
    }
  }

  return bestTwoTurn;
}

export function findAnyValidPair(
  board: BoardGrid
): { a: GridPos; b: GridPos; path: GridPos[] } | null {
  const { rows, cols } = getDims(board);
  const bySpecies = new Map<number, GridPos[]>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = board[r][c];
      if (tile && !tile.frozen) {
        const list = bySpecies.get(tile.speciesId) ?? [];
        list.push({ r, c });
        bySpecies.set(tile.speciesId, list);
      }
    }
  }

  for (const positions of bySpecies.values()) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const path = findConnectionPath(board, positions[i], positions[j]);
        if (path) {
          return { a: positions[i], b: positions[j], path };
        }
      }
    }
  }

  return null;
}

export function countValidPairs(board: BoardGrid, maxStop = 3): number {
  const { rows, cols } = getDims(board);
  const bySpecies = new Map<number, GridPos[]>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = board[r][c];
      if (tile && !tile.frozen) {
        const list = bySpecies.get(tile.speciesId) ?? [];
        list.push({ r, c });
        bySpecies.set(tile.speciesId, list);
      }
    }
  }

  let count = 0;
  for (const positions of bySpecies.values()) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (findConnectionPath(board, positions[i], positions[j])) {
          count++;
          if (count >= maxStop) return count;
        }
      }
    }
  }
  return count;
}

export function countRemainingTiles(board: BoardGrid): number {
  const { rows, cols } = getDims(board);
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== null) count++;
    }
  }
  return count;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateBoard(config: LevelConfig): BoardGrid {
  const { rows, cols, pairsCount, speciesCount, frozenCount, level } = config;
  const allSpecies = shuffleArray(Array.from({ length: 45 }, (_, i) => i + 1));
  const selectedSpecies = allSpecies.slice(0, speciesCount);

  const speciesPool: number[] = [];
  for (let i = 0; i < pairsCount; i++) {
    const sp = selectedSpecies[i % selectedSpecies.length];
    speciesPool.push(sp, sp);
  }

  const totalTiles = rows * cols;
  const frozenFlags = new Array<boolean>(totalTiles).fill(false);
  const frozenToPlace = Math.min(frozenCount, Math.max(0, totalTiles - 60));

  for (let attempt = 0; attempt < 25; attempt++) {
    const shuffledSpecies = shuffleArray(speciesPool);
    const board: BoardGrid = Array.from({ length: rows }, () =>
      Array<TileCell | null>(cols).fill(null)
    );

    let idx = 0;
    const innerIndices: number[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r >= 1 && r <= rows - 2 && c >= 1 && c <= cols - 2) {
          innerIndices.push(idx);
        }
        idx++;
      }
    }

    frozenFlags.fill(false);
    if (frozenToPlace > 0) {
      const pickedFrozen = shuffleArray(innerIndices).slice(0, frozenToPlace);
      for (const fi of pickedFrozen) {
        frozenFlags[fi] = true;
      }
    }

    idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        board[r][c] = {
          id: `lv${level}-${r}-${c}-${Math.random().toString(36).slice(2, 7)}`,
          speciesId: shuffledSpecies[idx],
          frozen: frozenFlags[idx],
        };
        idx++;
      }
    }

    if (countValidPairs(board, 2) >= 2) {
      return board;
    }
  }

  const fallbackSpecies = shuffleArray(speciesPool);
  const board: BoardGrid = Array.from({ length: rows }, () =>
    Array<TileCell | null>(cols).fill(null)
  );
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      board[r][c] = {
        id: `lv${level}-${r}-${c}-${k}`,
        speciesId: fallbackSpecies[k],
        frozen: false,
      };
      k++;
    }
  }
  return shuffleBoard(board);
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function thawAdjacentFrozen(board: BoardGrid, a: GridPos, b: GridPos): BoardGrid {
  const { rows, cols } = getDims(board);
  const next = cloneBoard(board);
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const pos of [a, b]) {
    for (const [dr, dc] of dirs) {
      const nr = pos.r + dr;
      const nc = pos.c + dc;
      if (!isOutside(nr, nc, rows, cols)) {
        const cell = next[nr][nc];
        if (cell && cell.frozen) {
          cell.frozen = false;
        }
      }
    }
  }
  return next;
}

const DIRECTION_LABELS: Record<ShiftDirection, string> = {
  NONE: 'Đứng yên',
  LOCAL: 'Trượt vào khoảng trống',
  DOWN: '↓ Rơi xuống',
  UP: '↑ Đẩy lên',
  LEFT: '← Dạt trái',
  RIGHT: '→ Dạt phải',
  INWARD_H: '→← Ép ngang vào giữa',
  OUTWARD_H: '←→ Tách ngang ra mép',
  INWARD_V: '↓↑ Ép dọc vào tâm',
  OUTWARD_V: '↑↓ Tách dọc trên dưới',
};

export function getDirectionLabel(dir: ShiftDirection): string {
  return DIRECTION_LABELS[dir] ?? 'Trượt ngẫu nhiên';
}

function applySingleShift(board: BoardGrid, dir: ShiftDirection): BoardGrid {
  if (dir === 'NONE' || dir === 'LOCAL') return board;
  const { rows, cols } = getDims(board);

  const next: BoardGrid = Array.from({ length: rows }, () =>
    Array<TileCell | null>(cols).fill(null)
  );

  if (dir === 'DOWN') {
    for (let c = 0; c < cols; c++) {
      const colTiles: TileCell[] = [];
      for (let r = 0; r < rows; r++) {
        if (board[r][c]) colTiles.push(board[r][c]!);
      }
      let writeR = rows - 1;
      for (let i = colTiles.length - 1; i >= 0; i--) {
        next[writeR--][c] = colTiles[i];
      }
    }
    return next;
  }

  if (dir === 'UP') {
    for (let c = 0; c < cols; c++) {
      const colTiles: TileCell[] = [];
      for (let r = 0; r < rows; r++) {
        if (board[r][c]) colTiles.push(board[r][c]!);
      }
      for (let i = 0; i < colTiles.length; i++) {
        next[i][c] = colTiles[i];
      }
    }
    return next;
  }

  if (dir === 'LEFT') {
    for (let r = 0; r < rows; r++) {
      const rowTiles = board[r].filter((t): t is TileCell => t !== null);
      for (let i = 0; i < rowTiles.length; i++) {
        next[r][i] = rowTiles[i];
      }
    }
    return next;
  }

  if (dir === 'RIGHT') {
    for (let r = 0; r < rows; r++) {
      const rowTiles = board[r].filter((t): t is TileCell => t !== null);
      let writeC = cols - 1;
      for (let i = rowTiles.length - 1; i >= 0; i--) {
        next[r][writeC--] = rowTiles[i];
      }
    }
    return next;
  }

  if (dir === 'INWARD_H') {
    const mid = Math.floor(cols / 2);
    for (let r = 0; r < rows; r++) {
      const leftHalf: TileCell[] = [];
      const rightHalf: TileCell[] = [];
      for (let c = 0; c < mid; c++) {
        if (board[r][c]) leftHalf.push(board[r][c]!);
      }
      for (let c = mid; c < cols; c++) {
        if (board[r][c]) rightHalf.push(board[r][c]!);
      }
      let wl = mid - 1;
      for (let i = leftHalf.length - 1; i >= 0; i--) {
        next[r][wl--] = leftHalf[i];
      }
      let wr = mid;
      for (let i = 0; i < rightHalf.length; i++) {
        next[r][wr++] = rightHalf[i];
      }
    }
    return next;
  }

  if (dir === 'OUTWARD_H') {
    const mid = Math.floor(cols / 2);
    for (let r = 0; r < rows; r++) {
      const leftHalf: TileCell[] = [];
      const rightHalf: TileCell[] = [];
      for (let c = 0; c < mid; c++) {
        if (board[r][c]) leftHalf.push(board[r][c]!);
      }
      for (let c = mid; c < cols; c++) {
        if (board[r][c]) rightHalf.push(board[r][c]!);
      }
      for (let i = 0; i < leftHalf.length; i++) {
        next[r][i] = leftHalf[i];
      }
      let wr = cols - 1;
      for (let i = rightHalf.length - 1; i >= 0; i--) {
        next[r][wr--] = rightHalf[i];
      }
    }
    return next;
  }

  if (dir === 'INWARD_V') {
    const mid = Math.floor(rows / 2);
    for (let c = 0; c < cols; c++) {
      const topHalf: TileCell[] = [];
      const botHalf: TileCell[] = [];
      for (let r = 0; r < mid; r++) {
        if (board[r][c]) topHalf.push(board[r][c]!);
      }
      for (let r = mid; r < rows; r++) {
        if (board[r][c]) botHalf.push(board[r][c]!);
      }
      let wt = mid - 1;
      for (let i = topHalf.length - 1; i >= 0; i--) {
        next[wt--][c] = topHalf[i];
      }
      let wb = mid;
      for (let i = 0; i < botHalf.length; i++) {
        next[wb++][c] = botHalf[i];
      }
    }
    return next;
  }

  if (dir === 'OUTWARD_V') {
    const mid = Math.floor(rows / 2);
    for (let c = 0; c < cols; c++) {
      const topHalf: TileCell[] = [];
      const botHalf: TileCell[] = [];
      for (let r = 0; r < mid; r++) {
        if (board[r][c]) topHalf.push(board[r][c]!);
      }
      for (let r = mid; r < rows; r++) {
        if (board[r][c]) botHalf.push(board[r][c]!);
      }
      for (let i = 0; i < topHalf.length; i++) {
        next[i][c] = topHalf[i];
      }
      let wb = rows - 1;
      for (let i = botHalf.length - 1; i >= 0; i--) {
        next[wb--][c] = botHalf[i];
      }
    }
    return next;
  }

  return board;
}

function applyLocalGapSlide(board: BoardGrid, a: GridPos, b: GridPos): BoardGrid {
  const { rows, cols } = getDims(board);
  const next = cloneBoard(board);
  const gaps = shuffleArray([a, b]);

  for (const gap of gaps) {
    if (next[gap.r][gap.c] !== null) continue;
    const axis = Math.random() < 0.5 ? 'ROW' : 'COL';

    if (axis === 'ROW') {
      const fromLeft = Math.random() < 0.5;
      if (fromLeft) {
        for (let c = gap.c; c > 0; c--) {
          if (next[gap.r][c - 1] !== null) {
            next[gap.r][c] = next[gap.r][c - 1];
            next[gap.r][c - 1] = null;
          } else {
            break;
          }
        }
      } else {
        for (let c = gap.c; c < cols - 1; c++) {
          if (next[gap.r][c + 1] !== null) {
            next[gap.r][c] = next[gap.r][c + 1];
            next[gap.r][c + 1] = null;
          } else {
            break;
          }
        }
      }
    } else {
      const fromTop = Math.random() < 0.5;
      if (fromTop) {
        for (let r = gap.r; r > 0; r--) {
          if (next[r - 1][gap.c] !== null) {
            next[r][gap.c] = next[r - 1][gap.c];
            next[r - 1][gap.c] = null;
          } else {
            break;
          }
        }
      } else {
        for (let r = gap.r; r < rows - 1; r++) {
          if (next[r + 1][gap.c] !== null) {
            next[r][gap.c] = next[r + 1][gap.c];
            next[r + 1][gap.c] = null;
          } else {
            break;
          }
        }
      }
    }
  }

  return next;
}

export function applyGravity(
  board: BoardGrid,
  mode: GravityMode,
  matchNumber: number,
  clearedA?: GridPos,
  clearedB?: GridPos
): { board: BoardGrid; direction: ShiftDirection } {
  if (mode === 'RANDOM_LOCAL' && clearedA && clearedB) {
    return {
      board: applyLocalGapSlide(board, clearedA, clearedB),
      direction: 'LOCAL',
    };
  }

  let chosenDir: ShiftDirection = 'NONE';
  if (mode === 'RANDOM_4' || mode === 'RANDOM_LOCAL') {
    const dirs4: ShiftDirection[] = ['DOWN', 'UP', 'LEFT', 'RIGHT'];
    chosenDir = dirs4[Math.floor(Math.random() * dirs4.length)];
  } else if (mode === 'RANDOM_8') {
    const dirs8: ShiftDirection[] = [
      'DOWN',
      'UP',
      'LEFT',
      'RIGHT',
      'INWARD_H',
      'OUTWARD_H',
      'INWARD_V',
      'OUTWARD_V',
    ];
    chosenDir = dirs8[Math.floor(Math.random() * dirs8.length)];
  } else if (mode === 'ALTERNATING') {
    const cycle: ShiftDirection[] = ['DOWN', 'LEFT', 'UP', 'RIGHT'];
    chosenDir = cycle[matchNumber % 4];
  } else {
    chosenDir = mode as ShiftDirection;
  }

  return {
    board: applySingleShift(board, chosenDir),
    direction: chosenDir,
  };
}

export function shuffleBoard(board: BoardGrid): BoardGrid {
  const { rows, cols } = getDims(board);
  const occupiedPositions: GridPos[] = [];
  const tiles: TileCell[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell) {
        occupiedPositions.push({ r, c });
        tiles.push({ ...cell });
      }
    }
  }

  if (tiles.length === 0) return board;

  for (let attempt = 0; attempt < 50; attempt++) {
    const shuffled = shuffleArray(tiles);
    const next = cloneBoard(board);
    occupiedPositions.forEach((pos, idx) => {
      next[pos.r][pos.c] = shuffled[idx];
    });
    if (findAnyValidPair(next)) {
      return next;
    }
  }

  const thawedTiles = tiles.map((t) => ({ ...t, frozen: false }));
  for (let attempt = 0; attempt < 50; attempt++) {
    const shuffled = shuffleArray(thawedTiles);
    const next = cloneBoard(board);
    occupiedPositions.forEach((pos, idx) => {
      next[pos.r][pos.c] = shuffled[idx];
    });
    if (findAnyValidPair(next)) {
      return next;
    }
  }

  return board;
}

export function ensurePlayableBoard(board: BoardGrid): {
  board: BoardGrid;
  adjusted: boolean;
  reason: string | null;
} {
  const { rows, cols } = getDims(board);
  const remaining = countRemainingTiles(board);
  if (remaining === 0) {
    return { board, adjusted: false, reason: null };
  }

  if (findAnyValidPair(board)) {
    return { board, adjusted: false, reason: null };
  }

  const frozenCoords: GridPos[] = [];
  const occupiedCoords: GridPos[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell) {
        occupiedCoords.push({ r, c });
        if (cell.frozen) frozenCoords.push({ r, c });
      }
    }
  }

  // Stage 1: Thaw frozen tiles blocking paths
  if (frozenCoords.length > 0) {
    const thawedBoard = cloneBoard(board);
    for (const pos of shuffleArray(frozenCoords)) {
      thawedBoard[pos.r][pos.c]!.frozen = false;
      if (findAnyValidPair(thawedBoard)) {
        return {
          board: thawedBoard,
          adjusted: true,
          reason: 'Bộ lọc chống kẹt: Đã tự phá băng để các cặp có thể kết nối lại!',
        };
      }
    }
  }

  // Stage 2: Minimal 2-tile swap
  const working = cloneBoard(board);
  for (const pos of frozenCoords) {
    working[pos.r][pos.c]!.frozen = false;
  }

  const unlockedCoords = shuffleArray(occupiedCoords);
  const maxSwapChecks = Math.min(unlockedCoords.length, 24);
  for (let i = 0; i < maxSwapChecks; i++) {
    for (let j = i + 1; j < maxSwapChecks; j++) {
      const p1 = unlockedCoords[i];
      const p2 = unlockedCoords[j];
      const t1 = working[p1.r][p1.c]!;
      const t2 = working[p2.r][p2.c]!;
      if (t1.speciesId === t2.speciesId) continue;

      working[p1.r][p1.c] = t2;
      working[p2.r][p2.c] = t1;
      if (countValidPairs(working, 2) >= 2 || (remaining <= 6 && findAnyValidPair(working))) {
        return {
          board: working,
          adjusted: true,
          reason: 'Bộ lọc chống kẹt: Đã tự điều chỉnh vị trí ô bị cản để mở đường nối!',
        };
      }
      working[p1.r][p1.c] = t1;
      working[p2.r][p2.c] = t2;
    }
  }

  // Stage 3: Smart full reshuffle
  const reshuffled = shuffleBoard(working);
  if (findAnyValidPair(reshuffled)) {
    return {
      board: reshuffled,
      adjusted: true,
      reason: 'Không còn cặp nối hợp lệ — Đã tự động sắp xếp lại bàn đấu!',
    };
  }

  // Stage 4: Ultimate fallback — relocate an identical pair onto empty cells
  const finalFix = cloneBoard(working);
  const emptySlots: GridPos[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!finalFix[r][c]) emptySlots.push({ r, c });
    }
  }

  if (emptySlots.length >= 2 && occupiedCoords.length >= 2) {
    const bySpecies = new Map<number, GridPos[]>();
    for (const p of occupiedCoords) {
      const sp = finalFix[p.r][p.c]!.speciesId;
      const arr = bySpecies.get(sp) ?? [];
      arr.push(p);
      bySpecies.set(sp, arr);
    }

    for (const positions of bySpecies.values()) {
      if (positions.length >= 2) {
        const srcA = positions[0];
        const srcB = positions[1];
        const dstA = emptySlots[0];
        const dstB = emptySlots[1];
        finalFix[dstA.r][dstA.c] = finalFix[srcA.r][srcA.c];
        finalFix[srcA.r][srcA.c] = null;
        finalFix[dstB.r][dstB.c] = finalFix[srcB.r][srcB.c];
        finalFix[srcB.r][srcB.c] = null;
        if (findAnyValidPair(finalFix)) {
          return {
            board: finalFix,
            adjusted: true,
            reason: 'Bộ lọc chống kẹt: Đã giải phóng cặp bị bao vây ra ô trống!',
          };
        }
      }
    }
  }

  return {
    board: reshuffled,
    adjusted: true,
    reason: 'Đã tự động điều chỉnh bàn đấu để tiếp tục ghép cặp!',
  };
}
