from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import get_db

router = APIRouter(prefix="/content", tags=["content"])

class HeroContent(BaseModel):
    """Hero section content"""
    title: str
    subtitle: str
    description: str
    background_image: Optional[str] = None

class AboutContent(BaseModel):
    """About section content"""
    cards: list[dict]

@router.post("/hero")
async def save_hero_content(content: HeroContent):
    """Save hero section content"""
    db = get_db()
    
    if db is None:
        return {"message": "✓ Content saved (dev mode)"}
    
    try:
        db["site_content"].update_one(
            {"section": "hero"},
            {
                "$set": {
                    "section": "hero",
                    "title": content.title,
                    "subtitle": content.subtitle,
                    "description": content.description,
                    "background_image": content.background_image,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"message": "✓ Zawartość Hero zapisana"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd przy zapisywaniu: {str(e)}"
        )

@router.get("/hero")
async def get_hero_content():
    """Get hero section content"""
    db = get_db()
    
    if db is None:
        return {
            "title": "Witaj w Srebrnej Sadzie",
            "subtitle": "Świeże jabłka z naszego rodzinnego sadu",
            "description": "Uprawiamy wysokiej jakości jabłka metodami tradycyjnymi.",
            "background_image": None
        }
    
    try:
        content = db["site_content"].find_one({"section": "hero"})
        
        if not content:
            return {
                "title": "Witaj w Srebrnej Sadzie",
                "subtitle": "Świeże jabłka z naszego rodzinnego sadu",
                "description": "Uprawiamy wysokiej jakości jabłka metodami tradycyjnymi.",
                "background_image": None
            }
        
        del content["_id"]
        del content["section"]
        return content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd przy pobieraniu zawartości: {str(e)}"
        )

@router.post("/about")
async def save_about_content(content: AboutContent):
    """Save about section content"""
    db = get_db()
    
    if db is None:
        return {"message": "✓ Content saved (dev mode)"}
    
    try:
        db["site_content"].update_one(
            {"section": "about"},
            {
                "$set": {
                    "section": "about",
                    "cards": content.cards,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"message": "✓ Zawartość About zapisana"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd przy zapisywaniu: {str(e)}"
        )

@router.get("/about")
async def get_about_content():
    """Get about section content"""
    db = get_db()
    
    default_about = {
        "cards": [
            {
                "icon": "🌳",
                "title": "Nasz Sad",
                "description": "Znajdujący się w Srebrnej, Naruszewo, nasz sad od pokoleń uprawia świeże, pyszne jabłka."
            },
            {
                "icon": "🍎",
                "title": "Jabłka Najwyższej Jakości",
                "description": "Uprawiamy wiele odmian jabłek, każdą wybraną ze względu na jej unikalny smak i wartość odżywczą."
            },
            {
                "icon": "👨‍🌾",
                "title": "Tradycja Rodzinna",
                "description": "Nasza rodzina uprawia ziemię w Naruszewie od dziesięcioleci."
            }
        ]
    }
    
    if db is None:
        return default_about
    
    try:
        content = db["site_content"].find_one({"section": "about"})
        
        if not content:
            return default_about
        
        del content["_id"]
        del content["section"]
        return content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd przy pobieraniu zawartości: {str(e)}"
        )

class GalleryImage(BaseModel):
    """Gallery image"""
    id: str
    title: str
    description: str
    photo_url: Optional[str] = None
    category: str

class GalleryContent(BaseModel):
    """Gallery content"""
    images: list[dict]

@router.post("/gallery")
async def save_gallery_content(content: GalleryContent):
    """Save gallery content"""
    db = get_db()
    
    if db is None:
        return {"message": "✓ Content saved (dev mode)"}
    
    try:
        db["site_content"].update_one(
            {"section": "gallery"},
            {
                "$set": {
                    "section": "gallery",
                    "images": content.images,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"message": "✓ Galeria zapisana"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd przy zapisywaniu: {str(e)}"
        )


@router.get("/gallery")
async def get_gallery_content():
    """Get gallery content"""
    db = get_db()
    
    default_gallery = {
        "images": [
            {"id": "1", "title": "Widok Sadu", "description": "Piękny widok na nasz sad", "category": "orchard", "photo_url": None},
            {"id": "2", "title": "Świeże Jabłka", "description": "Świeżo zebrane jabłka", "category": "apples", "photo_url": None},
            {"id": "3", "title": "Czas Zbioru", "description": "Zbieranie jabłek", "category": "harvest", "photo_url": None},
        ]
    }
    
    if db is None:
        return default_gallery
    
    try:
        content = db["site_content"].find_one({"section": "gallery"})
        
        if not content:
            return default_gallery
        
        del content["_id"]
        del content["section"]
        return content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd przy pobieraniu zawartości: {str(e)}"
        )
