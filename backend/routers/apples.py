from fastapi import APIRouter, HTTPException, status, File, UploadFile
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from database import get_db

router = APIRouter(prefix="/apples", tags=["apples"])

class AppleCreate(BaseModel):
    """Create new apple variety"""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    price: float = Field(..., gt=0)
    available: bool = True
    photo_url: Optional[str] = None

class AppleUpdate(BaseModel):
    """Update apple variety"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    available: Optional[bool] = None
    photo_url: Optional[str] = None

class AppleResponse(BaseModel):
    """Apple variety response"""
    id: str
    name: str
    description: str
    price: float
    available: bool
    photo_url: Optional[str] = None
    created_at: datetime

@router.get("/", response_model=dict)
async def get_all_apples():
    """Get all available apple varieties"""
    db = get_db()
    
    if db is None:
        return {
            "apples": [
                {"_id": "1", "name": "Gala", "description": "Słodkie i socziste", "price": 4.50, "available": True},
                {"_id": "2", "name": "Jonagold", "description": "Mieszanka słodkości i kwaskości", "price": 5.00, "available": True},
                {"_id": "3", "name": "Granny Smith", "description": "Kwaskowe i chrupkie", "price": 4.00, "available": True},
            ]
        }
    
    try:
        apples = list(db["apples"].find().sort("name", 1))
        
        for apple in apples:
            apple["_id"] = str(apple["_id"])
        
        return {"apples": apples}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch apples: {str(e)}"
        )

@router.get("/{apple_id}")
async def get_apple(apple_id: str):
    """Get specific apple variety by ID"""
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Apple not found"
        )
    
    try:
        apple = db["apples"].find_one({"_id": ObjectId(apple_id)})
        
        if not apple:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Apple not found"
            )
        
        apple["_id"] = str(apple["_id"])
        return apple
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch apple: {str(e)}"
        )

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_apple(apple: AppleCreate):
    """
    Create new apple variety (admin only).
    
    This endpoint should be protected by authentication in production.
    """
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed"
        )
    
    try:
        apple_doc = {
            "name": apple.name,
            "description": apple.description,
            "price": apple.price,
            "available": apple.available,
            "photo_url": apple.photo_url,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = db["apples"].insert_one(apple_doc)
        apple_doc["_id"] = str(result.inserted_id)
        
        return {"id": str(result.inserted_id), **apple_doc}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create apple: {str(e)}"
        )

@router.put("/{apple_id}")
async def update_apple(apple_id: str, apple: AppleUpdate):
    """
    Update apple variety (admin only).
    
    This endpoint should be protected by authentication in production.
    """
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed"
        )
    
    try:
        update_data = apple.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        result = db["apples"].update_one(
            {"_id": ObjectId(apple_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Apple not found"
            )
        
        updated_apple = db["apples"].find_one({"_id": ObjectId(apple_id)})
        updated_apple["_id"] = str(updated_apple["_id"])
        
        return updated_apple
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update apple: {str(e)}"
        )

@router.delete("/{apple_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_apple(apple_id: str):
    """
    Delete apple variety (admin only).
    
    This endpoint should be protected by authentication in production.
    """
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed"
        )
    
    try:
        result = db["apples"].delete_one({"_id": ObjectId(apple_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Apple not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete apple: {str(e)}"
        )
