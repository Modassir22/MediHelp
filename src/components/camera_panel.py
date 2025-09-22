"""
Camera Panel Component - Modern camera display and capture
"""

import tkinter as tk
from PIL import Image, ImageTk
import cv2
import threading

class CameraPanel:
    def __init__(self, parent, camera_service, on_capture_callback):
        self.camera_service = camera_service
        self.on_capture_callback = on_capture_callback
        self.is_running = False
        
        # Create main frame
        self.frame = tk.Frame(parent, bg='white')
        
        self.setup_ui()
        self.start_camera_feed()
    
    def setup_ui(self):
        """Setup modern camera panel UI"""
        # Camera display container
        camera_container = tk.Frame(self.frame, bg='#2c3e50', relief=tk.SOLID, bd=2)
        camera_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Camera display label with modern styling
        self.camera_label = tk.Label(
            camera_container,
            text="📷\n\nInitializing Camera...\nPlease wait",
            bg='#34495e',
            fg='white',
            font=('Roboto', 14),
            justify=tk.CENTER,
            width=50,
            height=20
        )
        self.camera_label.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Camera controls frame
        controls_frame = tk.Frame(self.frame, bg='white')
        controls_frame.pack(fill=tk.X, pady=(10, 0))
        
        # Camera status with icon
        status_frame = tk.Frame(controls_frame, bg='white')
        status_frame.pack()
        
        self.status_icon = tk.Label(
            status_frame,
            text="🔴",
            bg='white',
            font=('Roboto', 12)
        )
        self.status_icon.pack(side=tk.LEFT, padx=(0, 5))
        
        self.status_label = tk.Label(
            status_frame,
            text="Initializing camera...",
            bg='white',
            fg='#2c3e50',
            font=('Roboto', 11)
        )
        self.status_label.pack(side=tk.LEFT)
    
    def start_camera_feed(self):
        """Start the camera feed in a separate thread"""
        self.is_running = True
        self.camera_thread = threading.Thread(target=self.update_camera_feed, daemon=True)
        self.camera_thread.start()
    
    def update_camera_feed(self):
        """Update camera feed continuously with modern UI"""
        while self.is_running:
            try:
                frame = self.camera_service.get_frame()
                if frame is not None:
                    # Convert frame to PhotoImage
                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    image = Image.fromarray(image)
                    
                    # Resize to fit display with aspect ratio
                    display_size = (640, 480)
                    image = image.resize(display_size, Image.Resampling.LANCZOS)
                    
                    photo = ImageTk.PhotoImage(image)
                    
                    # Update label in main thread
                    self.camera_label.configure(
                        image=photo,
                        text="",
                        bg='#2c3e50'
                    )
                    self.camera_label.image = photo  # Keep a reference
                    
                    # Update status
                    self.status_label.configure(text="Camera Active - Ready to Capture", fg='#27ae60')
                    self.status_icon.configure(text="🟢")
                else:
                    self.show_camera_error("Camera not available")
                    
            except Exception as e:
                self.show_camera_error(f"Camera error: {str(e)}")
            
            # Small delay to prevent excessive CPU usage
            threading.Event().wait(0.03)  # ~30 FPS
    
    def show_camera_error(self, error_message):
        """Show camera error state"""
        self.camera_label.configure(
            image="",
            text=f"📷\n\n❌ Camera Error\n\n{error_message}\n\nPlease check your camera connection",
            bg='#e74c3c',
            fg='white',
            font=('Roboto', 12),
            justify=tk.CENTER
        )
        self.camera_label.image = None
        
        self.status_label.configure(text=error_message, fg='#e74c3c')
        self.status_icon.configure(text="🔴")
    
    def stop_camera_feed(self):
        """Stop the camera feed"""
        self.is_running = False
        if hasattr(self, 'camera_thread'):
            self.camera_thread.join(timeout=1.0)