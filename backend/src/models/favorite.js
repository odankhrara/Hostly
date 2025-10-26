const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Property = require('./property');

class Favorite extends Model {}

Favorite.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    traveler_id: {            // Changed from user_id to be more specific
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    property_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Property,
            key: 'id',
        },
    }
}, {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
    underscored: true,
    timestamps: true,
    indexes: [{                // Added unique constraint
        unique: true,
        fields: ['traveler_id', 'property_id']
    }]
});

// Associations
User.belongsToMany(Property, {
    through: Favorite,
    foreignKey: 'traveler_id',
    otherKey: 'property_id',
    as: 'favoriteProperties'
});

Property.belongsToMany(User, {
    through: Favorite,
    foreignKey: 'property_id',
    otherKey: 'traveler_id',
    as: 'favoritedByUsers'
});

module.exports = Favorite;