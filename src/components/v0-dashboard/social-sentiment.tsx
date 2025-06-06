"use client"

import { useHydration } from '@/components/ui/hydration-safe'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SentimentData {
    tag: string
    mentions: string
    sentiment: number
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
        { tag: '#Bitcoin', mentions: '45.2K', sentiment: 72 },
        { tag: '#Ethereum', mentions: '32.1K', sentiment: 68 },
        { tag: '#NFTs', mentions: '28.4K', sentiment: 81 },
        { tag: '#DeFi', mentions: '19.8K', sentiment: 75 },
    ]

    const mentionsData: SentimentData[] = [
        { tag: 'Bitcoin (BTC)', mentions: '0.3821 BTC', sentiment: 72 },
        { tag: 'Ethereum (ETH)', mentions: '6.2450 ETH', sentiment: 68 },
        { tag: 'Solana (SOL)', mentions: '45.12 SOL', sentiment: 81 },
    ]

    const getSentimentColor = (sentiment: number) => {
        if (sentiment >= 75) return 'bg-green-400'
        if (sentiment >= 50) return 'bg-yellow-400'
        return 'bg-red-400'
    }

    const getSentimentBarWidth = (sentiment: number) => {
        return `${sentiment}%`
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
                <div className="flex items-center space-x-2">
                    <img
                        src={`/images/section-logos/social-sentiment.png${cacheBustParam}`}
                        alt="Social Sentiment"
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                            // Fallback to original icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <MessageCircle className="h-4 w-4 text-cyan-400 hidden" />
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wide">
                        Social Sentiment
                    </h3>
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-700/30">
                <button
                    onClick={() => setActiveTab('trending')}
                    className={`flex-1 px-4 py-2 text-xs font-mono font-semibold uppercase transition-colors ${activeTab === 'trending'
                        ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Trending
                </button>
                <button
                    onClick={() => setActiveTab('mentions')}
                    className={`flex-1 px-4 py-2 text-xs font-mono font-semibold uppercase transition-colors ${activeTab === 'mentions'
                        ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Mentions
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === 'trending' ? (
                    <div className="space-y-3">
                        {trendingData.map((item, index) => (
                            <motion.div
                                key={item.tag}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-mono font-semibold text-white">
                                            {item.tag}
                                        </span>
                                        <span className="text-xs font-mono text-gray-400">
                                            {item.mentions}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: getSentimentBarWidth(item.sentiment) }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                                className={`h-1.5 rounded-full ${getSentimentColor(item.sentiment)}`}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-gray-400 w-8">
                                            {item.sentiment}%
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mentionsData.map((item, index) => (
                            <motion.div
                                key={item.tag}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-mono font-semibold text-white">
                                            {item.tag}
                                        </span>
                                        <span className="text-xs font-mono text-gray-400">
                                            {item.mentions}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: getSentimentBarWidth(item.sentiment) }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                                className={`h-1.5 rounded-full ${getSentimentColor(item.sentiment)}`}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-gray-400 w-8">
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
            <div className="px-4 py-3 bg-slate-900/30 border-t border-slate-700/30">
                <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        Overall Sentiment
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-mono font-bold text-green-400">
                            {overallSentiment}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
