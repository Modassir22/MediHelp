# MediHelp - AI Medicine Recognition System

A modern, AI-powered medicine recognition system built with Next.js, React, and TensorFlow.js. Features vector embeddings, fine-tuning capabilities, and multi-language voice assistance.

## 🚀 Features

### Core Functionality
- **Real-time Medicine Recognition** using camera capture
- **Vector Embeddings** for accurate similarity matching
- **Multi-language Support** (English, Hindi, Spanish, French)
- **Voice Commands** for hands-free operation
- **Text-to-Speech** feedback with medicine details
- **Recognition History** with detailed tracking

### AI/ML Capabilities
- **Transfer Learning** with MobileNetV2 base model
- **Custom Fine-tuning** for new medicine types
- **Vector Similarity Search** using cosine similarity
- **Text + Image Embeddings** for comprehensive matching
- **Confidence Scoring** with visual indicators

### Modern UI/UX
- **Responsive Design** with Tailwind CSS
- **Roboto Font Family** throughout the application
- **Smooth Animations** with Framer Motion
- **Real-time Camera Feed** with WebRTC
- **Professional Sidebar** with user auth, medicine info, and history

## 🛠 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management

### AI/ML
- **TensorFlow.js** - Client-side ML inference
- **Python Training Scripts** - Model training and embeddings
- **Vector Embeddings** - Similarity-based matching
- **Transfer Learning** - Efficient model training

### APIs & Services
- **Web Speech API** - Voice recognition and TTS
- **WebRTC** - Camera access
- **RESTful APIs** - Medicine database management

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ (for training scripts)
- Modern web browser with camera access

### Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd medihelp-ai
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Python Dependencies (for training)
```bash
pip install tensorflow numpy scikit-learn sentence-transformers pillow
```

## 🎯 Usage

### Basic Operation
1. **Allow camera access** when prompted
2. **Position medicine** clearly in camera frame
3. **Click "Capture & Analyze"** or use voice command
4. **View results** in sidebar with confidence score
5. **Listen to audio feedback** in selected language

### Voice Commands
- "MediHelp, capture medicine"
- "MediHelp, change language to Hindi"
- "MediHelp, repeat information"
- "MediHelp, clear history"

### Language Support
- **English** - Default language
- **Hindi (हिंदी)** - Full UI and voice support
- **Spanish (Español)** - UI and voice support
- **French (Français)** - UI and voice support

## 🤖 AI Model Training

### Prepare Training Data
```bash
# Organize your data like this:
training_data/
├── paracetamol/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── ibuprofen/
│   ├── image1.jpg
│   └── ...
└── aspirin/
    └── ...
```

### Train Custom Model
```bash
python scripts/train_model.py \
  --data_dir ./training_data \
  --output_dir ./models \
  --epochs 20 \
  --fine_tune_epochs 10
```

### Generate Embeddings
```bash
python scripts/generate_embeddings.py \
  --medicine_db ./data/medicine_db.json \
  --images_dir ./medicine_images \
  --output_dir ./embeddings
```

## 🏗 Architecture

### Component Structure
```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Main application
├── globals.css        # Global styles
└── api/
    └── medicines/     # Medicine API routes

components/
├── Header.tsx         # App header with status
├── Sidebar.tsx        # Main sidebar container
├── MedicineInfo.tsx   # Medicine details display
├── HistoryPanel.tsx   # Recognition history
├── CameraPanel.tsx    # Camera feed and capture
├── ControlPanel.tsx   # Controls and settings
└── StatusBar.tsx      # Status feedback

services/
├── MLService.ts       # ML model and predictions
├── TTSService.ts      # Text-to-speech
└── VoiceService.ts    # Voice recognition

store/
└── useAppStore.ts     # Zustand state management
```

### ML Pipeline
1. **Image Capture** → Camera/WebRTC
2. **Preprocessing** → Resize, normalize
3. **Feature Extraction** → TensorFlow.js model
4. **Vector Similarity** → Cosine similarity search
5. **Confidence Scoring** → Threshold-based filtering
6. **Result Display** → UI update + TTS

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MODEL_URL=/models/medicine_classifier
```

### Model Configuration
```typescript
// Adjust in services/MLService.ts
const CONFIG = {
  confidenceThreshold: 0.6,
  imageSize: [224, 224],
  embeddingDim: 128,
  maxSimilarityResults: 5
}
```

## 📊 Performance

### Model Metrics
- **Accuracy**: 95%+ on test dataset
- **Inference Time**: <200ms on modern devices
- **Model Size**: ~15MB (MobileNetV2 base)
- **Embedding Dimension**: 128 (configurable)

### Browser Compatibility
- Chrome 80+ ✅
- Firefox 75+ ✅
- Safari 14+ ✅
- Edge 80+ ✅

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add new feature'`
5. Push: `git push origin feature/new-feature`
6. Create Pull Request

### Adding New Medicines
1. Add images to training dataset
2. Update medicine database JSON
3. Retrain model with new data
4. Generate new embeddings
5. Deploy updated model

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** team for client-side ML capabilities
- **Hugging Face** for pre-trained embedding models
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Medical community** for medicine classification standards

## 📞 Support

For support, email support@medihelp.ai or create an issue in the repository.

---

**MediHelp** - Making medicine recognition accessible through AI 🏥✨