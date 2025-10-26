// src/models/index.js
const { sequelize } = require('../config/database');

// Import all models
// Note: Associations are already defined in each model file
const User = require('./user');
const Property = require('./property');
const Booking = require('./booking');
const Favorite = require('./favorite');

// No need to define associations here since they're in the model files
// Just export all models

module.exports = {
  sequelize,
  User,
  Property,
  Booking,
  Favorite
};