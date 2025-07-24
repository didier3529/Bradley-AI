// Bradley AI Sentiment Analyzer
// Integrates with free-tier sentiment APIs for market mood analysis

import { SentimentData } from '@/types/gems';

// API endpoints for sentiment data
const ALTERNATIVE_ME_API = 'https://api.alternative.me/fng/';
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

interface FearGreedResponse {
  name: string;
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
    time_until_update: string;
  }>;
  metadata: {
    error: null | string;
  };
}

class SentimentAnalyzer {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private lastRequestTime = 0;

  /**
   * Get overall market sentiment
   */
  async getMarketSentiment(): Promise<SentimentData> {
    const cacheKey = 'market_sentiment';
    const cached = this.getFromCache(cacheKey, 4 * 60 * 60 * 1000); // 4 hours cache

    if (cached) {
      return cached;
    }

    try {
      // Get Fear & Greed Index from Alternative.me
      const fearGreedData = await this.getFearGreedIndex();

      // Construct sentiment data
      const sentimentData: SentimentData = {
        overall: {
          marketFear: parseInt(fearGreedData.value) || 50,
          classification: fearGreedData.value_classification || 'Neutral',
          timestamp: fearGreedData.timestamp || new Date().toISOString(),
        },
        categories: {
          crypto: {
            sentiment: this.convertFearGreedToSentiment(parseInt(fearGreedData.value) || 50),
            volume: 100, // Normalized volume metric
            trend: this.determineTrend(parseInt(fearGreedData.value) || 50),
          },
          defi: {
            sentiment: this.convertFearGreedToSentiment((parseInt(fearGreedData.value) || 50) + 10), // Slightly more optimistic for DeFi
            volume: 80,
            trend: 'up',
          },
          meme: {
            sentiment: this.convertFearGreedToSentiment((parseInt(fearGreedData.value) || 50) + 20), // More volatile/optimistic for memes
            volume: 120,
            trend: this.determineTrend((parseInt(fearGreedData.value) || 50) + 20),
          },
          gaming: {
            sentiment: this.convertFearGreedToSentiment((parseInt(fearGreedData.value) || 50) - 5),
            volume: 60,
            trend: 'stable',
          },
          ai: {
            sentiment: this.convertFearGreedToSentiment((parseInt(fearGreedData.value) || 50) + 15), // AI tokens generally more optimistic
            volume: 90,
            trend: 'up',
          },
        },
      };

      this.setCache(cacheKey, sentimentData);
      return sentimentData;
    } catch (error) {
      console.error('Failed to get market sentiment:', error);
      return this.getDefaultSentiment();
    }
  }

  /**
   * Get Fear & Greed Index from Alternative.me
   */
  private async getFearGreedIndex(): Promise<{
    value: string;
    value_classification: string;
    timestamp: string;
  }> {
    await this.rateLimitDelay();

    try {
      const response = await fetch(`${ALTERNATIVE_ME_API}?limit=1&format=json`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bradley-AI-GemScanner/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Alternative.me API error: ${response.status}`);
      }

      const data: FearGreedResponse = await response.json();

      if (data.metadata.error) {
        throw new Error(`API Error: ${data.metadata.error}`);
      }

      if (!data.data || data.data.length === 0) {
        throw new Error('No fear & greed data available');
      }

      return {
        value: data.data[0].value,
        value_classification: data.data[0].value_classification,
        timestamp: data.data[0].timestamp,
      };
    } catch (error) {
      console.error('Fear & Greed Index fetch error:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment for a specific token category
   */
  async getCategorySentiment(category: string): Promise<{
    sentiment: number;
    volume: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    try {
      const marketSentiment = await this.getMarketSentiment();
      return marketSentiment.categories[category] || {
        sentiment: 0,
        volume: 50,
        trend: 'stable',
      };
    } catch (error) {
      console.error(`Failed to get sentiment for category ${category}:`, error);
      return {
        sentiment: 0,
        volume: 50,
        trend: 'stable',
      };
    }
  }

  /**
   * Get social sentiment for a specific token (placeholder for future enhancement)
   */
  async getTokenSocialSentiment(symbol: string): Promise<{
    score: number;
    classification: string;
    confidence: number;
    sources: string[];
  }> {
    // Placeholder implementation - would integrate with Twitter API, Reddit API, etc.
    // For now, derive from market sentiment with some randomization

    try {
      const marketSentiment = await this.getMarketSentiment();
      const baseScore = this.convertFearGreedToSentiment(marketSentiment.overall.marketFear);

      // Add some token-specific variation
      const variation = (Math.random() - 0.5) * 0.4; // ±0.2 variation
      const tokenScore = Math.max(-1, Math.min(1, baseScore + variation));

      return {
        score: tokenScore,
        classification: this.scoreToClassification(tokenScore),
        confidence: 0.6, // Medium confidence for derived sentiment
        sources: ['market_general'], // Would include 'twitter', 'reddit', etc. in real implementation
      };
    } catch (error) {
      console.error(`Failed to get social sentiment for ${symbol}:`, error);
      return {
        score: 0,
        classification: 'neutral',
        confidence: 0.3,
        sources: [],
      };
    }
  }

  /**
   * Get trending sentiment topics (placeholder for future enhancement)
   */
  async getTrendingSentimentTopics(): Promise<Array<{
    topic: string;
    sentiment: number;
    volume: number;
    mentions: number;
  }>> {
    // Placeholder - would integrate with social media APIs
    return [
      { topic: 'Bitcoin', sentiment: 0.3, volume: 100, mentions: 1500 },
      { topic: 'Ethereum', sentiment: 0.2, volume: 85, mentions: 1200 },
      { topic: 'DeFi', sentiment: 0.1, volume: 60, mentions: 800 },
      { topic: 'NFTs', sentiment: -0.1, volume: 45, mentions: 600 },
      { topic: 'Altseason', sentiment: 0.4, volume: 75, mentions: 900 },
    ];
  }

  /**
   * Helper methods
   */
  private convertFearGreedToSentiment(fearGreedValue: number): number {
    // Convert 0-100 Fear & Greed Index to -1 to +1 sentiment scale
    // 0-20: Extreme Fear (-0.8 to -1)
    // 21-40: Fear (-0.3 to -0.8)
    // 41-60: Neutral (-0.3 to +0.3)
    // 61-80: Greed (+0.3 to +0.8)
    // 81-100: Extreme Greed (+0.8 to +1)

    if (fearGreedValue <= 20) {
      return -1 + (fearGreedValue / 20) * 0.2; // -1 to -0.8
    } else if (fearGreedValue <= 40) {
      return -0.8 + ((fearGreedValue - 20) / 20) * 0.5; // -0.8 to -0.3
    } else if (fearGreedValue <= 60) {
      return -0.3 + ((fearGreedValue - 40) / 20) * 0.6; // -0.3 to +0.3
    } else if (fearGreedValue <= 80) {
      return 0.3 + ((fearGreedValue - 60) / 20) * 0.5; // +0.3 to +0.8
    } else {
      return 0.8 + ((fearGreedValue - 80) / 20) * 0.2; // +0.8 to +1
    }
  }

  private determineTrend(fearGreedValue: number): 'up' | 'down' | 'stable' {
    if (fearGreedValue >= 65) return 'up';
    if (fearGreedValue <= 35) return 'down';
    return 'stable';
  }

  private scoreToClassification(score: number): string {
    if (score <= -0.6) return 'very_bearish';
    if (score <= -0.2) return 'bearish';
    if (score <= 0.2) return 'neutral';
    if (score <= 0.6) return 'bullish';
    return 'very_bullish';
  }

  private getDefaultSentiment(): SentimentData {
    const now = new Date().toISOString();
    return {
      overall: {
        marketFear: 50,
        classification: 'Neutral',
        timestamp: now,
      },
      categories: {
        crypto: { sentiment: 0, volume: 50, trend: 'stable' },
        defi: { sentiment: 0.1, volume: 60, trend: 'stable' },
        meme: { sentiment: 0.2, volume: 80, trend: 'up' },
        gaming: { sentiment: -0.1, volume: 40, trend: 'stable' },
        ai: { sentiment: 0.3, volume: 70, trend: 'up' },
      },
    };
  }

  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  private getFromCache(key: string, maxAge: number): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Clean up old entries
    if (this.cache.size > 20) {
      const oldest = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0];
      this.cache.delete(oldest[0]);
    }
  }

  /**
   * Health check for sentiment services
   */
  async healthCheck(): Promise<{
    fearGreedApi: boolean;
    cacheStatus: string;
  }> {
    try {
      await this.getFearGreedIndex();
      return {
        fearGreedApi: true,
        cacheStatus: `${this.cache.size} entries cached`,
      };
    } catch (error) {
      return {
        fearGreedApi: false,
        cacheStatus: `${this.cache.size} entries cached`,
      };
    }
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();
