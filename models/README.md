# ML Models Directory

Place your trained machine learning models in this directory.

## Expected Model Format
- **File**: `medicine_classifier.h5` (TensorFlow/Keras format)
- **Input**: 224x224x3 RGB images
- **Output**: Softmax probabilities for medicine classes

## Training Your Model

### 1. Data Preparation
- Collect medicine images from Kaggle or other sources
- Organize images in folders by medicine name:
  ```
  training_data/
  ├── paracetamol/
  ├── dolo_650/
  ├── aspirin/
  └── ibuprofen/
  ```

### 2. Model Training Script Example
```python
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Data augmentation
datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    validation_split=0.2
)

# Load training data
train_generator = datagen.flow_from_directory(
    'training_data/',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

validation_generator = datagen.flow_from_directory(
    'training_data/',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

# Create model
model = tf.keras.Sequential([
    tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    ),
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(len(train_generator.class_indices), activation='softmax')
])

# Compile and train
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=20
)

# Save model
model.save('models/medicine_classifier.h5')
```

### 3. Update Medicine Database
After training, update `src/data/medicine_db.json` with your medicine classes and information.

## Model Performance Tips
- Use data augmentation to improve generalization
- Collect diverse images (different angles, lighting, backgrounds)
- Consider transfer learning with pre-trained models
- Validate with real-world test images