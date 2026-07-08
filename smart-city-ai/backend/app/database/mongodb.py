import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from bson import ObjectId
from datetime import datetime
from app.services.websocket_service import ws_manager

logger = logging.getLogger("smart-city-ai")
logging.basicConfig(level=logging.INFO)

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.mode = "mock"
        
        # In-memory database
        self._reports = {}
        
        # Prepopulate database with mock reports for dashboard and map on first start
        self._prepopulate_mock_data()

    def _prepopulate_mock_data(self):
        # We add some mock reports so that the map and charts look populated out of the box
        mock_reports = [
            {
                "id": "64a7c8ef4c1a5b823e800001",
                "issueType": "Pothole",
                "confidence": 0.94,
                "location": {
                    "latitude": 9.9252,
                    "longitude": 78.1198,
                    "address": "Anna Nagar, Madurai"
                },
                "image": "uploads/sample_pothole.jpg",
                "status": "Pending",
                "authority": "Madurai Corporation – Road Department",
                "emailSent": True,
                "reportedAt": "2026-07-07T08:30:00"
            },
            {
                "id": "64a7c8ef4c1a5b823e800002",
                "issueType": "Street Light Fault",
                "confidence": 0.89,
                "location": {
                    "latitude": 9.9167,
                    "longitude": 78.1402,
                    "address": "KK Nagar, Madurai"
                },
                "image": "uploads/sample_streetlight.jpg",
                "status": "Resolved",
                "authority": "Madurai Corporation – Electrical Wing",
                "emailSent": True,
                "reportedAt": "2026-07-06T20:15:00"
            },
            {
                "id": "64a7c8ef4c1a5b823e800003",
                "issueType": "Drainage Overflow",
                "confidence": 0.91,
                "location": {
                    "latitude": 9.9320,
                    "longitude": 78.1250,
                    "address": "Sellur, Madurai"
                },
                "image": "uploads/sample_drainage.jpg",
                "status": "Pending",
                "authority": "Madurai Corporation – Drainage Department",
                "emailSent": False,
                "reportedAt": "2026-07-07T09:45:00"
            },
            {
                "id": "64a7c8ef4c1a5b823e800004",
                "issueType": "Fallen Tree",
                "confidence": 0.97,
                "location": {
                    "latitude": 9.9095,
                    "longitude": 78.1025,
                    "address": "Tirunagar, Madurai"
                },
                "image": "uploads/sample_fallentree.jpg",
                "status": "Assigned",
                "authority": "Madurai Corporation – Parks & Emergency Wing",
                "emailSent": True,
                "reportedAt": "2026-07-05T14:10:00"
            }
        ]
        for r in mock_reports:
            self._reports[r["id"]] = r

    async def connect(self):
        if not settings.MONGODB_URI:
            logger.warning("MONGODB_URI is not set. Running in IN-MEMORY Mock Database mode.")
            self.mode = "mock"
            return
            
        try:
            logger.info("Attempting to connect to MongoDB Atlas...")
            self.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
            self.db = self.client[settings.DATABASE_NAME]
            # Ping db to check
            await self.db.command('ping')
            self.mode = "atlas"
            logger.info("Successfully connected to MongoDB Atlas!")
            
            # Transfer mock data if database is empty (optional convenience for hackathon)
            count = await self.db.reports.count_documents({})
            if count == 0:
                logger.info("MongoDB Atlas database is empty. Transferring sample reports...")
                for r in self._reports.values():
                    doc = r.copy()
                    doc["_id"] = ObjectId(doc.pop("id"))
                    await self.db.reports.insert_one(doc)
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}. Falling back to IN-MEMORY Mock Database mode.")
            self.mode = "mock"
            self.client = None
            self.db = None

    async def get_mode(self) -> str:
        return self.mode

    async def insert_report(self, report: dict) -> dict:
        if self.mode == "atlas":
            doc = report.copy()
            if "id" in doc:
                doc["_id"] = ObjectId(doc.pop("id"))
            elif "_id" not in doc:
                doc["_id"] = ObjectId()
            
            await self.db.reports.insert_one(doc)
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            await ws_manager.broadcast({"type": "REPORT_ADDED", "data": doc})
            return doc
        else:
            doc = report.copy()
            if "id" not in doc:
                doc["id"] = str(ObjectId())
            self._reports[doc["id"]] = doc
            await ws_manager.broadcast({"type": "REPORT_ADDED", "data": doc})
            return doc

    async def get_reports(self) -> list:
        if self.mode == "atlas":
            reports = []
            async for doc in self.db.reports.find().sort("reportedAt", -1):
                doc["id"] = str(doc.pop("_id"))
                reports.append(doc)
            return reports
        else:
            # Sort by reportedAt desc
            sorted_reports = sorted(
                self._reports.values(),
                key=lambda x: x.get("reportedAt", ""),
                reverse=True
            )
            return list(sorted_reports)

    async def get_report(self, report_id: str) -> dict:
        if self.mode == "atlas":
            try:
                doc = await self.db.reports.find_one({"_id": ObjectId(report_id)})
                if doc:
                    doc["id"] = str(doc.pop("_id"))
                    return doc
            except Exception:
                pass
            return None
        else:
            return self._reports.get(report_id)

    async def update_report(self, report_id: str, update_data: dict) -> dict:
        if self.mode == "atlas":
            try:
                await self.db.reports.update_one(
                    {"_id": ObjectId(report_id)},
                    {"$set": update_data}
                )
                updated_doc = await self.get_report(report_id)
                if updated_doc:
                    await ws_manager.broadcast({"type": "REPORT_UPDATED", "data": updated_doc})
                return updated_doc
            except Exception:
                return None
        else:
            if report_id in self._reports:
                self._reports[report_id].update(update_data)
                updated_doc = self._reports[report_id]
                await ws_manager.broadcast({"type": "REPORT_UPDATED", "data": updated_doc})
                return updated_doc
            return None

    async def delete_report(self, report_id: str) -> bool:
        if self.mode == "atlas":
            try:
                result = await self.db.reports.delete_one({"_id": ObjectId(report_id)})
                return result.deleted_count > 0
            except Exception:
                return False
        else:
            if report_id in self._reports:
                del self._reports[report_id]
                return True
            return False

    async def get_dashboard_stats(self) -> dict:
        reports = await self.get_reports()
        total = len(reports)
        pending = sum(1 for r in reports if r.get("status") in ["Pending", "Detected"])
        resolved = sum(1 for r in reports if r.get("status") == "Resolved")
        emails_sent = sum(1 for r in reports if r.get("emailSent") is True)
        
        # Today's reports (match dates from start of timestamp)
        today_str = datetime.now().strftime("%Y-%m-%d")
        today_reports = sum(1 for r in reports if r.get("reportedAt", "").startswith(today_str))

        # Breakdown of issues
        issue_counts = {
            "Pothole": 0,
            "Street Light Fault": 0,
            "Drainage Overflow": 0,
            "Fallen Tree": 0
        }
        for r in reports:
            itype = r.get("issueType", "Pothole")
            if itype in issue_counts:
                issue_counts[itype] += 1
            else:
                issue_counts[itype] = issue_counts.get(itype, 0) + 1
            
        # Daily history (grouped by date)
        daily_counts = {}
        for r in reports:
            # reportedAt is like "2026-07-07T10:30:00"
            date_str = r.get("reportedAt", "")[:10]
            if date_str:
                daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
        
        # Sort and take last 7 days
        sorted_dates = sorted(daily_counts.keys())
        history = [{"date": d, "count": daily_counts[d]} for d in sorted_dates[-7:]]

        return {
            "totalReports": total,
            "pending": pending,
            "resolved": resolved,
            "emailsSent": emails_sent,
            "todayReports": today_reports,
            "issueCounts": issue_counts,
            "history": history,
            "dbMode": self.mode
        }

db = Database()
