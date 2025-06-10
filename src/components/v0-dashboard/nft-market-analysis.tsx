"use client"

import { useHydration } from '@/components/ui/hydration-safe'
import { useNFTContext } from '@/lib/providers/nft-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Activity, RefreshCw, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NFTMarketAnalysis() {
    // Use the exact same NFT provider context as the original Smart Block AI dashboard
    const { nftData, isLoading, error, refetch } = useNFTContext()
    const [cacheBustParam, setCacheBustParam] = useState('')
    const [forceRefreshKey, setForceRefreshKey] = useState(0)
    const isHydrated = useHydration()

    // Client-side cache busting after hydration
    useEffect(() => {
        if (isHydrated) {
            setCacheBustParam(`?v=${Date.now()}`)
        }
    }, [isHydrated])

    // Force refresh function to bypass all caching
    const forceRefresh = () => {
        console.log('[NFTMarketAnalysis] Force refreshing...');
        setForceRefreshKey(prev => prev + 1);
        setCacheBustParam(`?v=${Date.now()}`);
        refetch();
    };

    console.log('[NFTMarketAnalysis] Render key:', forceRefreshKey);
    console.log('[NFTMarketAnalysis] nftData:', nftData);
    console.log('[NFTMarketAnalysis] collections length:', nftData?.collections?.length);

    // Use EXACT same logo implementation from original Smart Block AI dashboard
    // This should use actual NFT collection images, not emoji icons
    const getCollectionImage = (collection: any) => {
        // Use the collection's actual image if available
        return collection.image || '/images/nft-placeholder.png'
    }

    // Use the same formatting functions as the original Smart Block AI dashboard
    const formatPrice = (price: number | string | undefined): string => {
        if (!price) return 'N/A';
        const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(parsedPrice) ? 'N/A' : parsedPrice.toFixed(2);
    };

    const formatLargeNumber = (value: string | number | undefined): string => {
        if (value === undefined || value === null) return 'N/A';

        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return 'N/A';

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
        if (change >= 5) return "from-emerald-400 via-green-400 to-lime-300"
        if (change >= 0) return "from-green-500 via-emerald-500 to-green-400"
        if (change >= -5) return "from-orange-500 via-amber-500 to-yellow-400"
        return "from-red-500 via-rose-500 to-pink-400"
    }

    const getSentimentGlow = (change: number) => {
        if (change >= 5) return "shadow-emerald-500/50"
        if (change >= 0) return "shadow-green-500/40"
        if (change >= -5) return "shadow-orange-500/40"
        return "shadow-red-500/50"
    }

    // Format floor price with explicit ETH unit - FORCED UPDATE
    const formatFloorPrice = (price: number | string | undefined): string => {
        console.log('[formatFloorPrice] Input received:', price, 'Type:', typeof price);
        if (!price || price === 0) {
            console.log('[formatFloorPrice] No price, returning N/A');
            return 'N/A';
        }

        // Handle case where price might already include (ETH)
        if (typeof price === 'string' && price.includes('ETH')) {
            console.log('[formatFloorPrice] Price already contains ETH:', price);
            return price;
        }

        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice)) {
            console.log('[formatFloorPrice] Invalid number, returning N/A');
            return 'N/A';
        }

        const result = `${numPrice.toFixed(2)} (ETH)`;
        console.log('[formatFloorPrice] Final result:', result);
        return result;
    };

    // Use data from NFT provider context exactly like the original Smart Block AI dashboard
    const nftCollections = (nftData?.collections || [])
        .slice(0, 5) // Take first 5 collections like original
        .map((collection, index) => {
            console.log(`[NFTMarketAnalysis] Processing collection ${index}:`, collection.name, 'Floor price:', collection.floorPrice);
            const processedCollection = {
                name: collection.name || "Unknown Collection",
                image: collection.image || "/images/nft-placeholder.png",
                floorPrice: formatFloorPrice(collection.floorPrice),
                change: collection.floorPriceChange && !isNaN(collection.floorPriceChange)
                    ? (collection.floorPriceChange >= 0 ? `+${collection.floorPriceChange.toFixed(2)}%` : `${collection.floorPriceChange.toFixed(2)}%`)
                    : "N/A",
                volume: collection.totalVolume ? `${formatLargeNumber(collection.totalVolume)} ETH` : 'N/A',
                items: collection.itemCount ? formatLargeNumber(collection.itemCount) : 'N/A',
                owners: collection.ownerCount ? formatLargeNumber(collection.ownerCount) : 'N/A',
                // Keep original properties for image access
                ...collection
            };
            console.log(`[NFTMarketAnalysis] Processed collection ${index}:`, processedCollection.name, 'Final floor price:', processedCollection.floorPrice);
            return processedCollection;
        });

    // If no data from provider, use enhanced fallback data with explicit ETH formatting
    const displayCollections = nftCollections.length > 0 ? nftCollections : [
        {
            name: "Bored Ape Yacht Club",
            image: "/images/nft-placeholder.png",
            floorPrice: "30.5 (ETH)",
            change: "+2.30%",
            volume: "3.5M ETH",
            items: "10.0K",
            owners: "6.5K",
            floorPriceChange: 2.30
        },
        {
            name: "Mutant Ape Yacht Club",
            image: "/images/nft-placeholder.png",
            floorPrice: "12.8 (ETH)",
            change: "-1.50%",
            volume: "1.5M ETH",
            items: "20.0K",
            owners: "12.4K",
            floorPriceChange: -1.50
        },
        {
            name: "Doodles",
            image: "/images/nft-placeholder.png",
            floorPrice: "5.6 (ETH)",
            change: "+0.80%",
            volume: "620.0K ETH",
            items: "10.0K",
            owners: "4.9K",
            floorPriceChange: 0.80
        },
        {
            name: "Azuki",
            image: "/images/nft-placeholder.png",
            floorPrice: "8.9 (ETH)",
            change: "+1.20%",
            volume: "850.0K ETH",
            items: "10.0K",
            owners: "4.8K",
            floorPriceChange: 1.20
        },
        {
            name: "CryptoPunks",
            image: "/images/nft-placeholder.png",
            floorPrice: "50.2 (ETH)",
            change: "-0.50%",
            volume: "4.2M ETH",
            items: "10.0K",
            owners: "3.7K",
            floorPriceChange: -0.50
        }
    ];

    console.log('[NFTMarketAnalysis] Final displayCollections:', displayCollections.map(c => ({ name: c.name, floorPrice: c.floorPrice })));

    return (
        <motion.div
            key={forceRefreshKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gradient-to-br from-black/90 via-slate-900/80 to-black/90 shadow-2xl shadow-cyan-500/20 backdrop-blur-md"
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-cyan-500/20 bg-gradient-to-r from-black/50 via-slate-900/30 to-black/50">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            src={`/images/section-logos/nft-market-analysis.png${cacheBustParam}`}
                            alt="NFT Market Analysis"
                            className="h-6 w-6 object-contain drop-shadow-lg shadow-cyan-400/50"
                            onError={(e) => {
                                // Fallback to original icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <TrendingUp className="h-6 w-6 text-cyan-400 hidden drop-shadow-lg shadow-cyan-400/50" />
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
                    </div>
                    <h2 className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-300 bg-clip-text text-lg font-mono font-bold text-transparent uppercase tracking-wide drop-shadow-lg">
                        NFT Market Analysis
                    </h2>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                        <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider drop-shadow-sm">LIVE</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={forceRefresh}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 border border-cyan-500/40 rounded text-xs font-mono text-cyan-400 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:via-emerald-500/30 hover:to-cyan-500/30 transition-all duration-300 shadow-lg shadow-cyan-500/20"
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                        <Activity className="h-3 w-3" />
                    </motion.button>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80 text-xs font-mono text-cyan-300 uppercase tracking-wider border-b border-cyan-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-1">
                    <span>COLLECTION</span>
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                </div>
                <div>FLOOR_PRICE</div>
                <div>DELTA_24H</div>
                <div>VOLUME</div>
                <div>ITEMS</div>
                <div>OWNERS</div>
            </div>

            {/* Table Rows */}
            <div className="relative">
                {isLoading ? (
                    <div className="px-6 py-8 text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full mb-2"
                        ></motion.div>
                        <div className="text-sm font-mono text-cyan-400">Loading NFT collections...</div>
                    </div>
                ) : error ? (
                    <div className="px-6 py-8 text-center">
                        <div className="text-sm font-mono text-red-400 bg-red-500/10 border border-red-500/30 rounded p-4">
                            Error: {error.message}
                        </div>
                        <div className="text-xs font-mono text-cyan-400 mt-2">
                            Using fallback data
                        </div>
                    </div>
                ) : displayCollections.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <div className="text-sm font-mono text-cyan-400">
                            No NFT collections available
                        </div>
                    </div>
                ) : (
                    displayCollections.map((collection, index) => {
                        const change24h = collection.floorPriceChange || 0

                        return (
                            <motion.div
                                key={collection.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="relative grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-emerald-500/5 hover:to-cyan-500/5 transition-all duration-300 border-b border-slate-700/30 hover:border-cyan-500/20 group"
                            >
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-emerald-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Collection */}
                                <div className="relative flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={getCollectionImage(collection)}
                                            alt={collection.name}
                                            className="w-8 h-8 rounded border border-cyan-500/30 object-cover shadow-lg shadow-cyan-500/20"
                                            loading="eager"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = '/images/nft-placeholder.png';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-cyan-400/10 rounded animate-pulse"></div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-mono font-semibold text-white drop-shadow-sm">
                                            {collection.name}
                                        </div>
                                    </div>
                                </div>

                                {/* Floor Price */}
                                <div className="relative text-sm font-mono text-white font-semibold drop-shadow-sm">
                                    {collection.floorPrice}
                                </div>

                                {/* Delta 24H */}
                                <div className="relative flex items-center">
                                    <span className={cn(
                                        "text-sm font-mono font-semibold flex items-center space-x-1 px-2 py-1 rounded-lg border shadow-lg",
                                        change24h >= 0
                                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/20"
                                            : "text-red-400 bg-red-500/10 border-red-500/30 shadow-red-500/20"
                                    )}>
                                        <TrendingUp className={cn("h-3 w-3", change24h < 0 && "rotate-180")} />
                                        <span>{collection.change}</span>
                                    </span>
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
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Footer */}
            <div className="relative px-6 py-4 bg-gradient-to-r from-black/80 via-slate-900/60 to-black/80 border-t border-cyan-500/20 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-emerald-400" />
                        <span>[ NFT_SCAN: {displayCollections.length} COLLECTIONS ]</span>
                    </span>
                    <span className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span>[ MARKETPLACE_ACTIVE ]</span>
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
