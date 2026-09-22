"""
Template Service - Business logic for template operations with Cloudinary uploads
"""
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument
import cloudinary
import cloudinary.uploader
import requests
import tempfile
import os

from config.settings import CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET
from config.database import db


class TemplateService:
    """Service class for template CRUD + Cloudinary media upload"""

    @staticmethod
    def configure_cloudinary():
        """Configure Cloudinary client"""
        cloudinary.config(
            cloud_name=CLOUD_NAME,
            api_key=CLOUD_API_KEY,
            api_secret=CLOUD_API_SECRET
        )

    @staticmethod
    def upload_media(file, media_type: str) -> str:
        """Upload a video or image file to Cloudinary and return the secure URL."""
        TemplateService.configure_cloudinary()

        resource = "video" if media_type == "video" else "image"
        try:
            result = cloudinary.uploader.upload(
                file,
                folder="smartads/templates",
                resource_type=resource,
                # Allow large video uploads (up to 100 MB via unsigned)
                chunk_size=6_000_000,
            )
            return result["secure_url"]
        except Exception as e:
            print("Cloudinary upload error:", e)
            raise ValueError(f"Failed to upload media: {str(e)}")

    # ------------------------------------------------------------------ CRUD

    @staticmethod
    def create_template(data: dict) -> dict:
        """Insert a new template document into MongoDB."""
        template = {
            "name": data.get("name", ""),
            "category": data.get("category", "promotional"),
            "mediaType": data.get("mediaType", "video"),
            "brandTone": data.get("brandTone", "professional"),
            "status": data.get("status", "approved"),
            "description": data.get("description", ""),
            "previewUrl": data.get("previewUrl", ""),
            "prompt": data.get("prompt", ""),
            "duration": data.get("duration", 12),
            "audioTracks": data.get("audioTracks", []),
            "caption": data.get("caption", ""),
            "animationStyle": data.get("animationStyle", "Cinematic Flow"),
            "createdBy": data.get("createdBy"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        result = db.templates.insert_one(template)
        template["id"] = str(result.inserted_id)
        template["_id"] = result.inserted_id
        return TemplateService._serialize(template)

    @staticmethod
    def get_all_templates() -> list:
        """Return every template in the collection."""
        docs = list(db.templates.find().sort("createdAt", -1))
        return [TemplateService._serialize(d) for d in docs]

    @staticmethod
    def get_template_by_id(template_id: str) -> dict | None:
        """Return a single template by its _id."""
        try:
            doc = db.templates.find_one({"_id": ObjectId(template_id)})
        except Exception:
            return None
        return TemplateService._serialize(doc) if doc else None

    @staticmethod
    def update_template(template_id: str, data: dict) -> dict | None:
        """Update mutable fields of a template."""
        updates = {}
        allowed = [
            "name", "category", "mediaType", "brandTone", "status",
            "description", "previewUrl", "prompt", "duration",
            "audioTracks", "caption", "animationStyle",
        ]
        for key in allowed:
            if key in data:
                updates[key] = data[key]

        if not updates:
            return TemplateService.get_template_by_id(template_id)

        updates["updatedAt"] = datetime.utcnow()

        try:
            result = db.templates.find_one_and_update(
                {"_id": ObjectId(template_id)},
                {"$set": updates},
                return_document=ReturnDocument.AFTER,
            )
        except Exception:
            return None
        return TemplateService._serialize(result) if result else None

    @staticmethod
    def delete_template(template_id: str) -> bool:
        """Delete a template. Returns True on success."""
        try:
            result = db.templates.delete_one({"_id": ObjectId(template_id)})
        except Exception:
            return False
        return result.deleted_count > 0

    # --------------------------------------------------------- migration

    @staticmethod
    def migrate_media_to_cloudinary() -> list:
        """
        Iterate every template in the DB. If the previewUrl is NOT already
        a Cloudinary URL, download the file and re-upload it to Cloudinary,
        then update the document with the new secure URL.
        Returns a list of {id, name, old_url, new_url, status} results.
        """
        TemplateService.configure_cloudinary()
        results = []

        templates = list(db.templates.find())
        for doc in templates:
            preview = doc.get("previewUrl", "")
            tid = str(doc["_id"])
            name = doc.get("name", "")

            # Skip if already on Cloudinary or empty
            if not preview or "res.cloudinary.com" in preview:
                results.append({"id": tid, "name": name, "status": "skipped",
                                "reason": "already on Cloudinary or empty"})
                continue

            media_type = doc.get("mediaType", "image")
            resource = "video" if media_type == "video" else "image"

            try:
                # Download the external file
                resp = requests.get(preview, stream=True, timeout=120)
                resp.raise_for_status()

                # Determine extension from content-type
                ct = resp.headers.get("Content-Type", "")
                if "mp4" in ct or resource == "video":
                    ext = ".mp4"
                elif "png" in ct:
                    ext = ".png"
                elif "webp" in ct:
                    ext = ".webp"
                else:
                    ext = ".jpg"

                # Write to a temp file
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
                for chunk in resp.iter_content(chunk_size=1_048_576):
                    tmp.write(chunk)
                tmp.close()

                # Upload to Cloudinary
                result = cloudinary.uploader.upload(
                    tmp.name,
                    folder="smartads/templates",
                    resource_type=resource,
                    chunk_size=6_000_000,
                )
                new_url = result["secure_url"]

                # Clean up temp file
                os.unlink(tmp.name)

                # Update MongoDB
                db.templates.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"previewUrl": new_url, "updatedAt": datetime.utcnow()}},
                )

                results.append({"id": tid, "name": name, "status": "migrated",
                                "old_url": preview, "new_url": new_url})
                print(f"  ✅ Migrated: {name}")

            except Exception as e:
                results.append({"id": tid, "name": name, "status": "error",
                                "error": str(e)})
                print(f"  ❌ Failed: {name} — {e}")

        return results

    # ---------------------------------------------------------------- helper

    @staticmethod
    def _serialize(doc: dict) -> dict:
        """Convert a Mongo document to a JSON-friendly dict."""
        return {
            "id": str(doc["_id"]),
            "name": doc.get("name", ""),
            "category": doc.get("category", ""),
            "mediaType": doc.get("mediaType", ""),
            "brandTone": doc.get("brandTone", ""),
            "status": doc.get("status", ""),
            "description": doc.get("description", ""),
            "previewUrl": doc.get("previewUrl", ""),
            "prompt": doc.get("prompt", ""),
            "duration": doc.get("duration", 12),
            "audioTracks": doc.get("audioTracks", []),
            "caption": doc.get("caption", ""),
            "animationStyle": doc.get("animationStyle", ""),
            "createdBy": doc.get("createdBy"),
            "lastUpdated": (
                doc["updatedAt"].strftime("%m/%d/%Y")
                if doc.get("updatedAt")
                else (doc["createdAt"].strftime("%m/%d/%Y") if doc.get("createdAt") else "")
            ),
            "createdAt": doc["createdAt"].isoformat() if doc.get("createdAt") else None,
        }
