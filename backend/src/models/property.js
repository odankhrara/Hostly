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
    amenities: {              // Simplified amenities as JSON
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('amenities');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(val) {
            this.setDataValue('amenities', JSON.stringify(val));
        }
    },
    main_image: {             // Single image field
        type: DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    underscored: true,
    timestamps: true,
});

// Association
Property.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

module.exports = Property;