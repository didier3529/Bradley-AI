'use client'

import { useCallback, useState } from 'react'
import { coldStartOptimizer, ColdStartMetrics, LoadingState } from '@/lib/performance/cold-start-optimizer'

/**
 * React hook for cold start optimization
 *
 * Provides client-side interface to the cold start optimization system
 */
export function useColdStartOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [metrics, setMetrics] = useState<ColdStartMetrics | null>(null)
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map())

  const startOptimization = useCallback(async () => {
    setIsOptimizing(true)
    try {
      const result = await coldStartOptimizer.startOptimization()
      setMetrics(result)
      setLoadingStates(coldStartOptimizer.getLoadingStates())
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  const retryFailedServices = useCallback(async () => {
    await coldStartOptimizer.retryFailedServices()
    setLoadingStates(coldStartOptimizer.getLoadingStates())
  }, [])

  return {
    isOptimizing,
    metrics,
    loadingStates,
    startOptimization,
    retryFailedServices,
    isServiceLoaded: coldStartOptimizer.isServiceLoaded.bind(coldStartOptimizer),
  }
}
