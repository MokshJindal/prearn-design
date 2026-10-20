import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto gamma-glass-floating rounded-2xl p-3.5 border border-white/15 shadow-2xl flex items-start justify-between gap-3 text-xs text-white animate-slideUp"
        >
          <div className="flex items-start gap-2.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-neutral-100">{toast.title}</div>
              {toast.message && (
                <div className="text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                  {toast.message}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Undo2 className="w-3 h-3" />
                <span>{toast.action.label}</span>
              </button>
            )}
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
