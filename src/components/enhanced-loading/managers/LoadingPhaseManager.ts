/**
 * Loading Phase Manager
 * Manages progressive loading states with meaningful feedback
 * and dynamic effects configuration
 */

export type LoadingPhase =
  | 'initializing'
  | 'connecting'
  | 'loading'
  | 'synchronizing'
  | 'finalizing'

export interface PhaseConfig {
  name: string
  description: string
  progressRange: [number, number]
  duration: number
  characterSets: string[]
  rainSpeed: number
  effects: {
    glitchProbability: number
    particleDensity: number
    audioIntensity: number
  }
}

export class LoadingPhaseManager {
  private phases: Record<LoadingPhase, PhaseConfig> = {
    initializing: {
      name: 'Initializing',
      description: 'Starting up Bradley AI systems',
      progressRange: [0, 20],
      duration: 3000,
      characterSets: ['binary', 'symbols'],
      rainSpeed: 0.5,
      effects: {
        glitchProbability: 0.1,
        particleDensity: 0.6,
        audioIntensity: 0.3
      }
    },
    connecting: {
      name: 'Connecting',
      description: 'Establishing blockchain connections',
      progressRange: [20, 40],
      duration: 4000,
      characterSets: ['binary', 'crypto', 'blockchain'],
      rainSpeed: 0.8,
      effects: {
        glitchProbability: 0.15,
        particleDensity: 0.7,
        audioIntensity: 0.5
      }
    },
    loading: {
      name: 'Loading',
      description: 'Fetching portfolio and market data',
      progressRange: [40, 60],
      duration: 3500,
      characterSets: ['crypto', 'blockchain', 'japanese'],
      rainSpeed: 1.0,
      effects: {
        glitchProbability: 0.2,
        particleDensity: 0.8,
        audioIntensity: 0.7
      }
    },
    synchronizing: {
      name: 'Synchronizing',
      description: 'Real-time data synchronization',
      progressRange: [60, 80],
      duration: 3000,
      characterSets: ['japanese', 'crypto', 'symbols'],
      rainSpeed: 1.2,
      effects: {
        glitchProbability: 0.25,
        particleDensity: 0.9,
        audioIntensity: 0.8
      }
    },
    finalizing: {
      name: 'Finalizing',
      description: 'Optimizing and preparing interface',
      progressRange: [80, 100],
      duration: 2500,
      characterSets: ['binary', 'japanese', 'crypto'],
      rainSpeed: 1.5,
      effects: {
        glitchProbability: 0.3,
        particleDensity: 1.0,
        audioIntensity: 1.0
      }
    }
  }

  private statusMessages: Record<LoadingPhase, string[]> = {
    initializing: [
      'Booting quantum processors...',
      'Loading neural network models...',
      'Establishing secure connections...',
      'Calibrating AI algorithms...'
    ],
    connecting: [
      'Connecting to Ethereum mainnet...',
      'Establishing Web3 provider...',
      'Verifying smart contracts...',
      'Loading DeFi protocols...'
    ],
    loading: [
      'Scanning wallet addresses...',
      'Fetching token balances...',
      'Loading NFT collections...',
      'Calculating portfolio metrics...'
    ],
    synchronizing: [
      'Fetching real-time prices...',
      'Synchronizing market data...',
      'Loading trading indicators...',
      'Updating price charts...'
    ],
    finalizing: [
      'Optimizing data structures...',
      'Caching critical information...',
      'Preparing user interface...',
      'Finalizing experience...'
    ]
  }

  /**
   * Get the current phase based on progress percentage
   */
  getPhaseForProgress(progress: number): LoadingPhase {
    for (const [phase, config] of Object.entries(this.phases)) {
      const [min, max] = config.progressRange
      if (progress >= min && progress <= max) {
        return phase as LoadingPhase
      }
    }

    // Fallback based on progress ranges
    if (progress < 20) return 'initializing'
    if (progress < 40) return 'connecting'
    if (progress < 60) return 'loading'
    if (progress < 80) return 'synchronizing'
    return 'finalizing'
  }

  /**
   * Get phase configuration
   */
  getPhaseConfig(phase: LoadingPhase): PhaseConfig {
    return this.phases[phase]
  }

  /**
   * Get character sets for digital rain based on phase
   */
  getCharacterSetsForPhase(phase: LoadingPhase): string[] {
    return this.phases[phase].characterSets
  }

  /**
   * Get rain speed for phase
   */
  getRainSpeedForPhase(phase: LoadingPhase): number {
    return this.phases[phase].rainSpeed
  }

  /**
   * Get status message for phase and progress
   */
  getStatusMessage(phase: LoadingPhase, progress: number): string {
    const messages = this.statusMessages[phase]
    const config = this.phases[phase]
    const [min, max] = config.progressRange

    // Calculate relative progress within phase
    const relativeProgress = (progress - min) / (max - min)
    const messageIndex = Math.min(
      Math.floor(relativeProgress * messages.length),
      messages.length - 1
    )

    return messages[messageIndex] || messages[0]
  }

  /**
   * Get estimated time remaining for current phase
   */
  getEstimatedTimeRemaining(phase: LoadingPhase, progress: number): number {
    const config = this.phases[phase]
    const [min, max] = config.progressRange
    const relativeProgress = Math.max(0, (progress - min) / (max - min))

    return Math.max(0, config.duration * (1 - relativeProgress))
  }

  /**
   * Get all phases in order
   */
  getAllPhases(): LoadingPhase[] {
    return ['initializing', 'connecting', 'loading', 'synchronizing', 'finalizing']
  }

  /**
   * Get phase index (0-based)
   */
  getPhaseIndex(phase: LoadingPhase): number {
    return this.getAllPhases().indexOf(phase)
  }

  /**
   * Get next phase
   */
  getNextPhase(currentPhase: LoadingPhase): LoadingPhase | null {
    const phases = this.getAllPhases()
    const currentIndex = this.getPhaseIndex(currentPhase)

    if (currentIndex >= 0 && currentIndex < phases.length - 1) {
      return phases[currentIndex + 1]
    }

    return null
  }

  /**
   * Get glitch probability for phase
   */
  getGlitchProbability(phase: LoadingPhase): number {
    return this.phases[phase].effects.glitchProbability
  }

  /**
   * Get particle density for phase
   */
  getParticleDensity(phase: LoadingPhase): number {
    return this.phases[phase].effects.particleDensity
  }

  /**
   * Get audio intensity for phase
   */
  getAudioIntensity(phase: LoadingPhase): number {
    return this.phases[phase].effects.audioIntensity
  }

  /**
   * Check if phase transition should occur
   */
  shouldTransitionPhase(currentPhase: LoadingPhase, progress: number): boolean {
    const config = this.phases[currentPhase]
    const [, max] = config.progressRange
    return progress > max
  }

  /**
   * Get contextual loading tips
   */
  getLoadingTips(phase: LoadingPhase): string[] {
    const tips: Record<LoadingPhase, string[]> = {
      initializing: [
        'Bradley AI uses advanced neural networks for portfolio analysis',
        'Our quantum algorithms optimize your investment strategies',
        'Secure blockchain connections ensure data integrity'
      ],
      connecting: [
        'Connecting to multiple blockchain networks for comprehensive data',
        'Web3 integration provides real-time DeFi protocol access',
        'Smart contract verification ensures security and accuracy'
      ],
      loading: [
        'Multi-chain portfolio aggregation in progress',
        'NFT collection analysis and valuation updating',
        'Real-time balance calculation across all networks'
      ],
      synchronizing: [
        'Live market data from 100+ exchanges',
        'Real-time price discovery and trend analysis',
        'Advanced charting and technical indicators loading'
      ],
      finalizing: [
        'Optimizing AI recommendations for your portfolio',
        'Personalizing dashboard based on your preferences',
        'Preparing advanced analytics and insights'
      ]
    }

    return tips[phase] || []
  }

  /**
   * Get performance metrics for phase
   */
  getPhaseMetrics(phase: LoadingPhase) {
    const config = this.phases[phase]
    const phases = this.getAllPhases()
    const currentIndex = this.getPhaseIndex(phase)

    return {
      phaseName: config.name,
      description: config.description,
      progress: currentIndex / (phases.length - 1),
      estimatedDuration: config.duration,
      currentStep: currentIndex + 1,
      totalSteps: phases.length,
      effects: config.effects
    }
  }
}

export default LoadingPhaseManager
