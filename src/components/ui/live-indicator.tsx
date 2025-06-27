import { motion } from 'framer-motion'
import { Activity, RefreshCw } from 'lucide-react'

interface LiveIndicatorProps {
  isLive?: boolean
  isLoading?: boolean
  lastUpdated?: number
  onRefresh?: () => void
  size?: 'sm' | 'md' | 'lg'
  showRefresh?: boolean
  showTimestamp?: boolean
  className?: string
}

export function LiveIndicator({
  isLive = true,
  isLoading = false,
  lastUpdated,
  onRefresh,
  size = 'md',
  showRefresh = true,
  showTimestamp = false,
  className = ''
}: LiveIndicatorProps) {
  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const sizeClasses = {
    sm: {
      dot: 'w-1.5 h-1.5',
      text: 'text-xs',
      icon: 'h-3 w-3',
      button: 'p-1'
    },
    md: {
      dot: 'w-2 h-2',
      text: 'text-sm',
      icon: 'h-4 w-4',
      button: 'p-1.5'
    },
    lg: {
      dot: 'w-3 h-3',
      text: 'text-base',
      icon: 'h-5 w-5',
      button: 'p-2'
    }
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Live status indicator */}
      <div className="flex items-center space-x-1">
        <motion.div
          className={`${sizes.dot} rounded-full ${
            isLive ? 'bg-green-400' : 'bg-gray-500'
          } ${isLive ? 'animate-pulse' : ''}`}
          animate={isLive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className={`${sizes.text} font-mono ${
          isLive ? 'text-green-400' : 'text-gray-500'
        }`}>
          {isLive ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      {/* Refresh button */}
      {showRefresh && onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`${sizes.button} rounded hover:bg-slate-700/50 transition-colors disabled:opacity-50`}
          title="Refresh data"
        >
          <RefreshCw className={`${sizes.icon} text-cyan-400 ${
            isLoading ? 'animate-spin' : ''
          }`} />
        </button>
      )}

      {/* Timestamp */}
      {showTimestamp && lastUpdated && (
        <span className={`${sizes.text} font-mono text-gray-400`}>
          {formatTimeSince(lastUpdated)}
        </span>
      )}
    </div>
  )
}

// Pulse effect component for live data sections
export function LivePulse({
  isActive = true,
  color = 'cyan',
  className = ''
}: {
  isActive?: boolean
  color?: 'cyan' | 'green' | 'blue' | 'purple'
  className?: string
}) {
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-pink-500'
  }

  return (
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses[color]} opacity-30 ${
      isActive ? 'animate-pulse' : ''
    } ${className}`} />
  )
}

// Activity indicator for showing data is being processed
export function ActivityIndicator({
  isActive = true,
  size = 'md',
  className = ''
}: {
  isActive?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Activity className={`${sizeClasses[size]} text-green-400 ${
        isActive ? 'animate-pulse' : ''
      }`} />
      <span className="text-xs font-mono text-green-400">
        {isActive ? 'PROCESSING' : 'IDLE'}
      </span>
    </div>
  )
}
