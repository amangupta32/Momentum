import React from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toaster: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info size={16} className="text-[#1E3A2F]" />;
        let bgStyle = 'bg-white border-[#E8E4DA] text-[#1C221F]';

        if (toast.type === 'celebrate') {
          icon = <Sparkles size={16} className="text-amber-500 fill-amber-400" />;
          bgStyle = 'bg-[#FAF8F5] border-amber-300 shadow-md text-[#1C221F]';
        } else if (toast.type === 'success') {
          icon = <CheckCircle2 size={16} className="text-emerald-600" />;
          bgStyle = 'bg-white border-emerald-200 text-[#1C221F]';
        } else if (toast.type === 'warning') {
          icon = <AlertCircle size={16} className="text-amber-600" />;
          bgStyle = 'bg-white border-amber-200 text-[#1C221F]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg animate-scale-in text-xs font-medium ${bgStyle}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="shrink-0">{icon}</span>
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#8E9892] hover:text-[#1C221F] p-0.5 rounded transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
