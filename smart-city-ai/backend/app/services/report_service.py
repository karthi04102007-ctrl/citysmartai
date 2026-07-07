from datetime import datetime, timedelta
import math
import os
from app.database.mongodb import db
from app.models.report_model import AUTHORITY_MAPPING
from app.services.ai_service import ai_service
from app.services.location_service import get_lat_lon, reverse_geocode
from app.services.email_service import email_service

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Haversine distance approximation in meters
    try:
        # Radius of Earth in meters
        R = 6371000.0
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * \
            math.sin(delta_lambda / 2.0) ** 2
            
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        
        return R * c
    except Exception:
        return 999999.0

class ReportService:
    async def process_new_upload(self, file_path: str, manual_lat: float = None, manual_lon: float = None) -> dict:
        # 1. AI detection (Mock or YOLO)
        detection = await ai_service.detect_issue(file_path)
        issue_type = detection["issue"]
        confidence = detection["confidence"]
        annotated_image = detection["annotatedImage"]
        
        # 2. Retrieve coordinates (EXIF GPS metadata first, then manual form input fallback)
        lat, lon = manual_lat, manual_lon
        if lat is None or lon is None:
            exif_lat, exif_lon = get_lat_lon(file_path)
            if exif_lat is not None and exif_lon is not None:
                lat, lon = exif_lat, exif_lon
            else:
                # Default coordinates for Madurai municipal area
                lat, lon = 9.9252, 78.1198

        # 3. Duplicate Detection: Check for similar issues within 50 meters in last 30 minutes
        reports = await db.get_reports()
        duplicate_report = None
        
        for r in reports:
            if r.get("issueType") == issue_type and r.get("status") not in ["Resolved"]:
                r_loc = r.get("location", {})
                r_lat = r_loc.get("latitude")
                r_lon = r_loc.get("longitude")
                
                if r_lat is not None and r_lon is not None:
                    dist = calculate_distance(lat, lon, r_lat, r_lon)
                    if dist <= 50.0: # 50 meters
                        # Check timestamp difference
                        r_time_str = r.get("reportedAt", "")
                        try:
                            # Parse ISO timestamp (e.g. 2026-07-07T10:30:00)
                            r_time = datetime.fromisoformat(r_time_str)
                            if datetime.now() - r_time <= timedelta(minutes=30):
                                duplicate_report = r
                                break
                        except Exception:
                            pass
                            
        if duplicate_report:
            return {
                "duplicate": True,
                "report": duplicate_report,
                "message": f"Duplicate issue detected within 50 meters of active report #{duplicate_report['id'][:8]}. Municipal notification skipped.",
                "aiResults": detection
            }
            
        # 4. Geocode Lat/Lon to address
        address = await reverse_geocode(lat, lon)
        
        # 5. Route to Municipal Authority
        auth_info = AUTHORITY_MAPPING.get(issue_type, {
            "name": "Madurai Corporation",
            "email": "alerts@madurai.gov.in"
        })
        authority_name = auth_info["name"]
        authority_email = auth_info["email"]
        
        # 6. Save image web path
        filename = os.path.basename(file_path)
        image_web_path = f"uploads/{filename}"
        
        # 7. Construct Report
        report_doc = {
            "issueType": issue_type,
            "confidence": confidence,
            "location": {
                "latitude": lat,
                "longitude": lon,
                "address": address
            },
            "image": annotated_image if annotated_image else image_web_path,
            "status": "Pending",
            "authority": authority_name,
            "emailSent": False,
            "reportedAt": datetime.now().isoformat()
        }
        
        # 8. Save in database
        saved_report = await db.insert_report(report_doc)
        
        # 9. Send alert email (real or simulated)
        email_result = await email_service.send_alert(
            issue_type=issue_type,
            address=address,
            latitude=lat,
            longitude=lon,
            authority_name=authority_name,
            authority_email=authority_email
        )
        
        # 10. Update database emailSent flag if sent successfully
        if email_result.get("sent"):
            saved_report = await db.update_report(saved_report["id"], {"emailSent": True})
            
        return {
            "duplicate": False,
            "report": saved_report,
            "emailStatus": email_result,
            "message": f"Infrastructure issue detected and logged under report #{saved_report['id'][:8]}.",
            "aiResults": detection
        }

report_service = ReportService()
