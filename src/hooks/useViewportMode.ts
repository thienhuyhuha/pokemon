import { useEffect, useState } from 'react';

export interface ViewportMode {
  width: number;
  height: number;
  isMobile: boolean;
  isPortrait: boolean;
  isPortraitMobile: boolean;
}

function readViewport(): ViewportMode {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 800,
      isMobile: false,
      isPortrait: false,
      isPortraitMobile: false,
    };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < 768;
  const isPortrait = height > width;
  return {
    width,
    height,
    isMobile,
    isPortrait,
    isPortraitMobile: isMobile && isPortrait,
  };
}

export function useViewportMode(): ViewportMode {
  const [viewport, setViewport] = useState<ViewportMode>(() => readViewport());

  useEffect(() => {
    const update = () => setViewport(readViewport());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return viewport;
}
