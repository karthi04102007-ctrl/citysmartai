import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.database.mongodb import db
from app.api import detection, reports, location, email

app = FastAPI(
    title="Smart City AI CCTV API",
    description="Backend services for analyzing CCTV images, logging reports, and dispatching alerts.",
    version="1.0.0"
)

# CORS middleware to allow React frontend (running on localhost:5173) to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Custom StaticFiles subclass to add CORS headers to static assets
class CORSMountedStaticFiles(StaticFiles):
    async def simple_response(self, *args, **kwargs):
        response = await super().simple_response(*args, **kwargs)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

# Serve the uploaded and annotated images statically
app.mount("/uploads", CORSMountedStaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.on_event("startup")
async def startup_db_client():
    await db.connect()

@app.get("/")
async def read_root():
    db_mode = await db.get_mode()
    return {
        "title": "Smart City AI CCTV API",
        "status": "online",
        "databaseMode": db_mode
    }

# Include routers
app.include_router(detection.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(location.router, prefix="/api")
app.include_router(email.router, prefix="/api")
