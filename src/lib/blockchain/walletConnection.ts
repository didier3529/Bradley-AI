// Enhanced wallet connection for Phantom and MetaMask
'use client'

export enum WalletProvider {
  METAMASK = 'metamask',
  PHANTOM = 'phantom'
}

export interface WalletInfo {
  address: string
  chainId: number
  provider: WalletProvider
  balance?: string
}

export interface ConnectWalletResult {
  address: string
  chainId: number
  provider: WalletProvider
}

export class WalletConnectionError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: WalletProvider
  ) {
    super(message)
    this.name = 'WalletConnectionError'
  }
}

// Enhanced MetaMask detection
function isMetaMaskAvailable(): boolean {
  if (typeof window === 'undefined') return false

  const ethereum = (window as any).ethereum

  // Direct MetaMask check
  if (ethereum?.isMetaMask) {
    console.log('MetaMask detected directly')
    return true
  }

  // Check providers array for MetaMask
  if (ethereum?.providers?.length > 0) {
    const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask)
    if (metaMaskProvider) {
      console.log('MetaMask detected in providers array')
      return true
    }
  }

  console.log('MetaMask not detected')
  return false
}

// Enhanced Phantom detection with retry logic
function isPhantomAvailable(): boolean {
  if (typeof window === 'undefined') return false

  const solana = (window as any).solana
  const phantom = (window as any).phantom

  console.log('Phantom detection debug:', {
    windowSolana: !!solana,
    solanIsPhantom: solana?.isPhantom,
    windowPhantom: !!phantom,
    phantomSolana: !!phantom?.solana,
    phantomSolanaIsPhantom: phantom?.solana?.isPhantom,
    phantomEthereum: !!phantom?.ethereum,
    phantomEthereumIsPhantom: phantom?.ethereum?.isPhantom
  })

  // Direct Solana provider check (most common)
  if (solana?.isPhantom) {
    console.log('✅ Phantom detected via window.solana')
    return true
  }

  // Alternative phantom object check
  if (phantom?.solana?.isPhantom) {
    console.log('✅ Phantom detected via window.phantom.solana')
    return true
  }

  // Check for Phantom's Ethereum provider
  if (phantom?.ethereum?.isPhantom) {
    console.log('✅ Phantom detected via window.phantom.ethereum')
    return true
  }

  console.log('❌ Phantom not detected')
  return false
}

// Wait for Phantom provider to be available
async function waitForPhantomProvider(maxAttempts = 10, delayMs = 500): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`🔍 Attempt ${i + 1}/${maxAttempts} to find Phantom provider...`)

    const solana = (window as any).solana
    const phantom = (window as any).phantom

    // Check direct solana provider
    if (solana?.isPhantom && typeof solana.connect === 'function') {
      console.log('✅ Found working Phantom provider via window.solana')
      return solana
    }

    // Check phantom.solana provider
    if (phantom?.solana?.isPhantom && typeof phantom.solana.connect === 'function') {
      console.log('✅ Found working Phantom provider via window.phantom.solana')
      return phantom.solana
    }

    // Wait before next attempt
    if (i < maxAttempts - 1) {
      console.log(`⏳ Waiting ${delayMs}ms before next attempt...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  console.log('❌ Failed to find Phantom provider after all attempts')
  return null
}

// Get available wallet providers with enhanced detection
export function getAvailableProviders(): WalletProvider[] {
  const providers: WalletProvider[] = []

  console.log('Checking available wallet providers...')

  if (isMetaMaskAvailable()) {
    providers.push(WalletProvider.METAMASK)
    console.log('✅ MetaMask is available')
  }

  if (isPhantomAvailable()) {
    providers.push(WalletProvider.PHANTOM)
    console.log('✅ Phantom is available')
  }

  console.log('Available providers:', providers)
  return providers
}

// Enhanced wallet connection
export async function connectWallet(provider?: WalletProvider): Promise<ConnectWalletResult> {
  if (typeof window === 'undefined') {
    throw new WalletConnectionError('Window not available (SSR environment)', 'NO_WINDOW')
  }

  console.log('Starting wallet connection...', { requestedProvider: provider })

  const availableProviders = getAvailableProviders()

  if (availableProviders.length === 0) {
    console.error('No wallet providers found')
    throw new WalletConnectionError(
      'No wallet providers found. Please install MetaMask or Phantom.',
      'NO_PROVIDER'
    )
  }

  // If no provider specified, use the first available
  if (!provider) {
    provider = availableProviders[0]
    console.log('No provider specified, using first available:', provider)
  }

  // Check if the requested provider is available
  if (!availableProviders.includes(provider)) {
    console.error('Requested provider not available:', provider)
    throw new WalletConnectionError(
      `${provider} wallet is not available. Please install it.`,
      'PROVIDER_NOT_AVAILABLE',
      provider
    )
  }

  try {
    console.log('Attempting to connect to:', provider)
    let result: ConnectWalletResult

    if (provider === WalletProvider.METAMASK) {
      result = await connectMetaMask()
    } else if (provider === WalletProvider.PHANTOM) {
      result = await connectPhantom()
    } else {
      throw new WalletConnectionError('Unsupported wallet provider', 'UNSUPPORTED_PROVIDER', provider)
    }

    console.log('Wallet connection successful:', result)

    // Store connection info
    localStorage.setItem('wallet_connected', 'true')
    localStorage.setItem('wallet_address', result.address)
    localStorage.setItem('wallet_provider', result.provider)
    localStorage.setItem('wallet_chain_id', result.chainId.toString())

    return result

  } catch (error: any) {
    console.error(`Error connecting to ${provider}:`, error)

    // Handle specific error codes
    if (error.code === 4001 || error.code === 'USER_REJECTED_REQUEST') {
      throw new WalletConnectionError(
        'User rejected wallet connection',
        'USER_REJECTED',
        provider
      )
    } else if (error.code === -32002) {
      throw new WalletConnectionError(
        'Wallet connection request is already pending. Please check your wallet.',
        'REQUEST_PENDING',
        provider
      )
    } else if (error instanceof WalletConnectionError) {
      throw error
    } else {
      throw new WalletConnectionError(
        error.message || 'Failed to connect wallet',
        'CONNECTION_FAILED',
        provider
      )
    }
  }
}

// Enhanced MetaMask connection
async function connectMetaMask(): Promise<ConnectWalletResult> {
  console.log('Connecting to MetaMask...')

  const ethereum = (window as any).ethereum
  let provider = ethereum

  // If multiple providers, find MetaMask specifically
  if (ethereum?.providers?.length > 0) {
    const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask)
    if (metaMaskProvider) {
      provider = metaMaskProvider
      console.log('Using MetaMask from providers array')
    }
  }

  if (!provider?.isMetaMask) {
    console.error('MetaMask provider not found')
    throw new WalletConnectionError(
      'MetaMask not found',
      'PROVIDER_NOT_FOUND',
      WalletProvider.METAMASK
    )
  }

  try {
    console.log('Requesting MetaMask accounts...')
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    })

    if (!accounts || accounts.length === 0) {
      throw new WalletConnectionError(
        'No accounts returned from MetaMask',
        'NO_ACCOUNTS',
        WalletProvider.METAMASK
      )
    }

    console.log('MetaMask accounts received:', accounts.length)

    const chainId = await provider.request({
      method: 'eth_chainId'
    })

    console.log('MetaMask chain ID:', chainId)

    return {
      address: accounts[0],
      chainId: parseInt(chainId, 16),
      provider: WalletProvider.METAMASK
    }
  } catch (error: any) {
    console.error('MetaMask connection error:', error)
    throw error
  }
}

// Enhanced Phantom connection
async function connectPhantom(): Promise<ConnectWalletResult> {
  console.log('🚀 Starting Phantom connection process...')

  try {
    // Check if Phantom is installed
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet is not installed. Please install it from https://phantom.app/')
    }

    const provider = window.solana

    console.log('✅ Phantom provider found:', {
      isPhantom: provider.isPhantom,
      isConnected: provider.isConnected,
      publicKey: provider.publicKey?.toString(),
      readyState: provider.readyState
    })

    // Check if already connected
    if (provider.isConnected && provider.publicKey) {
      console.log('✅ Phantom already connected')
      return {
        address: provider.publicKey.toString(),
        chainId: 0, // Solana doesn't use chainId like Ethereum
        provider: WalletProvider.PHANTOM
      }
    }

    console.log('🔄 Requesting Phantom connection...')

    // This should trigger the official Phantom popup
    const response = await provider.connect()

    console.log('✅ Phantom connection response:', response)

    // Handle different response structures
    let publicKey = null

    if (response && response.publicKey) {
      publicKey = response.publicKey
    } else if (provider.publicKey) {
      // Sometimes the publicKey is on the provider after connection
      publicKey = provider.publicKey
    }

    if (!publicKey || typeof publicKey.toString !== 'function') {
      console.error('❌ No valid publicKey found:', { response, providerPublicKey: provider.publicKey })
      throw new Error('Failed to get wallet address from Phantom. Please try again.')
    }

    const address = publicKey.toString()
    console.log('✅ Phantom connected successfully:', address)

    return {
      address: address,
      chainId: 0, // Solana doesn't use chainId like Ethereum
      provider: WalletProvider.PHANTOM
    }

  } catch (error: any) {
    console.error('❌ Phantom connection failed:', error)

    if (error.code === 4001 || error.message?.includes('User rejected')) {
      throw new WalletConnectionError(
        'Connection cancelled by user',
        'USER_REJECTED',
        WalletProvider.PHANTOM
      )
    }

    if (error.message?.includes('not installed')) {
      throw new WalletConnectionError(
        'Phantom wallet is not installed. Please install it from https://phantom.app/',
        'PROVIDER_NOT_FOUND',
        WalletProvider.PHANTOM
      )
    }

    throw new WalletConnectionError(
      error.message || 'Failed to connect to Phantom wallet',
      'CONNECTION_FAILED',
      WalletProvider.PHANTOM
    )
  }
}

// Disconnect wallet
export function disconnectWallet(): void {
  console.log('Disconnecting wallet...')

  // Clear stored connection info
  localStorage.removeItem('wallet_connected')
  localStorage.removeItem('wallet_address')
  localStorage.removeItem('wallet_provider')
  localStorage.removeItem('wallet_chain_id')

  console.log('Wallet disconnected and storage cleared')
}

// Check for existing wallet connection
export async function checkWalletConnection(): Promise<ConnectWalletResult | null> {
  if (typeof window === 'undefined') return null

  const stored = {
    connected: localStorage.getItem('wallet_connected'),
    address: localStorage.getItem('wallet_address'),
    provider: localStorage.getItem('wallet_provider') as WalletProvider,
    chainId: localStorage.getItem('wallet_chain_id')
  }

  console.log('Checking stored wallet connection:', stored)

  // Check if we have stored connection info
  if (!stored.connected || !stored.address || !stored.provider) {
    console.log('No stored wallet connection found')
    return null
  }

  try {
    // Verify the connection is still active
    if (stored.provider === WalletProvider.METAMASK) {
      const ethereum = (window as any).ethereum
      if (!ethereum?.isMetaMask) {
        console.log('MetaMask no longer available')
        disconnectWallet()
        return null
      }

      // Check if still connected
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (!accounts || accounts.length === 0 || accounts[0] !== stored.address) {
        console.log('MetaMask account changed or disconnected')
        disconnectWallet()
        return null
      }
    } else if (stored.provider === WalletProvider.PHANTOM) {
      const solana = (window as any).solana || (window as any).phantom?.solana
      if (!solana?.isPhantom) {
        console.log('Phantom no longer available')
        disconnectWallet()
        return null
      }

      // Check if still connected
      if (!solana.isConnected || !solana.publicKey) {
        console.log('Phantom disconnected')
        disconnectWallet()
        return null
      }

      const currentAddress = solana.publicKey.toString()
      if (currentAddress !== stored.address) {
        console.log('Phantom account changed')
        disconnectWallet()
        return null
      }
    }

    console.log('Existing wallet connection verified')
    return {
      address: stored.address,
      chainId: parseInt(stored.chainId || '0'),
      provider: stored.provider
    }

  } catch (error) {
    console.error('Error verifying wallet connection:', error)
    disconnectWallet()
    return null
  }
}

// Get wallet balance (placeholder - can be enhanced)
export async function getWalletBalance(address: string): Promise<string> {
  // This is a placeholder - you can implement actual balance fetching here
  return '0.0'
}

// Setup wallet event listeners
export function setupWalletEventListeners(
  onAccountsChanged?: (accounts: string[]) => void,
  onChainChanged?: (chainId: string) => void,
  onDisconnect?: () => void
): () => void {
  console.log('Setting up wallet event listeners...')

  const cleanupFunctions: (() => void)[] = []

  // MetaMask event listeners
  const ethereum = (window as any).ethereum
  if (ethereum?.on) {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('MetaMask accounts changed:', accounts)
      onAccountsChanged?.(accounts)
    }

    const handleChainChanged = (chainId: string) => {
      console.log('MetaMask chain changed:', chainId)
      onChainChanged?.(chainId)
    }

    const handleDisconnect = () => {
      console.log('MetaMask disconnected')
      onDisconnect?.()
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)
    ethereum.on('disconnect', handleDisconnect)

    cleanupFunctions.push(() => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged)
      ethereum.removeListener('chainChanged', handleChainChanged)
      ethereum.removeListener('disconnect', handleDisconnect)
    })
  }

  // Phantom event listeners
  const solana = (window as any).solana || (window as any).phantom?.solana
  if (solana?.on) {
    const handleConnect = () => {
      console.log('Phantom connected')
    }

    const handleDisconnect = () => {
      console.log('Phantom disconnected')
      onDisconnect?.()
    }

    const handleAccountChanged = (publicKey: any) => {
      console.log('Phantom account changed:', publicKey)
      if (publicKey) {
        onAccountsChanged?.([publicKey.toString()])
      } else {
        onAccountsChanged?.([])
      }
    }

    solana.on('connect', handleConnect)
    solana.on('disconnect', handleDisconnect)
    solana.on('accountChanged', handleAccountChanged)

    cleanupFunctions.push(() => {
      solana.removeListener('connect', handleConnect)
      solana.removeListener('disconnect', handleDisconnect)
      solana.removeListener('accountChanged', handleAccountChanged)
    })
  }

  // Return cleanup function
  return () => {
    console.log('Cleaning up wallet event listeners')
    cleanupFunctions.forEach(cleanup => cleanup())
  }
}
