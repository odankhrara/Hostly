const Groq = require('groq-sdk');
const Logger = require('../config/logger');

const logger = new Logger('AIService');

class AIService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.OPENAI_API_KEY, // Using the same env var for Groq API key
    });
  }

  /**
   * Generate personalized travel itinerary based on user preferences
   */
  async generateTravelPlan(bookingData, preferences) {
    try {
      const { location, startDate, endDate, partyType, guests } = bookingData;
      const { budget, interests, mobility, diet } = preferences;

      // Calculate trip duration
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      const prompt = `
        Create a detailed ${duration}-day travel itinerary for ${partyType} visiting ${location}.
        
        Travel Details:
        - Duration: ${duration} days
        - Party Type: ${partyType}
        - Number of Guests: ${guests}
        - Budget Level: ${budget}
        - Interests: ${interests}
        - Mobility Requirements: ${mobility}
        - Dietary Preferences: ${diet}
        
        Please provide:
        1. Daily itinerary with morning, afternoon, and evening activities
        2. Recommended activities with addresses and accessibility info
        3. Restaurant suggestions matching dietary preferences
        4. Packing checklist based on location, season, and activities
        
        IMPORTANT: Respond with ONLY valid JSON. No additional text before or after.
        
        Required JSON structure:
        {
          "plan": [
            {
              "date": "2025-11-11",
              "morning": "Visit San Jose Museum of Art and explore downtown",
              "afternoon": "Walk through Municipal Rose Garden and enjoy nature",
              "evening": "Dine at local vegan restaurant and explore nightlife"
            }
          ],
          "activities": [
            {
              "title": "San Jose Museum of Art",
              "address": "110 S Market St, San Jose, CA 95113",
              "tags": ["art", "culture", "museums"],
              "childFriendly": true,
              "wheelchair": true
            },
            {
              "title": "Municipal Rose Garden",
              "address": "1649 Naglee Ave, San Jose, CA 95126",
              "tags": ["nature", "parks", "outdoor"],
              "childFriendly": true,
              "wheelchair": true
            }
          ],
          "restaurants": [
            {
              "name": "Good Karma Artisan Ales & Cafe",
              "cuisine": "Vegan American",
              "price": "$$"
            },
            {
              "name": "Vegetarian House",
              "cuisine": "Vegetarian Asian",
              "price": "$$"
            }
          ],
          "checklist": [
            "Comfortable walking shoes",
            "Weather-appropriate clothing",
            "Camera for photos",
            "Travel documents",
            "Reusable water bottle",
            "Sunscreen",
            "Portable phone charger"
          ]
        }
      `;

      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a professional travel concierge AI assistant. Provide detailed, practical, and personalized travel recommendations. You MUST respond with ONLY valid JSON format. Do not include any text before or after the JSON. The JSON must include all required fields: plan (array of daily itineraries), activities (array of activity objects), restaurants (array of restaurant objects), and checklist (array of packing items)."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const response = completion.choices[0].message.content;
      logger.info('Raw AI response:', response.substring(0, 200) + '...');
      
      // Try to extract JSON from the response if it's wrapped in markdown or other text
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean the JSON string by removing control characters
          const cleanJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
          const parsedResponse = JSON.parse(cleanJson);
          
          // Validate that we have the required fields
          if (parsedResponse.plan && parsedResponse.activities && parsedResponse.restaurants && parsedResponse.checklist) {
            logger.info('Travel plan generated successfully');
            return parsedResponse;
          } else {
            logger.warn('AI response missing required fields, using fallback');
            return this.getFallbackResponse();
          }
        } catch (parseError) {
          logger.warn('JSON parsing failed, using fallback format:', parseError.message);
          return this.getFallbackResponse();
        }
      } else {
        // If no JSON found, return a structured response with the raw text
        logger.warn('No JSON found in AI response, using fallback format');
        return this.getFallbackResponse();
      }

    } catch (error) {
      logger.error('Error generating travel plan:', error);
      throw new Error('Failed to generate travel plan');
    }
  }

  /**
   * Get fallback response when AI fails to generate proper JSON
   */
  getFallbackResponse() {
    return {
      plan: [
        { 
          date: "2024-01-01", 
          morning: "Visit local museums and cultural sites", 
          afternoon: "Explore parks and outdoor activities", 
          evening: "Enjoy local dining and entertainment" 
        }
      ],
      activities: [
        {
          title: "Local Museum Visit",
          address: "Check local listings for museums in your destination",
          tags: ["culture", "education"],
          childFriendly: true,
          wheelchair: true
        },
        {
          title: "City Park Exploration",
          address: "Local parks and green spaces",
          tags: ["outdoor", "nature"],
          childFriendly: true,
          wheelchair: true
        }
      ],
      restaurants: [
        {
          name: "Local Cuisine Restaurant",
          cuisine: "Local specialties",
          price: "$$"
        }
      ],
      checklist: [
        "Comfortable walking shoes",
        "Weather-appropriate clothing",
        "Camera or smartphone",
        "Travel documents",
        "Local currency",
        "Travel essentials"
      ]
    };
  }

  /**
   * Generate property recommendations based on user preferences and search criteria
   */
  async generatePropertyRecommendations(searchCriteria, userPreferences = {}) {
    try {
      const { location, startDate, endDate, guests, budget } = searchCriteria;
      const { interests, mobility, diet } = userPreferences;

      const prompt = `
        Based on the following search criteria, suggest 5-7 property types and features that would be ideal:
        
        Search Criteria:
        - Location: ${location}
        - Dates: ${startDate} to ${endDate}
        - Guests: ${guests}
        - Budget: ${budget}
        
        User Preferences:
        - Interests: ${interests || 'general travel'}
        - Mobility: ${mobility || 'standard'}
        - Diet: ${diet || 'no restrictions'}
        
        Provide recommendations for:
        1. Property types (apartment, house, villa, etc.)
        2. Essential amenities
        3. Location preferences within the city
        4. Special considerations based on user preferences
        
        Format as JSON:
        {
          "recommendations": [
            {
              "propertyType": "type",
              "amenities": ["amenity1", "amenity2"],
              "locationNotes": "description",
              "specialConsiderations": "notes"
            }
          ],
          "searchTips": ["tip1", "tip2", "tip3"]
        }
      `;

      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a property recommendation AI assistant. Provide helpful suggestions for property searches based on user preferences and travel needs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content;
      
      // Try to extract JSON from the response if it's wrapped in markdown or other text
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean the JSON string by removing control characters
          const cleanJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
          const parsedResponse = JSON.parse(cleanJson);
          logger.info('Property recommendations generated successfully');
          return parsedResponse;
        } catch (parseError) {
          logger.warn('JSON parsing failed, using fallback format:', parseError.message);
          return {
            recommendations: [],
            searchTips: ["Consider your budget and preferences"]
          };
        }
      } else {
        // If no JSON found, return a structured response with the raw text
        logger.info('Property recommendations generated successfully (fallback format)');
        return {
          recommendations: [],
          searchTips: ["Consider your budget and preferences"]
        };
      }

    } catch (error) {
      logger.error('Error generating property recommendations:', error);
      throw new Error('Failed to generate property recommendations');
    }
  }

  /**
   * Generate optimized pricing suggestions for property owners
   */
  async generatePricingSuggestions(propertyData, marketData = {}) {
    try {
      const { location, propertyType, bedrooms, bathrooms, amenities } = propertyData;
      const { season, demand, competition } = marketData;

      const prompt = `
        Analyze the following property and provide pricing recommendations:
        
        Property Details:
        - Location: ${location}
        - Type: ${propertyType}
        - Bedrooms: ${bedrooms}
        - Bathrooms: ${bathrooms}
        - Amenities: ${amenities.join(', ')}
        
        Market Context:
        - Season: ${season || 'year-round'}
        - Demand Level: ${demand || 'medium'}
        - Competition: ${competition || 'moderate'}
        
        Provide:
        1. Base nightly rate recommendation
        2. Seasonal pricing adjustments
        3. Weekend vs weekday pricing
        4. Minimum stay recommendations
        5. Revenue optimization tips
        
        Format as JSON:
        {
          "basePrice": number,
          "seasonalAdjustments": {
            "high": number,
            "low": number
          },
          "weekendMultiplier": number,
          "minStayRecommendation": number,
          "tips": ["tip1", "tip2", "tip3"]
        }
      `;

      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a revenue optimization AI assistant for property owners. Provide data-driven pricing recommendations to maximize revenue while remaining competitive."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const response = completion.choices[0].message.content;
      
      // Try to extract JSON from the response if it's wrapped in markdown or other text
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean the JSON string by removing control characters
          const cleanJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
          const parsedResponse = JSON.parse(cleanJson);
          logger.info('Pricing suggestions generated successfully');
          return parsedResponse;
        } catch (parseError) {
          logger.warn('JSON parsing failed, using fallback format:', parseError.message);
          return {
            basePrice: 100,
            seasonalAdjustments: { high: 150, low: 80 },
            weekendMultiplier: 1.2,
            minStayRecommendation: 2,
            tips: ["Consider market demand", "Adjust for seasonality"]
          };
        }
      } else {
        // If no JSON found, return a structured response with the raw text
        logger.info('Pricing suggestions generated successfully (fallback format)');
        return {
          basePrice: 100,
          seasonalAdjustments: { high: 150, low: 80 },
          weekendMultiplier: 1.2,
          minStayRecommendation: 2,
          tips: ["Consider market demand", "Adjust for seasonality"]
        };
      }

    } catch (error) {
      logger.error('Error generating pricing suggestions:', error);
      throw new Error('Failed to generate pricing suggestions');
    }
  }

  /**
   * Generate compelling property descriptions
   */
  async generatePropertyDescription(propertyData) {
    try {
      const { name, location, propertyType, bedrooms, bathrooms, amenities, pricePerNight } = propertyData;

      const prompt = `
        Write a compelling property description for a vacation rental listing:
        
        Property Details:
        - Name: ${name}
        - Location: ${location}
        - Type: ${propertyType}
        - Bedrooms: ${bedrooms}
        - Bathrooms: ${bathrooms}
        - Price per night: $${pricePerNight}
        - Amenities: ${amenities.join(', ')}
        
        Requirements:
        - 150-200 words
        - Highlight unique features
        - Appeal to target audience
        - Include location benefits
        - Professional but warm tone
        - SEO-friendly keywords
        
        Format as JSON:
        {
          "description": "full description text",
          "highlights": ["highlight1", "highlight2", "highlight3"],
          "keywords": ["keyword1", "keyword2", "keyword3"]
        }
      `;

      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a professional copywriter specializing in vacation rental listings. Create compelling, accurate descriptions that attract guests while setting proper expectations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0].message.content;
      
      // Try to extract JSON from the response if it's wrapped in markdown or other text
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean the JSON string by removing control characters
          const cleanJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
          const parsedResponse = JSON.parse(cleanJson);
          logger.info('Property description generated successfully');
          return parsedResponse;
        } catch (parseError) {
          logger.warn('JSON parsing failed, using fallback format:', parseError.message);
          // If JSON parsing fails, return a structured response with the raw text
          return {
            description: response,
            highlights: ["AI-generated description"],
            keywords: ["property", "rental", "accommodation"]
          };
        }
      } else {
        // If no JSON found, return a structured response with the raw text
        logger.info('Property description generated successfully (fallback format)');
        return {
          description: response,
          highlights: ["AI-generated description"],
          keywords: ["property", "rental", "accommodation"]
        };
      }

    } catch (error) {
      logger.error('Error generating property description:', error);
      throw new Error('Failed to generate property description');
    }
  }

  /**
   * Generate personalized welcome message for guests
   */
  async generateWelcomeMessage(guestData, propertyData) {
    try {
      const { guestName, checkInDate, duration } = guestData;
      const { propertyName, location, ownerName } = propertyData;

      const prompt = `
        Create a warm, personalized welcome message for a guest:
        
        Guest Details:
        - Name: ${guestName}
        - Check-in: ${checkInDate}
        - Stay Duration: ${duration} days
        
        Property Details:
        - Property Name: ${propertyName}
        - Location: ${location}
        - Host Name: ${ownerName}
        
        Requirements:
        - Warm and welcoming tone
        - Include key check-in information
        - Mention local recommendations
        - Offer assistance
        - Professional but personal
        
        Format as JSON:
        {
          "subject": "Welcome message subject",
          "message": "full welcome message",
          "checkInInstructions": ["instruction1", "instruction2"],
          "localTips": ["tip1", "tip2", "tip3"]
        }
      `;

      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a hospitality AI assistant. Create warm, helpful welcome messages that make guests feel valued and informed."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 600,
      });

      const response = completion.choices[0].message.content;
      
      // Try to extract JSON from the response if it's wrapped in markdown or other text
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean the JSON string by removing control characters
          const cleanJson = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, '');
          const parsedResponse = JSON.parse(cleanJson);
          logger.info('Welcome message generated successfully');
          return parsedResponse;
        } catch (parseError) {
          logger.warn('JSON parsing failed, using fallback format:', parseError.message);
          return {
            subject: "Welcome to your stay!",
            message: response,
            checkInInstructions: ["Check-in instructions will be provided"],
            localTips: ["Enjoy your stay!"]
          };
        }
      } else {
        // If no JSON found, return a structured response with the raw text
        logger.info('Welcome message generated successfully (fallback format)');
        return {
          subject: "Welcome to your stay!",
          message: response,
          checkInInstructions: ["Check-in instructions will be provided"],
          localTips: ["Enjoy your stay!"]
        };
      }

    } catch (error) {
      logger.error('Error generating welcome message:', error);
      throw new Error('Failed to generate welcome message');
    }
  }
}

module.exports = new AIService();
