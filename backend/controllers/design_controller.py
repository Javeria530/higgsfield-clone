"""
Design Controller - Route handlers for design generation endpoints
"""
from flask import Blueprint, request, jsonify
from services.design_service import DesignService
from services.product_service import ProductService

design_controller = Blueprint("design_controller", __name__)


@design_controller.route("/generate-design", methods=["POST"])
def generate_design():
    """Generate a logo or poster design"""
    try:
        data = request.get_json(silent=True) or {}
        
        if not data.get("type"):
            return jsonify({"error": "field 'type' is required ('logo' or 'poster')"}), 400

        result = DesignService.generate_design(data)
        
        # Also save to products
        ProductService.create_product_with_design(
            data,
            result["url"],
            result["publicId"],
            result["fileName"]
        )

        return jsonify(result), 201

    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500
    except ValueError as e:
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        print(traceback.format_exc())
        return jsonify({"error": "Generation failed", "details": str(e)}), 500


@design_controller.route("/designs", methods=["GET"])
def list_designs():
    """Get all designs"""
    try:
        designs = DesignService.get_designs()
        return jsonify(designs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
