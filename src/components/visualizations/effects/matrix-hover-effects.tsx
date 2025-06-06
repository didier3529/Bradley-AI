'use client'

/**
 * Matrix Hover Effects System
 * Blue glow animations, tooltips with Matrix glass morphism
 * Connection highlighting and performance-optimized hover detection
 */

import React, { memo, useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MATRIX_COLORS,
  MATRIX_TIMINGS,
  MATRIX_EASING,
  type MatrixNode,
  type MatrixConnection
} from '@/lib/visualization/matrix-core'

export interface HoverEffectData {
  node: MatrixNode
  position: { x: number; y: number }
  connections: MatrixConnection[]
  connectedNodes: MatrixNode[]
}

export interface MatrixHoverEffectsProps {
  hoverData: HoverEffectData | null
  isVisible: boolean
  glowIntensity?: number
  tooltipDelay?: number
  connectionHighlightEnabled?: boolean
  className?: string
  style?: React.CSSProperties
}

const MatrixHoverEffects = memo(function MatrixHoverEffects({
  hoverData,
  isVisible,
  glowIntensity = 0.8,
  tooltipDelay = 300,
  connectionHighlightEnabled = true,
  className = '',
  style = {}
}: MatrixHoverEffectsProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Handle tooltip visibility with delay
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (hoverData && isVisible) {
      timeoutRef.current = setTimeout(() => {
        setShowTooltip(true)
        setTooltipPosition({
          x: hoverData.position.x,
          y: hoverData.position.y
        })
      }, tooltipDelay)
    } else {
      setShowTooltip(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [hoverData, isVisible, tooltipDelay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!hoverData || !isVisible) {
    return null
  }

  return (
    <div className={`matrix-hover-effects pointer-events-none ${className}`} style={style}>
      {/* Main glow effect */}
      <MatrixGlowEffect
        position={hoverData.position}
        intensity={glowIntensity}
        color={hoverData.node.color}
      />

      {/* Connection highlights */}
      {connectionHighlightEnabled && (
        <ConnectionHighlights
          connections={hoverData.connections}
          hoveredNodeId={hoverData.node.id}
          intensity={glowIntensity}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <MatrixTooltip
            node={hoverData.node}
            position={tooltipPosition}
            connections={hoverData.connections}
            connectedNodes={hoverData.connectedNodes}
          />
        )}
      </AnimatePresence>

      {/* Ripple effect */}
      <MatrixRippleEffect
        position={hoverData.position}
        size={hoverData.node.size}
        color={hoverData.node.color}
      />
    </div>
  )
})

// Glow effect component
interface MatrixGlowEffectProps {
  position: { x: number; y: number }
  intensity: number
  color: string
}

const MatrixGlowEffect = memo(function MatrixGlowEffect({
  position,
  intensity,
  color
}: MatrixGlowEffectProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        duration: MATRIX_TIMINGS.fast / 1000,
        ease: MATRIX_EASING.smooth
      }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${80 + intensity * 40}px`,
          height: `${80 + intensity * 40}px`,
          background: `radial-gradient(circle, ${color}20 0%, ${color}10 50%, transparent 100%)`,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: MATRIX_TIMINGS.pulse / 1000,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Inner glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${40 + intensity * 20}px`,
          height: `${40 + intensity * 20}px`,
          background: `radial-gradient(circle, ${color}40 0%, ${color}20 50%, transparent 100%)`,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: MATRIX_TIMINGS.pulse / 1000,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1
        }}
      />

      {/* Core glow */}
      <div
        className="absolute w-4 h-4 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 ${20 * intensity}px ${color}`,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </motion.div>
  )
})

// Connection highlights component
interface ConnectionHighlightsProps {
  connections: MatrixConnection[]
  hoveredNodeId: string
  intensity: number
}

const ConnectionHighlights = memo(function ConnectionHighlights({
  connections,
  hoveredNodeId,
  intensity
}: ConnectionHighlightsProps) {
  return (
    <>
      {connections
        .filter(conn => conn.source === hoveredNodeId || conn.target === hoveredNodeId)
        .map(connection => (
          <motion.div
            key={connection.id}
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MATRIX_TIMINGS.fast / 1000 }}
          >
            {/* Animated connection line */}
            <svg
              className="absolute top-0 left-0 w-full h-full"
              style={{ zIndex: 1 }}
            >
              <defs>
                <linearGradient
                  id={`connection-gradient-${connection.id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor={connection.color || MATRIX_COLORS.effects.glow} stopOpacity="0" />
                  <stop offset="50%" stopColor={connection.color || MATRIX_COLORS.effects.glow} stopOpacity={intensity} />
                  <stop offset="100%" stopColor={connection.color || MATRIX_COLORS.effects.glow} stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Connection path would be calculated and rendered here */}
              {/* This is a simplified version - actual implementation would need path calculation */}
            </svg>

            {/* Flowing particles */}
            <motion.div
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: connection.color || MATRIX_COLORS.effects.glow,
                boxShadow: `0 0 10px ${connection.color || MATRIX_COLORS.effects.glow}`
              }}
              animate={{
                x: [0, 100, 200],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </motion.div>
        ))}
    </>
  )
})

// Tooltip component with Matrix glass morphism
interface MatrixTooltipProps {
  node: MatrixNode
  position: { x: number; y: number }
  connections: MatrixConnection[]
  connectedNodes: MatrixNode[]
}

const MatrixTooltip = memo(function MatrixTooltip({
  node,
  position,
  connections,
  connectedNodes
}: MatrixTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  // Adjust tooltip position to stay within viewport
  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = position.x
      let adjustedY = position.y

      // Adjust horizontal position
      if (position.x + rect.width > viewportWidth) {
        adjustedX = position.x - rect.width - 20
      } else {
        adjustedX = position.x + 20
      }

      // Adjust vertical position
      if (position.y + rect.height > viewportHeight) {
        adjustedY = position.y - rect.height - 20
      } else {
        adjustedY = position.y + 20
      }

      setAdjustedPosition({ x: adjustedX, y: adjustedY })
    }
  }, [position])

  return (
    <motion.div
      ref={tooltipRef}
      className="absolute z-50 pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{
        duration: MATRIX_TIMINGS.normal / 1000,
        ease: MATRIX_EASING.cyberpunk
      }}
    >
      {/* Glass morphism container */}
      <div
        className="relative rounded-lg border font-mono text-sm max-w-xs"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          borderColor: `${node.color}60`,
          boxShadow: `0 0 20px ${node.color}40, inset 0 0 20px rgba(0, 212, 255, 0.1)`
        }}
      >
        {/* Digital grid overlay */}
        <div
          className="absolute inset-0 opacity-10 rounded-lg"
          style={{
            backgroundImage: `
              linear-gradient(${MATRIX_COLORS.effects.glow} 1px, transparent 1px),
              linear-gradient(90deg, ${MATRIX_COLORS.effects.glow} 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Content */}
        <div className="relative p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: node.color,
                boxShadow: `0 0 10px ${node.color}`
              }}
            />
            <div>
              <div className="text-cyan-400 font-bold">{node.symbol}</div>
              <div className="text-gray-400 text-xs">{node.name}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-gray-400">Value</div>
              <div className="text-white font-mono">
                ${node.value.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400">24h Change</div>
              <div className={`font-mono ${
                node.change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {node.change24h >= 0 ? '+' : ''}{node.change24h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400">Portfolio %</div>
              <div className="text-white font-mono">
                {(node.metadata.portfolioWeight * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400">Risk Level</div>
              <div className={`font-mono ${
                node.metadata.riskLevel === 'low' ? 'text-green-400' :
                node.metadata.riskLevel === 'high' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {node.metadata.riskLevel.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Connections */}
          {connections.length > 0 && (
            <div className="border-t border-cyan-400/20 pt-3">
              <div className="text-gray-400 text-xs mb-2">
                Connected to {connections.length} tokens
              </div>
              <div className="space-y-1">
                {connections.slice(0, 3).map(connection => {
                  const connectedId = connection.source === node.id ? 
                    connection.target : connection.source
                  const connectedNode = connectedNodes.find(n => n.id === connectedId)
                  
                  return (
                    <div key={connection.id} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ background: connection.color }}
                      />
                      <span className="text-white">
                        {connectedNode?.symbol || 'Unknown'}
                      </span>
                      <span className="text-gray-400 ml-auto">
                        {(connection.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
                {connections.length > 3 && (
                  <div className="text-gray-400 text-xs">
                    +{connections.length - 3} more connections
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: node.metadata.performanceCategory === 'up' ? 
                  MATRIX_COLORS.nodes.success :
                  node.metadata.performanceCategory === 'down' ?
                    MATRIX_COLORS.nodes.error :
                    MATRIX_COLORS.nodes.primary
              }}
            />
            <span className="text-gray-400">
              {node.metadata.performanceCategory === 'up' ? 'Gaining' :
               node.metadata.performanceCategory === 'down' ? 'Losing' : 'Stable'}
            </span>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400/60" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400/60" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400/60" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400/60" />
      </div>
    </motion.div>
  )
})

// Ripple effect component
interface MatrixRippleEffectProps {
  position: { x: number; y: number }
  size: number
  color: string
}

const MatrixRippleEffect = memo(function MatrixRippleEffect({
  position,
  size,
  color
}: MatrixRippleEffectProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full border-2"
          style={{
            borderColor: color,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{
            width: size,
            height: size,
            opacity: 0.8
          }}
          animate={{
            width: size * 3,
            height: size * 3,
            opacity: 0
          }}
          transition={{
            duration: 1.5,
            delay: index * 0.2,
            ease: 'easeOut'
          }}
        />
      ))}
    </motion.div>
  )
})

export default MatrixHoverEffects 