const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const Goal = require('../models/Goal');
const ReadingSession = require('../models/ReadingSession');

// @desc    Dashboard summary stats
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    booksRead,
    currentlyReading,
    wantToRead,
    favorites,
    booksThisMonth,
    finishedThisYear,
    ratingAgg,
    pagesAgg,
  ] = await Promise.all([
    Book.countDocuments({ user: userId, status: 'finished' }),
    Book.countDocuments({ user: userId, status: 'currently-reading' }),
    Book.countDocuments({ user: userId, status: 'want-to-read' }),
    Book.countDocuments({ user: userId, isFavorite: true }),
    Book.countDocuments({ user: userId, status: 'finished', dateFinished: { $gte: startOfMonth } }),
    Book.countDocuments({ user: userId, status: 'finished', dateFinished: { $gte: startOfYear } }),
    Book.aggregate([
      { $match: { user: userId, rating: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]),
    Book.aggregate([
      { $match: { user: userId, status: 'finished' } },
      { $group: { _id: null, total: { $sum: '$pages' } } },
    ]),
  ]);

  const goal = await Goal.findOne({ user: userId, year: now.getFullYear() });
  const targetBooks = goal ? goal.targetBooks : req.user.yearlyGoal || 50;

  const daysElapsed = Math.max(1, Math.ceil((now - startOfYear) / 86400000));
  const daysInYear = ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0) ? 366 : 365;
  const rate = finishedThisYear / daysElapsed;
  const remaining = Math.max(0, targetBooks - finishedThisYear);
  const predictedDaysNeeded = rate > 0 ? Math.ceil(remaining / rate) : null;
  const predictedCompletionDate =
    predictedDaysNeeded !== null
      ? new Date(now.getTime() + predictedDaysNeeded * 86400000)
      : null;

  const recentActivity = await Book.find({ user: userId })
    .sort('-updatedAt')
    .limit(8)
    .select('title author coverImage status rating updatedAt');

  res.json({
    success: true,
    data: {
      welcomeUsername: req.user.username,
      today: now,
      booksRead,
      currentlyReading,
      wantToRead,
      favorites,
      booksThisMonth,
      pagesRead: pagesAgg[0]?.total || 0,
      averageRating: ratingAgg[0]?.avg ? Number(ratingAgg[0].avg.toFixed(2)) : 0,
      streak: req.user.streak,
      goal: {
        target: targetBooks,
        completed: finishedThisYear,
        remaining,
        percent: targetBooks > 0 ? Math.min(100, Math.round((finishedThisYear / targetBooks) * 100)) : 0,
        predictedCompletionDate,
        daysInYear,
        daysElapsed,
      },
      recentActivity,
    },
  });
});

// @desc    Books finished per month (current year) - for bar/line chart
// @route   GET /api/stats/monthly
// @access  Private
const getMonthlyStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const agg = await Book.aggregate([
    { $match: { user: userId, status: 'finished', dateFinished: { $gte: start, $lt: end } } },
    { $group: { _id: { $month: '$dateFinished' }, count: { $sum: 1 }, pages: { $sum: '$pages' } } },
    { $sort: { _id: 1 } },
  ]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const found = agg.find((a) => a._id === i + 1);
    return { month: i + 1, books: found?.count || 0, pages: found?.pages || 0 };
  });

  res.json({ success: true, data: months });
});

// @desc    Genre breakdown - for pie chart
// @route   GET /api/stats/genres
// @access  Private
const getGenreStats = asyncHandler(async (req, res) => {
  const agg = await Book.aggregate([
    { $match: { user: req.user._id, status: 'finished' } },
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, data: agg.map((a) => ({ genre: a._id || 'Uncategorized', count: a.count })) });
});

// @desc    Reading heatmap calendar (daily pages read, current year)
// @route   GET /api/stats/heatmap
// @access  Private
const getHeatmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const agg = await ReadingSession.aggregate([
    { $match: { user: userId, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        pages: { $sum: '$pagesRead' },
      },
    },
  ]);

  res.json({ success: true, data: agg.map((a) => ({ date: a._id, pages: a.pages })) });
});

module.exports = { getDashboardStats, getMonthlyStats, getGenreStats, getHeatmap };
