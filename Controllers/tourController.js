// const mongoose = require('mongoose');
const APIFeatures = require('../utils/apiFeatures');
const Tour = require('./../models/tourModuls');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.filterTopFives = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const newClass = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  // Execute
  const tours = await newClass.query;
  res.status(200).json({
    message: 'success',
    length: tours.length,
    data: tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) return next(new AppError('Tour not found', 404));

  res.status(200).json({
    message: 'success',
    tour
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({});s
  // newTour.save();
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    tour: newTour
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidate: true
  });
  if (!tour) return next(new AppError('Tour not found', 404));

  res.status(200).json({ status: 'success', tour });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) return next(new AppError('Tour not found', 404));

  res.status(204).json({ status: 'success', message: 'Tour deleted' });
});

exports.getTourStatus = catchAsync(async (req, res, next) => {
  const statusTour = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalOrderValue: {
          $sum: { $multiply: ['$ratingsAverage', '$price'] }
        }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
  res.status(200).json({ status: 'success', tour: statusTour });
});
