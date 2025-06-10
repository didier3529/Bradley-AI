'use client'

import {
    checkWalletConnection,
    connectWallet,
    ConnectWalletResult,
    disconnectWallet,
    getAvailableProviders,
    getWalletBalance,
    setupWalletEventListeners,
    WalletConnectionError,
    WalletProvider
} from '@/lib/blockchain/walletConnection'
import { useCallback, useEffect, useState } from 'react'

export interface WalletInfo {
  address: string
  chainId: number
  balance?: string
  provider: WalletProvider
  isConnected: boolean
}

export interface UseWalletReturn {
  // State
  wallet: WalletInfo | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null

  // Actions
  connect: (provider?: WalletProvider) => Promise<void>
  disconnect: () => void

  // Utils
  formatAddress: (address: string) => string
  getBalance: () => Promise<void>
  clearError: () => void

  // Provider info
  availableProviders: WalletProvider[]
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableProviders, setAvailableProviders] = useState<WalletProvider[]>([])

  // Format wallet address for display
  const formatAddress = useCallback((address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Connect wallet function
  const connect = useCallback(async (provider?: WalletProvider) => {
    console.log('🎯 useWallet.connect called with provider:', provider)

    if (isConnecting) {
      console.log('⚠️ Already connecting, ignoring request')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log('🚀 Calling connectWallet with provider:', provider)
      const result: ConnectWalletResult = await connectWallet(provider)
      console.log('✅ connectWallet returned:', result)

      // Get balance after connection
      let balance: string | undefined
      try {
        balance = await getWalletBalance(result.address)
      } catch (balanceError) {
        console.warn('Failed to fetch balance:', balanceError)
        // Don't fail the connection for balance fetch errors
      }

      const walletInfo: WalletInfo = {
        address: result.address,
        chainId: result.chainId,
        provider: result.provider,
        balance,
        isConnected: true
      }

      console.log('✅ Setting wallet info:', walletInfo)
      setWallet(walletInfo)

    } catch (err) {
      const walletError = err as WalletConnectionError
      console.log('❌ Wallet connection failed:', {
        error: walletError,
        message: walletError.message,
        code: walletError.code,
        provider: walletError.provider
      })

      let errorMessage = walletError.message

      // Provide user-friendly error messages
      switch (walletError.code) {
        case 'NO_PROVIDER':
          errorMessage = 'Please install MetaMask or Phantom to continue.'
          break
        case 'USER_REJECTED':
          errorMessage = 'Connection was cancelled. Please try again.'
          break
        case 'REQUEST_PENDING':
          errorMessage = 'Connection request is pending. Please check your wallet.'
          break
        case 'PROVIDER_NOT_AVAILABLE':
          errorMessage = `${walletError.provider || 'Wallet'} is not available. Please install it.`
          break
        default:
          errorMessage = walletError.message || 'Failed to connect wallet. Please try again.'
      }

      console.error('Wallet connection error:', walletError)
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
      console.log('🏁 useWallet.connect finished')
    }
  }, [isConnecting])

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    disconnectWallet()
    setWallet(null)
    setError(null)
    console.log('Wallet disconnected')
  }, [])

  // Get wallet balance function
  const getBalance = useCallback(async () => {
    if (!wallet || !wallet.address) return

    try {
      const balance = await getWalletBalance(wallet.address)
      setWallet(prev => prev ? { ...prev, balance } : null)
    } catch (err) {
      console.error('Failed to get balance:', err)
      // Don't set error for balance fetch failures as it's not critical
    }
  }, [wallet])

  // Check for existing connection and setup event listeners on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined

    const initializeWallet = async () => {
      try {
        // Check for existing connection
        const existingConnection = await checkWalletConnection()

        if (existingConnection) {
          // Get balance for existing connection
          let balance: string | undefined
          try {
            balance = await getWalletBalance(existingConnection.address)
          } catch (balanceError) {
            console.warn('Failed to fetch balance on reconnect:', balanceError)
          }

          setWallet({
            address: existingConnection.address,
            chainId: existingConnection.chainId,
            provider: existingConnection.provider,
            balance,
            isConnected: true
          })
        }

        // Setup event listeners for wallet changes
        cleanup = setupWalletEventListeners(
          // onAccountsChanged
          (accounts: string[]) => {
            if (accounts.length > 0) {
              const newAddress = accounts[0]
              setWallet(prev => prev ? { ...prev, address: newAddress } : null)

              // Refresh balance for new account
              getWalletBalance(newAddress).then(balance => {
                setWallet(prev => prev ? { ...prev, balance } : null)
              }).catch(err => {
                console.warn('Failed to fetch balance for new account:', err)
              })
            } else {
              // No accounts means disconnected
              setWallet(null)
              setError(null)
            }
          },
          // onChainChanged
          (chainId: string) => {
            const newChainId = parseInt(chainId, 16)
            setWallet(prev => prev ? { ...prev, chainId: newChainId } : null)
          },
          // onDisconnect
          () => {
            setWallet(null)
            setError(null)
          }
        )

      } catch (err) {
        console.error('Failed to initialize wallet:', err)
        // Clear any invalid stored state
        disconnectWallet()
      }
    }

    initializeWallet()

    // Cleanup function
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, []) // Empty dependency array - only run on mount

  // Update available providers on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const providers = getAvailableProviders()
      setAvailableProviders(providers)
      console.log('Available wallet providers:', providers)
    }
  }, [])

  // Compute isConnected from wallet state
  const isConnected = wallet?.isConnected ?? false

  return {
    // State
    wallet,
    isConnecting,
    isConnected,
    error,

    // Actions
    connect,
    disconnect,

    // Utils
    formatAddress,
    getBalance,
    clearError,

    // Provider info
    availableProviders
  }
}
