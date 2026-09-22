"""
Database connection and initialization
"""
from pymongo import MongoClient
from config.settings import MONGO_URI, DATABASE_NAME

# MongoDB client instance
client = None
db = None

def init_db():
    """Initialize database connection"""
    global client, db
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        print("✅ MongoDB Connected Successfully")
        return db
    except Exception as e:
        print("❌ MongoDB Connection Error:", e)
        raise e

def get_db():
    """Get database instance"""
    global db
    if db is None:
        return init_db()
    return db

# Initialize on import
db = init_db()
