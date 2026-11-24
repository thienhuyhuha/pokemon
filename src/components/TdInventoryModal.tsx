import React, { useMemo, useState } from 'react';
import {
  ArrowUpCircle,
  Check,
  Gem,
  Shield,
  Sparkles,
  Swords,
  X,
} from 'lucide-react';
import {
  aggregateHeroEquipmentBonuses,
  formatEquipmentStatSummary,
  getEnhancementSuccessRate,
  getEquipmentDisplayName,
  TD_ALL_HERO_TYPES,
  TD_ENHANCE_MAX_LEVEL,
  TD_EQUIPMENT_RARITY_META,
  TD_EQUIPMENT_SLOT_META,
  TD_EQUIPMENT_SLOT_ORDER,
  TD_HERO_SHORT_NAMES,
} from '../data/tdEquipment';
import { TD_TOWERS } from '../data/tdLevels';
import {
  TdEquipmentItem,
  TdEquipmentSlot,
  TdHeroEquipmentMap,
  TdTowerType,
} from '../types/towerDefense';
import { TdTowerPreview } from './TdArtwork';

interface TdInventoryModalProps {
  open: boolean;
  onClose: () => void;
  enhancementGems: number;
  equipmentInventory: TdEquipmentItem[];
  heroEquipment: TdHeroEquipmentMap;
  onEquipItem: (
    towerType: TdTowerType,
    slot: TdEquipmentSlot,
    itemId: string | null
  ) => void;
  onEnhanceItem: (itemId: string) => {
    success: boolean;
    newLevel: number;
    message: string;
  };
}

function getSlotIconBadge(slot: TdEquipmentSlot): string {
  switch (slot) {
    case 'WEAPON':
      return '⚔️';
    case 'GLOVES':
      return '🥊';
    case 'RING':
      return '💍';
    case 'NECKLACE':
      return '📿';
    case 'HELM':
      return '🪖';
    case 'ARMOR':
      return '🛡️';
    case 'PANTS':
      return '👖';
    case 'BOOTS':
      return '🥾';
    case 'WINGS':
      return '🪽';
  }
}

export const TdInventoryModal: React.FC<TdInventoryModalProps> = ({
  open,
  onClose,
  enhancementGems,
  equipmentInventory,
  heroEquipment,
  onEquipItem,
  onEnhanceItem,
}) => {
  const [selectedHero, setSelectedHero] = useState<TdTowerType>('ARCHER');
  const [slotFilter, setSlotFilter] = useState<TdEquipmentSlot | 'ALL'>('ALL');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const inventoryById = useMemo(() => {
    const map = new Map<string, TdEquipmentItem>();
    for (const item of equipmentInventory) {
      map.set(item.id, item);
    }
    return map;
  }, [equipmentInventory]);

  const equippedIdsSet = useMemo(() => {
    const s = new Set<string>();
    for (const heroType of TD_ALL_HERO_TYPES) {
      const m = heroEquipment[heroType];
      if (!m) continue;
      for (const slot of TD_EQUIPMENT_SLOT_ORDER) {
        const id = m[slot];
        if (id) s.add(id);
      }
    }
    return s;
  }, [heroEquipment]);

  const heroEquippedCounts = useMemo(() => {
    const counts: Partial<Record<TdTowerType, number>> = {};
    for (const heroType of TD_ALL_HERO_TYPES) {
      const m = heroEquipment[heroType];
      let c = 0;
      if (m) {
        for (const slot of TD_EQUIPMENT_SLOT_ORDER) {
          if (m[slot] && inventoryById.has(m[slot]!)) c += 1;
        }
      }
      counts[heroType] = c;
    }
    return counts;
  }, [heroEquipment, inventoryById]);

  const heroOwnedCounts = useMemo(() => {
    const counts: Partial<Record<TdTowerType, number>> = {};
    for (const item of equipmentInventory) {
      counts[item.towerType] = (counts[item.towerType] ?? 0) + 1;
    }
    return counts;
  }, [equipmentInventory]);

  const heroBonuses = useMemo(
    () => aggregateHeroEquipmentBonuses(selectedHero, heroEquipment, inventoryById),
    [heroEquipment, inventoryById, selectedHero]
  );

  const heroItems = useMemo(() => {
    return equipmentInventory
      .filter((item) => item.towerType === selectedHero)
      .filter((item) => slotFilter === 'ALL' || item.slot === slotFilter)
      .sort((a, b) => {
        const rDiff =
          TD_EQUIPMENT_RARITY_META[b.rarity].rank -
          TD_EQUIPMENT_RARITY_META[a.rarity].rank;
        if (rDiff !== 0) return rDiff;
        if (b.level !== a.level) return b.level - a.level;
        return (
          TD_EQUIPMENT_SLOT_ORDER.indexOf(a.slot) -
          TD_EQUIPMENT_SLOT_ORDER.indexOf(b.slot)
        );
      });
  }, [equipmentInventory, selectedHero, slotFilter]);

  const activeItem = useMemo(() => {
    if (selectedItemId && inventoryById.has(selectedItemId)) {
      const it = inventoryById.get(selectedItemId)!;
      if (it.towerType === selectedHero) return it;
    }
    return heroItems[0] ?? null;
  }, [heroItems, inventoryById, selectedHero, selectedItemId]);

  if (!open) return null;

  const bonusTags: string[] = [];
  if (heroBonuses.damagePct) {
    bonusTags.push(`+${(heroBonuses.damagePct * 100).toFixed(1)}% ST`);
  }
  if (heroBonuses.attackSpeedPct) {
    bonusTags.push(`+${(heroBonuses.attackSpeedPct * 100).toFixed(1)}% Tốc đánh`);
  }
  if (heroBonuses.critChanceBonus) {
    bonusTags.push(`+${(heroBonuses.critChanceBonus * 100).toFixed(1)}% TL Bạo`);
  }
  if (heroBonuses.critDamageBonus) {
    bonusTags.push(`+${(heroBonuses.critDamageBonus * 100).toFixed(0)}% ST Bạo`);
  }
  if (heroBonuses.effectChancePct) {
    bonusTags.push(`+${(heroBonuses.effectChancePct * 100).toFixed(1)}% TL Hiệu ứng`);
  }
  if (heroBonuses.armorPiercePct || heroBonuses.magicPiercePct) {
    bonusTags.push(
      `+${((heroBonuses.armorPiercePct ?? 0) * 100).toFixed(1)}% Xuyên Giáp & KP`
    );
  }
  if (heroBonuses.effectPotencyPct) {
    bonusTags.push(`+${(heroBonuses.effectPotencyPct * 100).toFixed(1)}% Hiệu lực`);
  }
  if (heroBonuses.skillCdrPct) {
    bonusTags.push(`-${(heroBonuses.skillCdrPct * 100).toFixed(1)}% CD Chiêu`);
  }
  if (heroBonuses.splashSharePct) {
    bonusTags.push(`+${(heroBonuses.splashSharePct * 100).toFixed(1)}% Đánh lan`);
  }

  const handleSelectHero = (hero: TdTowerType) => {
    setSelectedHero(hero);
    setSlotFilter('ALL');
    setSelectedItemId(null);
    setFeedback(null);
  };

  const handleTryEnhance = (item: TdEquipmentItem) => {
    const res = onEnhanceItem(item.id);
    setFeedback({ ok: res.success, text: res.message });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0F172A] border border-amber-500/60 p-3.5 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5 text-[#FACC15]" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-white">
                Kho Đồ & Cường Hóa Trang Bị
              </h2>
              <p className="text-xs text-slate-400">
                Mặc tối đa 9 món cho mỗi Tướng trước khi vào trận · Cường hóa tối đa +12 (+2%/cấp)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/60 text-xs font-extrabold text-cyan-200 font-mono-num">
              <Gem className="w-4 h-4 text-cyan-300" />
              <span>{enhancementGems.toLocaleString('vi-VN')} Ngọc Cường Hóa</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 text-xs font-bold text-slate-200 font-mono-num">
              <span>{equipmentInventory.length} món</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng kho đồ"
              className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {TD_ALL_HERO_TYPES.map((hero) => {
            const active = hero === selectedHero;
            const eqCount = heroEquippedCounts[hero] ?? 0;
            const ownCount = heroOwnedCounts[hero] ?? 0;
            return (
              <button
                key={hero}
                type="button"
                onClick={() => handleSelectHero(hero)}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1E293B] border-[#FACC15] text-white'
                    : 'bg-[#131C31] border-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0B1120] border border-slate-700/70 flex items-center justify-center shrink-0">
                  <TdTowerPreview
                    type={hero}
                    level={4}
                    branch={TD_TOWERS[hero].branches[0]?.id}
                    className="w-7 h-7"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold truncate">
                    {TD_HERO_SHORT_NAMES[hero]}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-400">
                    Đeo {eqCount}/9 · Có {ownCount}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Body: Left = 9 Equipped Slots + Total Bonuses, Right = Owned Gear + Enhancement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Panel: 9-Slot Loadout */}
          <div className="lg:col-span-5 rounded-xl bg-[#131C31] border border-slate-800 p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FACC15]" />
                <span className="text-sm font-extrabold text-white">
                  Trang Bị Đang Mặc · {TD_HERO_SHORT_NAMES[selectedHero]}
                </span>
              </div>
              <span className="text-xs font-mono-num font-bold text-amber-300">
                {heroEquippedCounts[selectedHero] ?? 0}/9 ô
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TD_EQUIPMENT_SLOT_ORDER.map((slot) => {
                const slotMeta = TD_EQUIPMENT_SLOT_META[slot];
                const eqId = heroEquipment[selectedHero]?.[slot];
                const eqItem = eqId ? inventoryById.get(eqId) : undefined;
                const rMeta = eqItem
                  ? TD_EQUIPMENT_RARITY_META[eqItem.rarity]
                  : null;
                const isActiveSlot = slotFilter === slot;

                return (
                  <div
                    key={slot}
                    onClick={() => {
                      setSlotFilter((prev) => (prev === slot ? 'ALL' : slot));
                      if (eqItem) setSelectedItemId(eqItem.id);
                    }}
                    className={`rounded-xl border p-2 flex flex-col gap-1 transition-all cursor-pointer ${
                      eqItem && rMeta
                        ? `${rMeta.bgClass} ${rMeta.borderClass}`
                        : 'bg-[#0B1120] border-slate-800 hover:border-slate-600'
                    } ${isActiveSlot ? 'ring-2 ring-[#FACC15]' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-bold text-slate-300 truncate">
                        {getSlotIconBadge(slot)} {slotMeta.label}
                      </span>
                      {eqItem && (
                        <span className="font-mono-num font-extrabold text-[#FACC15] shrink-0">
                          +{eqItem.level}
                        </span>
                      )}
                    </div>

                    {eqItem && rMeta ? (
                      <>
                        <div
                          className="text-[11px] font-extrabold leading-tight truncate"
                          style={{ color: rMeta.color }}
                        >
                          {getEquipmentDisplayName(selectedHero, slot)}
                        </div>
                        <div className="text-[10px] text-slate-200 font-mono-num leading-tight truncate">
                          {formatEquipmentStatSummary(eqItem)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEquipItem(selectedHero, slot, null);
                          }}
                          className="mt-0.5 py-0.5 rounded bg-slate-900/90 hover:bg-rose-950 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-rose-200 cursor-pointer"
                        >
                          Tháo ra
                        </button>
                      </>
                    ) : (
                      <div className="text-[10px] text-slate-500 leading-tight py-1">
                        {slotMeta.statLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Aggregated Hero Equipment Bonuses */}
            <div className="rounded-lg bg-[#0B1120] border border-slate-800 p-2.5 flex flex-col gap-1.5">
              <div className="text-[11px] font-extrabold text-sky-300">
                Tổng Chỉ Số Trang Bị ({TD_HERO_SHORT_NAMES[selectedHero]})
              </div>
              {bonusTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {bonusTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-[#1E293B] border border-slate-700 text-[10.5px] font-mono-num font-bold text-amber-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  Chưa mặc trang bị nào cho {TD_HERO_SHORT_NAMES[selectedHero]}.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Owned Equipment & Enhancement */}
          <div className="lg:col-span-7 rounded-xl bg-[#131C31] border border-slate-800 p-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-extrabold text-white">
                Túi Trang Bị · {TD_HERO_SHORT_NAMES[selectedHero]}
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSlotFilter('ALL')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border cursor-pointer ${
                    slotFilter === 'ALL'
                      ? 'bg-[#FACC15] border-amber-300 text-slate-950'
                      : 'bg-[#0B1120] border-slate-700 text-slate-300'
                  }`}
                >
                  Tất cả ({heroOwnedCounts[selectedHero] ?? 0})
                </button>
                {slotFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSlotFilter('ALL')}
                    className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-sky-950 border border-sky-500/60 text-sky-200 cursor-pointer"
                  >
                    Đang lọc: {TD_EQUIPMENT_SLOT_META[slotFilter].label} ✕
                  </button>
                )}
              </div>
            </div>

            {feedback && (
              <div
                className={`rounded-lg px-3 py-2 text-xs font-bold border ${
                  feedback.ok
                    ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200'
                    : 'bg-rose-950/70 border-rose-500/70 text-rose-200'
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Selected Item Enhancement Card */}
            {activeItem && (() => {
              const rMeta = TD_EQUIPMENT_RARITY_META[activeItem.rarity];
              const slotMeta = TD_EQUIPMENT_SLOT_META[activeItem.slot];
              const isEquipped = equippedIdsSet.has(activeItem.id);
              const isMaxLevel = activeItem.level >= TD_ENHANCE_MAX_LEVEL;
              const successRate = getEnhancementSuccessRate(activeItem.level);
              const nextPreviewItem: TdEquipmentItem = {
                ...activeItem,
                level: Math.min(TD_ENHANCE_MAX_LEVEL, activeItem.level + 1),
              };
              const canEnhance = !isMaxLevel && enhancementGems >= 1;

              return (
                <div
                  className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${rMeta.bgClass} ${rMeta.borderClass}`}
                >
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm">{getSlotIconBadge(activeItem.slot)}</span>
                      <span
                        className="text-sm font-extrabold"
                        style={{ color: rMeta.color }}
                      >
                        {getEquipmentDisplayName(activeItem.towerType, activeItem.slot)} +{activeItem.level}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#0B1120]/80 border border-slate-700"
                        style={{ color: rMeta.color }}
                      >
                        {rMeta.shortLabel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 font-mono-num">
                      {slotMeta.label}: <span className="text-amber-300 font-bold">{formatEquipmentStatSummary(activeItem)}</span>
                      {!isMaxLevel && (
                        <span className="text-emerald-300">
                          {' '}→ +{activeItem.level + 1}: {formatEquipmentStatSummary(nextPreviewItem)}
                        </span>
                      )}
                    </div>
                    {!isMaxLevel ? (
                      <div className="text-[11px] text-slate-300 font-mono-num">
                        Tỷ lệ cường hóa lên +{activeItem.level + 1}:{' '}
                        <span className="text-cyan-300 font-extrabold">{successRate}%</span> · Tốn 1 Ngọc Cường Hóa
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-[#FACC15]">
                        Đã đạt cấp cường hóa tối đa (+{TD_ENHANCE_MAX_LEVEL})!
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onEquipItem(
                          activeItem.towerType,
                          activeItem.slot,
                          isEquipped ? null : activeItem.id
                        )
                      }
                      className={`min-h-[38px] px-3 rounded-lg font-extrabold text-xs flex items-center gap-1 cursor-pointer ${
                        isEquipped
                          ? 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200'
                          : 'bg-[#FACC15] hover:bg-yellow-300 text-slate-950'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEquipped ? 'Tháo' : 'Mặc'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!canEnhance}
                      onClick={() => handleTryEnhance(activeItem)}
                      className={`min-h-[38px] px-3 rounded-lg font-extrabold text-xs flex items-center gap-1 font-mono-num ${
                        canEnhance
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>
                        {isMaxLevel ? 'MAX +12' : `Cường Hóa (${successRate}%)`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Owned Item Grid */}
            {heroItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[310px] overflow-y-auto pr-0.5">
                {heroItems.map((item) => {
                  const rMeta = TD_EQUIPMENT_RARITY_META[item.rarity];
                  const isEquipped = equippedIdsSet.has(item.id);
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`rounded-xl border p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        rMeta.bgClass
                      } ${rMeta.borderClass} ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{getSlotIconBadge(item.slot)}</span>
                          <span
                            className="text-xs font-extrabold truncate"
                            style={{ color: rMeta.color }}
                          >
                            {getEquipmentDisplayName(item.towerType, item.slot)}
                          </span>
                          <span className="text-[10px] font-mono-num font-extrabold text-[#FACC15] shrink-0">
                            +{item.level}
                          </span>
                        </div>
                        <div className="text-[10.5px] font-mono-num text-slate-200 truncate mt-0.5">
                          {rMeta.shortLabel} · {formatEquipmentStatSummary(item)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(item.id);
                          onEquipItem(
                            item.towerType,
                            item.slot,
                            isEquipped ? null : item.id
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold shrink-0 cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-900/80 border border-emerald-400/70 text-emerald-200'
                            : 'bg-[#0B1120] hover:bg-slate-800 border border-slate-600 text-amber-300'
                        }`}
                      >
                        {isEquipped ? 'Đang mặc' : 'Mặc'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-[#0B1120] border border-slate-800 p-6 text-center flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-300/70" />
                <div className="text-sm font-bold text-slate-200">
                  Chưa nhặt được trang bị nào cho {TD_HERO_SHORT_NAMES[selectedHero]}
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Tiêu diệt quái trong chiến dịch Thủ Thành có tỷ lệ rơi trang bị theo tướng và Ngọc Cường Hóa. Trang bị đã sở hữu cùng phẩm chất sẽ không nhặt trùng lặp.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drop Rates & Rules Footer */}
        <div className="rounded-xl bg-[#131C31] border border-slate-800 p-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-slate-300">
          <div>
            <span className="font-extrabold text-[#FACC15]">Tỷ lệ rơi Trang bị (0.1%/quái): </span>
            <span className="font-mono-num">
              65% Common · 15% Uncommon · 10% Rare · 3% Epic · 1.5% Legend · 0.5% Mythic (không nhặt trùng).
            </span>
          </div>
          <div>
            <span className="font-extrabold text-cyan-300">Ngọc Cường Hóa (2%/quái): </span>
            <span className="font-mono-num">
              Mỗi lần cường hóa tăng +2% chỉ số trang bị, tối đa +12.
            </span>
          </div>
          <div>
            <span className="font-extrabold text-emerald-300">Tỷ lệ Cường Hóa (+1 → +12): </span>
            <span className="font-mono-num">
              100% ở +0→+1, giảm 8% mỗi cấp (còn 12% ở +11→+12). Thất bại giữ nguyên cấp.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
