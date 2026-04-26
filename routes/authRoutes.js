const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const { userRegisterSchema, userLoginSchema } = require('../schemas/authSchemas');

// Register a new user
router.post('/register', validateRequest(userRegisterSchema), async (req, res) => {
  try {
    const { username, email, password, role, province, district } = req.validatedBody;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        error: 'USER_EXISTS',
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      role: role || 'police_officer',
      province,
      district,
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      message: 'User registered successfully',
      data: { userId: savedUser._id, username: savedUser.username, email: savedUser.email },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error registering user',
      error: error.message,
    });
  }
});

// Login user
router.post('/login', validateRequest(userLoginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
        province: user.province,
        district: user.district,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          province: user.province,
          district: user.district,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in',
      error: error.message,
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }
    res.status(200).json({
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving user profile',
      error: error.message,
    });
  }
});

module.exports = router;
