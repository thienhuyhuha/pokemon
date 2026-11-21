import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Gem, Lock, Play, Star, UserCircle2 } from 'lucide-react';
import {
  DIAMOND_CHAPTER_NAMES,
  DIAMOND_MAX_LEVEL,
  getDiamondLevelConfig,
  getGemStyle,
} from '../data/diamondLevels';
import { CloudSyncStatus } from '../firebase';
import { DiamondSaveData } from '../types/diamond';
import { RememberedAccount } from '../utils/localAccountCache';
import { AccountBar } from './AccountBar';
import { MobileAccountSheet, MobileBottomNav } from './MobileBottomNav';

interface DiamondLevelSelectViewProps {
  saveData: DiamondSaveData;
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
  onTogglePreviewMode: () => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onBack: () => void;
}

export const DiamondLevelSelectView: React.FC<DiamondLevelSelectViewProps> = ({
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
  onTogglePreviewMode,
  onToggleSound,
  onToggleBgm,
  onBack,
}) => {
  const defaultChapter = Math.min(10, Math.ceil(saveData.highestUnlockedLevel / 10));
  const [activeChapter, setActiveChapter] = useState<number>(defaultChapter);
  const [jumpInput, setJumpInput] = useState<string>('100');
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  const startLevel = (activeChapter - 1) * 10 + 1;
  const levelsInChapter = Array.from({ length: 10 }, (_, idx) => startLevel + idx);
  const sampleCfg = getDiamondLevelConfig(startLevel);

  const handleCardClick = (lv: number, isUnlocked: boolean) => {
    if (!isUnlocked && !isPreviewMode) {
      setLockedNotice(
        `Màn ${lv} đang khóa. Hãy hoàn thành Màn ${saveData.highestUnlockedLevel} để mở khóa tiếp.`
      );
      return;
    }
    setLockedNotice(null);
    onSelectLevel(lv);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreviewMode) return;
    const parsed = Math.max(1, Math.min(DIAMOND_MAX_LEVEL, Number(jumpInput) || 1));
    onSelectLevel(parsed);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 w-full bg-[#0E7490] border-b-2 border-[#0F172A] shadow-md px-3 h-13 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay về trang chính"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-cyan-50 hover:text-white cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <Gem className="w-5 h-5 text-[#FACC15] shrink-0" />
          <h1 className="font-display text-base font-extrabold text-white truncate">
            Kim Cương 100 Màn
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setAccountSheetOpen(true)}
          aria-label="Mở hồ sơ tài khoản"
          className="min-h-[40px] px-2.5 rounded-lg bg-[#155E75] border border-cyan-950/60 flex items-center gap-1.5 text-xs font-mono-num font-bold text-[#FACC15] shrink-0 cursor-pointer"
        >
          <span>{saveData.highestUnlockedLevel}/100</span>
          <UserCircle2 className="w-4 h-4 text-white" />
        </button>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block w-full bg-[#0E7490] border-b-4 border-[#0F172A] shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Trang chính
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <Gem className="w-6 h-6 text-[#FACC15] shrink-0" />
            <h1 className="font-display text-xl font-extrabold text-white whitespace-nowrap truncate">
              Bản đồ 100 Màn Kim Cương
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-mono-num text-cyan-100 whitespace-nowrap">
              Đã mở: {saveData.highestUnlockedLevel}/100
            </span>
            <AccountBar
              account={activeAccount}
              hasLiveCloudAuth={hasLiveCloudAuth}
              authReady={authReady}
              authLoading={authLoading}
              syncStatus={syncStatus}
              onSignIn={onSignIn}
              onSignOut={onSignOut}
              compact
            />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-24 md:py-6 flex flex-col gap-5">
        {isPreviewMode && (
          <div className="rounded-xl bg-[#1E293B] border border-cyan-400/70 p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-cyan-300">
                Chế độ Xem trước Kim Cương 100 đang bật
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Bạn có thể mở nhanh bất kỳ màn 1–100 để kiểm tra độ khó.
              </p>
            </div>

            <form onSubmit={handleJumpSubmit} className="flex flex-wrap items-center gap-2">
              {[1, 25, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onSelectLevel(preset)}
                  className="min-h-[38px] px-2.5 py-1.5 rounded-md bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-xs font-mono-num font-semibold text-slate-200 cursor-pointer"
                >
                  Màn {preset}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={DIAMOND_MAX_LEVEL}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                aria-label="Nhập màn muốn xem"
                className="w-20 min-h-[38px] px-2.5 py-1.5 rounded-md bg-[#0F172A] border border-slate-600 text-xs font-mono-num text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="min-h-[38px] inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Vào màn
              </button>
            </form>
          </div>
        )}

        {/* 10 Chapter Tabs */}
        <div className="flex md:grid md:grid-cols-5 lg:grid-cols-10 gap-2 overflow-x-auto no-scrollbar snap-x pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {DIAMOND_CHAPTER_NAMES.map((_, idx) => {
            const ch = idx + 1;
            const from = idx * 10 + 1;
            const to = ch * 10;
            const isActive = activeChapter === ch;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => setActiveChapter(ch)}
                className={[
                  'shrink-0 min-w-[96px] md:min-w-0 snap-start min-h-[48px] px-3 py-2 rounded-xl md:rounded-lg border text-left transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[#0891B2] border-[#FACC15] text-white shadow-[0_2px_0_#155E75]'
                    : 'bg-[#1E293B] border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white',
                ].join(' ')}
              >
                <div className="font-mono-num text-xs font-bold whitespace-nowrap">
                  {from}–{to}
                </div>
                <div
                  className={`text-[11px] truncate mt-0.5 ${
                    isActive ? 'text-yellow-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  Chương {ch}
                </div>
              </button>
            );
          })}
        </div>

        {/* Chapter Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Gem className="w-7 h-7 text-cyan-400 shrink-0" />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Chương {activeChapter}: {DIAMOND_CHAPTER_NAMES[activeChapter - 1]}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {sampleCfg.difficultyLabel} · Lưới {sampleCfg.rows}×{sampleCfg.cols} ·{' '}
                {sampleCfg.gemTypes} loại kim cương
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-cyan-200 font-mono-num">
            Màn {startLevel}–{startLevel + 9}
          </div>
        </div>

        {lockedNotice && !isPreviewMode && (
          <div className="rounded-xl bg-rose-950/50 border border-rose-700/60 px-4 py-2.5 text-xs sm:text-sm text-rose-200">
            {lockedNotice}
          </div>
        )}

        {/* 10 Level Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5">
          {levelsInChapter.map((lv) => {
            const cfg = getDiamondLevelConfig(lv);
            const prog = saveData.levels[lv];
            const isUnlocked = lv <= saveData.highestUnlockedLevel;
            const canEnter = isUnlocked || isPreviewMode;
            const colorGoalMeta =
              cfg.targetColor !== null ? getGemStyle(cfg.targetColor) : null;

            return (
              <button
                key={lv}
                type="button"
                onClick={() => handleCardClick(lv, isUnlocked)}
                className={[
                  'relative min-h-[116px] rounded-2xl md:rounded-xl border p-3.5 text-left transition-all flex flex-col justify-between gap-2.5',
                  canEnter
                    ? 'bg-[#1E293B] border-slate-700 hover:border-cyan-400 hover:bg-[#263449] active:scale-[0.98] cursor-pointer shadow-[0_3px_0_#0F172A]'
                    : 'bg-[#0F172A] border-slate-800/70 opacity-60 cursor-not-allowed',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base sm:text-lg font-bold text-white font-mono-num">
                    Màn {lv}
                  </span>
                  {!isUnlocked && !isPreviewMode ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                  ) : !isUnlocked && isPreviewMode ? (
                    <Eye className="w-4 h-4 text-cyan-300" />
                  ) : prog?.completed ? (
                    <div className="flex items-center gap-0.5" aria-label={`${prog.stars} sao`}>
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= prog.stars
                              ? 'text-[#FACC15] fill-[#FACC15]'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-slate-400">
                  <div className="flex items-center justify-between font-mono-num">
                    <span>Mục tiêu</span>
                    <span className="text-cyan-300 font-semibold">
                      {cfg.targetScore.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono-num">
                    <span>Lượt đi</span>
                    <span className="text-slate-100 font-semibold">
                      {cfg.movesLimit} lượt
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 font-mono-num">
                    <span className="truncate">
                      {colorGoalMeta
                        ? `${cfg.targetColorCount} ${colorGoalMeta.shortName}${
                            cfg.secondaryTargetColor !== null
                              ? ` + ${cfg.secondaryTargetColorCount} ${getGemStyle(cfg.secondaryTargetColor).shortName}`
                              : ''
                          }`
                        : `${cfg.rows}×${cfg.cols} · ${cfg.gemTypes} màu`}
                    </span>
                    {(cfg.iceCount > 0 || cfg.stoneCount > 0) && (
                      <span className="text-sky-300 shrink-0">
                        {cfg.iceCount > 0 ? `${cfg.iceCount + cfg.doubleIceCount}❄` : ''}
                        {cfg.iceCount > 0 && cfg.stoneCount > 0 ? ' ' : ''}
                        {cfg.stoneCount > 0 ? `${cfg.stoneCount}🪨` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <footer className="mt-2 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>100 màn chiến thuật · 5–7 loại kim cương</span>
          <button
            type="button"
            onClick={onTogglePreviewMode}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#1E293B] hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-cyan-300" />
                Tắt chế độ xem trước
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Xem trước màn (Chủ game)
              </>
            )}
          </button>
        </footer>
      </main>

      <MobileBottomNav
        activeTab={accountSheetOpen ? 'ACCOUNT' : 'LEVELS'}
        onGoHome={() => {
          setAccountSheetOpen(false);
          onBack();
        }}
        onGoLevels={() => setAccountSheetOpen(false)}
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
        highestUnlockedLevel={saveData.highestUnlockedLevel}
        totalScore={saveData.totalScore}
        maxLevel={DIAMOND_MAX_LEVEL}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onToggleSound={onToggleSound}
        onToggleBgm={onToggleBgm}
      />
    </div>
  );
};
