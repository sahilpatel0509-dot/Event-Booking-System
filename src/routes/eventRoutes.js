const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  bookEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, admin, createEvent)
  .get(getEvents);

router.route('/:id')
  .put(protect, admin, updateEvent)
  .delete(protect, admin, deleteEvent);

router.post('/:id/book', protect, bookEvent);

module.exports = router;
