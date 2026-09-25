import os
from dotenv import load_dotenv
import cloudinary
from services.design_service import DesignService

load_dotenv()

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET")
)

try:
    result = DesignService.generate_design({
        "type": "logo",
        "brandName": "Test",
        "prompt": "A cute cat"
    })
    print("SUCCESS!")
    print(result)
except Exception as e:
    import traceback
    traceback.print_exc()
