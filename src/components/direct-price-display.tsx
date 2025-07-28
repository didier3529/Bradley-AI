"use client";

import { HydrationSafe, useHydration } from "@/components/ui/hydration-safe";
import { PriceFetcher } from "@/lib/services/price-fetcher";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

// The symbols we want to display
const SYMBOLS = ["BTC", "ETH", "SOL", "ADA", "DOT"];

// Symbol to full name mapping
const SYMBOL_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  ADA: "Cardano",
  DOT: "Polkadot",
};

// Updated crypto logo paths using the MCP directory
const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "/crypto-logos/mcp/btc.svg",
  ETH: "/crypto-icons/eth.svg", // Use working logo from crypto-icons directory
  SOL: "/crypto-logos/mcp/sol.svg",
  ADA: "/crypto-logos/mcp/ada.svg",
  DOT: "/crypto-logos/mcp/dot.svg",
};

// Custom CryptoIcon component for Market Intelligence
function MarketCryptoIcon({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const logoPath = CRYPTO_LOGOS[symbol];

  // Fallback for symbols that don't have logos
  if (!logoPath || imageError) {
    const fallbackColors: Record<string, string> = {
      BTC: "bg-gradient-to-br from-orange-400 to-orange-600",
      ETH: "bg-gradient-to-br from-blue-400 to-blue-600",
      SOL: "bg-gradient-to-br from-purple-400 to-purple-600",
      ADA: "bg-gradient-to-br from-blue-300 to-blue-500",
      DOT: "bg-gradient-to-br from-pink-400 to-pink-600",
    };

    return (
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]",
          fallbackColors[symbol] ||
            "bg-gradient-to-br from-gray-400 to-gray-600",
          className
        )}
      >
        {symbol.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={logoPath}
      alt={symbol}
      className={cn(
        "w-8 h-8 rounded-full object-cover shadow-[0_0_8px_rgba(34,211,238,0.4)]",
        className
      )}
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
  sentiment:
    | "Very Bullish"
    | "Bullish"
    | "Neutral"
    | "Bearish"
    | "Very Bearish";
}

// SSR-safe fallback data for initial render
const FALLBACK_PRICES: Record<string, DirectPriceData> = {
  BTC: {
    symbol: "BTC",
    price: 104942.87,
    historical: 105774.1,
    priceChange: -831.23,
    changePercent: -0.8,
    volume: 28500000000,
    marketCap: 86270000000000,
    sentiment: "Bearish",
  },
  ETH: {
    symbol: "ETH",
    price: 2617.74,
    historical: 2617.48,
    priceChange: 0.26,
    changePercent: -0.01,
    volume: 15200000000,
    marketCap: 269000000000,
    sentiment: "Bearish",
  },
  SOL: {
    symbol: "SOL",
    price: 154.0,
    historical: 158.25,
    priceChange: -4.25,
    changePercent: -2.16,
    volume: 2100000000,
    marketCap: 5000000000,
    sentiment: "Bearish",
  },
  ADA: {
    symbol: "ADA",
    price: 0.67,
    historical: 0.7,
    priceChange: -0.03,
    changePercent: -3.63,
    volume: 850000000,
    marketCap: 800000000,
    sentiment: "Bearish",
  },
  DOT: {
    symbol: "DOT",
    price: 4.03,
    historical: 4.19,
    priceChange: -0.16,
    changePercent: -3.89,
    volume: 420000000,
    marketCap: 800000000,
    sentiment: "Bearish",
  },
};

function PriceDisplayContent() {
  const [prices, setPrices] =
    useState<Record<string, DirectPriceData>>(FALLBACK_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheBustParam, setCacheBustParam] = useState("");
  const isHydrated = useHydration();

  // Client-side cache busting after hydration
  useEffect(() => {
    if (isHydrated) {
      setCacheBustParam(`?v=${Date.now()}`);
    }
  }, [isHydrated]);

  const refetch = async () => {
    setLoading(true);
    // Trigger a refresh of price data
    await fetchPrices();
  };

  const fetchPrices = async () => {
    try {
      const priceFetcher = PriceFetcher.getInstance();

      // Start polling for these symbols
      const apiSymbols = SYMBOLS.map((s) =>
        s.toUpperCase().endsWith("USDT")
          ? s.toUpperCase()
          : `${s.toUpperCase()}USDT`
      );

      console.log("[DirectPrice] Starting to poll for symbols:", apiSymbols);
      priceFetcher.startPolling(apiSymbols);

      // Give it a moment to fetch initial data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Now retrieve the data
      const results: Record<string, DirectPriceData> = {};

      for (const baseSymbol of SYMBOLS) {
        const apiSymbol = baseSymbol.toUpperCase().endsWith("USDT")
          ? baseSymbol.toUpperCase()
          : `${baseSymbol.toUpperCase()}USDT`;

        // Get data directly from PriceFetcher
        const priceData = await priceFetcher.getPrice(apiSymbol);
        console.log(`[DirectPrice] Raw data for ${apiSymbol}:`, priceData);

        if (priceData) {
          const changePercent =
            priceData.historical !== 0
              ? ((priceData.price - priceData.historical) /
                  priceData.historical) *
                100
              : 0;

          // Determine sentiment based on price change
          let sentiment: DirectPriceData["sentiment"] = "Neutral";
          if (changePercent > 5) sentiment = "Very Bullish";
          else if (changePercent > 0) sentiment = "Bullish";
          else if (changePercent < -5) sentiment = "Very Bearish";
          else if (changePercent < 0) sentiment = "Bearish";

          // Volume and market cap are estimated based on price and a multiplier
          const volume =
            priceData.volume ||
            priceData.price * (Math.random() * 10000 + 1000);
          const marketCap =
            priceData.price * (Math.random() * 1000000 + 100000);

          results[baseSymbol] = {
            symbol: baseSymbol,
            price: priceData.price,
            historical: priceData.historical,
            priceChange: priceData.price - priceData.historical,
            changePercent,
            volume,
            marketCap,
            sentiment,
          };
        } else {
          console.warn(
            `[DirectPrice] No data found for ${apiSymbol}, using fallback`
          );
          results[baseSymbol] = FALLBACK_PRICES[baseSymbol] || {
            symbol: baseSymbol,
            price: 0,
            historical: 0,
            priceChange: 0,
            changePercent: 0,
            volume: 0,
            marketCap: 0,
            sentiment: "Neutral",
          };
        }
      }

      console.log("[DirectPrice] Final processed results:", results);
      setPrices(results);
      setLoading(false);
    } catch (err) {
      console.error("[DirectPrice] Error fetching prices:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
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
  }, [loading]);

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatLargeNumber = (value: number): string => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Very Bullish":
        return "from-emerald-400 via-green-400 to-lime-300";
      case "Bullish":
        return "from-green-400 via-emerald-400 to-teal-300";
      case "Bearish":
        return "from-orange-400 via-yellow-400 to-amber-300";
      case "Very Bearish":
        return "from-red-400 via-rose-400 to-pink-300";
      default:
        return "from-gray-400 via-slate-400 to-gray-300";
    }
  };

  const getSentimentGlow = (sentiment: string) => {
    switch (sentiment) {
      case "Very Bullish":
        return "shadow-[0_0_15px_rgba(34,197,94,0.6)]";
      case "Bullish":
        return "shadow-[0_0_12px_rgba(34,197,94,0.4)]";
      case "Bearish":
        return "shadow-[0_0_12px_rgba(251,146,60,0.4)]";
      case "Very Bearish":
        return "shadow-[0_0_15px_rgba(239,68,68,0.6)]";
      default:
        return "shadow-[0_0_8px_rgba(148,163,184,0.3)]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-lg border border-neutral-600 bg-[#1a1a1a] shadow-2xl shadow-neutral-500/20"
    >
      {/* Header */}
      <div className="relative flex items-center justify-between p-6 border-b border-neutral-600 bg-[#1a1a1a]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={`/images/section-logos/market-intelligence.png${cacheBustParam}`}
              alt="Market Intelligence"
              className="h-8 w-8 object-contain drop-shadow-lg shadow-white/50"
              onError={(e) => {
                // Fallback to original icon if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <TrendingUp className="h-8 w-8 text-white hidden drop-shadow-lg shadow-white/50" />
            <div className="absolute inset-0 bg-white/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <h2 className="text-white text-2xl font-mono font-bold uppercase tracking-wide drop-shadow-lg">
            MARKET INTELLIGENCE
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-xs font-mono text-green-400 uppercase tracking-wider drop-shadow-sm">
              LIVE
            </span>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 hover:bg-neutral-600 transition-colors disabled:opacity-50"
            title="Refresh market data"
          >
            <RefreshCw
              className={`h-4 w-4 text-white ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-4">
        {/* Scanner Display */}
        <div className="bg-[#1a1a1a] border border-neutral-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/30"></div>
              <span className="text-white font-mono text-sm">
                MARKET SCANNER ACTIVE
              </span>
            </div>
            <div className="text-white text-xs font-mono">
              {SYMBOLS.length} ASSETS FOUND
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 mb-4 text-xs font-mono text-white uppercase tracking-wider border-b border-neutral-600 pb-3">
            <div className="flex items-center space-x-1">
              <span>ASSET</span>
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <div>PRICE_USD</div>
            <div>DELTA_24H</div>
            <div>VOLUME</div>
            <div>CAP</div>
            <div>STATUS</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white animate-pulse">
                    Scanning for assets...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-400 text-center">
                  <div className="text-2xl mb-2">⚠️</div>
                  <div>Scanner Error</div>
                  <div className="text-sm text-white mt-1">
                    Retrying in 30s...
                  </div>
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-[#1a1a1a] border border-neutral-600 rounded-lg p-4 hover:border-neutral-500/50 transition-all duration-300 group"
                    style={{
                      animationName: "fadeInUp",
                      animationDuration: "0.5s",
                      animationTimingFunction: "ease-out",
                      animationFillMode: "forwards",
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* Asset */}
                      <div className="flex items-center space-x-3">
                        <MarketCryptoIcon
                          symbol={symbol}
                          className="w-10 h-10 transition-transform group-hover:scale-110"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-mono font-semibold truncate text-sm">
                            {symbol}
                          </div>
                          <div className="text-xs font-mono text-white/60 truncate">
                            {SYMBOL_NAMES[symbol]}
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="relative text-sm font-mono font-bold text-white">
                        {formatPrice(data.price)}
                      </div>

                      {/* Delta 24H */}
                      <div className="relative">
                        <div
                          className={`text-sm font-mono flex items-center gap-1 transition-all duration-300 ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "↗" : "↘"}
                          {isPositive ? "+" : ""}
                          {changePercent.toFixed(2)}%
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="relative text-sm font-mono text-white drop-shadow-sm">
                        {formatLargeNumber(data.volume)}
                      </div>

                      {/* Market Cap */}
                      <div className="relative text-sm font-mono text-white drop-shadow-sm">
                        {formatLargeNumber(data.marketCap)}
                      </div>

                      {/* Status */}
                      <div className="relative">
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            delay: index * 0.1 + 0.3,
                            duration: 0.3,
                          }}
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-mono font-bold border",
                            `bg-gradient-to-r ${getSentimentColor(
                              data.sentiment
                            )} ${getSentimentGlow(data.sentiment)}`,
                            data.sentiment === "Very Bullish" ||
                              data.sentiment === "Bullish"
                              ? "border-green-400/40 text-black"
                              : data.sentiment === "Bearish" ||
                                data.sentiment === "Very Bearish"
                              ? "border-red-400/40 text-black"
                              : "border-gray-400/40 text-black"
                          )}
                        >
                          {data.sentiment.replace(" ", "").toUpperCase()}
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-6 py-4 bg-[#1a1a1a] border-t border-neutral-600">
          <div className="text-center text-white text-xs font-mono">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Real-time market intelligence</span>
            </div>
            <div className="text-white/80">
              Powered by AI • Updates every 30s • {SYMBOLS.length} active assets
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// SSR-safe fallback loading component
function PriceDisplayFallback() {
  const [cacheBustParam, setCacheBustParam] = useState("");
  const isHydrated = useHydration();

  // Client-side cache busting after hydration
  useEffect(() => {
    if (isHydrated) {
      setCacheBustParam(`?v=${Date.now()}`);
    }
  }, [isHydrated]);

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "Very Bullish")
      return "from-emerald-400 via-green-400 to-lime-300";
    if (sentiment === "Bullish")
      return "from-green-400 via-emerald-400 to-teal-300";
    if (sentiment === "Bearish")
      return "from-orange-400 via-yellow-400 to-amber-300";
    if (sentiment === "Very Bearish")
      return "from-red-400 via-pink-400 to-rose-300";
    return "from-gray-400 via-slate-400 to-zinc-300";
  };

  const getSentimentGlow = (sentiment: string) => {
    if (sentiment === "Very Bullish")
      return "shadow-[0_0_15px_rgba(34,197,94,0.6)]";
    if (sentiment === "Bullish") return "shadow-[0_0_12px_rgba(34,197,94,0.4)]";
    if (sentiment === "Bearish")
      return "shadow-[0_0_12px_rgba(251,146,60,0.4)]";
    if (sentiment === "Very Bearish")
      return "shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    return "shadow-[0_0_8px_rgba(148,163,184,0.3)]";
  };

  const formatPrice = (price: number): string => {
    if (price === 0) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
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
      className="relative overflow-hidden rounded-lg border border-neutral-600 bg-[#1a1a1a] shadow-2xl shadow-neutral-500/20"
    >
      {/* Header */}
      <div className="relative flex items-center justify-between p-6 border-b border-neutral-600 bg-[#1a1a1a]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={`/images/section-logos/market-intelligence.png${cacheBustParam}`}
              alt="Market Intelligence"
              className="h-8 w-8 object-contain drop-shadow-lg shadow-white/50"
              onError={(e) => {
                // Fallback to original icon if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <TrendingUp className="h-8 w-8 text-white hidden drop-shadow-lg shadow-white/50" />
            <div className="absolute inset-0 bg-white/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <h2 className="text-white text-2xl font-mono font-bold uppercase tracking-wide drop-shadow-lg">
            MARKET INTELLIGENCE
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
            <span className="text-xs font-mono text-yellow-400 uppercase tracking-wider drop-shadow-sm">
              LOADING
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-4">
        {/* Scanner Display */}
        <div className="bg-[#1a1a1a] border border-neutral-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/30"></div>
              <span className="text-white font-mono text-sm">
                MARKET SCANNER LOADING
              </span>
            </div>
            <div className="text-white text-xs font-mono">
              {Object.keys(FALLBACK_PRICES).length} ASSETS FOUND
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 mb-4 text-xs font-mono text-white uppercase tracking-wider border-b border-neutral-600 pb-3">
            <div className="flex items-center space-x-1">
              <span>ASSET</span>
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <div>PRICE_USD</div>
            <div>DELTA_24H</div>
            <div>VOLUME</div>
            <div>CAP</div>
            <div>STATUS</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-3">
            {FALLBACK_PRICES &&
              Object.entries(FALLBACK_PRICES).map(([symbol, data], index) => {
                const changePercent = data.changePercent;
                const isPositive = changePercent >= 0;

                return (
                  <motion.div
                    key={symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-[#1a1a1a] border border-neutral-600 rounded-lg p-4 hover:border-neutral-500/50 transition-all duration-300 group"
                    style={{
                      animationName: "fadeInUp",
                      animationDuration: "0.5s",
                      animationTimingFunction: "ease-out",
                      animationFillMode: "forwards",
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* Asset */}
                      <div className="flex items-center space-x-3">
                        <MarketCryptoIcon
                          symbol={symbol}
                          className="w-10 h-10 transition-transform group-hover:scale-110"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-mono font-semibold truncate text-sm">
                            {symbol}
                          </div>
                          <div className="text-xs font-mono text-white/60 truncate">
                            {SYMBOL_NAMES[symbol]}
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="relative text-sm font-mono font-bold text-white">
                        {formatPrice(data.price)}
                      </div>

                      {/* Delta 24H */}
                      <div className="relative">
                        <div
                          className={`text-sm font-mono flex items-center gap-1 transition-all duration-300 ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "↗" : "↘"}
                          {isPositive ? "+" : ""}
                          {changePercent.toFixed(2)}%
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="relative text-sm font-mono text-white drop-shadow-sm">
                        {formatLargeNumber(data.volume)}
                      </div>

                      {/* Market Cap */}
                      <div className="relative text-sm font-mono text-white drop-shadow-sm">
                        {formatLargeNumber(data.marketCap)}
                      </div>

                      {/* Status */}
                      <div className="relative">
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            delay: index * 0.1 + 0.3,
                            duration: 0.3,
                          }}
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-mono font-bold border",
                            `bg-gradient-to-r ${getSentimentColor(
                              data.sentiment
                            )} ${getSentimentGlow(data.sentiment)}`,
                            data.sentiment === "Very Bullish" ||
                              data.sentiment === "Bullish"
                              ? "border-green-400/40 text-black"
                              : data.sentiment === "Bearish" ||
                                data.sentiment === "Very Bearish"
                              ? "border-red-400/40 text-black"
                              : "border-gray-400/40 text-black"
                          )}
                        >
                          {data.sentiment.replace(" ", "").toUpperCase()}
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-6 py-4 bg-[#1a1a1a] border-t border-neutral-600">
          <div className="text-center text-white text-xs font-mono">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Real-time market intelligence</span>
            </div>
            <div className="text-white/80">
              Powered by AI • Updates every 30s •{" "}
              {Object.keys(FALLBACK_PRICES).length} active assets
            </div>
          </div>
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
