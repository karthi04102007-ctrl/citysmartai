import sys
import os
import asyncio

# Add backend directory to path so we can import services
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.ai_service import ai_service

async def main():
    if len(sys.argv) < 2:
        print("Usage: python inference.py <path_to_image>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"Error: Image file '{image_path}' not found.")
        sys.exit(1)
        
    print(f"Analyzing image: {image_path}...")
    result = await ai_service.detect_issue(image_path)
    
    print("\n==================================")
    print("      AI Inference Output         ")
    print("==================================")
    print(f"Class Detected:  {result['issue']}")
    print(f"Confidence:      {result['confidence']}")
    print(f"Bounding Box:    {result['box']}")
    print(f"Annotated File:  {result['annotatedImage']}")
    print(f"Execution Mode:  {result['mode']}")
    print("==================================")

if __name__ == "__main__":
    asyncio.run(main())
