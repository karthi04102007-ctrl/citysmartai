import os
import random
import logging
from PIL import Image, ImageDraw, ImageFont
from app.core.config import settings

logger = logging.getLogger("smart-city-ai")

# Check if heavy libraries are available
YOLO_AVAILABLE = False
try:
    from ultralytics import YOLO
    import cv2
    YOLO_AVAILABLE = True
    logger.info("Ultralytics YOLO and OpenCV are available. Real AI detection enabled.")
except ImportError:
    logger.warning("Ultralytics YOLO or OpenCV not installed. Running in Simulation AI Detection mode.")

class AIService:
    def __init__(self):
        self.model = None
        # Relative path from backend/ Cwd to ai-model/
        self.model_path = os.path.join("..", "ai-model", "best.pt")
        
        if YOLO_AVAILABLE:
            if os.path.exists(self.model_path):
                try:
                    self.model = YOLO(self.model_path)
                    logger.info(f"YOLO model loaded successfully from {self.model_path}")
                except Exception as e:
                    logger.error(f"Error loading YOLO model: {e}. Falling back to simulation mode.")
                    self.model = None
            else:
                logger.warning(f"best.pt not found at {self.model_path}. Will load standard yolov8n.pt on demand.")

    async def detect_issue(self, image_path: str) -> dict:
        filename = os.path.basename(image_path).lower()
        
        # If YOLO is available and loaded
        if YOLO_AVAILABLE:
            try:
                # Load on-demand if not loaded yet
                if not self.model:
                    self.model = YOLO("yolov8n.pt")
                
                results = self.model(image_path)
                if results and len(results) > 0:
                    result = results[0]
                    boxes = result.boxes
                    if len(boxes) > 0:
                        # Find the detection with the highest confidence
                        best_box_idx = 0
                        best_conf = -1.0
                        for i, box in enumerate(boxes):
                            conf = float(box.conf[0])
                            if conf > best_conf:
                                best_conf = conf
                                best_box_idx = i
                        
                        best_box = boxes[best_box_idx]
                        cls_id = int(best_box.cls[0])
                        class_name = self.model.names[cls_id]
                        confidence = float(best_box.conf[0])
                        xyxy = [int(val) for val in best_box.xyxy[0].tolist()] # Convert to int pixels
                        
                        mapped_class = self._map_to_standard_class(class_name)
                        annotated_img_path = await self._annotate_image(image_path, mapped_class, confidence, xyxy)
                        
                        return {
                            "detected": True,
                            "issue": mapped_class,
                            "confidence": round(confidence, 2),
                            "box": xyxy,
                            "annotatedImage": annotated_img_path,
                            "mode": "YOLO Real Model"
                        }
            except Exception as e:
                logger.error(f"Error during YOLO model inference: {e}. Falling back to Simulation AI.")

        # Simulation Mode
        # Determine the issue class based on file keywords
        confidence = round(random.uniform(0.85, 0.98), 2)
        if "pothole" in filename:
            issue_type = "Pothole"
        elif "light" in filename or "streetlight" in filename or "lamp" in filename:
            issue_type = "Street Light Fault"
        elif "drain" in filename or "overflow" in filename or "sewage" in filename:
            issue_type = "Drainage Overflow"
        elif "tree" in filename or "branch" in filename or "fallen" in filename:
            issue_type = "Fallen Tree"
        else:
            issue_type = random.choice(["Pothole", "Street Light Fault", "Drainage Overflow", "Fallen Tree"])
            confidence = round(random.uniform(0.72, 0.88), 2)
            
        # Set simulated bounding box coordinates based on actual image size
        try:
            with Image.open(image_path) as img:
                w, h = img.size
        except Exception:
            w, h = 640, 480
            
        x1 = int(w * random.uniform(0.15, 0.28))
        y1 = int(h * random.uniform(0.20, 0.35))
        x2 = int(w * random.uniform(0.70, 0.85))
        y2 = int(h * random.uniform(0.65, 0.80))
        xyxy = [x1, y1, x2, y2]
        
        annotated_img_path = await self._annotate_image(image_path, issue_type, confidence, xyxy)
        
        return {
            "detected": True,
            "issue": issue_type,
            "confidence": confidence,
            "box": xyxy,
            "annotatedImage": annotated_img_path,
            "mode": "Simulation AI"
        }

    def _map_to_standard_class(self, class_name: str) -> str:
        name_lower = class_name.lower()
        if "pothole" in name_lower or "hole" in name_lower:
            return "Pothole"
        elif "light" in name_lower or "lamp" in name_lower or "street_light" in name_lower:
            return "Street Light Fault"
        elif "drain" in name_lower or "overflow" in name_lower or "water" in name_lower:
            return "Drainage Overflow"
        elif "tree" in name_lower or "wood" in name_lower or "log" in name_lower:
            return "Fallen Tree"
        return class_name.title()

    async def _annotate_image(self, image_path: str, label: str, confidence: float, box: list) -> str:
        try:
            img = Image.open(image_path)
            draw = ImageDraw.Draw(img)
            
            # High-visibility colors matching status/class themes
            colors = {
                "Pothole": (255, 82, 82),         # Light Red
                "Street Light Fault": (255, 215, 0), # Amber
                "Drainage Overflow": (41, 182, 246), # Light Blue
                "Fallen Tree": (102, 187, 106)      # Soft Green
            }
            color = colors.get(label, (76, 175, 80)) # Default green
            
            x1, y1, x2, y2 = box
            # Draw thick bounding box
            for i in range(4):
                draw.rectangle([x1 - i, y1 - i, x2 + i, y2 + i], outline=color)
                
            text_str = f" {label} {int(confidence * 100)}% "
            
            # Try to get default system font
            try:
                font = ImageFont.load_default()
            except Exception:
                font = None
            
            # Draw label banner on top of bounding box
            draw.rectangle([x1 - 2, y1 - 20, x1 + 160, y1], fill=color)
            draw.text((x1 + 4, y1 - 18), text_str, fill=(255, 255, 255), font=font)
            
            # Save the annotated image to uploads
            dir_name = os.path.dirname(image_path)
            base_name = os.path.basename(image_path)
            annotated_filename = "annotated_" + base_name
            annotated_path = os.path.join(dir_name, annotated_filename)
            img.save(annotated_path)
            
            # Return relative path for static hosting
            return f"uploads/{annotated_filename}"
        except Exception as e:
            logger.error(f"Error annotating image {image_path}: {e}")
            return f"uploads/{os.path.basename(image_path)}"

ai_service = AIService()
