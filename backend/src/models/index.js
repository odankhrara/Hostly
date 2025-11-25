// src/models/index.js
// Export all Mongoose models

const User = require('./user');
const Property = require('./property');
const Booking = require('./booking');
const Favorite = require('./favorite');

module.exports = {
  User,
  Property,
  Booking,
  Favorite
};
