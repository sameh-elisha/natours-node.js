const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path.slice(1)} is ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  let sreValues = '';
  Object.entries(err.keyValue).forEach(([, value]) => {
    sreValues += `${value}, `;
  });

  const message = `${sreValues} exist before, select another one.`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const { message } = err;
  return new AppError(message, 400);
};
const handleJWTError = () => {
  const message = `Invalid token, please log again`;
  return new AppError(message, 401);
};

const handleJWTExpiredError = () => {
  const message = `Token expired, please log again`;
  return new AppError(message, 401);
};
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    err: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Error for production.
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(404).json({
      status: err.status,
      message: err.message
    });
  }
  // 1) log Error
  // eslint-disable-next-line no-console
  console.error(err);

  // Send generic message
  return res.status(500).json({
    err: err.status,
    message: 'Something went wrong'
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
