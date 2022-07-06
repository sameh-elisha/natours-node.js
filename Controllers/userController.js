const User = require('./../models/userModuls');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    message: 'success',
    length: users.length,
    data: users
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('Tour not found', 404));

  res.status(200).json({
    message: 'success',
    user
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({ status: 'Error', message: 'Not Ready' });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({ status: 'Error', message: 'Not Ready' });
};
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidate: true
  });
  if (!user) return next(new AppError('user not found', 404));

  res.status(200).json({ status: 'success', user });
});
