'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import MatrixButton from '@/components/ui/matrix-button';

interface MatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'cyber' | 'glass' | 'dark';
  showCloseButton?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  showDigitalRain?: boolean;
  glitchEffect?: boolean;
}

const MatrixModal: React.FC<MatrixModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  showHeader = true,
  showFooter = false,
  footer,
  className,
  overlayClassName,
  contentClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  showDigitalRain = true,
  glitchEffect = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    },
    [onClose, closeOnOverlayClick]
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const focusableElement = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      focusableElement?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, handleEscapeKey]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen && preventScroll) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventScroll]);

  // Size variants
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-none m-4 h-[calc(100vh-2rem)]';
      default:
        return 'max-w-lg';
    }
  };

  // Variant styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'cyber':
        return 'bg-matrix-bg-dark/95 border-2 border-matrix-cyber-blue matrix-glow-blue';
      case 'glass':
        return 'bg-black/20 backdrop-blur-xl border border-matrix-cyber-blue/30';
      case 'dark':
        return 'bg-black/90 border border-gray-700';
      default:
        return 'bg-matrix-bg-dark/90 border border-matrix-green/50 matrix-glow-green';
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      rotateX: -15 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      rotateX: 15,
      transition: { duration: 0.2 }
    }
  };

  const glitchVariants = {
    normal: { 
      x: 0, 
      filter: 'none' 
    },
    glitch: { 
      x: [0, -2, 2, 0, -1, 1, 0],
      filter: [
        'none',
        'hue-rotate(90deg)',
        'hue-rotate(180deg)',
        'hue-rotate(270deg)',
        'none'
      ],
      transition: { 
        duration: 0.3,
        repeat: 2
      }
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            overlayClassName
          )}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleOverlayClick}
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Digital Rain Background */}
          {showDigitalRain && (
            <div className="absolute inset-0 matrix-rain-container opacity-20 pointer-events-none" />
          )}

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            className={cn(
              'relative w-full rounded-lg shadow-2xl',
              getSizeClasses(),
              getVariantClasses(),
              size === 'full' ? 'h-full' : 'max-h-[90vh]',
              className
            )}
            variants={glitchEffect ? glitchVariants : modalVariants}
            initial="hidden"
            animate={glitchEffect ? "glitch" : "visible"}
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-5 matrix-grid-pattern pointer-events-none rounded-lg" />
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 matrix-scanline pointer-events-none rounded-lg" />

            {/* Header */}
            {showHeader && (
              <div className="flex items-center justify-between p-6 border-b border-current/20">
                {title && (
                  <h2
                    id="modal-title"
                    className={cn(
                      'text-xl font-bold matrix-font-mono',
                      variant === 'cyber' ? 'text-matrix-cyber-blue matrix-text-cyber-glow' :
                      variant === 'glass' ? 'text-matrix-cyber-blue' :
                      'text-matrix-green matrix-text-glow'
                    )}
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <MatrixButton
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-auto hover:bg-red-500/20 hover:text-red-400"
                    aria-label="Close modal"
                  >
                    <motion.span
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                      className="text-lg"
                    >
                      ✕
                    </motion.span>
                  </MatrixButton>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn(
              'p-6 overflow-auto',
              size === 'full' ? 'flex-1' : 'max-h-[60vh]',
              contentClassName
            )}>
              {children}
            </div>

            {/* Footer */}
            {(showFooter || footer) && (
              <div className="p-6 border-t border-current/20">
                {footer || (
                  <div className="flex justify-end gap-3">
                    <MatrixButton variant="secondary" onClick={onClose}>
                      Cancel
                    </MatrixButton>
                    <MatrixButton variant="primary" onClick={onClose}>
                      OK
                    </MatrixButton>
                  </div>
                )}
              </div>
            )}

            {/* Corner Accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-current opacity-30" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-current opacity-30" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-current opacity-30" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-current opacity-30" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MatrixModal;

// Specialized Matrix Modal Variants
export function MatrixCyberModal(props: Omit<MatrixModalProps, 'variant'>) {
  return <MatrixModal {...props} variant="cyber" />;
}

export function MatrixGlassModal(props: Omit<MatrixModalProps, 'variant'>) {
  return <MatrixModal {...props} variant="glass" />;
}

export function MatrixConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "cyber",
  destructive = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'cyber' | 'glass' | 'dark';
  destructive?: boolean;
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <MatrixModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      glitchEffect={destructive}
      footer={
        <div className="flex justify-end gap-3">
          <MatrixButton variant="secondary" onClick={onClose}>
            {cancelText}
          </MatrixButton>
          <MatrixButton 
            variant={destructive ? "danger" : "primary"} 
            onClick={handleConfirm}
          >
            {confirmText}
          </MatrixButton>
        </div>
      }
    >
      <p className={cn(
        'matrix-font-mono',
        variant === 'cyber' ? 'text-matrix-cyber-blue' : 'text-matrix-green'
      )}>
        {message}
      </p>
    </MatrixModal>
  );
}

// Hook for modal state management
export function useMatrixModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(!isOpen);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
} 