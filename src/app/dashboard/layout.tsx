"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react';

// Simple header component without context dependencies
function SimpleHeader() {
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
          <span className="font-mono text-cyan-400 font-bold">
            BRADLEY AI DASHBOARD
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono">
          <span className="text-green-400">LIVE</span>
          <span className="text-gray-400">
            {currentTime}
          </span>
        </div>
      </div>
    </header>
  );
}

// Simple sidebar without complex dependencies
function SimpleSidebar() {
  return (
    <div className="w-64 bg-black/90 border-r border-cyan-400/20 p-4">
      {/* Logo/Brand */}
      <div className="mb-8">
        <h2 className="text-2xl font-mono font-bold text-cyan-400">
          BRADLEY AI
        </h2>
        <p className="text-xs text-gray-400 font-mono">
          DASHBOARD v2.0
        </p>
      </div>

      {/* Simple Status */}
      <div className="mt-8 p-3 bg-gray-900/50 rounded border border-green-400/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-green-400 font-mono text-sm font-bold">LIVE</span>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          Real-time market data active
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <div className="flex h-screen">
        <SimpleSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SimpleHeader />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
