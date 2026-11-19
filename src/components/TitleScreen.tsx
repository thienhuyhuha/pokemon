import React, { useState } from 'react';
import {
  Play,
  Grid3X3,
  Volume2,
  VolumeX,
  ShieldCheck,
  Clock,
  Layers,
  Cloud,
  UserCircle2,
} from 'lucide-react';
import { formatDuration, getLevelConfig, MAX_LEVEL } from '../data/levels';
import { getPokemonSpecies, PokemonArtwork } from '../data/pokemonSprites';
import { CloudSyncStatus } from '../firebase';
import { SaveData } from '../types/game';
import { RememberedAccount } from '../utils/localAccountCache';
import { AccountBar } from './AccountBar';
import { MobileAccountSheet, MobileBottomNav } from './MobileBottomNav';
import { PokeballIcon } from './PokeballIcon';
import { PWAInstallButton } from './PWAInstallButton';

interface TitleScreenProps {
  saveData: SaveData;
  activeAccount: RememberedAccount | null;
  hasLiveCloudAuth: boolean;
  authReady: boolean;
  authLoading: boolean;
  syncStatus: CloudSyncStatus;
  authError: string | null;
  onSignIn: (forceSelectAccount?: boolean) => void;
  onSignOut: () => void;
  onStartCurrentLevel: () => void;
  onOpenLevelSelect: () => void;
  onToggleSound: () => void;
}

const WORLD_BANNER_URL = '/src/assets/images/pokemon_hero_world_1795064302567.jpg';

export const TitleScreen: React.FC<TitleScreenProps> = ({
  saveData,
  activeAccount,
  hasLiveCloudAuth,
  authReady,
  authLoading,
  syncStatus,
  authError,
  onSignIn,
  onSignOut,
  onStartCurrentLevel,
  onOpenLevelSelect,
  onToggleSound,
}) => {
  const [imgError, setImgError] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  const currentLevel = Math.min(MAX_LEVEL, saveData.highestUnlockedLevel);
  const currentConfig = getLevelConfig(currentLevel);
  const completedCount = Object.values(saveData.levels).filter((l) => l.completed).length;
  const totalStars = Object.values(saveData.levels).reduce((acc, l) => acc + l.stars, 0);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      {/* Mobile Compact Top App Bar (< md) */}
      <header className="md:hidden sticky top-0 z-30 w-full bg-[#DC2626] border-b-2 border-[#0F172A] shadow-md px-4 h-13 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <PokeballIcon variant="poke" className="w-6 h-6 shrink-0" />
          <span className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
            ChibiMon 200
          </span>
        </div>

        <button
          type="button"
          onClick={() => setAccountSheetOpen(true)}
          aria-label="Mở hồ sơ tài khoản"
          className="min-h-[40px] px-2.5 py-1 rounded-lg bg-[#991B1B] border border-red-950/60 flex items-center gap-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
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

      {/* Desktop Web Crimson Header (md+) */}
      <header className="hidden md:block w-full bg-[#DC2626] border-b-4 border-[#0F172A] shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <PokeballIcon variant="poke" className="w-7 h-7 shrink-0" />
            <span className="font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
              ChibiMon 200
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-red-50">
            <button
              type="button"
              onClick={onOpenLevelSelect}
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Bản đồ 200 cấp
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
              onClick={onToggleSound}
              aria-label={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg border border-red-900 bg-[#B91C1C] text-red-50 hover:text-white hover:bg-[#991B1B] transition-colors cursor-pointer shrink-0"
            >
              {saveData.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onStartCurrentLevel}
              className="px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_2px_0_#A16207]"
            >
              Đấu cấp {currentLevel}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:py-10 flex flex-col gap-7 md:gap-10">
        {authError && (
          <div className="rounded-xl bg-rose-950/60 border border-rose-700/70 px-4 py-2.5 text-xs sm:text-sm text-rose-200">
            {authError}
          </div>
        )}

        {/* Hero Split (Mobile: Banner -> CTA -> Stats; Desktop: 12-col Split) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Arena Banner (Shown first on mobile for immediate visual impact, right on desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-6 relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-[#1E293B] min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex flex-col justify-end shadow-2xl">
            {!imgError ? (
              <img
                src={WORLD_BANNER_URL}
                alt="Thế giới đấu trường thú cưng"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0284C7] via-[#14532D] to-[#0F172A]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/45 to-transparent" />

            {/* Floating Creature Card Lineup */}
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

          {/* Copy & Actions */}
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

            {/* Primary CTA & Secondary Actions */}
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

            {/* Mobile 2x2 Summary Grid (< md) */}
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

            {/* Desktop Clean Unboxed Trainer Stats (md+) */}
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

        {/* 3-Column Feature Strip */}
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
              Tự động mở toàn màn hình ngang trên di động, đồng bộ tài khoản Google 1 lần và cho
              phép chơi mượt kể cả khi mất mạng.
            </p>
          </div>
        </section>
      </main>

      {/* Mobile Fixed Bottom Tab Bar & Account Sheet */}
      <MobileBottomNav
        activeTab={accountSheetOpen ? 'ACCOUNT' : 'HOME'}
        onGoHome={() => setAccountSheetOpen(false)}
        onGoLevels={() => {
          setAccountSheetOpen(false);
          onOpenLevelSelect();
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
        highestUnlockedLevel={saveData.highestUnlockedLevel}
        totalScore={saveData.totalScore}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onToggleSound={onToggleSound}
      />
    </div>
  );
};
