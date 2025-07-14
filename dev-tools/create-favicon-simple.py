#!/usr/bin/env python3
"""
Create a proper favicon.ico file for Ardonie Capital
This script creates a simple but professional favicon with "AC" text
"""

import os
import struct
import shutil

def create_simple_favicon():
    """Create a simple favicon.ico file without PIL dependency"""
    
    # ICO file header (6 bytes)
    ico_header = struct.pack('<HHH', 0, 1, 1)  # Reserved, Type (1=ICO), Count
    
    # Image directory entry (16 bytes)
    img_dir = struct.pack('<BBBBHHLL', 
        16,    # Width (16 pixels)
        16,    # Height (16 pixels)  
        0,     # Color count (0 = no palette)
        0,     # Reserved
        1,     # Color planes
        32,    # Bits per pixel
        1024,  # Size of image data
        22     # Offset to image data
    )
    
    # Create 16x16 RGBA image data with "AC" design
    width, height = 16, 16
    image_data = bytearray(width * height * 4)  # RGBA
    
    # Blue gradient background (#3b82f6 to #2563eb)
    for y in range(height):
        for x in range(width):
            idx = (y * width + x) * 4
            # Create gradient effect
            factor = y / height
            r = int(59 + (37 - 59) * factor)    # 3b -> 25
            g = int(130 + (99 - 130) * factor)  # 82 -> 63  
            b = int(246 + (235 - 246) * factor) # f6 -> eb
            
            image_data[idx] = b      # Blue (BGR format)
            image_data[idx + 1] = g  # Green
            image_data[idx + 2] = r  # Red
            image_data[idx + 3] = 255 # Alpha
    
    # Add simple "AC" text pattern (white pixels)
    # A pattern (left side)
    a_pixels = [
        (4, 3), (5, 3), (6, 3),     # Top bar
        (3, 4), (7, 4),             # Sides
        (3, 5), (7, 5),             # Sides
        (3, 6), (4, 6), (5, 6), (6, 6), (7, 6),  # Middle bar
        (3, 7), (7, 7),             # Sides
        (3, 8), (7, 8),             # Sides
        (3, 9), (7, 9),             # Sides
        (3, 10), (7, 10)            # Bottom sides
    ]
    
    # C pattern (right side)
    c_pixels = [
        (9, 3), (10, 3), (11, 3), (12, 3),   # Top bar
        (8, 4), (13, 4),                     # Corners
        (8, 5),                              # Left side
        (8, 6),                              # Left side
        (8, 7),                              # Left side
        (8, 8),                              # Left side
        (8, 9),                              # Left side
        (8, 10), (13, 10),                   # Corners
        (9, 11), (10, 11), (11, 11), (12, 11) # Bottom bar
    ]
    
    # Draw white pixels for letters
    for x, y in a_pixels + c_pixels:
        if 0 <= x < width and 0 <= y < height:
            idx = (y * width + x) * 4
            image_data[idx] = 255     # Blue -> White
            image_data[idx + 1] = 255 # Green -> White  
            image_data[idx + 2] = 255 # Red -> White
            image_data[idx + 3] = 255 # Alpha
    
    # Write the ICO file
    with open('favicon.ico', 'wb') as f:
        f.write(ico_header)
        f.write(img_dir)
        f.write(image_data)
    
    print("✅ Professional favicon.ico created!")
    return True

if __name__ == "__main__":
    print("🎨 Creating Ardonie Capital favicon...")
    create_simple_favicon()
    
    # Also copy to assets/images directory
    if os.path.exists('favicon.ico'):
        os.makedirs('assets/images', exist_ok=True)
        shutil.copy('favicon.ico', 'assets/images/favicon.ico')
        print("✅ Favicon copied to assets/images/")
    
    print("\n📁 Files created:")
    if os.path.exists('favicon.ico'):
        print("  - favicon.ico (root directory)")
    if os.path.exists('assets/images/favicon.ico'):
        print("  - assets/images/favicon.ico (for HTML references)")
    
    print("\n🎉 Favicon creation completed!")
