'use client'

/**
 * Enhanced Bradley AI Loader
 * Sophisticated cyberpunk-inspired loading experience featuring:
 * - Advanced Digital Rain Matrix Effect
 * - Dynamic Bradley AI Branding with animated logo assembly
 * - Progressive Loading States with meaningful feedback
 * - Immersive Audio-Visual Experience
 */

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BradleyAILogo } from './effects/BradleyAILogo'
import { DigitalRainCanvas } from './effects/DigitalRainCanvas'
import { LoadingProgress } from './effects/LoadingProgress'
import { ParticleEffects } from './effects/ParticleEffects'
import { StatusMessages } from './effects/StatusMessages'
import { AudioController } from './managers/AudioManager'
import { LoadingPhase, LoadingPhaseManager } from './managers/LoadingPhaseManager'
import { PerformanceOptimizer } from './managers/PerformanceOptimizer'
import { ColorScheme, LoadingThemes } from './themes/LoadingThemes'

export interface EnhancedBradleyAILoaderProps {
  isVisible: boolean
  onComplete?: () => void
  enableAudio?: boolean
  enableParticles?: boolean
  enableDigitalRain?: boolean
  performanceMode?: 'auto' | 'high' | 'medium' | 'low'
  customTheme?: ColorScheme
  className?: string
}

export function EnhancedBradleyAILoader({
  isVisible,
  onComplete,
  enableAudio = false,
  enableParticles = true,
  enableDigitalRain = true,
  performanceMode = 'auto',
  customTheme,
  className = ''
}: EnhancedBradleyAILoaderProps) {
  // State management
  const [currentPhase, setCurrentPhase] = useState<LoadingPhase>('initializing')
  const [progress, setProgress] = useState(0)
  const [logoAssembled, setLogoAssembled] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Managers
  const phaseManager = useMemo(() => new LoadingPhaseManager(), [])
  const performanceOptimizer = useMemo(() => new PerformanceOptimizer(), [])
  const audioController = useMemo(() => enableAudio ? new AudioController() : null, [enableAudio])

  // Theme management
  const currentTheme = customTheme || LoadingThemes.getThemeForPhase(currentPhase)

  // Initialize performance monitoring
  useEffect(() => {
    if (isVisible) {
      performanceOptimizer.start()
      return () => performanceOptimizer.stop()
    }
  }, [isVisible, performanceOptimizer])

  // Initialize audio
  useEffect(() => {
    if (isVisible && audioController) {
      audioController.initialize()
      audioController.playAmbience()
    }
    return () => {
      if (audioController) {
        audioController.stopAll()
      }
    }
  }, [isVisible, audioController])

  // Loading progression logic
  useEffect(() => {
    if (!isVisible) return

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 3 + 1, 100)

        // Update phase based on progress
        const newPhase = phaseManager.getPhaseForProgress(newProgress)
        if (newPhase !== currentPhase) {
          setCurrentPhase(newPhase)
          audioController?.playProgressSound()
        }

        // Logo assembly trigger
        if (newProgress >= 15 && !logoAssembled) {
          setLogoAssembled(true)
        }

        // Completion
        if (newProgress >= 100 && !isComplete) {
          setIsComplete(true)
          setTimeout(() => {
            onComplete?.()
          }, 1000)
        }

        return newProgress
      })
    }, 100 + Math.random() * 50) // Variable timing for realism

    return () => clearInterval(progressInterval)
  }, [isVisible, currentPhase, logoAssembled, isComplete, phaseManager, audioController, onComplete])

  // Performance adaptations
  const performanceSettings = useMemo(() => {
    const level = performanceMode === 'auto'
      ? performanceOptimizer.getPerformanceLevel()
      : performanceMode

    return {
      particleDensity: level === 'high' ? 1.0 : level === 'medium' ? 0.6 : 0.3,
      rainParticles: level === 'high' ? 150 : level === 'medium' ? 100 : 60,
      enableBlur: level !== 'low',
      enableGlow: level === 'high',
      animationFrameRate: level === 'high' ? 60 : level === 'medium' ? 30 : 20
    }
  }, [performanceMode, performanceOptimizer])

  // Accessibility: respect reduced motion
  const reduceMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  const handleParticleInteraction = useCallback(() => {
    audioController?.playParticleSound()
  }, [audioController])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 overflow-hidden ${className}`}
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background.primary} 0%, ${currentTheme.background.secondary} 100%)`,
          backdropFilter: performanceSettings.enableBlur ? 'blur(10px)' : 'none'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Digital Rain Background */}
        {enableDigitalRain && !reduceMotion && (
          <DigitalRainCanvas
            theme={currentTheme}
            particleCount={performanceSettings.rainParticles}
            speed={phaseManager.getRainSpeedForPhase(currentPhase)}
            characterSets={phaseManager.getCharacterSetsForPhase(currentPhase)}
            interactive={true}
            onInteraction={handleParticleInteraction}
          />
        )}

        {/* Main Content Container */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-8 max-w-2xl mx-auto px-6">

            {/* Bradley AI Logo Assembly */}
            <div className="relative">
              <BradleyAILogo
                phase={currentPhase}
                shouldAssemble={logoAssembled}
                theme={currentTheme}
                reduceMotion={reduceMotion}
                onAssemblyComplete={() => {
                  audioController?.playLogoAssemblySound()
                }}
              />
            </div>

            {/* Status Messages */}
            <StatusMessages
              phase={currentPhase}
              progress={progress}
              theme={currentTheme}
              typewriterEffect={!reduceMotion}
            />

            {/* Loading Progress */}
            <LoadingProgress
              progress={progress}
              phase={currentPhase}
              theme={currentTheme}
              showPercentage={true}
              neuralNetworkStyle={!reduceMotion}
            />

            {/* Interactive Particle Effects */}
            {enableParticles && !reduceMotion && (
              <ParticleEffects
                phase={currentPhase}
                density={performanceSettings.particleDensity}
                theme={currentTheme}
                onParticleClick={handleParticleInteraction}
              />
            )}

          </div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top-left corner */}
          <div className="absolute top-4 left-4">
            <motion.div
              className="w-16 h-16 border-l-2 border-t-2 opacity-60"
              style={{ borderColor: currentTheme.accent.primary }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>

          {/* Top-right corner */}
          <div className="absolute top-4 right-4">
            <motion.div
              className="w-16 h-16 border-r-2 border-t-2 opacity-60"
              style={{ borderColor: currentTheme.accent.secondary }}
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />
          </div>

          {/* Bottom-left corner */}
          <div className="absolute bottom-4 left-4">
            <motion.div
              className="w-16 h-16 border-l-2 border-b-2 opacity-60"
              style={{ borderColor: currentTheme.accent.tertiary }}
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            />
          </div>

          {/* Bottom-right corner */}
          <div className="absolute bottom-4 right-4">
            <motion.div
              className="w-16 h-16 border-r-2 border-b-2 opacity-60"
              style={{ borderColor: currentTheme.accent.quaternary }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            />
          </div>
        </div>

        {/* Performance Monitor (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-white/50 font-mono">
            FPS: {performanceOptimizer.getFPS()} | Phase: {currentPhase} | Progress: {Math.round(progress)}%
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default EnhancedBradleyAILoader
