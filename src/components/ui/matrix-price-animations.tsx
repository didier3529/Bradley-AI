'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { matrixColors } from '@/styles/design-tokens';

export interface MatrixPriceAnimationProps {
  symbol: string;
  currentPrice: number;
  previousPrice?: number;
  change24h?: number;
  changePercent?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showChange?: boolean;
  animationType?: 'glow' | 'glitch' | 'pulse' | 'slide';
}

interface PriceChangeIndicatorProps {
  direction: 'up' | 'down' | 'neutral';
  value: number;
  percent?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const sizeConfig = {
  sm: {
    price: 'text-sm',
    change: 'text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    price: 'text-lg',
    change: 'text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    price: 'text-2xl',
    change: 'text-base',
    icon: 'h-5 w-5',
  },
};

const directionStyles = {
  up: {
    color: matrixColors.matrixGreen,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    glowClass: 'matrix-glow-green',
    icon: TrendingUp,
  },
  down: {
    color: matrixColors.neonPink,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    glowClass: 'matrix-glow-red',
    icon: TrendingDown,
  },
  neutral: {
    color: matrixColors.cyberBlue,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowClass: 'matrix-glow-blue',
    icon: Minus,
  },
};

function PriceChangeIndicator({
  direction,
  value,
  percent,
  size = 'md',
  showIcon = true,
}: PriceChangeIndicatorProps) {
  const styles = directionStyles[direction];
  const sizeConf = sizeConfig[size];
  const IconComponent = styles.icon;

  return (
    <motion.div
      className={cn(
        'inline-flex items-center space-x-1 rounded px-2 py-1',
        'font-mono font-medium',
        styles.bgColor,
        styles.borderColor,
        'border backdrop-blur-sm',
        styles.glowClass
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {showIcon && (
        <IconComponent
          className={cn(sizeConf.icon)}
          style={{ color: styles.color }}
        />
      )}
      <span
        className={cn(sizeConf.change)}
        style={{ color: styles.color }}
      >
        {direction === 'up' ? '+' : direction === 'down' ? '-' : ''}
        ${Math.abs(value).toFixed(2)}
        {percent !== undefined && (
          <span className="ml-1">
            ({direction === 'up' ? '+' : direction === 'down' ? '-' : ''}
            {Math.abs(percent).toFixed(2)}%)
          </span>
        )}
      </span>
    </motion.div>
  );
}

export function MatrixPriceAnimation({
  symbol,
  currentPrice,
  previousPrice,
  change24h = 0,
  changePercent = 0,
  className,
  size = 'md',
  showIcon = true,
  showChange = true,
  animationType = 'glow',
}: MatrixPriceAnimationProps) {
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isAnimating, setIsAnimating] = useState(false);
  const sizeConf = sizeConfig[size];

  // Determine price direction
  useEffect(() => {
    if (previousPrice !== undefined && currentPrice !== previousPrice) {
      const direction = currentPrice > previousPrice ? 'up' : 'down';
      setPriceDirection(direction);
      setIsAnimating(true);

      // Reset animation after delay
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentPrice, previousPrice]);

  // Determine change direction from 24h change
  const changeDirection: 'up' | 'down' | 'neutral' = 
    change24h > 0 ? 'up' : change24h < 0 ? 'down' : 'neutral';

  const priceStyles = directionStyles[priceDirection];

  // Animation variants based on type
  const animationVariants = {
    glow: {
      initial: { scale: 1 },
      animate: isAnimating ? {
        scale: [1, 1.05, 1],
        textShadow: [
          `0 0 0px ${priceStyles.color}`,
          `0 0 20px ${priceStyles.color}`,
          `0 0 0px ${priceStyles.color}`,
        ],
      } : { scale: 1 },
      transition: { duration: 1, ease: 'easeInOut' },
    },
    glitch: {
      initial: { x: 0 },
      animate: isAnimating ? {
        x: [0, -2, 2, -1, 1, 0],
        filter: [
          'hue-rotate(0deg)',
          'hue-rotate(90deg)',
          'hue-rotate(180deg)',
          'hue-rotate(270deg)',
          'hue-rotate(0deg)',
        ],
      } : { x: 0 },
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    pulse: {
      initial: { opacity: 1 },
      animate: isAnimating ? {
        opacity: [1, 0.7, 1, 0.7, 1],
      } : { opacity: 1 },
      transition: { duration: 1, ease: 'easeInOut' },
    },
    slide: {
      initial: { y: 0 },
      animate: isAnimating ? {
        y: [0, -10, 0],
      } : { y: 0 },
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const currentAnimation = animationVariants[animationType];

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {/* Price Display */}
      <motion.div
        className="flex items-center space-x-3"
        {...currentAnimation}
      >
        <motion.span
          className={cn(
            'font-mono font-bold',
            sizeConf.price,
            isAnimating && 'matrix-text-glow'
          )}
          style={{ 
            color: isAnimating ? priceStyles.color : matrixColors.cyberBlue 
          }}
          key={currentPrice} // Re-animate when price changes
        >
          ${currentPrice.toFixed(2)}
        </motion.span>

        {/* Symbol Badge */}
        <motion.span
          className="px-2 py-1 rounded text-xs font-mono font-medium bg-white/10 text-white/80 border border-white/20"
          whileHover={{ scale: 1.05 }}
        >
          {symbol}
        </motion.span>
      </motion.div>

      {/* Price Change Indicator */}
      <AnimatePresence>
        {showChange && change24h !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <PriceChangeIndicator
              direction={changeDirection}
              value={change24h}
              percent={changePercent}
              size={size}
              showIcon={showIcon}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matrix Digital Rain Effect for Large Price Changes */}
      {isAnimating && Math.abs(changePercent) > 5 && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-green-400 to-transparent"
              style={{
                left: `${20 + i * 20}%`,
                height: '100%',
              }}
              animate={{
                y: ['-100%', '100%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                ease: 'linear',
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Compact version for tables and lists
export function MatrixPriceCompact({
  symbol,
  currentPrice,
  change24h = 0,
  changePercent = 0,
  className,
}: Omit<MatrixPriceAnimationProps, 'size' | 'showIcon' | 'showChange'>) {
  const changeDirection: 'up' | 'down' | 'neutral' = 
    change24h > 0 ? 'up' : change24h < 0 ? 'down' : 'neutral';
  const styles = directionStyles[changeDirection];

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-mono font-medium text-white">
          {symbol}
        </span>
        <span className="text-sm font-mono text-white/80">
          ${currentPrice.toFixed(2)}
        </span>
      </div>
      
      {change24h !== 0 && (
        <motion.div
          className={cn(
            'flex items-center space-x-1 text-xs font-mono',
            'px-1.5 py-0.5 rounded',
            styles.bgColor
          )}
          whileHover={{ scale: 1.05 }}
        >
          <styles.icon className="h-3 w-3" style={{ color: styles.color }} />
          <span style={{ color: styles.color }}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default MatrixPriceAnimation; 