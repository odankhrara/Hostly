const authService = require('../services/auth.service');
const Logger = require('../config/logger');

const logger = new Logger('AuthController');

class AuthController {
    /**
     * Handles the POST /api/auth/register request.
     */
    async register(req, res, next) {
        try {
            // 1. Get the user data from the request body
            const userData = req.body;
            
            // 2. Call the service to do the business logic
            const newUser = await authService.registerUser(userData);
            
            // 3. Log the user in by setting their session
            req.session.userId = newUser.id;

            logger.info(`User registered successfully: ${newUser.email}`);
            
            // 4. Send the successful response
            res.status(201).json(newUser);

        } catch (error) {
            logger.error(`Registration failed: ${error.message}`);
            
            // 5. If anything fails, pass the error to the global error handler
            next(error); 
        }
    }
}

// We export a single instance of the controller
module.exports = new AuthController();