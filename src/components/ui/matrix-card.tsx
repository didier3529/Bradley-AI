'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MatrixCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 
  'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onTransitionEnd'> {
  variant?: 'default' | 'glow' | 'cyber' | 'minimal' | 'glass' | 'data';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  animated?: boolean;
  scanline?: boolean;
  gridPattern?: boolean;
  children: React.ReactNode;
}

export default function MatrixCard({
  variant = 'default',
  size = 'md',
  glow = false,
  animated = true,
  scanline = false,
  gridPattern = false,
  className,
  children,
  ...props
}: MatrixCardProps) {
  const baseClasses = [
    'matrix-card',
    'relative',
    'overflow-hidden',
    'transition-all',
    'duration-300',
    'border-radius-matrix',
  ];

  const variantClasses = {
    default: [
      'bg-matrix-bg-dark/90',
      'border',
      'border-matrix-green-dark',
      'backdrop-blur-sm',
      'hover:border-matrix-green',
      'hover:shadow-matrix-glow',
    ],
    glow: [
      'bg-matrix-bg-dark/80',
      'border',
      'border-matrix-green',
      'backdrop-blur-md',
      'shadow-matrix-glow',
      'hover:shadow-[0_0_30px_rgba(0,255,65,0.3)]',
    ],
    cyber: [
      'bg-matrix-bg-dark/90',
      'border',
      'border-matrix-cyber-blue',
      'backdrop-blur-sm',
      'hover:border-matrix-blue-light',
      'hover:shadow-cyber-glow',
    ],
    minimal: [
      'bg-matrix-bg-dark/60',
      'border',
      'border-matrix-bg-medium',
      'backdrop-blur-sm',
      'hover:border-matrix-green-dark',
    ],
    glass: [
      'matrix-glass-strong',
      'border-matrix-cyber-blue/30',
      'hover:border-matrix-cyber-blue/50',
      'hover:shadow-cyber-glow',
    ],
    data: [
      'bg-black/80',
      'border',
      'border-matrix-cyber-blue/40',
      'backdrop-blur-lg',
      'hover:border-matrix-cyber-blue/60',
      'hover:bg-black/90',
    ],
  };

  const sizeClasses = {
    sm: ['p-3', 'text-sm'],
    md: ['p-4', 'text-base'],
    lg: ['p-6', 'text-base'],
    xl: ['p-8', 'text-lg'],
  };

  const glowClasses = glow ? ['animate-matrix-glow'] : [];

  const allClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    ...glowClasses,
  ];

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      y: -2,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const CardContent = () => (
    <>
      {/* Grid pattern overlay */}
      {gridPattern && (
        <div className="absolute inset-0 opacity-5 matrix-grid-pattern pointer-events-none" />
      )}
      
      {/* Scanline effect */}
      {scanline && (
        <div className="absolute inset-0 matrix-scanline pointer-events-none" />
      )}
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-matrix-cyber-blue/5 via-transparent to-matrix-green/5 pointer-events-none" />
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current opacity-30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current opacity-30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current opacity-30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current opacity-30" />
      
      {/* Glow effect overlay */}
      {glow && (
        <div className="absolute inset-0 rounded-inherit opacity-20 blur-sm transition-opacity duration-300 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-matrix-cyber-blue via-matrix-green to-matrix-cyber-blue" />
        </div>
      )}
    </>
  );

  if (animated) {
    return (
      <motion.div
        className={cn(allClasses, className)}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <CardContent />
      </motion.div>
    );
  }

  return (
    <div
      className={cn(allClasses, className)}
      {...props}
    >
      <CardContent />
    </div>
  );
}

// Specialized Matrix card components
export function MatrixDataCard({ children, ...props }: Omit<MatrixCardProps, 'variant'>) {
  return (
    <MatrixCard variant="data" gridPattern scanline {...props}>
      <div className="matrix-font-mono">
        {children}
      </div>
    </MatrixCard>
  );
}

export function MatrixGlassCard({ children, ...props }: Omit<MatrixCardProps, 'variant'>) {
  return (
    <MatrixCard variant="glass" glow animated {...props}>
      {children}
    </MatrixCard>
  );
}

export function MatrixCyberCard({ children, ...props }: Omit<MatrixCardProps, 'variant'>) {
  return (
    <MatrixCard variant="cyber" scanline {...props}>
      {children}
    </MatrixCard>
  );
} 