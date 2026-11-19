import React from 'react';
import { ArrowRight, RotateCcw, Star, Grid3X3 } from 'lucide-react';
import { formatDuration, MAX_LEVEL } from '../data/levels';
import { PokeballIcon } from './PokeballIcon';

interface EndRoundModalProps {
  type: 'WIN' | 'LOSE';
  level: number;
  totalPairs: number;
  score: number;
  stars: number;
  timeRemaining: number;
  timeLimit: number;
  pairsMatched: number;
  isPreviewMode: boolean;
  onReplay: () => void;
  onNextLevel: () => void;
  onLevelSelect: () => void;
}

export const EndRoundModal: React.FC<EndRoundModalProps> = ({
  type,
  level,
  totalPairs,
  score,
  stars,
  timeRemaining,
  timeLimit,
  pairsMatched,
  isPreviewMode,
  onReplay,
  onNextLevel,
  onLevelSelect,
}) => {
  const isWin = type === 'WIN';
  const hasNext = level < MAX_LEVEL;

  return (
    <div className="fixed inset-0 z-50 bg-[#090D16]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md max-h-[94%] overflow-y-auto rounded-2xl bg-[#1E293B] border-2 border-[#DC2626] shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
        {/* Top Crimson Header Strip */}
        <div className="bg-[#B91C1C] px-5 py-2.5 sm:py-3 border-b-2 border-[#0F172A] flex items-center justify-center gap-2">
          <PokeballIcon variant={isWin ? 'master' : 'poke'} className="w-5 h-5" />
          <span className="font-display text-sm font-bold text-white tracking-wide">
            {isWin ? 'Chiến thắng đấu trường' : 'Hết thời gian thi đấu'}
          </span>
        </div>

        <div className="p-4 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4">
          {isWin ? (
            <>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-7 h-7 sm:w-9 sm:h-9 ${
                      s <= stars
                        ? 'text-[#FACC15] fill-[#FACC15] drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-400">
                  Hoàn thành {totalPairs}/{totalPairs} cặp thú cưng
                  {isPreviewMode ? ' (Chế độ xem trước)' : ''}
                </p>
                <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white mt-0.5">
                  {level === MAX_LEVEL
                    ? 'Nhà vô địch 200 Cấp!'
                    : `Vượt qua Cấp ${level}`}
                </h2>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-semibold text-rose-400">
                Đã ghép {pairsMatched}/{totalPairs} cặp
              </p>
              <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white mt-0.5">
                Hết giờ ở Cấp {level}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Còn {totalPairs - pairsMatched} cặp nữa là hoàn thành màn này. Hãy thử lại!
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="w-full rounded-xl bg-[#0F172A] border border-slate-700/80 p-3 sm:p-4 grid grid-cols-2 gap-3 text-left">
            <div>
              <div className="text-xs text-slate-400">Điểm màn này</div>
              <div className="font-mono-num text-base sm:text-lg font-bold text-[#FACC15] mt-0.5">
                {score.toLocaleString('vi-VN')}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">
                {isWin ? 'Thời gian dư' : 'Thời gian đã dùng'}
              </div>
              <div className="font-mono-num text-base sm:text-lg font-bold text-white mt-0.5">
                {isWin ? formatDuration(timeRemaining) : formatDuration(timeLimit)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-row items-center gap-2.5 sm:gap-3 pt-0.5">
            <button
              type="button"
              onClick={onReplay}
              className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-600 bg-[#334155] hover:bg-[#475569] text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi lại
            </button>

            {isWin && hasNext && (
              <button
                type="button"
                onClick={onNextLevel}
                className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors whitespace-nowrap cursor-pointer shadow-[0_2px_0_#A16207]"
              >
                Màn tiếp theo
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onLevelSelect}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            Quay về bản đồ 200 cấp
          </button>
        </div>
      </div>
    </div>
  );
};
