"use client"

import { EnhancedBradleyAILoader } from '@/components/enhanced-loading/EnhancedBradleyAILoader'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useMarket } from '@/lib/hooks/use-market'
import { useNFT } from '@/lib/hooks/use-nft'
import { usePortfolio } from '@/lib/hooks/use-portfolio'
import { useContractContext } from '@/lib/providers/contract-provider'
import React, { useEffect, useState } from 'react'

interface LoadingContextType {
  isLoading: boolean
  loadingMessage: string
  useEnhancedLoader: boolean
  setUseEnhancedLoader: (use: boolean) => void
}

export const LoadingContext = React.createContext<LoadingContextType>({
  isLoading: false,
  loadingMessage: '',
  useEnhancedLoader: true,
  setUseEnhancedLoader: () => {}
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const { isLoading: portfolioLoading } = usePortfolio()
  const { isLoading: marketLoading } = useMarket()
  const { isLoading: contractLoading } = useContractContext()
  const { isLoading: nftLoading } = useNFT()

  const [useEnhancedLoader, setUseEnhancedLoader] = useState(true)
  const [showLoader, setShowLoader] = useState(false)

  const isLoading = portfolioLoading || marketLoading || contractLoading || nftLoading

  const loadingMessage = portfolioLoading ? 'Loading portfolio...' :
    marketLoading ? 'Loading market data...' :
    contractLoading ? 'Loading contracts...' :
    nftLoading ? 'Loading NFT data...' : ''

  // Show enhanced loader with a delay to allow for quick loads
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

  // Handle enhanced loader completion
  const handleLoaderComplete = () => {
    setShowLoader(false)
  }

  if (showLoader || isLoading) {
    // Use enhanced loader if enabled, otherwise fall back to simple loader
    if (useEnhancedLoader) {
      return (
        <EnhancedBradleyAILoader
          isVisible={showLoader}
          onComplete={handleLoaderComplete}
          enableAudio={false} // Disabled by default for user preference
          enableParticles={true}
          enableDigitalRain={true}
          performanceMode="auto"
        />
      )
    } else {
      return <LoadingScreen />
    }
  }

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      useEnhancedLoader,
      setUseEnhancedLoader
    }}>
      {children}
    </LoadingContext.Provider>
  )
}
