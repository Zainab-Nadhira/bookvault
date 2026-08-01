const asyncHandler = require('express-async-handler');
const Goal = require('../models/Goal');

// @desc    Get goal for a year (defaults to current year)
// @route   GET /api/goals?year=2026
// @access  Private
const getGoal = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  let goal = await Goal.findOne({ user: req.user._id, year });
  if (!goal) {
    goal = await Goal.create({ user: req.user._id, year, targetBooks: req.user.yearlyGoal || 50 });
  }
  res.json({ success: true, data: goal });
});

// @desc    Set/update goal for a year
// @route   PUT /api/goals
// @access  Private
const setGoal = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear(), targetBooks } = req.body;
  if (!targetBooks || targetBooks < 1) {
    res.status(400);
    throw new Error('targetBooks must be a positive number');
  }
  const goal = await Goal.findOneAndUpdate(
    { user: req.user._id, year },
    { targetBooks },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: goal });
});

module.exports = { getGoal, setGoal };
