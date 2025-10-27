const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');

class AuthService {
    /**
     * Registers a new user.
     * @param {object} userData - Data from the controller (name, email, password, role).
     * @returns {Promise<User>}
     */
    async registerUser(userData) {
        // 1. Check if user already exists
        const existingUser = await userRepository.findUserByEmail(userData.email);
        if (existingUser) {
            // This error will be caught by our controller
            throw new Error('An account with this email already exists.');
        }

        // 2. Create the new user
        // The password will be hashed automatically by the hook in your User model
        const newUser = await userRepository.createUser(userData);
        
        // 3. Don't return the hashed password
        newUser.password = undefined;
        return newUser;
    }

    /**
     * Logs a user.
     * @param {string} email - User's email.
     * @param {string} password - User's password.
     * @returns {Promise<User>}
     */
    async loginUser(email, password) {
        // 1. Find the user by email
        const user = await userRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password.');
        }
        // 2. Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password.');
        }
        // 3. Don't return the hashed password
        user.password = undefined;
        return user;
    }

    /**
     * Logs out a user by destroying their session.
     * @param {object} session - Express request object.
     * @returns {Promise<void>}
     */
    async logoutUser(session) {
        return new Promise((resolve, reject) => {
            session.destroy(err => {
                if (err) {
                    reject(new Error('Could not log out, please try again.'));
                } else {
                resolve();
                }
            });
        });
    }


    /**
     * Gets the current logged-in user based on session.
     * * @param {object} userId - The user ID stored in the session.
     * * @returns {Promise<User>}
     */
    async getCurrentUser(userId) {
        if(!userId) {
            return null;
        }
        const user = await userRepository.findUserById(userId);
        return user;
    }
}

// We export a single instance of the service
module.exports = new AuthService();