#!/usr/bin/env python3
"""
MediHelp Setup Script
"""

import os
import sys
import subprocess

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error installing requirements: {e}")
        return False
    return True

def create_directories():
    """Create necessary directories"""
    directories = [
        "src/data",
        "models",
        "public"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def check_camera():
    """Check if camera is available"""
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("✓ Camera is available")
            cap.release()
            return True
        else:
            print("✗ Camera not found")
            return False
    except ImportError:
        print("✗ OpenCV not installed")
        return False

def check_microphone():
    """Check if microphone is available"""
    try:
        import speech_recognition as sr
        r = sr.Recognizer()
        with sr.Microphone() as source:
            print("✓ Microphone is available")
            return True
    except ImportError:
        print("✗ SpeechRecognition not installed")
        return False
    except Exception as e:
        print(f"✗ Microphone error: {e}")
        return False

def main():
    """Main setup function"""
    print("MediHelp Setup")
    print("=" * 50)
    
    # Create directories
    create_directories()
    
    # Install requirements
    if not install_requirements():
        print("Setup failed. Please install requirements manually.")
        return
    
    # Check hardware
    print("\nHardware Check:")
    print("-" * 20)
    check_camera()
    check_microphone()
    
    print("\nSetup completed!")
    print("\nNext steps:")
    print("1. Place your trained ML model in the 'models/' directory")
    print("2. Update medicine database in 'src/data/medicine_db.json'")
    print("3. Run the application: python src/main.py")

if __name__ == "__main__":
    main()