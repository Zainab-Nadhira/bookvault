const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    author: { type: String, required: [true, 'Author is required'], trim: true },
    publisher: { type: String, trim: true, default: '' },
    isbn: { type: String, trim: true, default: '' },
    genre: { type: String, trim: true, default: 'Uncategorized' },
    language: { type: String, trim: true, default: 'English' },
    pages: { type: Number, default: 0, min: 0 },
    currentPage: { type: Number, default: 0, min: 0 },
    coverImage: { type: String, default: '' },

    status: {
      type: String,
      enum: ['want-to-read', 'currently-reading', 'finished', 'dropped', 'paused', 're-reading'],
      default: 'want-to-read',
      index: true,
    },

    dateStarted: { type: Date, default: null },
    dateFinished: { type: Date, default: null },

    rating: { type: Number, min: 0, max: 5, default: 0 },
    review: { type: String, default: '' },
    favoriteQuote: { type: String, default: '' },
    notes: { type: String, default: '' },

    tags: [{ type: String, trim: true }],

    purchaseLink: { type: String, default: '' },
    price: { type: Number, default: 0 },
    format: {
      type: String,
      enum: ['Paperback', 'Hardcover', 'Kindle', 'Audiobook'],
      default: 'Paperback',
    },

    isWishlist: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },

    seriesName: { type: String, default: '' },
    seriesNumber: { type: Number, default: null },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', genre: 'text', tags: 'text', publisher: 'text' });

// Auto-move to Finished when currentPage reaches pages
bookSchema.pre('save', function (next) {
  if (this.status === 'currently-reading' && this.pages > 0 && this.currentPage >= this.pages) {
    this.status = 'finished';
    if (!this.dateFinished) this.dateFinished = new Date();
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
