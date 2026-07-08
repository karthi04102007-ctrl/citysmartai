import os
from fastapi import FastAPI, Depends, HTTPException, Security, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security.api_key import APIKeyHeader
from app.core.config import settings
from app.database.mongodb import db
from app.api import detection, reports, location, email

api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if settings.API_KEY:
        if not api_key or api_key != settings.API_KEY:
            raise HTTPException(status_code=403, detail="Could not validate credentials")
    return api_key

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

# Include routers with API key validation
app.include_router(detection.router, prefix="/api", dependencies=[Depends(verify_api_key)])
app.include_router(reports.router, prefix="/api", dependencies=[Depends(verify_api_key)])
app.include_router(location.router, prefix="/api", dependencies=[Depends(verify_api_key)])
app.include_router(email.router, prefix="/api", dependencies=[Depends(verify_api_key)])

from app.services.websocket_service import ws_manager

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from the client in this app, just listening
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
