import React from 'react';
import {
  Cloud,
  CloudOff,
  Download,
  Grid3X3,
  HardDrive,
  Home,
  LogIn,
  LogOut,
  Music,
  RefreshCw,
  UserCircle2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CloudSyncStatus } from '../firebase';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { RememberedAccount } from '../utils/localAccountCache';

interface MobileBottomNavProps {
  activeTab: 'HOME' | 'LEVELS' | 'ACCOUNT';
  levelsLabel?: string;
  onGoHome: () => void;
  onGoLevels: () => void;
  onOpenAccountSheet: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  levelsLabel = '30 Ải',
  onGoHome,
  onGoLevels,
  onOpenAccountSheet,
}) => {
  return (
    <nav
      aria-label="Điều hướng di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-3 h-14 max-w-md mx-auto">
        <button
          type="button"
          onClick={onGoHome}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'HOME'
              ? 'text-[#FACC15]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Trang chủ</span>
        </button>

        <button
          type="button"
          onClick={onGoLevels}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'LEVELS'
              ? 'text-[#FACC15]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid3X3 className="w-5 h-5" />
          <span className="text-[11px] font-semibold whitespace-nowrap">{levelsLabel}</span>
        </button>

        <button
          type="button"
          onClick={onOpenAccountSheet}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'ACCOUNT'
              ? 'text-[#FACC15]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCircle2 className="w-5 h-5" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Tài khoản</span>
        </button>
      </div>
    </nav>
  );
};

interface MobileAccountSheetProps {
  open: boolean;
  onClose: () => void;
  account: RememberedAccount | null;
  hasLiveCloudAuth: boolean;
  authLoading: boolean;
  syncStatus: CloudSyncStatus;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  highestUnlockedLevel: number;
  maxLevel?: number;
  totalScore: number;
  onSignIn: (forceSelectAccount?: boolean) => void;
  onSignOut: () => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
}

export const MobileAccountSheet: React.FC<MobileAccountSheetProps> = ({
  open,
  onClose,
  account,
  hasLiveCloudAuth,
  authLoading,
  syncStatus,
  soundEnabled,
  bgmEnabled,
  highestUnlockedLevel,
  maxLevel = 30,
  totalScore,
  onSignIn,
  onSignOut,
  onToggleSound,
  onToggleBgm,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!open) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl bg-[#1E293B] border-t-2 border-[#DC2626] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 rounded-full bg-slate-600 mx-auto" />

        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-white">
            Hồ sơ & Cài đặt
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Card */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-700/80 p-4 flex flex-col gap-3">
          {account ? (
            <div className="flex items-center gap-3">
              {account.photoURL ? (
                <img
                  src={account.photoURL}
                  alt={account.displayName}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full border-2 border-[#FACC15] object-cover shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full border-2 border-[#FACC15] bg-slate-800 text-[#FACC15] font-bold flex items-center justify-center shrink-0">
                  {(account.displayName || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {account.displayName}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {account.email || 'Đã lưu trên thiết bị'}
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                  {hasLiveCloudAuth && syncStatus === 'synced' ? (
                    <>
                      <Cloud className="w-3.5 h-3.5" />
                      Đã đồng bộ đám mây & trên máy
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5 text-[#FACC15]" />
                      Đã nhớ trên máy
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                <CloudOff className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">Chế độ Khách</div>
                <div className="text-xs text-slate-400">
                  Tiến trình hiện chỉ lưu tạm trên trình duyệt máy này
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs font-mono-num">
            <div>
              <div className="text-slate-400 font-sans">Cấp đang mở</div>
              <div className="text-base font-bold text-[#FACC15]">
                {highestUnlockedLevel}/{maxLevel}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-sans">Tổng điểm</div>
              <div className="text-base font-bold text-white">
                {totalScore.toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Controls (≥44px touch targets) */}
        <div className="flex flex-col gap-2.5">
          {!account ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignIn(false);
              }}
              disabled={authLoading}
              className="w-full min-h-[48px] rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập Google để lưu lâu dài
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignIn(!hasLiveCloudAuth ? false : true);
                }}
                disabled={authLoading}
                className="min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#FACC15]" />
                {hasLiveCloudAuth ? 'Đổi tài khoản' : 'Đồng bộ Google'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="min-h-[46px] rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-100 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onToggleBgm}
              className="min-h-[46px] px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-between gap-1.5 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Music className={`w-4 h-4 ${bgmEnabled && soundEnabled ? 'text-[#FACC15]' : 'text-slate-400'}`} />
                Nhạc nền
              </span>
              <span className={bgmEnabled && soundEnabled ? 'text-[#FACC15]' : 'text-slate-400'}>
                {bgmEnabled && soundEnabled ? 'Bật' : 'Tắt'}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              className="min-h-[46px] px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-between gap-1.5 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                Âm thanh
              </span>
              <span className={soundEnabled ? 'text-emerald-400' : 'text-slate-400'}>
                {soundEnabled ? 'Bật' : 'Tắt'}
              </span>
            </button>
          </div>

          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={() => void install()}
              className="w-full min-h-[46px] px-4 rounded-xl bg-emerald-950/60 border border-emerald-700/70 text-emerald-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Cài về màn hình chính (Chơi Offline)
            </button>
          )}

          {!isInstalled && !isInstallable && isIOS && (
            <p className="text-xs text-slate-400 text-center px-2">
              Trên iPhone/iPad: Nhấn <strong className="text-slate-200">Chia sẻ</strong> →{' '}
              <strong className="text-slate-200">Thêm vào MH chính</strong> để chơi offline như ứng dụng.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
