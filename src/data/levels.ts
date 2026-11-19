import { GravityMode, LevelConfig } from '../types/game';

export const MAX_LEVEL = 200;

/**
 * 20 tiers (every 10 levels: 1-10, 11-20, ..., 191-200)
 * Scaling cleanly from 100 pairs (20x10) at Level 1 up to 400 pairs (40x20) at Level 200.
 */
const GRID_TIERS: { cols: number; rows: number }[] = [
  { cols: 20, rows: 10 }, // Lv   1 -  10: 100 pairs (200 tiles)
  { cols: 22, rows: 10 }, // Lv  11 -  20: 110 pairs (220 tiles)
  { cols: 22, rows: 12 }, // Lv  21 -  30: 132 pairs (264 tiles)
  { cols: 24, rows: 12 }, // Lv  31 -  40: 144 pairs (288 tiles)
  { cols: 26, rows: 12 }, // Lv  41 -  50: 156 pairs (312 tiles)
  { cols: 28, rows: 12 }, // Lv  51 -  60: 168 pairs (336 tiles)
  { cols: 26, rows: 14 }, // Lv  61 -  70: 182 pairs (364 tiles)
  { cols: 28, rows: 14 }, // Lv  71 -  80: 196 pairs (392 tiles)
  { cols: 30, rows: 14 }, // Lv  81 -  90: 210 pairs (420 tiles)
  { cols: 32, rows: 14 }, // Lv  91 - 100: 224 pairs (448 tiles)
  { cols: 30, rows: 16 }, // Lv 101 - 110: 240 pairs (480 tiles)
  { cols: 32, rows: 16 }, // Lv 111 - 120: 256 pairs (512 tiles)
  { cols: 34, rows: 16 }, // Lv 121 - 130: 272 pairs (544 tiles)
  { cols: 32, rows: 18 }, // Lv 131 - 140: 288 pairs (576 tiles)
  { cols: 34, rows: 18 }, // Lv 141 - 150: 306 pairs (612 tiles)
  { cols: 36, rows: 18 }, // Lv 151 - 160: 324 pairs (648 tiles)
  { cols: 34, rows: 20 }, // Lv 161 - 170: 340 pairs (680 tiles)
  { cols: 36, rows: 20 }, // Lv 171 - 180: 360 pairs (720 tiles)
  { cols: 38, rows: 20 }, // Lv 181 - 190: 380 pairs (760 tiles)
  { cols: 40, rows: 20 }, // Lv 191 - 200: 400 pairs (800 tiles)
];

export const CHAPTER_NAMES = [
  'Thảo Nguyên Khởi Đầu',       // 1 - 20
  'Rừng Rậm Ngọc Bích',         // 21 - 40
  'Hồ Nước Pha Lê',             // 41 - 60
  'Thung Lũng Sấm Sét',         // 61 - 80
  'Đảo Lửa Rực Cháy',           // 81 - 100
  'Thành Cổ Hội Tụ',            // 101 - 120
  'Hẻm Núi Trọng Lực',          // 121 - 140
  'Đỉnh Núi Băng Giá',          // 141 - 160
  'Mê Cung Xoay Chiều',         // 161 - 180
  'Đấu Trường Liên Minh',       // 181 - 200
];

const GRAVITY_META: Record<GravityMode, { label: string; desc: string }> = {
  RANDOM_LOCAL: {
    label: 'Trượt ngẫu nhiên vào khoảng trống',
    desc: 'Khi phá 1 cặp tạo khoảng trống, các thẻ cùng hàng/cột tự động trượt ngẫu nhiên lấp chỗ trống.',
  },
  RANDOM_4: {
    label: 'Ngẫu nhiên 4 hướng',
    desc: 'Mỗi lần phá 1 cặp, bàn đấu chọn ngẫu nhiên 1 trong 4 hướng (Xuống / Lên / Trái / Phải) để dồn ô.',
  },
  RANDOM_8: {
    label: 'Ngẫu nhiên 8 hướng',
    desc: 'Mỗi lần phá 1 cặp, bàn đấu chọn ngẫu nhiên từ 8 kiểu trượt (4 hướng, ép tâm, tách biên) để lấp khoảng trống.',
  },
  DOWN: {
    label: 'Rơi xuống',
    desc: 'Sau mỗi cặp biến mất, các thẻ phía trên rơi xuống lấp khoảng trống.',
  },
  UP: {
    label: 'Đẩy lên',
    desc: 'Sau mỗi cặp biến mất, các thẻ phía dưới dồn lên lấp khoảng trống.',
  },
  LEFT: {
    label: 'Dạt trái',
    desc: 'Các thẻ còn lại tự động trượt sang trái theo từng hàng.',
  },
  RIGHT: {
    label: 'Dạt phải',
    desc: 'Các thẻ còn lại tự động trượt sang phải theo từng hàng.',
  },
  INWARD_H: {
    label: 'Ép ngang vào giữa',
    desc: 'Hai nửa bàn đấu dồn sát về trục giữa theo chiều ngang.',
  },
  OUTWARD_H: {
    label: 'Tách ngang hai bên',
    desc: 'Hai nửa bàn đấu dạt ra hai mép trái và phải.',
  },
  INWARD_V: {
    label: 'Ép dọc vào tâm',
    desc: 'Nửa trên rơi xuống và nửa dưới đẩy lên gặp nhau ở giữa.',
  },
  OUTWARD_V: {
    label: 'Tách dọc trên dưới',
    desc: 'Nửa trên đẩy lên mép trên và nửa dưới rơi xuống đáy.',
  },
  ALTERNATING: {
    label: 'Xoay chiều 4 hướng',
    desc: 'Hướng trượt thay đổi luân phiên Xuống → Trái → Lên → Phải sau mỗi cặp.',
  },
};

export function getTimeLimitSeconds(level: number): number {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, level));
  // Level 1: 600s (10 minutes) -> Level 200: 300s (5 minutes)
  return Math.round(600 - ((clamped - 1) / (MAX_LEVEL - 1)) * 300);
}

export function getLevelConfig(level: number): LevelConfig {
  const lv = Math.max(1, Math.min(MAX_LEVEL, level));
  const timeLimitSeconds = getTimeLimitSeconds(lv);

  const tierIdx = Math.min(GRID_TIERS.length - 1, Math.floor((lv - 1) / 10));
  const { cols, rows } = GRID_TIERS[tierIdx];
  const pairsCount = (cols * rows) / 2;

  // Smoothly scale distinct monster species from 18 (lv 1) up to 45 (lv 130+)
  const speciesCount = Math.min(45, Math.round(18 + ((lv - 1) / 130) * 27));

  let gravityMode: GravityMode = 'RANDOM_LOCAL';
  if (lv <= 20) gravityMode = 'RANDOM_LOCAL';
  else if (lv <= 50) gravityMode = 'RANDOM_4';
  else if (lv <= 65) gravityMode = 'INWARD_H';
  else if (lv <= 80) gravityMode = 'OUTWARD_H';
  else if (lv <= 95) gravityMode = 'INWARD_V';
  else if (lv <= 110) gravityMode = 'OUTWARD_V';
  else if (lv <= 140) gravityMode = 'RANDOM_8';
  else if (lv <= 165) gravityMode = 'ALTERNATING';
  else gravityMode = 'RANDOM_8';

  // Frost tiles appear from level 141 to 200 (gradually up to 48 frozen tiles on 800-tile boards)
  let frozenCount = 0;
  if (lv >= 141) {
    frozenCount = Math.min(48, 8 + Math.floor(((lv - 141) / 59) * 40));
  }

  const initialHints = lv <= 40 ? 5 : lv <= 120 ? 4 : 3;
  const initialShuffles = lv <= 40 ? 5 : lv <= 120 ? 4 : 3;

  const chapter = Math.ceil(lv / 20);
  const chapterName = CHAPTER_NAMES[chapter - 1] ?? CHAPTER_NAMES[0];
  const meta = GRAVITY_META[gravityMode];

  return {
    level: lv,
    rows,
    cols,
    timeLimitSeconds,
    pairsCount,
    speciesCount,
    gravityMode,
    gravityLabel: meta.label,
    gravityDescription:
      frozenCount > 0
        ? `${meta.desc} Kèm ${frozenCount} ô đóng băng — ghép cặp kề cạnh để làm tan băng.`
        : meta.desc,
    frozenCount,
    initialHints,
    initialShuffles,
    chapter,
    chapterName,
  };
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
