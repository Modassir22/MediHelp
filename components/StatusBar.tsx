'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function StatusBar() {
  const { status } = useAppStore()

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <XCircle className="w-5 h-5" />
      case 'warning':
        return <AlertCircle className="w-5 h-5" />
      case 'processing':
        return <Clock className="w-5 h-5 animate-spin" />
      default:
        return <CheckCircle className="w-5 h-5" />
    }
  }

  const getStatusColor = () => {
    switch (status.type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-700'
      case 'error':
        return 'bg-error-50 border-error-200 text-error-700'
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-700'
      case 'processing':
        return 'bg-primary-50 border-primary-200 text-primary-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <motion.div
      initial={{ y: 64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`border-t px-6 py-4 ${getStatusColor()}`}
    >
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="font-medium">{status.message}</span>
        </div>

        {status.type === 'processing' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}

        <div className="text-sm opacity-75">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}