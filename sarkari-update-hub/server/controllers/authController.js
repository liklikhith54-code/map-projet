const User = require('../models/User');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // If no users exist, auto-seed the admin user from environment variables on first login attempt
    let user = await User.findOne({ username });
    if (!user) {
      const userCount = await User.countDocuments();
      const envUsername = process.env.ADMIN_USERNAME || 'admin';
      if (userCount === 0 && username === envUsername) {
        user = new User({
          username: envUsername,
          password: process.env.ADMIN_PASSWORD || 'adminpassword123',
        });
        await user.save();
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'supersecretjwtkey12345!',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  loginAdmin,
  getMe,
};
