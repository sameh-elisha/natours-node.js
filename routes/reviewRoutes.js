const express = require('express');
const reviewController = require('../Controllers/reviewController');
const authController = require('../Controllers/authController');

// Routes
const Router = express.Router({ mergeParams: true });

// Review routes
Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );
Router.route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.deleteReview
  );

module.exports = Router;
