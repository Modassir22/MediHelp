"""
Machine Learning Service - Handles medicine recognition
"""

import numpy as np
from PIL import Image
import json
import os

# Placeholder for TensorFlow/Keras imports
# import tensorflow as tf
# from tensorflow import keras

class MLService:
    def __init__(self, model_path="models/medicine_classifier.h5"):
        self.model_path = model_path
        self.model = None
        self.medicine_db = {}
        self.class_names = []
        
        self.load_model()
        self.load_medicine_database()
    
    def load_model(self):
        """Load the trained ML model"""
        try:
            # Uncomment when you have a trained model
            # self.model = tf.keras.models.load_model(self.model_path)
            # print(f"Model loaded from {self.model_path}")
            
            # For now, use a placeholder
            print("ML Model placeholder - replace with your trained model")
            self.model = "placeholder_model"
            
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    def load_medicine_database(self):
        """Load medicine information database"""
        try:
            with open('src/data/medicine_db.json', 'r') as f:
                self.medicine_db = json.load(f)
            
            # Extract class names for prediction mapping
            self.class_names = list(self.medicine_db.keys())
            
        except FileNotFoundError:
            print("Medicine database not found, creating sample database")
            self.create_sample_database()
    
    def create_sample_database(self):
        """Create a sample medicine database"""
        self.medicine_db = {
            "paracetamol": {
                "name": "Paracetamol",
                "min_dosage": "500mg",
                "max_dosage": "1000mg",
                "uses": "fever, headache, pain relief",
                "medicine_id": "paracetamol"
            },
            "dolo_650": {
                "name": "Dolo 650",
                "min_dosage": "650mg",
                "max_dosage": "650mg",
                "uses": "fever, pain relief",
                "medicine_id": "dolo_650"
            },
            "aspirin": {
                "name": "Aspirin",
                "min_dosage": "75mg",
                "max_dosage": "325mg",
                "uses": "pain relief, blood thinner, heart protection",
                "medicine_id": "aspirin"
            },
            "ibuprofen": {
                "name": "Ibuprofen",
                "min_dosage": "200mg",
                "max_dosage": "800mg",
                "uses": "pain relief, inflammation, fever",
                "medicine_id": "ibuprofen"
            }
        }
        
        self.class_names = list(self.medicine_db.keys())
        
        # Save sample database
        os.makedirs('src/data', exist_ok=True)
        with open('src/data/medicine_db.json', 'w') as f:
            json.dump(self.medicine_db, f, indent=2)
    
    def preprocess_image(self, image):
        """Preprocess image for ML model"""
        # Resize image to model input size (adjust based on your model)
        target_size = (224, 224)  # Common size for image classification
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image = image.resize(target_size, Image.Resampling.LANCZOS)
        
        # Convert to numpy array and normalize
        img_array = np.array(image) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def predict(self, image):
        """Predict medicine from image"""
        if self.model is None:
            # Return sample prediction for testing
            return {
                "medicine_id": "paracetamol",
                "confidence": 0.95,
                "predictions": ["paracetamol"]
            }
        
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # Make prediction
            # predictions = self.model.predict(processed_image)
            # predicted_class_idx = np.argmax(predictions[0])
            # confidence = float(predictions[0][predicted_class_idx])
            
            # For now, return sample prediction
            predicted_class_idx = 0
            confidence = 0.95
            
            if confidence > 0.5:  # Confidence threshold
                medicine_id = self.class_names[predicted_class_idx]
                return {
                    "medicine_id": medicine_id,
                    "confidence": confidence,
                    "predictions": self.class_names
                }
            
            return None
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return None
    
    def get_medicine_info(self, medicine_id):
        """Get detailed information about a medicine"""
        return self.medicine_db.get(medicine_id, {
            "name": "Unknown Medicine",
            "min_dosage": "Consult doctor",
            "max_dosage": "Consult doctor",
            "uses": "Consult healthcare provider",
            "medicine_id": medicine_id
        })
    
    def add_medicine(self, medicine_id, medicine_info):
        """Add new medicine to database"""
        self.medicine_db[medicine_id] = medicine_info
        self.class_names = list(self.medicine_db.keys())
        
        # Save updated database
        with open('src/data/medicine_db.json', 'w') as f:
            json.dump(self.medicine_db, f, indent=2)
    
    def get_all_medicines(self):
        """Get list of all medicines in database"""
        return list(self.medicine_db.keys())