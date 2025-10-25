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
}

// We export a single instance of the repository
module.exports = new UserRepository();