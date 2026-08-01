const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const ReadingSession = require('../models/ReadingSession');

// @desc    Get all books for logged-in user (search, filter, sort, paginate)
// @route   GET /api/books
// @access  Private
const getBooks = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    genre,
    rating,
    favorite,
    wishlist,
    sort = '-createdAt',
    page = 1,
    limit = 20,
  } = req.query;

  const query = { user: req.user._id };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { genre: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } },
      { publisher: { $regex: search, $options: 'i' } },
      { language: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) query.status = status;
  if (genre) query.genre = genre;
  if (rating) query.rating = { $gte: Number(rating) };
  if (favorite === 'true') query.isFavorite = true;
  if (wishlist === 'true') query.isWishlist = true;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [books, total] = await Promise.all([
    Book.find(query).sort(sort).skip(skip).limit(limitNum),
    Book.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: books.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: books,
  });
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Private
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  res.json({ success: true, data: book });
});

// @desc    Create book
// @route   POST /api/books
// @access  Private
const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: book });
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findOne({ _id: req.params.id, user: req.user._id });
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const prevStatus = book.status;
  Object.assign(book, req.body);

  // Auto date handling
  if (book.status === 'currently-reading' && !book.dateStarted) {
    book.dateStarted = new Date();
  }
  if (book.status === 'finished' && !book.dateFinished) {
    book.dateFinished = new Date();
  }

  await book.save();

  // Log a reading session if pages progressed (simple heuristic)
  if (req.body.currentPage !== undefined) {
    await ReadingSession.create({
      user: req.user._id,
      book: book._id,
      date: new Date(),
      pagesRead: Math.max(0, req.body.currentPage - (prevStatus === book.status ? 0 : 0)),
    }).catch(() => {});
  }

  res.json({ success: true, data: book });
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  res.json({ success: true, message: 'Book deleted' });
});

// @desc    Upload cover image
// @route   POST /api/books/:id/cover
// @access  Private
const uploadCover = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  book.coverImage = `/uploads/covers/${req.file.filename}`;
  await book.save();
  res.json({ success: true, data: book });
});

// @desc    Get distinct genres for the user (for filters)
// @route   GET /api/books/meta/genres
// @access  Private
const getGenres = asyncHandler(async (req, res) => {
  const genres = await Book.distinct('genre', { user: req.user._id });
  res.json({ success: true, data: genres.filter(Boolean) });
});

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  uploadCover,
  getGenres,
};
