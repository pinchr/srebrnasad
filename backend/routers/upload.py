from fastapi import APIRouter, File, UploadFile, HTTPException, status
import os
import shutil
from datetime import datetime
import uuid

router = APIRouter(prefix="/upload", tags=["upload"])

# Upload directory
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload an image file.
    
    Supported formats: jpg, jpeg, png, gif, webp
    Max size: 5MB
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nazwa pliku jest wymagana"
        )
    
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nieobsługiwany format pliku. Obsługiwane: jpg, jpeg, png, gif, webp"
        )
    
    try:
        # Read file
        contents = await file.read()
        
        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Plik za duży. Maximum: 5MB"
            )
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return URL
        file_url = f"/uploads/{unique_filename}"
        
        return {
            "url": file_url,
            "filename": unique_filename,
            "size": len(contents),
            "message": "✓ Plik wgrany pomyślnie"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd przy wgrywaniu pliku: {str(e)}"
        )

@router.delete("/{filename}")
async def delete_file(filename: str):
    """
    Delete an uploaded image file (admin only).
    
    This endpoint should be protected by authentication in production.
    """
    try:
        # Prevent directory traversal
        if ".." in filename or "/" in filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nieprawidłowa nazwa pliku"
            )
        
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plik nie znaleziony"
            )
        
        os.remove(file_path)
        
        return {"message": "✓ Plik usunięty"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd przy usuwaniu pliku: {str(e)}"
        )
