#!/usr/bin/env python3
"""
MediHelp Model Training Script
Trains a medicine recognition model using transfer learning and vector embeddings
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from sklearn.metrics.pairwise import cosine_similarity
import argparse

class MedicineModelTrainer:
    def __init__(self, data_dir, model_output_dir, embedding_dim=128):
        self.data_dir = data_dir
        self.model_output_dir = model_output_dir
        self.embedding_dim = embedding_dim
        self.img_size = (224, 224)
        self.batch_size = 32
        
        # Create output directory
        os.makedirs(model_output_dir, exist_ok=True)
        
    def create_model(self, num_classes):
        """Create a transfer learning model with embedding layer"""
        
        # Base model (MobileNetV2 for efficiency)
        base_model = MobileNetV2(
            input_shape=(*self.img_size, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model initially
        base_model.trainable = False
        
        # Add custom layers
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        
        # Embedding layer for vector similarity
        embeddings = Dense(self.embedding_dim, activation='l2_normalize', name='embeddings')(x)
        
        # Classification head
        x = Dense(256, activation='relu')(embeddings)
        x = Dropout(0.5)(x)
        predictions = Dense(num_classes, activation='softmax', name='predictions')(x)
        
        # Create model
        model = Model(inputs=base_model.input, outputs=[predictions, embeddings])
        
        return model, base_model
    
    def prepare_data(self):
        """Prepare training and validation data"""
        
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest',
            validation_split=0.2
        )
        
        # Validation data (no augmentation)
        val_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=0.2
        )
        
        # Training generator
        train_generator = train_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='training'
        )
        
        # Validation generator
        val_generator = val_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='validation'
        )
        
        return train_generator, val_generator
    
    def train_model(self, epochs=20, fine_tune_epochs=10):
        """Train the model with transfer learning"""
        
        print("Preparing data...")
        train_gen, val_gen = self.prepare_data()
        
        num_classes = train_gen.num_classes
        class_names = list(train_gen.class_indices.keys())
        
        print(f"Found {num_classes} classes: {class_names}")
        
        print("Creating model...")
        model, base_model = self.create_model(num_classes)
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss={
                'predictions': 'categorical_crossentropy',
                'embeddings': self.triplet_loss
            },
            loss_weights={'predictions': 1.0, 'embeddings': 0.5},
            metrics={'predictions': 'accuracy'}
        )
        
        print("Model architecture:")
        model.summary()
        
        # Callbacks
        callbacks = [
            tf.keras.callbacks.ModelCheckpoint(
                os.path.join(self.model_output_dir, 'best_model.h5'),
                save_best_only=True,
                monitor='val_predictions_accuracy'
            ),
            tf.keras.callbacks.EarlyStopping(
                patience=5,
                monitor='val_predictions_accuracy',
                restore_best_weights=True
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                factor=0.5,
                patience=3,
                monitor='val_predictions_accuracy'
            )
        ]
        
        print("Starting initial training...")
        
        # Initial training with frozen base
        history1 = model.fit(
            train_gen,
            epochs=epochs,
            validation_data=val_gen,
            callbacks=callbacks
        )
        
        print("Starting fine-tuning...")
        
        # Unfreeze base model for fine-tuning
        base_model.trainable = True
        
        # Lower learning rate for fine-tuning
        model.compile(
            optimizer=Adam(learning_rate=0.0001),
            loss={
                'predictions': 'categorical_crossentropy',
                'embeddings': self.triplet_loss
            },
            loss_weights={'predictions': 1.0, 'embeddings': 0.5},
            metrics={'predictions': 'accuracy'}
        )
        
        # Fine-tune
        history2 = model.fit(
            train_gen,
            epochs=fine_tune_epochs,
            validation_data=val_gen,
            callbacks=callbacks,
            initial_epoch=epochs
        )
        
        # Save final model
        model.save(os.path.join(self.model_output_dir, 'medicine_classifier.h5'))
        
        # Save model for TensorFlow.js
        self.save_tfjs_model(model)
        
        # Save class names and metadata
        metadata = {
            'class_names': class_names,
            'num_classes': num_classes,
            'embedding_dim': self.embedding_dim,
            'img_size': self.img_size,
            'training_samples': train_gen.samples,
            'validation_samples': val_gen.samples
        }
        
        with open(os.path.join(self.model_output_dir, 'metadata.json'), 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Training completed! Model saved to {self.model_output_dir}")
        
        return model, history1, history2
    
    def triplet_loss(self, y_true, y_pred, margin=0.5):
        """Triplet loss for learning embeddings"""
        # This is a simplified version - in production, use proper triplet mining
        return tf.reduce_mean(tf.square(y_pred))
    
    def save_tfjs_model(self, model):
        """Save model in TensorFlow.js format"""
        try:
            import tensorflowjs as tfjs
            
            tfjs_path = os.path.join(self.model_output_dir, 'tfjs_model')
            tfjs.converters.save_keras_model(model, tfjs_path)
            print(f"TensorFlow.js model saved to {tfjs_path}")
            
        except ImportError:
            print("TensorFlow.js converter not installed. Skipping TFJS export.")
            print("Install with: pip install tensorflowjs")
    
    def generate_embeddings(self, model, data_dir):
        """Generate embeddings for all medicine images"""
        
        print("Generating embeddings for medicine database...")
        
        # Create embedding extractor
        embedding_model = Model(
            inputs=model.input,
            outputs=model.get_layer('embeddings').output
        )
        
        embeddings_db = {}
        
        # Process each medicine class
        for class_name in os.listdir(data_dir):
            class_path = os.path.join(data_dir, class_name)
            if not os.path.isdir(class_path):
                continue
            
            class_embeddings = []
            
            # Process images in class
            for img_file in os.listdir(class_path):
                if img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    img_path = os.path.join(class_path, img_file)
                    
                    # Load and preprocess image
                    img = tf.keras.preprocessing.image.load_img(
                        img_path, target_size=self.img_size
                    )
                    img_array = tf.keras.preprocessing.image.img_to_array(img)
                    img_array = np.expand_dims(img_array, axis=0) / 255.0
                    
                    # Generate embedding
                    embedding = embedding_model.predict(img_array, verbose=0)
                    class_embeddings.append(embedding[0])
            
            if class_embeddings:
                # Average embeddings for the class
                avg_embedding = np.mean(class_embeddings, axis=0)
                embeddings_db[class_name] = avg_embedding.tolist()
        
        # Save embeddings
        embeddings_path = os.path.join(self.model_output_dir, 'embeddings.json')
        with open(embeddings_path, 'w') as f:
            json.dump(embeddings_db, f, indent=2)
        
        print(f"Embeddings saved to {embeddings_path}")
        
        return embeddings_db

def main():
    parser = argparse.ArgumentParser(description='Train MediHelp medicine recognition model')
    parser.add_argument('--data_dir', required=True, help='Directory containing medicine images')
    parser.add_argument('--output_dir', default='./models', help='Output directory for trained model')
    parser.add_argument('--epochs', type=int, default=20, help='Number of training epochs')
    parser.add_argument('--fine_tune_epochs', type=int, default=10, help='Number of fine-tuning epochs')
    parser.add_argument('--embedding_dim', type=int, default=128, help='Embedding dimension')
    
    args = parser.parse_args()
    
    # Validate data directory
    if not os.path.exists(args.data_dir):
        print(f"Error: Data directory {args.data_dir} does not exist")
        sys.exit(1)
    
    # Check for medicine classes
    classes = [d for d in os.listdir(args.data_dir) 
               if os.path.isdir(os.path.join(args.data_dir, d))]
    
    if len(classes) < 2:
        print(f"Error: Need at least 2 medicine classes, found {len(classes)}")
        sys.exit(1)
    
    print(f"Found {len(classes)} medicine classes: {classes}")
    
    # Create trainer
    trainer = MedicineModelTrainer(
        data_dir=args.data_dir,
        model_output_dir=args.output_dir,
        embedding_dim=args.embedding_dim
    )
    
    # Train model
    model, history1, history2 = trainer.train_model(
        epochs=args.epochs,
        fine_tune_epochs=args.fine_tune_epochs
    )
    
    # Generate embeddings
    trainer.generate_embeddings(model, args.data_dir)
    
    print("Training completed successfully!")

if __name__ == '__main__':
    main()