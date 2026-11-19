import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-40 inline-flex items-center gap-2 rounded-lg bg-[#0F172A]/95 border border-amber-500/70 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-lg pointer-events-none whitespace-nowrap">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Chế độ Offline — Tiến trình vẫn lưu trên máy</span>
    </div>
  );
};
