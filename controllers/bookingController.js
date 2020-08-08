const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    // console.log(tour);

    // 2) Create checkout session 
    // now as with any other keys we will put them in config.env
    // .create() will return a promise because setting all these options below will basically do an API call
    // to stripe and that's some asynchronous work
    const session = await stripe.checkout.sessions.create({
        // THIS IS THE INFORMATION ABOUT THE SESSION ITSELF
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        // that is a bit wierd, actually this is going to be very important for us. so this field is gonna allow
        // us to pass in some data about the session we are currently creating and that is important because later
        // once the purchase is sucessfull we will then get access to this session object again. And by then we 
        // want to create a new booking in our database. so basically the last step in the Stripe Workflow.
        // and also remember how this is going to work only on deployed websites.
        // to create a new booking in our database we will need 
        // 1) user's id
        // 2) tour id
        // 3) price
        client_reference_id: req.params.tourId,
        line_items: [
            // THIS IS THE INFORMATION ABOUT THE PRODUCT THAT THE USER IS ABOUT TO PURCHASE
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                // these images need to be live images that are hosted on the internet because stripe will actually 
                // upload these imageto their own server.
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is only TEMPORARY, because it is UNSECURE: everyone can make bookings 
    // without actually paying

    // let's start by quering our data from query string
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();
    // nwo what exactly is next middleware? remember that we want to create new booking 
    // on this home url because this is the url that is called whenever a pusrchase is
    // successfull with stripe. so what we need to do is to add this middleware function
    // that we are creating right now onto the middleware stack of this route handler.
    // and the route is 'viewController.getOverview'. so this is the route that will be
    // hit when a credit card is successfully charged. so this is also the point in time
    // when we want to create new booking.
    await Booking.create({ tour, user, price });

    // instead using next(); we use res.redirect(); to basically remove query string before
    // moving to the HOME URL
    // what redirect() does is basically create new request to the new url and we will be hitting
    // this url second time but without 'tour', 'user' and 'price'
    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);