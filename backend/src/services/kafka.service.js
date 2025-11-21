const { Kafka } = require('kafkajs');
const Logger = require('../config/logger');

const logger = new Logger('KafkaService');

// Initialize Kafka client (only if KAFKA_BROKER is set, otherwise set to null)
let kafka = null;
let producer = null;
let ownerConsumer = null;
let travelerConsumer = null;

// Initialize Kafka only if KAFKA_BROKER is explicitly set
// In local development without Kafka, this will be skipped
const kafkaBroker = process.env.KAFKA_BROKER;
if (kafkaBroker) {
  try {
    kafka = new Kafka({
      clientId: 'hostly-backend',
      brokers: [kafkaBroker],
      retry: {
        retries: 8,
        initialRetryTime: 100,
        multiplier: 2,
        maxRetryTime: 30000
      }
    });
    producer = kafka.producer();
    ownerConsumer = kafka.consumer({ 
      groupId: 'owner-service-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });
    travelerConsumer = kafka.consumer({ 
      groupId: 'traveler-service-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });
    logger.info('Kafka client initialized (broker will be connected on startup)');
  } catch (error) {
    logger.warn('Kafka initialization failed:', error.message);
  }
} else {
  logger.info('Kafka not configured (KAFKA_BROKER not set), running without Kafka');
}

// Kafka instances are created conditionally above

// Topics
const TOPICS = {
  BOOKING_CREATED: 'booking-created',
  BOOKING_STATUS_UPDATED: 'booking-status-updated'
};

// Initialize producer
let producerReady = false;

async function initializeProducer() {
  if (!producer) {
    logger.warn('Kafka producer not initialized (Kafka not configured)');
    producerReady = false;
    return;
  }
  try {
    await producer.connect();
    producerReady = true;
    logger.info('Kafka producer connected successfully');
  } catch (error) {
    logger.error('Failed to connect Kafka producer:', error);
    producerReady = false;
  }
}

// Initialize owner consumer
async function initializeOwnerConsumer() {
  if (!ownerConsumer) {
    logger.warn('Kafka owner consumer not initialized (Kafka not configured)');
    return;
  }
  try {
    await ownerConsumer.connect();
    await ownerConsumer.subscribe({ 
      topic: TOPICS.BOOKING_CREATED,
      fromBeginning: false 
    });
    logger.info('Owner consumer connected and subscribed to booking-created topic');
  } catch (error) {
    logger.error('Failed to initialize owner consumer:', error);
  }
}

// Initialize traveler consumer
async function initializeTravelerConsumer() {
  if (!travelerConsumer) {
    logger.warn('Kafka traveler consumer not initialized (Kafka not configured)');
    return;
  }
  try {
    await travelerConsumer.connect();
    await travelerConsumer.subscribe({ 
      topic: TOPICS.BOOKING_STATUS_UPDATED,
      fromBeginning: false 
    });
    logger.info('Traveler consumer connected and subscribed to booking-status-updated topic');
  } catch (error) {
    logger.error('Failed to initialize traveler consumer:', error);
  }
}

// Publish booking created event
async function publishBookingCreated(bookingData) {
  if (!producer) {
    logger.debug('Kafka producer not available, skipping event publish');
    return;
  }
  if (!producerReady) {
    logger.warn('Producer not ready, attempting to reconnect...');
    await initializeProducer();
  }
  if (!producerReady) {
    logger.warn('Producer still not ready, skipping event publish');
    return;
  }

  try {
    await producer.send({
      topic: TOPICS.BOOKING_CREATED,
      messages: [
        {
          key: `booking-${bookingData.id}`,
          value: JSON.stringify({
            id: bookingData.id,
            property_id: bookingData.property_id,
            traveler_id: bookingData.traveler_id,
            start_date: bookingData.start_date,
            end_date: bookingData.end_date,
            num_guests: bookingData.num_guests,
            status: bookingData.status,
            total_price: bookingData.total_price,
            created_at: bookingData.created_at,
            timestamp: new Date().toISOString()
          })
        }
      ]
    });
    logger.info(`Published booking-created event for booking ${bookingData.id}`);
  } catch (error) {
    logger.error('Failed to publish booking-created event:', error);
    throw error;
  }
}

// Publish booking status updated event
async function publishBookingStatusUpdated(bookingData) {
  if (!producer) {
    logger.debug('Kafka producer not available, skipping event publish');
    return;
  }
  if (!producerReady) {
    logger.warn('Producer not ready, attempting to reconnect...');
    await initializeProducer();
  }
  if (!producerReady) {
    logger.warn('Producer still not ready, skipping event publish');
    return;
  }

  try {
    await producer.send({
      topic: TOPICS.BOOKING_STATUS_UPDATED,
      messages: [
        {
          key: `booking-${bookingData.id}`,
          value: JSON.stringify({
            id: bookingData.id,
            property_id: bookingData.property_id,
            traveler_id: bookingData.traveler_id,
            status: bookingData.status,
            updated_at: bookingData.updated_at,
            timestamp: new Date().toISOString()
          })
        }
      ]
    });
    logger.info(`Published booking-status-updated event for booking ${bookingData.id}`);
  } catch (error) {
    logger.error('Failed to publish booking-status-updated event:', error);
    throw error;
  }
}

// Run owner consumer
async function runOwnerConsumer(messageHandler) {
  if (!ownerConsumer) {
    logger.warn('Owner consumer not available, skipping');
    return;
  }
  try {
    await ownerConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const bookingData = JSON.parse(message.value.toString());
          logger.info(`Owner consumer received message from ${topic}:`, bookingData);
          await messageHandler(bookingData);
        } catch (error) {
          logger.error('Error processing owner consumer message:', error);
        }
      }
    });
  } catch (error) {
    logger.error('Error running owner consumer:', error);
  }
}

// Run traveler consumer
async function runTravelerConsumer(messageHandler) {
  if (!travelerConsumer) {
    logger.warn('Traveler consumer not available, skipping');
    return;
  }
  try {
    await travelerConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const bookingData = JSON.parse(message.value.toString());
          logger.info(`Traveler consumer received message from ${topic}:`, bookingData);
          await messageHandler(bookingData);
        } catch (error) {
          logger.error('Error processing traveler consumer message:', error);
        }
      }
    });
  } catch (error) {
    logger.error('Error running traveler consumer:', error);
  }
}

// Graceful shutdown
async function disconnect() {
  try {
    if (producer) await producer.disconnect();
    if (ownerConsumer) await ownerConsumer.disconnect();
    if (travelerConsumer) await travelerConsumer.disconnect();
    logger.info('Kafka connections closed');
  } catch (error) {
    logger.error('Error disconnecting Kafka:', error);
  }
}

module.exports = {
  initializeProducer,
  initializeOwnerConsumer,
  initializeTravelerConsumer,
  publishBookingCreated,
  publishBookingStatusUpdated,
  runOwnerConsumer,
  runTravelerConsumer,
  disconnect,
  TOPICS
};

