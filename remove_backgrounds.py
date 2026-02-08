#!/usr/bin/env python3
"""
Remove white backgrounds from watercolor PNGs
Requires: pip install pillow rembg
"""

from rembg import remove
from PIL import Image
import os
from pathlib import Path

def remove_background(input_path, output_path):
    """Remove background from a single image"""
    print(f"Processing: {input_path}")
    
    # Open image
    input_image = Image.open(input_path)
    
    # Remove background
    output_image = remove(input_image)
    
    # Save with transparency
    output_image.save(output_path, 'PNG')
    print(f"✅ Saved: {output_path}")

def process_all_images(input_dir, output_dir):
    """Process all PNG images in directory"""
    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Get all PNG files
    png_files = list(Path(input_dir).glob('*.png')) + list(Path(input_dir).glob('*.PNG'))
    
    print(f"Found {len(png_files)} PNG files")
    
    # Process each file
    for png_file in png_files:
        output_path = Path(output_dir) / png_file.name
        remove_background(str(png_file), str(output_path))
    
    print(f"\n🎉 Done! Processed {len(png_files)} images")
    print(f"📁 Transparent images saved to: {output_dir}")

if __name__ == "__main__":
    # Configure paths
    input_directory = "public/images"
    output_directory = "public/images_transparent"
    
    print("🎨 Removing white backgrounds from watercolors...")
    process_all_images(input_directory, output_directory)
