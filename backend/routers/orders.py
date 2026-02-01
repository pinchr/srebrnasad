from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from database import get_db

router = APIRouter(prefix="/orders", tags=["orders"])

class AppleItem(BaseModel):
    """Apple item in order"""
    apple_id: str
    quantity_kg: int = Field(..., ge=10)

class OrderCreate(BaseModel):
    """Create new order"""
    apples: list[AppleItem]
    packaging: str = Field(..., pattern="^(own|box)$")
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_email: Optional[str] = None
    customer_phone: str = Field(..., min_length=1, max_length=20)
    pickup_datetime: str  # Format: "2026-02-15T14:30"

class OrderResponse(BaseModel):
    """Order response"""
    id: str
    apples: list[dict]
    packaging: str
    customer_name: str
    customer_email: Optional[str]
    customer_phone: str
    pickup_date: str
    pickup_time: str
    status: str
    total_quantity_kg: int
    total_price: float
    created_at: datetime

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    """
    Create new order with multiple apple varieties.
    
    Minimum 10 kg per variety, can be increased by 5 kg increments.
    """
    db = get_db()
    
    # Validate at least one apple selected
    if not order.apples or len(order.apples) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wybierz co najmniej jedną odmianę jabłek"
        )
    
    # Validate quantities
    for apple_item in order.apples:
        if apple_item.quantity_kg < 10 or (apple_item.quantity_kg - 10) % 5 != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ilość musi wynosić co najmniej 10 kg, zwiększana co 5 kg"
            )
    
    # Parse pickup_datetime to date and time
    pickup_dt = datetime.fromisoformat(order.pickup_datetime)
    pickup_date = pickup_dt.strftime("%Y-%m-%d")
    pickup_time = pickup_dt.strftime("%H:%M")
    
    if db is None:
        # Development mode - return success
        total_qty = sum(a.quantity_kg for a in order.apples)
        return OrderResponse(
            id="dev-mode",
            apples=[a.dict() for a in order.apples],
            packaging=order.packaging,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_phone=order.customer_phone,
            pickup_date=pickup_date,
            pickup_time=pickup_time,
            status="pending",
            total_quantity_kg=total_qty,
            total_price=0.0,
            created_at=datetime.utcnow()
        )
    
    try:
        # Fetch all apples and calculate prices
        apples_data = []
        total_price = 0.0
        total_quantity = 0
        
        for apple_item in order.apples:
            apple = db["apples"].find_one({"_id": ObjectId(apple_item.apple_id)})
            if not apple:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Odmiana jabłek nie znaleziona: {apple_item.apple_id}"
                )
            
            item_price = apple["price"] * apple_item.quantity_kg
            total_price += item_price
            total_quantity += apple_item.quantity_kg
            
            apples_data.append({
                "apple_id": apple_item.apple_id,
                "apple_name": apple["name"],
                "quantity_kg": apple_item.quantity_kg,
                "price_per_kg": apple["price"],
                "subtotal": item_price
            })
        
        # Add packaging cost
        if order.packaging == "box":
            total_price += total_quantity * 2  # 2 zł per kg for packaging
        
        # Create order document
        order_doc = {
            "apples": apples_data,
            "packaging": order.packaging,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "customer_phone": order.customer_phone,
            "pickup_date": pickup_date,
            "pickup_time": pickup_time,
            "status": "pending",  # pending, confirmed, ready, picked_up, cancelled
            "total_quantity_kg": total_quantity,
            "total_price": total_price,
            "packaging_cost": total_quantity * 2 if order.packaging == "box" else 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        result = db["orders"].insert_one(order_doc)
        
        return OrderResponse(
            id=str(result.inserted_id),
            apples=apples_data,
            packaging=order.packaging,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_phone=order.customer_phone,
            pickup_date=pickup_date,
            pickup_time=pickup_time,
            status="pending",
            total_quantity_kg=total_quantity,
            total_price=total_price,
            created_at=order_doc["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Nie udało się złożyć zamówienia: {str(e)}"
        )

@router.get("/", tags=["admin"])
async def get_all_orders(skip: int = 0, limit: int = 100, status_filter: Optional[str] = None, new_status: Optional[str] = None):
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
            detail=f"Nie udało się pobrać zamówień: {str(e)}"
        )

@router.get("/{order_id}", tags=["admin"])
async def get_order(order_id: str):
    """Get specific order by ID (admin only)"""
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zamówienie nie znalezione"
        )
    
    try:
        order = db["orders"].find_one({"_id": ObjectId(order_id)})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Zamówienie nie znalezione"
            )
        
        order["id"] = str(order["_id"])
        del order["_id"]
        
        return order
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Nie udało się pobrać zamówienia: {str(e)}"
        )

class StatusUpdate(BaseModel):
    """Update order status"""
    new_status: str

@router.put("/{order_id}/status", tags=["admin"])
async def update_order_status(order_id: str, status_update: StatusUpdate):
    """
    Update order status (admin only).
    
    Valid statuses: pending, confirmed, ready, picked_up, cancelled
    """
    valid_statuses = ["pending", "confirmed", "ready", "picked_up", "cancelled"]
    
    if status_update.new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nieprawidłowy status. Musi być jeden z: {', '.join(valid_statuses)}"
        )
    
    db = get_db()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Brak połączenia z bazą danych"
        )
    
    try:
        result = db["orders"].update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "status": status_update.new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Zamówienie nie znalezione"
            )
        
        updated_order = db["orders"].find_one({"_id": ObjectId(order_id)})
        updated_order["id"] = str(updated_order["_id"])
        del updated_order["_id"]
        
        return updated_order
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Nie udało się zaktualizować zamówienia: {str(e)}"
        )
