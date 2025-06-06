'use client'

/**
 * Matrix Token Node Component
 * Circular nodes with blue glow borders, hover states, click interactions
 * Real-time price updates with Matrix-style number transitions
 */

import React, { memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MATRIX_COLORS, 
  MATRIX_TIMINGS,
  getPerformanceColor,
  getRiskStyling,
  type MatrixNode 
} from '@/lib/visualization/matrix-core'

export interface MatrixTokenNodeProps {
  node: MatrixNode
  isHovered?: boolean
  isSelected?: boolean
  isConnected?: boolean
  glowIntensity?: number
  scale?: number
  onClick?: (node: MatrixNode) => void
  onHover?: (node: MatrixNode | null) => void
  className?: string
  style?: React.CSSProperties
}

const MatrixTokenNode = memo(function MatrixTokenNode({
  node,
  isHovered = false,
  isSelected = false,
  isConnected = false,
  glowIntensity = 0,
  scale = 1,
  onClick,
  onHover,
  className = '',
  style = {}
}: MatrixTokenNodeProps) {
  
  // Calculate dynamic styling based on node data and state
  const nodeStyle = useMemo(() => {
    const riskStyling = getRiskStyling(node.metadata.riskLevel)
    const performanceColor = getPerformanceColor(node.metadata.performanceCategory, node.change24h)
    
    return {
      baseColor: performanceColor,
      glowColor: riskStyling.glow,
      strokeWidth: riskStyling.strokeWidth,
      size: node.size * scale
    }
  }, [node.metadata.riskLevel, node.metadata.performanceCategory, node.change24h, node.size, scale])

  // Handle interactions
  const handleClick = useCallback(() => {
    onClick?.(node)
  }, [onClick, node])

  const handleMouseEnter = useCallback(() => {
    onHover?.(node)
  }, [onHover, node])

  const handleMouseLeave = useCallback(() => {
    onHover?.(null)
  }, [onHover])

  // Animation variants for different states
  const nodeVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
      filter: 'drop-shadow(0 0 0px rgba(0, 212, 255, 0))'
    },
    idle: {
      scale: 1,
      opacity: 1,
      filter: `drop-shadow(0 0 ${5 + glowIntensity * 15}px ${nodeStyle.glowColor})`,
      transition: {
        duration: MATRIX_TIMINGS.normal / 1000,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.1,
      opacity: 1,
      filter: `drop-shadow(0 0 ${20 + glowIntensity * 25}px ${nodeStyle.glowColor})`,
      transition: {
        duration: MATRIX_TIMINGS.fast / 1000,
        ease: 'easeOut'
      }
    },
    selected: {
      scale: 1.15,
      opacity: 1,
      filter: `drop-shadow(0 0 ${25 + glowIntensity * 30}px ${MATRIX_COLORS.effects.glowIntense})`,
      transition: {
        duration: MATRIX_TIMINGS.fast / 1000,
        ease: 'easeOut'
      }
    },
    connected: {
      scale: 1.05,
      opacity: 1,
      filter: `drop-shadow(0 0 ${15 + glowIntensity * 20}px ${nodeStyle.baseColor})`,
      transition: {
        duration: MATRIX_TIMINGS.fast / 1000,
        ease: 'easeOut'
      }
    }
  }

  const pulseVariants = {
    idle: {
      scale: 1,
      opacity: 0.3
    },
    pulse: {
      scale: [1, 1.5, 1],
      opacity: [0.3, 0.7, 0.3],
      transition: {
        duration: MATRIX_TIMINGS.pulse / 1000,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const glitchVariants = {
    idle: {
      x: 0,
      y: 0
    },
    glitch: {
      x: [-2, 2, -1, 1, 0],
      y: [1, -1, 2, -2, 0],
      transition: {
        duration: MATRIX_TIMINGS.glitch / 1000,
        ease: 'easeInOut'
      }
    }
  }

  // Determine current animation state
  const getAnimationState = () => {
    if (isSelected) return 'selected'
    if (isHovered) return 'hover'
    if (isConnected) return 'connected'
    return 'idle'
  }

  return (
    <motion.div
      className={`matrix-token-node relative cursor-pointer ${className}`}
      style={{
        position: 'absolute',
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        transform: 'translate(-50%, -50%)',
        ...style
      }}
      variants={nodeVariants}
      initial="initial"
      animate={getAnimationState()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          width: `${nodeStyle.size + 20}px`,
          height: `${nodeStyle.size + 20}px`,
          background: `radial-gradient(circle, ${nodeStyle.glowColor}20 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%'
        }}
        animate={{
          scale: isHovered || isSelected ? [1, 1.2, 1] : 1,
          opacity: 0.6 + glowIntensity * 0.4
        }}
        transition={{
          duration: MATRIX_TIMINGS.pulse / 1000,
          repeat: isHovered || isSelected ? Infinity : 0,
          ease: 'easeInOut'
        }}
      />

      {/* Pulse ring for active states */}
      <AnimatePresence>
        {(isHovered || isSelected || isConnected) && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{
              width: `${nodeStyle.size + 10}px`,
              height: `${nodeStyle.size + 10}px`,
              borderColor: nodeStyle.baseColor,
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%'
            }}
            variants={pulseVariants}
            initial="idle"
            animate="pulse"
            exit="idle"
          />
        )}
      </AnimatePresence>

      {/* Main node circle */}
      <motion.div
        className="relative rounded-full border flex items-center justify-center"
        style={{
          width: `${nodeStyle.size}px`,
          height: `${nodeStyle.size}px`,
          borderWidth: `${nodeStyle.strokeWidth}px`,
          borderColor: nodeStyle.baseColor,
          backgroundColor: MATRIX_COLORS.backgrounds.void,
          boxShadow: `inset 0 0 ${10 + glowIntensity * 10}px ${nodeStyle.glowColor}40`
        }}
        variants={glitchVariants}
        animate={isSelected ? 'glitch' : 'idle'}
      >
        {/* Symbol text */}
        <motion.span
          className="font-mono font-bold text-center"
          style={{
            fontSize: `${Math.max(10, nodeStyle.size / 4)}px`,
            color: MATRIX_COLORS.nodes.primary,
            textShadow: `0 0 ${5 + glowIntensity * 5}px ${MATRIX_COLORS.nodes.primary}`
          }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            textShadow: `0 0 ${5 + glowIntensity * 10}px ${MATRIX_COLORS.nodes.primary}`
          }}
          transition={{
            duration: MATRIX_TIMINGS.fast / 1000
          }}
        >
          {node.symbol}
        </motion.span>

        {/* Performance indicator dot */}
        <motion.div
          className="absolute bottom-1 right-1 rounded-full"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: node.change24h > 0 ? 
              MATRIX_COLORS.nodes.success : 
              node.change24h < 0 ? 
                MATRIX_COLORS.nodes.error : 
                MATRIX_COLORS.nodes.primary
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Risk level indicator */}
        {node.metadata.riskLevel === 'high' && (
          <motion.div
            className="absolute top-0 right-0 rounded-full"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: MATRIX_COLORS.nodes.error,
              transform: 'translate(50%, -50%)'
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </motion.div>

      {/* Hover/Selection info overlay */}
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.div
            className="absolute z-10 px-2 py-1 rounded text-xs font-mono whitespace-nowrap pointer-events-none"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: MATRIX_COLORS.nodes.primary,
              border: `1px solid ${nodeStyle.baseColor}`,
              top: `${nodeStyle.size + 15}px`,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center">
              <div className="font-bold">{node.name}</div>
              <div className={`${node.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {node.change24h >= 0 ? '+' : ''}{node.change24h.toFixed(2)}%
              </div>
              <div className="text-gray-400">
                ${node.value.toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection lines would be rendered by parent component */}
    </motion.div>
  )
})

export default MatrixTokenNode 