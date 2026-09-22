"""
Product Model - Schema definitions for Product data
"""

# Product document structure for MongoDB
PRODUCT_SCHEMA = {
    "name": str,            # Product name
    "description": str,     # Product description
    "price": str,           # Product price
    "adTypes": list,        # List of ad types
    "captionType": str,     # Caption type preference
    "referenceImages": list,  # List of Cloudinary image URLs
    "generatedDesigns": list, # List of generated designs
    "createdAt": "datetime",  # Creation timestamp
}

# LogoPoster document structure
LOGO_POSTER_SCHEMA = {
    "type": str,            # Design type: "logo" or "poster"
    "brandName": str,       # Brand name
    "tagline": str,         # Tagline text
    "colors": "mixed",      # Color palette (list or string)
    "style": str,           # Design style
    "description": str,     # Additional description
    "size": str,            # Size specification (e.g., "1024x1024")
    "prompt": str,          # AI prompt used
    "cloudinaryUrl": str,   # Cloudinary URL for the design
    "publicId": str,        # Cloudinary public ID
    "fileName": str,        # Original file name
    "createdAt": "datetime",  # Creation timestamp
}
