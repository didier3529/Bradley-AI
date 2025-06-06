'use client';

import React, { forwardRef, useId, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { matrixDesignSystem } from '@/styles/design-tokens';

interface MatrixInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'cyber' | 'matrix';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
}

interface MatrixSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'cyber' | 'matrix';
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

interface MatrixTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'cyber' | 'matrix';
  autoResize?: boolean;
}

interface MatrixCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  variant?: 'default' | 'cyber' | 'matrix';
}

interface MatrixRadioGroupProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'cyber' | 'matrix';
  orientation?: 'horizontal' | 'vertical';
}

// Enhanced Matrix Input with accessibility
export const MatrixInput = forwardRef<HTMLInputElement, MatrixInputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  startIcon,
  endIcon,
  loading = false,
  className = '',
  ...props
}, ref) => {
  const inputId = useId();
  const errorId = useId();
  const helperId = useId();
  const [isFocused, setIsFocused] = useState(false);

  const baseClasses = `
    w-full px-4 py-3 bg-black/50 border rounded-lg font-mono text-white 
    placeholder-gray-500 transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${startIcon ? 'pl-12' : ''}
    ${endIcon || loading ? 'pr-12' : ''}
  `;

  const variantClasses = {
    default: 'border-gray-600 focus:border-gray-400 focus:ring-gray-400',
    cyber: 'border-cyan-400/40 focus:border-cyan-400 focus:ring-cyan-400 focus:glow-cyan',
    matrix: 'border-green-400/40 focus:border-green-400 focus:ring-green-400 focus:glow-matrix'
  };

  const errorClasses = error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : '';

  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="block text-sm font-mono font-medium text-gray-300"
      >
        {label}
        {props.required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
          {...props}
        />
        
        {(endIcon || loading) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <div className="animate-spin w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full" />
            ) : (
              <span className="text-gray-400">{endIcon}</span>
            )}
          </div>
        )}
        
        {/* Focus indicator for screen readers */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute inset-0 border-2 rounded-lg pointer-events-none ${
                variant === 'cyber' ? 'border-cyan-400/30' : 
                variant === 'matrix' ? 'border-green-400/30' : 'border-gray-400/30'
              }`}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            id={errorId}
            className="text-sm text-red-400 font-mono"
            role="alert"
            aria-live="polite"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Helper text */}
      {helperText && !error && (
        <div id={helperId} className="text-sm text-gray-400 font-mono">
          {helperText}
        </div>
      )}
    </div>
  );
});

MatrixInput.displayName = 'MatrixInput';

// Enhanced Matrix Select with accessibility
export const MatrixSelect = forwardRef<HTMLSelectElement, MatrixSelectProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  options,
  className = '',
  ...props
}, ref) => {
  const selectId = useId();
  const errorId = useId();
  const helperId = useId();

  const baseClasses = `
    w-full px-4 py-3 bg-black/50 border rounded-lg font-mono text-white 
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    appearance-none cursor-pointer
  `;

  const variantClasses = {
    default: 'border-gray-600 focus:border-gray-400 focus:ring-gray-400',
    cyber: 'border-cyan-400/40 focus:border-cyan-400 focus:ring-cyan-400',
    matrix: 'border-green-400/40 focus:border-green-400 focus:ring-green-400'
  };

  const errorClasses = error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : '';

  return (
    <div className="space-y-2">
      <label 
        htmlFor={selectId}
        className="block text-sm font-mono font-medium text-gray-300"
      >
        {label}
        {props.required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="bg-black text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            id={errorId}
            className="text-sm text-red-400 font-mono"
            role="alert"
            aria-live="polite"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Helper text */}
      {helperText && !error && (
        <div id={helperId} className="text-sm text-gray-400 font-mono">
          {helperText}
        </div>
      )}
    </div>
  );
});

MatrixSelect.displayName = 'MatrixSelect';

// Enhanced Matrix Textarea with accessibility
export const MatrixTextarea = forwardRef<HTMLTextAreaElement, MatrixTextareaProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  autoResize = false,
  className = '',
  ...props
}, ref) => {
  const textareaId = useId();
  const errorId = useId();
  const helperId = useId();
  const [height, setHeight] = useState('auto');

  const baseClasses = `
    w-full px-4 py-3 bg-black/50 border rounded-lg font-mono text-white 
    placeholder-gray-500 transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed resize-none
  `;

  const variantClasses = {
    default: 'border-gray-600 focus:border-gray-400 focus:ring-gray-400',
    cyber: 'border-cyan-400/40 focus:border-cyan-400 focus:ring-cyan-400',
    matrix: 'border-green-400/40 focus:border-green-400 focus:ring-green-400'
  };

  const errorClasses = error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : '';

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
    props.onChange?.(e);
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={textareaId}
        className="block text-sm font-mono font-medium text-gray-300"
      >
        {label}
        {props.required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>
      
      <textarea
        ref={ref}
        id={textareaId}
        className={`${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`}
        style={autoResize ? { height } : undefined}
        onInput={handleInput}
        aria-invalid={!!error}
        aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
        {...props}
      />
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            id={errorId}
            className="text-sm text-red-400 font-mono"
            role="alert"
            aria-live="polite"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Helper text */}
      {helperText && !error && (
        <div id={helperId} className="text-sm text-gray-400 font-mono">
          {helperText}
        </div>
      )}
    </div>
  );
});

MatrixTextarea.displayName = 'MatrixTextarea';

// Enhanced Matrix Checkbox with accessibility
export const MatrixCheckbox = forwardRef<HTMLInputElement, MatrixCheckboxProps>(({
  label,
  description,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const checkboxId = useId();
  const descriptionId = useId();

  const variantClasses = {
    default: 'text-gray-400 focus:ring-gray-400',
    cyber: 'text-cyan-400 focus:ring-cyan-400',
    matrix: 'text-green-400 focus:ring-green-400'
  };

  return (
    <div className="flex items-start space-x-3">
      <input
        ref={ref}
        id={checkboxId}
        type="checkbox"
        className={`
          mt-1 w-4 h-4 bg-black/50 border border-gray-600 rounded 
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          checked:bg-current checked:border-current
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]} ${className}
        `}
        aria-describedby={description ? descriptionId : undefined}
        {...props}
      />
      
      <div className="flex-1">
        <label 
          htmlFor={checkboxId}
          className="block text-sm font-mono font-medium text-white cursor-pointer"
        >
          {label}
        </label>
        
        {description && (
          <div id={descriptionId} className="mt-1 text-sm text-gray-400 font-mono">
            {description}
          </div>
        )}
      </div>
    </div>
  );
});

MatrixCheckbox.displayName = 'MatrixCheckbox';

// Enhanced Matrix Radio Group with accessibility
export const MatrixRadioGroup: React.FC<MatrixRadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  variant = 'default',
  orientation = 'vertical'
}) => {
  const groupId = useId();

  const variantClasses = {
    default: 'text-gray-400 focus:ring-gray-400',
    cyber: 'text-cyan-400 focus:ring-cyan-400',
    matrix: 'text-green-400 focus:ring-green-400'
  };

  return (
    <fieldset className="space-y-4">
      <legend className="block text-sm font-mono font-medium text-gray-300">
        {label}
      </legend>
      
      <div className={`space-${orientation === 'horizontal' ? 'x' : 'y'}-3 ${
        orientation === 'horizontal' ? 'flex flex-wrap' : 'space-y-3'
      }`}>
        {options.map((option) => {
          const radioId = `${groupId}-${option.value}`;
          const descriptionId = `${radioId}-description`;
          
          return (
            <div key={option.value} className="flex items-start space-x-3">
              <input
                id={radioId}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className={`
                  mt-1 w-4 h-4 bg-black/50 border border-gray-600 rounded-full
                  focus:outline-none focus:ring-2 focus:ring-opacity-50
                  checked:bg-current checked:border-current
                  ${variantClasses[variant]}
                `}
                aria-describedby={option.description ? descriptionId : undefined}
              />
              
              <div className="flex-1">
                <label 
                  htmlFor={radioId}
                  className="block text-sm font-mono font-medium text-white cursor-pointer"
                >
                  {option.label}
                </label>
                
                {option.description && (
                  <div id={descriptionId} className="mt-1 text-sm text-gray-400 font-mono">
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

// Form validation hook
export const useMatrixForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: any, rules: any) => {
    const fieldErrors: string[] = [];

    if (rules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push('This field is required');
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      fieldErrors.push(`Minimum length is ${rules.minLength} characters`);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      fieldErrors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      fieldErrors.push(rules.patternMessage || 'Invalid format');
    }

    if (rules.custom && value) {
      const customError = rules.custom(value);
      if (customError) fieldErrors.push(customError);
    }

    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[0] || ''
    }));

    return fieldErrors.length === 0;
  };

  const clearErrors = () => setErrors({});
  
  const hasErrors = Object.values(errors).some(error => error !== '');

  return {
    errors,
    isSubmitting,
    setIsSubmitting,
    validateField,
    clearErrors,
    hasErrors
  };
}; 