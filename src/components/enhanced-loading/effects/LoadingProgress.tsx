'use client'

/**
 * Loading Progress Component
 * Neural network-style progress bar with animated nodes,
 * connections, and dynamic percentage display
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { LoadingPhase } from '../managers/LoadingPhaseManager'
import { ColorScheme } from '../themes/LoadingThemes'

export interface LoadingProgressProps {
  progress: number
  phase: LoadingPhase
  theme: ColorScheme
  showPercentage?: boolean
  neuralNetworkStyle?: boolean
}

interface ProgressNode {
  id: number
  x: number
  active: boolean
  pulseDelay: number
}

export function LoadingProgress({
  progress,
  phase,
  theme,
  showPercentage = true,
  neuralNetworkStyle = true
}: LoadingProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [nodes, setNodes] = useState<ProgressNode[]>([])
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  // Smooth progress animation
  useEffect(() => {
    const target = Math.max(0, Math.min(100, progress))

    const animateProgress = () => {
      setDisplayProgress(prev => {
        const diff = target - prev
        if (Math.abs(diff) < 0.1) return target
        return prev + diff * 0.1
      })
    }

    const interval = setInterval(animateProgress, 16)
    return () => clearInterval(interval)
  }, [progress])

  // Animate percentage counter
  useEffect(() => {
    const target = Math.floor(displayProgress)

    const animatePercentage = () => {
      setAnimatedPercentage(prev => {
        const diff = target - prev
        if (Math.abs(diff) < 1) return target
        return prev + Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.2)
      })
    }

    const interval = setInterval(animatePercentage, 50)
    return () => clearInterval(interval)
  }, [displayProgress])

  // Initialize neural network nodes
  useEffect(() => {
    if (neuralNetworkStyle) {
      const nodeCount = 10
      const newNodes: ProgressNode[] = []

      for (let i = 0; i < nodeCount; i++) {
        newNodes.push({
          id: i,
          x: (i / (nodeCount - 1)) * 100,
          active: false,
          pulseDelay: i * 0.1
        })
      }

      setNodes(newNodes)
    }
  }, [neuralNetworkStyle])

  // Update active nodes based on progress
  useEffect(() => {
    if (neuralNetworkStyle) {
      setNodes(prev => prev.map(node => ({
        ...node,
        active: node.x <= displayProgress
      })))
    }
  }, [displayProgress, neuralNetworkStyle])

  // Get progress colors based on phase
  const getProgressColors = () => {
    switch (phase) {
      case 'connecting':
        return {
          primary: theme.accent.secondary,
          secondary: theme.accent.primary,
          background: `${theme.accent.secondary}20`
        }
      case 'loading':
        return {
          primary: theme.accent.tertiary,
          secondary: theme.accent.secondary,
          background: `${theme.accent.tertiary}20`
        }
      case 'synchronizing':
        return {
          primary: theme.accent.quaternary,
          secondary: theme.accent.tertiary,
          background: `${theme.accent.quaternary}20`
        }
      case 'finalizing':
        return {
          primary: theme.accent.primary,
          secondary: theme.accent.quaternary,
          background: `${theme.accent.primary}20`
        }
      default:
        return {
          primary: theme.accent.primary,
          secondary: theme.text.primary,
          background: `${theme.accent.primary}20`
        }
    }
  }

  const colors = getProgressColors()

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Percentage Display */}
      {showPercentage && (
        <div className="text-center">
          <motion.div
            className="text-4xl md:text-5xl font-bold font-mono"
            style={{
              color: colors.primary,
              textShadow: `0 0 20px ${colors.primary}`
            }}
            animate={{
              scale: [1, 1.05, 1],
              textShadow: [
                `0 0 20px ${colors.primary}`,
                `0 0 30px ${colors.primary}`,
                `0 0 20px ${colors.primary}`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {animatedPercentage}%
          </motion.div>
        </div>
      )}

      {/* Neural Network Progress Bar */}
      {neuralNetworkStyle ? (
        <div className="relative">
          {/* Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ height: '60px' }}
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            {nodes.map((node, index) => {
              if (index === nodes.length - 1) return null

              const nextNode = nodes[index + 1]
              const isActive = node.active && nextNode.active

              return (
                <motion.line
                  key={`connection-${index}`}
                  x1={node.x}
                  y1="10"
                  x2={nextNode.x}
                  y2="10"
                  stroke={isActive ? colors.primary : colors.background}
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isActive ? 1 : 0 }}
                  transition={{
                    duration: 0.5,
                    delay: node.pulseDelay
                  }}
                />
              )
            })}

            {/* Data Flow Animation */}
            {displayProgress > 0 && (
              <motion.circle
                r="1"
                fill={colors.secondary}
                cy="10"
                animate={{
                  cx: [0, displayProgress],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
          </svg>

          {/* Progress Nodes */}
          <div className="relative flex justify-between items-center h-15 px-2">
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                className="relative w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: node.active ? colors.primary : colors.background,
                  backgroundColor: node.active ? colors.primary : 'transparent'
                }}
                animate={
                  node.active
                    ? {
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          `0 0 0px ${colors.primary}`,
                          `0 0 15px ${colors.primary}`,
                          `0 0 0px ${colors.primary}`
                        ]
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: node.pulseDelay,
                  ease: 'easeInOut'
                }}
              >
                {/* Inner pulse */}
                {node.active && (
                  <motion.div
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.secondary }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: node.pulseDelay,
                      ease: 'easeOut'
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Traditional Progress Bar */
        <div className="relative">
          {/* Background Track */}
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.background }}
          >
            {/* Progress Fill */}
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{ backgroundColor: colors.primary }}
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 w-full h-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${colors.secondary}60, transparent)`
                }}
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </div>

          {/* Progress Indicator */}
          <motion.div
            className="absolute top-0 w-3 h-3 rounded-full -mt-0.5 -ml-1.5"
            style={{
              backgroundColor: colors.secondary,
              boxShadow: `0 0 10px ${colors.secondary}`,
              left: `${displayProgress}%`
            }}
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                `0 0 10px ${colors.secondary}`,
                `0 0 20px ${colors.secondary}`,
                `0 0 10px ${colors.secondary}`
              ]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>
      )}

      {/* Progress Stats */}
      <div className="flex justify-between text-sm font-mono opacity-70">
        <span style={{ color: theme.text.secondary }}>
          {Math.floor(displayProgress)}% Complete
        </span>
        <span style={{ color: theme.text.secondary }}>
          {neuralNetworkStyle
            ? `${nodes.filter(n => n.active).length}/${nodes.length} Nodes`
            : 'Loading...'
          }
        </span>
      </div>
    </div>
  )
}

export default LoadingProgress
