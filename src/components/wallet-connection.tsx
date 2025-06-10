'use client'

import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { WalletProvider } from '@/lib/blockchain/walletConnection'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, ChevronDown, Loader2, Wallet } from 'lucide-react'
import { useState } from 'react'

interface WalletConnectionProps {
  compact?: boolean
  className?: string
}

export function WalletConnection({
  compact = false,
  className = ''
}: WalletConnectionProps) {
  const {
    wallet,
    isConnecting,
    isConnected,
    error,
    connect,
    disconnect,
    formatAddress,
    clearError,
    availableProviders
  } = useWallet()

  const [showProviders, setShowProviders] = useState(false)

  // Get provider display info
  const getProviderInfo = (provider: WalletProvider) => {
    switch (provider) {
      case WalletProvider.METAMASK:
        return { name: 'MetaMask', icon: '🦊', color: 'text-orange-400' }
      case WalletProvider.PHANTOM:
        return { name: 'Phantom', icon: '👻', color: 'text-purple-400' }
      default:
        return { name: provider, icon: '💼', color: 'text-gray-400' }
    }
  }

  // Handle provider selection
  const handleProviderConnect = async (provider: WalletProvider) => {
    console.log('User selected provider:', provider)
    setShowProviders(false)
    await connect(provider)
  }

  // Handle simple connect
  const handleSimpleConnect = async () => {
    console.log('Connect button clicked. Available providers:', availableProviders)

    if (availableProviders.length === 0) {
      console.error('No providers available when connect clicked')
      return
    }

    if (availableProviders.length > 1) {
      console.log('Multiple providers available, showing selection')
      setShowProviders(!showProviders)
    } else {
      console.log('Single provider available, connecting directly')
      await connect()
    }
  }

  // Render connected state
  if (isConnected && wallet) {
    const providerInfo = getProviderInfo(wallet.provider)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 ${className}`}
      >
        {!compact && (
          <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/30 rounded-md px-3 py-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-xs font-mono text-green-400 uppercase tracking-wider">
              Connected
            </span>
          </div>
        )}

        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={disconnect}
          className="font-mono bg-slate-800/60 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-200"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {compact ? (
            <span className="flex items-center gap-1">
              <span className="text-xs">{providerInfo.icon}</span>
              {formatAddress(wallet.address)}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>{providerInfo.icon}</span>
              {formatAddress(wallet.address)}
              {wallet.balance && <span className="text-xs opacity-75">({wallet.balance} ETH)</span>}
              <span className="opacity-50">•</span>
              <span className="text-xs">Disconnect</span>
            </span>
          )}
        </Button>
      </motion.div>
    )
  }

  // Render error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex flex-col items-center gap-2 ${className}`}
      >
        <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/30 rounded-md px-3 py-1">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-xs font-mono text-red-400">
            Connection Failed
          </span>
        </div>

        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => {
            clearError()
            handleSimpleConnect()
          }}
          className="font-mono bg-slate-800/60 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-all duration-200"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>

        {!compact && (
          <p className="text-xs text-red-400 text-center max-w-60">
            {error}
          </p>
        )}
      </motion.div>
    )
  }

  // Render connecting/default state
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${className}`}
    >
      {/* Provider unavailable warning */}
      {availableProviders.length === 0 && !compact && (
        <div className="mb-2 p-2 bg-yellow-400/10 border border-yellow-400/30 rounded-md">
          <div className="flex items-center gap-2 text-yellow-400 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>No wallets detected. Please install MetaMask or Phantom.</span>
          </div>
        </div>
      )}

      {/* Main connect button */}
      <Button
        onClick={handleSimpleConnect}
        disabled={isConnecting || availableProviders.length === 0}
        size={compact ? "sm" : "default"}
        className={`font-mono min-w-[140px] transition-all duration-300 ${
          isConnecting
            ? "bg-cyan-400/20 border-cyan-400/40 text-cyan-400"
            : availableProviders.length === 0
            ? "bg-gray-600/20 border-gray-600/40 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-600/30 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
        }`}
        variant="outline"
      >
        {isConnecting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {compact ? "Connecting..." : "Connecting Wallet..."}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {compact ? "Connect" :
             availableProviders.length === 0 ? "Install Wallet" : "Connect Wallet"}
            {availableProviders.length > 1 && (
              <ChevronDown className={`h-3 w-3 transition-transform ${showProviders ? 'rotate-180' : ''}`} />
            )}
          </span>
        )}
      </Button>

      {/* Provider selection dropdown */}
      {showProviders && availableProviders.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute top-full mt-2 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-md shadow-lg z-50"
        >
          <div className="p-2 space-y-1">
            {availableProviders.map((provider) => {
              const providerInfo = getProviderInfo(provider)
              return (
                <button
                  key={provider}
                  onClick={() => handleProviderConnect(provider)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-mono transition-colors
                    hover:bg-slate-800/60 ${providerInfo.color} hover:${providerInfo.color}/80
                    flex items-center gap-2`}
                >
                  <span className="text-base">{providerInfo.icon}</span>
                  <span>{providerInfo.name}</span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Click outside to close dropdown */}
      {showProviders && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProviders(false)}
        />
      )}
    </motion.div>
  )
}
