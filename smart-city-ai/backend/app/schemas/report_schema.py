from pydantic import BaseModel, Field
from typing import Optional

class LocationSchema(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None

class ReportCreate(BaseModel):
    issueType: str
    confidence: float
    location: LocationSchema
    image: str
    status: str = "Pending"
    authority: str
    emailSent: bool = False

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    authority: Optional[str] = None
    emailSent: Optional[bool] = None

class ReportResponse(BaseModel):
    id: str
    issueType: str
    confidence: float
    location: LocationSchema
    image: str
    status: str
    authority: str
    emailSent: bool
    reportedAt: str
