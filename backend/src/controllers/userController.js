const User = require('../models/User');
const logger = require('../utils/logger');
const { sendResponse, generateToken, getPaginationParams } = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

// Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, city, country } = req.body;

    if (!name || !email || !phone || !password) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Missing required fields');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Email already registered');
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      location: { city, country }
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Email and password required');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Invalid credentials');
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Invalid credentials');
    }

    const token = generateToken(user._id, user.role);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'User not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(location && { location }),
        ...(preferences && { preferences }),
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'User not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    next(error);
  }
};

// Update preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { preferences },
      { new: true }
    );

    if (!user) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'User not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    logger.error(`Update preferences error: ${error.message}`);
    next(error);
  }
};

// Add emergency contact
exports.addEmergencyContact = async (req, res, next) => {
  try {
    const { name, phone, relation } = req.body;

    if (!name || !phone) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Name and phone required');
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { emergencyContacts: { name, phone, relation } } },
      { new: true }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Emergency contact added',
      data: user.emergencyContacts
    });
  } catch (error) {
    logger.error(`Add emergency contact error: ${error.message}`);
    next(error);
  }
};

// Delete emergency contact
exports.deleteEmergencyContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { emergencyContacts: { _id: contactId } } },
      { new: true }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Emergency contact deleted',
      data: user.emergencyContacts
    });
  } catch (error) {
    logger.error(`Delete emergency contact error: ${error.message}`);
    next(error);
  }
};
