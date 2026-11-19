import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Đã xảy ra lỗi không xác định.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let friendlyHint = 'Vui lòng tải lại trang để tiếp tục chơi.';
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string };
        if (parsed?.error) {
          friendlyHint = `Lỗi đồng bộ dữ liệu: ${parsed.error}`;
        }
      } catch {
        // Plain error message
      }

      return (
        <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl bg-[#1E293B] border-2 border-[#DC2626] p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-[#FACC15]" />
            <h1 className="font-display text-xl font-bold text-white">
              Có sự cố kết nối tài khoản
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed break-words max-w-full">
              {friendlyHint}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Tải lại trò chơi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
