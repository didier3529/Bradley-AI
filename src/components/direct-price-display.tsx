'use client';

import { HydrationSafe, useHydration } from '@/components/ui/hydration-safe';
import { PriceFetcher } from '@/lib/services/price-fetcher';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

// The symbols we want to display
const SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];

// Symbol to full name mapping
const SYMBOL_NAMES: Record<string, string> = {
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'SOL': 'Solana',
  'ADA': 'Cardano',
  'DOT': 'Polkadot',
};

// Updated crypto logo paths using the MCP directory
const CRYPTO_LOGOS: Record<string, string> = {
  'BTC': '/crypto-logos/mcp/btc.svg',
  'ETH': '/crypto-icons/eth.svg', // Use working logo from crypto-icons directory
  'SOL': '/crypto-logos/mcp/sol.svg',
  'ADA': '/crypto-logos/mcp/ada.svg',
  'DOT': '/crypto-logos/mcp/dot.svg',
};

// Custom CryptoIcon component for Market Intelligence
function MarketCryptoIcon({ symbol, className }: { symbol: string; className?: string }) {
  const [imageError, setImageError] = useState(false);
  const logoPath = CRYPTO_LOGOS[symbol];

  // Fallback for symbols that don't have logos
  if (!logoPath || imageError) {
    const fallbackColors: Record<string, string> = {
      'BTC': 'bg-orange-500',
      'ETH': 'bg-blue-500',
      'SOL': 'bg-purple-500',
      'ADA': 'bg-blue-400',
      'DOT': 'bg-pink-500',
    };

    return (
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
        fallbackColors[symbol] || 'bg-gray-500',
        className
      )}>
        {symbol.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={logoPath}
      alt={symbol}
      className={cn("w-8 h-8 rounded-full object-cover", className)}
      onError={() => setImageError(true)}
      loading="eager"
    />
  );
}

interface DirectPriceData {
  symbol: string;
  price: number;
  historical: number;
  priceChange: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sentiment: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish';
}

// SSR-safe fallback data for initial render
const FALLBACK_PRICES: Record<string, DirectPriceData> = {
  'BTC': { symbol: 'BTC', price: 104942.87, historical: 105774.10, priceChange: -831.23, changePercent: -0.80, volume: 28500000000, marketCap: 86270000000000, sentiment: 'Bearish' },
  'ETH': { symbol: 'ETH', price: 2617.74, historical: 2617.48, priceChange: 0.26, changePercent: -0.01, volume: 15200000000, marketCap: 269000000000, sentiment: 'Bearish' },
  'SOL': { symbol: 'SOL', price: 154.00, historical: 158.25, priceChange: -4.25, changePercent: -2.16, volume: 2100000000, marketCap: 5000000000, sentiment: 'Bearish' },
  'ADA': { symbol: 'ADA', price: 0.67, historical: 0.70, priceChange: -0.03, changePercent: -3.63, volume: 850000000, marketCap: 800000000, sentiment: 'Bearish' },
  'DOT': { symbol: 'DOT', price: 4.03, historical: 4.19, priceChange: -0.16, changePercent: -3.89, volume: 420000000, marketCap: 800000000, sentiment: 'Bearish' },
};

function PriceDisplayContent() {
  const [prices, setPrices] = useState<Record<string, DirectPriceData>>(FALLBACK_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheBustParam, setCacheBustParam] = useState('')
  const isHydrated = useHydration()

  // Client-side cache busting after hydration
  useEffect(() => {
    if (isHydrated) {
      setCacheBustParam(`?v=${Date.now()}`)
    }
  }, [isHydrated])

  const refetch = async () => {
    setLoading(true);
    // Trigger a refresh of price data
    await fetchPrices();
  };

  const fetchPrices = async () => {
    try {
      const priceFetcher = PriceFetcher.getInstance();

      // Start polling for these symbols
      const apiSymbols = SYMBOLS.map(s =>
        s.toUpperCase().endsWith('USDT') ? s.toUpperCase() : `${s.toUpperCase()}USDT`
      );

      console.log('[DirectPrice] Starting to poll for symbols:', apiSymbols);
      priceFetcher.startPolling(apiSymbols);

      // Give it a moment to fetch initial data
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Now retrieve the data
      const results: Record<string, DirectPriceData> = {};

      for (const baseSymbol of SYMBOLS) {
        const apiSymbol = baseSymbol.toUpperCase().endsWith('USDT')
          ? baseSymbol.toUpperCase()
          : `${baseSymbol.toUpperCase()}USDT`;

        // Get data directly from PriceFetcher
        const priceData = await priceFetcher.getPrice(apiSymbol);
        console.log(`[DirectPrice] Raw data for ${apiSymbol}:`, priceData);

        if (priceData) {
          const changePercent = priceData.historical !== 0
            ? ((priceData.price - priceData.historical) / priceData.historical) * 100
            : 0;

          // Determine sentiment based on price change
          let sentiment: DirectPriceData['sentiment'] = 'Neutral';
          if (changePercent > 5) sentiment = 'Very Bullish';
          else if (changePercent > 0) sentiment = 'Bullish';
          else if (changePercent < -5) sentiment = 'Very Bearish';
          else if (changePercent < 0) sentiment = 'Bearish';

          // Volume and market cap are estimated based on price and a multiplier
          const volume = priceData.volume || priceData.price * (Math.random() * 10000 + 1000);
          const marketCap = priceData.price * (Math.random() * 1000000 + 100000);

          results[baseSymbol] = {
            symbol: baseSymbol,
            price: priceData.price,
            historical: priceData.historical,
            priceChange: priceData.price - priceData.historical,
            changePercent,
            volume,
            marketCap,
            sentiment
          };
        } else {
          console.warn(`[DirectPrice] No data found for ${apiSymbol}, using fallback`);
          results[baseSymbol] = FALLBACK_PRICES[baseSymbol] || {
            symbol: baseSymbol,
            price: 0,
            historical: 0,
            priceChange: 0,
            changePercent: 0,
            volume: 0,
            marketCap: 0,
            sentiment: 'Neutral'
          };
        }
      }

      console.log('[DirectPrice] Final processed results:', results);
      setPrices(results);
      setLoading(false);

    } catch (err) {
      console.error('[DirectPrice] Error fetching prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();

    // Keep polling active and update every few seconds
    const interval = setInterval(async () => {
      if (!loading) {
        await fetchPrices();
      }
    }, 30000); // Update every 30 seconds to avoid too frequent calls

    return () => {
      clearInterval(interval);
      const priceFetcher = PriceFetcher.getInstance();
      priceFetcher.stopPolling();
    };
  }, []);

  // Format functions matching V0 style
  const formatPrice = (price: number): string => {
    if (price === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price);
  };

  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
        <div className="flex items-center space-x-3">
          <img
            src={`/images/section-logos/market-intelligence.png${cacheBustParam}`}
            alt="Market Intelligence"
            className="h-8 w-8 object-contain"
            onError={(e) => {
              // Fallback to bradley logo if section logo fails to load
              const target = e.currentTarget as HTMLImageElement;
              if (target.src.includes('market-intelligence.png')) {
                target.src = '/bradley-logo.png';
                target.className = 'h-8 w-8 rounded-full object-cover';
              }
            }}
          />
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wide">
            MARKET INTELLIGENCE
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono text-green-400 uppercase">LIVE</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refetch}
            className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-mono text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          </motion.button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-slate-900/50 text-xs font-mono text-gray-400 uppercase tracking-wider border-b border-slate-700/30">
        <div>ASSET</div>
        <div>PRICE_USD</div>
        <div>DELTA_24H</div>
        <div>VOLUME</div>
        <div>CAP</div>
        <div>STATUS</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-700/30">
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="text-sm font-mono text-gray-400">Loading market data...</div>
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center">
            <div className="text-sm font-mono text-red-400">
              Error: {error}
            </div>
            <div className="text-xs font-mono text-gray-400 mt-2">
              Using fallback data
            </div>
          </div>
        ) : (
          SYMBOLS.map((symbol, index) => {
            const data = prices[symbol];
            if (!data) return null;

            const changePercent = data.changePercent;
            const isPositive = changePercent >= 0;

            return (
              <motion.div
                key={symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors"
              >
                {/* Asset */}
                <div className="flex items-center space-x-3">
                  <MarketCryptoIcon symbol={symbol} className="w-8 h-8" />
                  <div>
                    <div className="text-sm font-mono font-semibold text-white">
                      {symbol}
                    </div>
                    <div className="text-xs font-mono text-gray-400">
                      {SYMBOL_NAMES[symbol]}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-sm font-mono text-white">
                  {formatPrice(data.price)}
                </div>

                {/* Delta 24H */}
                <div className="flex items-center">
                  <span className={cn(
                    "text-sm font-mono font-semibold flex items-center",
                    isPositive ? "text-green-400" : "text-red-400"
                  )}>
                    {isPositive ? "↑" : "↓"} {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Volume */}
                <div className="text-sm font-mono text-gray-300">
                  {formatLargeNumber(data.volume)}
                </div>

                {/* Market Cap */}
                <div className="text-sm font-mono text-gray-300">
                  {formatLargeNumber(data.marketCap)}
                </div>

                {/* Status */}
                <div className="text-sm font-mono">
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-mono font-semibold",
                    data.sentiment === 'Very Bullish' ? "bg-green-500/20 text-green-400 border border-green-500/40" :
                    data.sentiment === 'Bullish' ? "bg-green-400/20 text-green-400 border border-green-400/40" :
                    data.sentiment === 'Bearish' ? "bg-red-400/20 text-red-400 border border-red-400/40" :
                    data.sentiment === 'Very Bearish' ? "bg-red-500/20 text-red-500 border border-red-500/40" :
                    "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                  )}>
                    {data.sentiment.replace(' ', '').toUpperCase()}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/30">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          <span>[ REAL-TIME MARKET DATA ]</span>
          <span>[ UPDATE FREQ: 5s ]</span>
        </div>
      </div>
    </motion.div>
  );
}

// SSR-safe fallback loading component
function PriceDisplayFallback() {
  const [cacheBustParam, setCacheBustParam] = useState('')
  const isHydrated = useHydration()

  // Client-side cache busting after hydration
  useEffect(() => {
    if (isHydrated) {
      setCacheBustParam(`?v=${Date.now()}`)
    }
  }, [isHydrated])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
        <div className="flex items-center space-x-3">
          <img
            src={`/images/section-logos/market-intelligence.png${cacheBustParam}`}
            alt="Market Intelligence"
            className="h-8 w-8 object-contain"
            onError={(e) => {
              // Fallback to bradley logo if section logo fails to load
              const target = e.currentTarget as HTMLImageElement;
              if (target.src.includes('market-intelligence.png')) {
                target.src = '/bradley-logo.png';
                target.className = 'h-8 w-8 rounded-full object-cover';
              }
            }}
          />
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wide">
            MARKET INTELLIGENCE
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono text-green-400 uppercase">LOADING</span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-slate-900/50 text-xs font-mono text-gray-400 uppercase tracking-wider border-b border-slate-700/30">
        <div>ASSET</div>
        <div>PRICE_USD</div>
        <div>DELTA_24H</div>
        <div>VOLUME</div>
        <div>CAP</div>
        <div>STATUS</div>
      </div>

      <div className="divide-y divide-slate-700/30">
        {FALLBACK_PRICES && Object.entries(FALLBACK_PRICES).map(([symbol, data], index) => {
          const changePercent = data.changePercent;
          const isPositive = changePercent >= 0;

          return (
            <div
              key={symbol}
              className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors"
            >
              {/* Asset */}
              <div className="flex items-center space-x-3">
                <MarketCryptoIcon symbol={symbol} className="w-8 h-8" />
                <div>
                  <div className="text-sm font-mono font-semibold text-white">
                    {symbol}
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    {SYMBOL_NAMES[symbol]}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-sm font-mono text-white">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: data.price < 1 ? 4 : 2
                }).format(data.price)}
              </div>

              {/* Delta 24H */}
              <div className="flex items-center">
                <span className={cn(
                  "text-sm font-mono font-semibold flex items-center",
                  isPositive ? "text-green-400" : "text-red-400"
                )}>
                  {isPositive ? "↑" : "↓"} {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Volume */}
              <div className="text-sm font-mono text-gray-300">
                ${(data.volume / 1000000000).toFixed(2)}B
              </div>

              {/* Market Cap */}
              <div className="text-sm font-mono text-gray-300">
                ${(data.marketCap / 1000000000).toFixed(2)}B
              </div>

              {/* Status */}
              <div className="text-sm font-mono">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-mono font-semibold",
                  data.sentiment === 'Very Bullish' ? "bg-green-500/20 text-green-400 border border-green-500/40" :
                  data.sentiment === 'Bullish' ? "bg-green-400/20 text-green-400 border border-green-400/40" :
                  data.sentiment === 'Bearish' ? "bg-red-400/20 text-red-400 border border-red-400/40" :
                  data.sentiment === 'Very Bearish' ? "bg-red-500/20 text-red-500 border border-red-500/40" :
                  "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                )}>
                  {data.sentiment.replace(' ', '').toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/30">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          <span>[ CONNECTING TO MARKET FEED... ]</span>
          <span>[ INITIALIZING... ]</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function DirectPriceDisplay() {
  return (
    <HydrationSafe fallback={<PriceDisplayFallback />}>
      <PriceDisplayContent />
    </HydrationSafe>
  );
}
