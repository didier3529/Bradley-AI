"use client";

import { useHydration } from "@/components/ui/hydration-safe";
import { useGemData } from "@/hooks/use-gem-data";
import { RefreshCw, Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

// BULLETPROOF: Safe data formatting utilities
const formatPrice = (price: string | number | undefined): string => {
  // BULLETPROOF: Handle all possible edge cases
  if (
    price === undefined ||
    price === null ||
    price === "" ||
    price === "N/A"
  ) {
    return "0.000000";
  }

  let numPrice: number;

  if (typeof price === "string") {
    // Clean the string of any currency symbols or commas
    const cleanedPrice = price.replace(/[$,\s]/g, "");
    numPrice = parseFloat(cleanedPrice);
  } else {
    numPrice = price;
  }

  // Additional safety checks
  if (isNaN(numPrice) || !isFinite(numPrice) || numPrice < 0) {
    return "0.000000";
  }

  // Smart formatting based on magnitude
  if (numPrice >= 1) {
    return numPrice.toFixed(2);
  } else if (numPrice >= 0.01) {
    return numPrice.toFixed(4);
  } else {
    return numPrice.toFixed(6);
  }
};

// BULLETPROOF: Safe price change formatter
const formatPriceChange = (change: string | number | undefined): number => {
  if (change === undefined || change === null || change === "") return 0;
  const numChange = typeof change === "string" ? parseFloat(change) : change;
  return isNaN(numChange) ? 0 : numChange;
};

// BULLETPROOF: Safe volume formatter with K/M/B suffixes
const formatVolume = (volume: string | number | undefined): number => {
  if (volume === undefined || volume === null || volume === "") return 0;

  let numVolume: number;
  if (typeof volume === "string") {
    // Handle strings like "1.5M", "2.3K", "1.1B"
    const cleanedVolume = volume.replace(/[$,\s]/g, "");
    if (cleanedVolume.includes("K")) {
      numVolume = parseFloat(cleanedVolume.replace("K", "")) * 1000;
    } else if (cleanedVolume.includes("M")) {
      numVolume = parseFloat(cleanedVolume.replace("M", "")) * 1000000;
    } else if (cleanedVolume.includes("B")) {
      numVolume = parseFloat(cleanedVolume.replace("B", "")) * 1000000000;
    } else {
      numVolume = parseFloat(cleanedVolume);
    }
  } else {
    numVolume = volume;
  }

  return isNaN(numVolume) ? 0 : numVolume;
};

// ENHANCED: AI Score color and glow utilities
const getAIScoreColor = (score: number) => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const getAIScoreGlow = (score: number) => {
  if (score >= 80)
    return "shadow-green-400/50 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]";
  if (score >= 60)
    return "shadow-yellow-400/50 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]";
  if (score >= 40)
    return "shadow-orange-400/50 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]";
  return "shadow-red-400/50 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]";
};

const getAIScoreBg = (score: number) => {
  if (score >= 80) return "bg-green-500/20 border-green-500/40";
  if (score >= 60) return "bg-yellow-500/20 border-yellow-500/40";
  if (score >= 40) return "bg-orange-500/20 border-orange-500/40";
  return "bg-red-500/20 border-red-500/40";
};

const getAIScoreLabel = (score: number) => {
  if (score >= 90) return "ELITE";
  if (score >= 80) return "HIGH";
  if (score >= 60) return "GOOD";
  if (score >= 40) return "FAIR";
  return "LOW";
};

// BULLETPROOF: Safe gem data validator
const validateGemData = (gem: any) => {
  return {
    address: gem.address || "unknown",
    symbol: gem.symbol || "UNK",
    priceUsd: formatPrice(gem.priceUsd || gem.price || 0),
    priceChange24h: formatPriceChange(gem.priceChange24h || 0),
    volume24h: formatVolume(gem.volume24h || 0),
    marketCap: formatVolume(gem.marketCap || 0),
    aiScore: typeof gem.aiScore === "number" ? gem.aiScore : 0,
    riskLevel: gem.riskLevel || "Medium",
    isNew: Boolean(gem.isNew || gem.metadata?.isNew),
    exchange: gem.dexPair?.exchange || gem.exchange || "Raydium",
  };
};

// Helper function to format time since discovery
const formatDiscoveryTime = (discoveredAt: string): string => {
  const now = new Date().getTime();
  const discovered = new Date(discoveredAt).getTime();
  const diffMinutes = Math.floor((now - discovered) / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

// Update the GemLogo component to use square styling:
const GemLogo: React.FC<{ gem: any; className?: string }> = ({
  gem,
  className = "",
}) => {
  const [logoError, setLogoError] = useState(false);

  const fallbackLogo = (
    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center font-mono font-bold text-black text-sm border border-cyan-500/30">
      {gem.symbol.charAt(0)}
    </div>
  );

  if (logoError) {
    return fallbackLogo;
  }

  // Use DexScreener's logo API directly
  const logoUrl = `https://dd.dexscreener.com/ds-data/tokens/solana/${gem.address}.png`;

  return (
    <div className="relative w-10 h-10">
      <img
        src={logoUrl}
        alt={`${gem.symbol} logo`}
        className={`w-full h-full rounded-lg object-cover border border-slate-600 ${className}`}
        onError={() => setLogoError(true)}
      />
    </div>
  );
};

export const BradleyGemScanner: React.FC = () => {
  const [memeFilter, setMemeFilter] = useState<
    "all" | "new" | "trending" | "volume"
  >("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [cacheBustParam, setCacheBustParam] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const isHydrated = useHydration();

  // Use gem data with live updates (10 second refresh)
  const {
    gems: rawGems,
    isLoading: loading,
    error,
    refetch,
    lastUpdated,
  } = useGemData({
    category: "meme",
    limit: 10,
    refreshInterval: 10000, // ← Live updates every 10 seconds
  });

  // BULLETPROOF: Validate and sanitize gem data
  const gems = useMemo(() => {
    if (!rawGems || !Array.isArray(rawGems)) return [];
    return rawGems.map(validateGemData);
  }, [rawGems]);

  const handleRefresh = () => {
    refetch();
  };

  // Filter gems based on meme sub-category
  const filteredGems = useMemo(() => {
    if (!gems) return [];

    switch (memeFilter) {
      case "new":
        return gems.filter((gem) => gem.isNew);
      case "trending":
        return gems.filter((gem) => gem.aiScore > 80);
      case "volume":
        return gems.sort((a, b) => b.volume24h - a.volume24h);
      default:
        return gems;
    }
  }, [gems, memeFilter]);

  // Client-side cache busting after hydration
  useEffect(() => {
    if (isHydrated) {
      setCacheBustParam(`?v=${Date.now()}`);
    }
  }, [isHydrated]);

  // Add loading state for price updates
  useEffect(() => {
    if (loading) {
      setIsUpdating(true);
      const timeout = setTimeout(() => setIsUpdating(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Copy address to clipboard with visual feedback
  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-neutral-600 bg-[#2a2a2a] shadow-2xl shadow-neutral-500/20 gem-scanner-container">
      {/* Header */}
      <div className="relative flex items-center justify-between p-6 border-b border-neutral-600 bg-[#2a2a2a]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={`/images/section-logos/gem-scanner.png${cacheBustParam}`}
              alt="Gem Scanner"
              className="h-8 w-8 object-contain drop-shadow-lg shadow-cyan-400/50"
              onError={(e) => {
                // Fallback to original icon if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <Search className="h-8 w-8 text-white hidden drop-shadow-lg shadow-white/50" />
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <h2 className="text-white text-2xl font-mono font-bold uppercase tracking-wide drop-shadow-lg">
            GEM SCANNER
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
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 hover:bg-neutral-800 transition-colors disabled:opacity-50"
            title="Refresh gem data"
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
        <div className="bg-[#2a2a2a] border border-neutral-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/30"></div>
              <span className="text-white font-mono text-sm">
                LIVE SCANNER ACTIVE
              </span>
            </div>
            <div className="text-white text-xs font-mono">
              {gems.length} GEMS FOUND
            </div>
          </div>

          {/* Gem Cards */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white animate-pulse">
                    Scanning for gems...
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
            ) : filteredGems.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-white text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <div>No meme coins found</div>
                  <div className="text-sm text-white mt-1">
                    Try refreshing or changing filters
                  </div>
                </div>
              </div>
            ) : (
              filteredGems.map((gem, index) => (
                <div
                  key={gem.address}
                  className="bg-[#2a2a2a] border border-neutral-600 rounded-lg p-4 hover:border-neutral-500/50 transition-all duration-300 group gem-card-hover"
                  style={{
                    animationName: "fadeInUp",
                    animationDuration: "0.5s",
                    animationTimingFunction: "ease-out",
                    animationFillMode: "forwards",
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {" "}
                      {/* Changed from gap-3 to gap-4 */}
                      {/* BULLETPROOF TOKEN LOGO - Square with more space */}
                      <GemLogo
                        gem={gem}
                        className="transition-transform group-hover:scale-110"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {" "}
                          {/* Added mb-2 for vertical spacing */}
                          <span className="text-white font-mono font-semibold truncate text-base">
                            {" "}
                            {/* Made text slightly larger */}
                            {gem.symbol}
                          </span>
                          {/* ENHANCED: AI Score next to coin name - Bigger and Colorful */}
                          <div
                            className={`flex flex-col items-center px-3 py-2 rounded-lg border ${getAIScoreBg(
                              gem.aiScore
                            )} backdrop-blur-sm`}
                          >
                            <div className="text-xs font-mono text-white/60 leading-none">
                              SCORE
                            </div>
                            <div
                              className={`text-xl font-mono font-black ${getAIScoreColor(
                                gem.aiScore
                              )} ${getAIScoreGlow(gem.aiScore)} leading-none`}
                            >
                              {gem.aiScore}
                            </div>
                            <div
                              className={`text-xs font-mono font-bold ${getAIScoreColor(
                                gem.aiScore
                              )} leading-none`}
                            >
                              {getAIScoreLabel(gem.aiScore)}
                            </div>
                          </div>
                          {/* Market indicators with more spacing */}
                          {gem.isNew && (
                            <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-mono rounded-lg border border-green-500/30 animate-pulse">
                              NEW
                            </span>
                          )}
                          {gem.aiScore > 90 && (
                            <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-mono rounded-lg border border-yellow-500/30">
                              HOT
                            </span>
                          )}
                        </div>

                        <div className="text-white text-xs font-mono truncate">
                          {gem.address.slice(0, 8)}...{gem.address.slice(-6)}
                        </div>
                      </div>
                    </div>

                    {/* Original Price Display on the Right */}
                    <div className="text-right relative">
                      <div className="text-xl font-mono font-bold text-white">
                        ${gem.priceUsd}
                      </div>
                      <div
                        className={`text-base font-mono flex items-center gap-1 transition-all duration-300 ${
                          gem.priceChange24h >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {gem.priceChange24h >= 0 ? "↗" : "↘"}
                        {Math.abs(gem.priceChange24h).toFixed(1)}%
                        {/* Live update pulse */}
                        {isUpdating && (
                          <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gem Details */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    {" "}
                    {/* Changed from mt-3 pt-3 to mt-4 pt-4 */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      {" "}
                      {/* Changed from gap-3 to gap-4 */}
                      <div>
                        <div className="text-white mb-1.5">VOLUME</div>{" "}
                        {/* Added more bottom margin */}
                        <div className="text-white font-mono font-semibold text-sm">
                          ${(gem.volume24h || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-white mb-1.5">CAP</div>{" "}
                        {/* Added more bottom margin */}
                        <div className="text-white font-mono font-semibold text-sm">
                          ${(gem.marketCap || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-white mb-1.5">RISK</div>{" "}
                        {/* Added more bottom margin */}
                        <div
                          className={`font-mono font-semibold text-sm ${
                            gem.riskLevel === "low"
                              ? "text-green-400"
                              : gem.riskLevel === "medium"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {gem.riskLevel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Elements */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    {" "}
                    {/* Changed from mt-3 pt-3 to mt-4 pt-4 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {" "}
                        {/* Maintained gap-3 for buttons */}
                        <button
                          className="px-4 py-2 bg-neutral-700/20 text-neutral-400 text-xs font-mono rounded-lg border border-neutral-600/30 hover:bg-neutral-800/30 hover:text-white transition-colors"
                          onClick={() =>
                            window.open(
                              `https://dexscreener.com/solana/${gem.address}`,
                              "_blank"
                            )
                          }
                        >
                          VIEW CHART
                        </button>
                        <button
                          className={`px-4 py-2 text-xs font-mono rounded-lg border transition-all duration-200 ${
                            copiedAddress === gem.address
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-neutral-800/50 text-neutral-400 border-neutral-600 hover:bg-neutral-800 hover:text-white"
                          }`}
                          onClick={() => copyToClipboard(gem.address)}
                        >
                          {copiedAddress === gem.address ? "✓ COPIED" : "COPY"}
                        </button>
                      </div>

                      <div className="text-white text-xs font-mono">
                        {gem.exchange}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-6 py-4 bg-[#2a2a2a] border-t border-neutral-600">
          <div className="text-center text-white text-xs font-mono">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Real-time Solana meme coin discovery</span>
            </div>
            <div className="text-white/80">
              Powered by AI • Updates every 30s • {filteredGems.length} active
              gems
            </div>
          </div>
        </div>
      </div>

      {/* Logo debugging components removed - clean interface */}
    </div>
  );
};

// Add default export for compatibility
export default BradleyGemScanner;
