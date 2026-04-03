const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Create an event
// @route   POST /events
// @access  Private/Admin
const createEvent = async (req, res) => {
  const { name, date, capacity } = req.body;

  if (!name || !date || !capacity) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const event = await Event.create({
      name,
      date,
      capacity,
      availableSeats: capacity,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all events with filtering and pagination
// @route   GET /events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { start, end, page = 1, limit = 10 } = req.query;

    let query = {};
    
    // Filter by date range
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = new Date(start);
      if (end) query.date.$lte = new Date(end);
    }

    const pageConfig = parseInt(page, 10);
    const limitConfig = parseInt(limit, 10);
    const skip = (pageConfig - 1) * limitConfig;

    const events = await Event.find(query)
      .skip(skip)
      .limit(limitConfig);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      events,
      page: pageConfig,
      totalPages: Math.ceil(total / limitConfig),
      totalEvents: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an event
// @route   PUT /events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { capacity } = req.body;

    // Check if new capacity is smaller than current bookings
    if (capacity !== undefined) {
      const bookedSeats = event.capacity - event.availableSeats;
      if (capacity < bookedSeats) {
        return res.status(400).json({
            message: `Cannot reduce capacity below currently booked seats (${bookedSeats})`,
        });
      }
      // Update available seats based on new capacity
      req.body.availableSeats = capacity - bookedSeats;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an event
// @route   DELETE /events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    res.status(200).json({ message: 'Event removed', id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Book an event
// @route   POST /events/:id/book
// @access  Private
const bookEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }

    // Check if user already booked this event
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      event: req.params.id,
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this event' });
    }

    // Decrease available seats
    event.availableSeats -= 1;
    await event.save();

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      event: req.params.id,
    });

    res.status(201).json({ message: 'Event booked successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  bookEvent,
};
