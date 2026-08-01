const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    year: { type: Number, required: true },
    targetBooks: { type: Number, required: true, default: 50 },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Goal', goalSchema);
