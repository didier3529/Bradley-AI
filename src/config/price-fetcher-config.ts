/**
 * Price Fetcher Configuration
 * Controls the behavior of the REST API-based price fetcher
 * Optimized for fast loading and responsiveness
 */

export const PriceFetcherConfig = {
  // Binance REST API base URL
  baseUrl: 'https://api.binance.com/api/v3',

  // Polling interval in milliseconds (3 seconds - optimized for fast updates)
  pollingInterval: 3000,

  // Cache TTL in milliseconds (10 seconds - fresher data)
  cacheTTL: 10000,

  // Request timeout in milliseconds (5 seconds - production optimized)
  requestTimeout: 5000,

  // Maximum number of retry attempts (2 retries for reliability)
  maxRetries: 2,

  // Retry delay in milliseconds
  retryInterval: 1000,

  // Whether to use mock data in development
  useMock: process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true',

  // Rate limiting to avoid API limits
  minRequestInterval: 100,

  // Connection timeout for network issues (production optimized)
  connectTimeout: 3000,

  // Optimized for reliable initial load
  initialLoadTimeout: 3000,

  // Whether to enable verbose logging
  verbose: process.env.NODE_ENV === 'development',

  // Default trading pairs to monitor
  defaultSymbols: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'DOGE'].map(symbol => `${symbol}USDT`),

  // Enhanced configuration for loading optimization
  loadingOptimization: {
    // Maximum time to wait for initial data load (3 seconds)
    initialLoadTimeout: 3000,

    // Enable parallel loading of components
    enableParallelLoading: true,

    // Enable progressive loading (show components as they load)
    enableProgressiveLoading: true,

    // Fast fail for non-critical components
    fastFailTimeout: 1500,
  }
};
