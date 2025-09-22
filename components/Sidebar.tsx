'use client'

import { motion } from 'framer-motion'
import { User, Pill, History, LogIn, LogOut, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import MedicineInfo from './MedicineInfo'
import HistoryPanel from './HistoryPanel'
import { useState } from 'react'

export default function Sidebar() {
  const { user, setUser, clearHistory } = useAppStore()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleAuth = async () => {
    setIsLoggingIn(true)
    
    // Simulate authentication
    setTimeout(() => {
      if (user) {
        setUser(null)
      } else {
        setUser({
          id: '1',
          name: 'Demo User',
          email: 'demo@medihelp.com',
          avatar: '👤'
        })
      }
      setIsLoggingIn(false)
    }, 1000)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-6">
        <h2 className="text-xl font-semibold">MediHelp</h2>
        <p className="text-gray-300 text-sm mt-1">AI Assistant</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sidebar-section"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">User Profile</h3>
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="w-full btn-secondary text-sm"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingIn ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                👤
              </div>
              <p className="text-gray-500 text-sm mb-4">Sign in to save your history</p>
              <button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="w-full btn-primary text-sm"
              >
                <LogIn className="w-4 h-4" />
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Medicine Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sidebar-section"
        >
          <div className="flex items-center gap-3 mb-4">
            <Pill className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Medicine Info</h3>
          </div>
          <MedicineInfo />
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sidebar-section"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">History</h3>
            </div>
            <button
              onClick={clearHistory}
              className="p-1 text-gray-400 hover:text-error-500 transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <HistoryPanel />
        </motion.div>
      </div>
    </div>
  )
}