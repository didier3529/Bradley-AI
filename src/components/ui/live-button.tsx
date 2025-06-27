import { cn } from '@/lib/utils'
import { Activity, RefreshCw } from 'lucide-react'
import { Button, ButtonProps } from './button'

interface LiveButtonProps extends ButtonProps {
  isLive?: boolean
  showLiveIndicator?: boolean
  refreshing?: boolean
  onRefresh?: () => void
}

export function LiveButton({
  isLive = true,
  showLiveIndicator = true,
  refreshing = false,
  onRefresh,
  children,
  className,
  ...props
}: LiveButtonProps) {
  return (
    <Button
      className={cn(
        "relative",
        isLive && "border-green-400/30 hover:border-green-400/50",
        className
      )}
      isLoading={refreshing}
      onClick={onRefresh}
      {...props}
    >
      {/* Live indicator */}
      {showLiveIndicator && isLive && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      )}

      {/* Button content */}
      <div className="flex items-center space-x-2">
        {refreshing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : showLiveIndicator && isLive ? (
          <Activity className="h-4 w-4 text-green-400 animate-pulse" />
        ) : null}
        <span>{children}</span>
      </div>
    </Button>
  )
}

// Simple refresh button for data sections
export function RefreshButton({
  onRefresh,
  isLoading = false,
  size = 'sm',
  className = ''
}: {
  onRefresh: () => void
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className={cn(
        "rounded-lg bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 transition-colors disabled:opacity-50 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      title="Refresh data"
    >
      <RefreshCw className={`h-4 w-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
    </button>
  )
}
