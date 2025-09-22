export class TTSService {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isInitialized = false

  async initialize() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.synth = window.speechSynthesis

        // Load voices
        await this.loadVoices()

        this.isInitialized = true
        console.log('TTS Service initialized successfully')
      } else {
        console.warn('Speech synthesis not supported in this environment')
        this.isInitialized = false
      }
    } catch (error) {
      console.error('TTS Service initialization failed:', error)
      this.isInitialized = false
    }
  }

  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoicesHandler = () => {
        this.voices = this.synth?.getVoices() || []
        if (this.voices.length > 0) {
          resolve()
        }
      }

      // Voices might be loaded already
      this.voices = this.synth?.getVoices() || []
      if (this.voices.length > 0) {
        resolve()
        return
      }

      // Wait for voices to load
      if (this.synth) {
        this.synth.onvoiceschanged = loadVoicesHandler
      }

      // Fallback timeout
      setTimeout(() => {
        this.voices = this.synth?.getVoices() || []
        resolve()
      }, 1000)
    })
  }

  async speak(text: string, language: string = 'en'): Promise<void> {
    console.log('TTS speak called with:', text, language)

    if (!this.isInitialized || !this.synth) {
      console.warn('TTS Service not initialized, skipping speech')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        this.synth.cancel()

        const utterance = new SpeechSynthesisUtterance(text)

        // Set voice based on language
        const voice = this.getVoiceForLanguage(language)
        if (voice) {
          utterance.voice = voice
          console.log('Using voice:', voice.name)
        }

        // Configure speech parameters
        utterance.rate = this.getSpeechRate(language)
        utterance.pitch = 1.0
        utterance.volume = 1.0 // Maximum volume

        // Set language
        utterance.lang = this.getLanguageCode(language)

        // Event handlers
        utterance.onend = () => {
          console.log('Speech ended')
          resolve()
        }
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error)
          resolve() // Don't reject, just resolve to continue
        }

        // Speak
        console.log('Starting speech synthesis')
        this.synth.speak(utterance)
      } catch (error) {
        console.error('TTS speak error:', error)
        resolve() // Don't reject, just resolve to continue
      }
    })
  }

  private getVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
    const languageMap: { [key: string]: string[] } = {
      'en': ['en-US', 'en-GB', 'en-AU', 'en'],
      'hi': ['hi-IN', 'hi', 'hindi'],
      'es': ['es-ES', 'es-MX', 'es-US', 'es'],
      'fr': ['fr-FR', 'fr-CA', 'fr-BE', 'fr']
    }

    const preferredLangs = languageMap[language] || ['en-US']

    console.log('Available voices:', this.voices.map(v => ({ name: v.name, lang: v.lang })))
    console.log('Looking for language:', language, 'Preferred langs:', preferredLangs)

    // Find exact match first
    for (const lang of preferredLangs) {
      const voice = this.voices.find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()))
      if (voice) {
        console.log('Found exact match voice:', voice.name, voice.lang)
        return voice
      }
    }

    // Fallback to any voice containing the language code or name
    const fallbackVoice = this.voices.find(v =>
      preferredLangs.some(lang =>
        v.lang.toLowerCase().includes(lang.toLowerCase()) ||
        v.name.toLowerCase().includes(lang.toLowerCase())
      )
    )

    if (fallbackVoice) {
      console.log('Found fallback voice:', fallbackVoice.name, fallbackVoice.lang)
      return fallbackVoice
    }

    console.log('No matching voice found, using default')
    return this.voices[0] || null
  }

  private getLanguageCode(language: string): string {
    const languageCodes: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES',
      'fr': 'fr-FR'
    }

    return languageCodes[language] || 'en-US'
  }

  private getSpeechRate(language: string): number {
    // Adjust speech rate based on language - slower for better clarity
    const rates: { [key: string]: number } = {
      'en': 0.9,   // Slightly slower for clarity
      'hi': 0.8,   // Slower for Hindi pronunciation
      'es': 0.85,
      'fr': 0.85
    }

    return rates[language] || 0.9
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  pause() {
    if (this.synth) {
      this.synth.pause()
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume()
    }
  }

  isSpeaking(): boolean {
    return this.synth?.speaking || false
  }

  getAvailableVoices(): { name: string, lang: string, localService: boolean }[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService
    }))
  }

  async testVoice(language: string) {
    const testMessages: { [key: string]: string } = {
      'en': 'This is a test of the text to speech system.',
      'hi': 'यह टेक्स्ट टू स्पीच सिस्टम का परीक्षण है।',
      'es': 'Esta es una prueba del sistema de texto a voz.',
      'fr': 'Ceci est un test du système de synthèse vocale.'
    }

    const message = testMessages[language] || testMessages['en']
    await this.speak(message, language)
  }

  setVoiceSettings(rate: number, pitch: number, volume: number) {
    // These settings will be applied to the next utterance
    // Store them for use in speak method
    this.customSettings = { rate, pitch, volume }
  }

  private customSettings = {
    rate: 1.0,
    pitch: 1.0,
    volume: 0.9
  }
}