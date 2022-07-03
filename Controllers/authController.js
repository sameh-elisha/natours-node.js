const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModuls');

exports.signup = catchAsync(async (req, res, next) => {
  console.log(`${process.env.JWT_KEY}`);
  const newUser = await User.create({
    _id: req.body._id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  });
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(201).json({ status: 'Success', user: newUser, token });
});
