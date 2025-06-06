'use client'

import { Component, ErrorInfo, ReactNode, useEffect } from 'react'

interface HydrationErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  isHydrationError: boolean
}

interface HydrationErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * HydrationErrorBoundary Component
 *
 * Specialized error boundary for catching and handling hydration-related errors.
 * Implements monitoring and observability patterns from the hydration mismatch
 * handling strategy.
 *
 * Features:
 * - Detects hydration-specific errors
 * - Provides graceful fallback UI
 * - Logs errors for monitoring and debugging
 * - Tracks error metrics for observability
 * - Automatic error recovery mechanisms
 */
export class HydrationErrorBoundary extends Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  constructor(props: HydrationErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      isHydrationError: false
    }
  }

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    // Detect hydration-specific errors
    const isHydrationError =
      error.message?.includes('hydration') ||
      error.message?.includes('server HTML') ||
      error.message?.includes('client') ||
      error.message?.includes('mismatch') ||
      error.stack?.includes('hydration')

    return {
      hasError: true,
      error,
      isHydrationError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isHydrationError = this.state.isHydrationError

    // Enhanced error logging with hydration context
    console.group('🚨 Error Boundary Caught Error')
    console.error('Error Type:', isHydrationError ? 'Hydration Mismatch' : 'General Error')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Timestamp:', new Date().toISOString())

    if (isHydrationError) {
      console.warn('💡 Hydration Error Detected - Check for:')
      console.warn('   • Date.now(), Math.random() in render')
      console.warn('   • Window/document access without hydration safety')
      console.warn('   • Server/client state mismatches')
      console.warn('   • Dynamic content without useEffect protection')
    }
    console.groupEnd()

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Store error info in state
    this.setState({ errorInfo })

    // Analytics tracking (if available)
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('error_boundary_triggered', {
        error_type: isHydrationError ? 'hydration_mismatch' : 'general_error',
        error_message: error.message,
        component_stack: errorInfo.componentStack,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        url: window.location.href
      })
    }
  }

  render() {
    if (this.state.hasError) {
      const { isHydrationError, error } = this.state

      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default hydration error fallback
      if (isHydrationError) {
        return (
          <div className="hydration-error-fallback bg-slate-800/60 backdrop-blur-sm border border-red-500/50 rounded-lg p-4 m-2">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="text-red-400 font-mono text-sm font-bold">
                HYDRATION ERROR DETECTED
              </h3>
            </div>
            <p className="text-gray-300 text-xs font-mono mb-2">
              Component recovered safely. Refreshing may resolve the issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-red-500/20 border border-red-500/30 rounded px-2 py-1 text-red-400 hover:bg-red-500/30 transition-colors font-mono"
            >
              REFRESH PAGE
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="text-xs text-gray-400 cursor-pointer">
                  Debug Info
                </summary>
                <pre className="text-xs text-gray-500 mt-1 overflow-auto max-h-32">
                  {error?.message}
                </pre>
              </details>
            )}
          </div>
        )
      }

      // Default general error fallback
      return (
        <div className="error-fallback bg-slate-800/60 backdrop-blur-sm border border-yellow-500/50 rounded-lg p-4 m-2">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <h3 className="text-yellow-400 font-mono text-sm font-bold">
              COMPONENT ERROR
            </h3>
          </div>
          <p className="text-gray-300 text-xs font-mono mb-2">
            Something went wrong in this component.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs bg-yellow-500/20 border border-yellow-500/30 rounded px-2 py-1 text-yellow-400 hover:bg-yellow-500/30 transition-colors font-mono"
          >
            RETRY
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook for client-side hydration error monitoring
 * Automatically tracks hydration errors in the browser
 */
export function useHydrationErrorMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleHydrationError = (event: ErrorEvent) => {
      if (event.message?.includes('hydration')) {
        console.warn('🔍 Hydration Error Detected:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })

        // Analytics tracking
        if ((window as any).analytics) {
          (window as any).analytics.track('hydration_mismatch', {
            component: event.filename,
            message: event.message,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        }
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('hydration')) {
        console.warn('🔍 Hydration Promise Rejection:', event.reason)
      }
    }

    window.addEventListener('error', handleHydrationError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleHydrationError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}

/**
 * Utility function to check if an error is hydration-related
 */
export function isHydrationError(error: Error): boolean {
  return !!(
    error.message?.includes('hydration') ||
    error.message?.includes('server HTML') ||
    error.message?.includes('client') ||
    error.message?.includes('mismatch') ||
    error.stack?.includes('hydration')
  )
}

/**
 * Production-safe error reporter
 * Only logs in development, tracks in production
 */
export function reportHydrationError(error: Error, context: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Hydration Error in ${context}:`, error)
  } else if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('hydration_error', {
      context,
      message: error.message,
      timestamp: Date.now()
    })
  }
}
