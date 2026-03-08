const express = require('express');
const router = express.Router();
const { login, register, completeFirstLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
router.get('/me', protect, getMe);

router.post('/register', register);
router.post('/login', login);
router.post('/complete-first-login', completeFirstLogin);

module.exports = router;