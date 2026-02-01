from fastapi import FastAPI
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

# Include routers
app.include_router(contact.router)
app.include_router(upload.router)
app.include_router(content.router)

# Import and include routers for Phase 2
from routers import apples, orders
app.include_router(apples.router)
app.include_router(orders.router)

# Mount static files for uploads
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("Database initialized")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Srebrna Sad API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

# Catch-all for SPA routing (must be last)
from fastapi.responses import FileResponse

@app.get("/{path_name:path}")
async def serve_spa(path_name: str):
    """Serve SPA index.html for all non-API routes"""
    frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
    
    # Check if it's a static asset file
    file_path = frontend_dist / path_name
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    # Serve index.html for all other routes (SPA routing)
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    return {"error": "Frontend not built"}
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
