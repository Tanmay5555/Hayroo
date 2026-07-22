import { useEffect } from 'react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onRemoveToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemoveToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div className="pointer-events-auto flex items-center justify-between gap-3 bg-slate-900/95 text-white border border-slate-700/80 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up">
      <div className="flex items-center gap-3">
        {icons[toast.type] || icons.success}
        <span className="text-xs font-semibold text-gray-200">{toast.message}</span>
      </div>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
