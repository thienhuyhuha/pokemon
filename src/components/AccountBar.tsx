import React from 'react';
import { Cloud, CloudOff, HardDrive, Loader2, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { CloudSyncStatus } from '../firebase';
import { RememberedAccount } from '../utils/localAccountCache';

interface AccountBarProps {
  account: RememberedAccount | null;
  hasLiveCloudAuth: boolean;
  authReady: boolean;
  authLoading: boolean;
  syncStatus: CloudSyncStatus;
  onSignIn: (forceSelectAccount?: boolean) => void;
  onSignOut: () => void;
  compact?: boolean;
}

export const AccountBar: React.FC<AccountBarProps> = ({
  account,
  hasLiveCloudAuth,
  authReady,
  authLoading,
  syncStatus,
  onSignIn,
  onSignOut,
  compact = false,
}) => {
  if (!authReady && !account) {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-red-100/80 whitespace-nowrap shrink-0">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Đang kiểm tra tài khoản...</span>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center gap-2.5 shrink-0">
        {!compact && (
          <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-red-100/90 whitespace-nowrap">
            <CloudOff className="w-3.5 h-3.5" />
            Chế độ Khách (lưu trên máy)
          </span>
        )}
        <button
          type="button"
          onClick={() => onSignIn(false)}
          disabled={authLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-950/60 bg-[#0F172A]/85 hover:bg-[#0F172A] disabled:opacity-60 text-white font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {authLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FACC15]" />
          ) : (
            <LogIn className="w-3.5 h-3.5 text-[#FACC15]" />
          )}
          <span>{authLoading ? 'Đang đăng nhập...' : 'Đăng nhập Google'}</span>
        </button>
      </div>
    );
  }

  const displayName = account.displayName || account.email || 'Người chơi';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {account.photoURL ? (
          <img
            src={account.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full border border-[#FACC15]/80 object-cover shrink-0 bg-slate-900"
          />
        ) : (
          <div className="w-7 h-7 rounded-full border border-[#FACC15]/80 bg-[#0F172A] text-[#FACC15] text-xs font-bold flex items-center justify-center shrink-0">
            {initial}
          </div>
        )}
        <div className="hidden sm:flex flex-col text-left leading-tight max-w-[155px]">
          <span className="text-xs font-bold text-white truncate">{displayName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-red-100/90 whitespace-nowrap">
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#FACC15]" />
                Đang đồng bộ...
              </>
            ) : !hasLiveCloudAuth || syncStatus === 'remembered' ? (
              <>
                <HardDrive className="w-2.5 h-2.5 text-[#FACC15]" />
                Đã nhớ trên máy
              </>
            ) : syncStatus === 'error' ? (
              <>
                <HardDrive className="w-2.5 h-2.5 text-yellow-300" />
                Đã lưu trên máy
              </>
            ) : (
              <>
                <Cloud className="w-2.5 h-2.5 text-emerald-300" />
                Máy & Đám mây
              </>
            )}
          </span>
        </div>
      </div>

      {!hasLiveCloudAuth ? (
        <button
          type="button"
          onClick={() => onSignIn(false)}
          disabled={authLoading}
          title="Đồng bộ tiến trình lưu trên máy lên tài khoản Google"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-900 bg-[#991B1B] hover:bg-[#7F1D1D] text-[11px] font-semibold text-[#FACC15] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${authLoading ? 'animate-spin' : ''}`} />
          <span>Đồng bộ Google</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSignIn(true)}
          disabled={authLoading}
          title="Đổi tài khoản Google khác"
          className="hidden md:inline-flex items-center px-2.5 py-1.5 rounded-lg border border-red-900 bg-[#991B1B] hover:bg-[#7F1D1D] text-[11px] font-semibold text-red-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Đổi tài khoản
        </button>
      )}

      <button
        type="button"
        onClick={onSignOut}
        title="Đăng xuất tài khoản khỏi máy này"
        aria-label="Đăng xuất"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-950/60 bg-[#0F172A]/80 hover:bg-[#0F172A] text-xs font-semibold text-red-100 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Đăng xuất</span>
      </button>
    </div>
  );
};
