"use client"

import { LoadingScreen } from '@/components/ui/loading-screen'
import { useMarket } from '@/lib/hooks/use-market'
import { useNFT } from '@/lib/hooks/use-nft'
import { usePortfolio } from '@/lib/hooks/use-portfolio'
import { useContractContext } from '@/lib/providers/contract-provider'
import React, { useEffect, useState } from 'react'

interface LoadingContextType {
  isLoading: boolean
  loadingMessage: string
}

export const LoadingContext = React.createContext<LoadingContextType>({
  isLoading: false,
  loadingMessage: ''
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const { isLoading: portfolioLoading } = usePortfolio()
  const { isLoading: marketLoading } = useMarket()
  const { isLoading: contractLoading } = useContractContext()
  const { isLoading: nftLoading } = useNFT()

  const [showLoader, setShowLoader] = useState(false)

  const isLoading = portfolioLoading || marketLoading || contractLoading || nftLoading

  const loadingMessage = portfolioLoading ? 'Loading portfolio...' :
    marketLoading ? 'Loading market data...' :
    contractLoading ? 'Loading contracts...' :
    nftLoading ? 'Loading NFT data...' : ''

  // Show loader with a delay to avoid flashing for very quick loads
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoader(true)
      }, 100) // Small delay to avoid flashing for very quick loads

      return () => clearTimeout(timer)
    } else {
      setShowLoader(false)
    }
  }, [isLoading])

  if (showLoader || isLoading) {
    return <LoadingScreen />
  }

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingMessage
    }}>
      {children}
    </LoadingContext.Provider>
  )
}
