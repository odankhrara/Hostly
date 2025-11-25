const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Property, Booking, User } = require('../models');
const upload = require('../config/upload');
const kafkaService = require('../services/kafka.service');

// GET /api/owner/properties - Get owner's properties
router.get('/properties', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get properties owned by the current user
    const properties = await Property.find({ owner_id: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    
    // Get booking counts for each property
    const propertyIds = properties.map(p => p._id);
    const acceptedBookingsCount = await Booking.aggregate([
      {
        $match: {
          property_id: { $in: propertyIds },
          status: 'accepted'
        }
      },
      {
        $group: {
          _id: '$property_id',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const bookingCountMap = {};
    acceptedBookingsCount.forEach(item => {
      bookingCountMap[item._id.toString()] = item.count;
    });

    // Format the response to match frontend expectations
    const formattedProperties = properties.map(property => {
      // Get booking count for this property
      const acceptedBookings = bookingCountMap[property._id.toString()] || 0;

      return {
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
        status: "active",
        total_bookings: acceptedBookings,
        created_at: property.createdAt
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
    const { name, type, location, description, pricing, amenities, bedrooms, bathrooms, availabilityFrom, availabilityTo, taxRate } = req.body;
    
    // Validate required fields
    if (!name || !type || !location || !pricing) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
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
      tax_rate: taxRate ? parseFloat(taxRate) : 0,
      owner_id: new mongoose.Types.ObjectId(userId)
    });

    res.status(201).json({ 
      message: 'Property created successfully',
      property: {
        id: newProperty._id.toString(),
        name: newProperty.name,
        location: `${newProperty.city}, ${newProperty.state}`,
        property_type: newProperty.property_type,
        price_per_night: parseFloat(newProperty.price_per_night),
        bedrooms: newProperty.bedrooms,
        bathrooms: newProperty.bathrooms,
        max_guests: newProperty.max_guests,
        amenities: newProperty.amenities ? newProperty.amenities.split(',') : [],
        main_image: newProperty.main_image,
        tax_rate: parseFloat(newProperty.tax_rate || 0),
        status: "active",
        created_at: newProperty.createdAt
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get properties owned by user first
    const properties = await Property.find({ owner_id: new mongoose.Types.ObjectId(userId) }).select('_id');
    const propertyIds = properties.map(p => p._id);

    // Get bookings for properties owned by the current user
    const bookings = await Booking.find({ property_id: { $in: propertyIds } })
      .populate('property_id', 'name city state')
      .populate('traveler_id', 'name email')
      .sort({ createdAt: -1 });

    // Format the response to match frontend expectations
    const formattedBookings = bookings.map(booking => ({
      id: booking._id.toString(),
      property_id: booking.property_id._id.toString(),
      propertyName: booking.property_id?.name || 'Unknown',
      traveler_id: booking.traveler_id._id.toString(),
      travelerName: booking.traveler_id?.name || 'Unknown',
      travelerEmail: booking.traveler_id?.email || 'Unknown',
      start_date: booking.start_date,
      end_date: booking.end_date,
      num_guests: booking.num_guests,
      status: booking.status,
      total_price: parseFloat(booking.total_price),
      created_at: booking.createdAt
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

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the booking and populate property to verify ownership
    const booking = await Booking.findById(id).populate('property_id');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify it belongs to the owner's property
    if (booking.property_id.owner_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update the booking status
    booking.status = 'accepted';
    await booking.save();

    // Publish booking status updated event to Kafka (async, don't wait)
    kafkaService.publishBookingStatusUpdated({
      id: booking._id.toString(),
      property_id: booking.property_id._id.toString(),
      traveler_id: booking.traveler_id.toString(),
      status: booking.status,
      updated_at: booking.updatedAt
    }).catch(err => {
      console.error('Failed to publish booking-status-updated event:', err);
      // Don't fail the request if Kafka publish fails
    });

    console.log(`Accepting booking ${id}`);
    console.log('Booking accepted:', {
      id: booking._id.toString(),
      status: booking.status,
      updated_at: booking.updatedAt,
      message: 'Booking accepted successfully'
    });

    res.json({ 
      message: 'Booking accepted successfully',
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        updated_at: booking.updatedAt
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

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the booking and populate property to verify ownership
    const booking = await Booking.findById(id).populate('property_id');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify it belongs to the owner's property
    if (booking.property_id.owner_id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update the booking status
    booking.status = 'cancelled';
    await booking.save();

    // Publish booking status updated event to Kafka (async, don't wait)
    kafkaService.publishBookingStatusUpdated({
      id: booking._id.toString(),
      property_id: booking.property_id._id.toString(),
      traveler_id: booking.traveler_id.toString(),
      status: booking.status,
      updated_at: booking.updatedAt
    }).catch(err => {
      console.error('Failed to publish booking-status-updated event:', err);
      // Don't fail the request if Kafka publish fails
    });

    console.log(`Cancelling booking ${id}`);
    console.log('Booking cancelled:', {
      id: booking._id.toString(),
      status: booking.status,
      updated_at: booking.updatedAt,
      message: 'Booking cancelled successfully'
    });

    res.json({ 
      message: 'Booking cancelled successfully',
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        updated_at: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

module.exports = router;
