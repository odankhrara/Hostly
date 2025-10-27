from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

SYSTEM_PROMPT = """You are an expert travel concierge AI assistant. Your role is to create personalized, detailed travel itineraries based on:
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

Output Format:
- Structured JSON with clear day-by-day plans
- Activity cards with all required fields
- Restaurant recommendations with dietary filters applied
- Weather-appropriate packing list
- Practical tips and insights
"""

ITINERARY_PROMPT_TEMPLATE = """Create a detailed {num_days}-day itinerary for the following trip:

BOOKING DETAILS:
- Location: {location}
- Dates: {start_date} to {end_date}
- Number of guests: {num_guests}
- Party type: {party_type}

PREFERENCES:
- Budget: {budget}
- Interests: {interests}
- Mobility needs: {mobility_needs}
- Dietary restrictions: {dietary_filters}

AVAILABLE ATTRACTIONS:
{attractions_info}

AVAILABLE RESTAURANTS:
{restaurants_info}

WEATHER FORECAST:
{weather_info}

CUSTOM REQUEST:
{custom_query}

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
{
  "days": [
    {
      "day_number": 1,
      "date": "2025-11-01",
      "morning": [...],
      "afternoon": [...],
      "evening": [...],
      "restaurants": [...]
    }
  ]
}
"""

PACKING_PROMPT_TEMPLATE = """Based on the following trip details, create a comprehensive packing checklist:

TRIP DETAILS:
- Location: {location}
- Dates: {start_date} to {end_date}
- Duration: {num_days} days
- Number of guests: {num_guests}
- Activities: {interests}
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
{
  "items": [
    {
      "item": "Comfortable walking shoes",
      "reason": "Extensive city exploration planned",
      "category": "clothing"
    }
  ]
}
"""

TIPS_PROMPT_TEMPLATE = """Provide 5-7 practical travel tips for a trip to {location} from {start_date} to {end_date}.

Consider:
- Budget level: {budget}
- Interests: {interests}
- Local insights
- Transportation
- Safety
- Best practices
- Cultural considerations

Return as a simple JSON array of strings:
{
  "tips": ["tip1", "tip2", ...]
}
"""

def get_itinerary_prompt():
    """Get the itinerary generation prompt template"""
    return ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
        HumanMessagePromptTemplate.from_template(ITINERARY_PROMPT_TEMPLATE)
    ])

def get_packing_prompt():
    """Get the packing list generation prompt template"""
    return ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
        HumanMessagePromptTemplate.from_template(PACKING_PROMPT_TEMPLATE)
    ])

def get_tips_prompt():
    """Get the travel tips generation prompt template"""
    return ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
        HumanMessagePromptTemplate.from_template(TIPS_PROMPT_TEMPLATE)
    ])
