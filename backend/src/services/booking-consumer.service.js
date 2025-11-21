const { Booking, Property, User } = require('../models');
const kafkaService = require('./kafka.service');
const Logger = require('../config/logger');

const logger = new Logger('BookingConsumerService');

// Handle booking created events (for owner service)
async function handleBookingCreated(bookingData) {
  try {
    logger.info(`Processing booking created event for booking ${bookingData.id}`);
    
    // Fetch booking with related data
    const booking = await Booking.findByPk(bookingData.id, {
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name', 'owner_id']
        },
        {
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!booking) {
      logger.warn(`Booking ${bookingData.id} not found in database`);
      return;
    }

    // Log the booking for owner notification
    logger.info(`Booking ${booking.id} created for property ${booking.property.name} by traveler ${booking.traveler.name}`);
    
    // Here you could add additional processing:
    // - Send email notification to owner
    // - Update analytics
    // - Trigger other services
    
  } catch (error) {
    logger.error('Error handling booking created event:', error);
  }
}

// Handle booking status updated events (for traveler service)
async function handleBookingStatusUpdated(bookingData) {
  try {
    logger.info(`Processing booking status updated event for booking ${bookingData.id}`);
    
    // Fetch booking with related data
    const booking = await Booking.findByPk(bookingData.id, {
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'traveler',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!booking) {
      logger.warn(`Booking ${bookingData.id} not found in database`);
      return;
    }

    // Log the status update for traveler notification
    logger.info(`Booking ${booking.id} status updated to ${booking.status} for traveler ${booking.traveler.name}`);
    
    // Here you could add additional processing:
    // - Send email notification to traveler
    // - Update traveler dashboard in real-time (via WebSocket)
    // - Trigger other services
    
  } catch (error) {
    logger.error('Error handling booking status updated event:', error);
  }
}

// Start consumers
async function startConsumers() {
  try {
    // Initialize consumers
    await kafkaService.initializeOwnerConsumer();
    await kafkaService.initializeTravelerConsumer();
    
    // Start owner consumer (listens to booking-created)
    kafkaService.runOwnerConsumer(handleBookingCreated);
    
    // Start traveler consumer (listens to booking-status-updated)
    kafkaService.runTravelerConsumer(handleBookingStatusUpdated);
    
    logger.info('Booking consumers started successfully');
  } catch (error) {
    logger.error('Failed to start booking consumers:', error);
  }
}

module.exports = {
  startConsumers,
  handleBookingCreated,
  handleBookingStatusUpdated
};

