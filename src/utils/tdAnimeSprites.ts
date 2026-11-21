import { useEffect, useState } from 'react';
import tdHeroesSheet1 from '../assets/images/td_anime_heroes_1_1795252934172.jpg';
import tdHeroesSheet2 from '../assets/images/td_anime_heroes_2_1795252934353.jpg';
import tdGuardsSheet from '../assets/images/td_anime_guards_1795252933143.jpg';
import tdMonstersSheet1 from '../assets/images/td_anime_monsters_1_1795252933896.jpg';
import tdMonstersSheet2 from '../assets/images/td_anime_monsters_2_1795252934093.jpg';
import { TdBranchId, TdEnemyType, TdTowerType } from '../types/towerDefense';

export type TdAnimeSpriteKey =
  | 'ARCHER_BASE'
  | 'ARCHER_POISON'
  | 'ARCHER_SNIPER'
  | 'BARRACKS_BASE'
  | 'BARRACKS_PALADIN'
  | 'BARRACKS_BARB'
  | 'MAGE_BASE'
  | 'MAGE_ARCANE'
  | 'MAGE_STORM'
  | 'ARTILLERY_BASE'
  | 'ARTILLERY_TESLA'
  | 'ARTILLERY_BERTHA'
  | 'ASSASSIN_BASE'
  | 'ASSASSIN_SHADOW'
  | 'ASSASSIN_VENOM'
  | 'VALKYRIE_BASE'
  | 'VALKYRIE_SERAPH'
  | 'VALKYRIE_FROST'
  | 'GUARD_KNIGHT'
  | 'GUARD_PALADIN'
  | 'GUARD_BARB'
  | 'GUARD_CHAMPION'
  | 'ENEMY_GOBLIN'
  | 'ENEMY_WOLF'
  | 'ENEMY_SPIDER'
  | 'ENEMY_ORC'
  | 'ENEMY_GOLEM'
  | 'ENEMY_WYVERN'
  | 'ENEMY_HARPY'
  | 'ENEMY_SHAMAN'
  | 'ENEMY_NECRO'
  | 'ENEMY_KNIGHT_DARK'
  | 'ENEMY_MINIBOSS'
  | 'ENEMY_BOSS';

interface CropDef {
  sheet: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const grid3 = (sheet: string, row: number, col: number): CropDef => ({
  sheet,
  x: col / 3,
  y: row / 3,
  w: 1 / 3,
  h: 1 / 3,
});

const grid2 = (sheet: string, row: number, col: number): CropDef => ({
  sheet,
  x: col / 2,
  y: row / 2,
  w: 0.5,
  h: 0.5,
});

const SPRITE_CROPS: Record<TdAnimeSpriteKey, CropDef> = {
  // Hero Towers Sheet 1
  ARCHER_BASE: grid3(tdHeroesSheet1, 0, 0),
  ARCHER_POISON: grid3(tdHeroesSheet1, 0, 1),
  ARCHER_SNIPER: grid3(tdHeroesSheet1, 0, 2),
  BARRACKS_BASE: grid3(tdHeroesSheet1, 1, 0),
  BARRACKS_PALADIN: grid3(tdHeroesSheet1, 1, 1),
  BARRACKS_BARB: grid3(tdHeroesSheet1, 1, 2),
  MAGE_BASE: grid3(tdHeroesSheet1, 2, 0),
  MAGE_ARCANE: grid3(tdHeroesSheet1, 2, 1),
  MAGE_STORM: grid3(tdHeroesSheet1, 2, 2),

  // Hero Towers Sheet 2
  ARTILLERY_BASE: grid3(tdHeroesSheet2, 0, 0),
  ARTILLERY_TESLA: grid3(tdHeroesSheet2, 0, 1),
  ARTILLERY_BERTHA: grid3(tdHeroesSheet2, 0, 2),
  ASSASSIN_BASE: grid3(tdHeroesSheet2, 1, 0),
  ASSASSIN_SHADOW: grid3(tdHeroesSheet2, 1, 1),
  ASSASSIN_VENOM: grid3(tdHeroesSheet2, 1, 2),
  VALKYRIE_BASE: grid3(tdHeroesSheet2, 2, 0),
  VALKYRIE_SERAPH: grid3(tdHeroesSheet2, 2, 1),
  VALKYRIE_FROST: grid3(tdHeroesSheet2, 2, 2),

  // Barracks & Reinforcement Guards
  GUARD_KNIGHT: grid2(tdGuardsSheet, 0, 0),
  GUARD_PALADIN: grid2(tdGuardsSheet, 0, 1),
  GUARD_BARB: grid2(tdGuardsSheet, 1, 0),
  GUARD_CHAMPION: grid2(tdGuardsSheet, 1, 1),

  // Monsters Sheet 1
  ENEMY_GOBLIN: grid3(tdMonstersSheet1, 0, 0),
  ENEMY_WOLF: grid3(tdMonstersSheet1, 0, 1),
  ENEMY_SPIDER: grid3(tdMonstersSheet1, 0, 2),
  ENEMY_ORC: grid3(tdMonstersSheet1, 1, 0),
  ENEMY_GOLEM: grid3(tdMonstersSheet1, 1, 1),
  ENEMY_WYVERN: { sheet: tdMonstersSheet1, x: 0.648, y: 0.34, w: 0.352, h: 0.33 },

  // Monsters Sheet 2
  ENEMY_HARPY: { sheet: tdMonstersSheet2, x: 0.0, y: 0.0, w: 0.39, h: 0.352 },
  ENEMY_SHAMAN: { sheet: tdMonstersSheet2, x: 0.37, y: 0.0, w: 0.3, h: 0.36 },
  ENEMY_NECRO: { sheet: tdMonstersSheet2, x: 0.66, y: 0.0, w: 0.34, h: 0.37 },
  ENEMY_KNIGHT_DARK: { sheet: tdMonstersSheet2, x: 0.0, y: 0.348, w: 0.38, h: 0.325 },
  ENEMY_MINIBOSS: { sheet: tdMonstersSheet2, x: 0.0, y: 0.665, w: 0.48, h: 0.335 },
  ENEMY_BOSS: { sheet: tdMonstersSheet2, x: 0.44, y: 0.35, w: 0.56, h: 0.65 },
};

const processedSpriteCache = new Map<TdAnimeSpriteKey, string>();
const startedSheets = new Set<string>();
const spriteListeners = new Set<() => void>();
let preloadTriggered = false;

function notifySpriteListeners() {
  spriteListeners.forEach((cb) => cb());
}

function isExteriorWhite(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min >= 224 && max - min <= 26;
}

function isPureInteriorPocketWhite(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min >= 250 && max - min <= 5;
}

/**
 * Slices a cell out of a sprite sheet, removes the solid white background via
 * border-connected BFS flood-fill (preserving white armor/eyes inside dark outlines),
 * feathers anti-aliased fringes cleanly, and exports a tightly cropped transparent PNG data URL.
 */
function extractTransparentCell(
  sourceImg: HTMLImageElement,
  crop: CropDef
): string | null {
  const nw = sourceImg.naturalWidth;
  const nh = sourceImg.naturalHeight;
  if (!nw || !nh) return null;

  const sx = Math.max(0, Math.floor(crop.x * nw));
  const sy = Math.max(0, Math.floor(crop.y * nh));
  const sw = Math.min(nw - sx, Math.max(8, Math.floor(crop.w * nw)));
  const sh = Math.min(nh - sy, Math.max(8, Math.floor(crop.h * nh)));

  const workCanvas = document.createElement('canvas');
  workCanvas.width = sw;
  workCanvas.height = sh;
  const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, sw, sh);
  const imgData = ctx.getImageData(0, 0, sw, sh);
  const data = imgData.data;
  const total = sw * sh;

  const transparent = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const trySeed = (idx: number) => {
    if (transparent[idx]) return;
    const off = idx * 4;
    if (isExteriorWhite(data[off], data[off + 1], data[off + 2])) {
      transparent[idx] = 1;
      queue[tail++] = idx;
    }
  };

  // Seed flood-fill from all 4 edges of the cell
  for (let x = 0; x < sw; x++) {
    trySeed(x);
    trySeed((sh - 1) * sw + x);
  }
  for (let y = 0; y < sh; y++) {
    trySeed(y * sw);
    trySeed(y * sw + (sw - 1));
  }

  // BFS exterior white removal
  while (head < tail) {
    const cur = queue[head++];
    const cx = cur % sw;
    const cy = (cur - cx) / sw;

    if (cx > 0) trySeed(cur - 1);
    if (cx < sw - 1) trySeed(cur + 1);
    if (cy > 0) trySeed(cur - sw);
    if (cy < sh - 1) trySeed(cur + sw);
  }

  // Also clear large enclosed pure-#FFFFFF gaps (e.g. inside bow loops / under Torii arch)
  // while leaving tinted white armor & small eye highlights untouched.
  const pocketVisited = new Uint8Array(total);
  const pocketQueue = new Int32Array(total);
  for (let i = 0; i < total; i++) {
    if (transparent[i] || pocketVisited[i]) continue;
    const off = i * 4;
    if (!isPureInteriorPocketWhite(data[off], data[off + 1], data[off + 2])) continue;

    let pHead = 0;
    let pTail = 0;
    pocketVisited[i] = 1;
    pocketQueue[pTail++] = i;

    while (pHead < pTail) {
      const cur = pocketQueue[pHead++];
      const cx = cur % sw;
      const cy = (cur - cx) / sw;
      const neighbors = [
        cx > 0 ? cur - 1 : -1,
        cx < sw - 1 ? cur + 1 : -1,
        cy > 0 ? cur - sw : -1,
        cy < sh - 1 ? cur + sw : -1,
      ];
      for (let n = 0; n < 4; n++) {
        const nb = neighbors[n];
        if (nb < 0 || transparent[nb] || pocketVisited[nb]) continue;
        const nOff = nb * 4;
        if (isPureInteriorPocketWhite(data[nOff], data[nOff + 1], data[nOff + 2])) {
          pocketVisited[nb] = 1;
          pocketQueue[pTail++] = nb;
        }
      }
    }

    if (pTail >= 26) {
      for (let k = 0; k < pTail; k++) {
        transparent[pocketQueue[k]] = 1;
      }
    }
  }

  // Apply transparency and 1px edge anti-alias defringing
  for (let i = 0; i < total; i++) {
    const off = i * 4;
    if (transparent[i]) {
      data[off + 3] = 0;
      continue;
    }

    const cx = i % sw;
    const cy = (i - cx) / sw;
    const touchesTrans =
      (cx > 0 && transparent[i - 1]) ||
      (cx < sw - 1 && transparent[i + 1]) ||
      (cy > 0 && transparent[i - sw]) ||
      (cy < sh - 1 && transparent[i + sw]);

    if (touchesTrans) {
      const r = data[off];
      const g = data[off + 1];
      const b = data[off + 2];
      const luma = (r + g + b) / 3;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      if (luma > 185 && chroma < 32) {
        const fade = Math.max(0, Math.min(1, (242 - luma) / 57));
        data[off + 3] = Math.round(255 * fade);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Compute tight non-transparent bounding box
  let minX = sw;
  let minY = sh;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (data[(y * sw + x) * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;

  const pad = 2;
  const cx = Math.max(0, minX - pad);
  const cy = Math.max(0, minY - pad);
  const cw = Math.min(sw - cx, maxX - minX + 1 + pad * 2);
  const ch = Math.min(sh - cy, maxY - minY + 1 + pad * 2);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = cw;
  outCanvas.height = ch;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return null;

  outCtx.drawImage(workCanvas, cx, cy, cw, ch, 0, 0, cw, ch);
  return outCanvas.toDataURL('image/png');
}

function loadAndSliceSheet(sheetUrl: string) {
  if (typeof window === 'undefined' || startedSheets.has(sheetUrl)) return;
  startedSheets.add(sheetUrl);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const entries = (Object.entries(SPRITE_CROPS) as [TdAnimeSpriteKey, CropDef][]).filter(
      ([, def]) => def.sheet === sheetUrl
    );
    for (const [key, def] of entries) {
      try {
        const pngUrl = extractTransparentCell(img, def);
        if (pngUrl) {
          processedSpriteCache.set(key, pngUrl);
        }
      } catch {
        // Fallback SVG renders automatically if canvas extraction fails
      }
    }
    notifySpriteListeners();
  };
  img.src = sheetUrl;
}

export const TD_ANIME_SHEET_URLS = [
  tdHeroesSheet1,
  tdHeroesSheet2,
  tdGuardsSheet,
  tdMonstersSheet1,
  tdMonstersSheet2,
];

export function preloadTdAnimeSprites(): void {
  if (typeof window === 'undefined' || preloadTriggered) return;
  preloadTriggered = true;
  TD_ANIME_SHEET_URLS.forEach(loadAndSliceSheet);
}

export function resolveHeroAnimeKey(
  type: TdTowerType,
  level: 1 | 2 | 3 | 4,
  branch: TdBranchId | null
): TdAnimeSpriteKey {
  if (type === 'ARCHER') {
    if (branch === 'SNIPER_CRIT') return 'ARCHER_SNIPER';
    if (branch === 'RANGER_POISON' || level >= 3) return 'ARCHER_POISON';
    return 'ARCHER_BASE';
  }
  if (type === 'BARRACKS') {
    if (branch === 'BARBARIAN') return 'BARRACKS_BARB';
    if (branch === 'PALADIN' || level >= 3) return 'BARRACKS_PALADIN';
    return 'BARRACKS_BASE';
  }
  if (type === 'MAGE') {
    if (branch === 'STORM_CHAIN') return 'MAGE_STORM';
    if (branch === 'ARCANE_BEAM' || level >= 3) return 'MAGE_ARCANE';
    return 'MAGE_BASE';
  }
  if (type === 'ARTILLERY') {
    if (branch === 'BIG_BERTHA') return 'ARTILLERY_BERTHA';
    if (branch === 'TESLA_COIL' || level >= 3) return 'ARTILLERY_TESLA';
    return 'ARTILLERY_BASE';
  }
  if (type === 'ASSASSIN') {
    if (branch === 'VENOM_FANG') return 'ASSASSIN_VENOM';
    if (branch === 'SHADOW_BLADE' || level >= 3) return 'ASSASSIN_SHADOW';
    return 'ASSASSIN_BASE';
  }
  // VALKYRIE
  if (branch === 'FROST_VALKYRIE') return 'VALKYRIE_FROST';
  if (branch === 'SOLAR_SERAPH' || level >= 3) return 'VALKYRIE_SERAPH';
  return 'VALKYRIE_BASE';
}

export function resolveGuardAnimeKey(
  isReinforcement: boolean,
  branch: TdBranchId | null
): TdAnimeSpriteKey {
  if (isReinforcement) return 'GUARD_CHAMPION';
  if (branch === 'PALADIN') return 'GUARD_PALADIN';
  if (branch === 'BARBARIAN') return 'GUARD_BARB';
  return 'GUARD_KNIGHT';
}

export function resolveEnemyAnimeKey(type: TdEnemyType): TdAnimeSpriteKey {
  switch (type) {
    case 'GOBLIN':
      return 'ENEMY_GOBLIN';
    case 'WOLF':
      return 'ENEMY_WOLF';
    case 'SPIDER':
      return 'ENEMY_SPIDER';
    case 'ORC':
      return 'ENEMY_ORC';
    case 'GOLEM':
      return 'ENEMY_GOLEM';
    case 'WYVERN':
      return 'ENEMY_WYVERN';
    case 'HARPY':
      return 'ENEMY_HARPY';
    case 'SHAMAN':
      return 'ENEMY_SHAMAN';
    case 'NECRO':
      return 'ENEMY_NECRO';
    case 'KNIGHT_DARK':
      return 'ENEMY_KNIGHT_DARK';
    case 'MINIBOSS':
      return 'ENEMY_MINIBOSS';
    case 'BOSS':
      return 'ENEMY_BOSS';
  }
}

export function useTdAnimeSprite(key: TdAnimeSpriteKey): string | null {
  const [src, setSrc] = useState<string | null>(() => processedSpriteCache.get(key) ?? null);

  useEffect(() => {
    preloadTdAnimeSprites();
    const sync = () => setSrc(processedSpriteCache.get(key) ?? null);
    sync();
    spriteListeners.add(sync);
    return () => {
      spriteListeners.delete(sync);
    };
  }, [key]);

  return src;
}
