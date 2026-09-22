"""
Template Controller - REST endpoints for template CRUD and media upload
"""
from flask import Blueprint, request, jsonify
from services.template_service import TemplateService

template_controller = Blueprint("template_controller", __name__)


# ---------------------------------------------------------------------- CRUD

@template_controller.route("/templates", methods=["GET"])
def list_templates():
    """Return all templates."""
    try:
        templates = TemplateService.get_all_templates()
        return jsonify({"success": True, "templates": templates}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@template_controller.route("/templates", methods=["POST"])
def create_template():
    """Create a new template (JSON body, no file)."""
    try:
        data = request.get_json(force=True)
        template = TemplateService.create_template(data)
        return jsonify({"success": True, "template": template}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@template_controller.route("/templates/<template_id>", methods=["GET"])
def get_template(template_id):
    """Return a single template."""
    try:
        template = TemplateService.get_template_by_id(template_id)
        if not template:
            return jsonify({"success": False, "error": "Template not found"}), 404
        return jsonify({"success": True, "template": template}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@template_controller.route("/templates/<template_id>", methods=["PUT"])
def update_template(template_id):
    """Update an existing template."""
    try:
        data = request.get_json(force=True)
        template = TemplateService.update_template(template_id, data)
        if not template:
            return jsonify({"success": False, "error": "Template not found"}), 404
        return jsonify({"success": True, "template": template}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@template_controller.route("/templates/<template_id>", methods=["DELETE"])
def delete_template(template_id):
    """Delete a template."""
    try:
        deleted = TemplateService.delete_template(template_id)
        if not deleted:
            return jsonify({"success": False, "error": "Template not found"}), 404
        return jsonify({"success": True, "message": "Template deleted"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# --------------------------------------------------------- media upload

@template_controller.route("/templates/upload-media", methods=["POST"])
def upload_template_media():
    """
    Upload a video or poster file to Cloudinary.
    Expects multipart form with:
      - file        : the media file
      - mediaType   : 'video' | 'poster' | 'image' (optional, auto-detected)
    Returns { success, url }.
    """
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"success": False, "error": "Empty filename"}), 400

        # Determine resource type
        media_type = request.form.get("mediaType", "").lower()
        if not media_type:
            # Auto-detect from MIME
            mime = file.content_type or ""
            media_type = "video" if mime.startswith("video") else "image"

        url = TemplateService.upload_media(file, media_type)
        return jsonify({"success": True, "url": url}), 200
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------------------------------------ migrate media

@template_controller.route("/templates/migrate-media", methods=["POST"])
def migrate_media():
    """
    Download every template's external previewUrl and re-upload
    the file to Cloudinary, then update the DB record.
    Skips templates whose URL is already on Cloudinary.
    """
    try:
        results = TemplateService.migrate_media_to_cloudinary()
        migrated = sum(1 for r in results if r["status"] == "migrated")
        skipped  = sum(1 for r in results if r["status"] == "skipped")
        errors   = sum(1 for r in results if r["status"] == "error")
        return jsonify({
            "success": True,
            "migrated": migrated,
            "skipped": skipped,
            "errors": errors,
            "details": results,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# --------------------------------------------------------- seed defaults

@template_controller.route("/templates/seed", methods=["POST"])
def seed_templates():
    """
    Seed the database with the default demo templates
    (only if the collection is empty).
    """
    try:
        existing = TemplateService.get_all_templates()
        if existing:
            return jsonify({"success": True, "message": "Templates already exist", "count": len(existing)}), 200

        defaults = _default_templates()
        created = []
        for t in defaults:
            created.append(TemplateService.create_template(t))

        return jsonify({"success": True, "message": f"Seeded {len(created)} templates", "templates": created}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def _default_templates():
    """Return the hardcoded demo templates used for seeding."""
    return [
        {
            "name": "Lunar Prosperity Red",
            "category": "seasonal",
            "mediaType": "video",
            "brandTone": "bold",
            "status": "approved",
            "description": "Vibrant red and gold Lunar New Year celebration with dragon motifs.",
            "previewUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            "prompt": "Explosion of red and gold silk, floating Chinese lanterns, 3D dragon silhouette in background, high-key warm lighting.",
            "duration": 15,
            "audioTracks": ["energetic"],
            "caption": "PROSPERITY AWAITS",
            "animationStyle": "Cinematic Flow",
        },
        {
            "name": "Zen Tea Ritual",
            "category": "brand_awareness",
            "mediaType": "video",
            "brandTone": "elegant",
            "status": "approved",
            "description": "Minimalist Japanese matcha tea ceremony for high-end lifestyle brands.",
            "previewUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "prompt": "Vibrant green matcha being whisked in a stone bowl, soft morning sunlight through shoji screens, steam rising slowly.",
            "duration": 10,
            "audioTracks": ["nature"],
            "caption": "FIND YOUR ZEN",
            "animationStyle": "Macro Focus",
        },
        {
            "name": "Diwali Radiant Glow",
            "category": "event_based",
            "mediaType": "video",
            "brandTone": "dynamic",
            "status": "approved",
            "description": "Celebratory festival of lights with vibrant purple and marigold tones.",
            "previewUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "prompt": "Floating diyas and flower petals in a pool of water, vibrant purple and orange silk backdrops, sparkling light particles.",
            "duration": 12,
            "audioTracks": ["cinematic"],
            "caption": "LIGHT THE PATH",
            "animationStyle": "Floating Particles",
        },
        {
            "name": "Mid-Autumn Mooncakes",
            "category": "seasonal",
            "mediaType": "video",
            "brandTone": "elegant",
            "status": "approved",
            "description": "Elegant mooncake presentation under a full golden moon.",
            "previewUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            "prompt": "Macro shot of traditional mooncakes, golden crust, wooden tray, massive glowing full moon in background, cinematic warm atmosphere.",
            "duration": 14,
            "audioTracks": ["nature"],
            "caption": "REUNION UNDER THE MOON",
            "animationStyle": "Slow Pan",
        },
        {
            "name": "Holi Festival of Colors",
            "category": "event_based",
            "mediaType": "poster",
            "brandTone": "dynamic",
            "status": "approved",
            "description": "Explosive burst of colors for Holi celebration campaigns.",
            "previewUrl": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800",
            "prompt": "Rainbow powder explosion mid-air against a sun-lit blue sky, figures celebrating, slow-motion capture, vibrant saturation.",
            "duration": 0,
            "audioTracks": [],
            "caption": "COLOR YOUR WORLD",
            "animationStyle": "Freeze Frame",
        },
        {
            "name": "Sakura Dream",
            "category": "brand_awareness",
            "mediaType": "video",
            "brandTone": "elegant",
            "status": "approved",
            "description": "Tranquil cherry blossom scene for premium Spring collections.",
            "previewUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
            "prompt": "Slow-motion cherry blossom petals drifting through a Japanese garden, soft pink palette, minimalist product placement area.",
            "duration": 10,
            "audioTracks": ["ambient"],
            "caption": "BLOOM WITH US",
            "animationStyle": "Petal Drift",
        },
        {
            "name": "Ramadan Crescent",
            "category": "seasonal",
            "mediaType": "poster",
            "brandTone": "professional",
            "status": "approved",
            "description": "Elegant crescent moon and lantern scene for Ramadan branding.",
            "previewUrl": "https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=800",
            "prompt": "Golden crescent moon, ornate hanging lanterns, deep midnight blue backdrop, bokeh light particles, arabesque patterns.",
            "duration": 0,
            "audioTracks": [],
            "caption": "BLESSINGS OF THE CRESCENT",
            "animationStyle": "Static Glow",
        },
        {
            "name": "Thai Songkran Splash",
            "category": "event_based",
            "mediaType": "poster",
            "brandTone": "bold",
            "status": "approved",
            "description": "Vibrant water festival poster for Thai New Year campaigns.",
            "previewUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800",
            "prompt": "Dynamic water splash frozen in mid-air, golden temple silhouette, tropical flowers, vivid turquoise and gold palette.",
            "duration": 0,
            "audioTracks": [],
            "caption": "SPLASH INTO JOY",
            "animationStyle": "Liquid Freeze",
        },
    ]
