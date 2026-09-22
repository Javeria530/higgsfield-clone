"""
User Model - Schema definitions for User data
"""

# User document structure for MongoDB
USER_SCHEMA = {
    "fullName": str,        # User's full name
    "email": str,           # User's email (unique)
    "username": str,        # Username (typically same as email)
    "password": str,        # Hashed password (None for OAuth users)
    "role": str,            # User role: "User", "Admin", etc.
    "googleId": str,        # Google OAuth ID (optional)
    "authProvider": str,    # Auth provider: "local", "google"
    "organizationName": str,  # Organization name (optional)
    "organizationEmail": str, # Organization email (optional)
    "createdAt": "datetime",  # Account creation timestamp
    "updatedAt": "datetime",  # Last update timestamp
    "lastLogin": "datetime",  # Last login timestamp
}

# Sub-user document structure
SUBUSER_SCHEMA = {
    "name": str,            # Sub-user's name
    "email": str,           # Sub-user's email (unique)
    "password": str,        # Hashed password
    "headUserId": str,      # Reference to head user
    "headUserEmail": str,   # Head user's email
    "headUserName": str,    # Head user's name
    "allowedFeatures": list,  # List of allowed feature IDs
    "isActive": bool,       # Active status (for soft delete)
    "createdAt": "datetime",  # Creation timestamp
    "updatedAt": "datetime",  # Last update timestamp
}
