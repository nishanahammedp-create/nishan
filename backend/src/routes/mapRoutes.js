const express = require('express');
const mapController = require('../controllers/mapController');

const router = express.Router();

// Public endpoints
router.get('/geojson', mapController.getGeoJSON);
router.get('/view', mapController.getMapViewer);

module.exports = router;
