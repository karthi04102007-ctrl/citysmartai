from fastapi import APIRouter, Query
from app.services.location_service import reverse_geocode

router = APIRouter()

@router.get("/reverse-geocode")
async def reverse_geocode_endpoint(
    latitude: float = Query(..., description="Latitude coordinate"),
    longitude: float = Query(..., description="Longitude coordinate")
):
    address = await reverse_geocode(latitude, longitude)
    return {"address": address, "latitude": latitude, "longitude": longitude}
