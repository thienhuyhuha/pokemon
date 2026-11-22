import React, { useState } from 'react';
import {
  ArrowLeft,
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
  isTowerUnlocked,
  TD_MAX_LEVEL,
  TD_TOWER_BUILD_ORDER,
  TD_TOWERS,
  TD_UPGRADE_MAX_TIER,
  TD_UPGRADE_TRACKS,
} from '../data/tdLevels';
import { CloudSyncStatus } from '../firebase';
import { TdBiomeId, TdSaveData, TdUpgradeTrackId, TdUpgrades } from '../types/towerDefense';
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
              onClick={() => setWorkshopOpen(true)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-[0_3px_0_#A16207]"
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
    </div>
  );
};
