const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Property } = require('../models');


// GET /api/properties/search - Search properties
router.get('/search', async (req, res) => {
  try {
    const { location, startDate, endDate, guests } = req.query;
    
    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid date format. Please use YYYY-MM-DD format.',
          error: 'INVALID_DATE_FORMAT'
        });
      }
      
      // Normalize dates to start of day for comparison
      start.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      // Allow today and future dates (check-in can be today)
      if (start < today) {
        return res.status(400).json({ 
          message: 'Check-in date cannot be in the past.',
          error: 'CHECKIN_IN_PAST'
        });
      }
      
      // Check if check-out is before check-in
      if (end <= start) {
        return res.status(400).json({ 
          message: 'Check-out date must be after check-in date.',
          error: 'INVALID_DATE_RANGE'
        });
      }
      
      // Check if date range is too long (more than 1 year)
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        return res.status(400).json({ 
          message: 'Stay duration cannot exceed 365 days.',
          error: 'STAY_TOO_LONG'
        });
      }
    }
    
    // Build search conditions for Mongoose
    const queryConditions = {};
    
    // Filter by location (city, state, or country)
    if (location && location.trim()) {
      const locationRegex = new RegExp(location.trim(), 'i'); // Case-insensitive
      queryConditions.$or = [
        { city: locationRegex },
        { state: locationRegex },
        { country: locationRegex }
      ];
    }
    
    // Filter by guest capacity
    if (guests && !isNaN(guests)) {
      queryConditions.max_guests = { $gte: parseInt(guests) };
    }
    
    // Exclude test properties (properties with "test" in the name)
    queryConditions.name = { $not: /^test\s+property|testproperty|test\s*property|^dummy\s+property|^sample\s+property|^example\s+property/i };
    
    // Get properties from database with filters
    const properties = await Property.find(queryConditions)
      .sort({ createdAt: -1 });

    // Format the response to match frontend expectations
    const formattedProperties = properties.map(property => ({
      id: property._id.toString(),
      name: property.name,
      location: `${property.city}, ${property.state}`,
      property_type: property.property_type,
      price_per_night: parseFloat(property.price_per_night),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      max_guests: property.max_guests,
      amenities: property.amenities ? property.amenities.split(',') : [],
      main_image: property.main_image,
      tax_rate: parseFloat(property.tax_rate || 0)
    }));

    res.json({ properties: formattedProperties });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// GET /api/properties/:id - Get single property details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }
    
    // Find property by ID from database
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Format the response to match frontend expectations
    const formattedProperty = {
      id: property._id.toString(),
      name: property.name,
      location: `${property.city}, ${property.state}`,
      property_type: property.property_type,
      price_per_night: parseFloat(property.price_per_night),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      max_guests: property.max_guests,
      amenities: property.amenities ? property.amenities.split(',') : [],
      main_image: property.main_image,
      tax_rate: parseFloat(property.tax_rate || 0),
      description: property.description,
      photos: [
        property.main_image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=entropy&cs=tinysrgb',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&crop=entropy&cs=tinysrgb',
        'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=400&h=300&fit=crop&crop=entropy&cs=tinysrgb',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&crop=entropy&cs=tinysrgb'
      ]
    };

    res.json({ property: formattedProperty });
  } catch (error) {
    console.error('Property details error:', error);
    res.status(500).json({ message: 'Failed to fetch property details' });
  }
});

module.exports = router;
