const express = require('express');
const router = express.Router();
const { getGoal, setGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getGoal).put(setGoal);

module.exports = router;
