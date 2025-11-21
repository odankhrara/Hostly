const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

class Property extends Model {}

Property.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    name: {                    // Changed from title to name as per requirements
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    city: {                    // Split location into specific fields
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING(2),
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    property_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    price_per_night: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    bedrooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    bathrooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    max_guests: {             // Added as per requirements
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amenities: {              // Simplified amenities as comma-separated string
        type: DataTypes.TEXT,
        allowNull: true,
    },
    main_image: {             // Single image field
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    tax_rate: {               // Tax rate as percentage (e.g., 10.5 for 10.5%)
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Tax rate percentage based on city/location'
    }
}, {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    underscored: true,
    timestamps: true,
});

module.exports = Property;