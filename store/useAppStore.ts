import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface Medicine {
  id: string
  name: string
  genericName: string
  manufacturer: string
  category: string
  dosage: {
    min: string
    max: string
    frequency: string
  }
  uses: string[]
  sideEffects?: string[]
  confidence: number
  timestamp: string
  imageData?: string
}

interface Status {
  message: string
  type: 'success' | 'error' | 'warning' | 'processing' | 'info'
}

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Medicine state
  currentMedicine: Medicine | null
  setCurrentMedicine: (medicine: Medicine | null) => void

  // History state
  history: Medicine[]
  addToHistory: (medicine: Medicine) => void
  clearHistory: () => void

  // App state
  language: string
  setLanguage: (language: string) => void
  
  status: Status
  setStatus: (message: string, type: Status['type']) => void

  isOnline: boolean
  setOnline: (online: boolean) => void

  // ML Model state
  modelLoaded: boolean
  setModelLoaded: (loaded: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),

      // Medicine state
      currentMedicine: null,
      setCurrentMedicine: (medicine) => set({ currentMedicine: medicine }),

      // History state
      history: [],
      addToHistory: (medicine) => {
        const { history } = get()
        const newHistory = [medicine, ...history].slice(0, 50) // Keep last 50 items
        set({ history: newHistory })
      },
      clearHistory: () => set({ history: [] }),

      // App state
      language: 'en',
      setLanguage: (language) => set({ language }),

      status: { message: 'Ready', type: 'info' },
      setStatus: (message, type) => set({ status: { message, type } }),

      isOnline: true,
      setOnline: (online) => set({ isOnline: online }),

      // ML Model state
      modelLoaded: false,
      setModelLoaded: (loaded) => set({ modelLoaded: loaded }),
    }),
    {
      name: 'medihelp-storage',
      partialize: (state) => ({
        user: state.user,
        history: state.history,
        language: state.language,
      }),
    }
  )
)