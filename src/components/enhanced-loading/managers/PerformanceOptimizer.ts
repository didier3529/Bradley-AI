/**
 * Performance Optimizer
 * Monitors frame rate and adapts quality settings to maintain
 * smooth 60fps experience across different devices
 */

export type PerformanceLevel = 'high' | 'medium' | 'low'

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage?: number
  cpuLoad?: number
  lastMeasurement: number
}

export interface QualitySettings {
  particleCount: number
  rainDensity: number
  enableBlur: boolean
  enableGlow: boolean
  enableShadows: boolean
  animationFrameRate: number
  renderDistance: number
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    lastMeasurement: 0
  }

  private frameCount = 0
  private lastTime = 0
  private frameTimes: number[] = []
  private isMonitoring = false
  private performanceLevel: PerformanceLevel = 'high'

  private readonly FPS_SAMPLES = 30
  private readonly TARGET_FPS = 60
  private readonly MIN_FPS = 30
  private readonly FRAME_TIME_THRESHOLD = 33.33 // 30fps in milliseconds

  private qualityLevels: Record<PerformanceLevel, QualitySettings> = {
    high: {
      particleCount: 150,
      rainDensity: 1.0,
      enableBlur: true,
      enableGlow: true,
      enableShadows: true,
      animationFrameRate: 60,
      renderDistance: 1.0
    },
    medium: {
      particleCount: 100,
      rainDensity: 0.7,
      enableBlur: true,
      enableGlow: false,
      enableShadows: false,
      animationFrameRate: 45,
      renderDistance: 0.8
    },
    low: {
      particleCount: 60,
      rainDensity: 0.4,
      enableBlur: false,
      enableGlow: false,
      enableShadows: false,
      animationFrameRate: 30,
      renderDistance: 0.6
    }
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastTime = performance.now()
    this.frameCount = 0
    this.frameTimes = []

    // Initial device capability detection
    this.detectDeviceCapabilities()
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    this.isMonitoring = false
  }

  /**
   * Record a frame for performance measurement
   */
  recordFrame(): void {
    if (!this.isMonitoring) return

    const currentTime = performance.now()
    const frameTime = currentTime - this.lastTime

    this.frameCount++
    this.frameTimes.push(frameTime)

    // Keep only recent samples
    if (this.frameTimes.length > this.FPS_SAMPLES) {
      this.frameTimes.shift()
    }

    // Update metrics every few frames
    if (this.frameCount % 10 === 0) {
      this.updateMetrics(currentTime)
      this.adaptQuality()
    }

    this.lastTime = currentTime
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(currentTime: number): void {
    if (this.frameTimes.length === 0) return

    // Calculate average frame time
    const avgFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length

    // Calculate FPS
    const fps = Math.min(this.TARGET_FPS, 1000 / avgFrameTime)

    this.metrics = {
      fps: Math.round(fps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
      lastMeasurement: currentTime
    }

    // Add memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
    }
  }

  /**
   * Adapt quality based on performance
   */
  private adaptQuality(): void {
    const { fps, frameTime } = this.metrics

    // Determine performance level based on metrics
    let newLevel: PerformanceLevel = this.performanceLevel

    if (fps < this.MIN_FPS || frameTime > this.FRAME_TIME_THRESHOLD) {
      // Performance is poor, reduce quality
      if (this.performanceLevel === 'high') {
        newLevel = 'medium'
      } else if (this.performanceLevel === 'medium') {
        newLevel = 'low'
      }
    } else if (fps >= this.TARGET_FPS * 0.9 && frameTime < 20) {
      // Performance is good, try to increase quality
      if (this.performanceLevel === 'low') {
        newLevel = 'medium'
      } else if (this.performanceLevel === 'medium' && fps >= this.TARGET_FPS) {
        newLevel = 'high'
      }
    }

    if (newLevel !== this.performanceLevel) {
      this.performanceLevel = newLevel
      console.log(`Performance level adjusted to: ${newLevel} (FPS: ${fps}, Frame time: ${frameTime}ms)`)
    }
  }

  /**
   * Detect device capabilities for initial quality setting
   */
  private detectDeviceCapabilities(): void {
    let initialLevel: PerformanceLevel = 'medium'

    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isMobile) {
      initialLevel = 'low'
    } else {
      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 4

      // Check device memory (if available)
      const memory = (navigator as any).deviceMemory || 4

      // Check GPU info (basic heuristic)
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'

        // High-end indicators
        if (cores >= 8 && memory >= 8 && renderer.toLowerCase().includes('nvidia')) {
          initialLevel = 'high'
        } else if (cores >= 4 && memory >= 4) {
          initialLevel = 'medium'
        } else {
          initialLevel = 'low'
        }
      }
    }

    this.performanceLevel = initialLevel
    console.log(`Initial performance level: ${initialLevel}`)
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.metrics.fps
  }

  /**
   * Get current frame time
   */
  getFrameTime(): number {
    return this.metrics.frameTime
  }

  /**
   * Get current performance level
   */
  getPerformanceLevel(): PerformanceLevel {
    return this.performanceLevel
  }

  /**
   * Get quality settings for current performance level
   */
  getQualitySettings(): QualitySettings {
    return { ...this.qualityLevels[this.performanceLevel] }
  }

  /**
   * Get quality settings for specific performance level
   */
  getQualitySettingsForLevel(level: PerformanceLevel): QualitySettings {
    return { ...this.qualityLevels[level] }
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    return this.metrics.fps >= this.MIN_FPS
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Force performance level (for testing or user preference)
   */
  forcePerformanceLevel(level: PerformanceLevel): void {
    this.performanceLevel = level
    console.log(`Performance level forced to: ${level}`)
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = []
    const { fps, frameTime, memoryUsage } = this.metrics

    if (fps < this.MIN_FPS) {
      recommendations.push('Consider reducing visual effects for better performance')
    }

    if (frameTime > this.FRAME_TIME_THRESHOLD) {
      recommendations.push('Frame rate is below optimal - some features may be disabled')
    }

    if (memoryUsage && memoryUsage > 100) {
      recommendations.push('High memory usage detected - consider refreshing the page')
    }

    if (this.performanceLevel === 'low') {
      recommendations.push('Performance mode: Low - Basic visual effects only')
    }

    return recommendations
  }

  /**
   * Get device performance score (0-100)
   */
  getDeviceScore(): number {
    const fpsScore = Math.min(100, (this.metrics.fps / this.TARGET_FPS) * 100)
    const frameTimeScore = Math.max(0, 100 - ((this.metrics.frameTime - 16.67) / 16.67) * 100)

    return Math.round((fpsScore + frameTimeScore) / 2)
  }

  /**
   * Check if reduced motion should be applied
   */
  shouldReduceMotion(): boolean {
    return this.performanceLevel === 'low' ||
           (typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }

  /**
   * Get adaptive settings based on current performance
   */
  getAdaptiveSettings() {
    const quality = this.getQualitySettings()
    const level = this.getPerformanceLevel()

    return {
      quality,
      level,
      fps: this.getFPS(),
      recommendations: this.getRecommendations(),
      score: this.getDeviceScore(),
      reduceMotion: this.shouldReduceMotion()
    }
  }
}

export default PerformanceOptimizer
