import {
  TdBiomeId,
  TdBranchId,
  TdBuildPad,
  TdEnemySpec,
  TdEnemyType,
  TdLevelConfig,
  TdMapTheme,
  TdPoint,
  TdTowerConfig,
  TdTowerLevel,
  TdTowerType,
  TdUpgradeTrackId,
  TdUpgrades,
  TdWaveConfig,
  TdWaveGroup,
} from '../types/towerDefense';

export const TD_MAX_LEVEL = 30;
export const TD_VIEWBOX_W = 1000;
export const TD_VIEWBOX_H = 562.5;

export const DEFAULT_TD_UPGRADES: TdUpgrades = {
  archery: 0,
  magic: 0,
  barracks: 0,
  economy: 0,
  spells: 0,
};

export interface TdUpgradeTrackMeta {
  id: TdUpgradeTrackId;
  name: string;
  shortBonus: string;
  tierCosts: [number, number, number];
  tierLabels: [string, string, string];
}

export const TD_UPGRADE_TRACKS: TdUpgradeTrackMeta[] = [
  {
    id: 'archery',
    name: 'Xạ Tiễn & Ám Khí',
    shortBonus: 'Cung Thủ, Pháo Thủ & Sát Thủ',
    tierCosts: [1, 2, 3],
    tierLabels: ['+12% Sát thương Vật lý', '+10% Tầm & Tốc độ đánh', '+25% Sát thương Chí mạng'],
  },
  {
    id: 'magic',
    name: 'Ma Thuật & Quang Minh',
    shortBonus: 'Pháp Sư & Thánh Nữ',
    tierCosts: [1, 2, 3],
    tierLabels: ['+15% Sát thương Phép', '+15% Tầm Pháp/Thánh Nữ', 'Làm chậm sâu +15%'],
  },
  {
    id: 'barracks',
    name: 'Vệ Binh',
    shortBonus: 'Đội Vệ Binh',
    tierCosts: [1, 2, 3],
    tierLabels: ['+25% Máu & Giáp Lính', 'Hồi sinh lính nhanh 30%', '+30% Sát thương Cận chiến'],
  },
  {
    id: 'economy',
    name: 'Kho Bạc',
    shortBonus: 'Vàng & Hoàn trả',
    tierCosts: [1, 2, 3],
    tierLabels: ['+50 Vàng khởi đầu', '+15% Vàng hạ quái', 'Bán hoàn 85% vàng'],
  },
  {
    id: 'spells',
    name: 'Thiên Thạch',
    shortBonus: 'Phép Chủ Động',
    tierCosts: [1, 2, 3],
    tierLabels: ['Giảm 20% hồi chiêu phép', '+35% Sát thương Thiên Thạch', '+1 Vệ binh Tiếp viện (3 lính)'],
  },
];

export const TD_TOWERS: Record<TdTowerType, TdTowerConfig> = {
  ARCHER: {
    type: 'ARCHER',
    name: 'Cung Thủ',
    roleLabel: 'Bắn đa mục tiêu · Hạ quái bay',
    damageKind: 'PHYSICAL',
    canHitAir: true,
    tiers: [
      { cost: 70, damage: 19, range: 175, cooldown: 0.62, targetCount: 1 },
      { cost: 110, damage: 26, range: 192, cooldown: 0.49, targetCount: 2 },
      { cost: 165, damage: 35, range: 210, cooldown: 0.38, targetCount: 3 },
    ],
    branches: [
      {
        id: 'RANGER_POISON',
        name: 'Xạ Thủ Độc Rừng',
        shortDesc: '4 mũi tên độc · Độc = sát thương/giây (5s)',
        cost: 225,
        damage: 42,
        range: 225,
        cooldown: 0.28,
        targetCount: 4,
        poisonDps: 42,
      },
      {
        id: 'SNIPER_CRIT',
        name: 'Thần Tiễn Hoàng Gia',
        shortDesc: 'Bắn 2 phát tầm xa + 35% Chí mạng',
        cost: 240,
        damage: 82,
        range: 270,
        cooldown: 0.42,
        targetCount: 2,
        critChance: 0.35,
      },
    ],
  },
  BARRACKS: {
    type: 'BARRACKS',
    name: 'Đội Vệ Binh',
    roleLabel: 'Phạm vi tròn rộng qua nhiều đường · Hồi lính 5s',
    damageKind: 'MELEE',
    canHitAir: false,
    tiers: [
      {
        cost: 70,
        damage: 13,
        range: 190,
        cooldown: 0.9,
        soldierCount: 3,
        soldierHp: 135,
        soldierArmor: 0.16,
        soldierDamage: 14,
      },
      {
        cost: 105,
        damage: 19,
        range: 215,
        cooldown: 0.74,
        soldierCount: 4,
        soldierHp: 195,
        soldierArmor: 0.25,
        soldierDamage: 20,
      },
      {
        cost: 160,
        damage: 28,
        range: 240,
        cooldown: 0.6,
        soldierCount: 5,
        soldierHp: 280,
        soldierArmor: 0.36,
        soldierDamage: 28,
      },
    ],
    branches: [
      {
        id: 'PALADIN',
        name: 'Thánh Kỵ Sĩ',
        shortDesc: '5 Kỵ sĩ giáp 52% · Chém nhanh toàn vùng rộng',
        cost: 220,
        damage: 40,
        range: 265,
        cooldown: 0.48,
        soldierCount: 5,
        soldierHp: 440,
        soldierArmor: 0.52,
        soldierDamage: 40,
      },
      {
        id: 'BARBARIAN',
        name: 'Chiến Binh Cuồng Nộ',
        shortDesc: '6 Chiến binh chém lan siêu tốc!',
        cost: 225,
        damage: 52,
        range: 265,
        cooldown: 0.44,
        soldierCount: 6,
        soldierHp: 330,
        soldierArmor: 0.3,
        soldierDamage: 52,
        cleaveRadius: 48,
      },
    ],
  },
  MAGE: {
    type: 'MAGE',
    name: 'Pháp Sư Băng Hồn',
    roleLabel: 'Bùng nổ phép mạnh · Làm chậm lan diện rộng',
    damageKind: 'MAGIC',
    canHitAir: true,
    tiers: [
      { cost: 100, damage: 52, range: 172, cooldown: 1.1, targetCount: 1, slowPct: 0.32, slowSplashRadius: 48 },
      { cost: 150, damage: 78, range: 188, cooldown: 0.88, targetCount: 2, slowPct: 0.38, slowSplashRadius: 56 },
      { cost: 215, damage: 112, range: 205, cooldown: 0.7, targetCount: 3, slowPct: 0.45, slowSplashRadius: 65 },
    ],
    branches: [
      {
        id: 'ARCANE_BEAM',
        name: 'Băng Hồn Đại Sư',
        shortDesc: '3 cầu băng nổ chậm 58% lan 82px + Tốc độ cao',
        cost: 280,
        damage: 175,
        range: 225,
        cooldown: 0.58,
        targetCount: 3,
        slowPct: 0.58,
        slowSplashRadius: 82,
      },
      {
        id: 'STORM_CHAIN',
        name: 'Lôi Băng Pháp Thần',
        shortDesc: 'Sét băng lan 6 mục tiêu + Làm chậm 45%',
        cost: 270,
        damage: 148,
        range: 215,
        cooldown: 0.54,
        targetCount: 2,
        slowPct: 0.45,
        chainCount: 6,
      },
    ],
  },
  ARTILLERY: {
    type: 'ARTILLERY',
    name: 'Pháo Thủ',
    roleLabel: 'Bắn nhiều bom nổ lan · Tăng tốc theo cấp',
    damageKind: 'SPLASH',
    canHitAir: false,
    tiers: [
      { cost: 120, damage: 38, range: 158, cooldown: 1.85, targetCount: 1, splashRadius: 60 },
      { cost: 175, damage: 52, range: 174, cooldown: 1.48, targetCount: 2, splashRadius: 68 },
      { cost: 245, damage: 70, range: 190, cooldown: 1.15, targetCount: 3, splashRadius: 78 },
    ],
    branches: [
      {
        id: 'BIG_BERTHA',
        name: 'Xạ Thủ Siêu Pháo',
        shortDesc: 'Bắn 2 đại bác nổ lan 115px nhanh hơn',
        cost: 300,
        damage: 135,
        range: 215,
        cooldown: 0.92,
        targetCount: 2,
        splashRadius: 115,
      },
      {
        id: 'TESLA_COIL',
        name: 'Kỹ Sư Lôi Điện',
        shortDesc: 'Giật sét 5 mục tiêu siêu nhanh · Hạ quái bay!',
        cost: 310,
        damage: 102,
        range: 200,
        cooldown: 0.72,
        targetCount: 2,
        splashRadius: 75,
        chainCount: 5,
      },
    ],
  },
  ASSASSIN: {
    type: 'ASSASSIN',
    name: 'Sát Thủ',
    roleLabel: 'Phi tiêu siêu tốc · Chí mạng & Độc',
    damageKind: 'PHYSICAL',
    canHitAir: true,
    tiers: [
      { cost: 85, damage: 22, range: 155, cooldown: 0.48, targetCount: 1, critChance: 0.22 },
      { cost: 130, damage: 30, range: 170, cooldown: 0.37, targetCount: 2, critChance: 0.28 },
      { cost: 185, damage: 40, range: 185, cooldown: 0.29, targetCount: 3, critChance: 0.34 },
    ],
    branches: [
      {
        id: 'SHADOW_BLADE',
        name: 'Ảnh Kiếm Vô Ảnh',
        shortDesc: 'Phóng 4 phi tiêu siêu thanh · 48% Chí mạng!',
        cost: 245,
        damage: 54,
        range: 200,
        cooldown: 0.22,
        targetCount: 4,
        critChance: 0.48,
      },
      {
        id: 'VENOM_FANG',
        name: 'Độc Ảnh Xuyên Tâm',
        shortDesc: '3 phi đao độc + Làm chậm 28% · Độc 5s',
        cost: 240,
        damage: 46,
        range: 195,
        cooldown: 0.25,
        targetCount: 3,
        poisonDps: 46,
        slowPct: 0.28,
        critChance: 0.25,
      },
    ],
  },
  VALKYRIE: {
    type: 'VALKYRIE',
    name: 'Thánh Nữ',
    roleLabel: 'Giáo ánh sáng · Tăng tốc đồng đội & Hồi máu lính',
    damageKind: 'MAGIC',
    canHitAir: true,
    tiers: [
      { cost: 110, damage: 34, range: 168, cooldown: 0.96, targetCount: 1, auraHastePct: 0.14, healSoldierAmt: 16 },
      { cost: 160, damage: 48, range: 184, cooldown: 0.78, targetCount: 2, auraHastePct: 0.18, healSoldierAmt: 26 },
      { cost: 225, damage: 68, range: 200, cooldown: 0.62, targetCount: 3, auraHastePct: 0.22, healSoldierAmt: 40 },
    ],
    branches: [
      {
        id: 'SOLAR_SERAPH',
        name: 'Thiên Sứ Nhật Quang',
        shortDesc: '4 Thánh giáo siêu tốc + Tăng 28% tốc đánh đồng đội',
        cost: 290,
        damage: 98,
        range: 218,
        cooldown: 0.5,
        targetCount: 4,
        auraHastePct: 0.28,
        healSoldierAmt: 65,
      },
      {
        id: 'FROST_VALKYRIE',
        name: 'Nữ Thần Băng Phong',
        shortDesc: '3 Thương băng làm chậm 42% + Tăng 24% tốc đánh',
        cost: 285,
        damage: 88,
        range: 215,
        cooldown: 0.52,
        targetCount: 3,
        slowPct: 0.42,
        slowSplashRadius: 55,
        auraHastePct: 0.24,
        healSoldierAmt: 45,
      },
    ],
  },
};

export function getExtraTowerUpgradeCost(
  type: TdTowerType,
  currentLevel: TdTowerLevel,
  branch: TdBranchId | null
): number | null {
  if (currentLevel < 4 || currentLevel >= 7) return null;
  const cfg = TD_TOWERS[type];
  const branchCfg = branch ? cfg.branches.find((b) => b.id === branch) : cfg.branches[0];
  const baseBranchCost = branchCfg?.cost ?? 250;
  // +3 extra upgrade tiers (Lv 5, 6, 7) at x2 gold cost progression
  const multByTarget: Record<number, number> = {
    5: 2.0,
    6: 3.0,
    7: 4.5,
  };
  return Math.round(baseBranchCost * (multByTarget[currentLevel + 1] ?? 4.5));
}

export const TD_ENEMIES: Record<TdEnemyType, TdEnemySpec> = {
  GOBLIN: {
    type: 'GOBLIN',
    name: 'Yêu Tinh Rừng',
    baseHp: 62,
    speed: 55,
    armor: 0,
    magicResist: 0,
    bounty: 10,
    lifeCost: 1,
    flying: false,
    radius: 13,
    accentColor: '#4ADE80',
  },
  WOLF: {
    type: 'WOLF',
    name: 'Sói Huyết Tốc',
    baseHp: 82,
    speed: 96,
    armor: 0,
    magicResist: 0.1,
    bounty: 13,
    lifeCost: 1,
    flying: false,
    radius: 14,
    accentColor: '#F87171',
  },
  SPIDER: {
    type: 'SPIDER',
    name: 'Nhện Độc Hắc Ám',
    baseHp: 96,
    speed: 84,
    armor: 0.05,
    magicResist: 0.25,
    bounty: 14,
    lifeCost: 1,
    flying: false,
    radius: 14,
    accentColor: '#A3E635',
  },
  ORC: {
    type: 'ORC',
    name: 'Orc Cuồng Chiến',
    baseHp: 175,
    speed: 48,
    armor: 0.25,
    magicResist: 0.08,
    bounty: 18,
    lifeCost: 2,
    flying: false,
    radius: 16,
    accentColor: '#FB923C',
  },
  WYVERN: {
    type: 'WYVERN',
    name: 'Quỷ Dơi Wyvern',
    baseHp: 130,
    speed: 70,
    armor: 0.1,
    magicResist: 0.1,
    bounty: 18,
    lifeCost: 1,
    flying: true,
    radius: 15,
    accentColor: '#A855F7',
  },
  HARPY: {
    type: 'HARPY',
    name: 'Yêu Nữ Cánh Lửa',
    baseHp: 155,
    speed: 86,
    armor: 0.08,
    magicResist: 0.22,
    bounty: 21,
    lifeCost: 2,
    flying: true,
    radius: 15,
    accentColor: '#F43F5E',
  },
  GOLEM: {
    type: 'GOLEM',
    name: 'Golem Giáp Đá',
    baseHp: 320,
    speed: 34,
    armor: 0.65,
    magicResist: 0,
    bounty: 28,
    lifeCost: 2,
    flying: false,
    radius: 19,
    accentColor: '#94A3B8',
  },
  SHAMAN: {
    type: 'SHAMAN',
    name: 'Phù Thủy Hồi Máu',
    baseHp: 195,
    speed: 45,
    armor: 0.05,
    magicResist: 0.6,
    bounty: 24,
    lifeCost: 2,
    flying: false,
    healsAllies: true,
    radius: 16,
    accentColor: '#2DD4BF',
  },
  NECRO: {
    type: 'NECRO',
    name: 'Pháp Sư Tử Linh',
    baseHp: 245,
    speed: 42,
    armor: 0.12,
    magicResist: 0.68,
    bounty: 30,
    lifeCost: 2,
    flying: false,
    healsAllies: true,
    radius: 17,
    accentColor: '#C084FC',
  },
  KNIGHT_DARK: {
    type: 'KNIGHT_DARK',
    name: 'Hắc Kỵ Sĩ Thép',
    baseHp: 390,
    speed: 38,
    armor: 0.72,
    magicResist: 0.15,
    bounty: 36,
    lifeCost: 3,
    flying: false,
    radius: 19,
    accentColor: '#64748B',
  },
  MINIBOSS: {
    type: 'MINIBOSS',
    name: 'Chiến Tướng Hộ Vệ',
    baseHp: 680,
    speed: 34,
    armor: 0.48,
    magicResist: 0.3,
    bounty: 65,
    lifeCost: 4,
    flying: false,
    radius: 22,
    accentColor: '#F59E0B',
  },
  BOSS: {
    type: 'BOSS',
    name: 'Ma Vương Khổng Lồ',
    baseHp: 1950,
    speed: 26,
    armor: 0.42,
    magicResist: 0.35,
    bounty: 180,
    lifeCost: 10,
    flying: false,
    radius: 26,
    accentColor: '#FACC15',
  },
};

function makeWave(
  waveNumber: number,
  groups: TdWaveGroup[],
  earlyBonusBase = 18
): TdWaveConfig {
  return { waveNumber, groups, earlyBonusBase };
}

function buildWavesForStage(level: number, pathCount: number): TdWaveConfig[] {
  const totalWaves = Math.max(10, Math.min(16, 9 + Math.floor(level * 0.25)));
  const hpScale = 1 + (level - 1) * 0.16;
  const waves: TdWaveConfig[] = [];

  const getPath = (idx: number) => idx % pathCount;

  for (let w = 1; w <= totalWaves; w++) {
    const groups: TdWaveGroup[] = [];
    // +10% monster HP compounding every wave
    const waveScale = hpScale * Math.pow(1.1, w - 1);
    const altPath = getPath(w);
    const secondPath = getPath(w + 1);
    const thirdPath = getPath(w + 2);

    if (w === 1) {
      groups.push({
        enemyType: 'GOBLIN',
        count: 7 + Math.floor(level / 3),
        interval: 0.55,
        delay: 0,
        pathIndex: 0,
        hpMult: waveScale,
      });
      if (pathCount >= 2) {
        groups.push({
          enemyType: level >= 4 ? 'SPIDER' : 'GOBLIN',
          count: 5 + Math.floor(level / 4),
          interval: 0.58,
          delay: 0.45,
          pathIndex: 1,
          hpMult: waveScale,
        });
      }
      if (pathCount >= 3) {
        groups.push({
          enemyType: 'WOLF',
          count: 4 + Math.floor(level / 8),
          interval: 0.5,
          delay: 0.9,
          pathIndex: 2,
          hpMult: waveScale,
        });
      }
    } else if (w === totalWaves) {
      // Final Wave Climax (ALWAYS the strongest wave of the stage!)
      const isBossStage = level % 5 === 0 || level >= 3;
      const finalMult = 1.24;
      groups.push({
        enemyType: 'ORC',
        count: 8 + Math.floor(level / 3),
        interval: 0.5,
        delay: 0,
        pathIndex: 0,
        hpMult: waveScale * finalMult,
      });
      groups.push({
        enemyType: 'KNIGHT_DARK',
        count: 4 + Math.floor(level / 4),
        interval: 0.88,
        delay: 0.6,
        pathIndex: secondPath,
        hpMult: waveScale * finalMult,
      });
      groups.push({
        enemyType: 'GOLEM',
        count: 3 + Math.floor(level / 5),
        interval: 0.95,
        delay: 1.0,
        pathIndex: altPath,
        hpMult: waveScale * finalMult,
      });
      groups.push({
        enemyType: 'MINIBOSS',
        count: level >= 25 ? 4 : level >= 12 ? 3 : 2,
        interval: 1.2,
        delay: 1.3,
        pathIndex: 0,
        hpMult: waveScale * 1.26,
      });
      if (isBossStage) {
        groups.push({
          enemyType: 'BOSS',
          count: level >= 25 ? 2 : 1,
          interval: 2.2,
          delay: 1.9,
          pathIndex: 0,
          hpMult: waveScale * (1.28 + Math.floor(level / 10) * 0.2),
        });
      }
      groups.push({
        enemyType: level >= 8 ? 'NECRO' : 'SHAMAN',
        count: 3 + Math.floor(level / 5),
        interval: 0.95,
        delay: 2.2,
        pathIndex: 0,
        hpMult: waveScale * finalMult,
      });
      groups.push({
        enemyType: level >= 6 ? 'HARPY' : 'WYVERN',
        count: 6 + Math.floor(level / 4),
        interval: 0.48,
        delay: 2.5,
        pathIndex: secondPath,
        hpMult: waveScale * finalMult,
      });
      if (pathCount >= 3) {
        groups.push({
          enemyType: 'WOLF',
          count: 10 + Math.floor(level / 5),
          interval: 0.38,
          delay: 1.4,
          pathIndex: thirdPath,
          hpMult: waveScale * finalMult,
        });
      }
    } else {
      const swarmRotation: TdEnemyType[] = ['GOBLIN', 'WOLF', 'SPIDER', 'ORC'];
      const leadType = swarmRotation[(w + level) % swarmRotation.length];

      groups.push({
        enemyType: leadType,
        count: 7 + Math.floor(w * 0.85) + Math.floor(level / 3),
        interval: leadType === 'WOLF' || leadType === 'SPIDER' ? 0.44 : 0.52,
        delay: 0,
        pathIndex: altPath,
        hpMult: waveScale,
      });

      if (pathCount >= 2 && w >= 2) {
        const flankType = swarmRotation[(w + level + 1) % swarmRotation.length];
        groups.push({
          enemyType: flankType,
          count: 5 + Math.floor(w * 0.6),
          interval: 0.5,
          delay: 0.55,
          pathIndex: secondPath,
          hpMult: waveScale,
        });
      }

      if (w >= 2 && (level >= 2 || w >= 4)) {
        const tankType: TdEnemyType = level >= 8 && w % 2 === 0 ? 'KNIGHT_DARK' : 'GOLEM';
        groups.push({
          enemyType: tankType,
          count: 1 + Math.floor((w + level) / 6),
          interval: 1.25,
          delay: 0.85,
          pathIndex: 0,
          hpMult: waveScale,
        });
      }

      if (w >= 3 && (level >= 2 || w >= 5)) {
        const airType: TdEnemyType = level >= 6 && w % 2 === 1 ? 'HARPY' : 'WYVERN';
        groups.push({
          enemyType: airType,
          count: 3 + Math.floor((w + level) / 5),
          interval: 0.62,
          delay: 1.2,
          pathIndex: secondPath,
          hpMult: waveScale,
        });
      }

      if (w >= 5 || (w >= 4 && level >= 3)) {
        const supportType: TdEnemyType = level >= 7 && w % 2 === 0 ? 'NECRO' : 'SHAMAN';
        groups.push({
          enemyType: supportType,
          count: 1 + Math.floor(w / 4) + Math.floor(level / 9),
          interval: 1.35,
          delay: 1.5,
          pathIndex: altPath,
          hpMult: waveScale,
        });
      }

      // Waves 8-9-10 Heavy Elite Escalation (building up toward the Final Wave climax!)
      if (w === 8) {
        groups.push({
          enemyType: 'KNIGHT_DARK',
          count: 2 + Math.floor(level / 6),
          interval: 1.05,
          delay: 1.1,
          pathIndex: 0,
          hpMult: waveScale * 1.06,
        });
        groups.push({
          enemyType: 'ORC',
          count: 6 + Math.floor(level / 4),
          interval: 0.48,
          delay: 1.6,
          pathIndex: secondPath,
          hpMult: waveScale * 1.05,
        });
        groups.push({
          enemyType: 'WYVERN',
          count: 3 + Math.floor(level / 6),
          interval: 0.58,
          delay: 2.0,
          pathIndex: altPath,
          hpMult: waveScale * 1.05,
        });
      } else if (w === 9) {
        groups.push({
          enemyType: 'MINIBOSS',
          count: 1 + Math.floor(level / 12),
          interval: 1.4,
          delay: 1.15,
          pathIndex: 0,
          hpMult: waveScale * 1.08,
        });
        groups.push({
          enemyType: 'KNIGHT_DARK',
          count: 3 + Math.floor(level / 5),
          interval: 0.95,
          delay: 1.5,
          pathIndex: secondPath,
          hpMult: waveScale * 1.08,
        });
        groups.push({
          enemyType: level >= 5 ? 'NECRO' : 'SHAMAN',
          count: 2 + Math.floor(level / 8),
          interval: 1.15,
          delay: 2.0,
          pathIndex: 0,
          hpMult: waveScale * 1.08,
        });
        groups.push({
          enemyType: 'HARPY',
          count: 4 + Math.floor(level / 5),
          interval: 0.52,
          delay: 2.3,
          pathIndex: thirdPath,
          hpMult: waveScale * 1.06,
        });
      } else if (w === 10) {
        groups.push({
          enemyType: 'MINIBOSS',
          count: 2 + Math.floor(level / 9),
          interval: 1.3,
          delay: 1.0,
          pathIndex: 0,
          hpMult: waveScale * 1.12,
        });
        groups.push({
          enemyType: 'KNIGHT_DARK',
          count: 3 + Math.floor(level / 4),
          interval: 0.9,
          delay: 1.4,
          pathIndex: secondPath,
          hpMult: waveScale * 1.1,
        });
        groups.push({
          enemyType: 'GOLEM',
          count: 2 + Math.floor(level / 5),
          interval: 1.05,
          delay: 1.7,
          pathIndex: altPath,
          hpMult: waveScale * 1.1,
        });
        groups.push({
          enemyType: 'NECRO',
          count: 2 + Math.floor(level / 7),
          interval: 1.15,
          delay: 2.1,
          pathIndex: 0,
          hpMult: waveScale * 1.1,
        });
        groups.push({
          enemyType: 'HARPY',
          count: 5 + Math.floor(level / 4),
          interval: 0.5,
          delay: 2.3,
          pathIndex: secondPath,
          hpMult: waveScale * 1.08,
        });
      }

      if (w === Math.floor(totalWaves * 0.65) && level >= 4 && w !== 8 && w !== 9 && w !== 10) {
        groups.push({
          enemyType: 'MINIBOSS',
          count: 1,
          interval: 1,
          delay: 1.8,
          pathIndex: 0,
          hpMult: waveScale * 0.95,
        });
      }
    }

    waves.push(makeWave(w, groups, 16 + w * 3 + level * 2));
  }

  return waves;
}

// ---------- 30 Completely Unique Maps Across 6 Distinct Biomes ----------

interface StageMapBlueprint {
  name: string;
  biome: TdBiomeId;
  biomeName: string;
  paths: TdPoint[][];
  buildPads: TdBuildPad[];
  mapTheme: TdMapTheme;
}

const STAGE_BLUEPRINTS: StageMapBlueprint[] = [
  // ============ BIOME I: FOREST (Stages 1 - 5) ============
  {
    name: 'Cửa Ngõ Rừng Xanh',
    biome: 'FOREST',
    biomeName: 'Thung Lũng Rừng Xanh',
    paths: [[
      { x: 0, y: 175 },
      { x: 250, y: 175 },
      { x: 250, y: 390 },
      { x: 545, y: 390 },
      { x: 545, y: 165 },
      { x: 805, y: 165 },
      { x: 805, y: 320 },
      { x: 960, y: 320 },
    ]],
    buildPads: [
      { id: 's1p1', x: 140, y: 100, rallyX: 140, rallyY: 175 },
      { id: 's1p2', x: 165, y: 280, rallyX: 250, rallyY: 280 },
      { id: 's1p3', x: 335, y: 295, rallyX: 250, rallyY: 320 },
      { id: 's1p4', x: 400, y: 465, rallyX: 400, rallyY: 390 },
      { id: 's1p5', x: 465, y: 270, rallyX: 545, rallyY: 270 },
      { id: 's1p6', x: 630, y: 260, rallyX: 545, rallyY: 240 },
      { id: 's1p7', x: 685, y: 90, rallyX: 685, rallyY: 165 },
      { id: 's1p8', x: 720, y: 385, rallyX: 805, rallyY: 320 },
      { id: 's1p9', x: 885, y: 230, rallyX: 885, rallyY: 320 },
    ],
    mapTheme: {
      tintColor: '#052E16',
      tintOpacity: 0.14,
      roadOuter: '#573B26',
      roadInner: '#A17449',
      roadDash: '#FDE68A',
      landmarks: [
        { kind: 'TREE', x: 70, y: 440, scale: 1.1 },
        { kind: 'TREE', x: 400, y: 120, scale: 1.0 },
        { kind: 'CAMPFIRE', x: 350, y: 215, scale: 0.9 },
        { kind: 'TREE', x: 880, y: 455, scale: 1.2 },
      ],
    },
  },
  {
    name: 'Hẻm Cây Cổ Thụ',
    biome: 'FOREST',
    biomeName: 'Thung Lũng Rừng Xanh',
    paths: [[
      { x: 0, y: 110 },
      { x: 740, y: 110 },
      { x: 740, y: 280 },
      { x: 185, y: 280 },
      { x: 185, y: 450 },
      { x: 960, y: 450 },
    ]],
    buildPads: [
      { id: 's2p1', x: 180, y: 190, rallyX: 180, rallyY: 110 },
      { id: 's2p2', x: 375, y: 195, rallyX: 375, rallyY: 110 },
      { id: 's2p3', x: 575, y: 195, rallyX: 575, rallyY: 280 },
      { id: 's2p4', x: 830, y: 195, rallyX: 740, rallyY: 195 },
      { id: 's2p5', x: 100, y: 365, rallyX: 185, rallyY: 365 },
      { id: 's2p6', x: 315, y: 365, rallyX: 315, rallyY: 280 },
      { id: 's2p7', x: 515, y: 365, rallyX: 515, rallyY: 450 },
      { id: 's2p8', x: 710, y: 365, rallyX: 710, rallyY: 450 },
      { id: 's2p9', x: 875, y: 365, rallyX: 875, rallyY: 450 },
    ],
    mapTheme: {
      tintColor: '#064E3B',
      tintOpacity: 0.22,
      roadOuter: '#422006',
      roadInner: '#92400E',
      roadDash: '#FEF08A',
      landmarks: [
        { kind: 'TREE', x: 880, y: 80, scale: 1.2 },
        { kind: 'RUIN', x: 645, y: 190, scale: 0.9 },
        { kind: 'TREE', x: 80, y: 210, scale: 1.0 },
        { kind: 'CAMPFIRE', x: 425, y: 365, scale: 0.9 },
      ],
    },
  },
  {
    name: 'Ngã Ba Bóng Đêm',
    biome: 'FOREST',
    biomeName: 'Thung Lũng Rừng Xanh',
    paths: [
      [
        { x: 0, y: 130 },
        { x: 310, y: 130 },
        { x: 450, y: 280 },
        { x: 685, y: 280 },
        { x: 790, y: 165 },
        { x: 960, y: 165 },
      ],
      [
        { x: 0, y: 430 },
        { x: 310, y: 430 },
        { x: 450, y: 280 },
        { x: 685, y: 280 },
        { x: 790, y: 395 },
        { x: 960, y: 395 },
      ],
    ],
    buildPads: [
      { id: 's3p1', x: 155, y: 215, rallyX: 155, rallyY: 130 },
      { id: 's3p2', x: 155, y: 345, rallyX: 155, rallyY: 430 },
      { id: 's3p3', x: 325, y: 280, rallyX: 450, rallyY: 280 },
      { id: 's3p4', x: 485, y: 170, rallyX: 485, rallyY: 280 },
      { id: 's3p5', x: 485, y: 390, rallyX: 485, rallyY: 280 },
      { id: 's3p6', x: 615, y: 185, rallyX: 615, rallyY: 280 },
      { id: 's3p7', x: 615, y: 375, rallyX: 615, rallyY: 280 },
      { id: 's3p8', x: 845, y: 90, rallyX: 845, rallyY: 165 },
      { id: 's3p9', x: 805, y: 280, rallyX: 685, rallyY: 280 },
      { id: 's3p10', x: 845, y: 475, rallyX: 845, rallyY: 395 },
    ],
    mapTheme: {
      tintColor: '#1E1B4B',
      tintOpacity: 0.25,
      roadOuter: '#3F2E21',
      roadInner: '#785A40',
      roadDash: '#C4B5FD',
      landmarks: [
        { kind: 'CRYSTAL', x: 75, y: 280, scale: 1.0 },
        { kind: 'TREE', x: 600, y: 95, scale: 1.1 },
        { kind: 'RUIN', x: 600, y: 465, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Di Tích Sương Mù',
    biome: 'FOREST',
    biomeName: 'Thung Lũng Rừng Xanh',
    paths: [[
      { x: 0, y: 280 },
      { x: 185, y: 280 },
      { x: 320, y: 115 },
      { x: 590, y: 115 },
      { x: 460, y: 430 },
      { x: 755, y: 430 },
      { x: 755, y: 215 },
      { x: 960, y: 215 },
    ]],
    buildPads: [
      { id: 's4p1', x: 135, y: 190, rallyX: 135, rallyY: 280 },
      { id: 's4p2', x: 145, y: 375, rallyX: 185, rallyY: 280 },
      { id: 's4p3', x: 350, y: 225, rallyX: 320, rallyY: 115 },
      { id: 's4p4', x: 455, y: 195, rallyX: 455, rallyY: 115 },
      { id: 's4p5', x: 335, y: 375, rallyX: 460, rallyY: 430 },
      { id: 's4p6', x: 630, y: 245, rallyX: 525, rallyY: 270 },
      { id: 's4p7', x: 650, y: 350, rallyX: 650, rallyY: 430 },
      { id: 's4p8', x: 845, y: 130, rallyX: 845, rallyY: 215 },
      { id: 's4p9', x: 845, y: 315, rallyX: 845, rallyY: 215 },
    ],
    mapTheme: {
      tintColor: '#0F172A',
      tintOpacity: 0.28,
      roadOuter: '#475569',
      roadInner: '#94A3B8',
      roadDash: '#E2E8F0',
      landmarks: [
        { kind: 'RUIN', x: 240, y: 435, scale: 1.1 },
        { kind: 'RUIN', x: 700, y: 100, scale: 1.0 },
        { kind: 'TREE', x: 880, y: 450, scale: 1.1 },
      ],
    },
  },
  // Stage 5 (BOSS + BOT ESCORTS)
  {
    name: 'Đại Chiến Chúa Rừng',
    biome: 'FOREST',
    biomeName: 'Thung Lũng Rừng Xanh',
    paths: [
      [
        { x: 0, y: 115 },
        { x: 275, y: 115 },
        { x: 275, y: 280 },
        { x: 690, y: 280 },
        { x: 810, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 445 },
        { x: 275, y: 445 },
        { x: 275, y: 280 },
        { x: 690, y: 280 },
        { x: 810, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's5p1', x: 140, y: 195, rallyX: 140, rallyY: 115 },
      { id: 's5p2', x: 140, y: 365, rallyX: 140, rallyY: 445 },
      { id: 's5p3', x: 370, y: 190, rallyX: 370, rallyY: 280 },
      { id: 's5p4', x: 370, y: 370, rallyX: 370, rallyY: 280 },
      { id: 's5p5', x: 525, y: 185, rallyX: 525, rallyY: 280 },
      { id: 's5p6', x: 525, y: 375, rallyX: 525, rallyY: 280 },
      { id: 's5p7', x: 685, y: 185, rallyX: 685, rallyY: 280 },
      { id: 's5p8', x: 685, y: 375, rallyX: 685, rallyY: 280 },
      { id: 's5p9', x: 830, y: 185, rallyX: 830, rallyY: 280 },
      { id: 's5p10', x: 830, y: 375, rallyX: 830, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#14532D',
      tintOpacity: 0.25,
      roadOuter: '#3B2818',
      roadInner: '#855836',
      roadDash: '#FACC15',
      landmarks: [
        { kind: 'TREE', x: 75, y: 280, scale: 1.2 },
        { kind: 'CRYSTAL', x: 450, y: 95, scale: 1.0 },
        { kind: 'RUIN', x: 450, y: 465, scale: 1.0 },
        { kind: 'CAMPFIRE', x: 760, y: 115, scale: 1.0 },
      ],
    },
  },

  // ============ BIOME II: DESERT PHARAOH (Stages 6 - 10) ============
  {
    name: 'Đồi Cát Pharaoh',
    biome: 'DESERT',
    biomeName: 'Sa Mạc Cổ Vương',
    paths: [[
      { x: 0, y: 365 },
      { x: 280, y: 365 },
      { x: 280, y: 135 },
      { x: 590, y: 135 },
      { x: 590, y: 430 },
      { x: 855, y: 430 },
      { x: 855, y: 245 },
      { x: 960, y: 245 },
    ]],
    buildPads: [
      { id: 's6p1', x: 145, y: 275, rallyX: 145, rallyY: 365 },
      { id: 's6p2', x: 185, y: 180, rallyX: 280, rallyY: 180 },
      { id: 's6p3', x: 375, y: 225, rallyX: 280, rallyY: 225 },
      { id: 's6p4', x: 450, y: 225, rallyX: 450, rallyY: 135 },
      { id: 's6p5', x: 455, y: 345, rallyX: 590, rallyY: 345 },
      { id: 's6p6', x: 685, y: 235, rallyX: 590, rallyY: 235 },
      { id: 's6p7', x: 725, y: 345, rallyX: 725, rallyY: 430 },
      { id: 's6p8', x: 775, y: 175, rallyX: 855, rallyY: 245 },
      { id: 's6p9', x: 900, y: 340, rallyX: 855, rallyY: 340 },
    ],
    mapTheme: {
      tintColor: '#78350F',
      tintOpacity: 0.14,
      roadOuter: '#78350F',
      roadInner: '#D97706',
      roadDash: '#FEF3C7',
      landmarks: [
        { kind: 'OBELISK', x: 95, y: 110, scale: 1.0 },
        { kind: 'PALM', x: 440, y: 455, scale: 1.1 },
        { kind: 'OBELISK', x: 705, y: 100, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Ốc Đảo Song Tuyến',
    biome: 'DESERT',
    biomeName: 'Sa Mạc Cổ Vương',
    paths: [
      [
        { x: 0, y: 140 },
        { x: 360, y: 140 },
        { x: 495, y: 235 },
        { x: 745, y: 235 },
        { x: 960, y: 235 },
      ],
      [
        { x: 0, y: 425 },
        { x: 360, y: 425 },
        { x: 495, y: 330 },
        { x: 745, y: 330 },
        { x: 960, y: 330 },
      ],
    ],
    buildPads: [
      { id: 's7p1', x: 165, y: 225, rallyX: 165, rallyY: 140 },
      { id: 's7p2', x: 165, y: 340, rallyX: 165, rallyY: 425 },
      { id: 's7p3', x: 335, y: 280, rallyX: 430, rallyY: 200 },
      { id: 's7p4', x: 520, y: 140, rallyX: 495, rallyY: 235 },
      { id: 's7p5', x: 520, y: 425, rallyX: 495, rallyY: 330 },
      { id: 's7p6', x: 645, y: 282, rallyX: 645, rallyY: 235 },
      { id: 's7p7', x: 740, y: 145, rallyX: 740, rallyY: 235 },
      { id: 's7p8', x: 740, y: 420, rallyX: 740, rallyY: 330 },
      { id: 's7p9', x: 870, y: 145, rallyX: 870, rallyY: 235 },
      { id: 's7p10', x: 870, y: 420, rallyX: 870, rallyY: 330 },
    ],
    mapTheme: {
      tintColor: '#92400E',
      tintOpacity: 0.16,
      roadOuter: '#451A03',
      roadInner: '#B45309',
      roadDash: '#FDE68A',
      landmarks: [
        { kind: 'PALM', x: 130, y: 280, scale: 1.2 },
        { kind: 'PALM', x: 330, y: 75, scale: 1.0 },
        { kind: 'OBELISK', x: 645, y: 470, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Đền Thờ Nhân Sư',
    biome: 'DESERT',
    biomeName: 'Sa Mạc Cổ Vương',
    paths: [
      [
        { x: 0, y: 120 },
        { x: 245, y: 120 },
        { x: 465, y: 420 },
        { x: 735, y: 420 },
        { x: 875, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 420 },
        { x: 245, y: 420 },
        { x: 465, y: 120 },
        { x: 735, y: 120 },
        { x: 875, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's8p1', x: 145, y: 210, rallyX: 145, rallyY: 120 },
      { id: 's8p2', x: 145, y: 330, rallyX: 145, rallyY: 420 },
      { id: 's8p3', x: 245, y: 270, rallyX: 355, rallyY: 270 },
      { id: 's8p4', x: 465, y: 270, rallyX: 355, rallyY: 270 },
      { id: 's8p5', x: 600, y: 205, rallyX: 600, rallyY: 120 },
      { id: 's8p6', x: 600, y: 335, rallyX: 600, rallyY: 420 },
      { id: 's8p7', x: 735, y: 270, rallyX: 875, rallyY: 280 },
      { id: 's8p8', x: 855, y: 165, rallyX: 875, rallyY: 280 },
      { id: 's8p9', x: 855, y: 390, rallyX: 875, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#B45309',
      tintOpacity: 0.16,
      roadOuter: '#78350F',
      roadInner: '#F59E0B',
      roadDash: '#FFFBEB',
      landmarks: [
        { kind: 'OBELISK', x: 355, y: 100, scale: 1.0 },
        { kind: 'OBELISK', x: 355, y: 465, scale: 1.0 },
        { kind: 'PALM', x: 600, y: 270, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Hẻm Bão Cát',
    biome: 'DESERT',
    biomeName: 'Sa Mạc Cổ Vương',
    paths: [
      [
        { x: 0, y: 105 },
        { x: 390, y: 105 },
        { x: 545, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 280 },
        { x: 545, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 455 },
        { x: 390, y: 455 },
        { x: 545, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's9p1', x: 155, y: 195, rallyX: 155, rallyY: 105 },
      { id: 's9p2', x: 155, y: 365, rallyX: 155, rallyY: 455 },
      { id: 's9p3', x: 345, y: 195, rallyX: 345, rallyY: 280 },
      { id: 's9p4', x: 345, y: 365, rallyX: 345, rallyY: 280 },
      { id: 's9p5', x: 515, y: 150, rallyX: 545, rallyY: 280 },
      { id: 's9p6', x: 515, y: 410, rallyX: 545, rallyY: 280 },
      { id: 's9p7', x: 685, y: 190, rallyX: 685, rallyY: 280 },
      { id: 's9p8', x: 685, y: 370, rallyX: 685, rallyY: 280 },
      { id: 's9p9', x: 845, y: 190, rallyX: 845, rallyY: 280 },
      { id: 's9p10', x: 845, y: 370, rallyX: 845, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#92400E',
      tintOpacity: 0.2,
      roadOuter: '#451A03',
      roadInner: '#D97706',
      roadDash: '#FEF08A',
      landmarks: [
        { kind: 'PALM', x: 75, y: 190, scale: 1.0 },
        { kind: 'OBELISK', x: 760, y: 95, scale: 1.1 },
        { kind: 'CAMPFIRE', x: 760, y: 465, scale: 1.0 },
      ],
    },
  },
  // Stage 10 (BOSS + BOT ESCORTS)
  {
    name: 'Lăng Mộ Vua Bọ Cạp',
    biome: 'DESERT',
    biomeName: 'Sa Mạc Cổ Vương',
    paths: [
      [
        { x: 0, y: 155 },
        { x: 225, y: 155 },
        { x: 225, y: 90 },
        { x: 560, y: 90 },
        { x: 560, y: 245 },
        { x: 830, y: 245 },
        { x: 960, y: 245 },
      ],
      [
        { x: 0, y: 405 },
        { x: 225, y: 405 },
        { x: 225, y: 475 },
        { x: 560, y: 475 },
        { x: 560, y: 330 },
        { x: 830, y: 330 },
        { x: 960, y: 330 },
      ],
    ],
    buildPads: [
      { id: 's10p1', x: 125, y: 245, rallyX: 125, rallyY: 155 },
      { id: 's10p2', x: 125, y: 325, rallyX: 125, rallyY: 405 },
      { id: 's10p3', x: 365, y: 175, rallyX: 365, rallyY: 90 },
      { id: 's10p4', x: 365, y: 390, rallyX: 365, rallyY: 475 },
      { id: 's10p5', x: 465, y: 280, rallyX: 560, rallyY: 280 },
      { id: 's10p6', x: 665, y: 160, rallyX: 665, rallyY: 245 },
      { id: 's10p7', x: 665, y: 415, rallyX: 665, rallyY: 330 },
      { id: 's10p8', x: 750, y: 288, rallyX: 750, rallyY: 245 },
      { id: 's10p9', x: 870, y: 160, rallyX: 870, rallyY: 245 },
      { id: 's10p10', x: 870, y: 415, rallyX: 870, rallyY: 330 },
    ],
    mapTheme: {
      tintColor: '#78350F',
      tintOpacity: 0.22,
      roadOuter: '#451A03',
      roadInner: '#CA8A04',
      roadDash: '#FEF9C3',
      landmarks: [
        { kind: 'OBELISK', x: 325, y: 280, scale: 1.25 },
        { kind: 'PALM', x: 645, y: 80, scale: 1.0 },
        { kind: 'PALM', x: 645, y: 480, scale: 1.0 },
      ],
    },
  },

  // ============ BIOME III: VOLCANO (Stages 11 - 15) ============
  {
    name: 'Cổng Núi Lửa',
    biome: 'VOLCANO',
    biomeName: 'Hẻm Núi Dung Nham',
    paths: [[
      { x: 0, y: 430 },
      { x: 210, y: 430 },
      { x: 210, y: 135 },
      { x: 480, y: 135 },
      { x: 480, y: 430 },
      { x: 755, y: 430 },
      { x: 755, y: 205 },
      { x: 960, y: 205 },
    ]],
    buildPads: [
      { id: 's11p1', x: 115, y: 345, rallyX: 115, rallyY: 430 },
      { id: 's11p2', x: 120, y: 205, rallyX: 210, rallyY: 205 },
      { id: 's11p3', x: 345, y: 225, rallyX: 345, rallyY: 135 },
      { id: 's11p4', x: 345, y: 360, rallyX: 210, rallyY: 360 },
      { id: 's11p5', x: 575, y: 225, rallyX: 480, rallyY: 225 },
      { id: 's11p6', x: 615, y: 345, rallyX: 615, rallyY: 430 },
      { id: 's11p7', x: 665, y: 135, rallyX: 755, rallyY: 220 },
      { id: 's11p8', x: 850, y: 300, rallyX: 755, rallyY: 300 },
      { id: 's11p9', x: 855, y: 120, rallyX: 855, rallyY: 205 },
    ],
    mapTheme: {
      tintColor: '#450A0A',
      tintOpacity: 0.16,
      roadOuter: '#292524',
      roadInner: '#57534E',
      roadDash: '#FB923C',
      landmarks: [
        { kind: 'LAVA', x: 345, y: 485, scale: 1.1 },
        { kind: 'LAVA', x: 620, y: 85, scale: 1.0 },
        { kind: 'RUIN', x: 110, y: 95, scale: 0.9 },
      ],
    },
  },
  {
    name: 'Ngã Ba Dung Nham',
    biome: 'VOLCANO',
    biomeName: 'Hẻm Núi Dung Nham',
    paths: [
      [
        { x: 0, y: 130 },
        { x: 265, y: 130 },
        { x: 455, y: 280 },
        { x: 685, y: 420 },
        { x: 960, y: 420 },
      ],
      [
        { x: 0, y: 420 },
        { x: 265, y: 420 },
        { x: 455, y: 280 },
        { x: 685, y: 130 },
        { x: 960, y: 130 },
      ],
    ],
    buildPads: [
      { id: 's12p1', x: 150, y: 215, rallyX: 150, rallyY: 130 },
      { id: 's12p2', x: 150, y: 335, rallyX: 150, rallyY: 420 },
      { id: 's12p3', x: 325, y: 280, rallyX: 455, rallyY: 280 },
      { id: 's12p4', x: 455, y: 170, rallyX: 455, rallyY: 280 },
      { id: 's12p5', x: 455, y: 390, rallyX: 455, rallyY: 280 },
      { id: 's12p6', x: 590, y: 280, rallyX: 455, rallyY: 280 },
      { id: 's12p7', x: 750, y: 215, rallyX: 750, rallyY: 130 },
      { id: 's12p8', x: 750, y: 335, rallyX: 750, rallyY: 420 },
      { id: 's12p9', x: 875, y: 215, rallyX: 875, rallyY: 130 },
      { id: 's12p10', x: 875, y: 335, rallyX: 875, rallyY: 420 },
    ],
    mapTheme: {
      tintColor: '#7C2D12',
      tintOpacity: 0.22,
      roadOuter: '#1C1917',
      roadInner: '#44403C',
      roadDash: '#F97316',
      landmarks: [
        { kind: 'LAVA', x: 80, y: 280, scale: 1.1 },
        { kind: 'LAVA', x: 620, y: 480, scale: 1.0 },
        { kind: 'CRYSTAL', x: 620, y: 80, scale: 0.9 },
      ],
    },
  },
  {
    name: 'Hầm Lò Quỷ Đá',
    biome: 'VOLCANO',
    biomeName: 'Hẻm Núi Dung Nham',
    paths: [[
      { x: 0, y: 105 },
      { x: 820, y: 105 },
      { x: 820, y: 460 },
      { x: 165, y: 460 },
      { x: 165, y: 245 },
      { x: 640, y: 245 },
      { x: 640, y: 330 },
      { x: 960, y: 330 },
    ]],
    buildPads: [
      { id: 's13p1', x: 250, y: 175, rallyX: 250, rallyY: 105 },
      { id: 's13p2', x: 465, y: 175, rallyX: 465, rallyY: 105 },
      { id: 's13p3', x: 695, y: 175, rallyX: 695, rallyY: 105 },
      { id: 's13p4', x: 730, y: 290, rallyX: 820, rallyY: 290 },
      { id: 's13p5', x: 545, y: 365, rallyX: 545, rallyY: 460 },
      { id: 's13p6', x: 350, y: 350, rallyX: 350, rallyY: 245 },
      { id: 's13p7', x: 255, y: 350, rallyX: 165, rallyY: 350 },
      { id: 's13p8', x: 895, y: 225, rallyX: 895, rallyY: 330 },
      { id: 's13p9', x: 895, y: 430, rallyX: 820, rallyY: 430 },
    ],
    mapTheme: {
      tintColor: '#431407',
      tintOpacity: 0.28,
      roadOuter: '#27272A',
      roadInner: '#52525B',
      roadDash: '#FACC15',
      landmarks: [
        { kind: 'LAVA', x: 80, y: 340, scale: 1.2 },
        { kind: 'CAMPFIRE', x: 450, y: 350, scale: 1.0 },
        { kind: 'RUIN', x: 905, y: 110, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Pháo Đài Hỏa Ngục',
    biome: 'VOLCANO',
    biomeName: 'Hẻm Núi Dung Nham',
    paths: [
      [
        { x: 0, y: 110 },
        { x: 420, y: 110 },
        { x: 615, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 280 },
        { x: 615, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 455 },
        { x: 420, y: 455 },
        { x: 615, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's14p1', x: 160, y: 195, rallyX: 160, rallyY: 110 },
      { id: 's14p2', x: 160, y: 365, rallyX: 160, rallyY: 455 },
      { id: 's14p3', x: 355, y: 195, rallyX: 355, rallyY: 280 },
      { id: 's14p4', x: 355, y: 365, rallyX: 355, rallyY: 280 },
      { id: 's14p5', x: 545, y: 155, rallyX: 545, rallyY: 280 },
      { id: 's14p6', x: 545, y: 405, rallyX: 545, rallyY: 280 },
      { id: 's14p7', x: 705, y: 190, rallyX: 705, rallyY: 280 },
      { id: 's14p8', x: 705, y: 370, rallyX: 705, rallyY: 280 },
      { id: 's14p9', x: 850, y: 190, rallyX: 850, rallyY: 280 },
      { id: 's14p10', x: 850, y: 370, rallyX: 850, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#7F1D1D',
      tintOpacity: 0.26,
      roadOuter: '#1E1B18',
      roadInner: '#57534E',
      roadDash: '#FB7185',
      landmarks: [
        { kind: 'LAVA', x: 675, y: 95, scale: 1.1 },
        { kind: 'LAVA', x: 675, y: 465, scale: 1.1 },
        { kind: 'RUIN', x: 255, y: 195, scale: 0.9 },
      ],
    },
  },
  // Stage 15 (BOSS + BOT ESCORTS)
  {
    name: 'Hỏa Vương Thức Giấc',
    biome: 'VOLCANO',
    biomeName: 'Hẻm Núi Dung Nham',
    paths: [
      [
        { x: 0, y: 155 },
        { x: 225, y: 155 },
        { x: 225, y: 80 },
        { x: 560, y: 80 },
        { x: 560, y: 240 },
        { x: 810, y: 240 },
        { x: 960, y: 240 },
      ],
      [
        { x: 0, y: 405 },
        { x: 225, y: 405 },
        { x: 225, y: 485 },
        { x: 560, y: 485 },
        { x: 560, y: 335 },
        { x: 810, y: 335 },
        { x: 960, y: 335 },
      ],
    ],
    buildPads: [
      { id: 's15p1', x: 125, y: 245, rallyX: 125, rallyY: 155 },
      { id: 's15p2', x: 125, y: 325, rallyX: 125, rallyY: 405 },
      { id: 's15p3', x: 355, y: 165, rallyX: 355, rallyY: 80 },
      { id: 's15p4', x: 355, y: 395, rallyX: 355, rallyY: 485 },
      { id: 's15p5', x: 460, y: 280, rallyX: 560, rallyY: 280 },
      { id: 's15p6', x: 665, y: 155, rallyX: 665, rallyY: 240 },
      { id: 's15p7', x: 665, y: 415, rallyX: 665, rallyY: 335 },
      { id: 's15p8', x: 745, y: 285, rallyX: 745, rallyY: 240 },
      { id: 's15p9', x: 865, y: 155, rallyX: 865, rallyY: 240 },
      { id: 's15p10', x: 865, y: 415, rallyX: 865, rallyY: 335 },
    ],
    mapTheme: {
      tintColor: '#9A3412',
      tintOpacity: 0.25,
      roadOuter: '#1C1917',
      roadInner: '#78350F',
      roadDash: '#FACC15',
      landmarks: [
        { kind: 'LAVA', x: 330, y: 280, scale: 1.3 },
        { kind: 'CRYSTAL', x: 650, y: 80, scale: 1.0 },
        { kind: 'CRYSTAL', x: 650, y: 485, scale: 1.0 },
      ],
    },
  },

  // ============ BIOME IV: ICE CITADEL (Stages 16 - 20) ============
  {
    name: 'Đèo Tuyết Vĩnh Cửu',
    biome: 'ICE',
    biomeName: 'Thành Cổ Tuyết Băng',
    paths: [[
      { x: 0, y: 120 },
      { x: 195, y: 120 },
      { x: 195, y: 435 },
      { x: 455, y: 435 },
      { x: 455, y: 120 },
      { x: 725, y: 120 },
      { x: 725, y: 315 },
      { x: 960, y: 315 },
    ]],
    buildPads: [
      { id: 's16p1', x: 105, y: 215, rallyX: 195, rallyY: 215 },
      { id: 's16p2', x: 285, y: 215, rallyX: 195, rallyY: 215 },
      { id: 's16p3', x: 285, y: 345, rallyX: 285, rallyY: 435 },
      { id: 's16p4', x: 365, y: 215, rallyX: 455, rallyY: 215 },
      { id: 's16p5', x: 545, y: 215, rallyX: 455, rallyY: 215 },
      { id: 's16p6', x: 545, y: 345, rallyX: 455, rallyY: 345 },
      { id: 's16p7', x: 635, y: 215, rallyX: 725, rallyY: 215 },
      { id: 's16p8', x: 815, y: 225, rallyX: 815, rallyY: 315 },
      { id: 's16p9', x: 815, y: 405, rallyX: 815, rallyY: 315 },
    ],
    mapTheme: {
      tintColor: '#0C4A6E',
      tintOpacity: 0.16,
      roadOuter: '#1E293B',
      roadInner: '#475569',
      roadDash: '#7DD3FC',
      landmarks: [
        { kind: 'ICEBERG', x: 90, y: 430, scale: 1.2 },
        { kind: 'CRYSTAL', x: 325, y: 95, scale: 1.0 },
        { kind: 'ICEBERG', x: 870, y: 105, scale: 1.1 },
      ],
    },
  },
  {
    name: 'Hồ Băng Cổ Đại',
    biome: 'ICE',
    biomeName: 'Thành Cổ Tuyết Băng',
    paths: [
      [
        { x: 0, y: 280 },
        { x: 185, y: 280 },
        { x: 385, y: 105 },
        { x: 645, y: 105 },
        { x: 805, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 280 },
        { x: 185, y: 280 },
        { x: 385, y: 455 },
        { x: 645, y: 455 },
        { x: 805, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's17p1', x: 120, y: 190, rallyX: 120, rallyY: 280 },
      { id: 's17p2', x: 120, y: 370, rallyX: 120, rallyY: 280 },
      { id: 's17p3', x: 350, y: 225, rallyX: 385, rallyY: 105 },
      { id: 's17p4', x: 350, y: 335, rallyX: 385, rallyY: 455 },
      { id: 's17p5', x: 515, y: 195, rallyX: 515, rallyY: 105 },
      { id: 's17p6', x: 515, y: 365, rallyX: 515, rallyY: 455 },
      { id: 's17p7', x: 675, y: 225, rallyX: 645, rallyY: 105 },
      { id: 's17p8', x: 675, y: 335, rallyX: 645, rallyY: 455 },
      { id: 's17p9', x: 870, y: 190, rallyX: 870, rallyY: 280 },
      { id: 's17p10', x: 870, y: 370, rallyX: 870, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#164E63',
      tintOpacity: 0.22,
      roadOuter: '#0F172A',
      roadInner: '#334155',
      roadDash: '#38BDF8',
      landmarks: [
        { kind: 'ICEBERG', x: 515, y: 280, scale: 1.3 },
        { kind: 'CRYSTAL', x: 220, y: 95, scale: 1.0 },
        { kind: 'CRYSTAL', x: 220, y: 465, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Cơn Bão Phù Thủy',
    biome: 'ICE',
    biomeName: 'Thành Cổ Tuyết Băng',
    paths: [
      [
        { x: 0, y: 115 },
        { x: 325, y: 115 },
        { x: 325, y: 295 },
        { x: 660, y: 295 },
        { x: 660, y: 145 },
        { x: 960, y: 145 },
      ],
      [
        { x: 0, y: 445 },
        { x: 485, y: 445 },
        { x: 485, y: 295 },
        { x: 660, y: 295 },
        { x: 825, y: 435 },
        { x: 960, y: 435 },
      ],
    ],
    buildPads: [
      { id: 's18p1', x: 165, y: 205, rallyX: 165, rallyY: 115 },
      { id: 's18p2', x: 165, y: 355, rallyX: 165, rallyY: 445 },
      { id: 's18p3', x: 240, y: 285, rallyX: 325, rallyY: 285 },
      { id: 's18p4', x: 420, y: 205, rallyX: 325, rallyY: 205 },
      { id: 's18p5', x: 400, y: 370, rallyX: 485, rallyY: 370 },
      { id: 's18p6', x: 570, y: 205, rallyX: 570, rallyY: 295 },
      { id: 's18p7', x: 585, y: 375, rallyX: 585, rallyY: 295 },
      { id: 's18p8', x: 775, y: 235, rallyX: 775, rallyY: 145 },
      { id: 's18p9', x: 885, y: 235, rallyX: 885, rallyY: 145 },
      { id: 's18p10', x: 865, y: 350, rallyX: 865, rallyY: 435 },
    ],
    mapTheme: {
      tintColor: '#1E1B4B',
      tintOpacity: 0.24,
      roadOuter: '#1E293B',
      roadInner: '#475569',
      roadDash: '#C084FC',
      landmarks: [
        { kind: 'CRYSTAL', x: 75, y: 280, scale: 1.1 },
        { kind: 'RUIN', x: 485, y: 100, scale: 1.0 },
        { kind: 'ICEBERG', x: 700, y: 465, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Phòng Tuyến Bạch Thành',
    biome: 'ICE',
    biomeName: 'Thành Cổ Tuyết Băng',
    paths: [
      [
        { x: 0, y: 100 },
        { x: 460, y: 100 },
        { x: 645, y: 215 },
        { x: 960, y: 215 },
      ],
      [
        { x: 0, y: 280 },
        { x: 480, y: 280 },
        { x: 645, y: 215 },
        { x: 960, y: 215 },
      ],
      [
        { x: 0, y: 460 },
        { x: 560, y: 460 },
        { x: 760, y: 365 },
        { x: 960, y: 365 },
      ],
    ],
    buildPads: [
      { id: 's19p1', x: 185, y: 190, rallyX: 185, rallyY: 100 },
      { id: 's19p2', x: 185, y: 370, rallyX: 185, rallyY: 460 },
      { id: 's19p3', x: 370, y: 190, rallyX: 370, rallyY: 280 },
      { id: 's19p4', x: 370, y: 370, rallyX: 370, rallyY: 280 },
      { id: 's19p5', x: 550, y: 170, rallyX: 645, rallyY: 215 },
      { id: 's19p6', x: 555, y: 365, rallyX: 555, rallyY: 460 },
      { id: 's19p7', x: 740, y: 130, rallyX: 740, rallyY: 215 },
      { id: 's19p8', x: 735, y: 290, rallyX: 735, rallyY: 215 },
      { id: 's19p9', x: 875, y: 130, rallyX: 875, rallyY: 215 },
      { id: 's19p10', x: 875, y: 290, rallyX: 875, rallyY: 365 },
    ],
    mapTheme: {
      tintColor: '#0F172A',
      tintOpacity: 0.25,
      roadOuter: '#0F172A',
      roadInner: '#475569',
      roadDash: '#93C5FD',
      landmarks: [
        { kind: 'ICEBERG', x: 85, y: 190, scale: 1.0 },
        { kind: 'CRYSTAL', x: 85, y: 370, scale: 1.0 },
        { kind: 'RUIN', x: 675, y: 475, scale: 1.0 },
      ],
    },
  },
  // Stage 20 (BOSS + BOT ESCORTS)
  {
    name: 'Tổng Lực Thành Băng',
    biome: 'ICE',
    biomeName: 'Thành Cổ Tuyết Băng',
    paths: [
      [
        { x: 0, y: 105 },
        { x: 255, y: 105 },
        { x: 255, y: 280 },
        { x: 530, y: 280 },
        { x: 660, y: 140 },
        { x: 825, y: 140 },
        { x: 825, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 280 },
        { x: 530, y: 280 },
        { x: 825, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 455 },
        { x: 255, y: 455 },
        { x: 255, y: 280 },
        { x: 530, y: 280 },
        { x: 660, y: 425 },
        { x: 825, y: 425 },
        { x: 825, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's20p1', x: 130, y: 190, rallyX: 130, rallyY: 105 },
      { id: 's20p2', x: 130, y: 370, rallyX: 130, rallyY: 455 },
      { id: 's20p3', x: 375, y: 190, rallyX: 375, rallyY: 280 },
      { id: 's20p4', x: 375, y: 370, rallyX: 375, rallyY: 280 },
      { id: 's20p5', x: 525, y: 175, rallyX: 530, rallyY: 280 },
      { id: 's20p6', x: 525, y: 385, rallyX: 530, rallyY: 280 },
      { id: 's20p7', x: 685, y: 280, rallyX: 685, rallyY: 280 },
      { id: 's20p8', x: 745, y: 65, rallyX: 745, rallyY: 140 },
      { id: 's20p9', x: 745, y: 495, rallyX: 745, rallyY: 425 },
      { id: 's20p10', x: 895, y: 190, rallyX: 895, rallyY: 280 },
      { id: 's20p11', x: 895, y: 370, rallyX: 895, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#3B0764',
      tintOpacity: 0.25,
      roadOuter: '#1E1B4B',
      roadInner: '#4338CA',
      roadDash: '#FACC15',
      landmarks: [
        { kind: 'CRYSTAL', x: 420, y: 95, scale: 1.1 },
        { kind: 'CRYSTAL', x: 420, y: 465, scale: 1.1 },
        { kind: 'CAMPFIRE', x: 745, y: 210, scale: 0.9 },
        { kind: 'ICEBERG', x: 90, y: 495, scale: 1.0 },
      ],
    },
  },

  // ============ BIOME V: SHADOW ABYSS (Stages 21 - 25) ============
  {
    name: 'Đầm Lầy Nguyền Rủa',
    biome: 'ABYSS',
    biomeName: 'Vực Thẳm Hắc Ám',
    paths: [[
      { x: 0, y: 135 },
      { x: 540, y: 135 },
      { x: 540, y: 295 },
      { x: 180, y: 295 },
      { x: 180, y: 460 },
      { x: 785, y: 460 },
      { x: 785, y: 245 },
      { x: 960, y: 245 },
    ]],
    buildPads: [
      { id: 's21p1', x: 255, y: 215, rallyX: 255, rallyY: 135 },
      { id: 's21p2', x: 435, y: 215, rallyX: 435, rallyY: 295 },
      { id: 's21p3', x: 645, y: 220, rallyX: 540, rallyY: 220 },
      { id: 's21p4', x: 95, y: 375, rallyX: 180, rallyY: 375 },
      { id: 's21p5', x: 350, y: 380, rallyX: 350, rallyY: 295 },
      { id: 's21p6', x: 555, y: 380, rallyX: 555, rallyY: 460 },
      { id: 's21p7', x: 690, y: 355, rallyX: 785, rallyY: 355 },
      { id: 's21p8', x: 870, y: 165, rallyX: 870, rallyY: 245 },
      { id: 's21p9', x: 875, y: 355, rallyX: 785, rallyY: 355 },
    ],
    mapTheme: {
      tintColor: '#2E1065',
      tintOpacity: 0.16,
      roadOuter: '#1E1B4B',
      roadInner: '#4C1D95',
      roadDash: '#4ADE80',
      landmarks: [
        { kind: 'CRYSTAL', x: 115, y: 215, scale: 1.0 },
        { kind: 'RUIN', x: 745, y: 110, scale: 1.0 },
        { kind: 'CRYSTAL', x: 460, y: 380, scale: 0.9 },
      ],
    },
  },
  {
    name: 'Giao Lộ Hồn Ma',
    biome: 'ABYSS',
    biomeName: 'Vực Thẳm Hắc Ám',
    paths: [
      [
        { x: 0, y: 115 },
        { x: 300, y: 115 },
        { x: 515, y: 280 },
        { x: 755, y: 125 },
        { x: 960, y: 125 },
      ],
      [
        { x: 0, y: 445 },
        { x: 300, y: 445 },
        { x: 515, y: 280 },
        { x: 755, y: 435 },
        { x: 960, y: 435 },
      ],
    ],
    buildPads: [
      { id: 's22p1', x: 160, y: 205, rallyX: 160, rallyY: 115 },
      { id: 's22p2', x: 160, y: 355, rallyX: 160, rallyY: 445 },
      { id: 's22p3', x: 365, y: 280, rallyX: 515, rallyY: 280 },
      { id: 's22p4', x: 515, y: 160, rallyX: 515, rallyY: 280 },
      { id: 's22p5', x: 515, y: 400, rallyX: 515, rallyY: 280 },
      { id: 's22p6', x: 660, y: 280, rallyX: 515, rallyY: 280 },
      { id: 's22p7', x: 840, y: 210, rallyX: 840, rallyY: 125 },
      { id: 's22p8', x: 840, y: 350, rallyX: 840, rallyY: 435 },
      { id: 's22p9', x: 760, y: 280, rallyX: 660, rallyY: 205 },
    ],
    mapTheme: {
      tintColor: '#064E3B',
      tintOpacity: 0.16,
      roadOuter: '#0F172A',
      roadInner: '#312E81',
      roadDash: '#C084FC',
      landmarks: [
        { kind: 'CRYSTAL', x: 80, y: 280, scale: 1.1 },
        { kind: 'RUIN', x: 640, y: 80, scale: 1.0 },
        { kind: 'RUIN', x: 640, y: 480, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Cổ Mộ Ma Vương',
    biome: 'ABYSS',
    biomeName: 'Vực Thẳm Hắc Ám',
    paths: [
      [
        { x: 0, y: 110 },
        { x: 620, y: 110 },
        { x: 775, y: 270 },
        { x: 960, y: 270 },
      ],
      [
        { x: 0, y: 270 },
        { x: 960, y: 270 },
      ],
      [
        { x: 0, y: 445 },
        { x: 430, y: 445 },
        { x: 590, y: 270 },
        { x: 960, y: 270 },
      ],
    ],
    buildPads: [
      { id: 's23p1', x: 170, y: 190, rallyX: 170, rallyY: 110 },
      { id: 's23p2', x: 170, y: 355, rallyX: 170, rallyY: 445 },
      { id: 's23p3', x: 355, y: 190, rallyX: 355, rallyY: 270 },
      { id: 's23p4', x: 355, y: 355, rallyX: 355, rallyY: 270 },
      { id: 's23p5', x: 525, y: 190, rallyX: 525, rallyY: 270 },
      { id: 's23p6', x: 565, y: 375, rallyX: 590, rallyY: 270 },
      { id: 's23p7', x: 715, y: 155, rallyX: 775, rallyY: 270 },
      { id: 's23p8', x: 715, y: 365, rallyX: 715, rallyY: 270 },
      { id: 's23p9', x: 865, y: 185, rallyX: 865, rallyY: 270 },
      { id: 's23p10', x: 865, y: 360, rallyX: 865, rallyY: 270 },
    ],
    mapTheme: {
      tintColor: '#1E1B4B',
      tintOpacity: 0.22,
      roadOuter: '#09090B',
      roadInner: '#3B0764',
      roadDash: '#E879F9',
      landmarks: [
        { kind: 'CRYSTAL', x: 775, y: 80, scale: 1.1 },
        { kind: 'RUIN', x: 775, y: 470, scale: 1.1 },
        { kind: 'CAMPFIRE', x: 260, y: 190, scale: 0.9 },
      ],
    },
  },
  {
    name: 'Mê Cung Ánh Tím',
    biome: 'ABYSS',
    biomeName: 'Vực Thẳm Hắc Ám',
    paths: [
      [
        { x: 0, y: 280 },
        { x: 165, y: 280 },
        { x: 165, y: 100 },
        { x: 470, y: 100 },
        { x: 470, y: 280 },
        { x: 765, y: 280 },
        { x: 765, y: 140 },
        { x: 960, y: 140 },
      ],
      [
        { x: 0, y: 280 },
        { x: 165, y: 280 },
        { x: 165, y: 460 },
        { x: 470, y: 460 },
        { x: 470, y: 280 },
        { x: 765, y: 280 },
        { x: 765, y: 420 },
        { x: 960, y: 420 },
      ],
    ],
    buildPads: [
      { id: 's24p1', x: 90, y: 185, rallyX: 90, rallyY: 280 },
      { id: 's24p2', x: 295, y: 190, rallyX: 295, rallyY: 100 },
      { id: 's24p3', x: 295, y: 370, rallyX: 295, rallyY: 460 },
      { id: 's24p4', x: 375, y: 280, rallyX: 470, rallyY: 280 },
      { id: 's24p5', x: 585, y: 190, rallyX: 585, rallyY: 280 },
      { id: 's24p6', x: 585, y: 370, rallyX: 585, rallyY: 280 },
      { id: 's24p7', x: 675, y: 190, rallyX: 765, rallyY: 190 },
      { id: 's24p8', x: 675, y: 370, rallyX: 765, rallyY: 370 },
      { id: 's24p9', x: 870, y: 225, rallyX: 870, rallyY: 140 },
      { id: 's24p10', x: 870, y: 340, rallyX: 870, rallyY: 420 },
    ],
    mapTheme: {
      tintColor: '#3B0764',
      tintOpacity: 0.2,
      roadOuter: '#0F172A',
      roadInner: '#581C87',
      roadDash: '#2DD4BF',
      landmarks: [
        { kind: 'CRYSTAL', x: 90, y: 390, scale: 1.0 },
        { kind: 'CRYSTAL', x: 585, y: 90, scale: 1.0 },
        { kind: 'RUIN', x: 585, y: 470, scale: 1.0 },
      ],
    },
  },
  // Stage 25 (BOSS + BOT ESCORTS)
  {
    name: 'Ngai Vàng Hắc Ám',
    biome: 'ABYSS',
    biomeName: 'Vực Thẳm Hắc Ám',
    paths: [
      [
        { x: 0, y: 105 },
        { x: 325, y: 105 },
        { x: 455, y: 280 },
        { x: 690, y: 280 },
        { x: 810, y: 155 },
        { x: 960, y: 155 },
      ],
      [
        { x: 0, y: 280 },
        { x: 690, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 455 },
        { x: 325, y: 455 },
        { x: 455, y: 280 },
        { x: 690, y: 280 },
        { x: 810, y: 405 },
        { x: 960, y: 405 },
      ],
    ],
    buildPads: [
      { id: 's25p1', x: 150, y: 190, rallyX: 150, rallyY: 105 },
      { id: 's25p2', x: 150, y: 370, rallyX: 150, rallyY: 455 },
      { id: 's25p3', x: 325, y: 195, rallyX: 325, rallyY: 280 },
      { id: 's25p4', x: 325, y: 365, rallyX: 325, rallyY: 280 },
      { id: 's25p5', x: 545, y: 185, rallyX: 545, rallyY: 280 },
      { id: 's25p6', x: 545, y: 375, rallyX: 545, rallyY: 280 },
      { id: 's25p7', x: 690, y: 185, rallyX: 690, rallyY: 280 },
      { id: 's25p8', x: 690, y: 375, rallyX: 690, rallyY: 280 },
      { id: 's25p9', x: 865, y: 80, rallyX: 865, rallyY: 155 },
      { id: 's25p10', x: 865, y: 485, rallyX: 865, rallyY: 405 },
    ],
    mapTheme: {
      tintColor: '#2E1065',
      tintOpacity: 0.25,
      roadOuter: '#09090B',
      roadInner: '#4C1D95',
      roadDash: '#F43F5E',
      landmarks: [
        { kind: 'CRYSTAL', x: 545, y: 90, scale: 1.2 },
        { kind: 'CRYSTAL', x: 545, y: 475, scale: 1.2 },
        { kind: 'LAVA', x: 810, y: 280, scale: 0.8 },
      ],
    },
  },

  // ============ BIOME VI: SKY CITADEL (Stages 26 - 30) ============
  {
    name: 'Cầu Vồng Mây Trắng',
    biome: 'SKY',
    biomeName: 'Hoàng Thành Bầu Trời',
    paths: [[
      { x: 0, y: 140 },
      { x: 245, y: 140 },
      { x: 245, y: 415 },
      { x: 525, y: 415 },
      { x: 525, y: 140 },
      { x: 785, y: 140 },
      { x: 785, y: 350 },
      { x: 960, y: 350 },
    ]],
    buildPads: [
      { id: 's26p1', x: 145, y: 230, rallyX: 245, rallyY: 230 },
      { id: 's26p2', x: 340, y: 235, rallyX: 245, rallyY: 235 },
      { id: 's26p3', x: 385, y: 330, rallyX: 385, rallyY: 415 },
      { id: 's26p4', x: 435, y: 235, rallyX: 525, rallyY: 235 },
      { id: 's26p5', x: 615, y: 235, rallyX: 525, rallyY: 235 },
      { id: 's26p6', x: 660, y: 235, rallyX: 660, rallyY: 140 },
      { id: 's26p7', x: 695, y: 350, rallyX: 785, rallyY: 350 },
      { id: 's26p8', x: 875, y: 255, rallyX: 875, rallyY: 350 },
      { id: 's26p9', x: 875, y: 440, rallyX: 875, rallyY: 350 },
    ],
    mapTheme: {
      tintColor: '#0369A1',
      tintOpacity: 0.1,
      roadOuter: '#92400E',
      roadInner: '#FDE68A',
      roadDash: '#FFFFFF',
      landmarks: [
        { kind: 'SHRINE', x: 90, y: 440, scale: 1.1 },
        { kind: 'LANTERN', x: 385, y: 120, scale: 1.0 },
        { kind: 'SHRINE', x: 660, y: 465, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Vườn Treo Thái Dương',
    biome: 'SKY',
    biomeName: 'Hoàng Thành Bầu Trời',
    paths: [
      [
        { x: 0, y: 280 },
        { x: 175, y: 280 },
        { x: 345, y: 105 },
        { x: 675, y: 105 },
        { x: 815, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 280 },
        { x: 500, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 280 },
        { x: 175, y: 280 },
        { x: 345, y: 455 },
        { x: 675, y: 455 },
        { x: 815, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's27p1', x: 120, y: 185, rallyX: 120, rallyY: 280 },
      { id: 's27p2', x: 120, y: 375, rallyX: 120, rallyY: 280 },
      { id: 's27p3', x: 345, y: 195, rallyX: 345, rallyY: 280 },
      { id: 's27p4', x: 345, y: 365, rallyX: 345, rallyY: 280 },
      { id: 's27p5', x: 515, y: 195, rallyX: 515, rallyY: 105 },
      { id: 's27p6', x: 515, y: 365, rallyX: 515, rallyY: 455 },
      { id: 's27p7', x: 675, y: 195, rallyX: 675, rallyY: 280 },
      { id: 's27p8', x: 675, y: 365, rallyX: 675, rallyY: 280 },
      { id: 's27p9', x: 880, y: 190, rallyX: 880, rallyY: 280 },
      { id: 's27p10', x: 880, y: 370, rallyX: 880, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#0284C7',
      tintOpacity: 0.12,
      roadOuter: '#B45309',
      roadInner: '#FEF3C7',
      roadDash: '#38BDF8',
      landmarks: [
        { kind: 'LANTERN', x: 220, y: 100, scale: 1.0 },
        { kind: 'LANTERN', x: 220, y: 460, scale: 1.0 },
        { kind: 'SHRINE', x: 785, y: 95, scale: 1.0 },
      ],
    },
  },
  {
    name: 'Cổng Thánh Thạch Anh',
    biome: 'SKY',
    biomeName: 'Hoàng Thành Bầu Trời',
    paths: [
      [
        { x: 0, y: 105 },
        { x: 455, y: 105 },
        { x: 455, y: 280 },
        { x: 775, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 455 },
        { x: 455, y: 455 },
        { x: 455, y: 280 },
        { x: 775, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's28p1', x: 165, y: 195, rallyX: 165, rallyY: 105 },
      { id: 's28p2', x: 165, y: 365, rallyX: 165, rallyY: 455 },
      { id: 's28p3', x: 350, y: 195, rallyX: 350, rallyY: 105 },
      { id: 's28p4', x: 350, y: 365, rallyX: 350, rallyY: 455 },
      { id: 's28p5', x: 355, y: 280, rallyX: 455, rallyY: 280 },
      { id: 's28p6', x: 560, y: 190, rallyX: 560, rallyY: 280 },
      { id: 's28p7', x: 560, y: 370, rallyX: 560, rallyY: 280 },
      { id: 's28p8', x: 715, y: 190, rallyX: 715, rallyY: 280 },
      { id: 's28p9', x: 715, y: 370, rallyX: 715, rallyY: 280 },
      { id: 's28p10', x: 865, y: 190, rallyX: 865, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#1E3A8A',
      tintOpacity: 0.14,
      roadOuter: '#78350F',
      roadInner: '#E0F2FE',
      roadDash: '#FACC15',
      landmarks: [
        { kind: 'SHRINE', x: 90, y: 280, scale: 1.2 },
        { kind: 'LANTERN', x: 635, y: 95, scale: 1.1 },
        { kind: 'LANTERN', x: 635, y: 465, scale: 1.1 },
      ],
    },
  },
  {
    name: 'Đấu Trường Thiên Sứ',
    biome: 'SKY',
    biomeName: 'Hoàng Thành Bầu Trời',
    paths: [
      [
        { x: 0, y: 120 },
        { x: 265, y: 120 },
        { x: 430, y: 280 },
        { x: 665, y: 430 },
        { x: 830, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 280 },
        { x: 430, y: 280 },
        { x: 830, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 440 },
        { x: 265, y: 440 },
        { x: 430, y: 280 },
        { x: 665, y: 120 },
        { x: 830, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's29p1', x: 145, y: 200, rallyX: 145, rallyY: 120 },
      { id: 's29p2', x: 145, y: 360, rallyX: 145, rallyY: 440 },
      { id: 's29p3', x: 315, y: 200, rallyX: 430, rallyY: 280 },
      { id: 's29p4', x: 315, y: 360, rallyX: 430, rallyY: 280 },
      { id: 's29p5', x: 525, y: 170, rallyX: 430, rallyY: 280 },
      { id: 's29p6', x: 525, y: 390, rallyX: 430, rallyY: 280 },
      { id: 's29p7', x: 665, y: 210, rallyX: 665, rallyY: 280 },
      { id: 's29p8', x: 665, y: 350, rallyX: 665, rallyY: 280 },
      { id: 's29p9', x: 865, y: 190, rallyX: 830, rallyY: 280 },
      { id: 's29p10', x: 865, y: 370, rallyX: 830, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#0F172A',
      tintOpacity: 0.14,
      roadOuter: '#92400E',
      roadInner: '#FEF9C3',
      roadDash: '#F59E0B',
      landmarks: [
        { kind: 'SHRINE', x: 430, y: 95, scale: 1.0 },
        { kind: 'SHRINE', x: 430, y: 465, scale: 1.0 },
        { kind: 'LANTERN', x: 775, y: 110, scale: 1.0 },
      ],
    },
  },
  // Stage 30 (FINAL GRAND BOSS + DOUBLE BOT ESCORTS)
  {
    name: 'Đỉnh Cao Vệ Thành',
    biome: 'SKY',
    biomeName: 'Hoàng Thành Bầu Trời',
    paths: [
      [
        { x: 0, y: 100 },
        { x: 245, y: 100 },
        { x: 245, y: 280 },
        { x: 525, y: 280 },
        { x: 655, y: 120 },
        { x: 835, y: 120 },
        { x: 835, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 280 },
        { x: 525, y: 280 },
        { x: 835, y: 280 },
        { x: 960, y: 280 },
      ],
      [
        { x: 0, y: 460 },
        { x: 245, y: 460 },
        { x: 245, y: 280 },
        { x: 525, y: 280 },
        { x: 655, y: 440 },
        { x: 835, y: 440 },
        { x: 835, y: 280 },
        { x: 960, y: 280 },
      ],
    ],
    buildPads: [
      { id: 's30p1', x: 125, y: 190, rallyX: 125, rallyY: 100 },
      { id: 's30p2', x: 125, y: 370, rallyX: 125, rallyY: 460 },
      { id: 's30p3', x: 375, y: 190, rallyX: 375, rallyY: 280 },
      { id: 's30p4', x: 375, y: 370, rallyX: 375, rallyY: 280 },
      { id: 's30p5', x: 525, y: 175, rallyX: 525, rallyY: 280 },
      { id: 's30p6', x: 525, y: 385, rallyX: 525, rallyY: 280 },
      { id: 's30p7', x: 685, y: 280, rallyX: 685, rallyY: 280 },
      { id: 's30p8', x: 745, y: 195, rallyX: 745, rallyY: 120 },
      { id: 's30p9', x: 745, y: 365, rallyX: 745, rallyY: 440 },
      { id: 's30p10', x: 895, y: 190, rallyX: 895, rallyY: 280 },
      { id: 's30p11', x: 895, y: 370, rallyX: 895, rallyY: 280 },
    ],
    mapTheme: {
      tintColor: '#B45309',
      tintOpacity: 0.14,
      roadOuter: '#78350F',
      roadInner: '#FDE68A',
      roadDash: '#EF4444',
      landmarks: [
        { kind: 'SHRINE', x: 420, y: 90, scale: 1.15 },
        { kind: 'SHRINE', x: 420, y: 470, scale: 1.15 },
        { kind: 'LANTERN', x: 745, y: 55, scale: 0.95 },
        { kind: 'LANTERN', x: 745, y: 505, scale: 0.95 },
      ],
    },
  },
];

const TD_LEVELS: TdLevelConfig[] = STAGE_BLUEPRINTS.map((bp, idx) => {
  const level = idx + 1;
  const pathCount = bp.paths.length;
  const difficultyLabel =
    level <= 5
      ? 'Khởi đầu'
      : level <= 10
        ? 'Trung bình'
        : level <= 15
          ? 'Thử thách'
          : level <= 20
            ? 'Ác liệt'
            : level <= 25
              ? 'Cực hạn'
              : 'Huyền thoại';

  return {
    level,
    name: bp.name,
    biome: bp.biome,
    biomeName: bp.biomeName,
    difficultyLabel,
    startingGold: 230 + (level - 1) * 28 + (pathCount - 1) * 45,
    startingLives: 20,
    paths: bp.paths,
    buildPads: bp.buildPads,
    mapTheme: bp.mapTheme,
    waves: buildWavesForStage(level, pathCount),
  };
});

export function getTdLevelConfig(level: number): TdLevelConfig {
  const clamped = Math.max(1, Math.min(TD_MAX_LEVEL, Math.floor(level)));
  return TD_LEVELS[clamped - 1];
}

export function getAllTdLevels(): TdLevelConfig[] {
  return TD_LEVELS;
}

export function getTotalStarsEarnedInTd(levels: Record<number, { stars?: number }>): number {
  return Object.values(levels).reduce((sum, item) => sum + (item?.stars ?? 0), 0);
}

export function getSpentUpgradeStars(upgrades: TdUpgrades): number {
  let spent = 0;
  for (const track of TD_UPGRADE_TRACKS) {
    const lv = Math.max(0, Math.min(3, upgrades[track.id] ?? 0));
    for (let i = 0; i < lv; i++) {
      spent += track.tierCosts[i];
    }
  }
  return spent;
}
