const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');


const router = express.Router();

router.use(authController.protect);

// route that is created here will once again not follow the REST principle because this one is not going
// to be about creating or getting or updating any booking instead this route will only be for the client
// to get a check out session.

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').get(bookingController.getAllBookings).post(bookingController.createBooking);
router.route('/:id').get(bookingController.getBooking).patch(bookingController.updateBooking).delete(bookingController.deleteBooking);

module.exports = router;