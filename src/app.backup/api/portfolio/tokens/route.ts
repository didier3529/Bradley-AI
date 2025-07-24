import { NextResponse } from 'next/server';

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

// Mock data for portfolio tokens, including BTC at ~$100k
const MOCK_PORTFOLIO_TOKENS = [
  {
    address: "btc-address",
    symbol: "BTC",
    name: "Bitcoin",
    decimals: 8,
    type: "native", // Or appropriate type
    network: "bitcoin", // Or appropriate network
    price: 102982.57, // Desired BTC price
    priceChange24h: 2.78, // Example change
    balance: "0.5", // Example balance
    balanceUsd: 51491.285,
    quantity: "0.5",
    value: 51491.285,
    allocation: 31.2,
    performance24h: 2.78,
    performance7d: 5.5,
    performance30d: 10.1,
  },
  {
    address: "eth-address",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    type: "native",
    network: "ethereum",
    price: 6789.45, // Projected ETH price
    priceChange24h: 3.45,
    balance: "10",
    balanceUsd: 67894.50,
    quantity: "10",
    value: 67894.50,
    allocation: 45.1,
    performance24h: 3.45,
    performance7d: 6.2,
    performance30d: 12.5,
  },
  // Add other tokens as needed (SOL, ADA, DOT from your hardcoded price list)
  {
    address: "sol-address",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    type: "native",
    network: "solana",
    price: 320.87,
    priceChange24h: 8.91,
    balance: "100",
    balanceUsd: 32087.00,
    quantity: "100",
    value: 32087.00,
    allocation: 10.5,
    performance24h: 8.91,
    performance7d: 15.0,
    performance30d: 25.0,
  },
];

// Enhanced error response helper
function createErrorResponse(
  message: string,
  status: number = 500,
  code: string = 'TOKENS_ERROR',
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
      'Cache-Control': 'no-store',
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
      'Cache-Control': 'public, max-age=10',
    }
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Portfolio Tokens API] Fetching tokens for network=${network || 'all'}`);
    }

    // Filter tokens by network if specified
    let tokens = MOCK_PORTFOLIO_TOKENS;
    if (network) {
      tokens = MOCK_PORTFOLIO_TOKENS.filter(token =>
        token.network.toLowerCase() === network.toLowerCase()
      );
    }

    // Removed random error simulation for stable development experience
    // Random errors were causing unpredictable failures during development

    return createSuccessResponse(tokens);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('[Portfolio Tokens API] Error:', {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      url: request.url,
    });

    if (error instanceof Error && error.message.includes('Simulated')) {
      return createErrorResponse(
        'Tokens service temporarily unavailable. Please try again.',
        503,
        'SERVICE_UNAVAILABLE',
        { temporary: true }
      );
    }

    return createErrorResponse(
      'Failed to fetch portfolio tokens. Please try again later.',
      500,
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'development' ? { originalError: errorMessage } : undefined
    );
  }
}
