"use client"

import { WalletConnection } from '@/components/wallet-connection'
import { motion } from 'framer-motion'

export function BradleyAIHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
        >
            {/* Bradley AI Logo and Branding */}
            <div className="flex items-center space-x-4">
                {/* Bradley AI Avatar */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-1">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            <img
                                src="/bradley-logo.png"
                                alt="Bradley AI"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                </div>

                {/* Bradley AI Title */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-white"
                    >
                        <h1 className="text-4xl font-bold tracking-tight">
                            BRADLEY AI
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-sm text-slate-400 mt-1"
                    >
                        Advanced Cryptocurrency Intelligence Platform
                    </motion.p>
                </div>
            </div>

            {/* Connection Status and Wallet */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center space-x-6"
            >
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
