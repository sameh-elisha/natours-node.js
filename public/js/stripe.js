/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51LUVUbLc2A23LKTNq1nGGjwls1RyW4AXRILSrH5pk96Kg2wjosEVRYHyzLLpbeRtJ0WcSKP6DcDmt94H3sz5nD6p00SLk8ES6l'
);

export const bookTour = async tourId => {
  // console.log(keys.stripeKey);
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    // console.log(err);
    showAlert('error', err);
  }
};
