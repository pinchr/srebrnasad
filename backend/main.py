from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import os
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

# CORS middleware
allowed_origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative dev port
    "https://pinchr.github.io",  # GitHub Pages
    # Add production domain when ready
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
