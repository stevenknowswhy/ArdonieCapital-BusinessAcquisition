#!/usr/bin/env python3
"""
Create a proper favicon.ico file for Ardonie Capital
This script creates a simple but professional favicon with "AC" text
"""

import os
import struct

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
        import shutil
        shutil.copy('favicon.ico', 'assets/images/favicon.ico')
        print("✅ Favicon copied to assets/images/")

    print("\n📁 Files created:")
    if os.path.exists('favicon.ico'):
        print("  - favicon.ico (root directory)")
    if os.path.exists('assets/images/favicon.ico'):
        print("  - assets/images/favicon.ico (for HTML references)")

    print("\n🎉 Favicon creation completed!")
        # Create a new image with RGBA mode for transparency
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Create gradient-like background (simplified as solid color)
        # Blue gradient colors: #3b82f6 to #2563eb
        bg_color = (59, 130, 246, 255)  # #3b82f6 with full opacity
        
        # Draw rounded rectangle background
        margin = 1
        draw.rounded_rectangle(
            [margin, margin, size - margin, size - margin],
            radius=max(2, size // 8),
            fill=bg_color
        )
        
        # Calculate font size based on image size
        font_size = max(8, int(size * 0.6))
        
        try:
            # Try to use a system font
            font = ImageFont.truetype("Arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
                except:
                    # Fallback to default font
                    font = ImageFont.load_default()
        
        # Draw "AC" text
        text = "AC"
        
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center the text
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - 1  # Slight adjustment for better centering
        
        # Draw text in white
        draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
        
        images.append(img)
    
    # Save as ICO file
    if images:
        images[0].save('favicon.ico', format='ICO', sizes=[(img.width, img.height) for img in images])
        print("✅ favicon.ico created successfully!")
        
        # Also save individual PNG files for testing
        for i, img in enumerate(images):
            img.save(f'favicon-{sizes[i]}.png')
            print(f"✅ favicon-{sizes[i]}.png created for testing")
    
    return True

def create_simple_favicon():
    """Create a simple favicon without PIL dependency"""
    print("Creating simple favicon without PIL...")
    
    # Create a simple 16x16 favicon data
    # This is a very basic ICO file structure
    ico_header = bytes([
        0x00, 0x00,  # Reserved
        0x01, 0x00,  # Type (1 = ICO)
        0x01, 0x00,  # Number of images
    ])
    
    # Image directory entry for 16x16 image
    img_dir = bytes([
        0x10,        # Width (16)
        0x10,        # Height (16)
        0x00,        # Color palette (0 = no palette)
        0x00,        # Reserved
        0x01, 0x00,  # Color planes
        0x20, 0x00,  # Bits per pixel (32)
        0x00, 0x04, 0x00, 0x00,  # Size of image data
        0x16, 0x00, 0x00, 0x00,  # Offset to image data
    ])
    
    # Simple 16x16 RGBA image data (blue background with white "AC")
    # This is a simplified representation
    image_data = bytearray(16 * 16 * 4)  # 16x16 pixels, 4 bytes per pixel (RGBA)
    
    # Fill with blue background
    for i in range(0, len(image_data), 4):
        image_data[i] = 246      # Blue
        image_data[i + 1] = 130  # Green
        image_data[i + 2] = 59   # Red (BGR format)
        image_data[i + 3] = 255  # Alpha
    
    # Write the ICO file
    with open('favicon.ico', 'wb') as f:
        f.write(ico_header)
        f.write(img_dir)
        f.write(image_data)
    
    print("✅ Simple favicon.ico created!")

if __name__ == "__main__":
    try:
        # Try to import PIL
        from PIL import Image, ImageDraw, ImageFont
        create_favicon()
    except ImportError:
        print("PIL not available, creating simple favicon...")
        create_simple_favicon()
    
    print("\n🎨 Favicon creation completed!")
    print("📁 Files created:")
    if os.path.exists('favicon.ico'):
        print("  - favicon.ico (main favicon file)")
    if os.path.exists('favicon-16.png'):
        print("  - favicon-16.png (16x16 test image)")
    if os.path.exists('favicon-32.png'):
        print("  - favicon-32.png (32x32 test image)")
    if os.path.exists('favicon-48.png'):
        print("  - favicon-48.png (48x48 test image)")
