// src/models/index.js
const { sequelize } = require('../config/database');

// Import all models
const User = require('./user');
const Property = require('./property');
const Booking = require('./booking');
const Favorite = require('./favorite');

// Define associations after all models are loaded
User.hasMany(Property, { foreignKey: 'owner_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Property.hasMany(Booking, { foreignKey: 'property_id', as: 'bookings' });
Booking.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

User.hasMany(Booking, { foreignKey: 'traveler_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'traveler_id', as: 'traveler' });

User.hasMany(Favorite, { foreignKey: 'traveler_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'traveler_id', as: 'traveler' });

Property.hasMany(Favorite, { foreignKey: 'property_id', as: 'favorites' });
Favorite.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

module.exports = {
  sequelize,
  User,
  Property,
  Booking,
  Favorite
};