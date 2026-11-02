const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  getDemoAccounts,
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticateToken, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/demo-accounts', getDemoAccounts);

module.exports = router;
