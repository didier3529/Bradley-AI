// Bradley AI Gem Scanner - Sentiment API Endpoint
// Provides market sentiment analysis for gem discovery

import { NextRequest, NextResponse } from 'next/server';
import { sentimentAnalyzer } from '@/lib/services/sentiment-analyzer';
import { performanceMonitor } from '@/lib/performance/monitor';

/**
 * GET /api/gems/sentiment
 * Returns market sentiment analysis data
 */
export async function GET(request: NextRequest) {
  const operationId = performanceMonitor.startOperation('gems-sentiment-api');

  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category'); // Optional: get sentiment for specific category
    const includeTopics = searchParams.get('includeTopics') === 'true';

    let sentimentData;
    let trendingTopics = null;

    if (category) {
      // Get sentiment for specific category
      const categorySentiment = await sentimentAnalyzer.getCategorySentiment(category);
      sentimentData = {
        overall: {
          marketFear: 50, // Will be populated from market sentiment
          classification: 'Neutral',
          timestamp: new Date().toISOString(),
        },
        categories: {
          [category]: categorySentiment,
        },
      };
    } else {
      // Get overall market sentiment
      sentimentData = await sentimentAnalyzer.getMarketSentiment();
    }

    // Get trending topics if requested
    if (includeTopics) {
      trendingTopics = await sentimentAnalyzer.getTrendingSentimentTopics();
    }

    const response = {
      data: sentimentData,
      trendingTopics,
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'alternative.me',
        cacheStatus: 'fresh',
        requestId: operationId,
      },
    };

    performanceMonitor.endOperation('gems-sentiment-api', operationId);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=240, stale-while-revalidate=600', // 4 min cache, 10 min stale
        'X-API-Version': '1.0',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('Gems Sentiment API Error:', error);
    performanceMonitor.endOperation('gems-sentiment-api', operationId, error);

    return NextResponse.json(
      {
        error: 'Failed to fetch sentiment data',
        message: 'An error occurred while analyzing market sentiment.',
        code: 'SENTIMENT_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
