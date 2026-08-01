const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlyStats, getGenreStats, getHeatmap } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/monthly', getMonthlyStats);
router.get('/genres', getGenreStats);
router.get('/heatmap', getHeatmap);

module.exports = router;
