import {
  DiamondCell,
  DiamondGrid,
  DiamondLevelConfig,
  GemBurstEffect,
  GemColorId,
  GemSpecial,
} from '../types/diamond';
import { GridPos } from '../types/game';

let nextGemUid = 1;
function genGemId(): string {
  nextGemUid += 1;
  return `gem-${Date.now().toString(36)}-${nextGemUid}`;
}

export function cloneDiamondGrid(grid: DiamondGrid): DiamondGrid {
  return grid.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function areAdjacentGems(a: GridPos, b: GridPos): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export function canMoveDiamondCell(cell: DiamondCell | null | undefined): boolean {
  if (!cell) return false;
  return !cell.stone && cell.ice === 0;
}

function randomGemColor(gemTypes: number): GemColorId {
  return Math.floor(Math.random() * gemTypes) as GemColorId;
}

function createGemCell(
  color: GemColorId,
  special: GemSpecial = 'NONE',
  ice = 0,
  stone = false
): DiamondCell {
  return {
    id: genGemId(),
    color,
    special,
    ice,
    stone,
  };
}

interface MatchRun {
  orientation: 'H' | 'V';
  color: GemColorId;
  cells: GridPos[];
}

export interface MatchGroup {
  color: GemColorId;
  cells: GridPos[];
  hasH: boolean;
  hasV: boolean;
  maxHorizLen: number;
  maxVertLen: number;
}

export function findDiamondMatchGroups(grid: DiamondGrid): MatchGroup[] {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const runs: MatchRun[] = [];

  // Horizontal runs (>= 3)
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const cell = grid[r][c];
      if (!cell || cell.stone || cell.special === 'PRISM') {
        c++;
        continue;
      }
      const color = cell.color;
      let end = c + 1;
      while (end < cols) {
        const next = grid[r][end];
        if (!next || next.stone || next.special === 'PRISM' || next.color !== color) break;
        end++;
      }
      if (end - c >= 3) {
        const cells: GridPos[] = [];
        for (let k = c; k < end; k++) cells.push({ r, c: k });
        runs.push({ orientation: 'H', color, cells });
      }
      c = end;
    }
  }

  // Vertical runs (>= 3)
  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const cell = grid[r][c];
      if (!cell || cell.stone || cell.special === 'PRISM') {
        r++;
        continue;
      }
      const color = cell.color;
      let end = r + 1;
      while (end < rows) {
        const next = grid[end][c];
        if (!next || next.stone || next.special === 'PRISM' || next.color !== color) break;
        end++;
      }
      if (end - r >= 3) {
        const cells: GridPos[] = [];
        for (let k = r; k < end; k++) cells.push({ r: k, c });
        runs.push({ orientation: 'V', color, cells });
      }
      r = end;
    }
  }

  if (runs.length === 0) return [];

  // Merge intersecting runs of the same color into unified L/T/cross groups
  const parent = runs.map((_, idx) => idx);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  const cellOwners = new Map<string, number[]>();
  runs.forEach((run, idx) => {
    for (const pos of run.cells) {
      const key = `${pos.r},${pos.c}`;
      const list = cellOwners.get(key) ?? [];
      list.push(idx);
      cellOwners.set(key, list);
    }
  });

  for (const list of cellOwners.values()) {
    for (let i = 1; i < list.length; i++) {
      if (runs[list[0]].color === runs[list[i]].color) {
        union(list[0], list[i]);
      }
    }
  }

  const grouped = new Map<number, MatchRun[]>();
  runs.forEach((run, idx) => {
    const root = find(idx);
    const arr = grouped.get(root) ?? [];
    arr.push(run);
    grouped.set(root, arr);
  });

  const groups: MatchGroup[] = [];
  for (const componentRuns of grouped.values()) {
    const seen = new Set<string>();
    const cells: GridPos[] = [];
    let hasH = false;
    let hasV = false;
    let maxHorizLen = 0;
    let maxVertLen = 0;

    for (const run of componentRuns) {
      if (run.orientation === 'H') {
        hasH = true;
        maxHorizLen = Math.max(maxHorizLen, run.cells.length);
      } else {
        hasV = true;
        maxVertLen = Math.max(maxVertLen, run.cells.length);
      }
      for (const pos of run.cells) {
        const key = `${pos.r},${pos.c}`;
        if (!seen.has(key)) {
          seen.add(key);
          cells.push(pos);
        }
      }
    }

    groups.push({
      color: componentRuns[0].color,
      cells,
      hasH,
      hasV,
      maxHorizLen,
      maxVertLen,
    });
  }

  return groups;
}

/**
 * Checks if swapping two adjacent movable tiles yields at least one valid match or special combo.
 */
export function isValidDiamondSwap(grid: DiamondGrid, a: GridPos, b: GridPos): boolean {
  if (!areAdjacentGems(a, b)) return false;
  const cellA = grid[a.r]?.[a.c];
  const cellB = grid[b.r]?.[b.c];
  if (!canMoveDiamondCell(cellA) || !canMoveDiamondCell(cellB)) return false;

  // Special + Prism or Special + Special always works
  if (cellA!.special === 'PRISM' || cellB!.special === 'PRISM') return true;
  if (cellA!.special !== 'NONE' && cellB!.special !== 'NONE') return true;

  const swapped = cloneDiamondGrid(grid);
  swapped[a.r][a.c] = cellB!;
  swapped[b.r][b.c] = cellA!;
  return findDiamondMatchGroups(swapped).length > 0;
}

export function findAnyDiamondMove(grid: DiamondGrid): { a: GridPos; b: GridPos } | null {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!canMoveDiamondCell(grid[r][c])) continue;
      if (c + 1 < cols && isValidDiamondSwap(grid, { r, c }, { r, c: c + 1 })) {
        return { a: { r, c }, b: { r, c: c + 1 } };
      }
      if (r + 1 < rows && isValidDiamondSwap(grid, { r, c }, { r: r + 1, c })) {
        return { a: { r, c }, b: { r: r + 1, c } };
      }
    }
  }
  return null;
}

export function createDiamondBoard(config: DiamondLevelConfig): DiamondGrid {
  const { rows, cols, gemTypes, iceCount, doubleIceCount, stoneCount } = config;

  for (let attempt = 0; attempt < 40; attempt++) {
    const grid: DiamondGrid = Array.from({ length: rows }, () =>
      Array<DiamondCell | null>(cols).fill(null)
    );

    // Place random stones in interior positions (never blocking top entrance everywhere)
    const candidateStoneCoords: GridPos[] = [];
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        candidateStoneCoords.push({ r, c });
      }
    }
    for (let i = candidateStoneCoords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidateStoneCoords[i], candidateStoneCoords[j]] = [
        candidateStoneCoords[j],
        candidateStoneCoords[i],
      ];
    }

    const pickedStones = candidateStoneCoords.slice(0, stoneCount);
    const stoneSet = new Set(pickedStones.map((p) => `${p.r},${p.c}`));

    // Fill gems ensuring ZERO pre-existing 3-in-a-row matches
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (stoneSet.has(`${r},${c}`)) {
          grid[r][c] = createGemCell(0, 'NONE', 0, true);
          continue;
        }

        const forbidden = new Set<GemColorId>();
        if (
          c >= 2 &&
          grid[r][c - 1] &&
          !grid[r][c - 1]!.stone &&
          grid[r][c - 2] &&
          !grid[r][c - 2]!.stone &&
          grid[r][c - 1]!.color === grid[r][c - 2]!.color
        ) {
          forbidden.add(grid[r][c - 1]!.color);
        }
        if (
          r >= 2 &&
          grid[r - 1][c] &&
          !grid[r - 1][c]!.stone &&
          grid[r - 2][c] &&
          !grid[r - 2][c]!.stone &&
          grid[r - 1][c]!.color === grid[r - 2][c]!.color
        ) {
          forbidden.add(grid[r - 1][c]!.color);
        }

        const allowed: GemColorId[] = [];
        for (let g = 0; g < gemTypes; g++) {
          if (!forbidden.has(g as GemColorId)) allowed.push(g as GemColorId);
        }
        const chosen =
          allowed.length > 0
            ? allowed[Math.floor(Math.random() * allowed.length)]
            : randomGemColor(gemTypes);
        grid[r][c] = createGemCell(chosen);
      }
    }

    // Apply ice tiles on non-stone positions (spread across middle/lower board)
    const iceCandidates: GridPos[] = [];
    for (let r = 1; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!stoneSet.has(`${r},${c}`)) {
          iceCandidates.push({ r, c });
        }
      }
    }
    for (let i = iceCandidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [iceCandidates[i], iceCandidates[j]] = [iceCandidates[j], iceCandidates[i]];
    }

    let doublePlaced = 0;
    let singlePlaced = 0;
    for (const pos of iceCandidates) {
      if (doublePlaced < doubleIceCount) {
        grid[pos.r][pos.c]!.ice = 2;
        doublePlaced++;
      } else if (singlePlaced < iceCount) {
        grid[pos.r][pos.c]!.ice = 1;
        singlePlaced++;
      } else {
        break;
      }
    }

    if (findAnyDiamondMove(grid)) {
      return grid;
    }
  }

  return createDiamondBoard({
    ...config,
    iceCount: 0,
    doubleIceCount: 0,
    stoneCount: 0,
  });
}

export function shuffleDiamondGems(grid: DiamondGrid, gemTypes: number): DiamondGrid {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  for (let attempt = 0; attempt < 30; attempt++) {
    const next = cloneDiamondGrid(grid);
    const movableCoords: GridPos[] = [];
    const movableColors: GemColorId[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = next[r][c];
        if (cell && !cell.stone && cell.ice === 0) {
          movableCoords.push({ r, c });
          movableColors.push(cell.color);
        }
      }
    }

    if (movableCoords.length < 2) return next;

    for (let i = movableColors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movableColors[i], movableColors[j]] = [movableColors[j], movableColors[i]];
    }

    movableCoords.forEach((pos, idx) => {
      const c = next[pos.r][pos.c]!;
      c.color = movableColors[idx];
    });

    if (findDiamondMatchGroups(next).length === 0 && findAnyDiamondMove(next)) {
      return next;
    }
  }

  // Fallback: recolor 3 adjacent cells to create a clean move
  const fallback = cloneDiamondGrid(grid);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c + 2 < cols; c++) {
      if (
        canMoveDiamondCell(fallback[r][c]) &&
        canMoveDiamondCell(fallback[r][c + 1]) &&
        canMoveDiamondCell(fallback[r][c + 2])
      ) {
        const col = randomGemColor(gemTypes);
        fallback[r][c]!.color = col;
        fallback[r][c + 1]!.color = col;
        if (r + 1 < rows && canMoveDiamondCell(fallback[r + 1][c + 2])) {
          fallback[r + 1][c + 2]!.color = col;
        }
        return fallback;
      }
    }
  }
  return fallback;
}

export interface StepResolutionResult {
  nextGrid: DiamondGrid;
  clearedCount: number;
  clearedByColor: Record<GemColorId, number>;
  iceBroken: number;
  stonesDestroyed: number;
  specialTriggered: boolean;
  spawnedSpecial: boolean;
  maxGroupSize: number;
  bursts: GemBurstEffect[];
  pointsEarned: number;
}

function emptyColorCounts(): Record<GemColorId, number> {
  return { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
}

export function resolveDiamondStep(
  grid: DiamondGrid,
  comboMultiplier: number,
  swapContext?: { a: GridPos; b: GridPos }
): StepResolutionResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const working = cloneDiamondGrid(grid);

  const destroyKeys = new Set<string>();
  const spawnedCells = new Map<string, { color: GemColorId; special: GemSpecial }>();
  const specialQueue: GridPos[] = [];
  const triggeredSpecialKeys = new Set<string>();

  let specialTriggered = false;
  let spawnedSpecial = false;
  let maxGroupSize = 0;

  // 1. Check Special+Special or Prism+Gem swap combos first
  if (swapContext) {
    const cellA = working[swapContext.a.r]?.[swapContext.a.c];
    const cellB = working[swapContext.b.r]?.[swapContext.b.c];

    if (cellA && cellB) {
      if (cellA.special === 'PRISM' && cellB.special === 'PRISM') {
        specialTriggered = true;
        maxGroupSize = Math.max(maxGroupSize, rows * cols);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            destroyKeys.add(`${r},${c}`);
          }
        }
      } else if (cellA.special === 'PRISM' || cellB.special === 'PRISM') {
        specialTriggered = true;
        const prismPos = cellA.special === 'PRISM' ? swapContext.a : swapContext.b;
        const partnerCell = cellA.special === 'PRISM' ? cellB : cellA;
        destroyKeys.add(`${prismPos.r},${prismPos.c}`);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cur = working[r][c];
            if (cur && !cur.stone && cur.color === partnerCell.color) {
              if (partnerCell.special !== 'NONE' && partnerCell.special !== 'PRISM') {
                cur.special = partnerCell.special;
                specialQueue.push({ r, c });
              }
              destroyKeys.add(`${r},${c}`);
            }
          }
        }
        maxGroupSize = Math.max(maxGroupSize, 5);
      } else if (cellA.special !== 'NONE' && cellB.special !== 'NONE') {
        specialTriggered = true;
        maxGroupSize = Math.max(maxGroupSize, 5);
        destroyKeys.add(`${swapContext.a.r},${swapContext.a.c}`);
        destroyKeys.add(`${swapContext.b.r},${swapContext.b.c}`);

        const isBombA = cellA.special === 'BOMB';
        const isBombB = cellB.special === 'BOMB';
        const isLineA = cellA.special === 'LINE_H' || cellA.special === 'LINE_V';
        const isLineB = cellB.special === 'LINE_H' || cellB.special === 'LINE_V';

        if (isBombA && isBombB) {
          // Mega 5x5 blast
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = swapContext.b.r + dr;
              const nc = swapContext.b.c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                destroyKeys.add(`${nr},${nc}`);
              }
            }
          }
        } else if ((isBombA && isLineB) || (isLineA && isBombB)) {
          // Giant 3-row + 3-col cross blast
          for (let d = -1; d <= 1; d++) {
            const rr = swapContext.b.r + d;
            if (rr >= 0 && rr < rows) {
              for (let c = 0; c < cols; c++) destroyKeys.add(`${rr},${c}`);
            }
            const cc = swapContext.b.c + d;
            if (cc >= 0 && cc < cols) {
              for (let r = 0; r < rows; r++) destroyKeys.add(`${r},${cc}`);
            }
          }
        } else {
          // Cross blast (row + col)
          for (let c = 0; c < cols; c++) destroyKeys.add(`${swapContext.b.r},${c}`);
          for (let r = 0; r < rows; r++) destroyKeys.add(`${r},${swapContext.b.c}`);
        }
      }
    }
  }

  // 2. Standard >=3 matches
  const groups = findDiamondMatchGroups(working);
  for (const group of groups) {
    maxGroupSize = Math.max(maxGroupSize, group.cells.length);
    let newSpecial: GemSpecial = 'NONE';
    if (group.hasH && group.hasV) {
      newSpecial = 'BOMB';
    } else if (group.maxHorizLen >= 5 || group.maxVertLen >= 5) {
      newSpecial = 'PRISM';
    } else if (group.maxHorizLen === 4) {
      newSpecial = 'LINE_V';
    } else if (group.maxVertLen === 4) {
      newSpecial = 'LINE_H';
    }

    let spawnKey: string | null = null;
    if (newSpecial !== 'NONE') {
      spawnedSpecial = true;
      const preferred =
        group.cells.find(
          (p) =>
            swapContext &&
            ((p.r === swapContext.a.r && p.c === swapContext.a.c) ||
              (p.r === swapContext.b.r && p.c === swapContext.b.c))
        ) ?? group.cells[Math.floor(group.cells.length / 2)];
      spawnKey = `${preferred.r},${preferred.c}`;
      spawnedCells.set(spawnKey, { color: group.color, special: newSpecial });
    }

    for (const pos of group.cells) {
      const k = `${pos.r},${pos.c}`;
      if (k !== spawnKey) {
        destroyKeys.add(k);
      }
    }
  }

  // 3. Seed special chain-reaction queue from destroyed cells
  for (const key of destroyKeys) {
    const [rs, cs] = key.split(',');
    const r = Number(rs);
    const c = Number(cs);
    const cell = working[r]?.[c];
    if (cell && cell.special !== 'NONE') {
      specialQueue.push({ r, c });
    }
  }

  // Propagate chain explosions through specialQueue
  while (specialQueue.length > 0) {
    const pos = specialQueue.shift()!;
    const pKey = `${pos.r},${pos.c}`;
    if (triggeredSpecialKeys.has(pKey)) continue;
    triggeredSpecialKeys.add(pKey);

    const cell = working[pos.r]?.[pos.c];
    if (!cell || cell.stone || cell.special === 'NONE') continue;
    specialTriggered = true;

    const addTarget = (tr: number, tc: number) => {
      if (tr < 0 || tr >= rows || tc < 0 || tc >= cols) return;
      const tk = `${tr},${tc}`;
      if (!destroyKeys.has(tk)) {
        destroyKeys.add(tk);
        const tCell = working[tr]?.[tc];
        if (tCell && tCell.special !== 'NONE' && !triggeredSpecialKeys.has(tk)) {
          specialQueue.push({ r: tr, c: tc });
        }
      }
    };

    if (cell.special === 'LINE_H') {
      for (let c = 0; c < cols; c++) addTarget(pos.r, c);
    } else if (cell.special === 'LINE_V') {
      for (let r = 0; r < rows; r++) addTarget(r, pos.c);
    } else if (cell.special === 'BOMB') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          addTarget(pos.r + dr, pos.c + dc);
        }
      }
    } else if (cell.special === 'PRISM') {
      // Triggered by cascade/explosion: wipe most common color on board
      const counts = emptyColorCounts();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const item = working[r][c];
          if (item && !item.stone && item.special !== 'PRISM') {
            counts[item.color] += 1;
          }
        }
      }
      let bestColor: GemColorId = 0;
      let bestAmt = -1;
      for (let g = 0; g <= 6; g++) {
        if (counts[g as GemColorId] > bestAmt) {
          bestAmt = counts[g as GemColorId];
          bestColor = g as GemColorId;
        }
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const item = working[r][c];
          if (item && !item.stone && item.color === bestColor) {
            addTarget(r, c);
          }
        }
      }
    }
  }

  // 4. Destroy stones adjacent to natural matched group cells
  let stonesDestroyed = 0;
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const adjacentStoneKeys = new Set<string>();
  for (const group of groups) {
    for (const pos of group.cells) {
      for (const [dr, dc] of dirs) {
        const nr = pos.r + dr;
        const nc = pos.c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const neighbor = working[nr][nc];
          if (neighbor && neighbor.stone) {
            adjacentStoneKeys.add(`${nr},${nc}`);
          }
        }
      }
    }
  }

  // Also allow special blasts caught in destroyKeys to break stones
  for (const key of destroyKeys) {
    const [rs, cs] = key.split(',');
    const r = Number(rs);
    const c = Number(cs);
    if (working[r]?.[c]?.stone) {
      adjacentStoneKeys.add(key);
    }
  }

  for (const sk of adjacentStoneKeys) {
    const [rs, cs] = sk.split(',');
    const r = Number(rs);
    const c = Number(cs);
    if (working[r][c]?.stone) {
      working[r][c] = null;
      stonesDestroyed++;
    }
  }

  // 5. Spawn new special gems cleanly at anchor coords
  for (const [key, spec] of spawnedCells.entries()) {
    const [rs, cs] = key.split(',');
    const r = Number(rs);
    const c = Number(cs);
    const existing = working[r][c];
    working[r][c] = createGemCell(
      spec.color,
      spec.special,
      existing && existing.ice > 0 ? existing.ice - 1 : 0,
      false
    );
  }

  // 6. Apply damage/destruction to all destroyed keys
  const clearedByColor = emptyColorCounts();
  const bursts: GemBurstEffect[] = [];
  let clearedCount = 0;
  let iceBroken = 0;

  for (const key of destroyKeys) {
    if (spawnedCells.has(key)) continue;
    const [rs, cs] = key.split(',');
    const r = Number(rs);
    const c = Number(cs);
    const cell = working[r]?.[c];
    if (!cell || cell.stone) continue;

    bursts.push({
      id: `burst-${r}-${c}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      r,
      c,
      color: cell.color,
      special: cell.special,
    });

    if (cell.ice >= 2) {
      cell.ice -= 1;
      iceBroken++;
      clearedByColor[cell.color] += 1;
      clearedCount++;
    } else {
      if (cell.ice === 1) {
        iceBroken++;
      }
      clearedByColor[cell.color] += 1;
      clearedCount++;
      working[r][c] = null;
    }
  }

  const basePts = clearedCount * 40 + iceBroken * 90 + stonesDestroyed * 140;
  const comboBoost = 1 + (comboMultiplier - 1) * 0.35;
  const pointsEarned = Math.round(basePts * comboBoost);

  return {
    nextGrid: working,
    clearedCount,
    clearedByColor,
    iceBroken,
    stonesDestroyed,
    specialTriggered,
    spawnedSpecial,
    maxGroupSize,
    bursts,
    pointsEarned,
  };
}

/**
 * Drops gems downward cleanly around anchored stones and spawns fresh gems from the top.
 */
export function applyDiamondGravityAndRefill(
  grid: DiamondGrid,
  gemTypes: number
): DiamondGrid {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const next = cloneDiamondGrid(grid);

  for (let c = 0; c < cols; c++) {
    // Segment column by anchored stones so gems never teleport through stones,
    // and fill every empty cell cleanly from the top of each segment.
    let segmentEnd = rows - 1;
    while (segmentEnd >= 0) {
      if (next[segmentEnd][c]?.stone) {
        segmentEnd--;
        continue;
      }
      let segmentStart = segmentEnd;
      while (segmentStart >= 0 && !next[segmentStart][c]?.stone) {
        segmentStart--;
      }
      segmentStart += 1;

      // Collect non-null cells in [segmentStart..segmentEnd]
      const surviving: DiamondCell[] = [];
      for (let r = segmentStart; r <= segmentEnd; r++) {
        if (next[r][c]) surviving.push(next[r][c]!);
      }

      const emptyCount = segmentEnd - segmentStart + 1 - surviving.length;
      let writeIdx = segmentEnd;
      for (let i = surviving.length - 1; i >= 0; i--) {
        next[writeIdx--][c] = surviving[i];
      }
      for (let k = 0; k < emptyCount; k++) {
        next[writeIdx--][c] = createGemCell(randomGemColor(gemTypes));
      }

      segmentEnd = segmentStart - 2;
    }
  }

  return next;
}
