'use client';

import { useEffect, useState, ReactNode } from 'react';

interface HydrationSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * HydrationSafe component prevents hydration mismatches by only rendering
 * children on the client side after the component has mounted.
 * 
 * Use this wrapper for components that:
 * - Access browser APIs (window, document, localStorage)
 * - Render different content based on client state
 * - Display real-time data that changes frequently
 * 
 * @param children - The content to render after hydration
 * @param fallback - Optional fallback content to show during SSR/initial render
 * @param className - Optional CSS classes for the wrapper
 */
export function HydrationSafe({ children, fallback = null, className }: HydrationSafeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and before mount, show fallback or nothing
  if (!mounted) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  // After mount, show the actual content
  return <div className={className}>{children}</div>;
}

/**
 * Hook to check if component is mounted (hydrated)
 * Useful for conditional rendering in components
 */
export function useHydration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
} 