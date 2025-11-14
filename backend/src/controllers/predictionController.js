const Prediction = require('../models/Prediction');
const logger = require('../utils/logger');

// Simple simulation helper (kept small and deterministic-ish)
function simulatePredictions(locationName, sources) {
  const baseEvents = ['Flood', 'Earthquake', 'Wildfire', 'Storm', 'Landslide', 'Tsunami'];
  const chosen = [];
  const count = Math.random() < 0.5 ? 2 : 3;
  while (chosen.length < count) {
    const pick = baseEvents[Math.floor(Math.random() * baseEvents.length)];
    if (!chosen.includes(pick)) chosen.push(pick);
  }

  return chosen.map((ev, idx) => {
    let prob = 15 + Math.floor(Math.random() * 50);
    if (sources && sources.includes('sensor')) prob += 12;
    if (sources && sources.includes('satellite') && ['Flood','Wildfire','Storm'].includes(ev)) prob += 18;
    if (sources && sources.includes('ai')) prob = Math.min(98, prob + 20 + Math.floor(Math.random() * 8));
    const etaHours = Math.max(1, Math.floor(Math.random() * 72));
    return {
      type: ev,
      probability: Math.round(prob),
      etaHours,
      sources: sources || [],
      location: { name: locationName }
    };
  });
}

exports.runPrediction = async (req, res, next) => {
  try {
    const { location = 'Unknown', sources = [] } = req.body || {};
    // simulate predictions (this is the lightweight implementation requested)
    const sims = simulatePredictions(location, sources);

    // Persist to DB
    const created = await Prediction.insertMany(sims.map(s => ({
      type: s.type,
      probability: s.probability,
      etaHours: s.etaHours,
      sources: s.sources,
      location: { name: s.location.name }
    })));

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    logger.error('runPrediction error', err);
    next(err);
  }
};

exports.getPredictions = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const docs = await Prediction.find({}).sort({ createdAt: -1 }).limit(parseInt(limit, 10));
    return res.status(200).json({ success: true, data: docs });
  } catch (err) {
    logger.error('getPredictions error', err);
    next(err);
  }
};

exports.getPredictionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Prediction.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Prediction not found' });
    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    logger.error('getPredictionById error', err);
    next(err);
  }
};

exports.clearPredictions = async (req, res, next) => {
  try {
    await Prediction.deleteMany({});
    return res.status(200).json({ success: true, message: 'All predictions cleared' });
  } catch (err) {
    logger.error('clearPredictions error', err);
    next(err);
  }
};
