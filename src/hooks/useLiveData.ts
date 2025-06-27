import { useCallback, useEffect, useRef, useState } from 'react'

export interface LiveDataConfig {
  refreshInterval?: number // milliseconds
  maxRetries?: number
  retryDelay?: number
  enableAutoRefresh?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

export interface LiveDataState<T> {
  data: T | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastUpdated: number | null
  retryCount: number
}

export function useLiveData<T>(
  fetchFunction: () => Promise<T>,
  config: LiveDataConfig = {}
) {
  const {
    refreshInterval = 30000, // 30 seconds default
    maxRetries = 3,
    retryDelay = 1000,
    enableAutoRefresh = true,
    onError,
    onSuccess
  } = config

  const [state, setState] = useState<LiveDataState<T>>({
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    retryCount: 0
  })

  const [isMounted, setIsMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)

  // Hydration safety
  useEffect(() => {
    setIsMounted(true)
    return () => {
      isActiveRef.current = false
    }
  }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isMounted || !isActiveRef.current) return

    setState(prev => ({
      ...prev,
      isLoading: !isRefresh && prev.data === null,
      isRefreshing: isRefresh,
      error: null
    }))

    try {
      const result = await fetchFunction()

      if (!isActiveRef.current) return

      setState(prev => ({
        ...prev,
        data: result,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastUpdated: Date.now(),
        retryCount: 0
      }))

      onSuccess?.(result)
    } catch (error) {
      if (!isActiveRef.current) return

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }))

      onError?.(error instanceof Error ? error : new Error(errorMessage))

      // Auto-retry logic
      if (state.retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            fetchData(isRefresh)
          }
        }, retryDelay * Math.pow(2, state.retryCount)) // Exponential backoff
      }
    }
  }, [fetchFunction, isMounted, maxRetries, retryDelay, onError, onSuccess, state.retryCount])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  // Start auto-refresh
  useEffect(() => {
    if (!isMounted || !enableAutoRefresh) return

    // Initial fetch
    fetchData(false)

    // Set up interval for auto-refresh
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          fetchData(true)
        }
      }, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [isMounted, enableAutoRefresh, refreshInterval, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [])

  return {
    ...state,
    refresh,
    isLive: enableAutoRefresh && isMounted
  }
}
