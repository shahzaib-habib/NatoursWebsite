/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
var stripe = Stripe('pk_test_51HDAqOAraaI6nwmlt2X51gUKcNZKRHuUxSXhiPUnW9iEgZ27snXM287nYRrFSEz6zAqKNEuO3UG46PEAsjQ2P67Z00GvztSuMw');

export const bookTour = async tourId => {
    // that tourId will be coming right from the tour.pug (from data-tour-id)
    try {
        // 1) Get the checkout session from the API using this route '/checkout-session/:tourId'
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        // console.log(session);
        // now we need to connect the green button to the function that we just created inside stripe.js

        // 2) Create checkout form + charge the credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};