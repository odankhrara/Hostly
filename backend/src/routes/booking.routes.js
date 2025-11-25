const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Booking, Property, User } = require('../models');
const kafkaService = require('../services/kafka.service');

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
    start.setHours(0, 0, 0, 0); // Normalize start date to start of day

    // Allow today and future dates (check-in can be today)
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

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    // Check if property exists and get its details
    const property = await Property.findById(propertyId);
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

    // Get traveler ID from session
    const travelerId = req.session.user?.id;
    if (!travelerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate traveler ObjectId
    if (!mongoose.Types.ObjectId.isValid(travelerId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Create booking in database
    const booking = await Booking.create({
      property_id: new mongoose.Types.ObjectId(propertyId),
      traveler_id: new mongoose.Types.ObjectId(travelerId),
      start_date: startDate,
      end_date: endDate,
      num_guests: parseInt(guests),
      status: 'pending',
      total_price: totalPrice
    });

    // Publish booking created event to Kafka (async, don't wait)
    kafkaService.publishBookingCreated({
      id: booking._id.toString(),
      property_id: booking.property_id.toString(),
      traveler_id: booking.traveler_id.toString(),
      start_date: booking.start_date,
      end_date: booking.end_date,
      num_guests: booking.num_guests,
      status: booking.status,
      total_price: parseFloat(booking.total_price),
      created_at: booking.createdAt
    }).catch(err => {
      console.error('Failed to publish booking-created event:', err);
      // Don't fail the request if Kafka publish fails
    });

    res.status(201).json({ 
      message: 'Booking request created successfully',
      booking: {
        id: booking._id.toString(),
        property_id: booking.property_id.toString(),
        traveler_id: booking.traveler_id.toString(),
        start_date: booking.start_date,
        end_date: booking.end_date,
        num_guests: booking.num_guests,
        status: booking.status,
        total_price: parseFloat(booking.total_price),
        created_at: booking.createdAt,
        updated_at: booking.updatedAt
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get bookings for the current user from database
    const bookings = await Booking.find({ traveler_id: new mongoose.Types.ObjectId(userId) })
      .populate('property_id', 'name city state')
      .sort({ createdAt: -1 });

    // Format the response to match frontend expectations
    const formattedBookings = bookings.map(booking => ({
      id: booking._id.toString(),
      propertyName: booking.property_id?.name || 'Unknown',
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

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    console.log(`Accepting booking ${id}`);

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

    console.log(`Cancelling booking ${id}`);

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
