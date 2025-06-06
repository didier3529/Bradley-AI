'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useMatrixEffects, useMatrixEffect } from './matrix-effects-manager';
import { matrixDesignSystem } from '@/styles/design-tokens';

// Transition configuration types
export interface MatrixTransitionProps {
  children: ReactNode;
  isVisible?: boolean;
  type?: 'fade' | 'glitch' | 'slide' | 'matrix-rain' | 'cyber-glow';
  duration?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export interface MatrixLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

export interface MatrixDataTransitionProps {
  data: any;
  children: (data: any) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  className?: string;
}

// Animation variants for different Matrix effects
const matrixVariants: Record<string, Variants> = {
  fade: {
    hidden: { 
      opacity: 0,
      filter: 'brightness(0.5) saturate(0.5)',
    },
    visible: { 
      opacity: 1,
      filter: 'brightness(1) saturate(1)',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }
    },
    exit: { 
      opacity: 0,
      filter: 'brightness(0.2) saturate(0.2)',
      transition: { duration: 0.2 }
    }
  },
  
  glitch: {
    hidden: { 
      opacity: 0,
      x: -10,
      filter: 'hue-rotate(0deg) brightness(1)',
    },
    visible: { 
      opacity: 1,
      x: 0,
      filter: [
        'hue-rotate(0deg) brightness(1)',
        'hue-rotate(90deg) brightness(1.2)',
        'hue-rotate(180deg) brightness(0.8)',
        'hue-rotate(0deg) brightness(1)',
      ],
      transition: {
        duration: 0.5,
        filter: {
          duration: 0.5,
          times: [0, 0.3, 0.6, 1],
          ease: "easeInOut",
        },
        x: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }
      }
    },
    exit: { 
      opacity: 0,
      x: 10,
      filter: 'hue-rotate(180deg) brightness(0.3)',
      transition: { duration: 0.3 }
    }
  },
  
  slide: {
    hidden: { 
      opacity: 0,
      y: 20,
      filter: 'blur(2px)',
    },
    visible: { 
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      filter: 'blur(2px)',
      transition: { duration: 0.3 }
    }
  },
  
  cyberGlow: {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      filter: 'drop-shadow(0 0 0px rgba(0, 212, 255, 0))',
    },
    visible: { 
      opacity: 1,
      scale: 1,
      filter: [
        'drop-shadow(0 0 0px rgba(0, 212, 255, 0))',
        'drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))',
        'drop-shadow(0 0 10px rgba(0, 212, 255, 0.4))',
      ],
      transition: {
        duration: 0.6,
        filter: {
          duration: 0.8,
          times: [0, 0.5, 1],
          ease: "easeInOut",
        },
        scale: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      filter: 'drop-shadow(0 0 0px rgba(0, 212, 255, 0))',
      transition: { duration: 0.3 }
    }
  }
};

// Matrix Transition Component
export function MatrixTransition({
  children,
  isVisible = true,
  type = 'fade',
  duration = 0.3,
  delay = 0,
  className = '',
  onComplete
}: MatrixTransitionProps) {
  const { currentTheme } = useMatrixEffects();
  const triggerGlitch = useMatrixEffect('glitch');
  
  const variants = matrixVariants[type] || matrixVariants.fade;
  
  // Modify duration in variants
  const customVariants = {
    ...variants,
    visible: {
      ...variants.visible,
      transition: {
        ...(variants.visible as any).transition,
        duration,
        delay,
      }
    }
  };
  
  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className={`matrix-transition ${className}`}
          variants={customVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onAnimationComplete={() => {
            if (type === 'glitch') {
              triggerGlitch({ intensity: 0.3, duration: 100 });
            }
            onComplete?.();
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Matrix Loading Component
export function MatrixLoading({
  isLoading,
  loadingText = "ACCESSING MATRIX...",
  className = '',
  showProgress = false,
  progress = 0
}: MatrixLoadingProps) {
  const [dots, setDots] = useState('');
  const [currentChar, setCurrentChar] = useState(0);
  const { currentTheme, dataState } = useMatrixEffects();
  
  // Animated loading dots
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading]);
  
  // Matrix-style character cycling
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentChar(prev => (prev + 1) % loadingText.length);
    }, 100);
    
    return () => clearInterval(interval);
  }, [isLoading, loadingText]);
  
  const themeColors = {
    'matrix-green': 'text-green-400',
    'cyber-blue': 'text-cyan-400',
    'mixed': 'text-cyan-400',
    'adaptive': dataState.errorState ? 'text-red-400' : 'text-cyan-400'
  };
  
  const glowColors = {
    'matrix-green': 'shadow-green-400/50',
    'cyber-blue': 'shadow-cyan-400/50',
    'mixed': 'shadow-cyan-400/50',
    'adaptive': dataState.errorState ? 'shadow-red-400/50' : 'shadow-cyan-400/50'
  };
  
  return (
    <MatrixTransition isVisible={isLoading} type="cyber-glow">
      <div className={`matrix-loading flex flex-col items-center justify-center p-8 ${className}`}>
        {/* Main loading text with character animation */}
        <div className={`text-lg font-mono ${themeColors[currentTheme]} text-center mb-4`}>
          <span className="inline-block">
            {loadingText.split('').map((char, index) => (
              <span 
                key={index}
                className={`inline-block transition-all duration-100 ${
                  index === currentChar ? `text-white drop-shadow-lg ${glowColors[currentTheme]}` : ''
                }`}
                style={{
                  textShadow: index === currentChar ? `0 0 10px ${currentTheme === 'matrix-green' ? '#00ff41' : '#00d4ff'}` : undefined
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
          <span className={`inline-block w-4 text-left ${themeColors[currentTheme]}`}>
            {dots}
          </span>
        </div>
        
        {/* Progress bar */}
        {showProgress && (
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
            <motion.div
              className={`h-full ${currentTheme === 'matrix-green' ? 'bg-green-400' : 'bg-cyan-400'} rounded-full`}
              style={{
                boxShadow: `0 0 10px ${currentTheme === 'matrix-green' ? '#00ff41' : '#00d4ff'}`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        )}
        
        {/* Matrix rain effect for loading */}
        <div className="matrix-loading-rain relative w-32 h-8 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-0.5 ${currentTheme === 'matrix-green' ? 'bg-green-400' : 'bg-cyan-400'} rounded-full`}
              style={{
                left: `${i * 12.5}%`,
                boxShadow: `0 0 4px ${currentTheme === 'matrix-green' ? '#00ff41' : '#00d4ff'}`
              }}
              animate={{
                height: [0, 32, 0],
                y: [0, 0, 32],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </MatrixTransition>
  );
}

// Matrix Data Transition Component
export function MatrixDataTransition({
  data,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className = ''
}: MatrixDataTransitionProps) {
  const { dataState } = useMatrixEffects();
  const [previousData, setPreviousData] = useState(data);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Detect data changes and trigger transitions
  useEffect(() => {
    if (data !== previousData && !dataState.isLoading) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setPreviousData(data);
        setIsTransitioning(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [data, previousData, dataState.isLoading]);
  
  // Loading state
  if (dataState.isLoading) {
    return (
      <div className={className}>
        {loadingComponent || <MatrixLoading isLoading={true} />}
      </div>
    );
  }
  
  // Error state
  if (dataState.errorState) {
    return (
      <MatrixTransition type="glitch" className={className}>
        {errorComponent || (
          <div className="matrix-error text-center p-8">
            <div className="text-red-400 text-xl font-mono mb-2">
              ERROR: CONNECTION LOST
            </div>
            <div className="text-red-300 text-sm font-mono">
              ATTEMPTING TO RECONNECT...
            </div>
          </div>
        )}
      </MatrixTransition>
    );
  }
  
  // Empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <MatrixTransition type="fade" className={className}>
        {emptyComponent || (
          <div className="matrix-empty text-center p-8">
            <div className="text-gray-400 text-lg font-mono">
              NO DATA AVAILABLE
            </div>
          </div>
        )}
      </MatrixTransition>
    );
  }
  
  // Data transition
  return (
    <div className={className}>
      <MatrixTransition 
        type={isTransitioning ? "glitch" : "fade"} 
        key={isTransitioning ? 'transitioning' : 'stable'}
      >
        {children(data)}
      </MatrixTransition>
    </div>
  );
}

// Matrix Card Transition Component
export function MatrixCard({
  children,
  className = '',
  hover = true,
  glow = true,
  interactive = true
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  interactive?: boolean;
}) {
  const { currentTheme } = useMatrixEffects();
  const triggerGlow = useMatrixEffect('glow');
  
  const baseClasses = "matrix-card relative overflow-hidden rounded-lg border backdrop-blur-sm";
  const themeClasses = {
    'matrix-green': 'bg-black/80 border-green-400/30 text-green-100',
    'cyber-blue': 'bg-black/80 border-cyan-400/30 text-cyan-100',
    'mixed': 'bg-black/80 border-blue-400/30 text-blue-100',
    'adaptive': 'bg-black/80 border-gray-400/30 text-gray-100'
  };
  
  const glowClasses = {
    'matrix-green': 'hover:shadow-green-400/20 hover:border-green-400/60',
    'cyber-blue': 'hover:shadow-cyan-400/20 hover:border-cyan-400/60',
    'mixed': 'hover:shadow-blue-400/20 hover:border-blue-400/60',
    'adaptive': 'hover:shadow-gray-400/20 hover:border-gray-400/60'
  };
  
  return (
    <motion.div
      className={`
        ${baseClasses}
        ${themeClasses[currentTheme]}
        ${hover && glow ? glowClasses[currentTheme] : ''}
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hover ? { 
        scale: 1.02,
        filter: glow ? "brightness(1.1) saturate(1.2)" : undefined,
      } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onHoverStart={() => {
        if (glow && interactive) {
          triggerGlow({ intensity: 0.5, duration: 200 });
        }
      }}
    >
      {/* Matrix grid overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(
            rgba(0, 212, 255, 0.1) 1px, 
            transparent 1px
          ), linear-gradient(
            90deg, 
            rgba(0, 212, 255, 0.1) 1px, 
            transparent 1px
          )`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Matrix Button with transition effects
export function MatrixButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const { currentTheme } = useMatrixEffects();
  const triggerPulse = useMatrixEffect('pulse');
  
  const baseClasses = "matrix-button relative overflow-hidden font-mono font-semibold rounded transition-all duration-200 border";
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: currentTheme === 'matrix-green' 
      ? 'bg-green-900/50 border-green-400 text-green-100 hover:bg-green-800/60 hover:shadow-green-400/30'
      : 'bg-cyan-900/50 border-cyan-400 text-cyan-100 hover:bg-cyan-800/60 hover:shadow-cyan-400/30',
    secondary: 'bg-gray-800/50 border-gray-400 text-gray-100 hover:bg-gray-700/60 hover:shadow-gray-400/30',
    danger: 'bg-red-900/50 border-red-400 text-red-100 hover:bg-red-800/60 hover:shadow-red-400/30'
  };
  
  const handleClick = () => {
    if (disabled || loading) return;
    triggerPulse({ intensity: 0.8, duration: 150 });
    onClick?.();
  };
  
  return (
    <motion.button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={!disabled && !loading ? { scale: 1.05 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.1, ease: "easeOut" }}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin`} />
        </div>
      )}
      
      {/* Button content */}
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </motion.button>
  );
}

export default MatrixTransition; 