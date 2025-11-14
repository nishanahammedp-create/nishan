const Alert = require('../models/Alert');
const logger = require('../utils/logger');
const { sendResponse, getPaginationParams, calculateDistance } = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

// Get all alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, severity, status } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await Alert.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: alerts,
      pagination: {
        total,
        page: parseInt(page),
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    logger.error(`Get alerts error: ${error.message}`);
    next(error);
  }
};

// Get alerts by location
exports.getAlertsByLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Latitude and longitude required');
    }

    const alerts = await Alert.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      },
      status: 'active'
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error(`Get alerts by location error: ${error.message}`);
    next(error);
  }
};

// Create alert
exports.createAlert = async (req, res, next) => {
  try {
    const { title, description, type, severity, location, message } = req.body;

    if (!title || !description || !type || !location || !message) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Missing required fields');
    }

    const alert = new Alert({
      title,
      description,
      type,
      severity,
      location,
      message,
      source: req.body.source || 'official'
    });

    await alert.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    logger.error(`Create alert error: ${error.message}`);
    next(error);
  }
};

// Get alert by ID
exports.getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);

    if (!alert) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Alert not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error(`Get alert by ID error: ${error.message}`);
    next(error);
  }
};

// Update alert
exports.updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!alert) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Alert not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  } catch (error) {
    logger.error(`Update alert error: ${error.message}`);
    next(error);
  }
};

// Delete alert
exports.deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndDelete(id);

    if (!alert) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Alert not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete alert error: ${error.message}`);
    next(error);
  }
};

// Resolve alert
exports.resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      id,
      { status: 'resolved', updatedAt: Date.now() },
      { new: true }
    );

    if (!alert) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Alert not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  } catch (error) {
    logger.error(`Resolve alert error: ${error.message}`);
    next(error);
  }
};

// Send emergency alert to nearby disaster management offices (public endpoint)
exports.sendEmergency = async (req, res, next) => {
  try {
    const { title = 'Emergency Alert', message, type = 'weather', severity = 'danger', latitude, longitude, radius = 50 } = req.body;

    if (!message) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Message is required for emergency alerts');
    }

    const coordsProvided = typeof latitude === 'number' && typeof longitude === 'number';

    // Create alert record (will be visible in alerts list)
    const alertDoc = new Alert({
      title,
      description: message,
      type,
      severity,
      message,
      source: 'official',
      location: coordsProvided ? { name: req.body.locationName || 'Unknown', coordinates: { type: 'Point', coordinates: [longitude, latitude] } } : { name: req.body.locationName || 'Unknown' }
    });

    await alertDoc.save();

    // Find nearby users who act as disaster offices (admins/moderators)
    const query = {
      role: { $in: ['admin', 'moderator'] },
      'location.coordinates': {}
    };

    let offices = [];
    if (coordsProvided) {
      offices = await require('../models/User').find({
        role: { $in: ['admin', 'moderator'] },
        'location.coordinates': {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            $maxDistance: parseFloat(radius) * 1000
          }
        }
      });
    } else {
      // no coords: fallback to return all admins (best-effort)
      offices = await require('../models/User').find({ role: { $in: ['admin', 'moderator'] } }).limit(50);
    }

    // Mock sending messages: record which offices were notified
    const notified = [];
    for (const office of offices) {
      const contact = { id: office._id, name: office.name, phone: office.phone, email: office.email, location: office.location };
      // In production integrate with SMS/Push/Email gateways here
      notified.push(contact);
    }

    // Attach metadata of who was notified
    alertDoc.metadata = alertDoc.metadata || {};
    alertDoc.metadata.notifiedOffices = notified;
    await alertDoc.save();

    return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Emergency alert dispatched', notified: notified.length, offices: notified });
  } catch (error) {
    logger.error(`sendEmergency error: ${error.message}`);
    next(error);
  }
};
