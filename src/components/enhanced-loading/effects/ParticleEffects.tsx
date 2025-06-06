'use client'

/**
 * Particle Effects Component
 * Interactive particles that respond to loading phases
 * and provide visual feedback for user interactions
 */

import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useRef } from 'react'
import { LoadingPhase } from '../managers/LoadingPhaseManager'
import { ColorScheme } from '../themes/LoadingThemes'

export interface ParticleEffectsProps {
  phase: LoadingPhase
  density?: number
  theme: ColorScheme
  onParticleClick?: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
  type: 'float' | 'spark' | 'glow'
}

export function ParticleEffects({
  phase,
  density = 1.0,
  theme,
  onParticleClick
}: ParticleEffectsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef(0)

  // Get particle configuration based on phase
  const getPhaseConfig = () => {
    switch (phase) {
      case 'initializing':
        return {
          count: Math.floor(20 * density),
          speed: 0.5,
          colors: [theme.accent.primary, theme.text.primary],
          types: ['float', 'glow'] as const
        }
      case 'connecting':
        return {
          count: Math.floor(30 * density),
          speed: 0.8,
          colors: [theme.accent.secondary, theme.accent.primary],
          types: ['float', 'spark'] as const
        }
      case 'loading':
        return {
          count: Math.floor(40 * density),
          speed: 1.0,
          colors: [theme.accent.tertiary, theme.accent.secondary],
          types: ['spark', 'glow'] as const
        }
      case 'synchronizing':
        return {
          count: Math.floor(50 * density),
          speed: 1.2,
          colors: [theme.accent.quaternary, theme.accent.tertiary],
          types: ['spark', 'float'] as const
        }
      case 'finalizing':
        return {
          count: Math.floor(60 * density),
          speed: 1.5,
          colors: [theme.accent.primary, theme.accent.quaternary],
          types: ['glow', 'spark'] as const
        }
      default:
        return {
          count: Math.floor(15 * density),
          speed: 0.3,
          colors: [theme.text.primary],
          types: ['float'] as const
        }
    }
  }

  // Create a new particle
  const createParticle = useCallback((container: HTMLDivElement, config: ReturnType<typeof getPhaseConfig>): Particle => {
    const rect = container.getBoundingClientRect()
    const type = config.types[Math.floor(Math.random() * config.types.length)]

    return {
      id: Math.random(),
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      size: type === 'glow' ? 8 + Math.random() * 4 : 4 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.7,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      life: 0,
      maxLife: 300 + Math.random() * 200,
      type
    }
  }, [])

  // Update particle position and properties
  const updateParticle = useCallback((particle: Particle, container: HTMLDivElement, deltaTime: number) => {
    const rect = container.getBoundingClientRect()

    // Update position
    particle.x += particle.vx * deltaTime * 0.01
    particle.y += particle.vy * deltaTime * 0.01
    particle.life += deltaTime

    // Mouse interaction
    const dx = particle.x - mouseRef.current.x
    const dy = particle.y - mouseRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 100) {
      const force = (100 - distance) / 100
      particle.vx += (dx / distance) * force * 0.1
      particle.vy += (dy / distance) * force * 0.1
      particle.opacity = Math.min(1, particle.opacity + force * 0.3)
    }

    // Boundary wrapping
    if (particle.x < 0) particle.x = rect.width
    if (particle.x > rect.width) particle.x = 0
    if (particle.y < 0) particle.y = rect.height
    if (particle.y > rect.height) particle.y = 0

    // Fade out based on life
    particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife))

    // Velocity dampening
    particle.vx *= 0.99
    particle.vy *= 0.99

    return particle.life < particle.maxLife
  }, [])

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    const container = containerRef.current
    if (!container) return

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    const config = getPhaseConfig()

    // Update existing particles
    particlesRef.current = particlesRef.current.filter(particle =>
      updateParticle(particle, container, deltaTime)
    )

    // Add new particles to maintain count
    while (particlesRef.current.length < config.count) {
      particlesRef.current.push(createParticle(container, config))
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [createParticle, updateParticle, getPhaseConfig])

  // Handle mouse movement
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }, [])

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    onParticleClick?.()

    // Create explosion effect
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    const config = getPhaseConfig()

    // Add burst particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const speed = 2 + Math.random() * 3

      particlesRef.current.push({
        id: Math.random(),
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 4,
        opacity: 1,
        color: config.colors[0],
        life: 0,
        maxLife: 100 + Math.random() * 50,
        type: 'spark'
      })
    }
  }, [onParticleClick, getPhaseConfig])

  // Initialize and start animation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Initialize particles
    const config = getPhaseConfig()
    particlesRef.current = []

    for (let i = 0; i < config.count; i++) {
      particlesRef.current.push(createParticle(container, config))
    }

    // Start animation
    lastTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase, density, createParticle, animate])

  // Get particle style based on type
  const getParticleStyle = (particle: Particle) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      borderRadius: '50%',
      opacity: particle.opacity,
      pointerEvents: 'none' as const,
      transform: 'translate(-50%, -50%)'
    }

    switch (particle.type) {
      case 'glow':
        return {
          ...baseStyle,
          backgroundColor: particle.color,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          filter: 'blur(1px)'
        }
      case 'spark':
        return {
          ...baseStyle,
          backgroundColor: particle.color,
          boxShadow: `0 0 ${particle.size}px ${particle.color}`
        }
      default:
        return {
          ...baseStyle,
          backgroundColor: particle.color
        }
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ zIndex: 2 }}
    >
      {/* Render particles */}
      {particlesRef.current.map(particle => (
        <motion.div
          key={particle.id}
          style={getParticleStyle(particle)}
          animate={{
            scale: particle.type === 'glow' ? [1, 1.2, 1] : 1,
            rotate: particle.type === 'spark' ? [0, 360] : 0
          }}
          transition={{
            duration: particle.type === 'glow' ? 2 : 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Interactive hint */}
      <motion.div
        className="absolute bottom-4 right-4 text-xs font-mono opacity-50 pointer-events-none"
        style={{ color: theme.text.tertiary }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Click to interact
      </motion.div>
    </div>
  )
}

export default ParticleEffects
