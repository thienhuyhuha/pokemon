import { useEffect, useState } from 'react';
import { isFullscreenActive } from '../utils/fullscreen';

export interface ViewportMode {
  width: number;
  height: number;
  isMobile: boolean;
  isTouchDevice: boolean;
  isPortrait: boolean;
  isFullscreen: boolean;
  needsLandscapeRotation: boolean;
  isCompactLandscape: boolean;
}

function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const touchPoints = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
  return coarse || touchPoints;
}

function readViewport(): ViewportMode {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 800,
      isMobile: false,
      isTouchDevice: false,
      isPortrait: false,
      isFullscreen: false,
      needsLandscapeRotation: false,
      isCompactLandscape: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTouchDevice = detectTouchDevice();
  const isMobile = width < 768 || (isTouchDevice && Math.min(width, height) < 640);
  const isPortrait = height > width;
  const isFullscreen = isFullscreenActive();

  // During gameplay on a touch/mobile device still held vertically,
  // rotate the battle stage 90deg so the board ALWAYS stays horizontal landscape.
  const needsLandscapeRotation = isMobile && isPortrait;

  // Logical dimensions once in landscape gameplay
  const landscapeWidth = needsLandscapeRotation ? height : width;
  const landscapeHeight = needsLandscapeRotation ? width : height;
  const isCompactLandscape =
    isTouchDevice || landscapeHeight < 600 || landscapeWidth < 960;

  return {
    width,
    height,
    isMobile,
    isTouchDevice,
    isPortrait,
    isFullscreen,
    needsLandscapeRotation,
    isCompactLandscape,
  };
}

export function useViewportMode(): ViewportMode {
  const [viewport, setViewport] = useState<ViewportMode>(() => readViewport());

  useEffect(() => {
    const update = () => setViewport(readViewport());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      document.removeEventListener('fullscreenchange', update);
      document.removeEventListener('webkitfullscreenchange', update);
    };
  }, []);

  return viewport;
}
