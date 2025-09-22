"""
Text-to-Speech Service - Handles audio output
"""

import pyttsx3
import threading
from queue import Queue

class TTSService:
    def __init__(self):
        self.engine = None
        self.speech_queue = Queue()
        self.is_speaking = False
        self.current_language = 'en'
        
        self.initialize_engine()
        self.start_speech_worker()
    
    def initialize_engine(self):
        """Initialize the TTS engine"""
        try:
            self.engine = pyttsx3.init()
            
            # Set default properties
            self.engine.setProperty('rate', 150)  # Speed of speech
            self.engine.setProperty('volume', 0.9)  # Volume level (0.0 to 1.0)
            
            # Get available voices
            voices = self.engine.getProperty('voices')
            if voices:
                # Set default voice (first available)
                self.engine.setProperty('voice', voices[0].id)
            
        except Exception as e:
            print(f"TTS initialization error: {e}")
            self.engine = None
    
    def start_speech_worker(self):
        """Start background thread for speech processing"""
        def speech_worker():
            while True:
                try:
                    text, language = self.speech_queue.get()
                    if text is None:  # Shutdown signal
                        break
                    
                    self.is_speaking = True
                    self._speak_text(text, language)
                    self.is_speaking = False
                    
                    self.speech_queue.task_done()
                    
                except Exception as e:
                    print(f"Speech worker error: {e}")
                    self.is_speaking = False
        
        self.speech_thread = threading.Thread(target=speech_worker, daemon=True)
        self.speech_thread.start()
    
    def speak(self, text, language=None):
        """Add text to speech queue"""
        if not text or self.engine is None:
            return
        
        if language is None:
            language = self.current_language
        
        # Add to queue for processing
        self.speech_queue.put((text, language))
    
    def _speak_text(self, text, language):
        """Internal method to speak text"""
        try:
            # Set voice based on language
            self.set_voice_for_language(language)
            
            # Speak the text
            self.engine.say(text)
            self.engine.runAndWait()
            
        except Exception as e:
            print(f"Speech error: {e}")
    
    def set_voice_for_language(self, language):
        """Set appropriate voice for the given language"""
        if self.engine is None:
            return
        
        try:
            voices = self.engine.getProperty('voices')
            
            # Language-specific voice selection
            voice_preferences = {
                'en': ['english', 'en-us', 'en-gb'],
                'hi': ['hindi', 'hi-in'],
                'es': ['spanish', 'es-es', 'es-mx'],
                'fr': ['french', 'fr-fr']
            }
            
            preferred_voices = voice_preferences.get(language, ['english'])
            
            # Find matching voice
            for voice in voices:
                voice_name = voice.name.lower()
                voice_id = voice.id.lower()
                
                for pref in preferred_voices:
                    if pref in voice_name or pref in voice_id:
                        self.engine.setProperty('voice', voice.id)
                        return
            
            # Fallback to first available voice
            if voices:
                self.engine.setProperty('voice', voices[0].id)
                
        except Exception as e:
            print(f"Voice setting error: {e}")
    
    def set_language(self, language):
        """Set the current language for TTS"""
        self.current_language = language
    
    def set_rate(self, rate):
        """Set speech rate (words per minute)"""
        if self.engine:
            self.engine.setProperty('rate', rate)
    
    def set_volume(self, volume):
        """Set speech volume (0.0 to 1.0)"""
        if self.engine:
            self.engine.setProperty('volume', max(0.0, min(1.0, volume)))
    
    def stop_speaking(self):
        """Stop current speech"""
        if self.engine and self.is_speaking:
            self.engine.stop()
    
    def is_busy(self):
        """Check if TTS is currently speaking"""
        return self.is_speaking
    
    def get_available_voices(self):
        """Get list of available voices"""
        if self.engine is None:
            return []
        
        try:
            voices = self.engine.getProperty('voices')
            return [(voice.id, voice.name) for voice in voices]
        except:
            return []
    
    def shutdown(self):
        """Shutdown TTS service"""
        # Signal speech worker to stop
        self.speech_queue.put((None, None))
        
        if hasattr(self, 'speech_thread'):
            self.speech_thread.join(timeout=2.0)