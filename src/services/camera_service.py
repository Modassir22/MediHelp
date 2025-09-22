"""
Camera Service - Handles camera operations
"""

import cv2
import numpy as np
from PIL import Image

class CameraService:
    def __init__(self, camera_index=0):
        self.camera_index = camera_index
        self.cap = None
        self.initialize_camera()
    
    def initialize_camera(self):
        """Initialize the camera"""
        try:
            self.cap = cv2.VideoCapture(self.camera_index)
            if not self.cap.isOpened():
                raise Exception("Could not open camera")
            
            # Set camera properties for better quality
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
        except Exception as e:
            print(f"Camera initialization error: {e}")
            self.cap = None
    
    def get_frame(self):
        """Get current frame from camera"""
        if self.cap is None or not self.cap.isOpened():
            return None
        
        ret, frame = self.cap.read()
        if ret:
            return frame
        return None
    
    def capture_frame(self):
        """Capture and return a single frame"""
        frame = self.get_frame()
        if frame is not None:
            # Convert to PIL Image for ML processing
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            return Image.fromarray(image)
        return None
    
    def is_available(self):
        """Check if camera is available"""
        return self.cap is not None and self.cap.isOpened()
    
    def release(self):
        """Release camera resources"""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
    
    def __del__(self):
        """Cleanup when object is destroyed"""
        self.release()