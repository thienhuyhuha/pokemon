import React, { useState } from 'react';
import {
  Backpack,
  Cloud,
  Gem,
  Grid3X3,
  Music,
  Play,
  Shield,
  Sparkles,
  Star,
  UserCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TD_COVER_URL } from '../data/tdAssets';
import { getTotalStarsEarnedInTd, TD_MAX_LEVEL } from '../data/tdLevels';
import { CloudSyncStatus } from '../firebase';
import { TdSaveData } from '../types/towerDefense';
import { RememberedAccount } from '../utils/localAccountCache';
import { AccountBar } from './AccountBar';
import { CastleShieldLogo } from './CastleShieldLogo';
import { MobileAccountSheet, MobileBottomNav } from './MobileBottomNav';
import { PWAInstallButton } from './PWAInstallButton';
import { TdEnemyPreview, TdTowerPreview } from './TdArtwork';

interface TitleScreenProps {
  tdSaveData: TdSaveData;
  activeAccount: RememberedAccount | null;
  hasLiveCloudAuth: boolean;
  authReady: boolean;
  authLoading: boolean;
  syncStatus: CloudSyncStatus;
  authError: string | null;
  showRedirectFallback: boolean;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onSignIn: (forceSelectAccount?: boolean) => void;
  onSignInRedirect: () => void;
  onSignOut: () => void;
  onStartTdCurrentLevel: () => void;
  onOpenTdLevelSelect: () => void;
  onOpenInventory: () => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  tdSaveData,
  activeAccount,
  hasLiveCloudAuth,
  authReady,
  authLoading,
  syncStatus,
  authError,
  showRedirectFallback,
  soundEnabled,
  bgmEnabled,
  onSignIn,
  onSignInRedirect,
  onSignOut,
  onStartTdCurrentLevel,
  onOpenTdLevelSelect,
  onOpenInventory,
  onToggleSound,
  onToggleBgm,
}) => {
  const [tdImgErr, setTdImgErr] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  const tdLevel = Math.min(TD_MAX_LEVEL, tdSaveData.highestUnlockedLevel);
  const tdStars = getTotalStarsEarnedInTd(tdSaveData.levels, tdSaveData.bonusStars);
  const gems = tdSaveData.enhancementGems ?? 0;
  const equipCount = tdSaveData.equipmentInventory?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Mobile Compact Header */}
      <header className="md:hidden sticky top-0 z-30 w-full bg-[#111827]/95 backdrop-blur-sm border-b border-slate-800 px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <CastleShieldLogo className="w-8 h-8 shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-extrabold tracking-tight text-white whitespace-nowrap">
              Vệ Thành Quái Thú
            </span>
            <span className="text-[10px] font-semibold text-amber-300/90">
              Thủ Thành Chiến Thuật {TD_MAX_LEVEL} Ải
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAccountSheetOpen(true)}
          aria-label="Mở hồ sơ tài khoản"
          className="min-h-[40px] px-2.5 py-1 rounded-lg bg-[#1E293B] border border-slate-700 flex items-center gap-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          {activeAccount?.photoURL ? (
            <img
              src={activeAccount.photoURL}
              alt={activeAccount.displayName}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full border border-[#FACC15] object-cover shrink-0"
            />
          ) : (
            <UserCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
          )}
          <span className="max-w-[96px] truncate">
            {activeAccount ? activeAccount.displayName : 'Đăng nhập'}
          </span>
        </button>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block w-full bg-[#111827]/95 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <CastleShieldLogo className="w-9 h-9 shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
                Vệ Thành Quái Thú
              </span>
              <span className="text-[11px] font-semibold text-amber-300/85">
                Phòng Thủ Thành Quách & Trang Bị Anh Hùng
              </span>
            </div>
          </div>

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
              className={`p-2 rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0 ${
                bgmEnabled && soundEnabled
                  ? 'bg-[#1E293B] text-[#FACC15] hover:bg-slate-700'
                  : 'bg-[#1E293B] text-slate-500 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg border border-slate-700 bg-[#1E293B] text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Tower Defense Showcase */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:py-8 flex flex-col justify-center gap-5">
        {authError && (
          <div className="rounded-xl bg-rose-950/70 border border-rose-700/70 px-4 py-3 text-xs sm:text-sm text-rose-100 flex flex-wrap items-center justify-between gap-3">
            <span>{authError}</span>
            {showRedirectFallback && (
              <button
                type="button"
                onClick={onSignInRedirect}
                disabled={authLoading}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
              >
                Đăng nhập chuyển hướng
              </button>
            )}
          </div>
        )}

        <section className="rounded-3xl overflow-hidden bg-[#131C31] border-2 border-amber-500/60 shadow-[0_20px_60px_rgba(245,158,11,0.16)] grid grid-cols-1 lg:grid-cols-12">
          {/* Artwork Side */}
          <button
            type="button"
            onClick={onStartTdCurrentLevel}
            aria-label={`Chơi Vệ Thành Quái Thú ải ${tdLevel}`}
            className="lg:col-span-7 relative min-h-[240px] sm:min-h-[310px] overflow-hidden bg-[#431407] cursor-pointer text-left group focus:outline-none"
          >
            {!tdImgErr ? (
              <img
                src={TD_COVER_URL}
                alt="Vệ Thành Quái Thú"
                referrerPolicy="no-referrer"
                onError={() => setTdImgErr(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#EA580C] via-[#7C2D12] to-[#0F172A]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#131C31] via-[#131C31]/35 to-transparent" />

            {/* Top Left Emblem */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-xl bg-[#0F172A]/85 backdrop-blur-sm border border-amber-400/50 px-3 py-1.5 shadow-lg">
              <CastleShieldLogo className="w-6 h-6 shrink-0" />
              <span className="text-xs font-extrabold text-amber-300">
                Ải {tdLevel}/{TD_MAX_LEVEL}
              </span>
            </div>

            {/* Bottom Hero Lineup */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center -space-x-1.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F172A]/95 border-2 border-slate-700 flex items-center justify-center shadow-md p-0.5">
                  <TdTowerPreview type="ARCHER" level={4} branch="SNIPER_CRIT" className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#0F172A]/95 border-2 border-slate-700 flex items-center justify-center shadow-md p-0.5">
                  <TdTowerPreview type="MAGE" level={4} branch="STORM_CHAIN" className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#0F172A]/95 border-2 border-slate-700 flex items-center justify-center shadow-md p-0.5">
                  <TdTowerPreview type="ASSASSIN" level={4} branch="SHADOW_BLADE" className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#0F172A]/95 border-2 border-slate-700 flex items-center justify-center shadow-md p-0.5">
                  <TdTowerPreview type="VALKYRIE" level={4} branch="SOLAR_SERAPH" className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#0F172A]/95 border-2 border-rose-700/80 flex items-center justify-center shadow-md p-0.5">
                  <TdEnemyPreview type="BOSS" className="w-8 h-8" />
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-lg bg-[#0F172A]/90 border border-amber-400/50 px-2.5 py-1 font-mono-num text-xs font-extrabold text-[#FACC15]">
                <Star className="w-3.5 h-3.5 fill-[#FACC15]" />
                {tdStars}
              </span>
            </div>
          </button>

          {/* Controls & Stats Side */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <CastleShieldLogo className="w-10 h-10 shrink-0" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Vệ Thành Quái Thú
                  </h1>
                  <p className="text-xs text-slate-400">
                    Triệu hồi 10 tướng thủ thành, săn trang bị hiếm & kích hoạt tuyệt chiêu tối thượng
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-xl bg-[#0F172A] border border-slate-800 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Sao Tích Lũy</div>
                  <div className="font-mono-num text-base font-extrabold text-[#FACC15] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#FACC15]" />
                    {tdStars}
                  </div>
                </div>
                <div className="rounded-xl bg-[#0F172A] border border-slate-800 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Ngọc C.Hóa</div>
                  <div className="font-mono-num text-base font-extrabold text-cyan-300 flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5 text-cyan-300" />
                    {gems}
                  </div>
                </div>
                <div className="rounded-xl bg-[#0F172A] border border-slate-800 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Trang Bị</div>
                  <div className="font-mono-num text-base font-extrabold text-emerald-300 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    {equipCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onStartTdCurrentLevel}
                className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_0_#9A3412] active:translate-y-[1px]"
              >
                <Play className="w-5 h-5 fill-current" />
                Chơi Ngay — Ải {tdLevel}
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onOpenTdLevelSelect}
                  className="min-h-[44px] px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Grid3X3 className="w-4 h-4 text-orange-300 shrink-0" />
                  <span>Bản Đồ {TD_MAX_LEVEL} Ải</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenInventory}
                  className="min-h-[44px] px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/60 text-cyan-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Backpack className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span>Kho Đồ ({equipCount})</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick System Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl bg-[#131C31]/90 border border-slate-800 px-4 py-3 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">9 Món Trang Bị Theo Tướng</div>
              <div className="text-slate-400 mt-0.5">
                Rơi 0.1% từ quái (Common → Mythic), không rơi trùng đồ đã sở hữu.
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#131C31]/90 border border-slate-800 px-4 py-3 flex items-start gap-3">
            <Gem className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Ngọc Cường Hóa (+12)</div>
              <div className="text-slate-400 mt-0.5">
                Tỷ lệ rơi 2%/quái. Mỗi cấp +2% chỉ số, tỷ lệ thành công giảm 8% mỗi bậc.
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#131C31]/90 border border-slate-800 px-4 py-3 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Tuyệt Chiêu Max Cấp</div>
              <div className="text-slate-400 mt-0.5">
                Tướng đạt cấp tối đa (Lv20 / Lv30) tự kích hoạt tuyệt chiêu tối thượng trong trận.
              </div>
            </div>
          </div>
        </section>

        {/* Compact Google Sync Prompt if not signed in */}
        {authReady && !activeAccount && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onSignIn(false)}
              disabled={authLoading}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-700/70 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 font-semibold text-sm transition-colors cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-300" />
              <span>Đăng nhập Google lưu tiến trình & Kho Đồ</span>
            </button>
          </div>
        )}
      </main>

      <MobileBottomNav
        activeTab={accountSheetOpen ? 'ACCOUNT' : 'HOME'}
        levelsLabel={`${TD_MAX_LEVEL} Ải`}
        onGoHome={() => setAccountSheetOpen(false)}
        onGoLevels={() => {
          setAccountSheetOpen(false);
          onOpenTdLevelSelect();
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
        soundEnabled={soundEnabled}
        bgmEnabled={bgmEnabled}
        highestUnlockedLevel={tdSaveData.highestUnlockedLevel}
        maxLevel={TD_MAX_LEVEL}
        totalScore={tdSaveData.totalScore}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onToggleSound={onToggleSound}
        onToggleBgm={onToggleBgm}
      />
    </div>
  );
};
