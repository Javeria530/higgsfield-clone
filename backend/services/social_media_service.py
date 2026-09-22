"""
Social Media Service - OAuth + Publishing for LinkedIn, Facebook, Instagram
"""
import os
import requests
from datetime import datetime
from config.database import get_db


# ──────────────────────────────────────────────
#  LinkedIn Service
# ──────────────────────────────────────────────
class LinkedInService:
    AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
    TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
    USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
    SHARE_URL = "https://api.linkedin.com/v2/ugcPosts"
    UPLOAD_URL = "https://api.linkedin.com/v2/assets?action=registerUpload"

    SCOPES = "openid profile email w_member_social"

    def __init__(self):
        self.client_id = os.getenv("LINKEDIN_CLIENT_ID", "")
        self.client_secret = os.getenv("LINKEDIN_CLIENT_SECRET", "")

    def get_auth_url(self, redirect_uri, state=""):
        return (
            f"{self.AUTH_URL}?response_type=code"
            f"&client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={self.SCOPES}"
            f"&state={state}"
        )

    def exchange_code(self, code, redirect_uri):
        resp = requests.post(self.TOKEN_URL, data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        })
        resp.raise_for_status()
        return resp.json()

    def get_user_info(self, access_token):
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.get(self.USERINFO_URL, headers=headers)
        resp.raise_for_status()
        return resp.json()

    def publish_image(self, access_token, image_url, caption=""):
        """Publish an image post to LinkedIn using UGC Post API."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }
        # Get user URN
        user_info = self.get_user_info(access_token)
        person_urn = f"urn:li:person:{user_info['sub']}"

        # Step 1: Register image upload
        register_body = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": person_urn,
                "serviceRelationships": [
                    {"relationshipType": "OWNER", "identifier": "urn:li:userGeneratedContent"}
                ],
            }
        }
        reg_resp = requests.post(self.UPLOAD_URL, json=register_body, headers=headers)
        reg_resp.raise_for_status()
        reg_data = reg_resp.json()

        upload_url = reg_data["value"]["uploadMechanism"][
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ]["uploadUrl"]
        asset = reg_data["value"]["asset"]

        # Step 2: Upload the image binary
        img_data = requests.get(image_url).content
        up_resp = requests.put(upload_url, data=img_data, headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "image/png",
        })
        up_resp.raise_for_status()

        # Step 3: Create the UGC post
        post_body = {
            "author": person_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": caption},
                    "shareMediaCategory": "IMAGE",
                    "media": [
                        {
                            "status": "READY",
                            "media": asset,
                            "description": {"text": caption},
                        }
                    ],
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        post_resp = requests.post(self.SHARE_URL, json=post_body, headers=headers)
        post_resp.raise_for_status()
        return {"success": True, "platform": "linkedin", "response": post_resp.json()}

    def publish_video(self, access_token, video_url, caption=""):
        """Publish a video post to LinkedIn — same flow but with video recipe."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }
        user_info = self.get_user_info(access_token)
        person_urn = f"urn:li:person:{user_info['sub']}"

        register_body = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-video"],
                "owner": person_urn,
                "serviceRelationships": [
                    {"relationshipType": "OWNER", "identifier": "urn:li:userGeneratedContent"}
                ],
            }
        }
        reg_resp = requests.post(self.UPLOAD_URL, json=register_body, headers=headers)
        reg_resp.raise_for_status()
        reg_data = reg_resp.json()

        upload_url = reg_data["value"]["uploadMechanism"][
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ]["uploadUrl"]
        asset = reg_data["value"]["asset"]

        vid_data = requests.get(video_url).content
        up_resp = requests.put(upload_url, data=vid_data, headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "video/mp4",
        })
        up_resp.raise_for_status()

        post_body = {
            "author": person_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": caption},
                    "shareMediaCategory": "VIDEO",
                    "media": [
                        {"status": "READY", "media": asset, "description": {"text": caption}}
                    ],
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        post_resp = requests.post(self.SHARE_URL, json=post_body, headers=headers)
        post_resp.raise_for_status()
        return {"success": True, "platform": "linkedin", "response": post_resp.json()}


# ──────────────────────────────────────────────
#  Facebook Service
# ──────────────────────────────────────────────
class FacebookService:
    AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth"
    TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
    GRAPH_URL = "https://graph.facebook.com/v19.0"

    SCOPES = "pages_show_list,pages_manage_posts,pages_read_engagement"

    def __init__(self):
        self.client_id = os.getenv("FACEBOOK_APP_ID", "")
        self.client_secret = os.getenv("FACEBOOK_APP_SECRET", "")

    def get_auth_url(self, redirect_uri, state=""):
        return (
            f"{self.AUTH_URL}?response_type=code"
            f"&client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={self.SCOPES}"
            f"&state={state}"
        )

    def exchange_code(self, code, redirect_uri):
        resp = requests.get(self.TOKEN_URL, params={
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": redirect_uri,
            "code": code,
        })
        resp.raise_for_status()
        return resp.json()

    def _get_page_token(self, user_access_token):
        """Get the first page's access token for publishing. Returns None if no pages."""
        try:
            resp = requests.get(f"{self.GRAPH_URL}/me/accounts", params={
                "access_token": user_access_token,
            })
            resp.raise_for_status()
            pages = resp.json().get("data", [])
            if pages:
                return pages[0]["id"], pages[0]["access_token"]
        except Exception:
            pass
        return None, None

    def publish_image(self, access_token, image_url, caption=""):
        page_id, page_token = self._get_page_token(access_token)
        if page_id and page_token:
            # Publish to Facebook Page
            resp = requests.post(f"{self.GRAPH_URL}/{page_id}/photos", data={
                "url": image_url,
                "message": caption,
                "access_token": page_token,
            })
            resp.raise_for_status()
            return {"success": True, "platform": "facebook", "response": resp.json()}
        else:
            # No Page found — return share URL for frontend to open
            from urllib.parse import quote
            share_url = f"https://www.facebook.com/sharer/sharer.php?u={quote(image_url)}&quote={quote(caption)}"
            return {"success": True, "platform": "facebook", "share_url": share_url,
                    "message": "Opening Facebook share dialog..."}

    def publish_video(self, access_token, video_url, caption=""):
        page_id, page_token = self._get_page_token(access_token)
        if page_id and page_token:
            resp = requests.post(f"{self.GRAPH_URL}/{page_id}/videos", data={
                "file_url": video_url,
                "description": caption,
                "access_token": page_token,
            })
            resp.raise_for_status()
            return {"success": True, "platform": "facebook", "response": resp.json()}
        else:
            from urllib.parse import quote
            share_url = f"https://www.facebook.com/sharer/sharer.php?u={quote(video_url)}&quote={quote(caption)}"
            return {"success": True, "platform": "facebook", "share_url": share_url,
                    "message": "Opening Facebook share dialog..."}


# ──────────────────────────────────────────────
#  Instagram Service (via Facebook Graph API)
# ──────────────────────────────────────────────
class InstagramService:
    AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth"
    TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
    GRAPH_URL = "https://graph.facebook.com/v19.0"

    SCOPES = "pages_show_list,pages_read_engagement,pages_manage_posts,business_management"

    def __init__(self):
        self.client_id = os.getenv("FACEBOOK_APP_ID", "")
        self.client_secret = os.getenv("FACEBOOK_APP_SECRET", "")

    def get_auth_url(self, redirect_uri, state=""):
        return (
            f"{self.AUTH_URL}?response_type=code"
            f"&client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={self.SCOPES}"
            f"&state={state}"
        )

    def exchange_code(self, code, redirect_uri):
        resp = requests.get(self.TOKEN_URL, params={
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": redirect_uri,
            "code": code,
        })
        resp.raise_for_status()
        return resp.json()

    def _get_ig_user_id(self, user_access_token):
        """Get the Instagram Business account ID linked to Facebook page."""
        pages_resp = requests.get(f"{self.GRAPH_URL}/me/accounts", params={
            "access_token": user_access_token,
        })
        pages_resp.raise_for_status()
        pages = pages_resp.json().get("data", [])
        if not pages:
            raise Exception("No Facebook Pages found. Link an Instagram Business account to a Page.")

        page_id = pages[0]["id"]
        page_token = pages[0]["access_token"]

        ig_resp = requests.get(f"{self.GRAPH_URL}/{page_id}", params={
            "fields": "instagram_business_account",
            "access_token": page_token,
        })
        ig_resp.raise_for_status()
        ig_data = ig_resp.json()
        ig_account = ig_data.get("instagram_business_account")
        if not ig_account:
            raise Exception("No Instagram Business account linked to this Page.")
        return ig_account["id"], page_token

    def publish_image(self, access_token, image_url, caption=""):
        ig_user_id, page_token = self._get_ig_user_id(access_token)

        # Step 1: Create media container
        container_resp = requests.post(f"{self.GRAPH_URL}/{ig_user_id}/media", data={
            "image_url": image_url,
            "caption": caption,
            "access_token": page_token,
        })
        container_resp.raise_for_status()
        container_id = container_resp.json()["id"]

        # Step 2: Publish the container
        pub_resp = requests.post(f"{self.GRAPH_URL}/{ig_user_id}/media_publish", data={
            "creation_id": container_id,
            "access_token": page_token,
        })
        pub_resp.raise_for_status()
        return {"success": True, "platform": "instagram", "response": pub_resp.json()}

    def publish_video(self, access_token, video_url, caption=""):
        ig_user_id, page_token = self._get_ig_user_id(access_token)

        # Step 1: Create REELS container
        container_resp = requests.post(f"{self.GRAPH_URL}/{ig_user_id}/media", data={
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "access_token": page_token,
        })
        container_resp.raise_for_status()
        container_id = container_resp.json()["id"]

        # Step 2: Wait for video processing, then publish
        import time
        for _ in range(30):  # poll up to ~60 seconds
            status_resp = requests.get(f"{self.GRAPH_URL}/{container_id}", params={
                "fields": "status_code",
                "access_token": page_token,
            })
            status_data = status_resp.json()
            if status_data.get("status_code") == "FINISHED":
                break
            time.sleep(2)

        pub_resp = requests.post(f"{self.GRAPH_URL}/{ig_user_id}/media_publish", data={
            "creation_id": container_id,
            "access_token": page_token,
        })
        pub_resp.raise_for_status()
        return {"success": True, "platform": "instagram", "response": pub_resp.json()}


# ──────────────────────────────────────────────
#  Orchestrator
# ──────────────────────────────────────────────
class SocialMediaService:
    """Central service that delegates to per-platform implementations."""

    PLATFORMS = {
        "linkedin": LinkedInService,
        "facebook": FacebookService,
        "instagram": InstagramService,
    }

    def __init__(self):
        self._instances = {}

    def _get(self, platform):
        if platform not in self.PLATFORMS:
            raise ValueError(f"Unsupported platform: {platform}")
        if platform not in self._instances:
            self._instances[platform] = self.PLATFORMS[platform]()
        return self._instances[platform]

    # ── OAuth helpers ──
    def get_auth_url(self, platform, redirect_uri, state=""):
        return self._get(platform).get_auth_url(redirect_uri, state)

    def exchange_code(self, platform, code, redirect_uri):
        return self._get(platform).exchange_code(code, redirect_uri)

    # ── Token storage (MongoDB) ──
    @staticmethod
    def save_token(user_id, platform, token_data):
        db = get_db()
        db.social_media_tokens.update_one(
            {"user_id": user_id, "platform": platform},
            {"$set": {
                "user_id": user_id,
                "platform": platform,
                "access_token": token_data.get("access_token"),
                "expires_in": token_data.get("expires_in"),
                "token_data": token_data,
                "connected_at": datetime.utcnow().isoformat(),
            }},
            upsert=True,
        )

    @staticmethod
    def get_token(user_id, platform):
        db = get_db()
        doc = db.social_media_tokens.find_one(
            {"user_id": user_id, "platform": platform},
            {"_id": 0},
        )
        return doc

    @staticmethod
    def get_all_connections(user_id):
        db = get_db()
        docs = list(db.social_media_tokens.find(
            {"user_id": user_id},
            {"_id": 0, "platform": 1, "connected_at": 1},
        ))
        return docs

    @staticmethod
    def remove_token(user_id, platform):
        db = get_db()
        db.social_media_tokens.delete_one({"user_id": user_id, "platform": platform})

    # ── Publishing ──
    def publish(self, platform, access_token, content_url, content_type, caption=""):
        svc = self._get(platform)
        if content_type == "video":
            return svc.publish_video(access_token, content_url, caption)
        else:
            return svc.publish_image(access_token, content_url, caption)
