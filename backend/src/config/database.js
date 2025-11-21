require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const Logger = require('./logger');

const logger = new Logger('Database');

// This is the config object the CLI will read
const config = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER,
  password: (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') ? process.env.DB_PASSWORD : undefined,
  database: process.env.DB_NAME,
  // Use socket path only if DB_HOST is not set (local development)
  ...(process.env.DB_HOST ? {} : {
    dialectOptions: {
      socketPath: '/tmp/mysql.sock'
    }
  }),
  logging: (msg) => logger.debug(msg),
  define: {
    timestamps: true,
    underscored: true
  }
};

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(config);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  development: config,
  test: config,
  production: config
};