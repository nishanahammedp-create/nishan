const express = require('express');
const alertController = require('../controllers/alertController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', alertController.getAlerts);
router.get('/location', alertController.getAlertsByLocation);
router.get('/:id', alertController.getAlertById);
router.post('/emergency', alertController.sendEmergency);

// Protected routes (require authentication)
router.post('/', authMiddleware, adminMiddleware, alertController.createAlert);
router.put('/:id', authMiddleware, adminMiddleware, alertController.updateAlert);
router.delete('/:id', authMiddleware, adminMiddleware, alertController.deleteAlert);
router.patch('/:id/resolve', authMiddleware, alertController.resolveAlert);

module.exports = router;
