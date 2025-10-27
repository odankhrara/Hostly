# Hostly AI Integration Setup Guide

## Overview
Hostly now includes comprehensive AI integration powered by OpenAI's GPT-4, providing intelligent travel planning, property recommendations, pricing optimization, and content generation.

## Features Implemented

### 🤖 AI Concierge Service
- **Personalized Travel Planning**: Generate detailed itineraries based on user preferences
- **Activity Recommendations**: AI-curated activities with accessibility information
- **Restaurant Suggestions**: Dietary preference-aware dining recommendations
- **Packing Checklists**: Location and activity-specific packing lists

### 🏠 AI Property Management
- **Smart Property Descriptions**: AI-generated compelling property listings
- **Dynamic Pricing Suggestions**: Market-aware pricing recommendations for owners
- **Property Recommendations**: AI-powered property matching for travelers
- **Revenue Optimization**: Tips for maximizing booking revenue

### 🔍 AI Search Assistant
- **Intelligent Search**: Advanced property search with AI recommendations
- **Preference Matching**: Match properties to user interests and requirements
- **Search Tips**: AI-generated search optimization suggestions

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hostly_db

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

The frontend already includes all necessary dependencies for the AI features.

### 3. Running the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

## API Endpoints

### AI Agent Routes (`/api/agent/`)

#### POST `/api/agent/concierge`
Generate personalized travel plans
```json
{
  "booking": {
    "location": "San Francisco, CA",
    "startDate": "2024-03-15",
    "endDate": "2024-03-18",
    "partyType": "family",
    "guests": 4
  },
  "preferences": {
    "budget": "medium",
    "interests": "museums, parks, beaches",
    "mobility": "stroller-friendly",
    "diet": "vegetarian"
  }
}
```

#### POST `/api/agent/property-recommendations`
Get AI-powered property recommendations
```json
{
  "searchCriteria": {
    "location": "San Francisco, CA",
    "startDate": "2024-03-15",
    "endDate": "2024-03-18",
    "guests": 4,
    "budget": "medium"
  },
  "userPreferences": {
    "interests": "museums, parks",
    "mobility": "wheelchair accessible",
    "diet": "vegan"
  }
}
```

#### POST `/api/agent/pricing-suggestions`
Get pricing optimization suggestions
```json
{
  "propertyData": {
    "location": "San Francisco, CA",
    "propertyType": "Apartment",
    "bedrooms": 2,
    "bathrooms": 1,
    "amenities": ["WiFi", "Kitchen", "Parking"]
  },
  "marketData": {
    "season": "spring",
    "demand": "high",
    "competition": "moderate"
  }
}
```

#### POST `/api/agent/generate-description`
Generate property descriptions
```json
{
  "propertyData": {
    "name": "Cozy Downtown Apartment",
    "location": "San Francisco, CA",
    "propertyType": "Apartment",
    "bedrooms": 2,
    "bathrooms": 1,
    "amenities": ["WiFi", "Kitchen", "Parking"],
    "pricePerNight": 150
  }
}
```

#### POST `/api/agent/welcome-message`
Generate personalized welcome messages
```json
{
  "guestData": {
    "guestName": "John Doe",
    "checkInDate": "2024-03-15",
    "duration": 3
  },
  "propertyData": {
    "propertyName": "Cozy Downtown Apartment",
    "location": "San Francisco, CA",
    "ownerName": "Jane Smith"
  }
}
```

#### POST `/api/agent/chat`
General AI chat assistance
```json
{
  "message": "What are the best neighborhoods in San Francisco for families?",
  "context": "travel planning"
}
```

## Usage Examples

### For Travelers
1. **AI Search Assistant**: Click the "AI Assistant" button in the traveler dashboard
2. **Travel Planning**: Use the floating AI Concierge button (bottom-right corner)
3. **Personalized Recommendations**: Get property suggestions based on your preferences

### For Property Owners
1. **AI Description Generation**: Use the "AI Generate" button in the property form
2. **Pricing Optimization**: Click "AI Pricing" for market-based pricing suggestions
3. **Revenue Tips**: Get AI-generated tips for maximizing bookings

## AI Service Architecture

### Core AI Service (`backend/src/services/ai.service.js`)
- **OpenAI Integration**: Uses GPT-4 for all AI operations
- **Error Handling**: Comprehensive error handling and logging
- **Response Parsing**: Structured JSON responses for frontend consumption
- **Context Awareness**: Maintains conversation context for better responses

### Key Features
- **Temperature Control**: Optimized temperature settings for different use cases
- **Token Management**: Efficient token usage with appropriate limits
- **Response Validation**: Ensures valid JSON responses from AI
- **Logging**: Comprehensive logging for debugging and monitoring

## Customization

### Modifying AI Prompts
Edit the prompts in `backend/src/services/ai.service.js` to customize AI behavior:

```javascript
const prompt = `
  Your custom prompt here...
  Include specific instructions for the AI
`;
```

### Adding New AI Features
1. Add new methods to `AIService` class
2. Create corresponding routes in `agent.routes.js`
3. Update frontend components to use new endpoints

### Styling Customization
The AI components use Tailwind CSS classes. Modify the styling in:
- `frontend/src/components/AgentButton.jsx`
- `frontend/src/components/AISearchAssistant.jsx`
- `frontend/src/pages/PropertyForm.jsx`

## Troubleshooting

### Common Issues

#### OpenAI API Key Issues
- Ensure your API key is valid and has sufficient credits
- Check that the key is properly set in the `.env` file
- Verify the key has the necessary permissions

#### CORS Issues
- Ensure `CORS_ORIGIN` in `.env` matches your frontend URL
- Check that both servers are running on correct ports

#### Database Connection
- Verify database credentials in `.env`
- Ensure MySQL server is running
- Check database exists and is accessible

### Debugging
- Check backend logs in `backend/logs/`
- Use browser developer tools for frontend debugging
- Monitor OpenAI API usage in the OpenAI dashboard

## Performance Considerations

### API Rate Limits
- OpenAI has rate limits based on your plan
- Implement caching for frequently requested data
- Consider implementing request queuing for high traffic

### Response Times
- AI responses may take 2-5 seconds depending on complexity
- Implement loading states for better UX
- Consider async processing for complex operations

### Cost Optimization
- Monitor OpenAI API usage and costs
- Implement response caching where appropriate
- Use appropriate model versions (GPT-4 vs GPT-3.5)

## Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly

### Input Validation
- Validate all user inputs before sending to AI
- Implement rate limiting to prevent abuse
- Sanitize AI responses before displaying

### Data Privacy
- Be mindful of data sent to OpenAI
- Consider implementing data anonymization
- Follow GDPR/privacy regulations

## Next Steps

### Potential Enhancements
1. **Image Analysis**: Add AI-powered image analysis for property photos
2. **Sentiment Analysis**: Analyze guest reviews and feedback
3. **Predictive Analytics**: Predict booking patterns and demand
4. **Multi-language Support**: Add support for multiple languages
5. **Voice Integration**: Add voice-based AI interactions

### Integration Opportunities
1. **Weather API**: Integrate weather data for better recommendations
2. **Maps API**: Add interactive maps with AI-generated routes
3. **Calendar Integration**: Sync with user calendars for trip planning
4. **Social Media**: Share AI-generated travel plans

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all dependencies are properly installed
4. Verify environment configuration

## License

This AI integration uses OpenAI's API and is subject to OpenAI's terms of service. Ensure compliance with OpenAI's usage policies and rate limits.
