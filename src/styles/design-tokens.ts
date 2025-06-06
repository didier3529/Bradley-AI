// Matrix Design Tokens - June 2025
// PHASE-0: Matrix Digital Rain Foundation

export const matrixColors = {
  // Primary Matrix Colors
  cyberBlue: '#00d4ff',
  matrixGreen: '#00ff41',
  deepBlack: '#000000',
  
  // Matrix Green Variants
  matrixGreenLight: '#39ff74',
  matrixGreenDark: '#00cc33',
  matrixGreenGlow: '#00ff41cc',
  
  // Cyber Blue Variants
  cyberBlueLight: '#33ddff',
  cyberBlueDark: '#0099cc',
  cyberBlueGlow: '#00d4ffcc',
  
  // Background Variants
  matrixBlack: '#0a0a0a',
  matrixDarkGray: '#1a1a1a',
  matrixMediumGray: '#2a2a2a',
  
  // Accent Colors
  neonPink: '#ff0080',
  electricPurple: '#8000ff',
  warningAmber: '#ffaa00',
  
  // Transparency Levels
  overlay: 'rgba(0, 0, 0, 0.8)',
  glassEffect: 'rgba(0, 212, 255, 0.1)',
  rainDropAlpha: 'rgba(0, 255, 65, 0.7)',
} as const;

export const matrixAnimations = {
  // Digital Rain Settings
  rainSpeed: {
    slow: '8s',
    medium: '5s',
    fast: '3s',
    ultraFast: '1.5s',
  },
  
  // Glow Effects
  glowPulse: {
    duration: '2s',
    easing: 'ease-in-out',
  },
  
  // Text Effects
  typewriter: {
    duration: '1.5s',
    easing: 'steps(20, end)',
  },
  
  // Transitions
  fadeIn: {
    duration: '0.5s',
    easing: 'ease-out',
  },
  
  slideIn: {
    duration: '0.7s',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;

export const matrixTypography = {
  // Matrix-style fonts
  fontFamily: {
    mono: '"Fira Code", "Consolas", "Monaco", monospace',
    display: '"Orbitron", "Exo 2", sans-serif',
    body: '"Inter", "Segoe UI", sans-serif',
  },
  
  // Font sizes with Matrix aesthetic
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    matrix: '0.8rem', // Special size for Matrix rain
  },
  
  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    matrix: '1.2', // Tight for Matrix effect
  },
} as const;

export const matrixSpacing = {
  // Matrix-specific spacing
  rainColumn: '20px',
  glowRadius: '10px',
  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '8px',
    matrix: '2px', // Sharp, cyberpunk edges
  },
} as const;

export const matrixEffects = {
  // Box shadows for glow effects
  boxShadow: {
    matrixGlow: `0 0 20px ${matrixColors.matrixGreenGlow}`,
    cyberGlow: `0 0 20px ${matrixColors.cyberBlueGlow}`,
    innerGlow: `inset 0 0 20px ${matrixColors.matrixGreenGlow}`,
    textGlow: `0 0 10px ${matrixColors.matrixGreen}`,
  },
  
  // Text shadows
  textShadow: {
    matrixGlow: `0 0 10px ${matrixColors.matrixGreen}`,
    cyberGlow: `0 0 10px ${matrixColors.cyberBlue}`,
    neonGlow: `0 0 15px ${matrixColors.neonPink}`,
  },
  
  // Backdrop filters
  backdropFilter: {
    glass: 'blur(10px) saturate(180%)',
    matrix: 'blur(2px) brightness(1.1)',
  },
} as const;

// Performance settings for 60fps target
export const matrixPerformance = {
  // Animation frame rates
  targetFPS: 60,
  rainDropCount: {
    mobile: 30,
    tablet: 50,
    desktop: 80,
    highEnd: 120,
  },
  
  // Optimization flags
  useGPUAcceleration: true,
  enableWillChange: true,
  useTransform3d: true,
} as const;

// Responsive breakpoints with Matrix theme
export const matrixBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Export all tokens as a single object
export const matrixDesignSystem = {
  colors: matrixColors,
  animations: matrixAnimations,
  typography: matrixTypography,
  spacing: matrixSpacing,
  effects: matrixEffects,
  performance: matrixPerformance,
  breakpoints: matrixBreakpoints,
} as const;

export default matrixDesignSystem; 