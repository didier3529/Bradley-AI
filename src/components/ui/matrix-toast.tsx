'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface MatrixToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  position: number;
}

const MatrixToastComponent: React.FC<MatrixToastProps> = ({ toast, onDismiss, position }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const duration = toast.duration || 5000;

  // Auto-dismiss functionality
  useEffect(() => {
    if (!toast.persistent && isVisible) {
      // Progress bar animation
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      // Auto-dismiss timer
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, toast.persistent, isVisible, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  // Get toast styling based on type
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-matrix-green',
          glow: 'matrix-glow-green',
          icon: '✓',
          iconColor: 'text-matrix-green',
          progressColor: 'bg-matrix-green',
        };
      case 'warning':
        return {
          border: 'border-yellow-400',
          glow: 'matrix-glow-amber',
          icon: '⚠',
          iconColor: 'text-yellow-400',
          progressColor: 'bg-yellow-400',
        };
      case 'error':
        return {
          border: 'border-red-400',
          glow: 'matrix-glow-red',
          icon: '✕',
          iconColor: 'text-red-400',
          progressColor: 'bg-red-400',
        };
      default: // info
        return {
          border: 'border-matrix-cyber-blue',
          glow: 'matrix-glow-blue',
          icon: 'ℹ',
          iconColor: 'text-matrix-cyber-blue',
          progressColor: 'bg-matrix-cyber-blue',
        };
    }
  };

  const styles = getToastStyles();

  const toastVariants = {
    hidden: {
      opacity: 0,
      x: 300,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      x: 300,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className={cn(
        'fixed right-4 w-80 max-w-[calc(100vw-2rem)]',
        'bg-matrix-bg-dark/95 backdrop-blur-lg',
        'border rounded-lg shadow-2xl',
        'matrix-font-mono overflow-hidden',
        styles.border,
        styles.glow
      )}
      style={{
        top: `${64 + position * 80}px`,
        zIndex: 1000 + position,
      }}
      variants={toastVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "exit"}
      exit="exit"
      layout
    >
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 matrix-grid-pattern pointer-events-none" />

      {/* Main Content */}
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            className={cn(
              'flex-shrink-0 w-6 h-6 flex items-center justify-center',
              'rounded-full border text-sm font-bold',
              styles.iconColor,
              styles.border
            )}
            animate={{
              boxShadow: [
                `0 0 5px currentColor`,
                `0 0 15px currentColor`,
                `0 0 5px currentColor`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {styles.icon}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className={cn(
                'font-bold text-sm mb-1',
                styles.iconColor
              )}>
                {toast.title}
              </h4>
            )}
            <p className="text-sm text-gray-300 leading-relaxed">
              {toast.message}
            </p>
            
            {/* Action Button */}
            {toast.action && (
              <motion.button
                className={cn(
                  'mt-2 px-3 py-1 text-xs border rounded',
                  'transition-all duration-200',
                  'hover:bg-current/10',
                  styles.border,
                  styles.iconColor
                )}
                onClick={toast.action.onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {toast.action.label}
              </motion.button>
            )}
          </div>

          {/* Close Button */}
          <motion.button
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            onClick={handleDismiss}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-sm">✕</span>
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      {!toast.persistent && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/50">
          <motion.div
            className={cn('h-full', styles.progressColor)}
            style={{ width: `${progress}%` }}
            animate={{
              boxShadow: [
                `0 0 5px currentColor`,
                `0 0 10px currentColor`,
                `0 0 5px currentColor`,
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* Corner Accents */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-current opacity-30" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-current opacity-30" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-current opacity-30" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-current opacity-30" />
    </motion.div>
  );
};

// Toast Container Component
interface MatrixToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const MatrixToastContainer: React.FC<MatrixToastContainerProps> = ({ 
  toasts, 
  onDismiss,
  position = 'top-right' 
}) => {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <MatrixToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            position={index}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

// Toast Manager Hook
export function useMatrixToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  // Convenience methods
  const toast = {
    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, type: 'info', message }),
    
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, type: 'success', message }),
    
    warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, type: 'warning', message }),
    
    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, type: 'error', message }),
  };

  return {
    toasts,
    addToast,
    dismissToast,
    dismissAll,
    toast,
  };
}

// Provider Component
interface MatrixToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ToastContext = React.createContext<ReturnType<typeof useMatrixToast> | null>(null);

export function MatrixToastProvider({ children, position }: MatrixToastProviderProps) {
  const toastManager = useMatrixToast();

  return (
    <ToastContext.Provider value={toastManager}>
      {children}
      <MatrixToastContainer
        toasts={toastManager.toasts}
        onDismiss={toastManager.dismissToast}
        position={position}
      />
    </ToastContext.Provider>
  );
}

// Hook to use toast context
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a MatrixToastProvider');
  }
  return context;
}

export default MatrixToastContainer; 