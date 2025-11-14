const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// POST /api/v1/predictions/run  -> run a prediction (body: { location, sources: ['sensor','satellite','ai'] })
router.post('/run', predictionController.runPrediction);

// GET /api/v1/predictions -> list predictions
router.get('/', predictionController.getPredictions);

// GET /api/v1/predictions/:id -> single prediction
router.get('/:id', predictionController.getPredictionById);

// DELETE /api/v1/predictions -> clear all predictions
router.delete('/', predictionController.clearPredictions);

module.exports = router;
