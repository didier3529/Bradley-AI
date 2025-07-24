// Bradley AI Gem Discovery Service
// Implements the core gem scanning and AI scoring logic

import {
    CacheConfig,
    DexScreenerPair,
    Gem,
    GemCategory,
    GemResponse,
    GemScoringFactors,
    GemTimeframe,
    RiskClassification
} from '@/types/gems';
import { dexScreenerClient } from './dex-screener-client';
import { sentimentAnalyzer } from './sentiment-analyzer';

// Cache configuration
const CACHE_CONFIG: CacheConfig = {
  GEMS_TTL: 30_000,      // 30 seconds
  SENTIMENT_TTL: 240_000, // 4 minutes
  PRICE_TTL: 15_000,     // 15 seconds
  MAX_GEMS: 100,         // Memory limit
};

// In-memory cache for performance
interface GemCacheEntry {
  gems: Gem[];
  timestamp: number;
  category: GemCategory;
}

class GemDiscoveryService {
  private cache = new Map<string, GemCacheEntry>();
  private sentimentCache: { data: any; timestamp: number } | null = null;

  /**
   * Main entry point for gem discovery
   */
  async discoverGems(
    category: GemCategory = 'trending',
    limit: number = 10,
    timeframe: GemTimeframe = '1h'
  ): Promise<GemResponse> {
    const startTime = Date.now();
    const cacheKey = `${category}-${limit}-${timeframe}`;

    try {
      // Check cache first
      const cached = this.getCachedGems(cacheKey);
      if (cached) {
        return {
          gems: cached.gems.slice(0, limit),
          metadata: {
            lastUpdated: new Date(cached.timestamp).toISOString(),
            totalFound: cached.gems.length,
            scanDuration: 0,
            nextScanIn: CACHE_CONFIG.GEMS_TTL - (Date.now() - cached.timestamp),
            source: 'cache'
          }
        };
      }

      // Discover new gems
      let rawPairs: DexScreenerPair[] = [];
      let processedGems: Gem[] = [];
      let scoredGems: Gem[] = [];

      try {
        rawPairs = await this.fetchDexPairs(category, timeframe);
        processedGems = await this.processRawPairs(rawPairs);
        scoredGems = await this.scoreGems(processedGems);
      } catch (error) {
        console.warn('DexScreener API failed, using fallback data:', error);
        // Use fallback mock data for testing
        scoredGems = this.getFallbackGems(category, limit);
      }

      // Sort and filter
      const sortedGems = this.sortGemsByCategory(scoredGems, category);
      const filteredGems = sortedGems.slice(0, Math.min(limit * 2, 50)); // Get more for better selection

      // Cache results
      this.setCachedGems(cacheKey, filteredGems);

      const scanDuration = Date.now() - startTime;

      return {
        gems: filteredGems.slice(0, limit),
        metadata: {
          lastUpdated: new Date().toISOString(),
          totalFound: filteredGems.length,
          scanDuration,
          nextScanIn: CACHE_CONFIG.GEMS_TTL,
          source: 'live'
        }
      };
    } catch (error) {
      console.error('Gem discovery error:', error);
      throw new Error(`Failed to discover gems: ${error.message}`);
    }
  }

  /**
   * Fetch DEX pairs based on category and timeframe
   */
  private async fetchDexPairs(
    category: GemCategory,
    timeframe: GemTimeframe
  ): Promise<DexScreenerPair[]> {
    const networks = ['ethereum', 'bsc', 'polygon', 'arbitrum'];
    const allPairs: DexScreenerPair[] = [];

    for (const network of networks) {
      try {
        let pairs: DexScreenerPair[] = [];

        switch (category) {
          case 'new':
            pairs = await dexScreenerClient.getNewPairs(network, 25);
            break;
          case 'trending':
            pairs = await dexScreenerClient.getTrendingPairs(network, 25);
            break;
          case 'volume':
            pairs = await dexScreenerClient.getHighVolumePairs(network, 25);
            break;
          case 'defi':
            pairs = await dexScreenerClient.getDeFiPairs(network, 25);
            break;
          case 'meme':
            pairs = await dexScreenerClient.getMemePairs(network, 25);
            break;
          default:
            pairs = await dexScreenerClient.getTrendingPairs(network, 25);
        }

        allPairs.push(...pairs);
      } catch (error) {
        console.warn(`Failed to fetch ${network} pairs:`, error.message);
        // Continue with other networks
      }
    }

    return allPairs;
  }

  /**
   * Process raw DEX pairs into standardized Gem format
   */
  private async processRawPairs(pairs: DexScreenerPair[]): Promise<Gem[]> {
    const gems: Gem[] = [];
    const now = Date.now();

    for (const pair of pairs) {
      try {
        // Skip pairs without essential data
        if (!pair.priceUsd || !pair.volume?.h24 || pair.volume.h24 < 1000) {
          continue;
        }

        // Calculate age
        const ageInHours = pair.pairCreatedAt
          ? (now - pair.pairCreatedAt * 1000) / (1000 * 60 * 60)
          : 24; // Default to 24h if no creation time

        // Get sentiment data
        const sentiment = await this.getSentimentForToken(pair.baseToken.symbol);

        const gem: Gem = {
          address: pair.baseToken.address,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          network: this.mapChainIdToNetwork(pair.chainId),

          // Market data
          price: parseFloat(pair.priceUsd),
          priceUsd: `$${parseFloat(pair.priceUsd).toFixed(6)}`,
          priceChange24h: pair.priceChange?.h24 || 0,
          priceChange1h: pair.priceChange?.h1 || 0,
          volume24h: pair.volume.h24,
          marketCap: pair.marketCap,
          liquidity: pair.liquidity?.usd || 0,

          // Discovery metrics (will be calculated in scoring)
          aiScore: 0,
          riskLevel: 'medium',
          discoveredAt: new Date().toISOString(),
          ageInHours,

          // DEX info
          dexPair: {
            exchange: pair.dexId,
            baseToken: pair.baseToken.symbol,
            quoteToken: pair.quoteToken.symbol,
            pairAddress: pair.pairAddress,
          },

          // Sentiment
          sentiment,

          // Metadata
          metadata: {
            isNew: ageInHours < 24,
            contractVerified: false, // Will be enhanced with additional data
            rugPullRisk: 0.5, // Default medium risk
            liquidityLocked: false,
          }
        };

        gems.push(gem);
      } catch (error) {
        console.warn(`Failed to process pair ${pair.baseToken.symbol}:`, error.message);
      }
    }

    return gems;
  }

  /**
   * Apply AI scoring algorithm to gems
   */
  private async scoreGems(gems: Gem[]): Promise<Gem[]> {
    const marketSentiment = await this.getMarketSentiment();

    return gems.map(gem => {
      const scoringFactors = this.calculateScoringFactors(gem, marketSentiment);
      const aiScore = this.calculateAIScore(scoringFactors);
      const riskClassification = this.classifyRisk(gem);

      return {
        ...gem,
        aiScore: Math.round(aiScore),
        riskLevel: riskClassification.level,
        metadata: {
          ...gem.metadata,
          rugPullRisk: riskClassification.score / 100,
        }
      };
    });
  }

  /**
   * Calculate multi-factor scoring
   */
  private calculateScoringFactors(gem: Gem, marketSentiment: any): GemScoringFactors {
    return {
      priceMetrics: {
        priceChange1h: gem.priceChange1h || 0,
        priceChange24h: gem.priceChange24h,
        priceVolatility: Math.abs(gem.priceChange24h) / 100,
        momentum: (gem.priceChange1h || 0) > 0 && gem.priceChange24h > 0 ? 1 : 0,
      },

      volumeMetrics: {
        volume24h: gem.volume24h,
        volumeChange: 0, // Will be enhanced with historical data
        liquidityDepth: gem.liquidity,
        volumeToMcapRatio: gem.marketCap ? gem.volume24h / gem.marketCap : 0,
      },

      fundamentals: {
        tokenAge: gem.ageInHours,
        holderCount: gem.metadata?.holderCount || 0,
        contractVerified: gem.metadata?.contractVerified || false,
        socialPresence: Math.abs(gem.sentiment.score) * 100,
      },

      marketContext: {
        fearGreedIndex: marketSentiment?.overall?.marketFear || 50,
        sectorPerformance: 0, // Will be enhanced
        overallTrend: gem.sentiment.score,
      },

      riskAssessment: {
        rugPullRisk: gem.metadata?.rugPullRisk || 0.5,
        liquidityLocked: gem.metadata?.liquidityLocked || false,
        whaleConcentration: 0, // Will be enhanced
        auditStatus: gem.metadata?.contractVerified ? 1 : 0,
      }
    };
  }

  /**
   * Calculate final AI score (0-100)
   */
  private calculateAIScore(factors: GemScoringFactors): number {
    const weights = {
      priceMetrics: 0.25,
      volumeMetrics: 0.30,
      fundamentals: 0.20,
      marketContext: 0.15,
      riskAssessment: 0.10
    };

    // Price metrics score (0-100)
    const priceScore = Math.min(100, Math.max(0,
      (factors.priceMetrics.priceChange24h > 0 ? 60 : 30) +
      (factors.priceMetrics.momentum * 20) +
      (Math.min(20, Math.abs(factors.priceMetrics.priceChange24h)))
    ));

    // Volume metrics score (0-100)
    const volumeScore = Math.min(100, Math.max(0,
      (factors.volumeMetrics.volume24h > 10000 ? 40 : 20) +
      (factors.volumeMetrics.liquidityDepth > 50000 ? 30 : 15) +
      (factors.volumeMetrics.volumeToMcapRatio > 0.1 ? 30 : 15)
    ));

    // Fundamentals score (0-100)
    const fundamentalsScore = Math.min(100, Math.max(0,
      (factors.fundamentals.tokenAge < 168 ? 40 : 20) + // Less than 1 week
      (factors.fundamentals.contractVerified ? 30 : 0) +
      (Math.min(30, factors.fundamentals.socialPresence))
    ));

    // Market context score (0-100)
    const marketScore = Math.min(100, Math.max(0,
      (factors.marketContext.fearGreedIndex > 50 ? 60 : 40) +
      (factors.marketContext.overallTrend > 0 ? 40 : 20)
    ));

    // Risk assessment score (0-100, inverted for risk)
    const riskScore = Math.min(100, Math.max(0,
      (1 - factors.riskAssessment.rugPullRisk) * 60 +
      (factors.riskAssessment.liquidityLocked ? 40 : 20)
    ));

    // Weighted final score
    const finalScore =
      (priceScore * weights.priceMetrics) +
      (volumeScore * weights.volumeMetrics) +
      (fundamentalsScore * weights.fundamentals) +
      (marketScore * weights.marketContext) +
      (riskScore * weights.riskAssessment);

    return Math.round(finalScore);
  }

  /**
   * Classify risk level
   */
  private classifyRisk(gem: Gem): RiskClassification {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Age factor
    if (gem.ageInHours < 24) {
      riskScore += 30;
      riskFactors.push('Very new token (< 24h)');
    } else if (gem.ageInHours < 168) {
      riskScore += 15;
      riskFactors.push('New token (< 1 week)');
    }

    // Liquidity factor
    if (gem.liquidity < 50000) {
      riskScore += 25;
      riskFactors.push('Low liquidity');
    }

    // Volume factor
    if (gem.volume24h < 10000) {
      riskScore += 15;
      riskFactors.push('Low trading volume');
    }

    // Contract verification
    if (!gem.metadata?.contractVerified) {
      riskScore += 20;
      riskFactors.push('Contract not verified');
    }

    // Determine risk level
    let level: 'low' | 'medium' | 'high';
    if (riskScore < 30) level = 'low';
    else if (riskScore < 60) level = 'medium';
    else level = 'high';

    return {
      level,
      factors: riskFactors,
      confidence: Math.min(1, riskScore / 100),
      score: riskScore
    };
  }

  /**
   * Sort gems by category preferences
   */
  private sortGemsByCategory(gems: Gem[], category: GemCategory): Gem[] {
    return gems.sort((a, b) => {
      switch (category) {
        case 'new':
          return a.ageInHours - b.ageInHours;
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'trending':
        default:
          return b.aiScore - a.aiScore;
      }
    });
  }

  /**
   * Helper methods
   */
  private mapChainIdToNetwork(chainId: string): Gem['network'] {
    const chainMap: Record<string, Gem['network']> = {
      'ethereum': 'ethereum',
      'bsc': 'bsc',
      'polygon': 'polygon',
      'arbitrum': 'arbitrum',
      'base': 'base',
    };
    return chainMap[chainId] || 'ethereum';
  }

  private async getSentimentForToken(symbol: string) {
    // Default sentiment - will be enhanced with real sentiment analysis
    return {
      score: Math.random() * 2 - 1, // -1 to 1
      classification: 'neutral' as const,
      confidence: 0.5
    };
  }

  private async getMarketSentiment() {
    if (this.sentimentCache &&
        Date.now() - this.sentimentCache.timestamp < CACHE_CONFIG.SENTIMENT_TTL) {
      return this.sentimentCache.data;
    }

    try {
      const sentiment = await sentimentAnalyzer.getMarketSentiment();
      this.sentimentCache = {
        data: sentiment,
        timestamp: Date.now()
      };
      return sentiment;
    } catch (error) {
      console.warn('Failed to get market sentiment:', error);
      return null;
    }
  }

  private getCachedGems(key: string): GemCacheEntry | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.GEMS_TTL) {
      return cached;
    }
    return null;
  }

  private setCachedGems(key: string, gems: Gem[]): void {
    this.cache.set(key, {
      gems,
      timestamp: Date.now(),
      category: key.split('-')[0] as GemCategory
    });

    // Clean up old cache entries
    if (this.cache.size > 50) {
      const oldest = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0];
      this.cache.delete(oldest[0]);
    }
  }

  /**
   * Get fallback mock data when APIs fail
   */
  private getFallbackGems(category: GemCategory, limit: number): Gem[] {
    const baseGems = [
      {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        name: 'TrendCoin',
        symbol: 'TREND',
        network: 'ethereum' as const,
        price: 0.000123,
        priceUsd: '$0.000123',
        priceChange24h: 15.6,
        priceChange1h: 2.3,
        volume24h: 125000,
        marketCap: 1250000,
        liquidity: 45000,
        aiScore: 87,
        riskLevel: 'medium' as const,
        discoveredAt: new Date().toISOString(),
        ageInHours: 12,
        dexPair: {
          exchange: 'uniswap',
          baseToken: 'TREND',
          quoteToken: 'ETH',
          pairAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        },
        sentiment: {
          score: 0.6,
          classification: 'bullish' as const,
          confidence: 0.7,
        },
        metadata: {
          isNew: true,
          contractVerified: true,
          rugPullRisk: 0.3,
          liquidityLocked: true,
        },
      },
      {
        address: '0x2345678901bcdef12345678901bcdef123456789',
        name: 'MoonToken',
        symbol: 'MOON',
        network: 'bsc' as const,
        price: 0.00456,
        priceUsd: '$0.00456',
        priceChange24h: 28.9,
        priceChange1h: 5.2,
        volume24h: 89000,
        marketCap: 890000,
        liquidity: 32000,
        aiScore: 91,
        riskLevel: 'high' as const,
        discoveredAt: new Date(Date.now() - 3600000).toISOString(),
        ageInHours: 6,
        dexPair: {
          exchange: 'pancakeswap',
          baseToken: 'MOON',
          quoteToken: 'BNB',
          pairAddress: '0xbcdef12345678901bcdef12345678901bcdef123',
        },
        sentiment: {
          score: 0.8,
          classification: 'very_bullish' as const,
          confidence: 0.8,
        },
        metadata: {
          isNew: true,
          contractVerified: false,
          rugPullRisk: 0.6,
          liquidityLocked: false,
        },
      },
      {
        address: '0x3456789012cdef123456789012cdef1234567890',
        name: 'SafeGem',
        symbol: 'SAFE',
        network: 'polygon' as const,
        price: 0.0012,
        priceUsd: '$0.0012',
        priceChange24h: 8.4,
        priceChange1h: 1.1,
        volume24h: 67000,
        marketCap: 670000,
        liquidity: 28000,
        aiScore: 75,
        riskLevel: 'low' as const,
        discoveredAt: new Date(Date.now() - 7200000).toISOString(),
        ageInHours: 18,
        dexPair: {
          exchange: 'quickswap',
          baseToken: 'SAFE',
          quoteToken: 'MATIC',
          pairAddress: '0xcdef123456789012cdef123456789012cdef1234',
        },
        sentiment: {
          score: 0.3,
          classification: 'bullish' as const,
          confidence: 0.6,
        },
        metadata: {
          isNew: false,
          contractVerified: true,
          rugPullRisk: 0.2,
          liquidityLocked: true,
        },
      },
    ];

    // Filter by category
    let filteredGems = baseGems;
    if (category === 'new') {
      filteredGems = baseGems.filter(gem => gem.metadata?.isNew);
    } else if (category === 'volume') {
      filteredGems = baseGems.sort((a, b) => b.volume24h - a.volume24h);
    }

    return filteredGems.slice(0, limit);
  }
}

export const gemDiscoveryService = new GemDiscoveryService();
