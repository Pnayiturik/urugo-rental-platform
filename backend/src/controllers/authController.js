const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const signFirstLoginToken = (user) =>
  jwt.sign(
    { id: user._id, purpose: 'first-login' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, dateOfBirth } = req.body;
    const role = 'landlord';

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth,
      role
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role === 'tenant' && !user.canLogin) {
      return res.status(403).json({
        message: 'Tenant account not activated. Please contact your landlord for assignment.'
      });
    }

    // Force password change flow for security
    if (user.mustChangePassword) {
      const firstLoginToken = signFirstLoginToken(user);
      return res.status(200).json({
        mustChangePassword: true,
        firstLoginToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          canLogin: user.canLogin,
          mustChangePassword: user.mustChangePassword,
          invitedByLandlord: user.invitedByLandlord
        }
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        canLogin: user.canLogin,
        mustChangePassword: user.mustChangePassword,
        invitedByLandlord: user.invitedByLandlord
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const completeFirstLogin = async (req, res) => {
  try {
    const { firstLoginToken, newPassword } = req.body;
    if (!firstLoginToken || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const decoded = jwt.verify(firstLoginToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'first-login') {
      return res.status(401).json({ message: 'Invalid token purpose' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.mustChangePassword) {
      return res.status(400).json({ message: 'Password change not required' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    user.canLogin = true;
    await user.save();

    // Issue normal auth token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Password updated successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        canLogin: user.canLogin,
        mustChangePassword: user.mustChangePassword,
        invitedByLandlord: user.invitedByLandlord
      }
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Always return full user object for frontend (required by UI)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        canLogin: user.canLogin,
        mustChangePassword: user.mustChangePassword,
        invitedByLandlord: user.invitedByLandlord
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, completeFirstLogin };