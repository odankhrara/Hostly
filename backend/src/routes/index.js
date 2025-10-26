<<<<<<< HEAD
// CommonJS router index
const { Router } = require('express');
const authRoutes = require('./auth.routes');

const router = Router();
router.use('/auth', authRoutes); // -> /api/auth/...

module.exports = router;
=======
const express = require('express');
const router = express.Router();

// Import your auth routes
const authRoutes = require('./auth.routes');

// Tell the main router to use them
// All routes in authRoutes will be prefixed with /auth
router.use('/auth', authRoutes);

// We'll add property routes here later
// const propertyRoutes = require('./properties.routes');
// router.use('/properties', propertyRoutes);

// A simple test route to make sure everything is working
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', session: req.session });
});

module.exports = router;
>>>>>>> 2f80eceb4f2b921763b9913072b3537c76ea39cd
