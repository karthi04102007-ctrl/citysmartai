# Implementation Plan: Smart City AI Hackathon Prototype

This plan outlines the architecture, installation steps, and coding tasks required to build the Smart City AI prototype, which simulates a CCTV camera network detecting infrastructure issues (potholes, street light faults, drainage overflow, fallen trees), logging reports to MongoDB, sending email alerts, and mapping them interactively.

## Environment Preparation

Our initial checks showed that **Node.js** and **Python** are not in the system path. We will install them using **winget** (Windows Package Manager).
* **Node.js LTS**: `winget install OpenJS.NodeJS.LTS --scope user` (approx. Node v24)
* **Python 3.11**: `winget install Python.Python.3.11 --scope user`

After installing, we will update the path in the terminal session and verify the installations.

---

## Architecture & Integration Strategy

### 1. Robust MongoDB Integration & Fallback
Since this is a hackathon prototype, we will implement dual database modes in `app/database/mongodb.py`:
* **Atlas Mode**: Connects using `Motor` (async driver) to MongoDB Atlas when a valid URI is provided.
* **In-Memory Mock Fallback**: If the URI is missing or the connection times out (e.g. 3-second timeout), the backend automatically falls back to an in-memory dictionary-based database. This ensures the app runs perfectly out-of-the-box.
* The frontend will display the connection status: **"Database: Atlas (Connected)"** or **"Database: In-Memory (Fallback Mode)"**.

### 2. SMTP/Email Simulation & Sending
* **Actual SMTP**: Uses a standard SMTP server or Gmail if credentials are provided in `.env`.
* **Mock Simulation**: If credentials are missing, we log the email content to stdout and return it in the API response. The frontend can display a simulated email preview card.

### 3. AI Detection Fallback (YOLO vs. Pillow Rules)
* **Real YOLO**: If `ultralytics` is successfully installed, we load `best.pt` (or a pre-trained `yolov8n.pt` for test classes).
* **Pillow Metadata Fallback**: If OpenCV/PyTorch dependencies fail to build on Windows, we will use a color/contrast heuristic or image-metadata-based mock inference service. We will generate 4 sample images under `sample-images/` representing each issue class, and our mock AI will detect the class based on the file name/metadata, while other user-uploaded images will produce mock detections with bounding boxes.

---

## User Review Required

> [!IMPORTANT]
> **Tailwind CSS Version**: I plan to use **Tailwind CSS v3** because of its stability and ease of integration with standard Vite templates. Let me know if you prefer Tailwind CSS v4.
> 
> **SMTP Credentials**: For testing email alerts, you can configure your SMTP host, port, username, and password in `backend/.env`. If not configured, the app will run in "Simulation Mode".

---

## Open Questions

1. **SMTP Provider**: Would you like to use Gmail, Mailtrap, or another local service for SMTP alerts during live testing? (By default, we'll configure standard SMTP settings in `.env` for you to fill out).
2. **Pre-populated reports**: Should we pre-populate the database with some historical reports so that the Map and Dashboard charts display rich analytics immediately upon start?

---

## Proposed Changes

We will create the directory `smart-city-ai/` with the requested subdirectories:

### Backend Development (`backend/`)

#### [NEW] [requirements.txt](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/requirements.txt)
Defines Python dependencies: `fastapi`, `uvicorn`, `motor`, `pillow`, `python-dotenv`, `pydantic`, `email-validator`, `pydantic-settings`, etc.

#### [NEW] [app/core/config.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/core/config.py)
Configuration settings loaded from `.env`.

#### [NEW] [app/database/mongodb.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/database/mongodb.py)
Connection manager with the connection retry and In-Memory fallback logic.

#### [NEW] [app/models/report_model.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/models/report_model.py)
#### [NEW] [app/schemas/report_schema.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/schemas/report_schema.py)
Database schemas and request/response models.

#### [NEW] [app/services/ai_service.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/services/ai_service.py)
Image processing and YOLO inference with a Pillow mock fallback.

#### [NEW] [app/services/email_service.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/services/email_service.py)
Sends emails using SMTP, or logs email simulations.

#### [NEW] [app/services/location_service.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/services/location_service.py)
Extracts GPS metadata from images, or maps coordinates to textual addresses using OpenStreetMap Nominatim API (non-blocking).

#### [NEW] [app/api/detection.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/api/detection.py)
#### [NEW] [app/api/reports.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/api/reports.py)
#### [NEW] [app/api/location.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/api/location.py)
#### [NEW] [app/api/email.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/api/email.py)
FastAPI routes corresponding to the required endpoints.

#### [NEW] [app/main.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/backend/app/main.py)
FastAPI entry point with CORS config, uploads storage, and server startup.

---

### AI Model Development (`ai-model/`)

#### [NEW] [inference.py](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/ai-model/inference.py)
Inference CLI script for command-line testing.

#### [NEW] [classes.txt](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/ai-model/classes.txt)
Lists: `Pothole`, `Street Light Fault`, `Drainage Overflow`, `Fallen Tree`.

---

### Frontend Development (`frontend/`)

#### [NEW] [package.json](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/frontend/package.json)
Configures React, Vite, Tailwind CSS, Leaflet, Axios, and Chart.js/Recharts.

#### [NEW] [src/index.css](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/frontend/src/index.css)
Global styles with Tailwind imports and custom scrollbars/glassmorphism classes.

#### [NEW] [src/components/MapView.jsx](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/frontend/src/components/MapView.jsx)
Leaflet map showing color-coded markers (Red = Pending, Green = Resolved) and interactive popups with uploaded photos.

#### [NEW] [src/pages/Dashboard.jsx](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/frontend/src/pages/Dashboard.jsx)
Includes analytics charts (daily trends, issue breakdowns) and stats cards (total reports, pending, resolved, emails sent).

#### [NEW] [src/pages/Upload.jsx](file:///c:/Users/vgana/.antigravity-ide/smart-city-ai/frontend/src/pages/Upload.jsx)
Supports file upload, manual map-coordinate selection, CCTV live simulation, and live progress indicators.

---

## Verification Plan

### Automated Tests
- Run `uvicorn app.main:app --reload` to test FastAPI APIs.
- Run `npm run dev` to verify the frontend components, Leaflet map rendering, and API connections.

### Manual Verification
1. Upload a sample image, select a point on the map, and click "Analyze".
2. Verify that the bounding boxes and issue type (e.g. "Pothole") are displayed in the results.
3. Check the dashboard counters increment.
4. Verify the report table lists the new entry and status can be toggled (Pending -> Assigned -> Resolved).
5. Verify the map contains the marker at the clicked location with popup details.
6. Verify email logs/inbox for alerts.
