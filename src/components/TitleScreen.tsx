import React, { useState } from 'react';
import { Play, Grid3X3, Volume2, VolumeX, ShieldCheck, Clock, Layers } from 'lucide-react';
import { formatDuration, getLevelConfig, MAX_LEVEL } from '../data/levels';
import { getPokemonSpecies, PokemonArtwork } from '../data/pokemonSprites';
import { SaveData } from '../types/game';
import { PokeballIcon } from './PokeballIcon';

interface TitleScreenProps {
  saveData: SaveData;
  onStartCurrentLevel: () => void;
  onOpenLevelSelect: () => void;
  onToggleSound: () => void;
}

const WORLD_BANNER_URL = '/src/assets/images/pokemon_hero_world_1795064302567.jpg';

export const TitleScreen: React.FC<TitleScreenProps> = ({
  saveData,
  onStartCurrentLevel,
  onOpenLevelSelect,
  onToggleSound,
}) => {
  const [imgError, setImgError] = useState(false);
  const currentLevel = Math.min(MAX_LEVEL, saveData.highestUnlockedLevel);
  const currentConfig = getLevelConfig(currentLevel);
  const completedCount = Object.values(saveData.levels).filter((l) => l.completed).length;
  const totalStars = Object.values(saveData.levels).reduce((acc, l) => acc + l.stars, 0);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      {/* Pokédex Crimson Header */}
      <header className="w-full bg-[#DC2626] border-b-4 border-[#0F172A] shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 shrink-0">
            <PokeballIcon variant="poke" className="w-7 h-7 shrink-0" />
            <span className="font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
              ChibiMon 200
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-red-50">
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

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={saveData.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg border border-red-900 bg-[#B91C1C] text-red-50 hover:text-white hover:bg-[#991B1B] transition-colors cursor-pointer"
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 lg:py-10 flex flex-col gap-10">
        {/* Hero Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center gap-5">
            <p className="text-sm font-semibold text-[#FACC15]">
              Cấp 1 đến Cấp 200 · Từ 100 cặp đến 400 cặp
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
              Ghép cặp Thú Cưng qua 200 đấu trường tăng dần
            </h1>
            <p className="text-base text-slate-300 leading-relaxed max-w-xl">
              Nối hai thẻ thú cưng giống nhau qua tối đa 3 đoạn thẳng. Số lượng cặp tăng dần mỗi 10
              màn từ 100 cặp (cấp 1) lên 400 cặp (cấp 200), thời gian rút ngắn từ 10 phút xuống 5
              phút kèm hiệu ứng trượt ngẫu nhiên và bộ lọc chống kẹt.
            </p>

            {/* Primary CTA & Secondary Action */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onStartCurrentLevel}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_3px_0_#A16207]"
              >
                <Play className="w-4 h-4 fill-current" />
                Vào trận cấp {currentLevel}
              </button>
              <button
                type="button"
                onClick={onOpenLevelSelect}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-700 bg-[#1E293B] hover:bg-[#273549] text-slate-100 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Grid3X3 className="w-4 h-4 text-[#FACC15]" />
                Bản đồ cấp độ
              </button>
            </div>

            {/* Clean unboxed trainer stats */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-400 font-mono-num">
              <span>Đã mở: {saveData.highestUnlockedLevel}/200 cấp</span>
              <span aria-hidden="true">·</span>
              <span>Đã vượt: {completedCount}/200</span>
              <span aria-hidden="true">·</span>
              <span>Tổng sao: {totalStars}/600</span>
            </div>
          </div>

          {/* Right Arena & Original Creature Lineup */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-[#1E293B] min-h-[300px] flex flex-col justify-end shadow-2xl">
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
            <div className="relative z-10 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                {[1, 2, 3, 4, 15, 25].map((id) => {
                  const sp = getPokemonSpecies(id);
                  return (
                    <div
                      key={id}
                      style={{ borderColor: sp.borderTint }}
                      className="w-14 h-14 rounded-xl bg-white border-2 shadow-[0_4px_0_rgba(15,23,42,0.55)] p-1 flex items-center justify-center relative overflow-hidden"
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
                <p className="text-base font-bold text-white mt-0.5 font-mono-num">
                  Cấp {currentConfig.level} — {currentConfig.pairsCount} cặp ({currentConfig.cols}×
                  {currentConfig.rows}) · {formatDuration(currentConfig.timeLimitSeconds)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Column Feature Strip */}
        <section
          id="rules"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-800 pt-8"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#FACC15] font-semibold text-sm">
              <Layers className="w-4 h-4 shrink-0" />
              <span>Tăng cặp mỗi 10 màn (100 → 400 cặp)</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Màn 1–10 có 100 cặp (20×10), tăng đều cứ mỗi 10 màn cho đến màn 191–200 đạt 400 cặp
              (40×20) với 45 loài thú cưng nguyên tố riêng biệt.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#FACC15] font-semibold text-sm">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Thời gian rút ngắn 10:00 → 05:00</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Màn 1 cho phép 10 phút rộng rãi, giảm dần về đúng 5 phút tại cấp 200 kèm dịch chuyển
              ngẫu nhiên lấp khoảng trống sau mỗi cặp.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#FACC15] font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Mở khóa tuần tự & Chống kẹt tự động</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Người chơi phải vượt qua từng màn mới được chọn các màn sau. Bộ lọc chống kẹt tự
              điều chỉnh bàn đấu nếu không còn cặp hợp lệ.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
