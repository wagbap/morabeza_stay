// src/components/Common/Toast.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white bg-gray-900 border border-gray-800">
          {toast.type === 'success' && <CheckCircle size={20} className="text-green-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-400 shrink-0" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-400 shrink-0" />}
          <span className="text-sm font-medium tracking-wide">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

// 🔓 Fallback quando NÃO há ToastProvider — não rebenta, só loga
const fallbackToast = {
  showToast: (message, type = 'info') => {
    console.warn(`[Toast:${type}]`, message);
  },
};

export const useToast = () => {
  const context = useContext(ToastContext);
  // Em vez de lançar erro, devolve fallback seguro
  return context || fallbackToast;
};