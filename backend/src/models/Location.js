const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, 'City name is required'],
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  population: Number,
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  disasterTypes: {
    weather: Boolean,
    earthquake: Boolean,
    flood: Boolean,
    fire: Boolean,
    tsunami: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

locationSchema.index({ 'coordinates': '2dsphere' });
locationSchema.index({ city: 'text', state: 'text', country: 'text' });

module.exports = mongoose.model('Location', locationSchema);
