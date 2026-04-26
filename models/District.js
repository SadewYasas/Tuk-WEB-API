const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Province',
    required: true,
  },
  provinceName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

districtSchema.index({ province: 1 });

module.exports = mongoose.model('District', districtSchema);
