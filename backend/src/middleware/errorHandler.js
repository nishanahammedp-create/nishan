const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);

  // Default error
  let error = {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error'
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = 'Invalid ID format';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.message = 'Token expired';
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
};

module.exports = errorHandler;
