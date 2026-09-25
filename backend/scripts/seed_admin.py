"""Create or update the primary SmartAds admin account in MongoDB."""
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

# Allow running this file directly from the repository root or backend folder.
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
load_dotenv(BACKEND_DIR.parent / ".env")

from config.database import get_db
from services.auth_service import AuthService


def main():
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    full_name = os.getenv("ADMIN_NAME", "SmartAds Admin")

    if not email or not password:
        raise SystemExit("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.")
    if len(password) < 8:
        raise SystemExit("ADMIN_PASSWORD must be at least 8 characters long.")

    db = get_db()
    now = datetime.utcnow()
    db.users.update_one(
        {"email": email.lower()},
        {
            "$set": {
                "fullName": full_name,
                "username": email.lower(),
                "password": AuthService.hash_password(password),
                "role": "Admin",
                "isActive": True,
                "updatedAt": now,
            },
            "$setOnInsert": {"createdAt": now},
        },
        upsert=True,
    )
    print(f"Admin account provisioned: {email.lower()}")


if __name__ == "__main__":
    main()
