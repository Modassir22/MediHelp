"""
Main Window Component - Modern UI Layout and Interactions
"""

import tkinter as tk
from tkinter import ttk, messagebox, font
from PIL import Image, ImageTk
import cv2
from .sidebar import Sidebar
from .camera_panel import CameraPanel

class MainWindow:
    def __init__(self, root, camera_service, ml_service, tts_service, voice_service, config):
        self.root = root
        self.camera_service = camera_service
        self.ml_service = ml_service
        self.tts_service = tts_service
        self.voice_service = voice_service
        self.config = config
        self.current_medicine_info = None
        
        self.setup_fonts()
        self.setup_ui()
    
    def setup_fonts(self):
        """Setup Roboto font family"""
        try:
            # Try to use Roboto font, fallback to system fonts
            self.fonts = {
                'title': ('Roboto', 24, 'bold'),
                'heading': ('Roboto', 16, 'bold'),
                'body': ('Roboto', 12),
                'small': ('Roboto', 10),
                'button': ('Roboto', 12, 'bold')
            }
        except:
            # Fallback fonts if Roboto is not available
            self.fonts = {
                'title': ('Segoe UI', 24, 'bold'),
                'heading': ('Segoe UI', 16, 'bold'),
                'body': ('Segoe UI', 12),
                'small': ('Segoe UI', 10),
                'button': ('Segoe UI', 12, 'bold')
            }
    
    def setup_ui(self):
        """Setup the modern UI layout"""
        # Configure root window
        self.root.configure(bg='white')
        
        # Main container with padding
        main_container = tk.Frame(self.root, bg='white')
        main_container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Left sidebar (300px width)
        self.sidebar = Sidebar(main_container, self.config, self.fonts)
        self.sidebar.frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))
        
        # Main content area
        content_frame = tk.Frame(main_container, bg='white')
        content_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Header section
        self.setup_header(content_frame)
        
        # Camera section
        self.setup_camera_section(content_frame)
        
        # Controls section
        self.setup_controls_section(content_frame)
        
        # Status section
        self.setup_status_section(content_frame)
    
    def setup_header(self, parent):
        """Setup header section"""
        header_frame = tk.Frame(parent, bg='white')
        header_frame.pack(fill=tk.X, pady=(0, 30))
        
        # App title
        title_label = tk.Label(
            header_frame,
            text="MediHelp",
            font=self.fonts['title'],
            bg='white',
            fg='#2c3e50'
        )
        title_label.pack(side=tk.LEFT)
        
        # Subtitle
        subtitle_label = tk.Label(
            header_frame,
            text="AI Medicine Recognition System",
            font=self.fonts['body'],
            bg='white',
            fg='#7f8c8d'
        )
        subtitle_label.pack(side=tk.LEFT, padx=(10, 0))
        
        # Status indicator
        self.status_indicator = tk.Label(
            header_frame,
            text="●",
            font=('Roboto', 16),
            bg='white',
            fg='#27ae60'
        )
        self.status_indicator.pack(side=tk.RIGHT)
        
        status_text = tk.Label(
            header_frame,
            text="Ready",
            font=self.fonts['small'],
            bg='white',
            fg='#27ae60'
        )
        status_text.pack(side=tk.RIGHT, padx=(0, 5))
    
    def setup_camera_section(self, parent):
        """Setup camera section"""
        camera_frame = tk.Frame(parent, bg='white', relief=tk.SOLID, bd=1)
        camera_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 20))
        
        # Camera header
        cam_header = tk.Frame(camera_frame, bg='#f8f9fa', height=40)
        cam_header.pack(fill=tk.X)
        cam_header.pack_propagate(False)
        
        tk.Label(
            cam_header,
            text="Camera Feed",
            font=self.fonts['heading'],
            bg='#f8f9fa',
            fg='#2c3e50'
        ).pack(side=tk.LEFT, padx=15, pady=10)
        
        # Camera panel
        self.camera_panel = CameraPanel(
            camera_frame,
            self.camera_service,
            self.on_capture_image
        )
        self.camera_panel.frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
    
    def setup_controls_section(self, parent):
        """Setup controls section"""
        controls_frame = tk.Frame(parent, bg='white')
        controls_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Main action button
        self.capture_btn = tk.Button(
            controls_frame,
            text="📷 Capture & Analyze Medicine",
            font=self.fonts['button'],
            bg='#3498db',
            fg='white',
            activebackground='#2980b9',
            activeforeground='white',
            relief=tk.FLAT,
            padx=30,
            pady=15,
            cursor='hand2',
            command=self.capture_and_analyze
        )
        self.capture_btn.pack(side=tk.LEFT)
        
        # Language selector
        lang_frame = tk.Frame(controls_frame, bg='white')
        lang_frame.pack(side=tk.RIGHT)
        
        tk.Label(
            lang_frame,
            text="Language:",
            font=self.fonts['body'],
            bg='white',
            fg='#2c3e50'
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        self.language_var = tk.StringVar(value=self.config.get_language())
        
        # Style the combobox
        style = ttk.Style()
        style.configure('Custom.TCombobox', fieldbackground='white', background='white')
        
        lang_combo = ttk.Combobox(
            lang_frame,
            textvariable=self.language_var,
            values=[('en', 'English'), ('hi', 'हिंदी'), ('es', 'Español'), ('fr', 'Français')],
            state='readonly',
            font=self.fonts['body'],
            style='Custom.TCombobox',
            width=15
        )
        lang_combo.pack(side=tk.LEFT)
        lang_combo.bind('<<ComboboxSelected>>', self.on_language_change)
    
    def setup_status_section(self, parent):
        """Setup status section"""
        status_frame = tk.Frame(parent, bg='#ecf0f1', relief=tk.SOLID, bd=1)
        status_frame.pack(fill=tk.X)
        
        # Status text
        self.status_text = tk.Label(
            status_frame,
            text="Ready to capture medicine images",
            font=self.fonts['body'],
            bg='#ecf0f1',
            fg='#2c3e50'
        )
        self.status_text.pack(pady=15)
        
        # Progress bar (hidden by default)
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            status_frame,
            variable=self.progress_var,
            mode='indeterminate'
        )
        # Don't pack initially
    
    def on_capture_image(self, image):
        """Handle captured image from camera panel"""
        self.current_image = image
    
    def capture_and_analyze(self):
        """Capture image and run ML analysis"""
        try:
            # Get image from camera
            image = self.camera_service.capture_frame()
            if image is None:
                messagebox.showerror("Error", "Could not capture image from camera")
                return
            
            # Run ML prediction
            prediction = self.ml_service.predict(image)
            
            if prediction:
                # Get medicine details
                medicine_info = self.ml_service.get_medicine_info(prediction['medicine_id'])
                
                # Create output text
                output_text = self.format_medicine_output(medicine_info)
                
                # Add to history
                self.history_panel.add_entry(medicine_info, image)
                
                # Speak the results
                self.tts_service.speak(output_text)
            else:
                messagebox.showinfo("No Recognition", "Could not recognize the medicine")
                
        except Exception as e:
            messagebox.showerror("Error", f"Analysis failed: {str(e)}")
    
    def format_medicine_output(self, medicine_info):
        """Format medicine information for TTS output"""
        lang = self.config.get_language()
        
        if lang == 'hi':
            return f"यह {medicine_info['name']} है। खुराक: {medicine_info['min_dosage']} से {medicine_info['max_dosage']}। उपयोग: {medicine_info['uses']}"
        else:
            return f"This is {medicine_info['name']}. Dosage: {medicine_info['min_dosage']} to {medicine_info['max_dosage']}. Uses: {medicine_info['uses']}"
    
    def on_language_change(self, event):
        """Handle language selection change"""
        new_lang = self.language_var.get()
        self.config.set_language(new_lang)
        
        # Confirm language change
        if new_lang == 'hi':
            self.tts_service.speak("भाषा हिंदी में बदल दी गई")
        else:
            self.tts_service.speak(f"Language changed to {new_lang}")    

    def on_capture_image(self, image):
        """Handle captured image from camera panel"""
        self.current_image = image
    
    def capture_and_analyze(self):
        """Capture image and run ML analysis"""
        try:
            # Update UI to show processing
            self.update_status("Capturing image...", "processing")
            self.capture_btn.configure(state='disabled', text="Processing...")
            self.progress_bar.pack(pady=(0, 15))
            self.progress_bar.start()
            
            # Process after UI update
            self.root.after(100, self._process_capture)
            
        except Exception as e:
            self.update_status(f"Error: {str(e)}", "error")
            self.reset_ui()
    
    def _process_capture(self):
        """Process the captured image"""
        try:
            # Get image from camera
            image = self.camera_service.capture_frame()
            if image is None:
                self.update_status("Could not capture image from camera", "error")
                self.reset_ui()
                return
            
            self.update_status("Analyzing medicine...", "processing")
            
            # Run ML prediction
            prediction = self.ml_service.predict(image)
            
            if prediction:
                # Get medicine details
                medicine_info = self.ml_service.get_medicine_info(prediction['medicine_id'])
                self.current_medicine_info = medicine_info
                
                # Update sidebar with medicine info
                self.sidebar.update_medicine_info(medicine_info, prediction['confidence'])
                
                # Add to history
                self.sidebar.add_history_entry(medicine_info, image)
                
                # Create output text
                output_text = self.format_medicine_output(medicine_info)
                
                # Speak the results
                self.tts_service.speak(output_text)
                
                self.update_status(f"Medicine recognized: {medicine_info['name']}", "success")
            else:
                self.update_status("Could not recognize the medicine", "warning")
                self.sidebar.clear_medicine_info()
                
        except Exception as e:
            self.update_status(f"Analysis failed: {str(e)}", "error")
            self.sidebar.clear_medicine_info()
        
        finally:
            self.reset_ui()
    
    def update_status(self, message, status_type="info"):
        """Update status message with color coding"""
        colors = {
            "info": "#2c3e50",
            "success": "#27ae60", 
            "warning": "#f39c12",
            "error": "#e74c3c",
            "processing": "#3498db"
        }
        
        self.status_text.configure(text=message, fg=colors.get(status_type, "#2c3e50"))
        
        # Update status indicator
        indicator_colors = {
            "info": "#27ae60",
            "success": "#27ae60",
            "warning": "#f39c12", 
            "error": "#e74c3c",
            "processing": "#3498db"
        }
        
        self.status_indicator.configure(fg=indicator_colors.get(status_type, "#27ae60"))
    
    def reset_ui(self):
        """Reset UI to ready state"""
        self.capture_btn.configure(state='normal', text="📷 Capture & Analyze Medicine")
        self.progress_bar.stop()
        self.progress_bar.pack_forget()
    
    def format_medicine_output(self, medicine_info):
        """Format medicine information for TTS output"""
        lang = self.config.get_language()
        
        if lang == 'hi':
            return f"यह {medicine_info['name']} है। खुराक: {medicine_info['min_dosage']} से {medicine_info['max_dosage']}। उपयोग: {medicine_info['uses']}"
        else:
            return f"This is {medicine_info['name']}. Dosage: {medicine_info['min_dosage']} to {medicine_info['max_dosage']}. Uses: {medicine_info['uses']}"
    
    def on_language_change(self, event):
        """Handle language selection change"""
        new_lang = self.language_var.get()
        if isinstance(new_lang, tuple):
            new_lang = new_lang[0]
        
        self.config.set_language(new_lang)
        
        # Confirm language change
        if new_lang == 'hi':
            self.tts_service.speak("भाषा हिंदी में बदल दी गई")
            self.update_status("भाषा हिंदी में बदल दी गई", "success")
        else:
            self.tts_service.speak(f"Language changed to {new_lang}")
            self.update_status(f"Language changed to {new_lang}", "success")