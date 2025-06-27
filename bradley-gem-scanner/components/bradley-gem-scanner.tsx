"use client"

import { useState, useEffect } from "react"
import { Search, TrendingUp, Target, BarChart3, Eye, Lock, Unlock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
    name: "CryptoSafu",
    symbol: "SAFU",
    price: "$0.067",
    change: "-12%",
    aiScore: 76,
    foundTime: "2h ago",
    status: "BEARISH",
    volume: "$890K",
    marketCap: "$67.3M",
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
    name: "ShibaAI",
    symbol: "SHIBAI",
    price: "$0.56",
    change: "+123%",
    aiScore: 81,
    foundTime: "1h ago",
    status: "BULLISH",
    volume: "$3.4M",
    marketCap: "$78.9M",
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
  {
    name: "SafePepe",
    symbol: "SAPEPE",
    price: "$0.19",
    change: "-8%",
    aiScore: 74,
    foundTime: "3h ago",
    status: "BEARISH",
    volume: "$1.7M",
    marketCap: "$45.6M",
  },
]

export default function BradleyGemScanner() {
  const [activeTab, setActiveTab] = useState("crypto")
  const [gemsFound, setGemsFound] = useState(47)
  const [isPremium, setIsPremium] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGemsFound((prev) => prev + Math.floor(Math.random() * 3))
    }, 8000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BULLISH":
        return "bg-emerald-500 text-black font-medium px-3 py-1 rounded-full text-xs"
      case "BEARISH":
        return "bg-red-500 text-white font-medium px-3 py-1 rounded-full text-xs"
      default:
        return "bg-gray-500 text-white font-medium px-3 py-1 rounded-full text-xs"
    }
  }

  const renderLockedGemTable = (gems: Gem[]) => (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 backdrop-blur-sm relative">
      {/* Overlay for locked content */}
      {!isPremium && !showPreview && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
          <div className="text-center p-8">
            <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Premium Gems Locked</h3>
            <p className="text-slate-400 mb-6">Unlock {gems.length} high-potential gems with AI scores 75%+</p>
            <div className="space-y-3">
              <Button
                onClick={() => setShowPreview(true)}
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Gems (5s)
              </Button>
              <Button
                onClick={() => setIsPremium(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold"
              >
                <Star className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview timer */}
      {showPreview && !isPremium && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm border border-cyan-500/30">
            <Eye className="w-3 h-3 inline mr-1" />
            Preview Mode
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-slate-700/50 text-sm font-medium text-slate-400 uppercase tracking-wider">
        <div>ASSET</div>
        <div>PRICE_USD</div>
        <div>DELTA_24H</div>
        <div>VOLUME</div>
        <div>CAP</div>
        <div>AI_SCORE</div>
        <div>STATUS</div>
      </div>

      {/* Table Rows */}
      <div className={`divide-y divide-slate-700/30 ${!isPremium && !showPreview ? "blur-sm" : ""}`}>
        {gems.map((gem, index) => (
          <div
            key={index}
            className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors duration-200 group"
          >
            {/* Asset */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                {gem.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="text-white font-medium">{gem.symbol}</div>
                <div className="text-slate-400 text-sm">{gem.name}</div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center">
              <span className="text-white font-mono">{gem.price}</span>
            </div>

            {/* Delta 24H */}
            <div className="flex items-center">
              <div
                className={`px-2 py-1 rounded text-sm font-mono ${
                  gem.change.startsWith("+") ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {gem.change}
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center">
              <span className="text-slate-300 font-mono text-sm">{gem.volume}</span>
            </div>

            {/* Market Cap */}
            <div className="flex items-center">
              <span className="text-slate-300 font-mono text-sm">{gem.marketCap}</span>
            </div>

            {/* AI Score */}
            <div className="flex items-center">
              <span className="text-cyan-400 font-bold">{gem.aiScore}%</span>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <span className={getStatusColor(gem.status)}>{gem.status}</span>
              {gem.isNew && (
                <span className="ml-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded text-xs animate-pulse">
                  NEW
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer */}
      <div className="px-6 py-3 border-t border-slate-700/50 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-cyan-400">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span>[ GEM_SCAN: {gems.length} ASSETS ]</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span>[ FEEDS_ACTIVE ]</span>
        </div>
      </div>
    </div>
  )

  // Auto-hide preview after 5 seconds
  useEffect(() => {
    if (showPreview && !isPremium) {
      const timer = setTimeout(() => {
        setShowPreview(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showPreview, isPremium])

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Gems Found Today */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">GEMS FOUND TODAY</h3>
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{gemsFound}</div>
              <div className="text-emerald-400 text-sm font-medium">+12.4%</div>
            </CardContent>
          </Card>

          {/* Total Gem Value */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">TOTAL GEM VALUE</h3>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{isPremium ? "$2.4M" : "***"}</div>
              <div className="text-emerald-400 text-sm font-medium">{isPremium ? "+8.7%" : "Premium Only"}</div>
            </CardContent>
          </Card>

          {/* AI Accuracy */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">AI ACCURACY</h3>
                <Target className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">94.2%</div>
              <div className="text-emerald-400 text-sm font-medium">+2.1%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Full Width */}
        <div className="space-y-8">
          {/* Gem Scanner Header */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Search className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      GEM SCANNER
                      {!isPremium && <Lock className="w-4 h-4 text-yellow-400" />}
                      {isPremium && <Unlock className="w-4 h-4 text-emerald-400" />}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {isPremium ? "AI-Powered Hidden Gem Discovery" : "Premium Feature - Upgrade to Access"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  SCANNING
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-slate-700/30 rounded-lg p-1 mb-6">
                {[
                  { id: "crypto", label: "CRYPTO GEMS" },
                  { id: "meme", label: "MEME GEMS" },
                  { id: "trending", label: "TRENDING" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm ${
                      activeTab === tab.id
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-600/30"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gem Table */}
          {activeTab === "crypto" && renderLockedGemTable(cryptoGems)}
          {activeTab === "meme" && renderLockedGemTable(memeGems)}
          {activeTab === "trending" && (
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center text-slate-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Trending analysis coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
