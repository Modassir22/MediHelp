#!/usr/bin/env python3
"""
MediHelp - Main Application Entry Point
"""

import tkinter as tk
from tkinter import ttk
import threading
from components.main_window import MainWindow
from services.camera_service import CameraService
from services.ml_service import MLService
from services.tts_service import TTSService
from services.voice_service import VoiceService
from utils.config import Config

class MediHelpApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("MediHelp - AI Medicine Recognition")
        self.root.geometry("1400x900")
        self.root.configure(bg='white')
        self.root.minsize(1200, 700)
        
        # Set window icon (if available)
        try:
            self.root.iconbitmap('public/icon.ico')
        except:
            pass
        
        # Initialize services
        self.config = Config()
        self.camera_service = CameraService()
        self.ml_service = MLService()
        self.tts_service = TTSService()
        self.voice_service = VoiceService()
        
        # Initialize main window
        self.main_window = MainWindow(
            self.root,
            self.camera_service,
            self.ml_service,
            self.tts_service,
            self.voice_service,
            self.config
        )
        
        # Start voice listening in background
        self.start_voice_listening()
    
    def start_voice_listening(self):
        """Start voice command listening in a separate thread"""
        def listen_loop():
            self.voice_service.start_listening(self.handle_voice_command)
        
        voice_thread = threading.Thread(target=listen_loop, daemon=True)
        voice_thread.start()
    
    def handle_voice_command(self, command):
        """Handle voice commands for language switching"""
        if "change language" in command.lower():
            if "english" in command.lower():
                self.config.set_language("en")
                self.tts_service.speak("Language changed to English")
            elif "hindi" in command.lower():
                self.config.set_language("hi")
                self.tts_service.speak("भाषा हिंदी में बदल दी गई")
    
    def run(self):
        """Start the application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = MediHelpApp()
    app.run()