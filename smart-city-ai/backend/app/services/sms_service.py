import logging
from datetime import datetime
import asyncio

logger = logging.getLogger("smart-city-ai")

class SmsService:
    async def send_sms_alert(self, issue_type: str, address: str, authority_name: str, phone_number: str = "+919876543210") -> dict:
        """
        Mock Twilio SMS integration.
        In a real scenario, this would use twilio.rest.Client.
        """
        message_body = f"URGENT: {issue_type} reported at {address}. Assigned to {authority_name}. Please check dashboard."
        
        # Simulate network latency
        await asyncio.sleep(0.5)
        
        logger.info("========== SIMULATED SMS NOTIFICATION ==========")
        logger.info(f"To Phone: {phone_number}")
        logger.info(f"Message: {message_body}")
        logger.info("================================================")
        
        return {
            "sent": True,
            "simulated": True,
            "to": phone_number,
            "body": message_body
        }

sms_service = SmsService()
