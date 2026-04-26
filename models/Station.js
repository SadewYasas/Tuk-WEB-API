const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Province',
    required: true,
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true,
  },
  provinceName: {
    type: String,
    required: true,
  },
  districtName: {
    type: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

stationSchema.index({ province: 1, district: 1 });

module.exports = mongoose.model('Station', stationSchema);
