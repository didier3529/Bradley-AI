'use client'

/**
 * Enhanced Loading Demo Page
 * Showcase and test the enhanced Bradley AI loading experience
 */

import { EnhancedBradleyAILoader } from '@/components/enhanced-loading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function LoadingDemoPage() {
  const [showLoader, setShowLoader] = useState(false)
  const [enableAudio, setEnableAudio] = useState(false)
  const [enableParticles, setEnableParticles] = useState(true)
  const [enableDigitalRain, setEnableDigitalRain] = useState(true)
  const [performanceMode, setPerformanceMode] = useState<'auto' | 'high' | 'medium' | 'low'>('auto')

  const handleStartDemo = () => {
    setShowLoader(true)
  }

  const handleLoaderComplete = () => {
    setShowLoader(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4 font-mono">
            BRADLEY AI
          </h1>
          <h2 className="text-2xl text-cyan-400 mb-2">
            Enhanced Loading Experience Demo
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Experience the sophisticated cyberpunk-inspired loading system featuring
            digital rain effects, dynamic branding, progressive loading states, and
            immersive audio-visual feedback.
          </p>
        </motion.div>

        {/* Demo Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 bg-black/40 border-cyan-500/30 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
              Demo Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Audio Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-cyan-400">Audio & Effects</h4>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-audio" className="text-white">
                    Enable Audio Effects
                  </Label>
                  <Switch
                    id="enable-audio"
                    checked={enableAudio}
                    onCheckedChange={setEnableAudio}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-particles" className="text-white">
                    Interactive Particles
                  </Label>
                  <Switch
                    id="enable-particles"
                    checked={enableParticles}
                    onCheckedChange={setEnableParticles}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-rain" className="text-white">
                    Digital Rain Effect
                  </Label>
                  <Switch
                    id="enable-rain"
                    checked={enableDigitalRain}
                    onCheckedChange={setEnableDigitalRain}
                  />
                </div>
              </div>

              {/* Performance Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-cyan-400">Performance</h4>

                <div className="space-y-2">
                  <Label className="text-white">Performance Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['auto', 'high', 'medium', 'low'] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={performanceMode === mode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPerformanceMode(mode)}
                        className={`${
                          performanceMode === mode
                            ? 'bg-cyan-500 text-black'
                            : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-cyan-500/30" />

            {/* Demo Button */}
            <div className="text-center">
              <Button
                onClick={handleStartDemo}
                disabled={showLoader}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-8 py-3 text-lg"
              >
                {showLoader ? 'Loading in Progress...' : 'Start Loading Demo'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Features Overview */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            {
              title: 'Digital Rain Matrix',
              description: 'Advanced canvas-based digital rain with multiple character sets and interactive particles',
              icon: '🌧️'
            },
            {
              title: 'Dynamic Branding',
              description: 'Logo assembly animation with glitch effects and breathing glow animations',
              icon: '✨'
            },
            {
              title: 'Progressive Loading',
              description: 'Five distinct phases with contextual messages and neural network progress visualization',
              icon: '🔄'
            },
            {
              title: 'Audio Experience',
              description: 'Procedurally generated ambient sounds and interactive audio feedback',
              icon: '🔊'
            },
            {
              title: 'Performance Adaptive',
              description: 'Automatic quality adjustment based on device capabilities and frame rate',
              icon: '⚡'
            },
            {
              title: 'Accessibility First',
              description: 'Respects reduced motion preferences and provides high contrast options',
              icon: '♿'
            }
          ].map((feature, index) => (
            <Card
              key={index}
              className="p-4 bg-black/30 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </Card>
          ))}
        </motion.div>

        {/* Technical Details */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-6 bg-black/40 border-green-500/30 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Technical Implementation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="text-green-400 font-medium mb-2">Frontend Technologies</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• React 19 with TypeScript</li>
                  <li>• Framer Motion for animations</li>
                  <li>• Canvas API for digital rain</li>
                  <li>• Web Audio API for sound</li>
                  <li>• CSS-in-JS with Tailwind</li>
                </ul>
              </div>

              <div>
                <h4 className="text-green-400 font-medium mb-2">Performance Features</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• Adaptive quality scaling</li>
                  <li>• 60fps target with fallbacks</li>
                  <li>• Memory usage monitoring</li>
                  <li>• Device capability detection</li>
                  <li>• Reduced motion support</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Loader */}
      <EnhancedBradleyAILoader
        isVisible={showLoader}
        onComplete={handleLoaderComplete}
        enableAudio={enableAudio}
        enableParticles={enableParticles}
        enableDigitalRain={enableDigitalRain}
        performanceMode={performanceMode}
      />
    </div>
  )
}
