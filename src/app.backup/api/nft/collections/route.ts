import { NFTCollection } from "@/types/blockchain"
import { NextResponse } from "next/server"

// Enhanced NFT collections data with realistic market fluctuations
// This simulates real-time price changes similar to the previous dashboard
function generateRealtimeData(): NFTCollection[] {
  const baseTime = Date.now()

  // Base collection data
  const baseCollections = [
    {
      address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      name: "Bored Ape Yacht Club",
      symbol: "BAYC",
      network: "ethereum",
      baseFloorPrice: 30.5,
      baseVolume: 1245,
      marketCap: 305000000,
      holders: 6452,
      totalSupply: 10000,
      verified: true,
      image: "https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?w=500&auto=format",
    },
    {
      address: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
      name: "CryptoPunks",
      symbol: "PUNK",
      network: "ethereum",
      baseFloorPrice: 54.2,
      baseVolume: 987,
      marketCap: 542000000,
      holders: 3562,
      totalSupply: 10000,
      verified: true,
      image: "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?w=500&auto=format",
    },
    {
      address: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
      name: "Mutant Ape Yacht Club",
      symbol: "MAYC",
      network: "ethereum",
      baseFloorPrice: 12.8,
      baseVolume: 654,
      marketCap: 128000000,
      holders: 12356,
      totalSupply: 20000,
      verified: true,
      image: "https://i.seadn.io/gae/lHexKRMpw-aoSyVKxSxKle8kZEJOPXYHQ2n2y0Jk8twdw1M6lJe4yKCTXy5mlKOyGHSc6E3LoNvxhCZ6nCYXwV8K_9N5K_HkJNE?w=500&auto=format",
    },
    {
      address: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
      name: "Azuki",
      symbol: "AZUKI",
      network: "ethereum",
      baseFloorPrice: 8.9,
      baseVolume: 425,
      marketCap: 89000000,
      holders: 4825,
      totalSupply: 10000,
      verified: true,
      image: "https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8ZyQUWQUDdE2CxQm5Xer1T2yvGe4DQGg?w=500&auto=format",
    },
    {
      address: "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e",
      name: "Doodles",
      symbol: "DOODLE",
      network: "ethereum",
      baseFloorPrice: 5.6,
      baseVolume: 320,
      marketCap: 56000000,
      holders: 4876,
      totalSupply: 10000,
      verified: true,
      image: "https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?w=500&auto=format",
    }
  ] as const

  // Generate realistic price fluctuations
  return baseCollections.map((collection, index) => {
    // Use deterministic but varying price changes based on time and collection
    const timeVariation = Math.sin((baseTime / 100000) + index) * 0.1
    const randomVariation = (Math.sin((baseTime / 50000) + index * 2) * 0.05)

    const priceChange = timeVariation + randomVariation
    const floorPrice = collection.baseFloorPrice * (1 + priceChange)
    const floorPriceChange24h = priceChange * 100

    const volumeVariation = Math.sin((baseTime / 80000) + index * 1.5) * 0.3
    const volume24h = collection.baseVolume * (1 + volumeVariation)
    const volumeChange24h = volumeVariation * 100

    const averagePrice = floorPrice * (1 + Math.abs(priceChange) * 0.1)
    const sales24h = Math.max(1, Math.floor(8 + Math.sin((baseTime / 60000) + index) * 6))

    return {
      address: collection.address,
      name: collection.name,
      symbol: collection.symbol,
      network: collection.network,
      floorPrice: Math.max(0.1, floorPrice),
      floorPriceChange24h,
      volume24h: Math.max(0, volume24h),
      volumeChange24h,
      averagePrice: Math.max(0.1, averagePrice),
      marketCap: collection.marketCap,
      holders: collection.holders,
      totalSupply: collection.totalSupply,
      sales24h,
      verified: collection.verified,
      socialMetrics: {
        twitter: `https://twitter.com/${collection.symbol.toLowerCase()}`,
        discord: `https://discord.gg/${collection.symbol.toLowerCase()}`,
        website: `https://www.${collection.symbol.toLowerCase()}.com`,
        followers: 80000 + index * 20000,
        engagement: 3200 + index * 1800,
      },
      image: collection.image,
    }
  })
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get("search")?.toLowerCase() || ""
  const type = searchParams.get("type") || "all"

  console.log('[NFT Collections API] Generating real-time NFT data...')

  // Generate real-time data
  const collections = generateRealtimeData()

  // Filter collections based on search query and type
  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = search
      ? collection.name.toLowerCase().includes(search) ||
      collection.symbol.toLowerCase().includes(search)
      : true

    const matchesType = type === "watchlist"
      ? false
      : true

    return matchesSearch && matchesType
  })

  console.log(`[NFT Collections API] Returning ${filteredCollections.length} collections`)

  return NextResponse.json(filteredCollections, {
    headers: {
      'Cache-Control': 'no-store', // Ensure fresh data for real-time updates
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  })
} 