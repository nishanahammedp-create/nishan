const Event = require('../models/Event');
const logger = require('../utils/logger');
const { sendResponse, getPaginationParams } = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

// Get all events
exports.getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await Event.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    logger.error(`Get events error: ${error.message}`);
    next(error);
  }
};

// Get events by location
exports.getEventsByLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Latitude and longitude required');
    }

    const events = await Event.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000
        }
      }
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: events
    });
  } catch (error) {
    logger.error(`Get events by location error: ${error.message}`);
    next(error);
  }
};

// Create event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, type, location, startDate, endDate } = req.body;

    if (!title || !description || !type || !location || !startDate) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Missing required fields');
    }

    const event = new Event({
      title,
      description,
      type,
      location,
      startDate,
      endDate,
      source: req.body.source || 'community'
    });

    await event.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    logger.error(`Create event error: ${error.message}`);
    next(error);
  }
};

// Get event by ID
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Event not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error(`Get event by ID error: ${error.message}`);
    next(error);
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!event) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Event not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    logger.error(`Update event error: ${error.message}`);
    next(error);
  }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Event not found');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete event error: ${error.message}`);
    next(error);
  }
};
