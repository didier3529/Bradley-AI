'use client'

import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useHydration } from './hydration-safe'

interface HydrationSafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  alt: string
  cacheBust?: boolean
  fallbackIcon?: React.ReactNode
  fallbackSrc?: string
  className?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

/**
 * HydrationSafeImage Component
 *
 * Implements Tier 2 architectural patterns for hydration-safe image loading
 * with deterministic fallback system and progressive enhancement.
 *
 * Features:
 * - Prevents hydration mismatches by deferring cache-busting to client-side
 * - Intelligent fallback system with multiple recovery options
 * - Progressive enhancement from static to cache-busted URLs
 * - SSR-safe with deterministic server rendering
 *
 * Usage:
 * <HydrationSafeImage
 *   src="/images/section-logos/logo.png"
 *   alt="Section Logo"
 *   cacheBust={true}
 *   fallbackIcon={<IconComponent />}
 *   fallbackSrc="/default-logo.png"
 * />
 */
export function HydrationSafeImage({
  src,
  alt,
  cacheBust = false,
  fallbackIcon,
  fallbackSrc,
  className,
  onError,
  ...props
}: HydrationSafeImageProps) {
  const [error, setError] = useState(false)
  const [cacheBustParam, setCacheBustParam] = useState('')
  const isHydrated = useHydration()

  // Client-side cache busting after hydration (Tier 1: Solution B)
  useEffect(() => {
    if (isHydrated && cacheBust) {
      setCacheBustParam(`?v=${Date.now()}`)
    }
  }, [isHydrated, cacheBust])

  // Deterministic source calculation (Tier 2: Pattern B)
  const finalSrc = useMemo(() => {
    if (error && fallbackSrc) return fallbackSrc
    if (error) return null // Use fallback icon
    if (!cacheBust) return src
    return `${src}${cacheBustParam}`
  }, [src, cacheBust, cacheBustParam, error, fallbackSrc])

  // Enhanced error handler
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true)
    onError?.(e)
  }

  // Fallback icon rendering
  if (error && fallbackIcon && !fallbackSrc) {
    return <div className={className}>{fallbackIcon}</div>
  }

  // Image rendering with hydration safety
  return finalSrc ? (
    <img
      src={finalSrc}
      alt={alt}
      className={cn(className)}
      onError={handleError}
      {...props}
    />
  ) : (
    // Fallback when no valid source available
    fallbackIcon ? <div className={className}>{fallbackIcon}</div> : null
  )
}

/**
 * Legacy Cache Buster (for migration purposes)
 * @deprecated Use HydrationSafeImage component instead
 */
export function useCacheBustParam() {
  const [cacheBustParam, setCacheBustParam] = useState('')
  const isHydrated = useHydration()

  useEffect(() => {
    if (isHydrated) {
      setCacheBustParam(`?v=${Date.now()}`)
    }
  }, [isHydrated])

  return cacheBustParam
}

/**
 * Build-time Cache Busting (Tier 1: Solution A)
 * For production environments where runtime cache-busting is not needed
 */
export const BUILD_TIMESTAMP = process.env.NEXT_PUBLIC_BUILD_TIME || '1.0.0'

export function getBuildTimeCacheBuster(src: string): string {
  return `${src}?v=${BUILD_TIMESTAMP}`
}

/**
 * Environment-aware Cache Strategy (Tier 3: Strategy C)
 * Different cache strategies for different environments
 */
export function getEnvironmentCacheBuster(src: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (isDevelopment) {
    // Development: Use timestamp for immediate updates
    return `${src}?dev=${Date.now()}`
  }
  // Production: Use build-time version
  return getBuildTimeCacheBuster(src)
}
