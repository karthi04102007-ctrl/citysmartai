import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger("smart-city-ai")

class EmailService:
    async def send_alert(self, issue_type: str, address: str, latitude: float, longitude: float, authority_name: str, authority_email: str) -> dict:
        subject = f"Smart City Alert: Infrastructure Issue Detected - {issue_type}"
        
        now_str = datetime.now().strftime("%Y-%m-%d %I:%M %p")
        body = f"""Hello,

This is an automated municipal alert from the Smart City CCTV AI System.

An infrastructure issue has been detected requiring inspection:

- Issue Type: {issue_type}
- Assigned Authority: {authority_name}
- Approximate Location: {address}
- Coordinates: {latitude}, {longitude}
- Time: {now_str}

Please inspect the location and update the resolution status.

Thank you,
Smart City Operations Center
"""
        
        # If SMTP settings are unconfigured, run in simulation mode
        if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info("---------- SIMULATED EMAIL NOTIFICATION ----------")
            logger.info(f"To: {authority_email} ({authority_name})")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body:\n{body}")
            logger.info("--------------------------------------------------")
            return {
                "sent": True,
                "simulated": True,
                "to": authority_email,
                "subject": subject,
                "body": body
            }
            
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_FROM
            msg['To'] = authority_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            
            # Run blocking SMTP calls in the background executor thread
            import asyncio
            loop = asyncio.get_running_loop()
            
            def _send_smtp():
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=8) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM, [authority_email], msg.as_string())
                    
            await loop.run_in_executor(None, _send_smtp)
            logger.info(f"Email notification successfully sent to {authority_email}")
            return {
                "sent": True,
                "simulated": False,
                "to": authority_email,
                "subject": subject,
                "body": body
            }
        except Exception as e:
            logger.error(f"Failed to send SMTP email alert: {e}")
            return {
                "sent": False,
                "simulated": False,
                "error": str(e),
                "to": authority_email,
                "subject": subject,
                "body": body
            }

email_service = EmailService()
