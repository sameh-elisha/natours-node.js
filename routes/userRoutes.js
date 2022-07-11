const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');

// Routes
const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);

Router.patch('/updateME', authController.protect, userController.updateMe);
Router.delete('/deleteMe', authController.protect, userController.deleteMe);

Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);
Router.patch(
  '/changePasswordCurrent',
  authController.protect,
  authController.resetPasswordCurrentUser
);

// User routes
Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);
// .delete(userController.deleteUser);

module.exports = Router;
