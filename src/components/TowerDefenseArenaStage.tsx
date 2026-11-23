import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Castle,
  Coins,
  FastForward,
  Flag,
  Flame,
  Heart,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  TD_MAP_ABYSS_URL,
  TD_MAP_DESERT_URL,
  TD_MAP_FOREST_URL,
  TD_MAP_ICE_URL,
  TD_MAP_SKY_URL,
  TD_MAP_VOLCANO_URL,
} from '../data/pokemonSprites';
import {
  getExtraTowerUpgradeCost,
  getMythicPathConfig,
  getMythicUpgradeCost,
  TD_ENEMIES,
  TD_MAX_LEVEL,
  TD_MAX_TOWER_LEVEL,
  TD_MYTHIC_PATHS,
  TD_TOWER_BUILD_ORDER,
  TD_TOWERS,
  TD_VIEWBOX_H,
  TD_VIEWBOX_W,
} from '../data/tdLevels';
import {
  TdBranchId,
  TdBuiltTower,
  TdCombatFocus,
  TdEffectBurst,
  TdEnemyEntity,
  TdEnemyType,
  TdLevelConfig,
  TdMythicPathId,
  TdPoint,
  TdProjectile,
  TdSoldierEntity,
  TdTowerLevel,
  TdTowerType,
  TdUpgrades,
} from '../types/towerDefense';
import { sound } from '../utils/sound';
import {
  TdEnemyPreview,
  TdEnemySprite,
  TdMapLandmarkSprite,
  TdSharedArtworkDefs,
  TdSoldierSprite,
  TdTowerPreview,
  TdTowerSprite,
} from './TdArtwork';

interface TowerDefenseArenaStageProps {
  levelConfig: TdLevelConfig;
  runNonce: number;
  upgrades: TdUpgrades;
  unlockedTowers?: TdTowerType[];
  isPaused: boolean;
  isCompactLandscape: boolean;
  isFullscreen: boolean;
  fsSupported: boolean;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onTogglePause: () => void;
  onResume: () => void;
  onExitToLevels: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onReplay: () => void;
  onWinLevel: (
    level: number,
    score: number,
    stars: number,
    livesLeft: number,
    enemiesSlain: number
  ) => void;
  onLoseLevel: (enemiesSlain: number, score: number) => void;
}

interface PendingSpawn {
  enemyType: TdEnemyType;
  pathIndex: number;
  spawnAt: number;
  hpMult: number;
  speedMult: number;
  armorBonus: number;
  magicResistBonus: number;
  bountyMult: number;
}

interface WorldState {
  gold: number;
  lives: number;
  score: number;
  enemiesSlain: number;
  waveIndex: number; // 0-based index of wave being prepared/active
  wavePhase: 'PREP' | 'SPAWNING' | 'CLEARING' | 'DONE';
  prepTimer: number;
  waveClock: number;
  spawnQueue: PendingSpawn[];
  towers: TdBuiltTower[];
  enemies: TdEnemyEntity[];
  soldiers: TdSoldierEntity[];
  projectiles: TdProjectile[];
  effects: TdEffectBurst[];
  meteorCd: number;
  reinforceCd: number;
  idCounter: number;
  finished: boolean;
}

interface SnapshotView {
  gold: number;
  lives: number;
  score: number;
  enemiesSlain: number;
  waveNumber: number;
  totalWaves: number;
  wavePhase: 'PREP' | 'SPAWNING' | 'CLEARING' | 'DONE';
  prepTimer: number;
  meteorCd: number;
  reinforceCd: number;
  towers: TdBuiltTower[];
  enemies: TdEnemyEntity[];
  soldiers: TdSoldierEntity[];
  projectiles: TdProjectile[];
  effects: TdEffectBurst[];
}

type TargetingMode =
  | { kind: 'NONE' }
  | { kind: 'METEOR' }
  | { kind: 'REINFORCE' }
  | { kind: 'RALLY'; towerId: string };

const METEOR_BASE_CD = 36;
const REINFORCE_BASE_CD = 22;
const DEFAULT_UNLOCKED_TOWERS: TdTowerType[] = [
  'ARCHER',
  'BARRACKS',
  'MAGE',
  'ARTILLERY',
  'ASSASSIN',
  'VALKYRIE',
];

function isGarrisonTower(type: TdTowerType): boolean {
  return type === 'BARRACKS' || type === 'KNIGHT_GUARD';
}

function getDiscountedTdCost(baseCost: number, upgrades: TdUpgrades): number {
  const m = upgrades.mastery ?? 0;
  const mult = m >= 5 ? 0.88 : m >= 3 ? 0.92 : m >= 1 ? 0.96 : 1;
  return Math.max(1, Math.round(baseCost * mult));
}

function getRefundRate(upgrades: TdUpgrades): number {
  const ec = upgrades.economy ?? 0;
  return ec >= 5 ? 0.9 : ec >= 3 ? 0.85 : 0.7;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function getEnemyHealMultiplier(enemy: TdEnemyEntity): number {
  let mult = 1;
  if (enemy.poisonTimer > 0) mult *= 0.5;
  if (enemy.burnTimer > 0) mult *= 0.8;
  return mult;
}

function getEffectiveTowerStats(tower: TdBuiltTower, upgrades: TdUpgrades) {
  const cfg = TD_TOWERS[tower.type];
  const branchCfg = tower.branch
    ? cfg.branches.find((b) => b.id === tower.branch) ?? null
    : null;
  const mythicCfg =
    tower.level >= 11 ? getMythicPathConfig(tower.type, tower.mythicPath) : null;
  const tierStats = cfg.tiers[Math.min(2, tower.level - 1)];

  const rawDamage = branchCfg ? branchCfg.damage : tierStats.damage;
  const rawRange = branchCfg ? branchCfg.range : tierStats.range;
  const rawCooldown = branchCfg ? branchCfg.cooldown : tierStats.cooldown;
  const baseTargetCount = branchCfg?.targetCount ?? tierStats.targetCount ?? 1;
  const baseSplashRadius = branchCfg?.splashRadius ?? tierStats.splashRadius ?? 0;

  // Lv 5..10 (up to 6 tiers) & Lv 11..20 (up to 10 mythic tiers)
  const midTiers = Math.min(6, Math.max(0, tower.level - 4));
  const mythicTiers = Math.max(0, tower.level - 10);

  let damage = Math.round(
    rawDamage *
      Math.pow(1.2, midTiers) *
      (mythicCfg?.damageMult ?? 1) *
      Math.pow(1.18, mythicTiers)
  );
  let range = Math.round(
    rawRange *
      (1 + midTiers * 0.04) *
      (mythicCfg?.rangeMult ?? 1) *
      (1 + mythicTiers * 0.018)
  );
  let cooldown =
    rawCooldown *
    Math.pow(0.92, midTiers) *
    (mythicCfg?.cooldownMult ?? 1) *
    Math.pow(0.95, mythicTiers);
  let targetCount =
    baseTargetCount +
    (midTiers >= 1 ? 1 : 0) +
    (midTiers >= 3 ? 1 : 0) +
    (midTiers >= 6 ? 1 : 0) +
    (mythicCfg?.bonusTargets ?? 0) +
    (tower.level >= 15 ? 1 : 0) +
    (tower.level >= 20 ? 1 : 0);
  let splashRadius =
    baseSplashRadius > 0 || (mythicCfg?.splashRadiusBonus ?? 0) > 0
      ? baseSplashRadius +
        midTiers * 6 +
        (mythicCfg?.splashRadiusBonus ?? 0) +
        mythicTiers * 3
      : 0;

  let slowPct = branchCfg?.slowPct ?? tierStats.slowPct ?? 0;
  if (slowPct > 0 && midTiers > 0) {
    slowPct = Math.min(0.7, slowPct + midTiers * 0.02);
  }
  if (mythicCfg?.slowPctBonus) {
    slowPct = Math.min(
      0.78,
      Math.max(slowPct, mythicCfg.slowPctBonus) + (slowPct > 0 ? mythicCfg.slowPctBonus * 0.5 : 0)
    );
  }
  const baseSlowSplash = branchCfg?.slowSplashRadius ?? tierStats.slowSplashRadius ?? 0;
  const slowSplashRadius =
    baseSlowSplash > 0 || (mythicCfg?.slowSplashBonus ?? 0) > 0
      ? Math.max(55, baseSlowSplash) + (mythicCfg?.slowSplashBonus ?? 0) + mythicTiers * 2
      : 0;

  const basePoison = branchCfg?.poisonDps ?? tierStats.poisonDps ?? 0;
  const poisonDps = basePoison > 0 ? Math.round(damage * (mythicCfg?.poisonMult ?? 1)) : 0;
  const poisonSpreadRadius = mythicCfg?.poisonSpreadRadius ?? 0;

  const baseBurn = branchCfg?.burnDps ?? tierStats.burnDps ?? 0;
  let burnDps =
    baseBurn > 0
      ? Math.round(
          baseBurn *
            Math.pow(1.2, midTiers) *
            (mythicCfg?.burnMult ?? 1) *
            Math.pow(1.18, mythicTiers)
        )
      : 0;

  let critChance = branchCfg?.critChance ?? tierStats.critChance ?? 0;
  if (critChance > 0 && midTiers > 0) {
    critChance = Math.min(0.65, critChance + midTiers * 0.02);
  }
  if (mythicCfg?.critChanceBonus) {
    critChance = Math.min(0.85, critChance + mythicCfg.critChanceBonus);
  }
  let critMult = 2.3 + (mythicCfg?.critMultBonus ?? 0);

  const baseChain = branchCfg?.chainCount ?? 0;
  let chainCount =
    baseChain > 0 || (mythicCfg?.chainBonus ?? 0) > 0
      ? baseChain + Math.floor(midTiers / 2) + (mythicCfg?.chainBonus ?? 0) + (tower.level >= 16 ? 1 : 0)
      : 0;

  let auraHastePct = branchCfg?.auraHastePct ?? tierStats.auraHastePct ?? 0;
  if (auraHastePct > 0 && (midTiers > 0 || mythicTiers > 0)) {
    auraHastePct = Math.min(
      0.75,
      auraHastePct + midTiers * 0.015 + (mythicCfg?.auraHasteBonus ?? 0) + mythicTiers * 0.012
    );
  }

  const baseHealSoldier = branchCfg?.healSoldierAmt ?? tierStats.healSoldierAmt ?? 0;
  let healSoldierAmt =
    baseHealSoldier > 0
      ? Math.round(
          baseHealSoldier *
            Math.pow(1.18, midTiers) *
            (mythicCfg?.healSoldierMult ?? 1) *
            Math.pow(1.16, mythicTiers)
        )
      : 0;
  const canHitAir = cfg.canHitAir || tower.branch === 'TESLA_COIL' || Boolean(mythicCfg?.grantCanHitAir);

  let armorPiercePct = Math.min(
    1,
    (branchCfg?.innateArmorPiercePct ?? tierStats.innateArmorPiercePct ?? 0) +
      (mythicCfg?.armorPiercePct ?? 0)
  );
  let magicPiercePct = Math.min(
    1,
    (branchCfg?.innateMagicPiercePct ?? tierStats.innateMagicPiercePct ?? 0) +
      (mythicCfg?.magicPiercePct ?? 0)
  );
  let trueDamagePct = Math.min(
    1,
    (branchCfg?.innateTrueDamagePct ?? tierStats.innateTrueDamagePct ?? 0) +
      (mythicCfg?.trueDamagePct ?? 0)
  );

  const baseSoldierCount = branchCfg?.soldierCount ?? tierStats.soldierCount ?? 3;
  let soldierCount = isGarrisonTower(tower.type)
    ? baseSoldierCount +
      (midTiers >= 2 ? 1 : 0) +
      (midTiers >= 5 ? 1 : 0) +
      (mythicCfg?.soldierCountBonus ?? 0) +
      (tower.level >= 16 ? 1 : 0)
    : baseSoldierCount;
  let soldierHp = Math.round(
    (branchCfg?.soldierHp ?? tierStats.soldierHp ?? 125) *
      Math.pow(1.2, midTiers) *
      (mythicCfg?.soldierHpMult ?? 1) *
      Math.pow(1.18, mythicTiers)
  );
  let soldierArmor = Math.min(
    0.85,
    (branchCfg?.soldierArmor ?? tierStats.soldierArmor ?? 0.16) +
      midTiers * 0.025 +
      (mythicCfg?.soldierArmorBonus ?? 0) +
      mythicTiers * 0.01
  );
  let soldierDamage = Math.round(
    (branchCfg?.soldierDamage ?? tierStats.soldierDamage ?? 13) *
      Math.pow(1.2, midTiers) *
      (mythicCfg?.soldierDamageMult ?? 1) *
      Math.pow(1.18, mythicTiers)
  );
  let cleaveRadius =
    (branchCfg?.cleaveRadius ?? tierStats.cleaveRadius ?? 0) +
    (mythicCfg?.cleaveRadiusBonus ?? 0);
  let soldierRespawn = mythicCfg?.soldierRespawnOverride ?? 5.0;

  // 1. Archery & Weapons Track (ARCHER, ASSASSIN, MECHANIST)
  if (tower.type === 'ARCHER' || tower.type === 'ASSASSIN' || tower.type === 'MECHANIST') {
    const u = upgrades.archery ?? 0;
    if (u >= 1) damage = Math.round(damage * 1.12);
    if (u >= 2) {
      range = Math.round(range * 1.1);
      cooldown *= 0.9;
    }
    if (u >= 3) critMult += 0.3;
    if (u >= 4) armorPiercePct = Math.min(1, armorPiercePct + 0.2);
    if (u >= 5) {
      damage = Math.round(damage * 1.18);
      targetCount += 1;
    }
  }

  // 2. Arcane & Elemental Magic Track (MAGE, PYROMANCER, CHRONOMANCER)
  if (tower.type === 'MAGE' || tower.type === 'PYROMANCER' || tower.type === 'CHRONOMANCER') {
    const u = upgrades.magic ?? 0;
    if (u >= 1) damage = Math.round(damage * 1.14);
    if (u >= 2) range = Math.round(range * 1.14);
    if (u >= 3) {
      if (slowPct > 0) slowPct = Math.min(0.78, slowPct + 0.12);
      if (burnDps > 0) burnDps = Math.round(burnDps * 1.2);
    }
    if (u >= 4) magicPiercePct = Math.min(1, magicPiercePct + 0.22);
    if (u >= 5) {
      damage = Math.round(damage * 1.2);
      cooldown *= 0.88;
    }
  }

  // 3. Barracks & Dragon Knight Track (BARRACKS, KNIGHT_GUARD)
  if (isGarrisonTower(tower.type)) {
    const u = upgrades.barracks ?? 0;
    if (u >= 1) {
      soldierHp = Math.round(soldierHp * 1.25);
      soldierArmor = Math.min(0.85, soldierArmor + 0.1);
    }
    if (u >= 2) soldierRespawn *= 0.7;
    if (u >= 3) {
      soldierDamage = Math.round(soldierDamage * 1.28);
      damage = Math.round(damage * 1.28);
    }
    if (u >= 4) {
      cleaveRadius = Math.max(cleaveRadius, 0) + 25;
      armorPiercePct = Math.min(1, armorPiercePct + 0.2);
    }
    if (u >= 5) {
      soldierCount += 1;
      soldierHp = Math.round(soldierHp * 1.25);
    }
  }

  // 4. Heavy Artillery & Mechanist Track (ARTILLERY, MECHANIST)
  if (tower.type === 'ARTILLERY' || tower.type === 'MECHANIST') {
    const u = upgrades.artillery ?? 0;
    if (u >= 1) damage = Math.round(damage * 1.15);
    if (u >= 2 && splashRadius > 0) splashRadius += 16;
    if (u >= 3) armorPiercePct = Math.min(1, armorPiercePct + 0.2);
    if (u >= 4) cooldown *= 0.85;
    if (u >= 5) {
      damage = Math.round(damage * 1.25);
      if (splashRadius > 0) slowPct = Math.max(slowPct, 0.2);
    }
  }

  // 5. Light & Chrono Support Track (VALKYRIE, CHRONOMANCER)
  if (tower.type === 'VALKYRIE' || tower.type === 'CHRONOMANCER') {
    const u = upgrades.support ?? 0;
    if (u >= 1) damage = Math.round(damage * 1.14);
    if (u >= 2) auraHastePct = Math.min(0.8, auraHastePct + 0.08);
    if (u >= 3 && healSoldierAmt > 0) healSoldierAmt = Math.round(healSoldierAmt * 1.35);
    if (u >= 4) range = Math.round(range * 1.15);
    if (u >= 5) {
      targetCount += 1;
      cooldown *= 0.9;
    }
  }

  // 9. Global Lethality Track (Crit & True Damage for all towers)
  const leth = upgrades.lethality ?? 0;
  if (leth >= 1) critChance = Math.min(0.85, critChance + 0.06);
  if (leth >= 2) trueDamagePct = Math.min(1, trueDamagePct + 0.06);
  if (leth >= 3) critMult += 0.2;
  if (leth >= 5) {
    trueDamagePct = Math.min(1, trueDamagePct + 0.14);
    critChance = Math.min(0.9, critChance + 0.1);
  }

  // 10. Global Battle Mastery Track (Range & Cooldown; Build Discount handled in cost helper)
  const mast = upgrades.mastery ?? 0;
  if (mast >= 5) {
    range = Math.round(range * 1.15);
  } else if (mast >= 2) {
    range = Math.round(range * 1.05);
  }
  if (mast >= 4) {
    cooldown *= 0.92;
  }

  // Only Mages (Pháp Sư) can slow >50%; all other classes capped at <=25%
  const maxSlowCap = tower.type === 'MAGE' ? 0.78 : 0.25;
  if (slowPct > maxSlowCap) {
    slowPct = maxSlowCap;
  }

  // Level 5+ 2-Branch Combat Stance Split:
  // 1) MULTI: Keeps multi-target count, -20% power
  // 2) FOCUSED: Fewer targets, +43% attack speed, +45% power
  let effectivePoisonDps = poisonDps;
  if (tower.level >= 5) {
    const focus: TdCombatFocus = tower.focusBranch ?? 'MULTI';
    if (focus === 'MULTI') {
      damage = Math.round(damage * 0.8);
      soldierDamage = Math.round(soldierDamage * 0.8);
      burnDps = Math.round(burnDps * 0.8);
      effectivePoisonDps = Math.round(effectivePoisonDps * 0.8);
    } else {
      targetCount = targetCount >= 6 ? 2 : 1;
      if (chainCount > 0) {
        chainCount = Math.max(2, Math.floor(chainCount * 0.4));
      }
      if (isGarrisonTower(tower.type)) {
        soldierCount = Math.max(2, Math.floor(soldierCount * 0.65));
      }
      if (splashRadius > 0) {
        splashRadius = Math.max(40, Math.round(splashRadius * 0.72));
      }
      cooldown *= 0.7;
      damage = Math.round(damage * 1.45);
      soldierDamage = Math.round(soldierDamage * 1.45);
      burnDps = Math.round(burnDps * 1.45);
      effectivePoisonDps = Math.round(effectivePoisonDps * 1.45);
    }
  }

  return {
    damage,
    range,
    cooldown,
    targetCount,
    splashRadius,
    slowPct,
    slowSplashRadius,
    poisonDps: effectivePoisonDps,
    poisonSpreadRadius,
    burnDps,
    critChance,
    critMult,
    chainCount,
    auraHastePct,
    healSoldierAmt,
    canHitAir,
    armorPiercePct,
    magicPiercePct,
    trueDamagePct,
    soldierCount,
    soldierHp,
    soldierArmor,
    soldierDamage,
    cleaveRadius,
    soldierRespawn,
  };
}

function getSoldierFormationPos(rallyX: number, rallyY: number, slot: number): TdPoint {
  const offsets: TdPoint[] = [
    { x: -18, y: -9 },
    { x: 18, y: -9 },
    { x: 0, y: 12 },
    { x: -20, y: 11 },
    { x: 20, y: 11 },
    { x: 0, y: -16 },
  ];
  const off = offsets[slot % offsets.length];
  return {
    x: Math.max(20, Math.min(TD_VIEWBOX_W - 20, rallyX + off.x)),
    y: Math.max(20, Math.min(TD_VIEWBOX_H - 20, rallyY + off.y)),
  };
}

function finalizeEnemyDeath(
  w: WorldState,
  upg: TdUpgrades,
  lvl: TdLevelConfig,
  enemy: TdEnemyEntity,
  sourceTowerId?: string
) {
  if (enemy.isDeadProcessed) return;
  enemy.isDeadProcessed = true;

  const bountyMult = upg.economy >= 5 ? 1.25 : upg.economy >= 2 ? 1.12 : 1;
  const earnedGold = Math.round(enemy.bounty * bountyMult);
  w.gold += earnedGold;
  w.score += enemy.bounty * 12;
  w.enemiesSlain += 1;

  if (sourceTowerId) {
    const tw = w.towers.find((t) => t.id === sourceTowerId);
    if (tw) tw.kills += 1;
  }

  // Free engaging soldier
  if (enemy.blockedBySoldierId) {
    const s = w.soldiers.find((sol) => sol.id === enemy.blockedBySoldierId);
    if (s && s.engagedEnemyId === enemy.id) {
      s.engagedEnemyId = null;
    }
    enemy.blockedBySoldierId = null;
  }

  w.effects.push({
    id: `fx-${w.idCounter++}`,
    kind: 'GOLD',
    x: enemy.x,
    y: enemy.y - 12,
    radius: 12,
    label: `+${earnedGold}`,
    ttl: 0.75,
    maxTtl: 0.75,
  });

  // Multi-tier Split on Death (e.g. Brood Mother -> 3 Broodlings -> 2 Mites each!)
  if (!enemy.hasSplit && enemy.splitIntoType && enemy.splitCount > 0) {
    enemy.hasSplit = true;
    const parentSpec = TD_ENEMIES[enemy.type];
    const childSpec = TD_ENEMIES[enemy.splitIntoType];
    const hpRatio = Math.max(1, enemy.maxHp / Math.max(1, parentSpec.baseHp));
    const speedRatio = Math.max(0.8, enemy.speed / Math.max(1, parentSpec.speed));
    const tier10 = Math.floor(w.waveIndex / 10);
    const childMaxHp = Math.max(18, Math.round(childSpec.baseHp * hpRatio * 0.92));
    const childBounty = Math.max(
      2,
      Math.round(childSpec.bounty * (enemy.bountyMult ?? 1))
    );
    const count = enemy.splitCount;

    for (let c = 0; c < count; c++) {
      const ang = (c / count) * Math.PI * 2 + 0.4;
      const spread = count >= 3 ? 13 : 10;
      const cx = Math.max(20, Math.min(TD_VIEWBOX_W - 20, enemy.x + Math.cos(ang) * spread));
      const cy = Math.max(20, Math.min(TD_VIEWBOX_H - 20, enemy.y + Math.sin(ang) * (spread * 0.65)));
      w.enemies.push({
        id: `en-${w.idCounter++}`,
        type: childSpec.type,
        pathIndex: enemy.pathIndex,
        waypointIndex: enemy.waypointIndex,
        x: cx,
        y: cy,
        hp: childMaxHp,
        maxHp: childMaxHp,
        speed: childSpec.speed * speedRatio,
        armor: Math.min(0.84, childSpec.armor * (1 + tier10 * 0.08) + tier10 * 0.03),
        magicResist: Math.min(0.82, childSpec.magicResist * (1 + tier10 * 0.06) + tier10 * 0.025),
        bounty: childBounty,
        bountyMult: enemy.bountyMult,
        lifeCost: childSpec.lifeCost,
        flying: childSpec.flying,
        healsAllies: Boolean(childSpec.healsAllies),
        cleansesAllies: Boolean(childSpec.cleansesAllies),
        selfRegenPct: childSpec.selfRegenPct ?? 0,
        isBoss: Boolean(childSpec.isBoss),
        summonTimer: childSpec.summonInterval ?? 0,
        splitIntoType: childSpec.splitIntoType,
        splitCount: childSpec.splitCount ?? 0,
        radius: childSpec.radius,
        facingLeft: enemy.facingLeft,
        blockedBySoldierId: null,
        attackTimer: 0.4,
        attackAnimTimer: 0,
        healAnimTimer: 0,
        slowTimer: 0,
        slowPct: 0,
        poisonTimer: 0,
        poisonDps: 0,
        poisonTickTimer: 0,
        burnTimer: 0,
        burnDps: 0,
        burnTickTimer: 0,
        healAuraTimer: 2.2,
        hitFlashTimer: 0.14,
        distanceTraveled: Math.max(0, enemy.distanceTraveled - 4 + c),
      });
    }

    const pathPt = lvl.paths[enemy.pathIndex]?.[0];
    if (pathPt || true) {
      w.effects.push({
        id: `fx-${w.idCounter++}`,
        kind: 'HIT',
        x: enemy.x,
        y: enemy.y - 6,
        radius: 18,
        label: `TÁCH x${count}!`,
        color: childSpec.accentColor,
        ttl: 0.55,
        maxTtl: 0.55,
      });
    }
  }
}

function createInitialWorld(levelConfig: TdLevelConfig, upgrades: TdUpgrades): WorldState {
  const startGoldBonus = (upgrades.economy >= 1 ? 60 : 0) + (upgrades.economy >= 4 ? 100 : 0);
  const startLivesBonus =
    (upgrades.citadel >= 1 ? 3 : 0) +
    (upgrades.citadel >= 2 ? 3 : 0) +
    (upgrades.citadel >= 4 ? 4 : 0);
  return {
    gold: levelConfig.startingGold + startGoldBonus,
    lives: levelConfig.startingLives + startLivesBonus,
    score: 0,
    enemiesSlain: 0,
    waveIndex: 0,
    wavePhase: 'PREP',
    prepTimer: 5.0,
    waveClock: 0,
    spawnQueue: [],
    towers: [],
    enemies: [],
    soldiers: [],
    projectiles: [],
    effects: [],
    meteorCd: 0,
    reinforceCd: 0,
    idCounter: 1,
    finished: false,
  };
}

function buildSnapshot(w: WorldState, levelConfig: TdLevelConfig): SnapshotView {
  return {
    gold: w.gold,
    lives: w.lives,
    score: w.score,
    enemiesSlain: w.enemiesSlain,
    waveNumber: Math.min(levelConfig.waves.length, w.waveIndex + 1),
    totalWaves: levelConfig.waves.length,
    wavePhase: w.wavePhase,
    prepTimer: w.prepTimer,
    meteorCd: w.meteorCd,
    reinforceCd: w.reinforceCd,
    towers: [...w.towers],
    enemies: [...w.enemies],
    soldiers: [...w.soldiers],
    projectiles: [...w.projectiles],
    effects: [...w.effects],
  };
}

export const TowerDefenseArenaStage: React.FC<TowerDefenseArenaStageProps> = ({
  levelConfig,
  runNonce,
  upgrades,
  unlockedTowers,
  isPaused,
  isCompactLandscape,
  isFullscreen,
  fsSupported,
  soundEnabled,
  bgmEnabled,
  onTogglePause,
  onResume,
  onExitToLevels,
  onToggleFullscreen,
  onToggleSound,
  onToggleBgm,
  onReplay,
  onWinLevel,
  onLoseLevel,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const worldRef = useRef<WorldState>(createInitialWorld(levelConfig, upgrades));

  const [snap, setSnap] = useState<SnapshotView>(() =>
    buildSnapshot(worldRef.current, levelConfig)
  );
  const [speedMult, setSpeedMult] = useState<1 | 2 | 3 | 4>(1);
  const [autoWave, setAutoWave] = useState<boolean>(false);
  const [selectedPadId, setSelectedPadId] = useState<string | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [targeting, setTargeting] = useState<TargetingMode>({ kind: 'NONE' });

  const speedRef = useRef<1 | 2 | 3 | 4>(speedMult);
  const autoWaveRef = useRef<boolean>(autoWave);
  const pausedRef = useRef<boolean>(isPaused);
  const upgradesRef = useRef<TdUpgrades>(upgrades);
  const levelRef = useRef<TdLevelConfig>(levelConfig);
  const onWinRef = useRef(onWinLevel);
  const onLoseRef = useRef(onLoseLevel);

  useEffect(() => {
    speedRef.current = speedMult;
  }, [speedMult]);

  useEffect(() => {
    autoWaveRef.current = autoWave;
  }, [autoWave]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    upgradesRef.current = upgrades;
  }, [upgrades]);

  useEffect(() => {
    levelRef.current = levelConfig;
  }, [levelConfig]);

  useEffect(() => {
    onWinRef.current = onWinLevel;
    onLoseRef.current = onLoseLevel;
  }, [onWinLevel, onLoseLevel]);

  const unlockedSet = useMemo(
    () => new Set<TdTowerType>(unlockedTowers ?? DEFAULT_UNLOCKED_TOWERS),
    [unlockedTowers]
  );

  // Reset simulation cleanly on new stage or replay
  useEffect(() => {
    const fresh = createInitialWorld(levelConfig, upgrades);
    worldRef.current = fresh;
    setSnap(buildSnapshot(fresh, levelConfig));
    setSelectedPadId(null);
    setSelectedTowerId(null);
    setTargeting({ kind: 'NONE' });
    setSpeedMult(1);
  }, [levelConfig, runNonce, upgrades]);

  const biomeBgUrl = useMemo(() => {
    if (levelConfig.biome === 'DESERT') return TD_MAP_DESERT_URL;
    if (levelConfig.biome === 'VOLCANO') return TD_MAP_VOLCANO_URL;
    if (levelConfig.biome === 'ICE') return TD_MAP_ICE_URL;
    if (levelConfig.biome === 'ABYSS') return TD_MAP_ABYSS_URL;
    if (levelConfig.biome === 'SKY') return TD_MAP_SKY_URL;
    return TD_MAP_FOREST_URL;
  }, [levelConfig.biome]);

  const pathVisualColors = useMemo(
    () => ({
      outer: levelConfig.mapTheme.roadOuter,
      inner: levelConfig.mapTheme.roadInner,
      dash: levelConfig.mapTheme.roadDash,
    }),
    [levelConfig.mapTheme]
  );

  const triggerWaveNow = useCallback((isEarlyCall: boolean) => {
    const w = worldRef.current;
    const lvl = levelRef.current;
    if (w.finished || w.waveIndex >= lvl.waves.length) return;
    if (w.wavePhase !== 'PREP' && w.wavePhase !== 'CLEARING') return;

    // If previous wave wasn't done clearing, advancing early is allowed once wavePhase === 'PREP'
    if (w.wavePhase !== 'PREP') return;

    const waveCfg = lvl.waves[w.waveIndex];
    if (!waveCfg) return;

    if (isEarlyCall) {
      const bonus = waveCfg.earlyBonusBase + Math.round(w.prepTimer * 2);
      w.gold += bonus;
      w.score += bonus * 5;
      const startPt = lvl.paths[0][0];
      w.effects.push({
        id: `fx-${w.idCounter++}`,
        kind: 'GOLD',
        x: startPt.x + 55,
        y: startPt.y,
        radius: 16,
        label: `+${bonus}g`,
        ttl: 1.1,
        maxTtl: 1.1,
      });
    }

    const queue: PendingSpawn[] = [];
    for (const grp of waveCfg.groups) {
      for (let i = 0; i < grp.count; i++) {
        queue.push({
          enemyType: grp.enemyType,
          pathIndex: Math.min(lvl.paths.length - 1, grp.pathIndex),
          spawnAt: grp.delay + i * grp.interval,
          hpMult: grp.hpMult ?? 1,
          speedMult: grp.speedMult ?? 1,
          armorBonus: grp.armorBonus ?? 0,
          magicResistBonus: grp.magicResistBonus ?? 0,
          bountyMult: grp.bountyMult ?? 1,
        });
      }
    }
    queue.sort((a, b) => a.spawnAt - b.spawnAt);

    w.spawnQueue = queue;
    w.waveClock = 0;
    w.wavePhase = 'SPAWNING';
    if (waveCfg.waveNumber > 1 && waveCfg.waveNumber % 10 === 1) {
      const startPt = lvl.paths[0][0];
      w.effects.push({
        id: `fx-${w.idCounter++}`,
        kind: 'GOLD',
        x: Math.min(TD_VIEWBOX_W - 150, startPt.x + 120),
        y: Math.max(42, startPt.y - 24),
        radius: 20,
        label: `Đợt ${waveCfg.waveNumber}: Quái +Máu/Giáp & +Vàng!`,
        ttl: 2.2,
        maxTtl: 2.2,
      });
    }
    sound.playTdWaveHorn();
  }, []);

  // Main real-time simulation loop
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const applyDamageToEnemy = (
      w: WorldState,
      enemy: TdEnemyEntity,
      rawDmg: number,
      kind: 'PHYSICAL' | 'MAGIC' | 'SPLASH' | 'TRUE',
      sourceTowerId?: string,
      pierceOpts?: { armorPiercePct?: number; magicPiercePct?: number; trueDamagePct?: number }
    ) => {
      if (enemy.hp <= 0) return;
      const upg = upgradesRef.current;
      const lvl = levelRef.current;
      const bossMult =
        upg.lethality >= 4 && (enemy.isBoss || enemy.type === 'MINIBOSS') ? 1.15 : 1;
      const adjDmg = rawDmg * bossMult;
      const truePct = Math.min(1, Math.max(0, pierceOpts?.trueDamagePct ?? 0));
      const truePart = adjDmg * truePct;
      const mitPart = adjDmg * (1 - truePct);
      let effective = mitPart;
      if (kind === 'PHYSICAL' || kind === 'SPLASH') {
        const effArmor = enemy.armor * (1 - Math.min(1, pierceOpts?.armorPiercePct ?? 0));
        effective = mitPart * (1 - effArmor);
      } else if (kind === 'MAGIC') {
        const effMR = enemy.magicResist * (1 - Math.min(1, pierceOpts?.magicPiercePct ?? 0));
        effective = mitPart * (1 - effMR);
      }
      enemy.hp -= Math.max(1, effective + truePart);
      enemy.hitFlashTimer = 0.12;

      if (enemy.hp <= 0) {
        finalizeEnemyDeath(w, upg, lvl, enemy, sourceTowerId);
      }
    };

    const stepSimulation = (dt: number) => {
      const w = worldRef.current;
      const lvl = levelRef.current;
      const upg = upgradesRef.current;
      if (w.finished) return;

      // Cooldowns
      if (w.meteorCd > 0) w.meteorCd = Math.max(0, w.meteorCd - dt);
      if (w.reinforceCd > 0) w.reinforceCd = Math.max(0, w.reinforceCd - dt);

      // Effects TTL
      for (let i = w.effects.length - 1; i >= 0; i--) {
        w.effects[i].ttl -= dt;
        if (w.effects[i].ttl <= 0) {
          w.effects.splice(i, 1);
        }
      }

      // Wave State Machine
      if (w.wavePhase === 'PREP') {
        if (autoWaveRef.current && w.prepTimer <= 3.6) {
          triggerWaveNow(true);
        } else {
          w.prepTimer -= dt;
          if (w.prepTimer <= 0) {
            triggerWaveNow(false);
          }
        }
      } else if (w.wavePhase === 'SPAWNING') {
        w.waveClock += dt;
        while (w.spawnQueue.length > 0 && w.spawnQueue[0].spawnAt <= w.waveClock) {
          const nxt = w.spawnQueue.shift()!;
          const spec = TD_ENEMIES[nxt.enemyType];
          const path = lvl.paths[nxt.pathIndex] ?? lvl.paths[0];
          const start = path[0];
          const jitterY = (Math.random() - 0.5) * 10;
          const maxHp = Math.round(spec.baseHp * nxt.hpMult);
          const tier10 = Math.floor(w.waveIndex / 10);
          w.enemies.push({
            id: `en-${w.idCounter++}`,
            type: nxt.enemyType,
            pathIndex: nxt.pathIndex,
            waypointIndex: 1,
            x: start.x,
            y: start.y + jitterY,
            hp: maxHp,
            maxHp,
            speed: spec.speed * nxt.speedMult,
            armor: Math.min(0.86, spec.armor * (1 + tier10 * 0.08) + nxt.armorBonus),
            magicResist: Math.min(0.84, spec.magicResist * (1 + tier10 * 0.06) + nxt.magicResistBonus),
            bounty: Math.round(spec.bounty * nxt.bountyMult),
            bountyMult: nxt.bountyMult,
            lifeCost: spec.lifeCost,
            flying: spec.flying,
            healsAllies: Boolean(spec.healsAllies),
            cleansesAllies: Boolean(spec.cleansesAllies),
            selfRegenPct: spec.selfRegenPct ?? 0,
            isBoss: Boolean(spec.isBoss),
            summonTimer: spec.summonInterval ? spec.summonInterval * 0.65 : 0,
            splitIntoType: spec.splitIntoType,
            splitCount: spec.splitCount ?? 0,
            radius: spec.radius,
            facingLeft: false,
            blockedBySoldierId: null,
            attackTimer: 0,
            attackAnimTimer: 0,
            healAnimTimer: 0,
            slowTimer: 0,
            slowPct: 0,
            poisonTimer: 0,
            poisonDps: 0,
            poisonTickTimer: 0,
            burnTimer: 0,
            burnDps: 0,
            burnTickTimer: 0,
            healAuraTimer: 2.0,
            hitFlashTimer: 0,
            distanceTraveled: 0,
          });
        }
        if (w.spawnQueue.length === 0) {
          w.wavePhase = 'CLEARING';
        }
      } else if (w.wavePhase === 'CLEARING') {
        if (w.enemies.length === 0) {
          if (w.waveIndex + 1 >= lvl.waves.length) {
            w.wavePhase = 'DONE';
            w.finished = true;
            const stars = w.lives >= 18 ? 3 : w.lives >= 10 ? 2 : 1;
            const finalScore = w.score + w.gold * 4 + w.lives * 120;
            w.score = finalScore;
            sound.playWin();
            onWinRef.current(lvl.level, finalScore, stars, w.lives, w.enemiesSlain);
            return;
          } else {
            w.waveIndex += 1;
            w.wavePhase = 'PREP';
            w.prepTimer = 4.0;
          }
        }
      }

      // Soldiers Update (All soldiers attack simultaneously across Garrison circular radius; respawn after timer)
      const hasteAurasForSoldiers = w.towers.filter(
        (t) => t.type === 'VALKYRIE' || t.type === 'CHRONOMANCER'
      );
      for (let i = w.soldiers.length - 1; i >= 0; i--) {
        const s = w.soldiers[i];
        if (s.isReinforcement) {
          s.ttl -= dt;
          if (s.ttl <= 0) {
            w.soldiers.splice(i, 1);
            continue;
          }
        }

        if (s.isDead) {
          s.respawnTimer -= dt;
          if (s.respawnTimer <= 0) {
            s.isDead = false;
            s.hp = s.maxHp;
            s.x = s.homeX;
            s.y = s.homeY;
            s.engagedEnemyId = null;
          }
          continue;
        }

        // Apply Valkyrie & Chronomancer haste aura to nearby guards as well
        let solHasteMult = 1;
        for (const auraTw of hasteAurasForSoldiers) {
          const auraStats = getEffectiveTowerStats(auraTw, upg);
          if (dist(s.x, s.y, auraTw.x, auraTw.y) <= auraStats.range + 30) {
            solHasteMult = Math.max(solHasteMult, 1 + auraStats.auraHastePct);
          }
        }
        if (s.attackTimer > 0) s.attackTimer -= dt * solHasteMult;
        if (s.attackAnimTimer > 0) s.attackAnimTimer = Math.max(0, s.attackAnimTimer - dt);

        // Search ground enemies inside parent Barracks circular range (can cross multiple roads!)
        const parentTower = s.towerId ? w.towers.find((t) => t.id === s.towerId) : undefined;
        const zoneCenterX = parentTower ? parentTower.x : s.homeX;
        const zoneCenterY = parentTower ? parentTower.y : s.homeY;
        const zoneRadius = parentTower ? getEffectiveTowerStats(parentTower, upg).range : 125;

        let targetEnemy: TdEnemyEntity | undefined;
        let bestDist = Infinity;
        for (const e of w.enemies) {
          if (e.hp <= 0 || e.flying) continue;
          if (dist(e.x, e.y, zoneCenterX, zoneCenterY) <= zoneRadius) {
            const dFromSoldier = dist(e.x, e.y, s.x, s.y);
            if (dFromSoldier < bestDist) {
              bestDist = dFromSoldier;
              targetEnemy = e;
            }
          }
        }
        s.engagedEnemyId = targetEnemy ? targetEnemy.id : null;

        s.isMoving = false;
        if (targetEnemy) {
          const approachAngle = Math.atan2(s.y - targetEnemy.y, s.x - targetEnemy.x);
          const fanOffset = ((s.slotIndex % 3) - 1) * 0.48;
          const slotAngle = approachAngle + fanOffset;
          const targetStopX = targetEnemy.x + Math.cos(slotAngle) * 15;
          const targetStopY = targetEnemy.y + Math.sin(slotAngle) * 10;
          const dToFight = dist(s.x, s.y, targetEnemy.x, targetEnemy.y);

          if (dToFight > 22) {
            const step = 168 * dt;
            const moveDx = targetStopX - s.x;
            const moveDy = targetStopY - s.y;
            const dMove = Math.hypot(moveDx, moveDy);
            if (dMove > 1.5) {
              s.isMoving = true;
              const ratio = Math.min(1, step / dMove);
              s.x += moveDx * ratio;
              s.y += moveDy * ratio;
              if (Math.abs(moveDx) > 0.7) {
                s.facingLeft = moveDx < 0;
              }
            }
          } else if (Math.abs(targetEnemy.x - s.x) > 1.2) {
            s.facingLeft = targetEnemy.x < s.x;
          }

          if (dToFight <= 26 && s.attackTimer <= 0) {
            if (Math.abs(targetEnemy.x - s.x) > 0.8) {
              s.facingLeft = targetEnemy.x < s.x;
            }
            s.attackTimer = s.attackCooldown;
            s.attackAnimTimer = 0.26;
            w.effects.push({
              id: `fx-${w.idCounter++}`,
              kind: 'SLASH',
              x: (s.x + targetEnemy.x) / 2,
              y: targetEnemy.y - 6,
              radius: s.towerBranch === 'BARBARIAN' ? 21 : 15,
              color:
                s.towerBranch === 'PALADIN'
                  ? '#FACC15'
                  : s.towerBranch === 'BARBARIAN'
                    ? '#EF4444'
                    : s.isReinforcement
                      ? '#FDE047'
                      : '#38BDF8',
              facingLeft: s.facingLeft,
              ttl: 0.24,
              maxTtl: 0.24,
            });
            applyDamageToEnemy(w, targetEnemy, s.damage, 'PHYSICAL', s.towerId ?? undefined, {
              armorPiercePct: s.armorPiercePct,
              trueDamagePct: s.trueDamagePct,
            });
            if (s.slowPct && s.slowPct > 0) {
              targetEnemy.slowPct = Math.max(targetEnemy.slowPct, s.slowPct);
              targetEnemy.slowTimer = Math.max(targetEnemy.slowTimer, 2.2);
            }
            const cleaveR = s.cleaveRadius ?? (s.towerBranch === 'BARBARIAN' ? 48 : 0);
            if (cleaveR > 0) {
              for (const nearby of w.enemies) {
                if (nearby.id === targetEnemy.id || nearby.hp <= 0 || nearby.flying) continue;
                if (dist(targetEnemy.x, targetEnemy.y, nearby.x, nearby.y) <= cleaveR) {
                  applyDamageToEnemy(w, nearby, Math.round(s.damage * 0.65), 'PHYSICAL', s.towerId ?? undefined, {
                    armorPiercePct: s.armorPiercePct,
                    trueDamagePct: s.trueDamagePct,
                  });
                  if (s.slowPct && s.slowPct > 0) {
                    nearby.slowPct = Math.max(nearby.slowPct, s.slowPct);
                    nearby.slowTimer = Math.max(nearby.slowTimer, 2.0);
                  }
                }
              }
            }
          }
        } else {
          // Walk back to rally formation facing direction of travel & heal passively
          const dxHome = s.homeX - s.x;
          const dyHome = s.homeY - s.y;
          const dHome = Math.hypot(dxHome, dyHome);
          if (dHome > 2.5) {
            s.isMoving = true;
            const step = 120 * dt;
            const ratio = Math.min(1, step / dHome);
            if (Math.abs(dxHome) > 1.2) {
              s.facingLeft = dxHome < 0;
            }
            s.x += dxHome * ratio;
            s.y += dyHome * ratio;
          } else {
            s.hp = Math.min(s.maxHp, s.hp + s.maxHp * 0.08 * dt);
          }
        }
      }

      // Enemies Update (Monsters march freely past guards & slash nearby guards as they pass)
      for (let i = w.enemies.length - 1; i >= 0; i--) {
        const e = w.enemies[i];
        if (e.hp <= 0) {
          w.enemies.splice(i, 1);
          continue;
        }

        if (e.hitFlashTimer > 0) e.hitFlashTimer = Math.max(0, e.hitFlashTimer - dt);
        if (e.attackAnimTimer > 0) e.attackAnimTimer = Math.max(0, e.attackAnimTimer - dt);
        if (e.healAnimTimer > 0) e.healAnimTimer = Math.max(0, e.healAnimTimer - dt);
        if (e.slowTimer > 0) {
          e.slowTimer -= dt;
          if (e.slowTimer <= 0) e.slowPct = 0;
        }
        if (e.poisonTimer > 0) {
          e.poisonTimer -= dt;
          e.poisonTickTimer -= dt;
          let diedFromPoison = false;
          while (e.poisonTickTimer <= 0 && e.hp > 0 && e.poisonDps > 0) {
            e.poisonTickTimer += 1.0;
            applyDamageToEnemy(w, e, e.poisonDps, 'TRUE', e.poisonSourceTowerId);
            w.effects.push({
              id: `fx-${w.idCounter++}`,
              kind: 'HIT',
              x: e.x,
              y: e.y - 10,
              radius: 10,
              color: '#22C55E',
              ttl: 0.24,
              maxTtl: 0.24,
            });
            if (e.hp <= 0) {
              diedFromPoison = true;
              break;
            }
          }
          if (diedFromPoison) {
            w.enemies.splice(i, 1);
            continue;
          }
          if (e.poisonTimer <= 0) {
            e.poisonTimer = 0;
            e.poisonDps = 0;
            e.poisonTickTimer = 0;
            e.poisonSourceTowerId = undefined;
          }
        }
        if (e.burnTimer > 0) {
          e.burnTimer -= dt;
          e.burnTickTimer -= dt;
          let diedFromBurn = false;
          while (e.burnTickTimer <= 0 && e.hp > 0 && e.burnDps > 0) {
            e.burnTickTimer += 0.5;
            applyDamageToEnemy(w, e, Math.max(1, e.burnDps * 0.5), 'MAGIC', e.burnSourceTowerId, {
              magicPiercePct: 0.35,
            });
            if (e.hp <= 0) {
              diedFromBurn = true;
              break;
            }
          }
          if (diedFromBurn) {
            w.enemies.splice(i, 1);
            continue;
          }
          if (e.burnTimer <= 0) {
            e.burnTimer = 0;
            e.burnDps = 0;
            e.burnTickTimer = 0;
            e.burnSourceTowerId = undefined;
          }
        }

        // Self-regeneration & Boss Enrage (<50% HP)
        if (e.selfRegenPct > 0 && e.hp > 0 && e.hp < e.maxHp) {
          const healMult = getEnemyHealMultiplier(e);
          e.hp = Math.min(e.maxHp, e.hp + e.maxHp * e.selfRegenPct * healMult * dt);
        }
        if (e.isBoss && !e.enraged && e.hp > 0 && e.hp <= e.maxHp * 0.5) {
          e.enraged = true;
          e.speed *= 1.25;
          w.effects.push({
            id: `fx-${w.idCounter++}`,
            kind: 'FIRE_BLAST',
            x: e.x,
            y: e.y - 10,
            radius: 36,
            ttl: 0.45,
            maxTtl: 0.45,
          });
          w.effects.push({
            id: `fx-${w.idCounter++}`,
            kind: 'HIT',
            x: e.x,
            y: e.y - 24,
            radius: 20,
            label: 'CUỒNG NỘ!',
            color: '#EF4444',
            ttl: 0.9,
            maxTtl: 0.9,
          });
        }

        // Boss Summon Minions Ability
        if (e.isBoss && e.summonTimer > 0 && w.enemies.length < 140) {
          e.summonTimer -= dt;
          if (e.summonTimer <= 0) {
            const bossSpec = TD_ENEMIES[e.type];
            e.summonTimer = bossSpec.summonInterval ?? 9.5;
            const summonType: TdEnemyType =
              e.type === 'ABYSS_OVERLORD'
                ? 'SHADOW_REAPER'
                : e.type === 'DOOM_COLOSSUS'
                  ? 'WOLF'
                  : e.type === 'DRAGON_EMPEROR'
                    ? 'WYVERN'
                    : 'BROODLING';
            const sumSpec = TD_ENEMIES[summonType];
            const ratio = Math.max(1, e.maxHp / Math.max(1, bossSpec.baseHp));
            const sumHp = Math.max(60, Math.round(sumSpec.baseHp * ratio * 0.55));
            const tier10 = Math.floor(w.waveIndex / 10);
            for (let m = 0; m < 2; m++) {
              const offset = m === 0 ? -14 : 14;
              w.enemies.push({
                id: `en-${w.idCounter++}`,
                type: summonType,
                pathIndex: e.pathIndex,
                waypointIndex: e.waypointIndex,
                x: Math.max(20, Math.min(TD_VIEWBOX_W - 20, e.x + offset)),
                y: Math.max(20, Math.min(TD_VIEWBOX_H - 20, e.y + (m === 0 ? -8 : 8))),
                hp: sumHp,
                maxHp: sumHp,
                speed: sumSpec.speed * (1 + tier10 * 0.03),
                armor: Math.min(0.8, sumSpec.armor + tier10 * 0.03),
                magicResist: Math.min(0.8, sumSpec.magicResist + tier10 * 0.03),
                bounty: Math.max(4, Math.round(sumSpec.bounty * (e.bountyMult ?? 1) * 0.7)),
                bountyMult: e.bountyMult,
                lifeCost: sumSpec.lifeCost,
                flying: sumSpec.flying,
                healsAllies: Boolean(sumSpec.healsAllies),
                cleansesAllies: Boolean(sumSpec.cleansesAllies),
                selfRegenPct: sumSpec.selfRegenPct ?? 0,
                isBoss: false,
                summonTimer: 0,
                splitIntoType: sumSpec.splitIntoType,
                splitCount: sumSpec.splitCount ?? 0,
                radius: sumSpec.radius,
                facingLeft: e.facingLeft,
                blockedBySoldierId: null,
                attackTimer: 0.5,
                attackAnimTimer: 0,
                healAnimTimer: 0,
                slowTimer: 0,
                slowPct: 0,
                poisonTimer: 0,
                poisonDps: 0,
                poisonTickTimer: 0,
                burnTimer: 0,
                burnDps: 0,
                burnTickTimer: 0,
                healAuraTimer: 2.2,
                hitFlashTimer: 0.15,
                distanceTraveled: e.distanceTraveled,
              });
            }
            w.effects.push({
              id: `fx-${w.idCounter++}`,
              kind: 'HIT',
              x: e.x,
              y: e.y - 26,
              radius: 22,
              label: 'TRIỆU HỒI!',
              color: '#FACC15',
              ttl: 0.75,
              maxTtl: 0.75,
            });
          }
        }

        // Heal & Cleanse Aura (heals allies AND cleanses poison, slow & burn!)
        if (e.healsAllies || e.cleansesAllies) {
          e.healAuraTimer -= dt;
          if (e.healAuraTimer <= 0) {
            e.healAuraTimer = e.isBoss ? 4.2 : 2.8;
            e.healAnimTimer = 0.48;
            let cleansedAny = false;
            let healedAny = false;
            const pulseRadius = e.isBoss ? 135 : 112;
            for (const ally of w.enemies) {
              if (ally.hp > 0 && dist(e.x, e.y, ally.x, ally.y) <= pulseRadius) {
                if ((e.healsAllies || ally.id === e.id) && ally.hp < ally.maxHp) {
                  const healRate = e.isBoss && ally.id === e.id ? 0.045 : 0.14;
                  const healMult = getEnemyHealMultiplier(ally);
                  ally.hp = Math.min(ally.maxHp, ally.hp + ally.maxHp * healRate * healMult);
                  healedAny = true;
                }
                if (ally.poisonTimer > 0 || ally.slowTimer > 0 || ally.burnTimer > 0) {
                  cleansedAny = true;
                }
                ally.poisonTimer = 0;
                ally.poisonDps = 0;
                ally.poisonTickTimer = 0;
                ally.poisonSourceTowerId = undefined;
                ally.slowTimer = 0;
                ally.slowPct = 0;
                ally.burnTimer = 0;
                ally.burnDps = 0;
                ally.burnTickTimer = 0;
                ally.burnSourceTowerId = undefined;
              }
            }
            if (cleansedAny || healedAny) {
              w.effects.push({
                id: `fx-${w.idCounter++}`,
                kind: 'HEAL',
                x: e.x,
                y: e.y,
                radius: e.isBoss ? 105 : 88,
                label: cleansedAny ? 'GIẢI HIỆU ỨNG!' : 'HỒI MÁU!',
                ttl: 0.55,
                maxTtl: 0.55,
              });
            }
          }
        }

        // Non-blocking melee swipe (or Boss AoE Shockwave Slam!) against nearby guards while marching
        if (e.attackTimer > 0) e.attackTimer -= dt;
        if (!e.flying && e.attackTimer <= 0) {
          const reach = e.isBoss ? 62 : 28;
          const guardsHit: TdSoldierEntity[] = [];
          for (const sol of w.soldiers) {
            if (sol.isDead || sol.hp <= 0) continue;
            if (dist(e.x, e.y, sol.x, sol.y) <= reach) {
              guardsHit.push(sol);
            }
          }
          if (guardsHit.length > 0) {
            const targetsToHit = e.isBoss
              ? guardsHit
              : [
                  guardsHit.reduce((best, cur) =>
                    dist(e.x, e.y, cur.x, cur.y) < dist(e.x, e.y, best.x, best.y) ? cur : best
                  ),
                ];
            e.attackTimer = e.isBoss ? 1.15 : e.type === 'MINIBOSS' || e.type === 'VOID_TITAN' ? 1.0 : 0.95;
            e.attackAnimTimer = 0.28;
            const baseEnemyAttackDmg = e.isBoss
              ? e.enraged
                ? 82
                : 64
              : e.type === 'MINIBOSS' || e.type === 'VOID_TITAN'
                ? 40
                : e.type === 'BROOD_MOTHER'
                  ? 30
                  : e.type === 'KNIGHT_DARK' || e.type === 'GOLEM'
                    ? 26
                    : e.type === 'ORC'
                      ? 20
                      : e.type === 'WOLF' || e.type === 'SPIDER' || e.type === 'BROODLING'
                        ? 15
                        : 11;
            const enemyAttackDmg = baseEnemyAttackDmg * (1 + (lvl.level - 1) * 0.045 + w.waveIndex * 0.025);
            const citadelMitigation = upg.citadel >= 5 ? 0.75 : 1;

            if (e.isBoss) {
              w.effects.push({
                id: `fx-${w.idCounter++}`,
                kind: 'EXPLOSION',
                x: e.x,
                y: e.y,
                radius: 56,
                ttl: 0.28,
                maxTtl: 0.28,
              });
            }

            for (const gHit of targetsToHit) {
              const netDmg = Math.max(2, enemyAttackDmg * (1 - gHit.armor) * citadelMitigation);
              gHit.hp -= netDmg;
              w.effects.push({
                id: `fx-${w.idCounter++}`,
                kind: 'MONSTER_HIT',
                x: gHit.x,
                y: gHit.y - 4,
                radius: e.isBoss ? 22 : e.type === 'GOLEM' ? 16 : 12,
                facingLeft: e.facingLeft,
                ttl: 0.22,
                maxTtl: 0.22,
              });
              if (gHit.hp <= 0) {
                gHit.hp = 0;
                gHit.isDead = true;
                gHit.engagedEnemyId = null;
                const parentBarracks = gHit.towerId
                  ? w.towers.find((t) => t.id === gHit.towerId)
                  : undefined;
                gHit.respawnTimer = parentBarracks
                  ? getEffectiveTowerStats(parentBarracks, upg).soldierRespawn
                  : 5.0;
              }
            }
          }
        }

        // Move freely along path waypoints (or slide backward when knocked back!)
        const path = lvl.paths[e.pathIndex] ?? lvl.paths[0];
        const targetWp = path[e.waypointIndex];
        if (!targetWp) {
          // Reached Castle Gate!
          w.lives = Math.max(0, w.lives - e.lifeCost);
          w.enemies.splice(i, 1);
          sound.playTdLeak();
          if (w.lives <= 0 && !w.finished) {
            w.finished = true;
            sound.playGameOver();
            onLoseRef.current(w.enemiesSlain, w.score);
            return;
          }
          continue;
        }

        if (e.knockbackDist && e.knockbackDist > 0) {
          let pushStep = Math.min(e.knockbackDist, 420 * dt);
          e.knockbackDist = Math.max(0, e.knockbackDist - pushStep);
          while (pushStep > 0) {
            const prevIdx = Math.max(0, e.waypointIndex - 1);
            const prevWp = path[prevIdx];
            if (!prevWp) {
              e.knockbackDist = 0;
              break;
            }
            const bx = prevWp.x - e.x;
            const by = prevWp.y - e.y;
            const dPrev = Math.hypot(bx, by);
            if (dPrev <= pushStep) {
              e.x = prevWp.x;
              e.y = prevWp.y;
              e.distanceTraveled = Math.max(0, e.distanceTraveled - dPrev);
              pushStep -= dPrev;
              if (e.waypointIndex > 1) {
                e.waypointIndex -= 1;
              } else {
                e.knockbackDist = 0;
                break;
              }
            } else if (dPrev > 0) {
              e.x += (bx / dPrev) * pushStep;
              e.y += (by / dPrev) * pushStep;
              e.distanceTraveled = Math.max(0, e.distanceTraveled - pushStep);
              pushStep = 0;
            } else {
              e.knockbackDist = 0;
              break;
            }
          }
          continue;
        }

        const dx = targetWp.x - e.x;
        const dy = targetWp.y - e.y;
        const dWp = Math.hypot(dx, dy);
        const burnSpeedBoost = e.burnTimer > 0 ? 1.05 : 1;
        const effSpeed = e.speed * (1 - Math.min(0.78, e.slowPct)) * burnSpeedBoost;
        const moveStep = effSpeed * dt;

        if (dx < -1) e.facingLeft = true;
        else if (dx > 1) e.facingLeft = false;

        if (moveStep >= dWp) {
          e.x = targetWp.x;
          e.y = targetWp.y;
          e.distanceTraveled += dWp;
          e.waypointIndex += 1;
        } else if (dWp > 0) {
          e.x += (dx / dWp) * moveStep;
          e.y += (dy / dWp) * moveStep;
          e.distanceTraveled += moveStep;
        }
      }

      // Compute Valkyrie & Chronomancer Aura Haste positions once per tick
      const hasteAuras = w.towers.filter(
        (t) => t.type === 'VALKYRIE' || t.type === 'CHRONOMANCER'
      );

      // Towers Target Acquisition & Firing
      for (const tw of w.towers) {
        if (tw.recoilTimer > 0) tw.recoilTimer = Math.max(0, tw.recoilTimer - dt);
        if (tw.type === 'BARRACKS') continue;

        // Long Kỵ Sĩ (KNIGHT_GUARD): Ultimate straight-line Dragon Fire Breath every 3s
        if (tw.type === 'KNIGHT_GUARD') {
          tw.specialSkillTimer = Math.max(0, (tw.specialSkillTimer ?? 1.2) - dt);
          if (tw.specialSkillTimer <= 0) {
            const dragonStats = getEffectiveTowerStats(tw, upg);
            let leadTarget: TdEnemyEntity | null = null;
            for (const e of w.enemies) {
              if (e.hp <= 0) continue;
              if (e.flying && !dragonStats.canHitAir) continue;
              if (dist(tw.x, tw.y, e.x, e.y) <= dragonStats.range) {
                if (!leadTarget || e.distanceTraveled > leadTarget.distanceTraveled) {
                  leadTarget = e;
                }
              }
            }
            if (leadTarget) {
              tw.specialSkillTimer = 3.0;
              const dx = leadTarget.x - tw.x;
              const dy = leadTarget.y - tw.y;
              const dLen = Math.max(1, Math.hypot(dx, dy));
              const ux = dx / dLen;
              const uy = dy / dLen;
              const beamLen = Math.max(dragonStats.range, 220);
              const originX = tw.x;
              const originY = tw.y - 8;
              const endX = originX + ux * beamLen;
              const endY = originY + uy * beamLen;
              tw.facingAngle = Math.atan2(dy, dx);
              tw.recoilTimer = 0.34;

              const breathDmg = Math.max(18, Math.round(dragonStats.damage * 1.45));
              const breathBurnDps = Math.max(
                24,
                dragonStats.burnDps > 0 ? dragonStats.burnDps : Math.round(dragonStats.damage * 0.55)
              );

              for (const e of [...w.enemies]) {
                if (e.hp <= 0) continue;
                if (e.flying && !dragonStats.canHitAir) continue;
                const vx = e.x - tw.x;
                const vy = e.y - tw.y;
                const proj = vx * ux + vy * uy;
                const perp = Math.abs(vx * -uy + vy * ux);
                if (proj >= -12 && proj <= beamLen + 16 && perp <= 26 + e.radius * 0.45) {
                  applyDamageToEnemy(w, e, breathDmg, 'MAGIC', tw.id, {
                    magicPiercePct: Math.max(0.35, dragonStats.armorPiercePct * 0.55),
                    trueDamagePct: dragonStats.trueDamagePct,
                  });
                  if (e.hp > 0) {
                    if (e.burnTimer <= 0) e.burnTickTimer = 0.5;
                    e.burnDps = Math.max(e.burnDps, breathBurnDps);
                    e.burnTimer = 4.0;
                    e.burnSourceTowerId = tw.id;
                    // Push enemy back ~5 footsteps along the road
                    const pushAmt = e.isBoss ? 75 : 95;
                    e.knockbackDist = Math.min(140, (e.knockbackDist ?? 0) + pushAmt);
                  }
                }
              }

              w.effects.push({
                id: `fx-${w.idCounter++}`,
                kind: 'FIRE_BREATH',
                x: originX,
                y: originY,
                targetX: endX,
                targetY: endY,
                radius: 26,
                ttl: 0.44,
                maxTtl: 0.44,
              });
              sound.playTdMagic();
            }
          }
        }

        // Check nearby Valkyrie / Chronomancer inspiring haste aura
        let hasteMult = 1;
        for (const auraTw of hasteAuras) {
          if (auraTw.id === tw.id) continue;
          const auraStats = getEffectiveTowerStats(auraTw, upg);
          if (dist(tw.x, tw.y, auraTw.x, auraTw.y) <= auraStats.range) {
            hasteMult = Math.max(hasteMult, 1 + auraStats.auraHastePct);
          }
        }

        if (tw.cooldownTimer > 0) {
          tw.cooldownTimer = Math.max(0, tw.cooldownTimer - dt * hasteMult);
          continue;
        }

        const stats = getEffectiveTowerStats(tw, upg);
        const inRange: TdEnemyEntity[] = [];
        for (const e of w.enemies) {
          if (e.hp <= 0) continue;
          if (e.flying && !stats.canHitAir) continue;
          if (dist(tw.x, tw.y, e.x, e.y) <= stats.range) {
            inRange.push(e);
          }
        }
        if (inRange.length === 0) {
          tw.castWindupTimer = 0;
          tw.castTargetId = null;
          continue;
        }

        inRange.sort((a, b) => b.distanceTraveled - a.distanceTraveled);
        const lockedTarget =
          (tw.castTargetId && inRange.find((e) => e.id === tw.castTargetId)) || inRange[0];

        if (tw.castWindupTimer > 0) {
          tw.castWindupTimer = Math.max(0, tw.castWindupTimer - dt * hasteMult);
          tw.facingAngle = Math.atan2(lockedTarget.y - tw.y, lockedTarget.x - tw.x);
          if (tw.castWindupTimer > 0) {
            continue;
          }
        } else {
          const baseWindup =
            tw.type === 'ARCHER'
              ? 0.23
              : tw.type === 'MAGE' || tw.type === 'PYROMANCER' || tw.type === 'CHRONOMANCER'
                ? 0.22
                : tw.type === 'ARTILLERY' || tw.type === 'MECHANIST'
                  ? 0.2
                  : tw.type === 'VALKYRIE' || tw.type === 'KNIGHT_GUARD'
                    ? 0.19
                    : 0.14;
          const windupDur = Math.min(baseWindup, stats.cooldown * 0.45);
          tw.castWindupMax = windupDur;
          tw.castWindupTimer = windupDur;
          tw.castTargetId = lockedTarget.id;
          tw.facingAngle = Math.atan2(lockedTarget.y - tw.y, lockedTarget.x - tw.x);
          continue;
        }

        const targets = [
          lockedTarget,
          ...inRange.filter((e) => e.id !== lockedTarget.id),
        ].slice(0, Math.max(1, stats.targetCount));
        const primaryTarget = targets[0];

        tw.cooldownTimer = Math.max(0.05, stats.cooldown - tw.castWindupMax);
        tw.recoilTimer = 0.28;
        tw.castTargetId = null;
        tw.facingAngle = Math.atan2(primaryTarget.y - tw.y, primaryTarget.x - tw.x);

        // Valkyrie & Phoenix Pyromancer heal wounded nearby guards when attacking
        if ((tw.type === 'VALKYRIE' || tw.type === 'PYROMANCER') && stats.healSoldierAmt > 0) {
          let healedAny = false;
          for (const sol of w.soldiers) {
            if (!sol.isDead && sol.hp > 0 && sol.hp < sol.maxHp && dist(tw.x, tw.y, sol.x, sol.y) <= stats.range + 40) {
              sol.hp = Math.min(sol.maxHp, sol.hp + stats.healSoldierAmt);
              healedAny = true;
            }
          }
          if (healedAny) {
            w.effects.push({
              id: `fx-${w.idCounter++}`,
              kind: 'HEAL',
              x: tw.x,
              y: tw.y,
              radius: 56,
              ttl: 0.38,
              maxTtl: 0.38,
            });
          }
        }

        // Tesla Coil, Storm Chain & Artillery EMP handle multi-target instant lightning bursts
        if (tw.branch === 'TESLA_COIL' || tw.branch === 'STORM_CHAIN' || tw.mythicPath === 'ARTILLERY_EMP') {
          const chainKind = tw.type === 'ARTILLERY' ? 'SPLASH' : 'MAGIC';
          const pierceOpts = {
            armorPiercePct: stats.armorPiercePct,
            magicPiercePct: stats.magicPiercePct,
            trueDamagePct: stats.trueDamagePct,
          };
          for (const seedTarget of targets) {
            if (seedTarget.hp <= 0) continue;
            const hitSet = new Set<string>([seedTarget.id]);
            let current: TdEnemyEntity = seedTarget;
            applyDamageToEnemy(w, current, stats.damage, chainKind, tw.id, pierceOpts);
            if (stats.slowPct > 0) {
              current.slowPct = Math.max(current.slowPct, stats.slowPct);
              current.slowTimer = 2.6;
            }
            w.effects.push({
              id: `fx-${w.idCounter++}`,
              kind: 'CHAIN',
              x: tw.x,
              y: tw.y - 16,
              targetX: current.x,
              targetY: current.y,
              radius: 3,
              ttl: 0.18,
              maxTtl: 0.18,
            });

            const jumps = Math.max(1, stats.chainCount - 1);
            for (let j = 0; j < jumps; j++) {
              let nextJump: TdEnemyEntity | null = null;
              let nextDist = 135;
              for (const cand of w.enemies) {
                if (cand.hp <= 0 || hitSet.has(cand.id)) continue;
                if (cand.flying && !stats.canHitAir) continue;
                const d = dist(current.x, current.y, cand.x, cand.y);
                if (d <= nextDist) {
                  nextDist = d;
                  nextJump = cand;
                }
              }
              if (!nextJump) break;
              hitSet.add(nextJump.id);
              applyDamageToEnemy(w, nextJump, Math.round(stats.damage * 0.8), chainKind, tw.id, pierceOpts);
              if (stats.slowPct > 0) {
                nextJump.slowPct = Math.max(nextJump.slowPct, stats.slowPct);
                nextJump.slowTimer = 2.4;
              }
              w.effects.push({
                id: `fx-${w.idCounter++}`,
                kind: 'CHAIN',
                x: current.x,
                y: current.y,
                targetX: nextJump.x,
                targetY: nextJump.y,
                radius: 2.5,
                ttl: 0.18,
                maxTtl: 0.18,
              });
              current = nextJump;
            }
          }
          sound.playTdMagic();
          continue;
        }

        // Simultaneous Multi-Target Projectiles
        const kind: TdProjectile['kind'] =
          tw.branch === 'RANGER_POISON'
            ? 'POISON_ARROW'
            : tw.type === 'ARCHER'
              ? 'ARROW'
              : tw.type === 'MAGE'
                ? 'BOLT'
                : tw.type === 'ASSASSIN'
                  ? 'SHURIKEN'
                  : tw.type === 'VALKYRIE' || tw.type === 'KNIGHT_GUARD'
                    ? 'SPEAR'
                    : tw.type === 'PYROMANCER'
                      ? 'FIREBALL'
                      : tw.type === 'MECHANIST'
                        ? 'RAILBOLT'
                        : tw.type === 'CHRONOMANCER'
                          ? 'CHRONO_RAY'
                          : 'BOMB';

        const projDur =
          tw.type === 'ARTILLERY'
            ? 0.32
            : tw.type === 'PYROMANCER'
              ? 0.24
              : tw.type === 'MAGE' || tw.type === 'CHRONOMANCER'
                ? 0.19
                : tw.type === 'ASSASSIN' || tw.type === 'MECHANIST'
                  ? 0.12
                  : tw.type === 'VALKYRIE' || tw.type === 'KNIGHT_GUARD'
                    ? 0.16
                    : 0.14;

        const isMagicType =
          tw.type === 'MAGE' ||
          tw.type === 'VALKYRIE' ||
          tw.type === 'PYROMANCER' ||
          tw.type === 'CHRONOMANCER';

        targets.forEach((tgt, idx) => {
          let finalDmg = stats.damage;
          let isCrit = false;
          if (stats.critChance > 0 && Math.random() < stats.critChance) {
            finalDmg = Math.round(finalDmg * stats.critMult);
            isCrit = true;
          }
          const tgtAngle = Math.atan2(tgt.y - tw.y, tgt.x - tw.x);
          const heroOffsetX = (idx - (targets.length - 1) / 2) * 8;
          const muzzleX = tw.x + heroOffsetX + Math.cos(tgtAngle) * 12;
          const muzzleY = tw.y - 9 + Math.sin(tgtAngle) * 8;

          w.effects.push({
            id: `fx-${w.idCounter++}`,
            kind: 'MUZZLE',
            x: muzzleX,
            y: muzzleY,
            radius:
              tw.type === 'ARTILLERY' || tw.type === 'PYROMANCER'
                ? 13
                : tw.type === 'MAGE' || tw.type === 'VALKYRIE' || tw.type === 'CHRONOMANCER'
                  ? 10
                  : 7,
            label: tw.type,
            ttl: 0.14,
            maxTtl: 0.14,
          });

          w.projectiles.push({
            id: `pr-${w.idCounter++}`,
            kind,
            x: muzzleX,
            y: muzzleY,
            startX: muzzleX,
            startY: muzzleY,
            targetEnemyId: tgt.id,
            targetX: tgt.x,
            targetY: tgt.y,
            progress: 0,
            duration: projDur,
            damage: finalDmg,
            damageKind: isMagicType ? 'MAGIC' : tw.type === 'ARTILLERY' ? 'SPLASH' : 'PHYSICAL',
            splashRadius: stats.splashRadius,
            slowPct: stats.slowPct,
            slowSplashRadius: stats.slowSplashRadius,
            poisonDps: stats.poisonDps,
            poisonSpreadRadius: stats.poisonSpreadRadius,
            burnDps: stats.burnDps,
            chainCount: stats.chainCount,
            armorPierce: isMagicType || tw.type === 'KNIGHT_GUARD' || tw.type === 'MECHANIST',
            armorPiercePct: stats.armorPiercePct,
            magicPiercePct: stats.magicPiercePct,
            trueDamagePct: stats.trueDamagePct,
            isCrit,
            sourceTowerId: tw.id,
          });
        });

        if (tw.type === 'ARCHER' || tw.type === 'ASSASSIN' || tw.type === 'KNIGHT_GUARD') sound.playTdArrow();
        else if (isMagicType) sound.playTdMagic();
        else sound.playTdCannon();
      }

      // Projectiles Travel & Impact
      for (let i = w.projectiles.length - 1; i >= 0; i--) {
        const p = w.projectiles[i];
        const liveTarget = w.enemies.find((e) => e.id === p.targetEnemyId && e.hp > 0);
        if (liveTarget) {
          p.targetX = liveTarget.x;
          p.targetY = liveTarget.y;
        }
        p.progress += dt / p.duration;
        const t = Math.min(1, p.progress);
        const arcH =
          p.kind === 'BOMB'
            ? 44
            : p.kind === 'ARROW' || p.kind === 'POISON_ARROW'
              ? 14
              : p.kind === 'SPEAR'
                ? 5
                : 0;
        const arcLift = arcH > 0 ? Math.sin(t * Math.PI) * arcH : 0;
        p.x = p.startX + (p.targetX - p.startX) * t;
        p.y = p.startY + (p.targetY - p.startY) * t - arcLift;

        if (p.progress >= 1) {
          const pierceOpts = {
            armorPiercePct: p.armorPiercePct,
            magicPiercePct: p.magicPiercePct,
            trueDamagePct: p.trueDamagePct,
          };
          if (p.splashRadius > 0) {
            const splashKind = p.damageKind === 'MAGIC' ? 'MAGIC' : 'SPLASH';
            const canHitFlyingSplash = p.damageKind === 'MAGIC' || p.kind === 'RAILBOLT';
            for (const e of w.enemies) {
              if (e.hp <= 0) continue;
              if (e.flying && !canHitFlyingSplash) continue;
              const d = dist(p.targetX, p.targetY, e.x, e.y);
              if (d <= p.splashRadius) {
                const falloff = d < p.splashRadius * 0.45 ? 1 : 0.72;
                applyDamageToEnemy(w, e, p.damage * falloff, splashKind, p.sourceTowerId, pierceOpts);
                if (p.slowPct > 0 && e.hp > 0) {
                  e.slowPct = Math.max(e.slowPct, p.slowPct);
                  e.slowTimer = Math.max(e.slowTimer, 2.5);
                }
                if (p.burnDps && p.burnDps > 0 && e.hp > 0) {
                  const bDps = Math.max(1, Math.round(p.burnDps * falloff));
                  if (e.burnTimer <= 0) e.burnTickTimer = 0.5;
                  e.burnDps = Math.max(e.burnDps, bDps);
                  e.burnTimer = 4.0;
                  e.burnSourceTowerId = p.sourceTowerId;
                }
              }
            }
            w.effects.push({
              id: `fx-${w.idCounter++}`,
              kind:
                p.kind === 'FIREBALL'
                  ? 'HIT'
                  : p.kind === 'CHRONO_RAY'
                    ? 'CHRONO_PULSE'
                    : 'EXPLOSION',
              x: p.targetX,
              y: p.targetY,
              radius: p.kind === 'FIREBALL' ? 14 : p.splashRadius,
              color: p.kind === 'FIREBALL' ? '#EF4444' : undefined,
              ttl: p.kind === 'FIREBALL' ? 0.22 : 0.34,
              maxTtl: p.kind === 'FIREBALL' ? 0.22 : 0.34,
            });
          } else {
            if (liveTarget) {
              applyDamageToEnemy(w, liveTarget, p.damage, p.damageKind, p.sourceTowerId, pierceOpts);
              if (p.slowPct > 0) {
                liveTarget.slowPct = Math.max(liveTarget.slowPct, p.slowPct);
                liveTarget.slowTimer = 2.6;
              }
              if (p.burnDps && p.burnDps > 0) {
                const bDps = Math.max(1, Math.round(p.burnDps));
                if (liveTarget.burnTimer <= 0) liveTarget.burnTickTimer = 0.5;
                liveTarget.burnDps = Math.max(liveTarget.burnDps, bDps);
                liveTarget.burnTimer = 4.0;
                liveTarget.burnSourceTowerId = p.sourceTowerId;
              }
              if (p.poisonDps > 0) {
                const dmgPerSec = Math.max(1, Math.round(p.poisonDps));
                if (liveTarget.poisonTimer <= 0) {
                  liveTarget.poisonTickTimer = 1.0;
                }
                liveTarget.poisonDps = Math.max(liveTarget.poisonDps, dmgPerSec);
                liveTarget.poisonTimer = 5.0;
                liveTarget.poisonSourceTowerId = p.sourceTowerId;

                if (p.poisonSpreadRadius && p.poisonSpreadRadius > 0) {
                  for (const nearby of w.enemies) {
                    if (nearby.id === liveTarget.id || nearby.hp <= 0) continue;
                    if (dist(liveTarget.x, liveTarget.y, nearby.x, nearby.y) <= p.poisonSpreadRadius) {
                      if (nearby.poisonTimer <= 0) nearby.poisonTickTimer = 1.0;
                      nearby.poisonDps = Math.max(nearby.poisonDps, Math.round(dmgPerSec * 0.75));
                      nearby.poisonTimer = 5.0;
                      nearby.poisonSourceTowerId = p.sourceTowerId;
                    }
                  }
                }
              }
            }
            // Mage / Frost Valkyrie / Chronomancer AoE Slow Pulse
            if (p.slowSplashRadius && p.slowSplashRadius > 0 && p.slowPct > 0) {
              for (const nearby of w.enemies) {
                if (nearby.hp <= 0) continue;
                if (dist(p.targetX, p.targetY, nearby.x, nearby.y) <= p.slowSplashRadius) {
                  nearby.slowPct = Math.max(nearby.slowPct, p.slowPct);
                  nearby.slowTimer = Math.max(nearby.slowTimer, 2.5);
                }
              }
              w.effects.push({
                id: `fx-${w.idCounter++}`,
                kind: p.kind === 'CHRONO_RAY' ? 'CHRONO_PULSE' : 'FROST_NOVA',
                x: p.targetX,
                y: p.targetY,
                radius: p.slowSplashRadius,
                ttl: 0.32,
                maxTtl: 0.32,
              });
            } else {
              w.effects.push({
                id: `fx-${w.idCounter++}`,
                kind: 'HIT',
                x: p.targetX,
                y: p.targetY - 4,
                radius: p.isCrit ? 19 : 12,
                label: p.isCrit ? 'CHÍ MẠNG!' : undefined,
                color: p.isCrit
                  ? '#FACC15'
                  : p.poisonDps > 0
                    ? '#4ADE80'
                    : p.kind === 'FIREBALL' || (p.burnDps ?? 0) > 0
                      ? '#FB923C'
                      : p.kind === 'RAILBOLT'
                        ? '#38BDF8'
                        : p.kind === 'CHRONO_RAY'
                          ? '#C084FC'
                          : p.kind === 'BOLT'
                            ? '#38BDF8'
                            : p.kind === 'SHURIKEN'
                              ? '#FB7185'
                              : p.kind === 'SPEAR'
                                ? '#FEF08A'
                                : '#FDE68A',
                ttl: p.isCrit ? 0.48 : 0.22,
                maxTtl: p.isCrit ? 0.48 : 0.22,
              });
            }
          }
          w.projectiles.splice(i, 1);
        }
      }
    };

    const loop = (now: number) => {
      const rawDt = Math.min(0.05, Math.max(0, (now - lastTs) / 1000));
      lastTs = now;

      if (!pausedRef.current && !worldRef.current.finished) {
        const dt = rawDt * speedRef.current;
        stepSimulation(dt);
        setSnap(buildSnapshot(worldRef.current, levelRef.current));
      }
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [triggerWaveNow]);

  const screenToSvg = useCallback((clientX: number, clientY: number): TdPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const res = pt.matrixTransform(ctm.inverse());
    return {
      x: Math.max(20, Math.min(TD_VIEWBOX_W - 20, res.x)),
      y: Math.max(20, Math.min(TD_VIEWBOX_H - 20, res.y)),
    };
  }, []);

  const handleBuildTower = useCallback(
    (padId: string, type: TdTowerType) => {
      if (!unlockedSet.has(type)) return;
      const w = worldRef.current;
      const pad = levelConfig.buildPads.find((p) => p.id === padId);
      if (!pad) return;
      if (w.towers.some((t) => t.padId === padId)) return;

      const cost = getDiscountedTdCost(TD_TOWERS[type].tiers[0].cost, upgradesRef.current);
      if (w.gold < cost) return;

      w.gold -= cost;
      const towerId = `tw-${w.idCounter++}`;
      const newTower: TdBuiltTower = {
        id: towerId,
        padId,
        type,
        level: 1,
        branch: null,
        focusBranch: null,
        mythicPath: null,
        x: pad.x,
        y: pad.y,
        rallyX: pad.rallyX,
        rallyY: pad.rallyY,
        cooldownTimer: 0.15,
        totalSpent: cost,
        kills: 0,
        facingAngle: 0,
        recoilTimer: 0,
        castWindupTimer: 0,
        castWindupMax: 0.22,
        castTargetId: null,
        specialSkillTimer: type === 'KNIGHT_GUARD' ? 1.2 : undefined,
      };
      w.towers.push(newTower);

      if (isGarrisonTower(type)) {
        const stats = getEffectiveTowerStats(newTower, upgradesRef.current);
        for (let slot = 0; slot < stats.soldierCount; slot++) {
          const pos = getSoldierFormationPos(pad.rallyX, pad.rallyY, slot);
          w.soldiers.push({
            id: `sol-${w.idCounter++}`,
            towerId,
            towerType: type,
            towerLevel: 1,
            towerBranch: null,
            towerMythicPath: null,
            slotIndex: slot,
            x: pad.x,
            y: pad.y,
            homeX: pos.x,
            homeY: pos.y,
            hp: stats.soldierHp,
            maxHp: stats.soldierHp,
            damage: stats.soldierDamage,
            armor: stats.soldierArmor,
            attackCooldown: stats.cooldown,
            attackTimer: 0,
            attackAnimTimer: 0,
            respawnTimer: 0.5 + slot * 1.1, // Staggered training delay when newly built
            isDead: true,
            engagedEnemyId: null,
            isReinforcement: false,
            ttl: 0,
            facingLeft: false,
            armorPiercePct: stats.armorPiercePct,
            trueDamagePct: stats.trueDamagePct,
            cleaveRadius: stats.cleaveRadius,
            slowPct: stats.slowPct,
            burnDps: stats.burnDps,
          });
        }
      }

      sound.playTdBuild();
      setSelectedPadId(null);
      setSelectedTowerId(null);
      setSnap(buildSnapshot(w, levelConfig));
    },
    [levelConfig, unlockedSet]
  );

  const handleUpgradeTower = useCallback(
    (
      towerId: string,
      branchId?: TdBranchId,
      mythicPathId?: TdMythicPathId,
      focusBranch?: TdCombatFocus
    ) => {
      const w = worldRef.current;
      const tw = w.towers.find((t) => t.id === towerId);
      if (!tw) return;

      const cfg = TD_TOWERS[tw.type];
      let baseCost = 0;
      if (tw.level === 1 || tw.level === 2) {
        baseCost = cfg.tiers[tw.level].cost;
      } else if (tw.level === 3 && branchId) {
        const branchCfg = cfg.branches.find((b) => b.id === branchId);
        if (!branchCfg) return;
        baseCost = branchCfg.cost;
      } else if (tw.level === 4 && focusBranch) {
        const extraCost = getExtraTowerUpgradeCost(tw.type, tw.level, tw.branch, tw.mythicPath);
        if (extraCost === null) return;
        baseCost = extraCost;
      } else if (tw.level === 10 && mythicPathId) {
        const mythicCfg = getMythicPathConfig(tw.type, mythicPathId);
        if (!mythicCfg) return;
        baseCost = getMythicUpgradeCost(mythicCfg.cost, tw.focusBranch);
      } else if (tw.level >= 5 && tw.level < TD_MAX_TOWER_LEVEL && tw.level !== 10) {
        const extraCost = getExtraTowerUpgradeCost(
          tw.type,
          tw.level,
          tw.branch,
          tw.mythicPath,
          tw.focusBranch
        );
        if (extraCost === null) return;
        baseCost = extraCost;
      } else {
        return;
      }

      const cost = getDiscountedTdCost(baseCost, upgradesRef.current);
      if (w.gold < cost) return;
      w.gold -= cost;
      tw.totalSpent += cost;
      if (tw.level < 3) {
        tw.level = (tw.level + 1) as TdTowerLevel;
      } else if (tw.level === 3 && branchId) {
        tw.level = 4;
        tw.branch = branchId;
      } else if (tw.level === 4 && focusBranch) {
        tw.level = 5;
        tw.focusBranch = focusBranch;
      } else if (tw.level === 10 && mythicPathId) {
        tw.level = 11;
        tw.mythicPath = mythicPathId;
      } else if (tw.level >= 5 && tw.level < TD_MAX_TOWER_LEVEL) {
        tw.level = (tw.level + 1) as TdTowerLevel;
      }

      // Refresh garrison soldier stats, visual tier/branch/mythic path & staggered training for new slots
      if (isGarrisonTower(tw.type)) {
        const stats = getEffectiveTowerStats(tw, upgradesRef.current);
        const existing = w.soldiers.filter((s) => s.towerId === tw.id);
        if (existing.length > stats.soldierCount) {
          const toRemove = new Set(existing.slice(stats.soldierCount).map((s) => s.id));
          for (let i = w.soldiers.length - 1; i >= 0; i--) {
            if (toRemove.has(w.soldiers[i].id)) {
              const rem = w.soldiers[i];
              if (rem.engagedEnemyId) {
                const en = w.enemies.find((e) => e.id === rem.engagedEnemyId);
                if (en && en.blockedBySoldierId === rem.id) en.blockedBySoldierId = null;
              }
              w.soldiers.splice(i, 1);
            }
          }
        }
        const activeExisting = w.soldiers.filter((s) => s.towerId === tw.id);
        for (const s of activeExisting) {
          s.towerType = tw.type;
          s.towerLevel = tw.level;
          s.towerBranch = tw.branch;
          s.towerFocusBranch = tw.focusBranch;
          s.towerMythicPath = tw.mythicPath;
          s.maxHp = stats.soldierHp;
          if (!s.isDead) s.hp = stats.soldierHp;
          s.armor = stats.soldierArmor;
          s.damage = stats.soldierDamage;
          s.attackCooldown = stats.cooldown;
          s.armorPiercePct = stats.armorPiercePct;
          s.trueDamagePct = stats.trueDamagePct;
          s.cleaveRadius = stats.cleaveRadius;
          s.slowPct = stats.slowPct;
          s.burnDps = stats.burnDps;
        }
        for (let slot = activeExisting.length; slot < stats.soldierCount; slot++) {
          const pos = getSoldierFormationPos(tw.rallyX, tw.rallyY, slot);
          w.soldiers.push({
            id: `sol-${w.idCounter++}`,
            towerId: tw.id,
            towerType: tw.type,
            towerLevel: tw.level,
            towerBranch: tw.branch,
            towerFocusBranch: tw.focusBranch,
            towerMythicPath: tw.mythicPath,
            slotIndex: slot,
            x: tw.x,
            y: tw.y,
            homeX: pos.x,
            homeY: pos.y,
            hp: stats.soldierHp,
            maxHp: stats.soldierHp,
            damage: stats.soldierDamage,
            armor: stats.soldierArmor,
            attackCooldown: stats.cooldown,
            attackTimer: 0,
            attackAnimTimer: 0,
            respawnTimer: 1.0 + (slot - activeExisting.length) * 1.1,
            isDead: true,
            engagedEnemyId: null,
            isReinforcement: false,
            ttl: 0,
            facingLeft: false,
            armorPiercePct: stats.armorPiercePct,
            trueDamagePct: stats.trueDamagePct,
            cleaveRadius: stats.cleaveRadius,
            slowPct: stats.slowPct,
            burnDps: stats.burnDps,
          });
        }
      }

      sound.playTdUpgrade();
      setSnap(buildSnapshot(w, levelConfig));
    },
    [levelConfig]
  );

  const handleSellTower = useCallback(
    (towerId: string) => {
      const w = worldRef.current;
      const idx = w.towers.findIndex((t) => t.id === towerId);
      if (idx === -1) return;
      const tw = w.towers[idx];
      const refundRate = getRefundRate(upgradesRef.current);
      w.gold += Math.round(tw.totalSpent * refundRate);

      // Remove linked soldiers cleanly
      for (let i = w.soldiers.length - 1; i >= 0; i--) {
        const s = w.soldiers[i];
        if (s.towerId === tw.id) {
          if (s.engagedEnemyId) {
            const en = w.enemies.find((e) => e.id === s.engagedEnemyId);
            if (en && en.blockedBySoldierId === s.id) en.blockedBySoldierId = null;
          }
          w.soldiers.splice(i, 1);
        }
      }

      w.towers.splice(idx, 1);
      sound.playTdSell();
      setSelectedTowerId(null);
      setTargeting({ kind: 'NONE' });
      setSnap(buildSnapshot(w, levelConfig));
    },
    [levelConfig]
  );

  const handleSvgMapClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (targeting.kind === 'NONE') {
        setSelectedPadId(null);
        setSelectedTowerId(null);
        return;
      }

      const pt = screenToSvg(e.clientX, e.clientY);
      if (!pt) return;
      const w = worldRef.current;
      const upg = upgradesRef.current;

      if (targeting.kind === 'METEOR') {
        const cdScale = upg.spells >= 4 ? 0.68 : upg.spells >= 1 ? 0.82 : 1;
        const dmgMult = upg.spells >= 5 ? 1.75 : upg.spells >= 2 ? 1.35 : 1;
        const baseDmg = Math.round(280 * dmgMult);
        const waveScale = 1 + w.waveIndex * 0.65 + (levelConfig.level - 1) * 0.3;
        const dmg = Math.round(baseDmg * waveScale);
        const radius = 104;
        w.meteorCd = METEOR_BASE_CD * cdScale;

        for (const en of [...w.enemies]) {
          if (en.hp <= 0) continue;
          if (dist(pt.x, pt.y, en.x, en.y) <= radius) {
            en.hp -= dmg;
            en.hitFlashTimer = 0.25;
            if (en.hp <= 0) {
              finalizeEnemyDeath(w, upg, levelConfig, en);
            }
          }
        }
        w.effects.push({
          id: `fx-${w.idCounter++}`,
          kind: 'METEOR',
          x: pt.x,
          y: pt.y,
          radius,
          ttl: 0.55,
          maxTtl: 0.55,
        });
        sound.playTdMeteor();
        setTargeting({ kind: 'NONE' });
        setSnap(buildSnapshot(w, levelConfig));
        return;
      }

      if (targeting.kind === 'REINFORCE') {
        const cdScale = upg.spells >= 4 ? 0.68 : upg.spells >= 1 ? 0.82 : 1;
        const count = upg.spells >= 5 ? 4 : upg.spells >= 3 ? 3 : 2;
        const citadelHpMult = upg.citadel >= 3 ? 1.45 : 1;
        const citadelArmorBonus = upg.citadel >= 3 ? 0.15 : 0;
        const waveBoost = 1 + w.waveIndex * 0.28 + (levelConfig.level - 1) * 0.14;
        w.reinforceCd = REINFORCE_BASE_CD * cdScale;
        const reinHp = Math.round(165 * waveBoost * citadelHpMult);
        for (let i = 0; i < count; i++) {
          const pos = getSoldierFormationPos(pt.x, pt.y, i);
          w.soldiers.push({
            id: `sol-${w.idCounter++}`,
            towerId: null,
            towerBranch: upg.spells >= 5 ? 'PALADIN' : null,
            slotIndex: i,
            x: pos.x,
            y: pos.y,
            homeX: pos.x,
            homeY: pos.y,
            hp: reinHp,
            maxHp: reinHp,
            damage: Math.round((upg.spells >= 5 ? 24 : 18) * waveBoost),
            armor: Math.min(0.78, 0.25 + citadelArmorBonus + w.waveIndex * 0.005),
            attackCooldown: 0.8,
            attackTimer: 0,
            attackAnimTimer: 0,
            respawnTimer: 0,
            isDead: false,
            engagedEnemyId: null,
            isReinforcement: true,
            ttl: 18,
            facingLeft: false,
          });
        }
        sound.playTdBuild();
        setTargeting({ kind: 'NONE' });
        setSnap(buildSnapshot(w, levelConfig));
        return;
      }

      if (targeting.kind === 'RALLY') {
        const tw = w.towers.find((t) => t.id === targeting.towerId);
        if (tw) {
          const stats = getEffectiveTowerStats(tw, upg);
          const d = dist(tw.x, tw.y, pt.x, pt.y);
          let rx = pt.x;
          let ry = pt.y;
          if (d > stats.range) {
            const scale = stats.range / d;
            rx = tw.x + (pt.x - tw.x) * scale;
            ry = tw.y + (pt.y - tw.y) * scale;
          }
          tw.rallyX = rx;
          tw.rallyY = ry;
          for (const s of w.soldiers) {
            if (s.towerId === tw.id) {
              const fPos = getSoldierFormationPos(rx, ry, s.slotIndex);
              s.homeX = fPos.x;
              s.homeY = fPos.y;
              if (s.engagedEnemyId) {
                const en = w.enemies.find((e) => e.id === s.engagedEnemyId);
                if (en && en.blockedBySoldierId === s.id) en.blockedBySoldierId = null;
                s.engagedEnemyId = null;
              }
            }
          }
          sound.playTdBuild();
          setSnap(buildSnapshot(w, levelConfig));
        }
        setTargeting({ kind: 'NONE' });
      }
    },
    [levelConfig, screenToSvg, targeting]
  );

  const selectedTower = useMemo(
    () => snap.towers.find((t) => t.id === selectedTowerId) ?? null,
    [selectedTowerId, snap.towers]
  );

  const selectedPad = useMemo(
    () => levelConfig.buildPads.find((p) => p.id === selectedPadId) ?? null,
    [levelConfig.buildPads, selectedPadId]
  );

  const earlyBonusPreview = useMemo(() => {
    const waveCfg = levelConfig.waves[snap.waveNumber - 1];
    if (!waveCfg) return 0;
    return waveCfg.earlyBonusBase + Math.round(snap.prepTimer * 2);
  }, [levelConfig.waves, snap.prepTimer, snap.waveNumber]);

  const castleGatePt = levelConfig.paths[0][levelConfig.paths[0].length - 1];

  const renderBattlefield = () => (
    <div className="relative w-full h-full flex items-center justify-center bg-[#090F1E] overflow-hidden select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${TD_VIEWBOX_W} ${TD_VIEWBOX_H}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleSvgMapClick}
        className={`w-full h-full max-w-full max-h-full ${
          targeting.kind !== 'NONE' ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        <TdSharedArtworkDefs />
        <defs>
          <radialGradient id="tdMeteorGrad">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#F97316" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Bespoke Biome Terrain Map + Per-Stage Unique Atmosphere Tint & Landmarks */}
        <image
          href={biomeBgUrl}
          x="0"
          y="0"
          width={TD_VIEWBOX_W}
          height={TD_VIEWBOX_H}
          preserveAspectRatio="xMidYMid slice"
        />
        <rect
          x="0"
          y="0"
          width={TD_VIEWBOX_W}
          height={TD_VIEWBOX_H}
          fill={levelConfig.mapTheme.tintColor}
          opacity={levelConfig.mapTheme.tintOpacity}
          className="pointer-events-none"
        />
        {levelConfig.mapTheme.landmarks.map((lm, idx) => (
          <TdMapLandmarkSprite key={`lm-${idx}`} landmark={lm} />
        ))}

        {/* Road & Chokepoint Path Overlay */}
        {levelConfig.paths.map((pts, idx) => {
          const dAttr = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
          return (
            <g key={`path-${idx}`} className="pointer-events-none">
              <path
                d={dAttr}
                fill="none"
                stroke={pathVisualColors.outer}
                strokeWidth="48"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.88"
              />
              <path
                d={dAttr}
                fill="none"
                stroke={pathVisualColors.inner}
                strokeWidth="36"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              <path
                d={dAttr}
                fill="none"
                stroke={pathVisualColors.dash}
                strokeWidth="2.5"
                strokeDasharray="10 14"
                strokeLinecap="round"
                opacity="0.55"
              />
            </g>
          );
        })}

        {/* Swirling Demon Spawn Portal Markers */}
        {levelConfig.paths.map((pts, idx) => (
          <g key={`spawn-${idx}`} transform={`translate(${pts[0].x + 16}, ${pts[0].y})`} className="pointer-events-none">
            <circle cx="0" cy="0" r="19" fill="#450A0A" opacity="0.85" />
            <g className="td-anim-spin">
              <circle cx="0" cy="0" r="16" fill="none" stroke="#EF4444" strokeWidth="2.8" strokeDasharray="7 5" />
              <circle cx="0" cy="0" r="10" fill="none" stroke="#FACC15" strokeWidth="1.8" strokeDasharray="4 4" />
            </g>
            <polygon points="-4,-7 9,0 -4,7" fill="#FEF08A" />
          </g>
        ))}

        {/* Fortified Castle Citadel Gate at Exit */}
        <g transform={`translate(${castleGatePt.x + 12}, ${castleGatePt.y})`} className="pointer-events-none">
          <ellipse cx="0" cy="20" rx="28" ry="8" fill="#0F172A" opacity="0.5" />
          {/* Side Citadel Turrets */}
          <rect x="-25" y="-22" width="12" height="40" rx="3" fill="#475569" stroke="#0F172A" strokeWidth="2" />
          <rect x="13" y="-22" width="12" height="40" rx="3" fill="#475569" stroke="#0F172A" strokeWidth="2" />
          <polygon points="-27,-22 -19,-34 -11,-22" fill="#1D4ED8" stroke="#0F172A" strokeWidth="1.6" />
          <polygon points="11,-22 19,-34 27,-22" fill="#1D4ED8" stroke="#0F172A" strokeWidth="1.6" />
          {/* Main Keep & Battlements */}
          <rect x="-17" y="-28" width="34" height="46" rx="4" fill="#334155" stroke="#0F172A" strokeWidth="2.2" />
          <rect x="-19" y="-34" width="10" height="8" fill="#64748B" stroke="#0F172A" strokeWidth="1.6" />
          <rect x="-5" y="-34" width="10" height="8" fill="#64748B" stroke="#0F172A" strokeWidth="1.6" />
          <rect x="9" y="-34" width="10" height="8" fill="#64748B" stroke="#0F172A" strokeWidth="1.6" />
          {/* Golden Arch Portcullis */}
          <path d="M-10,18 L-10,-2 C-10,-12 10,-12 10,-2 L10,18 Z" fill="#0F172A" stroke="#FACC15" strokeWidth="2" />
          {/* Flickering Gate Torches */}
          <circle cx="-13" cy="2" r="3" fill="#F97316" className="td-anim-torch" />
          <circle cx="13" cy="2" r="3" fill="#F97316" className="td-anim-torch" />
          {/* Waving Royal Banner */}
          <g className="td-anim-banner">
            <line x1="0" y1="-34" x2="0" y2="-50" stroke="#F8FAFC" strokeWidth="2.2" />
            <polygon points="0,-50 15,-44 0,-38" fill="#FACC15" stroke="#0F172A" strokeWidth="1.2" />
          </g>
        </g>

        {/* Selected Tower Range Ring */}
        {selectedTower && (
          <g className="pointer-events-none">
            <circle
              cx={selectedTower.x}
              cy={selectedTower.y}
              r={getEffectiveTowerStats(selectedTower, upgrades).range}
              fill={
                targeting.kind === 'RALLY'
                  ? 'rgba(34,197,94,0.13)'
                  : isGarrisonTower(selectedTower.type)
                    ? 'rgba(250,204,21,0.08)'
                    : 'rgba(56,189,248,0.1)'
              }
              stroke={
                targeting.kind === 'RALLY'
                  ? '#4ADE80'
                  : isGarrisonTower(selectedTower.type)
                    ? '#FACC15'
                    : '#38BDF8'
              }
              strokeWidth="2.2"
              strokeDasharray="6 5"
            />
            {isGarrisonTower(selectedTower.type) && (
              <g transform={`translate(${selectedTower.rallyX}, ${selectedTower.rallyY})`}>
                <circle cx="0" cy="0" r="10" fill="none" stroke="#FACC15" strokeWidth="2" />
                <line x1="0" y1="0" x2="0" y2="-18" stroke="#FACC15" strokeWidth="2.2" />
                <polygon points="0,-18 11,-14 0,-10" fill="#EF4444" />
              </g>
            )}
          </g>
        )}

        {/* Strategic Build Pads */}
        {levelConfig.buildPads.map((pad) => {
          const built = snap.towers.find((t) => t.padId === pad.id);
          if (built) {
            const isSel = selectedTowerId === built.id;
            return (
              <g
                key={pad.id}
                transform={`translate(${built.x}, ${built.y})`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (targeting.kind !== 'NONE') return;
                  setSelectedPadId(null);
                  setSelectedTowerId((prev) => (prev === built.id ? null : built.id));
                }}
                className="cursor-pointer"
              >
                {isSel && (
                  <ellipse cx="0" cy="14" rx="27" ry="12" fill="none" stroke="#FACC15" strokeWidth="2.5" />
                )}
                <TdTowerSprite
                  type={built.type}
                  level={built.level}
                  branch={built.branch}
                  mythicPath={built.mythicPath}
                  facingAngle={built.facingAngle}
                  recoil={built.recoilTimer}
                  windup={
                    built.castWindupTimer > 0 && built.castWindupMax > 0
                      ? 1 - built.castWindupTimer / built.castWindupMax
                      : 0
                  }
                />
                {/* Crisp Level Badge (1..20) & Mythic Star */}
                {(() => {
                  const mythicCfg = getMythicPathConfig(built.type, built.mythicPath);
                  const badgeStroke =
                    built.level >= 20
                      ? '#FACC15'
                      : mythicCfg
                        ? mythicCfg.accentColor
                        : built.level >= 10
                          ? '#E879F9'
                          : built.level >= 4
                            ? '#38BDF8'
                            : '#FACC15';
                  const badgeBg = built.level >= 20 ? '#451A03' : '#0F172A';
                  const labelText = mythicCfg ? `★${built.level}` : `Lv.${built.level}`;
                  return (
                    <g transform="translate(0, 21)" className="pointer-events-none">
                      <rect
                        x="-17"
                        y="-6.5"
                        width="34"
                        height="13"
                        rx="6.5"
                        fill={badgeBg}
                        fillOpacity="0.92"
                        stroke={badgeStroke}
                        strokeWidth={built.level >= 11 ? '1.5' : '1.1'}
                      />
                      <text
                        x="0"
                        y="3.1"
                        textAnchor="middle"
                        fill={built.level >= 20 ? '#FEF08A' : badgeStroke}
                        fontSize="8.5"
                        fontWeight="900"
                      >
                        {labelText}
                      </text>
                    </g>
                  );
                })()}
                {isGarrisonTower(built.type) && (() => {
                  const pending = snap.soldiers
                    .filter((s) => s.towerId === built.id && s.isDead && s.respawnTimer > 0)
                    .sort((a, b) => a.respawnTimer - b.respawnTimer);
                  if (pending.length === 0) return null;
                  return (
                    <text
                      x="0"
                      y="-27"
                      textAnchor="middle"
                      fill="#7DD3FC"
                      stroke="#0F172A"
                      strokeWidth="3"
                      paintOrder="stroke"
                      fontSize="10"
                      fontWeight="800"
                    >
                      ⏳ {pending[0].respawnTimer.toFixed(1)}s
                    </text>
                  );
                })()}
              </g>
            );
          }

          const isSelectedPad = selectedPadId === pad.id;
          return (
            <g
              key={pad.id}
              transform={`translate(${pad.x}, ${pad.y})`}
              onClick={(ev) => {
                ev.stopPropagation();
                if (targeting.kind !== 'NONE') return;
                setSelectedTowerId(null);
                setSelectedPadId((prev) => (prev === pad.id ? null : pad.id));
              }}
              className="cursor-pointer"
            >
              <ellipse cx="0" cy="6" rx="24" ry="12" fill="#0F172A" opacity="0.45" />
              <ellipse
                cx="0"
                cy="3"
                rx="22"
                ry="11.5"
                fill="#334155"
                stroke={isSelectedPad ? '#FACC15' : '#94A3B8'}
                strokeWidth={isSelectedPad ? '3' : '1.8'}
              />
              <ellipse cx="0" cy="2" rx="16" ry="8" fill="#1E293B" stroke="#475569" strokeWidth="1" />
              <circle cx="-13" cy="2" r="2" fill="#94A3B8" />
              <circle cx="13" cy="2" r="2" fill="#94A3B8" />
              <line x1="-6" y1="2" x2="6" y2="2" stroke="#FACC15" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="0" y1="-4" x2="0" y2="8" stroke="#FACC15" strokeWidth="2.4" strokeLinecap="round" />
            </g>
          );
        })}

        {/* Soldiers (Barracks + Knight Guard + Reinforcements) */}
        {snap.soldiers.map(
          (s) =>
            !s.isDead && (
              <g key={s.id} transform={`translate(${s.x}, ${s.y})`} className="pointer-events-none">
                <TdSoldierSprite
                  hpRatio={s.hp / s.maxHp}
                  isReinforcement={s.isReinforcement}
                  facingLeft={s.facingLeft}
                  isAttacking={s.attackAnimTimer > 0}
                  isMoving={Boolean(s.isMoving)}
                  towerType={s.towerType}
                  level={s.towerLevel}
                  branch={s.towerBranch}
                />
              </g>
            )
        )}

        {/* Enemies (sorted by Y for proper 2.5D overlap) */}
        {[...snap.enemies]
          .sort((a, b) => a.y - b.y)
          .map((e) => (
            <g key={e.id} transform={`translate(${e.x}, ${e.y})`} className="pointer-events-none">
              <TdEnemySprite
                type={e.type}
                hpRatio={Math.max(0, e.hp / e.maxHp)}
                hitFlash={e.hitFlashTimer > 0}
                slowed={e.slowTimer > 0}
                poisoned={e.poisonTimer > 0}
                burned={e.burnTimer > 0}
                enraged={Boolean(e.enraged)}
                facingLeft={e.facingLeft}
                isAttacking={e.attackAnimTimer > 0}
                isHealing={e.healAnimTimer > 0}
              />
            </g>
          ))}

        {/* Active Projectiles with Instantaneous Parabolic Tangent Angles & Anime Trails */}
        {snap.projectiles.map((p) => {
          const t = Math.min(1, p.progress);
          const arcH =
            p.kind === 'BOMB'
              ? 44
              : p.kind === 'ARROW' || p.kind === 'POISON_ARROW'
                ? 14
                : p.kind === 'SPEAR'
                  ? 5
                  : 0;
          const arcLift = arcH > 0 ? Math.sin(t * Math.PI) * arcH : 0;
          const vx = p.targetX - p.startX;
          const vy = p.targetY - p.startY - arcH * Math.PI * Math.cos(t * Math.PI);
          const flightAngle = Math.atan2(vy, vx) * (180 / Math.PI);

          if (p.kind === 'BOMB') {
            const altScale = 1 + (arcLift / 44) * 0.36;
            const shadowRx = Math.max(3, 7 - (arcLift / 44) * 2.5);
            return (
              <g key={p.id} transform={`translate(${p.x}, ${p.y})`} className="pointer-events-none">
                {/* 3D Terrain Shadow beneath Flying Cannonball */}
                <ellipse
                  cx="0"
                  cy={arcLift + 4}
                  rx={shadowRx}
                  ry={shadowRx * 0.45}
                  fill="#020617"
                  opacity="0.38"
                />
                <g transform={`scale(${altScale}) rotate(${flightAngle})`}>
                  {/* Fiery Smoke Tail */}
                  <ellipse cx="-10" cy="0" rx="9" ry="3.5" fill="#F97316" opacity="0.45" />
                  <circle cx="-13" cy="-2" r="3" fill="#94A3B8" opacity="0.4" />
                  <circle cx="0" cy="0" r="6.5" fill="#1E293B" stroke="#FB923C" strokeWidth="2" />
                  <circle cx="-2" cy="-2" r="2.2" fill="#E2E8F0" opacity="0.65" />
                  <polygon points="-5,-4 -11,-7 -7,-1" fill="#FEF08A" />
                </g>
              </g>
            );
          }
          if (p.kind === 'BOLT') {
            return (
              <g
                key={p.id}
                transform={`translate(${p.x}, ${p.y}) rotate(${flightAngle})`}
                className="pointer-events-none"
              >
                <path
                  d="M-22,0 Q-11,-5 0,0 Q-11,5 -22,0 Z"
                  fill="#38BDF8"
                  opacity="0.42"
                />
                <path
                  d="M-14,0 Q-6,-3 3,0 Q-6,3 -14,0 Z"
                  fill="#E0F2FE"
                  opacity="0.85"
                />
                <circle cx="2" cy="0" r="5.8" fill="#7DD3FC" stroke="#FFFFFF" strokeWidth="1.5" />
                <polygon points="-6,-4 -10,-7 -7,-2" fill="#FEF08A" />
                <polygon points="-8,4 -12,7 -9,2" fill="#C084FC" />
              </g>
            );
          }
          if (p.kind === 'SHURIKEN') {
            const spinDeg = p.progress * 1080;
            const shurikenColor = p.poisonDps > 0 ? '#4ADE80' : p.isCrit ? '#FACC15' : '#FB7185';
            return (
              <g
                key={p.id}
                transform={`translate(${p.x}, ${p.y})`}
                className="pointer-events-none"
              >
                <g transform={`rotate(${flightAngle})`}>
                  <line x1="-18" y1="0" x2="0" y2="0" stroke={shurikenColor} strokeWidth="2.8" opacity="0.45" strokeLinecap="round" />
                </g>
                <g transform={`rotate(${spinDeg})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="8.5"
                    fill="none"
                    stroke={shurikenColor}
                    strokeWidth="2"
                    strokeDasharray="10 6"
                    opacity="0.65"
                  />
                  <polygon
                    points="0,-8.5 2.4,-2.4 8.5,0 2.4,2.4 0,8.5 -2.4,2.4 -8.5,0 -2.4,-2.4"
                    fill={shurikenColor}
                    stroke="#FFFFFF"
                    strokeWidth="1.1"
                  />
                  <circle cx="0" cy="0" r="1.8" fill="#0F172A" />
                </g>
              </g>
            );
          }
          if (p.kind === 'SPEAR') {
            const spearCol = p.slowPct > 0 ? '#7DD3FC' : (p.burnDps ?? 0) > 0 ? '#FB923C' : '#FEF08A';
            return (
              <g
                key={p.id}
                transform={`translate(${p.x}, ${p.y}) rotate(${flightAngle})`}
                className="pointer-events-none"
              >
                <path d="M-26,0 L-4,-3.5 L0,0 L-4,3.5 Z" fill={spearCol} opacity="0.45" />
                <line x1="-12" y1="0" x2="10" y2="0" stroke={spearCol} strokeWidth="2.6" strokeLinecap="round" />
                <polygon points="10,-3.8 18.5,0 10,3.8" fill="#FFFFFF" stroke={spearCol} strokeWidth="1.1" />
                <path d="M-9,-3.5 L-13,-6 L-7,0 L-13,6 L-9,3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.85" />
              </g>
            );
          }
          if (p.kind === 'FIREBALL') {
            return (
              <g key={p.id} transform={`translate(${p.x}, ${p.y}) rotate(${flightAngle})`} className="pointer-events-none">
                <path d="M-26,0 Q-12,-7 2,0 Q-12,7 -26,0 Z" fill="#EA580C" opacity="0.52" />
                <circle cx="0" cy="0" r="7.2" fill="#F97316" stroke="#FEF08A" strokeWidth="2" />
                <circle cx="1.5" cy="0" r="3.4" fill="#FEF08A" />
              </g>
            );
          }
          if (p.kind === 'RAILBOLT') {
            const rCol = p.isCrit ? '#FACC15' : '#38BDF8';
            return (
              <g key={p.id} transform={`translate(${p.x}, ${p.y}) rotate(${flightAngle})`} className="pointer-events-none">
                <line x1="-26" y1="0" x2="8" y2="0" stroke={rCol} strokeWidth="4.4" opacity="0.48" strokeLinecap="round" />
                <line x1="-18" y1="0" x2="12" y2="0" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" />
                <polygon points="10,-3.5 18,0 10,3.5" fill={rCol} />
              </g>
            );
          }
          if (p.kind === 'CHRONO_RAY') {
            return (
              <g key={p.id} transform={`translate(${p.x}, ${p.y}) rotate(${flightAngle})`} className="pointer-events-none">
                <path d="M-24,0 Q-10,-5 2,0 Q-10,5 -24,0 Z" fill="#A855F7" opacity="0.5" />
                <circle cx="0" cy="0" r="6" fill="#C084FC" stroke="#FEF08A" strokeWidth="1.6" />
                <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#FFFFFF" opacity="0.9" />
              </g>
            );
          }

          const arrowColor = p.isCrit ? '#FACC15' : p.kind === 'POISON_ARROW' ? '#4ADE80' : '#FEF08A';
          return (
            <g
              key={p.id}
              transform={`translate(${p.x}, ${p.y}) rotate(${flightAngle})`}
              className="pointer-events-none"
            >
              {/* Tapered Anime Wind-Streak Trail */}
              <path
                d={`M${p.isCrit ? -28 : -19},0 Q-8,-2.8 3,0 Q-8,2.8 ${p.isCrit ? -28 : -19},0 Z`}
                fill={arrowColor}
                opacity="0.48"
              />
              {p.isCrit && (
                <ellipse cx="4" cy="0" rx="3" ry="6.5" fill="none" stroke="#FEF08A" strokeWidth="1.4" opacity="0.8" />
              )}
              <line
                x1="-8"
                y1="0"
                x2="8"
                y2="0"
                stroke={arrowColor}
                strokeWidth={p.isCrit ? '2.8' : '2.1'}
                strokeLinecap="round"
              />
              <polygon points="8,-2.8 14,0 8,2.8" fill="#FFFFFF" stroke={arrowColor} strokeWidth="0.6" />
              <polygon
                points="-8,-2.5 -11.5,-4.2 -6.5,0 -11.5,4.2 -8,2.5"
                fill={p.kind === 'POISON_ARROW' ? '#22C55E' : '#F87171'}
              />
            </g>
          );
        })}

        {/* Kinetic Multi-Layered Anime Combat & Spell Bursts */}
        {snap.effects.map((fx) => {
          const alpha = Math.max(0, fx.ttl / fx.maxTtl);
          const progress = 1 - alpha;

          if (fx.kind === 'METEOR') {
            const r = fx.radius * (0.65 + progress * 0.65);
            return (
              <g key={fx.id} transform={`translate(${fx.x}, ${fx.y})`} opacity={alpha} className="pointer-events-none">
                <circle cx="0" cy="0" r={r * 1.1} fill="none" stroke="#FEF08A" strokeWidth={4 * alpha} opacity="0.7" />
                <circle cx="0" cy="0" r={r} fill="url(#tdMeteorGrad)" />
                <polygon
                  points={`0,${-r * 1.05} ${r * 0.24},${-r * 0.24} ${r * 1.05},0 ${r * 0.24},${r * 0.24} 0,${r * 1.05} ${-r * 0.24},${r * 0.24} ${-r * 1.05},0 ${-r * 0.24},${-r * 0.24}`}
                  fill="#F97316"
                  opacity="0.65"
                />
                <circle cx="0" cy="0" r={r * 0.42} fill="#FEF08A" opacity="0.85" />
              </g>
            );
          }

          if (fx.kind === 'EXPLOSION') {
            const r = fx.radius * (0.6 + progress * 0.62);
            return (
              <g key={fx.id} transform={`translate(${fx.x}, ${fx.y})`} opacity={alpha} className="pointer-events-none">
                <circle cx="0" cy="0" r={r * 1.08} fill="none" stroke="#FEF08A" strokeWidth={3.2 * alpha} />
                <circle cx="0" cy="0" r={r * 0.85} fill="#F97316" opacity="0.45" />
                <polygon
                  points={`0,${-r * 0.9} ${r * 0.2},${-r * 0.2} ${r * 0.9},0 ${r * 0.2},${r * 0.2} 0,${r * 0.9} ${-r * 0.2},${r * 0.2} ${-r * 0.9},0 ${-r * 0.2},${-r * 0.2}`}
                  fill="#FACC15"
                  opacity="0.82"
                />
                <circle cx="0" cy="0" r={r * 0.35} fill="#FFFFFF" opacity="0.85" />
              </g>
            );
          }

          if (fx.kind === 'FROST_NOVA' || fx.kind === 'CHRONO_PULSE') {
            const isChrono = fx.kind === 'CHRONO_PULSE';
            const r = fx.radius * (0.55 + progress * 0.6);
            return (
              <g
                key={fx.id}
                transform={`translate(${fx.x}, ${fx.y}) rotate(${progress * 35})`}
                opacity={alpha}
                className="pointer-events-none"
              >
                <circle cx="0" cy="0" r={r} fill={isChrono ? '#A855F7' : '#38BDF8'} opacity="0.22" />
                <circle cx="0" cy="0" r={r * 0.95} fill="none" stroke={isChrono ? '#E879F9' : '#7DD3FC'} strokeWidth={3 * alpha} />
                <polygon
                  points={`0,${-r * 0.9} ${r * 0.18},${-r * 0.18} ${r * 0.82},${-r * 0.42} ${r * 0.22},0 ${r * 0.82},${r * 0.42} ${r * 0.18},${r * 0.18} 0,${r * 0.9} ${-r * 0.18},${r * 0.18} ${-r * 0.82},${r * 0.42} ${-r * 0.22},0 ${-r * 0.82},${-r * 0.42} ${-r * 0.18},${-r * 0.18}`}
                  fill={isChrono ? '#FAF5FF' : '#E0F2FE'}
                  stroke={isChrono ? '#FACC15' : '#38BDF8'}
                  strokeWidth="1.2"
                  opacity="0.72"
                />
              </g>
            );
          }

          if (fx.kind === 'FIRE_BLAST') {
            const r = fx.radius * (0.6 + progress * 0.58);
            return (
              <g key={fx.id} transform={`translate(${fx.x}, ${fx.y})`} opacity={alpha} className="pointer-events-none">
                <circle cx="0" cy="0" r={r} fill="#EA580C" opacity="0.32" />
                <circle cx="0" cy="0" r={r * 1.05} fill="none" stroke="#F97316" strokeWidth={3.4 * alpha} />
                <circle cx="0" cy="0" r={r * 0.5} fill="#FEF08A" opacity="0.78" />
              </g>
            );
          }

          if (fx.kind === 'FIRE_BREATH' && fx.targetX !== undefined && fx.targetY !== undefined) {
            const bdx = fx.targetX - fx.x;
            const bdy = fx.targetY - fx.y;
            const beamLen = Math.max(20, Math.hypot(bdx, bdy));
            const beamDeg = (Math.atan2(bdy, bdx) * 180) / Math.PI;
            const pulseW = 1 + Math.sin(progress * Math.PI) * 0.28;
            const surgeX = beamLen * (0.18 + progress * 0.72);
            return (
              <g
                key={fx.id}
                transform={`translate(${fx.x}, ${fx.y}) rotate(${beamDeg})`}
                opacity={alpha}
                className="pointer-events-none"
              >
                {/* Outer Crimson Flame Jet */}
                <path
                  d={`M0,${-6 * pulseW} L${beamLen * 0.88},${-18 * pulseW} L${beamLen},0 L${beamLen * 0.88},${18 * pulseW} L0,${6 * pulseW} Z`}
                  fill="#DC2626"
                  opacity="0.46"
                />
                {/* Mid Blazing Orange Flame Stream */}
                <path
                  d={`M0,${-4 * pulseW} Q${beamLen * 0.45},${-12 * pulseW} ${beamLen * 0.92},${-8 * pulseW} L${beamLen},0 L${beamLen * 0.92},${8 * pulseW} Q${beamLen * 0.45},${12 * pulseW} 0,${4 * pulseW} Z`}
                  fill="#F97316"
                  opacity="0.78"
                />
                {/* Inner White-Gold Dragon Core */}
                <path
                  d={`M0,-2 L${beamLen * 0.88},${-3.8 * pulseW} L${beamLen},0 L${beamLen * 0.88},${3.8 * pulseW} L0,2 Z`}
                  fill="#FEF08A"
                  opacity="0.95"
                />
                {/* Surging Forward Flame Chevron */}
                <polygon
                  points={`${surgeX - 18},-9 ${surgeX + 12},0 ${surgeX - 18},9 ${surgeX - 8},0`}
                  fill="#FFFFFF"
                  opacity="0.82"
                />
                <circle cx="2" cy="0" r={8 * alpha + 3} fill="#FEF08A" opacity="0.85" />
              </g>
            );
          }

          if (fx.kind === 'CHAIN' && fx.targetX !== undefined && fx.targetY !== undefined) {
            const dx = fx.targetX - fx.x;
            const dy = fx.targetY - fx.y;
            const len = Math.max(1, Math.hypot(dx, dy));
            const nx = -dy / len;
            const ny = dx / len;
            const jitterPhase = Math.round(alpha * 12);
            const j1 = Math.sin(jitterPhase * 2.1 + fx.x) * 10;
            const j2 = Math.cos(jitterPhase * 3.3 + fx.y) * 11;
            const j3 = Math.sin(jitterPhase * 4.7 + fx.targetX) * 9;
            const p1x = fx.x + dx * 0.26 + nx * j1;
            const p1y = fx.y + dy * 0.26 + ny * j1;
            const p2x = fx.x + dx * 0.54 + nx * j2;
            const p2y = fx.y + dy * 0.54 + ny * j2;
            const p3x = fx.x + dx * 0.78 + nx * j3;
            const p3y = fx.y + dy * 0.78 + ny * j3;
            const pts = `${fx.x},${fx.y} ${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${fx.targetX},${fx.targetY}`;
            const branchPts = `${p2x},${p2y} ${p2x + nx * 14 + dx * 0.1},${p2y + ny * 14 + dy * 0.1}`;
            return (
              <g key={fx.id} opacity={alpha} className="pointer-events-none">
                <polyline points={pts} fill="none" stroke="#0EA5E9" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.48" />
                <polyline points={pts} fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={branchPts} fill="none" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" />
                <circle cx={fx.targetX} cy={fx.targetY} r={8 * alpha + 3} fill="#E0F2FE" opacity="0.7" />
              </g>
            );
          }

          if (fx.kind === 'SLASH') {
            const dir = fx.facingLeft ? -1 : 1;
            const swingRot = -32 + progress * 82;
            const sc = 0.85 + progress * 0.45;
            const col = fx.color ?? '#38BDF8';
            return (
              <g
                key={fx.id}
                transform={`translate(${fx.x}, ${fx.y}) scale(${dir * sc}, ${sc}) rotate(${swingRot})`}
                opacity={alpha}
                className="pointer-events-none"
              >
                <path
                  d="M-6,-18 Q18,0 -6,18 Q9,0 -6,-18 Z"
                  fill={col}
                  opacity="0.55"
                />
                <path
                  d="M-3,-15 Q15,0 -3,15 Q8,0 -3,-15 Z"
                  fill="#FFFFFF"
                />
                <line x1="6" y1="-7" x2="15" y2="-11" stroke={col} strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="3" x2="17" y2="6" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
              </g>
            );
          }

          if (fx.kind === 'MONSTER_HIT') {
            const dir = fx.facingLeft ? -1 : 1;
            const sc = 0.85 + progress * 0.35;
            return (
              <g
                key={fx.id}
                transform={`translate(${fx.x}, ${fx.y}) scale(${dir * sc}, ${sc})`}
                opacity={alpha}
                className="pointer-events-none"
              >
                <path d="M-9,-12 Q4,-3 9,9" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
                <path d="M-4,-14 Q8,-4 12,6" fill="none" stroke="#FCA5A5" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M-11,-7 Q0,2 6,11" fill="none" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="2" cy="-2" r={fx.radius * 0.42} fill="#EF4444" opacity="0.35" />
              </g>
            );
          }

          if (fx.kind === 'MUZZLE') {
            const color =
              fx.label === 'MAGE'
                ? '#38BDF8'
                : fx.label === 'VALKYRIE'
                  ? '#FEF08A'
                  : fx.label === 'ASSASSIN'
                    ? '#F43F5E'
                    : fx.label === 'ARTILLERY'
                      ? '#FB923C'
                      : '#FEF08A';
            const r = fx.radius * (0.7 + progress * 0.75);
            return (
              <g key={fx.id} transform={`translate(${fx.x}, ${fx.y})`} opacity={alpha} className="pointer-events-none">
                <circle cx="0" cy="0" r={r} fill="none" stroke={color} strokeWidth="2.2" />
                <polygon
                  points={`0,${-r} ${r * 0.25},${-r * 0.25} ${r},0 ${r * 0.25},${r * 0.25} 0,${r} ${-r * 0.25},${r * 0.25} ${-r},0 ${-r * 0.25},${-r * 0.25}`}
                  fill="#FFFFFF"
                  opacity="0.88"
                />
              </g>
            );
          }

          if (fx.kind === 'HEAL') {
            return (
              <g key={fx.id} transform={`translate(${fx.x}, ${fx.y})`} opacity={alpha * 0.9} className="pointer-events-none">
                <circle cx="0" cy="0" r={fx.radius * (0.75 + progress * 0.35)} fill="none" stroke="#2DD4BF" strokeWidth="2.8" strokeDasharray="6 4" />
                <circle cx="0" cy="0" r={fx.radius * 0.5} fill="#2DD4BF" opacity="0.16" />
                <path d="M-8,-14 h4 v-4 h3 v4 h4 v3 h-4 v4 h-3 v-4 h-4 z" fill="#5EEAD4" transform={`translate(0, ${-progress * 10})`} />
                {fx.label && (
                  <text
                    x="0"
                    y={-22 - progress * 14}
                    textAnchor="middle"
                    fill="#99F6E4"
                    stroke="#042F2E"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                    fontSize="10"
                    fontWeight="800"
                  >
                    {fx.label}
                  </text>
                )}
              </g>
            );
          }

          if (fx.kind === 'GOLD' && fx.label) {
            return (
              <text
                key={fx.id}
                x={fx.x}
                y={fx.y - progress * 22}
                textAnchor="middle"
                fill="#FACC15"
                stroke="#0F172A"
                strokeWidth="3"
                paintOrder="stroke"
                fontSize="13"
                fontWeight="800"
                opacity={alpha}
                className="pointer-events-none"
              >
                {fx.label}
              </text>
            );
          }

          const hitColor = fx.color ?? (fx.label ? '#FACC15' : '#FEF08A');
          const r = fx.radius * (0.55 + progress * 0.7);
          return (
            <g key={fx.id} transform={`translate(${fx.x}, ${fx.y})`} opacity={alpha} className="pointer-events-none">
              <circle cx="0" cy="0" r={r * 1.05} fill="none" stroke={hitColor} strokeWidth={2.4 * alpha} />
              <polygon
                points={`0,${-r} ${r * 0.22},${-r * 0.22} ${r},0 ${r * 0.22},${r * 0.22} 0,${r} ${-r * 0.22},${r * 0.22} ${-r},0 ${-r * 0.22},${-r * 0.22}`}
                fill="#FFFFFF"
                stroke={hitColor}
                strokeWidth="1"
              />
              {fx.label && (
                <text
                  x="0"
                  y={-12 - progress * 16}
                  textAnchor="middle"
                  fill="#FACC15"
                  stroke="#0F172A"
                  strokeWidth="3"
                  paintOrder="stroke"
                  fontSize="12"
                  fontWeight="900"
                >
                  {fx.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Targeting Prompt Banner */}
      {targeting.kind !== 'NONE' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0F172A]/95 border-2 border-[#FACC15] text-xs font-bold text-[#FACC15] shadow-xl">
          <span>
            {targeting.kind === 'METEOR'
              ? 'Chạm vào bản đồ để thả Mưa Thiên Thạch!'
              : targeting.kind === 'REINFORCE'
                ? 'Chạm vào đường đi để gọi Quân Tiếp Viện!'
                : 'Chạm điểm chặn mới trong vòng xanh!'}
          </span>
          <button
            type="button"
            onClick={() => setTargeting({ kind: 'NONE' })}
            className="p-1 rounded bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Early Wave Call Floating Trigger with Upcoming Monster Previews */}
      {snap.wavePhase === 'PREP' && !isPaused && targeting.kind === 'NONE' && (() => {
        const upcoming = levelConfig.waves[snap.waveNumber - 1];
        const enemyTypes = upcoming
          ? Array.from(new Set(upcoming.groups.map((g) => g.enemyType))).slice(0, 4)
          : [];
        return (
          <button
            type="button"
            onClick={() => triggerWaveNow(true)}
            className="absolute top-2.5 right-3 z-20 px-3 py-1.5 rounded-xl bg-rose-700/95 hover:bg-rose-600 border-2 border-[#FACC15] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <div className="flex items-center -space-x-1">
              {enemyTypes.map((eType) => (
                <div key={eType} className="w-6 h-6 rounded-md bg-[#0F172A]/80 flex items-center justify-center">
                  <TdEnemyPreview type={eType} className="w-5 h-5" />
                </div>
              ))}
            </div>
            <span>
              Đợt {snap.waveNumber}/{snap.totalWaves} ({Math.ceil(snap.prepTimer)}s)
            </span>
            <span className="font-mono-num text-[#FACC15]">+{earlyBonusPreview}g</span>
          </button>
        );
      })()}

      {/* Compact Build Hero Dock Popover (Shows ONLY Unlocked Buildable Units) */}
      {selectedPad && (() => {
        const buildableTowers = TD_TOWER_BUILD_ORDER.filter((t) => unlockedSet.has(t));
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-fit max-w-[96%] max-h-[65vh] overflow-y-auto rounded-xl bg-[#0F172A]/95 backdrop-blur-md border border-amber-400/80 p-2 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 mb-1.5 px-1">
              <span className="text-[11px] font-extrabold text-amber-300 font-mono-num">
                Xây Binh Chủng ({buildableTowers.length}) · Vàng: {snap.gold}g
              </span>
              <button
                type="button"
                onClick={() => setSelectedPadId(null)}
                aria-label="Đóng bảng chọn binh chủng"
                className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {buildableTowers.map((tType) => {
                const cfg = TD_TOWERS[tType];
                const cost = getDiscountedTdCost(cfg.tiers[0].cost, upgrades);
                const canAfford = snap.gold >= cost;
                const shortTitle =
                  tType === 'ARCHER'
                    ? 'Cung Thủ'
                    : tType === 'BARRACKS'
                      ? 'Vệ Binh'
                      : tType === 'MAGE'
                        ? 'Pháp Sư'
                        : tType === 'ARTILLERY'
                          ? 'Pháo Thủ'
                          : tType === 'ASSASSIN'
                            ? 'Sát Thủ'
                            : tType === 'VALKYRIE'
                              ? 'Thánh Nữ'
                              : tType === 'KNIGHT_GUARD'
                                ? 'Long Kỵ Sĩ'
                                : tType === 'PYROMANCER'
                                  ? 'Hỏa Pháp Sư'
                                  : tType === 'MECHANIST'
                                    ? 'Cơ Giới Sư'
                                    : 'Thời Không';
                return (
                  <button
                    key={tType}
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleBuildTower(selectedPad.id, tType)}
                    className={`w-[78px] sm:w-[86px] rounded-lg p-1.5 border flex flex-col items-center gap-0.5 transition-all ${
                      canAfford
                        ? 'bg-[#1E293B] hover:bg-slate-700 border-amber-400/60 cursor-pointer'
                        : 'bg-slate-900/70 border-slate-800 opacity-45 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-9 h-9 flex items-center justify-center">
                      <TdTowerPreview type={tType} level={1} className="w-9 h-9" />
                    </div>
                    <div className="text-[10px] font-bold text-white leading-tight truncate max-w-full">
                      {shortTitle}
                    </div>
                    <span className="font-mono-num text-[10px] font-extrabold text-[#FACC15]">
                      {cost}g
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Compact Built Hero Inspector / Evolution / Lv10 Mythic / Rally / Sell Popover */}
      {selectedTower && (() => {
        const branchCfg = selectedTower.branch
          ? TD_TOWERS[selectedTower.type].branches.find((b) => b.id === selectedTower.branch)
          : undefined;
        const mythicCfg = getMythicPathConfig(selectedTower.type, selectedTower.mythicPath);
        const eff = getEffectiveTowerStats(selectedTower, upgrades);
        const atkSpd = (1 / eff.cooldown).toFixed(1);
        const refundGold = Math.round(selectedTower.totalSpent * getRefundRate(upgrades));

        return (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-xl max-h-[68vh] overflow-y-auto rounded-xl bg-[#0F172A]/95 backdrop-blur-md border border-sky-400/80 p-2 shadow-2xl flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#1E293B] border border-slate-700 flex items-center justify-center shrink-0">
                  <TdTowerPreview
                    type={selectedTower.type}
                    level={selectedTower.level}
                    branch={selectedTower.branch}
                    mythicPath={selectedTower.mythicPath}
                    className="w-9 h-9"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                    <span className="truncate">
                      {mythicCfg
                        ? mythicCfg.name
                        : branchCfg
                          ? branchCfg.name
                          : TD_TOWERS[selectedTower.type].name}
                    </span>
                    <span className="text-sky-300 font-mono-num shrink-0">
                      Cấp {selectedTower.level}/{TD_MAX_TOWER_LEVEL}
                    </span>
                    {selectedTower.level >= 5 && selectedTower.focusBranch && (
                      <span
                        className={`text-[9px] font-bold px-1 rounded shrink-0 ${
                          selectedTower.focusBranch === 'FOCUSED'
                            ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                            : 'bg-sky-950/90 text-sky-300 border border-sky-500/50'
                        }`}
                      >
                        {selectedTower.focusBranch === 'FOCUSED' ? 'Ít MT' : 'Đa MT'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono-num leading-tight truncate">
                    {(() => {
                      if (selectedTower.type === 'BARRACKS') {
                        const pierceStr = eff.armorPiercePct > 0 ? ` · X.Giáp ${Math.round(eff.armorPiercePct * 100)}%` : '';
                        const trueStr = eff.trueDamagePct > 0 ? ` · Chuẩn ${Math.round(eff.trueDamagePct * 100)}%` : '';
                        return `ST ${eff.soldierDamage} · HP ${eff.soldierHp} · Giáp ${Math.round(eff.soldierArmor * 100)}% · ${eff.soldierCount} lính${pierceStr}${trueStr}`;
                      }
                      if (selectedTower.type === 'KNIGHT_GUARD') {
                        const burnStr = eff.burnDps > 0 ? ` · Đốt ${eff.burnDps}/s` : '';
                        return `${eff.soldierCount} Kỵ (${eff.soldierHp} HP) · Thương ${eff.damage}${burnStr} · Phun lửa 3s (Đẩy ~5 bước) · Hạ ${selectedTower.kills}`;
                      }
                      const slowStr = eff.slowPct > 0 ? ` · Chậm ${Math.round(eff.slowPct * 100)}%` : '';
                      const burnStr = eff.burnDps > 0 ? ` · Đốt ${eff.burnDps}/s` : '';
                      const auraStr = eff.auraHastePct > 0 ? ` · Tốc +${Math.round(eff.auraHastePct * 100)}%` : '';
                      const pierceStr = eff.armorPiercePct > 0 ? ` · X.Giáp ${Math.round(eff.armorPiercePct * 100)}%` : '';
                      const mPierceStr = eff.magicPiercePct > 0 ? ` · X.Kháng ${Math.round(eff.magicPiercePct * 100)}%` : '';
                      const trueStr = eff.trueDamagePct > 0 ? ` · Chuẩn ${Math.round(eff.trueDamagePct * 100)}%` : '';
                      return `ST ${eff.damage} · ${atkSpd}/s · ${
                        eff.chainCount > 0 ? eff.chainCount : eff.targetCount
                      } MT${slowStr}${burnStr}${auraStr}${pierceStr}${mPierceStr}${trueStr} · Hạ ${selectedTower.kills}`;
                    })()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTowerId(null)}
                aria-label="Đóng chi tiết tháp"
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Level 10 -> 11: Compact 4-Card Mythic Awakening Row with Transformed Sprites */}
            {selectedTower.level === 10 && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-300 px-0.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FACC15]" />
                    Thức Tỉnh Cấp 11 (4 Dạng Tối Thượng)
                  </span>
                  <span className="font-mono-num text-slate-300">Vàng: {snap.gold}g</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {TD_MYTHIC_PATHS[selectedTower.type].map((mp) => {
                    const mpCost = getDiscountedTdCost(
                      getMythicUpgradeCost(mp.cost, selectedTower.focusBranch),
                      upgrades
                    );
                    const canAfford = snap.gold >= mpCost;
                    return (
                      <button
                        key={mp.id}
                        type="button"
                        disabled={!canAfford}
                        onClick={() => handleUpgradeTower(selectedTower.id, undefined, mp.id)}
                        className={`p-1.5 rounded-lg border text-center flex flex-col items-center gap-0.5 transition-all ${
                          canAfford
                            ? 'bg-[#1E293B] hover:bg-slate-700 border-amber-400/75 cursor-pointer'
                            : 'bg-slate-900/80 border-slate-800 opacity-45 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-md bg-[#0F172A] flex items-center justify-center shrink-0">
                          <TdTowerPreview
                            type={selectedTower.type}
                            level={11}
                            branch={selectedTower.branch}
                            mythicPath={mp.id}
                            className="w-10 h-10"
                          />
                        </div>
                        <div className="text-[10px] font-extrabold leading-tight truncate max-w-full" style={{ color: mp.accentColor }}>
                          {mp.name}
                        </div>
                        <div className="text-[9px] text-slate-300 line-clamp-2 leading-tight">
                          {mp.shortDesc}
                        </div>
                        <span className="font-mono-num text-[10px] font-extrabold text-[#FACC15]">
                          {mpCost}g
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              {(selectedTower.level === 1 || selectedTower.level === 2) && (() => {
                const nextLv = (selectedTower.level + 1) as 2 | 3;
                const upCost = getDiscountedTdCost(
                  TD_TOWERS[selectedTower.type].tiers[selectedTower.level].cost,
                  upgrades
                );
                const canUp = snap.gold >= upCost;
                return (
                  <button
                    type="button"
                    disabled={!canUp}
                    onClick={() => handleUpgradeTower(selectedTower.id)}
                    className={`flex-1 min-h-[40px] px-2.5 py-1 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 ${
                      canUp
                        ? 'bg-[#FACC15] hover:bg-yellow-300 text-slate-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <TdTowerPreview type={selectedTower.type} level={nextLv} className="w-7 h-7 shrink-0" />
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono-num">
                      Cấp {nextLv}/{TD_MAX_TOWER_LEVEL} · {upCost}g
                    </span>
                  </button>
                );
              })()}

              {selectedTower.level === 3 &&
                TD_TOWERS[selectedTower.type].branches.map((br) => {
                  const brCost = getDiscountedTdCost(br.cost, upgrades);
                  const canAfford = snap.gold >= brCost;
                  return (
                    <button
                      key={br.id}
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleUpgradeTower(selectedTower.id, br.id)}
                      className={`flex-1 min-w-[140px] px-2 py-1 rounded-lg border text-left flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-[#1E293B] hover:bg-slate-700 border-amber-400/80 cursor-pointer'
                          : 'bg-slate-900 border-slate-800 opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-md bg-[#0F172A] flex items-center justify-center shrink-0">
                        <TdTowerPreview
                          type={selectedTower.type}
                          level={4}
                          branch={br.id}
                          className="w-8 h-8"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 text-[11px] font-extrabold text-amber-300">
                          <span className="truncate">{br.name}</span>
                          <span className="font-mono-num shrink-0">{brCost}g</span>
                        </div>
                        <div className="text-[9px] text-slate-300 truncate">{br.shortDesc}</div>
                      </div>
                    </button>
                  );
                })}

              {selectedTower.level === 4 && (() => {
                const upCost = getDiscountedTdCost(
                  getExtraTowerUpgradeCost(
                    selectedTower.type,
                    selectedTower.level,
                    selectedTower.branch,
                    selectedTower.mythicPath
                  ) ?? 0,
                  upgrades
                );
                const canUp = snap.gold >= upCost;
                const multiStats = getEffectiveTowerStats(
                  { ...selectedTower, level: 5, focusBranch: 'MULTI' },
                  upgrades
                );
                const focusedStats = getEffectiveTowerStats(
                  { ...selectedTower, level: 5, focusBranch: 'FOCUSED' },
                  upgrades
                );
                const isBar = selectedTower.type === 'BARRACKS';
                const multiLabel = isBar
                  ? `${multiStats.soldierCount} Lính · ST ${multiStats.soldierDamage} · ${(1 / multiStats.cooldown).toFixed(1)}/s`
                  : `${multiStats.chainCount > 0 ? multiStats.chainCount : multiStats.targetCount} MT · ST ${multiStats.damage} · ${(1 / multiStats.cooldown).toFixed(1)}/s`;
                const focusedLabel = isBar
                  ? `${focusedStats.soldierCount} Lính · ST ${focusedStats.soldierDamage} · ${(1 / focusedStats.cooldown).toFixed(1)}/s`
                  : `${focusedStats.chainCount > 0 ? focusedStats.chainCount : focusedStats.targetCount} MT · ST ${focusedStats.damage} · ${(1 / focusedStats.cooldown).toFixed(1)}/s`;
                return (
                  <>
                    <button
                      type="button"
                      disabled={!canUp}
                      onClick={() => handleUpgradeTower(selectedTower.id, undefined, undefined, 'MULTI')}
                      className={`flex-1 min-w-[140px] px-2 py-1 rounded-lg border text-left flex items-center gap-1.5 ${
                        canUp
                          ? 'bg-[#1E293B] hover:bg-slate-700 border-sky-400/80 cursor-pointer'
                          : 'bg-slate-900 border-slate-800 opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 text-[10px] font-extrabold text-sky-300">
                          <span className="truncate">Cấp 5 · Đa Mục Tiêu (-20% ST)</span>
                          <span className="font-mono-num text-[#FACC15] shrink-0">{upCost}g</span>
                        </div>
                        <div className="text-[9px] text-slate-300 font-mono-num truncate">{multiLabel}</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      disabled={!canUp}
                      onClick={() => handleUpgradeTower(selectedTower.id, undefined, undefined, 'FOCUSED')}
                      className={`flex-1 min-w-[140px] px-2 py-1 rounded-lg border text-left flex items-center gap-1.5 ${
                        canUp
                          ? 'bg-[#1E293B] hover:bg-slate-700 border-rose-400/80 cursor-pointer'
                          : 'bg-slate-900 border-slate-800 opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 text-[10px] font-extrabold text-rose-300">
                          <span className="truncate">Cấp 5 · Ít MT (+Tốc & ++ST)</span>
                          <span className="font-mono-num text-[#FACC15] shrink-0">{upCost}g</span>
                        </div>
                        <div className="text-[9px] text-slate-300 font-mono-num truncate">{focusedLabel}</div>
                      </div>
                    </button>
                  </>
                );
              })()}

              {selectedTower.level >= 5 && selectedTower.level < 10 && (() => {
                const nextLv = (selectedTower.level + 1) as TdTowerLevel;
                const upCost = getDiscountedTdCost(
                  getExtraTowerUpgradeCost(
                    selectedTower.type,
                    selectedTower.level,
                    selectedTower.branch,
                    selectedTower.mythicPath,
                    selectedTower.focusBranch
                  ) ?? 0,
                  upgrades
                );
                const canUp = snap.gold >= upCost;
                return (
                  <button
                    type="button"
                    disabled={!canUp}
                    onClick={() => handleUpgradeTower(selectedTower.id)}
                    className={`flex-1 min-h-[40px] px-2.5 py-1 rounded-lg border font-extrabold text-xs flex items-center justify-center gap-1.5 ${
                      canUp
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 border-sky-300 text-white cursor-pointer'
                        : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <TdTowerPreview
                      type={selectedTower.type}
                      level={nextLv}
                      branch={selectedTower.branch}
                      className="w-7 h-7 shrink-0"
                    />
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono-num truncate">
                      Cấp {nextLv}/{TD_MAX_TOWER_LEVEL} ({upCost}g) ·{' '}
                      {nextLv === 10
                        ? '+24% ST · Mở 4 Dạng Thức Tỉnh'
                        : `+20% ST${
                            selectedTower.focusBranch !== 'FOCUSED' && (nextLv === 7 || nextLv === 9)
                              ? ' · +MT'
                              : ''
                          }`}
                    </span>
                  </button>
                );
              })()}

              {selectedTower.level >= 11 && selectedTower.level < TD_MAX_TOWER_LEVEL && (() => {
                const nextLv = (selectedTower.level + 1) as TdTowerLevel;
                const upCost = getDiscountedTdCost(
                  getExtraTowerUpgradeCost(
                    selectedTower.type,
                    selectedTower.level,
                    selectedTower.branch,
                    selectedTower.mythicPath,
                    selectedTower.focusBranch
                  ) ?? 0,
                  upgrades
                );
                const canUp = snap.gold >= upCost;
                return (
                  <button
                    type="button"
                    disabled={!canUp}
                    onClick={() => handleUpgradeTower(selectedTower.id)}
                    className={`flex-1 min-h-[40px] px-2.5 py-1 rounded-lg border font-extrabold text-xs flex items-center justify-center gap-1.5 ${
                      canUp
                        ? 'bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 border-amber-300 text-white cursor-pointer'
                        : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <TdTowerPreview
                      type={selectedTower.type}
                      level={nextLv}
                      branch={selectedTower.branch}
                      mythicPath={selectedTower.mythicPath}
                      className="w-7 h-7 shrink-0"
                    />
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono-num truncate">
                      Cấp {nextLv}/{TD_MAX_TOWER_LEVEL} ({upCost}g) · +18% ST · +Tốc
                    </span>
                  </button>
                );
              })()}

              {selectedTower.level === TD_MAX_TOWER_LEVEL && (
                <div className="flex-1 min-h-[40px] px-2.5 rounded-lg bg-amber-950/60 border border-amber-400/60 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>
                    Tối Đa ({TD_MAX_TOWER_LEVEL}/{TD_MAX_TOWER_LEVEL})
                    {mythicCfg ? ` · ${mythicCfg.name}` : ''}
                  </span>
                </div>
              )}

              {isGarrisonTower(selectedTower.type) && (
                <button
                  type="button"
                  onClick={() => {
                    setTargeting({ kind: 'RALLY', towerId: selectedTower.id });
                  }}
                  className="min-h-[40px] px-2.5 rounded-lg bg-sky-900/70 hover:bg-sky-800 border border-sky-500/70 text-sky-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Dời cờ</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSellTower(selectedTower.id)}
                className="min-h-[40px] px-2.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="font-mono-num">+{refundGold}g</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4">
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Đang Tạm Dừng
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onResume}
              className="min-h-[46px] px-6 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-sm flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Tiếp tục thủ thành
            </button>
            <button
              type="button"
              onClick={onReplay}
              className="min-h-[46px] px-5 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi lại
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile / Tablet Compact Landscape Layout (44px rails)
  if (isCompactLandscape) {
    return (
      <div className="w-full h-full flex overflow-hidden bg-[#0B1120]">
        {/* Left Slim Status Rail */}
        <aside className="w-11 shrink-0 bg-[#1E293B] border-r border-slate-800 flex flex-col items-stretch justify-between py-1 px-1 gap-1 select-none">
          <button
            type="button"
            onClick={onExitToLevels}
            aria-label="Thoát ra bản đồ"
            className="h-8 flex items-center justify-center rounded-md bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-100 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="rounded-md bg-[#0F172A] px-0.5 py-1 text-center leading-tight">
            <div className="text-[9px] text-slate-400">Ải</div>
            <div className="font-mono-num text-[11px] font-extrabold text-white">
              {levelConfig.level}
            </div>
          </div>

          <div className="rounded-md bg-[#0F172A] px-0.5 py-1 text-center leading-tight">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400 mx-auto" />
            <div className="font-mono-num text-[11px] font-extrabold text-rose-300">
              {snap.lives}
            </div>
          </div>

          <div className="rounded-md bg-[#0F172A] px-0.5 py-1 text-center leading-tight">
            <Coins className="w-3 h-3 text-[#FACC15] mx-auto" />
            <div className="font-mono-num text-[11px] font-extrabold text-[#FACC15]">
              {snap.gold}
            </div>
          </div>

          <div className="rounded-md bg-[#0F172A] px-0.5 py-1 text-center leading-tight">
            <div className="text-[9px] text-slate-400">Đợt</div>
            <div className="font-mono-num text-[9px] whitespace-nowrap font-extrabold text-sky-300">
              {snap.waveNumber}/{snap.totalWaves}
            </div>
          </div>
        </aside>

        {/* Center Battlefield */}
        <main className="relative flex-1 min-w-0 h-full overflow-hidden">
          {renderBattlefield()}
        </main>

        {/* Right Slim Command Rail (Spells, Speed, Auto-Wave, Sound, Pause) */}
        <aside className="w-11 shrink-0 bg-[#0F172A] border-l border-slate-800 py-1 px-1 flex flex-col items-stretch justify-between gap-0.5 select-none">
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
            className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700 flex items-center justify-center text-white cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setSpeedMult((s) => (s >= 4 ? 1 : ((s + 1) as 1 | 2 | 3 | 4)))}
            aria-label="Đổi tốc độ"
            className={`flex-1 min-h-0 rounded-lg border flex flex-col items-center justify-center leading-none cursor-pointer ${
              speedMult >= 4
                ? 'bg-rose-500 border-rose-300 text-white'
                : speedMult === 3
                  ? 'bg-orange-500 border-orange-300 text-slate-950'
                  : speedMult === 2
                    ? 'bg-amber-500 border-yellow-300 text-slate-950'
                    : 'bg-[#1E293B] border-slate-700 text-slate-200'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono-num font-extrabold">{speedMult}x</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoWave((v) => !v)}
            aria-label={autoWave ? 'Tắt tự gọi đợt' : 'Bật tự gọi đợt'}
            className={`flex-1 min-h-0 rounded-lg border flex flex-col items-center justify-center leading-none cursor-pointer ${
              autoWave
                ? 'bg-emerald-600 border-emerald-300 text-white'
                : 'bg-[#1E293B] border-slate-700 text-slate-400'
            }`}
          >
            <Repeat className="w-3 h-3" />
            <span className="text-[8px] font-extrabold">Auto</span>
          </button>

          <button
            type="button"
            disabled={snap.meteorCd > 0}
            onClick={() => {
              setSelectedPadId(null);
              setSelectedTowerId(null);
              setTargeting({ kind: 'METEOR' });
            }}
            aria-label="Mưa Thiên Thạch"
            className={`flex-1 min-h-0 rounded-lg border flex flex-col items-center justify-center leading-none gap-0.5 ${
              targeting.kind === 'METEOR'
                ? 'bg-orange-600 border-[#FACC15] text-white cursor-pointer'
                : snap.meteorCd > 0
                  ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-[#1E293B] border-orange-500/70 text-orange-300 cursor-pointer'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono-num font-bold">
              {snap.meteorCd > 0 ? `${Math.ceil(snap.meteorCd)}` : 'Bom'}
            </span>
          </button>

          <button
            type="button"
            disabled={snap.reinforceCd > 0}
            onClick={() => {
              setSelectedPadId(null);
              setSelectedTowerId(null);
              setTargeting({ kind: 'REINFORCE' });
            }}
            aria-label="Quân Tiếp Viện"
            className={`flex-1 min-h-0 rounded-lg border flex flex-col items-center justify-center leading-none gap-0.5 ${
              targeting.kind === 'REINFORCE'
                ? 'bg-sky-600 border-[#FACC15] text-white cursor-pointer'
                : snap.reinforceCd > 0
                  ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-[#1E293B] border-sky-500/70 text-sky-300 cursor-pointer'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono-num font-bold">
              {snap.reinforceCd > 0 ? `${Math.ceil(snap.reinforceCd)}` : 'Lính'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleBgm}
            aria-label="Nhạc nền"
            className={`flex-1 min-h-0 rounded-lg border flex items-center justify-center cursor-pointer ${
              bgmEnabled && soundEnabled
                ? 'bg-[#1E293B] border-amber-400/50 text-[#FACC15]'
                : 'bg-[#1E293B] border-slate-700 text-slate-500'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label="Âm thanh"
            className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {fsSupported && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label="Toàn màn hình"
              className="flex-1 min-h-0 rounded-lg bg-[#1E293B] border border-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </aside>
      </div>
    );
  }

  // Desktop Fullscreen Landscape Stage
  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120]">
      <header className="w-full px-5 py-2 bg-[#131C31] border-b-2 border-slate-800 shrink-0 shadow-md">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Back & Stage */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onExitToLevels}
              aria-label={`Quay về bản đồ ${TD_MAX_LEVEL} ải`}
              className="p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Castle className="w-5 h-5 text-[#FACC15] shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white truncate">
                Ải {levelConfig.level}/{TD_MAX_LEVEL} · {levelConfig.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {levelConfig.biomeName} · Đợt {snap.waveNumber}/{snap.totalWaves}
              </div>
            </div>
          </div>

          {/* Center: Lives, Gold, Spells */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 font-mono-num text-sm font-extrabold text-rose-300">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{snap.lives}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 font-mono-num text-sm font-extrabold text-[#FACC15]">
              <Coins className="w-4 h-4" />
              <span>{snap.gold}</span>
            </div>

            <button
              type="button"
              disabled={snap.meteorCd > 0}
              onClick={() => {
                setSelectedPadId(null);
                setSelectedTowerId(null);
                setTargeting({ kind: 'METEOR' });
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 ${
                targeting.kind === 'METEOR'
                  ? 'bg-orange-600 border-[#FACC15] text-white cursor-pointer'
                  : snap.meteorCd > 0
                    ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-[#1E293B] hover:bg-slate-700 border-orange-500/70 text-orange-200 cursor-pointer'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Thiên Thạch</span>
              {snap.meteorCd > 0 && (
                <span className="font-mono-num text-slate-400">({Math.ceil(snap.meteorCd)}s)</span>
              )}
            </button>

            <button
              type="button"
              disabled={snap.reinforceCd > 0}
              onClick={() => {
                setSelectedPadId(null);
                setSelectedTowerId(null);
                setTargeting({ kind: 'REINFORCE' });
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 ${
                targeting.kind === 'REINFORCE'
                  ? 'bg-sky-600 border-[#FACC15] text-white cursor-pointer'
                  : snap.reinforceCd > 0
                    ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-[#1E293B] hover:bg-slate-700 border-sky-500/70 text-sky-200 cursor-pointer'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Tiếp Viện</span>
              {snap.reinforceCd > 0 && (
                <span className="font-mono-num text-slate-400">({Math.ceil(snap.reinforceCd)}s)</span>
              )}
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoWave((v) => !v)}
              title="Tự động gọi đợt tiếp theo ngay khi hết quái"
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                autoWave
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{autoWave ? 'Tự gọi: BẬT' : 'Tự gọi đợt'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSpeedMult((s) => (s >= 4 ? 1 : ((s + 1) as 1 | 2 | 3 | 4)))}
              className={`px-3 py-1.5 rounded-xl border font-mono-num text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                speedMult >= 4
                  ? 'bg-rose-500 border-rose-300 text-white'
                  : speedMult === 3
                    ? 'bg-orange-500 border-orange-300 text-slate-950'
                    : speedMult === 2
                      ? 'bg-[#FACC15] border-yellow-300 text-slate-950'
                      : 'bg-[#1E293B] border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{speedMult}x</span>
            </button>

            <button
              type="button"
              onClick={onTogglePause}
              aria-label={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
              className="p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onReplay}
              aria-label="Chơi lại"
              className="p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleBgm}
              aria-label="Nhạc nền"
              className={`p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 cursor-pointer ${
                bgmEnabled && soundEnabled ? 'text-[#FACC15]' : 'text-slate-500'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              aria-label="Âm thanh"
              className="p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {fsSupported && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                aria-label="Toàn màn hình"
                className="p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative flex-1 min-h-0 overflow-hidden">{renderBattlefield()}</main>
    </div>
  );
};
