#!/usr/bin/env python3
"""
Load and process Kaggle medicine dataset for MediHelp
Dataset: AZ Medicine Dataset of India by Shudhanshusingh
"""

import os
import json
import pandas as pd
import numpy as np
from typing import Dict, List, Any
import re

try:
    import kagglehub
    from kagglehub import KaggleDatasetAdapter
    KAGGLE_AVAILABLE = True
except ImportError:
    print("Kagglehub not available. Install with: pip install kagglehub")
    KAGGLE_AVAILABLE = False

class KaggleMedicineProcessor:
    def __init__(self, output_dir="./data"):
        self.output_dir = output_dir
        self.df = None
        os.makedirs(output_dir, exist_ok=True)
    
    def load_kaggle_dataset(self):
        """Load the Kaggle medicine dataset"""
        if not KAGGLE_AVAILABLE:
            print("Kagglehub not available. Using sample data.")
            return self.create_sample_data()
        
        try:
            print("Loading Kaggle dataset: AZ Medicine Dataset of India...")
            
            # Load the dataset
            df = kagglehub.load_dataset(
                KaggleDatasetAdapter.PANDAS,
                "shudhanshusingh/az-medicine-dataset-of-india",
                ""  # Load all files
            )
            
            print(f"Dataset loaded successfully! Shape: {df.shape}")
            print("Columns:", df.columns.tolist())
            print("\nFirst 5 records:")
            print(df.head())
            
            self.df = df
            return df
            
        except Exception as e:
            print(f"Error loading Kaggle dataset: {e}")
            print("Using sample data instead...")
            return self.create_sample_data()
    
    def create_sample_data(self):
        """Create sample medicine data if Kaggle dataset is not available"""
        sample_data = {
            'Medicine Name': [
                'Paracetamol 500mg', 'Ibuprofen 400mg', 'Aspirin 325mg', 
                'Cetirizine 10mg', 'Amoxicillin 500mg', 'Dolo 650',
                'Crocin 650mg', 'Combiflam', 'Allegra 120mg', 'Azithromycin 500mg'
            ],
            'Composition': [
                'Acetaminophen 500mg', 'Ibuprofen 400mg', 'Acetylsalicylic acid 325mg',
                'Cetirizine HCl 10mg', 'Amoxicillin 500mg', 'Paracetamol 650mg',
                'Paracetamol 650mg', 'Ibuprofen 400mg + Paracetamol 325mg', 
                'Fexofenadine 120mg', 'Azithromycin 500mg'
            ],
            'Uses': [
                'Fever, Pain relief, Headache', 'Pain relief, Inflammation, Fever',
                'Pain relief, Heart protection, Blood thinner', 'Allergies, Hay fever, Hives',
                'Bacterial infections, Respiratory infections', 'Fever, Pain relief',
                'Fever, Headache, Body pain', 'Pain relief, Fever, Inflammation',
                'Allergic rhinitis, Urticaria', 'Bacterial infections, Respiratory tract infections'
            ],
            'Side_effects': [
                'Nausea, Liver damage (overdose)', 'Stomach upset, Heartburn, Dizziness',
                'Stomach bleeding, Heartburn', 'Drowsiness, Dry mouth, Fatigue',
                'Nausea, Diarrhea, Allergic reactions', 'Nausea, Liver damage (overdose)',
                'Nausea, Allergic reactions', 'Stomach upset, Nausea, Dizziness',
                'Headache, Drowsiness, Nausea', 'Nausea, Diarrhea, Abdominal pain'
            ],
            'Manufacturer': [
                'Generic Pharma', 'Generic Pharma', 'Generic Pharma', 'Generic Pharma',
                'Generic Pharma', 'Micro Labs', 'GlaxoSmithKline', 'Sanofi',
                'Aventis Pharma', 'Pfizer'
            ],
            'Excellent Review %': [85, 78, 82, 88, 90, 87, 89, 83, 86, 91],
            'Average Review %': [12, 18, 15, 10, 8, 11, 9, 14, 12, 7],
            'Poor Review %': [3, 4, 3, 2, 2, 2, 2, 3, 2, 2]
        }
        
        self.df = pd.DataFrame(sample_data)
        print("Created sample dataset with", len(self.df), "medicines")
        return self.df
    
    def clean_and_process_data(self):
        """Clean and process the medicine data"""
        if self.df is None:
            print("No data to process. Load dataset first.")
            return None
        
        print("Cleaning and processing data...")
        
        # Create a copy for processing
        processed_df = self.df.copy()
        
        # Standardize column names
        column_mapping = {
            'Medicine Name': 'name',
            'Composition': 'composition', 
            'Uses': 'uses',
            'Side_effects': 'side_effects',
            'Manufacturer': 'manufacturer',
            'Excellent Review %': 'excellent_review_pct',
            'Average Review %': 'average_review_pct',
            'Poor Review %': 'poor_review_pct'
        }
        
        # Rename columns if they exist
        for old_name, new_name in column_mapping.items():
            if old_name in processed_df.columns:
                processed_df = processed_df.rename(columns={old_name: new_name})
        
        # Clean data
        processed_df = processed_df.dropna(subset=['name'])  # Remove entries without names
        processed_df['name'] = processed_df['name'].str.strip()
        
        # Process uses - split by comma and clean
        if 'uses' in processed_df.columns:
            processed_df['uses'] = processed_df['uses'].apply(self.process_uses)
        
        # Process side effects
        if 'side_effects' in processed_df.columns:
            processed_df['side_effects'] = processed_df['side_effects'].apply(self.process_side_effects)
        
        # Extract dosage information
        processed_df['dosage_info'] = processed_df['name'].apply(self.extract_dosage)
        
        print(f"Processed {len(processed_df)} medicines")
        return processed_df
    
    def process_uses(self, uses_str):
        """Process uses string into a list"""
        if pd.isna(uses_str):
            return []
        
        uses_list = [use.strip() for use in str(uses_str).split(',')]
        return [use for use in uses_list if use]  # Remove empty strings
    
    def process_side_effects(self, effects_str):
        """Process side effects string into a list"""
        if pd.isna(effects_str):
            return []
        
        effects_list = [effect.strip() for effect in str(effects_str).split(',')]
        return [effect for effect in effects_list if effect]  # Remove empty strings
    
    def extract_dosage(self, medicine_name):
        """Extract dosage information from medicine name"""
        dosage_patterns = [
            r'(\d+)\s*mg',
            r'(\d+)\s*g',
            r'(\d+)\s*ml',
            r'(\d+)\s*mcg'
        ]
        
        for pattern in dosage_patterns:
            match = re.search(pattern, str(medicine_name), re.IGNORECASE)
            if match:
                return {
                    'amount': match.group(1),
                    'unit': medicine_name[match.start():match.end()].split(match.group(1))[1].strip()
                }
        
        return {'amount': '1', 'unit': 'tablet'}
    
    def create_medihelp_format(self, processed_df):
        """Convert processed data to MediHelp format"""
        print("Converting to MediHelp format...")
        
        medihelp_data = {}
        
        for idx, row in processed_df.iterrows():
            # Create unique ID
            medicine_id = self.create_medicine_id(row['name'])
            
            # Extract generic name (usually the composition)
            generic_name = row.get('composition', row['name'])
            if pd.isna(generic_name):
                generic_name = row['name']
            
            # Determine category based on uses
            category = self.determine_category(row.get('uses', []))
            
            # Create dosage info
            dosage_info = row.get('dosage_info', {'amount': '1', 'unit': 'tablet'})
            dosage = {
                'min': f"{dosage_info['amount']}{dosage_info['unit']}",
                'max': f"{int(dosage_info['amount']) * 2}{dosage_info['unit']}",
                'frequency': 'As directed by physician'
            }
            
            # Create medicine entry
            medicine_entry = {
                'id': medicine_id,
                'name': row['name'],
                'genericName': generic_name,
                'manufacturer': row.get('manufacturer', 'Unknown'),
                'category': category,
                'dosage': dosage,
                'uses': row.get('uses', []),
                'sideEffects': row.get('side_effects', []),
                'embeddings': self.generate_random_embedding(),
                'imageFeatures': self.generate_random_embedding(256),
                'metadata': {
                    'source': 'kaggle_az_medicine_dataset',
                    'excellent_review_pct': row.get('excellent_review_pct', 0),
                    'average_review_pct': row.get('average_review_pct', 0),
                    'poor_review_pct': row.get('poor_review_pct', 0)
                }
            }
            
            medihelp_data[medicine_id] = medicine_entry
        
        print(f"Created MediHelp format data for {len(medihelp_data)} medicines")
        return medihelp_data
    
    def create_medicine_id(self, name):
        """Create a unique ID for medicine"""
        # Remove special characters and convert to lowercase
        clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', str(name))
        clean_name = re.sub(r'\s+', '_', clean_name.strip().lower())
        return clean_name
    
    def determine_category(self, uses_list):
        """Determine medicine category based on uses"""
        if not uses_list:
            return 'General Medicine'
        
        uses_str = ' '.join(uses_list).lower()
        
        if any(word in uses_str for word in ['pain', 'fever', 'headache']):
            return 'Analgesic'
        elif any(word in uses_str for word in ['allergy', 'allergic', 'hay fever']):
            return 'Antihistamine'
        elif any(word in uses_str for word in ['infection', 'bacterial', 'antibiotic']):
            return 'Antibiotic'
        elif any(word in uses_str for word in ['inflammation', 'anti-inflammatory']):
            return 'Anti-inflammatory'
        elif any(word in uses_str for word in ['heart', 'blood', 'pressure']):
            return 'Cardiovascular'
        else:
            return 'General Medicine'
    
    def generate_random_embedding(self, size=128):
        """Generate random embedding for demo purposes"""
        return np.random.randn(size).tolist()
    
    def add_hindi_translations(self, medihelp_data):
        """Add Hindi translations for medicine information"""
        print("Adding Hindi translations...")
        
        # Hindi translations for common terms
        hindi_translations = {
            'fever': 'बुखार',
            'pain': 'दर्द', 
            'headache': 'सिरदर्द',
            'cold': 'सर्दी',
            'cough': 'खांसी',
            'allergy': 'एलर्जी',
            'infection': 'संक्रमण',
            'inflammation': 'सूजन',
            'nausea': 'मतली',
            'dizziness': 'चक्कर आना',
            'drowsiness': 'नींद आना',
            'stomach upset': 'पेट खराब',
            'heartburn': 'सीने में जलन',
            'tablet': 'गोली',
            'mg': 'मिलीग्राम',
            'as directed by physician': 'चिकित्सक के निर्देशानुसार'
        }
        
        for medicine_id, medicine in medihelp_data.items():
            # Add Hindi translations
            hindi_uses = []
            for use in medicine['uses']:
                hindi_use = use.lower()
                for eng, hindi in hindi_translations.items():
                    hindi_use = hindi_use.replace(eng, hindi)
                hindi_uses.append(hindi_use)
            
            hindi_side_effects = []
            for effect in medicine['sideEffects']:
                hindi_effect = effect.lower()
                for eng, hindi in hindi_translations.items():
                    hindi_effect = hindi_effect.replace(eng, hindi)
                hindi_side_effects.append(hindi_effect)
            
            # Add Hindi data
            medicine['hindi'] = {
                'uses': hindi_uses,
                'sideEffects': hindi_side_effects,
                'dosage': {
                    'min': medicine['dosage']['min'],
                    'max': medicine['dosage']['max'], 
                    'frequency': hindi_translations.get(
                        medicine['dosage']['frequency'].lower(),
                        'चिकित्सक के निर्देशानुसार'
                    )
                }
            }
        
        return medihelp_data
    
    def save_data(self, medihelp_data):
        """Save processed data to files"""
        print("Saving processed data...")
        
        # Save main medicine database
        medicine_db_path = os.path.join(self.output_dir, 'kaggle_medicine_db.json')
        with open(medicine_db_path, 'w', encoding='utf-8') as f:
            json.dump(medihelp_data, f, indent=2, ensure_ascii=False)
        
        # Save summary
        summary = {
            'total_medicines': len(medihelp_data),
            'categories': list(set(med['category'] for med in medihelp_data.values())),
            'manufacturers': list(set(med['manufacturer'] for med in medihelp_data.values())),
            'source': 'Kaggle AZ Medicine Dataset of India',
            'processed_at': pd.Timestamp.now().isoformat()
        }
        
        summary_path = os.path.join(self.output_dir, 'kaggle_data_summary.json')
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Medicine database saved to: {medicine_db_path}")
        print(f"✓ Summary saved to: {summary_path}")
        print(f"✓ Total medicines processed: {len(medihelp_data)}")
        
        return medicine_db_path, summary_path

def main():
    print("MediHelp Kaggle Data Processor")
    print("=" * 50)
    
    # Initialize processor
    processor = KaggleMedicineProcessor()
    
    # Load Kaggle dataset
    df = processor.load_kaggle_dataset()
    
    if df is not None:
        # Process data
        processed_df = processor.clean_and_process_data()
        
        # Convert to MediHelp format
        medihelp_data = processor.create_medihelp_format(processed_df)
        
        # Add Hindi translations
        medihelp_data = processor.add_hindi_translations(medihelp_data)
        
        # Save data
        db_path, summary_path = processor.save_data(medihelp_data)
        
        print("\n" + "=" * 50)
        print("Processing completed successfully!")
        print(f"Medicine database: {db_path}")
        print(f"Summary: {summary_path}")
        print("\nNext steps:")
        print("1. Copy the generated JSON to your Next.js app")
        print("2. Update the ML service to use this data")
        print("3. Test the application with real medicine data")
    
    else:
        print("Failed to load or create dataset")

if __name__ == '__main__':
    main()