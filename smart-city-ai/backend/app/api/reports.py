from fastapi import APIRouter, HTTPException, Path, Body
from app.database.mongodb import db
from typing import List
from app.schemas.report_schema import ReportResponse

router = APIRouter()

@router.get("/reports", response_model=List[ReportResponse])
async def get_all_reports():
    return await db.get_reports()

@router.get("/reports/{id}", response_model=ReportResponse)
async def get_report_by_id(id: str = Path(..., description="The ID of the report to retrieve")):
    report = await db.get_report(id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.delete("/reports/{id}")
async def delete_report(id: str = Path(..., description="The ID of the report to delete")):
    deleted = await db.delete_report(id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found or could not be deleted")
    return {"message": "Report deleted successfully", "id": id}

@router.get("/dashboard")
async def get_dashboard_stats():
    return await db.get_dashboard_stats()

# Update report status (Pending -> Assigned -> Resolved)
@router.patch("/reports/{id}", response_model=ReportResponse)
async def update_report_status(
    id: str = Path(..., description="The ID of the report to update"),
    status: str = Body(..., embed=True, description="The new status: Pending, Assigned, or Resolved")
):
    if status not in ["Pending", "Assigned", "Resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status value. Choose 'Pending', 'Assigned', or 'Resolved'.")
        
    updated = await db.update_report(id, {"status": status})
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found")
    return updated
