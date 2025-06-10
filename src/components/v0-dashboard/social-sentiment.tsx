"use client"

import { useHydration } from '@/components/ui/hydration-safe'
import { motion } from 'framer-motion'
import { MessageCircle, TrendingUp, Users, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SentimentData {
    tag: string
    mentions: string
    sentiment: number
    change?: string
    trending?: 'up' | 'down' | 'stable'
    intensity?: number
}

export function SocialSentiment() {
    const [activeTab, setActiveTab] = useState<'trending' | 'mentions'>('trending')
    const [overallSentiment, setOverallSentiment] = useState('BULLISH')
    const [cacheBustParam, setCacheBustParam] = useState('')
    const isHydrated = useHydration()

    // Client-side cache busting after hydration
    useEffect(() => {
        if (isHydrated) {
            setCacheBustParam(`?v=${Date.now()}`)
        }
    }, [isHydrated])

    const trendingData: SentimentData[] = [
        { tag: '#Bitcoin', mentions: '127.5K', sentiment: 82, change: '+15.3%', trending: 'up', intensity: 95 },
        { tag: '#Ethereum', mentions: '89.2K', sentiment: 76, change: '+8.7%', trending: 'up', intensity: 88 },
        { tag: '#Solana', mentions: '67.8K', sentiment: 91, change: '+22.1%', trending: 'up', intensity: 96 },
        { tag: '#Cardano', mentions: '45.6K', sentiment: 68, change: '-3.2%', trending: 'down', intensity: 72 },
        { tag: '#Polygon', mentions: '34.1K', sentiment: 73, change: '+5.8%', trending: 'up', intensity: 78 },
        { tag: '#Chainlink', mentions: '28.9K', sentiment: 79, change: '+11.4%', trending: 'up', intensity: 84 },
    ]

    const mentionsData: SentimentData[] = [
        { tag: 'Ethereum Merge', mentions: '234.7K', sentiment: 88, change: '+45.6%', trending: 'up', intensity: 92 },
        { tag: 'DeFi Summer 2.0', mentions: '156.3K', sentiment: 85, change: '+28.9%', trending: 'up', intensity: 89 },
        { tag: 'NFT Royalties', mentions: '98.5K', sentiment: 62, change: '-12.3%', trending: 'down', intensity: 65 },
        { tag: 'Web3 Gaming', mentions: '87.2K', sentiment: 79, change: '+18.7%', trending: 'up', intensity: 82 },
        { tag: 'AI Trading Bots', mentions: '76.8K', sentiment: 71, change: '+6.2%', trending: 'up', intensity: 74 },
    ]

    const getSentimentColor = (sentiment: number) => {
        if (sentiment >= 85) return 'from-emerald-400 via-green-400 to-lime-300'
        if (sentiment >= 75) return 'from-green-400 via-emerald-400 to-teal-300'
        if (sentiment >= 65) return 'from-yellow-400 via-amber-400 to-orange-300'
        if (sentiment >= 50) return 'from-orange-400 via-yellow-400 to-amber-300'
        return 'from-red-400 via-pink-400 to-rose-300'
    }

    const getSentimentGlow = (sentiment: number) => {
        if (sentiment >= 85) return 'shadow-[0_0_20px_rgba(34,197,94,0.6)]'
        if (sentiment >= 75) return 'shadow-[0_0_15px_rgba(34,197,94,0.4)]'
        if (sentiment >= 65) return 'shadow-[0_0_15px_rgba(251,191,36,0.4)]'
        if (sentiment >= 50) return 'shadow-[0_0_15px_rgba(251,146,60,0.4)]'
        return 'shadow-[0_0_15px_rgba(239,68,68,0.4)]'
    }

    const getSentimentBarWidth = (sentiment: number) => {
        return `${sentiment}%`
    }

    const getTrendingIcon = (trending: 'up' | 'down' | 'stable') => {
        switch (trending) {
            case 'up':
                return <TrendingUp className="h-3 w-3 text-green-400" />
            case 'down':
                return <TrendingUp className="h-3 w-3 text-red-400 rotate-180" />
            default:
                return <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg overflow-hidden relative shadow-[0_0_30px_rgba(6,182,212,0.15)]"
            style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(6,78,117,0.1) 50%, rgba(0,0,0,0.9) 100%)'
            }}
        >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-emerald-400/10 animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 relative z-10">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            src={`/images/section-logos/social-sentiment.png${cacheBustParam}`}
                            alt="Social Sentiment"
                            className="h-6 w-6 object-contain relative z-10"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <MessageCircle className="h-6 w-6 text-cyan-400 hidden drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm animate-pulse" />
                    </div>
                    <h3 className="text-sm font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                        Social Sentiment
                    </h3>
                </div>
                <div className="flex items-center space-x-2">
                    <motion.div
                        className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <Zap className="h-4 w-4 text-yellow-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-cyan-500/20 relative">
                <div className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-transform duration-300 ease-out transform"
                     style={{ transform: activeTab === 'mentions' ? 'translateX(100%)' : 'translateX(0%)' }} />

                <button
                    onClick={() => setActiveTab('trending')}
                    className={`flex-1 px-4 py-3 text-xs font-mono font-semibold uppercase transition-all duration-300 relative group ${activeTab === 'trending'
                        ? 'text-cyan-300 bg-gradient-to-b from-cyan-500/10 to-transparent'
                        : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/5'
                        }`}
                >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                        <TrendingUp className="h-3 w-3" />
                        <span>Trending</span>
                    </span>
                    {activeTab === 'trending' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-cyan-400/5 to-transparent" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('mentions')}
                    className={`flex-1 px-4 py-3 text-xs font-mono font-semibold uppercase transition-all duration-300 relative group ${activeTab === 'mentions'
                        ? 'text-cyan-300 bg-gradient-to-b from-cyan-500/10 to-transparent'
                        : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/5'
                        }`}
                >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                        <Users className="h-3 w-3" />
                        <span>Mentions</span>
                    </span>
                    {activeTab === 'mentions' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-cyan-400/10" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-4 relative z-10">
                {activeTab === 'trending' ? (
                    <div className="space-y-4">
                        {trendingData.map((item, index) => (
                            <motion.div
                                key={item.tag}
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.08, duration: 0.4, type: "spring", stiffness: 100 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-emerald-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative bg-slate-900/40 backdrop-blur-sm border border-slate-700/30 rounded-lg p-3 hover:border-cyan-500/40 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-mono font-bold text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">
                                                {item.tag}
                                            </span>
                                            {getTrendingIcon(item.trending!)}
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs font-mono text-cyan-300 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">
                                                {item.mentions}
                                            </span>
                                            <span className={`text-xs font-mono font-semibold ${item.trending === 'up' ? 'text-green-400' : item.trending === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {item.change}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1 relative">
                                            {/* Background bar with depth */}
                                            <div className="h-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full border border-slate-600/30 overflow-hidden shadow-inner">
                                                {/* Glowing sentiment bar */}
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0 }}
                                                    animate={{
                                                        width: getSentimentBarWidth(item.sentiment),
                                                        opacity: 1
                                                    }}
                                                    transition={{
                                                        duration: 1.2,
                                                        delay: index * 0.1,
                                                        type: "spring",
                                                        stiffness: 50
                                                    }}
                                                    className={`h-full bg-gradient-to-r ${getSentimentColor(item.sentiment)} ${getSentimentGlow(item.sentiment)} relative overflow-hidden rounded-full`}
                                                >
                                                    {/* Animated shimmer effect */}
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                        animate={{ x: [-100, 200] }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: index * 0.3,
                                                            ease: "linear"
                                                        }}
                                                        style={{ width: '50px' }}
                                                    />

                                                    {/* Intensity overlay */}
                                                    <div
                                                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-70"
                                                        style={{ width: `${item.intensity}%` }}
                                                    />
                                                </motion.div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-cyan-300 w-10 text-right drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]">
                                            {item.sentiment}%
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mentionsData.map((item, index) => (
                            <motion.div
                                key={item.tag}
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.08, duration: 0.4, type: "spring", stiffness: 100 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative bg-slate-900/40 backdrop-blur-sm border border-slate-700/30 rounded-lg p-3 hover:border-purple-500/40 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-mono font-bold text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">
                                                {item.tag}
                                            </span>
                                            {getTrendingIcon(item.trending!)}
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs font-mono text-purple-300 bg-purple-400/10 px-2 py-1 rounded border border-purple-400/20">
                                                {item.mentions}
                                            </span>
                                            <span className={`text-xs font-mono font-semibold ${item.trending === 'up' ? 'text-green-400' : item.trending === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {item.change}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1 relative">
                                            {/* Background bar with depth */}
                                            <div className="h-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full border border-slate-600/30 overflow-hidden shadow-inner">
                                                {/* Glowing sentiment bar */}
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0 }}
                                                    animate={{
                                                        width: getSentimentBarWidth(item.sentiment),
                                                        opacity: 1
                                                    }}
                                                    transition={{
                                                        duration: 1.2,
                                                        delay: index * 0.1,
                                                        type: "spring",
                                                        stiffness: 50
                                                    }}
                                                    className={`h-full bg-gradient-to-r ${getSentimentColor(item.sentiment)} ${getSentimentGlow(item.sentiment)} relative overflow-hidden rounded-full`}
                                                >
                                                    {/* Animated shimmer effect */}
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                        animate={{ x: [-100, 200] }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: index * 0.3,
                                                            ease: "linear"
                                                        }}
                                                        style={{ width: '50px' }}
                                                    />

                                                    {/* Intensity overlay */}
                                                    <div
                                                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-70"
                                                        style={{ width: `${item.intensity}%` }}
                                                    />
                                                </motion.div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-purple-300 w-10 text-right drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]">
                                            {item.sentiment}%
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Overall Sentiment */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 border-t border-cyan-500/20 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-cyan-400/5 to-emerald-400/5" />
                <div className="flex items-center justify-between relative z-10">
                    <div className="text-xs font-mono text-cyan-200/80 uppercase tracking-wider drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">
                        Overall Market Sentiment
                    </div>
                    <div className="flex items-center space-x-3">
                        <motion.div
                            className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                            animate={{
                                scale: [1, 1.3, 1],
                                boxShadow: [
                                    '0 0 12px rgba(52,211,153,0.8)',
                                    '0 0 20px rgba(52,211,153,1)',
                                    '0 0 12px rgba(52,211,153,0.8)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-sm font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
                            {overallSentiment}
                        </span>
                        <div className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/30 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                            +24.7%
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
