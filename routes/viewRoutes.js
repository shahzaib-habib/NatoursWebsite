const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

// router.get('/', (req, res) => {

//     // an object, that data then will be available in the Pug template.
//     // these variables that we passed in here are called "Locals" in 
//     // Pug file
//     res.status(200).render('base', {
//         tour: 'The Forest Hiker',
//         user: 'Shahzaib'
//     });
// });

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
// URL parameter
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post('/submit-user-data', authController.protect, viewsController.updateUserData);


module.exports = router;