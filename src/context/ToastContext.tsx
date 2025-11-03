import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ui/ToastContainer';
import { type ToastMessage, type ToastType } from '../components/ui/Toast';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    title?: string,
    duration?: number
  ) => {
    const newToast: ToastMessage = {
      id: generateId(),
      type,
      title,
      message,
      duration
    };

    setToasts(prev => [...prev, newToast]);
  }, [generateId]);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, 'success', title, duration);
  }, [showToast]);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, 'error', title, duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, 'warning', title, duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, 'info', title, duration);
  }, [showToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Helper function to parse error messages
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
};

export default ToastContext;