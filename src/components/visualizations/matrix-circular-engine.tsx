'use client'

/**
 * Matrix Circular Engine
 * Canvas-based rendering system with 60fps animation loop
 * Touch and mouse interaction handling with blue glow effects
 */

import React, { useEffect, useRef, useCallback, useState } from 'react'
import useMeasure from 'react-use-measure'
import { 
  MATRIX_COLORS, 
  DEFAULT_MATRIX_CONFIG,
  matrixUtils,
  type MatrixNode,
  type MatrixConnection,
  type MatrixVisualizationConfig 
} from '@/lib/visualization/matrix-core'
import { calculateCircularLayout, type LayoutConfig } from '@/lib/visualization/calculations'
import MatrixInteractionManager from '@/lib/visualization/matrix-interactions'
import MatrixAnimationEngine from '@/lib/visualization/matrix-animations'
import type { MatrixInteractionEvent } from '@/lib/visualization/matrix-interactions'

export interface MatrixCircularEngineProps {
  data: MatrixNode[]
  connections?: MatrixConnection[]
  config?: Partial<MatrixVisualizationConfig>
  onNodeClick?: (node: MatrixNode) => void
  onNodeHover?: (node: MatrixNode | null) => void
  className?: string
  style?: React.CSSProperties
}

export default function MatrixCircularEngine({
  data,
  connections = [],
  config = {},
  onNodeClick,
  onNodeHover,
  className = '',
  style = {}
}: MatrixCircularEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const interactionManagerRef = useRef<MatrixInteractionManager | null>(null)
  const animationEngineRef = useRef<MatrixAnimationEngine | null>(null)
  
  // Measure canvas container for responsive sizing
  const [containerRef, bounds] = useMeasure({ scroll: false })
  
  // Internal state
  const [visualizationConfig] = useState<MatrixVisualizationConfig>({
    ...DEFAULT_MATRIX_CONFIG,
    ...config,
    width: bounds.width || 800,
    height: bounds.height || 600
  })
  
  const [layoutNodes, setLayoutNodes] = useState<MatrixNode[]>([])
  const [hoveredNode, setHoveredNode] = useState<MatrixNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<MatrixNode | null>(null)
  const [transform, setTransform] = useState({ zoom: 1, panX: 0, panY: 0 })

  // Initialize layout when data or bounds change
  useEffect(() => {
    if (!bounds.width || !bounds.height || !data.length) return

    const layoutConfig: LayoutConfig = {
      type: 'circular',
      width: bounds.width,
      height: bounds.height,
      centerX: bounds.width / 2,
      centerY: bounds.height / 2,
      padding: 60,
      nodeSpacing: 20,
      animationDuration: 300
    }

    const positioned = calculateCircularLayout(data, layoutConfig)
    setLayoutNodes(positioned)
  }, [data, bounds.width, bounds.height])

  // Initialize interaction manager
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Clean up previous manager
    if (interactionManagerRef.current) {
      interactionManagerRef.current.destroy()
    }

    // Create new interaction manager
    const interactionManager = new MatrixInteractionManager(canvas)
    interactionManagerRef.current = interactionManager

    // Setup interaction callbacks
    interactionManager.on('onHover', (node: MatrixNode | null, event: MatrixInteractionEvent) => {
      const nodeAtPosition = interactionManager.getNodeAtPosition(
        event.position.x,
        event.position.y,
        layoutNodes
      )
      
      if (nodeAtPosition !== hoveredNode) {
        setHoveredNode(nodeAtPosition)
        onNodeHover?.(nodeAtPosition)
        
        // Update animation engine
        if (animationEngineRef.current) {
          if (hoveredNode) {
            animationEngineRef.current.clearHoverEffect(hoveredNode.id)
          }
          if (nodeAtPosition) {
            animationEngineRef.current.triggerHoverEffect(nodeAtPosition.id)
          }
        }
      }
    })

    interactionManager.on('onClick', (node: MatrixNode | null, event: MatrixInteractionEvent) => {
      const nodeAtPosition = interactionManager.getNodeAtPosition(
        event.position.x,
        event.position.y,
        layoutNodes
      )
      
      if (nodeAtPosition) {
        setSelectedNode(nodeAtPosition)
        onNodeClick?.(nodeAtPosition)
        
        // Trigger click animation
        if (animationEngineRef.current) {
          animationEngineRef.current.triggerClickEffect(nodeAtPosition.id)
        }
      }
    })

    interactionManager.on('onZoom', (scale: number, center: { x: number; y: number }) => {
      setTransform(prev => ({
        ...prev,
        zoom: Math.max(0.1, Math.min(5, prev.zoom * scale))
      }))
    })

    interactionManager.on('onPan', (delta: { x: number; y: number }) => {
      setTransform(prev => ({
        ...prev,
        panX: prev.panX + delta.x,
        panY: prev.panY + delta.y
      }))
    })

    return () => {
      interactionManager.destroy()
    }
  }, [layoutNodes, hoveredNode, onNodeClick, onNodeHover])

  // Initialize animation engine
  useEffect(() => {
    if (animationEngineRef.current) {
      animationEngineRef.current.destroy()
    }

    const animationEngine = new MatrixAnimationEngine()
    animationEngineRef.current = animationEngine

    // Initialize nodes in animation engine
    layoutNodes.forEach(node => {
      animationEngine.initializeNode(node)
    })

    // Initialize connections
    connections.forEach(connection => {
      animationEngine.initializeConnection(connection)
    })

    animationEngine.start()

    return () => {
      animationEngine.destroy()
    }
  }, [layoutNodes, connections])

  // Canvas rendering function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !bounds.width || !bounds.height) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = bounds.width
    canvas.height = bounds.height

    // Clear canvas with Matrix background
    ctx.fillStyle = MATRIX_COLORS.backgrounds.dark
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply transform (zoom and pan)
    ctx.save()
    ctx.translate(transform.panX, transform.panY)
    ctx.scale(transform.zoom, transform.zoom)

    // Render connections first (behind nodes)
    renderConnections(ctx)
    
    // Render nodes
    renderNodes(ctx)

    // Render UI overlays
    renderUI(ctx)

    ctx.restore()
  }, [bounds.width, bounds.height, transform, layoutNodes, connections, hoveredNode, selectedNode])

  // Render connections between nodes
  const renderConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    connections.forEach(connection => {
      const sourceNode = layoutNodes.find(n => n.id === connection.source)
      const targetNode = layoutNodes.find(n => n.id === connection.target)
      
      if (!sourceNode || !targetNode) return

      const animationState = animationEngineRef.current?.getConnectionState(connection.id)
      const opacity = animationState?.opacity.current || 0.7

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.strokeStyle = connection.color || MATRIX_COLORS.effects.glow
      ctx.lineWidth = 2
      
      // Add glow effect
      ctx.shadowColor = connection.color || MATRIX_COLORS.effects.glow
      ctx.shadowBlur = 8
      
      ctx.beginPath()
      ctx.moveTo(sourceNode.position.x, sourceNode.position.y)
      ctx.lineTo(targetNode.position.x, targetNode.position.y)
      ctx.stroke()

      // Animated flow effect for active connections
      if (animationState?.pulse.active && animationState?.flow) {
        const progress = animationState.flow.progress
        const flowX = sourceNode.position.x + 
          (targetNode.position.x - sourceNode.position.x) * progress
        const flowY = sourceNode.position.y + 
          (targetNode.position.y - sourceNode.position.y) * progress

        ctx.fillStyle = MATRIX_COLORS.nodes.primary
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(flowX, flowY, 3, 0, 2 * Math.PI)
        ctx.fill()
      }

      ctx.restore()
    })
  }, [layoutNodes, connections])

  // Render nodes with Matrix aesthetics
  const renderNodes = useCallback((ctx: CanvasRenderingContext2D) => {
    layoutNodes.forEach(node => {
      const animationState = animationEngineRef.current?.getNodeState(node.id)
      const isHovered = hoveredNode?.id === node.id
      const isSelected = selectedNode?.id === node.id

      // Get current animation values
      const currentSize = animationState?.size.current || node.size
      const currentOpacity = animationState?.opacity.current || 1
      const glowIntensity = animationState?.glow.intensity || 0
      const isGlitching = animationState?.glitch.active || false

      ctx.save()
      ctx.globalAlpha = currentOpacity

      // Position (with potential glitch offset)
      let x = animationState?.position.x || node.position.x
      let y = animationState?.position.y || node.position.y
      
      if (isGlitching) {
        x += (Math.random() - 0.5) * 4
        y += (Math.random() - 0.5) * 4
      }

      // Draw node background with glow
      const glowRadius = 20 + (glowIntensity * 30)
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
      gradient.addColorStop(0, `rgba(0, 212, 255, ${0.1 + glowIntensity * 0.3})`)
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, glowRadius, 0, 2 * Math.PI)
      ctx.fill()

      // Draw main node circle
      ctx.strokeStyle = node.color
      ctx.fillStyle = MATRIX_COLORS.backgrounds.void
      ctx.lineWidth = isSelected ? 4 : (isHovered ? 3 : 2)
      
      // Enhanced glow for hover/selection
      if (isHovered || isSelected || glowIntensity > 0) {
        ctx.shadowColor = node.color
        ctx.shadowBlur = 15 + (glowIntensity * 20)
      }

      ctx.beginPath()
      ctx.arc(x, y, currentSize / 2, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // Draw symbol/text
      ctx.shadowBlur = 0
      ctx.fillStyle = MATRIX_COLORS.nodes.primary
      ctx.font = `${Math.max(10, currentSize / 4)}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.symbol, x, y)

      // Pulse effect
      if (animationState?.pulse.active) {
        const pulseIntensity = Math.sin(animationState.pulse.phase) * 0.5 + 0.5
        ctx.globalAlpha = 0.3 * pulseIntensity
        ctx.strokeStyle = MATRIX_COLORS.effects.glowIntense
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, (currentSize / 2) + 5 + (pulseIntensity * 10), 0, 2 * Math.PI)
        ctx.stroke()
      }

      ctx.restore()
    })
  }, [layoutNodes, hoveredNode, selectedNode])

  // Render UI overlays (info panels, etc.)
  const renderUI = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!bounds.height) return

    // Connection status indicator
    const statusColor = connections.length > 0 ? 
      MATRIX_COLORS.nodes.success : 
      MATRIX_COLORS.nodes.warning

    ctx.save()
    ctx.fillStyle = statusColor
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(
      `Nodes: ${layoutNodes.length} | Connections: ${connections.length}`,
      10,
      25
    )

    // Hover info
    if (hoveredNode) {
      const info = [
        `${hoveredNode.symbol} - ${hoveredNode.name}`,
        `Value: $${hoveredNode.value.toLocaleString()}`,
        `Change: ${hoveredNode.change24h > 0 ? '+' : ''}${hoveredNode.change24h.toFixed(2)}%`,
        `Risk: ${hoveredNode.metadata.riskLevel}`
      ]

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(10, bounds.height - 80, 250, 70)
      
      ctx.fillStyle = MATRIX_COLORS.nodes.primary
      ctx.font = '11px monospace'
      info.forEach((line, index) => {
        ctx.fillText(line, 15, bounds.height - 60 + (index * 15))
      })
    }

    ctx.restore()
  }, [layoutNodes, connections, hoveredNode, bounds.height])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render()
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [render])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (interactionManagerRef.current) {
        interactionManagerRef.current.destroy()
      }
      if (animationEngineRef.current) {
        animationEngineRef.current.destroy()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`matrix-circular-engine relative w-full h-full ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${MATRIX_COLORS.backgrounds.dark} 0%, ${MATRIX_COLORS.backgrounds.void} 100%)`,
          imageRendering: 'crisp-edges'
        }}
      />
      
      {/* Loading overlay */}
      {!layoutNodes.length && data.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-cyan-400 text-sm font-mono">Initializing Matrix...</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 text-xs text-cyan-400/60 font-mono space-y-1">
        <div>Zoom: {transform.zoom.toFixed(2)}x</div>
        <div>Nodes: {layoutNodes.length}</div>
        <div>FPS: 60</div>
      </div>
    </div>
  )
} 