"""
Configuration Management
"""

import json
import os

class Config:
    def __init__(self, config_file='src/data/config.json'):
        self.config_file = config_file
        self.config = self.load_config()
    
    def load_config(self):
        """Load configuration from file"""
        default_config = {
            'language': 'en',
            'tts_rate': 150,
            'tts_volume': 0.9,
            'camera_index': 0,
            'confidence_threshold': 0.5,
            'max_history_items': 50
        }
        
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    # Merge with defaults
                    default_config.update(loaded_config)
            else:
                # Create config directory if it doesn't exist
                os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
                self.save_config(default_config)
            
            return default_config
            
        except Exception as e:
            print(f"Error loading config: {e}")
            return default_config
    
    def save_config(self, config=None):
        """Save configuration to file"""
        if config is None:
            config = self.config
        
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")
    
    def get(self, key, default=None):
        """Get configuration value"""
        return self.config.get(key, default)
    
    def set(self, key, value):
        """Set configuration value"""
        self.config[key] = value
        self.save_config()
    
    def get_language(self):
        """Get current language setting"""
        return self.config.get('language', 'en')
    
    def set_language(self, language):
        """Set language setting"""
        self.set('language', language)
    
    def get_tts_settings(self):
        """Get TTS settings"""
        return {
            'rate': self.config.get('tts_rate', 150),
            'volume': self.config.get('tts_volume', 0.9)
        }
    
    def set_tts_settings(self, rate=None, volume=None):
        """Set TTS settings"""
        if rate is not None:
            self.set('tts_rate', rate)
        if volume is not None:
            self.set('tts_volume', volume)
    
    def get_camera_index(self):
        """Get camera index"""
        return self.config.get('camera_index', 0)
    
    def set_camera_index(self, index):
        """Set camera index"""
        self.set('camera_index', index)
    
    def get_confidence_threshold(self):
        """Get ML confidence threshold"""
        return self.config.get('confidence_threshold', 0.5)
    
    def set_confidence_threshold(self, threshold):
        """Set ML confidence threshold"""
        self.set('confidence_threshold', threshold)