const AppError = require('../utils/appError');

const handelCastError = err => {
  const message = `Invalid ${err.path.slice(1)} is ${err.value}`;
  return new AppError(message, 400);
};
const handelDuplicateError = err => {
  let sreValues = '';
  Object.entries(err.keyValue).forEach(([, value]) => {
    sreValues += `${value}, `;
  });

  const message = `${sreValues} exist before, select another one.`;
  return new AppError(message, 400);
};
const handelValidationError = err => {
  const { message } = err;
  return new AppError(message, 400);
};

// Send Error To developer.
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    err: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Error for production.
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      err: err.status,
      message: err.message
    });
  } else {
    // 1) log Error
    // eslint-disable-next-line no-console
    console.error(err);

    // Send generic message
    res.status(500).json({
      err: err.status,
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    // Friendly message to user and mark  error isOperational
    if (error.name === 'CastError') error = handelCastError(error);
    if (error.name === 'ValidationError') error = handelValidationError(error);

    if (err.code === 11000) {
      error = handelDuplicateError(error);
    }
    error.status = err.status;
    error.message = err.message;
    sendErrorProd(error, res);
  }
};
