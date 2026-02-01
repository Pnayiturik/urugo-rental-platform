const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const landlordOnly = (req, res, next) => {
  if (req.userRole !== 'landlord') {
    return res.status(403).json({ message: 'Access denied. Landlords only.' });
  }
  next();
};

const tenantOnly = (req, res, next) => {
  if (req.userRole !== 'tenant') {
    return res.status(403).json({ message: 'Access denied. Tenants only.' });
  }
  next();
};

module.exports = { protect, landlordOnly, tenantOnly };