import React, { useEffect, useState } from 'react';
import sheet1 from '../assets/images/mon_sheet_set1_1795064518876.jpg';
import sheet2 from '../assets/images/mon_sheet_set2_1795064519532.jpg';
import sheet3 from '../assets/images/mon_sheet_set3_1795064519821.jpg';
import sheet4 from '../assets/images/mon_sheet_set4_1795064519615.jpg';
import sheet5 from '../assets/images/mon_sheet_set5_1795064519959.jpg';
import stadiumTurf from '../assets/images/mon_stadium_turf_1795064520201.jpg';
import heroWorldBanner from '../assets/images/pokemon_hero_world_1795064302567.jpg';
import chibimonCover from '../assets/images/chibimon_game_cover_1795248690410.jpg';
import diamondCover from '../assets/images/diamond_game_cover_1795248689446.jpg';
import diamondArenaBg from '../assets/images/diamond_arena_bg_1795248689449.jpg';
import tdCover from '../assets/images/td_game_cover_1795249307768.jpg';
import tdMapForest from '../assets/images/td_map_forest_1795249308988.jpg';
import tdMapDesert from '../assets/images/td_map_desert_1795252085520.jpg';
import tdMapVolcano from '../assets/images/td_map_volcano_1795249308021.jpg';
import tdMapIce from '../assets/images/td_map_ice_1795249307640.jpg';
import tdMapAbyss from '../assets/images/td_map_abyss_1795252087933.jpg';
import tdMapSky from '../assets/images/td_map_sky_1795252086372.jpg';
import { preloadTdAnimeSprites } from '../utils/tdAnimeSprites';

export interface PokemonSpecies {
  id: number;
  sheetIndex: number;
  row: number;
  col: number;
  name: string;
  type: string;
  bgTint: string;
  borderTint: string;
}

export const SPRITE_SHEETS = [sheet1, sheet2, sheet3, sheet4, sheet5];
export const STADIUM_TURF_URL = stadiumTurf;
export const HERO_WORLD_URL = heroWorldBanner;
export const CHIBIMON_COVER_URL = chibimonCover;
export const DIAMOND_COVER_URL = diamondCover;
export const DIAMOND_ARENA_BG_URL = diamondArenaBg;
export const TD_COVER_URL = tdCover;
export const TD_MAP_FOREST_URL = tdMapForest;
export const TD_MAP_DESERT_URL = tdMapDesert;
export const TD_MAP_VOLCANO_URL = tdMapVolcano;
export const TD_MAP_ICE_URL = tdMapIce;
export const TD_MAP_ABYSS_URL = tdMapAbyss;
export const TD_MAP_SKY_URL = tdMapSky;

const sheetLoadedSet = new Set<string>();
const sheetFailedSet = new Set<string>();
const sheetListeners = new Set<() => void>();
let preloadStarted = false;

function notifySheetListeners() {
  sheetListeners.forEach((fn) => fn());
}

/**
 * Eagerly fetches and decodes all 5 sprite sheets + cover/arena backgrounds once at startup
 * so every asset stays cached in browser & Service Worker for true offline play.
 */
export function preloadAllGameAssets(): void {
  if (typeof window === 'undefined' || preloadStarted) return;
  preloadStarted = true;
  preloadTdAnimeSprites();

  const urls = [
    ...SPRITE_SHEETS,
    STADIUM_TURF_URL,
    HERO_WORLD_URL,
    CHIBIMON_COVER_URL,
    DIAMOND_COVER_URL,
    DIAMOND_ARENA_BG_URL,
    TD_COVER_URL,
    TD_MAP_FOREST_URL,
    TD_MAP_DESERT_URL,
    TD_MAP_VOLCANO_URL,
    TD_MAP_ICE_URL,
    TD_MAP_ABYSS_URL,
    TD_MAP_SKY_URL,
  ];
  urls.forEach((url) => {
    const img = new Image();
    img.onload = () => {
      sheetLoadedSet.add(url);
      sheetFailedSet.delete(url);
      notifySheetListeners();
    };
    img.onerror = () => {
      sheetFailedSet.add(url);
      notifySheetListeners();
    };
    img.src = url;
  });
}

export const POKEMON_SPECIES: PokemonSpecies[] = [
  // Sheet 1
  { id: 1, sheetIndex: 0, row: 0, col: 0, name: 'Sóc Sấm', type: 'Điện', bgTint: '#FEF9C3', borderTint: '#EAB308' },
  { id: 2, sheetIndex: 0, row: 0, col: 1, name: 'Hỏa Long Con', type: 'Lửa', bgTint: '#FFEDD5', borderTint: '#EA580C' },
  { id: 3, sheetIndex: 0, row: 0, col: 2, name: 'Ếch Hoa Hồng', type: 'Cỏ', bgTint: '#DCFCE7', borderTint: '#16A34A' },
  { id: 4, sheetIndex: 0, row: 1, col: 0, name: 'Rùa Đại Bác', type: 'Nước', bgTint: '#DBEAFE', borderTint: '#2563EB' },
  { id: 5, sheetIndex: 0, row: 1, col: 1, name: 'Mèo Tiên Bướm', type: 'Tiên', bgTint: '#FCE7F3', borderTint: '#EC4899' },
  { id: 6, sheetIndex: 0, row: 1, col: 2, name: 'Cáo Sao Bông', type: 'Thường', bgTint: '#FEF3C7', borderTint: '#B45309' },
  { id: 7, sheetIndex: 0, row: 2, col: 0, name: 'Quỷ Tím Gai', type: 'Ma', bgTint: '#F3E8FF', borderTint: '#7E22CE' },
  { id: 8, sheetIndex: 0, row: 2, col: 1, name: 'Vịt Mỏ Cam', type: 'Nước', bgTint: '#FEF08A', borderTint: '#CA8A04' },
  { id: 9, sheetIndex: 0, row: 2, col: 2, name: 'Cá Vương Đỏ', type: 'Nước', bgTint: '#FEE2E2', borderTint: '#DC2626' },

  // Sheet 2
  { id: 10, sheetIndex: 1, row: 0, col: 0, name: 'Cầu Từ Tính', type: 'Thép', bgTint: '#F1F5F9', borderTint: '#475569' },
  { id: 11, sheetIndex: 1, row: 0, col: 1, name: 'Bọ Lưỡi Liềm', type: 'Côn trùng', bgTint: '#DCFCE7', borderTint: '#15803D' },
  { id: 12, sheetIndex: 1, row: 0, col: 2, name: 'Rắn Hổ Tím', type: 'Độc', bgTint: '#F3E8FF', borderTint: '#9333EA' },
  { id: 13, sheetIndex: 1, row: 1, col: 0, name: 'Thủy Long Xanh', type: 'Rồng', bgTint: '#E0F2FE', borderTint: '#0369A1' },
  { id: 14, sheetIndex: 1, row: 1, col: 1, name: 'Khủng Long Sọ', type: 'Đất', bgTint: '#F5EFE6', borderTint: '#92400E' },
  { id: 15, sheetIndex: 1, row: 1, col: 2, name: 'Sao Pha Lê', type: 'Tâm linh', bgTint: '#E0E7FF', borderTint: '#6366F1' },
  { id: 16, sheetIndex: 1, row: 2, col: 0, name: 'Bướm Bạch Tuyết', type: 'Côn trùng', bgTint: '#E0E7FF', borderTint: '#4F46E5' },
  { id: 17, sheetIndex: 1, row: 2, col: 1, name: 'Long Cổ Băng', type: 'Băng', bgTint: '#CFFAFE', borderTint: '#0891B2' },
  { id: 18, sheetIndex: 1, row: 2, col: 2, name: 'Hạc Giấy Đa Giác', type: 'Thường', bgTint: '#FFE4E6', borderTint: '#06B6D4' },

  // Sheet 3
  { id: 19, sheetIndex: 2, row: 0, col: 0, name: 'Phượng Hoàng Lửa', type: 'Lửa', bgTint: '#FEE2E2', borderTint: '#DC2626' },
  { id: 20, sheetIndex: 2, row: 0, col: 1, name: 'Băng Điểu', type: 'Băng', bgTint: '#CFFAFE', borderTint: '#0284C7' },
  { id: 21, sheetIndex: 2, row: 0, col: 2, name: 'Lôi Điểu', type: 'Điện', bgTint: '#FEF08A', borderTint: '#CA8A04' },
  { id: 22, sheetIndex: 2, row: 1, col: 0, name: 'Mộc Thần Thụ', type: 'Cỏ', bgTint: '#ECFCCB', borderTint: '#65A30D' },
  { id: 23, sheetIndex: 2, row: 1, col: 1, name: 'Kỳ Nhông Nước', type: 'Nước', bgTint: '#E0F2FE', borderTint: '#3B82F6' },
  { id: 24, sheetIndex: 2, row: 1, col: 2, name: 'Hắc Lang Vòng Vàng', type: 'Bóng tối', bgTint: '#E2E8F0', borderTint: '#1E293B' },
  { id: 25, sheetIndex: 2, row: 2, col: 0, name: 'Ngọc Long Lục', type: 'Rồng', bgTint: '#DCFCE7', borderTint: '#15803D' },
  { id: 26, sheetIndex: 2, row: 2, col: 1, name: 'Ếch Nhẫn Giả', type: 'Nước', bgTint: '#DBEAFE', borderTint: '#1E40AF' },
  { id: 27, sheetIndex: 2, row: 2, col: 2, name: 'Cáo Ruy Băng', type: 'Tiên', bgTint: '#FCE7F3', borderTint: '#F472B6' },

  // Sheet 4
  { id: 28, sheetIndex: 3, row: 0, col: 0, name: 'Gấu Đá Ngủ Say', type: 'Đá', bgTint: '#CCFBF1', borderTint: '#0F766E' },
  { id: 29, sheetIndex: 3, row: 0, col: 1, name: 'Bóng Ma Tay Rời', type: 'Ma', bgTint: '#EDE9FE', borderTint: '#6D28D9' },
  { id: 30, sheetIndex: 3, row: 0, col: 2, name: 'Sói Võ Sĩ', type: 'Giác đấu', bgTint: '#E0E7FF', borderTint: '#1D4ED8' },
  { id: 31, sheetIndex: 3, row: 1, col: 0, name: 'Mầm Lê Xanh', type: 'Cỏ', bgTint: '#ECFCCB', borderTint: '#4D7C0F' },
  { id: 32, sheetIndex: 3, row: 1, col: 1, name: 'Nhím Gai Lửa', type: 'Lửa', bgTint: '#FFEDD5', borderTint: '#EA580C' },
  { id: 33, sheetIndex: 3, row: 1, col: 2, name: 'Cá Sấu Biển', type: 'Nước', bgTint: '#CCFBF1', borderTint: '#0D9488' },
  { id: 34, sheetIndex: 3, row: 2, col: 0, name: 'Cánh Cụt Hoàng Gia', type: 'Nước', bgTint: '#DBEAFE', borderTint: '#1D4ED8' },
  { id: 35, sheetIndex: 3, row: 2, col: 1, name: 'Hải Ly Răng Thỏ', type: 'Thường', bgTint: '#FEF3C7', borderTint: '#92400E' },
  { id: 36, sheetIndex: 3, row: 2, col: 2, name: 'Cú Rừng Xanh', type: 'Cỏ', bgTint: '#DCFCE7', borderTint: '#16A34A' },

  // Sheet 5
  { id: 37, sheetIndex: 4, row: 0, col: 0, name: 'Sư Tử Vằn Lửa', type: 'Lửa', bgTint: '#FFEDD5', borderTint: '#C2410C' },
  { id: 38, sheetIndex: 4, row: 0, col: 1, name: 'Tiên Nữ Tâm Linh', type: 'Tâm linh', bgTint: '#DCFCE7', borderTint: '#10B981' },
  { id: 39, sheetIndex: 4, row: 0, col: 2, name: 'Báo Điện Sao', type: 'Điện', bgTint: '#DBEAFE', borderTint: '#1E3A8A' },
  { id: 40, sheetIndex: 4, row: 1, col: 0, name: 'Vỏ Sò Gai Tím', type: 'Băng', bgTint: '#EDE9FE', borderTint: '#7C3AED' },
  { id: 41, sheetIndex: 4, row: 1, col: 1, name: 'Ốc Cổ Đại', type: 'Đá', bgTint: '#F5EFE6', borderTint: '#A16207' },
  { id: 42, sheetIndex: 4, row: 1, col: 2, name: 'Rồng Cam Cánh Rộng', type: 'Rồng', bgTint: '#FFEDD5', borderTint: '#D97706' },
  { id: 43, sheetIndex: 4, row: 2, col: 0, name: 'Thạch Tím Mỉm Cười', type: 'Thường', bgTint: '#FAE8FF', borderTint: '#A21CAF' },
  { id: 44, sheetIndex: 4, row: 2, col: 1, name: 'Cáo Pháp Sư', type: 'Tâm linh', bgTint: '#FEF9C3', borderTint: '#7E22CE' },
  { id: 45, sheetIndex: 4, row: 2, col: 2, name: 'Cá Mập Búa Xanh', type: 'Rồng', bgTint: '#DBEAFE', borderTint: '#1E40AF' },
];

export function getPokemonSpecies(speciesId: number): PokemonSpecies {
  return POKEMON_SPECIES[(speciesId - 1) % POKEMON_SPECIES.length] ?? POKEMON_SPECIES[0];
}

/**
 * Renders one of the 45 original ~70% Pokémon-inspired cel-shaded anime creatures
 * cropped cleanly from Vite-bundled sprite sheets, with a crisp SVG fallback emblem
 * so tiles are NEVER blank white even if an image hasn't finished caching offline.
 */
export const PokemonArtwork: React.FC<{ speciesId: number; className?: string }> = React.memo(
  ({ speciesId, className = 'w-full h-full' }) => {
    const species = getPokemonSpecies(speciesId);
    const sheetUrl = SPRITE_SHEETS[species.sheetIndex];
    const [failed, setFailed] = useState<boolean>(() => sheetFailedSet.has(sheetUrl));

    useEffect(() => {
      preloadAllGameAssets();
      const sync = () => setFailed(sheetFailedSet.has(sheetUrl));
      sync();
      sheetListeners.add(sync);
      return () => {
        sheetListeners.delete(sync);
      };
    }, [sheetUrl]);

    if (failed) {
      return (
        <div
          role="img"
          aria-label={species.name}
          style={{ backgroundColor: species.bgTint }}
          className={`${className} aspect-square rounded flex flex-col items-center justify-center select-none pointer-events-none`}
        >
          <svg viewBox="0 0 40 40" className="w-[72%] h-[72%]">
            <circle cx="20" cy="20" r="16" fill={species.borderTint} opacity="0.22" />
            <circle cx="20" cy="20" r="11" fill={species.borderTint} />
            <circle cx="16" cy="18" r="2" fill="#FFFFFF" />
            <circle cx="24" cy="18" r="2" fill="#FFFFFF" />
            <text
              x="20"
              y="29"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="9"
              fontWeight="800"
            >
              {species.id}
            </text>
          </svg>
        </div>
      );
    }

    return (
      <div
        role="img"
        aria-label={species.name}
        style={{
          backgroundImage: `url("${sheetUrl}")`,
          backgroundSize: '300% 300%',
          backgroundPosition: `${species.col * 50}% ${species.row * 50}%`,
          backgroundRepeat: 'no-repeat',
        }}
        className={`${className} aspect-square mix-blend-multiply select-none pointer-events-none`}
      />
    );
  }
);

PokemonArtwork.displayName = 'PokemonArtwork';
