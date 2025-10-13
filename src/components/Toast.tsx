import { useState, useEffect } from 'react';
import './Toast.css';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
  onClose?: () => void;
  action?: ToastAction;
}

interface ToastItem {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  duration: number;
  action?: ToastAction;
}

const Toast = ({ message, type = 'info', duration = 2000, onClose, action }: ToastProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose && onClose(), 250); // Wait for slideOut animation
  };

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

  return (
    <div className={`toast ${getTypeClass()} ${isClosing ? 'toast-closing' : ''}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      {action && (
        <button 
          className="toast-action" 
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
      <button className="toast-close" onClick={handleClose}>×</button>
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
          action={toast.action}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration = 2000, action?: ToastAction) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration, action }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message: string, duration?: number) => addToast(message, 'success', duration);
  const error = (message: string, duration?: number, action?: ToastAction) => addToast(message, 'error', duration, action);
  const warning = (message: string, duration?: number) => addToast(message, 'warning', duration);
  const info = (message: string, duration?: number) => addToast(message, 'info', duration);

  return { toasts, addToast, removeToast, success, error, warning, info };
};

export default Toast;
