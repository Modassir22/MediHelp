'use client'

import { motion } from 'framer-motion'
import { Camera, TrendingUp, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function MedicineInfo() {
  const { currentMedicine } = useAppStore()

  if (!currentMedicine) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">
          Capture a medicine to see details
        </p>
      </motion.div>
    )
  }

  const confidenceColor = 
    currentMedicine.confidence > 0.8 ? 'text-success-600 bg-success-50' :
    currentMedicine.confidence > 0.6 ? 'text-warning-600 bg-warning-50' :
    'text-error-600 bg-error-50'

  const confidenceWidth = `${Math.round(currentMedicine.confidence * 100)}%`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Medicine Name */}
      <div>
        <h4 className="font-semibold text-lg text-gray-900 mb-1">
          {currentMedicine.name}
        </h4>
        <p className="text-sm text-gray-500">
          {currentMedicine.genericName}
        </p>
      </div>

      {/* Confidence Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Confidence</span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${confidenceColor}`}>
            {Math.round(currentMedicine.confidence * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: confidenceWidth }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-2 rounded-full ${
              currentMedicine.confidence > 0.8 ? 'bg-success-500' :
              currentMedicine.confidence > 0.6 ? 'bg-warning-500' :
              'bg-error-500'
            }`}
          />
        </div>
      </div>

      {/* Dosage Information */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">Dosage</span>
        </div>
        <p className="text-sm text-blue-800">
          <span className="font-medium">Min:</span> {currentMedicine.dosage.min}
        </p>
        <p className="text-sm text-blue-800">
          <span className="font-medium">Max:</span> {currentMedicine.dosage.max}
        </p>
        <p className="text-sm text-blue-800">
          <span className="font-medium">Frequency:</span> {currentMedicine.dosage.frequency}
        </p>
      </div>

      {/* Uses */}
      <div className="bg-green-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-900">Uses</span>
        </div>
        <div className="space-y-1">
          {currentMedicine.uses.map((use: string, index: number) => (
            <span
              key={index}
              className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1"
            >
              {use}
            </span>
          ))}
        </div>
      </div>

      {/* Side Effects Warning */}
      {currentMedicine.sideEffects && currentMedicine.sideEffects.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-900">Side Effects</span>
          </div>
          <ul className="text-sm text-yellow-800 space-y-1">
            {currentMedicine.sideEffects.slice(0, 3).map((effect: string, index: number) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-yellow-600 mt-1">•</span>
                {effect}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Manufacturer */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        <p><span className="font-medium">Manufacturer:</span> {currentMedicine.manufacturer}</p>
        <p><span className="font-medium">Category:</span> {currentMedicine.category}</p>
      </div>
    </motion.div>
  )
}