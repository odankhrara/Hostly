const userRepository = require('../repositories/user.repository');

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
}

// We export a single instance of the service
module.exports = new AuthService();