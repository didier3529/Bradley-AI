'use client'

/**
 * Matrix Zoom & Navigation
 * Smooth zoom with Matrix transition effects, pan navigation with momentum
 * Touch gestures for mobile and keyboard navigation with cyberpunk feedback
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, PanInfo } from 'framer-motion'
import {
  MATRIX_COLORS,
  MATRIX_TIMINGS,
  MATRIX_EASING,
  type MatrixNode
} from '@/lib/visualization/matrix-core'

export interface ViewportTransform {
  zoom: number
  panX: number
  panY: number
}

export interface MatrixNavigationProps {
  nodes: MatrixNode[]
  transform: ViewportTransform
  onTransformChange: (transform: ViewportTransform) => void
  bounds?: { width: number; height: number }
  zoomLimits?: { min: number; max: number }
  enableMinimap?: boolean
  enableKeyboardNav?: boolean
  enableTouchGestures?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function MatrixNavigation({
  nodes,
  transform,
  onTransformChange,
  bounds = { width: 800, height: 600 },
  zoomLimits = { min: 0.1, max: 5 },
  enableMinimap = true,
  enableKeyboardNav = true,
  enableTouchGestures = true,
  className = '',
  style = {}
}: MatrixNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isKeyboardActive, setIsKeyboardActive] = useState(false)

  // Motion values for smooth animation
  const zoomValue = useMotionValue(transform.zoom)
  const panXValue = useMotionValue(transform.panX)
  const panYValue = useMotionValue(transform.panY)

  // Spring configurations for smooth transitions
  const smoothZoom = useSpring(zoomValue, { 
    stiffness: 300, 
    damping: 30,
    mass: 0.8
  })
  const smoothPanX = useSpring(panXValue, { 
    stiffness: 400, 
    damping: 40,
    mass: 0.5
  })
  const smoothPanY = useSpring(panYValue, { 
    stiffness: 400, 
    damping: 40,
    mass: 0.5
  })

  // Update motion values when transform changes
  useEffect(() => {
    zoomValue.set(transform.zoom)
    panXValue.set(transform.panX)
    panYValue.set(transform.panY)
  }, [transform, zoomValue, panXValue, panYValue])

  // Handle zoom with momentum and constraints
  const handleZoom = useCallback((delta: number, center?: { x: number; y: number }) => {
    const currentZoom = transform.zoom
    const newZoom = Math.max(zoomLimits.min, Math.min(zoomLimits.max, currentZoom * delta))
    
    if (newZoom === currentZoom) return

    let newPanX = transform.panX
    let newPanY = transform.panY

    // Zoom towards center point if provided
    if (center) {
      const zoomDelta = newZoom - currentZoom
      newPanX -= (center.x - bounds.width / 2) * zoomDelta / currentZoom
      newPanY -= (center.y - bounds.height / 2) * zoomDelta / currentZoom
    }

    onTransformChange({
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY
    })
  }, [transform, zoomLimits, bounds, onTransformChange])

  // Handle pan with momentum
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    const newPanX = transform.panX + deltaX
    const newPanY = transform.panY + deltaY

    onTransformChange({
      zoom: transform.zoom,
      panX: newPanX,
      panY: newPanY
    })
  }, [transform, onTransformChange])

  // Wheel event handler for zoom
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault()
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const center = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1
    handleZoom(zoomDelta, center)
  }, [handleZoom])

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNav) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const panStep = 50
      const zoomStep = 0.1

      setIsKeyboardActive(true)

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          handlePan(0, panStep)
          break
        case 'ArrowDown':
          event.preventDefault()
          handlePan(0, -panStep)
          break
        case 'ArrowLeft':
          event.preventDefault()
          handlePan(panStep, 0)
          break
        case 'ArrowRight':
          event.preventDefault()
          handlePan(-panStep, 0)
          break
        case '+':
        case '=':
          event.preventDefault()
          handleZoom(1 + zoomStep)
          break
        case '-':
          event.preventDefault()
          handleZoom(1 - zoomStep)
          break
        case '0':
          event.preventDefault()
          onTransformChange({ zoom: 1, panX: 0, panY: 0 })
          break
        case 'f':
        case 'F':
          event.preventDefault()
          fitToContent()
          break
      }

      // Clear keyboard active state after delay
      setTimeout(() => setIsKeyboardActive(false), 1000)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardNav, handlePan, handleZoom, onTransformChange])

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Fit content to view
  const fitToContent = useCallback(() => {
    if (!nodes.length) return

    const padding = 100
    const minX = Math.min(...nodes.map(n => n.position.x)) - padding
    const maxX = Math.max(...nodes.map(n => n.position.x)) + padding
    const minY = Math.min(...nodes.map(n => n.position.y)) - padding
    const maxY = Math.max(...nodes.map(n => n.position.y)) + padding

    const contentWidth = maxX - minX
    const contentHeight = maxY - minY

    const scaleX = bounds.width / contentWidth
    const scaleY = bounds.height / contentHeight
    const scale = Math.min(scaleX, scaleY, 1)

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    onTransformChange({
      zoom: scale,
      panX: bounds.width / 2 - centerX * scale,
      panY: bounds.height / 2 - centerY * scale
    })
  }, [nodes, bounds, onTransformChange])

  // Pan drag handlers
  const handlePanStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handlePanEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handlePanDrag = useCallback((_: any, info: PanInfo) => {
    handlePan(info.delta.x, info.delta.y)
  }, [handlePan])

  return (
    <div ref={containerRef} className={`matrix-navigation relative ${className}`} style={style}>
      {/* Main draggable area */}
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onPanStart={handlePanStart}
        onPanEnd={handlePanEnd}
        onPan={handlePanDrag}
        drag
        dragConstraints={false}
        dragElastic={0}
      />

      {/* Navigation controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <NavigationControls
          transform={transform}
          onZoomIn={() => handleZoom(1.2)}
          onZoomOut={() => handleZoom(0.8)}
          onReset={() => onTransformChange({ zoom: 1, panX: 0, panY: 0 })}
          onFitToContent={fitToContent}
        />
      </div>

      {/* Minimap */}
      {enableMinimap && (
        <div className="absolute bottom-4 right-4 z-20">
          <Minimap
            nodes={nodes}
            transform={transform}
            bounds={bounds}
            onTransformChange={onTransformChange}
          />
        </div>
      )}

      {/* Keyboard navigation indicator */}
      {isKeyboardActive && (
        <motion.div
          className="absolute top-4 left-4 z-20 bg-black/80 border border-cyan-400/30 rounded px-3 py-2 font-mono text-xs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="text-cyan-400 font-bold">Keyboard Navigation</div>
          <div className="text-gray-400">
            Arrows: Pan | +/-: Zoom | 0: Reset | F: Fit
          </div>
        </motion.div>
      )}

      {/* Transform info */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/80 border border-cyan-400/30 rounded px-3 py-2 font-mono text-xs">
        <div className="text-cyan-400">Zoom: {transform.zoom.toFixed(2)}x</div>
        <div className="text-gray-400">
          Pan: {Math.round(transform.panX)}, {Math.round(transform.panY)}
        </div>
      </div>
    </div>
  )
}

// Navigation controls component
interface NavigationControlsProps {
  transform: ViewportTransform
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFitToContent: () => void
}

const NavigationControls = memo(function NavigationControls({
  transform,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToContent
}: NavigationControlsProps) {
  return (
    <div className="bg-black/80 border border-cyan-400/30 rounded p-2 space-y-1">
      <motion.button
        onClick={onZoomIn}
        className="w-8 h-8 bg-transparent border border-cyan-400/30 rounded text-cyan-400 hover:bg-cyan-400/20 transition-colors flex items-center justify-center font-mono text-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        +
      </motion.button>
      
      <motion.button
        onClick={onZoomOut}
        className="w-8 h-8 bg-transparent border border-cyan-400/30 rounded text-cyan-400 hover:bg-cyan-400/20 transition-colors flex items-center justify-center font-mono text-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        −
      </motion.button>
      
      <motion.button
        onClick={onReset}
        className="w-8 h-8 bg-transparent border border-cyan-400/30 rounded text-cyan-400 hover:bg-cyan-400/20 transition-colors flex items-center justify-center font-mono text-xs"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Reset View"
      >
        ⌂
      </motion.button>
      
      <motion.button
        onClick={onFitToContent}
        className="w-8 h-8 bg-transparent border border-cyan-400/30 rounded text-cyan-400 hover:bg-cyan-400/20 transition-colors flex items-center justify-center font-mono text-xs"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Fit to Content"
      >
        ⛶
      </motion.button>
    </div>
  )
})

// Minimap component
interface MinimapProps {
  nodes: MatrixNode[]
  transform: ViewportTransform
  bounds: { width: number; height: number }
  onTransformChange: (transform: ViewportTransform) => void
}

const Minimap = memo(function Minimap({
  nodes,
  transform,
  bounds,
  onTransformChange
}: MinimapProps) {
  const minimapSize = 120
  const minimapPadding = 10

  // Calculate minimap scale
  const contentBounds = nodes.length > 0 ? {
    minX: Math.min(...nodes.map(n => n.position.x)),
    maxX: Math.max(...nodes.map(n => n.position.x)),
    minY: Math.min(...nodes.map(n => n.position.y)),
    maxY: Math.max(...nodes.map(n => n.position.y))
  } : { minX: 0, maxX: bounds.width, minY: 0, maxY: bounds.height }

  const contentWidth = contentBounds.maxX - contentBounds.minX
  const contentHeight = contentBounds.maxY - contentBounds.minY
  const scale = Math.min(
    (minimapSize - minimapPadding * 2) / contentWidth,
    (minimapSize - minimapPadding * 2) / contentHeight
  )

  // Handle minimap click
  const handleMinimapClick = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left - minimapPadding) / scale + contentBounds.minX
    const y = (event.clientY - rect.top - minimapPadding) / scale + contentBounds.minY

    onTransformChange({
      zoom: transform.zoom,
      panX: bounds.width / 2 - x * transform.zoom,
      panY: bounds.height / 2 - y * transform.zoom
    })
  }, [scale, contentBounds, transform, bounds, onTransformChange])

  return (
    <motion.div
      className="bg-black/90 border border-cyan-400/30 rounded p-2 cursor-pointer"
      style={{ width: minimapSize, height: minimapSize }}
      onClick={handleMinimapClick}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(${MATRIX_COLORS.effects.glow} 1px, transparent 1px),
              linear-gradient(90deg, ${MATRIX_COLORS.effects.glow} 1px, transparent 1px)
            `,
            backgroundSize: '10px 10px'
          }}
        />

        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: (node.position.x - contentBounds.minX) * scale + minimapPadding,
              top: (node.position.y - contentBounds.minY) * scale + minimapPadding,
              backgroundColor: node.color,
              boxShadow: `0 0 2px ${node.color}`
            }}
          />
        ))}

        {/* Viewport indicator */}
        <div
          className="absolute border border-cyan-400 opacity-60"
          style={{
            left: (-transform.panX / transform.zoom - contentBounds.minX) * scale + minimapPadding,
            top: (-transform.panY / transform.zoom - contentBounds.minY) * scale + minimapPadding,
            width: (bounds.width / transform.zoom) * scale,
            height: (bounds.height / transform.zoom) * scale
          }}
        />
      </div>
    </motion.div>
  )
}) 