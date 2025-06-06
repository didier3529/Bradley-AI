export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  decimals: number;
  price?: number;
  value?: number;
  change24h?: number;
}

export interface NFTAsset {
  tokenId: string;
  contract: string;
  name: string;
  description?: string;
  image?: string;
  collection: string;
  floorPrice?: number;
  lastSale?: number;
}

export interface Transaction {
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

export interface PortfolioMetrics {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  tokenCount: number;
  nftCount: number;
  transactionCount: number;
}

export interface PortfolioSummary {
  address: string;
  chainId: number;
  metrics: PortfolioMetrics;
  tokens: TokenBalance[];
  nfts: NFTAsset[];
  recentTransactions: Transaction[];
  lastUpdated: number;
}

export interface PortfolioAllocation {
  type: 'token' | 'nft' | 'defi' | 'staking';
  name: string;
  value: number;
  percentage: number;
  change24h: number;
}

export interface PortfolioPerformance {
  timeframe: '1h' | '24h' | '7d' | '30d' | '1y';
  values: Array<{
    timestamp: number;
    value: number;
  }>;
  totalReturn: number;
  totalReturnPercent: number;
} 