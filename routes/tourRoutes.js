const express = require('express');
const tourController = require('../Controllers/tourController');

// Routes
const Router = express.Router();

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
  .delete(tourController.deleteTour);

module.exports = Router;
