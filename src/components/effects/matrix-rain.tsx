'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { matrixDesignSystem } from '@/styles/design-tokens';

// Matrix characters for the digital rain
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface MatrixRainProps {
  intensity?: 'low' | 'medium' | 'high' | 'ultra';
  speed?: 'slow' | 'medium' | 'fast' | 'ultraFast';
  className?: string;
  enableGlow?: boolean;
  enableFlicker?: boolean;
}

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  opacity: number;
  id: number;
}

export default function MatrixRain({
  intensity = 'medium',
  speed = 'medium',
  className = '',
  enableGlow = true,
  enableFlicker = true,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const rainDropsRef = useRef<RainDrop[]>([]);
  const lastTimeRef = useRef<number>(0);
  
  // Performance settings based on device capabilities
  const performanceSettings = useMemo(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return {
        dropCount: 50,
        speedMultiplier: 1,
        targetFPS: 60,
        columnWidth: 20,
        fontSize: 14,
      };
    }
    
    const isHighEnd = (window.navigator.hardwareConcurrency || 4) >= 8;
    const isMobile = window.innerWidth < 768;
    
    let dropCount: number;
    switch (intensity) {
      case 'low':
        dropCount = isMobile ? 15 : 30;
        break;
      case 'medium':
        dropCount = isMobile ? 25 : 50;
        break;
      case 'high':
        dropCount = isMobile ? 35 : 70;
        break;
      case 'ultra':
        dropCount = isHighEnd ? (isMobile ? 50 : 100) : (isMobile ? 30 : 60);
        break;
      default:
        dropCount = isMobile ? 25 : 50;
    }
    
    const speedMultiplier = {
      slow: 0.5,
      medium: 1,
      fast: 1.5,
      ultraFast: 2.5,
    }[speed];
    
    return {
      dropCount,
      speedMultiplier,
      targetFPS: 60,
      columnWidth: isMobile ? 15 : 20,
      fontSize: isMobile ? 12 : 14,
    };
  }, [intensity, speed]);
  
  // Initialize rain drops
  const initializeRainDrops = useCallback((width: number, height: number) => {
    const drops: RainDrop[] = [];
    const columnCount = Math.floor(width / performanceSettings.columnWidth);
    
    for (let i = 0; i < performanceSettings.dropCount; i++) {
      const column = Math.floor(Math.random() * columnCount);
      const charCount = Math.floor(Math.random() * 20) + 10; // 10-30 characters per drop
      const chars = Array.from({ length: charCount }, () => 
        MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      );
      
      drops.push({
        x: column * performanceSettings.columnWidth,
        y: Math.random() * -height, // Start above screen
        speed: (Math.random() * 2 + 1) * performanceSettings.speedMultiplier,
        chars,
        opacity: Math.random() * 0.5 + 0.5,
        id: i,
      });
    }
    
    rainDropsRef.current = drops;
  }, [performanceSettings]);
  
  // Draw a single rain drop
  const drawRainDrop = useCallback((
    ctx: CanvasRenderingContext2D,
    drop: RainDrop,
    time: number
  ) => {
    const { x, y, chars, opacity } = drop;
    const charHeight = performanceSettings.fontSize * 1.2;
    
    chars.forEach((char, index) => {
      const charY = y + (index * charHeight);
      
      // Skip if character is off screen
      if (charY < -charHeight || charY > ctx.canvas.height + charHeight) {
        return;
      }
      
      // Calculate character opacity (brighter at the head)
      const distanceFromHead = index / chars.length;
      let charOpacity = opacity * (1 - distanceFromHead * 0.8);
      
      // Add flicker effect
      if (enableFlicker && Math.random() < 0.02) {
        charOpacity *= 0.3;
      }
      
      // Set character color and glow
      if (index === 0) {
        // Head character - brightest
        ctx.fillStyle = matrixDesignSystem.colors.matrixGreenLight;
        if (enableGlow) {
          ctx.shadowColor = matrixDesignSystem.colors.matrixGreen;
          ctx.shadowBlur = 10;
        }
      } else if (index < 3) {
        // Near head - bright green
        ctx.fillStyle = `rgba(0, 255, 65, ${charOpacity})`;
        if (enableGlow) {
          ctx.shadowColor = matrixDesignSystem.colors.matrixGreen;
          ctx.shadowBlur = 5;
        }
      } else {
        // Tail - dimmer green
        ctx.fillStyle = `rgba(0, 204, 51, ${charOpacity * 0.7})`;
        ctx.shadowBlur = 0;
      }
      
      // Draw character
      ctx.fillText(char, x, charY);
      
      // Reset shadow for next character
      ctx.shadowBlur = 0;
    });
  }, [performanceSettings.fontSize, enableGlow, enableFlicker]);
  
  // Animation loop
  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Throttle to target FPS
    const deltaTime = currentTime - lastTimeRef.current;
    const targetFrameTime = 1000 / performanceSettings.targetFPS;
    
    if (deltaTime < targetFrameTime) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    lastTimeRef.current = currentTime;
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set font
    ctx.font = `${performanceSettings.fontSize}px "Fira Code", monospace`;
    ctx.textAlign = 'center';
    
    // Update and draw rain drops
    rainDropsRef.current.forEach((drop) => {
      // Update position
      drop.y += drop.speed;
      
      // Reset drop if it's off screen
      if (drop.y > canvas.height + 200) {
        drop.y = Math.random() * -500 - 100;
        drop.x = Math.floor(Math.random() * (canvas.width / performanceSettings.columnWidth)) * performanceSettings.columnWidth;
        drop.speed = (Math.random() * 2 + 1) * performanceSettings.speedMultiplier;
        drop.opacity = Math.random() * 0.5 + 0.5;
        
        // Occasionally change characters
        if (Math.random() < 0.1) {
          drop.chars = drop.chars.map(() => 
            MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
          );
        }
      }
      
      // Draw the drop
      drawRainDrop(ctx, drop, currentTime);
    });
    
    animationRef.current = requestAnimationFrame(animate);
  }, [performanceSettings, drawRainDrop]);
  
  // Handle canvas resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    initializeRainDrops(rect.width, rect.height);
  }, [initializeRainDrops]);
  
  // Initialize and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up canvas
    handleResize();
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, animate]);
  
  return (
    <div className={`matrix-rain-container ${className}`}>
      <canvas
        ref={canvasRef}
        className="matrix-gpu-accelerated"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </div>
  );
} 