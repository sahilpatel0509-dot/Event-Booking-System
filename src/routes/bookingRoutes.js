const express = require('express');
const router = express.Router();
const { exportBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

router.get('/export', protect, admin, exportBookings);

module.exports = router;
