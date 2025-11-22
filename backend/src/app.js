// --- Core Imports ---
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// --- Our Imports ---
const Logger = require('./config/logger');
const { sequelize, testConnection } = require('./config/database');
const mainRoutes = require('./routes'); // <- make sure routes/index.js exports a Router
const kafkaService = require('./services/kafka.service');
const bookingConsumerService = require('./services/booking-consumer.service');

// Import models to ensure they're loaded and associations are defined
require('./models');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = new Logger('App');

const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

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
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
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
    // Try to connect to database, but don't fail if it doesn't work
    try {
      await testConnection();
      logger.info('Database connection verified.');
      
      // Sync all models to create tables (if they don't exist)
      await sequelize.sync({ alter: false });
      logger.info('Database tables synchronized successfully.');
      
      await sessionStore.sync();
      logger.info('Session store synced.');
    } catch (dbError) {
      logger.warn('Database connection failed, but continuing without it:', dbError.message);
      logger.warn('Some features requiring database access will not work until database is configured.');
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
      if (!sequelize.authenticate) {
        logger.warn('⚠️  Running without database connection - some features may be limited');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

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
