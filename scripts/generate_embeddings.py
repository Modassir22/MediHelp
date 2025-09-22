#!/usr/bin/env python3
"""
Generate vector embeddings for medicine database
Uses pre-trained models and text embeddings for comprehensive medicine representation
"""

import os
import json
import numpy as np
import tensorflow as tf
from sentence_transformers import SentenceTransformer
import argparse
from typing import Dict, List, Any

class MedicineEmbeddingGenerator:
    def __init__(self, model_path=None):
        self.image_model = None
        self.text_model = None
        self.load_models(model_path)
    
    def load_models(self, model_path):
        """Load image and text embedding models"""
        
        print("Loading embedding models...")
        
        # Load text embedding model
        try:
            self.text_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✓ Text embedding model loaded")
        except Exception as e:
            print(f"✗ Failed to load text model: {e}")
        
        # Load image embedding model
        if model_path and os.path.exists(model_path):
            try:
                self.image_model = tf.keras.models.load_model(model_path)
                print("✓ Custom image model loaded")
            except Exception as e:
                print(f"✗ Failed to load custom model: {e}")
                self.load_pretrained_image_model()
        else:
            self.load_pretrained_image_model()
    
    def load_pretrained_image_model(self):
        """Load pre-trained image model for feature extraction"""
        try:
            base_model = tf.keras.applications.MobileNetV2(
                input_shape=(224, 224, 3),
                include_top=False,
                weights='imagenet'
            )
            
            # Add global average pooling
            self.image_model = tf.keras.Sequential([
                base_model,
                tf.keras.layers.GlobalAveragePooling2D(),
                tf.keras.layers.Dense(128, activation='l2_normalize')
            ])
            
            print("✓ Pre-trained image model loaded")
        except Exception as e:
            print(f"✗ Failed to load pre-trained model: {e}")
    
    def generate_text_embeddings(self, medicine_data: Dict[str, Any]) -> np.ndarray:
        """Generate text embeddings from medicine information"""
        
        if not self.text_model:
            return np.random.randn(384)  # Fallback random embedding
        
        # Combine all text information
        text_parts = [
            medicine_data.get('name', ''),
            medicine_data.get('genericName', ''),
            medicine_data.get('manufacturer', ''),
            medicine_data.get('category', ''),
            ' '.join(medicine_data.get('uses', [])),
            f"Dosage: {medicine_data.get('dosage', {}).get('min', '')} to {medicine_data.get('dosage', {}).get('max', '')}"
        ]
        
        combined_text = ' '.join(filter(None, text_parts))
        
        # Generate embedding
        embedding = self.text_model.encode(combined_text)
        return embedding
    
    def generate_image_embeddings(self, image_path: str) -> np.ndarray:
        """Generate image embeddings from medicine image"""
        
        if not self.image_model or not os.path.exists(image_path):
            return np.random.randn(128)  # Fallback random embedding
        
        try:
            # Load and preprocess image
            img = tf.keras.preprocessing.image.load_img(
                image_path, target_size=(224, 224)
            )
            img_array = tf.keras.preprocessing.image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0
            
            # Generate embedding
            embedding = self.image_model.predict(img_array, verbose=0)
            return embedding[0]
            
        except Exception as e:
            print(f"Error processing image {image_path}: {e}")
            return np.random.randn(128)
    
    def process_medicine_database(self, medicine_db_path: str, images_dir: str = None) -> Dict[str, Any]:
        """Process entire medicine database and generate embeddings"""
        
        print(f"Processing medicine database: {medicine_db_path}")
        
        # Load medicine database
        with open(medicine_db_path, 'r') as f:
            medicine_db = json.load(f)
        
        enhanced_db = {}
        
        for medicine_id, medicine_data in medicine_db.items():
            print(f"Processing: {medicine_data.get('name', medicine_id)}")
            
            # Generate text embeddings
            text_embeddings = self.generate_text_embeddings(medicine_data)
            
            # Generate image embeddings if images directory provided
            image_embeddings = None
            if images_dir:
                # Look for image file
                possible_extensions = ['.jpg', '.jpeg', '.png', '.webp']
                image_path = None
                
                for ext in possible_extensions:
                    potential_path = os.path.join(images_dir, f"{medicine_id}{ext}")
                    if os.path.exists(potential_path):
                        image_path = potential_path
                        break
                
                if image_path:
                    image_embeddings = self.generate_image_embeddings(image_path)
                else:
                    print(f"  ⚠ No image found for {medicine_id}")
                    image_embeddings = np.random.randn(128)
            
            # Combine embeddings
            enhanced_medicine = {
                **medicine_data,
                'embeddings': {
                    'text': text_embeddings.tolist(),
                    'image': image_embeddings.tolist() if image_embeddings is not None else None,
                    'combined': self.combine_embeddings(text_embeddings, image_embeddings).tolist()
                },
                'embedding_metadata': {
                    'text_model': 'all-MiniLM-L6-v2',
                    'image_model': 'MobileNetV2' if self.image_model else None,
                    'generated_at': np.datetime64('now').isoformat()
                }
            }
            
            enhanced_db[medicine_id] = enhanced_medicine
        
        return enhanced_db
    
    def combine_embeddings(self, text_emb: np.ndarray, image_emb: np.ndarray = None) -> np.ndarray:
        """Combine text and image embeddings"""
        
        if image_emb is None:
            # Use only text embeddings, pad or truncate to standard size
            if len(text_emb) > 256:
                return text_emb[:256]
            else:
                padded = np.zeros(256)
                padded[:len(text_emb)] = text_emb
                return padded
        
        # Concatenate and normalize
        combined = np.concatenate([text_emb[:128], image_emb[:128]])
        
        # L2 normalize
        norm = np.linalg.norm(combined)
        if norm > 0:
            combined = combined / norm
        
        return combined
    
    def create_similarity_index(self, enhanced_db: Dict[str, Any]) -> Dict[str, Any]:
        """Create similarity index for fast retrieval"""
        
        print("Creating similarity index...")
        
        # Extract all embeddings
        embeddings = []
        medicine_ids = []
        
        for medicine_id, medicine_data in enhanced_db.items():
            embeddings.append(medicine_data['embeddings']['combined'])
            medicine_ids.append(medicine_id)
        
        embeddings_matrix = np.array(embeddings)
        
        # Compute pairwise similarities
        from sklearn.metrics.pairwise import cosine_similarity
        similarity_matrix = cosine_similarity(embeddings_matrix)
        
        # Create index
        similarity_index = {
            'medicine_ids': medicine_ids,
            'embeddings_matrix': embeddings_matrix.tolist(),
            'similarity_matrix': similarity_matrix.tolist(),
            'index_metadata': {
                'num_medicines': len(medicine_ids),
                'embedding_dim': len(embeddings[0]),
                'created_at': np.datetime64('now').isoformat()
            }
        }
        
        return similarity_index
    
    def find_similar_medicines(self, query_embedding: np.ndarray, similarity_index: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
        """Find similar medicines using the similarity index"""
        
        embeddings_matrix = np.array(similarity_index['embeddings_matrix'])
        medicine_ids = similarity_index['medicine_ids']
        
        # Compute similarities
        similarities = cosine_similarity([query_embedding], embeddings_matrix)[0]
        
        # Get top-k similar medicines
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append({
                'medicine_id': medicine_ids[idx],
                'similarity': float(similarities[idx])
            })
        
        return results

def main():
    parser = argparse.ArgumentParser(description='Generate embeddings for medicine database')
    parser.add_argument('--medicine_db', required=True, help='Path to medicine database JSON')
    parser.add_argument('--images_dir', help='Directory containing medicine images')
    parser.add_argument('--model_path', help='Path to trained image model')
    parser.add_argument('--output_dir', default='./embeddings', help='Output directory')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Initialize generator
    generator = MedicineEmbeddingGenerator(args.model_path)
    
    # Process database
    enhanced_db = generator.process_medicine_database(
        args.medicine_db, 
        args.images_dir
    )
    
    # Save enhanced database
    enhanced_db_path = os.path.join(args.output_dir, 'enhanced_medicine_db.json')
    with open(enhanced_db_path, 'w') as f:
        json.dump(enhanced_db, f, indent=2)
    
    print(f"✓ Enhanced database saved to {enhanced_db_path}")
    
    # Create similarity index
    similarity_index = generator.create_similarity_index(enhanced_db)
    
    # Save similarity index
    index_path = os.path.join(args.output_dir, 'similarity_index.json')
    with open(index_path, 'w') as f:
        json.dump(similarity_index, f, indent=2)
    
    print(f"✓ Similarity index saved to {index_path}")
    
    # Generate summary
    summary = {
        'total_medicines': len(enhanced_db),
        'embedding_dimensions': {
            'text': len(list(enhanced_db.values())[0]['embeddings']['text']),
            'image': len(list(enhanced_db.values())[0]['embeddings']['image']) if list(enhanced_db.values())[0]['embeddings']['image'] else None,
            'combined': len(list(enhanced_db.values())[0]['embeddings']['combined'])
        },
        'files_generated': [
            enhanced_db_path,
            index_path
        ]
    }
    
    summary_path = os.path.join(args.output_dir, 'embedding_summary.json')
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"✓ Summary saved to {summary_path}")
    print("\nEmbedding generation completed successfully!")

if __name__ == '__main__':
    main()