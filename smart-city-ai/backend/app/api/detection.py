import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.report_service import report_service
from app.core.config import settings

router = APIRouter()

@router.post("/detect")
async def detect_image(
    image: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None)
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")
        
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save the file with a unique UUID to prevent conflicts
    ext = os.path.splitext(image.filename)[1]
    if not ext:
        ext = ".jpg"
    unique_filename = f"img_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        content = await image.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded image: {e}")
        
    # Run the report service pipeline
    result = await report_service.process_new_upload(file_path, latitude, longitude)
    
    report = result["report"]
    return {
        "issue": report["issueType"],
        "confidence": int(report["confidence"] * 100) if report["confidence"] <= 1.0 else int(report["confidence"]),
        "status": "Detected" if not result["duplicate"] else "Duplicate",
        "reportId": report["id"],
        "duplicate": result["duplicate"],
        "message": result["message"]
    }
