"use client";

import { useHydration } from "@/components/ui/hydration-safe";
import { useWallet } from "@/hooks/useWallet";
import { useTokenPrices } from "@/lib/providers/price-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link2, TrendingUp, Wallet, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change: number;
}

// Move constants outside component to prevent recreation on every render
const PORTFOLIO_BALANCES: Record<string, number> = {
  BTC: 0.5,
  ETH: 4.2,
  SOL: 25,
  ADA: 1000,
  DOT: 150,
};

const SYMBOL_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  ADA: "Cardano",
  DOT: "Polkadot",
};

// Crypto logos matching Market Intelligence section exactly
const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "/crypto-logos/mcp/btc.svg",
  ETH: "/crypto-icons/eth.svg", // Use working logo from crypto-icons directory
  SOL: "/crypto-logos/mcp/sol.svg",
  ADA: "/crypto-logos/mcp/ada.svg",
  DOT: "/crypto-logos/mcp/dot.svg",
};

const TRACKED_SYMBOLS = ["BTC", "ETH", "SOL", "ADA", "DOT"] as const;

// Enhanced sentiment color functions matching Market Intelligence and Social Sentiment
const getSentimentColor = (change: number) => {
  if (change >= 5) return "from-green-400 via-green-500 to-green-600";
  if (change >= 0) return "from-green-500 via-green-600 to-green-700";
  if (change >= -5) return "from-orange-500 via-amber-500 to-yellow-400";
  return "from-red-500 via-rose-500 to-pink-400";
};

const getSentimentGlow = (change: number) => {
  if (change >= 5) return "shadow-green-500/50";
  if (change >= 0) return "shadow-green-500/40";
  if (change >= -5) return "shadow-orange-500/40";
  return "shadow-red-500/50";
};

// Shared CryptoIcon component matching Market Intelligence exactly
function PortfolioCryptoIcon({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const logoPath = CRYPTO_LOGOS[symbol];

  // Fallback for symbols that don't have logos - same as Market Intelligence
  if (!logoPath || imageError) {
    const fallbackColors: Record<string, string> = {
      BTC: "bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400",
      ETH: "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500",
      SOL: "bg-gradient-to-br from-purple-500 via-violet-500 to-purple-400",
      ADA: "bg-gradient-to-br from-blue-400 via-sky-500 to-blue-400",
      DOT: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-400",
    };

    return (
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg drop-shadow-lg",
          fallbackColors[symbol] ||
            "bg-gradient-to-br from-gray-500 to-gray-600",
          getSentimentGlow(Math.random() * 10 - 5), // Random glow for demo
          className
        )}
      >
        {symbol.charAt(0)}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={logoPath}
        alt={symbol}
        className={cn(
          "w-8 h-8 rounded-full object-cover shadow-lg shadow-gray-500/20",
          className
        )}
        onError={() => setImageError(true)}
        loading="eager"
      />
      <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
    </div>
  );
}

// Enhanced wallet connection prompt with Matrix styling
function WalletConnectionPrompt() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/5 rounded-lg animate-pulse"></div>
      <div className="relative text-center py-8 bg-[#1a1a1a] rounded-lg border border-neutral-600">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Wallet className="h-12 w-12 text-white drop-shadow-lg" />
            <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse"></div>
          </div>
        </div>
        <h3 className="text-white text-lg font-mono font-bold mb-2 drop-shadow-lg">
          Connect Wallet
        </h3>
        <p className="text-sm font-mono text-white/60 mb-4">
          Connect your wallet to view portfolio holdings
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-gray-800/60 border border-gray-500/40 rounded-lg text-sm font-mono text-white hover:bg-gray-700/60 transition-all duration-300 shadow-lg shadow-gray-500/20"
        >
          <div className="flex items-center space-x-2">
            <Link2 className="h-4 w-4" />
            <span>Connect Wallet</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

export function PortfolioHoldings() {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cacheBustParam, setCacheBustParam] = useState("");
  const isHydrated = useHydration();

  // Wallet connection state
  const { isConnected, wallet } = useWallet();

  // Use existing price provider with stable symbol array
  const { prices, isLoading: pricesLoading } = useTokenPrices(TRACKED_SYMBOLS);

  // Stable format functions with useCallback to prevent re-renders
  const formatCurrency = useCallback((value: number) => {
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  }, []);

  const formatBalance = useCallback((balance: number, symbol: string) => {
    if (symbol === "BTC" || symbol === "ETH") {
      return balance.toFixed(4);
    } else if (symbol === "ADA") {
      return balance.toFixed(0);
    }
    return balance.toFixed(2);
  }, []);

  // Memoize portfolio calculation to prevent unnecessary recalculations
  const portfolioData = useMemo(() => {
    // Only show portfolio data if wallet is connected
    if (!isConnected || !prices || Object.keys(prices).length === 0) {
      return { assets: [], totalValue: 0 };
    }

    const portfolioAssets = Object.entries(PORTFOLIO_BALANCES)
      .map(([symbol, balance]) => {
        const price = prices[symbol];
        if (!price) return null;

        const value = balance * price.current;
        const change =
          price.historical !== 0
            ? ((price.current - price.historical) / price.historical) * 100
            : 0;

        return {
          symbol,
          name: SYMBOL_NAMES[symbol] || symbol,
          balance,
          value,
          change,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value); // Sort by value descending

    const total = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);

    return { assets: portfolioAssets, totalValue: total };
  }, [prices, isConnected]);

  // Effect to update state - separated and simplified to prevent loops
  useEffect(() => {
    if (isConnected && portfolioData.assets.length > 0) {
      setAssets(portfolioData.assets);
      setTotalValue(portfolioData.totalValue);
      setIsLoading(false);
    } else if (!isConnected) {
      setAssets([]);
      setTotalValue(0);
      setIsLoading(false);
    }
  }, [portfolioData, isConnected]);

  // Effect to handle loading state
  useEffect(() => {
    if (pricesLoading && isConnected) {
      setIsLoading(true);
    }
  }, [pricesLoading, isConnected]);

  // Client-side cache busting after hydration
  useEffect(() => {
    if (isHydrated) {
      setCacheBustParam(`?v=${Date.now()}`);
    }
  }, [isHydrated]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative overflow-hidden rounded-lg border border-neutral-600 bg-[#1a1a1a] shadow-2xl shadow-neutral-500/20"
    >
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-neutral-600 bg-[#1a1a1a]">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <img
              src={`/images/section-logos/portfolio-holdings.png${cacheBustParam}`}
              alt="Portfolio Holdings"
              className="h-6 w-6 object-contain drop-shadow-lg shadow-white/50"
              onError={(e) => {
                // Fallback to original icon if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <Wallet className="h-4 w-4 text-white hidden drop-shadow-lg shadow-white/50" />
            <div className="absolute inset-0 bg-white/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <h3 className="text-white text-xl font-mono font-bold uppercase tracking-wide drop-shadow-lg">
            Portfolio Holdings
          </h3>
          {/* Mock data indicator when wallet is connected */}
          {isConnected && (
            <span className="text-xs font-mono text-white bg-gray-700/50 px-2 py-0.5 rounded border border-gray-600/30">
              DEMO
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${
              isConnected
                ? "bg-green-400 shadow-green-400/50"
                : "bg-gray-500 shadow-gray-500/30"
            }`}
          ></div>
          <span
            className={`text-xs font-mono uppercase tracking-wider drop-shadow-sm ${
              isConnected ? "text-green-400" : "text-gray-500"
            }`}
          >
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4">
        {!isConnected ? (
          // Show wallet connection prompt when not connected
          <WalletConnectionPrompt />
        ) : (
          // Show portfolio data when connected
          <div className="space-y-3">
            {isLoading || pricesLoading ? (
              <div className="text-center py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full mb-2"
                ></motion.div>
                <div className="text-xs font-mono text-white">
                  Loading holdings...
                </div>
              </div>
            ) : (
              assets.map((asset, index) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="relative flex items-center justify-between py-2 hover:bg-white/5 rounded transition-all duration-300 group"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded"></div>

                  <div className="relative flex items-center space-x-3">
                    <PortfolioCryptoIcon
                      symbol={asset.symbol}
                      className="w-6 h-6"
                    />
                    <div>
                      <div className="text-sm font-mono font-semibold text-white drop-shadow-sm">
                        {asset.symbol}
                      </div>
                      <div className="text-xs font-mono text-white/60 drop-shadow-sm">
                        {formatBalance(asset.balance, asset.symbol)}{" "}
                        {asset.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="relative text-right">
                    <div className="text-sm font-mono font-semibold text-white drop-shadow-sm">
                      {formatCurrency(asset.value)}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-mono flex items-center space-x-1 justify-end",
                        asset.change >= 0 ? "text-green-400" : "text-red-400"
                      )}
                    >
                      <TrendingUp
                        className={cn(
                          "h-3 w-3",
                          asset.change < 0 && "rotate-180"
                        )}
                      />
                      <span>
                        {asset.change >= 0 ? "+" : ""}
                        {asset.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Total Portfolio Value - Only show when connected */}
      {isConnected && (
        <div className="relative px-4 py-3 bg-[#1a1a1a] border-t border-neutral-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-3 w-3 text-white" />
              <div className="text-xs font-mono text-white uppercase tracking-wider">
                Total Portfolio Value
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <div className="text-sm font-mono font-bold text-white drop-shadow-lg">
                {formatCurrency(totalValue)}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
