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
  console.error(`Error: ${err.message}`.red);
  console.error(err.stack);

  // Supabase error handling
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
        break;
      case '23503': // Foreign key violation
        error.message = 'Referenced record does not exist';
        error.statusCode = 400;
        break;
      case '42P01': // Undefined table
        error.message = 'Database error: Table not found';
        error.statusCode = 500;
        break;
      default:
        if (err.code.startsWith('22')) { // Data exception
          error.message = 'Invalid data format';
          error.statusCode = 400;
        } else if (err.code.startsWith('23')) { // Integrity constraint violation
          error.message = 'Data integrity error';
          error.statusCode = 400;
        } else if (err.code.startsWith('28')) { // Invalid authorization specification
          error.message = 'Authorization error';
          error.statusCode = 403;
        }
    }
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