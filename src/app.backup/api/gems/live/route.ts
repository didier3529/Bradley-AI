import { solanaGemDiscovery } from '@/lib/services/solana/solana-gem-discovery';
import { GemCategory } from '@/types/gems';
import { NextRequest, NextResponse } from 'next/server';

// DexScreener API for external AI scoring
const getDexScreenerAIScore = async (tokenAddress: string) => {
  try {
    console.log(`[DexScreener API] Fetching AI score for token: ${tokenAddress}`);
    
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bradley-AI-Scanner/1.0'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`[DexScreener API] HTTP ${response.status} for ${tokenAddress}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      
      // MORE REALISTIC SCORING ALGORITHM
      let score = 40; // Lower base score
      
      // Volume factor (0-20 points) - More stringent
      const volume24h = parseFloat(pair.volume?.h24 || '0');
      if (volume24h > 10000000) score += 20;        // $10M+ volume
      else if (volume24h > 5000000) score += 15;    // $5M+ volume
      else if (volume24h > 1000000) score += 10;    // $1M+ volume
      else if (volume24h > 500000) score += 5;      // $500K+ volume
      else if (volume24h > 100000) score += 2;      // $100K+ volume
      
      // Price change factor (0-15 points) - More balanced
      const priceChange24h = parseFloat(pair.priceChange?.h24 || '0');
      const absChange = Math.abs(priceChange24h);
      if (absChange > 100) score += 15;             // 100%+ change
      else if (absChange > 50) score += 12;         // 50%+ change
      else if (absChange > 25) score += 8;          // 25%+ change
      else if (absChange > 10) score += 4;          // 10%+ change
      else if (absChange > 5) score += 2;           // 5%+ change
      
      // Liquidity factor (0-15 points) - Higher thresholds
      const liquidity = parseFloat(pair.liquidity?.usd || '0');
      if (liquidity > 10000000) score += 15;        // $10M+ liquidity
      else if (liquidity > 5000000) score += 12;    // $5M+ liquidity
      else if (liquidity > 1000000) score += 8;     // $1M+ liquidity
      else if (liquidity > 500000) score += 5;      // $500K+ liquidity
      else if (liquidity > 100000) score += 2;      // $100K+ liquidity
      
      // Transaction count factor (0-10 points) - More realistic
      const txns24h = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0);
      if (txns24h > 10000) score += 10;             // 10K+ transactions
      else if (txns24h > 5000) score += 8;          // 5K+ transactions
      else if (txns24h > 1000) score += 5;          // 1K+ transactions
      else if (txns24h > 500) score += 3;           // 500+ transactions
      else if (txns24h > 100) score += 1;           // 100+ transactions
      
      // Market cap factor (0-10 points) - Sweet spot scoring
      const marketCap = parseFloat(pair.marketCap || '0');
      if (marketCap > 1000000000) score += 5;       // $1B+ (too big, lower score)
      else if (marketCap > 100000000) score += 10;  // $100M-$1B (sweet spot)
      else if (marketCap > 10000000) score += 8;    // $10M-$100M (good)
      else if (marketCap > 1000000) score += 5;     // $1M-$10M (okay)
      else if (marketCap > 100000) score += 2;      // $100K-$1M (risky)
      
      // Age penalty (reduce score for very new tokens)
      const createdAt = pair.pairCreatedAt;
      if (createdAt) {
        const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
        if (ageHours < 1) score -= 10;              // Less than 1 hour old
        else if (ageHours < 24) score -= 5;         // Less than 1 day old
      }
      
      // Volatility penalty (too much volatility is risky)
      if (absChange > 200) score -= 10;             // 200%+ change is suspicious
      else if (absChange > 100) score -= 5;         // 100%+ change is risky
      
      const finalScore = Math.min(100, Math.max(0, score));
      
      console.log(`[DexScreener API] Score breakdown for ${tokenAddress}:`, {
        baseScore: 30,
        volume24h,
        volumePoints: volume24h > 1000000 ? 10 : (volume24h > 500000 ? 5 : 2),
        priceChange24h,
        priceChangePoints: absChange > 10 ? 4 : (absChange > 5 ? 2 : 0),
        liquidity,
        liquidityPoints: liquidity > 1000000 ? 8 : (liquidity > 500000 ? 5 : 2),
        txns24h,
        txnsPoints: txns24h > 1000 ? 5 : (txns24h > 500 ? 3 : 1),
        marketCap,
        marketCapPoints: marketCap > 100000000 ? 10 : (marketCap > 10000000 ? 8 : 5),
        finalScore
      });
      
      return {
        score: finalScore,
        source: 'dexscreener',
        data: {
          volume24h,
          priceChange24h,
          liquidity,
          txns24h,
          marketCap,
          exchange: pair.dexId,
          pairAddress: pair.pairAddress
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error(`[DexScreener API] Error fetching score for ${tokenAddress}:`, error);
    return null;
  }
};

// Batch fetch DexScreener scores with rate limiting
const getDexScreenerScoresBatch = async (tokenAddresses: string[]) => {
  const results = new Map();
  
  // Rate limit: 5 requests per second
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let i = 0; i < tokenAddresses.length; i++) {
    const address = tokenAddresses[i];
    const score = await getDexScreenerAIScore(address);
    
    if (score) {
      results.set(address, score);
    }
    
    // Add delay between requests to avoid rate limiting
    if (i < tokenAddresses.length - 1) {
      await delay(200); // 200ms delay = 5 requests per second
    }
  }
  
  return results;
};

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Starting gem discovery...');
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = (searchParams.get('category') || 'trending') as GemCategory;
    const limit = parseInt(searchParams.get('limit') || '10') || 10;
    const useExternalAI = searchParams.get('externalAI') !== 'false'; // Default to true

    console.log(`[API] Parameters: category=${category}, limit=${limit}, externalAI=${useExternalAI}`);

    // Get base gem data from internal discovery
    const gemResponse = await solanaGemDiscovery.discoverGems(category, limit);
    console.log(`[API] Internal discovery found ${gemResponse.gems.length} gems`);

    if (!useExternalAI) {
      console.log('[API] External AI disabled, returning internal scores');
      return NextResponse.json(gemResponse, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30',
          'X-Powered-By': 'Bradley-AI-Solana-Scanner',
        },
      });
    }

    // Enhance with external AI scores from DexScreener
    console.log('[API] Fetching external AI scores from DexScreener...');
    const tokenAddresses = gemResponse.gems.map(gem => gem.address);
    const dexScreenerScores = await getDexScreenerScoresBatch(tokenAddresses);
    
    console.log(`[API] DexScreener returned scores for ${dexScreenerScores.size} tokens`);

    // Merge external scores with internal data
    const gemsWithExternalAI = gemResponse.gems.map(gem => {
      const externalScore = dexScreenerScores.get(gem.address);
      
      if (externalScore) {
        return {
          ...gem,
          aiScore: externalScore.score,
          aiScoreSource: 'dexscreener',
          aiScoreData: externalScore.data,
          internalAiScore: gem.aiScore, // Keep original score for comparison
        };
      }
      
      return {
        ...gem,
        aiScoreSource: 'internal',
        internalAiScore: gem.aiScore,
      };
    });

    // Sort by AI score (external scores take precedence)
    gemsWithExternalAI.sort((a, b) => b.aiScore - a.aiScore);

    console.log(`[API] Final results: ${gemsWithExternalAI.length} gems with enhanced AI scores`);

    const enhancedResponse = {
      ...gemResponse,
      gems: gemsWithExternalAI,
      metadata: {
        ...gemResponse.metadata,
        externalAIProvider: 'dexscreener',
        externalScoresCount: dexScreenerScores.size,
        enhancedAt: new Date().toISOString(),
      }
    };

    return NextResponse.json(enhancedResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
        'X-Powered-By': 'Bradley-AI-Solana-Scanner',
      },
    });

  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}