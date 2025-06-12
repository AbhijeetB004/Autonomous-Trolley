const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ 'profile.email': email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      userId: `USER_${Date.now()}`,
      profile: { firstName, lastName, email },
      authentication: { passwordHash, loginCount: 0 },
      role: 'customer',
    });
    await user.save();
    return res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required.' });
    }
    const user = await User.findOne({ 'profile.email': email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.authentication.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    user.authentication.lastLogin = new Date();
    user.authentication.loginCount = (user.authentication.loginCount || 0) + 1;
    await user.save();
    const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { userId: user.userId, email: user.profile.email, role: user.role, firstName: user.profile.firstName, lastName: user.profile.lastName } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({
      userId: user.userId,
      email: user.profile.email,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      role: user.role,
      preferences: user.preferences,
      orderHistory: user.orderHistory,
      loyalty: user.loyalty,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 