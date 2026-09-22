import os
import requests
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import tempfile

# Initialize Blueprint
voice_controller = Blueprint('voice_controller', __name__)
CORS(voice_controller)

load_dotenv()

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")

@voice_controller.route('/generate-voice', methods=['POST'])
def generate_voice():
    try:
        data = request.json or {}
        text = data.get('text')
        
        if not text:
            return jsonify({"error": "No text provided for voice generation."}), 400

        if not ELEVENLABS_API_KEY:
            return jsonify({"error": "ELEVENLABS_API_KEY is missing from environment."}), 500

        voice_id = data.get('voice_id', ELEVENLABS_VOICE_ID)
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }

        # Select model (eleven_multilingual_v2 is usually better for accents/languages)
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5,
                "style": 0.0,
                "use_speaker_boost": True
            }
        }

        print(f"[ELEVENLABS] Generating voice for text: {text[:50]}...")
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code != 200:
            print(f"[ELEVENLABS] Error: {response.status_code} - {response.text}")
            return jsonify({"error": f"ElevenLabs API error: {response.text}"}), response.status_code

        # Save audio content to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_file.write(response.content)
            temp_path = temp_file.name

        try:
            print(f"[ELEVENLABS] Uploading to Cloudinary...")
            # Upload to Cloudinary (resource_type="video" for audio files)
            upload_result = cloudinary.uploader.upload(
                temp_path,
                resource_type="video",
                folder="smartads/voiceovers",
                public_id=f"voiceover_{int(os.path.getctime(temp_path))}"
            )
            
            secure_url = upload_result.get("secure_url")
            print(f"[ELEVENLABS] Successfully uploaded: {secure_url}")

            return jsonify({
                "success": True,
                "audio_url": secure_url,
                "message": "Voiceover generated successfully."
            }), 200

        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        print(f"[ELEVENLABS] Exception: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
