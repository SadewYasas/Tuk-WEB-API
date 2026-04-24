const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  tukTukId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TukTuk',
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  speed: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number,
    default: null,
  },
});

// Create compound index for efficient time-based queries
locationHistorySchema.index({ tukTukId: 1, timestamp: -1 });

module.exports = mongoose.model('LocationHistory', locationHistorySchema);
