'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Mic, MicOff, Volume2, Settings } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface ControlPanelProps {
  onCapture: () => void
  mlService: any
  ttsService: any
}

export default function ControlPanel({ onCapture, mlService, ttsService }: ControlPanelProps) {
  const { language, setLanguage, status } = useAppStore()
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  ]

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode)
    ttsService.speak(
      langCode === 'hi' ? 'भाषा बदल दी गई' : 'Language changed',
      langCode
    )
  }

  const toggleVoiceListening = () => {
    setIsListening(!isListening)
    // Voice service integration would go here
  }

  const testTTS = () => {
    const message = language === 'hi' 
      ? 'यह एक परीक्षण संदेश है' 
      : 'This is a test message'
    ttsService.speak(message, language)
  }

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Controls</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Big Capture Button for Testing */}
        <div className="mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log('🔴 CAPTURE BUTTON CLICKED')
              onCapture()
            }}
            disabled={status.type === 'processing'}
            className={`w-full font-bold py-6 px-8 rounded-lg text-xl transition-colors ${
              status.type === 'processing' 
                ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {status.type === 'processing' ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                🔍 ANALYZING MEDICINE...
              </div>
            ) : (
              '📸 CAPTURE & DETECT MEDICINE'
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Voice Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-16 flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-medium text-green-800">Voice Active</div>
                <div className="text-xs text-green-600">Say "What is this?"</div>
              </div>
            </div>
          </div>

          {/* TTS Test */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={testTTS}
            className="btn-secondary h-16"
          >
            <Volume2 className="w-6 h-6" />
            Test Speech
          </motion.button>
        </div>

        {/* Debug Section */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Debug Controls</h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                console.log('Test capture triggered')
                onCapture()
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
            >
              Test Capture
            </button>
            <button
              onClick={() => {
                console.log('ML Service status:', mlService.getModelInfo())
              }}
              className="px-4 py-2 bg-green-500 text-white rounded text-sm"
            >
              Check ML Status
            </button>
            <button
              onClick={() => {
                ttsService.speak('यह हिंदी में परीक्षण संदेश है। मेडीहेल्प आपकी सहायता के लिए तैयार है।', 'hi')
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded text-sm"
            >
              Test Hindi TTS
            </button>
            <button
              onClick={() => {
                console.log('🔍 Current medicine database:')
                console.log(mlService.getModelInfo())
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded text-sm"
            >
              Show Database
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card"
        >
          <h4 className="font-semibold mb-4">Settings</h4>
          
          {/* Language Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Language / भाषा / Idioma / Langue
            </label>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    language === lang.code
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="font-medium text-sm">{lang.name}</div>
                      <div className="text-xs text-gray-500">{lang.native}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ML Model Settings */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h5 className="font-medium mb-3">AI Model Settings</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confidence Threshold</span>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  defaultValue="0.6"
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vector Similarity</span>
                <input
                  type="range"
                  min="0.7"
                  max="0.99"
                  step="0.01"
                  defaultValue="0.85"
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Voice Commands Help */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
          🎤 Voice Commands
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* English Commands */}
          <div>
            <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
              🇺🇸 English
            </h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• "What is this medicine?"</li>
              <li>• "Identify this medicine"</li>
              <li>• "Tell me about this medicine"</li>
              <li>• "Change language to Hindi"</li>
              <li>• "Repeat information"</li>
            </ul>
          </div>
          
          {/* Hindi Commands */}
          <div>
            <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
              🇮🇳 हिंदी
            </h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• "इस दवाई का क्या नाम है?"</li>
              <li>• "यह दवाई का क्या उपयोग है?"</li>
              <li>• "यह कौन सी दवाई है?"</li>
              <li>• "भाषा को अंग्रेजी में करो"</li>
              <li>• "फिर से बताओ"</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Hold the medicine close to the camera and speak clearly. 
            The system will automatically capture and analyze when you ask about the medicine.
          </p>
        </div>
      </motion.div>
    </div>
  )
}