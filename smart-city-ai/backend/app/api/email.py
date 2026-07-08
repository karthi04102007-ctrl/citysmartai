from fastapi import APIRouter, HTTPException, Path
from app.database.mongodb import db
from app.services.email_service import email_service
from app.services.sms_service import sms_service
from app.models.report_model import AUTHORITY_MAPPING

router = APIRouter()

@router.post("/send-email/{report_id}")
async def send_email_alert(report_id: str = Path(..., description="The ID of the report to trigger an alert email for")):
    report = await db.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    issue_type = report.get("issueType")
    loc = report.get("location", {})
    lat = loc.get("latitude")
    lon = loc.get("longitude")
    address = loc.get("address", "")
    
    auth_info = AUTHORITY_MAPPING.get(issue_type, {
        "name": "Madurai Corporation",
        "email": "alerts@madurai.gov.in"
    })
    
    email_result = await email_service.send_alert(
        issue_type=issue_type,
        address=address,
        latitude=lat,
        longitude=lon,
        authority_name=auth_info["name"],
        authority_email=auth_info["email"]
    )
    
    # Also trigger SMS alert (in phase 3 we can restrict this to HIGH severity only)
    sms_result = await sms_service.send_sms_alert(
        issue_type=issue_type,
        address=address,
        authority_name=auth_info["name"]
    )
    
    if email_result.get("sent"):
        await db.update_report(report_id, {"emailSent": True})
        return {
            "status": "success",
            "message": "Alerts sent successfully.",
            "emailDetails": email_result,
            "smsDetails": sms_result
        }
    else:
        return {
            "status": "error",
            "message": "Failed to send email alert.",
            "error": email_result.get("error", "Unknown SMTP exception")
        }
    
