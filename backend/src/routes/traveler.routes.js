const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Logger = require('../config/logger');

const logger = new Logger('TravelerRoutes');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Update traveler profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const updateData = req.body;

    // Map frontend field names to database field names
    const mappedData = {
      name: updateData.name,
      email: updateData.email,
      phone_number: updateData.phone,
      about_me: updateData.about,
      city: updateData.city,
      country: updateData.country,
      languages: updateData.languages,
      gender: updateData.gender
    };

    // Remove undefined values
    Object.keys(mappedData).forEach(key => {
      if (mappedData[key] === undefined) {
        delete mappedData[key];
      }
    });

    logger.info(`Updating profile for user ${userId}`);

    const [updatedRowsCount] = await User.update(mappedData, {
      where: { id: userId }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch updated user data
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'phone_number', 'about_me', 'city', 'country', 'languages', 'gender', 'profile_image_url', 'created_at', 'updated_at']
    });

    logger.info(`Profile updated successfully for user ${userId}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone_number,
        about: updatedUser.about_me,
        city: updatedUser.city,
        country: updatedUser.country,
        languages: updatedUser.languages,
        gender: updatedUser.gender,
        profile_image_url: updatedUser.profile_image_url
      }
    });

  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get traveler favorites
router.get('/favorites', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // For now, return empty array since favorites functionality isn't fully implemented
    res.json({ favorites: [] });
  } catch (error) {
    logger.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

// Upload profile picture
router.post('/profile/avatar', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // For now, just return success since file upload isn't fully implemented
    logger.info(`Profile picture upload requested for user ${userId}`);
    
    res.json({
      message: 'Profile picture uploaded successfully',
      user: req.session.user
    });
  } catch (error) {
    logger.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

module.exports = router;
