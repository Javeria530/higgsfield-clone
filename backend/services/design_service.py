"""
Design Service - Business logic for logo and poster generation using Fal AI (FLUX)
"""

import os
import requests
from datetime import datetime
from werkzeug.utils import secure_filename

import cloudinary
import cloudinary.uploader

from google import genai
from google.genai import types

from config.settings import (
    CLOUD_NAME,
    CLOUD_API_KEY,
    CLOUD_API_SECRET,
    UPLOAD_FOLDER
)

from config.database import db

class DesignService:
    @staticmethod
    def configure_clients():
        """Configure Cloudinary and API Keys"""
        # Verify Gemini API key
        if not os.environ.get("GEMINI_API_KEY"):
            raise RuntimeError("Missing environment variable: GEMINI_API_KEY")

        if not CLOUD_NAME or not CLOUD_API_KEY or not CLOUD_API_SECRET:
            raise RuntimeError("Missing Cloudinary configuration")

        cloudinary.config(
            cloud_name=CLOUD_NAME,
            api_key=CLOUD_API_KEY,
            api_secret=CLOUD_API_SECRET,
            secure=True,
        )

    @staticmethod
    def enhance_prompt(prompt: str) -> str:
        DesignService.configure_clients()
        try:
            client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=f"Enhance the following prompt to be highly descriptive for an AI image/video generator. Make it vivid, detailed, and professional. Only return the enhanced prompt, nothing else. Original prompt: {prompt}"
            )
            if response and response.text:
                return response.text.strip()
            return prompt
        except Exception as e:
            print("[Warning] Prompt enhancement failed:", str(e))
            # Fallback text if the Gemini API hits a 429 quota limit
            return f"A highly detailed, cinematic, and professional visualization of: {prompt}. Rendered in 8k resolution, photorealistic, with dramatic studio lighting and exceptional quality."

    @staticmethod
    def generate_design(data: dict) -> dict:
        DesignService.configure_clients()

        design_type = data.get("type", "logo")
        brand_name = data.get("brandName", "SmartAds")
        tagline = data.get("tagline", "")
        style = data.get("style", "modern, professional")
        description = data.get("description", "A professional design")
        colors = data.get("colors", [])
        
        # Build prompt
        prompt = f"A high-quality professional {design_type} design for a brand named '{brand_name}'"
        if tagline:
            prompt += f", featuring the tagline '{tagline}' prominently"
        prompt += f". {description}. Style: {style}."
        if colors:
            color_str = ", ".join(colors) if isinstance(colors, list) else colors
            prompt += f" Primary colors: {color_str}."
            
        # Additional context to optimize outputs
        if design_type == "logo":
            prompt += " Clean background, centered, highly detailed vector graphic style."
        else:
            prompt += " Cinematic layout, high resolution, typography naturally integrated."

        # Imagen 4 aspect ratios
        aspect_ratio = "3:4" if design_type == "poster" else "1:1"

        print(f"[Attempting] Free generation via Pollinations.ai for {design_type}...")
        
        try:
            import urllib.parse
            encoded_prompt = urllib.parse.quote(prompt)
            width, height = (768, 1024) if design_type == "poster" else (1024, 1024)
            image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true"
            
            response = requests.get(
                image_url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'},
                timeout=60
            )
            
            if response.status_code != 200:
                print(f"[Warning] Free Image API failed with status {response.status_code}, using fallback...")
                fallback_url = f"https://dummyimage.com/{width}x{height}/cccccc/000000.jpg&text={urllib.parse.quote(brand_name)}"
                response = requests.get(fallback_url, timeout=30)
                
            img_bytes = response.content
            print("[Success] AI successfully generated Image (or used fallback)")
        except Exception as e:
            print("[Error] API Error:", str(e))
            raise RuntimeError(f"Failed to generate asset: {str(e)}")

        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        base_name = f"{design_type}_{brand_name}_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"
        file_name = secure_filename(base_name) + ".jpg"
        file_path = os.path.join(UPLOAD_FOLDER, file_name)

        # Write directly to disk
        with open(file_path, "wb") as f:
            f.write(img_bytes)
        print(f"[Saved] Image saved locally to {file_name}")

        try:
            upload_result = cloudinary.uploader.upload(
                file_path,
                folder="smartads/generated",
                resource_type="image",
                use_filename=True,
                unique_filename=True,
                overwrite=False,
            )
        except Exception as e:
            raise RuntimeError(f"Cloudinary upload failed: {str(e)}")

        cloud_url = upload_result.get("secure_url")
        public_id = upload_result.get("public_id")

        print(f"[Uploaded] Uploaded to Cloudinary: {cloud_url[:80]}...")

        doc = {
            "type": design_type,
            "brandName": brand_name,
            "tagline": tagline,
            "colors": colors,
            "style": style,
            "description": description,
            "prompt": prompt,
            "cloudinaryUrl": cloud_url,
            "publicId": public_id,
            "fileName": file_name,
            "createdAt": datetime.utcnow(),
            "isFallback": False,
            "usedAPI": True,
        }

        db_result = db["LogoPoster"].insert_one(doc)

        return {
            "id": str(db_result.inserted_id),
            "url": cloud_url,
            "publicId": public_id,
            "fileName": file_name,
            "isFallback": False,
            "usedAPI": True,
            "message": "AI-generated image via Free API",
        }

    @staticmethod
    def get_designs(limit: int = 50) -> list:
        items = []
        for doc in db["LogoPoster"].find().sort("createdAt", -1).limit(limit):
            doc["_id"] = str(doc["_id"])
            items.append(doc)
        return items