/**
 * Loading Themes System
 * Dynamic color schemes and themes that adapt based on loading phases
 * providing a cohesive and immersive visual experience
 */

import { LoadingPhase } from '../managers/LoadingPhaseManager'

export interface ColorScheme {
  name: string
  background: {
    primary: string
    secondary: string
    tertiary: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
  }
  accent: {
    primary: string
    secondary: string
    tertiary: string
    quaternary: string
  }
  effects: {
    glow: string
    trail: string
    particle: string
    shadow: string
  }
}

export type ThemeName =
  | 'cyberpunk'
  | 'matrix'
  | 'neural'
  | 'quantum'
  | 'blockchain'

class LoadingThemeSystem {
  private themes: Record<ThemeName, ColorScheme> = {
    cyberpunk: {
      name: 'Cyberpunk',
      background: {
        primary: '#0a0a0a',
        secondary: '#1a1a2e',
        tertiary: '#16213e'
      },
      text: {
        primary: '#00d4ff',
        secondary: '#0ea5e9',
        tertiary: '#64748b'
      },
      accent: {
        primary: '#00d4ff',
        secondary: '#ff0080',
        tertiary: '#00ff41',
        quaternary: '#ffaa00'
      },
      effects: {
        glow: 'rgba(0, 212, 255, 0.8)',
        trail: 'rgba(0, 212, 255, 0.3)',
        particle: 'rgba(0, 212, 255, 0.6)',
        shadow: 'rgba(0, 212, 255, 0.2)'
      }
    },
    matrix: {
      name: 'Matrix',
      background: {
        primary: '#000000',
        secondary: '#001100',
        tertiary: '#002200'
      },
      text: {
        primary: '#00ff41',
        secondary: '#00cc33',
        tertiary: '#009922'
      },
      accent: {
        primary: '#00ff41',
        secondary: '#00cc33',
        tertiary: '#00aa22',
        quaternary: '#008811'
      },
      effects: {
        glow: 'rgba(0, 255, 65, 0.8)',
        trail: 'rgba(0, 255, 65, 0.3)',
        particle: 'rgba(0, 255, 65, 0.6)',
        shadow: 'rgba(0, 255, 65, 0.2)'
      }
    },
    neural: {
      name: 'Neural',
      background: {
        primary: '#0f0f23',
        secondary: '#1e1e3f',
        tertiary: '#2d2d5a'
      },
      text: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        tertiary: '#6d28d9'
      },
      accent: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        tertiary: '#06b6d4',
        quaternary: '#10b981'
      },
      effects: {
        glow: 'rgba(139, 92, 246, 0.8)',
        trail: 'rgba(139, 92, 246, 0.3)',
        particle: 'rgba(139, 92, 246, 0.6)',
        shadow: 'rgba(139, 92, 246, 0.2)'
      }
    },
    quantum: {
      name: 'Quantum',
      background: {
        primary: '#0c1629',
        secondary: '#1e293b',
        tertiary: '#334155'
      },
      text: {
        primary: '#38bdf8',
        secondary: '#0ea5e9',
        tertiary: '#0284c7'
      },
      accent: {
        primary: '#38bdf8',
        secondary: '#a855f7',
        tertiary: '#ec4899',
        quaternary: '#f59e0b'
      },
      effects: {
        glow: 'rgba(56, 189, 248, 0.8)',
        trail: 'rgba(56, 189, 248, 0.3)',
        particle: 'rgba(56, 189, 248, 0.6)',
        shadow: 'rgba(56, 189, 248, 0.2)'
      }
    },
    blockchain: {
      name: 'Blockchain',
      background: {
        primary: '#1c1917',
        secondary: '#292524',
        tertiary: '#44403c'
      },
      text: {
        primary: '#fbbf24',
        secondary: '#f59e0b',
        tertiary: '#d97706'
      },
      accent: {
        primary: '#fbbf24',
        secondary: '#10b981',
        tertiary: '#06b6d4',
        quaternary: '#8b5cf6'
      },
      effects: {
        glow: 'rgba(251, 191, 36, 0.8)',
        trail: 'rgba(251, 191, 36, 0.3)',
        particle: 'rgba(251, 191, 36, 0.6)',
        shadow: 'rgba(251, 191, 36, 0.2)'
      }
    }
  }

  private phaseThemeMapping: Record<LoadingPhase, ThemeName> = {
    initializing: 'cyberpunk',
    connecting: 'blockchain',
    loading: 'neural',
    synchronizing: 'quantum',
    finalizing: 'matrix'
  }

  /**
   * Get theme for specific loading phase
   */
  getThemeForPhase(phase: LoadingPhase): ColorScheme {
    const themeName = this.phaseThemeMapping[phase]
    return this.themes[themeName]
  }

  /**
   * Get theme by name
   */
  getTheme(name: ThemeName): ColorScheme {
    return { ...this.themes[name] }
  }

  /**
   * Get all available themes
   */
  getAllThemes(): Record<ThemeName, ColorScheme> {
    return { ...this.themes }
  }

  /**
   * Get theme names
   */
  getThemeNames(): ThemeName[] {
    return Object.keys(this.themes) as ThemeName[]
  }

  /**
   * Create gradient background for theme
   */
  createGradientBackground(theme: ColorScheme, direction: string = '135deg'): string {
    return `linear-gradient(${direction}, ${theme.background.primary} 0%, ${theme.background.secondary} 50%, ${theme.background.tertiary} 100%)`
  }

  /**
   * Create animated gradient background
   */
  createAnimatedGradient(theme: ColorScheme): string {
    return `linear-gradient(-45deg, ${theme.background.primary}, ${theme.background.secondary}, ${theme.background.tertiary}, ${theme.accent.primary}20)`
  }

  /**
   * Get text shadow for theme
   */
  getTextShadow(theme: ColorScheme, intensity: 'low' | 'medium' | 'high' = 'medium'): string {
    const intensityMap = {
      low: '0 0 5px',
      medium: '0 0 10px',
      high: '0 0 20px'
    }

    return `${intensityMap[intensity]} ${theme.effects.glow}`
  }

  /**
   * Get box shadow for theme
   */
  getBoxShadow(theme: ColorScheme, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      small: '0 0 10px',
      medium: '0 0 20px',
      large: '0 0 40px'
    }

    return `${sizeMap[size]} ${theme.effects.glow}`
  }

  /**
   * Get border with glow effect
   */
  getGlowBorder(theme: ColorScheme, width: number = 1): string {
    return `${width}px solid ${theme.accent.primary}`
  }

  /**
   * Interpolate between two colors
   */
  interpolateColors(color1: string, color2: string, factor: number): string {
    // Simple RGB interpolation
    const hex1 = color1.replace('#', '')
    const hex2 = color2.replace('#', '')

    const r1 = parseInt(hex1.substr(0, 2), 16)
    const g1 = parseInt(hex1.substr(2, 2), 16)
    const b1 = parseInt(hex1.substr(4, 2), 16)

    const r2 = parseInt(hex2.substr(0, 2), 16)
    const g2 = parseInt(hex2.substr(2, 2), 16)
    const b2 = parseInt(hex2.substr(4, 2), 16)

    const r = Math.round(r1 + (r2 - r1) * factor)
    const g = Math.round(g1 + (g2 - g1) * factor)
    const b = Math.round(b1 + (b2 - b1) * factor)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  /**
   * Create theme transition between two phases
   */
  createPhaseTransition(fromPhase: LoadingPhase, toPhase: LoadingPhase, progress: number): ColorScheme {
    const fromTheme = this.getThemeForPhase(fromPhase)
    const toTheme = this.getThemeForPhase(toPhase)

    return {
      name: `${fromTheme.name} → ${toTheme.name}`,
      background: {
        primary: this.interpolateColors(fromTheme.background.primary, toTheme.background.primary, progress),
        secondary: this.interpolateColors(fromTheme.background.secondary, toTheme.background.secondary, progress),
        tertiary: this.interpolateColors(fromTheme.background.tertiary, toTheme.background.tertiary, progress)
      },
      text: {
        primary: this.interpolateColors(fromTheme.text.primary, toTheme.text.primary, progress),
        secondary: this.interpolateColors(fromTheme.text.secondary, toTheme.text.secondary, progress),
        tertiary: this.interpolateColors(fromTheme.text.tertiary, toTheme.text.tertiary, progress)
      },
      accent: {
        primary: this.interpolateColors(fromTheme.accent.primary, toTheme.accent.primary, progress),
        secondary: this.interpolateColors(fromTheme.accent.secondary, toTheme.accent.secondary, progress),
        tertiary: this.interpolateColors(fromTheme.accent.tertiary, toTheme.accent.tertiary, progress),
        quaternary: this.interpolateColors(fromTheme.accent.quaternary, toTheme.accent.quaternary, progress)
      },
      effects: {
        glow: fromTheme.effects.glow, // Keep glow effects from source theme
        trail: fromTheme.effects.trail,
        particle: fromTheme.effects.particle,
        shadow: fromTheme.effects.shadow
      }
    }
  }

  /**
   * Get CSS variables for theme
   */
  getCSSVariables(theme: ColorScheme): Record<string, string> {
    return {
      '--bg-primary': theme.background.primary,
      '--bg-secondary': theme.background.secondary,
      '--bg-tertiary': theme.background.tertiary,
      '--text-primary': theme.text.primary,
      '--text-secondary': theme.text.secondary,
      '--text-tertiary': theme.text.tertiary,
      '--accent-primary': theme.accent.primary,
      '--accent-secondary': theme.accent.secondary,
      '--accent-tertiary': theme.accent.tertiary,
      '--accent-quaternary': theme.accent.quaternary,
      '--effect-glow': theme.effects.glow,
      '--effect-trail': theme.effects.trail,
      '--effect-particle': theme.effects.particle,
      '--effect-shadow': theme.effects.shadow
    }
  }

  /**
   * Apply theme to document root
   */
  applyThemeToDocument(theme: ColorScheme): void {
    const root = document.documentElement
    const variables = this.getCSSVariables(theme)

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  /**
   * Create custom theme
   */
  createCustomTheme(
    name: string,
    baseTheme: ThemeName,
    overrides: Partial<ColorScheme>
  ): ColorScheme {
    const base = this.getTheme(baseTheme)

    return {
      ...base,
      name,
      ...overrides,
      background: { ...base.background, ...overrides.background },
      text: { ...base.text, ...overrides.text },
      accent: { ...base.accent, ...overrides.accent },
      effects: { ...base.effects, ...overrides.effects }
    }
  }

  /**
   * Get theme suitable for reduced motion
   */
  getReducedMotionTheme(baseName: ThemeName): ColorScheme {
    const base = this.getTheme(baseName)

    return {
      ...base,
      name: `${base.name} (Reduced Motion)`,
      effects: {
        glow: base.text.primary,
        trail: base.text.secondary,
        particle: base.text.primary,
        shadow: base.background.secondary
      }
    }
  }

  /**
   * Get high contrast theme
   */
  getHighContrastTheme(baseName: ThemeName): ColorScheme {
    const base = this.getTheme(baseName)

    return {
      ...base,
      name: `${base.name} (High Contrast)`,
      background: {
        primary: '#000000',
        secondary: '#111111',
        tertiary: '#222222'
      },
      text: {
        primary: '#ffffff',
        secondary: '#cccccc',
        tertiary: '#999999'
      }
    }
  }

  /**
   * Validate theme colors for accessibility
   */
  validateThemeAccessibility(theme: ColorScheme): {
    valid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    // Simple contrast ratio check (basic implementation)
    const contrastRatio = this.calculateContrastRatio(theme.text.primary, theme.background.primary)

    if (contrastRatio < 4.5) {
      issues.push('Text contrast ratio is below WCAG AA standards')
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  /**
   * Calculate approximate contrast ratio
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation
    const getLuminance = (color: string) => {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255

      return 0.299 * r + 0.587 * g + 0.114 * b
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)

    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }
}

// Export singleton instance
export const LoadingThemes = new LoadingThemeSystem()
export default LoadingThemes
