'use client';

import React, { useState, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import MatrixButton from '@/components/ui/matrix-button';

// Form Input Component
interface MatrixInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'cyber' | 'ghost';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
  success?: boolean;
}

const MatrixInput = forwardRef<HTMLInputElement, MatrixInputProps>(({
  label,
  error,
  hint,
  variant = 'default',
  iconLeft,
  iconRight,
  isLoading = false,
  success = false,
  className,
  disabled,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'cyber':
        return {
          base: 'border-matrix-cyber-blue/40 bg-black/30',
          focus: 'border-matrix-cyber-blue matrix-glow-blue',
          text: 'text-matrix-cyber-blue',
        };
      case 'ghost':
        return {
          base: 'border-transparent bg-matrix-bg-dark/20',
          focus: 'border-matrix-green/50 bg-matrix-bg-dark/40',
          text: 'text-matrix-green',
        };
      default:
        return {
          base: 'border-matrix-green/40 bg-black/20',
          focus: 'border-matrix-green matrix-glow-green',
          text: 'text-matrix-green',
        };
    }
  };

  const styles = getVariantStyles();

  // Get status styles
  const getStatusStyles = () => {
    if (error) {
      return 'border-red-400 text-red-400 matrix-glow-red';
    }
    if (success) {
      return 'border-matrix-green text-matrix-green matrix-glow-green';
    }
    if (isFocused) {
      return styles.focus;
    }
    return styles.base;
  };

  const inputVariants = {
    initial: { scale: 1 },
    focus: { 
      scale: 1.01,
      transition: { duration: 0.2 }
    },
    error: {
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <motion.label
          className={cn(
            'block text-sm font-medium matrix-font-mono mb-2',
            error ? 'text-red-400' : success ? 'text-matrix-green' : 'text-gray-300'
          )}
          animate={{
            color: isFocused ? (error ? '#ff6b6b' : success ? '#00ff41' : '#00d4ff') : undefined
          }}
        >
          {label}
        </motion.label>
      )}

      {/* Input Container */}
      <motion.div
        className="relative"
        variants={inputVariants}
        animate={error ? 'error' : isFocused ? 'focus' : 'initial'}
      >
        {/* Left Icon */}
        {iconLeft && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <motion.div
              className={cn(
                'text-gray-400',
                isFocused && !error && styles.text
              )}
              animate={{
                scale: isFocused ? 1.1 : 1,
                color: isFocused ? (error ? '#ff6b6b' : success ? '#00ff41' : '#00d4ff') : undefined
              }}
            >
              {iconLeft}
            </motion.div>
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'matrix-font-mono text-sm',
            'border-2 transition-all duration-300',
            'placeholder:text-gray-500',
            'focus:outline-none focus:ring-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            iconLeft && 'pl-10',
            iconRight && 'pr-10',
            getStatusStyles(),
            className
          )}
          disabled={disabled || isLoading}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Right Icon / Loading / Success */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 border-2 border-matrix-cyber-blue border-t-transparent rounded-full animate-spin"
              />
            ) : success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="text-matrix-green text-lg"
              >
                ✓
              </motion.div>
            ) : iconRight ? (
              <motion.div
                className={cn(
                  'text-gray-400',
                  isFocused && !error && styles.text
                )}
                animate={{
                  scale: isFocused ? 1.1 : 1
                }}
              >
                {iconRight}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Glow Effect */}
        {isFocused && !error && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `linear-gradient(90deg, transparent, ${
                success ? '#00ff41' : variant === 'cyber' ? '#00d4ff' : '#00ff41'
              }20, transparent)`,
              filter: 'blur(8px)',
            }}
          />
        )}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-red-400 text-sm matrix-font-mono"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ⚠
            </motion.span>
            <span className="matrix-glitch">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {hint && !error && (
        <motion.p
          className="mt-2 text-xs text-gray-500 matrix-font-mono"
          animate={{
            color: isFocused ? '#00d4ff' : '#6b7280'
          }}
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
});

MatrixInput.displayName = 'MatrixInput';

// Textarea Component
interface MatrixTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'cyber' | 'ghost';
  isLoading?: boolean;
  success?: boolean;
}

const MatrixTextarea = forwardRef<HTMLTextAreaElement, MatrixTextareaProps>(({
  label,
  error,
  hint,
  variant = 'default',
  isLoading = false,
  success = false,
  className,
  disabled,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Get variant styles (same as input)
  const getVariantStyles = () => {
    switch (variant) {
      case 'cyber':
        return {
          base: 'border-matrix-cyber-blue/40 bg-black/30',
          focus: 'border-matrix-cyber-blue matrix-glow-blue',
        };
      case 'ghost':
        return {
          base: 'border-transparent bg-matrix-bg-dark/20',
          focus: 'border-matrix-green/50 bg-matrix-bg-dark/40',
        };
      default:
        return {
          base: 'border-matrix-green/40 bg-black/20',
          focus: 'border-matrix-green matrix-glow-green',
        };
    }
  };

  const styles = getVariantStyles();

  const getStatusStyles = () => {
    if (error) {
      return 'border-red-400 text-red-400 matrix-glow-red';
    }
    if (success) {
      return 'border-matrix-green text-matrix-green matrix-glow-green';
    }
    if (isFocused) {
      return styles.focus;
    }
    return styles.base;
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className={cn(
          'block text-sm font-medium matrix-font-mono mb-2',
          error ? 'text-red-400' : success ? 'text-matrix-green' : 'text-gray-300'
        )}>
          {label}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-lg resize-none',
          'matrix-font-mono text-sm',
          'border-2 transition-all duration-300',
          'placeholder:text-gray-500',
          'focus:outline-none focus:ring-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-h-[120px]',
          getStatusStyles(),
          className
        )}
        disabled={disabled || isLoading}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-2 text-red-400 text-sm matrix-font-mono"
          >
            <span>⚠</span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {hint && !error && (
        <p className="mt-2 text-xs text-gray-500 matrix-font-mono">
          {hint}
        </p>
      )}
    </div>
  );
});

MatrixTextarea.displayName = 'MatrixTextarea';

// Form Component
interface MatrixFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

const MatrixForm = forwardRef<HTMLFormElement, MatrixFormProps>(({
  isLoading = false,
  children,
  className,
  ...props
}, ref) => {
  return (
    <motion.div
      className={cn(
        'relative',
        isLoading && 'pointer-events-none opacity-70'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {children}
      </form>
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg"
          >
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-matrix-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-matrix-cyber-blue matrix-font-mono text-sm">Processing...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

MatrixForm.displayName = 'MatrixForm';

// Form Field Group
interface MatrixFieldGroupProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  className?: string;
}

const MatrixFieldGroup: React.FC<MatrixFieldGroupProps> = ({
  children,
  label,
  description,
  className
}) => {
  return (
    <motion.div
      className={cn('space-y-4', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <div className="border-b border-matrix-cyber-blue/20 pb-2">
          <h3 className="text-lg font-medium text-matrix-cyber-blue matrix-font-mono">
            {label}
          </h3>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
};

// Form Actions
interface MatrixFormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const MatrixFormActions: React.FC<MatrixFormActionsProps> = ({
  children,
  align = 'right',
  className
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <motion.div
      className={cn(
        'flex gap-3 pt-6 border-t border-matrix-cyber-blue/20',
        alignClasses[align],
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

// Export all components
export {
  MatrixInput,
  MatrixTextarea,
  MatrixForm,
  MatrixFieldGroup,
  MatrixFormActions
};

export default MatrixForm; 