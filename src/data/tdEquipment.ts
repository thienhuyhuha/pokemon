import {
  TdCombatFocus,
  TdEquipmentBonuses,
  TdEquipmentItem,
  TdEquipmentRarity,
  TdEquipmentSlot,
  TdHeroEquipmentMap,
  TdTowerType,
} from '../types/towerDefense';

export const TD_EQUIP_DROP_CHANCE = 0.001; // 0.1% / quái bị hạ
export const TD_GEM_DROP_CHANCE = 0.02; // 2% / quái bị hạ
export const TD_ENHANCE_MAX_LEVEL = 12;
export const TD_ENHANCE_STAT_PER_LEVEL = 0.02; // +2% mỗi cấp
export const TD_ENHANCE_RATE_STEP_DROP = 8; // giảm 8% mỗi cấp (100% -> 12%)

export const TD_ALL_HERO_TYPES: TdTowerType[] = [
  'ARCHER',
  'BARRACKS',
  'MAGE',
  'ARTILLERY',
  'ASSASSIN',
  'VALKYRIE',
  'KNIGHT_GUARD',
  'PYROMANCER',
  'MECHANIST',
  'CHRONOMANCER',
];

export const TD_EQUIPMENT_SLOT_ORDER: TdEquipmentSlot[] = [
  'WEAPON',
  'GLOVES',
  'RING',
  'NECKLACE',
  'HELM',
  'ARMOR',
  'PANTS',
  'BOOTS',
  'WINGS',
];

export interface TdEquipmentSlotMeta {
  slot: TdEquipmentSlot;
  label: string;
  statLabel: string;
  accent: string;
}

export const TD_EQUIPMENT_SLOT_META: Record<TdEquipmentSlot, TdEquipmentSlotMeta> = {
  WEAPON: { slot: 'WEAPON', label: 'Vũ Khí', statLabel: 'Sát thương', accent: '#F87171' },
  GLOVES: { slot: 'GLOVES', label: 'Bao Tay', statLabel: 'Tốc độ đánh', accent: '#38BDF8' },
  RING: { slot: 'RING', label: 'Nhẫn', statLabel: 'Tỷ lệ bạo kích', accent: '#FACC15' },
  NECKLACE: { slot: 'NECKLACE', label: 'Dây Chuyền', statLabel: 'Sát thương bạo kích', accent: '#FB923C' },
  HELM: { slot: 'HELM', label: 'Mũ', statLabel: '% Dính hiệu ứng', accent: '#C084FC' },
  ARMOR: { slot: 'ARMOR', label: 'Áo Giáp', statLabel: 'Xuyên giáp & Kháng phép', accent: '#94A3B8' },
  PANTS: { slot: 'PANTS', label: 'Quần', statLabel: '% Tác dụng hiệu ứng', accent: '#4ADE80' },
  BOOTS: { slot: 'BOOTS', label: 'Giày', statLabel: '% Giảm hồi chiêu', accent: '#2DD4BF' },
  WINGS: { slot: 'WINGS', label: 'Cánh', statLabel: '% Đánh lan kế bên', accent: '#F472B6' },
};

export interface TdEquipmentRarityMeta {
  rarity: TdEquipmentRarity;
  label: string;
  shortLabel: string;
  color: string;
  bgClass: string;
  borderClass: string;
  weight: number;
  displayRate: string;
  statScale: number;
  rank: number;
}

export const TD_EQUIPMENT_RARITY_META: Record<TdEquipmentRarity, TdEquipmentRarityMeta> = {
  COMMON: {
    rarity: 'COMMON',
    label: 'Thường (Common)',
    shortLabel: 'Common',
    color: '#CBD5E1',
    bgClass: 'bg-slate-800/80',
    borderClass: 'border-slate-500/60',
    weight: 65,
    displayRate: '65%',
    statScale: 1.0,
    rank: 1,
  },
  UNCOMMON: {
    rarity: 'UNCOMMON',
    label: 'Hiếm Nhẹ (Uncommon)',
    shortLabel: 'Uncommon',
    color: '#4ADE80',
    bgClass: 'bg-emerald-950/70',
    borderClass: 'border-emerald-500/70',
    weight: 15,
    displayRate: '15%',
    statScale: 1.55,
    rank: 2,
  },
  RARE: {
    rarity: 'RARE',
    label: 'Quý Hiếm (Rare)',
    shortLabel: 'Rare',
    color: '#38BDF8',
    bgClass: 'bg-sky-950/70',
    borderClass: 'border-sky-400/80',
    weight: 10,
    displayRate: '10%',
    statScale: 2.25,
    rank: 3,
  },
  EPIC: {
    rarity: 'EPIC',
    label: 'Sử Thi (Epic)',
    shortLabel: 'Epic',
    color: '#C084FC',
    bgClass: 'bg-purple-950/70',
    borderClass: 'border-purple-400/85',
    weight: 3,
    displayRate: '3%',
    statScale: 3.1,
    rank: 4,
  },
  LEGEND: {
    rarity: 'LEGEND',
    label: 'Huyền Thoại (Legend)',
    shortLabel: 'Legend',
    color: '#FACC15',
    bgClass: 'bg-amber-950/75',
    borderClass: 'border-amber-400',
    weight: 1.5,
    displayRate: '1.5%',
    statScale: 4.3,
    rank: 5,
  },
  MYTHIC: {
    rarity: 'MYTHIC',
    label: 'Thần Thoại (Mythic)',
    shortLabel: 'Mythic',
    color: '#FB7185',
    bgClass: 'bg-rose-950/80',
    borderClass: 'border-rose-400',
    weight: 0.5,
    displayRate: '0.5%',
    statScale: 5.8,
    rank: 6,
  },
};

export const TD_HERO_SHORT_NAMES: Record<TdTowerType, string> = {
  ARCHER: 'Cung Thủ',
  BARRACKS: 'Vệ Binh',
  MAGE: 'Pháp Sư',
  ARTILLERY: 'Pháo Binh',
  ASSASSIN: 'Sát Thủ',
  VALKYRIE: 'Thánh Nữ',
  KNIGHT_GUARD: 'Long Kỵ Sĩ',
  PYROMANCER: 'Hỏa Pháp Sư',
  MECHANIST: 'Cơ Giới Sư',
  CHRONOMANCER: 'Thời Không',
};

const HERO_SLOT_TITLES: Record<TdTowerType, Record<TdEquipmentSlot, string>> = {
  ARCHER: {
    WEAPON: 'Trường Cung Phong Ưng',
    GLOVES: 'Bao Tay Xạ Tiễn',
    RING: 'Nhẫn Nhãn Thần',
    NECKLACE: 'Dây Chuyền Lông Ưng',
    HELM: 'Mũ Thợ Săn Rừng',
    ARMOR: 'Áo Da Tuần Kiểm',
    PANTS: 'Quần Lướt Gió',
    BOOTS: 'Giày Bão Tố',
    WINGS: 'Cánh Thiên Ưng',
  },
  BARRACKS: {
    WEAPON: 'Kiếm Hiệu Lệnh Hoàng Gia',
    GLOVES: 'Bao Tay Thiết Vệ',
    RING: 'Nhẫn Chí Mạng Thánh',
    NECKLACE: 'Dây Chuyền Sư Tử',
    HELM: 'Mũ Trụ Thành Chủ',
    ARMOR: 'Giáp Hộ Thành',
    PANTS: 'Quần Chiến Tướng',
    BOOTS: 'Giày Quân Đoàn',
    WINGS: 'Cánh Chiến Kỳ',
  },
  MAGE: {
    WEAPON: 'Trượng Băng Tinh',
    GLOVES: 'Bao Tay Pháp Ấn',
    RING: 'Nhẫn Ma Nhãn',
    NECKLACE: 'Dây Chuyền Cổ Ngữ',
    HELM: 'Mũ Phù Thủy Băng',
    ARMOR: 'Áo Choàng Huyền Thuật',
    PANTS: 'Quần Sương Giá',
    BOOTS: 'Giày Dịch Chuyển',
    WINGS: 'Cánh Hàn Băng',
  },
  ARTILLERY: {
    WEAPON: 'Nòng Pháo Long Hỏa',
    GLOVES: 'Bao Tay Nạp Đạn',
    RING: 'Nhẫn Tâm Điểm',
    NECKLACE: 'Dây Chuyền Thuốc Súng',
    HELM: 'Mũ Công Thành',
    ARMOR: 'Áo Giáp Nặng',
    PANTS: 'Quần Chống Giật',
    BOOTS: 'Giày Trụ Vững',
    WINGS: 'Cánh Hỏa Tiễn',
  },
  ASSASSIN: {
    WEAPON: 'Song Đao Hư Ảnh',
    GLOVES: 'Bao Tay Ám Ảnh',
    RING: 'Nhẫn Tử Thần',
    NECKLACE: 'Dây Chuyền Huyết Độc',
    HELM: 'Mũ Mặt Nạ Đêm',
    ARMOR: 'Áo Vải Bóng Tối',
    PANTS: 'Quần Khinh Công',
    BOOTS: 'Giày Vô Thanh',
    WINGS: 'Cánh Dơi Đêm',
  },
  VALKYRIE: {
    WEAPON: 'Thánh Thương Ánh Sáng',
    GLOVES: 'Bao Tay Thiên Sứ',
    RING: 'Nhẫn Nhật Quang',
    NECKLACE: 'Dây Chuyền Chúc Phúc',
    HELM: 'Mũ Vương Miện Sáng',
    ARMOR: 'Áo Thánh Quang',
    PANTS: 'Quần Thiên Vực',
    BOOTS: 'Giày Thánh Nữ',
    WINGS: 'Cánh Seraphim',
  },
  KNIGHT_GUARD: {
    WEAPON: 'Long Thương Hỏa Diễm',
    GLOVES: 'Bao Tay Kỵ Sĩ Rồng',
    RING: 'Nhẫn Vảy Rồng',
    NECKLACE: 'Dây Chuyền Long Tâm',
    HELM: 'Mũ Sừng Rồng',
    ARMOR: 'Giáp Bạch Kim Rồng',
    PANTS: 'Quần Thiết Kỵ',
    BOOTS: 'Giày Thúc Ngựa',
    WINGS: 'Cánh Hỏa Long',
  },
  PYROMANCER: {
    WEAPON: 'Hỏa Trượng Phượng Hoàng',
    GLOVES: 'Bao Tay Dung Nham',
    RING: 'Nhẫn Bùng Nổ',
    NECKLACE: 'Dây Chuyền Thái Dương',
    HELM: 'Mũ Hỏa Diệm',
    ARMOR: 'Áo Choàng Tro Tàn',
    PANTS: 'Quần Lửa Thiêng',
    BOOTS: 'Giày Lưu Tinh',
    WINGS: 'Cánh Phượng Lửa',
  },
  MECHANIST: {
    WEAPON: 'Súng Điện Từ Plasma',
    GLOVES: 'Bao Tay Cơ Khí',
    RING: 'Nhẫn Khóa Mục Tiêu',
    NECKLACE: 'Dây Chuyền Lõi Năng Lượng',
    HELM: 'Mũ Kính Nhiệt',
    ARMOR: 'Áo Hợp Kim Titan',
    PANTS: 'Quần Khung Trợ Lực',
    BOOTS: 'Giày Phản Lực',
    WINGS: 'Cánh Đẩy Drone',
  },
  CHRONOMANCER: {
    WEAPON: 'Đồng Hồ Hư Không',
    GLOVES: 'Bao Tay Ngưng Đọng',
    RING: 'Nhẫn Vòng Lặp',
    NECKLACE: 'Dây Chuyền Dòng Thời Gian',
    HELM: 'Mũ Sao Băng',
    ARMOR: 'Áo Tinh Vân',
    PANTS: 'Quần Nghịch Lý',
    BOOTS: 'Giày Tức Thời',
    WINGS: 'Cánh Không Gian',
  },
};

export function getEquipmentDisplayName(
  towerType: TdTowerType,
  slot: TdEquipmentSlot
): string {
  return HERO_SLOT_TITLES[towerType]?.[slot] ?? TD_EQUIPMENT_SLOT_META[slot].label;
}

export function getEquipmentUniqueKey(
  towerType: TdTowerType,
  slot: TdEquipmentSlot,
  rarity: TdEquipmentRarity
): string {
  return `${towerType}:${slot}:${rarity}`;
}

export function getEnhancementSuccessRate(currentLevel: number): number {
  const clamped = Math.max(0, Math.min(TD_ENHANCE_MAX_LEVEL - 1, Math.floor(currentLevel)));
  return Math.max(12, 100 - clamped * TD_ENHANCE_RATE_STEP_DROP);
}

export function getEquipmentEnhanceMult(level: number): number {
  const lv = Math.max(0, Math.min(TD_ENHANCE_MAX_LEVEL, Math.floor(level)));
  return 1 + lv * TD_ENHANCE_STAT_PER_LEVEL;
}

export function getEquipmentEffectiveStats(item: TdEquipmentItem): TdEquipmentBonuses {
  const scale = TD_EQUIPMENT_RARITY_META[item.rarity].statScale;
  const enh = getEquipmentEnhanceMult(item.level);
  const mult = scale * enh;
  const round4 = (v: number) => Number(v.toFixed(4));

  switch (item.slot) {
    case 'WEAPON':
      return { damagePct: round4(0.06 * mult) };
    case 'GLOVES':
      return { attackSpeedPct: round4(0.05 * mult) };
    case 'RING':
      return { critChanceBonus: round4(0.025 * mult) };
    case 'NECKLACE':
      return { critDamageBonus: round4(0.18 * mult) };
    case 'HELM':
      return { effectChancePct: round4(0.12 * mult) };
    case 'ARMOR':
      return {
        armorPiercePct: round4(0.045 * mult),
        magicPiercePct: round4(0.045 * mult),
      };
    case 'PANTS':
      return { effectPotencyPct: round4(0.08 * mult) };
    case 'BOOTS':
      return { skillCdrPct: round4(0.045 * mult) };
    case 'WINGS':
      return { splashSharePct: round4(0.07 * mult) };
  }
}

export function formatEquipmentStatSummary(item: TdEquipmentItem): string {
  const b = getEquipmentEffectiveStats(item);
  switch (item.slot) {
    case 'WEAPON':
      return `+${((b.damagePct ?? 0) * 100).toFixed(1)}% Sát thương`;
    case 'GLOVES':
      return `+${((b.attackSpeedPct ?? 0) * 100).toFixed(1)}% Tốc đánh`;
    case 'RING':
      return `+${((b.critChanceBonus ?? 0) * 100).toFixed(1)}% TL Bạo kích`;
    case 'NECKLACE':
      return `+${((b.critDamageBonus ?? 0) * 100).toFixed(0)}% ST Bạo kích`;
    case 'HELM':
      return `+${((b.effectChancePct ?? 0) * 100).toFixed(1)}% Tỷ lệ hiệu ứng`;
    case 'ARMOR':
      return `+${((b.armorPiercePct ?? 0) * 100).toFixed(1)}% Xuyên giáp & KP`;
    case 'PANTS':
      return `+${((b.effectPotencyPct ?? 0) * 100).toFixed(1)}% Tác dụng hiệu ứng`;
    case 'BOOTS':
      return `-${((b.skillCdrPct ?? 0) * 100).toFixed(1)}% CD Chiêu thức`;
    case 'WINGS':
      return `+${((b.splashSharePct ?? 0) * 100).toFixed(1)}% Đánh lan kế bên`;
  }
}

export function aggregateHeroEquipmentBonuses(
  towerType: TdTowerType,
  heroEquipment: TdHeroEquipmentMap | undefined,
  inventoryById: Map<string, TdEquipmentItem>
): TdEquipmentBonuses {
  const result: TdEquipmentBonuses = {};
  const slotsMap = heroEquipment?.[towerType];
  if (!slotsMap) return result;

  for (const slot of TD_EQUIPMENT_SLOT_ORDER) {
    const itemId = slotsMap[slot];
    if (!itemId) continue;
    const item = inventoryById.get(itemId);
    if (!item || item.towerType !== towerType || item.slot !== slot) continue;
    const eff = getEquipmentEffectiveStats(item);
    if (eff.damagePct) result.damagePct = (result.damagePct ?? 0) + eff.damagePct;
    if (eff.attackSpeedPct) result.attackSpeedPct = (result.attackSpeedPct ?? 0) + eff.attackSpeedPct;
    if (eff.critChanceBonus) result.critChanceBonus = (result.critChanceBonus ?? 0) + eff.critChanceBonus;
    if (eff.critDamageBonus) result.critDamageBonus = (result.critDamageBonus ?? 0) + eff.critDamageBonus;
    if (eff.effectChancePct) result.effectChancePct = (result.effectChancePct ?? 0) + eff.effectChancePct;
    if (eff.armorPiercePct) result.armorPiercePct = (result.armorPiercePct ?? 0) + eff.armorPiercePct;
    if (eff.magicPiercePct) result.magicPiercePct = (result.magicPiercePct ?? 0) + eff.magicPiercePct;
    if (eff.effectPotencyPct) result.effectPotencyPct = (result.effectPotencyPct ?? 0) + eff.effectPotencyPct;
    if (eff.skillCdrPct) result.skillCdrPct = (result.skillCdrPct ?? 0) + eff.skillCdrPct;
    if (eff.splashSharePct) result.splashSharePct = (result.splashSharePct ?? 0) + eff.splashSharePct;
  }

  return result;
}

export function rollEquipmentRarity(): TdEquipmentRarity {
  const ordered: TdEquipmentRarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGEND', 'MYTHIC'];
  const totalWeight = ordered.reduce((acc, r) => acc + TD_EQUIPMENT_RARITY_META[r].weight, 0);
  let r = Math.random() * totalWeight;
  for (const rarity of ordered) {
    r -= TD_EQUIPMENT_RARITY_META[rarity].weight;
    if (r <= 0) return rarity;
  }
  return 'COMMON';
}

/**
 * Rolls one hero-bound equipment drop. Returns null if the rolled (towerType, slot, rarity)
 * already exists in `ownedKeys` so duplicates are NEVER picked up.
 */
export function rollNonDuplicateEquipment(
  ownedKeys: Set<string>,
  unlockedHeroes?: TdTowerType[]
): TdEquipmentItem | null {
  const heroPool =
    unlockedHeroes && unlockedHeroes.length > 0 ? unlockedHeroes : TD_ALL_HERO_TYPES;
  const towerType = heroPool[Math.floor(Math.random() * heroPool.length)] ?? 'ARCHER';
  const slot =
    TD_EQUIPMENT_SLOT_ORDER[Math.floor(Math.random() * TD_EQUIPMENT_SLOT_ORDER.length)] ?? 'WEAPON';
  const rarity = rollEquipmentRarity();
  const key = getEquipmentUniqueKey(towerType, slot, rarity);
  if (ownedKeys.has(key)) {
    return null;
  }
  return {
    id: `eq-${towerType.toLowerCase()}-${slot.toLowerCase()}-${rarity.toLowerCase()}`,
    towerType,
    slot,
    rarity,
    level: 0,
  };
}

export interface TdUltimateDesc {
  name: string;
  desc: string;
}

export function getHeroMaxUltimateInfo(
  towerType: TdTowerType,
  focusBranch?: TdCombatFocus | null
): TdUltimateDesc {
  switch (towerType) {
    case 'ARCHER':
      if (focusBranch === 'FOCUSED') {
        return {
          name: 'Thần Tiễn',
          desc: 'Cấp 30: Khi toàn bản đồ còn ≤ 2 quái, bắn sát thương x3 kèm choáng 3s (kéo dài 3s, CD 60s).',
        };
      }
      return {
        name: 'Bạo Phong',
        desc: 'Cấp 30: Khi toàn bản đồ còn < 8 quái, tấn công sức mạnh x5 trong 3s (CD 100s).',
      };
    case 'BARRACKS':
      return {
        name: 'Thánh Lệnh Chí Mạng',
        desc: 'Cấp 30: Mỗi 100s buff thêm +20% tỷ lệ bạo kích & +500% sát thương bạo kích cho đồng minh trong vùng 5s.',
      };
    case 'ARTILLERY':
      return {
        name: 'Chấn Địa Pháo',
        desc: 'Cấp 20: Tăng tỷ lệ gây choáng bản thân lên 5% trong 5s (CD 100s).',
      };
    case 'VALKYRIE':
      return {
        name: 'Thánh Quang Vô Song',
        desc: 'Cấp 20: Nhân đôi tốc độ đánh & sát thương (x2) cho đồng minh trong vùng ảnh hưởng trong 5s (CD 200s).',
      };
    case 'MAGE':
      if (focusBranch === 'FOCUSED') {
        return {
          name: 'Hàn Ngục Tối Thượng',
          desc: 'Cấp 20: Khi toàn bản đồ còn ≤ 3 quái, đóng băng mục tiêu máu cao nhất 3s & x2.5 ST (CD 80s).',
        };
      }
      return {
        name: 'Đại Băng Phong',
        desc: 'Cấp 20: Khi toàn bản đồ còn < 5 quái, đóng băng 4 quái máu cao nhất trong 3s (CD 100s).',
      };
    case 'ASSASSIN':
      return {
        name: 'Cuồng Sát',
        desc: 'Cấp 20: Trong 5s tấn công thêm +3 mục tiêu và tăng +100% tốc độ đánh (CD 100s).',
      };
    case 'KNIGHT_GUARD':
      return {
        name: 'Long Uy Chấn Lùi',
        desc: 'Cấp 20: Buff +0,5% tỷ lệ đánh lùi cho toàn quân trên bản đồ trong 3s (CD 100s).',
      };
    case 'PYROMANCER':
      return {
        name: 'Tường Lửa Hộ Thành',
        desc: 'Cấp 20: Khi thành mất 1 máu, lập tức chặn Tường Lửa ở phía cổng thành trong 2s (không cộng dồn khi nhiều Hỏa Pháp Sư, CD 200s).',
      };
    case 'MECHANIST':
      return {
        name: 'Quá Tải Lò Phản Ứng',
        desc: 'Cấp 20: Tăng +100% tốc độ bắn & +30% xuyên giáp trong 5s (CD 85s).',
      };
    case 'CHRONOMANCER':
      return {
        name: 'Ngưng Đọng Thời Không',
        desc: 'Cấp 20: Làm chậm toàn bộ quái trong tầm +20% và x2 tốc độ tia thời gian 4s (CD 95s).',
      };
  }
}
