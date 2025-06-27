"use client"

import { motion } from 'framer-motion'
import { Activity, Globe, RefreshCw, TrendingUp, Wallet, WalletIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Use existing portfolio logic and wallet connection
import { useWallet } from '@/hooks/useWallet'
import { useTokenPrices } from '@/lib/providers/price-provider'

// Move constants outside component to prevent recreation on every render
const PORTFOLIO_BALANCES: Record<string, number> = {
    "BTC": 0.5,
    "ETH": 4.2,
    "SOL": 25,
    "ADA": 1000,
    "DOT": 150
}

const TRACKED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'] as const

export function BradleyAIStatsCards() {
    const [globalMarketCap, setGlobalMarketCap] = useState(2840000000000) // $2.84T
    const [defiTvl, setDefiTvl] = useState(89200000000) // $89.2B
    const [portfolioValue, setPortfolioValue] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<number>(Date.now())

    // Portfolio calculation using existing backend with stable symbol array
    const { prices, isFetching, refetchPrices } = useTokenPrices(TRACKED_SYMBOLS)

    // Wallet connection state
    const { isConnected, connect } = useWallet()

    // Memoize portfolio value calculation to prevent unnecessary recalculations
    const calculatedValue = useMemo(() => {
        // Only calculate portfolio value if wallet is connected
        if (!isConnected || !prices || Object.keys(prices).length === 0) {
            return 0
        }

        return Object.entries(PORTFOLIO_BALANCES).reduce((total, [symbol, balance]) => {
            const price = prices[symbol]?.current || 0
            return total + (balance * price)
        }, 0)
    }, [prices, isConnected])

    // Stable format function with useCallback
    const formatCurrency = useCallback((value: number) => {
        if (value >= 1e12) {
            return `$${(value / 1e12).toFixed(2)}T`
        } else if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(1)}B`
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(1)}M`
        } else if (value >= 1e3) {
            return `$${(value / 1e3).toFixed(1)}K`
        }
        return `$${value.toFixed(2)}`
    }, [])

    // Effect to update portfolio value - simplified to prevent loops
    useEffect(() => {
        if (isConnected && calculatedValue > 0) {
            setPortfolioValue(calculatedValue)
        } else {
            setPortfolioValue(0)
        }
    }, [calculatedValue, isConnected])

    // Update last updated timestamp when prices change
    useEffect(() => {
        if (prices && Object.keys(prices).length > 0) {
            setLastUpdated(Date.now())
        }
    }, [prices])

    // Handle wallet connection
    const handleConnectWallet = useCallback(async () => {
        try {
            await connect()
        } catch (error) {
            console.error('Failed to connect wallet:', error)
        }
    }, [connect])

    // Manual refresh function
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        try {
            await refetchPrices()
            // Simulate brief loading for visual feedback
            setTimeout(() => setIsRefreshing(false), 500)
        } catch (error) {
            console.error('Failed to refresh data:', error)
            setIsRefreshing(false)
        }
    }, [refetchPrices])

    // Format time since last update
    const formatTimeSince = useCallback((timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000)
        if (seconds < 60) return `${seconds}s ago`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        return `${hours}h ago`
    }, [])

    // Memoize stats cards to prevent recreation
    const statsCards = useMemo(() => [
        {
            title: "Global Market Cap",
            value: globalMarketCap,
            change: "+1.24%",
            icon: Globe,
            color: "from-cyan-500 to-blue-600",
            detail: "Total Crypto Market",
            requiresWallet: false,
            isLive: true
        },
        {
            title: "DeFi TVL",
            value: defiTvl,
            change: "+3.45%",
            icon: TrendingUp,
            color: "from-purple-500 to-pink-600",
            detail: "Total Value Locked",
            requiresWallet: false,
            isLive: true
        },
        {
            title: "Portfolio Value",
            value: portfolioValue,
            change: isConnected ? "+2.37%" : null,
            icon: Wallet,
            color: "from-green-500 to-emerald-600",
            detail: isConnected ? "Total Value" : "Connect Wallet",
            requiresWallet: true,
            isLive: isConnected
        }
    ], [globalMarketCap, defiTvl, portfolioValue, isConnected])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statsCards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 relative overflow-hidden transition-all duration-300 ${
                        card.requiresWallet && !isConnected
                            ? 'hover:bg-slate-800/80 cursor-pointer'
                            : 'hover:bg-slate-800/80'
                    }`}
                    onClick={card.requiresWallet && !isConnected ? handleConnectWallet : undefined}
                >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-5`}></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-mono text-gray-400 uppercase tracking-wider">
                                {card.title}
                            </div>
                            <div className="flex items-center space-x-2">
                                <card.icon className={`h-5 w-5 ${
                                    card.requiresWallet && !isConnected ? 'text-gray-500' : 'text-gray-400'
                                }`} />
                                {/* Live indicator */}
                                {card.isLive && (
                                    <div className="flex items-center space-x-1">
                                        <Activity className="h-3 w-3 text-green-400 animate-pulse" />
                                        <span className="text-xs font-mono text-green-400">LIVE</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Portfolio Value - Special handling for wallet connection */}
                        {card.requiresWallet && !isConnected ? (
                            <>
                                <div className="text-2xl font-mono font-bold text-gray-500 mb-2">
                                    --
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-mono text-gray-500">
                                        {card.detail}
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs font-mono text-cyan-400 hover:text-cyan-300">
                                        <WalletIcon className="h-3 w-3" />
                                        <span>Connect</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-mono font-bold text-white mb-2">
                                    {card.requiresWallet && isConnected && portfolioValue > 0
                                        ? formatCurrency(card.value)
                                        : card.requiresWallet && isConnected
                                        ? "Loading..."
                                        : formatCurrency(card.value)
                                    }
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-mono text-gray-400">
                                        {card.detail}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {card.change && (
                                            <div className="text-xs font-mono text-green-400">
                                                {card.change}
                                            </div>
                                        )}
                                        {/* Refresh button for live cards */}
                                        {card.isLive && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRefresh()
                                                }}
                                                disabled={isRefreshing || isFetching}
                                                className="p-1 rounded hover:bg-slate-700/50 transition-colors"
                                                title="Refresh data"
                                            >
                                                <RefreshCw className={`h-3 w-3 text-cyan-400 ${
                                                    (isRefreshing || isFetching) ? 'animate-spin' : ''
                                                }`} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Last updated indicator */}
                        {card.isLive && (
                            <div className="mt-2 text-xs font-mono text-gray-500">
                                Updated {formatTimeSince(lastUpdated)}
                            </div>
                        )}
                    </div>

                    {/* Glow effect */}
                    <div className={`absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r ${card.color} opacity-20 blur-xl`}></div>

                    {/* Connection indicator for portfolio card */}
                    {card.requiresWallet && (
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                            isConnected ? 'bg-green-400' : 'bg-gray-500'
                        }`}></div>
                    )}

                    {/* Live data pulse effect */}
                    {card.isLive && (
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color} opacity-30 ${
                            isFetching ? 'animate-pulse' : ''
                        }`}></div>
                    )}
                </motion.div>
            ))}
        </div>
    )
}
