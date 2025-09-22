'use client'

import { motion } from 'framer-motion'
import { Activity, Wifi, WifiOff, Globe } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useState, useEffect, useRef } from 'react'

function LanguageSelector() {
  const { language, setLanguage } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  ]

  const currentLang = languages.find(lang => lang.code === language) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.native}</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                language === lang.code ? 'bg-primary-50 text-primary-700' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div>
                <div className="font-medium text-sm">{lang.name}</div>
                <div className="text-xs text-gray-500">{lang.native}</div>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function Header() {
  const { status, isOnline } = useAppStore()

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MediHelp</h1>
              <p className="text-sm text-gray-500">AI Medicine Recognition System</p>
            </div>
          </div>
        </div>

        {/* Status and Controls */}
        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-success-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-error-500" />
            )}
            <span className={`text-sm font-medium ${
              isOnline ? 'text-success-600' : 'text-error-600'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* System Status */}
          <div className={`status-indicator ${
            status.type === 'success' ? 'status-success' :
            status.type === 'warning' ? 'status-warning' :
            status.type === 'error' ? 'status-error' :
            'status-processing'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              status.type === 'success' ? 'bg-success-500' :
              status.type === 'warning' ? 'bg-warning-500' :
              status.type === 'error' ? 'bg-error-500' :
              'bg-primary-500 animate-pulse'
            }`} />
            <span className="text-sm">
              {status.type === 'processing' ? 'Processing...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  )
}