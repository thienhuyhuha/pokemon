export type TdBiomeId = 'FOREST' | 'DESERT' | 'VOLCANO' | 'ICE' | 'ABYSS' | 'SKY';

export type TdTowerLevel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

export type TdTowerType =
  | 'ARCHER'
  | 'BARRACKS'
  | 'MAGE'
  | 'ARTILLERY'
  | 'ASSASSIN'
  | 'VALKYRIE'
  | 'KNIGHT_GUARD'
  | 'PYROMANCER'
  | 'MECHANIST'
  | 'CHRONOMANCER';

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
  | 'FROST_VALKYRIE'
  | 'DRAGON_LANCER'
  | 'AEGIS_WARDEN'
  | 'HELLFIRE_LORD'
  | 'PHOENIX_SAGE'
  | 'RAILGUN_MECH'
  | 'ROCKET_BATTERY'
  | 'TIME_ARCHON'
  | 'VOID_SOVEREIGN';

export type TdMythicPathId =
  // ARCHER (4 post-Lv10 paths)
  | 'ARCHER_BARRAGE'
  | 'ARCHER_PIERCE'
  | 'ARCHER_PLAGUE'
  | 'ARCHER_EAGLE'
  // BARRACKS (4 post-Lv10 paths)
  | 'BARRACKS_LEGION'
  | 'BARRACKS_TITAN'
  | 'BARRACKS_BERSERK'
  | 'BARRACKS_SUNDER'
  // MAGE (4 post-Lv10 paths)
  | 'MAGE_GLACIER'
  | 'MAGE_VOID'
  | 'MAGE_TEMPEST'
  | 'MAGE_METEOR'
  // ARTILLERY (4 post-Lv10 paths)
  | 'ARTILLERY_NUKE'
  | 'ARTILLERY_SHRED'
  | 'ARTILLERY_GATLING'
  | 'ARTILLERY_EMP'
  // ASSASSIN (4 post-Lv10 paths)
  | 'ASSASSIN_PHANTOM'
  | 'ASSASSIN_EXECUTION'
  | 'ASSASSIN_TOXIN'
  | 'ASSASSIN_TRUE'
  // VALKYRIE (4 post-Lv10 paths)
  | 'VALKYRIE_SERAPHIM'
  | 'VALKYRIE_JUDGMENT'
  | 'VALKYRIE_BLIZZARD'
  | 'VALKYRIE_DIVINE'
  // KNIGHT_GUARD (Stage 10 Unlock)
  | 'KNIGHT_DRAGONFIRE'
  | 'KNIGHT_IMMORTAL'
  | 'KNIGHT_CHARGE'
  | 'KNIGHT_VALKYR'
  // PYROMANCER (Stage 15 Unlock)
  | 'PYRO_SUPERNOVA'
  | 'PYRO_INFERNO'
  | 'PYRO_MELTDOWN'
  | 'PYRO_PHOENIX'
  // MECHANIST (Stage 20 Unlock)
  | 'MECH_OMEGA'
  | 'MECH_SWARM'
  | 'MECH_ORBITAL'
  | 'MECH_PIERCER'
  // CHRONOMANCER (Stage 25 Unlock)
  | 'CHRONO_STASIS'
  | 'CHRONO_OBLIVION'
  | 'CHRONO_OVERCLOCK'
  | 'CHRONO_SINGULARITY';

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
  | 'BOSS'
  | 'BROOD_MOTHER'
  | 'BROODLING'
  | 'MITE'
  | 'SHADOW_REAPER'
  | 'VOID_TITAN'
  | 'ABYSS_OVERLORD'
  | 'DRAGON_EMPEROR'
  | 'PLAGUE_HYDRA'
  | 'DOOM_COLOSSUS';

export type TdUpgradeTrackId =
  | 'archery'
  | 'magic'
  | 'barracks'
  | 'artillery'
  | 'support'
  | 'economy'
  | 'spells'
  | 'citadel'
  | 'lethality'
  | 'mastery';

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
  armorBonus?: number;
  magicResistBonus?: number;
  bountyMult?: number;
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
  burnDps?: number;
  critChance?: number;
  chainCount?: number;
  auraHastePct?: number;
  healSoldierAmt?: number;
  soldierCount?: number;
  soldierHp?: number;
  soldierArmor?: number;
  soldierDamage?: number;
  cleaveRadius?: number;
  innateArmorPiercePct?: number;
  innateMagicPiercePct?: number;
  innateTrueDamagePct?: number;
}

export interface TdMythicPathConfig {
  id: TdMythicPathId;
  towerType: TdTowerType;
  name: string;
  shortDesc: string;
  accentColor: string;
  cost: number;
  damageMult?: number;
  rangeMult?: number;
  cooldownMult?: number;
  bonusTargets?: number;
  armorPiercePct?: number;
  magicPiercePct?: number;
  trueDamagePct?: number;
  splashRadiusBonus?: number;
  slowPctBonus?: number;
  slowSplashBonus?: number;
  poisonMult?: number;
  poisonSpreadRadius?: number;
  burnMult?: number;
  critChanceBonus?: number;
  critMultBonus?: number;
  chainBonus?: number;
  auraHasteBonus?: number;
  healSoldierMult?: number;
  soldierCountBonus?: number;
  soldierHpMult?: number;
  soldierArmorBonus?: number;
  soldierDamageMult?: number;
  soldierRespawnOverride?: number;
  cleaveRadiusBonus?: number;
  grantCanHitAir?: boolean;
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
  burnDps?: number;
  critChance?: number;
  auraHastePct?: number;
  healSoldierAmt?: number;
  soldierCount?: number;
  soldierHp?: number;
  soldierArmor?: number;
  soldierDamage?: number;
  cleaveRadius?: number;
  innateArmorPiercePct?: number;
  innateMagicPiercePct?: number;
  innateTrueDamagePct?: number;
}

export interface TdTowerConfig {
  type: TdTowerType;
  name: string;
  roleLabel: string;
  damageKind: 'PHYSICAL' | 'MAGIC' | 'MELEE' | 'SPLASH';
  canHitAir: boolean;
  unlockStage?: number;
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
  cleansesAllies?: boolean;
  selfRegenPct?: number;
  isBoss?: boolean;
  summonInterval?: number;
  splitIntoType?: TdEnemyType;
  splitCount?: number;
  radius: number;
  accentColor: string;
}

// ---------- Live Simulation Entities ----------

export interface TdBuiltTower {
  id: string;
  padId: string;
  type: TdTowerType;
  level: TdTowerLevel;
  branch: TdBranchId | null;
  mythicPath: TdMythicPathId | null;
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
  cleansesAllies: boolean;
  selfRegenPct: number;
  isBoss: boolean;
  summonTimer: number;
  splitIntoType?: TdEnemyType;
  splitCount: number;
  hasSplit?: boolean;
  isDeadProcessed?: boolean;
  enraged?: boolean;
  bountyMult?: number;
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
  burnTimer: number;
  burnDps: number;
  burnTickTimer: number;
  burnSourceTowerId?: string;
  healAuraTimer: number;
  hitFlashTimer: number;
  distanceTraveled: number;
}

export interface TdSoldierEntity {
  id: string;
  towerId: string | null; // null = temporary Reinforcement spell unit
  towerType?: TdTowerType;
  towerLevel?: TdTowerLevel;
  towerBranch?: TdBranchId | null;
  towerMythicPath?: TdMythicPathId | null;
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
  armorPiercePct?: number;
  trueDamagePct?: number;
  cleaveRadius?: number;
  slowPct?: number;
  burnDps?: number;
}

export interface TdProjectile {
  id: string;
  kind:
    | 'ARROW'
    | 'BOLT'
    | 'BOMB'
    | 'LIGHTNING'
    | 'POISON_ARROW'
    | 'SHURIKEN'
    | 'SPEAR'
    | 'FIREBALL'
    | 'RAILBOLT'
    | 'CHRONO_RAY';
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
  poisonSpreadRadius?: number;
  burnDps?: number;
  chainCount: number;
  armorPierce: boolean;
  armorPiercePct?: number;
  magicPiercePct?: number;
  trueDamagePct?: number;
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
    | 'FROST_NOVA'
    | 'FIRE_BLAST'
    | 'CHRONO_PULSE';
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
