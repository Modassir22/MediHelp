#!/usr/bin/env python3
"""
MediHelp Application Launcher
Simple script to run the MediHelp application
"""

import sys
import os

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    from main import MediHelpApp
    
    if __name__ == "__main__":
        print("Starting MediHelp Application...")
        print("=" * 50)
        
        app = MediHelpApp()
        app.run()
        
except ImportError as e:
    print(f"Import Error: {e}")
    print("Please make sure all dependencies are installed:")
    print("pip install -r requirements.txt")
    
except Exception as e:
    print(f"Application Error: {e}")
    print("Please check your setup and try again.")