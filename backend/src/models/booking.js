const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Property = require('./property');

class Booking extends Model {}

Booking.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    property_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Property,
            key: 'id',
        },
    },
    traveler_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    num_guests: {              // Changed to match requirements naming
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {                  // Updated status options as per requirements
        type: DataTypes.ENUM('pending', 'accepted', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    total_price: {             // Added total price field
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    underscored: true,
    timestamps: true,
});

module.exports = Booking;