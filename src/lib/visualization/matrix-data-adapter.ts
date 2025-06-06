/**
 * Matrix Data Integration Layer
 * Transform portfolio data for visualization with real-time binding
 * Performance optimization and Matrix-style error handling
 */

import { 
  MATRIX_COLORS,
  type MatrixNode,
  type MatrixConnection,
  matrixUtils
} from './matrix-core'

// Data source types
export type DataSource = 'portfolio' | 'market' | 'defi' | 'nft'

// Raw portfolio data structure
export interface RawPortfolioData {
  address: string
  tokens: RawTokenData[]
  timestamp: number
  chainId?: number
}

export interface RawTokenData {
  address: string
  symbol: string
  name: string
  balance: string
  decimals: number
  price?: number
  priceChange24h?: number
  marketCap?: number
  volume24h?: number
  logoUrl?: string
}

// Market data structure
export interface MarketData {
  symbol: string
  price: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  rank?: number
  sparkline?: number[]
}

// Matrix data adapter configuration
export interface DataAdapterConfig {
  autoRefresh: boolean
  refreshInterval: number // milliseconds
  cacheTimeout: number // milliseconds
  enableRealTime: boolean
  errorRetryAttempts: number
  performanceMode: 'high' | 'medium' | 'low'
  matrixEffects: {
    enableGlitchOnError: boolean
    enablePulseOnUpdate: boolean
    glowIntensityOnChange: number
  }
}

// Data cache entry
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
  source: DataSource
}

// Matrix Data Adapter Class
export class MatrixDataAdapter {
  private cache = new Map<string, CacheEntry<any>>()
  private subscribers = new Map<string, Set<(data: any) => void>>()
  private refreshIntervals = new Map<string, NodeJS.Timeout>()
  private config: DataAdapterConfig

  constructor(config: Partial<DataAdapterConfig> = {}) {
    this.config = {
      autoRefresh: true,
      refreshInterval: 5000,
      cacheTimeout: 30000,
      enableRealTime: true,
      errorRetryAttempts: 3,
      performanceMode: 'high',
      matrixEffects: {
        enableGlitchOnError: true,
        enablePulseOnUpdate: true,
        glowIntensityOnChange: 0.8
      },
      ...config
    }
  }

  // Transform raw portfolio data to Matrix nodes
  public transformPortfolioToNodes(
    rawData: RawPortfolioData,
    marketData: Map<string, MarketData> = new Map()
  ): MatrixNode[] {
    if (!rawData.tokens.length) return []

    // Calculate total portfolio value for weights
    const totalValue = rawData.tokens.reduce((sum, token) => {
      const price = marketData.get(token.symbol)?.price || token.price || 0
      const balance = parseFloat(token.balance) / Math.pow(10, token.decimals)
      return sum + (balance * price)
    }, 0)

    return rawData.tokens.map((token, index) => {
      const market = marketData.get(token.symbol)
      const price = market?.price || token.price || 0
      const balance = parseFloat(token.balance) / Math.pow(10, token.decimals)
      const value = balance * price
      const change24h = market?.priceChange24h || token.priceChange24h || 0

      return {
        id: `${rawData.address}-${token.address}`,
        symbol: token.symbol,
        name: token.name,
        position: { x: 0, y: 0 }, // Will be set by layout
        size: this.calculateNodeSize(value, totalValue),
        color: this.getNodeColor(change24h),
        value,
        change24h,
        weight: totalValue > 0 ? value / totalValue : 0,
        metadata: {
          portfolioWeight: totalValue > 0 ? value / totalValue : 0,
          performanceCategory: change24h > 0 ? 'up' as const : 
                              change24h < 0 ? 'down' as const : 'stable' as const,
          riskLevel: this.calculateRiskLevel(market),
          marketCap: market?.marketCap,
          volume24h: market?.volume24h
        },
        connections: [],
        animation: {
          pulse: Math.abs(change24h) > 5, // Pulse for significant changes
          glow: value > totalValue * 0.1, // Glow for major holdings
          rotation: 0
        }
      }
    })
  }

  // Generate connections between nodes based on correlations
  public generateConnections(
    nodes: MatrixNode[],
    marketData: Map<string, MarketData>,
    threshold: number = 0.6
  ): MatrixConnection[] {
    const connections: MatrixConnection[] = []

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i]
        const nodeB = nodes[j]
        
        const correlation = this.calculateCorrelation(nodeA, nodeB, marketData)
        
        if (Math.abs(correlation) >= threshold) {
          connections.push({
            id: `${nodeA.id}-${nodeB.id}`,
            source: nodeA.id,
            target: nodeB.id,
            strength: Math.abs(correlation),
            type: correlation > 0 ? 'correlation' : 'dependency',
            animated: Math.abs(correlation) > 0.8,
            color: this.getConnectionColor(correlation)
          })
        }
      }
    }

    return connections
  }

  // Real-time data subscription
  public subscribe<T>(
    key: string,
    callback: (data: T) => void,
    source: DataSource = 'portfolio'
  ): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    
    this.subscribers.get(key)!.add(callback)

    // Start auto-refresh if enabled
    if (this.config.autoRefresh && !this.refreshIntervals.has(key)) {
      this.startAutoRefresh(key, source)
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.subscribers.delete(key)
          this.stopAutoRefresh(key)
        }
      }
    }
  }

  // Update data with Matrix effects
  public updateData<T>(key: string, data: T, source: DataSource = 'portfolio') {
    const now = Date.now()
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + this.config.cacheTimeout,
      source
    }

    this.cache.set(key, cacheEntry)

    // Notify subscribers with Matrix effects
    const subscribers = this.subscribers.get(key)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data)
          
          // Trigger Matrix pulse effect on update
          if (this.config.matrixEffects.enablePulseOnUpdate) {
            this.triggerMatrixUpdate(key, data)
          }
        } catch (error) {
          console.error('Matrix Data Adapter: Subscriber callback error:', error)
          
          // Trigger glitch effect on error
          if (this.config.matrixEffects.enableGlitchOnError) {
            this.triggerMatrixError(key, error)
          }
        }
      })
    }
  }

  // Get cached data
  public getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  // Batch update for performance
  public batchUpdate(updates: Array<{ key: string; data: any; source?: DataSource }>) {
    const notifications = new Map<string, Set<(data: any) => void>>()

    // Collect all updates and subscribers
    updates.forEach(({ key, data, source = 'portfolio' }) => {
      const now = Date.now()
      this.cache.set(key, {
        data,
        timestamp: now,
        expiry: now + this.config.cacheTimeout,
        source
      })

      const subs = this.subscribers.get(key)
      if (subs) {
        notifications.set(key, subs)
      }
    })

    // Batch notify subscribers
    notifications.forEach((subscribers, key) => {
      const data = this.cache.get(key)?.data
      subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Batch update callback error:', error)
        }
      })
    })
  }

  // Error handling with Matrix effects
  public handleError(error: Error, context: string) {
    console.error(`Matrix Data Adapter Error [${context}]:`, error)

    // Trigger Matrix glitch effect
    if (this.config.matrixEffects.enableGlitchOnError) {
      this.triggerMatrixError(context, error)
    }

    // Emit error event to subscribers
    const errorKey = `error:${context}`
    this.updateData(errorKey, { error: error.message, timestamp: Date.now() })
  }

  // Performance optimization based on mode
  public optimizeForPerformance(): void {
    switch (this.config.performanceMode) {
      case 'low':
        this.config.refreshInterval = 10000 // 10s
        this.config.cacheTimeout = 60000 // 1min
        break
      case 'medium':
        this.config.refreshInterval = 5000 // 5s
        this.config.cacheTimeout = 30000 // 30s
        break
      case 'high':
        this.config.refreshInterval = 1000 // 1s
        this.config.cacheTimeout = 10000 // 10s
        break
    }

    // Clear existing intervals and restart with new settings
    this.refreshIntervals.forEach((interval, key) => {
      clearInterval(interval)
      this.startAutoRefresh(key, 'portfolio')
    })
  }

  // Calculate node size based on value proportion
  private calculateNodeSize(value: number, totalValue: number): number {
    if (totalValue === 0) return 40

    const proportion = value / totalValue
    const minSize = 30
    const maxSize = 100
    
    return minSize + (maxSize - minSize) * Math.sqrt(proportion)
  }

  // Get node color based on performance
  private getNodeColor(change24h: number): string {
    if (change24h > 5) return MATRIX_COLORS.nodes.success
    if (change24h < -5) return MATRIX_COLORS.nodes.error
    if (change24h > 0) return MATRIX_COLORS.nodes.primary
    if (change24h < 0) return MATRIX_COLORS.nodes.warning
    return MATRIX_COLORS.nodes.secondary
  }

  // Calculate risk level based on market data
  private calculateRiskLevel(market?: MarketData): 'low' | 'medium' | 'high' {
    if (!market) return 'medium'

    const volatility = Math.abs(market.priceChange24h)
    const marketCapRisk = market.marketCap < 100000000 // < 100M = high risk

    if (volatility > 20 || marketCapRisk) return 'high'
    if (volatility > 10) return 'medium'
    return 'low'
  }

  // Calculate correlation between two nodes
  private calculateCorrelation(
    nodeA: MatrixNode,
    nodeB: MatrixNode,
    marketData: Map<string, MarketData>
  ): number {
    const marketA = marketData.get(nodeA.symbol)
    const marketB = marketData.get(nodeB.symbol)

    if (!marketA || !marketB) {
      // Fallback to basic correlation based on performance categories
      if (nodeA.metadata.performanceCategory === nodeB.metadata.performanceCategory) {
        return 0.6 + (Math.random() * 0.3)
      }
      return Math.random() * 0.4
    }

    // Calculate correlation based on price movements and market cap
    const priceCorrelation = 1 - Math.abs(marketA.priceChange24h - marketB.priceChange24h) / 100
    const sizeCorrelation = 1 - Math.abs(
      Math.log10(marketA.marketCap || 1) - Math.log10(marketB.marketCap || 1)
    ) / 10

    return (priceCorrelation + sizeCorrelation) / 2
  }

  // Get connection color based on correlation
  private getConnectionColor(correlation: number): string {
    if (correlation > 0.8) return MATRIX_COLORS.effects.glowIntense
    if (correlation > 0.6) return MATRIX_COLORS.nodes.success
    if (correlation > 0.4) return MATRIX_COLORS.nodes.primary
    if (correlation > 0.2) return MATRIX_COLORS.nodes.warning
    return MATRIX_COLORS.nodes.error
  }

  // Start auto-refresh for a data key
  private startAutoRefresh(key: string, source: DataSource) {
    const interval = setInterval(() => {
      this.refreshData(key, source)
    }, this.config.refreshInterval)

    this.refreshIntervals.set(key, interval)
  }

  // Stop auto-refresh for a data key
  private stopAutoRefresh(key: string) {
    const interval = this.refreshIntervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.refreshIntervals.delete(key)
    }
  }

  // Refresh data (placeholder - implement based on data source)
  private async refreshData(key: string, source: DataSource) {
    try {
      // This would integrate with actual data providers
      // For now, we'll emit a refresh event
      const refreshKey = `refresh:${key}`
      this.updateData(refreshKey, { 
        timestamp: Date.now(), 
        source,
        key 
      })
    } catch (error) {
      this.handleError(error as Error, `refresh:${key}`)
    }
  }

  // Trigger Matrix update effect
  private triggerMatrixUpdate(key: string, data: any) {
    // This would trigger visual effects in the UI
    console.log('Matrix Update Effect:', key, data)
  }

  // Trigger Matrix error effect
  private triggerMatrixError(context: string, error: any) {
    // This would trigger glitch effects in the UI
    console.log('Matrix Error Effect:', context, error)
  }

  // Cleanup resources
  public destroy() {
    // Clear all intervals
    this.refreshIntervals.forEach(interval => clearInterval(interval))
    this.refreshIntervals.clear()

    // Clear cache and subscribers
    this.cache.clear()
    this.subscribers.clear()
  }
}

// Factory function for creating data adapter
export function createMatrixDataAdapter(config?: Partial<DataAdapterConfig>): MatrixDataAdapter {
  return new MatrixDataAdapter(config)
}

// Utility functions for data transformation
export const matrixDataUtils = {
  // Transform token list to portfolio format
  formatPortfolioData: (tokens: RawTokenData[], address: string): RawPortfolioData => ({
    address,
    tokens,
    timestamp: Date.now()
  }),

  // Generate sample market data for testing
  generateSampleMarketData: (symbols: string[]): Map<string, MarketData> => {
    const marketData = new Map<string, MarketData>()
    
    symbols.forEach(symbol => {
      marketData.set(symbol, {
        symbol,
        price: Math.random() * 1000 + 10,
        priceChange24h: (Math.random() - 0.5) * 40,
        volume24h: Math.random() * 10000000,
        marketCap: Math.random() * 1000000000,
        rank: Math.floor(Math.random() * 1000) + 1
      })
    })

    return marketData
  },

  // Validate portfolio data
  validatePortfolioData: (data: any): data is RawPortfolioData => {
    return (
      data &&
      typeof data.address === 'string' &&
      Array.isArray(data.tokens) &&
      typeof data.timestamp === 'number'
    )
  }
}

export default MatrixDataAdapter 