'use client'

import { motion } from 'framer-motion'
import { Clock, TrendingUp } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function HistoryPanel() {
  const { history, setCurrentMedicine } = useAppStore()

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6"
      >
        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No history yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Recognized medicines will appear here
        </p>
      </motion.div>
    )
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
      {history.slice().reverse().map((item, index) => (
        <motion.div
          key={item.timestamp}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setCurrentMedicine(item)}
          className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h5 className="font-medium text-gray-900 text-sm line-clamp-1">
              {item.name}
            </h5>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {Math.round(item.confidence * 100)}%
              </span>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mb-2">
            {item.dosage.min} - {item.dosage.max}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {item.uses.slice(0, 2).map((use: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded"
                >
                  {use}
                </span>
              ))}
              {item.uses.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{item.uses.length - 2}
                </span>
              )}
            </div>
            
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(item.timestamp)}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}