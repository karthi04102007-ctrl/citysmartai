import os
from PIL import Image, ImageDraw, ImageFont

def create_cctv_mockup(filename, text, bg_color, shape_color, shape_type):
    # Create 640x480 image
    img = Image.new("RGB", (640, 480), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw simple shape in the center representing the issue
    if shape_type == "circle":
        draw.ellipse([220, 140, 420, 340], fill=shape_color, outline=(255, 255, 255), width=3)
    elif shape_type == "rectangle":
        draw.rectangle([200, 160, 440, 320], fill=shape_color, outline=(255, 255, 255), width=3)
    elif shape_type == "polygon":
        # Draw triangle / tree shape
        draw.polygon([(320, 100), (220, 360), (420, 360)], fill=shape_color, outline=(255, 255, 255))
        draw.rectangle([300, 360, 340, 400], fill=(139, 69, 19)) # trunk
        
    # Draw CCTV overlay elements
    draw.rectangle([10, 10, 630, 470], outline=(200, 200, 200), width=1)
    # CCTV corners
    draw.line([20, 20, 40, 20], fill=(255, 0, 0), width=3)
    draw.line([20, 20, 20, 40], fill=(255, 0, 0), width=3)
    draw.line([620, 20, 600, 20], fill=(255, 0, 0), width=3)
    draw.line([620, 20, 620, 40], fill=(255, 0, 0), width=3)
    
    # Text banner
    draw.rectangle([0, 430, 640, 480], fill=(0, 0, 0))
    
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
        
    # Draw text
    draw.text((30, 445), f"CCTV CAMERA 04 - {text.upper()}", fill=(255, 255, 255), font=font)
    draw.text((480, 445), "REC 2026-07-07", fill=(255, 0, 0), font=font)
    
    # Save to both target directories
    os.makedirs("../sample-images", exist_ok=True)
    os.makedirs("uploads", exist_ok=True)
    
    img.save(os.path.join("../sample-images", filename))
    img.save(os.path.join("uploads", filename))
    print(f"Created {filename} placeholder.")

if __name__ == "__main__":
    create_cctv_mockup(
        "sample_pothole.jpg",
        "Pothole Detected",
        (50, 50, 50),       # Dark grey asphalt
        (255, 82, 82),      # Red pothole shape
        "circle"
    )
    create_cctv_mockup(
        "sample_streetlight.jpg",
        "Street Light Fault",
        (20, 20, 40),       # Dark blue night
        (255, 215, 0),      # Yellow lamp shape
        "rectangle"
    )
    create_cctv_mockup(
        "sample_drainage.jpg",
        "Drainage Overflow",
        (40, 60, 80),       # Wet concrete
        (41, 182, 246),     # Blue water shape
        "circle"
    )
    create_cctv_mockup(
        "sample_fallentree.jpg",
        "Fallen Tree",
        (70, 70, 70),       # Road road
        (76, 175, 80),      # Green foliage shape
        "polygon"
    )
    print("Done creating all placeholders!")
