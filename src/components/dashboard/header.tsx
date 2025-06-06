'use client';

import { Activity, Clock, Wifi } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState<string>('--:--:--')
  const [isMounted, setIsMounted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Update time function with stable reference
  const updateTime = useCallback(() => {
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  // Hydration effect - only run once on mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Timer effect - separate from hydration to prevent loops
  useEffect(() => {
    if (!isMounted) return

    // Set initial time
    updateTime()

    // Set up timer
    timerRef.current = setInterval(updateTime, 1000)

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isMounted, updateTime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  return (
    <header className="bg-black/90 border-b border-cyan-400/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <span className="font-mono text-cyan-400 font-bold">
              MATRIX AI DASHBOARD
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-400" />
            <span className="text-green-400">
              CONNECTED
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              {currentTime}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
