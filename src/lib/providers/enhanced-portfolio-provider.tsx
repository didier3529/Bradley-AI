"use client"

/**
 * Enhanced Portfolio Provider with Enterprise-Grade Reliability
 *
 * Features:
 * - Circuit breaker pattern for external service resilience
 * - Production-optimized timeouts and retry strategies
 * - Advanced error classification and recovery
 * - Comprehensive observability and metrics
 * - Cold start optimization with progressive loading
 * - Graceful degradation with fallback data
 */

import { ApiConfig, CircuitBreakerConfig, ProductionConfig } from "@/config/production-config"
import { CircuitBreaker, circuitBreakerManager } from "@/lib/circuit-breaker"
import { healthMonitor, logger, metrics, useObservability } from "@/lib/observability"
import type { PortfolioSummary } from "@/types/blockchain"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

// Enhanced type definitions
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

interface EnhancedPortfolioContextValue {
  isLoading: boolean
  portfolioData: PortfolioSummary | null
  error: Error | null
  refetch: () => Promise<void>
  updatePortfolioData: (data: Partial<PortfolioSummary>) => void
  isUsingFallback: boolean
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  lastSuccessfulLoad: number
  performanceMetrics: {
    averageLoadTime: number
    errorRate: number
    successRate: number
  }
}

const EnhancedPortfolioContext = createContext<EnhancedPortfolioContextValue | undefined>(undefined)

// Enhanced constants with production configuration
const PORTFOLIO_QUERY_KEY = ["enhanced-portfolio"] as const
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

// Create portfolio service circuit breaker with fallback
const createPortfolioCircuitBreaker = () => {
  const fallbackData = (): Promise<PortfolioSummary> => {
    logger.info("Using portfolio fallback data", {
      component: SERVICE_NAME,
      action: "fallback-data",
    })

    // Return cached data or minimal safe defaults
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
      ...CircuitBreakerConfig.portfolio,
      serviceName: SERVICE_NAME,
    },
    fallbackData
  )
}

// Enhanced fetch function with circuit breaker and advanced error handling
async function fetchPortfolioDataWithCircuitBreaker(
  circuitBreaker: CircuitBreaker<PortfolioSummary>,
  correlationId: string
): Promise<PortfolioSummary> {
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

      try {
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
          const errorText = await response.text().catch(() => 'Unknown error')
          const error = new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
          error.name = 'PortfolioFetchError'
          ;(error as any).status = response.status
          ;(error as any).statusText = response.statusText
          ;(error as any).retryable = response.status >= 500 || response.status === 429
          throw error
        }

        const apiResponse: APIResponse<PortfolioSummary> = await response.json()

        if (!apiResponse.success) {
          const error = new Error(apiResponse.error?.message || 'API returned error')
          error.name = 'PortfolioAPIError'
          ;(error as any).code = apiResponse.error?.code
          ;(error as any).details = apiResponse.error?.details
          ;(error as any).retryable = apiResponse.error?.code !== 'VALIDATION_ERROR'
          throw error
        }

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

      } catch (error) {
        clearTimeout(timeoutId)

        // Enhance error context
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            error.message = `Portfolio request timed out after ${getApiConfig().timeouts.critical.requestTimeout}ms`
            ;(error as any).retryable = true
          } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            error.message = 'Network error: Unable to connect to portfolio API'
            ;(error as any).retryable = true
          }
        }

        throw error
      }
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

// Enhanced retry logic with jitter and exponential backoff
function createRetryLogic() {
  return (failureCount: number, error: unknown) => {
    if (error instanceof Error) {
      // Don't retry on certain error types
      if (error.name === 'AbortError' && failureCount > 0) return false
      if ((error as any).status === 404 || (error as any).status === 401) return false
      if ((error as any).code === 'VALIDATION_ERROR') return false

      // Check if error is marked as non-retryable
      if ((error as any).retryable === false) return false
    }

    return failureCount < getApiConfig().timeouts.critical.maxRetries
  }
}

function createRetryDelay() {
  return (attemptIndex: number, error: unknown) => {
    const baseDelay = getApiConfig().timeouts.critical.retryDelay
    const multiplier = getApiConfig().timeouts.critical.backoffMultiplier
    let delay = Math.min(baseDelay * Math.pow(multiplier, attemptIndex), 30000)

    // Add jitter to prevent thundering herd
    if (ProductionConfig.errorHandling.retryStrategies.networkError.jitter) {
      delay += Math.random() * 1000
    }

    return delay
  }
}

export function EnhancedPortfolioProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { correlationId, log, recordMetric, recordError, startTiming } = useObservability(SERVICE_NAME)

  // State management
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

  // Hydration safety
  useEffect(() => {
    setIsMounted(true)
    log('info', 'Enhanced portfolio provider mounted', 'mount')
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

        const result = await fetchPortfolioDataWithCircuitBreaker(
          circuitBreakerRef.current,
          correlationId
        )

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

        recordMetric({
          name: 'portfolio_success_rate',
          value: successRate,
          unit: 'percent',
        })

        endTiming()
        return result

      } catch (error) {
        errorCountRef.current++
        const errorRate = (errorCountRef.current / totalRequestsRef.current) * 100

        setPerformanceMetrics(prev => ({
          ...prev,
          errorRate: Math.round(errorRate),
        }))

        recordError(error instanceof Error ? error : new Error(String(error)), 'query-failed')
        endTiming()
        throw error
      }
    },

    // Enhanced query configuration
    staleTime: ProductionConfig.cache.strategies.portfolio.ttl,
    gcTime: ProductionConfig.cache.strategies.portfolio.ttl * 5,
    retry: createRetryLogic(),
    retryDelay: createRetryDelay(),
    refetchInterval: isMounted ? ProductionConfig.cache.strategies.portfolio.ttl : false,
    refetchOnWindowFocus: false,
    enabled: isMounted,

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

  // Update portfolio data function
  const updatePortfolioData = useCallback((data: Partial<PortfolioSummary>) => {
    queryClient.setQueryData(PORTFOLIO_QUERY_KEY, (old: PortfolioSummary | undefined) => {
      if (!old) return data as PortfolioSummary
      return { ...old, ...data }
    })
  }, [queryClient])

  // Enhanced refetch with error handling
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

  // Track last successful load
  const lastSuccessfulLoad = useMemo(() => {
    return portfolioData?.lastUpdated || 0
  }, [portfolioData])

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      isLoading,
      portfolioData: portfolioData ?? null,
      error: error as Error | null,
      refetch: handleRefetch,
      updatePortfolioData,
      isUsingFallback,
      circuitBreakerState,
      lastSuccessfulLoad,
      performanceMetrics,
    }),
    [
      isLoading,
      portfolioData,
      error,
      handleRefetch,
      updatePortfolioData,
      isUsingFallback,
      circuitBreakerState,
      lastSuccessfulLoad,
      performanceMetrics,
    ]
  )

  // Render loading state during hydration
  if (!isMounted) {
    return (
      <EnhancedPortfolioContext.Provider value={{
        isLoading: true,
        portfolioData: null,
        error: null,
        refetch: async () => {},
        updatePortfolioData: () => {},
        isUsingFallback: false,
        circuitBreakerState: 'CLOSED',
        lastSuccessfulLoad: 0,
        performanceMetrics: { averageLoadTime: 0, errorRate: 0, successRate: 100 },
      }}>
        {children}
      </EnhancedPortfolioContext.Provider>
    )
  }

  return (
    <EnhancedPortfolioContext.Provider value={contextValue}>
      {children}
    </EnhancedPortfolioContext.Provider>
  )
}

export function useEnhancedPortfolioContext() {
  const context = useContext(EnhancedPortfolioContext)
  if (context === undefined) {
    throw new Error("useEnhancedPortfolioContext must be used within an EnhancedPortfolioProvider")
  }
  return context
}

// Specialized hooks for different portfolio data needs
export function useEnhancedPortfolioSummary() {
  const { portfolioData, isLoading, error, isUsingFallback, performanceMetrics } = useEnhancedPortfolioContext()
  return {
    data: portfolioData,
    isLoading,
    error,
    isUsingFallback,
    performanceMetrics,
  }
}

// Health monitoring hook
export function usePortfolioHealth() {
  const { circuitBreakerState, lastSuccessfulLoad, performanceMetrics, isUsingFallback } = useEnhancedPortfolioContext()

  const isHealthy = circuitBreakerState === 'CLOSED' && !isUsingFallback
  const isRecovering = circuitBreakerState === 'HALF_OPEN'
  const isUnhealthy = circuitBreakerState === 'OPEN'

  const timeSinceLastSuccess = Date.now() - lastSuccessfulLoad
  const isStale = timeSinceLastSuccess > ProductionConfig.cache.strategies.portfolio.ttl * 2

  return {
    isHealthy,
    isRecovering,
    isUnhealthy,
    isStale,
    circuitBreakerState,
    performanceMetrics,
    timeSinceLastSuccess,
    isUsingFallback,
  }
}
