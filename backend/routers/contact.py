from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from database import get_db

router = APIRouter(prefix="/contact", tags=["contact"])

class ContactMessage(BaseModel):
    """Contact form message schema"""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=5000)

class ContactMessageResponse(BaseModel):
    """Response after submitting contact message"""
    id: str
    name: str
    email: str
    phone: Optional[str]
    message: str
    created_at: datetime
    status: str = "received"

@router.post("/", response_model=ContactMessageResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_message(contact: ContactMessage):
    """
    Submit a contact form message.
    
    The message will be stored in the database for review.
    """
    db = get_db()
    
    if db is None:
        # Development mode - just return success
        return ContactMessageResponse(
            id="dev-mode",
            name=contact.name,
            email=contact.email,
            phone=contact.phone,
            message=contact.message,
            created_at=datetime.utcnow(),
            status="received"
        )
    
    try:
        # Prepare document
        message_doc = {
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "message": contact.message,
            "created_at": datetime.utcnow(),
            "status": "unread"
        }
        
        # Insert into database
        result = db["contact_messages"].insert_one(message_doc)
        
        return ContactMessageResponse(
            id=str(result.inserted_id),
            name=contact.name,
            email=contact.email,
            phone=contact.phone,
            message=contact.message,
            created_at=message_doc["created_at"],
            status="received"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save message: {str(e)}"
        )

@router.get("/messages", tags=["admin"])
async def get_all_messages(skip: int = 0, limit: int = 100):
    """
    Get all contact messages (admin only).
    
    This endpoint should be protected by authentication in production.
    """
    db = get_db()
    
    if db is None:
        return {"messages": [], "total": 0}
    
    try:
        messages = list(
            db["contact_messages"]
            .find()
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        
        # Convert ObjectId to string
        for msg in messages:
            msg["id"] = str(msg["_id"])
            del msg["_id"]
        
        total = db["contact_messages"].count_documents({})
        
        return {
            "messages": messages,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch messages: {str(e)}"
        )

@router.get("/messages/{message_id}", tags=["admin"])
async def get_message(message_id: str):
    """Get a specific contact message by ID"""
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    try:
        from bson import ObjectId
        message = db["contact_messages"].find_one({"_id": ObjectId(message_id)})
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        message["id"] = str(message["_id"])
        del message["_id"]
        
        return message
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch message: {str(e)}"
        )
