from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from enum import Enum

class BudgetLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class MobilityLevel(str, Enum):
    NONE = "none"
    WHEELCHAIR = "wheelchair"
    LIMITED = "limited"
    ELDERLY = "elderly"

# Input Models
class TravelPreferences(BaseModel):
    budget: BudgetLevel = Field(..., description="Budget level for the trip")
    interests: List[str] = Field(..., description="List of interests (e.g., museums, food, nature)")
    mobility_needs: Optional[MobilityLevel] = Field(None, description="Mobility requirements")
    dietary_filters: Optional[List[str]] = Field(None, description="Dietary restrictions (e.g., vegetarian, vegan, gluten-free)")
    party_type: Optional[str] = Field(None, description="Type of party (e.g., family, couple, solo, friends)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "budget": "medium",
                "interests": ["museums", "food", "nature"],
                "mobility_needs": "none",
                "dietary_filters": ["vegetarian"],
                "party_type": "couple"
            }
        }

class BookingContext(BaseModel):
    booking_id: int = Field(..., description="ID of the booking")
    location: Optional[str] = Field(None, description="Location of the property")
    start_date: date = Field(..., description="Check-in date")
    end_date: date = Field(..., description="Check-out date")
    num_guests: int = Field(..., gt=0, description="Number of guests")
    
    @validator('end_date')
    def end_date_must_be_after_start(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "booking_id": 1,
                "location": "San Francisco, CA",
                "start_date": "2025-11-01",
                "end_date": "2025-11-05",
                "num_guests": 2
            }
        }

class AgentRequest(BaseModel):
    booking_context: BookingContext
    preferences: TravelPreferences
    custom_query: Optional[str] = Field(None, description="Free-text custom request from user")
    
    class Config:
        json_schema_extra = {
            "example": {
                "booking_context": {
                    "booking_id": 1,
                    "location": "San Francisco, CA",
                    "start_date": "2025-11-01",
                    "end_date": "2025-11-05",
                    "num_guests": 2
                },
                "preferences": {
                    "budget": "medium",
                    "interests": ["museums", "food", "art"],
                    "mobility_needs": None,
                    "dietary_filters": ["vegetarian"],
                    "party_type": "couple"
                },
                "custom_query": "We love art galleries and good coffee shops"
            }
        }

# Output Models
class ActivityCard(BaseModel):
    title: str
    address: str
    price_tier: str  # $, $$, $$$
    duration: str  # e.g., "2-3 hours"
    tags: List[str]
    wheelchair_accessible: bool
    child_friendly: bool
    description: Optional[str] = None
    url: Optional[str] = None

class RestaurantRec(BaseModel):
    name: str
    cuisine: str
    address: str
    price_tier: str
    dietary_options: List[str]
    rating: Optional[float] = None
    url: Optional[str] = None

class DayPlan(BaseModel):
    day_number: int
    date: str
    morning: List[ActivityCard]
    afternoon: List[ActivityCard]
    evening: List[ActivityCard]
    restaurants: List[RestaurantRec]

class PackingItem(BaseModel):
    item: str
    reason: str
    category: str  # clothing, accessories, documents, etc.

class AgentResponse(BaseModel):
    itinerary: List[DayPlan]
    packing_checklist: List[PackingItem]
    weather_forecast: str
    total_estimated_cost: Optional[str] = None
    tips: Optional[List[str]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "itinerary": [],
                "packing_checklist": [],
                "weather_forecast": "Sunny with temperatures ranging from 60-75°F",
                "total_estimated_cost": "$300-500",
                "tips": ["Book museum tickets in advance", "Use public transportation"]
            }
        }

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
