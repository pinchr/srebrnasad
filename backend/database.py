import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "srebrnasad")

client: MongoClient = None
db = None

def connect_db():
    """Connect to MongoDB"""
    global client, db
    try:
        client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ping')
        db = client[DATABASE_NAME]
        print(f"✓ Connected to MongoDB: {DATABASE_NAME}")
        return db
    except ServerSelectionTimeoutError as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        print("⚠️  Running in development mode without database")
        return None

def init_db():
    """Initialize database collections and indexes"""
    global db
    db = connect_db()
    
    if db is None:
        return
    
    # Create collections with validation
    if "contact_messages" not in db.list_collection_names():
        db.create_collection("contact_messages")
        db["contact_messages"].create_index("email")
        db["contact_messages"].create_index("created_at")
        print("✓ Created 'contact_messages' collection")
    
    if "apples" not in db.list_collection_names():
        db.create_collection("apples")
        db["apples"].create_index("name")
        db["apples"].create_index("available")
        print("✓ Created 'apples' collection")
    
    # Seed default apples if collection is empty
    if db["apples"].count_documents({}) == 0:
        default_apples = [
            {
                "name": "Gala",
                "description": "Słodkie i socziste",
                "price": 4.50,
                "available": True,
                "max_quantity_kg": 250,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Jonagold",
                "description": "Mieszanka słodkości i kwaskości",
                "price": 5.00,
                "available": True,
                "max_quantity_kg": 250,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Fuji",
                "description": "Słodkie z nutą kardamonu",
                "price": 5.50,
                "available": True,
                "max_quantity_kg": 250,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
        ]
        db["apples"].insert_many(default_apples)
        print("✓ Seeded default apple varieties")
    
    if "orders" not in db.list_collection_names():
        db.create_collection("orders")
        db["orders"].create_index("customer_email")
        db["orders"].create_index("status")
        db["orders"].create_index("created_at")
        db["orders"].create_index("pickup_date")
        print("✓ Created 'orders' collection")

def get_db():
    """Get database connection"""
    global db
    if db is None:
        db = connect_db()
    return db

def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("✓ Closed MongoDB connection")
