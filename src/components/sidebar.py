"""
Sidebar Component - Auth, History, and Medicine Info
"""

import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import json
from datetime import datetime
import os

class Sidebar:
    def __init__(self, parent, config, fonts):
        self.config = config
        self.fonts = fonts
        self.history_data = []
        self.current_user = None
        
        # Create main sidebar frame (300px width)
        self.frame = tk.Frame(parent, bg='#f8f9fa', width=300, relief=tk.SOLID, bd=1)
        self.frame.pack_propagate(False)
        
        self.setup_ui()
        self.load_history()
    
    def setup_ui(self):
        """Setup sidebar UI with sections"""
        # Sidebar header
        header_frame = tk.Frame(self.frame, bg='#2c3e50', height=60)
        header_frame.pack(fill=tk.X)
        header_frame.pack_propagate(False)
        
        tk.Label(
            header_frame,
            text="MediHelp",
            font=self.fonts['heading'],
            bg='#2c3e50',
            fg='white'
        ).pack(pady=20)
        
        # Create scrollable content
        self.create_scrollable_content()
        
        # Setup sections
        self.setup_auth_section()
        self.setup_medicine_info_section()
        self.setup_history_section()
    
    def create_scrollable_content(self):
        """Create scrollable content area"""
        # Canvas for scrolling
        self.canvas = tk.Canvas(self.frame, bg='#f8f9fa', highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self.frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg='#f8f9fa')
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        # Bind mousewheel to canvas
        def _on_mousewheel(event):
            self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        self.canvas.bind("<MouseWheel>", _on_mousewheel)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")
    
    def setup_auth_section(self):
        """Setup authentication section"""
        auth_frame = tk.Frame(self.scrollable_frame, bg='#f8f9fa')
        auth_frame.pack(fill=tk.X, padx=15, pady=(15, 0))
        
        # Section title
        tk.Label(
            auth_frame,
            text="👤 User Profile",
            font=self.fonts['heading'],
            bg='#f8f9fa',
            fg='#2c3e50'
        ).pack(anchor=tk.W, pady=(0, 10))
        
        # User info frame
        self.user_info_frame = tk.Frame(auth_frame, bg='white', relief=tk.SOLID, bd=1)
        self.user_info_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Default user (for demo)
        self.setup_default_user()
    
    def setup_default_user(self):
        """Setup default user profile"""
        user_frame = tk.Frame(self.user_info_frame, bg='white')
        user_frame.pack(fill=tk.X, padx=15, pady=15)
        
        # User avatar (placeholder)
        avatar_frame = tk.Frame(user_frame, bg='#3498db', width=50, height=50)
        avatar_frame.pack_propagate(False)
        avatar_frame.pack(side=tk.LEFT, padx=(0, 10))
        
        tk.Label(
            avatar_frame,
            text="👤",
            font=('Roboto', 20),
            bg='#3498db',
            fg='white'
        ).pack(expand=True)
        
        # User details
        details_frame = tk.Frame(user_frame, bg='white')
        details_frame.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        tk.Label(
            details_frame,
            text="Demo User",
            font=self.fonts['body'],
            bg='white',
            fg='#2c3e50'
        ).pack(anchor=tk.W)
        
        tk.Label(
            details_frame,
            text="demo@medihelp.com",
            font=self.fonts['small'],
            bg='white',
            fg='#7f8c8d'
        ).pack(anchor=tk.W)
        
        # Login/Logout button
        self.auth_btn = tk.Button(
            user_frame,
            text="Login",
            font=self.fonts['small'],
            bg='#27ae60',
            fg='white',
            relief=tk.FLAT,
            padx=15,
            pady=5,
            cursor='hand2',
            command=self.toggle_auth
        )
        self.auth_btn.pack(side=tk.RIGHT)
    
    def setup_medicine_info_section(self):
        """Setup medicine information section"""
        med_frame = tk.Frame(self.scrollable_frame, bg='#f8f9fa')
        med_frame.pack(fill=tk.X, padx=15, pady=(0, 15))
        
        # Section title
        tk.Label(
            med_frame,
            text="💊 Medicine Info",
            font=self.fonts['heading'],
            bg='#f8f9fa',
            fg='#2c3e50'
        ).pack(anchor=tk.W, pady=(0, 10))
        
        # Medicine info container
        self.medicine_info_frame = tk.Frame(med_frame, bg='white', relief=tk.SOLID, bd=1)
        self.medicine_info_frame.pack(fill=tk.X)
        
        # Default empty state
        self.show_empty_medicine_state()
    
    def show_empty_medicine_state(self):
        """Show empty state for medicine info"""
        for widget in self.medicine_info_frame.winfo_children():
            widget.destroy()
        
        empty_frame = tk.Frame(self.medicine_info_frame, bg='white')
        empty_frame.pack(fill=tk.X, padx=15, pady=30)
        
        tk.Label(
            empty_frame,
            text="📷",
            font=('Roboto', 24),
            bg='white',
            fg='#bdc3c7'
        ).pack()
        
        tk.Label(
            empty_frame,
            text="Capture a medicine to see details",
            font=self.fonts['small'],
            bg='white',
            fg='#7f8c8d'
        ).pack(pady=(5, 0))
    
    def update_medicine_info(self, medicine_info, confidence):
        """Update medicine information display"""
        for widget in self.medicine_info_frame.winfo_children():
            widget.destroy()
        
        info_frame = tk.Frame(self.medicine_info_frame, bg='white')
        info_frame.pack(fill=tk.X, padx=15, pady=15)
        
        # Medicine name
        tk.Label(
            info_frame,
            text=medicine_info['name'],
            font=self.fonts['heading'],
            bg='white',
            fg='#2c3e50'
        ).pack(anchor=tk.W, pady=(0, 5))
        
        # Confidence score
        confidence_frame = tk.Frame(info_frame, bg='white')
        confidence_frame.pack(fill=tk.X, pady=(0, 10))
        
        tk.Label(
            confidence_frame,
            text=f"Confidence: {confidence:.1%}",
            font=self.fonts['small'],
            bg='white',
            fg='#27ae60' if confidence > 0.8 else '#f39c12'
        ).pack(side=tk.LEFT)
        
        # Confidence bar
        conf_bar_frame = tk.Frame(confidence_frame, bg='#ecf0f1', height=4)
        conf_bar_frame.pack(side=tk.RIGHT, fill=tk.X, expand=True, padx=(10, 0))
        
        conf_fill = tk.Frame(conf_bar_frame, bg='#27ae60' if confidence > 0.8 else '#f39c12', height=4)
        conf_fill.place(relwidth=confidence, relheight=1)
        
        # Dosage information
        dosage_frame = tk.Frame(info_frame, bg='#f8f9fa')
        dosage_frame.pack(fill=tk.X, pady=(0, 10))
        
        tk.Label(
            dosage_frame,
            text="💊 Dosage",
            font=self.fonts['body'],
            bg='#f8f9fa',
            fg='#2c3e50'
        ).pack(anchor=tk.W, padx=10, pady=(10, 5))
        
        tk.Label(
            dosage_frame,
            text=f"{medicine_info['min_dosage']} - {medicine_info['max_dosage']}",
            font=self.fonts['small'],
            bg='#f8f9fa',
            fg='#7f8c8d'
        ).pack(anchor=tk.W, padx=10, pady=(0, 10))
        
        # Uses information
        uses_frame = tk.Frame(info_frame, bg='#e8f5e8')
        uses_frame.pack(fill=tk.X)
        
        tk.Label(
            uses_frame,
            text="🎯 Uses",
            font=self.fonts['body'],
            bg='#e8f5e8',
            fg='#2c3e50'
        ).pack(anchor=tk.W, padx=10, pady=(10, 5))
        
        tk.Label(
            uses_frame,
            text=medicine_info['uses'],
            font=self.fonts['small'],
            bg='#e8f5e8',
            fg='#7f8c8d',
            wraplength=250,
            justify=tk.LEFT
        ).pack(anchor=tk.W, padx=10, pady=(0, 10))
    
    def clear_medicine_info(self):
        """Clear medicine information"""
        self.show_empty_medicine_state()
    
    def setup_history_section(self):
        """Setup history section"""
        history_frame = tk.Frame(self.scrollable_frame, bg='#f8f9fa')
        history_frame.pack(fill=tk.X, padx=15, pady=(0, 15))
        
        # Section header
        header_frame = tk.Frame(history_frame, bg='#f8f9fa')
        header_frame.pack(fill=tk.X, pady=(0, 10))
        
        tk.Label(
            header_frame,
            text="📋 History",
            font=self.fonts['heading'],
            bg='#f8f9fa',
            fg='#2c3e50'
        ).pack(side=tk.LEFT)
        
        # Clear button
        clear_btn = tk.Button(
            header_frame,
            text="Clear",
            font=self.fonts['small'],
            bg='#e74c3c',
            fg='white',
            relief=tk.FLAT,
            padx=10,
            pady=2,
            cursor='hand2',
            command=self.clear_history
        )
        clear_btn.pack(side=tk.RIGHT)
        
        # History container
        self.history_container = tk.Frame(history_frame, bg='#f8f9fa')
        self.history_container.pack(fill=tk.X)
        
        self.refresh_history_display()
    
    def add_history_entry(self, medicine_info, image=None):
        """Add new entry to history"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        entry = {
            'timestamp': timestamp,
            'medicine_info': medicine_info,
            'image_path': None
        }
        
        self.history_data.append(entry)
        self.save_history()
        self.refresh_history_display()
    
    def refresh_history_display(self):
        """Refresh history display"""
        for widget in self.history_container.winfo_children():
            widget.destroy()
        
        if not self.history_data:
            # Empty state
            empty_frame = tk.Frame(self.history_container, bg='white', relief=tk.SOLID, bd=1)
            empty_frame.pack(fill=tk.X, pady=5)
            
            tk.Label(
                empty_frame,
                text="No history yet",
                font=self.fonts['small'],
                bg='white',
                fg='#7f8c8d'
            ).pack(pady=20)
            return
        
        # Show recent entries (last 10)
        recent_entries = list(reversed(self.history_data[-10:]))
        
        for i, entry in enumerate(recent_entries):
            self.create_history_item(entry, i)
    
    def create_history_item(self, entry, index):
        """Create history item widget"""
        item_frame = tk.Frame(self.history_container, bg='white', relief=tk.SOLID, bd=1)
        item_frame.pack(fill=tk.X, pady=2)
        
        content_frame = tk.Frame(item_frame, bg='white')
        content_frame.pack(fill=tk.X, padx=10, pady=8)
        
        # Medicine name
        tk.Label(
            content_frame,
            text=entry['medicine_info']['name'],
            font=self.fonts['body'],
            bg='white',
            fg='#2c3e50'
        ).pack(anchor=tk.W)
        
        # Dosage
        tk.Label(
            content_frame,
            text=f"{entry['medicine_info']['min_dosage']} - {entry['medicine_info']['max_dosage']}",
            font=self.fonts['small'],
            bg='white',
            fg='#7f8c8d'
        ).pack(anchor=tk.W)
        
        # Timestamp
        tk.Label(
            content_frame,
            text=entry['timestamp'],
            font=self.fonts['small'],
            bg='white',
            fg='#95a5a6'
        ).pack(anchor=tk.W)
    
    def toggle_auth(self):
        """Toggle authentication state"""
        if self.current_user is None:
            # Simulate login
            self.current_user = "demo_user"
            self.auth_btn.configure(text="Logout", bg='#e74c3c')
            messagebox.showinfo("Login", "Logged in successfully!")
        else:
            # Logout
            self.current_user = None
            self.auth_btn.configure(text="Login", bg='#27ae60')
            messagebox.showinfo("Logout", "Logged out successfully!")
    
    def load_history(self):
        """Load history from file"""
        try:
            with open('src/data/history.json', 'r') as f:
                self.history_data = json.load(f)
        except FileNotFoundError:
            self.history_data = []
    
    def save_history(self):
        """Save history to file"""
        try:
            os.makedirs('src/data', exist_ok=True)
            with open('src/data/history.json', 'w') as f:
                json.dump(self.history_data, f, indent=2)
        except Exception as e:
            print(f"Error saving history: {e}")
    
    def clear_history(self):
        """Clear all history"""
        if messagebox.askyesno("Clear History", "Are you sure you want to clear all history?"):
            self.history_data = []
            self.save_history()
            self.refresh_history_display()