#!/usr/bin/env python3
"""
Setup script to download and process Kaggle medicine data for MediHelp
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    packages = [
        'kagglehub',
        'pandas',
        'numpy'
    ]
    
    for package in packages:
        try:
            __import__(package)
            print(f"✓ {package} already installed")
        except ImportError:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✓ {package} installed")

def setup_kaggle_api():
    """Setup Kaggle API credentials"""
    kaggle_dir = os.path.expanduser("~/.kaggle")
    kaggle_json = os.path.join(kaggle_dir, "kaggle.json")
    
    if not os.path.exists(kaggle_json):
        print("\n⚠️  Kaggle API credentials not found!")
        print("Please follow these steps:")
        print("1. Go to https://www.kaggle.com/account")
        print("2. Click 'Create New API Token'")
        print("3. Download kaggle.json")
        print(f"4. Place it at: {kaggle_json}")
        print("5. Run this script again")
        return False
    
    print("✓ Kaggle API credentials found")
    return True

def run_data_processing():
    """Run the Kaggle data processing script"""
    try:
        print("\nRunning Kaggle data processing...")
        subprocess.check_call([sys.executable, "scripts/load_kaggle_data.py"])
        print("✓ Data processing completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Data processing failed: {e}")
        return False

def copy_to_public():
    """Copy processed data to Next.js public directory"""
    import shutil
    
    source_file = "data/kaggle_medicine_db.json"
    target_file = "public/data/kaggle_medicine_db.json"
    
    if os.path.exists(source_file):
        # Create target directory
        os.makedirs(os.path.dirname(target_file), exist_ok=True)
        
        # Copy file
        shutil.copy2(source_file, target_file)
        print(f"✓ Copied {source_file} to {target_file}")
        return True
    else:
        print(f"✗ Source file not found: {source_file}")
        return False

def main():
    print("MediHelp Kaggle Data Setup")
    print("=" * 40)
    
    # Install requirements
    print("\n1. Installing Python requirements...")
    install_requirements()
    
    # Setup Kaggle API
    print("\n2. Checking Kaggle API setup...")
    if not setup_kaggle_api():
        return
    
    # Process data
    print("\n3. Processing Kaggle medicine data...")
    if not run_data_processing():
        print("Data processing failed, but you can still use sample data")
    
    # Copy to public directory
    print("\n4. Copying data to Next.js app...")
    copy_to_public()
    
    print("\n" + "=" * 40)
    print("Setup completed!")
    print("\nNext steps:")
    print("1. npm run dev")
    print("2. Test the application with real medicine data")
    print("3. Try Hindi language support")

if __name__ == '__main__':
    main()