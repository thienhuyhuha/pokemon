import React from 'react';
import { ArrowRight, Gem, Grid3X3, Heart, RotateCcw, ShieldAlert, Sparkles, Star, Trophy } from 'lucide-react';
import { getEquipmentDisplayName, TD_EQUIPMENT_RARITY_META, TD_HERO_SHORT_NAMES } from '../data/tdEquipment';
import { TD_MAX_LEVEL } from '../data/tdLevels';
import { TdRunLootSummary } from '../types/towerDefense';

interface TdEndModalProps {
  type: 'WIN' | 'LOSE';
  level: number;
  stageName: string;
  score: number;
  stars: number;
  clearBonusStars?: number;
  newAchievementStars?: number;
  isFirstClear?: boolean;
  lootSummary?: TdRunLootSummary;
  livesLeft: number;
  startingLives: number;
  enemiesSlain: number;
  isPreviewMode: boolean;
  onReplay: () => void;
  onNextLevel: () => void;
  onLevelSelect: () => void;
}

export const TdEndModal: React.FC<TdEndModalProps> = ({
  type,
  level,
  stageName,
  score,
  stars,
  clearBonusStars = 0,
  newAchievementStars = 0,
  isFirstClear = false,
  lootSummary,
  livesLeft,
  startingLives,
  enemiesSlain,
  isPreviewMode,
  onReplay,
  onNextLevel,
  onLevelSelect,
}) => {
  const isWin = type === 'WIN';
  const hasNext = level < TD_MAX_LEVEL;
  const hasLoot = Boolean(
    lootSummary && (lootSummary.gems > 0 || lootSummary.items.length > 0)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#131C31] border-2 border-amber-500/70 p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        <div className="flex flex-col items-center text-center gap-2">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg ${
              isWin
                ? 'bg-amber-500/20 border-[#FACC15] text-[#FACC15]'
                : 'bg-rose-500/20 border-rose-500 text-rose-400'
            }`}
          >
            {isWin ? <Trophy className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
          </div>
          <h2 className="font-display text-2xl font-extrabold text-white">
            {isWin ? `Giữ Vững Ải ${level}!` : `Thất Thủ Tại Ải ${level}`}
          </h2>
          <p className="text-xs font-semibold text-amber-300">{stageName}</p>
        </div>

        {isWin && (
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex items-center justify-center gap-3 py-1">
              {[1, 2, 3].map((idx) => (
                <Star
                  key={idx}
                  className={`w-9 h-9 transition-transform ${
                    idx <= stars
                      ? 'fill-[#FACC15] text-[#FACC15] scale-110 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            {(clearBonusStars > 0 || newAchievementStars > 0) && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {clearBonusStars > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/70 text-xs font-extrabold text-[#FACC15] font-mono-num">
                    <Star className="w-3.5 h-3.5 fill-[#FACC15] text-[#FACC15]" />
                    <span>
                      +{clearBonusStars}★ {isFirstClear ? 'Vượt ải lần đầu' : 'Thưởng vượt ải'}
                    </span>
                  </div>
                )}
                {newAchievementStars > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/70 text-xs font-extrabold text-emerald-300 font-mono-num">
                    <Star className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
                    <span>+{newAchievementStars}★ Thành tích mới</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#0F172A] border border-slate-800 p-3.5 text-center font-mono-num">
          <div>
            <div className="text-[11px] font-sans text-slate-400">Thành trì</div>
            <div className="text-base font-extrabold text-rose-300 flex items-center justify-center gap-1 mt-0.5">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              {livesLeft}/{startingLives}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-sans text-slate-400">Quái hạ</div>
            <div className="text-base font-extrabold text-emerald-300 mt-0.5">{enemiesSlain}</div>
          </div>
          <div>
            <div className="text-[11px] font-sans text-slate-400">Điểm</div>
            <div className="text-base font-extrabold text-[#FACC15] mt-0.5">
              {score.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        {hasLoot && lootSummary && (
          <div className="rounded-xl bg-[#0F172A] border border-cyan-500/50 p-3 flex flex-col gap-2">
            <div className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>Chiến Lợi Phẩm Thu Được</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lootSummary.gems > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/60 text-xs font-extrabold text-cyan-200 font-mono-num">
                  <Gem className="w-3.5 h-3.5 text-cyan-300" />
                  +{lootSummary.gems} Ngọc Cường Hóa
                </span>
              )}
              {lootSummary.items.map((item) => {
                const rMeta = TD_EQUIPMENT_RARITY_META[item.rarity];
                return (
                  <span
                    key={item.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-extrabold ${rMeta.bgClass} ${rMeta.borderClass}`}
                    style={{ color: rMeta.color }}
                  >
                    <span>
                      {getEquipmentDisplayName(item.towerType, item.slot)} ({TD_HERO_SHORT_NAMES[item.towerType]} · {rMeta.shortLabel})
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {isPreviewMode && (
          <div className="rounded-lg bg-amber-950/60 border border-amber-700/70 px-3 py-2 text-xs text-amber-200 text-center">
            Đang ở Chế độ Xem trước — kết quả màn chưa mở khóa không được lưu.
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {isWin && hasNext && (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full min-h-[48px] rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_3px_0_#A16207]"
            >
              <span>Tiến tới Ải {level + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onReplay}
              className="min-h-[46px] rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              Chơi lại
            </button>
            <button
              type="button"
              onClick={onLevelSelect}
              className="min-h-[46px] rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Grid3X3 className="w-4 h-4 text-sky-300" />
              Bản đồ 30 Ải
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
