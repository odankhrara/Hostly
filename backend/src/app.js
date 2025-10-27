// --- Core Imports ---
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// --- Our Imports ---
const Logger = require('./config/logger');
const { sequelize, testConnection } = require('./config/database');
const mainRoutes = require('./routes'); // <- make sure routes/index.js exports a Router

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
    await testConnection();
    logger.info('Database connection verified.');

    // await sequelize.sync({ alter: true });
    // logger.info('All models were synchronized successfully.');

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
