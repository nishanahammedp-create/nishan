const axios = require('axios');
const logger = require('../utils/logger');
const { sendResponse } = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

// Get weather data from OpenWeatherMap
exports.getWeather = async (req, res, next) => {
  try {
    const { latitude, longitude, units = 'metric' } = req.query;

    if (!latitude || !longitude) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Latitude and longitude required');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'OpenWeather API key not configured');
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: latitude,
        lon: longitude,
        units: units,
        appid: apiKey
      }
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        temperature: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        location: {
          name: `${response.data.name}, ${response.data.sys.country}`,
          coordinates: [response.data.coord.lon, response.data.coord.lat]
        }
      }
    });
  } catch (error) {
    logger.error(`Get weather error: ${error.message}`);
    if (error.response?.status === 401) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Invalid OpenWeather API key');
    }
    next(error);
  }
};

// Get weather forecast
exports.getWeatherForecast = async (req, res, next) => {
  try {
    const { latitude, longitude, units = 'metric' } = req.query;

    if (!latitude || !longitude) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Latitude and longitude required');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'OpenWeather API key not configured');
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat: latitude,
        lon: longitude,
        units: units,
        appid: apiKey
      }
    });

    const forecast = response.data.list.slice(0, 8).map(item => ({
      date: new Date(item.dt * 1000),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      probability: item.pop
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        location: `${response.data.city.name}, ${response.data.city.country}`,
        forecast: forecast
      }
    });
  } catch (error) {
    logger.error(`Get weather forecast error: ${error.message}`);
    next(error);
  }
};

// Geocode location (convert address to coordinates)
exports.geocodeLocation = async (req, res, next) => {
  try {
    const { address } = req.query;

    if (!address) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Address required');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'OpenWeather API key not configured');
    }

    const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: address,
        limit: 5,
        appid: apiKey
      }
    });

    if (!response.data || response.data.length === 0) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Location not found');
    }

    const locations = response.data.map(loc => ({
      name: `${loc.name}${loc.state ? ', ' + loc.state : ''}, ${loc.country}`,
      coordinates: [loc.lon, loc.lat],
      latitude: loc.lat,
      longitude: loc.lon
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: locations
    });
  } catch (error) {
    logger.error(`Geocode location error: ${error.message}`);
    next(error);
  }
};

// Reverse geocode (convert coordinates to address)
exports.reverseGeocode = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Latitude and longitude required');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'OpenWeather API key not configured');
    }

    const response = await axios.get('https://api.openweathermap.org/geo/1.0/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        limit: 1,
        appid: apiKey
      }
    });

    if (!response.data || response.data.length === 0) {
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, 'Location not found');
    }

    const loc = response.data[0];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        name: `${loc.name}${loc.state ? ', ' + loc.state : ''}, ${loc.country}`,
        coordinates: [loc.lon, loc.lat],
        latitude: loc.lat,
        longitude: loc.lon
      }
    });
  } catch (error) {
    logger.error(`Reverse geocode error: ${error.message}`);
    next(error);
  }
};

// Get air quality data
exports.getAirQuality = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Latitude and longitude required');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'OpenWeather API key not configured');
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/air_pollution', {
      params: {
        lat: latitude,
        lon: longitude,
        appid: apiKey
      }
    });

    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        aqi: response.data.list[0].main.aqi,
        aqiLevel: aqiLevels[response.data.list[0].main.aqi - 1],
        components: {
          pm25: response.data.list[0].components.pm2_5,
          pm10: response.data.list[0].components.pm10,
          o3: response.data.list[0].components.o3,
          no2: response.data.list[0].components.no2,
          so2: response.data.list[0].components.so2,
          co: response.data.list[0].components.co
        }
      }
    });
  } catch (error) {
    logger.error(`Get air quality error: ${error.message}`);
    next(error);
  }
};
