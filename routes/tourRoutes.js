const express = require('express');
const tourController = require('../Controllers/tourController');
const authController = require('../Controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

// Routes
const Router = express.Router();

Router.use('/:tourId/reviews', reviewRouter);
/*
To remove duplicate Code
Router.route('/:tourId/reviews').post(
  authController.protect,
  authController.restrictTo('user'),
  reviewController.createReview
);
*/

Router.route('/tour-status').get(tourController.getTourStatus);

Router.route('/top-five-cheap').get(
  tourController.filterTopFives,
  tourController.getAllTours
);

// Tour routes
Router.route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
Router.route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

module.exports = Router;
