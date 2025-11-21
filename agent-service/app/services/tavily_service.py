from tavily import TavilyClient
from app.config.settings import settings
from typing import List, Dict, Any
import json

class TavilySearchService:
    def __init__(self):
        self.client = None
        if settings.TAVILY_API_KEY:
            try:
                self.client = TavilyClient(api_key=settings.TAVILY_API_KEY)
            except Exception as e:
                print(f"Warning: Could not initialize Tavily client: {e}")
                self.client = None
    
    def search_attractions(self, location: str, interests: List[str]) -> str:
        """Search for attractions and activities in a location based on interests"""
        if not self.client:
            return "[]"
        try:
            interests_str = ", ".join(interests)
            query = f"Best {interests_str} attractions and activities in {location} 2025"
            
            response = self.client.search(
                query=query,
                max_results=settings.MAX_SEARCH_RESULTS,
                search_depth="advanced"
            )
            
            # Format results for LLM consumption
            results = []
            for result in response.get('results', []):
                results.append({
                    'title': result.get('title', ''),
                    'url': result.get('url', ''),
                    'content': result.get('content', '')[:500]  # Limit content length
                })
            
            return json.dumps(results, indent=2)
        except Exception as e:
            print(f"Error searching attractions: {e}")
            return "[]"
    
    def search_restaurants(self, location: str, dietary_filters: List[str] = None) -> str:
        """Search for restaurants in a location with dietary filters"""
        if not self.client:
            return "[]"
        try:
            dietary_str = ", ".join(dietary_filters) if dietary_filters else "all cuisines"
            query = f"Best restaurants with {dietary_str} options in {location} 2025 reviews ratings"
            
            response = self.client.search(
                query=query,
                max_results=settings.MAX_SEARCH_RESULTS,
                search_depth="advanced"
            )
            
            results = []
            for result in response.get('results', []):
                results.append({
                    'title': result.get('title', ''),
                    'url': result.get('url', ''),
                    'content': result.get('content', '')[:500]
                })
            
            return json.dumps(results, indent=2)
        except Exception as e:
            print(f"Error searching restaurants: {e}")
            return "[]"
    
    def get_weather_forecast(self, location: str, start_date: str, end_date: str) -> str:
        """Get weather forecast for location and dates"""
        if not self.client:
            return "Weather information unavailable"
        try:
            query = f"Weather forecast {location} from {start_date} to {end_date}"
            
            response = self.client.search(
                query=query,
                max_results=3,
                search_depth="basic"
            )
            
            # Extract and summarize weather info
            weather_info = []
            for result in response.get('results', []):
                weather_info.append(result.get('content', '')[:300])
            
            return " ".join(weather_info)
        except Exception as e:
            print(f"Error getting weather: {e}")
            return "Weather information unavailable"
    
    def search_local_events(self, location: str, start_date: str, end_date: str) -> str:
        """Search for local events during the travel dates"""
        if not self.client:
            return "[]"
        try:
            query = f"Local events and festivals in {location} between {start_date} and {end_date}"
            
            response = self.client.search(
                query=query,
                max_results=5,
                search_depth="advanced"
            )
            
            results = []
            for result in response.get('results', []):
                results.append({
                    'title': result.get('title', ''),
                    'url': result.get('url', ''),
                    'content': result.get('content', '')[:400]
                })
            
            return json.dumps(results, indent=2)
        except Exception as e:
            print(f"Error searching events: {e}")
            return "[]"

# Singleton instance
tavily_service = TavilySearchService()
