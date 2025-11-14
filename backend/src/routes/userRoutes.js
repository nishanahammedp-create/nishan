const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/preferences', authMiddleware, userController.updatePreferences);

// Emergency contacts
router.post('/emergency-contacts', authMiddleware, userController.addEmergencyContact);
router.delete('/emergency-contacts/:contactId', authMiddleware, userController.deleteEmergencyContact);

module.exports = router;
