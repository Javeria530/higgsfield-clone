"""
Authentication Service - Business logic for user authentication
"""
import bcrypt
from datetime import datetime
from bson.objectid import ObjectId
from config.database import db


class AuthService:
    """Service class for authentication operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    
    @staticmethod
    def create_user(full_name: str, email: str, password: str, role: str = "User") -> dict:
        """Create a new user"""
        hashed_pw = AuthService.hash_password(password)
        
        user = {
            "fullName": full_name,
            "email": email.lower(),
            "username": email.lower(),
            "password": hashed_pw,
            "role": role,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = db.users.insert_one(user)
        return {
            "id": str(result.inserted_id),
            "fullName": full_name,
            "email": email.lower(),
            "role": role
        }
    
    @staticmethod
    def create_google_user(name: str, email: str, google_id: str = None) -> dict:
        """Create a new user via Google OAuth"""
        user = {
            "fullName": name,
            "email": email.lower(),
            "username": email.lower(),
            "password": None,
            "googleId": google_id,
            "authProvider": "google",
            "role": "User",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = db.users.insert_one(user)
        return {
            "id": str(result.inserted_id),
            "fullName": name,
            "email": email.lower(),
            "role": "User"
        }
    
    @staticmethod
    def get_user_by_email(email: str) -> dict:
        """Get user by email"""
        return db.users.find_one({"email": email.lower()})
    
    @staticmethod
    def get_user_by_id(user_id: str) -> dict:
        """Get user by ID"""
        try:
            if ObjectId.is_valid(user_id):
                return db.users.find_one({"_id": ObjectId(user_id)})
        except:
            pass
        return db.users.find_one({"_id": user_id})
    
    @staticmethod
    def update_last_login(user_id) -> None:
        """Update user's last login time"""
        db.users.update_one(
            {"_id": user_id},
            {"$set": {"lastLogin": datetime.utcnow()}}
        )
    
    @staticmethod
    def format_user_response(user: dict) -> dict:
        """Format user data for API response"""
        return {
            "id": str(user["_id"]),
            "fullName": user["fullName"],
            "email": user["email"],
            "role": user.get("role", "User")
        }


    @staticmethod
    def get_all_users() -> list:
        """Get all users from the users collection"""
        all_users = list(db.users.find())
        return [
            {
                "id": str(u["_id"]),
                "name": u.get("fullName", ""),
                "email": u.get("email", ""),
                "role": u.get("role", "User"),
                "type": "user",
                "status": u.get("status", "ACTIVE"),
                "isActive": u.get("isActive", True),
                "authProvider": u.get("authProvider", "local"),
                "createdAt": u["createdAt"].isoformat() if u.get("createdAt") else None,
                "lastLogin": u["lastLogin"].isoformat() if u.get("lastLogin") else None
            }
            for u in all_users
        ]

    @staticmethod
    def update_user_status(user_id: str, is_active: bool, status: str) -> bool:
        """Update user active status"""
        try:
            result = db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"isActive": is_active, "status": status, "updatedAt": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except:
            return False

    @staticmethod
    def delete_user(user_id: str) -> bool:
        """Delete a user"""
        try:
            result = db.users.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except:
            return False


class SubUserService:
    """Service class for sub-user operations"""
    
    @staticmethod
    def create_subuser(head_user_id: str, name: str, email: str, password: str, allowed_features: list) -> dict:
        """Create a new sub-user"""
        head_user = AuthService.get_user_by_id(head_user_id)
        if not head_user:
            raise ValueError("Invalid head user")
        
        hashed_pw = AuthService.hash_password(password)
        
        subuser = {
            "name": name,
            "email": email.lower(),
            "password": hashed_pw,
            "headUserId": head_user_id,
            "headUserEmail": head_user["email"],
            "headUserName": head_user["fullName"],
            "allowedFeatures": allowed_features,
            "role": "BUSINESS_USER",
            "status": "ACTIVE",
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = db.subusers.insert_one(subuser)
        
        return {
            "id": str(result.inserted_id),
            "name": name,
            "email": email.lower(),
            "allowedFeatures": allowed_features,
            "createdAt": subuser["createdAt"].isoformat()
        }
    
    @staticmethod
    def get_subusers_by_head(head_user_id: str) -> list:
        """Get all active sub-users for a head user"""
        subusers = list(db.subusers.find({"headUserId": head_user_id, "isActive": True}))
        return [
            {
                "id": str(s["_id"]),
                "name": s["name"],
                "email": s["email"],
                "allowedFeatures": s.get("allowedFeatures", []),
                "role": s.get("role", "BUSINESS_USER"),
                "status": s.get("status", "ACTIVE"),
                "isActive": s.get("isActive", True),
                "createdAt": s["createdAt"].isoformat()
            }
            for s in subusers
        ]
    
    @staticmethod
    def get_all_subusers() -> list:
        """Get all sub-users across all head users (including inactive)"""
        subusers = list(db.subusers.find())
        return [
            {
                "id": str(s["_id"]),
                "name": s.get("name", ""),
                "email": s.get("email", ""),
                "role": s.get("role", "SUB_USER"),
                "type": "sub_user",
                "status": "INACTIVE" if s.get("isActive") is False else s.get("status", "ACTIVE"),
                "isActive": s.get("isActive", True),
                "headUserName": s.get("headUserName", ""),
                "headUserEmail": s.get("headUserEmail", ""),
                "allowedFeatures": s.get("allowedFeatures", []),
                "createdAt": s["createdAt"].isoformat() if s.get("createdAt") else None
            }
            for s in subusers
        ]

    @staticmethod
    def get_subuser_by_email(email: str) -> dict:
        """Get sub-user by email"""
        return db.subusers.find_one({"email": email.lower()})
    
    @staticmethod
    def update_subuser(subuser_id: str, update_data: dict) -> bool:
        """Update a sub-user"""
        update_data["updatedAt"] = datetime.utcnow()
        
        if "password" in update_data:
            update_data["password"] = AuthService.hash_password(update_data["password"])
        
        if "email" in update_data:
            update_data["email"] = update_data["email"].lower()
        
        try:
            result = db.subusers.update_one(
                {"_id": ObjectId(subuser_id)},
                {"$set": update_data}
            )
        except:
            result = db.subusers.update_one(
                {"_id": subuser_id},
                {"$set": update_data}
            )
        
        return result.modified_count > 0
    
    @staticmethod
    def delete_subuser(subuser_id: str) -> bool:
        """Soft delete a sub-user"""
        try:
            result = db.subusers.update_one(
                {"_id": ObjectId(subuser_id)},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
        except:
            result = db.subusers.update_one(
                {"_id": subuser_id},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
        
        return result.modified_count > 0
