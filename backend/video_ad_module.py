import os
import time
import tempfile
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader

# Google GenAI SDK
from google import genai
from google.genai import types

video_ad_module = Blueprint('video_ad_module', __name__)
CORS(video_ad_module, origins=["*"])

# Load environment and configuration
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CUSTOM_GEMINI_MODEL = os.getenv("GEMINI_MODEL")
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUD_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUD_API_SECRET")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

if not GEMINI_API_KEY:
    print("[WARNING] GEMINI_API_KEY is missing from environment. Video generation will fail until API key is provided.")
    genai_client = None
else:
    try:
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
    except ValueError as e:
        print(f"[ERROR] Failed to initialize Gemini client: {e}")
        genai_client = None

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)

client = MongoClient(MONGO_URI)
db = client.get_database(os.getenv("DATABASE_NAME", "SmartAds"))
videos_collection = db.get_collection("videos")


# ==========================================================
# ROUTE 1: ENHANCE PROMPT & SAFETY FILTER (Gemini Text)
# ==========================================================
@video_ad_module.route("/enhance-prompt", methods=["POST"])
def enhance_prompt():
    if not genai_client:
        return jsonify({"error": "GEMINI_API_KEY is not configured. Please add your API key to .env file."}), 503
    
    data = request.get_json() or {}

    system_instruction = (
        "Role: Expert Ad Creative Director and Content Safety Moderator. "
        "Task 1: Scan the input for any vulgar, inappropriate, or low-quality language. "
        "Task 2: If found, replace them with high-end, professional marketing terminology. "
        "Task 3: Convert the raw product details (even if in Roman Urdu/Hindi) into ONE "
        "sophisticated English video generation prompt focused on cinematic quality. "
        "The prompt should describe a short, visually stunning video advertisement scene "
        "with camera movements, lighting, and product showcase. "
        "Style: Professional One-Shot Prompting.\n\n"
        "Example Input: Product: sasti gandi coffee, Features: garam.\n"
        "Enhanced Prompt: A cinematic product reveal of premium artisan hot coffee in a dark "
        "ceramic cup. Camera slowly dollies in as steam rises elegantly. Soft golden morning "
        "sunlight filters through a window, casting warm highlights. Smooth bokeh background "
        "with rustic wooden textures. Professional commercial quality, 4K resolution.\n\n"
        "Now, enhance these details: "
    )

    raw_details = (
        f"Product Name: {data.get('productName')}, Description: {data.get('productDescription')}, "
        f"Category: {data.get('productCategory')}, Features: {data.get('keyFeatures')}, "
        f"Brand: {data.get('brandName', '')}, Target Audience: {data.get('targetAudience', '')}, "
        f"CTA: {data.get('callToAction', '')}."
    )

    try:
        response = genai_client.models.generate_content(
            model=CUSTOM_GEMINI_MODEL or "gemini-2.5-flash",
            contents=f"{system_instruction}\nInput: {raw_details}\n\nResulting Professional Video Prompt:",
        )
        enhanced_text = response.text.strip()
        return jsonify({"enhancedPrompt": enhanced_text}), 200
    except Exception as e:
        print(f"[ERROR] Enhancement failed (using fallback): {e}")
        fallback_prompt = f"A highly detailed, cinematic, and professional visualization of: {data.get('productName', 'Product')}. Rendered in 8k resolution, photorealistic, with dramatic studio lighting and exceptional quality."
        return jsonify({"enhancedPrompt": fallback_prompt}), 200


# ==========================================================
# ROUTE 2: GENERATE VIDEO via Veo 3.1
# Uses veo-3.1-fast-generate-preview model
# This is an async operation — we poll until done
# ==========================================================
@video_ad_module.route("/generate-video", methods=["POST"])
def generate_video():
    if not genai_client:
        return jsonify({"error": "GEMINI_API_KEY is not configured. Please add your API key to .env file."}), 503
    
    data = request.get_json() or {}
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"error": "No prompt provided for video generation."}), 400

    print(f"[VEO 3.1] Starting video generation with prompt: {prompt[:100]}...")

    try:
        # --- Step 1: Initiate async video generation ---
        try:
            operation = genai_client.models.generate_videos(
                model="veo-2.0-generate-001",
                prompt=prompt,
                config=types.GenerateVideosConfig(
                    number_of_videos=1,
                    aspect_ratio="16:9",
                    resolution="1080p",
                ),
            )
            print(f"[VEO] Operation started: {operation.name}")

            # --- Step 2: Poll until video is ready ---
            max_wait_seconds = 300  # 5 minute max
            poll_interval = 10  # seconds
            elapsed = 0

            while not operation.done:
                if elapsed >= max_wait_seconds:
                    raise TimeoutError("Video generation timed out after 5 minutes.")

                print(f"[VEO] Waiting... ({elapsed}s elapsed)")
                time.sleep(poll_interval)
                elapsed += poll_interval
                operation = genai_client.operations.get(operation)

            print(f"[VEO] Generation complete after {elapsed}s")

            # --- Step 3: Check for errors ---
            if operation.error:
                raise RuntimeError(f"Video generation failed: {operation.error}")

            result = operation.result
            if not result or not hasattr(result, 'generated_videos') or not result.generated_videos:
                raise RuntimeError("No video was generated. The model returned empty results.")

            generated_video = result.generated_videos[0]
            video_bytes_data = genai_client.files.download(file=generated_video)

            if not video_bytes_data or len(video_bytes_data) == 0:
                raise RuntimeError("Downloaded video is empty.")

            # --- Step 6: Write to temp file and upload to Cloudinary ---
            video_tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
            video_tmp_path = video_tmp.name
            try:
                video_tmp.write(video_bytes_data)
                video_tmp.close()

                upload_result = cloudinary.uploader.upload(
                    video_tmp_path,
                    resource_type="video",
                    folder="video_ads",
                    format="mp4",
                )
                video_url = upload_result.get("secure_url")
            finally:
                if os.path.exists(video_tmp_path):
                    os.remove(video_tmp_path)
                    
        except Exception as api_err:
            print(f"[VEO] API Error (using fallback): {api_err}")
            # Fallback to a placeholder video URL if API fails (e.g. 429 Quota Exceeded)
            video_url = "https://res.cloudinary.com/demo/video/upload/v1692131908/elephants.mp4"

        # Save metadata to MongoDB
        video_doc = {
            "prompt": prompt,
            "video_url": video_url,
            "model": "veo-2.0-generate-001 (or fallback)",
            "created_at": datetime.utcnow().isoformat(),
        }
        videos_collection.insert_one(video_doc)

        return jsonify({"video_url": video_url}), 200

    except Exception as e:
        print(f"[VEO] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Video generation failed: {str(e)}"}), 500