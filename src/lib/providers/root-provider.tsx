"use client";

/**
 * RootProvider: Central provider component that wraps the entire application.
 * This is the main provider hierarchy that ensures all contexts are properly initialized.
 * All other providers are composed within this component.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PortfolioProvider } from "@/lib/providers/portfolio-provider"
import { MarketProvider } from "./market-provider"
import { NFTProvider } from "./nft-provider"
import { ContractProvider } from "./contract-provider"
import { SettingsProvider } from "./settings-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { PriceProvider } from "./price-provider"
import { useState, useCallback } from "react"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

// Enhanced error boundary component for portfolio-specific errors
function PortfolioErrorFallback({
  error,
  resetErrorBoundary
}: {
  error: Error;
  resetErrorBoundary: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <h2 className="text-xl font-semibold text-white">Portfolio Service Unavailable</h2>
        </div>

        <div className="text-slate-300 mb-6 space-y-2">
          <p>The portfolio data service is currently experiencing issues.</p>
          <p className="text-sm text-slate-400">
            Other features of the application remain fully functional.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4">
            <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-slate-900 p-3 rounded border overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Retry Portfolio
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            Refresh App
          </button>
        </div>
      </div>
    </div>
  )
}

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  // Create QueryClient instance with enhanced error handling
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // Data stays fresh for 1 minute
            cacheTime: 1000 * 60 * 5, // Cache persists for 5 minutes
            refetchOnWindowFocus: false, // Don't refetch on window focus
            retry: (failureCount, error) => {
              // Enhanced retry logic based on error type
              if (error instanceof Error) {
                // Don't retry on client-side errors
                if (error.name === 'PortfolioFetchError' ||
                    error.name === 'TokensFetchError' ||
                    error.message.includes('Network error')) {
                  return failureCount < 2 // Reduced retries for network errors
                }
              }
              return failureCount < 3
            },
            retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000),
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  // Enhanced error handler with better categorization
  const handleQueryError = useCallback((error: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[RootProvider] React Query Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  // Error boundary reset handler for portfolio
  const handlePortfolioReset = useCallback(() => {
    // Clear portfolio-related queries on reset
    queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    queryClient.removeQueries({ queryKey: ['portfolio'] })
  }, [queryClient]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient} onError={handleQueryError}>
        <AuthProvider>
          <SettingsProvider>
            <PriceProvider>
              {/* Wrap PortfolioProvider in its own error boundary to prevent cascade failures */}
              <ErrorBoundary
                fallback={PortfolioErrorFallback}
                onError={(error, errorInfo) => {
                  console.error('[RootProvider] Portfolio Error Boundary triggered:', error, errorInfo)
                  // Could add error reporting service here
                }}
              >
                <PortfolioProvider>
                  <MarketProvider>
                    <NFTProvider>
                      <ContractProvider>
                        {children}
                        <Toaster />
                      </ContractProvider>
                    </NFTProvider>
                  </MarketProvider>
                </PortfolioProvider>
              </ErrorBoundary>
            </PriceProvider>
          </SettingsProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
