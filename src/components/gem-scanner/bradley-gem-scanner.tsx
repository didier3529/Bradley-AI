"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { motion } from 'framer-motion'
import { Eye, Lock, Search, Star } from "lucide-react"
import { useEffect, useState } from "react"

interface Gem {
  name: string
  symbol: string
  price: string
  change: string
  aiScore: number
  foundTime: string
  status: "BULLISH" | "BEARISH" | "NEUTRAL"
  isNew?: boolean
  volume: string
  marketCap: string
}

const cryptoGems: Gem[] = [
  {
    name: "AiQuantum",
    symbol: "AIQT",
    price: "$0.0034",
    change: "+156%",
    aiScore: 91,
    foundTime: "23m ago",
    status: "BULLISH",
    isNew: true,
    volume: "$2.4M",
    marketCap: "$45.2M",
  },
  {
    name: "MetaFloki",
    symbol: "MFLOKI",
    price: "$0.089",
    change: "+234%",
    aiScore: 87,
    foundTime: "1h ago",
    status: "BULLISH",
    volume: "$8.7M",
    marketCap: "$123.5M",
  },
  {
    name: "RocketDoge",
    symbol: "RDOGE",
    price: "$0.0012",
    change: "+89%",
    aiScore: 83,
    foundTime: "45m ago",
    status: "BULLISH",
    volume: "$1.2M",
    marketCap: "$34.8M",
  },
  {
    name: "DiamondHands",
    symbol: "DIAMOND",
    price: "$0.45",
    change: "+178%",
    aiScore: 94,
    foundTime: "15m ago",
    status: "BULLISH",
    isNew: true,
    volume: "$5.6M",
    marketCap: "$89.1M",
  },
]

const memeGems: Gem[] = [
  {
    name: "PepeCoin2.0",
    symbol: "PEPE2",
    price: "$0.0001",
    change: "+445%",
    aiScore: 89,
    foundTime: "12m ago",
    status: "BULLISH",
    isNew: true,
    volume: "$12.3M",
    marketCap: "$234.7M",
  },
  {
    name: "DogeKiller",
    symbol: "DOGEK",
    price: "$0.023",
    change: "+267%",
    aiScore: 85,
    foundTime: "34m ago",
    status: "BULLISH",
    volume: "$6.8M",
    marketCap: "$156.2M",
  },
  {
    name: "FlokiMoon",
    symbol: "FLOKM",
    price: "$0.0008",
    change: "+356%",
    aiScore: 92,
    foundTime: "8m ago",
    status: "BULLISH",
    isNew: true,
    volume: "$9.1M",
    marketCap: "$187.4M",
  },
]

export function BradleyGemScanner() {
  const [activeTab, setActiveTab] = useState<'crypto' | 'meme' | 'defi'>('crypto')
  const [gemsFound, setGemsFound] = useState(47)
  const [isPremium, setIsPremium] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGemsFound((prev) => prev + Math.floor(Math.random() * 3))
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Auto-hide preview after 5 seconds
  useEffect(() => {
    if (showPreview && !isPremium) {
      const timer = setTimeout(() => {
        setShowPreview(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showPreview, isPremium])

  const handleRefresh = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BULLISH":
        return "bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-mono"
      case "BEARISH":
        return "bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-mono"
      default:
        return "bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs font-mono"
    }
  }

  const currentGems = activeTab === 'crypto' ? cryptoGems : activeTab === 'meme' ? memeGems : []
  const premiumGems = currentGems.filter(gem => gem.aiScore >= 75)
  const visibleGems = isPremium || showPreview ? currentGems : currentGems.slice(0, 2)

  return (
    <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-black" />
              </div>
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
            </div>
            <div>
              <CardTitle className="text-lg font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                GEM SCANNER
              </CardTitle>
              <p className="text-xs text-slate-400">
                {isPremium ? "AI-Powered Gem Discovery" : "Premium Feature"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LiveIndicator
              isLive={!isScanning}
              isLoading={isScanning}
              onRefresh={handleRefresh}
              showRefresh={true}
              size="sm"
            />
            <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="font-mono">{gemsFound} GEMS</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-700/30 rounded-lg p-1 mt-4">
          {(['crypto', 'meme', 'defi'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-cyan-400 hover:bg-slate-600/30"
              }`}
            >
              {tab} GEMS
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* Premium Overlay */}
        {!isPremium && !showPreview && premiumGems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10"
          >
            <div className="text-center p-6">
              <Lock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-mono font-bold text-white mb-2">PREMIUM GEMS LOCKED</h3>
              <p className="text-slate-400 mb-4 text-sm">
                Unlock {premiumGems.length} high-potential gems with AI scores 75%+
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Eye className="w-3 h-3 mr-2" />
                  Preview (5s)
                </Button>
                <Button
                  onClick={() => setIsPremium(true)}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-mono"
                >
                  <Star className="w-3 h-3 mr-2" />
                  Upgrade
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview Timer */}
        {showPreview && !isPremium && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs border border-cyan-500/30">
              <Eye className="w-3 h-3 inline mr-1" />
              PREVIEW
            </div>
          </div>
        )}

        {/* Gem Table */}
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-2 px-3 py-2 border-b border-slate-700/50 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <div>ASSET</div>
            <div>PRICE</div>
            <div>CHANGE</div>
            <div>AI SCORE</div>
            <div>STATUS</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {visibleGems.map((gem, index) => (
              <motion.div
                key={`${gem.symbol}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-5 gap-2 px-3 py-2 hover:bg-slate-700/20 rounded transition-colors duration-200 group"
              >
                {/* Asset */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                    {gem.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-white font-mono text-sm">{gem.symbol}</div>
                    <div className="text-slate-400 text-xs truncate">{gem.name}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center">
                  <span className="text-white font-mono text-sm">{gem.price}</span>
                </div>

                {/* Change */}
                <div className="flex items-center">
                  <div
                    className={`px-2 py-1 rounded text-xs font-mono ${
                      gem.change.startsWith("+") ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {gem.change}
                  </div>
                </div>

                {/* AI Score */}
                <div className="flex items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-cyan-400 font-mono font-bold text-sm">{gem.aiScore}%</span>
                    {gem.aiScore >= 90 && <Star className="w-3 h-3 text-yellow-400" />}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <span className={getStatusColor(gem.status)}>{gem.status}</span>
                  {gem.isNew && (
                    <span className="ml-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 py-0.5 rounded text-xs animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Show limited results message for non-premium */}
          {!isPremium && !showPreview && currentGems.length > 2 && (
            <div className="text-center py-3 border-t border-slate-700/50">
              <p className="text-slate-400 text-xs">
                Showing 2 of {currentGems.length} gems • <button
                  onClick={() => setIsPremium(true)}
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Upgrade for full access
                </button>
              </p>
            </div>
          )}

          {/* Table Footer */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="font-mono">SCAN: {currentGems.length} ASSETS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="font-mono">FEEDS ACTIVE</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
