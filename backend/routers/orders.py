from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from database import get_db

router = APIRouter(prefix="/orders", tags=["orders"])

class OrderCreate(BaseModel):
    """Create new order"""
    apple_id: str
    quantity_kg: int = Field(..., ge=10)
    packaging: str = Field(..., regex="^(own|box)$")
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_email: EmailStr
    customer_phone: str = Field(..., min_length=1, max_length=20)
    pickup_date: str
    pickup_time: str

class OrderResponse(BaseModel):
    """Order response"""
    id: str
    apple_id: str
    quantity_kg: int
    packaging: str
    customer_name: str
    customer_email: str
    customer_phone: str
    pickup_date: str
    pickup_time: str
    status: str
    total_price: float
    created_at: datetime

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    """
    Create new order.
    
    Minimum 10 kg, can be increased by 5 kg increments.
    """
    db = get_db()
    
    # Validate quantity (10, 15, 20, 25, etc.)
    if (order.quantity_kg - 10) % 5 != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be 10 kg or more, increased by 5 kg increments"
        )
    
    if db is None:
        # Development mode - return success
        return OrderResponse(
            id="dev-mode",
            apple_id=order.apple_id,
            quantity_kg=order.quantity_kg,
            packaging=order.packaging,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_phone=order.customer_phone,
            pickup_date=order.pickup_date,
            pickup_time=order.pickup_time,
            status="pending",
            total_price=0.0,
            created_at=datetime.utcnow()
        )
    
    try:
        # Get apple to calculate price
        apple = db["apples"].find_one({"_id": ObjectId(order.apple_id)})
        if not apple:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Apple variety not found"
            )
        
        # Calculate total price
        total_price = apple["price"] * order.quantity_kg
        if order.packaging == "box":
            total_price += order.quantity_kg * 2  # 2 zł per kg for packaging
        
        # Create order document
        order_doc = {
            "apple_id": order.apple_id,
            "apple_name": apple["name"],
            "quantity_kg": order.quantity_kg,
            "packaging": order.packaging,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "customer_phone": order.customer_phone,
            "pickup_date": order.pickup_date,
            "pickup_time": order.pickup_time,
            "status": "pending",  # pending, confirmed, ready, picked_up, cancelled
            "total_price": total_price,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        result = db["orders"].insert_one(order_doc)
        
        return OrderResponse(
            id=str(result.inserted_id),
            apple_id=order.apple_id,
            quantity_kg=order.quantity_kg,
            packaging=order.packaging,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_phone=order.customer_phone,
            pickup_date=order.pickup_date,
            pickup_time=order.pickup_time,
            status="pending",
            total_price=order_doc["total_price"],
            created_at=order_doc["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@router.get("/", tags=["admin"])
async def get_all_orders(skip: int = 0, limit: int = 100, status_filter: Optional[str] = None):
    """
    Get all orders (admin only).
    
    This endpoint should be protected by authentication in production.
    """
    db = get_db()
    
    if db is None:
        return {"orders": [], "total": 0}
    
    try:
        query = {}
        if status_filter:
            query["status"] = status_filter
        
        orders = list(
            db["orders"]
            .find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        
        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
        
        total = db["orders"].count_documents(query)
        
        return {
            "orders": orders,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )

@router.get("/{order_id}", tags=["admin"])
async def get_order(order_id: str):
    """Get specific order by ID (admin only)"""
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    try:
        order = db["orders"].find_one({"_id": ObjectId(order_id)})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        order["id"] = str(order["_id"])
        del order["_id"]
        
        return order
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch order: {str(e)}"
        )

@router.put("/{order_id}/status", tags=["admin"])
async def update_order_status(order_id: str, new_status: str):
    """
    Update order status (admin only).
    
    Valid statuses: pending, confirmed, ready, picked_up, cancelled
    """
    valid_statuses = ["pending", "confirmed", "ready", "picked_up", "cancelled"]
    
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed"
        )
    
    try:
        result = db["orders"].update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        updated_order = db["orders"].find_one({"_id": ObjectId(order_id)})
        updated_order["id"] = str(updated_order["_id"])
        del updated_order["_id"]
        
        return updated_order
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )
