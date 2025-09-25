// Error handling middleware

/**
 * Custom error response class
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for server side debugging
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  // MongoDB error handling
  if (err.name === 'MongoServerError') {
    switch (err.code) {
      case 11000: // Duplicate key error
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
        break;
      default:
        error.message = 'Database error';
        error.statusCode = 500;
    }
  }
  
  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token expired', 401);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ErrorResponse('File size exceeds limit (5MB)', 400);
  }

  // Send standardized error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  ErrorResponse,
  errorHandler
};