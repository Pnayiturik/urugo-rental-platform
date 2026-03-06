const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    console.log('[AUTH] authorization header:', authHeader); // debug

    let token = null;
    if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Always select all key fields for user context
    const user = await User.findById(decoded.id || decoded._id).select('_id role email firstName lastName phone isActive emailVerified canLogin mustChangePassword invitedByLandlord');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    req.userId = String(user._id);
    // Ensure email is always present for tenant endpoints
    if (!user.email) return res.status(401).json({ message: 'User email missing' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const landlordOnly = (req, res, next) => {
  if (req.user && req.user.role === 'landlord') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Landlords only' });
};

const tenantOnly = (req, res, next) => {
  if (req.user && req.user.role === 'tenant') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Tenants only' });
};

module.exports = { protect, landlordOnly, tenantOnly };