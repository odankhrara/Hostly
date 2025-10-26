const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs'); // Keep only this line
const { sequelize } = require('../config/database');

class User extends Model {}

User.init({
    // --- Basic Info ---
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // No two users can have the same email
        validate: {
            isEmail: true, // Make sure it's a valid email format
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('traveler', 'owner', 'both'),
        allowNull: false,
        defaultValue: 'traveler',
    },

    // --- Profile Info (as required) ---
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    about_me: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    languages: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profile_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize, // Pass the connection instance
    modelName: 'User',
    tableName: 'users', // Explicitly tell Sequelize the table name
    hooks: {
        // This 'hook' runs just before a new user is created
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

module.exports = User;