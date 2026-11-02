const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { memoryStore } = require('../config/db');

/**
 * Authentication Middleware: Validates JWT Bearer Token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    // Find user in memoryStore (or DB in later phases)
    const user = memoryStore.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: User account no longer exists.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      departmentId: user.department_id,
    };

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: err.name,
    });
  }
}

/**
 * Optional Auth Middleware: Populates req.user if token is present, continues otherwise
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = memoryStore.users.find(u => u.id === decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        departmentId: user.department_id,
      };
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
};

