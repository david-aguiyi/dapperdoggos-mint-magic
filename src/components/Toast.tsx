import { useState, useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
  onClose?: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  duration: number;
}

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeClass = () => {
    switch (type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'warning': return 'toast-warning';
      case 'info': 
      default: return 'toast-info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': 
      default: return 'ℹ';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`toast ${getTypeClass()}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => setIsVisible(false)}>×</button>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }: { toasts: ToastItem[], removeToast: (id: number) => void }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message: string, duration?: number) => addToast(message, 'success', duration);
  const error = (message: string, duration?: number) => addToast(message, 'error', duration);
  const warning = (message: string, duration?: number) => addToast(message, 'warning', duration);
  const info = (message: string, duration?: number) => addToast(message, 'info', duration);

  return { toasts, addToast, removeToast, success, error, warning, info };
};

export default Toast;
