'use client'

/**
 * Matrix Loading States
 * Matrix digital rain effect, blue pulsing loading indicators
 * Progressive loading with cyberpunk animations and error states with glitch effects
 */

import React, { memo, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MATRIX_COLORS,
  MATRIX_TIMINGS,
  MATRIX_EASING
} from '@/lib/visualization/matrix-core'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface MatrixLoadingProps {
  state: LoadingState
  progress?: number // 0-100
  message?: string
  subMessage?: string
  enableDigitalRain?: boolean
  showProgress?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function MatrixLoading({
  state,
  progress = 0,
  message = 'Initializing Matrix...',
  subMessage,
  enableDigitalRain = true,
  showProgress = true,
  className = '',
  style = {}
}: MatrixLoadingProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  // Smooth progress animation
  useEffect(() => {
    const target = Math.max(0, Math.min(100, progress))
    const current = displayProgress
    const diff = target - current
    
    if (Math.abs(diff) < 0.1) {
      setDisplayProgress(target)
      return
    }

    const increment = diff * 0.1
    const timer = setInterval(() => {
      setDisplayProgress(prev => {
        const next = prev + increment
        if (Math.abs(target - next) < 0.1) {
          clearInterval(timer)
          return target
        }
        return next
      })
    }, 16) // ~60fps

    return () => clearInterval(timer)
  }, [progress, displayProgress])

  if (state === 'idle') return null

  return (
    <AnimatePresence>
      <motion.div
        className={`matrix-loading fixed inset-0 z-50 flex items-center justify-center ${className}`}
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(5px)',
          ...style
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: MATRIX_TIMINGS.normal / 1000 }}
      >
        {/* Digital rain background */}
        {enableDigitalRain && <DigitalRain />}

        {/* Main loading content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {/* Loading indicator based on state */}
          <div className="mb-8">
            {state === 'loading' && <LoadingSpinner progress={displayProgress} />}
            {state === 'success' && <SuccessIndicator />}
            {state === 'error' && <ErrorIndicator />}
          </div>

          {/* Message */}
          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-cyan-400 font-mono font-bold text-xl">
              {state === 'loading' && message}
              {state === 'success' && 'Matrix Initialized'}
              {state === 'error' && 'System Error'}
            </h2>
            
            {subMessage && (
              <p className="text-gray-400 font-mono text-sm">{subMessage}</p>
            )}
          </motion.div>

          {/* Progress bar */}
          {showProgress && state === 'loading' && (
            <div className="mt-6">
              <ProgressBar progress={displayProgress} />
            </div>
          )}

          {/* Loading dots */}
          {state === 'loading' && (
            <div className="mt-4">
              <LoadingDots />
            </div>
          )}
        </div>

        {/* Corner decorations */}
        <CornerDecorations state={state} />
      </motion.div>
    </AnimatePresence>
  )
}

// Digital rain background effect
const DigitalRain = memo(function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Matrix characters
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = new Array(columns).fill(1)

    // Animation loop
    const animate = () => {
      // Semi-transparent background for trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Matrix rain
      ctx.fillStyle = MATRIX_COLORS.effects.glow
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(char, x, y)

        // Reset drop randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(animate, 50)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-30"
      style={{ pointerEvents: 'none' }}
    />
  )
})

// Loading spinner with circular progress
interface LoadingSpinnerProps {
  progress: number
}

const LoadingSpinner = memo(function LoadingSpinner({ progress }: LoadingSpinnerProps) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-24 h-24 mx-auto">
      {/* Background circle */}
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={MATRIX_COLORS.backgrounds.grid}
          strokeWidth="4"
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke={MATRIX_COLORS.effects.glow}
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 10px ${MATRIX_COLORS.effects.glow})`
          }}
        />
      </svg>

      {/* Center glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div
          className="w-8 h-8 rounded-full"
          style={{
            background: MATRIX_COLORS.effects.glow,
            boxShadow: `0 0 20px ${MATRIX_COLORS.effects.glow}`
          }}
        />
      </motion.div>

      {/* Progress text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-cyan-400 font-mono font-bold text-sm">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
})

// Success indicator with checkmark animation
const SuccessIndicator = memo(function SuccessIndicator() {
  return (
    <motion.div
      className="w-24 h-24 mx-auto relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Success circle */}
      <motion.div
        className="w-24 h-24 rounded-full border-4 flex items-center justify-center"
        style={{
          borderColor: MATRIX_COLORS.nodes.success,
          background: `${MATRIX_COLORS.nodes.success}20`,
          boxShadow: `0 0 30px ${MATRIX_COLORS.nodes.success}40`
        }}
        animate={{
          boxShadow: [
            `0 0 30px ${MATRIX_COLORS.nodes.success}40`,
            `0 0 40px ${MATRIX_COLORS.nodes.success}60`,
            `0 0 30px ${MATRIX_COLORS.nodes.success}40`
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Checkmark */}
        <motion.svg
          className="w-12 h-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={MATRIX_COLORS.nodes.success}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <path d="M20 6L9 17l-5-5" />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
})

// Error indicator with glitch effects
const ErrorIndicator = memo(function ErrorIndicator() {
  return (
    <motion.div
      className="w-24 h-24 mx-auto relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Error circle with glitch effect */}
      <motion.div
        className="w-24 h-24 rounded-full border-4 flex items-center justify-center"
        style={{
          borderColor: MATRIX_COLORS.nodes.error,
          background: `${MATRIX_COLORS.nodes.error}20`,
          boxShadow: `0 0 30px ${MATRIX_COLORS.nodes.error}40`
        }}
        animate={{
          x: [-2, 2, -1, 1, 0],
          y: [1, -1, 2, -2, 0],
          boxShadow: [
            `0 0 30px ${MATRIX_COLORS.nodes.error}40`,
            `0 0 50px ${MATRIX_COLORS.nodes.error}80`,
            `0 0 30px ${MATRIX_COLORS.nodes.error}40`
          ]
        }}
        transition={{
          x: { duration: 0.2, repeat: Infinity, repeatDelay: 2 },
          y: { duration: 0.2, repeat: Infinity, repeatDelay: 2 },
          boxShadow: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        {/* X mark */}
        <motion.svg
          className="w-12 h-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={MATRIX_COLORS.nodes.error}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
})

// Progress bar component
interface ProgressBarProps {
  progress: number
}

const ProgressBar = memo(function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Progress text */}
      <div className="flex justify-between text-xs font-mono mb-2">
        <span className="text-cyan-400">Loading...</span>
        <span className="text-white">{Math.round(progress)}%</span>
      </div>
      
      {/* Progress track */}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${MATRIX_COLORS.effects.glow}, ${MATRIX_COLORS.nodes.success})`,
            boxShadow: `0 0 10px ${MATRIX_COLORS.effects.glow}`
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Animated shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-white/20"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              width: '50px'
            }}
            animate={{ x: ['-50px', '100%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>
      </div>
    </div>
  )
})

// Animated loading dots
const LoadingDots = memo(function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1">
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: MATRIX_COLORS.effects.glow }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
})

// Corner decorations based on state
interface CornerDecorationsProps {
  state: LoadingState
}

const CornerDecorations = memo(function CornerDecorations({ state }: CornerDecorationsProps) {
  const getColor = () => {
    switch (state) {
      case 'success':
        return MATRIX_COLORS.nodes.success
      case 'error':
        return MATRIX_COLORS.nodes.error
      default:
        return MATRIX_COLORS.effects.glow
    }
  }

  const color = getColor()

  return (
    <>
      {/* Top-left corner */}
      <motion.div
        className="absolute top-4 left-4 w-8 h-8"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div
          className="w-full h-1 absolute top-0 left-0"
          style={{ background: color }}
        />
        <div
          className="w-1 h-full absolute top-0 left-0"
          style={{ background: color }}
        />
      </motion.div>

      {/* Top-right corner */}
      <motion.div
        className="absolute top-4 right-4 w-8 h-8"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div
          className="w-full h-1 absolute top-0 right-0"
          style={{ background: color }}
        />
        <div
          className="w-1 h-full absolute top-0 right-0"
          style={{ background: color }}
        />
      </motion.div>

      {/* Bottom-left corner */}
      <motion.div
        className="absolute bottom-4 left-4 w-8 h-8"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div
          className="w-full h-1 absolute bottom-0 left-0"
          style={{ background: color }}
        />
        <div
          className="w-1 h-full absolute bottom-0 left-0"
          style={{ background: color }}
        />
      </motion.div>

      {/* Bottom-right corner */}
      <motion.div
        className="absolute bottom-4 right-4 w-8 h-8"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div
          className="w-full h-1 absolute bottom-0 right-0"
          style={{ background: color }}
        />
        <div
          className="w-1 h-full absolute bottom-0 right-0"
          style={{ background: color }}
        />
      </motion.div>
    </>
  )
}) 