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

    /**
     * Handles the POST /api/auth/login request.
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if(!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            const user = await authService.loginUser(email, password);
            
            // Save user ID in session
            req.session.userId = user.id;

            logger.info(`User logged in successfully: ${user.email}`);
            res.status(200).json(user);

        } catch (error) {
            logger.error(`Login failed: ${error.message}`);
            // send a generic error for invalid credentials, pass others
            if (error.message === 'Invalid email or password.') {
                return res.status(401).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }

    /**
     *  Handles the POST /api/auth/logout request.
     * 
    */
    async logout(req, res, next) {
        try {
            await authService.logoutUser(req.session);
            logger.info('User logged out successfully');
            //Send a no content success status
            res.status(204).send();
        } catch (error) {
            logger.error(`Logout failed: ${error.message}`);
            next(error);
        }
    }


    /**
     * Handles the GET /api/auth/me request.
     * 
    */
    async getCurrentUser(req, res, next) {
        try {
            const user = await authService.getCurrentUser(req.session.userId);
            if (!user) {
                return res.status(401).json({ message: 'Not authenticated' });
            } 
            logger.info(`Session checked for user: ${user.email}`);
            res.status(200).json(user);
        } catch (error) {
            logger.error(`Get current user failed: ${error.message}`);
            next(error);
        }    
    }

}

// We export a single instance of the controller
module.exports = new AuthController();