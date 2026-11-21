export type TdBiomeId = 'FOREST' | 'DESERT' | 'VOLCANO' | 'ICE' | 'ABYSS' | 'SKY';

export type TdTowerType =
  | 'ARCHER'
  | 'BARRACKS'
  | 'MAGE'
  | 'ARTILLERY'
  | 'ASSASSIN'
  | 'VALKYRIE';

export type TdBranchId =
  | 'RANGER_POISON'
  | 'SNIPER_CRIT'
  | 'PALADIN'
  | 'BARBARIAN'
  | 'ARCANE_BEAM'
  | 'STORM_CHAIN'
  | 'BIG_BERTHA'
  | 'TESLA_COIL'
  | 'SHADOW_BLADE'
  | 'VENOM_FANG'
  | 'SOLAR_SERAPH'
  | 'FROST_VALKYRIE';

export type TdEnemyType =
  | 'GOBLIN'
  | 'WOLF'
  | 'ORC'
  | 'SPIDER'
  | 'GOLEM'
  | 'WYVERN'
  | 'HARPY'
  | 'SHAMAN'
  | 'NECRO'
  | 'KNIGHT_DARK'
  | 'MINIBOSS'
  | 'BOSS';

export type TdUpgradeTrackId =
  | 'archery'
  | 'magic'
  | 'barracks'
  | 'economy'
  | 'spells';

export type TdUpgrades = Record<TdUpgradeTrackId, number>;

export interface TdPoint {
  x: number;
  y: number;
}

export interface TdBuildPad {
  id: string;
  x: number;
  y: number;
  rallyX: number;
  rallyY: number;
}

export interface TdMapLandmark {
  kind:
    | 'TREE'
    | 'CRYSTAL'
    | 'LAVA'
    | 'RUIN'
    | 'ICEBERG'
    | 'CAMPFIRE'
    | 'PALM'
    | 'OBELISK'
    | 'SHRINE'
    | 'LANTERN';
  x: number;
  y: number;
  scale?: number;
}

export interface TdMapTheme {
  tintColor: string;
  tintOpacity: number;
  roadOuter: string;
  roadInner: string;
  roadDash: string;
  landmarks: TdMapLandmark[];
}

export interface TdWaveGroup {
  enemyType: TdEnemyType;
  count: number;
  interval: number; // seconds between spawns
  delay: number; // seconds after wave start
  pathIndex: number; // index into levelConfig.paths
  hpMult?: number;
  speedMult?: number;
}

export interface TdWaveConfig {
  waveNumber: number;
  groups: TdWaveGroup[];
  earlyBonusBase: number;
}

export interface TdLevelConfig {
  level: number;
  name: string;
  biome: TdBiomeId;
  biomeName: string;
  difficultyLabel: string;
  startingGold: number;
  startingLives: number;
  paths: TdPoint[][]; // 1000 x 562.5 coordinate space
  buildPads: TdBuildPad[];
  mapTheme: TdMapTheme;
  waves: TdWaveConfig[];
}

export interface TdLevelProgress {
  completed: boolean;
  stars: number; // 1 to 3
  bestScore: number;
  bestLivesLeft: number;
}

export interface TdSaveData {
  highestUnlockedLevel: number;
  totalScore: number;
  levels: Record<number, TdLevelProgress>;
  upgrades: TdUpgrades;
}

export interface TdTowerBranchConfig {
  id: TdBranchId;
  name: string;
  shortDesc: string;
  cost: number;
  damage: number;
  range: number;
  cooldown: number;
  targetCount?: number;
  splashRadius?: number;
  slowPct?: number;
  slowSplashRadius?: number;
  poisonDps?: number;
  critChance?: number;
  chainCount?: number;
  auraHastePct?: number;
  healSoldierAmt?: number;
  soldierCount?: number;
  soldierHp?: number;
  soldierArmor?: number;
  soldierDamage?: number;
  cleaveRadius?: number;
}

export interface TdTowerTierStats {
  damage: number;
  range: number;
  cooldown: number;
  cost: number;
  targetCount?: number;
  splashRadius?: number;
  slowPct?: number;
  slowSplashRadius?: number;
  poisonDps?: number;
  critChance?: number;
  auraHastePct?: number;
  healSoldierAmt?: number;
  soldierCount?: number;
  soldierHp?: number;
  soldierArmor?: number;
  soldierDamage?: number;
  cleaveRadius?: number;
}

export interface TdTowerConfig {
  type: TdTowerType;
  name: string;
  roleLabel: string;
  damageKind: 'PHYSICAL' | 'MAGIC' | 'MELEE' | 'SPLASH';
  canHitAir: boolean;
  tiers: [TdTowerTierStats, TdTowerTierStats, TdTowerTierStats]; // Lv 1, 2, 3
  branches: [TdTowerBranchConfig, TdTowerBranchConfig]; // Lv 4 choices
}

export interface TdEnemySpec {
  type: TdEnemyType;
  name: string;
  baseHp: number;
  speed: number; // SVG units/sec (in 1000 x 562.5)
  armor: number; // 0..0.75 physical reduction
  magicResist: number; // 0..0.75 magic reduction
  bounty: number;
  lifeCost: number;
  flying: boolean;
  healsAllies?: boolean;
  radius: number;
  accentColor: string;
}

// ---------- Live Simulation Entities ----------

export interface TdBuiltTower {
  id: string;
  padId: string;
  type: TdTowerType;
  level: 1 | 2 | 3 | 4;
  branch: TdBranchId | null;
  x: number;
  y: number;
  rallyX: number;
  rallyY: number;
  cooldownTimer: number;
  totalSpent: number;
  kills: number;
  facingAngle: number;
  recoilTimer: number;
  castWindupTimer: number;
  castWindupMax: number;
  castTargetId: string | null;
}

export interface TdEnemyEntity {
  id: string;
  type: TdEnemyType;
  pathIndex: number;
  waypointIndex: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  armor: number;
  magicResist: number;
  bounty: number;
  lifeCost: number;
  flying: boolean;
  healsAllies: boolean;
  radius: number;
  facingLeft: boolean;
  blockedBySoldierId: string | null;
  attackTimer: number;
  attackAnimTimer: number;
  healAnimTimer: number;
  slowTimer: number;
  slowPct: number;
  poisonTimer: number;
  poisonDps: number;
  poisonTickTimer: number;
  poisonSourceTowerId?: string;
  healAuraTimer: number;
  hitFlashTimer: number;
  distanceTraveled: number;
}

export interface TdSoldierEntity {
  id: string;
  towerId: string | null; // null = temporary Reinforcement spell unit
  towerLevel?: 1 | 2 | 3 | 4;
  towerBranch?: TdBranchId | null;
  slotIndex: number;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  hp: number;
  maxHp: number;
  damage: number;
  armor: number;
  attackCooldown: number;
  attackTimer: number;
  attackAnimTimer: number;
  respawnTimer: number;
  isDead: boolean;
  engagedEnemyId: string | null;
  isReinforcement: boolean;
  ttl: number; // remaining seconds for temporary reinforcements
  facingLeft: boolean;
  isMoving?: boolean;
}

export interface TdProjectile {
  id: string;
  kind: 'ARROW' | 'BOLT' | 'BOMB' | 'LIGHTNING' | 'POISON_ARROW' | 'SHURIKEN' | 'SPEAR';
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetEnemyId: string;
  targetX: number;
  targetY: number;
  progress: number; // 0..1
  duration: number;
  damage: number;
  damageKind: 'PHYSICAL' | 'MAGIC' | 'SPLASH';
  splashRadius: number;
  slowPct: number;
  slowSplashRadius?: number;
  poisonDps: number;
  chainCount: number;
  armorPierce: boolean;
  isCrit?: boolean;
  sourceTowerId: string;
}

export interface TdEffectBurst {
  id: string;
  kind:
    | 'HIT'
    | 'EXPLOSION'
    | 'METEOR'
    | 'CHAIN'
    | 'GOLD'
    | 'HEAL'
    | 'SLASH'
    | 'MONSTER_HIT'
    | 'MUZZLE'
    | 'FROST_NOVA';
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  radius: number;
  label?: string;
  color?: string;
  facingLeft?: boolean;
  ttl: number;
  maxTtl: number;
}
