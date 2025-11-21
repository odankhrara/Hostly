const express = require('express');
const router = express.Router();
const { Property, Booking, User } = require('../models');
const upload = require('../config/upload');

// GET /api/owner/properties - Get owner's properties
router.get('/properties', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get properties owned by the current user with booking counts
    const properties = await Property.findAll({
      where: { owner_id: userId },
      include: [
        {
          model: Booking,
          as: 'bookings',
          attributes: ['id', 'status'],
          required: false // LEFT JOIN to include properties with no bookings
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Format the response to match frontend expectations
    const formattedProperties = properties.map(property => {
      // Count accepted bookings for this property
      const acceptedBookings = property.bookings ? 
        property.bookings.filter(booking => booking.status === 'accepted').length : 0;

      return {
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
        status: "active",
        total_bookings: acceptedBookings, // Count of accepted bookings
        created_at: property.created_at
      };
    });

    res.json({ properties: formattedProperties });
  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// POST /api/owner/properties - Create new property
router.post('/properties', upload.single('mainImage'), async (req, res) => {
  try {
    const { name, type, location, description, pricing, amenities, bedrooms, bathrooms, availabilityFrom, availabilityTo } = req.body;
    
    // Validate required fields
    if (!name || !type || !location || !pricing) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Parse location to extract city, state, country
    const locationParts = location.split(',').map(part => part.trim());
    const city = locationParts[0] || 'Unknown';
    const state = locationParts[1] || 'CA';
    const country = locationParts[2] || 'USA';

    // Handle uploaded image
    let mainImageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=entropy&cs=tinysrgb"; // Default fallback
    
    if (req.file) {
      // Use the uploaded file path
      mainImageUrl = `/uploads/properties/${req.file.filename}`;
    }

    // Create property in database
    const newProperty = await Property.create({
      name,
      property_type: type,
      city,
      state,
      country,
      description: description || '',
      price_per_night: parseFloat(pricing),
      bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseInt(bathrooms) || 1,
      max_guests: parseInt(bedrooms) * 2 || 2,
      amenities: Array.isArray(amenities) ? amenities.join(',') : amenities || '',
      main_image: mainImageUrl,
      owner_id: userId
    });

    res.status(201).json({ 
      message: 'Property created successfully',
      property: {
        id: newProperty.id,
        name: newProperty.name,
        location: `${newProperty.city}, ${newProperty.state}`,
        property_type: newProperty.property_type,
        price_per_night: parseFloat(newProperty.price_per_night),
        bedrooms: newProperty.bedrooms,
        bathrooms: newProperty.bathrooms,
        max_guests: newProperty.max_guests,
        amenities: newProperty.amenities ? newProperty.amenities.split(',') : [],
        main_image: newProperty.main_image,
        status: "active",
        created_at: newProperty.created_at
      }
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Failed to create property' });
  }
});

// GET /api/owner/bookings - Get booking requests for owner's properties
router.get('/bookings', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get bookings for properties owned by the current user
    const bookings = await Booking.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: { owner_id: userId },
          attributes: ['id', 'name', 'city', 'state']
        },
        {
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Format the response to match frontend expectations
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      property_id: booking.property_id,
      propertyName: booking.property.name,
      traveler_id: booking.traveler_id,
      travelerName: booking.traveler.name,
      travelerEmail: booking.traveler.email,
      start_date: booking.start_date,
      end_date: booking.end_date,
      num_guests: booking.num_guests,
      status: booking.status,
      total_price: parseFloat(booking.total_price),
      created_at: booking.created_at
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings/:id/accept - Accept a booking
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find the booking and verify it belongs to the owner's property
    const booking = await Booking.findOne({
      include: [
        {
          model: Property,
          as: 'property',
          where: { owner_id: userId }
        }
      ],
      where: { id: id }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not authorized' });
    }

    // Update the booking status
    await booking.update({ 
      status: 'accepted',
      updated_at: new Date()
    });

    console.log(`Accepting booking ${id}`);
    console.log('Booking accepted:', {
      id: booking.id,
      status: booking.status,
      updated_at: booking.updated_at,
      message: 'Booking accepted successfully'
    });

    res.json({ 
      message: 'Booking accepted successfully',
      booking: {
        id: booking.id,
        status: booking.status,
        updated_at: booking.updated_at,
        message: 'Booking accepted successfully'
      }
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ message: 'Failed to accept booking' });
  }
});

// POST /api/bookings/:id/cancel - Cancel a booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find the booking and verify it belongs to the owner's property
    const booking = await Booking.findOne({
      include: [
        {
          model: Property,
          as: 'property',
          where: { owner_id: userId }
        }
      ],
      where: { id: id }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not authorized' });
    }

    // Update the booking status
    await booking.update({ 
      status: 'cancelled',
      updated_at: new Date()
    });

    console.log(`Cancelling booking ${id}`);
    console.log('Booking cancelled:', {
      id: booking.id,
      status: booking.status,
      updated_at: booking.updated_at,
      message: 'Booking cancelled successfully'
    });

    res.json({ 
      message: 'Booking cancelled successfully',
      booking: {
        id: booking.id,
        status: booking.status,
        updated_at: booking.updated_at,
        message: 'Booking cancelled successfully'
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

module.exports = router;
