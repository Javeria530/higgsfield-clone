"""
SmartAds API - Main Application Entry Point
"""
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import controllers
from controllers.auth_controller import auth_controller
from controllers.design_controller import design_controller
from controllers.product_controller import product_controller
from controllers.template_controller import template_controller
from controllers.voice_controller import voice_controller
from controllers.feedback_controller import feedback_controller

# Import config
from config.settings import FLASK_HOST, FLASK_PORT, FLASK_DEBUG



def create_app():
    """Application factory"""
    app = Flask(__name__)
    CORS(app)
    
    # Root route
    @app.route("/")
    def index():
        return jsonify({
            "message": "SmartAds API",
            "version": "1.0",
            "endpoints": {
                "auth": {
                    "signup": "POST /api/signup",
                    "login": "POST /api/login",
                    "google_signup": "POST /api/google-signup"
                },
                "users": {
                    "add_subuser": "POST /api/add-subuser",
                    "get_subusers": "GET /api/get-subusers/<head_user_id>",
                    "update_subuser": "PUT /api/update-subuser/<subuser_id>",
                    "delete_subuser": "DELETE /api/delete-subuser/<subuser_id>"
                },
                "products": {
                    "add_product": "POST /api/add-product",
                    "upload_images": "POST /api/upload-images",
                    "get_products": "GET /api/products"
                },
                "designs": {
                    "generate": "POST /api/generate-design",
                    "list": "GET /api/designs"
                }
            }
        })
    
    # Register blueprints
    app.register_blueprint(auth_controller, url_prefix="/api")
    app.register_blueprint(design_controller, url_prefix="/api")
    app.register_blueprint(product_controller, url_prefix="/api")
    app.register_blueprint(template_controller, url_prefix="/api")
    app.register_blueprint(voice_controller, url_prefix="/api")
    app.register_blueprint(feedback_controller, url_prefix="/api")
    from video_ad_module import video_ad_module
    app.register_blueprint(video_ad_module, url_prefix="/api")
    from controllers.social_media_controller import social_media_controller
    app.register_blueprint(social_media_controller, url_prefix="/api")
    
    return app


# Create app instance
app = create_app()

if __name__ == "__main__":
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
