// Matrix Performance Monitor - June 2025
// PHASE-0: Matrix Digital Rain Foundation

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  gpuMemory?: number;
  dropCount: number;
  timestamp: number;
}

export interface PerformanceSettings {
  targetFPS: number;
  maxDropCount: number;
  adaptiveQuality: boolean;
  enableGPUAcceleration: boolean;
}

export class MatrixPerformanceMonitor {
  private static instance: MatrixPerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private frameTimeHistory: number[] = [];
  private currentFPS = 0;
  private settings: PerformanceSettings;
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];
  
  private constructor() {
    this.settings = {
      targetFPS: 60,
      maxDropCount: 100,
      adaptiveQuality: true,
      enableGPUAcceleration: true,
    };
  }
  
  public static getInstance(): MatrixPerformanceMonitor {
    if (!MatrixPerformanceMonitor.instance) {
      MatrixPerformanceMonitor.instance = new MatrixPerformanceMonitor();
    }
    return MatrixPerformanceMonitor.instance;
  }
  
  public updateSettings(newSettings: Partial<PerformanceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
  
  public getSettings(): PerformanceSettings {
    return { ...this.settings };
  }
  
  public startFrame(): number {
    return performance.now();
  }
  
  public endFrame(startTime: number, dropCount: number): PerformanceMetrics {
    const currentTime = performance.now();
    const frameTime = currentTime - startTime;
    
    // Update frame time history
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }
    
    // Calculate FPS
    this.frameCount++;
    if (currentTime - this.lastTime >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    const metrics: PerformanceMetrics = {
      fps: this.currentFPS,
      frameTime,
      dropCount,
      timestamp: currentTime,
    };
    
    // Add memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    // Notify callbacks
    this.callbacks.forEach(callback => callback(metrics));
    
    return metrics;
  }
  
  public getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 0;
    return this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;
  }
  
  public getCurrentFPS(): number {
    return this.currentFPS;
  }
  
  public isPerformanceGood(): boolean {
    return this.currentFPS >= this.settings.targetFPS * 0.9; // 90% of target
  }
  
  public getRecommendedDropCount(currentDropCount: number): number {
    if (!this.settings.adaptiveQuality) {
      return currentDropCount;
    }
    
    const avgFrameTime = this.getAverageFrameTime();
    const targetFrameTime = 1000 / this.settings.targetFPS;
    
    if (avgFrameTime > targetFrameTime * 1.2) {
      // Performance is poor, reduce drops
      return Math.max(10, Math.floor(currentDropCount * 0.8));
    } else if (avgFrameTime < targetFrameTime * 0.8 && currentDropCount < this.settings.maxDropCount) {
      // Performance is good, can increase drops
      return Math.min(this.settings.maxDropCount, Math.floor(currentDropCount * 1.1));
    }
    
    return currentDropCount;
  }
  
  public getDeviceCapabilities(): {
    isHighEnd: boolean;
    isMobile: boolean;
    supportsGPUAcceleration: boolean;
    recommendedDropCount: number;
  } {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return {
        isHighEnd: false,
        isMobile: false,
        supportsGPUAcceleration: false,
        recommendedDropCount: 30,
      };
    }
    
    const isHighEnd = (navigator.hardwareConcurrency || 4) >= 8;
    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for GPU acceleration support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const supportsGPUAcceleration = !!gl;
    
    let recommendedDropCount: number;
    if (isMobile) {
      recommendedDropCount = isHighEnd ? 40 : 25;
    } else {
      recommendedDropCount = isHighEnd ? 80 : 50;
    }
    
    return {
      isHighEnd,
      isMobile,
      supportsGPUAcceleration,
      recommendedDropCount,
    };
  }
  
  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
  
  public getPerformanceReport(): {
    averageFPS: number;
    averageFrameTime: number;
    minFPS: number;
    maxFPS: number;
    performanceGrade: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const avgFrameTime = this.getAverageFrameTime();
    const avgFPS = this.currentFPS;
    
    // Simple performance grading
    let performanceGrade: 'excellent' | 'good' | 'fair' | 'poor';
    if (avgFPS >= this.settings.targetFPS * 0.95) {
      performanceGrade = 'excellent';
    } else if (avgFPS >= this.settings.targetFPS * 0.8) {
      performanceGrade = 'good';
    } else if (avgFPS >= this.settings.targetFPS * 0.6) {
      performanceGrade = 'fair';
    } else {
      performanceGrade = 'poor';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (avgFPS < this.settings.targetFPS * 0.9) {
      recommendations.push('Consider reducing rain intensity');
      recommendations.push('Disable glow effects for better performance');
    }
    
    const capabilities = this.getDeviceCapabilities();
    if (capabilities.isMobile) {
      recommendations.push('Mobile device detected - using optimized settings');
    }
    
    if (!capabilities.supportsGPUAcceleration) {
      recommendations.push('GPU acceleration not available - performance may be limited');
    }
    
    return {
      averageFPS: avgFPS,
      averageFrameTime: avgFrameTime,
      minFPS: avgFPS, // Simplified for now
      maxFPS: avgFPS, // Simplified for now
      performanceGrade,
      recommendations,
    };
  }
  
  public reset(): void {
    this.frameCount = 0;
    this.lastTime = 0;
    this.frameTimeHistory = [];
    this.currentFPS = 0;
  }
}

// Export singleton instance
export const matrixPerformanceMonitor = MatrixPerformanceMonitor.getInstance();

// Utility functions
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const startTime = matrixPerformanceMonitor.startFrame();
    const result = fn(...args);
    
    // If it's a promise, monitor async completion
    if (result instanceof Promise) {
      return result.finally(() => {
        matrixPerformanceMonitor.endFrame(startTime, 0);
      });
    }
    
    matrixPerformanceMonitor.endFrame(startTime, 0);
    return result;
  }) as T;
}

export function getOptimalMatrixSettings(): {
  intensity: 'low' | 'medium' | 'high' | 'ultra';
  enableGlow: boolean;
  enableFlicker: boolean;
  dropCount: number;
} {
  const capabilities = matrixPerformanceMonitor.getDeviceCapabilities();
  const isGoodPerformance = matrixPerformanceMonitor.isPerformanceGood();
  
  if (capabilities.isMobile) {
    return {
      intensity: capabilities.isHighEnd ? 'medium' : 'low',
      enableGlow: capabilities.isHighEnd && isGoodPerformance,
      enableFlicker: isGoodPerformance,
      dropCount: capabilities.recommendedDropCount,
    };
  }
  
  if (capabilities.isHighEnd && isGoodPerformance) {
    return {
      intensity: 'ultra',
      enableGlow: true,
      enableFlicker: true,
      dropCount: capabilities.recommendedDropCount,
    };
  }
  
  return {
    intensity: isGoodPerformance ? 'high' : 'medium',
    enableGlow: isGoodPerformance,
    enableFlicker: isGoodPerformance,
    dropCount: capabilities.recommendedDropCount,
  };
} 