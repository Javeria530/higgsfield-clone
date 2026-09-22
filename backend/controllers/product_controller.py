"""
Product Controller - Route handlers for product endpoints
"""
from flask import Blueprint, request, jsonify
from services.product_service import ProductService

product_controller = Blueprint("product_controller", __name__)


@product_controller.route("/add-product", methods=["POST"])
def add_product():
    """Add a new product"""
    try:
        data = request.form
        files = request.files.getlist("images")

        # Validation
        if not data.get("name") or not data.get("description") or not data.get("price"):
            return jsonify({"error": "Please fill all required fields"}), 400

        result = ProductService.create_product(data, files)
        return jsonify(result), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@product_controller.route("/upload-images", methods=["POST"])
def upload_images():
    """Upload reference images"""
    try:
        files = request.files.getlist("images")
        
        if not files:
            return jsonify({"error": "No images provided"}), 400
        
        urls = ProductService.upload_images(files)
        return jsonify({"urls": urls, "count": len(urls)}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@product_controller.route("/products", methods=["GET"])
def get_products():
    """Get all products"""
    try:
        products = ProductService.get_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
