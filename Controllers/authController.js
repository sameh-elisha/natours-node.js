const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModuls');
const AppError = require('../utils/appError');

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

  if (!email || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(' email or password incorrect.', 401));
  }
  // 3) send token to clint
  const token = signToken(user._id);
  res.status(201).json({ status: 'Success', token });
});
