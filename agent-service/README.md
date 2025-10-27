# Hostly AI Travel Agent Service

A sophisticated AI-powered travel concierge service built with FastAPI, LangChain, and OpenAI GPT-4.

## Features

- **Personalized Itineraries**: AI-generated day-by-day travel plans
- **Real-time Information**: Live data from Tavily search API
- **Smart Recommendations**: Context-aware activity and restaurant suggestions
- **Accessibility Support**: Mobility and dietary requirement considerations
- **Packing Lists**: Weather and activity-specific packing recommendations
- **Cost Estimation**: Budget-aware pricing suggestions

## Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key
- Tavily API key (optional, for enhanced search)
- MySQL database (for booking integration)

### Installation

1. **Clone and setup**:
   ```bash
   cd agent-service
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database credentials
   ```

3. **Run the service**:
   ```bash
   source venv/bin/activate
   python -m app.main
   ```

The service will be available at `http://localhost:8000`

## API Endpoints

### Core Endpoints

- `POST /api/agent/generate-plan` - Generate complete travel itinerary
- `POST /api/agent/quick-recommendations` - Get quick location recommendations
- `GET /api/agent/health` - Health check
- `GET /api/agent/booking/{id}/details` - Get booking details
- `POST /api/agent/test-ai` - Test AI service connection

### Documentation

- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## Usage Examples

### Generate Complete Travel Plan

```python
import requests

request_data = {
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

response = requests.post(
    "http://localhost:8000/api/agent/generate-plan",
    json=request_data
)

plan = response.json()
```

### Get Quick Recommendations

```python
response = requests.post(
    "http://localhost:8000/api/agent/quick-recommendations",
    params={
        "location": "San Francisco, CA",
        "interests": ["museums", "food"],
        "budget": "medium"
    }
)

recommendations = response.json()
```

## Configuration

### Environment Variables

```env
# API Keys
OPENAI_API_KEY=your_openai_key_here
TAVILY_API_KEY=your_tavily_key_here

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hostly_db
DB_PORT=3306

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Agent
AGENT_MODEL=gpt-4
AGENT_TEMPERATURE=0.7
MAX_SEARCH_RESULTS=5
```

## Architecture

### Core Components

1. **Agent Service** (`app/services/agent_service.py`)
   - Main orchestration logic
   - LLM integration with LangChain
   - Response parsing and validation

2. **Tavily Service** (`app/services/tavily_service.py`)
   - Real-time web search integration
   - Attraction and restaurant discovery
   - Weather and event information

3. **Database Integration** (`app/config/database.py`)
   - MySQL connection management
   - Booking and user data retrieval

4. **Prompt Engineering** (`app/utils/prompts.py`)
   - Structured prompt templates
   - Context-aware prompt generation

5. **Data Models** (`app/models/schemas.py`)
   - Pydantic models for request/response validation
   - Type-safe data structures

### Request Flow

1. **Request Validation**: Pydantic models validate input
2. **Data Retrieval**: Fetch booking details from database
3. **Information Gathering**: Search for attractions, restaurants, weather
4. **AI Processing**: Generate itinerary using GPT-4
5. **Response Assembly**: Parse and structure final response

## Integration with Hostly

### Node.js Backend Integration

The Python service can be integrated with your existing Node.js backend:

```javascript
// In your Node.js backend
const axios = require('axios');

async function generateTravelPlan(bookingId, preferences) {
  try {
    const response = await axios.post('http://localhost:8000/api/agent/generate-plan', {
      booking_context: {
        booking_id: bookingId,
        // ... other context
      },
      preferences: preferences
    });
    
    return response.data;
  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
}
```

### Frontend Integration

```javascript
// In your React frontend
const generatePlan = async (formData) => {
  try {
    const response = await fetch('http://localhost:8000/api/agent/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const plan = await response.json();
    return plan;
  } catch (error) {
    console.error('Error generating plan:', error);
    throw error;
  }
};
```

## Development

### Running in Development

```bash
# With auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing

```bash
# Run tests (when implemented)
pytest tests/
```

### Docker Support

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Issues**
   - Verify key is valid and has sufficient credits
   - Check key is properly set in `.env`

2. **Database Connection Issues**
   - Verify MySQL is running
   - Check database credentials
   - Ensure database exists

3. **Tavily API Issues**
   - Service works without Tavily (uses fallback data)
   - Get free API key from tavily.com

### Debugging

```bash
# Enable debug logging
export DEBUG=True
python -m app.main

# Check logs
tail -f logs/app.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
