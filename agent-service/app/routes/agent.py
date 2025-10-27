from fastapi import APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import AgentRequest, AgentResponse, ErrorResponse
from app.services.agent_service import travel_agent_service
from app.config.settings import settings
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate-plan", response_model=AgentResponse)
async def generate_travel_plan(request: AgentRequest):
    """
    Generate a complete AI-powered travel itinerary based on booking and preferences
    """
    try:
        logger.info(f"Generating travel plan for booking {request.booking_context.booking_id}")
        
        # Validate request
        if not request.booking_context.location and not request.booking_context.booking_id:
            raise HTTPException(status_code=400, detail="Either location or booking_id must be provided")
        
        # Generate the travel plan
        plan = await travel_agent_service.generate_travel_plan(request)
        
        logger.info(f"Successfully generated travel plan for booking {request.booking_context.booking_id}")
        return plan
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating travel plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate travel plan")

@router.post("/quick-recommendations")
async def get_quick_recommendations(
    location: str,
    interests: list,
    budget: str = "medium"
):
    """
    Get quick recommendations for a location without full itinerary
    """
    try:
        logger.info(f"Getting quick recommendations for {location}")
        
        recommendations = await travel_agent_service.get_quick_recommendations(
            location, interests, budget
        )
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting quick recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": "travel-agent",
        "version": "1.0.0",
        "timestamp": "2025-01-01T00:00:00Z"
    }

@router.get("/booking/{booking_id}/details")
async def get_booking_details(booking_id: int):
    """
    Get booking details for a specific booking ID
    """
    try:
        from app.config.database import get_booking_details
        
        booking = get_booking_details(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return booking
        
    except Exception as e:
        logger.error(f"Error getting booking details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get booking details")

@router.post("/test-ai")
async def test_ai_connection():
    """
    Test AI service connection
    """
    try:
        # Simple test to verify OpenAI connection
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'AI service is working'"}],
            temperature=0.1
        )
        
        return {
            "status": "success",
            "message": "AI service is working",
            "response": response.choices[0].message.content
        }
        
    except Exception as e:
        logger.error(f"AI service test failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI service test failed: {str(e)}")
