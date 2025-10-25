const User = require('../models/user');

class UserRepository {
    /**
     * Finds a user by their email address.
     * @param {string} email - The user's email.
     * @returns {Promise<User|null>}
     */
    async findUserByEmail(email) {
        return User.findOne({ where: { email } });
    }

    /**
     * Creates a new user in the database.
     * @param {object} userData - Data for the new user (name, email, password, role).
     * @returns {Promise<User>}
     */
    async createUser(userData) {
        return User.create(userData);
    }
/**
     * Finds a user by their primary key (ID).
     * @param {number} userId - The user's ID.
     * @returns {Promise<User|null>}
     */
    async findUserById(userId) {
        // Exclude the password field from the result automatically
        return User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
    }
}

// We export a single instance of the repository
module.exports = new UserRepository();