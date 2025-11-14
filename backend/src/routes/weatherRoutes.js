const express = require('express');
const weatherController = require('../controllers/weatherController');

const router = express.Router();

// Public routes - no authentication required
router.get('/current', weatherController.getWeather);
router.get('/forecast', weatherController.getWeatherForecast);
router.get('/air-quality', weatherController.getAirQuality);
router.get('/geocode', weatherController.geocodeLocation);
router.get('/reverse-geocode', weatherController.reverseGeocode);

module.exports = router;
