const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User!']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

// populate the user and the tour automatically whenever there is a query and we do that
// using the query middleware
bookingSchema.pre(/^find/, function (next) {
    // lets do this automatically for the 'user' and the 'tour' and in this case that absolutely no
    // problem for performance because there won't be many calls for bookings. because only 'guides' 
    // and 'admins' will actually be allowed to do that.
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;