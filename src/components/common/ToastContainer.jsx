import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-slate-900 text-white border-slate-700';
        let IconComponent = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bgColor = 'bg-slate-900 text-white border-emerald-500/40';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'danger' || toast.type === 'error') {
          bgColor = 'bg-slate-900 text-white border-red-500/40';
          IconComponent = AlertCircle;
          iconColor = 'text-red-400';
        } else if (toast.type === 'warning') {
          bgColor = 'bg-slate-900 text-white border-amber-500/40';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${bgColor}`}
          >
            <div className="flex items-center gap-2.5">
              <IconComponent className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

