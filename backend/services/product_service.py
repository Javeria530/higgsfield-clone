"""
Product Service - Business logic for product operations
"""
import json
from datetime import datetime
import cloudinary
import cloudinary.uploader

from config.settings import CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET
from config.database import db


class ProductService:
    """Service class for product operations"""
    
    @staticmethod
    def configure_cloudinary():
        """Configure Cloudinary client"""
        cloudinary.config(
            cloud_name=CLOUD_NAME,
            api_key=CLOUD_API_KEY,
            api_secret=CLOUD_API_SECRET
        )
    
    @staticmethod
    def upload_images(files: list) -> list:
        """Upload images to Cloudinary"""
        ProductService.configure_cloudinary()
        
        cloud_urls = []
        for file in files:
            try:
                upload_result = cloudinary.uploader.upload(
                    file,
                    folder="smartads/references",
                    resource_type="image"
                )
                cloud_urls.append(upload_result["secure_url"])
            except Exception as e:
                print("Cloudinary upload error:", e)
                raise ValueError(f"Failed to upload image: {str(e)}")
        
        return cloud_urls
    
    @staticmethod
    def create_product(data: dict, image_files: list = None) -> dict:
        """Create a new product"""
        ProductService.configure_cloudinary()
        
        # Upload images if provided
        cloud_urls = []
        if image_files:
            for file in image_files:
                try:
                    upload_result = cloudinary.uploader.upload(file)
                    cloud_urls.append(upload_result["secure_url"])
                except Exception as e:
                    print("Cloudinary upload error:", e)
        
        # Parse adTypes
        ad_types_raw = data.get("adTypes")
        try:
            ad_types = json.loads(ad_types_raw) if isinstance(ad_types_raw, str) else ad_types_raw or []
        except:
            ad_types = []
        
        product = {
            "name": data.get("name"),
            "description": data.get("description"),
            "price": data.get("price"),
            "adTypes": ad_types,
            "captionType": data.get("captionType"),
            "referenceImages": cloud_urls,
            "createdAt": datetime.utcnow()
        }
        
        result = db.products.insert_one(product)
        
        return {
            "id": str(result.inserted_id),
            "message": "Product saved successfully"
        }
    
    @staticmethod
    def get_products(limit: int = 50) -> list:
        """Get all products"""
        products = []
        for doc in db.products.find().sort("createdAt", -1).limit(limit):
            doc["_id"] = str(doc["_id"])
            products.append(doc)
        return products
    
    @staticmethod
    def create_product_with_design(data: dict, cloud_url: str, public_id: str, file_name: str) -> dict:
        """Create product with generated design"""
        product_doc = {
            "name": data.get("brandName"),
            "description": data.get("tagline") or data.get("description"),
            "price": data.get("price"),
            "adTypes": [data.get("type")],
            "captionType": data.get("captionType"),
            "referenceImages": data.get("referenceImages", []),
            "generatedDesigns": [{
                "type": data.get("type"),
                "cloudinaryUrl": cloud_url,
                "publicId": public_id,
                "fileName": file_name,
                "createdAt": datetime.utcnow(),
            }],
            "createdAt": datetime.utcnow(),
        }
        
        result = db.products.insert_one(product_doc)
        return {"id": str(result.inserted_id)}
