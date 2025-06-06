'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { matrixColors, matrixEffects } from '@/styles/design-tokens';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'reconnecting';

interface MatrixConnectionStatusProps {
  status: ConnectionStatus;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRetry?: () => void;
}

const statusConfig = {
  connected: {
    icon: Activity,
    label: 'Connected',
    color: matrixColors.matrixGreen,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    glowClass: 'matrix-glow-green',
  },
  connecting: {
    icon: Wifi,
    label: 'Connecting',
    color: matrixColors.cyberBlue,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowClass: 'matrix-glow-blue',
  },
  disconnected: {
    icon: WifiOff,
    label: 'Disconnected',
    color: '#666666',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    glowClass: '',
  },
  error: {
    icon: AlertTriangle,
    label: 'Connection Error',
    color: matrixColors.neonPink,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    glowClass: 'matrix-glow-red',
  },
  reconnecting: {
    icon: Wifi,
    label: 'Reconnecting',
    color: matrixColors.warningAmber,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    glowClass: 'matrix-glow-amber',
  },
};

const sizeConfig = {
  sm: {
    container: 'h-6 px-2',
    icon: 'h-3 w-3',
    text: 'text-xs',
  },
  md: {
    container: 'h-8 px-3',
    icon: 'h-4 w-4',
    text: 'text-sm',
  },
  lg: {
    container: 'h-10 px-4',
    icon: 'h-5 w-5',
    text: 'text-base',
  },
};

export function MatrixConnectionStatus({
  status,
  className,
  showText = true,
  size = 'md',
  onRetry,
}: MatrixConnectionStatusProps) {
  const config = statusConfig[status];
  const sizeConf = sizeConfig[size];
  const IconComponent = config.icon;

  // Pulse animation for connecting/reconnecting states
  const shouldPulse = status === 'connecting' || status === 'reconnecting';

  // Glitch effect for error state
  const shouldGlitch = status === 'error';

  return (
    <motion.div
      className={cn(
        'inline-flex items-center justify-center rounded border backdrop-blur-sm',
        'transition-all duration-300',
        config.bgColor,
        config.borderColor,
        sizeConf.container,
        shouldGlitch && 'matrix-glitch',
        config.glowClass,
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Connection Icon with Animations */}
      <motion.div
        className="relative"
        animate={shouldPulse ? {
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        } : {}}
        transition={{
          duration: 2,
          repeat: shouldPulse ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <IconComponent
          className={cn(
            sizeConf.icon,
            'transition-colors duration-300'
          )}
          style={{ color: config.color }}
        />
        
        {/* Digital Pulse Effect for Active Connection */}
        {status === 'connected' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: config.color }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.div>

      {/* Status Text */}
      <AnimatePresence>
        {showText && (
          <motion.span
            className={cn(
              'ml-2 font-mono font-medium tracking-wide',
              sizeConf.text,
              'matrix-text-glow'
            )}
            style={{ color: config.color }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {config.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Retry Button for Error State */}
      {status === 'error' && onRetry && (
        <motion.button
          className={cn(
            'ml-2 rounded px-2 py-1 text-xs font-mono',
            'bg-red-500/20 text-red-400 hover:bg-red-500/30',
            'transition-colors duration-200',
            'border border-red-500/30 hover:border-red-500/50'
          )}
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Retry
        </motion.button>
      )}
    </motion.div>
  );
}

// Digital Rain Connection Indicator (Alternative compact version)
export function MatrixConnectionDot({
  status,
  className,
}: {
  status: ConnectionStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  
  return (
    <motion.div
      className={cn(
        'relative h-3 w-3 rounded-full',
        className
      )}
      style={{ backgroundColor: config.color }}
      animate={status === 'connecting' || status === 'reconnecting' ? {
        opacity: [0.3, 1, 0.3],
      } : {}}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 10px ${config.color}`,
          border: `1px solid ${config.color}`,
        }}
        animate={status === 'connected' ? {
          scale: [1, 1.5, 1],
          opacity: [0.8, 0.3, 0.8],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </motion.div>
  );
}

export default MatrixConnectionStatus; 