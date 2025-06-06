'use client'

/**
 * Matrix Connection System
 * Animated lines between related tokens with blue gradient trails
 * Dynamic connection strength visualization and interactive exploration
 */

import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MATRIX_COLORS,
  MATRIX_TIMINGS,
  MATRIX_EASING,
  type MatrixNode,
  type MatrixConnection
} from '@/lib/visualization/matrix-core'

export interface MatrixConnectionsProps {
  nodes: MatrixNode[]
  connections: MatrixConnection[]
  hoveredNodeId?: string | null
  selectedNodeId?: string | null
  connectionStyle?: 'matrix-lines' | 'digital-trails' | 'glow-paths'
  animationEnabled?: boolean
  interactionEnabled?: boolean
  onConnectionClick?: (connection: MatrixConnection) => void
  onConnectionHover?: (connection: MatrixConnection | null) => void
  className?: string
  style?: React.CSSProperties
}

export default function MatrixConnections({
  nodes,
  connections,
  hoveredNodeId,
  selectedNodeId,
  connectionStyle = 'digital-trails',
  animationEnabled = true,
  interactionEnabled = true,
  onConnectionClick,
  onConnectionHover,
  className = '',
  style = {}
}: MatrixConnectionsProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)

  // Filter connections based on hovered/selected nodes
  const relevantConnections = useMemo(() => {
    if (!hoveredNodeId && !selectedNodeId) {
      return connections
    }

    const targetNodeId = hoveredNodeId || selectedNodeId
    return connections.filter(conn => 
      conn.source === targetNodeId || conn.target === targetNodeId
    )
  }, [connections, hoveredNodeId, selectedNodeId])

  // Calculate connection paths
  const connectionPaths = useMemo(() => {
    return relevantConnections.map(connection => {
      const sourceNode = nodes.find(n => n.id === connection.source)
      const targetNode = nodes.find(n => n.id === connection.target)
      
      if (!sourceNode || !targetNode) return null

      const path = calculateConnectionPath(sourceNode, targetNode, connectionStyle)
      return {
        connection,
        path,
        sourceNode,
        targetNode
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)
  }, [relevantConnections, nodes, connectionStyle])

  // Handle connection interactions
  const handleConnectionMouseEnter = useCallback((connection: MatrixConnection) => {
    if (!interactionEnabled) return
    
    setHoveredConnection(connection.id)
    onConnectionHover?.(connection)
  }, [interactionEnabled, onConnectionHover])

  const handleConnectionMouseLeave = useCallback(() => {
    if (!interactionEnabled) return
    
    setHoveredConnection(null)
    onConnectionHover?.(null)
  }, [interactionEnabled, onConnectionHover])

  const handleConnectionClick = useCallback((connection: MatrixConnection) => {
    if (!interactionEnabled) return
    
    onConnectionClick?.(connection)
  }, [interactionEnabled, onConnectionClick])

  if (!connectionPaths.length) return null

  return (
    <div className={`matrix-connections absolute inset-0 pointer-events-none ${className}`} style={style}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <defs>
          {/* Gradient definitions for different connection types */}
          <linearGradient id="connection-gradient-primary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={MATRIX_COLORS.effects.glow} stopOpacity="0.1" />
            <stop offset="50%" stopColor={MATRIX_COLORS.effects.glow} stopOpacity="0.8" />
            <stop offset="100%" stopColor={MATRIX_COLORS.effects.glow} stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="connection-gradient-success" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={MATRIX_COLORS.nodes.success} stopOpacity="0.1" />
            <stop offset="50%" stopColor={MATRIX_COLORS.nodes.success} stopOpacity="0.8" />
            <stop offset="100%" stopColor={MATRIX_COLORS.nodes.success} stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="connection-gradient-warning" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={MATRIX_COLORS.nodes.warning} stopOpacity="0.1" />
            <stop offset="50%" stopColor={MATRIX_COLORS.nodes.warning} stopOpacity="0.8" />
            <stop offset="100%" stopColor={MATRIX_COLORS.nodes.warning} stopOpacity="0.1" />
          </linearGradient>

          {/* Animated dash patterns */}
          <pattern id="dash-pattern" patternUnits="userSpaceOnUse" width="20" height="2">
            <rect width="20" height="2" fill="none" />
            <rect width="10" height="2" fill="currentColor" opacity="0.6" />
          </pattern>

          {/* Glow filters */}
          <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Render connections */}
        <AnimatePresence>
          {connectionPaths.map(({ connection, path, sourceNode, targetNode }) => (
            <ConnectionPath
              key={connection.id}
              connection={connection}
              path={path}
              sourceNode={sourceNode}
              targetNode={targetNode}
              isHovered={hoveredConnection === connection.id}
              isRelevant={hoveredNodeId === connection.source || hoveredNodeId === connection.target ||
                         selectedNodeId === connection.source || selectedNodeId === connection.target}
              connectionStyle={connectionStyle}
              animationEnabled={animationEnabled}
              onMouseEnter={() => handleConnectionMouseEnter(connection)}
              onMouseLeave={handleConnectionMouseLeave}
              onClick={() => handleConnectionClick(connection)}
            />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  )
}

// Individual connection path component
interface ConnectionPathProps {
  connection: MatrixConnection
  path: string
  sourceNode: MatrixNode
  targetNode: MatrixNode
  isHovered: boolean
  isRelevant: boolean
  connectionStyle: string
  animationEnabled: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

const ConnectionPath = memo(function ConnectionPath({
  connection,
  path,
  sourceNode,
  targetNode,
  isHovered,
  isRelevant,
  connectionStyle,
  animationEnabled,
  onMouseEnter,
  onMouseLeave,
  onClick
}: ConnectionPathProps) {
  const gradientId = useMemo(() => {
    if (connection.strength > 0.8) return 'connection-gradient-success'
    if (connection.strength > 0.6) return 'connection-gradient-primary'
    return 'connection-gradient-warning'
  }, [connection.strength])

  const strokeWidth = useMemo(() => {
    const baseWidth = 2
    const strengthMultiplier = connection.strength * 2
    const hoverMultiplier = isHovered ? 2 : 1
    const relevantMultiplier = isRelevant ? 1.5 : 1
    
    return baseWidth * strengthMultiplier * hoverMultiplier * relevantMultiplier
  }, [connection.strength, isHovered, isRelevant])

  const opacity = useMemo(() => {
    if (isHovered) return 1
    if (isRelevant) return 0.8
    return 0.4
  }, [isHovered, isRelevant])

  return (
    <motion.g
      initial={{ opacity: 0, pathLength: 0 }}
      animate={{ 
        opacity,
        pathLength: 1
      }}
      exit={{ opacity: 0, pathLength: 0 }}
      transition={{
        duration: MATRIX_TIMINGS.normal / 1000,
        ease: MATRIX_EASING.smooth
      }}
    >
      {/* Background glow path */}
      <motion.path
        d={path}
        fill="none"
        stroke={connection.color || MATRIX_COLORS.effects.glow}
        strokeWidth={strokeWidth + 4}
        opacity={0.3}
        filter="url(#connection-glow)"
        animate={{
          strokeWidth: [strokeWidth + 4, strokeWidth + 8, strokeWidth + 4],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: MATRIX_TIMINGS.pulse / 1000,
          repeat: animationEnabled && (isHovered || isRelevant) ? Infinity : 0,
          ease: 'easeInOut'
        }}
      />

      {/* Main connection path */}
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{
          pointerEvents: 'stroke',
          cursor: 'pointer'
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        animate={{
          strokeDasharray: connection.animated ? [0, 20, 40] : 'none',
          strokeDashoffset: connection.animated ? [0, -40, -80] : 0
        }}
        transition={{
          duration: 3,
          repeat: connection.animated ? Infinity : 0,
          ease: 'linear'
        }}
      />

      {/* Data flow particles */}
      {connection.animated && (isHovered || isRelevant) && (
        <>
          {[...Array(3)].map((_, index) => (
            <FlowParticle
              key={`${connection.id}-particle-${index}`}
              path={path}
              delay={index * 0.5}
              color={connection.color || MATRIX_COLORS.effects.glow}
              size={2 + connection.strength * 2}
            />
          ))}
        </>
      )}

      {/* Connection strength indicator */}
      {isHovered && (
        <ConnectionStrengthIndicator
          sourceNode={sourceNode}
          targetNode={targetNode}
          strength={connection.strength}
          type={connection.type}
        />
      )}
    </motion.g>
  )
})

// Flow particle component
interface FlowParticleProps {
  path: string
  delay: number
  color: string
  size: number
}

const FlowParticle = memo(function FlowParticle({
  path,
  delay,
  color,
  size
}: FlowParticleProps) {
  return (
    <motion.circle
      r={size}
      fill={color}
      style={{
        filter: `drop-shadow(0 0 ${size * 2}px ${color})`
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <animateMotion
        dur="2s"
        repeatCount="indefinite"
        begin={`${delay}s`}
      >
        <mpath href={`#${path}`} />
      </animateMotion>
    </motion.circle>
  )
})

// Connection strength indicator
interface ConnectionStrengthIndicatorProps {
  sourceNode: MatrixNode
  targetNode: MatrixNode
  strength: number
  type: string
}

const ConnectionStrengthIndicator = memo(function ConnectionStrengthIndicator({
  sourceNode,
  targetNode,
  strength,
  type
}: ConnectionStrengthIndicatorProps) {
  const midX = (sourceNode.position.x + targetNode.position.x) / 2
  const midY = (sourceNode.position.y + targetNode.position.y) / 2

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background circle */}
      <circle
        cx={midX}
        cy={midY}
        r="20"
        fill="rgba(0, 0, 0, 0.8)"
        stroke={MATRIX_COLORS.effects.glow}
        strokeWidth="1"
      />
      
      {/* Strength percentage */}
      <text
        x={midX}
        y={midY - 3}
        textAnchor="middle"
        className="text-xs font-mono fill-cyan-400"
      >
        {Math.round(strength * 100)}%
      </text>
      
      {/* Connection type */}
      <text
        x={midX}
        y={midY + 8}
        textAnchor="middle"
        className="text-xs font-mono fill-gray-400"
      >
        {type}
      </text>
    </motion.g>
  )
})

// Calculate connection path based on style
function calculateConnectionPath(
  sourceNode: MatrixNode,
  targetNode: MatrixNode,
  style: string
): string {
  const x1 = sourceNode.position.x
  const y1 = sourceNode.position.y
  const x2 = targetNode.position.x
  const y2 = targetNode.position.y
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  switch (style) {
    case 'matrix-lines':
      // Straight lines with slight curve
      const offset = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 0.1
      return `M ${x1} ${y1} Q ${midX} ${midY - offset} ${x2} ${y2}`

    case 'digital-trails':
      // Angular paths with right angles
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${y2}`

    case 'glow-paths':
      // Curved paths with more organic feel
      const dx = x2 - x1
      const dy = y2 - y1
      const cp1x = x1 + dx * 0.3
      const cp1y = y1 + dy * 0.1
      const cp2x = x1 + dx * 0.7
      const cp2y = y1 + dy * 0.9
      return `M ${x1} ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`

    default:
      return `M ${x1} ${y1} L ${x2} ${y2}`
  }
} 