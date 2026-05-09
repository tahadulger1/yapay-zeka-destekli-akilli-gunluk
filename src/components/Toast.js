"use client";
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { IconCheck, IconAlertCircle, IconInfo, IconX } from '@/components/Icons';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="assertive" aria-atomic="true">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} ${toast.exiting ? 'exiting' : ''}`} role="alert">
            <span className="toast-icon">
              {toast.type === 'success' && <IconCheck />}
              {(toast.type === 'error' || toast.type === 'warning') && <IconAlertCircle />}
              {toast.type === 'info' && <IconInfo />}
            </span>
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Kapat">
              <IconX width={16} height={16} />
            </button>
        </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
