const { Sequelize } = require('sequelize');
const Logger = require('./logger'); // Assumes logger.js is in the same folder
const logger = new Logger('Database');

// Create a new Sequelize instance
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Use our custom logger for SQL queries
    logging: (msg) => logger.debug(msg),

    // Define global options for all models
    define: {
        timestamps: true,   // Automatically adds createdAt and updatedAt
        underscored: true   // Uses snake_case for table/column names (e.g., user_id)
    }
});

/**
 * Tests the database connection.
 */
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        throw error; // Re-throw the error to stop the application
    }
};

module.exports = {
    sequelize,
    testConnection
};