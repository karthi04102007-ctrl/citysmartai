import httpx
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import logging

logger = logging.getLogger("smart-city-ai")

def get_exif_data(image_path: str) -> dict:
    try:
        img = Image.open(image_path)
        exif = img._getexif()
        if not exif:
            return {}
        
        exif_data = {}
        for tag, value in exif.items():
            decoded = TAGS.get(tag, tag)
            exif_data[decoded] = value
        return exif_data
    except Exception as e:
        logger.error(f"Error reading EXIF data: {e}")
        return {}

def get_gps_info(exif_data: dict) -> dict:
    gps_info = exif_data.get("GPSInfo")
    if not gps_info:
        return {}
        
    gps_data = {}
    for tag in gps_info:
        decoded = GPSTAGS.get(tag, tag)
        gps_data[decoded] = gps_info[tag]
    return gps_data

def convert_to_degrees(value) -> float:
    try:
        # Handles both fraction objects and raw tuples/floats from different EXIF tags
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except Exception:
        return 0.0

def get_lat_lon(image_path: str) -> tuple:
    exif = get_exif_data(image_path)
    gps_info = get_gps_info(exif)
    if not gps_info:
        return None, None
        
    lat_val = gps_info.get("GPSLatitude")
    lat_ref = gps_info.get("GPSLatitudeRef")
    lon_val = gps_info.get("GPSLongitude")
    lon_ref = gps_info.get("GPSLongitudeRef")
    
    if lat_val and lat_ref and lon_val and lon_ref:
        lat = convert_to_degrees(lat_val)
        if lat_ref != "N":
            lat = -lat
            
        lon = convert_to_degrees(lon_val)
        if lon_ref != "E":
            lon = -lon
            
        return lat, lon
    return None, None

async def reverse_geocode(lat: float, lon: float) -> str:
    try:
        # Nominatim policy requires a custom User-Agent
        headers = {"User-Agent": "SmartCityAI-Hackathon-Prototype/1.0 (vgana@users.noreply.github.com)"}
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                address = data.get("display_name")
                if address:
                    # Return a shortened version of display_name for aesthetic reasons in the UI
                    parts = address.split(",")
                    if len(parts) > 3:
                        return ", ".join([p.strip() for p in parts[:3]])
                    return address
    except Exception as e:
        logger.error(f"Error reverse geocoding coordinates {lat}, {lon}: {e}")
    
    return f"Madurai Corporation area ({lat:.4f}, {lon:.4f})"
