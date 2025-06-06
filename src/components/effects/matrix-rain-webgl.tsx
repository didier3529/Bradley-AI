'use client';

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { matrixDesignSystem } from '@/styles/design-tokens';

// Matrix characters for the digital rain
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// WebGL shader for Matrix rain effect
const MatrixRainMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(1, 1),
    mousePosition: new THREE.Vector2(0, 0),
    intensity: 1.0,
    speed: 1.0,
    rainDrops: new THREE.DataTexture(new Float32Array(4096), 64, 16, THREE.RGBAFormat, THREE.FloatType),
    glowIntensity: 1.0,
    cyberBlueAmount: 0.0,
    interactionRadius: 0.0,
    dataUpdates: 0.0,
  },
  // Vertex shader
  /*glsl*/`
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  /*glsl*/`
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mousePosition;
    uniform float intensity;
    uniform float speed;
    uniform sampler2D rainDrops;
    uniform float glowIntensity;
    uniform float cyberBlueAmount;
    uniform float interactionRadius;
    uniform float dataUpdates;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Matrix green color
    vec3 matrixGreen = vec3(0.0, 1.0, 0.255);
    vec3 cyberBlue = vec3(0.0, 0.831, 1.0);
    vec3 backgroundColor = vec3(0.039, 0.039, 0.039);
    
    // Random function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Noise function for organic movement
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    // Matrix character pattern
    float matrixChar(vec2 pos) {
      vec2 charGrid = floor(pos * 40.0);
      float charRandom = random(charGrid);
      
      // Character appearance probability
      float charAppear = step(0.85, charRandom);
      
      // Character flicker
      float flicker = sin(time * 10.0 + charRandom * 100.0) * 0.5 + 0.5;
      
      return charAppear * flicker;
    }
    
    // Digital rain columns
    vec3 digitalRain(vec2 uv) {
      vec3 color = backgroundColor;
      
      // Number of columns
      float columns = resolution.x / 20.0;
      float columnIndex = floor(uv.x * columns);
      float columnPos = fract(uv.x * columns);
      
      // Rain drop animation
      float dropSpeed = speed * 2.0;
      float dropOffset = random(vec2(columnIndex, 0.0)) * 1000.0;
      float dropY = fract((time * dropSpeed + dropOffset) * 0.1);
      
      // Drop length and position
      float dropLength = 0.1 + random(vec2(columnIndex, 1.0)) * 0.2;
      float dropStart = dropY;
      float dropEnd = dropY - dropLength;
      
      // Check if current pixel is within a drop
      if (uv.y <= dropStart && uv.y >= dropEnd) {
        float dropProgress = (dropStart - uv.y) / dropLength;
        
        // Character pattern within drop
        float charPattern = matrixChar(vec2(uv.x, uv.y + time));
        
        // Brightness based on position in drop (head is brightest)
        float brightness = 1.0 - dropProgress * 0.8;
        
        // Mouse interaction
        vec2 mouseUV = mousePosition / resolution;
        float mouseDist = distance(uv, mouseUV);
        float mouseInfluence = smoothstep(interactionRadius, 0.0, mouseDist);
        
        // Data update pulse effect
        float dataPulse = sin(dataUpdates * 10.0) * 0.5 + 0.5;
        
        // Color mixing between matrix green and cyber blue
        vec3 baseColor = mix(matrixGreen, cyberBlue, cyberBlueAmount + mouseInfluence * 0.5);
        
        // Apply effects
        float finalBrightness = brightness * charPattern * intensity * glowIntensity;
        finalBrightness += mouseInfluence * 0.3;
        finalBrightness += dataPulse * 0.1;
        
        color = baseColor * finalBrightness;
        
        // Add glow effect
        float glow = exp(-mouseDist * 5.0) * mouseInfluence;
        color += cyberBlue * glow * 0.5;
      }
      
      return color;
    }
    
    // Glitch effect
    vec3 glitchEffect(vec3 color, vec2 uv) {
      float glitchAmount = sin(time * 50.0) * 0.01;
      
      // Horizontal displacement
      float displaceX = sin(uv.y * 100.0 + time * 20.0) * glitchAmount;
      vec2 glitchedUV = vec2(uv.x + displaceX, uv.y);
      
      // Color channel separation
      float r = digitalRain(glitchedUV + vec2(0.003, 0.0)).r;
      float g = digitalRain(glitchedUV).g;
      float b = digitalRain(glitchedUV - vec2(0.003, 0.0)).b;
      
      return vec3(r, g, b);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Base digital rain
      vec3 color = digitalRain(uv);
      
      // Add subtle glitch effect
      if (interactionRadius > 0.1) {
        color = mix(color, glitchEffect(color, uv), 0.3);
      }
      
      // Add scanning lines
      float scanlines = sin(uv.y * resolution.y * 2.0) * 0.02;
      color += scanlines;
      
      // Vignette effect
      float vignette = smoothstep(0.8, 0.2, length(uv - 0.5));
      color *= vignette;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// Extend Three.js with our custom material
extend({ MatrixRainMaterial });

// Declare the material type for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      matrixRainMaterial: any;
    }
  }
}

interface MatrixRainProps {
  intensity?: 'low' | 'medium' | 'high' | 'ultra';
  speed?: 'slow' | 'medium' | 'fast' | 'ultraFast';
  theme?: 'matrix-green' | 'cyber-blue' | 'mixed';
  interactive?: boolean;
  glowIntensity?: number;
  className?: string;
  onDataUpdate?: () => void;
  enableGlitch?: boolean;
  enableResponsiveTouchPoints?: boolean;
}

interface PerformanceConfig {
  targetFPS: number;
  adaptiveQuality: boolean;
  memoryLimit: number; // MB
  cpuThreshold: number; // percentage
}

// Performance monitoring hook
function usePerformanceMonitor(config: PerformanceConfig) {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [qualityLevel, setQualityLevel] = useState(1.0);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime.current >= 1000) {
      const currentFps = frameCount.current;
      setFps(currentFps);
      frameCount.current = 0;
      lastTime.current = currentTime;
      
      // Adaptive quality based on performance
      if (config.adaptiveQuality) {
        if (currentFps < config.targetFPS * 0.8) {
          setQualityLevel(prev => Math.max(0.3, prev - 0.1));
        } else if (currentFps > config.targetFPS * 0.95) {
          setQualityLevel(prev => Math.min(1.0, prev + 0.05));
        }
      }
      
      // Memory monitoring (if available)
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMemoryUsage(memInfo.usedJSHeapSize / 1024 / 1024);
      }
    }
  });
  
  return { fps, memoryUsage, qualityLevel };
}

// Main Matrix Rain WebGL component
function MatrixRainMesh({ 
  intensity = 'medium',
  speed = 'medium', 
  theme = 'mixed',
  interactive = true,
  glowIntensity = 1.0,
  onDataUpdate,
  enableGlitch = true 
}: MatrixRainProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const { viewport, size } = useThree();
  
  // Performance monitoring
  const performanceConfig: PerformanceConfig = {
    targetFPS: 60,
    adaptiveQuality: true,
    memoryLimit: 100,
    cpuThreshold: 80
  };
  
  const { fps, memoryUsage, qualityLevel } = usePerformanceMonitor(performanceConfig);
  
  // Mouse interaction state
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2(0, 0));
  const [interactionRadius, setInteractionRadius] = useState(0);
  const [dataUpdateTrigger, setDataUpdateTrigger] = useState(0);
  
  // Convert intensity to numeric value
  const intensityValue = useMemo(() => {
    const values = { low: 0.3, medium: 0.6, high: 0.9, ultra: 1.2 };
    return values[intensity] * qualityLevel;
  }, [intensity, qualityLevel]);
  
  // Convert speed to numeric value
  const speedValue = useMemo(() => {
    const values = { slow: 0.3, medium: 0.6, fast: 1.0, ultraFast: 1.5 };
    return values[speed];
  }, [speed]);
  
  // Theme color mixing
  const cyberBlueAmount = useMemo(() => {
    const values = { 'matrix-green': 0.0, 'cyber-blue': 1.0, 'mixed': 0.3 };
    return values[theme];
  }, [theme]);
  
  // Mouse interaction handler
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!interactive) return;
    
    const rect = (event.target as Element)?.getBoundingClientRect();
    if (rect) {
      const x = ((event.clientX - rect.left) / rect.width) * size.width;
      const y = ((rect.height - (event.clientY - rect.top)) / rect.height) * size.height;
      setMousePosition(new THREE.Vector2(x, y));
      setInteractionRadius(150);
    }
  }, [interactive, size]);
  
  // Click interaction
  const handleClick = useCallback(() => {
    if (!interactive) return;
    
    setInteractionRadius(200);
    setDataUpdateTrigger(prev => prev + 1);
    onDataUpdate?.();
    
    // Decay interaction
    setTimeout(() => setInteractionRadius(150), 200);
    setTimeout(() => setInteractionRadius(100), 500);
    setTimeout(() => setInteractionRadius(0), 1000);
  }, [interactive, onDataUpdate]);
  
  // Data update effect
  useEffect(() => {
    if (onDataUpdate) {
      const interval = setInterval(() => {
        setDataUpdateTrigger(prev => prev + 0.1);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [onDataUpdate]);
  
  // Animation loop
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.resolution.set(size.width, size.height);
      materialRef.current.mousePosition = mousePosition;
      materialRef.current.intensity = intensityValue;
      materialRef.current.speed = speedValue;
      materialRef.current.glowIntensity = glowIntensity;
      materialRef.current.cyberBlueAmount = cyberBlueAmount;
      materialRef.current.interactionRadius = interactionRadius / Math.max(size.width, size.height);
      materialRef.current.dataUpdates = dataUpdateTrigger;
    }
  });
  
  // Event listeners
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas || !interactive) return;
    
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', handleClick);
    
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [handlePointerMove, handleClick, interactive]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Force garbage collection of WebGL resources
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, []);
  
  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <matrixRainMaterial
        ref={materialRef}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Performance monitoring display (development only)
function PerformanceDisplay({ fps, memoryUsage }: { fps: number; memoryUsage: number }) {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed top-4 right-4 bg-black/80 text-green-400 p-2 rounded font-mono text-xs z-50">
      <div>FPS: {fps}</div>
      <div>Memory: {memoryUsage.toFixed(1)}MB</div>
    </div>
  );
}

// Main exported component
export default function MatrixRainWebGL({
  intensity = 'medium',
  speed = 'medium',
  theme = 'mixed',
  interactive = true,
  glowIntensity = 1.0,
  className = '',
  onDataUpdate,
  enableGlitch = true,
  enableResponsiveTouchPoints = true,
}: MatrixRainProps) {
  const [performanceStats, setPerformanceStats] = useState({ fps: 60, memoryUsage: 0 });
  
  // Accessibility: Respect reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Fallback for reduced motion
  if (reducedMotion) {
    return (
      <div 
        className={`matrix-rain-static ${className}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(180deg, 
            rgba(0, 255, 65, 0.1) 0%, 
            rgba(0, 212, 255, 0.05) 50%, 
            rgba(0, 0, 0, 0.8) 100%
          )`,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    );
  }
  
  return (
    <div className={`matrix-rain-webgl ${className}`}>
      <Canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: interactive ? 'auto' : 'none',
          zIndex: -1,
        }}
        gl={{
          antialias: false, // Disable for performance
          alpha: true,
          premultipliedAlpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{
          position: [0, 0, 1],
          near: 0.1,
          far: 1000,
        }}
        performance={{
          min: 0.2, // Minimum performance factor
          max: 1.0, // Maximum performance factor
          debounce: 200, // Debounce time for performance changes
        }}
      >
        <MatrixRainMesh
          intensity={intensity}
          speed={speed}
          theme={theme}
          interactive={interactive}
          glowIntensity={glowIntensity}
          onDataUpdate={onDataUpdate}
          enableGlitch={enableGlitch}
        />
      </Canvas>
      
      <PerformanceDisplay fps={performanceStats.fps} memoryUsage={performanceStats.memoryUsage} />
    </div>
  );
} 