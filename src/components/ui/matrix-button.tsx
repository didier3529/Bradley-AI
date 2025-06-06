'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { matrixDesignSystem } from '@/styles/design-tokens';

interface MatrixButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export default function MatrixButton({
  variant = 'primary',
  size = 'md',
  glow = false,
  className,
  children,
  ...props
}: MatrixButtonProps) {
  const baseClasses = [
    'matrix-button',
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-mono',
    'font-medium',
    'transition-all',
    'duration-300',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'transform',
    'active:scale-95',
  ];

  const variantClasses = {
    primary: [
      'bg-transparent',
      'border',
      'border-matrix-cyber-blue',
      'text-matrix-cyber-blue',
      'hover:bg-matrix-glass',
      'hover:shadow-cyber-glow',
      'hover:text-shadow-cyber-glow',
      'focus:ring-matrix-cyber-blue',
    ],
    secondary: [
      'bg-transparent',
      'border',
      'border-matrix-green',
      'text-matrix-green',
      'hover:bg-matrix-glass',
      'hover:shadow-matrix-glow',
      'hover:text-shadow-matrix-glow',
      'focus:ring-matrix-green',
    ],
    ghost: [
      'bg-transparent',
      'border-transparent',
      'text-matrix-green',
      'hover:bg-matrix-bg-dark',
      'hover:text-matrix-green-light',
      'focus:ring-matrix-green',
    ],
    danger: [
      'bg-transparent',
      'border',
      'border-red-500',
      'text-red-500',
      'hover:bg-red-500/10',
      'hover:shadow-red-glow',
      'focus:ring-red-500',
    ],
  };

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-xs', 'rounded-sm'],
    md: ['px-4', 'py-2', 'text-sm', 'rounded'],
    lg: ['px-6', 'py-3', 'text-base', 'rounded-md'],
  };

  const glowClasses = glow ? ['matrix-text-cyber-glow'] : [];

  const allClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    ...glowClasses,
  ];

  return (
    <button
      className={cn(allClasses, className)}
      style={{
        fontFamily: matrixDesignSystem.typography.fontFamily.mono,
      }}
      {...props}
    >
      {/* Background effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* Glow effect */}
      {glow && (
        <div className="absolute inset-0 rounded-inherit bg-current opacity-20 blur-sm transition-opacity duration-300" />
      )}
    </button>
  );
} 