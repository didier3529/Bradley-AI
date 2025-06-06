/**
 * Audio Manager
 * Handles immersive sound effects for the loading experience
 * with Web Audio API for high-quality audio processing
 */

export interface AudioSettings {
  masterVolume: number
  ambienceVolume: number
  effectsVolume: number
  enabled: boolean
}

export type SoundType =
  | 'ambience'
  | 'particle'
  | 'progress'
  | 'logo-assembly'
  | 'phase-transition'
  | 'completion'
  | 'error'

export class AudioController {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private ambienceGain: GainNode | null = null
  private effectsGain: GainNode | null = null

  private settings: AudioSettings = {
    masterVolume: 0.3,
    ambienceVolume: 0.5,
    effectsVolume: 0.7,
    enabled: false
  }

  private sounds: Map<SoundType, AudioBuffer> = new Map()
  private activeSources: Map<string, AudioBufferSourceNode> = new Map()
  private isInitialized = false

  /**
   * Initialize the audio system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain()
      this.ambienceGain = this.audioContext.createGain()
      this.effectsGain = this.audioContext.createGain()

      // Connect gain nodes
      this.ambienceGain.connect(this.masterGain)
      this.effectsGain.connect(this.masterGain)
      this.masterGain.connect(this.audioContext.destination)

      // Set initial volumes
      this.updateVolumes()

      // Generate procedural sounds
      await this.generateSounds()

      this.isInitialized = true
      this.settings.enabled = true

      console.log('Audio system initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize audio system:', error)
      this.settings.enabled = false
    }
  }

  /**
   * Generate procedural audio buffers
   */
  private async generateSounds(): Promise<void> {
    if (!this.audioContext) return

    const sampleRate = this.audioContext.sampleRate
    const duration = 2 // seconds

    // Generate digital ambience
    const ambienceBuffer = this.generateDigitalAmbience(sampleRate, duration * 10)
    this.sounds.set('ambience', ambienceBuffer)

    // Generate particle click sound
    const particleBuffer = this.generateParticleSound(sampleRate, 0.2)
    this.sounds.set('particle', particleBuffer)

    // Generate progress sound
    const progressBuffer = this.generateProgressSound(sampleRate, 0.5)
    this.sounds.set('progress', progressBuffer)

    // Generate logo assembly sound
    const logoBuffer = this.generateLogoAssemblySound(sampleRate, 2)
    this.sounds.set('logo-assembly', logoBuffer)

    // Generate phase transition sound
    const transitionBuffer = this.generatePhaseTransitionSound(sampleRate, 1)
    this.sounds.set('phase-transition', transitionBuffer)

    // Generate completion sound
    const completionBuffer = this.generateCompletionSound(sampleRate, 3)
    this.sounds.set('completion', completionBuffer)
  }

  /**
   * Generate digital ambience (matrix-like humming)
   */
  private generateDigitalAmbience(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized')

    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)

      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate

        // Multiple sine waves for rich ambience
        const low = Math.sin(2 * Math.PI * 40 * time) * 0.1
        const mid = Math.sin(2 * Math.PI * 120 * time) * 0.05
        const high = Math.sin(2 * Math.PI * 250 * time) * 0.02

        // Add some filtered noise for texture
        const noise = (Math.random() - 0.5) * 0.01

        // Amplitude modulation for organic feel
        const modulation = Math.sin(2 * Math.PI * 0.3 * time) * 0.3 + 0.7

        channelData[i] = (low + mid + high + noise) * modulation * 0.2
      }
    }

    return buffer
  }

  /**
   * Generate particle interaction sound
   */
  private generateParticleSound(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized')

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate
      const decay = Math.exp(-time * 10)

      // High-pitched click with harmonics
      const fundamental = Math.sin(2 * Math.PI * 800 * time)
      const harmonic = Math.sin(2 * Math.PI * 1600 * time) * 0.5

      channelData[i] = (fundamental + harmonic) * decay * 0.3
    }

    return buffer
  }

  /**
   * Generate progress milestone sound
   */
  private generateProgressSound(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized')

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate
      const decay = Math.exp(-time * 3)

      // Rising frequency sweep
      const frequency = 300 + time * 200
      const signal = Math.sin(2 * Math.PI * frequency * time)

      channelData[i] = signal * decay * 0.4
    }

    return buffer
  }

  /**
   * Generate logo assembly sound
   */
  private generateLogoAssemblySound(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized')

    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)

      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate
        const progress = time / duration

        // Build up effect with multiple layers
        const low = Math.sin(2 * Math.PI * 60 * time) * (1 - progress) * 0.3
        const mid = Math.sin(2 * Math.PI * 200 * time) * progress * 0.2
        const high = Math.sin(2 * Math.PI * 800 * time) * Math.sin(progress * Math.PI) * 0.1

        // Add some mechanical/digital texture
        const texture = Math.sin(2 * Math.PI * 1200 * time) * (Math.random() - 0.5) * progress * 0.05

        channelData[i] = low + mid + high + texture
      }
    }

    return buffer
  }

  /**
   * Generate phase transition sound
   */
  private generatePhaseTransitionSound(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized')

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate
      const envelope = Math.sin(time * Math.PI / duration)

      // Whoosh effect with frequency sweep
      const frequency = 200 + Math.sin(time * 3) * 100
      const signal = Math.sin(2 * Math.PI * frequency * time)

      // Add filtered noise for texture
      const noise = (Math.random() - 0.5) * 0.1

      channelData[i] = (signal + noise) * envelope * 0.5
    }

    return buffer
  }

  /**
   * Generate completion sound
   */
  private generateCompletionSound(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized')

    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)

      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate
        const decay = Math.exp(-time * 1.5)

        // Triumphant chord progression
        const root = Math.sin(2 * Math.PI * 261.63 * time) // C4
        const third = Math.sin(2 * Math.PI * 329.63 * time) // E4
        const fifth = Math.sin(2 * Math.PI * 392.00 * time) // G4
        const octave = Math.sin(2 * Math.PI * 523.25 * time) // C5

        channelData[i] = (root + third * 0.8 + fifth * 0.6 + octave * 0.4) * decay * 0.3
      }
    }

    return buffer
  }

  /**
   * Play a sound effect
   */
  playSound(type: SoundType, volume: number = 1): void {
    if (!this.isInitialized || !this.settings.enabled || !this.audioContext) return

    const buffer = this.sounds.get(type)
    if (!buffer) return

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      source.connect(gainNode)

      // Route to appropriate gain node
      if (type === 'ambience') {
        gainNode.connect(this.ambienceGain!)
      } else {
        gainNode.connect(this.effectsGain!)
      }

      // Set volume
      gainNode.gain.value = volume

      // Play sound
      source.start()

      // Clean up when finished
      source.onended = () => {
        this.activeSources.delete(source.buffer?.length.toString() || '')
      }

      // Store reference for potential stopping
      this.activeSources.set(source.buffer.length.toString(), source)
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  /**
   * Play ambience sound (looped)
   */
  playAmbience(): void {
    if (!this.isInitialized || !this.settings.enabled) return

    this.stopAmbience() // Stop any existing ambience

    const source = this.audioContext?.createBufferSource()
    const buffer = this.sounds.get('ambience')

    if (source && buffer) {
      source.buffer = buffer
      source.loop = true
      source.connect(this.ambienceGain!)
      source.start()

      this.activeSources.set('ambience', source)
    }
  }

  /**
   * Stop ambience sound
   */
  stopAmbience(): void {
    const ambienceSource = this.activeSources.get('ambience')
    if (ambienceSource) {
      ambienceSource.stop()
      this.activeSources.delete('ambience')
    }
  }

  /**
   * Play particle interaction sound
   */
  playParticleSound(): void {
    this.playSound('particle', 0.3)
  }

  /**
   * Play progress milestone sound
   */
  playProgressSound(): void {
    this.playSound('progress', 0.5)
  }

  /**
   * Play logo assembly sound
   */
  playLogoAssemblySound(): void {
    this.playSound('logo-assembly', 0.7)
  }

  /**
   * Play phase transition sound
   */
  playPhaseTransitionSound(): void {
    this.playSound('phase-transition', 0.6)
  }

  /**
   * Play completion sound
   */
  playCompletionSound(): void {
    this.playSound('completion', 0.8)
  }

  /**
   * Update volume levels
   */
  private updateVolumes(): void {
    if (!this.isInitialized) return

    this.masterGain!.gain.value = this.settings.masterVolume
    this.ambienceGain!.gain.value = this.settings.ambienceVolume
    this.effectsGain!.gain.value = this.settings.effectsVolume
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume))
    this.updateVolumes()
  }

  /**
   * Set ambience volume
   */
  setAmbienceVolume(volume: number): void {
    this.settings.ambienceVolume = Math.max(0, Math.min(1, volume))
    this.updateVolumes()
  }

  /**
   * Set effects volume
   */
  setEffectsVolume(volume: number): void {
    this.settings.effectsVolume = Math.max(0, Math.min(1, volume))
    this.updateVolumes()
  }

  /**
   * Enable/disable audio
   */
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled

    if (!enabled) {
      this.stopAll()
    }
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.activeSources.forEach(source => {
      try {
        source.stop()
      } catch (error) {
        // Source might already be stopped
      }
    })
    this.activeSources.clear()
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  /**
   * Check if audio is supported
   */
  isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext)
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopAll()

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.isInitialized = false
  }
}

export default AudioController
