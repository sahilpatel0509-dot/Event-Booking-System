const Booking = require('../models/Booking');
const { format } = require('fast-csv');

// @desc    Export bookings as CSV
// @route   GET /bookings/export
// @access  Private/Admin
const exportBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'name date')
      .lean(); // Faster for read-only operations

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    bookings.forEach((booking) => {
      csvStream.write({
        BookingId: booking._id.toString(),
        UserName: booking.user ? booking.user.name : 'Unknown',
        UserEmail: booking.user ? booking.user.email : 'Unknown',
        EventName: booking.event ? booking.event.name : 'Unknown',
        EventDate: booking.event ? new Date(booking.event.date).toISOString().split('T')[0] : 'Unknown',
        CreatedAt: new Date(booking.createdAt).toISOString(),
      });
    });

    csvStream.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during CSV export' });
  }
};

module.exports = {
  exportBookings,
};
