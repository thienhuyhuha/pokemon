type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape' | 'portrait' | 'any') => Promise<void>;
  unlock?: () => void;
};

export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as FullscreenDocument;
  return Boolean(
    doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
  );
}

export function canRequestFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement as FullscreenElement;
  const doc = document as FullscreenDocument;
  const supported = Boolean(
    el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen
  );
  if (!supported) return false;
  if (typeof doc.fullscreenEnabled === 'boolean') return doc.fullscreenEnabled;
  if (typeof doc.webkitFullscreenEnabled === 'boolean') return doc.webkitFullscreenEnabled;
  return true;
}

export async function enterGameFullscreenAndLandscape(): Promise<void> {
  if (typeof document === 'undefined') return;

  try {
    if (!isFullscreenActive()) {
      const el = document.documentElement as FullscreenElement;
      if (el.requestFullscreen) {
        try {
          await el.requestFullscreen({ navigationUI: 'hide' });
        } catch {
          await el.requestFullscreen();
        }
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
    }
  } catch {
    // Browser or iframe may block fullscreen on non-supported platforms (e.g. iOS Safari)
  }

  try {
    const orientation =
      typeof window !== 'undefined'
        ? (window.screen?.orientation as LockableOrientation | undefined)
        : undefined;
    if (orientation?.lock) {
      await orientation.lock('landscape');
    }
  } catch {
    // Orientation lock is optional; CSS landscape stage handles portrait devices gracefully
  }
}

export async function exitGameFullscreenAndUnlock(): Promise<void> {
  if (typeof document === 'undefined') return;

  try {
    const orientation =
      typeof window !== 'undefined'
        ? (window.screen?.orientation as LockableOrientation | undefined)
        : undefined;
    if (orientation?.unlock) {
      orientation.unlock();
    }
  } catch {
    // Ignore
  }

  try {
    if (isFullscreenActive()) {
      const doc = document as FullscreenDocument;
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    }
  } catch {
    // Ignore
  }
}
