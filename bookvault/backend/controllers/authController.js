const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please provide username, email and password');
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    res.status(400);
    throw new Error('User with this email or username already exists');
  }

  const user = await User.create({ username, email, password });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      yearlyGoal: user.yearlyGoal,
      token: generateToken(user._id),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      yearlyGoal: user.yearlyGoal,
      token: generateToken(user._id),
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { username, email, avatar, theme, yearlyGoal, password } = req.body;

  if (username) user.username = username;
  if (email) user.email = email;
  if (avatar !== undefined) user.avatar = avatar;
  if (theme) user.theme = theme;
  if (yearlyGoal) user.yearlyGoal = yearlyGoal;
  if (password) user.password = password;

  const updated = await user.save();

  res.json({
    success: true,
    data: {
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      avatar: updated.avatar,
      theme: updated.theme,
      yearlyGoal: updated.yearlyGoal,
    },
  });
});

// @desc    Delete account
// @route   DELETE /api/auth/me
// @access  Private
const deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
});

// @desc    Forgot password - generates reset token (UI-only demo, logs token)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond success to avoid email enumeration
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 min
  await user.save();

  // In production, email this token. For now, return it (dev convenience).
  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent',
    devResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
  });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  deleteMe,
  forgotPassword,
  resetPassword,
};
