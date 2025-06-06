"use client"

import { motion } from 'framer-motion'
import { Globe, TrendingUp, Wallet } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Use existing portfolio logic
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
    const [portfolioValue, setPortfolioValue] = useState(41416.83)

    // Portfolio calculation using existing backend with stable symbol array
    const { prices } = useTokenPrices(TRACKED_SYMBOLS)

    // Memoize portfolio value calculation to prevent unnecessary recalculations
    const calculatedValue = useMemo(() => {
        if (!prices || Object.keys(prices).length === 0) {
            return 0
        }

        return Object.entries(PORTFOLIO_BALANCES).reduce((total, [symbol, balance]) => {
            const price = prices[symbol]?.current || 0
            return total + (balance * price)
        }, 0)
    }, [prices])

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
        if (calculatedValue > 0) {
            setPortfolioValue(calculatedValue)
        }
    }, [calculatedValue])

    // Memoize stats cards to prevent recreation
    const statsCards = useMemo(() => [
        {
            title: "Global Market Cap",
            value: globalMarketCap,
            change: "+1.24%",
            icon: Globe,
            color: "from-cyan-500 to-blue-600",
            detail: "Total Crypto Market"
        },
        {
            title: "DeFi TVL",
            value: defiTvl,
            change: "+3.45%",
            icon: TrendingUp,
            color: "from-purple-500 to-pink-600",
            detail: "Total Value Locked"
        },
        {
            title: "Portfolio Value",
            value: portfolioValue,
            change: "+2.37%",
            icon: Wallet,
            color: "from-green-500 to-emerald-600",
            detail: "Total Value"
        }
    ], [globalMarketCap, defiTvl, portfolioValue])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statsCards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 relative overflow-hidden hover:bg-slate-800/80 transition-all duration-300"
                >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-5`}></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-mono text-gray-400 uppercase tracking-wider">
                                {card.title}
                            </div>
                            <card.icon className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="text-2xl font-mono font-bold text-white mb-2">
                            {formatCurrency(card.value)}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-xs font-mono text-gray-400">
                                {card.detail}
                            </div>
                            <div className="text-xs font-mono text-green-400">
                                {card.change}
                            </div>
                        </div>
                    </div>

                    {/* Glow effect */}
                    <div className={`absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r ${card.color} opacity-20 blur-xl`}></div>
                </motion.div>
            ))}
        </div>
    )
}
