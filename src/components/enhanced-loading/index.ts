/**
 * Enhanced Loading System Exports
 * Comprehensive loading experience for Bradley AI
 */

// Main component
export { default as EnhancedBradleyAILoader } from './EnhancedBradleyAILoader'
export type { EnhancedBradleyAILoaderProps } from './EnhancedBradleyAILoader'

// Effects components
export { default as DigitalRainCanvas } from './effects/DigitalRainCanvas'
export type { DigitalRainCanvasProps, RainParticle } from './effects/DigitalRainCanvas'

export { default as BradleyAILogo } from './effects/BradleyAILogo'
export type { BradleyAILogoProps } from './effects/BradleyAILogo'

export { default as LoadingProgress } from './effects/LoadingProgress'
export type { LoadingProgressProps } from './effects/LoadingProgress'

export { default as StatusMessages } from './effects/StatusMessages'
export type { StatusMessagesProps } from './effects/StatusMessages'

export { default as ParticleEffects } from './effects/ParticleEffects'
export type { ParticleEffectsProps } from './effects/ParticleEffects'

// Managers
export { default as LoadingPhaseManager } from './managers/LoadingPhaseManager'
export type {
    LoadingPhase,
    PhaseConfig
} from './managers/LoadingPhaseManager'

export { default as PerformanceOptimizer } from './managers/PerformanceOptimizer'
export type {
    PerformanceLevel,
    PerformanceMetrics,
    QualitySettings
} from './managers/PerformanceOptimizer'

export { default as AudioController } from './managers/AudioManager'
export type {
    AudioSettings,
    SoundType
} from './managers/AudioManager'

// Themes
export { default as LoadingThemes } from './themes/LoadingThemes'
export type {
    ColorScheme,
    ThemeName
} from './themes/LoadingThemes'

// Utilities and hooks
export const createEnhancedLoader = (options?: Partial<EnhancedBradleyAILoaderProps>) => {
  return {
    component: EnhancedBradleyAILoader,
    defaultProps: {
      enableAudio: false,
      enableParticles: true,
      enableDigitalRain: true,
      performanceMode: 'auto' as const,
      ...options
    }
  }
}

export const useLoadingPhase = () => {
  const manager = new LoadingPhaseManager()
  return {
    getPhaseForProgress: manager.getPhaseForProgress.bind(manager),
    getStatusMessage: manager.getStatusMessage.bind(manager),
    getCharacterSetsForPhase: manager.getCharacterSetsForPhase.bind(manager),
    getAllPhases: manager.getAllPhases.bind(manager)
  }
}

export const useLoadingTheme = () => {
  return {
    getThemeForPhase: LoadingThemes.getThemeForPhase.bind(LoadingThemes),
    getAllThemes: LoadingThemes.getAllThemes.bind(LoadingThemes),
    createCustomTheme: LoadingThemes.createCustomTheme.bind(LoadingThemes),
    getReducedMotionTheme: LoadingThemes.getReducedMotionTheme.bind(LoadingThemes)
  }
}
