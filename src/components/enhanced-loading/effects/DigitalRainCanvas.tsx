'use client'

/**
 * Digital Rain Canvas Effect
 * Advanced matrix digital rain with multiple character sets,
 * interactive particles, and performance optimization
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ColorScheme } from '../themes/LoadingThemes'

export interface RainParticle {
  x: number
  y: number
  speed: number
  character: string
  opacity: number
  color: string
  size: number
  trail: boolean
  age: number
  maxAge: number
}

export interface DigitalRainCanvasProps {
  theme: ColorScheme
  particleCount?: number
  speed?: number
  characterSets?: string[]
  interactive?: boolean
  onInteraction?: () => void
}

export function DigitalRainCanvas({
  theme,
  particleCount = 100,
  speed = 1,
  characterSets = ['binary', 'japanese', 'crypto'],
  interactive = true,
  onInteraction
}: DigitalRainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const particlesRef = useRef<RainParticle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef(0)

  // Character sets for different phases
  const characters = useMemo(() => {
    const sets: Record<string, string> = {
      binary: '01',
      japanese: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
      crypto: '₿ΞΔ◊ΞETHBTC',
      blockchain: 'DAPPNFTDEFIETHBLOCKHASH',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    return characterSets.map(set => sets[set] || sets.binary).join('')
  }, [characterSets])

  // Initialize particles
  const initializeParticles = useCallback((canvas: HTMLCanvasElement) => {
    const particles: RainParticle[] = []
    const columns = Math.floor(canvas.width / 20)
    const particlesPerColumn = Math.ceil(particleCount / columns)

    for (let col = 0; col < columns; col++) {
      for (let i = 0; i < particlesPerColumn; i++) {
        particles.push({
          x: col * 20 + Math.random() * 20,
          y: Math.random() * canvas.height - canvas.height,
          speed: (0.5 + Math.random() * 2) * speed,
          character: characters[Math.floor(Math.random() * characters.length)],
          opacity: 0.3 + Math.random() * 0.7,
          color: Math.random() > 0.8 ? theme.accent.primary : theme.text.primary,
          size: 12 + Math.random() * 8,
          trail: Math.random() > 0.6,
          age: 0,
          maxAge: 300 + Math.random() * 200
        })
      }
    }

    particlesRef.current = particles
  }, [characters, particleCount, speed, theme])

  // Update particle position and properties
  const updateParticle = useCallback((particle: RainParticle, canvas: HTMLCanvasElement, deltaTime: number) => {
    particle.y += particle.speed * deltaTime * 0.1
    particle.age += deltaTime

    // Fade effect based on age
    particle.opacity = Math.max(0, 1 - (particle.age / particle.maxAge))

    // Reset particle if it goes off screen or ages out
    if (particle.y > canvas.height + 50 || particle.age >= particle.maxAge) {
      particle.y = -50 - Math.random() * 100
      particle.x = Math.random() * canvas.width
      particle.character = characters[Math.floor(Math.random() * characters.length)]
      particle.speed = (0.5 + Math.random() * 2) * speed
      particle.opacity = 0.3 + Math.random() * 0.7
      particle.color = Math.random() > 0.8 ? theme.accent.primary : theme.text.primary
      particle.age = 0
      particle.maxAge = 300 + Math.random() * 200
    }

    // Interactive mouse avoidance
    if (interactive) {
      const dx = particle.x - mouseRef.current.x
      const dy = particle.y - mouseRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        const force = (100 - distance) / 100
        particle.x += (dx / distance) * force * 2
        particle.opacity = Math.min(1, particle.opacity + force * 0.3)

        if (distance < 50) {
          onInteraction?.()
        }
      }
    }
  }, [characters, speed, theme, interactive, onInteraction])

  // Render particles with trails
  const renderParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: RainParticle
  ) => {
    ctx.save()

    // Main character
    ctx.globalAlpha = particle.opacity
    ctx.fillStyle = particle.color
    ctx.font = `${particle.size}px 'Fira Code', 'Source Code Pro', monospace`
    ctx.textAlign = 'center'
    ctx.fillText(particle.character, particle.x, particle.y)

    // Glow effect
    if (particle.trail) {
      ctx.shadowColor = particle.color
      ctx.shadowBlur = 15
      ctx.globalAlpha = particle.opacity * 0.5
      ctx.fillText(particle.character, particle.x, particle.y)
    }

    // Trail effect
    if (particle.trail && particle.y > 0) {
      const trailLength = 5
      for (let i = 1; i <= trailLength; i++) {
        const trailY = particle.y - i * 20
        const trailOpacity = particle.opacity * (1 - i / trailLength) * 0.3

        if (trailY > 0) {
          ctx.globalAlpha = trailOpacity
          ctx.fillStyle = particle.color
          ctx.fillText(particle.character, particle.x, trailY)
        }
      }
    }

    ctx.restore()
  }, [])

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    // Clear canvas with fade effect
    ctx.fillStyle = `rgba(0, 0, 0, 0.05)`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and render particles
    particlesRef.current.forEach(particle => {
      updateParticle(particle, canvas, deltaTime)
      renderParticle(ctx, particle)
    })

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [updateParticle, renderParticle])

  // Handle mouse movement for interactivity
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }, [])

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initializeParticles(canvas)
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    // Add mouse listener for interactivity
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove)
    }

    // Start animation
    lastTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', updateSize)
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animate, handleMouseMove, initializeParticles, interactive])

  // Update particles when theme or settings change
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && particlesRef.current.length > 0) {
      // Update existing particles with new theme colors
      particlesRef.current.forEach(particle => {
        if (Math.random() > 0.8) {
          particle.color = theme.accent.primary
        } else {
          particle.color = theme.text.primary
        }
      })
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{
        zIndex: 1,
        opacity: 0.7,
        mixBlendMode: 'screen'
      }}
    />
  )
}

export default DigitalRainCanvas
