// Bradley AI DexScreener Client
// Wrapper for DexScreener API integration via MCP

import { DexScreenerPair } from '@/types/gems';

// DexScreener API configuration
const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest';
const RATE_LIMIT_DELAY = 1200; // 1.2 seconds between requests to stay under limits

class DexScreenerClient {
  private lastRequestTime = 0;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  /**
   * Rate-limited request handler
   */
  private async makeRequest<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          // Ensure rate limiting
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
          }

          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Bradley-AI-GemScanner/1.0',
            },
          });

          this.lastRequestTime = Date.now();

          if (!response.ok) {
            throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process request queue sequentially
   */
  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request queue error:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Get new token pairs for a specific network
   */
  async getNewPairs(network: string, limit: number = 25): Promise<DexScreenerPair[]> {
    try {
      // Map network names to DexScreener chain IDs
      const chainId = this.getChainId(network);
      const url = `${DEXSCREENER_BASE_URL}/dex/pairs/${chainId}?sort=createdAt&order=desc&limit=${Math.min(limit, 50)}`;

      const response = await this.makeRequest<{ pairs: DexScreenerPair[] }>(url);

      return this.filterAndValidatePairs(response.pairs || [], {
        minVolume: 1000,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      });
    } catch (error) {
      console.error(`Failed to fetch new pairs for ${network}:`, error);
      return [];
    }
  }

  /**
   * Get trending token pairs
   */
  async getTrendingPairs(network: string, limit: number = 25): Promise<DexScreenerPair[]> {
    try {
      const chainId = this.getChainId(network);
      // Use volume and price change to determine trending
      const url = `${DEXSCREENER_BASE_URL}/dex/pairs/${chainId}?sort=volume&order=desc&limit=${Math.min(limit, 50)}`;

      const response = await this.makeRequest<{ pairs: DexScreenerPair[] }>(url);

      return this.filterAndValidatePairs(response.pairs || [], {
        minVolume: 5000,
        minPriceChange: 5, // At least 5% price change
      });
    } catch (error) {
      console.error(`Failed to fetch trending pairs for ${network}:`, error);
      return [];
    }
  }

  /**
   * Get high volume pairs
   */
  async getHighVolumePairs(network: string, limit: number = 25): Promise<DexScreenerPair[]> {
    try {
      const chainId = this.getChainId(network);
      const url = `${DEXSCREENER_BASE_URL}/dex/pairs/${chainId}?sort=volume&order=desc&limit=${Math.min(limit, 50)}`;

      const response = await this.makeRequest<{ pairs: DexScreenerPair[] }>(url);

      return this.filterAndValidatePairs(response.pairs || [], {
        minVolume: 10000,
      });
    } catch (error) {
      console.error(`Failed to fetch high volume pairs for ${network}:`, error);
      return [];
    }
  }

  /**
   * Get DeFi-related pairs
   */
  async getDeFiPairs(network: string, limit: number = 25): Promise<DexScreenerPair[]> {
    try {
      const chainId = this.getChainId(network);
      const url = `${DEXSCREENER_BASE_URL}/dex/pairs/${chainId}?sort=volume&order=desc&limit=${Math.min(limit * 2, 100)}`;

      const response = await this.makeRequest<{ pairs: DexScreenerPair[] }>(url);

      // Filter for DeFi-related tokens based on common patterns
      const defiPairs = (response.pairs || []).filter(pair => {
        const symbol = pair.baseToken.symbol.toLowerCase();
        const name = pair.baseToken.name.toLowerCase();

        return (
          symbol.includes('uni') || symbol.includes('swap') || symbol.includes('cake') ||
          symbol.includes('defi') || symbol.includes('yield') || symbol.includes('farm') ||
          symbol.includes('pool') || symbol.includes('vault') || symbol.includes('stake') ||
          name.includes('defi') || name.includes('swap') || name.includes('liquidity') ||
          name.includes('farming') || name.includes('staking')
        );
      });

      return this.filterAndValidatePairs(defiPairs.slice(0, limit), {
        minVolume: 2000,
      });
    } catch (error) {
      console.error(`Failed to fetch DeFi pairs for ${network}:`, error);
      return [];
    }
  }

  /**
   * Get meme token pairs
   */
  async getMemePairs(network: string, limit: number = 25): Promise<DexScreenerPair[]> {
    try {
      const chainId = this.getChainId(network);
      const url = `${DEXSCREENER_BASE_URL}/dex/pairs/${chainId}?sort=priceChangeH24&order=desc&limit=${Math.min(limit * 2, 100)}`;

      const response = await this.makeRequest<{ pairs: DexScreenerPair[] }>(url);

      // Filter for meme-related tokens based on common patterns
      const memePairs = (response.pairs || []).filter(pair => {
        const symbol = pair.baseToken.symbol.toLowerCase();
        const name = pair.baseToken.name.toLowerCase();

        return (
          symbol.includes('pepe') || symbol.includes('doge') || symbol.includes('shib') ||
          symbol.includes('meme') || symbol.includes('moon') || symbol.includes('safe') ||
          symbol.includes('inu') || symbol.includes('floki') || symbol.includes('elon') ||
          symbol.includes('cat') || symbol.includes('frog') || symbol.includes('wojak') ||
          name.includes('meme') || name.includes('dog') || name.includes('cat') ||
          name.includes('pepe') || name.includes('shiba') || name.includes('doge')
        );
      });

      return this.filterAndValidatePairs(memePairs.slice(0, limit), {
        minVolume: 1000,
      });
    } catch (error) {
      console.error(`Failed to fetch meme pairs for ${network}:`, error);
      return [];
    }
  }

  /**
   * Get token pair by address
   */
  async getPairByAddress(pairAddress: string): Promise<DexScreenerPair | null> {
    try {
      const url = `${DEXSCREENER_BASE_URL}/dex/pairs/${pairAddress}`;
      const response = await this.makeRequest<{ pair: DexScreenerPair }>(url);

      return response.pair || null;
    } catch (error) {
      console.error(`Failed to fetch pair ${pairAddress}:`, error);
      return null;
    }
  }

  /**
   * Search for tokens by query
   */
  async searchTokens(query: string, limit: number = 10): Promise<DexScreenerPair[]> {
    try {
      const url = `${DEXSCREENER_BASE_URL}/dex/search?query=${encodeURIComponent(query)}&limit=${Math.min(limit, 30)}`;
      const response = await this.makeRequest<{ pairs: DexScreenerPair[] }>(url);

      return this.filterAndValidatePairs(response.pairs || [], {
        minVolume: 500,
      });
    } catch (error) {
      console.error(`Failed to search tokens for "${query}":`, error);
      return [];
    }
  }

  /**
   * Helper: Map network names to DexScreener chain IDs
   */
  private getChainId(network: string): string {
    const chainMap: Record<string, string> = {
      'ethereum': 'ethereum',
      'bsc': 'bsc',
      'polygon': 'polygon',
      'arbitrum': 'arbitrum',
      'base': 'base',
      'avalanche': 'avalanche',
      'fantom': 'fantom',
      'optimism': 'optimism',
    };

    return chainMap[network.toLowerCase()] || 'ethereum';
  }

  /**
   * Filter and validate pairs based on criteria
   */
  private filterAndValidatePairs(
    pairs: DexScreenerPair[],
    filters: {
      minVolume?: number;
      maxAge?: number;
      minPriceChange?: number;
    } = {}
  ): DexScreenerPair[] {
    return pairs.filter(pair => {
      // Basic validation
      if (!pair.baseToken?.address || !pair.baseToken?.symbol || !pair.priceUsd) {
        return false;
      }

      // Volume filter
      if (filters.minVolume && pair.volume?.h24 < filters.minVolume) {
        return false;
      }

      // Age filter
      if (filters.maxAge && pair.pairCreatedAt) {
        const pairAge = Date.now() - (pair.pairCreatedAt * 1000);
        if (pairAge > filters.maxAge) {
          return false;
        }
      }

      // Price change filter
      if (filters.minPriceChange && Math.abs(pair.priceChange?.h24 || 0) < filters.minPriceChange) {
        return false;
      }

      // Exclude obvious scams/test tokens
      const symbol = pair.baseToken.symbol.toLowerCase();
      const name = pair.baseToken.name.toLowerCase();

      const excludePatterns = [
        'test', 'fake', 'scam', 'rug', 'honeypot',
        'wrapped', 'bridge', 'weth', 'wbtc', 'usdc', 'usdt', 'dai'
      ];

      const isExcluded = excludePatterns.some(pattern =>
        symbol.includes(pattern) || name.includes(pattern)
      );

      if (isExcluded) {
        return false;
      }

      return true;
    }).slice(0, 50); // Limit results
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks(): string[] {
    return [
      'ethereum',
      'bsc',
      'polygon',
      'arbitrum',
      'base',
      'avalanche',
      'fantom',
      'optimism'
    ];
  }

  /**
   * Health check for the API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${DEXSCREENER_BASE_URL}/dex/pairs/ethereum?limit=1`;
      await this.makeRequest(url);
      return true;
    } catch (error) {
      console.error('DexScreener health check failed:', error);
      return false;
    }
  }
}

export const dexScreenerClient = new DexScreenerClient();
