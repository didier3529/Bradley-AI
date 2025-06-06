/**
 * Production-Grade Configuration for Bradley AI
 *
 * Enterprise-level configuration with optimized timeouts, circuit breaker patterns,
 * and cold start performance optimizations.
 */

export const ProductionConfig = {
  // API Configuration with Cold Start Optimization
  api: {
    // Tiered timeout strategy for different service types
    timeouts: {
      // Critical path services (portfolio summary)
      critical: {
        requestTimeout: 8000,     // 8 seconds for critical data
        connectTimeout: 3000,     // 3 seconds to establish connection
        maxRetries: 3,           // More retries for critical services
        retryDelay: 1000,        // Base delay between retries
        backoffMultiplier: 2,    // Exponential backoff
      },
      // Real-time services (price feeds)
      realtime: {
        requestTimeout: 5000,     // 5 seconds for real-time data
        connectTimeout: 2000,     // 2 seconds to connect
        maxRetries: 2,           // Fewer retries for real-time data
        retryDelay: 500,         // Faster retry for real-time
        backoffMultiplier: 1.5,  // Moderate backoff
      },
      // Background services (NFT metadata, analytics)
      background: {
        requestTimeout: 15000,    // 15 seconds for background tasks
        connectTimeout: 5000,     // 5 seconds to connect
        maxRetries: 5,           // More retries for background tasks
        retryDelay: 2000,        // Longer delay for background
        backoffMultiplier: 2.5,  // Aggressive backoff
      },
      // Blockchain RPC calls
      blockchain: {
        requestTimeout: 12000,    // 12 seconds for blockchain calls
        connectTimeout: 4000,     // 4 seconds to connect
        maxRetries: 4,           // Account for blockchain variability
        retryDelay: 1500,        // Moderate delay
        backoffMultiplier: 2,    // Standard backoff
      }
    },

    // Connection pooling for performance
    connectionPool: {
      maxConnections: 20,        // Maximum concurrent connections
      keepAlive: true,          // Reuse connections
      keepAliveMsecs: 30000,    // 30 seconds keep-alive
      maxSockets: 50,           // Maximum sockets per host
      timeout: 60000,           // Socket timeout
    },

    // Request batching for efficiency
    batching: {
      enabled: true,
      maxBatchSize: 10,         // Maximum requests per batch
      batchInterval: 100,       // Wait 100ms to collect batch
      maxWaitTime: 500,         // Never wait more than 500ms
    }
  },

  // Circuit Breaker Configuration
  circuitBreaker: {
    // Portfolio service circuit breaker
    portfolio: {
      failureThreshold: 3,      // Open after 3 failures
      recoveryTimeout: 20000,   // 20 seconds before retry
      monitoringWindow: 60000,  // 1 minute monitoring window
      successThreshold: 2,      // 2 successes to close
      fallbackEnabled: true,
    },

    // Price service circuit breaker
    priceService: {
      failureThreshold: 5,      // More tolerant for price fluctuations
      recoveryTimeout: 10000,   // Faster recovery for price data
      monitoringWindow: 30000,  // Shorter window for price volatility
      successThreshold: 3,      // 3 successes to close
      fallbackEnabled: true,
    },

    // NFT service circuit breaker
    nftService: {
      failureThreshold: 2,      // Less critical, fail fast
      recoveryTimeout: 30000,   // 30 seconds before retry
      monitoringWindow: 120000, // 2 minute window
      successThreshold: 2,      // 2 successes to close
      fallbackEnabled: true,
    },

    // Blockchain RPC circuit breaker
    blockchainRpc: {
      failureThreshold: 4,      // Account for blockchain instability
      recoveryTimeout: 15000,   // 15 seconds before retry
      monitoringWindow: 90000,  // 1.5 minute window
      successThreshold: 3,      // 3 successes to close
      fallbackEnabled: false,   // No fallback for blockchain data
    }
  },

  // Cold Start Optimization
  coldStart: {
    // Progressive loading strategy
    progressive: {
      enabled: true,
      priorityServices: ['portfolio', 'priceService'], // Load these first
      deferredServices: ['nftService', 'analytics'],   // Load these after
      batchSize: 3,             // Load 3 services at a time
      intervalMs: 200,          // Wait 200ms between batches
    },

    // Preloading strategies
    preload: {
      enabled: true,
      preloadOnIdle: true,      // Preload during idle time
      preloadCriticalData: true, // Preload critical portfolio data
      prefetchNextPage: true,   // Prefetch likely next page data
    },

    // Cache warming
    cacheWarming: {
      enabled: true,
      warmupOnStart: true,      // Warm cache on application start
      backgroundRefresh: true,  // Refresh cache in background
      warmupServices: ['portfolio', 'priceService'], // Services to warm
    }
  },

  // Performance SLA Targets
  performanceSLA: {
    // Time to first paint
    timeToFirstPaint: 800,      // 800ms target

    // Time to interactive
    timeToInteractive: 2000,    // 2s target

    // Portfolio data load time
    portfolioLoadTime: 3000,    // 3s including retries

    // Error recovery time
    errorRecoveryTime: 5000,    // 5s to recover from errors

    // Memory usage limits
    memory: {
      maxHeapSize: 100,         // 100MB max heap
      warningThreshold: 80,     // Warn at 80MB
      gcTrigger: 90,           // Trigger GC at 90MB
    },

    // Network efficiency
    network: {
      maxConcurrentRequests: 6, // Browser limit consideration
      requestQueue: 20,         // Queue additional requests
      compressionEnabled: true, // Enable response compression
    }
  },

  // Error Handling & Recovery
  errorHandling: {
    // Retry strategies by error type
    retryStrategies: {
      networkError: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        jitter: true,           // Add randomization
      },
      timeout: {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 5000,
        jitter: false,
      },
      serverError: {
        maxRetries: 4,
        baseDelay: 2000,
        maxDelay: 15000,
        jitter: true,
      },
      rateLimit: {
        maxRetries: 5,
        baseDelay: 5000,        // Longer delay for rate limits
        maxDelay: 30000,
        jitter: true,
      }
    },

    // Fallback data strategies
    fallback: {
      portfolio: {
        useCache: true,         // Use cached data as fallback
        cacheMaxAge: 300000,    // 5 minutes max age
        useMockData: false,     // No mock data in production
      },
      prices: {
        useCache: true,
        cacheMaxAge: 60000,     // 1 minute max age for prices
        useMockData: false,
      },
      nfts: {
        useCache: true,
        cacheMaxAge: 600000,    // 10 minutes max age for NFTs
        useMockData: false,
      }
    }
  },

  // Monitoring & Observability
  monitoring: {
    // Metrics collection
    metrics: {
      enabled: true,
      flushInterval: 30000,     // 30 seconds
      maxBufferSize: 1000,      // Buffer up to 1000 metrics
      includeUserMetrics: true, // Include user interaction metrics
    },

    // Health checks
    healthChecks: {
      enabled: true,
      interval: 30000,          // Every 30 seconds
      timeout: 5000,            // 5 second timeout for health checks
      services: ['portfolio', 'priceService', 'nftService', 'blockchainRpc'],
    },

    // Error tracking
    errorTracking: {
      enabled: true,
      sampleRate: 1.0,          // Track 100% of errors in production
      includeUserContext: true, // Include user context in error reports
      maxErrorsPerMinute: 100,  // Rate limit error reporting
    }
  },

  // Production Environment Settings
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || '',

    // Feature flags
    features: {
      circuitBreaker: true,
      advancedMetrics: true,
      realTimeUpdates: true,
      backgroundSync: true,
      progressiveLoading: true,
    }
  },

  // Cache Configuration
  cache: {
    // Strategy configuration
    strategies: {
      portfolio: {
        ttl: 60000,             // 1 minute TTL
        maxSize: 100,           // 100 entries max
        staleWhileRevalidate: true,
      },
      prices: {
        ttl: 30000,             // 30 seconds TTL
        maxSize: 500,           // 500 entries max
        staleWhileRevalidate: true,
      },
      nfts: {
        ttl: 300000,            // 5 minutes TTL
        maxSize: 200,           // 200 entries max
        staleWhileRevalidate: true,
      }
    },

    // Persistence settings
    persistence: {
      enabled: true,
      storage: 'indexeddb',     // Use IndexedDB for large cache
      encryptSensitive: true,   // Encrypt sensitive cached data
      maxStorageSize: 50,       // 50MB max storage
    }
  }
};

// Export specific configurations for easy access
export const {
  api: ApiConfig,
  circuitBreaker: CircuitBreakerConfig,
  coldStart: ColdStartConfig,
  performanceSLA: PerformanceSLAConfig,
  errorHandling: ErrorHandlingConfig,
  monitoring: MonitoringConfig,
  environment: EnvironmentConfig,
  cache: CacheConfig
} = ProductionConfig;
