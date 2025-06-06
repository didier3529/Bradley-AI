'use client';

// Stub account hook for components that reference it
// This will be removed when we clean up authentication dependencies in Phase 2

export function useAccount() {
  return {
    account: null,
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
  };
} 