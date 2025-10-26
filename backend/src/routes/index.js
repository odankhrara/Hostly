// CommonJS router index
const { Router } = require('express');
const authRoutes = require('./auth.routes');

const router = Router();
router.use('/auth', authRoutes); // -> /api/auth/...

module.exports = router;
