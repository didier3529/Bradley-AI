"use client";

import { useHydration } from "@/components/ui/hydration-safe";
import { useNFTContext } from "@/lib/providers/nft-provider";
import { motion } from "framer-motion";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function NFTMarketAnalysis() {
  // Use the exact same NFT provider context as the original Smart Block AI dashboard
  const { nftData, isLoading, error, refetch } = useNFTContext();
  const [cacheBustParam, setCacheBustParam] = useState("");
  const [forceRefreshKey, setForceRefreshKey] = useState(0);
  const isHydrated = useHydration();

  // Client-side cache busting after hydration
  useEffect(() => {
    if (isHydrated) {
      setCacheBustParam(`?v=${Date.now()}`);
    }
  }, [isHydrated]);

  // Force refresh function to bypass all caching
  const forceRefresh = () => {
    console.log("[NFTMarketAnalysis] Force refreshing...");
    setForceRefreshKey((prev) => prev + 1);
    setCacheBustParam(`?v=${Date.now()}`);
    refetch();
  };

  console.log("[NFTMarketAnalysis] Render key:", forceRefreshKey);
  console.log("[NFTMarketAnalysis] nftData:", nftData);
  console.log(
    "[NFTMarketAnalysis] collections length:",
    nftData?.collections?.length
  );

  // Use EXACT same logo implementation from original Smart Block AI dashboard
  // This should use actual NFT collection images, not emoji icons
  const getCollectionImage = (collection: any) => {
    // Use the collection's actual image if available
    return collection.image || "/images/nft-placeholder.png";
  };

  // Use the same formatting functions as the original Smart Block AI dashboard
  const formatPrice = (price: number | string | undefined): string => {
    if (!price) return "N/A";
    const parsedPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(parsedPrice) ? "N/A" : parsedPrice.toFixed(2);
  };

  const formatLargeNumber = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return "N/A";

    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "N/A";

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toString();
    }
  };

  // Enhanced sentiment color functions matching Market Intelligence and Social Sentiment
  const getSentimentColor = (change: number) => {
    if (change >= 5) return "from-emerald-400 via-green-400 to-lime-300";
    if (change >= 0) return "from-green-500 via-emerald-500 to-green-400";
    if (change >= -5) return "from-orange-500 via-amber-500 to-yellow-400";
    return "from-red-500 via-rose-500 to-pink-400";
  };

  const getSentimentGlow = (change: number) => {
    if (change >= 5) return "shadow-emerald-500/50";
    if (change >= 0) return "shadow-green-500/40";
    if (change >= -5) return "shadow-orange-500/40";
    return "shadow-red-500/50";
  };

  // Format floor price with explicit ETH unit - FORCED UPDATE
  const formatFloorPrice = (price: number | string | undefined): string => {
    console.log(
      "[formatFloorPrice] Input received:",
      price,
      "Type:",
      typeof price
    );
    if (!price || price === 0) {
      console.log("[formatFloorPrice] No price, returning N/A");
      return "N/A";
    }

    // Handle case where price might already include (ETH)
    if (typeof price === "string" && price.includes("ETH")) {
      console.log("[formatFloorPrice] Price already contains ETH:", price);
      return price;
    }

    // Convert to number and format
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) {
      console.log("[formatFloorPrice] Invalid number, returning N/A");
      return "N/A";
    }

    // Always add (ETH) to make it explicit
    const formattedPrice = `${numPrice.toFixed(1)} (ETH)`;
    console.log("[formatFloorPrice] Final formatted price:", formattedPrice);
    return formattedPrice;
  };

  // Use data from NFT provider context exactly like the original Smart Block AI dashboard
  const nftCollections = (nftData?.collections || [])
    .slice(0, 5) // Take first 5 collections like original
    .map((collection, index) => {
      console.log(
        `[NFTMarketAnalysis] Processing collection ${index}:`,
        collection.name,
        "Floor price:",
        collection.floorPrice
      );
      const processedCollection = {
        name: collection.name || "Unknown Collection",
        image: collection.image || "/images/nft-placeholder.png",
        floorPrice: formatFloorPrice(collection.floorPrice),
        change:
          collection.floorPriceChange && !isNaN(collection.floorPriceChange)
            ? collection.floorPriceChange >= 0
              ? `+${collection.floorPriceChange.toFixed(2)}%`
              : `${collection.floorPriceChange.toFixed(2)}%`
            : "N/A",
        volume: collection.totalVolume
          ? `${formatLargeNumber(collection.totalVolume)} ETH`
          : "N/A",
        items: collection.itemCount
          ? formatLargeNumber(collection.itemCount)
          : "N/A",
        owners: collection.ownerCount
          ? formatLargeNumber(collection.ownerCount)
          : "N/A",
        // Keep original properties for image access
        ...collection,
      };
      console.log(
        `[NFTMarketAnalysis] Processed collection ${index}:`,
        processedCollection.name,
        "Final floor price:",
        processedCollection.floorPrice
      );
      return processedCollection;
    });

  // If no data from provider, use enhanced fallback data with explicit ETH formatting
  const displayCollections =
    nftCollections.length > 0
      ? nftCollections
      : [
          {
            name: "Bored Ape Yacht Club",
            image: "/images/nft-placeholder.png",
            floorPrice: "30.5 (ETH)",
            change: "+2.30%",
            volume: "3.5M ETH",
            items: "10.0K",
            owners: "6.5K",
            floorPriceChange: 2.3,
          },
          {
            name: "Mutant Ape Yacht Club",
            image: "/images/nft-placeholder.png",
            floorPrice: "12.8 (ETH)",
            change: "-1.50%",
            volume: "1.5M ETH",
            items: "20.0K",
            owners: "12.4K",
            floorPriceChange: -1.5,
          },
          {
            name: "Doodles",
            image: "/images/nft-placeholder.png",
            floorPrice: "5.6 (ETH)",
            change: "+0.80%",
            volume: "620.0K ETH",
            items: "10.0K",
            owners: "4.9K",
            floorPriceChange: 0.8,
          },
          {
            name: "Azuki",
            image: "/images/nft-placeholder.png",
            floorPrice: "8.9 (ETH)",
            change: "+1.20%",
            volume: "850.0K ETH",
            items: "10.0K",
            owners: "4.8K",
            floorPriceChange: 1.2,
          },
          {
            name: "CryptoPunks",
            image: "/images/nft-placeholder.png",
            floorPrice: "50.2 (ETH)",
            change: "-0.50%",
            volume: "4.2M ETH",
            items: "10.0K",
            owners: "3.7K",
            floorPriceChange: -0.5,
          },
        ];

  console.log(
    "[NFTMarketAnalysis] Final displayCollections:",
    displayCollections.map((c) => ({ name: c.name, floorPrice: c.floorPrice }))
  );

  return (
    <motion.div
      key={forceRefreshKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="relative overflow-hidden rounded-lg border border-neutral-600 bg-[#2a2a2a] shadow-2xl shadow-neutral-500/20"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between p-6 border-b border-neutral-600 bg-[#2a2a2a]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={`/images/section-logos/nft-market-analysis.png${cacheBustParam}`}
              alt="NFT Market Analysis"
              className="h-8 w-8 object-contain drop-shadow-lg shadow-cyan-400/50"
              onError={(e) => {
                // Fallback to original icon if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <TrendingUp className="h-8 w-8 text-white hidden drop-shadow-lg shadow-cyan-400/50" />
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <h2 className="text-white text-2xl font-mono font-bold uppercase tracking-wide drop-shadow-lg">
            NFT Market Analysis
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
            onClick={forceRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 hover:bg-neutral-600 transition-colors disabled:opacity-50"
            title="Refresh NFT data"
          >
            <RefreshCw
              className={`h-4 w-4 text-white ${
                isLoading ? "animate-spin" : ""
              }`}
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
                NFT SCANNER ACTIVE
              </span>
            </div>
            <div className="text-white text-xs font-mono">
              {displayCollections.length} COLLECTIONS FOUND
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 mb-4 text-xs font-mono text-white uppercase tracking-wider border-b border-neutral-600 pb-3">
            <div className="flex items-center space-x-1">
              <span>COLLECTION</span>
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <div>FLOOR_PRICE</div>
            <div>DELTA_24H</div>
            <div>VOLUME</div>
            <div>ITEMS</div>
            <div>OWNERS</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white animate-pulse">
                    Scanning for collections...
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
            ) : displayCollections.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-white text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <div>No collections found</div>
                  <div className="text-sm text-white mt-1">
                    Try refreshing or changing filters
                  </div>
                </div>
              </div>
            ) : (
              displayCollections.map((collection, index) => {
                const changePercent = parseFloat(
                  collection.change?.replace(/[^-\d.]/g, "") || "0"
                );
                const isPositive = changePercent >= 0;

                return (
                  <motion.div
                    key={`${collection.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-[#2a2a2a] border border-neutral-600 rounded-lg p-4 hover:border-neutral-500/50 transition-all duration-300 group"
                    style={{
                      animationName: "fadeInUp",
                      animationDuration: "0.5s",
                      animationTimingFunction: "ease-out",
                      animationFillMode: "forwards",
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* Collection Name with Image */}
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10">
                          <img
                            src={getCollectionImage(collection)}
                            alt={`${collection.name} logo`}
                            className="w-full h-full rounded-lg object-cover border border-slate-600 transition-transform group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/images/nft-placeholder.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-mono font-semibold truncate text-sm">
                            {collection.name}
                          </div>
                        </div>
                      </div>

                      {/* Floor Price */}
                      <div className="relative text-sm font-mono font-bold text-white">
                        {collection.floorPrice}
                      </div>

                      {/* Change 24h */}
                      <div className="relative">
                        <div
                          className={`text-sm font-mono flex items-center gap-1 transition-all duration-300 ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "↗" : "↘"}
                          {collection.change}
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="relative text-sm font-mono text-white drop-shadow-sm">
                        {collection.volume}
                      </div>

                      {/* Items */}
                      <div className="relative text-sm font-mono text-white drop-shadow-sm">
                        {collection.items}
                      </div>

                      {/* Owners */}
                      <div className="relative text-sm font-mono text-white drop-shadow-sm">
                        {collection.owners}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-6 py-4 bg-[#2a2a2a] border-t border-neutral-600">
          <div className="text-center text-white text-xs font-mono">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Real-time NFT collection discovery</span>
            </div>
            <div className="text-white/80">
              Powered by AI • Updates every 30s • {displayCollections.length}{" "}
              active collections
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
