'use client'

/**
 * Bradley AI Logo Assembly Component
 * Logo materializes from falling digital rain particles with
 * glitch effects, typography animation, and breathing effects
 */

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LoadingPhase } from '../managers/LoadingPhaseManager'
import { ColorScheme } from '../themes/LoadingThemes'

export interface BradleyAILogoProps {
  phase: LoadingPhase
  shouldAssemble: boolean
  theme: ColorScheme
  reduceMotion?: boolean
  onAssemblyComplete?: () => void
}

interface LogoParticle {
  x: number
  y: number
  targetX: number
  targetY: number
  character: string
  assembled: boolean
  delay: number
}

export function BradleyAILogo({
  phase,
  shouldAssemble,
  theme,
  reduceMotion = false,
  onAssemblyComplete
}: BradleyAILogoProps) {
  const [assemblyComplete, setAssemblyComplete] = useState(false)
  const [showGlitch, setShowGlitch] = useState(false)
  const [particles, setParticles] = useState<LogoParticle[]>([])
  const logoRef = useRef<HTMLDivElement>(null)

  // Initialize logo particles for assembly animation
  useEffect(() => {
    if (shouldAssemble && !reduceMotion) {
      const logoText = 'BRADLEY AI'
      const newParticles: LogoParticle[] = []

      logoText.split('').forEach((char, index) => {
        if (char !== ' ') {
          newParticles.push({
            x: Math.random() * window.innerWidth,
            y: -50 - Math.random() * 100,
            targetX: 50 + index * 30, // Approximate character positions
            targetY: 0,
            character: char,
            assembled: false,
            delay: index * 100
          })
        }
      })

      setParticles(newParticles)

      // Trigger assembly after a delay
      setTimeout(() => {
        setParticles(prev => prev.map(p => ({ ...p, assembled: true })))

        // Complete assembly after animation
        setTimeout(() => {
          setAssemblyComplete(true)
          onAssemblyComplete?.()
        }, 2000)
      }, 500)
    } else if (shouldAssemble) {
      // Skip particle animation for reduced motion
      setAssemblyComplete(true)
      onAssemblyComplete?.()
    }
  }, [shouldAssemble, reduceMotion, onAssemblyComplete])

  // Glitch effect trigger
  useEffect(() => {
    if (assemblyComplete && !reduceMotion) {
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.85) {
          setShowGlitch(true)
          setTimeout(() => setShowGlitch(false), 150)
        }
      }, 3000)

      return () => clearInterval(glitchInterval)
    }
  }, [assemblyComplete, reduceMotion])

  // Get logo colors based on phase
  const getLogoColors = () => {
    switch (phase) {
      case 'connecting':
        return {
          primary: theme.accent.secondary,
          secondary: theme.accent.primary,
          glow: theme.accent.secondary
        }
      case 'loading':
        return {
          primary: theme.accent.tertiary,
          secondary: theme.accent.secondary,
          glow: theme.accent.tertiary
        }
      case 'synchronizing':
        return {
          primary: theme.accent.quaternary,
          secondary: theme.accent.tertiary,
          glow: theme.accent.quaternary
        }
      case 'finalizing':
        return {
          primary: theme.accent.primary,
          secondary: theme.accent.quaternary,
          glow: theme.accent.primary
        }
      default:
        return {
          primary: theme.accent.primary,
          secondary: theme.text.primary,
          glow: theme.accent.primary
        }
    }
  }

  const colors = getLogoColors()

  return (
    <div className="relative" ref={logoRef}>
      {/* Particle Assembly Animation */}
      {!reduceMotion && shouldAssemble && !assemblyComplete && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, index) => (
            <motion.div
              key={index}
              className="absolute font-mono text-2xl font-bold"
              style={{ color: colors.primary }}
              initial={{ x: particle.x, y: particle.y, opacity: 0 }}
              animate={{
                x: particle.assembled ? particle.targetX : particle.x,
                y: particle.assembled ? particle.targetY : particle.y,
                opacity: particle.assembled ? 1 : 0.7
              }}
              transition={{
                delay: particle.delay / 1000,
                duration: 1.5,
                ease: 'easeInOut'
              }}
            >
              {particle.character}
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Logo */}
      <AnimatePresence>
        {(assemblyComplete || reduceMotion) && (
          <motion.div
            className="text-center"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* BRADLEY Text */}
            <motion.h1
              className={`text-6xl md:text-8xl font-bold font-mono tracking-wider ${
                showGlitch ? 'animate-pulse' : ''
              }`}
              style={{
                color: colors.primary,
                textShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
                fontFamily: "'Orbitron', 'Source Code Pro', monospace"
              }}
              animate={
                !reduceMotion
                  ? {
                      textShadow: [
                        `0 0 20px ${colors.glow}`,
                        `0 0 40px ${colors.glow}`,
                        `0 0 20px ${colors.glow}`
                      ]
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              {showGlitch ? (
                <span className="relative">
                  BRADLEY
                  <span className="absolute inset-0 text-red-500 opacity-60 translate-x-1">
                    BR∆DLEY
                  </span>
                  <span className="absolute inset-0 text-blue-500 opacity-60 -translate-x-1">
                    BRADL3Y
                  </span>
                </span>
              ) : (
                'BRADLEY'
              )}
            </motion.h1>

            {/* AI Subtitle */}
            <motion.div
              className="mt-4 relative"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h2
                className="text-3xl md:text-4xl font-bold font-mono tracking-widest"
                style={{
                  color: colors.secondary,
                  textShadow: `0 0 10px ${colors.secondary}`
                }}
              >
                AI
              </h2>

              {/* Neural Network Pattern Under AI */}
              {!reduceMotion && (
                <motion.div
                  className="mt-2 flex justify-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.secondary }}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut'
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Animated Underline */}
              {!reduceMotion && (
                <motion.div
                  className="mt-2 h-0.5 mx-auto"
                  style={{ backgroundColor: colors.secondary }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.5, duration: 1 }}
                />
              )}
            </motion.div>

            {/* Breathing Glow Effect */}
            {!reduceMotion && assemblyComplete && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  opacity: [0.2, 0.6, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div
                  className="absolute inset-0 rounded-lg blur-xl"
                  style={{
                    background: `radial-gradient(circle, ${colors.glow}40 0%, transparent 70%)`
                  }}
                />
              </motion.div>
            )}

            {/* Particle Emanation */}
            {!reduceMotion && assemblyComplete && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: colors.primary,
                      left: '50%',
                      top: '50%'
                    }}
                    animate={{
                      x: [0, (Math.cos(i * Math.PI / 4) * 100)],
                      y: [0, (Math.sin(i * Math.PI / 4) * 100)],
                      opacity: [1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BradleyAILogo
