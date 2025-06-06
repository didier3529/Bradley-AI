'use client';

import { PriceFetcherConfig } from '@/config/price-fetcher-config';
import marketDataAdapter, { MarketPrice } from '@/lib/services/market-data-adapter';
import { PriceFetcher } from '@/lib/services/price-fetcher';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
// import { useWebSocket } from '@/lib/hooks/use-websocket'
// import { type ConnectionStatus } from '@/lib/websocket/matrix-data-flow'
import { matrixColors } from '@/styles/design-tokens';

// TokenPrice now includes isMock
export type TokenPrice = MarketPrice;

// Enhanced interface with Matrix WebSocket support
interface PriceContextType {
  prices: Record<string, TokenPrice>
  status: 'pending' | 'error' | 'success'
  isFetching: boolean // To indicate background updates
  error: Error | null
  refetchPrices: (symbols?: string[]) => void
  subscribeToPrices: (symbols: string[]) => () => void
  unsubscribeFromPrices: (symbols: string[]) => void
  // Matrix WebSocket enhancements - DISABLED
  connectionStatus: 'disconnected' // Always disconnected
  isWebSocketConnected: boolean // Changed back to boolean
  latency: number
  priceChangeAnimations: Record<string, 'up' | 'down' | 'neutral'>
  triggerGlitchEffect: (symbol: string) => void
}

const PriceContext = createContext<PriceContextType | undefined>(undefined)

const generatePlaceholderData = (symbols: string[]): Record<string, TokenPrice> => {
  const placeholder: Record<string, TokenPrice> = {};
  symbols.forEach(symbol => {
    placeholder[symbol] = {
      symbol,
      current: 0,
      historical: 0,
      change24h: 0,
      volume24h: 0,
      marketCap: 0,
      lastUpdated: Date.now(),
      isMock: true,
    };
  });
  return placeholder;
};

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const subscribedSymbolsRef = useRef(new Set<string>())
  const [symbolVersion, setSymbolVersion] = useState(0); // State to track changes to the Set
  const priceFetcherInstance = useMemo(() => PriceFetcher.getInstance(), []); // Memoize instance

  // WEBSOCKET INTEGRATION DISABLED - Using direct API calls only
  const wsStatus = 'disconnected' as const;
  const isConnected = false;
  const metrics = { latency: 0 };

  // Matrix-specific state
  const [priceChangeAnimations, setPriceChangeAnimations] = useState<Record<string, 'up' | 'down' | 'neutral'>>({});
  const previousPricesRef = useRef<Record<string, TokenPrice>>({});

  // --- Stabilized Dependencies --- 
  // Stable string representation of subscribed symbols, recalculated only when symbolVersion changes
  const stableSymbolString = useMemo(() => {
    return Array.from(subscribedSymbolsRef.current).sort().join(',');
  }, [symbolVersion]); // Depends only on the version counter

  // Memoized array, recalculated only when symbolVersion changes
  const subscribedSymbolsArray = useMemo(() => {
    return Array.from(subscribedSymbolsRef.current);
  }, [symbolVersion]); // Depends only on the version counter

  // Query key uses the stable string representation
  const queryKey = useMemo(() => ['prices', stableSymbolString], [stableSymbolString]);

  // WEBSOCKET SUBSCRIPTION DISABLED - Using polling only
  // Price change detection through polling comparison
  useEffect(() => {
    if (subscribedSymbolsArray.length > 0) {
      const interval = setInterval(() => {
        // Trigger animations on price changes during polling
        const currentPrices = queryClient.getQueryData(queryKey) as Record<string, TokenPrice> | undefined;
        if (currentPrices) {
          Object.entries(currentPrices).forEach(([symbol, priceData]) => {
            const oldPrice = previousPricesRef.current[symbol]?.current || 0;
            const newPrice = priceData.current;

            if (oldPrice !== newPrice && oldPrice > 0) {
              const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'neutral';
              setPriceChangeAnimations(prev => ({ ...prev, [symbol]: direction }));

              // Clear animation after delay
              setTimeout(() => {
                setPriceChangeAnimations(prev => {
                  const updated = { ...prev };
                  delete updated[symbol];
                  return updated;
                });
              }, 2000);
            }
          });

          previousPricesRef.current = currentPrices;
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [subscribedSymbolsArray, queryClient, queryKey]);

  // Effect to manage PriceFetcher polling based on subscribedSymbolsArray
  useEffect(() => {
    if (subscribedSymbolsArray.length > 0) {
      if (PriceFetcherConfig.verbose) {
        console.log('[PriceProvider] Detected subscribed symbols, starting PriceFetcher polling:', subscribedSymbolsArray);
      }
      priceFetcherInstance.startPolling(subscribedSymbolsArray);
    } else {
      if (PriceFetcherConfig.verbose) {
        console.log('[PriceProvider] No subscribed symbols, stopping PriceFetcher polling.');
      }
      priceFetcherInstance.stopPolling();
    }
    // Cleanup: Stop polling when the provider unmounts or before restarting with new symbols
    return () => {
      if (PriceFetcherConfig.verbose) {
        console.log('[PriceProvider] Cleanup: stopping PriceFetcher polling.');
      }
      priceFetcherInstance.stopPolling();
    };
  }, [subscribedSymbolsArray, priceFetcherInstance]); // Re-run when the array of symbols changes

  const {
    data: prices,
    isFetching,
    status,
    error: queryError,
    refetch: actualRefetchQuery
  } = useQuery<Record<string, TokenPrice>>({
    queryKey: queryKey,
    queryFn: async () => {
      const symbolsToFetch = subscribedSymbolsArray;
      if (symbolsToFetch.length === 0) return {};

      if (PriceFetcherConfig.verbose) {
        console.log('[PriceProvider] Fetching prices for:', symbolsToFetch);
      }

      const pricePromises = symbolsToFetch.map(symbol =>
        marketDataAdapter.getPrice(symbol)
      );

      const results = await Promise.all(pricePromises);
      const newPrices: Record<string, TokenPrice> = {};

      results.forEach(price => {
        if (price && price.symbol) {
          newPrices[price.symbol] = price;
        }
      });

      if (PriceFetcherConfig.verbose) {
        console.log('[PriceProvider] Fetched prices:', newPrices);
      }

      // Store previous prices for change detection
      previousPricesRef.current = newPrices;

      return newPrices;
    },
    enabled: subscribedSymbolsArray.length > 0,
    refetchInterval: PriceFetcherConfig.pollingInterval, // Standard polling interval (no WebSocket)
    retry: PriceFetcherConfig.maxRetries,
    retryDelay: (attemptIndex) => Math.min(PriceFetcherConfig.retryInterval * 2 ** attemptIndex, 30000),
    placeholderData: () => generatePlaceholderData(subscribedSymbolsArray),
    staleTime: PriceFetcherConfig.pollingInterval / 2,
  });

  // Matrix-style status logging with color coding
  useEffect(() => {
    if (PriceFetcherConfig.verbose) {
      const colors = {
        pending: matrixColors.cyberBlue,
        error: matrixColors.neonPink,
        success: matrixColors.matrixGreen,
      };

      if (status === 'pending') {
        console.log(`%c[PriceProvider] 🔄 Loading prices via API...`, `color: ${colors.pending}; font-family: monospace;`);
      } else if (status === 'error') {
        console.error(`%c[PriceProvider] ❌ Error loading prices:`, `color: ${colors.error}; font-family: monospace;`, queryError);
      } else if (status === 'success') {
        console.log(`%c[PriceProvider] ✅ Prices updated via API:`, `color: ${colors.success}; font-family: monospace;`, prices);
      }
    }
  }, [status, queryError, prices]);

  // WEBSOCKET CONNECTION STATUS NOTIFICATIONS DISABLED
  // No more WebSocket connection status toasts

  const subscribeToPrices = useCallback((symbolsToSubscribe: string[]) => {
    const currentSubs = subscribedSymbolsRef.current;
    let changed = false;
    const newSymbols: string[] = [];

    symbolsToSubscribe.forEach(s => {
      const apiSymbol = s.toUpperCase().endsWith('USDT') ? s.toUpperCase() : `${s.toUpperCase()}USDT`;
      if (!currentSubs.has(apiSymbol)) {
        currentSubs.add(apiSymbol); // Store with consistent API format (e.g. BTCUSDT)
        newSymbols.push(s); // Keep original for logging/external use if needed
        changed = true;
      }
    });

    if (changed) {
      if (PriceFetcherConfig.verbose) {
        console.log(`%c[PriceProvider] 📡 Subscribing to prices for (API only):`, `color: ${matrixColors.cyberBlue}; font-family: monospace;`, newSymbols);
      }
      setSymbolVersion(v => v + 1);

      // NO WEBSOCKET SUBSCRIPTION - API only
    }

    return () => unsubscribeFromPrices(symbolsToSubscribe);
  }, [priceFetcherInstance]);

  const unsubscribeFromPrices = useCallback((symbolsToUnsubscribe: string[]) => {
    const currentSubs = subscribedSymbolsRef.current;
    let changed = false;

    symbolsToUnsubscribe.forEach(s => {
      const apiSymbol = s.toUpperCase().endsWith('USDT') ? s.toUpperCase() : `${s.toUpperCase()}USDT`;
      if (currentSubs.has(apiSymbol)) {
        currentSubs.delete(apiSymbol);
        changed = true;

        // NO WEBSOCKET UNSUBSCRIPTION - API only
      }
    });

    if (changed) {
      if (PriceFetcherConfig.verbose) {
        console.log(`%c[PriceProvider] 📡 Unsubscribing from prices for (API only):`, `color: ${matrixColors.warningAmber}; font-family: monospace;`, symbolsToUnsubscribe);
      }
      setSymbolVersion(v => v + 1);
    }
  }, [priceFetcherInstance]);

  const refetchPrices = useCallback((symbols?: string[]) => {
    if (symbols) {
      // Update subscriptions if new symbols are provided
      subscribeToPrices(symbols);
    }
    return actualRefetchQuery();
  }, [subscribeToPrices, actualRefetchQuery]);

  // Matrix glitch effect trigger
  const triggerGlitchEffect = useCallback((symbol: string) => {
    setPriceChangeAnimations(prev => ({ ...prev, [symbol]: 'neutral' }));
    setTimeout(() => {
      setPriceChangeAnimations(prev => {
        const updated = { ...prev };
        delete updated[symbol];
        return updated;
      });
    }, 300);
  }, []);

  const contextValue = useMemo(() => ({
    prices: prices ?? {},
    status,
    isFetching,
    error: queryError as Error | null,
    refetchPrices,
    subscribeToPrices,
    unsubscribeFromPrices,
    // Matrix WebSocket enhancements - DISABLED
    connectionStatus: wsStatus,
    isWebSocketConnected: isConnected,
    latency: metrics.latency,
    priceChangeAnimations,
    triggerGlitchEffect,
  }), [prices, status, isFetching, queryError, refetchPrices, subscribeToPrices, unsubscribeFromPrices, wsStatus, isConnected, metrics.latency, priceChangeAnimations, triggerGlitchEffect]);

  return (
    <PriceContext.Provider value={contextValue}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePriceContext() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('usePriceContext must be used within a PriceProvider');
  }
  return context;
}

export function useTokenPrice(symbol: string) {
  const { prices, status, isFetching, error, subscribeToPrices, unsubscribeFromPrices } = usePriceContext();

  useEffect(() => {
    const unsubscribe = subscribeToPrices([symbol]);
    return () => {
      unsubscribe();
    };
  }, [symbol, subscribeToPrices]);

  return {
    price: prices[symbol],
    isLoading: status === 'pending',
    isFetching,
    error,
  };
}

export function useTokenPrices(symbols: string[]) {
  const { prices, status, isFetching, error, subscribeToPrices, unsubscribeFromPrices } = usePriceContext();

  useEffect(() => {
    const unsubscribe = subscribeToPrices(symbols);
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(','), subscribeToPrices]);

  // Create an object that maps base symbols (like "BTC") to their data
  const selectedPrices = useMemo(() => {
    // This function needs to handle the mapping from normalized API symbols like "BTCUSDT" 
    // back to base symbols like "BTC" which the UI components expect
    const result: Record<string, TokenPrice> = {};

    // For each symbol the component wants (e.g., "BTC", "ETH")
    symbols.forEach(baseSymbol => {
      // Convert to what API expects (e.g., "BTCUSDT")
      const apiSymbol = baseSymbol.toUpperCase().endsWith('USDT')
        ? baseSymbol.toUpperCase()
        : `${baseSymbol.toUpperCase()}USDT`;

      // Find the price data using the API symbol from the context
      const priceData = prices[apiSymbol];

      if (priceData) {
        // Store it under the BASE symbol (e.g., "BTC") which the UI components expect
        result[baseSymbol] = priceData;
      } else {
        console.warn(`[useTokenPrices] No price data found for ${apiSymbol} when looking up ${baseSymbol}`);
      }
    });

    return result;
  }, [symbols, prices]);

  return {
    prices: selectedPrices,
    isLoading: status === 'pending',
    isFetching,
    error,
  };
} 