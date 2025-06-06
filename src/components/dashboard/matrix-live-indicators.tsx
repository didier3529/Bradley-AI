'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wifi, Clock, Zap, Gauge, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { matrixColors } from '@/styles/design-tokens';
import { usePriceContext } from '@/lib/providers/price-provider';
import { MatrixConnectionStatus, MatrixConnectionDot } from '@/components/ui/matrix-connection-status';

interface MatrixLiveIndicatorsProps {
  className?: string;
  showDetailed?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

interface LiveIndicatorProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  status: 'active' | 'warning' | 'error' | 'neutral';
  description?: string;
  className?: string;
  animate?: boolean;
}

const statusStyles = {
  active: {
    color: matrixColors.matrixGreen,
    glow: 'matrix-glow-green',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  warning: {
    color: matrixColors.warningAmber,
    glow: 'matrix-glow-amber',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  error: {
    color: matrixColors.neonPink,
    glow: 'matrix-glow-red',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  neutral: {
    color: matrixColors.cyberBlue,
    glow: 'matrix-glow-blue',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
};

function LiveIndicator({
  icon: Icon,
  label,
  value,
  status,
  description,
  className,
  animate = true,
}: LiveIndicatorProps) {
  const styles = statusStyles[status];
  
  return (
    <motion.div
      className={cn(
        'relative flex items-center space-x-3 rounded-lg border backdrop-blur-sm p-3',
        'transition-all duration-300 hover:shadow-lg',
        styles.bg,
        styles.border,
        animate && styles.glow,
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Icon with pulse animation */}
      <motion.div
        className="relative"
        animate={animate && status === 'active' ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: styles.color }}
        />
        
        {/* Digital pulse for active status */}
        {status === 'active' && animate && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: styles.color }}
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

      {/* Label and Value */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-mono font-medium text-white/90">
            {label}
          </span>
          <motion.span
            className="text-lg font-mono font-bold"
            style={{ color: styles.color }}
            key={value} // Re-animate when value changes
            initial={{ scale: 1.2, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {value}
          </motion.span>
        </div>
        
        {description && (
          <p className="text-xs text-white/60 font-mono mt-1 truncate">
            {description}
          </p>
        )}
      </div>

      {/* Matrix glitch effect for errors */}
      {status === 'error' && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            background: `linear-gradient(45deg, transparent 45%, ${matrixColors.neonPink}20 50%, transparent 55%)`,
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </motion.div>
  );
}

export function MatrixLiveIndicators({
  className,
  showDetailed = false,
  layout = 'horizontal',
}: MatrixLiveIndicatorsProps) {
  const {
    connectionStatus,
    isWebSocketConnected,
    latency,
    isFetching,
    status: queryStatus,
    prices,
  } = usePriceContext();

  // Calculate statistics
  const connectedTokens = Object.keys(prices).length;
  const lastUpdate = Math.max(...Object.values(prices).map(p => p.lastUpdated || 0));
  const timeSinceUpdate = lastUpdate > 0 ? Math.floor((Date.now() - lastUpdate) / 1000) : 0;
  
  // Determine connection quality
  const getConnectionQuality = (): 'active' | 'warning' | 'error' | 'neutral' => {
    if (!isWebSocketConnected) return 'error';
    if (latency > 1000) return 'warning';
    if (latency > 500) return 'neutral';
    return 'active';
  };

  // Format latency display
  const formatLatency = () => {
    if (latency === 0) return '--';
    if (latency < 1000) return `${latency}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  };

  // Calculate update frequency
  const getUpdateStatus = (): 'active' | 'warning' | 'error' | 'neutral' => {
    if (isFetching) return 'active';
    if (timeSinceUpdate > 60) return 'warning';
    if (timeSinceUpdate > 120) return 'error';
    return 'neutral';
  };

  const indicators: Array<{
    icon: React.ComponentType<any>;
    label: string;
    value: string | number;
    status: 'active' | 'warning' | 'error' | 'neutral';
    description: string;
    animate: boolean;
  }> = [
    {
      icon: Activity,
      label: 'Connection',
      value: isWebSocketConnected ? 'Live' : 'Polling',
      status: getConnectionQuality(),
      description: isWebSocketConnected ? 'Real-time WebSocket' : 'HTTP polling mode',
      animate: isWebSocketConnected,
    },
    {
      icon: Zap,
      label: 'Latency',
      value: formatLatency(),
      status: getConnectionQuality(),
      description: `Network response time`,
      animate: isWebSocketConnected && latency < 500,
    },
    {
      icon: TrendingUp,
      label: 'Assets',
      value: connectedTokens,
      status: connectedTokens > 0 ? 'active' : 'neutral',
      description: `${connectedTokens} tokens streaming`,
      animate: connectedTokens > 0,
    },
    {
      icon: Clock,
      label: 'Updated',
      value: timeSinceUpdate < 60 ? `${timeSinceUpdate}s` : `${Math.floor(timeSinceUpdate / 60)}m`,
      status: getUpdateStatus(),
      description: 'Last data refresh',
      animate: isFetching,
    },
  ];

  const layoutStyles = {
    horizontal: 'flex flex-row space-x-4 overflow-x-auto',
    vertical: 'flex flex-col space-y-4',
    grid: 'grid grid-cols-2 lg:grid-cols-4 gap-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Main Status Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-mono font-semibold text-white">
            Live Data Stream
          </h3>
          <MatrixConnectionDot status={connectionStatus} />
        </div>
        
        {/* Compact connection status */}
        <MatrixConnectionStatus
          status={connectionStatus}
          size="sm"
          showText={false}
        />
      </div>

      {/* Detailed Indicators */}
      <AnimatePresence mode="wait">
        {showDetailed && (
          <motion.div
            className={cn(layoutStyles[layout])}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {indicators.map((indicator, index) => (
              <LiveIndicator
                key={indicator.label}
                icon={indicator.icon}
                label={indicator.label}
                value={indicator.value}
                status={indicator.status}
                description={indicator.description}
                animate={indicator.animate}
                className={layout === 'horizontal' ? 'min-w-[200px]' : ''}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact View */}
      {!showDetailed && (
        <motion.div
          className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" style={{ color: matrixColors.cyberBlue }} />
              <span className="text-sm font-mono text-white/80">
                {isWebSocketConnected ? 'Live' : 'Polling'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" style={{ color: matrixColors.matrixGreen }} />
              <span className="text-sm font-mono text-white/80">
                {connectedTokens} tokens
              </span>
            </div>
            
            {latency > 0 && (
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4" style={{ color: matrixColors.warningAmber }} />
                <span className="text-sm font-mono text-white/80">
                  {formatLatency()}
                </span>
              </div>
            )}
          </div>

          {/* Activity indicator */}
          <motion.div
            className={cn(
              'h-2 w-2 rounded-full',
              isFetching ? 'bg-green-400' : 'bg-blue-400'
            )}
            animate={isFetching ? {
              opacity: [0.3, 1, 0.3],
            } : {}}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

export default MatrixLiveIndicators; 