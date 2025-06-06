/**
 * Matrix Visualization Calculations
 * D3.js positioning math and layout algorithms for Matrix visualizations
 */

import { scaleLinear, scaleRadial, scaleOrdinal } from 'd3-scale'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { MatrixNode, MatrixConnection } from './matrix-core'

// Layout types supported by Matrix visualization
export type LayoutType = 'circular' | 'force' | 'grid' | 'spiral' | 'constellation'

// Configuration for different layout algorithms
export interface LayoutConfig {
  type: LayoutType
  width: number
  height: number
  centerX: number
  centerY: number
  padding: number
  nodeSpacing: number
  animationDuration: number
}

// Circular layout calculation
export const calculateCircularLayout = (
  nodes: MatrixNode[],
  config: LayoutConfig
): MatrixNode[] => {
  const { centerX, centerY, width, height, padding } = config
  const radius = Math.min(width, height) / 2 - padding
  const total = nodes.length
  
  return nodes.map((node, index) => {
    const angle = (index / total) * 2 * Math.PI
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    return {
      ...node,
      position: { x, y, z: node.position.z }
    }
  })
}

// Multi-ring circular layout for large datasets
export const calculateMultiRingLayout = (
  nodes: MatrixNode[],
  config: LayoutConfig,
  ringsConfig: { maxNodesPerRing: number; ringSpacing: number }
): MatrixNode[] => {
  const { centerX, centerY, width, height, padding } = config
  const { maxNodesPerRing, ringSpacing } = ringsConfig
  const maxRadius = Math.min(width, height) / 2 - padding
  
  const rings: MatrixNode[][] = []
  for (let i = 0; i < nodes.length; i += maxNodesPerRing) {
    rings.push(nodes.slice(i, i + maxNodesPerRing))
  }
  
  return rings.flatMap((ringNodes, ringIndex) => {
    const radius = maxRadius - (ringIndex * ringSpacing)
    const total = ringNodes.length
    
    return ringNodes.map((node, index) => {
      const angle = (index / total) * 2 * Math.PI
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      return {
        ...node,
        position: { x, y, z: ringIndex }
      }
    })
  })
}

// Force-directed layout using D3 force simulation
export const calculateForceLayout = (
  nodes: MatrixNode[],
  connections: MatrixConnection[],
  config: LayoutConfig
): { nodes: MatrixNode[]; simulation: any } => {
  const { width, height, centerX, centerY } = config
  
  // Create D3 force simulation
  const simulation = forceSimulation(nodes as any)
    .force('link', forceLink(connections as any)
      .id((d: any) => d.id)
      .distance(80)
      .strength(0.1)
    )
    .force('charge', forceManyBody()
      .strength(-300)
      .distanceMax(200)
    )
    .force('center', forceCenter(centerX, centerY))
    .force('collision', forceCollide()
      .radius((d: any) => d.size / 2 + 10)
      .strength(0.7)
    )
    .alphaDecay(0.02)
    .velocityDecay(0.8)
  
  return { nodes, simulation }
}

// Grid layout for systematic arrangement
export const calculateGridLayout = (
  nodes: MatrixNode[],
  config: LayoutConfig
): MatrixNode[] => {
  const { width, height, padding, nodeSpacing } = config
  const availableWidth = width - (padding * 2)
  const availableHeight = height - (padding * 2)
  
  const cols = Math.ceil(Math.sqrt(nodes.length))
  const rows = Math.ceil(nodes.length / cols)
  
  const cellWidth = availableWidth / cols
  const cellHeight = availableHeight / rows
  
  return nodes.map((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    
    const x = padding + (col * cellWidth) + (cellWidth / 2)
    const y = padding + (row * cellHeight) + (cellHeight / 2)
    
    return {
      ...node,
      position: { x, y, z: node.position.z }
    }
  })
}

// Spiral layout for organic feel
export const calculateSpiralLayout = (
  nodes: MatrixNode[],
  config: LayoutConfig
): MatrixNode[] => {
  const { centerX, centerY, width, height, padding } = config
  const maxRadius = Math.min(width, height) / 2 - padding
  const spiralTightness = 0.1
  
  return nodes.map((node, index) => {
    const angle = index * spiralTightness
    const radius = (index / nodes.length) * maxRadius
    
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    return {
      ...node,
      position: { x, y, z: node.position.z }
    }
  })
}

// Constellation layout for portfolio grouping
export const calculateConstellationLayout = (
  nodes: MatrixNode[],
  config: LayoutConfig,
  groups: { [key: string]: string[] } // groupId -> nodeIds
): MatrixNode[] => {
  const { centerX, centerY, width, height, padding } = config
  const groupKeys = Object.keys(groups)
  const groupRadius = Math.min(width, height) / 4 - padding
  const nodeRadius = groupRadius / 3
  
  // Position group centers in a circle
  const groupCenters = groupKeys.map((groupId, index) => {
    const angle = (index / groupKeys.length) * 2 * Math.PI
    return {
      id: groupId,
      x: centerX + groupRadius * Math.cos(angle),
      y: centerY + groupRadius * Math.sin(angle)
    }
  })
  
  return nodes.map(node => {
    // Find which group this node belongs to
    const groupId = Object.keys(groups).find(gId => 
      groups[gId].includes(node.id)
    ) || 'default'
    
    const groupCenter = groupCenters.find(gc => gc.id === groupId) || 
      { x: centerX, y: centerY }
    
    const groupNodes = groups[groupId] || [node.id]
    const nodeIndex = groupNodes.indexOf(node.id)
    const totalInGroup = groupNodes.length
    
    // Position within group
    if (totalInGroup === 1) {
      return {
        ...node,
        position: { x: groupCenter.x, y: groupCenter.y, z: node.position.z }
      }
    }
    
    const angle = (nodeIndex / totalInGroup) * 2 * Math.PI
    const x = groupCenter.x + nodeRadius * Math.cos(angle)
    const y = groupCenter.y + nodeRadius * Math.sin(angle)
    
    return {
      ...node,
      position: { x, y, z: node.position.z }
    }
  })
}

// Calculate optimal node sizes based on data
export const calculateNodeSizes = (
  nodes: MatrixNode[],
  sizeMetric: 'value' | 'marketCap' | 'volume24h' | 'weight',
  minSize: number = 20,
  maxSize: number = 80
): MatrixNode[] => {
  const values = nodes.map(node => {
    switch (sizeMetric) {
      case 'value': return node.value
      case 'marketCap': return node.metadata.marketCap || 0
      case 'volume24h': return node.metadata.volume24h || 0
      case 'weight': return node.weight
      default: return node.value
    }
  })
  
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  
  const sizeScale = scaleLinear()
    .domain([minValue, maxValue])
    .range([minSize, maxSize])
    .clamp(true)
  
  return nodes.map((node, index) => ({
    ...node,
    size: sizeScale(values[index])
  }))
}

// Calculate connections between nodes based on correlation
export const calculateConnections = (
  nodes: MatrixNode[],
  correlationThreshold: number = 0.7
): MatrixConnection[] => {
  const connections: MatrixConnection[] = []
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i]
      const nodeB = nodes[j]
      
      // Calculate correlation based on performance similarity
      const correlation = calculateCorrelation(nodeA, nodeB)
      
      if (Math.abs(correlation) >= correlationThreshold) {
        connections.push({
          id: `${nodeA.id}-${nodeB.id}`,
          source: nodeA.id,
          target: nodeB.id,
          strength: Math.abs(correlation),
          type: correlation > 0 ? 'correlation' : 'dependency',
          animated: Math.abs(correlation) > 0.8,
          color: correlation > 0 ? '#00ff41' : '#ff0080'
        })
      }
    }
  }
  
  return connections
}

// Simple correlation calculation
const calculateCorrelation = (nodeA: MatrixNode, nodeB: MatrixNode): number => {
  // Simplified correlation based on performance categories
  if (nodeA.metadata.performanceCategory === nodeB.metadata.performanceCategory) {
    return 0.8 + (Math.random() * 0.2) // 0.8-1.0 correlation
  }
  
  // Different categories but similar risk levels
  if (nodeA.metadata.riskLevel === nodeB.metadata.riskLevel) {
    return 0.4 + (Math.random() * 0.3) // 0.4-0.7 correlation
  }
  
  return Math.random() * 0.3 // 0-0.3 correlation
}

// Animate between layouts smoothly
export const interpolateLayouts = (
  fromNodes: MatrixNode[],
  toNodes: MatrixNode[],
  progress: number // 0-1
): MatrixNode[] => {
  return fromNodes.map((fromNode, index) => {
    const toNode = toNodes[index]
    if (!toNode) return fromNode
    
    return {
      ...fromNode,
      position: {
        x: fromNode.position.x + (toNode.position.x - fromNode.position.x) * progress,
        y: fromNode.position.y + (toNode.position.y - fromNode.position.y) * progress,
        z: fromNode.position.z
      }
    }
  })
}

// Viewport bounds checking
export const constrainToViewport = (
  nodes: MatrixNode[],
  bounds: { width: number; height: number; padding: number }
): MatrixNode[] => {
  const { width, height, padding } = bounds
  
  return nodes.map(node => ({
    ...node,
    position: {
      x: Math.max(padding + node.size/2, 
          Math.min(width - padding - node.size/2, node.position.x)),
      y: Math.max(padding + node.size/2, 
          Math.min(height - padding - node.size/2, node.position.y)),
      z: node.position.z
    }
  }))
}

// Export layout calculator factory
export const createLayoutCalculator = (config: LayoutConfig) => ({
  circular: (nodes: MatrixNode[]) => calculateCircularLayout(nodes, config),
  multiRing: (nodes: MatrixNode[], ringsConfig: any) => 
    calculateMultiRingLayout(nodes, config, ringsConfig),
  force: (nodes: MatrixNode[], connections: MatrixConnection[]) => 
    calculateForceLayout(nodes, connections, config),
  grid: (nodes: MatrixNode[]) => calculateGridLayout(nodes, config),
  spiral: (nodes: MatrixNode[]) => calculateSpiralLayout(nodes, config),
  constellation: (nodes: MatrixNode[], groups: any) => 
    calculateConstellationLayout(nodes, config, groups),
})

export default {
  calculateCircularLayout,
  calculateMultiRingLayout,
  calculateForceLayout,
  calculateGridLayout,
  calculateSpiralLayout,
  calculateConstellationLayout,
  calculateNodeSizes,
  calculateConnections,
  interpolateLayouts,
  constrainToViewport,
  createLayoutCalculator,
} 