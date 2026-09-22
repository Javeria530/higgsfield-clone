"""
Social Media Controller - Routes for OAuth & content publishing
"""
from flask import Blueprint, request, jsonify, redirect
from services.social_media_service import SocialMediaService

social_media_controller = Blueprint("social_media_controller", __name__)
sms = SocialMediaService()

# The backend URL that platforms will redirect to after OAuth
BACKEND_BASE_URL = "http://localhost:5000"


@social_media_controller.route("/social-media/auth-url", methods=["POST"])
def get_auth_url():
    """Return the OAuth authorization URL for a given platform."""
    try:
        data = request.get_json()
        platform = data.get("platform")
        user_id = data.get("user_id", "")

        if not platform:
            return jsonify({"error": "platform is required"}), 400

        # Redirect URI points to the BACKEND, not the frontend
        redirect_uri = f"{BACKEND_BASE_URL}/api/social-media/oauth-redirect"
        state = f"{platform}:{user_id}"

        url = sms.get_auth_url(platform, redirect_uri, state=state)
        return jsonify({"success": True, "auth_url": url})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@social_media_controller.route("/social-media/oauth-redirect", methods=["GET"])
def oauth_redirect():
    """
    This is the OAuth redirect endpoint that platforms call back to.
    It exchanges the code for a token, stores it, then shows a success page
    that notifies the parent window and closes.
    """
    code = request.args.get("code")
    state = request.args.get("state", "")
    error = request.args.get("error")
    error_description = request.args.get("error_description", "")

    # Parse state: "platform:userId"
    parts = state.split(":", 1)
    platform = parts[0] if parts else "unknown"
    user_id = parts[1] if len(parts) > 1 else ""

    if error:
        return f"""
        <html><head><title>SmartAds - Error</title>
        <style>body{{font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0A0E27;color:#EF4444;text-align:center;}}</style>
        </head><body>
        <div><h2>❌ Connection Failed</h2><p>{error_description or error}</p>
        <p style="color:#888;font-size:0.9rem">You can close this window.</p></div>
        <script>setTimeout(function(){{window.close()}},3000)</script>
        </body></html>
        """

    if not code:
        return """
        <html><head><title>SmartAds - Error</title>
        <style>body{font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0A0E27;color:#EF4444;text-align:center;}</style>
        </head><body>
        <div><h2>❌ No authorization code received</h2>
        <p style="color:#888;font-size:0.9rem">You can close this window.</p></div>
        </body></html>
        """

    try:
        redirect_uri = f"{BACKEND_BASE_URL}/api/social-media/oauth-redirect"
        token_data = sms.exchange_code(platform, code, redirect_uri)
        sms.save_token(user_id, platform, token_data)

        # Return HTML that notifies the parent (opener) window and closes
        return f"""
        <html><head><title>SmartAds - Connected!</title>
        <style>body{{font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0A0E27;color:#10B981;text-align:center;}}</style>
        </head><body>
        <div><h2>✅ {platform.capitalize()} Connected!</h2>
        <p style="color:#B4C6FC">This window will close automatically...</p></div>
        <script>
        if(window.opener){{
            window.opener.postMessage({{
                type:'social-media-oauth-success',
                platform:'{platform}'
            }},'*');
        }}
        setTimeout(function(){{window.close()}},2000);
        </script>
        </body></html>
        """
    except Exception as e:
        return f"""
        <html><head><title>SmartAds - Error</title>
        <style>body{{font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0A0E27;color:#EF4444;text-align:center;}}</style>
        </head><body>
        <div><h2>❌ Connection Failed</h2><p>{str(e)}</p>
        <p style="color:#888;font-size:0.9rem">You can close this window.</p></div>
        <script>setTimeout(function(){{window.close()}},4000)</script>
        </body></html>
        """


@social_media_controller.route("/social-media/publish", methods=["POST"])
def publish_content():
    """Publish content (image or video) to a connected platform."""
    try:
        data = request.get_json()
        platform = data.get("platform")
        user_id = data.get("user_id")
        content_url = data.get("content_url")
        content_type = data.get("content_type", "image")  # "image" or "video"
        caption = data.get("caption", "")

        if not all([platform, user_id, content_url]):
            return jsonify({"error": "platform, user_id, and content_url are required"}), 400

        # Retrieve stored token
        token_doc = sms.get_token(user_id, platform)
        if not token_doc:
            return jsonify({"error": f"Not connected to {platform}. Please connect your account first."}), 401

        access_token = token_doc.get("access_token")
        result = sms.publish(platform, access_token, content_url, content_type, caption)

        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@social_media_controller.route("/social-media/status", methods=["GET"])
def connection_status():
    """Return which platforms a user has connected."""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id query param required"}), 400

        connections = sms.get_all_connections(user_id)
        platforms = {c["platform"]: {"connected": True, "connected_at": c.get("connected_at")} for c in connections}

        # Fill in unconnected platforms
        for p in ["linkedin", "facebook", "instagram"]:
            if p not in platforms:
                platforms[p] = {"connected": False}

        return jsonify({"success": True, "platforms": platforms})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@social_media_controller.route("/social-media/disconnect", methods=["POST"])
def disconnect_platform():
    """Remove a stored token for a platform."""
    try:
        data = request.get_json()
        platform = data.get("platform")
        user_id = data.get("user_id")

        if not platform or not user_id:
            return jsonify({"error": "platform and user_id are required"}), 400

        sms.remove_token(user_id, platform)
        return jsonify({"success": True, "message": f"Disconnected from {platform}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
