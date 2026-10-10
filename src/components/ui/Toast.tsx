import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none select-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-orange-deep shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#FDFAF2] border border-[rgba(38,51,42,0.18)] rounded-xl shadow-[0_8px_24px_-4px_rgba(38,51,42,0.22)] text-ink text-sm transition-all animate-bounceIn"
          >
            <div className="flex items-center gap-2.5">
              {icons[toast.type || 'info']}
              <span className="font-semibold text-ink font-sans">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ink/40 hover:text-ink p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
