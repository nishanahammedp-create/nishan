const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['weather', 'earthquake', 'flood', 'fire', 'tsunami', 'other'],
    required: true
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
      coordinates: [Number]
    }
  },
  emoji: {
    type: String,
    default: '📢'
  },
  source: {
    type: String,
    enum: ['official', 'sensor', 'satellite', 'ai', 'community'],
    default: 'community'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  attendees: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);
