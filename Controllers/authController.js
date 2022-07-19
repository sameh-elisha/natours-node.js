/* eslint-disable import/order */
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModuls');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  const cookieOptions = {
    expires: new Date(
      process.env.JWT_EXPIRES_IN_COOKIE * Date.now() * 60 * 60 * 1000 * 24
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({ status: 'Success', token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  });
  createSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);
  // res.status(201).json({ status: 'Success', user: newUser, token });
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
  createSendToken(user, 201, res);

  // const token = signToken(user._id);
  // res.status(201).json({ status: 'Success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (!req.headers.authorization)
    return next(new AppError('Authentication is must', 401));

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
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You restrict this route', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPasswordCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(new AppError('User not found'), 400);

  const { oldPassword } = req.body;

  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new AppError('Enter Wrong password!'), 400);
  }
  user.password = req.body.newPassword;
  await user.save();
  createSendToken(user, 201, res);

  // const token = signToken(user._id);
  // res.status(201).json({ status: 'Success', user, token });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const cryptoToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordRestToken: cryptoToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) {
    return next(new AppError('Token Expires Invalid'), 400);
  }
  const token = signToken(user._id);
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordRestToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(200).json({ status: 'success', token });
});
