const mongoose = require('mongoose');

const readingSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    date: { type: Date, required: true, default: Date.now },
    pagesRead: { type: Number, required: true, min: 0 },
    minutesSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

readingSessionSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('ReadingSession', readingSessionSchema);
