from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from database import get_db, init_db
from routers import contact, upload, content

# Initialize FastAPI app
app = FastAPI(
    title="Srebrna Sad API",
    description="API for Srebrna Sad orchard website",
    version="0.1.0"
)

# CORS middleware - MUST be first!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev mode: allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers with /api prefix
app.include_router(contact.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(content.router, prefix="/api")

# Import and include routers for Phase 2
from routers import apples, orders
app.include_router(apples.router, prefix="/api")
app.include_router(orders.router, prefix="/api")

# Mount static files for uploads
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("Database initialized")

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

# Root endpoint - serve index.html (MUST be before catch-all)
from fastapi.responses import FileResponse

@app.get("/")
async def root():
    """Root endpoint - serve frontend"""
    frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
    index_path = frontend_dist / "index.html"
    
    if index_path.exists():
        return FileResponse(index_path)
    
    return {
        "message": "Welcome to Srebrna Sad API",
        "version": "0.1.0",
        "docs": "/docs"
    }

# Catch-all for SPA routing (must be last, but exclude /api routes)
@app.get("/{path_name:path}")
async def serve_spa(path_name: str):
    """Serve SPA index.html for all non-API routes"""
    # Skip /api routes - let them be handled by routers above
    if path_name.startswith("api") or path_name.startswith("uploads"):
        raise HTTPException(status_code=404, detail="Not found")
    
    frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
    
    if not frontend_dist.exists():
        raise HTTPException(status_code=404, detail="Frontend not built")
    
    # Check if it's a static asset file
    file_path = frontend_dist / path_name
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    # For any other route, serve index.html (SPA routing)
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    raise HTTPException(status_code=404, detail="File not found")
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
