'use client'

/**
 * Matrix Info Panel
 * Slide-out information displays with Matrix glass morphism styling
 * Real-time data updates and interactive charts with blue accents
 */

import React, { memo, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MATRIX_COLORS,
  MATRIX_TIMINGS,
  MATRIX_EASING,
  type MatrixNode,
  type MatrixConnection
} from '@/lib/visualization/matrix-core'

export interface InfoPanelData {
  node?: MatrixNode
  connection?: MatrixConnection
  globalStats?: {
    totalNodes: number
    totalConnections: number
    averageStrength: number
    performanceMetrics: {
      fps: number
      memoryUsage: number
      renderTime: number
    }
  }
}

export interface MatrixInfoPanelProps {
  data: InfoPanelData | null
  isVisible: boolean
  position?: 'left' | 'right' | 'bottom'
  onClose?: () => void
  className?: string
  style?: React.CSSProperties
}

export default function MatrixInfoPanel({
  data,
  isVisible,
  position = 'right',
  onClose,
  className = '',
  style = {}
}: MatrixInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'metrics' | 'connections'>('details')

  // Animation variants based on position
  const panelVariants = {
    hidden: {
      x: position === 'left' ? '-100%' : position === 'right' ? '100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
      opacity: 0
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    exit: {
      x: position === 'left' ? '-100%' : position === 'right' ? '100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
      opacity: 0,
      transition: {
        duration: MATRIX_TIMINGS.normal / 1000,
        ease: MATRIX_EASING.smooth
      }
    }
  }

  // Panel content based on data type
  const panelContent = useMemo(() => {
    if (!data) return null

    if (data.node) {
      return <NodeInfoPanel node={data.node} activeTab={activeTab} onTabChange={setActiveTab} />
    }

    if (data.connection) {
      return <ConnectionInfoPanel connection={data.connection} />
    }

    if (data.globalStats) {
      return <GlobalStatsPanel stats={data.globalStats} />
    }

    return null
  }, [data, activeTab])

  if (!isVisible || !data) return null

  return (
    <AnimatePresence>
      <motion.div
        className={`matrix-info-panel fixed z-50 ${
          position === 'left' ? 'left-0 top-0 h-full' :
          position === 'right' ? 'right-0 top-0 h-full' :
          'bottom-0 left-0 w-full'
        } ${className}`}
        style={{
          width: position !== 'bottom' ? '400px' : 'auto',
          height: position === 'bottom' ? '300px' : 'auto',
          ...style
        }}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Glass morphism container */}
        <div
          className="h-full bg-black/90 backdrop-blur-xl border-l border-cyan-400/30 flex flex-col"
          style={{
            boxShadow: 'inset 0 0 50px rgba(0, 212, 255, 0.1), 0 0 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-400/20">
            <h2 className="text-cyan-400 font-mono font-bold text-lg">
              {data.node ? 'Token Details' :
               data.connection ? 'Connection Info' :
               'System Metrics'}
            </h2>
            {onClose && (
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {panelContent}
          </div>

          {/* Matrix decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(${MATRIX_COLORS.effects.glow} 1px, transparent 1px),
                  linear-gradient(90deg, ${MATRIX_COLORS.effects.glow} 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Node information panel
interface NodeInfoPanelProps {
  node: MatrixNode
  activeTab: 'details' | 'metrics' | 'connections'
  onTabChange: (tab: 'details' | 'metrics' | 'connections') => void
}

const NodeInfoPanel = memo(function NodeInfoPanel({
  node,
  activeTab,
  onTabChange
}: NodeInfoPanelProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-cyan-400/20">
        {(['details', 'metrics', 'connections'] as const).map(tab => (
          <motion.button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'details' && <NodeDetails node={node} />}
          {activeTab === 'metrics' && <NodeMetrics node={node} />}
          {activeTab === 'connections' && <NodeConnections node={node} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
})

// Node details component
const NodeDetails = memo(function NodeDetails({ node }: { node: MatrixNode }) {
  return (
    <div className="space-y-4">
      {/* Header with symbol and color indicator */}
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-full"
          style={{
            background: node.color,
            boxShadow: `0 0 15px ${node.color}`
          }}
        />
        <div>
          <h3 className="text-white font-mono font-bold text-xl">{node.symbol}</h3>
          <p className="text-gray-400 text-sm">{node.name}</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Current Value"
          value={`$${node.value.toLocaleString()}`}
          color={MATRIX_COLORS.nodes.primary}
        />
        <MetricCard
          label="24h Change"
          value={`${node.change24h >= 0 ? '+' : ''}${node.change24h.toFixed(2)}%`}
          color={node.change24h >= 0 ? MATRIX_COLORS.nodes.success : MATRIX_COLORS.nodes.error}
        />
        <MetricCard
          label="Portfolio Weight"
          value={`${(node.metadata.portfolioWeight * 100).toFixed(1)}%`}
          color={MATRIX_COLORS.nodes.secondary}
        />
        <MetricCard
          label="Risk Level"
          value={node.metadata.riskLevel.toUpperCase()}
          color={
            node.metadata.riskLevel === 'low' ? MATRIX_COLORS.nodes.success :
            node.metadata.riskLevel === 'high' ? MATRIX_COLORS.nodes.error :
            MATRIX_COLORS.nodes.warning
          }
        />
      </div>

      {/* Additional details */}
      {(node.metadata.marketCap || node.metadata.volume24h) && (
        <div className="space-y-2">
          <h4 className="text-cyan-400 font-mono font-bold">Market Data</h4>
          {node.metadata.marketCap && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Market Cap:</span>
              <span className="text-white font-mono">${node.metadata.marketCap.toLocaleString()}</span>
            </div>
          )}
          {node.metadata.volume24h && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">24h Volume:</span>
              <span className="text-white font-mono">${node.metadata.volume24h.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// Node metrics component with performance indicators
const NodeMetrics = memo(function NodeMetrics({ node }: { node: MatrixNode }) {
  return (
    <div className="space-y-4">
      {/* Performance indicator */}
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{
            background: node.metadata.performanceCategory === 'up' ? 
              MATRIX_COLORS.nodes.success :
              node.metadata.performanceCategory === 'down' ?
                MATRIX_COLORS.nodes.error :
                MATRIX_COLORS.nodes.primary
          }}
        />
        <span className="text-white font-mono">
          {node.metadata.performanceCategory === 'up' ? 'Gaining Value' :
           node.metadata.performanceCategory === 'down' ? 'Losing Value' : 'Stable'}
        </span>
      </div>

      {/* Animated progress bars */}
      <div className="space-y-3">
        <ProgressBar
          label="Portfolio Impact"
          value={node.metadata.portfolioWeight}
          color={MATRIX_COLORS.nodes.primary}
        />
        <ProgressBar
          label="Volatility"
          value={Math.abs(node.change24h) / 100}
          color={MATRIX_COLORS.nodes.warning}
        />
        <ProgressBar
          label="Risk Score"
          value={node.metadata.riskLevel === 'low' ? 0.3 : node.metadata.riskLevel === 'medium' ? 0.6 : 0.9}
          color={
            node.metadata.riskLevel === 'low' ? MATRIX_COLORS.nodes.success :
            node.metadata.riskLevel === 'high' ? MATRIX_COLORS.nodes.error :
            MATRIX_COLORS.nodes.warning
          }
        />
      </div>

      {/* Size indicator */}
      <div className="mt-4">
        <div className="text-gray-400 text-sm mb-2">Node Size: {node.size.toFixed(0)}px</div>
        <div className="flex items-center gap-2">
          <div
            className="rounded-full border-2"
            style={{
              width: Math.max(20, node.size * 0.5),
              height: Math.max(20, node.size * 0.5),
              borderColor: node.color,
              background: `${node.color}20`
            }}
          />
          <span className="text-gray-400 text-xs">Preview</span>
        </div>
      </div>
    </div>
  )
})

// Node connections component
const NodeConnections = memo(function NodeConnections({ node }: { node: MatrixNode }) {
  const connections = node.connections || []

  return (
    <div className="space-y-4">
      <div className="text-cyan-400 font-mono font-bold">
        {connections.length} Connection{connections.length !== 1 ? 's' : ''}
      </div>

      {connections.length === 0 ? (
        <div className="text-gray-400 text-sm italic">No connections found</div>
      ) : (
        <div className="space-y-2">
          {connections.slice(0, 5).map((connectionId, index) => (
            <div
              key={connectionId}
              className="flex items-center gap-3 p-2 rounded border border-cyan-400/20 bg-cyan-400/5"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-white font-mono text-sm">Connection {index + 1}</span>
              <span className="text-gray-400 text-xs ml-auto">Strong</span>
            </div>
          ))}
          {connections.length > 5 && (
            <div className="text-gray-400 text-sm">
              +{connections.length - 5} more connections
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// Connection info panel
const ConnectionInfoPanel = memo(function ConnectionInfoPanel({ 
  connection 
}: { 
  connection: MatrixConnection 
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <MetricCard
          label="Connection Strength"
          value={`${(connection.strength * 100).toFixed(0)}%`}
          color={connection.color || MATRIX_COLORS.effects.glow}
        />
        <MetricCard
          label="Connection Type"
          value={connection.type.toUpperCase()}
          color={MATRIX_COLORS.nodes.secondary}
        />
        <MetricCard
          label="Animation"
          value={connection.animated ? 'ACTIVE' : 'STATIC'}
          color={connection.animated ? MATRIX_COLORS.nodes.success : MATRIX_COLORS.nodes.warning}
        />
      </div>
    </div>
  )
})

// Global stats panel
const GlobalStatsPanel = memo(function GlobalStatsPanel({ 
  stats 
}: { 
  stats: InfoPanelData['globalStats'] 
}) {
  if (!stats) return null

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Total Nodes"
          value={stats.totalNodes.toString()}
          color={MATRIX_COLORS.nodes.primary}
        />
        <MetricCard
          label="Connections"
          value={stats.totalConnections.toString()}
          color={MATRIX_COLORS.nodes.secondary}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-cyan-400 font-mono font-bold">Performance</h4>
        <ProgressBar
          label="FPS"
          value={stats.performanceMetrics.fps / 60}
          color={MATRIX_COLORS.nodes.success}
          displayValue={`${stats.performanceMetrics.fps} FPS`}
        />
        <ProgressBar
          label="Memory"
          value={stats.performanceMetrics.memoryUsage / 100}
          color={MATRIX_COLORS.nodes.warning}
          displayValue={`${stats.performanceMetrics.memoryUsage.toFixed(1)}MB`}
        />
        <ProgressBar
          label="Render Time"
          value={stats.performanceMetrics.renderTime / 16.67} // 16.67ms = 60fps
          color={MATRIX_COLORS.nodes.primary}
          displayValue={`${stats.performanceMetrics.renderTime.toFixed(1)}ms`}
        />
      </div>
    </div>
  )
})

// Reusable metric card component
interface MetricCardProps {
  label: string
  value: string
  color: string
}

const MetricCard = memo(function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <motion.div
      className="p-3 rounded border bg-black/40"
      style={{ borderColor: `${color}40` }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-white font-mono font-bold" style={{ color }}>
        {value}
      </div>
    </motion.div>
  )
})

// Animated progress bar component
interface ProgressBarProps {
  label: string
  value: number // 0-1
  color: string
  displayValue?: string
}

const ProgressBar = memo(function ProgressBar({ 
  label, 
  value, 
  color, 
  displayValue 
}: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-mono">
          {displayValue || `${(value * 100).toFixed(0)}%`}
        </span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}) 