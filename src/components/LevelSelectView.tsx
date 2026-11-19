import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Play, Star } from 'lucide-react';
import { CHAPTER_NAMES, formatDuration, getLevelConfig, MAX_LEVEL } from '../data/levels';
import { CloudSyncStatus } from '../firebase';
import { SaveData } from '../types/game';
import { RememberedAccount } from '../utils/localAccountCache';
import { AccountBar } from './AccountBar';
import { PokeballIcon } from './PokeballIcon';

interface LevelSelectViewProps {
  saveData: SaveData;
  activeAccount: RememberedAccount | null;
  hasLiveCloudAuth: boolean;
  authReady: boolean;
  authLoading: boolean;
  syncStatus: CloudSyncStatus;
  isPreviewMode: boolean;
  onSignIn: (forceSelectAccount?: boolean) => void;
  onSignOut: () => void;
  onSelectLevel: (level: number) => void;
  onTogglePreviewMode: () => void;
  onBack: () => void;
}

function getBallVariant(chapter: number): 'poke' | 'great' | 'ultra' | 'master' {
  if (chapter <= 3) return 'poke';
  if (chapter <= 6) return 'great';
  if (chapter <= 8) return 'ultra';
  return 'master';
}

export const LevelSelectView: React.FC<LevelSelectViewProps> = ({
  saveData,
  activeAccount,
  hasLiveCloudAuth,
  authReady,
  authLoading,
  syncStatus,
  isPreviewMode,
  onSignIn,
  onSignOut,
  onSelectLevel,
  onTogglePreviewMode,
  onBack,
}) => {
  const defaultChapter = Math.min(10, Math.ceil(saveData.highestUnlockedLevel / 20));
  const [activeChapter, setActiveChapter] = useState<number>(defaultChapter);
  const [jumpInput, setJumpInput] = useState<string>('200');
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const startLevel = (activeChapter - 1) * 20 + 1;
  const levelsInChapter = Array.from({ length: 20 }, (_, idx) => startLevel + idx);
  const sampleConfig = getLevelConfig(startLevel);

  const handleCardClick = (lv: number, isUnlocked: boolean) => {
    if (!isUnlocked && !isPreviewMode) {
      setLockedNotice(
        `Cấp ${lv} đang khóa. Bạn cần vượt qua Cấp ${saveData.highestUnlockedLevel} để mở khóa tiếp.`
      );
      return;
    }
    setLockedNotice(null);
    onSelectLevel(lv);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreviewMode) return;
    const parsed = Math.max(1, Math.min(MAX_LEVEL, Number(jumpInput) || 1));
    onSelectLevel(parsed);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-slate-100 flex flex-col">
      {/* Crimson Header */}
      <header className="w-full bg-[#B91C1C] border-b-4 border-[#0F172A] shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-100 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Trang chính
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <PokeballIcon variant={getBallVariant(activeChapter)} className="w-6 h-6 shrink-0" />
            <h1 className="font-display text-base sm:text-xl font-extrabold text-white whitespace-nowrap truncate">
              Bản đồ 200 Đấu Trường
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-xs sm:text-sm font-mono-num text-red-100 whitespace-nowrap">
              Đã mở: {saveData.highestUnlockedLevel}/200
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

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Creator Preview Toolbar (only visible when Preview Mode is enabled) */}
        {isPreviewMode && (
          <div className="rounded-xl bg-[#1E293B] border border-[#FACC15]/70 p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#FACC15]">
                Chế độ Xem trước (Chủ game) đang bật
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Bạn có thể chọn bất kỳ màn nào 1–200 để kiểm tra trước. Tiến trình mở khóa của người chơi không bị thay đổi.
              </p>
            </div>

            <form onSubmit={handleJumpSubmit} className="flex flex-wrap items-center gap-2">
              {[1, 50, 100, 150, 200].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onSelectLevel(preset)}
                  className="px-2.5 py-1.5 rounded-md bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-xs font-mono-num font-semibold text-slate-200 cursor-pointer"
                >
                  Cấp {preset}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={MAX_LEVEL}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                aria-label="Nhập cấp muốn xem trước"
                className="w-20 px-2.5 py-1.5 rounded-md bg-[#0F172A] border border-slate-600 text-xs font-mono-num text-white focus:outline-none focus:border-[#FACC15]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#FACC15] hover:bg-yellow-300 text-slate-950 text-xs font-bold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Xem màn
              </button>
            </form>
          </div>
        )}

        {/* Chapter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {CHAPTER_NAMES.map((_, idx) => {
            const ch = idx + 1;
            const from = idx * 20 + 1;
            const to = ch * 20;
            const isActive = activeChapter === ch;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => setActiveChapter(ch)}
                className={[
                  'px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[#DC2626] border-[#FACC15] text-white shadow-[0_2px_0_#991B1B]'
                    : 'bg-[#1E293B] border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white',
                ].join(' ')}
              >
                <div className="font-mono-num text-xs font-bold">
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

        {/* Chapter Description */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <PokeballIcon variant={getBallVariant(activeChapter)} className="w-8 h-8 shrink-0" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                Chương {activeChapter}: {CHAPTER_NAMES[activeChapter - 1]}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {sampleConfig.gravityDescription}
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 font-mono-num">
            {getLevelConfig(startLevel).pairsCount}–{getLevelConfig(startLevel + 19).pairsCount} cặp ·{' '}
            {formatDuration(getLevelConfig(startLevel).timeLimitSeconds)} →{' '}
            {formatDuration(getLevelConfig(startLevel + 19).timeLimitSeconds)}
          </div>
        </div>

        {lockedNotice && !isPreviewMode && (
          <div className="rounded-lg bg-rose-950/50 border border-rose-700/60 px-4 py-2.5 text-xs sm:text-sm text-rose-200">
            {lockedNotice}
          </div>
        )}

        {/* 20 Level Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
          {levelsInChapter.map((lv) => {
            const cfg = getLevelConfig(lv);
            const prog = saveData.levels[lv];
            const isUnlocked = lv <= saveData.highestUnlockedLevel;
            const canEnter = isUnlocked || isPreviewMode;

            return (
              <button
                key={lv}
                type="button"
                onClick={() => handleCardClick(lv, isUnlocked)}
                className={[
                  'relative rounded-xl border p-4 text-left transition-all flex flex-col justify-between gap-3',
                  canEnter
                    ? 'bg-[#1E293B] border-slate-700 hover:border-[#FACC15] hover:bg-[#263449] cursor-pointer shadow-[0_3px_0_#0F172A]'
                    : 'bg-[#0F172A] border-slate-800/70 opacity-60 cursor-not-allowed',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-bold text-white font-mono-num">
                    Cấp {lv}
                  </span>
                  {!isUnlocked && !isPreviewMode ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                  ) : !isUnlocked && isPreviewMode ? (
                    <Eye className="w-4 h-4 text-[#FACC15]" />
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

                <div className="flex flex-col gap-1 text-xs text-slate-400">
                  <div className="flex items-center justify-between font-mono-num">
                    <span>Số cặp</span>
                    <span className="text-emerald-300 font-semibold">
                      {cfg.pairsCount} cặp ({cfg.cols}×{cfg.rows})
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono-num">
                    <span>Thời gian</span>
                    <span className="text-slate-100 font-semibold">
                      {formatDuration(cfg.timeLimitSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="shrink-0">Chuyển động</span>
                    <span className="text-yellow-300/90 truncate text-right">
                      {cfg.gravityLabel}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Discreet Creator Preview Mode Toggle Footer */}
        <footer className="mt-4 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            Quy tắc: Người chơi phải hoàn thành cấp hiện tại để mở khóa cấp kế tiếp.
          </span>
          <button
            type="button"
            onClick={onTogglePreviewMode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700 bg-[#1E293B] hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#FACC15]" />
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
    </div>
  );
};
