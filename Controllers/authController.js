/* eslint-disable import/order */
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModuls');
const AppError = require('../utils/appError');
const { promisify } = require('util');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  });
  const token = signToken(newUser._id);
  res.status(201).json({ status: 'Success', user: newUser, token });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;
  // 1) check is email && password exist
  if (!email || !password) {
    return next(new AppError('Please provide an email and password.', 401));
  }

  // 2) check user exist and password correct
  const user = await User.findOne({ email }).select('+password');

  if (
    !user ||
    !email ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(new AppError('Email or password incorrect.', 401));
  }
  // 3) send token to clint
  const token = signToken(user._id);
  res.status(201).json({ status: 'Success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization ||
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Authentication is must', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('User not exists', 401));
  }

  if (await freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Logging again, Token is changed', 401));
  }

  next();
});
