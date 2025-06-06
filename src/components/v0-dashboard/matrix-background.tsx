"use client"

import { useEffect, useRef } from 'react'

export function MatrixBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const setCanvasSize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        setCanvasSize()

        // Matrix rain characters (crypto-themed)
        const matrixChars = '₿ΞЭADE0123456789$%&*()@#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        const fontSize = 14
        const columns = Math.floor(canvas.width / fontSize)
        const drops: number[] = []

        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * canvas.height / fontSize)
        }

        const draw = () => {
            // Create stronger fade effect with deeper black for more contrast
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Enhanced Matrix electric blue with multiple brightness levels
            ctx.font = `${fontSize}px monospace`

            for (let i = 0; i < drops.length; i++) {
                // Get random character
                const text = matrixChars[Math.floor(Math.random() * matrixChars.length)]

                // Enhanced characters with more intense glow effect
                const opacity = Math.random() * 0.7 + 0.5 // Higher base opacity (0.5-1.2)
                const isTrailHead = Math.random() > 0.85 // 15% chance for bright trail head

                if (isTrailHead) {
                    // Bright glowing trail head with electric blue
                    ctx.shadowColor = '#00ccff'
                    ctx.shadowBlur = 25
                    ctx.fillStyle = `rgba(0, 204, 255, ${Math.min(opacity, 1.0)})`
                } else {
                    // Regular characters with enhanced glow
                    ctx.shadowColor = '#00ccff'
                    ctx.shadowBlur = 15
                    ctx.fillStyle = `rgba(0, 204, 255, ${Math.min(opacity * 0.8, 0.9)})`
                }

                ctx.fillText(text, i * fontSize, drops[i] * fontSize)

                // Add extra bright accent characters (more prominent shine)
                if (Math.random() > 0.90) {
                    ctx.shadowBlur = 30
                    ctx.fillStyle = 'rgba(0, 204, 255, 1.0)'
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize)
                }

                // Reset shadow for next iteration
                ctx.shadowBlur = 0

                // Reset drop randomly or when it reaches bottom
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0
                }

                drops[i]++
            }
        }

        const animationId = setInterval(draw, 50)

        // Handle resize
        const handleResize = () => {
            setCanvasSize()
            const newColumns = Math.floor(canvas.width / fontSize)
            while (drops.length < newColumns) {
                drops.push(Math.floor(Math.random() * canvas.height / fontSize))
            }
            drops.splice(newColumns)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            clearInterval(animationId)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-40"
            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
        />
    )
}
