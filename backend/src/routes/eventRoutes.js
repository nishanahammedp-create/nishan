const express = require('express');
const eventController = require('../controllers/eventController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', eventController.getEvents);
router.get('/location', eventController.getEventsByLocation);
router.get('/:id', eventController.getEventById);

// Protected routes (require authentication)
router.post('/', authMiddleware, eventController.createEvent);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, adminMiddleware, eventController.deleteEvent);

module.exports = router;
