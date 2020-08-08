const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
// const { bookTour } = require('../public/js/stripe');


exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) get all the tour data from collection
    const tours = await Tour.find();

    // 2) Build templete

    // 3) render that template using the tour data from 1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) get the data, for the requested tour and for that keep in mind that we
    //  actually need the reviews here and also the tour guide.
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    // 2) Build template
    // 3) render template using data from 1)

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
};


exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    // console.log('UPDATING USER', req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    // before we updated some data we use to pass in the entire request into the 
    // "update" method but in this case we really want to update the name and the
    // email. so we are assured that anything else basically is being stripped 
    // away from the body. because some hacker could of course now go ahead and add
    // some additional fields to the HTML and then for example submit data like 
    // password and stuff like that. an of course we do not want to store that 
    // malicious data into our database.

    // right now we also need to pass in the user, so the updated user, because 
    // otherwise that user that the template is going to use is the one that is 
    // comming from the protect middleware.
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
});