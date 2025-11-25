// --- Core Imports ---
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// --- Our Imports ---
const Logger = require('./config/logger');
const { mongoose, testConnection } = require('./config/database');
const mainRoutes = require('./routes'); // <- make sure routes/index.js exports a Router
const kafkaService = require('./services/kafka.service');
const bookingConsumerService = require('./services/booking-consumer.service');
const MongoStore = require('connect-mongo');

// Import models to ensure they're loaded
require('./models');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = new Logger('App');

// MongoDB session store - create with mongoose connection promise
// This ensures we use the authenticated mongoose connection
// Note: mongoose is already imported above on line 9

// Create a promise that resolves when mongoose connects and returns the client
const getMongoClient = () => {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve(mongoose.connection.getClient());
    } else {
      mongoose.connection.once('connected', () => {
        resolve(mongoose.connection.getClient());
      });
      mongoose.connection.once('error', reject);
      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000);
    }
  });
};

// Create session store using mongoose connection - this prevents auth issues
let sessionStore;
try {
  sessionStore = MongoStore.create({
    clientPromise: getMongoClient(),
    dbName: process.env.MONGODB_DB || 'hostly',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60,
    autoRemove: 'native',
    touchAfter: 24 * 3600,
  });
  
  sessionStore.on('error', (error) => {
    logger.error('Session store error:', error.message);
  });
} catch (error) {
  logger.warn('Failed to create MongoDB session store, using memory store:', error.message);
  sessionStore = undefined;
}

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Trust proxy if you later sit behind one (safe for local too)
app.set('trust proxy', 1);

// --- Core Middleware ---
// ❗ Use CORS with explicit origin + credentials for cookies to work
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Request Logging Middleware ---
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// --- Session Middleware ---
// ❗ Ensure cookie options allow local dev and React to send cookies
// Session store will be initialized after mongoose connects (see startServer function)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  store: sessionStore, // Will be set after mongoose connects
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',              // important for SPA redirects
    secure: false,                // true only behind HTTPS in prod
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// --- API Routes ---
app.use('/api', mainRoutes);  // -> /api/auth/register (POST)

// --- 404 Not Found Handler ---
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = async () => {
  try {
    // Try to connect to MongoDB, but don't fail if it doesn't work
    try {
      await testConnection();
      logger.info('MongoDB connection verified.');
      logger.info('MongoDB is ready for use.');
      
      // Session store is already created with mongoose connection promise
      // It will automatically connect when mongoose is ready
      if (mongoose.connection.readyState === 1 && sessionStore) {
        logger.info('MongoDB session store ready.');
      }
    } catch (dbError) {
      logger.warn('MongoDB connection failed, but continuing without it:', dbError.message);
      logger.warn('Some features requiring database access will not work until MongoDB is configured.');
      sessionStore = undefined; // Use memory store as fallback
    }

    // Initialize Kafka producer
    try {
      await kafkaService.initializeProducer();
    } catch (kafkaError) {
      logger.warn('Kafka producer initialization failed, but continuing without it:', kafkaError.message);
      logger.warn('Some features requiring Kafka will not work until Kafka is configured.');
    }

    // Start Kafka consumers (only if database is available)
    try {
      let dbConnected = false;
      try {
        await testConnection();
        dbConnected = true;
      } catch (dbErr) {
        // Database not available, skip consumer initialization
      }
      
      if (dbConnected) {
        await bookingConsumerService.startConsumers();
      }
    } catch (consumerError) {
      logger.warn('Kafka consumers initialization failed, but continuing without them:', consumerError.message);
      logger.warn('Booking event processing will not work until Kafka consumers are configured.');
    }

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      if (mongoose.connection.readyState !== 1) {
        logger.warn('⚠️  Running without MongoDB connection - some features may be limited');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions (like session store index creation errors)
process.on('uncaughtException', (error) => {
  if (error.code === 13 && error.codeName === 'Unauthorized' && error.message.includes('createIndexes')) {
    logger.warn('MongoDB session store index creation failed - continuing with memory store');
    logger.warn('This is usually due to MongoDB authentication. Sessions will work but won\'t persist across restarts.');
    // Don't exit - continue running
    return;
  }
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await kafkaService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await kafkaService.disconnect();
  process.exit(0);
});

startServer();
