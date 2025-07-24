// Bradley AI Gem Scanner - Type Definitions
// Based on PRD v2.0 specifications

export interface Gem {
  // Core token info
  address: string;
  name: string;
  symbol: string;
  network: 'ethereum' | 'bsc' | 'polygon' | 'arbitrum' | 'base' | 'solana';

  // Market data
  price: number;
  priceUsd: string;
  priceChange24h: number;
  priceChange1h?: number;
  volume24h: number;
  marketCap?: number;
  liquidity: number;

  // Discovery metrics
  aiScore: number; // 0-100
  aiScoreSource?: 'internal' | 'dexscreener' | 'coingecko' | 'openai';
  aiScoreData?: {
    volume24h?: number;
    priceChange24h?: number;
    liquidity?: number;
    txns24h?: number;
    marketCap?: number;
    exchange?: string;
    pairAddress?: string;
  };
  internalAiScore?: number; // Keep original score for comparison
  riskLevel: 'low' | 'medium' | 'high';
  discoveredAt: string; // ISO timestamp
  ageInHours: number;

  // DEX info
  dexPair: {
    exchange: string;
    baseToken: string;
    quoteToken: string;
    pairAddress: string;
    fee?: number;
  };

  // Sentiment data
  sentiment: {
    score: number; // -1 to 1
    classification: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
    confidence: number; // 0-1
  };

  // Additional metadata
  metadata?: {
    isNew: boolean;
    holderCount?: number;
    contractVerified?: boolean;
    rugPullRisk?: number; // 0-1
    liquidityLocked?: boolean;
  };
}

export interface GemResponse {
  gems: Gem[];
  metadata: {
    lastUpdated: string;
    totalFound: number;
    scanDuration: number;
    nextScanIn: number;
    source: string;
  };
}

export interface SentimentData {
  overall: {
    marketFear: number; // 0-100 (Alternative.me Fear & Greed Index)
    classification: string;
    timestamp: string;
  };
  categories: {
    [key: string]: {
      sentiment: number;
      volume: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

export interface SentimentResponse {
  data: SentimentData;
  metadata: {
    lastUpdated: string;
    source: string;
  };
}

export type GemCategory = 'trending' | 'new' | 'volume' | 'defi' | 'meme' | 'gaming' | 'ai';
export type GemTimeframe = '1h' | '4h' | '24h';
export type GemSortBy = 'aiScore' | 'volume24h' | 'priceChange24h' | 'discoveredAt' | 'marketCap';

export interface GemScoringFactors {
  // Price action (25%)
  priceMetrics: {
    priceChange1h: number;
    priceChange24h: number;
    priceVolatility: number;
    momentum: number;
  };

  // Volume & Liquidity (30%)
  volumeMetrics: {
    volume24h: number;
    volumeChange: number;
    liquidityDepth: number;
    volumeToMcapRatio: number;
  };

  // Token fundamentals (20%)
  fundamentals: {
    tokenAge: number;
    holderCount: number;
    contractVerified: boolean;
    socialPresence: number;
  };

  // Market conditions (15%)
  marketContext: {
    fearGreedIndex: number;
    sectorPerformance: number;
    overallTrend: number;
  };

  // Risk factors (10%)
  riskAssessment: {
    rugPullRisk: number;
    liquidityLocked: boolean;
    whaleConcentration: number;
    auditStatus: number;
  };
}

export interface RiskClassification {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  confidence: number;
  score: number; // 0-100
}

// DexScreener specific types
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
}

// Cache interfaces
export interface GemCache {
  gems: Map<string, Gem>;
  sentiment: SentimentData | null;
  lastUpdated: number;
  ttl: number;
}

export interface CacheConfig {
  GEMS_TTL: number;
  SENTIMENT_TTL: number;
  PRICE_TTL: number;
  MAX_GEMS: number;
}

// API request/response types
export interface GemRequest {
  category?: GemCategory;
  limit?: number;
  timeframe?: GemTimeframe;
  sortBy?: GemSortBy;
  minAiScore?: number;
  networks?: string[];
}

export interface GemError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Hooks state types
export interface GemScannerState {
  gems: Gem[];
  sentiment: SentimentData | null;
  isScanning: boolean;
  lastScan: Date | null;
  error: GemError | null;
  activeCategory: GemCategory;
  filters: {
    minAiScore: number;
    networks: string[];
    sortBy: GemSortBy;
  };
}

// WebSocket update types
export type GemUpdate =
  | { type: 'PRICE_UPDATE'; gemAddress: string; newPrice: number; priceChange: number; }
  | { type: 'NEW_GEM'; gem: Gem; }
  | { type: 'SENTIMENT_UPDATE'; sentiment: SentimentData; }
  | { type: 'SCAN_COMPLETE'; gems: Gem[]; duration: number; }
  | { type: 'ERROR'; error: GemError; };

export interface LiveUpdateConfig {
  enabled: boolean;
  endpoint: string;
  reconnectDelay: number;
  maxReconnects: number;
}
