const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');

// Routes
const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);

// User routes
Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
