import React from 'react';
import { ArrowRight, Grid3X3, RotateCcw, Star, Trophy, XCircle } from 'lucide-react';
import { DIAMOND_MAX_LEVEL } from '../data/diamondLevels';

interface DiamondEndModalProps {
  type: 'WIN' | 'LOSE';
  level: number;
  score: number;
  targetScore: number;
  stars: number;
  movesLeft: number;
  isPreviewMode?: boolean;
  onReplay: () => void;
  onNextLevel: () => void;
  onLevelSelect: () => void;
}

export const DiamondEndModal: React.FC<DiamondEndModalProps> = ({
  type,
  level,
  score,
  targetScore,
  stars,
  movesLeft,
  isPreviewMode = false,
  onReplay,
  onNextLevel,
  onLevelSelect,
}) => {
  const isWin = type === 'WIN';
  const hasNext = level < DIAMOND_MAX_LEVEL;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1E293B] border-2 border-cyan-500/70 shadow-2xl p-6 flex flex-col gap-5 text-center">
        <div className="flex flex-col items-center gap-2">
          {isWin ? (
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h2 className="font-display text-2xl font-extrabold text-white">
            {isWin ? `Hoàn thành Màn ${level}!` : `Hết lượt ở Màn ${level}`}
          </h2>

          {isWin && (
            <div className="flex items-center justify-center gap-2 my-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-7 h-7 transition-transform ${
                    s <= stars
                      ? 'text-[#FACC15] fill-[#FACC15] drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
          )}

          {isPreviewMode && (
            <p className="text-xs text-cyan-300">
              Đang chạy chế độ Xem trước — Tiến trình mở khóa không thay đổi.
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#0F172A] border border-slate-800 p-3.5 text-xs">
          <div>
            <div className="text-slate-400">Điểm đạt</div>
            <div className="font-mono-num text-base font-extrabold text-[#FACC15] mt-0.5">
              {score.toLocaleString('vi-VN')}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Mục tiêu</div>
            <div className="font-mono-num text-base font-bold text-cyan-300 mt-0.5">
              {targetScore.toLocaleString('vi-VN')}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Lượt còn</div>
            <div className="font-mono-num text-base font-bold text-emerald-300 mt-0.5">
              {movesLeft}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {isWin && hasNext && (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full min-h-[46px] rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_3px_0_#0E7490]"
            >
              Màn tiếp theo (Màn {level + 1})
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onReplay}
              className="min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi lại
            </button>
            <button
              type="button"
              onClick={onLevelSelect}
              className="min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Grid3X3 className="w-4 h-4 text-cyan-300" />
              100 Màn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
