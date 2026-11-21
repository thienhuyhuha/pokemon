import React, { useState } from 'react';
import {
  Clock,
  Cloud,
  Gem,
  Grid3X3,
  Layers,
  Music,
  Play,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DIAMOND_MAX_LEVEL,
  getDiamondLevelConfig,
  getGemStyle,
} from '../data/diamondLevels';
import { formatDuration, getLevelConfig, MAX_LEVEL } from '../data/levels';
import {
  getPokemonSpecies,
  HERO_WORLD_URL,
  PokemonArtwork,
} from '../data/pokemonSprites';
import { CloudSyncStatus } from '../firebase';
import { DiamondSaveData, GameId } from '../types/diamond';
import { SaveData } from '../types/game';
import { RememberedAccount } from '../utils/localAccountCache';
import { AccountBar } from './AccountBar';
import { DiamondArtwork } from './DiamondArtwork';
import { MobileAccountSheet, MobileBottomNav } from './MobileBottomNav';
import { PokeballIcon } from './PokeballIcon';
import { PWAInstallButton } from './PWAInstallButton';

interface TitleScreenProps {
  activeGame: GameId;
  onSelectGame: (game: GameId) => void;
  saveData: SaveData;
  diamondSaveData: DiamondSaveData;
  activeAccount: RememberedAccount | null;
  hasLiveCloudAuth: boolean;
  authReady: boolean;
  authLoading: boolean;
  syncStatus: CloudSyncStatus;
  authError: string | null;
  showRedirectFallback: boolean;
  onSignIn: (forceSelectAccount?: boolean) => void;
  onSignInRedirect: () => void;
  onSignOut: () => void;
  onStartCurrentLevel: () => void;
  onOpenLevelSelect: () => void;
  onStartDiamondCurrentLevel: () => void;
  onOpenDiamondLevelSelect: () => void;
  onToggleSound: () => void;
  bgmEnabled: boolean;
  onToggleBgm: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  activeGame,
  onSelectGame,
  saveData,
  diamondSaveData,
  activeAccount,
  hasLiveCloudAuth,
  authReady,
  authLoading,
  syncStatus,
  authError,
  showRedirectFallback,
  onSignIn,
  onSignInRedirect,
  onSignOut,
  onStartCurrentLevel,
  onOpenLevelSelect,
  onStartDiamondCurrentLevel,
  onOpenDiamondLevelSelect,
  onToggleSound,
  bgmEnabled,
  onToggleBgm,
}) => {
  const [imgError, setImgError] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  const isDiamond = activeGame === 'DIAMOND';

  const currentLevel = Math.min(MAX_LEVEL, saveData.highestUnlockedLevel);
  const currentConfig = getLevelConfig(currentLevel);
  const completedCount = Object.values(saveData.levels).filter((l) => l.completed).length;
  const totalStars = Object.values(saveData.levels).reduce((acc, l) => acc + l.stars, 0);

  const diamondLevel = Math.min(DIAMOND_MAX_LEVEL, diamondSaveData.highestUnlockedLevel);
  const diamondConfig = getDiamondLevelConfig(diamondLevel);
  const diamondCompleted = Object.values(diamondSaveData.levels).filter((l) => l.completed).length;
  const diamondStars = Object.values(diamondSaveData.levels).reduce((acc, l) => acc + l.stars, 0);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      {/* Mobile Compact Top App Bar (< md) */}
      <header
        className={`md:hidden sticky top-0 z-30 w-full border-b-2 border-[#0F172A] shadow-md px-4 h-13 flex items-center justify-between gap-3 transition-colors ${
          isDiamond ? 'bg-[#0E7490]' : 'bg-[#DC2626]'
        }`}
      >
        <div className="flex items-center gap-2 shrink-0">
          {isDiamond ? (
            <Gem className="w-6 h-6 text-[#FACC15] shrink-0" />
          ) : (
            <PokeballIcon variant="poke" className="w-6 h-6 shrink-0" />
          )}
          <span className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
            {isDiamond ? 'Kim Cương 100' : 'ChibiMon 200'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setAccountSheetOpen(true)}
          aria-label="Mở hồ sơ tài khoản"
          className={`min-h-[40px] px-2.5 py-1 rounded-lg border flex items-center gap-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer ${
            isDiamond
              ? 'bg-[#155E75] border-cyan-950/60'
              : 'bg-[#991B1B] border-red-950/60'
          }`}
        >
          {activeAccount?.photoURL ? (
            <img
              src={activeAccount.photoURL}
              alt={activeAccount.displayName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full border border-[#FACC15] object-cover shrink-0"
            />
          ) : (
            <UserCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
          )}
          <span className="max-w-[100px] truncate">
            {activeAccount ? activeAccount.displayName : 'Đăng nhập'}
          </span>
        </button>
      </header>

      {/* Desktop Web Header (md+) */}
      <header
        className={`hidden md:block w-full border-b-4 border-[#0F172A] shadow-md transition-colors ${
          isDiamond ? 'bg-[#0E7490]' : 'bg-[#DC2626]'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            {isDiamond ? (
              <Gem className="w-7 h-7 text-[#FACC15] shrink-0" />
            ) : (
              <PokeballIcon variant="poke" className="w-7 h-7 shrink-0" />
            )}
            <span className="font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
              {isDiamond ? 'Kim Cương 100' : 'ChibiMon 200'}
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-white/90">
            <button
              type="button"
              onClick={isDiamond ? onOpenDiamondLevelSelect : onOpenLevelSelect}
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isDiamond ? 'Bản đồ 100 màn' : 'Bản đồ 200 cấp'}
            </button>
            <a
              href="#rules"
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0"
            >
              Luật & Tiến trình
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />
            <AccountBar
              account={activeAccount}
              hasLiveCloudAuth={hasLiveCloudAuth}
              authReady={authReady}
              authLoading={authLoading}
              syncStatus={syncStatus}
              onSignIn={onSignIn}
              onSignOut={onSignOut}
            />
            <button
              type="button"
              onClick={onToggleBgm}
              title={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
              aria-label={bgmEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
              className={`p-2 rounded-lg border border-black/30 transition-colors cursor-pointer shrink-0 ${
                bgmEnabled && saveData.soundEnabled
                  ? 'bg-black/25 text-[#FACC15] hover:bg-black/40'
                  : 'bg-black/20 text-white/50 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg border border-black/30 bg-black/25 text-white hover:bg-black/40 transition-colors cursor-pointer shrink-0"
            >
              {saveData.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={isDiamond ? onStartDiamondCurrentLevel : onStartCurrentLevel}
              className="px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_2px_0_#A16207]"
            >
              {isDiamond ? `Chơi màn ${diamondLevel}` : `Đấu cấp ${currentLevel}`}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-24 md:py-8 flex flex-col gap-6 md:gap-8">
        {/* Game Mode Segmented Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-grid grid-cols-2 p-1 rounded-xl bg-[#1E293B] border border-slate-700/80 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSelectGame('CHIBIMON')}
              className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeGame === 'CHIBIMON'
                  ? 'bg-[#DC2626] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PokeballIcon variant="poke" className="w-4 h-4 shrink-0" />
              <span>Thú Cưng (200 Màn)</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectGame('DIAMOND')}
              className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeGame === 'DIAMOND'
                  ? 'bg-[#0891B2] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Gem className="w-4 h-4 text-[#FACC15] shrink-0" />
              <span>Kim Cương (100 Màn)</span>
            </button>
          </div>

          <span className="hidden sm:inline text-xs text-slate-400">
            Đồng bộ chung tài khoản Google & Chơi Offline 100%
          </span>
        </div>

        {authError && (
          <div className="rounded-xl bg-rose-950/65 border border-rose-700/70 px-4 py-3 text-xs sm:text-sm text-rose-100 flex flex-wrap items-center justify-between gap-3">
            <span>{authError}</span>
            {showRedirectFallback && (
              <button
                type="button"
                onClick={onSignInRedirect}
                disabled={authLoading}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
              >
                Đăng nhập bằng chuyển hướng
              </button>
            )}
          </div>
        )}

        {!isDiamond ? (
          /* ================= GAME 1: CHIBIMON 200 ================= */
          <>
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              <div className="order-1 lg:order-2 lg:col-span-6 relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-[#1E293B] min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex flex-col justify-end shadow-2xl">
                {!imgError ? (
                  <img
                    src={HERO_WORLD_URL}
                    alt="Thế giới đấu trường thú cưng"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0284C7] via-[#14532D] to-[#0F172A]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/45 to-transparent" />

                <div className="relative z-10 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    {[1, 2, 3, 4, 15, 25].map((id) => {
                      const sp = getPokemonSpecies(id);
                      return (
                        <div
                          key={id}
                          style={{ borderColor: sp.borderTint }}
                          className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-white border-2 shadow-[0_4px_0_rgba(15,23,42,0.55)] p-1 flex items-center justify-center relative overflow-hidden"
                          title={`${sp.name} (${sp.type})`}
                        >
                          <PokemonArtwork speciesId={id} className="relative z-10 w-full h-full" />
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <p className="text-xs text-yellow-300 font-semibold">
                      Chương {currentConfig.chapter} · {currentConfig.chapterName}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-white mt-0.5 font-mono-num">
                      Cấp {currentConfig.level} — {currentConfig.pairsCount} cặp ({currentConfig.cols}×
                      {currentConfig.rows}) · {formatDuration(currentConfig.timeLimitSeconds)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="order-2 lg:order-1 lg:col-span-6 flex flex-col justify-center gap-4 sm:gap-5">
                <p className="text-xs sm:text-sm font-semibold text-[#FACC15]">
                  Cấp 1 đến Cấp 200 · Từ 80 cặp đến 160 cặp
                </p>
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
                  Ghép cặp Thú Cưng qua 200 đấu trường tăng dần
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Nối hai thẻ thú cưng giống nhau qua tối đa 3 đoạn thẳng. Số lượng cặp tăng dần mỗi 10
                  màn từ 80 cặp lên 160 cặp, thời gian rút ngắn từ 10 phút xuống 5 phút với màn hình
                  ngang toàn màn hình tối ưu cho di động.
                </p>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onStartCurrentLevel}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl sm:rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_3px_0_#A16207] active:translate-y-[1px]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Vào trận cấp {currentLevel}
                  </button>

                  <div className="grid grid-cols-2 sm:flex gap-2.5">
                    <button
                      type="button"
                      onClick={onOpenLevelSelect}
                      className="min-h-[46px] inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-lg border border-slate-700 bg-[#1E293B] hover:bg-[#273549] text-slate-100 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Grid3X3 className="w-4 h-4 text-[#FACC15]" />
                      Bản đồ cấp độ
                    </button>
                    {authReady && !activeAccount && (
                      <button
                        type="button"
                        onClick={() => onSignIn(false)}
                        disabled={authLoading}
                        className="min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-lg border border-emerald-700/70 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Cloud className="w-4 h-4 text-emerald-300" />
                        <span className="md:hidden">Lưu Google</span>
                        <span className="hidden md:inline">Lưu tiến trình bằng Google</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:hidden grid grid-cols-2 gap-2.5 pt-1">
                  <div className="rounded-xl bg-[#1E293B] border border-slate-800 px-3.5 py-2.5">
                    <div className="text-[11px] text-slate-400">Cấp đã mở</div>
                    <div className="font-mono-num text-base font-bold text-white mt-0.5">
                      {saveData.highestUnlockedLevel}/200
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#1E293B] border border-slate-800 px-3.5 py-2.5">
                    <div className="text-[11px] text-slate-400">Đã vượt qua</div>
                    <div className="font-mono-num text-base font-bold text-emerald-300 mt-0.5">
                      {completedCount}/200
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#1E293B] border border-slate-800 px-3.5 py-2.5">
                    <div className="text-[11px] text-slate-400">Tổng số sao</div>
                    <div className="font-mono-num text-base font-bold text-[#FACC15] mt-0.5">
                      {totalStars}/600
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#1E293B] border border-slate-800 px-3.5 py-2.5">
                    <div className="text-[11px] text-slate-400">Điểm tích lũy</div>
                    <div className="font-mono-num text-base font-bold text-white mt-0.5">
                      {saveData.totalScore.toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex pt-2 flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-400 font-mono-num">
                  {activeAccount && (
                    <>
                      <span className="font-sans font-semibold text-emerald-300">
                        Tài khoản: {activeAccount.displayName || activeAccount.email}
                      </span>
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  <span>Đã mở: {saveData.highestUnlockedLevel}/200 cấp</span>
                  <span aria-hidden="true">·</span>
                  <span>Đã vượt: {completedCount}/200</span>
                  <span aria-hidden="true">·</span>
                  <span>Tổng sao: {totalStars}/600</span>
                  <span aria-hidden="true">·</span>
                  <span>Điểm: {saveData.totalScore.toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </section>

            <section
              id="rules"
              className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 border-t border-slate-800 pt-6 md:pt-8"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[#FACC15] font-semibold text-sm">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Tăng cặp mỗi 10 màn (80 → 160 cặp)</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Màn 1–10 có 80 cặp, tăng đều mỗi 10 màn tới 160 cặp ở cấp 200 với 45 loài thú cưng
                  nguyên tố riêng biệt, thẻ hình lớn dễ chạm.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[#FACC15] font-semibold text-sm">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Thời gian rút ngắn 10:00 → 05:00</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Màn 1 cho phép 10 phút rộng rãi, giảm dần về đúng 5 phút tại cấp 200 kèm dịch chuyển
                  ngẫu nhiên lấp khoảng trống sau mỗi cặp.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[#FACC15] font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Full màn hình ngang, Lưu & Offline</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Tất cả hình ảnh được nén và lưu sẵn ngoại tuyến, đồng bộ tài khoản Google và giữ trọn
                  tiến trình khi mất mạng.
                </p>
              </div>
            </section>
          </>
        ) : (
          /* ================= GAME 2: KIM CƯƠNG 100 ================= */
          <>
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              {/* Crystal Showcase Card */}
              <div className="order-1 lg:order-2 lg:col-span-6 relative rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-gradient-to-br from-[#0F172A] via-[#0B2942] to-[#083344] min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] p-5 sm:p-6 flex flex-col justify-between shadow-2xl">
                <div className="grid grid-cols-7 gap-2 sm:gap-2.5 my-auto py-3">
                  {([0, 1, 2, 3, 4, 5, 6] as const).map((colorId) => {
                    const meta = getGemStyle(colorId);
                    return (
                      <div
                        key={colorId}
                        title={meta.name}
                        className="aspect-square rounded-xl bg-[#0F172A]/80 border border-slate-700/80 p-1.5 flex items-center justify-center shadow-lg"
                      >
                        <DiamondArtwork color={colorId} className="w-full h-full" />
                      </div>
                    );
                  })}
                  <div className="col-span-7 flex items-center justify-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-cyan-200 bg-[#0F172A]/75 border border-cyan-500/40 rounded-lg px-2.5 py-1.5">
                      <DiamondArtwork color={0} special="LINE_H" className="w-5 h-5" />
                      <span>Tia Sét (4 viên)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-200 bg-[#0F172A]/75 border border-amber-500/40 rounded-lg px-2.5 py-1.5">
                      <DiamondArtwork color={3} special="BOMB" className="w-5 h-5" />
                      <span>Bom L/T</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-pink-200 bg-[#0F172A]/75 border border-pink-500/40 rounded-lg px-2.5 py-1.5">
                      <DiamondArtwork color={1} special="PRISM" className="w-5 h-5" />
                      <span>Cầu Vồng (5 viên)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-cyan-500/20">
                  <p className="text-xs text-cyan-300 font-semibold">
                    Chương {diamondConfig.chapter} · {diamondConfig.chapterName}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-white mt-0.5 font-mono-num">
                    Màn {diamondConfig.level} — Lưới {diamondConfig.rows}×{diamondConfig.cols} · Mục tiêu{' '}
                    {diamondConfig.targetScore.toLocaleString('vi-VN')}đ · {diamondConfig.movesLimit} lượt
                  </p>
                </div>
              </div>

              {/* Copy & Actions */}
              <div className="order-2 lg:order-1 lg:col-span-6 flex flex-col justify-center gap-4 sm:gap-5">
                <p className="text-xs sm:text-sm font-semibold text-cyan-300">
                  Màn 1 đến Màn 100 · Tự phá từ 3 viên trở lên
                </p>
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
                  Ghép Kim Cương 100 màn kích nổ liên hoàn
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Hoán đổi 2 viên kề nhau để xếp từ 3 kim cương giống nhau thẳng hàng là tự động phá
                  nổ, tạo chuỗi rơi liên hoàn. Xếp 4–5 viên tạo Tia Sét, Bom Pha Lê và Ngôi Sao Cầu
                  Vồng vượt qua băng giá và đá chắn qua 100 màn tăng dần.
                </p>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onStartDiamondCurrentLevel}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl sm:rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_3px_0_#0E7490] active:translate-y-[1px]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Chơi Kim Cương Màn {diamondLevel}
                  </button>

                  <div className="grid grid-cols-2 sm:flex gap-2.5">
                    <button
                      type="button"
                      onClick={onOpenDiamondLevelSelect}
                      className="min-h-[46px] inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-lg border border-slate-700 bg-[#1E293B] hover:bg-[#273549] text-slate-100 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Grid3X3 className="w-4 h-4 text-cyan-300" />
                      Bản đồ 100 màn
                    </button>
                    {authReady && !activeAccount && (
                      <button
                        type="button"
                        onClick={() => onSignIn(false)}
                        disabled={authLoading}
                        className="min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-lg border border-emerald-700/70 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Cloud className="w-4 h-4 text-emerald-300" />
                        <span className="md:hidden">Lưu Google</span>
                        <span className="hidden md:inline">Lưu tiến trình Google</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Summary Stats */}
                <div className="md:hidden grid grid-cols-2 gap-2.5 pt-1">
                  <div className="rounded-xl bg-[#1E293B] border border-slate-800 px-3.5 py-2.5">
                    <div className="text-[11px] text-slate-400">Màn đã mở</div>
                    <div className="font-mono-num text-base font-bold text-cyan-300 mt-0.5">
                      {diamondSaveData.highestUnlockedLevel}/100
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#1E293B] border border-slate-800 px-3.5 py-2.5">
                    <div className="text-[11px] text-slate-400">Đã vượt qua</div>
                    <div className="font-mono-num text-base font-bold text-emerald-300 mt-0.5">
                      {diamondCompleted}/100
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#1E293B] border border-slate-800 px-3.5 py-2.5">
                    <div className="text-[11px] text-slate-400">Tổng số sao</div>
                    <div className="font-mono-num text-base font-bold text-[#FACC15] mt-0.5">
                      {diamondStars}/300
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#1E293B] border border-slate-800 px-3.5 py-2.5">
                    <div className="text-[11px] text-slate-400">Điểm tích lũy</div>
                    <div className="font-mono-num text-base font-bold text-white mt-0.5">
                      {diamondSaveData.totalScore.toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex pt-2 flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-400 font-mono-num">
                  {activeAccount && (
                    <>
                      <span className="font-sans font-semibold text-emerald-300">
                        Tài khoản: {activeAccount.displayName || activeAccount.email}
                      </span>
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  <span>Đã mở: {diamondSaveData.highestUnlockedLevel}/100 màn</span>
                  <span aria-hidden="true">·</span>
                  <span>Đã vượt: {diamondCompleted}/100</span>
                  <span aria-hidden="true">·</span>
                  <span>Tổng sao: {diamondStars}/300</span>
                  <span aria-hidden="true">·</span>
                  <span>Điểm: {diamondSaveData.totalScore.toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </section>

            <section
              id="rules"
              className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 border-t border-slate-800 pt-6 md:pt-8"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Ghép 3+ tự phá & Tạo vũ khí</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Vuốt hoặc chạm 2 viên gần nhau để ghép 3+ viên tự phá. Ghép 4 tạo Tia Sét ngang/dọc,
                  chữ L/T tạo Bom 3×3, ghép 5 tạo Cầu Vồng xóa toàn màu.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>100 màn độ khó tăng dần</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Lưới mở rộng 7×7 → 8×8 → 9×9, số màu tăng 5 → 7 loại kèm nhiệm vụ thu thập màu, phá
                  băng 1–2 lớp và phá đá chắn ở các chương cao.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Đồ họa Vector mượt, 100% Offline</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Kim cương vẽ bằng đồ họa vector sắc nét không phụ thuộc mạng, hỗ trợ chơi ngoại tuyến
                  và tự động đồng bộ tài khoản Google khi có mạng.
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      <MobileBottomNav
        activeTab={accountSheetOpen ? 'ACCOUNT' : 'HOME'}
        levelsLabel={isDiamond ? '100 Màn' : '200 Cấp'}
        onGoHome={() => setAccountSheetOpen(false)}
        onGoLevels={() => {
          setAccountSheetOpen(false);
          if (isDiamond) onOpenDiamondLevelSelect();
          else onOpenLevelSelect();
        }}
        onOpenAccountSheet={() => setAccountSheetOpen(true)}
      />

      <MobileAccountSheet
        open={accountSheetOpen}
        onClose={() => setAccountSheetOpen(false)}
        account={activeAccount}
        hasLiveCloudAuth={hasLiveCloudAuth}
        authLoading={authLoading}
        syncStatus={syncStatus}
        soundEnabled={saveData.soundEnabled}
        bgmEnabled={bgmEnabled}
        highestUnlockedLevel={
          isDiamond ? diamondSaveData.highestUnlockedLevel : saveData.highestUnlockedLevel
        }
        maxLevel={isDiamond ? DIAMOND_MAX_LEVEL : MAX_LEVEL}
        totalScore={isDiamond ? diamondSaveData.totalScore : saveData.totalScore}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onToggleSound={onToggleSound}
        onToggleBgm={onToggleBgm}
      />
    </div>
  );
};
