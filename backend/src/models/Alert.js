const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Alert description is required']
  },
  type: {
    type: String,
    enum: ['weather', 'earthquake', 'flood', 'accident', 'fire', 'tsunami'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'danger'],
    default: 'warning'
  },
  source: {
    type: String,
    enum: ['official', 'sensor', 'satellite', 'ai'],
    default: 'official'
  },
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    },
    radius: {
      type: Number,
      default: 50 // in km
    }
  },
  emoji: {
    type: String,
    default: '⚠️'
  },
  message: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active'
  },
  affectedAreas: [String],
  metadata: {
    temperature: Number,
    windSpeed: Number,
    humidity: Number,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Geospatial Index for location-based queries
alertSchema.index({ 'location.coordinates': '2dsphere' });

// Text search index
alertSchema.index({ title: 'text', description: 'text', 'location.name': 'text' });

module.exports = mongoose.model('Alert', alertSchema);
