const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  domain: {
    type: String,
    required: true
  },
  productive: {
    type: Boolean,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['work', 'social', 'entertainment', 'education', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

activitySchema.index({ userId: 1, timestamp: 1 });
activitySchema.index({ userId: 1, productive: 1 });

module.exports = mongoose.model('Activity', activitySchema);
