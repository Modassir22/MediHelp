"""
Voice Recognition Service - Handles voice commands
"""

import speech_recognition as sr
import threading
import time

class VoiceService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = None
        self.is_listening = False
        self.callback = None
        
        self.initialize_microphone()
        self.configure_recognizer()
    
    def initialize_microphone(self):
        """Initialize microphone for voice input"""
        try:
            self.microphone = sr.Microphone()
            
            # Adjust for ambient noise
            with self.microphone as source:
                print("Adjusting for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                
        except Exception as e:
            print(f"Microphone initialization error: {e}")
            self.microphone = None
    
    def configure_recognizer(self):
        """Configure speech recognizer settings"""
        # Adjust recognition sensitivity
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        self.recognizer.phrase_threshold = 0.3
    
    def start_listening(self, callback):
        """Start continuous voice listening"""
        if self.microphone is None:
            print("Microphone not available")
            return
        
        self.callback = callback
        self.is_listening = True
        
        def listen_loop():
            while self.is_listening:
                try:
                    self.listen_for_command()
                    time.sleep(0.1)  # Small delay to prevent excessive CPU usage
                except Exception as e:
                    print(f"Voice listening error: {e}")
                    time.sleep(1)  # Wait before retrying
        
        self.listen_thread = threading.Thread(target=listen_loop, daemon=True)
        self.listen_thread.start()
    
    def listen_for_command(self):
        """Listen for a single voice command"""
        try:
            with self.microphone as source:
                # Listen for audio with timeout
                audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
            
            # Recognize speech
            command = self.recognizer.recognize_google(audio).lower()
            
            # Check if it's a MediHelp command
            if "medihelp" in command:
                print(f"Voice command detected: {command}")
                if self.callback:
                    self.callback(command)
            
        except sr.WaitTimeoutError:
            # Normal timeout, continue listening
            pass
        except sr.UnknownValueError:
            # Could not understand audio
            pass
        except sr.RequestError as e:
            print(f"Speech recognition service error: {e}")
    
    def stop_listening(self):
        """Stop voice listening"""
        self.is_listening = False
        if hasattr(self, 'listen_thread'):
            self.listen_thread.join(timeout=2.0)
    
    def recognize_once(self, timeout=5):
        """Recognize speech once with timeout"""
        if self.microphone is None:
            return None
        
        try:
            with self.microphone as source:
                print("Listening for command...")
                audio = self.recognizer.listen(source, timeout=timeout)
            
            command = self.recognizer.recognize_google(audio)
            return command.lower()
            
        except sr.WaitTimeoutError:
            print("Listening timeout")
            return None
        except sr.UnknownValueError:
            print("Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Speech recognition error: {e}")
            return None
    
    def is_available(self):
        """Check if voice recognition is available"""
        return self.microphone is not None
    
    def test_microphone(self):
        """Test microphone functionality"""
        if not self.is_available():
            return False, "Microphone not available"
        
        try:
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
            return True, "Microphone working"
        except Exception as e:
            return False, f"Microphone test failed: {e}"