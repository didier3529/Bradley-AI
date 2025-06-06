/**
 * Matrix Performance Manager
 * Handles FPS monitoring, device capabilities, and automatic quality adjustments
 */

export interface DeviceCapabilities {
  isHighEnd: boolean;
  isMobile: boolean;
  isTablet: boolean;
  hasHighRefreshRate: boolean;
  hasHardwareAcceleration: boolean;
  memoryGigabytes: number;
  cpuCores: number;
  supportsWebGL2: boolean;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  frameTimes: number[];
  memoryUsage: number;
  gpuMemoryUsage?: number;
  dropped60fpsFrames: number;
  averageFrameTime: number;
  qualityLevel: number;
}

export interface QualitySettings {
  particleCount: number;
  textureResolution: number;
  shadowQuality: 'none' | 'low' | 'medium' | 'high';
  postProcessing: boolean;
  antialiasing: boolean;
  bloomEffect: boolean;
  animationSmoothing: number;
}

export class MatrixPerformanceManager {
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private frameTimes: number[] = [];
  private fps = 60;
  private memoryUsage = 0;
  private qualityLevel = 1.0;
  private isMonitoring = false;
  private rafId?: number;
  
  private deviceCapabilities: DeviceCapabilities;
  private qualitySettings: QualitySettings;
  
  // Performance thresholds
  private readonly TARGET_FPS = 60;
  private readonly MIN_FPS = 30;
  private readonly MEMORY_LIMIT_MB = 150;
  private readonly FRAME_TIME_SAMPLES = 60;
  
  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.qualitySettings = this.getInitialQualitySettings();
  }
  
  /**
   * Detect device capabilities for optimal configuration
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    // SSR safety check - return default capabilities on server
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return {
        isHighEnd: false,
        isMobile: false,
        isTablet: false,
        hasHighRefreshRate: false,
        hasHardwareAcceleration: false,
        memoryGigabytes: 4,
        cpuCores: 4,
        supportsWebGL2: false,
        batteryLevel: undefined,
        isLowPowerMode: false,
      };
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    // Hardware detection
    const cpuCores = navigator.hardwareConcurrency || 4;
    const memoryGigabytes = (navigator as any).deviceMemory || 4;
    
    // Mobile detection
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth < 768;
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // High-end device detection
    const isHighEnd = cpuCores >= 8 && memoryGigabytes >= 8 && !isMobile;
    
    // Refresh rate detection
    const hasHighRefreshRate = window.screen && (window.screen as any).refreshRate > 60;
    
    // WebGL capabilities
    const supportsWebGL2 = !!canvas.getContext('webgl2');
    let hasHardwareAcceleration = false;
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        hasHardwareAcceleration = !renderer.includes('SwiftShader') && !renderer.includes('Software');
      }
    }
    
    // Battery API (if available)
    let batteryLevel: number | undefined;
    let isLowPowerMode: boolean | undefined;
    
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryLevel = battery.level;
        isLowPowerMode = battery.level < 0.2;
      });
    }
    
    return {
      isHighEnd,
      isMobile,
      isTablet,
      hasHighRefreshRate,
      hasHardwareAcceleration,
      memoryGigabytes,
      cpuCores,
      supportsWebGL2,
      batteryLevel,
      isLowPowerMode,
    };
  }
  
  /**
   * Get initial quality settings based on device capabilities
   */
  private getInitialQualitySettings(): QualitySettings {
    const { isHighEnd, isMobile, hasHardwareAcceleration, cpuCores } = this.deviceCapabilities;
    
    if (isHighEnd && hasHardwareAcceleration) {
      return {
        particleCount: 120,
        textureResolution: 1024,
        shadowQuality: 'high',
        postProcessing: true,
        antialiasing: true,
        bloomEffect: true,
        animationSmoothing: 1.0,
      };
    }
    
    if (!isMobile && cpuCores >= 4) {
      return {
        particleCount: 80,
        textureResolution: 512,
        shadowQuality: 'medium',
        postProcessing: true,
        antialiasing: false,
        bloomEffect: true,
        animationSmoothing: 0.8,
      };
    }
    
    if (isMobile) {
      return {
        particleCount: 40,
        textureResolution: 256,
        shadowQuality: 'low',
        postProcessing: false,
        antialiasing: false,
        bloomEffect: false,
        animationSmoothing: 0.6,
      };
    }
    
    // Default fallback
    return {
      particleCount: 60,
      textureResolution: 512,
      shadowQuality: 'medium',
      postProcessing: false,
      antialiasing: false,
      bloomEffect: false,
      animationSmoothing: 0.7,
    };
  }
  
  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringLoop();
  }
  
  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }
  
  /**
   * Main monitoring loop
   */
  private monitoringLoop = (): void => {
    if (!this.isMonitoring) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    // Update frame metrics
    this.frameCount++;
    this.frameTimes.push(deltaTime);
    
    // Keep only recent samples
    if (this.frameTimes.length > this.FRAME_TIME_SAMPLES) {
      this.frameTimes.shift();
    }
    
    // Calculate FPS every second
    if (currentTime - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
      
      // Update memory usage
      this.updateMemoryUsage();
      
      // Adjust quality based on performance
      this.adjustQuality();
    }
    
    this.rafId = requestAnimationFrame(this.monitoringLoop);
  };
  
  /**
   * Update memory usage metrics
   */
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
  }
  
  /**
   * Adjust quality settings based on current performance
   */
  private adjustQuality(): void {
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const currentFPS = 1000 / avgFrameTime;
    
    // Quality adjustment logic
    if (currentFPS < this.MIN_FPS || this.memoryUsage > this.MEMORY_LIMIT_MB) {
      // Decrease quality
      this.qualityLevel = Math.max(0.2, this.qualityLevel - 0.1);
      this.reduceQuality();
    } else if (currentFPS > this.TARGET_FPS * 1.1 && this.memoryUsage < this.MEMORY_LIMIT_MB * 0.8) {
      // Increase quality
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
      this.increaseQuality();
    }
    
    // Battery-aware adjustments
    if (this.deviceCapabilities.isLowPowerMode) {
      this.qualityLevel = Math.min(this.qualityLevel, 0.5);
    }
  }
  
  /**
   * Reduce quality settings for better performance
   */
  private reduceQuality(): void {
    const settings = this.qualitySettings;
    
    if (settings.particleCount > 20) {
      settings.particleCount = Math.max(20, Math.floor(settings.particleCount * 0.8));
    }
    
    if (settings.textureResolution > 128) {
      settings.textureResolution = Math.max(128, settings.textureResolution / 2);
    }
    
    if (settings.postProcessing) {
      settings.postProcessing = false;
    }
    
    if (settings.bloomEffect) {
      settings.bloomEffect = false;
    }
    
    if (settings.shadowQuality !== 'none') {
      const qualities = ['high', 'medium', 'low', 'none'];
      const currentIndex = qualities.indexOf(settings.shadowQuality);
      if (currentIndex < qualities.length - 1) {
        settings.shadowQuality = qualities[currentIndex + 1] as any;
      }
    }
  }
  
  /**
   * Increase quality settings when performance allows
   */
  private increaseQuality(): void {
    const settings = this.qualitySettings;
    const maxSettings = this.getInitialQualitySettings();
    
    if (settings.particleCount < maxSettings.particleCount) {
      settings.particleCount = Math.min(maxSettings.particleCount, Math.floor(settings.particleCount * 1.1));
    }
    
    if (settings.textureResolution < maxSettings.textureResolution) {
      settings.textureResolution = Math.min(maxSettings.textureResolution, settings.textureResolution * 2);
    }
    
    if (!settings.postProcessing && maxSettings.postProcessing) {
      settings.postProcessing = true;
    }
    
    if (!settings.bloomEffect && maxSettings.bloomEffect) {
      settings.bloomEffect = true;
    }
    
    if (settings.shadowQuality !== maxSettings.shadowQuality) {
      const qualities = ['none', 'low', 'medium', 'high'];
      const currentIndex = qualities.indexOf(settings.shadowQuality);
      const maxIndex = qualities.indexOf(maxSettings.shadowQuality);
      if (currentIndex < maxIndex) {
        settings.shadowQuality = qualities[currentIndex + 1] as any;
      }
    }
  }
  
  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const avgFrameTime = this.frameTimes.length > 0 
      ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length 
      : 16.67;
    
    const dropped60fpsFrames = this.frameTimes.filter(time => time > 16.67).length;
    
    return {
      fps: this.fps,
      frameTimes: [...this.frameTimes],
      memoryUsage: this.memoryUsage,
      dropped60fpsFrames,
      averageFrameTime: avgFrameTime,
      qualityLevel: this.qualityLevel,
    };
  }
  
  /**
   * Get current quality settings
   */
  public getQualitySettings(): QualitySettings {
    return { ...this.qualitySettings };
  }
  
  /**
   * Get device capabilities
   */
  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }
  
  /**
   * Force quality level (for user preferences)
   */
  public setQualityLevel(level: number): void {
    this.qualityLevel = Math.max(0.1, Math.min(1.0, level));
    
    // Recalculate settings based on forced level
    const baseSettings = this.getInitialQualitySettings();
    this.qualitySettings = {
      particleCount: Math.floor(baseSettings.particleCount * this.qualityLevel),
      textureResolution: Math.floor(baseSettings.textureResolution * this.qualityLevel),
      shadowQuality: this.qualityLevel > 0.8 ? 'high' : 
                     this.qualityLevel > 0.6 ? 'medium' : 
                     this.qualityLevel > 0.3 ? 'low' : 'none',
      postProcessing: this.qualityLevel > 0.5 && baseSettings.postProcessing,
      antialiasing: this.qualityLevel > 0.7 && baseSettings.antialiasing,
      bloomEffect: this.qualityLevel > 0.6 && baseSettings.bloomEffect,
      animationSmoothing: baseSettings.animationSmoothing * this.qualityLevel,
    };
  }
  
  /**
   * Check if device is suitable for Matrix effects
   */
  public isDeviceSuitable(): boolean {
    return this.deviceCapabilities.hasHardwareAcceleration && 
           this.deviceCapabilities.cpuCores >= 2 &&
           !this.deviceCapabilities.isLowPowerMode;
  }
  
  /**
   * Get recommended settings for specific effect types
   */
  public getEffectSettings(effectType: 'rain' | 'particles' | 'glow' | 'transitions') {
    const baseQuality = this.qualityLevel;
    
    switch (effectType) {
      case 'rain':
        return {
          dropCount: Math.floor(this.qualitySettings.particleCount * 0.8),
          updateFrequency: baseQuality > 0.7 ? 60 : baseQuality > 0.5 ? 30 : 15,
          glowEnabled: this.qualitySettings.bloomEffect,
        };
        
      case 'particles':
        return {
          maxParticles: this.qualitySettings.particleCount,
          physicsEnabled: baseQuality > 0.6,
          collisionDetection: baseQuality > 0.8,
        };
        
      case 'glow':
        return {
          enabled: this.qualitySettings.bloomEffect,
          intensity: baseQuality,
          blurPasses: baseQuality > 0.7 ? 3 : baseQuality > 0.5 ? 2 : 1,
        };
        
      case 'transitions':
        return {
          duration: baseQuality > 0.5 ? 300 : 150,
          easing: baseQuality > 0.7 ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'ease',
          animateOpacity: baseQuality > 0.3,
          animateTransform: baseQuality > 0.5,
        };
        
      default:
        return {};
    }
  }
  
  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.stopMonitoring();
    this.frameTimes = [];
  }
}

// Singleton instance
export const matrixPerformanceManager = new MatrixPerformanceManager(); 