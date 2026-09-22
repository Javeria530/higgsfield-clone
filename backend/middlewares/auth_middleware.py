"""
Authentication Middleware
"""
from functools import wraps
from flask import request, jsonify


def require_auth(f):
    """Decorator to require authentication for a route"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Get token from header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return jsonify({"success": False, "error": "Authorization header required"}), 401
        
        # TODO: Implement JWT token validation
        # For now, just pass through
        
        return f(*args, **kwargs)
    return decorated


def require_role(role):
    """Decorator to require a specific role"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # TODO: Implement role checking
            return f(*args, **kwargs)
        return decorated
    return decorator
