const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Public routes
router.get('/', locationController.getLocations);
router.get('/search', locationController.searchLocations);
router.get('/nearby', locationController.getNearbyLocations);
router.get('/:id', locationController.getLocationById);

// Protected routes (can add auth middleware later if needed)
router.post('/', locationController.createLocation);
router.put('/:id', locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);

module.exports = router;
