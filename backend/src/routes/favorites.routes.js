const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Favorite, Property, User } = require('../models');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// GET /api/favorites - Get user's favorite properties
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const favorites = await Favorite.find({ traveler_id: new mongoose.Types.ObjectId(userId) })
      .populate('property_id', 'name city state property_type price_per_night bedrooms bathrooms max_guests main_image')
      .sort({ createdAt: -1 });

    // Format the response to match frontend expectations
    const formattedFavorites = favorites.map(favorite => ({
      id: favorite.property_id._id.toString(),
      name: favorite.property_id.name,
      location: `${favorite.property_id.city}, ${favorite.property_id.state}`,
      property_type: favorite.property_id.property_type,
      price_per_night: parseFloat(favorite.property_id.price_per_night),
      bedrooms: favorite.property_id.bedrooms,
      bathrooms: favorite.property_id.bathrooms,
      max_guests: favorite.property_id.max_guests,
      main_image: favorite.property_id.main_image,
      favorited_at: favorite.createdAt
    }));

    res.json({ favorites: formattedFavorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

// POST /api/favorites - Add property to favorites
router.post('/', requireAuth, async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.session.user.id;

    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      traveler_id: new mongoose.Types.ObjectId(userId),
      property_id: new mongoose.Types.ObjectId(propertyId)
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    // Add to favorites
    const favorite = await Favorite.create({
      traveler_id: new mongoose.Types.ObjectId(userId),
      property_id: new mongoose.Types.ObjectId(propertyId)
    });

    res.status(201).json({ 
      message: 'Property added to favorites',
      favorite: {
        id: favorite._id.toString(),
        traveler_id: favorite.traveler_id.toString(),
        property_id: favorite.property_id.toString(),
        created_at: favorite.createdAt
      }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    // Handle duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }
    res.status(500).json({ message: 'Failed to add to favorites' });
  }
});

// DELETE /api/favorites/:propertyId - Remove property from favorites
router.delete('/:propertyId', requireAuth, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.session.user.id;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const favorite = await Favorite.findOneAndDelete({
      traveler_id: new mongoose.Types.ObjectId(userId),
      property_id: new mongoose.Types.ObjectId(propertyId)
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Property not found in favorites' });
    }

    res.json({ message: 'Property removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Failed to remove from favorites' });
  }
});

// GET /api/favorites/check/:propertyId - Check if property is favorited
router.get('/check/:propertyId', requireAuth, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.session.user.id;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const favorite = await Favorite.findOne({
      traveler_id: new mongoose.Types.ObjectId(userId),
      property_id: new mongoose.Types.ObjectId(propertyId)
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Failed to check favorite status' });
  }
});

module.exports = router;
