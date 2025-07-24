import { NextRequest, NextResponse } from 'next/server';

// Enhanced API Response interface following the established pattern
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// Portfolio types defined inline to avoid import issues
interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  decimals: number;
  price?: number;
  value?: number;
  change24h?: number;
}

interface NFTAsset {
  tokenId: string;
  contract: string;
  name: string;
  description?: string;
  image?: string;
  collection: string;
  floorPrice?: number;
  lastSale?: number;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  type: 'send' | 'receive' | 'swap' | 'contract' | 'nft';
  gasUsed?: string;
  gasPrice?: string;
  fee?: string;
}

interface PortfolioMetrics {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  tokenCount: number;
  nftCount: number;
  transactionCount: number;
  riskScore?: number;
  diversificationScore?: number;
  volatility?: number;
  sharpeRatio?: number;
}

interface PortfolioSummary {
  address: string;
  chainId: number;
  metrics: PortfolioMetrics;
  tokens: TokenBalance[];
  nfts: NFTAsset[];
  recentTransactions: Transaction[];
  lastUpdated: number;
}

// Enhanced mock portfolio data generation
const generateMockPortfolioSummary = (chainId: number, timeframe: string): PortfolioSummary => {
  // Error simulation has been moved to controlled testing environment
  // No random errors in normal development to provide stable experience

  const mockTokens = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      balance: '2.5',
      decimals: 18,
      price: 2450.50,
      value: 6126.25,
      change24h: 3.2
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xa0b86a33e6bae36c4d87dd09cd8b70f9e765ad9e',
      balance: '5000.0',
      decimals: 6,
      price: 1.0,
      value: 5000.0,
      change24h: 0.1
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      address: '0x514910771af9ca656af840dff83e8264ecf986ca',
      balance: '150.0',
      decimals: 18,
      price: 14.75,
      value: 2212.50,
      change24h: -1.8
    }
  ];

  const mockNFTs = [
    {
      tokenId: '1234',
      contract: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
      name: 'Mutant Ape #1234',
      description: 'A rare mutant ape from the MAYC collection',
      image: 'https://example.com/nft1234.png',
      collection: 'Mutant Ape Yacht Club',
      floorPrice: 15.5,
      lastSale: 18.2
    }
  ];

  const mockTransactions = [
    {
      hash: '0xabcd1234...',
      from: '0x742d35cc6634c0532925a3b8f9fd8b4c5d8e1234',
      to: '0xa0b86a33e6bae36c4d87dd09cd8b70f9e765ad9e',
      value: '1000.0',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'success' as const,
      type: 'receive' as const,
      gasUsed: '21000',
      gasPrice: '20000000000',
      fee: '0.00042'
    }
  ];

  const totalValue = mockTokens.reduce((sum, token) => sum + token.value, 0);
  const totalChange24h = mockTokens.reduce((sum, token) => sum + (token.value * token.change24h / 100), 0);

  return {
    address: '0x742d35cc6634c0532925a3b8f9fd8b4c5d8e1234',
    chainId,
    metrics: {
      totalValue,
      totalChange24h,
      totalChangePercent24h: (totalChange24h / totalValue) * 100,
      tokenCount: mockTokens.length,
      nftCount: mockNFTs.length,
      transactionCount: mockTransactions.length,
      // Additional metrics for the portfolio metrics component
      riskScore: 45, // Risk score out of 100
      diversificationScore: 72, // Diversification score out of 100
      volatility: 28.5, // Portfolio volatility percentage
      sharpeRatio: 1.34 // Sharpe ratio
    },
    tokens: mockTokens,
    nfts: mockNFTs,
    recentTransactions: mockTransactions,
    lastUpdated: Date.now()
  };
};

// Enhanced error response helper
function createErrorResponse(
  message: string,
  status: number = 500,
  code: string = 'PORTFOLIO_ERROR',
  details?: any
): NextResponse {
  const errorResponse: APIResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined
    },
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(errorResponse, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store', // Don't cache error responses
    }
  });
}

// Enhanced success response helper
function createSuccessResponse<T>(data: T): NextResponse {
  const successResponse: APIResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(successResponse, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=10', // Cache successful responses for 10 seconds
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // Enhanced parameter validation
    const { searchParams } = new URL(request.url);
    const chainIdParam = searchParams.get('chainId');
    const timeframe = searchParams.get('timeframe') || '24h';

    // Validate chainId parameter
    let chainId = 1; // default to Ethereum mainnet
    if (chainIdParam) {
      const parsedChainId = parseInt(chainIdParam);
      if (isNaN(parsedChainId) || parsedChainId < 1) {
        return createErrorResponse(
          'Invalid chainId parameter. Must be a positive integer.',
          400,
          'INVALID_CHAIN_ID'
        );
      }
      chainId = parsedChainId;
    }

    // Validate timeframe parameter
    const validTimeframes = ['1h', '24h', '7d', '30d', '1y'];
    if (!validTimeframes.includes(timeframe)) {
      return createErrorResponse(
        `Invalid timeframe parameter. Must be one of: ${validTimeframes.join(', ')}`,
        400,
        'INVALID_TIMEFRAME'
      );
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Portfolio API] Fetching summary for chainId=${chainId}, timeframe=${timeframe}`);
    }

    // Simulate realistic API delay (reduced for better UX)
    await new Promise(resolve => setTimeout(resolve, 200));

    // Generate portfolio data
    const portfolioSummary = generateMockPortfolioSummary(chainId, timeframe);

    // Validate generated data structure
    if (!portfolioSummary || !portfolioSummary.address || !portfolioSummary.metrics) {
      throw new Error('Failed to generate valid portfolio summary');
    }

    return createSuccessResponse(portfolioSummary);

  } catch (error) {
    // Enhanced error logging and handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Portfolio API] Error:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      url: request.url,
    });

    // Return appropriate error response based on error type
    if (error instanceof Error) {
      if (error.message.includes('Simulated')) {
        return createErrorResponse(
          'Portfolio service temporarily unavailable. Please try again.',
          503,
          'SERVICE_UNAVAILABLE',
          { temporary: true }
        );
      }

      if (error.message.includes('Invalid') || error.message.includes('validation')) {
        return createErrorResponse(
          errorMessage,
          400,
          'VALIDATION_ERROR'
        );
      }
    }

    // Generic server error for unknown issues
    return createErrorResponse(
      'Failed to fetch portfolio data. Please try again later.',
      500,
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'development' ? { originalError: errorMessage } : undefined
    );
  }
}
