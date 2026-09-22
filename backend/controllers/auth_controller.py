"""
Authentication Controller - Route handlers for authentication endpoints
"""
from flask import Blueprint, request, jsonify
from services.auth_service import AuthService, SubUserService

auth_controller = Blueprint("auth_controller", __name__)


@auth_controller.route("/signup", methods=["POST"])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()

        full_name = data.get("fullName")
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirmPassword")
        role = data.get("role", "User")

        # Validation
        if not full_name or not email or not password or not confirm_password:
            return jsonify({"success": False, "error": "All fields are required"}), 400

        if "@" not in email or "." not in email:
            return jsonify({"success": False, "error": "Invalid email format"}), 400

        if password != confirm_password:
            return jsonify({"success": False, "error": "Passwords do not match"}), 400

        if len(password) < 6:
            return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

        # Check existing user
        if AuthService.get_user_by_email(email):
            return jsonify({"success": False, "error": "Email already registered"}), 409

        # Create user
        user = AuthService.create_user(full_name, email, password, role)

        return jsonify({
            "success": True,
            "message": "Account created successfully!",
            "userId": user["id"]
        }), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_controller.route("/login", methods=["POST"])
def login():
    """Login user"""
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"success": False, "error": "Email and password are required"}), 400

        user = AuthService.get_user_by_email(email)

        if not user:
            return jsonify({"success": False, "error": "Invalid email or password"}), 401

        if not AuthService.verify_password(password, user["password"]):
            return jsonify({"success": False, "error": "Invalid email or password"}), 401

        AuthService.update_last_login(user["_id"])

        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user": AuthService.format_user_response(user)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_controller.route("/google-signup", methods=["POST"])
def google_signup():
    """Register/Login via Google OAuth"""
    try:
        data = request.get_json()
        
        email = data.get("email")
        name = data.get("name")
        google_id = data.get("googleId")
        
        if not email or not name:
            return jsonify({"success": False, "error": "Email and name are required"}), 400
        
        existing_user = AuthService.get_user_by_email(email)
        
        if existing_user:
            return jsonify({
                "success": True,
                "message": "Login successful!",
                "user": AuthService.format_user_response(existing_user)
            }), 200
        
        user = AuthService.create_google_user(name, email, google_id)
        
        return jsonify({
            "success": True,
            "message": "Account created successfully!",
            "user": user
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_controller.route("/add-subuser", methods=["POST"])
def add_subuser():
    """Add a sub-user under a head user"""
    try:
        data = request.get_json()

        head_user_id = data.get("headUserId")
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        allowed_features = data.get("allowedFeatures", [])

        # Validation
        if not head_user_id or not name or not email or not password:
            return jsonify({"success": False, "error": "All fields are required"}), 400

        if "@" not in email or "." not in email:
            return jsonify({"success": False, "error": "Invalid email format"}), 400

        if len(password) < 6:
            return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

        if not allowed_features:
            return jsonify({"success": False, "error": "At least one feature must be assigned"}), 400

        # Check existing
        if SubUserService.get_subuser_by_email(email) or AuthService.get_user_by_email(email):
            return jsonify({"success": False, "error": "Email already registered"}), 409

        subuser = SubUserService.create_subuser(head_user_id, name, email, password, allowed_features)

        return jsonify({
            "success": True,
            "message": "Sub-user added successfully!",
            "subUserId": subuser["id"],
            "subUser": subuser
        }), 201

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_controller.route("/get-subusers/<head_user_id>", methods=["GET"])
def get_subusers(head_user_id):
    """Get all sub-users for a head user"""
    try:
        subusers = SubUserService.get_subusers_by_head(head_user_id)

        return jsonify({
            "success": True,
            "subUsers": subusers,
            "count": len(subusers)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_controller.route("/update-subuser/<subuser_id>", methods=["PUT"])
def update_subuser(subuser_id):
    """Update a sub-user"""
    try:
        data = request.get_json()
        
        update_data = {}
        
        if data.get("name"):
            update_data["name"] = data["name"]
        
        if data.get("email"):
            if "@" not in data["email"] or "." not in data["email"]:
                return jsonify({"success": False, "error": "Invalid email format"}), 400
            update_data["email"] = data["email"]
        
        if data.get("password"):
            if len(data["password"]) < 6:
                return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400
            update_data["password"] = data["password"]
        
        if "allowedFeatures" in data:
            if not data["allowedFeatures"]:
                return jsonify({"success": False, "error": "At least one feature must be assigned"}), 400
            update_data["allowedFeatures"] = data["allowedFeatures"]

        if not SubUserService.update_subuser(subuser_id, update_data):
            return jsonify({"success": False, "error": "Sub-user not found"}), 404

        return jsonify({
            "success": True,
            "message": "Sub-user updated successfully!"
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_controller.route("/get-all-users", methods=["GET"])
def get_all_users():
    """Get all users and sub-users from both collections"""
    try:
        users = AuthService.get_all_users()
        subusers = SubUserService.get_all_subusers()

        return jsonify({
            "success": True,
            "users": users,
            "subUsers": subusers,
            "totalUsers": len(users),
            "totalSubUsers": len(subusers)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_controller.route("/update-user-status/<user_id>", methods=["PUT"])
def update_user_status(user_id):
    """Update user status (Admin only)"""
    try:
        data = request.get_json()
        is_active = data.get("isActive", True)
        status = data.get("status", "ACTIVE")
        
        success = AuthService.update_user_status(user_id, is_active, status)
        if not success:
            return jsonify({"success": False, "error": "User not found or status unaltered"}), 404
            
        return jsonify({"success": True, "message": "User status updated successfully!"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@auth_controller.route("/delete-user/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Delete a user (Admin only)"""
    try:
        success = AuthService.delete_user(user_id)
        if not success:
            return jsonify({"success": False, "error": "User not found"}), 404
            
        return jsonify({"success": True, "message": "User deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@auth_controller.route("/delete-subuser/<subuser_id>", methods=["DELETE"])
def delete_subuser(subuser_id):
    """Delete a sub-user"""
    try:
        if not SubUserService.delete_subuser(subuser_id):
            return jsonify({"success": False, "error": "Sub-user not found"}), 404

        return jsonify({
            "success": True,
            "message": "Sub-user deleted successfully!"
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
