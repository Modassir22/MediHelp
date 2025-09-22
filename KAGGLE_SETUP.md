# Kaggle Medicine Dataset Setup

This guide will help you integrate real medicine data from Kaggle into MediHelp.

## 📋 Prerequisites

1. **Kaggle Account**: Create a free account at [kaggle.com](https://www.kaggle.com)
2. **Python 3.8+**: Ensure Python is installed
3. **Kaggle API Token**: Download from your Kaggle account

## 🚀 Quick Setup

### Step 1: Install Python Dependencies
```bash
pip install kagglehub pandas numpy
```

### Step 2: Setup Kaggle API Credentials

1. Go to [Kaggle Account Settings](https://www.kaggle.com/account)
2. Scroll to "API" section
3. Click "Create New API Token"
4. Download `kaggle.json` file
5. Place it in the correct location:

**Windows:**
```
C:\Users\{username}\.kaggle\kaggle.json
```

**Mac/Linux:**
```
~/.kaggle/kaggle.json
```

### Step 3: Run Setup Script
```bash
python setup_kaggle_data.py
```

This will:
- ✅ Install required packages
- ✅ Download AZ Medicine Dataset of India
- ✅ Process and clean the data
- ✅ Add Hindi translations
- ✅ Generate embeddings
- ✅ Copy to Next.js app

### Step 4: Start the Application
```bash
npm run dev
```

## 📊 Dataset Information

**Source**: [AZ Medicine Dataset of India](https://www.kaggle.com/datasets/shudhanshusingh/az-medicine-dataset-of-india)

**Contains**:
- 💊 Medicine names and compositions
- 🏥 Uses and indications
- ⚠️ Side effects
- 🏭 Manufacturer information
- ⭐ Review ratings

**Processed Features**:
- 🔤 Text embeddings for similarity search
- 🖼️ Image feature placeholders
- 🇮🇳 Hindi translations
- 📊 Confidence scoring
- 🏷️ Categorization

## 🇮🇳 Hindi Language Support

The system includes comprehensive Hindi support:

### Text-to-Speech
- Native Hindi voice synthesis
- Proper pronunciation of medicine names
- Medical terminology in Hindi

### UI Elements
- Hindi language option: हिंदी
- Bilingual labels and instructions
- Cultural adaptation for Indian users

### Medicine Information
- Hindi translations of uses: उपयोग
- Side effects in Hindi: दुष्प्रभाव
- Dosage instructions: खुराक

## 🛠 Manual Setup (Alternative)

If the automatic setup doesn't work:

### 1. Download Dataset Manually
```python
import kagglehub
df = kagglehub.load_dataset("shudhanshusingh/az-medicine-dataset-of-india")
```

### 2. Process Data
```bash
python scripts/load_kaggle_data.py
```

### 3. Copy to App
```bash
cp data/kaggle_medicine_db.json public/data/
```

## 🧪 Testing

### Test Medicine Recognition
1. Open the app: `http://localhost:3000`
2. Allow camera access
3. Click "Capture & Analyze"
4. Check console for logs

### Test Hindi Support
1. Click language selector
2. Choose "हिंदी" (Hindi)
3. Click "Test Hindi TTS"
4. Capture a medicine image
5. Listen to Hindi audio output

### Debug Tools
- **Test Capture**: Simulate image capture
- **Check ML Status**: View model information
- **Test Hindi TTS**: Test Hindi speech synthesis

## 📈 Data Statistics

After processing, you'll have:
- **~1000+ medicines** from Indian market
- **10+ categories** (Analgesic, Antibiotic, etc.)
- **50+ manufacturers** 
- **Hindi translations** for common terms
- **Vector embeddings** for similarity search

## 🔧 Customization

### Add More Languages
Edit `scripts/load_kaggle_data.py`:
```python
# Add new language translations
hindi_translations = {
    'fever': 'बुखार',
    'pain': 'दर्द',
    # Add more translations
}
```

### Modify Categories
Update the `determine_category()` function:
```python
def determine_category(self, uses_list):
    # Add custom categorization logic
    if 'diabetes' in uses_str:
        return 'Antidiabetic'
```

### Enhance Embeddings
Use better embedding models:
```python
# In generate_embeddings.py
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
```

## 🚨 Troubleshooting

### Kaggle API Issues
```bash
# Check credentials
cat ~/.kaggle/kaggle.json

# Test API access
kaggle datasets list
```

### Dataset Not Found
- Verify dataset name: `shudhanshusingh/az-medicine-dataset-of-india`
- Check internet connection
- Ensure Kaggle account is verified

### Hindi TTS Not Working
- Check browser support for Hindi voices
- Install system Hindi language pack
- Use Chrome/Edge for better voice support

### Memory Issues
- Reduce dataset size in processing script
- Use smaller embedding dimensions
- Process data in batches

## 📞 Support

If you encounter issues:
1. Check the console logs
2. Verify Kaggle API setup
3. Test with sample data first
4. Create an issue in the repository

---

**Happy Medicine Recognition! 🏥✨**