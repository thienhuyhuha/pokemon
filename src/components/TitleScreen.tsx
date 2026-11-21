import React, { useState } from 'react';
import {
  Castle,
  Cloud,
  Gem,
  Grid3X3,
  Music,
  Play,
  Star,
  UserCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DIAMOND_MAX_LEVEL } from '../data/diamondLevels';
import { MAX_LEVEL } from '../data/levels';
import {
  CHIBIMON_COVER_URL,
  DIAMOND_COVER_URL,
  PokemonArtwork,
  TD_COVER_URL,
} from '../data/pokemonSprites';
import { getTotalStarsEarnedInTd, TD_MAX_LEVEL } from '../data/tdLevels';
import { CloudSyncStatus } from '../firebase';
import { DiamondSaveData, GameId } from '../types/diamond';
import { SaveData } from '../types/game';
import { TdSaveData } from '../types/towerDefense';
import { RememberedAccount } from '../utils/localAccountCache';
import { AccountBar } from './AccountBar';
import { DiamondArtwork } from './DiamondArtwork';
import { MobileAccountSheet, MobileBottomNav } from './MobileBottomNav';
import { PokeballIcon } from './PokeballIcon';
import { PWAInstallButton } from './PWAInstallButton';
import { TdEnemyPreview, TdTowerPreview } from './TdArtwork';

interface TitleScreenProps {
  activeGame: GameId;
  onSelectGame: (game: GameId) => void;
  saveData: SaveData;
  diamondSaveData: DiamondSaveData;
  tdSaveData: TdSaveData;
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
  onStartTdCurrentLevel: () => void;
  onOpenTdLevelSelect: () => void;
  onToggleSound: () => void;
  bgmEnabled: boolean;
  onToggleBgm: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  activeGame,
  onSelectGame,
  saveData,
  diamondSaveData,
  tdSaveData,
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
  onStartTdCurrentLevel,
  onOpenTdLevelSelect,
  onToggleSound,
  bgmEnabled,
  onToggleBgm,
}) => {
  const [chibiImgErr, setChibiImgErr] = useState(false);
  const [diamondImgErr, setDiamondImgErr] = useState(false);
  const [tdImgErr, setTdImgErr] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  const isDiamond = activeGame === 'DIAMOND';
  const isTd = activeGame === 'TOWER_DEFENSE';

  const currentLevel = Math.min(MAX_LEVEL, saveData.highestUnlockedLevel);
  const totalStars = Object.values(saveData.levels).reduce((acc, l) => acc + l.stars, 0);

  const diamondLevel = Math.min(DIAMOND_MAX_LEVEL, diamondSaveData.highestUnlockedLevel);
  const diamondStars = Object.values(diamondSaveData.levels).reduce((acc, l) => acc + l.stars, 0);

  const tdLevel = Math.min(TD_MAX_LEVEL, tdSaveData.highestUnlockedLevel);
  const tdStars = getTotalStarsEarnedInTd(tdSaveData.levels);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Mobile Compact Header */}
      <header className="md:hidden sticky top-0 z-30 w-full bg-[#111827]/95 backdrop-blur-sm border-b border-slate-800 px-4 h-13 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <PokeballIcon variant="poke" className="w-5 h-5 shrink-0" />
          <Gem className="w-4 h-4 text-cyan-300 shrink-0" />
          <Castle className="w-4 h-4 text-[#FACC15] shrink-0" />
          <span className="font-display text-base font-extrabold tracking-tight text-white whitespace-nowrap">
            Đấu Trường Game
          </span>
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
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <PokeballIcon variant="poke" className="w-6 h-6 shrink-0" />
            <Gem className="w-5 h-5 text-cyan-300 shrink-0" />
            <Castle className="w-5 h-5 text-[#FACC15] shrink-0" />
            <span className="font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
              Đấu Trường Game
            </span>
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
                bgmEnabled && saveData.soundEnabled
                  ? 'bg-[#1E293B] text-[#FACC15] hover:bg-slate-700'
                  : 'bg-[#1E293B] text-slate-500 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg border border-slate-700 bg-[#1E293B] text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            >
              {saveData.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Center Iconic 3-Game Selector Board */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:py-10 flex flex-col justify-center gap-6">
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

        {/* Triple Iconic Game Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Game 1: ChibiMon 200 */}
          <div
            onClick={() => onSelectGame('CHIBIMON')}
            className={`group rounded-2xl overflow-hidden bg-[#131C31] border-2 transition-all flex flex-col shadow-2xl ${
              activeGame === 'CHIBIMON'
                ? 'border-[#FACC15] shadow-[0_14px_40px_rgba(234,179,8,0.18)]'
                : 'border-slate-800 hover:border-slate-600'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelectGame('CHIBIMON');
                onStartCurrentLevel();
              }}
              aria-label={`Chơi ChibiMon 200 cấp ${currentLevel}`}
              className="relative w-full aspect-[4/3] overflow-hidden bg-[#14532D] cursor-pointer text-left focus:outline-none"
            >
              {!chibiImgErr ? (
                <img
                  src={CHIBIMON_COVER_URL}
                  alt="ChibiMon 200"
                  referrerPolicy="no-referrer"
                  onError={() => setChibiImgErr(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#DC2626] via-[#14532D] to-[#0F172A]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#131C31] via-[#131C31]/25 to-transparent" />

              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-[#DC2626] border-2 border-[#FACC15] flex items-center justify-center shadow-lg">
                    <PokeballIcon variant="poke" className="w-6 h-6" />
                  </div>
                  <div className="flex items-center -space-x-1.5">
                    {[1, 2, 3].map((id) => (
                      <div
                        key={id}
                        className="w-8 h-8 rounded-lg bg-white border-2 border-slate-900 p-0.5 shadow-md"
                      >
                        <PokemonArtwork speciesId={id} className="w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 font-mono-num text-xs font-extrabold text-[#FACC15]">
                  <Star className="w-3.5 h-3.5 fill-[#FACC15]" />
                  {totalStars}
                </span>
              </div>
            </button>

            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-extrabold text-white tracking-tight">
                  ChibiMon 200
                </h2>
                <span className="font-mono-num text-xs font-bold text-yellow-300 whitespace-nowrap">
                  Cấp {currentLevel}/200
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectGame('CHIBIMON');
                    onStartCurrentLevel();
                  }}
                  className="col-span-2 min-h-[44px] rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_3px_0_#A16207] active:translate-y-[1px]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Chơi ngay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectGame('CHIBIMON');
                    onOpenLevelSelect();
                  }}
                  className="min-h-[44px] rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Grid3X3 className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>200</span>
                </button>
              </div>
            </div>
          </div>

          {/* Game 2: Kim Cương 100 */}
          <div
            onClick={() => onSelectGame('DIAMOND')}
            className={`group rounded-2xl overflow-hidden bg-[#131C31] border-2 transition-all flex flex-col shadow-2xl ${
              activeGame === 'DIAMOND'
                ? 'border-cyan-400 shadow-[0_14px_40px_rgba(34,211,238,0.18)]'
                : 'border-slate-800 hover:border-slate-600'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelectGame('DIAMOND');
                onStartDiamondCurrentLevel();
              }}
              aria-label={`Chơi Kim Cương 100 màn ${diamondLevel}`}
              className="relative w-full aspect-[4/3] overflow-hidden bg-[#083344] cursor-pointer text-left focus:outline-none"
            >
              {!diamondImgErr ? (
                <img
                  src={DIAMOND_COVER_URL}
                  alt="Kim Cương 100"
                  referrerPolicy="no-referrer"
                  onError={() => setDiamondImgErr(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0891B2] via-[#1E3A8A] to-[#0F172A]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#131C31] via-[#131C31]/25 to-transparent" />

              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E7490] border-2 border-cyan-300 flex items-center justify-center shadow-lg p-1.5">
                    <DiamondArtwork color={1} special="PRISM" className="w-full h-full" />
                  </div>
                  <div className="flex items-center -space-x-1.5">
                    {([0, 2, 3] as const).map((colorId) => (
                      <div
                        key={colorId}
                        className="w-8 h-8 rounded-lg bg-[#0F172A]/95 border-2 border-slate-700 p-1 shadow-md"
                      >
                        <DiamondArtwork color={colorId} className="w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 font-mono-num text-xs font-extrabold text-cyan-300">
                  <Star className="w-3.5 h-3.5 fill-cyan-300" />
                  {diamondStars}
                </span>
              </div>
            </button>

            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-extrabold text-white tracking-tight">
                  Kim Cương 100
                </h2>
                <span className="font-mono-num text-xs font-bold text-cyan-300 whitespace-nowrap">
                  Màn {diamondLevel}/100
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectGame('DIAMOND');
                    onStartDiamondCurrentLevel();
                  }}
                  className="col-span-2 min-h-[44px] rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_3px_0_#0E7490] active:translate-y-[1px]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Chơi ngay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectGame('DIAMOND');
                    onOpenDiamondLevelSelect();
                  }}
                  className="min-h-[44px] rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Grid3X3 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>100</span>
                </button>
              </div>
            </div>
          </div>

          {/* Game 3: Vệ Thành Quái Thú (Tower Defense) */}
          <div
            onClick={() => onSelectGame('TOWER_DEFENSE')}
            className={`group rounded-2xl overflow-hidden bg-[#131C31] border-2 transition-all flex flex-col shadow-2xl ${
              activeGame === 'TOWER_DEFENSE'
                ? 'border-orange-400 shadow-[0_14px_40px_rgba(251,146,60,0.2)]'
                : 'border-slate-800 hover:border-slate-600'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelectGame('TOWER_DEFENSE');
                onStartTdCurrentLevel();
              }}
              aria-label={`Chơi Vệ Thành Quái Thú ải ${tdLevel}`}
              className="relative w-full aspect-[4/3] overflow-hidden bg-[#431407] cursor-pointer text-left focus:outline-none"
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#131C31] via-[#131C31]/25 to-transparent" />

              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 border-2 border-[#FACC15] flex items-center justify-center shadow-lg">
                    <Castle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-9 h-9 rounded-lg bg-[#0F172A]/95 border-2 border-slate-700 flex items-center justify-center shadow-md p-0.5">
                      <TdTowerPreview type="ARCHER" level={4} branch="SNIPER_CRIT" className="w-8 h-8" />
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#0F172A]/95 border-2 border-slate-700 flex items-center justify-center shadow-md p-0.5">
                      <TdTowerPreview type="MAGE" level={4} branch="STORM_CHAIN" className="w-8 h-8" />
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#0F172A]/95 border-2 border-slate-700 flex items-center justify-center shadow-md p-0.5">
                      <TdTowerPreview type="ASSASSIN" level={4} branch="SHADOW_BLADE" className="w-8 h-8" />
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#0F172A]/95 border-2 border-slate-700 flex items-center justify-center shadow-md p-0.5">
                      <TdTowerPreview type="VALKYRIE" level={4} branch="SOLAR_SERAPH" className="w-8 h-8" />
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#0F172A]/95 border-2 border-rose-700/80 flex items-center justify-center shadow-md p-0.5">
                      <TdEnemyPreview type="BOSS" className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 font-mono-num text-xs font-extrabold text-orange-300">
                  <Star className="w-3.5 h-3.5 fill-orange-300" />
                  {tdStars}
                </span>
              </div>
            </button>

            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-extrabold text-white tracking-tight">
                  Thủ Cửa {TD_MAX_LEVEL}
                </h2>
                <span className="font-mono-num text-xs font-bold text-orange-300 whitespace-nowrap">
                  Ải {tdLevel}/{TD_MAX_LEVEL}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectGame('TOWER_DEFENSE');
                    onStartTdCurrentLevel();
                  }}
                  className="col-span-2 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_3px_0_#9A3412] active:translate-y-[1px]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Chơi ngay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectGame('TOWER_DEFENSE');
                    onOpenTdLevelSelect();
                  }}
                  className="min-h-[44px] rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Grid3X3 className="w-3.5 h-3.5 text-orange-300" />
                  <span>{TD_MAX_LEVEL} Ải</span>
                </button>
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
              <span>Đăng nhập Google lưu tiến trình</span>
            </button>
          </div>
        )}
      </main>

      <MobileBottomNav
        activeTab={accountSheetOpen ? 'ACCOUNT' : 'HOME'}
        levelsLabel={isTd ? `${TD_MAX_LEVEL} Ải` : isDiamond ? '100 Màn' : '200 Cấp'}
        onGoHome={() => setAccountSheetOpen(false)}
        onGoLevels={() => {
          setAccountSheetOpen(false);
          if (isTd) onOpenTdLevelSelect();
          else if (isDiamond) onOpenDiamondLevelSelect();
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
          isTd
            ? tdSaveData.highestUnlockedLevel
            : isDiamond
              ? diamondSaveData.highestUnlockedLevel
              : saveData.highestUnlockedLevel
        }
        maxLevel={isTd ? TD_MAX_LEVEL : isDiamond ? DIAMOND_MAX_LEVEL : MAX_LEVEL}
        totalScore={
          isTd
            ? tdSaveData.totalScore
            : isDiamond
              ? diamondSaveData.totalScore
              : saveData.totalScore
        }
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onToggleSound={onToggleSound}
        onToggleBgm={onToggleBgm}
      />
    </div>
  );
};
