'use client'

/**
 * Status Messages Component
 * Dynamic, contextual loading messages with typewriter effects
 * and phase-specific status updates
 */

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { LoadingPhase } from '../managers/LoadingPhaseManager'
import { ColorScheme } from '../themes/LoadingThemes'

// Hydration-safe hook following established patterns from codebase
function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

export interface StatusMessagesProps {
  phase: LoadingPhase
  progress: number
  theme: ColorScheme
  typewriterEffect?: boolean
}

interface StatusMessage {
  primary: string
  secondary?: string
  details?: string[]
}

export function StatusMessages({
  phase,
  progress,
  theme,
  typewriterEffect = true
}: StatusMessagesProps) {
  const [currentMessage, setCurrentMessage] = useState<StatusMessage>({ primary: '' })
  const [typewriterText, setTypewriterText] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1200) // Default fallback width
  const isHydrated = useHydration()

  // Get messages for current phase
  const getPhaseMessages = (): StatusMessage => {
    switch (phase) {
      case 'initializing':
        return {
          primary: 'INITIALIZING BRADLEY AI MATRIX...',
          secondary: 'Establishing neural pathways',
          details: [
            'Loading core AI modules',
            'Initializing quantum processors',
            'Establishing secure connections',
            'Calibrating neural networks'
          ]
        }
      case 'connecting':
        return {
          primary: 'CONNECTING TO BLOCKCHAIN NETWORKS...',
          secondary: 'Synchronizing with decentralized protocols',
          details: [
            'Connecting to Ethereum mainnet',
            'Establishing Web3 connections',
            'Verifying smart contracts',
            'Loading DeFi protocols'
          ]
        }
      case 'loading':
        return {
          primary: 'LOADING PORTFOLIO DATA...',
          secondary: 'Aggregating multi-chain assets',
          details: [
            'Scanning wallet addresses',
            'Fetching token balances',
            'Loading NFT collections',
            'Calculating portfolio metrics'
          ]
        }
      case 'synchronizing':
        return {
          primary: 'SYNCHRONIZING MARKET DATA...',
          secondary: 'Real-time price discovery in progress',
          details: [
            'Fetching live market prices',
            'Calculating price changes',
            'Loading market indicators',
            'Synchronizing trading pairs'
          ]
        }
      case 'finalizing':
        return {
          primary: 'FINALIZING NEURAL CONNECTIONS...',
          secondary: 'Optimizing AI algorithms',
          details: [
            'Finalizing data structures',
            'Optimizing performance',
            'Caching critical data',
            'Preparing user interface'
          ]
        }
      default:
        return {
          primary: 'BRADLEY AI STARTING...',
          secondary: 'Please wait',
          details: []
        }
    }
  }

  // Hydration-safe window width detection
  useEffect(() => {
    if (!isHydrated) return

    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth)
    }

    // Set initial width
    updateWindowWidth()

    // Listen for resize events
    window.addEventListener('resize', updateWindowWidth)
    return () => window.removeEventListener('resize', updateWindowWidth)
  }, [isHydrated])

  // Update message when phase changes
  useEffect(() => {
    const newMessage = getPhaseMessages()
    setCurrentMessage(newMessage)
    setShowDetails(false)

    // Show details after a delay
    const detailsTimer = setTimeout(() => {
      setShowDetails(true)
    }, 1500)

    return () => clearTimeout(detailsTimer)
  }, [phase])

  // Typewriter effect for primary message
  useEffect(() => {
    if (!typewriterEffect || !currentMessage.primary) {
      setTypewriterText(currentMessage.primary)
      return
    }

    setTypewriterText('')
    let currentIndex = 0

    const typewriter = setInterval(() => {
      if (currentIndex <= currentMessage.primary.length) {
        setTypewriterText(currentMessage.primary.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typewriter)
      }
    }, 50)

    return () => clearInterval(typewriter)
  }, [currentMessage.primary, typewriterEffect])

  // Get current detail based on progress
  const getCurrentDetail = () => {
    if (!currentMessage.details?.length) return null

    const detailIndex = Math.min(
      Math.floor(progress / (100 / currentMessage.details.length)),
      currentMessage.details.length - 1
    )

    return currentMessage.details[detailIndex]
  }

  const currentDetail = getCurrentDetail()

  return (
    <div className="text-center space-y-4 max-w-lg mx-auto">
      {/* Primary Status Message */}
      <div className="relative">
        <motion.h2
          className="text-xl md:text-2xl font-bold font-mono tracking-wide"
          style={{
            color: theme.text.primary,
            textShadow: `0 0 10px ${theme.accent.primary}`
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {typewriterText}
          {typewriterEffect && typewriterText.length < currentMessage.primary.length && (
            <motion.span
              className="inline-block w-0.5 h-6 ml-1"
              style={{ backgroundColor: theme.accent.primary }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </motion.h2>

        {/* Glitch Effect Overlay */}
        <motion.div
          className="absolute inset-0 font-mono tracking-wide text-xl md:text-2xl font-bold opacity-0"
          style={{ color: theme.accent.secondary }}
          animate={{
            opacity: Math.random() > 0.95 ? [0, 0.6, 0] : 0,
            x: Math.random() > 0.95 ? [0, 2, -2, 0] : 0
          }}
          transition={{ duration: 0.1 }}
        >
          {typewriterText.replace(/[AEIOU]/g, 'Δ').replace(/[0-9]/g, '∞')}
        </motion.div>
      </div>

      {/* Secondary Message */}
      {currentMessage.secondary && (
        <motion.p
          className="text-sm md:text-base font-mono opacity-80"
          style={{ color: theme.text.secondary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {currentMessage.secondary}
        </motion.p>
      )}

      {/* Current Detail */}
      <AnimatePresence mode="wait">
        {currentDetail && showDetails && (
          <motion.div
            key={currentDetail}
            className="text-sm font-mono opacity-60"
            style={{ color: theme.accent.primary }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: theme.accent.primary }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <span>{currentDetail}</span>
              <motion.div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: theme.accent.primary }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: 0.5,
                  ease: 'easeInOut'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Dots */}
      <div className="flex justify-center space-x-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.accent.secondary }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Progress-based Encouragement */}
      {progress > 75 && (
        <motion.div
          className="text-xs font-mono opacity-50"
          style={{ color: theme.text.tertiary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Almost ready... Preparing your personalized experience
        </motion.div>
      )}

      {/* Data Stream Visualization */}
      <div className="relative overflow-hidden h-8">
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 opacity-30"
          style={{ backgroundColor: theme.accent.primary }}
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Data particles */}
        {isHydrated && [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 w-0.5 h-0.5 rounded-full"
            style={{ backgroundColor: theme.accent.secondary }}
            animate={{
              x: [-20, windowWidth + 20],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'linear'
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default StatusMessages
