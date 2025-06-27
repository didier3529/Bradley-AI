"use client"

import { WalletConnection } from '@/components/wallet-connection'
import { motion } from 'framer-motion'
import { Activity, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function BradleyAIHeader() {
    const [currentTime, setCurrentTime] = useState('')
    const [isMounted, setIsMounted] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    // Hydration safety
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Update time every second
    useEffect(() => {
        if (!isMounted) return

        const updateTime = () => {
            const now = new Date()
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }))
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)

        return () => clearInterval(interval)
    }, [isMounted])

    // Monitor online status
    useEffect(() => {
        if (!isMounted) return

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        setIsOnline(navigator.onLine)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [isMounted])

    if (!isMounted) {
        return (
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-32 bg-slate-800 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="h-8 w-24 bg-slate-800 rounded animate-pulse"></div>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
        >
            {/* Left side - Logo and Title */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center space-x-4"
            >
                <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                        <span className="text-xl font-bold text-white">B</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        BRADLEY AI
                    </h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Activity className="h-3 w-3 text-green-400 animate-pulse" />
                        <span className="font-mono">NEURAL NETWORK ACTIVE</span>
                    </div>
                </div>
            </motion.div>

            {/* Right side - Status indicators and controls */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center space-x-6"
            >
                {/* Network Status */}
                <div className="text-right">
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        NETWORK STATUS
                    </div>
                    <div className="flex items-center space-x-2">
                        {isOnline ? (
                            <>
                                <Wifi className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-mono text-green-400">CONNECTED</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-mono text-red-400">OFFLINE</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Live Time */}
                <div className="text-right">
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        SYSTEM TIME
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-mono text-cyan-400 tabular-nums">
                            {currentTime || '00:00:00'}
                        </span>
                    </div>
                </div>

                {/* Wallet Connection Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    <WalletConnection />
                </motion.div>

                {/* System Status */}
                <div className="text-right">
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        SYSTEM STATUS
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-mono text-green-400">OPERATIONAL</span>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        MATRIX CONNECTION
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-mono text-cyan-400">LIVE FEED</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
