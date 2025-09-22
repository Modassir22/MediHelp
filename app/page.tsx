'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import CameraPanel from '@/components/CameraPanel'
import ControlPanel from '@/components/ControlPanel'
import StatusBar from '@/components/StatusBar'
import { useAppStore } from '@/store/useAppStore'

// Fixed import for MLService - using named export since that's what works
import { MLService } from '@/services/MLService'
import { TTSService } from '@/services/TTSService'
import { VoiceService } from '@/services/VoiceService'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const { 
    currentMedicine, 
    setCurrentMedicine, 
    addToHistory, 
    setStatus,
    language,
    setLanguage
  } = useAppStore()

  // Initialize services with error handling
  const [mlService] = useState(() => {
    try {
      console.log('Initializing MLService...')
      const service = new MLService()
      console.log('MLService created successfully:', service)
      return service
    } catch (error) {
      console.error('Failed to initialize MLService:', error)
      console.error('MLService type:', typeof MLService)
      console.error('MLService:', MLService)
      return null
    }
  })
  
  const [ttsService] = useState(() => {
    try {
      return new TTSService()
    } catch (error) {
      console.error('Failed to initialize TTSService:', error)
      return null
    }
  })
  
  const [voiceService] = useState(() => {
    try {
      return new VoiceService()
    } catch (error) {
      console.error('Failed to initialize VoiceService:', error)
      return null
    }
  })

  useEffect(() => {
    // Initialize services
    const initServices = async () => {
      try {
        // Check if services were initialized successfully
        if (!mlService || !ttsService || !voiceService) {
          throw new Error('One or more services failed to initialize')
        }

        await mlService.initialize()
        await ttsService.initialize()
        await voiceService.initialize()
        
        // Set initial language for voice service
        voiceService.setLanguage(language)
        
        // Start voice listening automatically
        setTimeout(() => {
          const started = voiceService.startListening()
          if (started) {
            setStatus('Ready - Say "What is this medicine?" to identify', 'success')
          } else {
            setStatus('Ready to analyze medicines', 'success')
          }
        }, 1000)
        
        setIsLoading(false)
      } catch (error) {
        console.error('Service initialization failed:', error)
        setStatus('Service initialization failed', 'error')
        setIsLoading(false)
      }
    }

    // Voice command handlers
    const handleVoiceIdentify = (event: any) => {
      const { transcript, language: voiceLang } = event.detail
      console.log('🎤 VOICE COMMAND RECEIVED:', transcript)
      console.log('🎤 Voice language:', voiceLang)
      
      // Check if TTS service is available
      if (!ttsService) {
        console.warn('TTS service not available')
        return
      }
      
      // Provide immediate feedback
      if (voiceLang === 'hi') {
        console.log('🗣️ Speaking Hindi response...')
        ttsService.speak('दवाई की पहचान की जा रही है...', 'hi')
      } else {
        console.log('🗣️ Speaking English response...')
        ttsService.speak('Identifying medicine...', 'en')
      }
      
      // Trigger image capture after a short delay
      console.log('⏰ Setting capture timer...')
      setTimeout(() => {
        console.log('📸 Triggering capture from voice command...')
        const captureEvent = new CustomEvent('triggerCapture')
        window.dispatchEvent(captureEvent)
      }, 1500)
    }

    const handleLanguageChange = (event: any) => {
      const { language: newLang } = event.detail
      setLanguage(newLang)
      
      if (voiceService) {
        voiceService.setLanguage(newLang)
      }
      
      if (ttsService) {
        if (newLang === 'hi') {
          ttsService.speak('भाषा हिंदी में बदल दी गई', 'hi')
          setStatus('तैयार - "इस दवाई का क्या नाम है?" कहें', 'success')
        } else {
          ttsService.speak('Language changed to English', 'en')
          setStatus('Ready - Say "What is this medicine?" to identify', 'success')
        }
      }
    }

    const handleRepeatInfo = () => {
      if (!ttsService) {
        console.warn('TTS service not available')
        return
      }

      if (currentMedicine) {
        const message = formatMedicineMessage(currentMedicine, language)
        ttsService.speak(message, language)
      } else {
        const noInfoMsg = language === 'hi' ? 'कोई दवाई की जानकारी उपलब्ध नहीं है' : 'No medicine information available'
        ttsService.speak(noInfoMsg, language)
      }
    }

    // Add event listeners
    window.addEventListener('voiceIdentifyMedicine', handleVoiceIdentify)
    window.addEventListener('changeLanguage', handleLanguageChange)
    window.addEventListener('repeatInformation', handleRepeatInfo)

    initServices()

    // Cleanup
    return () => {
      window.removeEventListener('voiceIdentifyMedicine', handleVoiceIdentify)
      window.removeEventListener('changeLanguage', handleLanguageChange)
      window.removeEventListener('repeatInformation', handleRepeatInfo)
    }
  }, [mlService, ttsService, voiceService, setStatus, language, currentMedicine, setLanguage])

  const handleImageCapture = async (imageData: string) => {
    console.log('📸 Starting medicine analysis...')
    
    if (!mlService) {
      setStatus('ML service not available', 'error')
      return
    }
    
    try {
      // Step 1: Capture feedback
      setStatus('Image captured, starting analysis...', 'processing')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 2: Convert to blob
      setStatus('Processing image data...', 'processing')
      const response = await fetch(imageData)
      const blob = await response.blob()
      console.log('✅ Image converted, size:', blob.size, 'bytes')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Step 3: Analyze content
      setStatus('Analyzing image content...', 'processing')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Step 4: OCR processing
      setStatus('Reading text from medicine...', 'processing')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Step 5: Medicine matching
      setStatus('Identifying medicine...', 'processing')
      const prediction = await mlService.predictMedicine(blob)
      console.log('🎯 Analysis complete:', prediction)
      
      // Final result
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (prediction && prediction.detectedName) {
        // Medicine detected
        console.log('🏥 MEDICINE DETECTED: ' + prediction.detectedName)
        setStatus('✅ Medicine Identified: ' + prediction.detectedName, 'success')
        
        // Speak the result
        const message = language === 'hi' 
          ? `मैंने पहचाना है यह ${prediction.detectedName} है`
          : `I have identified this as ${prediction.detectedName}`
        
        if (ttsService) {
          try {
            await ttsService.speak(message, language)
          } catch (ttsError) {
            console.warn('TTS failed:', ttsError)
          }
        }
      } else {
        // No medicine detected
        console.log('🏥 RESULT: No medicine detected')
        setStatus('❌ No medicine detected in image', 'warning')
        
        const noMedicineMsg = language === 'hi' 
          ? 'कोई दवाई नहीं मिली। कृपया दवाई को साफ तरीके से कैमरे के सामने रखें।'
          : 'No medicine detected. Please hold the medicine clearly in front of the camera.'
        
        if (ttsService) {
          try {
            await ttsService.speak(noMedicineMsg, language)
          } catch (ttsError) {
            console.warn('TTS failed:', ttsError)
          }
        }
      }
      
      if (prediction && prediction.confidence > 0.6) {
        // Get detailed medicine information
        console.log('Getting medicine details for:', prediction.medicineId)
        const medicineInfo = await mlService.getMedicineDetails(prediction.medicineId)
        console.log('Medicine info:', medicineInfo)
        
        if (medicineInfo) {
          // Normalize Kaggle data to UI Medicine shape
          const usesArray = Array.isArray(medicineInfo.uses)
            ? medicineInfo.uses
            : typeof medicineInfo.uses === 'string'
              ? medicineInfo.uses.split(',').map((u: string) => u.trim()).filter((u: string) => u.length > 0)
              : []

          const sideEffectsArray = Array.isArray(medicineInfo.sideEffects)
            ? medicineInfo.sideEffects
            : typeof medicineInfo.sideEffects === 'string'
              ? medicineInfo.sideEffects.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
              : []

          const normalizedMedicine = {
            id: medicineInfo.id,
            name: medicineInfo.name,
            genericName: medicineInfo.composition || medicineInfo.genericName || '',
            manufacturer: medicineInfo.manufacturer || '',
            category: (medicineInfo as any).type || (medicineInfo as any).category || '',
            dosage: {
              min: '-',
              max: '-',
              frequency: 'Refer leaflet'
            },
            uses: usesArray,
            sideEffects: sideEffectsArray,
            confidence: prediction.confidence,
            timestamp: new Date().toISOString(),
            imageData
          }

          // Update current medicine and history with normalized shape
          setCurrentMedicine(normalizedMedicine)
          addToHistory(normalizedMedicine)
          
          // Speak the results
          const message = formatMedicineMessage(medicineInfo, language)
          console.log('Speaking message:', message)
          
          if (ttsService) {
            try {
              await ttsService.speak(message, language)
            } catch (ttsError) {
              console.warn('TTS failed:', ttsError)
            }
          }
          
          setStatus(`Medicine recognized: ${medicineInfo.name}`, 'success')
        } else {
          console.error('No medicine info found for ID:', prediction.medicineId)
          setStatus('Medicine data not found', 'error')
        }
      } else if (prediction === null) {
        // No medicine detected in image
        console.log('No medicine detected in image')
        setCurrentMedicine(null)
        
        const noMedicineMsg = language === 'hi' 
          ? 'कोई दवाई नहीं दिख रही। कृपया दवाई को कैमरे के सामने रखें।'
          : 'No medicine detected. Please hold the medicine clearly in front of the camera.'
        
        setStatus('No medicine detected in image', 'warning')
        
        if (ttsService) {
          try {
            await ttsService.speak(noMedicineMsg, language)
          } catch (ttsError) {
            console.warn('TTS failed:', ttsError)
          }
        }
      } else {
        console.log('Low confidence prediction')
        setCurrentMedicine(null)
        
        const lowConfidenceMsg = language === 'hi'
          ? 'दवाई की पहचान स्पष्ट नहीं है। कृपया फिर से कोशिश करें।'
          : 'Medicine recognition unclear. Please try again with better lighting.'
        
        setStatus('Could not recognize medicine clearly', 'warning')
        
        if (ttsService) {
          try {
            await ttsService.speak(lowConfidenceMsg, language)
          } catch (ttsError) {
            console.warn('TTS failed:', ttsError)
          }
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      setStatus(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      setCurrentMedicine(null)
    }
  }

  const formatMedicineMessage = (medicine: any, lang: string) => {
    if (lang === 'hi') {
      // Use Hindi translations if available, but handle the data structure from Kaggle
      const hindiUses = medicine.hindi?.uses || medicine.uses
      
      // Handle dosage - Kaggle data might not have min/max structure
      let dosageText = 'मानक खुराक'
      if (medicine.dosage) {
        if (typeof medicine.dosage === 'string') {
          dosageText = medicine.dosage
        } else if (medicine.dosage.min && medicine.dosage.max) {
          dosageText = `${medicine.dosage.min} से ${medicine.dosage.max}`
        }
      }
      
      return `यह ${medicine.name} है। खुराक: ${dosageText}। उपयोग: ${Array.isArray(hindiUses) ? hindiUses.join(', ') : hindiUses}`
    }
    
    // Handle dosage for English
    let dosageText = 'Standard dosage'
    if (medicine.dosage) {
      if (typeof medicine.dosage === 'string') {
        dosageText = medicine.dosage
      } else if (medicine.dosage.min && medicine.dosage.max) {
        dosageText = `${medicine.dosage.min} to ${medicine.dosage.max}`
      }
    }
    
    return `This is ${medicine.name}. Dosage: ${dosageText}. Uses: ${Array.isArray(medicine.uses) ? medicine.uses.join(', ') : medicine.uses}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Initializing MediHelp...</h2>
          <p className="text-gray-500 mt-2">Loading AI models and services</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-80 bg-white border-r border-gray-200 flex-shrink-0"
        >
          <Sidebar />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 p-6"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Camera Section */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  📷 Camera Feed
                </h2>
                <CameraPanel onCapture={handleImageCapture} />
              </div>

              {/* Controls */}
              <ControlPanel 
                onCapture={() => {
                  // Trigger capture from camera panel
                  const event = new CustomEvent('triggerCapture')
                  window.dispatchEvent(event)
                }}
                mlService={mlService}
                ttsService={ttsService}
              />
            </div>
          </motion.div>

          {/* Status Bar */}
          <StatusBar />
        </div>
      </div>
    </div>
  )
}