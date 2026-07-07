from PIL import Image
import logging

logger = logging.getLogger("smart-city-ai")

def resize_image_in_place(image_path: str, max_size=(800, 800)):
    """
    Resizes the image in place to prevent huge photo uploads from slowing down
    inference or storage. Uses LANCZOS resampling.
    """
    try:
        with Image.open(image_path) as img:
            # Check if dimensions are larger than max
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                img.save(image_path)
                logger.info(f"Resized image {image_path} to {img.size}")
    except Exception as e:
        logger.error(f"Failed to resize image {image_path}: {e}")
