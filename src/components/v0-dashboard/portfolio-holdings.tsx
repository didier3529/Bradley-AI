"use client"

import { useHydration } from '@/components/ui/hydration-safe'
import { useTokenPrices } from '@/lib/providers/price-provider'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface PortfolioAsset {
    symbol: string
    name: string
    balance: number
    value: number
    change: number
}

// Move constants outside component to prevent recreation on every render
const PORTFOLIO_BALANCES: Record<string, number> = {
    "BTC": 0.5,
    "ETH": 4.2,
    "SOL": 25,
    "ADA": 1000,
    "DOT": 150
}

const SYMBOL_NAMES: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
}

const TRACKED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'] as const

export function PortfolioHoldings() {
    const [assets, setAssets] = useState<PortfolioAsset[]>([])
    const [totalValue, setTotalValue] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [cacheBustParam, setCacheBustParam] = useState('')
    const isHydrated = useHydration()

    // Use existing price provider with stable symbol array
    const { prices, isLoading: pricesLoading } = useTokenPrices(TRACKED_SYMBOLS)

    // Stable format functions with useCallback to prevent re-renders
    const formatCurrency = useCallback((value: number) => {
        if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(1)}M`
        } else if (value >= 1e3) {
            return `$${(value / 1e3).toFixed(1)}K`
        }
        return `$${value.toFixed(2)}`
    }, [])

    const formatBalance = useCallback((balance: number, symbol: string) => {
        if (symbol === 'BTC' || symbol === 'ETH') {
            return balance.toFixed(4)
        } else if (symbol === 'ADA') {
            return balance.toFixed(0)
        }
        return balance.toFixed(2)
    }, [])

    const getCryptoIcon = useCallback((symbol: string) => {
        const icons: { [key: string]: { icon: string; color: string } } = {
            'BTC': { icon: '₿', color: 'text-orange-400' },
            'ETH': { icon: 'Ξ', color: 'text-blue-400' },
            'SOL': { icon: '◎', color: 'text-purple-400' },
            'ADA': { icon: '₳', color: 'text-blue-300' },
            'DOT': { icon: '●', color: 'text-pink-400' },
        }
        return icons[symbol] || { icon: '●', color: 'text-gray-400' }
    }, [])

    // Memoize portfolio calculation to prevent unnecessary recalculations
    const portfolioData = useMemo(() => {
        if (!prices || Object.keys(prices).length === 0) {
            return { assets: [], totalValue: 0 }
        }

        const portfolioAssets = Object.entries(PORTFOLIO_BALANCES)
            .map(([symbol, balance]) => {
                const price = prices[symbol]
                if (!price) return null

                const value = balance * price.current
                const change = price.historical !== 0
                    ? ((price.current - price.historical) / price.historical) * 100
                    : 0

                return {
                    symbol,
                    name: SYMBOL_NAMES[symbol] || symbol,
                    balance,
                    value,
                    change
                }
            })
            .filter(Boolean)
            .sort((a, b) => b.value - a.value) // Sort by value descending

        const total = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0)

        return { assets: portfolioAssets, totalValue: total }
    }, [prices])

    // Effect to update state - separated and simplified to prevent loops
    useEffect(() => {
        if (portfolioData.assets.length > 0) {
            setAssets(portfolioData.assets)
            setTotalValue(portfolioData.totalValue)
            setIsLoading(false)
        }
    }, [portfolioData])

    // Effect to handle loading state
    useEffect(() => {
        if (pricesLoading) {
            setIsLoading(true)
        }
    }, [pricesLoading])

    // Client-side cache busting after hydration
    useEffect(() => {
        if (isHydrated) {
            setCacheBustParam(`?v=${Date.now()}`)
        }
    }, [isHydrated])

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
                <div className="flex items-center space-x-2">
                    <img
                        src={`/images/section-logos/portfolio-holdings.png${cacheBustParam}`}
                        alt="Portfolio Holdings"
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                            // Fallback to original icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <Wallet className="h-4 w-4 text-green-400 hidden" />
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wide">
                        Portfolio Holdings
                    </h3>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            {/* Holdings List */}
            <div className="p-4 space-y-3">
                {isLoading || pricesLoading ? (
                    <div className="text-center py-4">
                        <div className="text-xs font-mono text-gray-400">Loading holdings...</div>
                    </div>
                ) : (
                    assets.map((asset, index) => {
                        const cryptoIcon = getCryptoIcon(asset.symbol)
                        return (
                            <motion.div
                                key={asset.symbol}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="flex items-center justify-between py-2 hover:bg-slate-700/20 rounded transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`text-base font-mono font-bold ${cryptoIcon.color}`}>
                                        {cryptoIcon.icon}
                                    </div>
                                    <div>
                                        <div className="text-sm font-mono font-semibold text-white">
                                            {asset.symbol}
                                        </div>
                                        <div className="text-xs font-mono text-gray-400">
                                            {formatBalance(asset.balance, asset.symbol)} {asset.symbol}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-mono font-semibold text-white">
                                        {formatCurrency(asset.value)}
                                    </div>
                                    <div className={`text-xs font-mono ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Total Portfolio Value */}
            <div className="px-4 py-3 bg-slate-900/30 border-t border-slate-700/30">
                <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        Total Portfolio Value
                    </div>
                    <div className="text-sm font-mono font-bold text-cyan-400">
                        {formatCurrency(totalValue)}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
