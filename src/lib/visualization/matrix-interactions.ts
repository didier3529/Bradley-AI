/**
 * Matrix Visualization Interactions
 * Click, hover, drag handlers with Matrix-style blue glow feedback
 */

import { MATRIX_COLORS, MATRIX_TIMINGS } from './matrix-core'
import type { MatrixNode, MatrixConnection, MatrixVisualizationState } from './matrix-core'

// Interaction event types
export interface MatrixInteractionEvent {
  type: 'hover' | 'click' | 'drag' | 'zoom' | 'pan'
  target: MatrixNode | null
  position: { x: number; y: number }
  timestamp: number
  modifiers: {
    shift: boolean
    ctrl: boolean
    alt: boolean
  }
}

// Hover state management
export interface HoverState {
  nodeId: string | null
  glowIntensity: number
  connectedNodes: string[]
  position: { x: number; y: number }
  isActive: boolean
}

// Drag state management
export interface DragState {
  isDragging: boolean
  nodeId: string | null
  startPosition: { x: number; y: number }
  currentPosition: { x: number; y: number }
  offset: { x: number; y: number }
}

// Touch/gesture state for mobile
export interface TouchState {
  isTouching: boolean
  touchCount: number
  startDistance: number
  currentScale: number
  panStart: { x: number; y: number }
  panCurrent: { x: number; y: number }
}

// Matrix interaction manager class
export class MatrixInteractionManager {
  private canvas: HTMLCanvasElement | null = null
  private hoverState: HoverState = {
    nodeId: null,
    glowIntensity: 0,
    connectedNodes: [],
    position: { x: 0, y: 0 },
    isActive: false
  }
  private dragState: DragState = {
    isDragging: false,
    nodeId: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  }
  private touchState: TouchState = {
    isTouching: false,
    touchCount: 0,
    startDistance: 0,
    currentScale: 1,
    panStart: { x: 0, y: 0 },
    panCurrent: { x: 0, y: 0 }
  }
  
  private eventCallbacks: {
    onHover?: (node: MatrixNode | null, event: MatrixInteractionEvent) => void
    onClick?: (node: MatrixNode | null, event: MatrixInteractionEvent) => void
    onDrag?: (node: MatrixNode | null, delta: { x: number; y: number }) => void
    onZoom?: (scale: number, center: { x: number; y: number }) => void
    onPan?: (delta: { x: number; y: number }) => void
  } = {}

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.setupEventListeners()
  }

  // Setup all event listeners
  private setupEventListeners() {
    if (!this.canvas) return

    // Mouse events
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.addEventListener('click', this.handleClick.bind(this))
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this))
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this))

    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  // Register interaction callbacks
  public on(
    event: keyof typeof this.eventCallbacks,
    callback: any
  ) {
    this.eventCallbacks[event] = callback
  }

  // Get node at position
  public getNodeAtPosition(
    x: number,
    y: number,
    nodes: MatrixNode[]
  ): MatrixNode | null {
    for (const node of nodes) {
      const distance = Math.sqrt(
        Math.pow(x - node.position.x, 2) + 
        Math.pow(y - node.position.y, 2)
      )
      
      if (distance <= node.size / 2) {
        return node
      }
    }
    return null
  }

  // Convert canvas coordinates to world coordinates
  private getCanvasCoordinates(event: MouseEvent | Touch): { x: number; y: number } {
    if (!this.canvas) return { x: 0, y: 0 }
    
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
  }

  // Mouse move handler with Matrix glow effects
  private handleMouseMove(event: MouseEvent) {
    const coords = this.getCanvasCoordinates(event)
    
    // Update hover state for glow effects
    this.hoverState.position = coords
    
    // Handle dragging
    if (this.dragState.isDragging) {
      const delta = {
        x: coords.x - this.dragState.startPosition.x,
        y: coords.y - this.dragState.startPosition.y
      }
      
      this.dragState.currentPosition = coords
      this.eventCallbacks.onDrag?.(null, delta)
    }

    // Create interaction event
    const interactionEvent: MatrixInteractionEvent = {
      type: 'hover',
      target: null,
      position: coords,
      timestamp: Date.now(),
      modifiers: {
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        alt: event.altKey
      }
    }

    this.eventCallbacks.onHover?.(null, interactionEvent)
  }

  // Mouse down handler
  private handleMouseDown(event: MouseEvent) {
    const coords = this.getCanvasCoordinates(event)
    
    this.dragState.isDragging = true
    this.dragState.startPosition = coords
    this.dragState.currentPosition = coords
    
    event.preventDefault()
  }

  // Mouse up handler
  private handleMouseUp(event: MouseEvent) {
    this.dragState.isDragging = false
    this.dragState.nodeId = null
  }

  // Click handler with Matrix feedback
  private handleClick(event: MouseEvent) {
    const coords = this.getCanvasCoordinates(event)
    
    const interactionEvent: MatrixInteractionEvent = {
      type: 'click',
      target: null,
      position: coords,
      timestamp: Date.now(),
      modifiers: {
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        alt: event.altKey
      }
    }

    this.eventCallbacks.onClick?.(null, interactionEvent)
    
    // Add Matrix-style click ripple effect
    this.createClickRipple(coords)
  }

  // Wheel handler for zoom
  private handleWheel(event: WheelEvent) {
    event.preventDefault()
    
    const coords = this.getCanvasCoordinates(event)
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    
    this.eventCallbacks.onZoom?.(delta, coords)
  }

  // Mouse leave handler
  private handleMouseLeave() {
    this.hoverState.isActive = false
    this.hoverState.nodeId = null
    this.dragState.isDragging = false
  }

  // Touch start handler
  private handleTouchStart(event: TouchEvent) {
    event.preventDefault()
    
    this.touchState.isTouching = true
    this.touchState.touchCount = event.touches.length
    
    if (event.touches.length === 1) {
      // Single touch - treat as mouse
      const touch = event.touches[0]
      const coords = this.getCanvasCoordinates(touch)
      this.touchState.panStart = coords
      this.touchState.panCurrent = coords
    } else if (event.touches.length === 2) {
      // Two finger pinch/zoom
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      
      this.touchState.startDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
    }
  }

  // Touch move handler
  private handleTouchMove(event: TouchEvent) {
    event.preventDefault()
    
    if (event.touches.length === 1) {
      // Single touch pan
      const touch = event.touches[0]
      const coords = this.getCanvasCoordinates(touch)
      
      const delta = {
        x: coords.x - this.touchState.panCurrent.x,
        y: coords.y - this.touchState.panCurrent.y
      }
      
      this.touchState.panCurrent = coords
      this.eventCallbacks.onPan?.(delta)
      
    } else if (event.touches.length === 2) {
      // Two finger zoom
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      const scale = currentDistance / this.touchState.startDistance
      this.touchState.currentScale = scale
      
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      }
      
      this.eventCallbacks.onZoom?.(scale, center)
    }
  }

  // Touch end handler
  private handleTouchEnd(event: TouchEvent) {
    if (event.touches.length === 0) {
      this.touchState.isTouching = false
      this.touchState.touchCount = 0
    }
  }

  // Keyboard handlers for navigation
  private handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        this.clearSelection()
        break
      case '+':
      case '=':
        this.eventCallbacks.onZoom?.(1.1, { x: 0, y: 0 })
        break
      case '-':
        this.eventCallbacks.onZoom?.(0.9, { x: 0, y: 0 })
        break
      case 'ArrowUp':
        this.eventCallbacks.onPan?.({ x: 0, y: 20 })
        break
      case 'ArrowDown':
        this.eventCallbacks.onPan?.({ x: 0, y: -20 })
        break
      case 'ArrowLeft':
        this.eventCallbacks.onPan?.({ x: 20, y: 0 })
        break
      case 'ArrowRight':
        this.eventCallbacks.onPan?.({ x: -20, y: 0 })
        break
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    // Handle key up events if needed
  }

  // Create Matrix-style click ripple effect
  private createClickRipple(position: { x: number; y: number }) {
    // This would typically create a visual ripple effect
    // Implementation would depend on the rendering system
    console.log('Matrix click ripple at:', position)
  }

  // Clear all selections
  public clearSelection() {
    this.hoverState.nodeId = null
    this.hoverState.isActive = false
    this.dragState.isDragging = false
  }

  // Get current states
  public getHoverState(): HoverState {
    return { ...this.hoverState }
  }

  public getDragState(): DragState {
    return { ...this.dragState }
  }

  public getTouchState(): TouchState {
    return { ...this.touchState }
  }

  // Update hover state for Matrix glow effects
  public updateHover(
    nodeId: string | null,
    nodes: MatrixNode[],
    connections: MatrixConnection[]
  ) {
    this.hoverState.nodeId = nodeId
    this.hoverState.isActive = nodeId !== null
    
    if (nodeId) {
      // Find connected nodes for highlighting
      this.hoverState.connectedNodes = connections
        .filter(conn => conn.source === nodeId || conn.target === nodeId)
        .map(conn => conn.source === nodeId ? conn.target : conn.source)
      
      // Animate glow intensity
      this.animateGlowIntensity(0.8)
    } else {
      this.hoverState.connectedNodes = []
      this.animateGlowIntensity(0)
    }
  }

  // Animate glow intensity for Matrix effects
  private animateGlowIntensity(targetIntensity: number) {
    const startIntensity = this.hoverState.glowIntensity
    const startTime = Date.now()
    const duration = MATRIX_TIMINGS.fast

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      this.hoverState.glowIntensity = startIntensity + 
        (targetIntensity - startIntensity) * progress
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  // Cleanup event listeners
  public destroy() {
    if (!this.canvas) return
    
    // Remove all event listeners
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.removeEventListener('click', this.handleClick.bind(this))
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this))
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this))
    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))
  }
}

// Utility functions for interaction feedback
export const createMatrixFeedback = {
  // Create hover glow effect
  hover: (intensity: number = 0.6) => ({
    filter: `drop-shadow(0 0 ${15 * intensity}px ${MATRIX_COLORS.effects.glow})`,
    transform: `scale(${1 + 0.1 * intensity})`,
    transition: `all ${MATRIX_TIMINGS.fast}ms ease-out`
  }),
  
  // Create click feedback
  click: () => ({
    animation: `matrix-pulse ${MATRIX_TIMINGS.normal}ms ease-out`,
    filter: `drop-shadow(0 0 20px ${MATRIX_COLORS.effects.glowIntense})`
  }),
  
  // Create selection state
  selected: () => ({
    filter: `drop-shadow(0 0 25px ${MATRIX_COLORS.effects.glowIntense})`,
    transform: 'scale(1.15)',
    border: `2px solid ${MATRIX_COLORS.nodes.primary}`
  }),
  
  // Create dragging state
  dragging: () => ({
    opacity: 0.8,
    transform: 'scale(1.1)',
    filter: `drop-shadow(0 0 30px ${MATRIX_COLORS.effects.glow})`,
    cursor: 'grabbing'
  })
}

export default MatrixInteractionManager 