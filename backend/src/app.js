// --- Core Imports ---
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// --- Our Imports ---
const Logger = require('./config/logger');
const { sequelize, testConnection } = require('./config/database'); // Import sequelize
const mainRoutes = require('./routes');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = new Logger('App');

// --- Session Store Setup
// We'll store sessions in MySQL using Sequelize
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'sessions', // Name of the session table
    checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 mins
    expiration: 24 * 60 * 60 * 1000  // 24-hour session
});

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use('/api', mainRoutes); 

// --- 404 Not Found Handler ---
// This catches any request that doesn't match an API route
app.use((req, res, next) => {
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


// --- Server Startup Function ---
const startServer = async () => {
    try {
        // 1. Test the database connection
        await testConnection();
        logger.info('Database connection verified.');

        // 2. Sync the session store (creates the 'sessions' table)
        await sessionStore.sync();
        logger.info('Session store synced.');

        // 3. Start the Express server
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

        // 4. Set up graceful shutdown (for production)
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