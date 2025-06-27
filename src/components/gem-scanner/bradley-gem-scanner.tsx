"use client"

import { motion } from 'framer-motion'
import { Search, TrendingUp, Target, BarChart3, RefreshCw, Eye, Lock, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Gem {
  name: string
  symbol: string
  price: string
  change: string
  aiScore: number
  foundTime: string
  status: 'rising' | 'falling' | 'stable'
  isNew: boolean
}

const mockGems: Record<string, Gem[]> = {
  crypto: [
    { name: 'Solana', symbol: 'SOL', price: '$98.45', change: '+12.3%', aiScore: 87, foundTime: '2m ago', status: 'rising', isNew: true },
    { name: 'Chainlink', symbol: 'LINK', price: '$14.82', change: '+8.7%', aiScore: 82, foundTime: '5m ago', status: 'rising', isNew: false },
    { name: 'Polygon', symbol: 'MATIC', price: '$0.87', change: '+15.2%', aiScore: 79, foundTime: '8m ago', status: 'rising', isNew: false }
  ],
  meme: [
    { name: 'Pepe Coin', symbol: 'PEPE', price: '$0.00001245', change: '+45.2%', aiScore: 91, foundTime: '1m ago', status: 'rising', isNew: true },
    { name: 'Shiba Inu', symbol: 'SHIB', price: '$0.00000842', change: '+23.8%', aiScore: 76, foundTime: '3m ago', status: 'rising', isNew: false }
  ],
  defi: [
    { name: 'Uniswap', symbol: 'UNI', price: '$6.34', change: '+9.1%', aiScore: 84, foundTime: '4m ago', status: 'rising', isNew: false },
    { name: 'Aave', symbol: 'AAVE', price: '$89.23', change: '+11.5%', aiScore: 78, foundTime: '6m ago', status: 'rising', isNew: false }
  ]
}

export const BradleyGemScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'meme' | 'defi'>('crypto')
  const [isScanning, setIsScanning] = useState(false)
  const [isPremium] = useState(false) // Mock premium status
  const [showPreview, setShowPreview] = useState(false)
  const [previewTimer, setPreviewTimer] = useState<NodeJS.Timeout | null>(null)

  const currentGems = mockGems[activeTab] || []
  const premiumGems = currentGems.filter(gem => gem.aiScore >= 75)

  const handleRefresh = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 2000) // Mock scan time
  }

  const handlePreview = () => {
    if (previewTimer) {
      clearTimeout(previewTimer)
    }
    setShowPreview(true)
    const timer = setTimeout(() => {
      setShowPreview(false)
    }, 5000)
    setPreviewTimer(timer)
  }

  const handleUpgrade = () => {
    window.open('/premium', '_blank')
  }

  useEffect(() => {
    return () => {
      if (previewTimer) {
        clearTimeout(previewTimer)
      }
    }
  }, [previewTimer])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gradient-to-br from-black/90 via-slate-900/80 to-black/90 shadow-2xl shadow-cyan-500/20 backdrop-blur-md"
    >
      {/* Header */}
      <div className="relative flex items-center justify-between p-6 border-b border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 text-black" />
            </div>
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              GEM SCANNER
            </h2>
            <p className="text-xs text-slate-400">
              {isPremium ? "AI-Powered Hidden Gem Discovery" : "Premium Feature - Limited Access"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={isScanning}
            className="flex items-center space-x-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-600 hover:border-cyan-500/50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="text-xs text-cyan-400 font-mono">
              {isScanning ? 'SCANNING...' : 'LIVE'}
            </span>
          </button>
          <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="font-mono">{currentGems.length} GEMS</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        {(['crypto', 'meme', 'defi'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative">
        {/* Gem Table */}
        <div className="p-4 space-y-3">
          {isScanning ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="text-cyan-400 font-mono">Scanning for gems...</span>
              </div>
            </div>
          ) : (
            currentGems.map((gem, index) => (
              <div
                key={gem.symbol}
                className={`flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 transition-all hover:border-cyan-500/30 ${
                  !isPremium && !showPreview && gem.aiScore >= 75 ? 'opacity-30 blur-sm' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">{gem.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white">{gem.name}</span>
                      {gem.isNew && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">NEW</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{gem.symbol} • Found {gem.foundTime}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white">{gem.price}</div>
                  <div className={`text-sm font-mono ${gem.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {gem.change}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono text-cyan-400">{gem.aiScore}%</div>
                  <div className="text-xs text-slate-400">AI Score</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Premium Overlay */}
        {!isPremium && !showPreview && premiumGems.length > 0 && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
            <div className="text-center p-8">
              <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-mono font-bold text-white mb-2">PREMIUM GEMS LOCKED</h3>
              <p className="text-slate-400 mb-6">
                Unlock {premiumGems.length} high-potential gems with AI scores 75%+
              </p>
              <div className="space-y-3">
                <button
                  onClick={handlePreview}
                  className="flex items-center space-x-2 px-6 py-3 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Gems (5s)</span>
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>Upgrade to Premium</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Add default export for compatibility
export default BradleyGemScanner
