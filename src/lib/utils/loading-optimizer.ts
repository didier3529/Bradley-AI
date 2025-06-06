/**
 * Loading Optimizer Utility
 * Prevents app from getting stuck on loading screens
 */

import React from 'react'
import { PriceFetcherConfig } from '@/config/price-fetcher-config'

export interface LoadingState {
  isLoading: boolean
  progress: number
  error?: string
  phase: 'initializing' | 'loading' | 'completing' | 'complete' | 'error'
}

export interface LoadingOptions {
  timeout?: number
  enableProgressiveLoading?: boolean
  fastFail?: boolean
  retryOnError?: boolean
}

export class LoadingOptimizer {
  private static instance: LoadingOptimizer
  private loadingStates = new Map<string, LoadingState>()
  private timeouts = new Map<string, NodeJS.Timeout>()
  private callbacks = new Map<string, (state: LoadingState) => void>()

  static getInstance(): LoadingOptimizer {
    if (!LoadingOptimizer.instance) {
      LoadingOptimizer.instance = new LoadingOptimizer()
    }
    return LoadingOptimizer.instance
  }

  /**
   * Register a loading component with timeout protection
   */
  registerComponent(
    componentId: string,
    options: LoadingOptions = {},
    callback?: (state: LoadingState) => void
  ): void {
    const {
      timeout = PriceFetcherConfig.loadingOptimization.initialLoadTimeout,
      fastFail = false
    } = options

    // Initialize loading state
    const initialState: LoadingState = {
      isLoading: true,
      progress: 0,
      phase: 'initializing'
    }

    this.loadingStates.set(componentId, initialState)

    if (callback) {
      this.callbacks.set(componentId, callback)
      callback(initialState)
    }

    // Set timeout protection
    const timeoutId = setTimeout(() => {
      console.warn(`[LoadingOptimizer] Component ${componentId} loading timeout`)
      this.completeLoading(componentId, fastFail ? 'error' : 'complete', 'Loading timeout')
    }, timeout)

    this.timeouts.set(componentId, timeoutId)
  }

  /**
   * Update loading progress for a component
   */
  updateProgress(componentId: string, progress: number, phase?: LoadingState['phase']): void {
    const currentState = this.loadingStates.get(componentId)
    if (!currentState) return

    const newState: LoadingState = {
      ...currentState,
      progress: Math.min(Math.max(progress, 0), 100),
      phase: phase || currentState.phase
    }

    this.loadingStates.set(componentId, newState)

    const callback = this.callbacks.get(componentId)
    if (callback) {
      callback(newState)
    }

    // Auto-complete if progress reaches 100%
    if (progress >= 100 && phase !== 'complete') {
      setTimeout(() => {
        this.completeLoading(componentId, 'complete')
      }, 100)
    }
  }

  /**
   * Complete loading for a component
   */
  completeLoading(componentId: string, phase: 'complete' | 'error', error?: string): void {
    const currentState = this.loadingStates.get(componentId)
    if (!currentState) return

    // Clear timeout
    const timeoutId = this.timeouts.get(componentId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(componentId)
    }

    const finalState: LoadingState = {
      ...currentState,
      isLoading: false,
      progress: 100,
      phase,
      error: phase === 'error' ? error : undefined
    }

    this.loadingStates.set(componentId, finalState)

    const callback = this.callbacks.get(componentId)
    if (callback) {
      callback(finalState)
    }

    // Clean up after a delay
    setTimeout(() => {
      this.unregisterComponent(componentId)
    }, 5000)
  }

  /**
   * Force complete loading for a component (emergency fallback)
   */
  forceComplete(componentId: string): void {
    console.warn(`[LoadingOptimizer] Force completing ${componentId}`)
    this.completeLoading(componentId, 'complete', 'Force completed')
  }

  /**
   * Get current loading state for a component
   */
  getLoadingState(componentId: string): LoadingState | null {
    return this.loadingStates.get(componentId) || null
  }

  /**
   * Check if any components are still loading
   */
  isAnyComponentLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(state => state.isLoading)
  }

  /**
   * Get overall loading progress (average of all components)
   */
  getOverallProgress(): number {
    const states = Array.from(this.loadingStates.values())
    if (states.length === 0) return 100

    const totalProgress = states.reduce((sum, state) => sum + state.progress, 0)
    return totalProgress / states.length
  }

  /**
   * Unregister a component and clean up
   */
  unregisterComponent(componentId: string): void {
    // Clear timeout
    const timeoutId = this.timeouts.get(componentId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(componentId)
    }

    // Remove state and callback
    this.loadingStates.delete(componentId)
    this.callbacks.delete(componentId)
  }

  /**
   * Emergency reset - clear all loading states
   */
  emergencyReset(): void {
    console.warn('[LoadingOptimizer] Emergency reset triggered')

    // Clear all timeouts
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId)
    }

    // Clear all maps
    this.timeouts.clear()
    this.loadingStates.clear()
    this.callbacks.clear()
  }
}

/**
 * Hook for using loading optimizer in React components
 */
export function useLoadingOptimizer(
  componentId: string,
  options: LoadingOptions = {}
) {
  const optimizer = LoadingOptimizer.getInstance()

  const registerLoading = (callback?: (state: LoadingState) => void) => {
    optimizer.registerComponent(componentId, options, callback)
  }

  const updateProgress = (progress: number, phase?: LoadingState['phase']) => {
    optimizer.updateProgress(componentId, progress, phase)
  }

  const completeLoading = (phase: 'complete' | 'error' = 'complete', error?: string) => {
    optimizer.completeLoading(componentId, phase, error)
  }

  const forceComplete = () => {
    optimizer.forceComplete(componentId)
  }

  const getState = () => {
    return optimizer.getLoadingState(componentId)
  }

  return {
    registerLoading,
    updateProgress,
    completeLoading,
    forceComplete,
    getState,
    optimizer
  }
}

/**
 * Utility to create a loading timeout promise
 */
export function createLoadingTimeout<T>(
  promise: Promise<T>,
  timeout: number = PriceFetcherConfig.loadingOptimization.initialLoadTimeout,
  fallbackValue?: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        if (fallbackValue !== undefined) {
          console.warn('[LoadingOptimizer] Timeout reached, using fallback value')
          return fallbackValue
        }
        reject(new Error(`Operation timed out after ${timeout}ms`))
      }, timeout)
    })
  ])
}

/**
 * Utility to prevent component from getting stuck
 */
export function withLoadingProtection<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentId: string,
  fallbackComponent?: React.ComponentType<T>
): React.ComponentType<T> {
  return function ProtectedComponent(props: T) {
    const { registerLoading, forceComplete } = useLoadingOptimizer(componentId, {
      timeout: PriceFetcherConfig.loadingOptimization.fastFailTimeout,
      fastFail: true
    })

    // Register loading protection
    React.useEffect(() => {
      registerLoading()

      // Emergency fallback after extended time
      const emergencyTimeout = setTimeout(() => {
        console.warn(`[LoadingOptimizer] Emergency timeout for ${componentId}`)
        forceComplete()
      }, PriceFetcherConfig.loadingOptimization.initialLoadTimeout * 2)

      return () => {
        clearTimeout(emergencyTimeout)
      }
    }, [registerLoading, forceComplete])

    try {
      return React.createElement(Component, props)
    } catch (error) {
      console.error(`[LoadingOptimizer] Component ${componentId} failed:`, error)

      if (fallbackComponent) {
        return React.createElement(fallbackComponent, props)
      }

      return React.createElement('div', {
        className: 'p-4 text-center text-red-400 font-mono text-sm'
      }, `Component ${componentId} failed to load`)
    }
  }
}
