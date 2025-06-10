interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: any[] }) => Promise<any>;
    providers?: any[];
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  };

  // Phantom wallet Solana provider
  solana?: {
    isPhantom?: boolean;
    isConnected?: boolean;
    publicKey?: {
      toString(): string;
    };
    connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
    disconnect(): Promise<void>;
    on(event: string, callback: (...args: any[]) => void): void;
    request(args: { method: string; params?: any }): Promise<any>;
    readyState?: 'loading' | 'installed' | 'notDetected';
  };

  // Phantom wallet Ethereum provider (for Ethereum support in Phantom)
  phantom?: {
    solana?: {
      isPhantom?: boolean;
      isConnected?: boolean;
      publicKey?: {
        toString(): string;
      };
      connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      on(event: string, callback: (...args: any[]) => void): void;
      request(args: { method: string; params?: any }): Promise<any>;
    };
    ethereum?: {
      isPhantom?: boolean;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  };

  // Coinbase Wallet specific
  coinbaseWalletExtension?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };

  // Trust Wallet specific
  trustWallet?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}
