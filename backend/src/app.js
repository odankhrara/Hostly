// --- Core Imports ---
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// --- Our Imports ---
const Logger = require('./config/logger');
<<<<<<< HEAD
const { sequelize, testConnection } = require('./config/database');
const mainRoutes = require('./routes'); // <- make sure routes/index.js exports a Router
=======
const { sequelize, testConnection } = require('./config/database'); // Import sequelize
const mainRoutes = require('./routes'); // TODO: Uncomment when routes are defined
>>>>>>> 2f80eceb4f2b921763b9913072b3537c76ea39cd

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = new Logger('App');

<<<<<<< HEAD
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
=======
// --- Session Store Setup
// We'll store sessions in MySQL using Sequelize
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'sessions', // Name of the session table
    checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 mins
    expiration: 24 * 60 * 60 * 1000  // 24-hour session
>>>>>>> 2f80eceb4f2b921763b9913072b3537c76ea39cd
});

const app = express();
const PORT = process.env.PORT || 3000;

<<<<<<< HEAD
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
=======
// --- Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Request Logging Middleware ---
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// --- Session Middleware ---
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// --- API Routes ---
// All your API routes will be prefixed with /api
app.use('/api', mainRoutes);  // TODO: Uncomment when routes are defined

// --- 404 Not Found Handler ---
// This catches any request that doesn't match an API route
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
>>>>>>> 2f80eceb4f2b921763b9913072b3537c76ea39cd
});

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
<<<<<<< HEAD
  logger.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = async () => {
  try {
    await testConnection();
    logger.info('Database connection verified.');

    await sequelize.sync({ alter: true });
    logger.info('All models were synchronized successfully.');

    await sessionStore.sync();
    logger.info('Session store synced.');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
=======
    logger.error('Unhandled Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


// --- Server Startup Function ---
const startServer = async () => {
    try {
        // 1. Test the database connection
        await testConnection();
        logger.info('Database connection verified.');
        
        // 2. Automatically sync all models with the database
        await sequelize.sync({ alter: true }); 
        logger.info('All models were synchronized successfully.');

        // 3. Sync the session store (creates the 'sessions' table)
        await sessionStore.sync();
        logger.info('Session store synced.');

        // 4. Start the Express server
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

        // 5. Set up graceful shutdown (for production)
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed.');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1); // Exit with a failure code
    }
};

// --- Run the Server ---
startServer();
>>>>>>> 2f80eceb4f2b921763b9913072b3537c76ea39cd
