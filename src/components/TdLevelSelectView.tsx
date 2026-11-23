import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Castle,
  CheckCircle2,
  Coins,
  Crosshair,
  Eye,
  Flame,
  Hammer,
  Lock,
  Music,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
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
  DEFAULT_TD_UPGRADES,
  getAllTdLevels,
  getSpentUpgradeStars,
  getStageBossCount,
  getTotalStarsEarnedInTd,
  getTowerMaxLevel,
  isTowerUnlocked,
  TD_MAX_LEVEL,
  TD_MYTHIC_PATHS,
  TD_TOWER_BUILD_ORDER,
  TD_TOWERS,
  TD_UPGRADE_MAX_TIER,
  TD_UPGRADE_TRACKS,
} from '../data/tdLevels';
import { CloudSyncStatus } from '../firebase';
import { TdBiomeId, TdSaveData, TdTowerType, TdUpgradeTrackId, TdUpgrades } from '../types/towerDefense';
import { RememberedAccount } from '../utils/localAccountCache';
import { AccountBar } from './AccountBar';
import { TdEnemyPreview, TdTowerPreview } from './TdArtwork';

interface TdLevelSelectViewProps {
  saveData: TdSaveData;
  activeAccount: RememberedAccount | null;
  hasLiveCloudAuth: boolean;
  authReady: boolean;
  authLoading: boolean;
  syncStatus: CloudSyncStatus;
  isPreviewMode: boolean;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onSignIn: (forceSelectAccount?: boolean) => void;
  onSignOut: () => void;
  onSelectLevel: (level: number) => void;
  onUpdateUpgrades: (nextUpgrades: TdUpgrades) => void;
  onTogglePreviewMode: () => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onBack: () => void;
}

const HERO_HANDBOOK_DETAILS: Record<
  TdTowerType,
  {
    summary: string;
    scalingNote: string;
    multiNote: string;
    focusedNote?: string;
  }
> = {
  ARCHER: {
    summary: 'Xạ thủ tốc độ bắn cao và tỷ lệ chí mạng lớn, bắn được cả quái bay. Không gây độc và không làm chậm.',
    scalingNote: 'Tối đa Cấp 30. Từ Cấp 20 đến 30 mỗi cấp tăng +100% chi phí vàng. Ở cấp cao bổ sung mục tiêu và tốc bắn.',
    multiNote: 'Đa mục tiêu (Xạ Thủ Liên Thanh): Bắn liên hoàn nhiều mục tiêu cùng lúc với tốc độ cực nhanh và 32%+ Chí mạng.',
    focusedNote: 'Đơn mục tiêu (Thần Tiễn Hoàng Gia): Tầm xa vượt trội, 42%+ Chí mạng và tăng +40% sát thương mỗi cấp từ Cấp 4.',
  },
  BARRACKS: {
    summary: 'Công trình hỗ trợ thuần túy (không tấn công trực tiếp), tạo hào quang tăng Tỷ lệ Bạo kích và Sát thương Bạo kích cho mọi tướng trong tầm.',
    scalingNote: '1 hướng duy nhất (không hiện bảng chọn nhánh). Bắt đầu Cấp 1: +1% Tỷ lệ BK & +10% ST Bạo kích; đạt Cấp 30 đạt 30% / 300% + thưởng thêm +10% BK & +200% STBK (tổng 40% / +500%). Từ Cấp 20→30 giá vàng +100%/cấp. Vùng tác dụng tăng +100% từ Cấp 1 đến Cấp 20, Cấp 20→30 giữ nguyên.',
    multiNote: 'Hướng mặc định (Thánh Đàn Chí Mạng): Tự động nâng thẳng từ Cấp 1 đến Cấp 30.',
  },
  MAGE: {
    summary: 'Pháp sư khống chế chuyên làm chậm và trói chân quái vật (đánh được quái bay).',
    scalingNote: 'Tối đa Cấp 20. Hiệu quả làm chậm tăng dần từ Cấp 4 lên Cấp 20.',
    multiNote: 'Đa mục tiêu (Băng Sương Diện Rộng): Phóng cầu băng lan rộng, làm chậm tối đa 55% ở Cấp 20. Không có kỹ năng trói chân.',
    focusedNote: 'Đơn mục tiêu (Hàn Băng Tuyệt Đối): Chỉ đánh duy nhất 1 mục tiêu với vùng làm chậm lan tối đa 10px, làm chậm tối đa 80% ở Cấp 20. Cứ mỗi 10s tự động trói chân tối đa 3 quái máu cao nhất trong 2s.',
  },
  ARTILLERY: {
    summary: 'Pháo binh hạng nặng chỉ đánh diện rộng theo vùng nổ (không đánh quái bay), sát thương cao hơn Hỏa Ngục Pháp Sư đa mục tiêu khoảng 30% và xuyên giáp mạnh.',
    scalingNote: '1 hướng duy nhất đến Cấp 20. Xác suất gây choáng tăng từ 1% ở Cấp 1 lên 3% ở Cấp 20. Sát thương nổ trúng toàn bộ quái trong bán kính nổ.',
    multiNote: 'Hướng mặc định (Xạ Thủ Siêu Pháo): Mở rộng bán kính pháo nổ, làm chậm nhẹ vùng nổ và giữ vững sát thương AoE.',
  },
  ASSASSIN: {
    summary: 'Sát thủ cận chiến tầm gần tốc độ ra đòn nhanh, chí mạng cao, đánh được quái bay và không bao giờ làm chậm.',
    scalingNote: 'Tối đa Cấp 20. Phân hóa rõ giữa cấu rỉa độc diện rộng và kết liễu đơn mục tiêu.',
    multiNote: 'Đa mục tiêu (Độc Ảnh Xuyên Tâm): Gây Độc thường (mất 1% máu mỗi 2s, giảm 50% hồi máu) và có 1% tỷ lệ gây Độc Nặng (không thể giải hiệu ứng, mất 1% máu mỗi giây trong 60s, giảm 80% hồi máu).',
    focusedNote: 'Đơn mục tiêu (Ảnh Kiếm Tất Sát): Tăng +30% sát thương, tối đa 1 mục tiêu trước Cấp 20 và tối đa 2 mục tiêu ở Cấp 20. Tự động kết liễu ngay lập tức quái bị đánh có HP < 10%.',
  },
  VALKYRIE: {
    summary: 'Công trình hỗ trợ thuần túy, tăng Tốc độ đánh và Sát thương chưa bạo kích cho các tướng chiến đấu trong tầm (không tăng tốc hồi chiêu tuyệt chiêu).',
    scalingNote: '1 hướng duy nhất đến Cấp 20. Cấp 1 buff +100% tốc đánh và +1.0x sát thương chưa bạo kích; đạt Cấp 20 đạt +3.0x sát thương và thưởng thêm +50% tốc đánh (tổng +250%). Vùng tác dụng tăng +100% từ Cấp 1 lên Cấp 20.',
    multiNote: 'Hướng mặc định (Thiên Sứ Thánh Ca): Tự động nâng thẳng từ Cấp 1 lên Cấp 20.',
  },
  KNIGHT_GUARD: {
    summary: 'Mở khóa sau Ải 10. Triệu hồi Kỵ Sĩ Rồng chặn đường kết hợp phóng thương và tuyệt chiêu Phun Lửa đường thẳng (đánh được quái bay).',
    scalingNote: '1 hướng duy nhất đến Cấp 20. Tuyệt chiêu Phun Lửa có hồi chiêu giảm dần từ 5s (Cấp 1) xuống 2s (Cấp 20), không bị ảnh hưởng bởi hào quang tăng tốc của Thánh Nữ; đẩy lùi quái 8 bước chân, tối đa 20 lần mỗi mục tiêu cho mỗi công trình Long Kỵ Sĩ.',
    multiNote: 'Hướng mặc định (Long Thương Hỏa Diễm): Tự động nâng cấp thẳng, tăng máu Kỵ sĩ, sát thương lửa đốt và tốc độ hồi chiêu phun lửa.',
  },
  PYROMANCER: {
    summary: 'Mở khóa sau Ải 15. Pháp sư nguyên tố lửa xuyên kháng phép cao, gây thiêu đốt theo phần trăm máu tối đa.',
    scalingNote: 'Tối đa Cấp 20. Quái vật có kháng bỏng thường và một số quái hỗ trợ có thể giải bỏng thường, nhưng không thể giải Bỏng Sâu.',
    multiNote: 'Đa mục tiêu (Chúa Tể Hỏa Ngục): Phóng 4+ tia lửa gây Bỏng Thường trong 5s (mất 1% máu tối đa mỗi giây).',
    focusedNote: 'Đơn mục tiêu (Phượng Hoàng Bất Diệt): Gây Bỏng Sâu trong 5s (mất 3% máu tối đa mỗi giây, bỏ qua kháng bỏng thường) và có 1% tỷ lệ tạo đòn Kích Nổ gây sát thương x5 đòn đánh thường trong vùng 100px.',
  },
  MECHANIST: {
    summary: 'Mở khóa sau Ải 20. Công nghệ tầm siêu xa, bắn được quái bay và xuyên giáp vượt trội.',
    scalingNote: 'Tối đa Cấp 20. Chuyên trị quái giáp dày và boss tầm xa.',
    multiNote: 'Đa mục tiêu (Tổ Hợp Tên Lửa Hextech): Bắn loạt tên lửa nổ lan diện rộng trên không lẫn mặt đất.',
    focusedNote: 'Đơn mục tiêu (Pháo Từ Trường Tối Thượng): Xuyên 85% Giáp kèm 35% Sát thương Chuẩn, tăng +40% sát thương mỗi cấp.',
  },
  CHRONOMANCER: {
    summary: 'Mở khóa sau Ải 25. Thần sứ gây Sát thương Chuẩn bỏ qua giáp/kháng, kèm làm chậm nhẹ và hào quang tăng tốc độ đánh.',
    scalingNote: 'Tối đa Cấp 20. Khắc tinh của quái vật kháng phép và giáp cao ở các ải cuối.',
    multiNote: 'Đa mục tiêu (Chấp Pháp Thời Gian): 70% Sát thương Chuẩn, làm chậm lan 78px và buff tốc độ đánh cho đồng minh.',
    focusedNote: 'Đơn mục tiêu (Thần Vương Hư Không): 100% Sát thương Chuẩn xuyên mọi loại giáp và kháng phép, +40% sức mạnh mỗi cấp.',
  },
};

const BIOME_META: {
  id: TdBiomeId;
  title: string;
  range: string;
  bgUrl: string;
  accent: string;
}[] = [
  {
    id: 'FOREST',
    title: 'I. Thung Lũng Rừng Xanh',
    range: 'Ải 1 – 5',
    bgUrl: TD_MAP_FOREST_URL,
    accent: 'border-emerald-500/60',
  },
  {
    id: 'DESERT',
    title: 'II. Sa Mạc Cổ Vương',
    range: 'Ải 6 – 10',
    bgUrl: TD_MAP_DESERT_URL,
    accent: 'border-amber-500/60',
  },
  {
    id: 'VOLCANO',
    title: 'III. Hẻm Núi Dung Nham',
    range: 'Ải 11 – 15',
    bgUrl: TD_MAP_VOLCANO_URL,
    accent: 'border-orange-500/60',
  },
  {
    id: 'ICE',
    title: 'IV. Thành Cổ Tuyết Băng',
    range: 'Ải 16 – 20',
    bgUrl: TD_MAP_ICE_URL,
    accent: 'border-sky-400/60',
  },
  {
    id: 'ABYSS',
    title: 'V. Vực Thẳm Hắc Ám',
    range: 'Ải 21 – 25',
    bgUrl: TD_MAP_ABYSS_URL,
    accent: 'border-purple-500/60',
  },
  {
    id: 'SKY',
    title: 'VI. Hoàng Thành Bầu Trời',
    range: 'Ải 26 – 30',
    bgUrl: TD_MAP_SKY_URL,
    accent: 'border-yellow-400/60',
  },
];

export const TdLevelSelectView: React.FC<TdLevelSelectViewProps> = ({
  saveData,
  activeAccount,
  hasLiveCloudAuth,
  authReady,
  authLoading,
  syncStatus,
  isPreviewMode,
  soundEnabled,
  bgmEnabled,
  onSignIn,
  onSignOut,
  onSelectLevel,
  onUpdateUpgrades,
  onTogglePreviewMode,
  onToggleSound,
  onToggleBgm,
  onBack,
}) => {
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const [handbookOpen, setHandbookOpen] = useState(false);
  const [handbookHero, setHandbookHero] = useState<TdTowerType>('ARCHER');

  const levels = getAllTdLevels();
  const totalStarsEarned = getTotalStarsEarnedInTd(saveData.levels);
  const spentStars = getSpentUpgradeStars(saveData.upgrades);
  const availableStars = Math.max(0, totalStarsEarned - spentStars);
  const completedCount = Object.values(saveData.levels).filter((l) => l.completed).length;

  const unlockableTowers = TD_TOWER_BUILD_ORDER.filter((t) => Boolean(TD_TOWERS[t].unlockStage));

  const handleUpgradeTrack = (trackId: TdUpgradeTrackId) => {
    const meta = TD_UPGRADE_TRACKS.find((t) => t.id === trackId);
    if (!meta) return;
    const currentLv = saveData.upgrades[trackId] ?? 0;
    if (currentLv >= TD_UPGRADE_MAX_TIER) return;
    const cost = meta.tierCosts[currentLv];
    if (availableStars < cost) return;
    onUpdateUpgrades({
      ...saveData.upgrades,
      [trackId]: currentLv + 1,
    });
  };

  const handleResetUpgrades = () => {
    onUpdateUpgrades({ ...DEFAULT_TD_UPGRADES });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-[#111827]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Quay về trang chủ"
              className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white cursor-pointer flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
                <Castle className="w-5 h-5 text-[#FACC15]" />
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-xl font-extrabold text-white leading-tight">
                  Vệ Thành Quái Thú
                </h1>
                <p className="text-xs text-slate-400 font-mono-num">
                  Đã thủ {completedCount}/{TD_MAX_LEVEL} ải · {totalStarsEarned}★
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setHandbookOpen(true)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-sky-500/60 text-sky-200 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Cẩm Nang Tướng</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkshopOpen(true)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-[0_3px_0_#A16207] whitespace-nowrap"
            >
              <Hammer className="w-4 h-4" />
              <span>Xưởng Nâng Cấp</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-950/15 font-mono-num">
                {availableStars}★
              </span>
            </button>

            <button
              type="button"
              onClick={onTogglePreviewMode}
              title="Bật để xem thử mọi ải (không lưu tiến trình)"
              className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isPreviewMode
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Xem trước</span>
            </button>

            <div className="hidden md:block">
              <AccountBar
                account={activeAccount}
                hasLiveCloudAuth={hasLiveCloudAuth}
                authReady={authReady}
                authLoading={authLoading}
                syncStatus={syncStatus}
                onSignIn={onSignIn}
                onSignOut={onSignOut}
              />
            </div>

            <button
              type="button"
              onClick={onToggleBgm}
              aria-label={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
              className={`p-2 rounded-xl border border-slate-700 bg-[#1E293B] cursor-pointer ${
                bgmEnabled && soundEnabled ? 'text-[#FACC15]' : 'text-slate-500'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-xl border border-slate-700 bg-[#1E293B] text-white cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Campaign Map by Biome */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Unlockable Elite Soldiers Showcase */}
        <section className="rounded-2xl bg-[#131C31] border border-amber-500/40 p-4 sm:p-5 shadow-xl flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FACC15]" />
                Binh Chủng Tinh Nhuệ Mở Khóa Theo Ải
              </h2>
              <p className="text-xs text-slate-400">
                Vượt qua các mốc ải 10, 15, 20 và 25 để chiêu mộ 4 binh chủng cấp cao mới vào trận chiến.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWorkshopOpen(true)}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4 cursor-pointer"
            >
              Xem 10 nhánh Nâng Cấp Sao ({spentStars}/90★)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {unlockableTowers.map((towerType) => {
              const cfg = TD_TOWERS[towerType];
              const unlockedTower = isTowerUnlocked(
                towerType,
                saveData.levels,
                saveData.highestUnlockedLevel,
                isPreviewMode
              );

              return (
                <div
                  key={towerType}
                  className={`rounded-xl border p-3 flex items-center gap-3 ${
                    unlockedTower
                      ? 'bg-[#0F172A] border-emerald-500/50'
                      : 'bg-[#0F172A]/60 border-slate-800 opacity-85'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                    <TdTowerPreview type={towerType} level={1} className="w-12 h-12" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display text-sm font-extrabold text-white truncate">
                        {cfg.name}
                      </span>
                      <span className="font-mono-num text-[11px] font-extrabold text-[#FACC15] shrink-0">
                        {cfg.tiers[0].cost}g
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {cfg.roleLabel}
                    </p>
                    <div className="mt-1.5">
                      {unlockedTower ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/50 text-[10px] font-bold text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã mở khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-300">
                          <Lock className="w-3 h-3" />
                          Qua Ải {cfg.unlockStage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {BIOME_META.map((biome) => {
          const biomeLevels = levels.filter((lv) => lv.biome === biome.id);
          return (
            <section
              key={biome.id}
              className={`rounded-2xl bg-[#131C31] border ${biome.accent} overflow-hidden shadow-xl`}
            >
              <div className="relative h-28 sm:h-32 overflow-hidden">
                <img
                  src={biome.bgUrl}
                  alt={biome.title}
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/95 via-[#0F172A]/70 to-transparent" />
                <div className="absolute inset-0 px-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider">
                      {biome.range}
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                      {biome.title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {biomeLevels.map((lv) => {
                  const prog = saveData.levels[lv.level];
                  const unlocked = isPreviewMode || lv.level <= saveData.highestUnlockedLevel;
                  const isCurrent = lv.level === saveData.highestUnlockedLevel;
                  const stars = prog?.stars ?? 0;

                  return (
                    <button
                      key={lv.level}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => onSelectLevel(lv.level)}
                      className={`rounded-xl p-3 text-left border-2 transition-all flex flex-col justify-between gap-2 ${
                        !unlocked
                          ? 'bg-[#0F172A]/60 border-slate-800/80 opacity-55 cursor-not-allowed'
                          : isCurrent
                            ? 'bg-[#1E293B] border-[#FACC15] hover:bg-slate-800 cursor-pointer shadow-[0_6px_20px_rgba(250,204,21,0.16)]'
                            : 'bg-[#0F172A] border-slate-700 hover:border-amber-400/70 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono-num text-xs font-extrabold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                          Ải {lv.level}
                        </span>
                        {!unlocked ? (
                          <Lock className="w-4 h-4 text-slate-500" />
                        ) : lv.level % 5 === 0 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-500/60 text-[10px] font-bold text-rose-200">
                            <TdEnemyPreview type="BOSS" className="w-5 h-5" />
                            <span>{getStageBossCount(lv.level)} Boss</span>
                          </span>
                        ) : (
                          <Play className="w-4 h-4 text-emerald-400 fill-current" />
                        )}
                      </div>

                      {/* Mini Live Route Preview showing each stage's unique non-repeating map */}
                      <div
                        className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-slate-800/90 bg-slate-950"
                        style={{ backgroundColor: lv.mapTheme.tintColor }}
                      >
                        <svg viewBox="0 0 1000 562.5" className="w-full h-full">
                          <rect width="1000" height="562.5" fill={lv.mapTheme.tintColor} fillOpacity="0.88" />
                          {lv.paths.map((pts, pidx) => {
                            const d = pts
                              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                              .join(' ');
                            const start = pts[0];
                            const end = pts[pts.length - 1];
                            return (
                              <g key={pidx}>
                                <path
                                  d={d}
                                  fill="none"
                                  stroke={lv.mapTheme.roadOuter}
                                  strokeWidth="56"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d={d}
                                  fill="none"
                                  stroke={lv.mapTheme.roadInner}
                                  strokeWidth="40"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d={d}
                                  fill="none"
                                  stroke={lv.mapTheme.roadDash}
                                  strokeWidth="5"
                                  strokeDasharray="16 18"
                                  strokeLinecap="round"
                                  strokeOpacity="0.6"
                                />
                                {start && (
                                  <circle
                                    cx={start.x}
                                    cy={start.y}
                                    r="18"
                                    fill="#EF4444"
                                    stroke="#FEE2E2"
                                    strokeWidth="5"
                                  />
                                )}
                                {end && (
                                  <circle
                                    cx={end.x}
                                    cy={end.y}
                                    r="20"
                                    fill="#FACC15"
                                    stroke="#FEF3C7"
                                    strokeWidth="5"
                                  />
                                )}
                              </g>
                            );
                          })}
                          {lv.buildPads.map((pad) => (
                            <circle
                              key={pad.id}
                              cx={pad.x}
                              cy={pad.y}
                              r="12"
                              fill="#38BDF8"
                              fillOpacity="0.7"
                              stroke="#E0F2FE"
                              strokeWidth="4"
                            />
                          ))}
                        </svg>
                      </div>

                      <div>
                        <div className="font-display text-sm font-bold text-white line-clamp-1">
                          {lv.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {lv.waves.length} đợt · {lv.paths.length} nhánh · {lv.difficultyLabel}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= stars ? 'fill-[#FACC15] text-[#FACC15]' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        {prog?.bestScore ? (
                          <span className="font-mono-num text-[11px] font-bold text-slate-300">
                            {prog.bestScore.toLocaleString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {unlocked ? 'Sẵn sàng' : 'Khóa'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Star Upgrade Workshop Modal */}
      {workshopOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setWorkshopOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#131C31] border-2 border-amber-400/70 p-5 sm:p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-[#FACC15]" />
                  Xưởng Nâng Cấp Binh Chủng (10 Nhánh · 5 Cấp)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dùng Sao (★) kiếm được từ các ải để tăng sức mạnh vĩnh viễn cho toàn quân. Có thể hoàn tác miễn phí bất cứ lúc nào.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/60 font-mono-num text-sm font-extrabold text-[#FACC15] shrink-0">
                Còn {availableStars}★
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TD_UPGRADE_TRACKS.map((track) => {
                const lv = saveData.upgrades[track.id] ?? 0;
                const isMaxed = lv >= TD_UPGRADE_MAX_TIER;
                const nextCost = !isMaxed ? track.tierCosts[lv] : 0;
                const canAfford = !isMaxed && availableStars >= nextCost;

                return (
                  <div
                    key={track.id}
                    className="rounded-xl bg-[#0F172A] border border-slate-700/80 p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-400/40 flex items-center justify-center shrink-0">
                          {track.id === 'archery' ? (
                            <TdTowerPreview type="ARCHER" level={4} branch="SNIPER_CRIT" className="w-9 h-9" />
                          ) : track.id === 'magic' ? (
                            <TdTowerPreview type="MAGE" level={4} branch="ARCANE_BEAM" className="w-9 h-9" />
                          ) : track.id === 'barracks' ? (
                            <TdTowerPreview type="BARRACKS" level={4} branch="PALADIN" className="w-9 h-9" />
                          ) : track.id === 'artillery' ? (
                            <TdTowerPreview type="ARTILLERY" level={4} branch="BIG_BERTHA" className="w-9 h-9" />
                          ) : track.id === 'support' ? (
                            <TdTowerPreview type="VALKYRIE" level={4} branch="SOLAR_SERAPH" className="w-9 h-9" />
                          ) : track.id === 'economy' ? (
                            <Coins className="w-5 h-5 text-[#FACC15]" />
                          ) : track.id === 'spells' ? (
                            <Flame className="w-5 h-5 text-orange-400" />
                          ) : track.id === 'citadel' ? (
                            <Shield className="w-5 h-5 text-sky-400" />
                          ) : track.id === 'lethality' ? (
                            <Crosshair className="w-5 h-5 text-rose-400" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-purple-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-display text-sm font-bold text-white">
                            {track.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{track.shortBonus}</div>
                        </div>
                      </div>
                      <span className="font-mono-num text-xs font-extrabold text-amber-300 shrink-0">
                        Cấp {lv}/{TD_UPGRADE_MAX_TIER}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px]">
                      {track.tierLabels.map((lbl, idx) => (
                        <div
                          key={lbl}
                          className={`px-2 py-1 rounded ${
                            idx < lv
                              ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                              : idx === lv
                                ? 'bg-slate-800/80 text-slate-200'
                                : 'text-slate-500'
                          }`}
                        >
                          {idx + 1}. {lbl} ({track.tierCosts[idx]}★)
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleUpgradeTrack(track.id)}
                      className={`min-h-[38px] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                        isMaxed
                          ? 'bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 cursor-default'
                          : canAfford
                            ? 'bg-[#FACC15] hover:bg-yellow-300 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMaxed ? (
                        'Đã tối đa'
                      ) : (
                        <>
                          <span>Nâng cấp</span>
                          <span className="font-mono-num">({nextCost}★)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={spentStars === 0}
                onClick={handleResetUpgrades}
                className="min-h-[42px] px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 disabled:opacity-40 border border-rose-800 text-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Hoàn tác toàn bộ Sao
              </button>
              <button
                type="button"
                onClick={() => setWorkshopOpen(false)}
                className="min-h-[42px] px-5 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Handbook Modal (Cẩm Nang Tướng) */}
      {handbookOpen && (() => {
        const cfg = TD_TOWERS[handbookHero];
        const info = HERO_HANDBOOK_DETAILS[handbookHero];
        const maxLv = getTowerMaxLevel(handbookHero);
        const mythics = TD_MYTHIC_PATHS[handbookHero];
        return (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            onClick={() => setHandbookOpen(false)}
          >
            <div
              className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F172A] border border-sky-500/60 p-4 sm:p-6 shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-extrabold text-white">
                      Cẩm Nang Tướng & Quy Tắc Chiến Đấu
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tra cứu đầy đủ cơ chế, công thức tăng cấp và nhánh tiến hóa trước khi vào trận.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHandbookOpen(false)}
                  aria-label="Đóng cẩm nang tướng"
                  className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hero Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TD_TOWER_BUILD_ORDER.map((tType) => {
                  const tCfg = TD_TOWERS[tType];
                  const active = tType === handbookHero;
                  return (
                    <button
                      key={tType}
                      type="button"
                      onClick={() => setHandbookHero(tType)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1E293B] border-[#FACC15] text-white'
                          : 'bg-[#131C31] border-slate-800 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#0B1120] border border-slate-700/70 flex items-center justify-center shrink-0">
                        <TdTowerPreview type={tType} level={4} branch={tCfg.branches[0]?.id} className="w-8 h-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold truncate">{tCfg.name}</div>
                        <div className="text-[10px] font-mono-num text-slate-400">
                          {tCfg.tiers[0].cost}g · Lv{getTowerMaxLevel(tType)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Hero Detail Card */}
              <div className="rounded-xl bg-[#131C31] border border-slate-700/80 p-4 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-[#0B1120] border border-slate-700 flex items-center justify-center shrink-0">
                      <TdTowerPreview
                        type={handbookHero}
                        level={4}
                        branch={cfg.branches[0]?.id}
                        className="w-14 h-14"
                      />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-white">
                        {cfg.name}
                      </h3>
                      <div className="text-xs font-mono-num text-amber-300 mt-0.5">
                        Giá xây: {cfg.tiers[0].cost}g · Tối đa Cấp {maxLv} ·{' '}
                        {cfg.unlockStage ? `Mở khóa sau Ải ${cfg.unlockStage}` : 'Mở sẵn từ đầu'} ·{' '}
                        {cfg.canHitAir ? 'Đánh được quái bay' : 'Chỉ đánh mặt đất'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#0B1120] border border-slate-800 p-3">
                    <div className="text-xs font-extrabold text-sky-300 mb-1">Vai trò & Cơ chế chính</div>
                    <p className="text-xs text-slate-200 leading-relaxed">{info.summary}</p>
                  </div>
                  <div className="rounded-lg bg-[#0B1120] border border-slate-800 p-3">
                    <div className="text-xs font-extrabold text-amber-300 mb-1">Quy tắc tăng cấp</div>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono-num">{info.scalingNote}</p>
                  </div>
                </div>

                {/* Level 4 Branches */}
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-extrabold text-white">
                    {cfg.singleBranch ? 'Hướng phát triển mặc định (Cấp 4)' : 'Phân nhánh Cấp 4'}
                  </div>
                  <div className={`grid grid-cols-1 ${info.focusedNote ? 'md:grid-cols-2' : ''} gap-3`}>
                    <div className="rounded-lg bg-[#0B1120] border border-sky-500/40 p-3 flex items-start gap-2.5">
                      <TdTowerPreview
                        type={handbookHero}
                        level={4}
                        branch={cfg.branches[0]?.id}
                        className="w-10 h-10 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-sky-300">
                          {cfg.branches[0]?.name} ({cfg.singleBranch ? 'Mặc định' : 'Đa mục tiêu'})
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{info.multiNote}</p>
                      </div>
                    </div>
                    {info.focusedNote && cfg.branches[1] && (
                      <div className="rounded-lg bg-[#0B1120] border border-rose-500/40 p-3 flex items-start gap-2.5">
                        <TdTowerPreview
                          type={handbookHero}
                          level={4}
                          branch={cfg.branches[1].id}
                          className="w-10 h-10 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-extrabold text-rose-300">
                            {cfg.branches[1].name} (Đơn mục tiêu)
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{info.focusedNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Level 11 Mythic Awakenings (only shown for dual-branch heroes) */}
                {!cfg.singleBranch && mythics.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-extrabold text-amber-300">
                      4 Dạng Thức Tỉnh Cấp 11
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {mythics.map((mp) => (
                        <div
                          key={mp.id}
                          className="rounded-lg bg-[#0B1120] border border-slate-800 p-2.5 flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-2">
                            <TdTowerPreview
                              type={handbookHero}
                              level={11}
                              branch={cfg.branches[0]?.id}
                              mythicPath={mp.id}
                              className="w-8 h-8 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-extrabold truncate" style={{ color: mp.accentColor }}>
                                {mp.name}
                              </div>
                              <div className="text-[10px] font-mono-num text-[#FACC15]">{mp.cost}g</div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{mp.shortDesc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Global Battlefield Rules */}
              <div className="rounded-xl bg-[#131C31] border border-slate-800 p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <div>
                  <div className="font-extrabold text-amber-300 mb-1">Chi phí theo số lượng công trình</div>
                  <p className="leading-relaxed">
                    Xây từ công trình thứ 3 giá xây và nâng cấp tăng +50%; từ công trình thứ 5 tăng +80% so với công trình đầu tiên.
                  </p>
                </div>
                <div>
                  <div className="font-extrabold text-rose-300 mb-1">Nhánh Đơn Mục Tiêu & Vàng cấp cao</div>
                  <p className="leading-relaxed">
                    Nhánh Đơn Mục Tiêu tăng +40% sức mạnh mỗi cấp và giá nâng cấp tăng +100%/cấp từ Cấp 10. Cung Thủ & Vệ Binh từ Cấp 20→30 giá vàng +100%/cấp.
                  </p>
                </div>
                <div>
                  <div className="font-extrabold text-emerald-300 mb-1">Kháng hiệu ứng & Giải trừ</div>
                  <p className="leading-relaxed">
                    Quái tinh nhuệ có thể kháng Bỏng Thường, Giáp, Kháng Phép và giải Độc thường/Trói chân/Làm chậm/Bỏng thường. Bỏng Sâu và Độc Nặng không thể bị giải trừ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
