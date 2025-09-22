"""
Theme and styling configuration for MediHelp
"""

class Theme:
    """Modern theme configuration"""
    
    # Color palette
    COLORS = {
        # Primary colors
        'primary': '#3498db',
        'primary_dark': '#2980b9',
        'secondary': '#2c3e50',
        'accent': '#27ae60',
        
        # Status colors
        'success': '#27ae60',
        'warning': '#f39c12',
        'error': '#e74c3c',
        'info': '#3498db',
        
        # UI colors
        'background': '#ffffff',
        'sidebar_bg': '#f8f9fa',
        'card_bg': '#ffffff',
        'border': '#dee2e6',
        'text_primary': '#2c3e50',
        'text_secondary': '#7f8c8d',
        'text_muted': '#95a5a6',
        
        # Camera colors
        'camera_bg': '#2c3e50',
        'camera_frame': '#34495e',
        'camera_error': '#e74c3c'
    }
    
    # Font configuration
    FONTS = {
        'family': 'Roboto',
        'fallback': 'Segoe UI',
        'sizes': {
            'title': 24,
            'heading': 16,
            'body': 12,
            'small': 10,
            'button': 12
        },
        'weights': {
            'normal': 'normal',
            'bold': 'bold'
        }
    }
    
    # Spacing
    SPACING = {
        'xs': 5,
        'sm': 10,
        'md': 15,
        'lg': 20,
        'xl': 30
    }
    
    # Component sizes
    SIZES = {
        'sidebar_width': 300,
        'button_height': 40,
        'input_height': 35,
        'camera_width': 640,
        'camera_height': 480
    }
    
    @classmethod
    def get_font(cls, size_key, weight='normal'):
        """Get font configuration"""
        try:
            return (cls.FONTS['family'], cls.FONTS['sizes'][size_key], weight)
        except KeyError:
            return (cls.FONTS['fallback'], cls.FONTS['sizes'].get(size_key, 12), weight)
    
    @classmethod
    def get_color(cls, color_key):
        """Get color value"""
        return cls.COLORS.get(color_key, '#000000')
    
    @classmethod
    def get_spacing(cls, spacing_key):
        """Get spacing value"""
        return cls.SPACING.get(spacing_key, 10)
    
    @classmethod
    def get_size(cls, size_key):
        """Get size value"""
        return cls.SIZES.get(size_key, 100)