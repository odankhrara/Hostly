const express = require('express');
const router = express.Router();
const { Booking, Property, User } = require('../models');

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  try {
    const { propertyId, startDate, endDate, guests } = req.body;
    
    // Validate required fields
    if (!propertyId || !startDate || !endDate || !guests) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Check if start date is in the past
    if (start < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    // Check if end date is before or equal to start date
    if (end <= start) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Validate number of guests
    if (guests < 1) {
      return res.status(400).json({ message: 'Number of guests must be at least 1' });
    }

    // Check if property exists and get its details
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if guests exceed property capacity
    if (guests > property.max_guests) {
      return res.status(400).json({ message: `Maximum ${property.max_guests} guests allowed for this property` });
    }

    // Calculate total price
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = parseFloat(property.price_per_night) * nights;

    // Create booking in database
    const booking = await Booking.create({
      property_id: parseInt(propertyId),
      traveler_id: req.session.user?.id || 1,
      start_date: startDate,
      end_date: endDate,
      num_guests: parseInt(guests),
      status: 'pending',
      total_price: totalPrice
    });

    res.status(201).json({ 
      message: 'Booking request created successfully',
      booking: {
        id: booking.id,
        property_id: booking.property_id,
        traveler_id: booking.traveler_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        num_guests: booking.num_guests,
        status: booking.status,
        total_price: parseFloat(booking.total_price),
        created_at: booking.created_at,
        updated_at: booking.updated_at
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// GET /api/bookings/me - Get current user's bookings
router.get('/me', async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get bookings for the current user from database
    const bookings = await Booking.findAll({
      where: { traveler_id: userId },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'city', 'state']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Format the response to match frontend expectations
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      propertyName: booking.property.name,
      startDate: booking.start_date,
      endDate: booking.end_date,
      guests: booking.num_guests,
      status: booking.status,
      total_price: parseFloat(booking.total_price)
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('Get bookings error:', error);
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

    console.log(`Accepting booking ${id}`);

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

    console.log(`Cancelling booking ${id}`);

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
