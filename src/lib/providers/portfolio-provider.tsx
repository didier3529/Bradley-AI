"use client"

import { PriceFetcherConfig } from "@/config/price-fetcher-config"
import { ProductionConfig } from "@/config/production-config"
import { CircuitBreaker, circuitBreakerManager } from "@/lib/circuit-breaker"
import { logger, metrics, useObservability } from "@/lib/observability"
import type { PortfolioSummary, PortfolioToken } from "@/types/blockchain"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

// Enhanced type definitions following the established APIResponse pattern
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

interface PortfolioContextValue {
  isLoading: boolean
  portfolioData: PortfolioSummary | null
  error: Error | null
  refetch: () => Promise<void>
  updatePortfolioData: (data: Partial<PortfolioSummary>) => void
  isUsingFallback: boolean
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  performanceMetrics: {
    averageLoadTime: number
    errorRate: number
    successRate: number
  }
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined)

// Move constants outside component for stability (following recent best practices)
const PORTFOLIO_QUERY_KEY = ["portfolio"] as const
const POLLING_INTERVAL = PriceFetcherConfig.pollingInterval
const SERVICE_NAME = "portfolio"

// Helper function to get config values safely
const getApiConfig = () => {
  try {
    return ApiConfig
  } catch {
    // Fallback config if ApiConfig is not available during build
    return {
      timeouts: {
        critical: {
          maxRetries: 3,
          retryDelay: 1000,
          requestTimeout: 8000,
          backoffMultiplier: 2
        }
      }
    }
  }
}

// Create portfolio circuit breaker with fallback
const createPortfolioCircuitBreaker = () => {
  const fallbackData = (): Promise<PortfolioSummary> => {
    logger.info("Using portfolio fallback data", {
      component: SERVICE_NAME,
      action: "fallback-data",
    })

    const fallbackPortfolio: PortfolioSummary = {
      address: "0x...",
      chainId: 1,
      metrics: {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercent24h: 0,
        tokenCount: 0,
        nftCount: 0,
        transactionCount: 0,
      },
      tokens: [],
      nfts: [],
      recentTransactions: [],
      lastUpdated: Date.now(),
    }

    return Promise.resolve(fallbackPortfolio)
  }

  return circuitBreakerManager.createCircuitBreaker<PortfolioSummary>(
    SERVICE_NAME,
    {
      ...ProductionConfig.circuitBreaker.portfolio,
      serviceName: SERVICE_NAME,
    },
    fallbackData
  )
}

// Enhanced fetch function with comprehensive error handling
async function fetchPortfolioData(circuitBreaker: CircuitBreaker<PortfolioSummary>, correlationId: string): Promise<PortfolioSummary> {
  const endTiming = metrics.timing('portfolio_fetch_duration')

  try {
    const result = await circuitBreaker.execute(async () => {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const url = `${baseUrl}/api/portfolio/summary`

      logger.info("Fetching portfolio data", {
        correlationId,
        component: SERVICE_NAME,
        action: "fetch-start",
        metadata: { url },
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, getApiConfig().timeouts.critical.requestTimeout)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // Enhanced error handling with specific status codes
        const errorText = await response.text().catch(() => 'Unknown error')
        const errorMessage = `HTTP ${response.status}: ${response.statusText} - ${errorText}`

        // Create specific error types for better error handling
        const error = new Error(errorMessage)
        error.name = 'PortfolioFetchError'
        ;(error as any).status = response.status
        ;(error as any).statusText = response.statusText
        ;(error as any).retryable = response.status >= 500 || response.status === 429

        throw error
      }

      const apiResponse: APIResponse<PortfolioSummary> = await response.json()

      // Handle the new APIResponse format
      if (!apiResponse.success) {
        const error = new Error(apiResponse.error?.message || 'API returned error')
        error.name = 'PortfolioAPIError'
        ;(error as any).code = apiResponse.error?.code
        ;(error as any).details = apiResponse.error?.details
        ;(error as any).retryable = apiResponse.error?.code !== 'VALIDATION_ERROR'
        throw error
      }

      // Validate response structure
      if (!apiResponse.data || typeof apiResponse.data !== 'object') {
        throw new Error('Invalid portfolio data received from server')
      }

      logger.info("Portfolio data fetched successfully", {
        correlationId,
        component: SERVICE_NAME,
        action: "fetch-success",
        metadata: {
          dataSize: JSON.stringify(apiResponse.data).length,
          tokenCount: apiResponse.data.tokens?.length || 0,
        },
      })

      return apiResponse.data
    })

    endTiming()
    return result
  } catch (error) {
    endTiming()

    logger.error("Portfolio fetch failed", {
      correlationId,
      component: SERVICE_NAME,
      action: "fetch-error",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        retryable: (error as any)?.retryable || false,
      },
    })

    throw error
  }
}

// Enhanced fetch function for tokens with similar error handling
async function fetchPortfolioTokens(network?: string): Promise<PortfolioToken[]> {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${baseUrl}/api/portfolio/tokens${network ? `?network=${network}` : ""}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(PriceFetcherConfig.requestTimeout),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      const error = new Error(`Failed to fetch portfolio tokens: HTTP ${response.status} - ${errorText}`)
      error.name = 'TokensFetchError'
      throw error
    }

    const apiResponse: APIResponse<PortfolioToken[]> = await response.json()

    // Handle the new APIResponse format
    if (!apiResponse.success) {
      const error = new Error(apiResponse.error?.message || 'Tokens API returned error')
      error.name = 'TokensAPIError'
      ;(error as any).code = apiResponse.error?.code
      ;(error as any).details = apiResponse.error?.details
      throw error
    }

    return Array.isArray(apiResponse.data) ? apiResponse.data : []
  } catch (error) {
    if (PriceFetcherConfig.verbose) {
      console.error('[PortfolioProvider] Tokens fetch error:', error)
    }
    throw error
  }
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { correlationId, log, recordMetric, recordError, startTiming } = useObservability(SERVICE_NAME)

  // Hydration safety pattern (following recent fixes)
  const [isMounted, setIsMounted] = useState(false)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageLoadTime: 0,
    errorRate: 0,
    successRate: 100,
  })

  // References for performance tracking
  const loadTimesRef = useRef<number[]>([])
  const totalRequestsRef = useRef(0)
  const errorCountRef = useRef(0)

  // Circuit breaker instance
  const circuitBreakerRef = useRef<CircuitBreaker<PortfolioSummary> | null>(null)

  // Initialize circuit breaker
  useEffect(() => {
    if (!circuitBreakerRef.current) {
      circuitBreakerRef.current = createPortfolioCircuitBreaker()
      log('info', 'Portfolio circuit breaker initialized', 'initialize')
    }
  }, [log])

  // Hydration effect
  useEffect(() => {
    setIsMounted(true)
    log('info', 'Portfolio provider mounted', 'mount')
  }, [log])

  const {
    data: portfolioData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: async () => {
      if (!circuitBreakerRef.current) {
        throw new Error('Circuit breaker not initialized')
      }

      const endTiming = startTiming('portfolio_query_duration')
      const startTime = Date.now()

      try {
        totalRequestsRef.current++

        const result = await fetchPortfolioData(circuitBreakerRef.current, correlationId)

        const loadTime = Date.now() - startTime
        loadTimesRef.current.push(loadTime)

        // Keep only last 10 load times for average calculation
        if (loadTimesRef.current.length > 10) {
          loadTimesRef.current = loadTimesRef.current.slice(-10)
        }

        // Update performance metrics
        const avgLoadTime = loadTimesRef.current.reduce((a, b) => a + b, 0) / loadTimesRef.current.length
        const successRate = ((totalRequestsRef.current - errorCountRef.current) / totalRequestsRef.current) * 100

        setPerformanceMetrics({
          averageLoadTime: Math.round(avgLoadTime),
          errorRate: (errorCountRef.current / totalRequestsRef.current) * 100,
          successRate: Math.round(successRate),
        })

        setIsUsingFallback(false)

        recordMetric({
          name: 'portfolio_load_time',
          value: loadTime,
          unit: 'ms',
          tags: { source: 'api' },
        })

        endTiming()
        return result

      } catch (error) {
        errorCountRef.current++
        recordError(error instanceof Error ? error : new Error(String(error)), 'query-failed')
        endTiming()
        throw error
      }
    },
    // Enhanced query configuration with production settings
    staleTime: ProductionConfig.cache.strategies.portfolio.ttl,
    gcTime: ProductionConfig.cache.strategies.portfolio.ttl * 5,
    retry: (failureCount, error) => {
      // Smart retry logic based on error type
      if (error instanceof Error) {
        // Don't retry on certain error types
        if (error.name === 'AbortError' ||
            (error as any).status === 404 ||
            (error as any).status === 401) {
          return false
        }
      }
      return failureCount < getApiConfig().timeouts.critical.maxRetries
    },
    retryDelay: (attemptIndex) => {
      const baseDelay = getApiConfig().timeouts.critical.retryDelay
      const multiplier = getApiConfig().timeouts.critical.backoffMultiplier
      let delay = Math.min(baseDelay * Math.pow(multiplier, attemptIndex), 30000)

      // Add jitter to prevent thundering herd
      if (ProductionConfig.errorHandling.retryStrategies.networkError.jitter) {
        delay += Math.random() * 1000
      }

      return delay
    },
    refetchInterval: isMounted ? POLLING_INTERVAL : false, // Only poll when mounted
    refetchOnWindowFocus: false,
    // Enable query only when mounted (hydration safety)
    enabled: isMounted,
    // Enhanced error handling
    onError: (error) => {
      log('error', `Portfolio query failed: ${error instanceof Error ? error.message : String(error)}`, 'query-error')

      // Check if we're using fallback data
      if (circuitBreakerRef.current?.getState() === 'OPEN') {
        setIsUsingFallback(true)
      }
    },
    onSuccess: (data) => {
      log('info', 'Portfolio query succeeded', 'query-success', {
        tokenCount: data.tokens?.length || 0,
        totalValue: data.metrics?.totalValue || 0,
      })
      healthMonitor.update(SERVICE_NAME, 'healthy')
    },
  })

  // Stable update function (following memoization best practices)
  const updatePortfolioData = useCallback((data: Partial<PortfolioSummary>) => {
    queryClient.setQueryData(PORTFOLIO_QUERY_KEY, (old: PortfolioSummary | undefined) => {
      if (!old) return data as PortfolioSummary
      return { ...old, ...data }
    })
  }, [queryClient])

  // Enhanced refetch function with error handling
  const handleRefetch = useCallback(async () => {
    const endTiming = startTiming('portfolio_manual_refetch')

    try {
      log('info', 'Manual portfolio refetch initiated', 'manual-refetch')
      await refetch()
    } catch (error) {
      recordError(error instanceof Error ? error : new Error(String(error)), 'manual-refetch-failed')
    } finally {
      endTiming()
    }
  }, [refetch, log, recordError, startTiming])

  // Get circuit breaker state for monitoring
  const circuitBreakerState = circuitBreakerRef.current?.getState() || 'CLOSED'

  // Log status changes in development (following the verbose pattern)
  useEffect(() => {
    if (!PriceFetcherConfig.verbose || !isMounted) return

    if (isLoading) {
      console.log('[PortfolioProvider] Loading portfolio data...')
    } else if (error) {
      console.error('[PortfolioProvider] Error loading portfolio data:', error)
    } else if (portfolioData) {
      console.log('[PortfolioProvider] Portfolio data updated:', portfolioData)
    }
  }, [isLoading, error, portfolioData, isMounted])

  // Memoized context value to prevent unnecessary re-renders (following optimization patterns)
  const contextValue = useMemo(
    () => ({
      isLoading,
      portfolioData: portfolioData ?? null,
      error: error as Error | null,
      refetch: handleRefetch,
      updatePortfolioData,
      isUsingFallback,
      circuitBreakerState,
      performanceMetrics,
    }),
    [isLoading, portfolioData, error, handleRefetch, updatePortfolioData, isUsingFallback, circuitBreakerState, performanceMetrics]
  )

  // Render loading state during hydration (following hydration safety pattern)
  if (!isMounted) {
    return (
      <PortfolioContext.Provider value={{
        isLoading: true,
        portfolioData: null,
        error: null,
        refetch: async () => {},
        updatePortfolioData: () => {},
        isUsingFallback: false,
        circuitBreakerState: 'CLOSED',
        performanceMetrics: { averageLoadTime: 0, errorRate: 0, successRate: 100 },
      }}>
        {children}
      </PortfolioContext.Provider>
    )
  }

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error("usePortfolioContext must be used within a PortfolioProvider")
  }
  return context
}

// Specialized hooks for different portfolio data needs
export function usePortfolioSummary() {
  const { portfolioData, isLoading, error } = usePortfolioContext()
  return { data: portfolioData, isLoading, error }
}

export function usePortfolioTokens(network?: string) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return useQuery({
    queryKey: ["portfolio", "tokens", network],
    queryFn: () => fetchPortfolioTokens(network),
    staleTime: POLLING_INTERVAL,
    gcTime: POLLING_INTERVAL * 5,
    retry: (failureCount, error) => {
      if (error instanceof Error) {
        if (error.name === 'AbortError' ||
            (error as any).status === 404 ||
            (error as any).status === 401) {
          return false
        }
      }
      return failureCount < getApiConfig().timeouts.critical.maxRetries
    },
    retryDelay: (attemptIndex) => Math.min(getApiConfig().timeouts.critical.retryDelay * 2 ** attemptIndex, 30000),
    refetchInterval: isMounted ? POLLING_INTERVAL : false,
    enabled: isMounted,
    onError: (error) => {
      if (PriceFetcherConfig.verbose) {
        console.error('[PortfolioProvider] Tokens query error:', error)
      }
    },
  })
}

// Composite hook for portfolio overview usage
export function usePortfolio(options: { timeframe?: string; network?: string } = {}) {
  const { timeframe = "1d", network = "ethereum" } = options
  const summary = usePortfolioSummary()
  const tokens = usePortfolioTokens(network)

  return {
    summary: summary.data,
    tokens: tokens.data,
    isLoading: summary.isLoading || tokens.isLoading,
    error: summary.error || tokens.error,
  }
}
