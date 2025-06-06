"use client"

import React from 'react'
import { usePortfolio } from '@/lib/hooks/use-portfolio'
import { useMarket } from '@/lib/hooks/use-market'
import { useContractContext } from '@/lib/providers/contract-provider'
import { useNFT } from '@/lib/hooks/use-nft'
import { LoadingScreen } from '@/components/ui/loading-screen'

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

  const isLoading = portfolioLoading || marketLoading || contractLoading || nftLoading

  const loadingMessage = portfolioLoading ? 'Loading portfolio...' :
    marketLoading ? 'Loading market data...' :
    contractLoading ? 'Loading contracts...' :
    nftLoading ? 'Loading NFT data...' : ''

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage }}>
      {children}
    </LoadingContext.Provider>
  )
} 