import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const iconMap: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
};

const styleMap: Record<ToastType, string> = {
  success: 'bg-success-container text-on-success-container border-success/30',
  error: 'bg-error-container text-on-error-container border-error/30',
  info: 'bg-primary-container text-on-primary-container border-primary/30',
  warning: 'bg-warning-container text-on-warning-container border-warning/30',
};

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border
              animate-slideUp min-w-[300px] max-w-[420px]
              ${styleMap[t.type]}
            `.trim()}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">{iconMap[t.type]}</span>
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
