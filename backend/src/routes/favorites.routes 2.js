const express = require('express');
const router = express.Router();
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
    
    const favorites = await Favorite.findAll({
      where: { traveler_id: userId },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'city', 'state', 'property_type', 'price_per_night', 'bedrooms', 'bathrooms', 'max_guests', 'main_image']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Format the response to match frontend expectations
    const formattedFavorites = favorites.map(favorite => ({
      id: favorite.property.id,
      name: favorite.property.name,
      location: `${favorite.property.city}, ${favorite.property.state}`,
      property_type: favorite.property.property_type,
      price_per_night: parseFloat(favorite.property.price_per_night),
      bedrooms: favorite.property.bedrooms,
      bathrooms: favorite.property.bathrooms,
      max_guests: favorite.property.max_guests,
      main_image: favorite.property.main_image,
      favorited_at: favorite.created_at
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

    // Check if property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      where: { traveler_id: userId, property_id: propertyId }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    // Add to favorites
    const favorite = await Favorite.create({
      traveler_id: userId,
      property_id: propertyId
    });

    res.status(201).json({ 
      message: 'Property added to favorites',
      favorite: {
        id: favorite.id,
        traveler_id: favorite.traveler_id,
        property_id: favorite.property_id,
        created_at: favorite.created_at
      }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Failed to add to favorites' });
  }
});

// DELETE /api/favorites/:propertyId - Remove property from favorites
router.delete('/:propertyId', requireAuth, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.session.user.id;

    const favorite = await Favorite.findOne({
      where: { traveler_id: userId, property_id: propertyId }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Property not found in favorites' });
    }

    await favorite.destroy();

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

    const favorite = await Favorite.findOne({
      where: { traveler_id: userId, property_id: propertyId }
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Failed to check favorite status' });
  }
});

module.exports = router;
