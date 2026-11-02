/**
 * Role-Based Access Control (RBAC) Middleware
 */

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this resource.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' lacks sufficient privileges for this operation.`,
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
}

module.exports = {
  requireRoles,
};

