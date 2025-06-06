/**
 * Matrix Visualization Animations
 * Smooth transition system with glitch effects and cyberpunk aesthetics
 */

import { MATRIX_COLORS, MATRIX_TIMINGS, MATRIX_EASING } from './matrix-core'
import type { MatrixNode, MatrixConnection } from './matrix-core'

// Animation types and configurations
export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
  repeat?: boolean
  yoyo?: boolean
}

export interface MatrixAnimationState {
  nodes: Map<string, NodeAnimationState>
  connections: Map<string, ConnectionAnimationState>
  global: GlobalAnimationState
}

export interface NodeAnimationState {
  position: { x: number; y: number; targetX: number; targetY: number }
  size: { current: number; target: number }
  opacity: { current: number; target: number }
  glow: { intensity: number; target: number }
  rotation: number
  pulse: { active: boolean; phase: number }
  glitch: { active: boolean; intensity: number }
}

export interface ConnectionAnimationState {
  opacity: { current: number; target: number }
  flow: { progress: number; direction: 1 | -1 }
  pulse: { active: boolean; phase: number }
  glitch: { active: boolean; intensity: number }
}

export interface GlobalAnimationState {
  zoom: { current: number; target: number }
  pan: { x: number; y: number; targetX: number; targetY: number }
  backgroundGlitch: { active: boolean; intensity: number }
  digitalRain: { intensity: number; speed: number }
}

// Matrix Animation Engine
export class MatrixAnimationEngine {
  private animationState: MatrixAnimationState
  private animationFrame: number | null = null
  private lastTime = 0
  private isRunning = false

  constructor() {
    this.animationState = {
      nodes: new Map(),
      connections: new Map(),
      global: {
        zoom: { current: 1, target: 1 },
        pan: { x: 0, y: 0, targetX: 0, targetY: 0 },
        backgroundGlitch: { active: false, intensity: 0 },
        digitalRain: { intensity: 0.5, speed: 1 }
      }
    }
  }

  // Start the animation loop
  public start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.lastTime = performance.now()
    this.animate()
  }

  // Stop the animation loop
  public stop() {
    this.isRunning = false
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  // Main animation loop
  private animate = (currentTime: number = performance.now()) => {
    if (!this.isRunning) return

    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // Update all animations
    this.updateNodeAnimations(deltaTime)
    this.updateConnectionAnimations(deltaTime)
    this.updateGlobalAnimations(deltaTime)

    // Schedule next frame
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  // Initialize node animation state
  public initializeNode(node: MatrixNode) {
    this.animationState.nodes.set(node.id, {
      position: {
        x: node.position.x,
        y: node.position.y,
        targetX: node.position.x,
        targetY: node.position.y
      },
      size: { current: node.size, target: node.size },
      opacity: { current: 1, target: 1 },
      glow: { intensity: 0, target: 0 },
      rotation: 0,
      pulse: { active: false, phase: 0 },
      glitch: { active: false, intensity: 0 }
    })
  }

  // Initialize connection animation state
  public initializeConnection(connection: MatrixConnection) {
    this.animationState.connections.set(connection.id, {
      opacity: { current: 0.7, target: 0.7 },
      flow: { progress: 0, direction: 1 },
      pulse: { active: connection.animated, phase: 0 },
      glitch: { active: false, intensity: 0 }
    })
  }

  // Animate node to new position
  public animateNodeTo(
    nodeId: string,
    targetPosition: { x: number; y: number },
    config: AnimationConfig = { duration: MATRIX_TIMINGS.normal, easing: MATRIX_EASING.smooth }
  ) {
    const nodeState = this.animationState.nodes.get(nodeId)
    if (!nodeState) return

    nodeState.position.targetX = targetPosition.x
    nodeState.position.targetY = targetPosition.y
  }

  // Update node animations
  private updateNodeAnimations(deltaTime: number) {
    this.animationState.nodes.forEach((nodeState, nodeId) => {
      // Smooth position interpolation
      const positionLerpSpeed = 0.1
      nodeState.position.x = this.lerp(
        nodeState.position.x,
        nodeState.position.targetX,
        positionLerpSpeed
      )
      nodeState.position.y = this.lerp(
        nodeState.position.y,
        nodeState.position.targetY,
        positionLerpSpeed
      )

      // Size animation
      const sizeLerpSpeed = 0.2
      nodeState.size.current = this.lerp(
        nodeState.size.current,
        nodeState.size.target,
        sizeLerpSpeed
      )

      // Opacity animation
      const opacityLerpSpeed = 0.15
      nodeState.opacity.current = this.lerp(
        nodeState.opacity.current,
        nodeState.opacity.target,
        opacityLerpSpeed
      )

      // Glow animation
      const glowLerpSpeed = 0.3
      nodeState.glow.intensity = this.lerp(
        nodeState.glow.intensity,
        nodeState.glow.target,
        glowLerpSpeed
      )

      // Pulse animation
      if (nodeState.pulse.active) {
        nodeState.pulse.phase += deltaTime * 0.003
        if (nodeState.pulse.phase > Math.PI * 2) {
          nodeState.pulse.phase -= Math.PI * 2
        }
      }

      // Glitch effect
      if (nodeState.glitch.active) {
        nodeState.glitch.intensity = Math.random() * 0.5 + 0.5
      }

      // Rotation for special effects
      nodeState.rotation += deltaTime * 0.001
    })
  }

  // Update connection animations
  private updateConnectionAnimations(deltaTime: number) {
    this.animationState.connections.forEach((connectionState) => {
      // Opacity animation
      const opacityLerpSpeed = 0.1
      connectionState.opacity.current = this.lerp(
        connectionState.opacity.current,
        connectionState.opacity.target,
        opacityLerpSpeed
      )

      // Flow animation for data streams
      if (connectionState.pulse.active) {
        connectionState.flow.progress += deltaTime * 0.002 * connectionState.flow.direction
        
        if (connectionState.flow.progress > 1) {
          connectionState.flow.progress = 0
        } else if (connectionState.flow.progress < 0) {
          connectionState.flow.progress = 1
        }
      }

      // Pulse animation
      if (connectionState.pulse.active) {
        connectionState.pulse.phase += deltaTime * 0.004
        if (connectionState.pulse.phase > Math.PI * 2) {
          connectionState.pulse.phase -= Math.PI * 2
        }
      }

      // Glitch effect for connections
      if (connectionState.glitch.active) {
        connectionState.glitch.intensity = Math.random() * 0.3
      }
    })
  }

  // Update global animations
  private updateGlobalAnimations(deltaTime: number) {
    const globalState = this.animationState.global

    // Zoom animation
    const zoomLerpSpeed = 0.1
    globalState.zoom.current = this.lerp(
      globalState.zoom.current,
      globalState.zoom.target,
      zoomLerpSpeed
    )

    // Pan animation
    const panLerpSpeed = 0.1
    globalState.pan.x = this.lerp(
      globalState.pan.x,
      globalState.pan.targetX,
      panLerpSpeed
    )
    globalState.pan.y = this.lerp(
      globalState.pan.y,
      globalState.pan.targetY,
      panLerpSpeed
    )

    // Background effects
    if (globalState.backgroundGlitch.active) {
      globalState.backgroundGlitch.intensity = Math.random() * 0.2 + 0.1
    }
  }

  // Trigger hover effect
  public triggerHoverEffect(nodeId: string, intensity: number = 0.8) {
    const nodeState = this.animationState.nodes.get(nodeId)
    if (!nodeState) return

    nodeState.glow.target = intensity
    nodeState.size.target *= 1.1
    nodeState.pulse.active = true
  }

  // Clear hover effect
  public clearHoverEffect(nodeId: string) {
    const nodeState = this.animationState.nodes.get(nodeId)
    if (!nodeState) return

    nodeState.glow.target = 0
    nodeState.size.target /= 1.1
    nodeState.pulse.active = false
  }

  // Trigger click effect with Matrix glitch
  public triggerClickEffect(nodeId: string) {
    const nodeState = this.animationState.nodes.get(nodeId)
    if (!nodeState) return

    // Immediate glitch effect
    nodeState.glitch.active = true
    nodeState.size.target *= 1.2
    nodeState.glow.target = 1.0

    // Reset after short duration
    setTimeout(() => {
      if (nodeState) {
        nodeState.glitch.active = false
        nodeState.size.target /= 1.2
        nodeState.glow.target = 0.3
      }
    }, MATRIX_TIMINGS.glitch)
  }

  // Trigger connection pulse
  public triggerConnectionPulse(connectionId: string) {
    const connectionState = this.animationState.connections.get(connectionId)
    if (!connectionState) return

    connectionState.pulse.active = true
    connectionState.flow.direction = Math.random() > 0.5 ? 1 : -1
  }

  // Animate layout transition
  public animateLayoutTransition(
    nodes: MatrixNode[],
    config: AnimationConfig = { duration: MATRIX_TIMINGS.slow, easing: MATRIX_EASING.cyberpunk }
  ) {
    nodes.forEach(node => {
      this.animateNodeTo(node.id, node.position, config)
    })

    // Add stagger effect for more dynamic appearance
    nodes.forEach((node, index) => {
      setTimeout(() => {
        this.triggerGlitchEffect(node.id, 0.3)
      }, index * 50)
    })
  }

  // Trigger global glitch effect
  public triggerGlobalGlitch(duration: number = MATRIX_TIMINGS.normal) {
    this.animationState.global.backgroundGlitch.active = true
    
    setTimeout(() => {
      this.animationState.global.backgroundGlitch.active = false
    }, duration)
  }

  // Trigger glitch effect on specific node
  public triggerGlitchEffect(nodeId: string, intensity: number = 0.5) {
    const nodeState = this.animationState.nodes.get(nodeId)
    if (!nodeState) return

    nodeState.glitch.active = true
    nodeState.glitch.intensity = intensity

    setTimeout(() => {
      if (nodeState) {
        nodeState.glitch.active = false
      }
    }, MATRIX_TIMINGS.glitch * 3)
  }

  // Set zoom target
  public setZoomTarget(zoom: number) {
    this.animationState.global.zoom.target = Math.max(0.1, Math.min(5, zoom))
  }

  // Set pan target
  public setPanTarget(x: number, y: number) {
    this.animationState.global.pan.targetX = x
    this.animationState.global.pan.targetY = y
  }

  // Get current animation state for a node
  public getNodeState(nodeId: string): NodeAnimationState | null {
    return this.animationState.nodes.get(nodeId) || null
  }

  // Get current animation state for a connection
  public getConnectionState(connectionId: string): ConnectionAnimationState | null {
    return this.animationState.connections.get(connectionId) || null
  }

  // Get global animation state
  public getGlobalState(): GlobalAnimationState {
    return this.animationState.global
  }

  // Linear interpolation utility
  private lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor
  }

  // Smooth step function for easing
  private smoothStep(t: number): number {
    return t * t * (3 - 2 * t)
  }

  // Ease out cubic function
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  // Cleanup and destroy
  public destroy() {
    this.stop()
    this.animationState.nodes.clear()
    this.animationState.connections.clear()
  }
}

// Predefined animation sequences
export const MatrixAnimationSequences = {
  // Entrance animation for new nodes
  nodeEntrance: (engine: MatrixAnimationEngine, nodeId: string) => {
    const nodeState = engine.getNodeState(nodeId)
    if (!nodeState) return

    // Start with small size and no glow
    nodeState.size.current = 0
    nodeState.opacity.current = 0
    nodeState.glow.intensity = 0

    // Animate to full size with glow
    nodeState.size.target = nodeState.size.target
    nodeState.opacity.target = 1
    nodeState.glow.target = 0.5

    // Add glitch effect during entrance
    setTimeout(() => {
      engine.triggerGlitchEffect(nodeId, 0.8)
    }, 100)
  },

  // Exit animation for removed nodes
  nodeExit: (engine: MatrixAnimationEngine, nodeId: string) => {
    const nodeState = engine.getNodeState(nodeId)
    if (!nodeState) return

    // Fade out with glitch
    nodeState.size.target = 0
    nodeState.opacity.target = 0
    nodeState.glow.target = 0
    nodeState.glitch.active = true
  },

  // Connection establishment animation
  connectionEstablish: (engine: MatrixAnimationEngine, connectionId: string) => {
    const connectionState = engine.getConnectionState(connectionId)
    if (!connectionState) return

    // Start invisible and fade in
    connectionState.opacity.current = 0
    connectionState.opacity.target = 0.7
    connectionState.pulse.active = true
    connectionState.flow.direction = 1
  },

  // Data flow pulse animation
  dataFlowPulse: (engine: MatrixAnimationEngine, nodeIds: string[]) => {
    nodeIds.forEach((nodeId, index) => {
      setTimeout(() => {
        engine.triggerClickEffect(nodeId)
      }, index * 100)
    })
  },

  // Matrix rain effect sync
  matrixRainSync: (engine: MatrixAnimationEngine, intensity: number = 0.5) => {
    const globalState = engine.getGlobalState()
    globalState.digitalRain.intensity = intensity
    globalState.digitalRain.speed = intensity * 2
  }
}

export default MatrixAnimationEngine 