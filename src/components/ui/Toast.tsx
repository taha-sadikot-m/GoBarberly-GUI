import React, { useEffect, useState } from 'react';
import styles from '../../styles/components/Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match CSS animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${
        isVisible && !isLeaving ? styles.visible : ''
      } ${isLeaving ? styles.leaving : ''}`}
    >
      <div className={styles.content}>
        <div className={styles.icon}>{getIcon()}</div>
        <div className={styles.text}>
          {toast.title && <div className={styles.title}>{toast.title}</div>}
          <div className={styles.message}>{toast.message}</div>
        </div>
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;