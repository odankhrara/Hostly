const express = require('express');
const router = express.Router();
const { Property } = require('../models');


// GET /api/properties/search - Search properties
router.get('/search', async (req, res) => {
  try {
    const { location, startDate, endDate, guests } = req.query;
    
    // Get all properties from database
    const properties = await Property.findAll({
      order: [['created_at', 'DESC']]
    });

    // Format the response to match frontend expectations
    const formattedProperties = properties.map(property => ({
      id: property.id,
      name: property.name,
      location: `${property.city}, ${property.state}`,
      property_type: property.property_type,
      price_per_night: parseFloat(property.price_per_night),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      max_guests: property.max_guests,
      amenities: property.amenities ? property.amenities.split(',') : [],
      main_image: property.main_image
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
    
    // Find property by ID from database
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Format the response to match frontend expectations
    const formattedProperty = {
      id: property.id,
      name: property.name,
      location: `${property.city}, ${property.state}`,
      property_type: property.property_type,
      price_per_night: parseFloat(property.price_per_night),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      max_guests: property.max_guests,
      amenities: property.amenities ? property.amenities.split(',') : [],
      main_image: property.main_image,
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
