// Bradley AI Gem Scanner - React Hook for Gem Data
// Manages gem data fetching, caching, and real-time updates

import {
    Gem,
    GemCategory,
    GemResponse,
    GemSortBy,
    GemTimeframe,
    SentimentData,
    SentimentResponse
} from '@/types/gems';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// Update the import path below to the correct relative path if needed
// import { jupiterClient } from '../lib/service/solana/jupiter'; // Adjust the path as necessary
import { jupiterClient } from '../lib/services/solana/jupiter-client';

// API client configuration
const API_BASE = '/api/gems';

interface UseGemDataOptions {
  category?: GemCategory;
  limit?: number;
  timeframe?: GemTimeframe;
  sortBy?: GemSortBy;
  minAiScore?: number;
  networks?: string[];
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseGemDataReturn {
  // Data
  gems: Gem[];
  sentiment: SentimentData | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;

  // Metadata
  totalFound: number;
  lastUpdated: string | null;
  nextScanIn: number;
  source: string;

  // Actions
  refetch: () => Promise<void>;
  refresh: () => void;

  // Error info
  error: Error | null;
}

/**
 * Hook for fetching and managing gem data
 */
export function useGemData(options: UseGemDataOptions = {}): UseGemDataReturn {
  const {
    category = "all",
    limit = 20,
    timeframe = "24h",
    sortBy = "volume",
    minAiScore = 0,
    networks = ["solana"],
    enabled = true,
    refreshInterval = 30000, // 30 seconds default
  } = options;

  const queryClient = useQueryClient();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Build query key for caching
  const queryKey = [
    'gems',
    'live',
    { category, limit, timeframe, sortBy, minAiScore, networks }
  ];

  // Build API URL with parameters
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams({
      category: category || 'all',
      limit: limit?.toString() || '20',
      timeframe: timeframe || '24h',
      sortBy: sortBy || 'aiScore',
      minAiScore: minAiScore?.toString() || '0',
      networks: networks?.join(',') || 'solana',
      externalAI: 'true', // ← Add this line to enable external AI
    });

    return `${API_BASE}/live?${params.toString()}`;
  }, [category, limit, timeframe, sortBy, minAiScore, networks]);

  // Fetch gems data
  const fetchGems = useCallback(async (): Promise<GemResponse> => {
    const url = buildApiUrl();

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [buildApiUrl]);

  // Main query for gems data with live updates
  const {
    data: gemResponse,
    isLoading,
    isError,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey,
    queryFn: fetchGems,
    staleTime: 25000, // 25 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled,
    refetchInterval: refreshInterval, // ← Add this for auto-refresh
    refetchIntervalInBackground: true, // ← Keep refreshing even when tab is inactive
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('HTTP 4')) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Separate query for live price updates (more frequent)
  const {
    data: livePriceData,
  } = useQuery({
    queryKey: ['gems', 'live-prices', gemResponse?.gems?.map(g => g.address)],
    queryFn: async () => {
      if (!gemResponse?.gems?.length) return {};
      
      const addresses = gemResponse.gems.map(g => g.address);
      const priceResponse = await jupiterClient.getPriceData(addresses);
      return priceResponse.data;
    },
    enabled: enabled && !!gemResponse?.gems?.length,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Update prices every 10 seconds
    refetchIntervalInBackground: true,
  });

  // Merge live prices with gem data
  const gemsWithLivePrices = useMemo(() => {
    if (!gemResponse?.gems) return [];
    
    return gemResponse.gems.map(gem => {
      const livePrice = livePriceData?.[gem.address];
      
      return {
        ...gem,
        priceUsd: livePrice?.price !== undefined
          ? String(livePrice.price)
          : gem.priceUsd,
        priceChange24h: livePrice?.priceChange24h || gem.priceChange24h,
        volume24h: livePrice?.volume24h || gem.volume24h,
        marketCap: livePrice?.marketCap || gem.marketCap,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, [gemResponse?.gems, livePriceData]);

  // Separate query for sentiment data
  const {
    data: sentimentResponse,
  } = useQuery({
    queryKey: ['gems', 'sentiment'],
    queryFn: async (): Promise<SentimentResponse> => {
      const response = await fetch(`${API_BASE}/sentiment`);
      if (!response.ok) throw new Error('Failed to fetch sentiment');
      return response.json();
    },
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled,
  });

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: ['gems', 'sentiment'] });
    } finally {
      // No need to set isRefreshing, as we're not using the state here
    }
  }, [queryClient, queryKey]);

  // Refetch function
  const refetch = useCallback(async () => {
    await queryRefetch();
  }, [queryRefetch]);

  return {
    // Data
    gems: gemsWithLivePrices, // Use live-updated gems
    sentiment: sentimentResponse?.data || null,

    // Loading states
    isLoading,
    isRefreshing: false, // Add this property to satisfy the type
    isError,

    // Metadata
    totalFound: gemResponse?.metadata?.totalFound || 0,
    lastUpdated: gemResponse?.metadata?.lastUpdated || null,
    nextScanIn: gemResponse?.metadata?.nextScanIn || 0,
    source: gemResponse?.metadata?.source || 'unknown',

    // Actions
    refetch,
    refresh,

    // Error info
    error: error as Error | null,
  };
}

/**
 * Hook for getting gems by specific criteria with optimistic updates
 */
export function useOptimisticGems(baseOptions: UseGemDataOptions = {}) {
  const [optimisticGems, setOptimisticGems] = useState<Gem[]>([]);
  const gemData = useGemData(baseOptions);

  // Update optimistic state when real data changes
  useEffect(() => {
    if (gemData.gems.length > 0) {
      setOptimisticGems(gemData.gems);
    }
  }, [gemData.gems]);

  // Function to add optimistic gem
  const addOptimisticGem = useCallback((gem: Gem) => {
    setOptimisticGems(prev => [gem, ...prev.slice(0, 9)]); // Keep top 10
  }, []);

  // Function to update optimistic gem
  const updateOptimisticGem = useCallback((address: string, updates: Partial<Gem>) => {
    setOptimisticGems(prev =>
      prev.map(gem =>
        gem.address === address ? { ...gem, ...updates } : gem
      )
    );
  }, []);

  return {
    ...gemData,
    gems: optimisticGems,
    addOptimisticGem,
    updateOptimisticGem,
  };
}

/**
 * Hook for fetching sentiment data independently
 */
export function useSentimentData(options: { refetchInterval?: number; enabled?: boolean } = {}) {
  const { refetchInterval = 240000, enabled = true } = options; // 4 minutes default

  const {
    data: sentimentData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['gems', 'sentiment'],
    queryFn: async (): Promise<SentimentResponse> => {
      const response = await fetch(`${API_BASE}/sentiment`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sentiment: ${response.status}`);
      }
      return response.json();
    },
    staleTime: refetchInterval * 0.8, // Stale time is 80% of refetch interval
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled,
    refetchInterval,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  return {
    data: sentimentData,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook for watching specific gems
 */
export function useWatchedGems(watchList: string[] = []) {
  const queryClient = useQueryClient();

  const { data: watchedGems, isLoading } = useQuery({
    queryKey: ['gems', 'watched', watchList],
    queryFn: async (): Promise<Gem[]> => {
      if (watchList.length === 0) return [];

      // Fetch data for watched gems
      const promises = watchList.map(async (address) => {
        try {
          const response = await fetch(`${API_BASE}/token/${address}`);
          if (!response.ok) return null;
          return response.json();
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      return results.filter((gem): gem is Gem => gem !== null);
    },
    enabled: watchList.length > 0,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const addToWatchList = useCallback((address: string) => {
    // This would typically update a user preference/database
    // For now, just invalidate the cache
    queryClient.invalidateQueries({ queryKey: ['gems', 'watched'] });
  }, [queryClient]);

  const removeFromWatchList = useCallback((address: string) => {
    // This would typically update a user preference/database
    queryClient.invalidateQueries({ queryKey: ['gems', 'watched'] });
  }, [queryClient]);

  return {
    watchedGems: watchedGems || [],
    isLoading,
    addToWatchList,
    removeFromWatchList,
  };
}
