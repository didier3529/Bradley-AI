'use client';

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useRef, 
  useCallback,
  ReactNode 
} from 'react';
import { matrixPerformanceManager, PerformanceMetrics, QualitySettings } from '@/lib/matrix/performance-manager';
import { matrixDesignSystem } from '@/styles/design-tokens';
import MatrixRainWebGL from './matrix-rain-webgl';

// Matrix Effect Types
export type MatrixEffectType = 'rain' | 'glitch' | 'glow' | 'pulse' | 'transition';
export type MatrixTheme = 'matrix-green' | 'cyber-blue' | 'mixed' | 'adaptive';
export type MatrixIntensity = 'low' | 'medium' | 'high' | 'ultra' | 'adaptive';

// Data-driven effect configuration
export interface MatrixDataState {
  isLoading: boolean;
  hasData: boolean;
  dataAge: number; // milliseconds since last update
  errorState: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  updateCount: number;
}

// Effect configuration interfaces
export interface MatrixEffectConfig {
  enabled: boolean;
  intensity: MatrixIntensity;
  theme: MatrixTheme;
  interactive: boolean;
  adaptToData: boolean;
  backgroundOnly: boolean;
}

export interface MatrixTransitionConfig {
  duration: number;
  easing: string;
  glitchOnChange: boolean;
  pulseOnUpdate: boolean;
  fadeOnError: boolean;
}

export interface MatrixContextType {
  // State
  effectConfig: MatrixEffectConfig;
  transitionConfig: MatrixTransitionConfig;
  dataState: MatrixDataState;
  performanceMetrics: PerformanceMetrics | null;
  qualitySettings: QualitySettings | null;
  isEffectsEnabled: boolean;
  currentTheme: MatrixTheme;
  
  // Actions
  updateEffectConfig: (config: Partial<MatrixEffectConfig>) => void;
  updateTransitionConfig: (config: Partial<MatrixTransitionConfig>) => void;
  updateDataState: (state: Partial<MatrixDataState>) => void;
  triggerEffect: (type: MatrixEffectType, options?: any) => void;
  setQualityLevel: (level: number) => void;
  
  // Effect control methods
  startEffect: (type: MatrixEffectType) => void;
  stopEffect: (type: MatrixEffectType) => void;
  pauseAllEffects: () => void;
  resumeAllEffects: () => void;
}

// Default configurations
const defaultEffectConfig: MatrixEffectConfig = {
  enabled: true,
  intensity: 'adaptive',
  theme: 'mixed',
  interactive: true,
  adaptToData: true,
  backgroundOnly: false,
};

const defaultTransitionConfig: MatrixTransitionConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  glitchOnChange: true,
  pulseOnUpdate: true,
  fadeOnError: true,
};

const defaultDataState: MatrixDataState = {
  isLoading: false,
  hasData: true,
  dataAge: 0,
  errorState: false,
  connectionQuality: 'excellent',
  updateCount: 0,
};

// Create context
const MatrixEffectsContext = createContext<MatrixContextType | null>(null);

// Custom hook for using Matrix effects
export function useMatrixEffects(): MatrixContextType {
  const context = useContext(MatrixEffectsContext);
  if (!context) {
    throw new Error('useMatrixEffects must be used within a MatrixEffectsProvider');
  }
  return context;
}

// Effect event emitter for coordinating effects across components
class MatrixEffectEmitter extends EventTarget {
  triggerEffect(type: MatrixEffectType, options: any = {}) {
    this.dispatchEvent(new CustomEvent(`matrix:${type}`, { detail: options }));
  }
  
  onEffect(type: MatrixEffectType, handler: (event: CustomEvent) => void) {
    this.addEventListener(`matrix:${type}`, handler as EventListener);
    return () => this.removeEventListener(`matrix:${type}`, handler as EventListener);
  }
}

const matrixEffectEmitter = new MatrixEffectEmitter();

// Provider component
interface MatrixEffectsProviderProps {
  children: ReactNode;
  initialConfig?: Partial<MatrixEffectConfig>;
  enablePerformanceMonitoring?: boolean;
}

export function MatrixEffectsProvider({ 
  children, 
  initialConfig = {},
  enablePerformanceMonitoring = true
}: MatrixEffectsProviderProps) {
  // State management
  const [effectConfig, setEffectConfig] = useState<MatrixEffectConfig>({
    ...defaultEffectConfig,
    ...initialConfig,
  });
  
  const [transitionConfig, setTransitionConfig] = useState<MatrixTransitionConfig>(defaultTransitionConfig);
  const [dataState, setDataState] = useState<MatrixDataState>(defaultDataState);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [qualitySettings, setQualitySettings] = useState<QualitySettings | null>(null);
  const [isEffectsEnabled, setIsEffectsEnabled] = useState(true);
  
  // Effect management refs
  const activeEffects = useRef<Set<MatrixEffectType>>(new Set());
  const effectTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;
    
    matrixPerformanceManager.startMonitoring();
    
    const interval = setInterval(() => {
      const metrics = matrixPerformanceManager.getMetrics();
      const quality = matrixPerformanceManager.getQualitySettings();
      
      setPerformanceMetrics(metrics);
      setQualitySettings(quality);
      
      // Auto-disable effects if performance is poor
      if (metrics.fps < 20 && isEffectsEnabled) {
        setIsEffectsEnabled(false);
        console.warn('Matrix effects disabled due to poor performance');
      } else if (metrics.fps > 45 && !isEffectsEnabled) {
        setIsEffectsEnabled(true);
        console.log('Matrix effects re-enabled - performance improved');
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      matrixPerformanceManager.stopMonitoring();
    };
  }, [enablePerformanceMonitoring, isEffectsEnabled]);
  
  // Adaptive theme calculation based on data state
  const currentTheme: MatrixTheme = React.useMemo(() => {
    if (effectConfig.theme !== 'adaptive') {
      return effectConfig.theme;
    }
    
    // Adaptive theme logic based on data state
    if (dataState.errorState) {
      return 'matrix-green'; // Classic Matrix for errors
    }
    
    if (dataState.connectionQuality === 'excellent') {
      return 'cyber-blue'; // Blue for good connection
    }
    
    if (dataState.isLoading) {
      return 'mixed'; // Mixed for loading states
    }
    
    return 'mixed'; // Default mixed theme
  }, [effectConfig.theme, dataState]);
  
  // Action handlers
  const updateEffectConfig = useCallback((config: Partial<MatrixEffectConfig>) => {
    setEffectConfig(prev => ({ ...prev, ...config }));
  }, []);
  
  const updateTransitionConfig = useCallback((config: Partial<MatrixTransitionConfig>) => {
    setTransitionConfig(prev => ({ ...prev, ...config }));
  }, []);
  
  const updateDataState = useCallback((state: Partial<MatrixDataState>) => {
    setDataState(prev => {
      const newState = { ...prev, ...state };
      
      // Trigger effects based on data changes
      if (effectConfig.adaptToData && effectConfig.enabled) {
        // Pulse on data update
        if (state.updateCount !== undefined && transitionConfig.pulseOnUpdate) {
          matrixEffectEmitter.triggerEffect('pulse', { intensity: 0.8, duration: 200 });
        }
        
        // Glitch on error
        if (state.errorState && !prev.errorState && transitionConfig.fadeOnError) {
          matrixEffectEmitter.triggerEffect('glitch', { intensity: 1.0, duration: 500 });
        }
        
        // Glow on connection quality change
        if (state.connectionQuality !== prev.connectionQuality) {
          const glowIntensity = state.connectionQuality === 'excellent' ? 1.2 : 
                               state.connectionQuality === 'good' ? 0.8 : 
                               state.connectionQuality === 'poor' ? 0.4 : 0.2;
          matrixEffectEmitter.triggerEffect('glow', { intensity: glowIntensity });
        }
      }
      
      return newState;
    });
  }, [effectConfig.adaptToData, effectConfig.enabled, transitionConfig]);
  
  const triggerEffect = useCallback((type: MatrixEffectType, options: any = {}) => {
    if (!effectConfig.enabled || !isEffectsEnabled) return;
    
    matrixEffectEmitter.triggerEffect(type, options);
  }, [effectConfig.enabled, isEffectsEnabled]);
  
  const setQualityLevel = useCallback((level: number) => {
    matrixPerformanceManager.setQualityLevel(level);
    const newQuality = matrixPerformanceManager.getQualitySettings();
    setQualitySettings(newQuality);
  }, []);
  
  const startEffect = useCallback((type: MatrixEffectType) => {
    activeEffects.current.add(type);
    triggerEffect(type, { action: 'start' });
  }, [triggerEffect]);
  
  const stopEffect = useCallback((type: MatrixEffectType) => {
    activeEffects.current.delete(type);
    triggerEffect(type, { action: 'stop' });
  }, [triggerEffect]);
  
  const pauseAllEffects = useCallback(() => {
    setIsEffectsEnabled(false);
    activeEffects.current.forEach(type => {
      triggerEffect(type, { action: 'pause' });
    });
  }, [triggerEffect]);
  
  const resumeAllEffects = useCallback(() => {
    setIsEffectsEnabled(true);
    activeEffects.current.forEach(type => {
      triggerEffect(type, { action: 'resume' });
    });
  }, [triggerEffect]);
  
  // Cleanup effect timers
  useEffect(() => {
    return () => {
      effectTimers.current.forEach(timer => clearTimeout(timer));
      effectTimers.current.clear();
    };
  }, []);
  
  // Context value
  const contextValue: MatrixContextType = {
    effectConfig,
    transitionConfig,
    dataState,
    performanceMetrics,
    qualitySettings,
    isEffectsEnabled,
    currentTheme,
    updateEffectConfig,
    updateTransitionConfig,
    updateDataState,
    triggerEffect,
    setQualityLevel,
    startEffect,
    stopEffect,
    pauseAllEffects,
    resumeAllEffects,
  };
  
  return (
    <MatrixEffectsContext.Provider value={contextValue}>
      {children}
    </MatrixEffectsContext.Provider>
  );
}

// Background Matrix component that uses the effects manager
export function MatrixBackground() {
  const {
    effectConfig,
    dataState,
    currentTheme,
    isEffectsEnabled,
    updateDataState,
    triggerEffect,
  } = useMatrixEffects();
  
  // Data-driven intensity calculation
  const adaptiveIntensity = React.useMemo(() => {
    if (effectConfig.intensity !== 'adaptive') {
      return effectConfig.intensity;
    }
    
    // Calculate intensity based on data state
    let intensity: MatrixIntensity = 'medium';
    
    if (dataState.isLoading) {
      intensity = 'high'; // More activity during loading
    } else if (dataState.errorState) {
      intensity = 'low'; // Reduced activity for errors
    } else if (dataState.connectionQuality === 'excellent') {
      intensity = 'high'; // High activity for good connection
    } else if (dataState.connectionQuality === 'poor') {
      intensity = 'low'; // Low activity for poor connection
    }
    
    return intensity;
  }, [effectConfig.intensity, dataState]);
  
  // Handle data updates (simulate for demo)
  const handleDataUpdate = useCallback(() => {
    updateDataState({
      updateCount: dataState.updateCount + 1,
      dataAge: 0,
    });
  }, [updateDataState, dataState.updateCount]);
  
  if (!effectConfig.enabled || !isEffectsEnabled) {
    return null;
  }
  
  // Ensure theme is compatible with MatrixRainWebGL
  const compatibleTheme = currentTheme === 'adaptive' ? 'mixed' : currentTheme;
  
  return (
    <MatrixRainWebGL
      intensity={adaptiveIntensity}
      speed="medium"
      theme={compatibleTheme}
      interactive={effectConfig.interactive}
      glowIntensity={1.0}
      className="matrix-background"
      onDataUpdate={handleDataUpdate}
      enableGlitch={true}
      enableResponsiveTouchPoints={true}
    />
  );
}

// Wrapper component for easy integration
interface MatrixContainerProps {
  children: ReactNode;
  showBackground?: boolean;
  effectConfig?: Partial<MatrixEffectConfig>;
  className?: string;
}

export function MatrixContainer({ 
  children, 
  showBackground = true,
  effectConfig = {},
  className = '' 
}: MatrixContainerProps) {
  return (
    <MatrixEffectsProvider initialConfig={effectConfig}>
      <div className={`matrix-container relative ${className}`}>
        {showBackground && <MatrixBackground />}
        <div className="matrix-content relative z-10">
          {children}
        </div>
      </div>
    </MatrixEffectsProvider>
  );
}

// Hook for triggering specific Matrix effects
export function useMatrixEffect(type: MatrixEffectType) {
  const { triggerEffect, effectConfig, isEffectsEnabled } = useMatrixEffects();
  
  return useCallback((options: any = {}) => {
    if (effectConfig.enabled && isEffectsEnabled) {
      triggerEffect(type, options);
    }
  }, [triggerEffect, type, effectConfig.enabled, isEffectsEnabled]);
}

// Hook for data-driven effects
export function useMatrixDataEffects() {
  const { updateDataState, dataState } = useMatrixEffects();
  
  const markLoading = useCallback(() => {
    updateDataState({ isLoading: true });
  }, [updateDataState]);
  
  const markLoaded = useCallback(() => {
    updateDataState({ 
      isLoading: false, 
      hasData: true, 
      updateCount: dataState.updateCount + 1 
    });
  }, [updateDataState, dataState.updateCount]);
  
  const markError = useCallback(() => {
    updateDataState({ 
      isLoading: false, 
      errorState: true 
    });
  }, [updateDataState]);
  
  const clearError = useCallback(() => {
    updateDataState({ errorState: false });
  }, [updateDataState]);
  
  const updateConnectionQuality = useCallback((quality: MatrixDataState['connectionQuality']) => {
    updateDataState({ connectionQuality: quality });
  }, [updateDataState]);
  
  return {
    markLoading,
    markLoaded,
    markError,
    clearError,
    updateConnectionQuality,
    dataState,
  };
}

// Performance monitoring component
export function MatrixPerformanceMonitor() {
  const { performanceMetrics, qualitySettings } = useMatrixEffects();
  
  if (process.env.NODE_ENV !== 'development' || !performanceMetrics) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-cyan-400 p-3 rounded-lg font-mono text-xs z-50 border border-cyan-500/30">
      <div className="space-y-1">
        <div className="text-cyan-300 font-semibold">Matrix Performance</div>
        <div>FPS: <span className={performanceMetrics.fps >= 50 ? 'text-green-400' : performanceMetrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>{performanceMetrics.fps}</span></div>
        <div>Memory: {performanceMetrics.memoryUsage.toFixed(1)}MB</div>
        <div>Quality: {(performanceMetrics.qualityLevel * 100).toFixed(0)}%</div>
        {qualitySettings && (
          <>
            <div>Particles: {qualitySettings.particleCount}</div>
            <div>Bloom: {qualitySettings.bloomEffect ? 'ON' : 'OFF'}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default MatrixEffectsProvider; 