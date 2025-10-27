from groq import Groq
from app.config.settings import settings
from app.config.database import get_booking_details, get_user_preferences
from app.services.tavily_service import tavily_service
from app.models.schemas import AgentRequest, AgentResponse, DayPlan, PackingItem
from typing import Dict, Any, List
import json
from datetime import datetime, timedelta

class TravelAgentService:
    def __init__(self):
        self.client = Groq(api_key=settings.OPENAI_API_KEY)  # Using same env var for Groq API key
    
    async def generate_travel_plan(self, request: AgentRequest) -> AgentResponse:
        """Generate a complete travel plan based on booking and preferences"""
        try:
            # Get booking details from database
            booking_details = get_booking_details(request.booking_context.booking_id)
            if not booking_details:
                raise ValueError(f"Booking {request.booking_context.booking_id} not found")
            
            # Calculate trip duration
            start_date = request.booking_context.start_date
            end_date = request.booking_context.end_date
            num_days = (end_date - start_date).days
            
            # Get location info
            location = request.booking_context.location or f"{booking_details['city']}, {booking_details['state']}"
            
            # Search for attractions and restaurants
            attractions_info = tavily_service.search_attractions(location, request.preferences.interests)
            restaurants_info = tavily_service.search_restaurants(location, request.preferences.dietary_filters)
            weather_info = tavily_service.get_weather_forecast(location, str(start_date), str(end_date))
            
            # Generate itinerary using OpenAI
            itinerary_prompt = self._build_itinerary_prompt(
                num_days, location, start_date, end_date,
                request.booking_context.num_guests,
                request.preferences, attractions_info,
                restaurants_info, weather_info, request.custom_query
            )
            
            itinerary_response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": itinerary_prompt}
                ],
                temperature=settings.AGENT_TEMPERATURE
            )
            
            # Parse itinerary response
            itinerary_data = json.loads(itinerary_response.choices[0].message.content)
            itinerary = self._parse_itinerary(itinerary_data, start_date)
            
            # Generate packing list
            packing_prompt = self._build_packing_prompt(
                location, start_date, end_date, num_days,
                request.booking_context.num_guests,
                request.preferences.interests, weather_info
            )
            
            packing_response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": packing_prompt}
                ],
                temperature=settings.AGENT_TEMPERATURE
            )
            
            packing_data = json.loads(packing_response.choices[0].message.content)
            packing_checklist = [PackingItem(**item) for item in packing_data.get('items', [])]
            
            # Generate travel tips
            tips_prompt = self._build_tips_prompt(
                location, start_date, end_date,
                request.preferences.budget.value,
                request.preferences.interests
            )
            
            tips_response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": tips_prompt}
                ],
                temperature=settings.AGENT_TEMPERATURE
            )
            
            tips_data = json.loads(tips_response.choices[0].message.content)
            tips = tips_data.get('tips', [])
            
            # Estimate total cost
            total_cost = self._estimate_total_cost(itinerary, request.preferences.budget.value)
            
            return AgentResponse(
                itinerary=itinerary,
                packing_checklist=packing_checklist,
                weather_forecast=weather_info,
                total_estimated_cost=total_cost,
                tips=tips
            )
            
        except Exception as e:
            print(f"Error generating travel plan: {e}")
            raise
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI assistant"""
        return """You are an expert travel concierge AI assistant. Your role is to create personalized, detailed travel itineraries based on:
- Booking details (dates, location, party size)
- User preferences (budget, interests, dietary needs, mobility requirements)
- Real-time local information (weather, events, attractions)

Guidelines:
1. Create realistic, achievable day plans with proper timing
2. Consider travel time between locations
3. Respect budget constraints
4. Accommodate dietary restrictions and mobility needs
5. Balance activities with rest time
6. Provide specific, actionable recommendations
7. Include addresses and practical details
8. Be culturally sensitive and inclusive

Always respond with valid JSON format."""
    
    def _build_itinerary_prompt(self, num_days, location, start_date, end_date, num_guests, preferences, attractions_info, restaurants_info, weather_info, custom_query):
        """Build the itinerary generation prompt"""
        return f"""Create a detailed {num_days}-day itinerary for the following trip:

BOOKING DETAILS:
- Location: {location}
- Dates: {start_date} to {end_date}
- Number of guests: {num_guests}
- Party type: {preferences.party_type or 'general'}

PREFERENCES:
- Budget: {preferences.budget.value}
- Interests: {', '.join(preferences.interests)}
- Mobility needs: {preferences.mobility_needs.value if preferences.mobility_needs else 'none'}
- Dietary restrictions: {', '.join(preferences.dietary_filters) if preferences.dietary_filters else 'none'}

AVAILABLE ATTRACTIONS:
{attractions_info}

AVAILABLE RESTAURANTS:
{restaurants_info}

WEATHER FORECAST:
{weather_info}

CUSTOM REQUEST:
{custom_query or 'No specific requests'}

For each day, create:
1. MORNING (9 AM - 12 PM): 1-2 activities
2. AFTERNOON (1 PM - 5 PM): 2-3 activities
3. EVENING (6 PM - 10 PM): 1-2 activities
4. RESTAURANT RECOMMENDATIONS: 2-3 options per day

For each activity, provide:
- Title
- Address
- Price tier ($, $$, or $$$)
- Duration estimate
- Tags (matching interests)
- Wheelchair accessible (true/false)
- Child friendly (true/false)
- Brief description
- URL if available

For each restaurant, provide:
- Name
- Cuisine type
- Address
- Price tier
- Dietary options available
- Rating (if known)
- URL if available

Return ONLY valid JSON matching this structure:
{{
  "days": [
    {{
      "day_number": 1,
      "date": "2025-11-01",
      "morning": [...],
      "afternoon": [...],
      "evening": [...],
      "restaurants": [...]
    }}
  ]
}}"""
    
    def _build_packing_prompt(self, location, start_date, end_date, num_days, num_guests, interests, weather_info):
        """Build the packing list generation prompt"""
        return f"""Based on the following trip details, create a comprehensive packing checklist:

TRIP DETAILS:
- Location: {location}
- Dates: {start_date} to {end_date}
- Duration: {num_days} days
- Number of guests: {num_guests}
- Activities: {', '.join(interests)}
- Weather: {weather_info}

Create a categorized packing list with:
- Clothing (weather-appropriate)
- Accessories (based on activities)
- Documents & essentials
- Electronics
- Health & hygiene
- Activity-specific items

For each item, provide:
- Item name
- Reason why it's needed
- Category

Return ONLY valid JSON:
{{
  "items": [
    {{
      "item": "Comfortable walking shoes",
      "reason": "Extensive city exploration planned",
      "category": "clothing"
    }}
  ]
}}"""
    
    def _build_tips_prompt(self, location, start_date, end_date, budget, interests):
        """Build the travel tips generation prompt"""
        return f"""Provide 5-7 practical travel tips for a trip to {location} from {start_date} to {end_date}.

Consider:
- Budget level: {budget}
- Interests: {', '.join(interests)}
- Local insights
- Transportation
- Safety
- Best practices
- Cultural considerations

Return as a simple JSON array of strings:
{{
  "tips": ["tip1", "tip2", ...]
}}"""
    
    def _parse_itinerary(self, itinerary_data: Dict[str, Any], start_date: datetime) -> List[DayPlan]:
        """Parse itinerary data into DayPlan objects"""
        itinerary = []
        
        for day_data in itinerary_data.get('days', []):
            day_plan = DayPlan(
                day_number=day_data['day_number'],
                date=day_data['date'],
                morning=day_data.get('morning', []),
                afternoon=day_data.get('afternoon', []),
                evening=day_data.get('evening', []),
                restaurants=day_data.get('restaurants', [])
            )
            itinerary.append(day_plan)
        
        return itinerary
    
    def _estimate_total_cost(self, itinerary: List[DayPlan], budget_level: str) -> str:
        """Estimate total trip cost based on itinerary and budget"""
        base_costs = {
            'low': {'activity': 20, 'meal': 15, 'transport': 10},
            'medium': {'activity': 40, 'meal': 30, 'transport': 20},
            'high': {'activity': 80, 'meal': 60, 'transport': 40}
        }
        
        costs = base_costs.get(budget_level, base_costs['medium'])
        
        total_activities = sum(len(day.morning) + len(day.afternoon) + len(day.evening) for day in itinerary)
        total_meals = sum(len(day.restaurants) for day in itinerary)
        total_days = len(itinerary)
        
        activity_cost = total_activities * costs['activity']
        meal_cost = total_meals * costs['meal']
        transport_cost = total_days * costs['transport']
        
        total_cost = activity_cost + meal_cost + transport_cost
        
        return f"${total_cost}-${total_cost + 200}"
    
    async def get_quick_recommendations(self, location: str, interests: List[str], budget: str) -> Dict[str, Any]:
        """Get quick recommendations without full itinerary"""
        try:
            attractions_info = tavily_service.search_attractions(location, interests)
            restaurants_info = tavily_service.search_restaurants(location)
            
            return {
                "attractions": json.loads(attractions_info),
                "restaurants": json.loads(restaurants_info),
                "location": location,
                "interests": interests,
                "budget": budget
            }
        except Exception as e:
            print(f"Error getting quick recommendations: {e}")
            raise

# Singleton instance
travel_agent_service = TravelAgentService()
