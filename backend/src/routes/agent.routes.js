const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const { Property, Booking, User } = require('../models');
const Logger = require('../config/logger');

const logger = new Logger('AgentRoutes');

/**
 * POST /api/agent/concierge
 * Generate personalized travel plan based on user preferences
 */
router.post('/concierge', async (req, res) => {
  try {
    const { booking, preferences } = req.body;

    // Validate required fields
    if (!booking || !preferences) {
      return res.status(400).json({ 
        message: 'Missing required fields: booking and preferences' 
      });
    }

    const { location, startDate, endDate, partyType, guests } = booking;
    if (!location || !startDate || !endDate || !partyType || !guests) {
      return res.status(400).json({ 
        message: 'Missing required booking fields: location, startDate, endDate, partyType, guests' 
      });
    }

    logger.info(`Generating travel plan for ${partyType} visiting ${location}`);

    // Generate AI-powered travel plan
    const travelPlan = await aiService.generateTravelPlan(booking, preferences);

    res.json(travelPlan);

  } catch (error) {
    logger.error('Concierge service error:', error);
    res.status(500).json({ 
      message: 'Failed to generate travel plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/agent/property-recommendations
 * Get AI-powered property recommendations based on search criteria
 */
router.post('/property-recommendations', async (req, res) => {
  try {
    const { searchCriteria, userPreferences } = req.body;

    if (!searchCriteria) {
      return res.status(400).json({ 
        message: 'Missing required field: searchCriteria' 
      });
    }

    const { location, startDate, endDate, guests, budget } = searchCriteria;
    if (!location || !startDate || !endDate || !guests) {
      return res.status(400).json({ 
        message: 'Missing required search fields: location, startDate, endDate, guests' 
      });
    }

    logger.info(`Generating property recommendations for ${location}`);

    // Generate AI-powered recommendations
    const recommendations = await aiService.generatePropertyRecommendations(
      searchCriteria, 
      userPreferences
    );

    // Also get actual properties from database that match criteria
    const cityName = location.split(',')[0].trim(); // Extract city from location
    const properties = await Property.find({
      city: cityName,
      max_guests: { $gte: parseInt(guests) }
    })
      .limit(10)
      .sort({ createdAt: -1 });

    res.json({
      ...recommendations,
      matchingProperties: properties
    });

  } catch (error) {
    logger.error('Property recommendations error:', error);
    res.status(500).json({ 
      message: 'Failed to generate property recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/agent/pricing-suggestions
 * Get AI-powered pricing suggestions for property owners
 */
router.post('/pricing-suggestions', async (req, res) => {
  try {
    const { propertyData, marketData } = req.body;

    if (!propertyData) {
      return res.status(400).json({ 
        message: 'Missing required field: propertyData' 
      });
    }

    const { location, propertyType, bedrooms, bathrooms, amenities } = propertyData;
    if (!location || !propertyType || !bedrooms || !bathrooms) {
      return res.status(400).json({ 
        message: 'Missing required property fields: location, propertyType, bedrooms, bathrooms' 
      });
    }

    logger.info(`Generating pricing suggestions for ${propertyType} in ${location}`);

    // Generate AI-powered pricing suggestions
    const pricingSuggestions = await aiService.generatePricingSuggestions(
      propertyData, 
      marketData
    );

    res.json(pricingSuggestions);

  } catch (error) {
    logger.error('Pricing suggestions error:', error);
    res.status(500).json({ 
      message: 'Failed to generate pricing suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/agent/generate-description
 * Generate compelling property description using AI
 */
router.post('/generate-description', async (req, res) => {
  try {
    const { propertyData } = req.body;

    if (!propertyData) {
      return res.status(400).json({ 
        message: 'Missing required field: propertyData' 
      });
    }

    const { name, location, propertyType, bedrooms, bathrooms, amenities, pricePerNight } = propertyData;
    if (!name || !location || !propertyType || !bedrooms || !bathrooms) {
      return res.status(400).json({ 
        message: 'Missing required property fields: name, location, propertyType, bedrooms, bathrooms' 
      });
    }

    logger.info(`Generating description for ${name} in ${location}`);

    // Generate AI-powered property description
    const description = await aiService.generatePropertyDescription(propertyData);

    res.json(description);

  } catch (error) {
    logger.error('Description generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate property description',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/agent/welcome-message
 * Generate personalized welcome message for guests
 */
router.post('/welcome-message', async (req, res) => {
  try {
    const { guestData, propertyData } = req.body;

    if (!guestData || !propertyData) {
      return res.status(400).json({ 
        message: 'Missing required fields: guestData and propertyData' 
      });
    }

    const { guestName, checkInDate, duration } = guestData;
    const { propertyName, location, ownerName } = propertyData;

    if (!guestName || !checkInDate || !propertyName || !location) {
      return res.status(400).json({ 
        message: 'Missing required fields: guestName, checkInDate, propertyName, location' 
      });
    }

    logger.info(`Generating welcome message for ${guestName}`);

    // Generate AI-powered welcome message
    const welcomeMessage = await aiService.generateWelcomeMessage(
      guestData, 
      propertyData
    );

    res.json(welcomeMessage);

  } catch (error) {
    logger.error('Welcome message generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate welcome message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/agent/chat
 * Simple chat endpoint for general AI assistance
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ 
        message: 'Missing required field: message' 
      });
    }

    logger.info('Processing chat message');

    // Simple chat response using Groq
    const completion = await aiService.groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are Hostly AI Assistant, a helpful travel and accommodation assistant. 
                   You help users with travel planning, property recommendations, booking assistance, 
                   and general travel-related questions. Be friendly, helpful, and informative.
                   ${context ? `Context: ${context}` : ''}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;

    res.json({
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({ 
      message: 'Failed to process chat message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
