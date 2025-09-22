'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { motion } from 'framer-motion'
import { Camera, CameraOff, RotateCcw } from 'lucide-react'

interface CameraPanelProps {
  onCapture: (imageData: string) => void
}

export default function CameraPanel({ onCapture }: CameraPanelProps) {
  const webcamRef = useRef<Webcam>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  useEffect(() => {
    // Check camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false))

    // Listen for capture trigger
    const handleCapture = () => {
      capture()
    }

    // Listen for voice-triggered capture
    const handleVoiceCapture = () => {
      console.log('Voice-triggered capture')
      capture()
    }

    window.addEventListener('triggerCapture', handleCapture)
    window.addEventListener('voiceIdentifyMedicine', handleVoiceCapture)
    
    return () => {
      window.removeEventListener('triggerCapture', handleCapture)
      window.removeEventListener('voiceIdentifyMedicine', handleVoiceCapture)
    }
  }, [])

  const capture = useCallback(() => {
    console.log('📸 Capturing image...')
    
    if (!webcamRef.current) {
      console.log('❌ Camera not ready')
      return
    }

    setIsCapturing(true)
    
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot()
      if (imageSrc) {
        console.log('📸 Image captured, analyzing...')
        onCapture(imageSrc)
      } else {
        console.log('❌ Failed to capture image')
      }
      setIsCapturing(false)
    }, 200)
  }, [onCapture])

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  }

  if (hasPermission === false) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="camera-container aspect-video flex items-center justify-center"
      >
        <div className="text-center text-white">
          <CameraOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Camera Access Denied</h3>
          <p className="text-sm opacity-75 mb-4">
            Please allow camera access to use medicine recognition
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  if (hasPermission === null) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="camera-container aspect-video flex items-center justify-center"
      >
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm opacity-75">Requesting camera access...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="camera-container aspect-video relative overflow-hidden"
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
        />
        
        {/* Capture Overlay */}
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white"
          />
        )}

        {/* Camera Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={toggleCamera}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            title="Switch Camera"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={capture}
            disabled={isCapturing}
            className="bg-white text-gray-900 p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Capture Image"
          >
            <Camera className="w-6 h-6" />
          </motion.button>

          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Voice Command Guidelines */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/70 text-white text-sm px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              🎤 <span className="font-medium">Voice Commands:</span>
            </div>
            <div className="text-xs space-y-1">
              <div>🇺🇸 "What is this medicine?"</div>
              <div>🇮🇳 "इस दवाई का क्या नाम है?"</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Camera Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Camera Active</span>
        </div>
        <span>
          {facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
        </span>
      </div>
    </div>
  )
}