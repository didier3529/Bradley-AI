"use client"

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function DominanceCards() {
    const [btcDominance, setBtcDominance] = useState(58.4)
    const [ethDominance, setEthDominance] = useState(12.8)

    // Simulate slight fluctuations in dominance
    useEffect(() => {
        const interval = setInterval(() => {
            setBtcDominance(prev => prev + (Math.random() - 0.5) * 0.2)
            setEthDominance(prev => prev + (Math.random() - 0.5) * 0.1)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const dominanceData = [
        {
            symbol: "BTC",
            name: "Dominance",
            value: btcDominance,
            icon: "₿",
            color: "from-orange-500 to-yellow-600",
            textColor: "text-orange-400"
        },
        {
            symbol: "ETH",
            name: "Dominance",
            value: ethDominance,
            icon: "Ξ",
            color: "from-blue-500 to-purple-600",
            textColor: "text-blue-400"
        }
    ]

    return (
        <div className="grid grid-cols-1 gap-4">
            {dominanceData.map((item, index) => (
                <motion.div
                    key={item.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 relative overflow-hidden hover:bg-slate-800/80 transition-all duration-300"
                >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-5`}></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className={`text-lg font-mono font-bold ${item.textColor}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div className="text-sm font-mono font-semibold text-white">
                                        {item.symbol}
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">
                                        {item.name}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`text-lg font-mono font-bold ${item.textColor}`}>
                                    {item.value.toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                                className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                            />
                        </div>
                    </div>

                    {/* Glow effect */}
                    <div className={`absolute -bottom-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-r ${item.color} opacity-20 blur-xl`}></div>
                </motion.div>
            ))}
        </div>
    )
} 