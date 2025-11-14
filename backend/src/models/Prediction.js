const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  probability: { type: Number, required: true },
  etaHours: { type: Number, required: true },
  sources: [{ type: String }],
  location: {
    name: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    }
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

predictionSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Prediction', predictionSchema);
