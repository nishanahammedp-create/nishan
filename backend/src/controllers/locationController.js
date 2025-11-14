const Location = require('../models/Location');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

// Get all locations (public)
exports.getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find({}).sort({ city: 1 }).limit(200);
    res.status(HTTP_STATUS.OK).json({ success: true, data: locations });
  } catch (error) {
    logger.error(`getLocations error: ${error.message}`);
    next(error);
  }
};

// Get location by ID
exports.getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Location not found' });
    }
    res.status(HTTP_STATUS.OK).json({ success: true, data: location });
  } catch (error) {
    logger.error(`getLocationById error: ${error.message}`);
    next(error);
  }
};

// Search locations by city/state/country
exports.searchLocations = async (req, res, next) => {
  try {
    const { query = '' } = req.query;
    const regex = new RegExp(query, 'i');
    const locations = await Location.find({
      $or: [
        { city: regex },
        { state: regex },
        { country: regex }
      ]
    }).limit(50);
    res.status(HTTP_STATUS.OK).json({ success: true, data: locations });
  } catch (error) {
    logger.error(`searchLocations error: ${error.message}`);
    next(error);
  }
};

// Find nearby locations (geospatial query)
exports.getNearbyLocations = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;
    if (!latitude || !longitude) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        success: false, 
        message: 'Latitude and longitude required' 
      });
    }

    const locations = await Location.find({
      'coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000 // km to meters
        }
      }
    }).limit(20);

    res.status(HTTP_STATUS.OK).json({ success: true, data: locations });
  } catch (error) {
    logger.error(`getNearbyLocations error: ${error.message}`);
    next(error);
  }
};

// Create a new location (for saving user's frequently visited places)
exports.createLocation = async (req, res, next) => {
  try {
    const { city, state, country, latitude, longitude, riskLevel = 'low', disasterTypes = {} } = req.body;

    if (!city || !country) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        success: false, 
        message: 'City and country required' 
      });
    }

    const location = new Location({
      city,
      state,
      country,
      coordinates: (latitude && longitude) ? {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      } : undefined,
      riskLevel,
      disasterTypes
    });

    await location.save();
    res.status(HTTP_STATUS.CREATED).json({ 
      success: true, 
      message: 'Location created successfully', 
      data: location 
    });
  } catch (error) {
    logger.error(`createLocation error: ${error.message}`);
    next(error);
  }
};

// Update location
exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Handle coordinates update
    if (updateData.latitude && updateData.longitude) {
      updateData.coordinates = {
        type: 'Point',
        coordinates: [parseFloat(updateData.longitude), parseFloat(updateData.latitude)]
      };
      delete updateData.latitude;
      delete updateData.longitude;
    }

    const location = await Location.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!location) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Location not found' });
    }

    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      message: 'Location updated successfully', 
      data: location 
    });
  } catch (error) {
    logger.error(`updateLocation error: ${error.message}`);
    next(error);
  }
};

// Delete location
exports.deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Location not found' });
    }

    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      message: 'Location deleted successfully' 
    });
  } catch (error) {
    logger.error(`deleteLocation error: ${error.message}`);
    next(error);
  }
};
