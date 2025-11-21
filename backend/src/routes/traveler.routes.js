const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Logger = require('../config/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const logger = new Logger('TravelerRoutes');

// Configure multer for profile picture uploads
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.session.user.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const profileUpload = multer({
  storage: profileStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
      state: updateData.state, // Add state field
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
      attributes: ['id', 'name', 'email', 'role', 'phone_number', 'about_me', 'city', 'state', 'country', 'languages', 'gender', 'profile_image_url', 'created_at', 'updated_at']
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
        state: updatedUser.state, // Include state in response
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
router.post('/profile/avatar', requireAuth, profileUpload.single('avatar'), async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct the URL path for the uploaded image
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Update user's profile_image_url in database
    await User.update(
      { profile_image_url: imageUrl },
      { where: { id: userId } }
    );

    // Fetch updated user data
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'phone_number', 'about_me', 'city', 'state', 'country', 'languages', 'gender', 'profile_image_url']
    });

    logger.info(`Profile picture uploaded successfully for user ${userId}`);

    res.json({
      message: 'Profile picture uploaded successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone_number,
        about: updatedUser.about_me,
        city: updatedUser.city,
        state: updatedUser.state,
        country: updatedUser.country,
        languages: updatedUser.languages,
        gender: updatedUser.gender,
        profile_image_url: updatedUser.profile_image_url
      }
    });
  } catch (error) {
    logger.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

module.exports = router;
