require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Logger = require('./logger');

const logger = new Logger('Database');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 
  (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD
    ? `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DB || 'hostly'}?authSource=admin`
    : `mongodb://${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DB || 'hostly'}`);

// MongoDB connection options
const options = {
  // Remove deprecated options for newer mongoose versions
};

// Test connection function
const testConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB connection already established.');
      return;
    }
    
    await mongoose.connect(MONGODB_URI, options);
    logger.info('MongoDB connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to MongoDB:', error);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to application termination');
  process.exit(0);
});

module.exports = {
  mongoose,
  testConnection,
  MONGODB_URI
};
