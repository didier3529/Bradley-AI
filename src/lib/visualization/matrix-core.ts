/**
 * Matrix Visualization Core Engine
 * Base visualization engine with Matrix theming and cyberpunk aesthetics
 */

import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { interpolateHsl } from 'd3-interpolate'
import { matrixColors } from '@/styles/design-tokens'

// Matrix color scheme for visualization
export const MATRIX_COLORS = {
  nodes: {
    primary: matrixColors.cyberBlue,        // #00d4ff - Primary bright blue
    secondary: matrixColors.cyberBlueDark,  // #0099cc - Secondary blue
    success: matrixColors.matrixGreen,      // #00ff41 - Matrix green
    warning: matrixColors.warningAmber,     // #ffaa00 - Orange alerts
    error: matrixColors.neonPink,           // #ff0080 - Red/Pink errors
  },
  backgrounds: {
    dark: matrixColors.matrixBlack,         // #0a0a0a
    void: matrixColors.deepBlack,           // #000000
    grid: matrixColors.matrixDarkGray,      // #1a1a1a
  },
  effects: {
    glow: matrixColors.cyberBlueGlow,       // rgba(0, 212, 255, 0.8)
    glowIntense: matrixColors.matrixGreenGlow, // rgba(0, 255, 65, 0.8)
    trail: matrixColors.glassEffect,        // rgba(0, 212, 255, 0.1)
  }
}

// Matrix animation timings
export const MATRIX_TIMINGS = {
  fast: 150,
  normal: 300,
  slow: 500,
  glitch: 100,
  pulse: 2000,
}

// Visualization configuration
export interface MatrixVisualizationConfig {
  width: number
  height: number
  theme: 'matrix' | 'dark'
  glowIntensity: number
  animationSpeed: 'fast' | 'normal' | 'slow'
  interactionMode: 'hover-glow' | 'click-expand' | 'both'
  nodeStyle: 'cyberpunk' | 'minimal'
  connectionStyle: 'matrix-lines' | 'digital-trails' | 'glow-paths'
  enableParticles: boolean
  enableGlitchEffects: boolean
}

// Node data structure for Matrix visualization
export interface MatrixNode {
  id: string
  symbol: string
  name: string
  position: {
    x: number
    y: number
    z?: number
  }
  size: number
  color: string
  value: number
  change24h: number
  weight: number // Portfolio weight (0-1)
  metadata: {
    portfolioWeight: number
    performanceCategory: 'up' | 'down' | 'stable'
    riskLevel: 'low' | 'medium' | 'high'
    marketCap?: number
    volume24h?: number
  }
  connections?: string[] // Connected node IDs
  animation?: {
    pulse: boolean
    glow: boolean
    rotation: number
  }
}

// Connection between nodes
export interface MatrixConnection {
  id: string
  source: string
  target: string
  strength: number // 0-1
  type: 'correlation' | 'dependency' | 'portfolio'
  animated: boolean
  color?: string
}

// Matrix visualization state
export interface MatrixVisualizationState {
  nodes: MatrixNode[]
  connections: MatrixConnection[]
  hoveredNode: string | null
  selectedNode: string | null
  zoom: number
  pan: { x: number; y: number }
  isAnimating: boolean
  lastUpdate: number
}

// Color scales for different data types
export const createMatrixColorScale = (domain: [number, number]) => {
  return scaleLinear<string>()
    .domain(domain)
    .range([
      MATRIX_COLORS.nodes.error,    // Red for negative
      MATRIX_COLORS.nodes.primary,  // Blue for neutral
      MATRIX_COLORS.nodes.success,  // Green for positive
    ])
    .interpolate(interpolateHsl)
}

// Size scale for nodes based on value
export const createMatrixSizeScale = (domain: [number, number], range: [number, number] = [20, 80]) => {
  return scaleLinear()
    .domain(domain)
    .range(range)
    .clamp(true)
}

// Performance category color mapping
export const getPerformanceColor = (category: string, change24h: number): string => {
  if (change24h > 0) return MATRIX_COLORS.nodes.success
  if (change24h < 0) return MATRIX_COLORS.nodes.error
  return MATRIX_COLORS.nodes.primary
}

// Risk level styling
export const getRiskStyling = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low':
      return {
        color: MATRIX_COLORS.nodes.success,
        glow: 'rgba(0, 255, 65, 0.3)',
        strokeWidth: 2,
      }
    case 'medium':
      return {
        color: MATRIX_COLORS.nodes.warning,
        glow: 'rgba(255, 170, 0, 0.3)',
        strokeWidth: 3,
      }
    case 'high':
      return {
        color: MATRIX_COLORS.nodes.error,
        glow: 'rgba(255, 0, 64, 0.3)',
        strokeWidth: 4,
      }
    default:
      return {
        color: MATRIX_COLORS.nodes.primary,
        glow: MATRIX_COLORS.effects.glow,
        strokeWidth: 2,
      }
  }
}

// Animation easing functions for Matrix effects
export const MATRIX_EASING = {
  cyberpunk: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  glitch: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

// Default configuration
export const DEFAULT_MATRIX_CONFIG: MatrixVisualizationConfig = {
  width: 800,
  height: 600,
  theme: 'matrix',
  glowIntensity: 0.6,
  animationSpeed: 'normal',
  interactionMode: 'both',
  nodeStyle: 'cyberpunk',
  connectionStyle: 'digital-trails',
  enableParticles: true,
  enableGlitchEffects: true,
}

// Utility functions for Matrix visualization
export const matrixUtils = {
  // Generate a unique ID for nodes
  generateNodeId: () => `matrix-node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Calculate node position in circular layout
  calculateCircularPosition: (index: number, total: number, radius: number, centerX: number, centerY: number) => {
    const angle = (index / total) * 2 * Math.PI
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  },
  
  // Calculate distance between two nodes
  calculateDistance: (node1: MatrixNode, node2: MatrixNode) => {
    const dx = node1.position.x - node2.position.x
    const dy = node1.position.y - node2.position.y
    return Math.sqrt(dx * dx + dy * dy)
  },
  
  // Check if point is inside node
  isPointInNode: (point: { x: number; y: number }, node: MatrixNode) => {
    const distance = Math.sqrt(
      Math.pow(point.x - node.position.x, 2) + 
      Math.pow(point.y - node.position.y, 2)
    )
    return distance <= node.size / 2
  },
  
  // Apply Matrix glow effect
  applyMatrixGlow: (intensity: number = 0.6) => ({
    filter: `drop-shadow(0 0 ${10 * intensity}px ${MATRIX_COLORS.effects.glow})`,
    boxShadow: `0 0 ${20 * intensity}px ${MATRIX_COLORS.effects.glow}`,
  }),
  
  // Generate glitch animation keyframes
  generateGlitchKeyframes: () => `
    @keyframes matrix-glitch {
      0%, 100% { transform: translate(0); }
      10% { transform: translate(-2px, 1px); }
      20% { transform: translate(2px, -1px); }
      30% { transform: translate(-1px, 2px); }
      40% { transform: translate(1px, -2px); }
      50% { transform: translate(-2px, -1px); }
      60% { transform: translate(2px, 1px); }
      70% { transform: translate(-1px, -2px); }
      80% { transform: translate(1px, 2px); }
      90% { transform: translate(-2px, 1px); }
    }
  `,
}

// Performance monitoring for visualization
export class MatrixVisualizationPerformance {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 60
  
  startFrame() {
    this.frameCount++
    const currentTime = performance.now()
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastTime = currentTime
    }
  }
  
  getFPS() {
    return this.fps
  }
  
  shouldReduceQuality() {
    return this.fps < 30
  }
  
  getPerformanceLevel(): 'high' | 'medium' | 'low' {
    if (this.fps >= 50) return 'high'
    if (this.fps >= 30) return 'medium'
    return 'low'
  }
}

export default {
  MATRIX_COLORS,
  MATRIX_TIMINGS,
  MATRIX_EASING,
  DEFAULT_MATRIX_CONFIG,
  createMatrixColorScale,
  createMatrixSizeScale,
  getPerformanceColor,
  getRiskStyling,
  matrixUtils,
  MatrixVisualizationPerformance,
} 