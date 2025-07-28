import { MatrixBackground } from '@/components/v0-dashboard/matrix-background'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SimpleLoadingProps {
  isVisible: boolean
}

export function SimpleLoading({ isVisible }: SimpleLoadingProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000 // 2 seconds total
    const interval = 50 // Update every 50ms
    const increment = 100 / (duration / interval) // Progress increment per update

    let currentProgress = 0

    const progressTimer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(progressTimer)
      }
      setProgress(currentProgress)
    }, interval)

    return () => {
      clearInterval(progressTimer)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black text-slate-100 relative overflow-hidden">
      {/* Matrix Background - Same as dashboard */}
      <MatrixBackground />

      {/* Centered Loading Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen space-y-8">
        {/* App Name - Matching the header styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-white">
            BRADLEY
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Advanced Cryptocurrency Intelligence Platform
          </p>
        </motion.div>

        {/* Single Clean Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center space-y-4"
        >
          {/* Progress Bar - Clean and minimal */}
          <div className="w-64 h-1 bg-slate-800/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
            />
          </div>

          {/* Loading Text */}
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            Loading...
          </div>
        </motion.div>
      </div>
    </div>
  )
}
