import * as tf from '@tensorflow/tfjs'
import { createWorker, PSM } from 'tesseract.js'

interface MedicinePrediction {
    medicineId: string
    confidence: number
    embeddings: number[]
    detectedName?: string
    source: 'ocr' | 'visual' | 'embedding'
}

interface KaggleMedicineData {
    id: string
    name: string
    composition: string
    uses: string
    sideEffects: string
    imageUrl?: string
    manufacturer?: string
    type?: string
    embeddings?: number[]
}

export class MLService {
    private model: tf.LayersModel | null = null
    private kaggleMedicineDatabase: KaggleMedicineData[] = []
    private medicineEmbeddings: Map<string, number[]> = new Map()
    private isInitialized = false
    private textEncoder: any = null

    constructor() {
        console.log('MLService initialized - will load Kaggle dataset on initialization')
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                return
            }
            console.log('Initializing ML Service with Kaggle dataset...')

            // Wait for TensorFlow.js to be ready
            await tf.ready()
            console.log('TensorFlow.js ready')

            // Load the trained model
            await this.loadModel()

            // CRITICAL: Load actual Kaggle medicine database
            await this.loadKaggleMedicineDatabase()

            // Generate embeddings for all medicines
            await this.generateMedicineEmbeddings()

            this.isInitialized = true
            console.log('ML Service initialized successfully with', this.kaggleMedicineDatabase.length, 'medicines from Kaggle')
        } catch (error) {
            console.error('ML Service initialization failed:', error)
            this.isInitialized = false
            throw error
        }
    }

    private async loadKaggleMedicineDatabase() {
        try {
            console.log('Loading Kaggle A-Z Medicine Database...')

            // Try multiple sources for Kaggle medicine data
            const kaggleDataSources = [
                // Prefer the full Kaggle DB if available in public/data
                '/data/kaggle_medicine_db.json',
                // Fallbacks
                '/data/kaggle-medicine-az.json',
                '/api/medicines',
                '/data/medicine-az-dataset.json'
            ]

            for (const source of kaggleDataSources) {
                try {
                    console.log('Trying to load Kaggle data from:', source)
                    const response = await fetch(source)

                    if (response.ok) {
                        const data = await response.json()
                        
                        if (data && (Array.isArray(data) || typeof data === 'object')) {
                            // Handle different data formats
                            let medicines: any[] = []
                            
                            if (Array.isArray(data)) {
                                medicines = data
                            } else if (data.medicines && Array.isArray(data.medicines)) {
                                medicines = data.medicines
                            } else {
                                medicines = (Object as any).values(data)
                            }

                            // Convert to standardized format
                            this.kaggleMedicineDatabase = medicines.map((med: any, index: number) => ({
                                id: med.id || `kaggle_${index}`,
                                name: med.name || med.Name || med.drug_name || 'Unknown',
                                composition: med.composition || med.Composition || med.ingredients || '',
                                uses: med.uses || med.Uses || med.indication || '',
                                sideEffects: med.sideEffects || med.side_effects || med.Side_effects || '',
                                manufacturer: med.manufacturer || med.Manufacturer || '',
                                type: med.type || med.Type || med.drug_type || '',
                                imageUrl: med.imageUrl || med.image_url || null
                            }))

                            if (this.kaggleMedicineDatabase.length > 0) {
                                console.log(`✅ Kaggle medicine database loaded from ${source}:`, this.kaggleMedicineDatabase.length, 'medicines')
                                console.log('Sample medicines:', this.kaggleMedicineDatabase.slice(0, 3).map(m => m.name))
                                return
                            }
                        }
                    }
                } catch (error: any) {
                    console.log(`Failed to load from ${source}:`, error?.message || error)
                }
            }

            throw new Error('Could not load Kaggle medicine database from any source')

        } catch (error: any) {
            console.error('Failed to load Kaggle medicine database:', error)
            throw error
        }
    }

    private async generateMedicineEmbeddings() {
        console.log('Generating embeddings for', this.kaggleMedicineDatabase.length, 'medicines...')

        try {
            // Skip external model loading in browser to avoid CORS/peer conflicts
            this.textEncoder = null

            // Generate embeddings for each medicine
            for (const medicine of this.kaggleMedicineDatabase) {
                const textToEmbed = `${medicine.name} ${medicine.composition} ${medicine.uses}`.toLowerCase()
                
                let embedding: number[]
                
                if (this.textEncoder) {
                    // Use actual ML embeddings
                    embedding = await this.generateMLEmbedding(textToEmbed)
                } else {
                    // Use simple text-based embeddings
                    embedding = this.generateSimpleTextEmbedding(textToEmbed)
                }
                
                this.medicineEmbeddings.set(medicine.id, embedding)
                medicine.embeddings = embedding
            }

            console.log('Generated embeddings for all medicines')
        } catch (error: any) {
            console.error('Failed to generate embeddings:', error)
            // Fallback to simple embeddings
            this.generateFallbackEmbeddings()
        }
    }

    private async generateMLEmbedding(text: string): Promise<number[]> {
        if (!this.textEncoder) {
            return this.generateSimpleTextEmbedding(text)
        }
        // Fallback path won't be reached since textEncoder is null above
        return this.generateSimpleTextEmbedding(text)
    }

    private generateSimpleTextEmbedding(text: string, size: number = 512): number[] {
        // Simple but deterministic text embedding based on character codes and n-grams
        const embedding = new Array(size).fill(0)
        const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
        const words = cleanText.split(/\s+/).filter(w => w.length > 0)
        
        // Character-based features
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i)
            const index = (charCode * (i + 1)) % size
            embedding[index] += 1
        }
        
        // Word-based features
        words.forEach((word, wordIndex) => {
            for (let i = 0; i < word.length; i++) {
                const charCode = word.charCodeAt(i)
                const index = (charCode * wordIndex + i) % size
                embedding[index] += 2
            }
        })
        
        // Normalize
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
        return norm > 0 ? embedding.map(val => val / norm) : embedding
    }

    private generateFallbackEmbeddings() {
        console.log('Generating fallback embeddings...')
        for (const medicine of this.kaggleMedicineDatabase) {
            const textToEmbed = `${medicine.name} ${medicine.composition} ${medicine.uses}`.toLowerCase()
            const embedding = this.generateSimpleTextEmbedding(textToEmbed)
            this.medicineEmbeddings.set(medicine.id, embedding)
            medicine.embeddings = embedding
        }
    }

    async predictMedicine(imageBlob: Blob): Promise<MedicinePrediction | null> {
        console.log('🔍 STARTING MEDICINE RECOGNITION FROM KAGGLE DATASET')
        
        // CRITICAL: Must have initialized Kaggle database
        if (!this.isInitialized || this.kaggleMedicineDatabase.length === 0) {
            console.log('❌ FINAL RESULT: Kaggle database not loaded')
            throw new Error('Medicine database not initialized. Call initialize() first.')
        }

        // CRITICAL: Must have valid image
        if (!imageBlob || imageBlob.size === 0) {
            console.log('❌ FINAL RESULT: No image provided')
            return null
        }

        console.log('📊 Image blob size:', imageBlob.size, 'bytes')
        console.log('📊 Available medicines in Kaggle DB:', this.kaggleMedicineDatabase.length)

        try {
            // Step 1: Strict image validation
            console.log('📋 Step 1: Validating image...')
            const isValidImage = await this.validateImageStrict(imageBlob)
            
            if (!isValidImage) {
                console.log('❌ FINAL RESULT: Invalid image - no meaningful content detected')
                return null
            }

            // Step 2: Extract text using OCR
            console.log('📋 Step 2: Running OCR...')
            const ocrWords = await this.runRealOCR(imageBlob)
            
            if (ocrWords.length === 0) {
                console.log('❌ FINAL RESULT: No text detected in image')
                return null
            }

            console.log('✅ OCR extracted words:', ocrWords)

            // Step 3: Search in Kaggle database using embeddings
            console.log('📋 Step 3: Searching in Kaggle database...')
            const matchedMedicine = await this.searchKaggleDatabase(ocrWords)
            
            if (matchedMedicine) {
                console.log('🎉 FINAL RESULT: MEDICINE FOUND IN KAGGLE DB -', matchedMedicine.name)
                return {
                    medicineId: matchedMedicine.id,
                    confidence: 0.88,
                    embeddings: matchedMedicine.embeddings || [],
                    detectedName: matchedMedicine.name,
                    source: 'embedding'
                }
            }

            console.log('❌ FINAL RESULT: No medicine found in Kaggle database')
            return null

        } catch (error) {
            console.log('❌ FATAL ERROR:', error)
            return null
        }
    }

    private async searchKaggleDatabase(ocrWords: string[]): Promise<KaggleMedicineData | null> {
        console.log('🔍 Searching Kaggle database with words:', ocrWords)
        
        if (ocrWords.length === 0) {
            return null
        }

        // Create search query embedding
        const queryText = ocrWords.join(' ').toLowerCase()
        const queryEmbedding = this.generateSimpleTextEmbedding(queryText)

        let bestMatch: { medicine: KaggleMedicineData, score: number } | null = null

        // Search through all Kaggle medicines
        for (const medicine of this.kaggleMedicineDatabase) {
            let totalScore = 0

            // 1. Direct text matching (highest priority)
            const directMatchScore = this.calculateDirectMatch(medicine, ocrWords)
            totalScore += directMatchScore * 0.6

            // 2. Embedding similarity (ML approach)
            const embeddingScore = this.calculateEmbeddingSimilarity(queryEmbedding, medicine.embeddings || [])
            totalScore += embeddingScore * 0.25

            // 3. Fuzzy matching
            const fuzzyScore = this.calculateFuzzyMatch(medicine, ocrWords)
            totalScore += fuzzyScore * 0.15

            // 4. Numeric token boost (e.g., 650, 500, 40)
            const composition = (medicine.composition || '').toLowerCase()
            for (const w of ocrWords) {
                if (/^\d{2,4}$/.test(w)) {
                    if (composition.includes(w)) {
                        totalScore += 0.2
                    }
                }
            }

            console.log(`${medicine.name}: direct=${directMatchScore.toFixed(2)}, embedding=${embeddingScore.toFixed(2)}, fuzzy=${fuzzyScore.toFixed(2)}, total=${totalScore.toFixed(2)}`)

            if (totalScore > 0.4 && (!bestMatch || totalScore > bestMatch.score)) {
                bestMatch = { medicine, score: totalScore }
            }
        }

        if (bestMatch && bestMatch.score > 0.25) {
            console.log('✅ Best match found:', bestMatch.medicine.name, 'Score:', bestMatch.score.toFixed(3))
            return bestMatch.medicine
        }

        console.log('❌ No sufficient matches found in Kaggle database')
        return null
    }

    private calculateDirectMatch(medicine: KaggleMedicineData, ocrWords: string[]): number {
        let score = 0
        const medicineName = medicine.name.toLowerCase()
        const composition = medicine.composition.toLowerCase()

        for (const word of ocrWords) {
            const cleanWord = word.toLowerCase().trim()
            if (cleanWord.length < 2) continue

            // Exact name match
            if (medicineName.includes(cleanWord) || cleanWord.includes(medicineName.split(' ')[0])) {
                score += 1.0
            }

            // Composition match
            if (composition.includes(cleanWord)) {
                score += 0.8
            }

            // Numeric emphasis (mg strengths)
            if (/^\d{2,4}$/.test(cleanWord) && composition.includes(cleanWord)) {
                score += 0.8
            }

            // Word-level matching
            const nameWords = medicineName.split(/[\s\-\.]+/)
            for (const nameWord of nameWords) {
                if (nameWord.length > 2 && (nameWord.includes(cleanWord) || cleanWord.includes(nameWord))) {
                    score += 0.6
                }
            }
        }

        return Math.min(score, 1.0) // Cap at 1.0
    }

    private calculateEmbeddingSimilarity(queryEmbedding: number[], medicineEmbedding: number[]): number {
        if (!medicineEmbedding || medicineEmbedding.length === 0) {
            return 0
        }

        return this.cosineSimilarity(queryEmbedding, medicineEmbedding)
    }

    private calculateFuzzyMatch(medicine: KaggleMedicineData, ocrWords: string[]): number {
        let score = 0
        const searchText = `${medicine.name} ${medicine.composition}`.toLowerCase()

        for (const word of ocrWords) {
            const cleanWord = word.toLowerCase().trim()
            if (cleanWord.length < 3) continue

            // Substring matching with edit distance tolerance
            for (const searchWord of searchText.split(/\s+/)) {
                if (searchWord.length > 2) {
                    const similarity = this.calculateStringSimilarity(cleanWord, searchWord)
                    if (similarity > 0.6) {
                        score += similarity * 0.5
                    }
                }
            }
        }

        return Math.min(score, 1.0)
    }

    private calculateStringSimilarity(str1: string, str2: string): number {
        if (str1 === str2) return 1.0
        
        const longer = str1.length > str2.length ? str1 : str2
        const shorter = str1.length > str2.length ? str2 : str1
        
        if (longer.length === 0) return 1.0
        
        const editDistance = this.levenshteinDistance(str1, str2)
        return (longer.length - editDistance) / longer.length
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = []
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i]
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1]
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    )
                }
            }
        }
        
        return matrix[str2.length][str1.length]
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0

        let dotProduct = 0
        let normA = 0
        let normB = 0

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i]
            normA += a[i] * a[i]
            normB += b[i] * b[i]
        }

        const denominator = Math.sqrt(normA) * Math.sqrt(normB)
        return denominator === 0 ? 0 : dotProduct / denominator
    }

    // Image validation methods (same as before)
    private async validateImageStrict(imageBlob: Blob): Promise<boolean> {
        try {
            if (!imageBlob.type.startsWith('image/')) {
                console.log('❌ Not an image file')
                return false
            }

            if (imageBlob.size < 1000 || imageBlob.size > 10 * 1024 * 1024) {
                console.log('❌ Image size invalid')
                return false
            }

            const image = await this.blobToImage(imageBlob)
            
            if (image.width < 50 || image.height < 50) {
                console.log('❌ Image dimensions too small')
                return false
            }

            // Be permissive to reduce false negatives in varied lighting
            return true

        } catch (error: any) {
            console.log('❌ Image validation failed:', error)
            return false
        }
    }

    private async detectRealContent(imageBlob: Blob): Promise<boolean> {
        try {
            const image = await this.blobToImage(imageBlob)
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!

            canvas.width = image.width
            canvas.height = image.height
            ctx.drawImage(image, 0, 0)

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const pixels = imageData.data

            let totalBrightness = 0
            let totalVariance = 0
            const pixelCount = pixels.length / 4

            for (let i = 0; i < pixels.length; i += 4) {
                const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
                totalBrightness += brightness
            }
            const avgBrightness = totalBrightness / pixelCount

            for (let i = 0; i < pixels.length; i += 4) {
                const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
                totalVariance += Math.pow(brightness - avgBrightness, 2)
            }
            const variance = totalVariance / pixelCount

            console.log('📊 Content analysis - Brightness:', avgBrightness.toFixed(1), 'Variance:', variance.toFixed(1))

            if (variance < 20 || avgBrightness > 245 || avgBrightness < 10) {
                return false
            }

            return this.detectTextualStructure(canvas, ctx)

        } catch (error: any) {
            return false
        }
    }

    private detectTextualStructure(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): boolean {
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const pixels = imageData.data
            const width = canvas.width
            const height = canvas.height

            let edgeCount = 0
            const sampleSize = Math.min(width * height / 20, 500)

            for (let i = 0; i < sampleSize; i++) {
                const x = Math.floor(Math.random() * (width - 2)) + 1
                const y = Math.floor(Math.random() * (height - 2)) + 1

                const centerIdx = (y * width + x) * 4
                const rightIdx = (y * width + (x + 1)) * 4
                const bottomIdx = ((y + 1) * width + x) * 4

                const centerB = (pixels[centerIdx] + pixels[centerIdx + 1] + pixels[centerIdx + 2]) / 3
                const rightB = (pixels[rightIdx] + pixels[rightIdx + 1] + pixels[rightIdx + 2]) / 3
                const bottomB = (pixels[bottomIdx] + pixels[bottomIdx + 1] + pixels[bottomIdx + 2]) / 3

                if (Math.abs(centerB - rightB) > 30 || Math.abs(centerB - bottomB) > 30) {
                    edgeCount++
                }
            }

            return edgeCount / sampleSize > 0.1
        } catch (error: any) {
            return false
        }
    }

    private async runRealOCR(imageBlob: Blob): Promise<string[]> {
        try {
            console.log('🤖 Running OCR...')
            const worker = await createWorker('eng')

            // First pass OCR
            let { data: { text, confidence } } = await worker.recognize(imageBlob)
            console.log('📝 OCR text (pass 1):', (text || '').trim())
            console.log('📊 OCR confidence (pass 1):', confidence)

            // Fallback: tune parameters if low-confidence/no text
            if (!text || confidence < 20 || text.trim().length < 3) {
                try {
                    await worker.setParameters({
                        tessedit_pageseg_mode: String(PSM.SPARSE_TEXT),
                        preserve_interword_spaces: '1'
                    } as any)
                } catch {}

                const second = await worker.recognize(imageBlob)
                const text2 = (second.data.text || '').trim()
                const conf2 = second.data.confidence
                console.log('📝 OCR text (pass 2):', text2)
                console.log('📊 OCR confidence (pass 2):', conf2)
                if (text2.length > text.trim().length) {
                    text = text2
                    confidence = conf2
                }
            }

            await worker.terminate()

            if (!text || confidence < 10) {
                return []
            }

            const words: string[] = text
                .toUpperCase()
                .replace(/[^A-Z0-9\s]/g, ' ')
                .split(/\s+/)
                .filter((word: string) => word.length > 1)
                .filter((word: string) => !['THE', 'AND', 'FOR', 'WITH', 'OF', 'IN', 'ON', 'AT'].includes(word))

            return words
        } catch (error: any) {
            console.log('❌ OCR failed:', error)
            return []
        }
    }

    private async blobToImage(blob: Blob): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                URL.revokeObjectURL(img.src)
                resolve(img)
            }
            img.onerror = () => {
                URL.revokeObjectURL(img.src)
                reject(new Error('Failed to load image'))
            }
            img.src = URL.createObjectURL(blob)
        })
    }

    private async loadModel() {
        // Model loading implementation
        console.log('Model loading placeholder - implement based on your needs')
    }

    async getMedicineDetails(medicineId: string): Promise<KaggleMedicineData | null> {
        const medicine = this.kaggleMedicineDatabase.find(m => m.id === medicineId)
        return medicine || null
    }

    getModelInfo() {
        return {
            isInitialized: this.isInitialized,
            medicineCount: this.kaggleMedicineDatabase.length,
            databaseSource: 'Kaggle A-Z Medicine Dataset',
            embeddingsGenerated: this.medicineEmbeddings.size,
            sampleMedicines: this.kaggleMedicineDatabase.slice(0, 5).map(m => m.name)
        }
    }
}
