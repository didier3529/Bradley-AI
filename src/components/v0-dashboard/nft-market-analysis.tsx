"use client"

import { useHydration } from '@/components/ui/hydration-safe'
import { useNFTContext } from '@/lib/providers/nft-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ImageIcon, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NFTMarketAnalysis() {
    // Use the exact same NFT provider context as the original Smart Block AI dashboard
    const { nftData, isLoading, error, refetch } = useNFTContext()
    const [cacheBustParam, setCacheBustParam] = useState('')
    const isHydrated = useHydration()

    // Client-side cache busting after hydration
    useEffect(() => {
        if (isHydrated) {
            setCacheBustParam(`?v=${Date.now()}`)
        }
    }, [isHydrated])

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

    // Use data from NFT provider context exactly like the original Smart Block AI dashboard
    const nftCollections = (nftData?.collections || [])
        .slice(0, 5) // Take first 5 collections like original
        .map(collection => ({
            name: collection.name || "Unknown Collection",
            image: collection.image || "/images/nft-placeholder.png",
            floorPrice: collection.floorPrice ? `${formatPrice(collection.floorPrice)} ETH` : 'N/A',
            change: collection.floorPriceChange && !isNaN(collection.floorPriceChange)
                ? (collection.floorPriceChange >= 0 ? `+${collection.floorPriceChange.toFixed(2)}%` : `${collection.floorPriceChange.toFixed(2)}%`)
                : "N/A",
            volume: collection.totalVolume ? `${formatLargeNumber(collection.totalVolume)} ETH` : 'N/A',
            items: collection.itemCount ? formatLargeNumber(collection.itemCount) : 'N/A',
            owners: collection.ownerCount ? formatLargeNumber(collection.ownerCount) : 'N/A',
            // Keep original properties for image access
            ...collection
        }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
                <div className="flex items-center space-x-3">
                    <img
                        src={`/images/section-logos/nft-market-analysis.png${cacheBustParam}`}
                        alt="NFT Market Analysis"
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                            // Fallback to original icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <ImageIcon className="h-5 w-5 text-cyan-400 hidden" />
                    <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wide">
                        NFT Market Analysis
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
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                    </motion.button>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-slate-900/50 text-xs font-mono text-gray-400 uppercase tracking-wider border-b border-slate-700/30">
                <div>COLLECTION</div>
                <div>FLOOR_PRICE</div>
                <div>DELTA_24H</div>
                <div>VOLUME</div>
                <div>ITEMS</div>
                <div>OWNERS</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-700/30">
                {isLoading ? (
                    <div className="px-6 py-8 text-center">
                        <div className="text-sm font-mono text-gray-400">Loading NFT collections...</div>
                    </div>
                ) : error ? (
                    <div className="px-6 py-8 text-center">
                        <div className="text-sm font-mono text-red-400">
                            Error: {error.message}
                        </div>
                        <div className="text-xs font-mono text-gray-400 mt-2">
                            Using fallback data
                        </div>
                    </div>
                ) : nftCollections.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <div className="text-sm font-mono text-gray-400">
                            No NFT collections available
                        </div>
                    </div>
                ) : (
                    nftCollections.map((collection, index) => {
                        const change24h = collection.floorPriceChange || 0

                        return (
                            <motion.div
                                key={collection.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors"
                            >
                                {/* Collection */}
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={getCollectionImage(collection)}
                                        alt={collection.name}
                                        className="w-8 h-8 rounded border border-slate-700/30 object-cover"
                                        loading="eager"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = '/images/nft-placeholder.png';
                                        }}
                                    />
                                    <div>
                                        <div className="text-sm font-mono font-semibold text-white">
                                            {collection.name}
                                        </div>
                                    </div>
                                </div>

                                {/* Floor Price */}
                                <div className="text-sm font-mono text-white">
                                    {collection.floorPrice}
                                </div>

                                {/* Delta 24H */}
                                <div className="flex items-center">
                                    <span className={cn(
                                        "text-sm font-mono font-semibold flex items-center",
                                        change24h >= 0 ? "text-green-400" : "text-red-400"
                                    )}>
                                        {change24h >= 0 ? "↑" : "↓"} {collection.change}
                                    </span>
                                </div>

                                {/* Volume */}
                                <div className="text-sm font-mono text-gray-300">
                                    {collection.volume}
                                </div>

                                {/* Items */}
                                <div className="text-sm font-mono text-gray-300">
                                    {collection.items}
                                </div>

                                {/* Owners */}
                                <div className="text-sm font-mono text-gray-300">
                                    {collection.owners}
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/30">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>[ NFT_SCAN: {nftCollections.length} COLLECTIONS ]</span>
                    <span>[ MARKETPLACE_ACTIVE ]</span>
                </div>
            </div>
        </motion.div>
    )
}
