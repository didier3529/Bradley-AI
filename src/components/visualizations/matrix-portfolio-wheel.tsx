'use client'

/**
 * Matrix Portfolio Wheel
 * Main circular portfolio display with dynamic token arrangements
 * Matrix-style information overlay and blue-themed connection trails
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MATRIX_COLORS,
  MATRIX_TIMINGS,
  type MatrixNode,
  type MatrixConnection,
  type MatrixVisualizationConfig
} from '@/lib/visualization/matrix-core'
import {
  calculateMultiRingLayout,
  calculateConnections,
  calculateNodeSizes,
  type LayoutConfig
} from '@/lib/visualization/calculations'
import MatrixCircularEngine from './matrix-circular-engine'
import MatrixTokenNode from './matrix-token-node'

export interface PortfolioData {
  tokens: {
    id: string
    symbol: string
    name: string
    balance: number
    valueUSD: number
    change24h: number
    marketCap?: number
    volume24h?: number
    riskLevel: 'low' | 'medium' | 'high'
    category?: string
  }[]
  totalValue: number
  totalChange24h: number
  lastUpdate: number
}

export interface MatrixPortfolioWheelProps {
  portfolioData: PortfolioData
  config?: Partial<MatrixVisualizationConfig>
  onTokenSelect?: (token: any) => void
  onConnectionHighlight?: (connection: MatrixConnection) => void
  className?: string
  style?: React.CSSProperties
}

export default function MatrixPortfolioWheel({
  portfolioData,
  config = {},
  onTokenSelect,
  onConnectionHighlight,
  className = '',
  style = {}
}: MatrixPortfolioWheelProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'wheel' | 'canvas'>('canvas')
  const [layoutMode, setLayoutMode] = useState<'value' | 'risk' | 'category'>('value')

  // Transform portfolio data to Matrix nodes
  const matrixNodes = useMemo<MatrixNode[]>(() => {
    if (!portfolioData.tokens.length) return []

    return portfolioData.tokens.map(token => ({
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      position: { x: 0, y: 0 }, // Will be calculated by layout
      size: 40, // Base size, will be scaled by layout
      color: MATRIX_COLORS.nodes.primary,
      value: token.valueUSD,
      change24h: token.change24h,
      weight: token.valueUSD / portfolioData.totalValue,
      metadata: {
        portfolioWeight: token.valueUSD / portfolioData.totalValue,
        performanceCategory: token.change24h > 0 ? 'up' : token.change24h < 0 ? 'down' : 'stable',
        riskLevel: token.riskLevel,
        marketCap: token.marketCap,
        volume24h: token.volume24h
      },
      connections: [],
      animation: {
        pulse: false,
        glow: false,
        rotation: 0
      }
    }))
  }, [portfolioData])

  // Calculate node sizes based on portfolio weights
  const sizedNodes = useMemo(() => {
    if (!matrixNodes.length) return []
    
    return calculateNodeSizes(
      matrixNodes,
      layoutMode === 'value' ? 'value' : 
      layoutMode === 'risk' ? 'weight' : 'value',
      30,
      100
    )
  }, [matrixNodes, layoutMode])

  // Calculate connections between tokens
  const connections = useMemo(() => {
    if (!sizedNodes.length) return []
    
    return calculateConnections(sizedNodes, 0.5) // Lower threshold for more connections
  }, [sizedNodes])

  // Group tokens by category for constellation layout
  const tokenGroups = useMemo(() => {
    const groups: { [key: string]: string[] } = {}
    
    sizedNodes.forEach(node => {
      const category = portfolioData.tokens.find(t => t.id === node.id)?.category || 'other'
      if (!groups[category]) groups[category] = []
      groups[category].push(node.id)
    })
    
    return groups
  }, [sizedNodes, portfolioData.tokens])

  // Handle token interactions
  const handleTokenClick = useCallback((node: MatrixNode) => {
    setSelectedToken(node.id)
    onTokenSelect?.(portfolioData.tokens.find(t => t.id === node.id))
  }, [onTokenSelect, portfolioData.tokens])

  const handleTokenHover = useCallback((node: MatrixNode | null) => {
    setHoveredToken(node?.id || null)
  }, [])

  // Portfolio stats for display
  const portfolioStats = useMemo(() => {
    const gainers = portfolioData.tokens.filter(t => t.change24h > 0).length
    const losers = portfolioData.tokens.filter(t => t.change24h < 0).length
    const stable = portfolioData.tokens.length - gainers - losers
    
    return { gainers, losers, stable }
  }, [portfolioData.tokens])

  return (
    <div className={`matrix-portfolio-wheel relative w-full h-full ${className}`} style={style}>
      {/* Portfolio Header */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <motion.div
          className="bg-black/80 border border-cyan-400/30 rounded px-3 py-2 font-mono text-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-cyan-400 font-bold">Portfolio Overview</div>
          <div className="text-white">
            Total Value: ${portfolioData.totalValue.toLocaleString()}
          </div>
          <div className={`${portfolioData.totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            24h Change: {portfolioData.totalChange24h >= 0 ? '+' : ''}{portfolioData.totalChange24h.toFixed(2)}%
          </div>
        </motion.div>

        <motion.div
          className="bg-black/80 border border-cyan-400/30 rounded px-3 py-2 font-mono text-xs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-cyan-400">Market Status</div>
          <div className="flex gap-4 text-white">
            <span className="text-green-400">↑{portfolioStats.gainers}</span>
            <span className="text-red-400">↓{portfolioStats.losers}</span>
            <span className="text-gray-400">→{portfolioStats.stable}</span>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <motion.div
          className="bg-black/80 border border-cyan-400/30 rounded p-2 font-mono text-xs"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-cyan-400 mb-2">View Mode</div>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-2 py-1 rounded text-xs transition-all ${
                viewMode === 'canvas'
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400'
                  : 'text-gray-400 hover:text-cyan-400'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setViewMode('wheel')}
              className={`px-2 py-1 rounded text-xs transition-all ${
                viewMode === 'wheel'
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400'
                  : 'text-gray-400 hover:text-cyan-400'
              }`}
            >
              Wheel
            </button>
          </div>
        </motion.div>

        <motion.div
          className="bg-black/80 border border-cyan-400/30 rounded p-2 font-mono text-xs"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-cyan-400 mb-2">Layout</div>
          <div className="flex flex-col gap-1">
            {(['value', 'risk', 'category'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setLayoutMode(mode)}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  layoutMode === mode
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400'
                    : 'text-gray-400 hover:text-cyan-400'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Visualization */}
      <div className="w-full h-full">
        {viewMode === 'canvas' ? (
          <MatrixCircularEngine
            data={sizedNodes}
            connections={connections}
            config={{
              ...config,
              enableParticles: true,
              enableGlitchEffects: true,
              nodeStyle: 'cyberpunk',
              connectionStyle: 'digital-trails'
            }}
            onNodeClick={handleTokenClick}
            onNodeHover={handleTokenHover}
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            {/* Manual wheel layout for alternative view */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ width: '600px', height: '600px' }}>
                {sizedNodes.map((node, index) => {
                  const angle = (index / sizedNodes.length) * 2 * Math.PI
                  const radius = 250
                  const x = 300 + radius * Math.cos(angle)
                  const y = 300 + radius * Math.sin(angle)

                  return (
                    <MatrixTokenNode
                      key={node.id}
                      node={{
                        ...node,
                        position: { x, y }
                      }}
                      isHovered={hoveredToken === node.id}
                      isSelected={selectedToken === node.id}
                      isConnected={connections.some(c => 
                        (c.source === node.id || c.target === node.id) &&
                        (hoveredToken === c.source || hoveredToken === c.target)
                      )}
                      onClick={handleTokenClick}
                      onHover={handleTokenHover}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Token Details Panel */}
      <AnimatePresence>
        {selectedToken && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const token = portfolioData.tokens.find(t => t.id === selectedToken)
              if (!token) return null

              return (
                <div className="bg-black/90 border border-cyan-400/30 rounded p-4 font-mono">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-cyan-400 font-bold text-lg">{token.symbol}</h3>
                      <p className="text-gray-400 text-sm">{token.name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedToken(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Balance</div>
                      <div className="text-white">{token.balance.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Value USD</div>
                      <div className="text-white">${token.valueUSD.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">24h Change</div>
                      <div className={token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Portfolio %</div>
                      <div className="text-white">
                        {((token.valueUSD / portfolioData.totalValue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-cyan-400/20">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: token.riskLevel === 'low' ? 
                              MATRIX_COLORS.nodes.success :
                              token.riskLevel === 'high' ?
                                MATRIX_COLORS.nodes.error :
                                MATRIX_COLORS.nodes.warning
                          }}
                        />
                        <span className="text-gray-400">Risk: {token.riskLevel}</span>
                      </div>
                      {token.category && (
                        <div className="text-gray-400">Category: {token.category}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Info */}
      <AnimatePresence>
        {hoveredToken && connections.some(c => c.source === hoveredToken || c.target === hoveredToken) && (
          <motion.div
            className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-black/90 border border-cyan-400/30 rounded p-3 font-mono text-xs max-w-xs">
              <div className="text-cyan-400 font-bold mb-2">Connections</div>
              {connections
                .filter(c => c.source === hoveredToken || c.target === hoveredToken)
                .slice(0, 3)
                .map(connection => {
                  const connectedId = connection.source === hoveredToken ? connection.target : connection.source
                  const connectedToken = portfolioData.tokens.find(t => t.id === connectedId)
                  
                  return (
                    <div key={connection.id} className="text-white mb-1">
                      → {connectedToken?.symbol} ({(connection.strength * 100).toFixed(0)}%)
                    </div>
                  )
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 