import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        title="Cài đặt game về máy để chơi offline bất cứ lúc nào"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900 bg-[#991B1B] hover:bg-[#7F1D1D] text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-[#FACC15]" />
        <span className="hidden md:inline">Cài chơi Offline</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Thêm vào màn hình chính để chơi offline trên iOS"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900 bg-[#991B1B] hover:bg-[#7F1D1D] text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#FACC15]" />
          <span className="hidden sm:inline">Cài Offline</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border-2 border-[#DC2626] p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-white">
                  Cài đặt chơi Offline trên iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Đóng"
                  className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Nhấn nút <strong className="text-white">Chia sẻ (Share)</strong> trên thanh
                  công cụ Safari.
                </li>
                <li>
                  Cuộn xuống và chọn <strong className="text-[#FACC15]">Thêm vào MH chính (Add to Home Screen)</strong>.
                </li>
                <li>
                  Mở biểu tượng <strong className="text-white">ChibiMon 200</strong> từ màn hình
                  chính để chơi mượt không cần mạng.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
