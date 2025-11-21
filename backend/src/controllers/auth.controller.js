// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const ok = (res, data, status = 200) => res.status(status).json(data);
const bad = (res, message, status = 400) => res.status(status).json({ message });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'traveler' } = req.body || {};
    
    // Validate required fields
    if (!name || !email || !password) {
      return bad(res, 'Missing required fields', 400);
    }

    // Validate role
    const normRole = (role || '').toLowerCase();
    if (!['traveler', 'owner', 'both'].includes(normRole)) {
      return bad(res, 'Invalid role', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return bad(res, 'Email already exists', 409);
    }

    // Create user in database
    // Note: Password will be hashed by the User model's beforeCreate hook
    const user = await User.create({
      name,
      email,
      password, // Don't hash here - model does it
      role: normRole
    });

    // Create session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return ok(res, { user: req.session.user }, 201);
  } catch (err) {
    console.error('Register error:', err);
    
    // Provide user-friendly error messages for database connection issues
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeAccessDeniedError') {
      return bad(res, 'Database connection error. Please contact the administrator.', 503);
    }
    
    // Handle other Sequelize errors
    if (err.name && err.name.startsWith('Sequelize')) {
      return bad(res, err.message || 'Database error occurred', 500);
    }
    
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    
    // Validate credentials
    if (!email || !password) {
      return bad(res, 'Missing credentials', 400);
    }

    // Find user in database
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return bad(res, 'Invalid email or password', 401);
    }

    // Verify password (compare with hashed password in DB)
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return bad(res, 'Invalid email or password', 401);
    }

    // Create session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return ok(res, { user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    return next(err);
  }
};

exports.logout = async (req, res, _next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return bad(res, 'Failed to logout', 500);
    }
    return ok(res, { ok: true });
  });
};

exports.getCurrentUser = async (req, res, _next) => {
  if (!req.session.user) {
    return ok(res, { user: null });
  }

  try {
    // Fetch fresh user data from database
    const user = await User.findByPk(req.session.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'phone_number', 'about_me', 'city', 'state', 'country', 'languages', 'gender', 'profile_image_url']
    });

    if (!user) {
      // User was deleted, clear session
      req.session.destroy();
      return ok(res, { user: null });
    }

    // Map database field names to frontend field names
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone_number,  // Map phone_number to phone
      about: user.about_me,     // Map about_me to about
      city: user.city,
      state: user.state,
      country: user.country,
      languages: user.languages,
      gender: user.gender,
      profile_image_url: user.profile_image_url
    };

    return ok(res, { user: userData });
  } catch (err) {
    console.error('Get current user error:', err);
    // Fallback to session data if DB fails
    return ok(res, { user: req.session.user });
  }
};