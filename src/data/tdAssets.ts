import tdCover from '../assets/images/td_game_cover_1795249307768.jpg';
import tdMapForest from '../assets/images/td_map_forest_1795249308988.jpg';
import tdMapDesert from '../assets/images/td_map_desert_1795252085520.jpg';
import tdMapVolcano from '../assets/images/td_map_volcano_1795249308021.jpg';
import tdMapIce from '../assets/images/td_map_ice_1795249307640.jpg';
import tdMapAbyss from '../assets/images/td_map_abyss_1795252087933.jpg';
import tdMapSky from '../assets/images/td_map_sky_1795252086372.jpg';
import { preloadTdAnimeSprites } from '../utils/tdAnimeSprites';

export const TD_COVER_URL = tdCover;
export const TD_MAP_FOREST_URL = tdMapForest;
export const TD_MAP_DESERT_URL = tdMapDesert;
export const TD_MAP_VOLCANO_URL = tdMapVolcano;
export const TD_MAP_ICE_URL = tdMapIce;
export const TD_MAP_ABYSS_URL = tdMapAbyss;
export const TD_MAP_SKY_URL = tdMapSky;

let preloadStarted = false;

/**
 * Eagerly fetches and decodes Tower Defense covers, terrain maps, and anime hero sprites
 * once at startup so assets stay cached for offline play.
 */
export function preloadAllGameAssets(): void {
  if (typeof window === 'undefined' || preloadStarted) return;
  preloadStarted = true;
  preloadTdAnimeSprites();

  const urls = [
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
    img.src = url;
  });
}
