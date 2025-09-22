interface VoiceCommand {
  pattern: RegExp
  action: string
  description: string
  languages: string[]
}

export class VoiceService {
  private recognition: any = null
  private isListening = false
  private isInitialized = false
  private commands: VoiceCommand[] = []
  private currentLanguage = 'en'

  async initialize() {
    try {
      // Check for Web Speech API support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser')
      }

      this.recognition = new SpeechRecognition()
      this.setupRecognition()
      this.setupCommands()
      
      this.isInitialized = true
      console.log('Voice Service initialized successfully')
    } catch (error) {
      console.error('Voice Service initialization failed:', error)
      throw error
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    // Configure recognition settings
    this.recognition.continuous = true
    this.recognition.interimResults = false
    this.recognition.lang = 'en-US'
    this.recognition.maxAlternatives = 1

    // Event handlers
    this.recognition.onstart = () => {
      console.log('Voice recognition started')
      this.isListening = true
    }

    this.recognition.onend = () => {
      console.log('Voice recognition ended')
      this.isListening = false
    }

    this.recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error)
      this.isListening = false
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()
      console.log('Voice command received:', transcript)
      this.processCommand(transcript)
    }
  }

  private setupCommands() {
    this.commands = [
      // English medicine identification commands
      {
        pattern: /what\s+is\s+this\s+medicine/i,
        action: 'identifyMedicine',
        description: 'Identify medicine in camera',
        languages: ['en']
      },
      {
        pattern: /identify\s+this\s+medicine/i,
        action: 'identifyMedicine',
        description: 'Identify medicine in camera',
        languages: ['en']
      },
      {
        pattern: /what\s+medicine\s+is\s+this/i,
        action: 'identifyMedicine',
        description: 'Identify medicine in camera',
        languages: ['en']
      },
      {
        pattern: /tell\s+me\s+about\s+this\s+medicine/i,
        action: 'identifyMedicine',
        description: 'Get medicine information',
        languages: ['en']
      },
      
      // Hindi medicine identification commands
      {
        pattern: /(?:यह|ये|इस)\s+दवाई?\s+का\s+(?:क्या\s+)?नाम\s+(?:क्या\s+)?है/i,
        action: 'identifyMedicine',
        description: 'दवाई की पहचान करें',
        languages: ['hi']
      },
      {
        pattern: /(?:इस|यह|ये)\s+दवाई?\s+(?:का\s+)?(?:क्या\s+)?(?:उपयोग|इस्तेमाल|फायदा)\s+(?:क्या\s+)?है/i,
        action: 'identifyMedicine',
        description: 'दवाई का उपयोग बताएं',
        languages: ['hi']
      },
      {
        pattern: /(?:यह|ये|इस)\s+(?:कौन\s+सी\s+)?दवाई?\s+है/i,
        action: 'identifyMedicine',
        description: 'दवाई की पहचान करें',
        languages: ['hi']
      },
      {
        pattern: /दवाई?\s+(?:की\s+)?(?:जानकारी|पहचान)\s+(?:करो|बताओ|दो)/i,
        action: 'identifyMedicine',
        description: 'दवाई की जानकारी दें',
        languages: ['hi']
      },

      // Language change commands
      {
        pattern: /change\s+language\s+to\s+(english|hindi|spanish|french)/i,
        action: 'changeLanguage',
        description: 'Change language',
        languages: ['en']
      },
      {
        pattern: /भाषा\s+(?:को\s+)?(?:हिंदी|अंग्रेजी)\s+(?:में\s+)?(?:करो|बदलो|कर\s+दो)/i,
        action: 'changeLanguage',
        description: 'भाषा बदलें',
        languages: ['hi']
      },

      // Repeat commands
      {
        pattern: /repeat\s+(?:the\s+)?(?:last\s+)?information/i,
        action: 'repeat',
        description: 'Repeat last medicine information',
        languages: ['en']
      },
      {
        pattern: /(?:फिर\s+से\s+|दोबारा\s+)?(?:बताओ|सुनाओ|कहो)/i,
        action: 'repeat',
        description: 'जानकारी दोहराएं',
        languages: ['hi']
      },

      // Help commands
      {
        pattern: /help|what\s+can\s+you\s+do/i,
        action: 'help',
        description: 'Show available commands',
        languages: ['en']
      },
      {
        pattern: /(?:मदद|सहायता|हेल्प)(?:\s+करो|\s+चाहिए)?/i,
        action: 'help',
        description: 'उपलब्ध कमांड दिखाएं',
        languages: ['hi']
      }
    ]
  }

  private processCommand(transcript: string) {
    console.log('Processing voice command:', transcript)
    
    for (const command of this.commands) {
      const match = transcript.match(command.pattern)
      if (match) {
        console.log('Matched command:', command.action, 'Pattern:', command.pattern)
        this.executeCommand(command.action, match, transcript)
        return
      }
    }

    // Log unrecognized commands for debugging
    console.log('No command pattern matched for:', transcript)
  }

  private executeCommand(action: string, match: RegExpMatchArray, fullTranscript: string) {
    const event = new CustomEvent('voiceCommand', {
      detail: { action, match, transcript: fullTranscript }
    })
    window.dispatchEvent(event)

    switch (action) {
      case 'identifyMedicine':
        console.log('Voice command: Identify medicine')
        // Trigger automatic capture and analysis
        window.dispatchEvent(new CustomEvent('voiceIdentifyMedicine', { 
          detail: { transcript: fullTranscript, language: this.currentLanguage }
        }))
        break
      
      case 'changeLanguage':
        const language = this.extractLanguage(match[1] || fullTranscript)
        if (language) {
          console.log('Voice command: Change language to', language)
          window.dispatchEvent(new CustomEvent('changeLanguage', { detail: { language } }))
        }
        break
      
      case 'repeat':
        console.log('Voice command: Repeat information')
        window.dispatchEvent(new CustomEvent('repeatInformation'))
        break
      
      case 'help':
        this.showHelp()
        break
    }
  }

  private extractLanguage(languageInput: string): string | null {
    const languageMap: { [key: string]: string } = {
      'english': 'en',
      'अंग्रेजी': 'en',
      'hindi': 'hi',
      'हिंदी': 'hi',
      'spanish': 'es',
      'french': 'fr'
    }

    // Check for direct matches first
    const directMatch = languageMap[languageInput.toLowerCase()]
    if (directMatch) return directMatch

    // Check if the input contains language keywords
    for (const [key, value] of Object.entries(languageMap)) {
      if (languageInput.toLowerCase().includes(key)) {
        return value
      }
    }

    return null
  }

  private handleUnknownCommand(transcript: string) {
    console.log('Unknown MediHelp command:', transcript)
    
    // Provide feedback for unknown commands
    const event = new CustomEvent('voiceCommand', {
      detail: { 
        action: 'unknown', 
        transcript,
        message: 'Command not recognized. Say "MediHelp help" for available commands.'
      }
    })
    window.dispatchEvent(event)
  }

  private showHelp() {
    const helpMessage = this.commands.map(cmd => cmd.description).join(', ')
    
    const event = new CustomEvent('voiceCommand', {
      detail: { 
        action: 'help', 
        message: `Available commands: ${helpMessage}`
      }
    })
    window.dispatchEvent(event)
  }

  startListening() {
    if (!this.isInitialized || !this.recognition) {
      console.warn('Voice Service not initialized')
      return false
    }

    if (this.isListening) {
      console.warn('Already listening')
      return false
    }

    try {
      this.recognition.start()
      return true
    } catch (error) {
      console.error('Failed to start voice recognition:', error)
      return false
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  setLanguage(language: string) {
    this.currentLanguage = language
    
    if (!this.recognition) return

    const languageCodes: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES',
      'fr': 'fr-FR'
    }

    const langCode = languageCodes[language] || 'en-US'
    this.recognition.lang = langCode
    console.log('Voice recognition language set to:', langCode)
  }

  isCurrentlyListening(): boolean {
    return this.isListening
  }

  getAvailableCommands(): VoiceCommand[] {
    return [...this.commands]
  }

  addCustomCommand(pattern: RegExp, action: string, description: string) {
    this.commands.push({ pattern, action, description })
  }

  removeCustomCommand(action: string) {
    this.commands = this.commands.filter(cmd => cmd.action !== action)
  }

  // Test voice recognition
  async testRecognition(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isInitialized) {
        resolve(false)
        return
      }

      const testRecognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)()
      testRecognition.lang = 'en-US'
      testRecognition.interimResults = false
      testRecognition.maxAlternatives = 1

      testRecognition.onresult = () => {
        resolve(true)
        testRecognition.stop()
      }

      testRecognition.onerror = () => {
        resolve(false)
        testRecognition.stop()
      }

      testRecognition.onend = () => {
        resolve(false)
      }

      try {
        testRecognition.start()
        
        // Auto-stop after 3 seconds
        setTimeout(() => {
          testRecognition.stop()
          resolve(false)
        }, 3000)
      } catch (error) {
        resolve(false)
      }
    })
  }
}